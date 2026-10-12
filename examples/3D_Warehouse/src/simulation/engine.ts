import type {
  Dock,
  EpochMs,
  Forklift,
  InventoryItem,
  Shipment,
  Truck,
  WarehouseData,
} from '../data/types';

export interface SimState extends WarehouseData {
  now: EpochMs;
  shipmentSeq: number;
}

export interface TickOptions {
  /** Simulated time advanced per tick. Default 5 minutes. */
  stepMs?: number;
  /** Random source in [0, 1). Inject a seeded PRNG for deterministic tests. */
  random?: () => number;
  /** Max completed shipments kept per site (rolling window for on-time KPI). */
  completedWindowPerSite?: number;
}

const MIN = 60_000;

/**
 * Advance the live warehouse one step. Pure: returns a new state and never mutates the input.
 *
 * Truck lifecycle:  idle → (pick scheduled job) → en_route → (gate + free dock) → docked → (dwell elapsed) → idle
 *                   idle ↔ maintenance (rare)
 * Dock occupancy, shipment status, arrival time and inventory are kept consistent with the truck lifecycle.
 */
export function tick(prev: SimState, opts: TickOptions = {}): SimState {
  const stepMs = opts.stepMs ?? 5 * MIN;
  const random = opts.random ?? Math.random;
  const windowPerSite = opts.completedWindowPerSite ?? 20;
  const int = (min: number, max: number) => Math.floor(min + random() * (max - min + 1));

  const now = prev.now + stepMs;
  let shipmentSeq = prev.shipmentSeq;

  // Copy-on-write maps.
  const docks = new Map(prev.docks.map((d) => [d.id, d] as const));
  const shipments = new Map(prev.shipments.map((s) => [s.id, s] as const));
  const inventory = new Map(prev.inventory.map((i) => [i.id, i] as const));
  const trucks: Truck[] = [];

  const setDock = (d: Dock, patch: Partial<Dock>) => docks.set(d.id, { ...d, ...patch, updatedAt: now });
  const setShipment = (s: Shipment, patch: Partial<Shipment>) => shipments.set(s.id, { ...s, ...patch });
  const setItem = (i: InventoryItem, patch: Partial<InventoryItem>) =>
    inventory.set(i.id, { ...i, ...patch, updatedAt: now });

  for (const t of prev.trucks) {
    let truck: Truck = t;
    const update = (patch: Partial<Truck>) => {
      truck = { ...truck, ...patch, updatedAt: now };
    };
    const current = truck.shipmentId ? shipments.get(truck.shipmentId) : undefined;

    switch (truck.status) {
      case 'maintenance': {
        if (random() < 0.12) update({ status: 'idle' });
        break;
      }

      case 'idle': {
        const next = [...shipments.values()]
          .filter((s) => s.truckId === truck.id && s.status === 'scheduled')
          .sort((a, b) => a.eta - b.eta)[0];
        if (next) {
          setShipment(next, { status: 'in_transit' });
          update({ status: 'en_route', shipmentId: next.id, routeProgress: 0 });
        } else if (random() < 0.03) {
          update({ status: 'maintenance' });
        } else if (random() < 0.35) {
          // Create a fresh job so the floor stays busy. Inbound jobs prefer low-stock SKUs (replenishment).
          const siteItems = [...inventory.values()].filter((i) => i.siteId === truck.siteId);
          const direction = random() < 0.5 ? 'inbound' : 'outbound';
          const ranked =
            direction === 'inbound'
              ? [...siteItems].sort((a, b) => a.onHand - a.reserved - a.reorderPoint - (b.onHand - b.reserved - b.reorderPoint))
              : siteItems;
          const lineCount = int(1, 2);
          const lines: Shipment['lines'] = [];
          for (let i = 0; i < lineCount && ranked.length > 0; i++) {
            const item =
              direction === 'inbound' ? ranked[i % Math.min(3, ranked.length)]! : ranked[int(0, ranked.length - 1)]!;
            if (direction === 'inbound') {
              lines.push({ inventoryItemId: item.id, cartons: int(30, 90) });
            } else {
              // Only reserve what is actually available, so available stock never goes negative.
              const live = inventory.get(item.id)!;
              const cartons = Math.min(int(4, 20), live.onHand - live.reserved);
              if (cartons <= 0) continue;
              lines.push({ inventoryItemId: item.id, cartons });
              setItem(live, { reserved: live.reserved + cartons });
            }
          }
          if (lines.length === 0) break;
          shipmentSeq += 1;
          const id = `SH-${String(shipmentSeq).padStart(4, '0')}`;
          shipments.set(id, {
            id,
            siteId: truck.siteId,
            direction,
            truckId: truck.id,
            dockId: null,
            status: 'scheduled',
            eta: now + int(20, 60) * MIN,
            actualArrival: null,
            completedAt: null,
            dwellMs: int(15, 35) * MIN,
            lines,
          });
        }
        break;
      }

      case 'en_route': {
        if (!current) {
          update({ status: 'idle', routeProgress: 0 });
          break;
        }
        // Traffic variability: occasional crawl creates realistic late arrivals.
        const speed = random() < 0.15 ? 0.03 : 0.1 + random() * 0.18;
        const progress = Math.min(1, truck.routeProgress + speed);
        if (progress < 1) {
          update({ routeProgress: progress });
          break;
        }
        const free = [...docks.values()]
          .filter((d) => d.siteId === truck.siteId && d.status === 'available')
          .sort((a, b) => a.slot - b.slot)[0];
        if (free) {
          setDock(free, { status: 'occupied', truckId: truck.id });
          setShipment(current, { status: 'at_dock', dockId: free.id, actualArrival: now });
          update({ status: 'docked', routeProgress: 1 });
        } else {
          // Queued at the gate: arrival is only recorded once a dock is assigned.
          update({ routeProgress: 1 });
        }
        break;
      }

      case 'docked': {
        if (!current || current.actualArrival === null) break;
        if (now - current.actualArrival < current.dwellMs) break;
        for (const line of current.lines) {
          const item = inventory.get(line.inventoryItemId);
          if (!item) continue;
          if (current.direction === 'inbound') {
            setItem(item, { onHand: item.onHand + line.cartons });
          } else {
            const picked = Math.min(item.onHand, line.cartons);
            setItem(item, { onHand: item.onHand - picked, reserved: Math.max(0, item.reserved - line.cartons) });
          }
        }
        setShipment(current, { status: 'completed', completedAt: now });
        const dock = current.dockId ? docks.get(current.dockId) : undefined;
        if (dock) setDock(dock, { status: 'available', truckId: null });
        update({ status: 'idle', shipmentId: null, routeProgress: 0 });
        break;
      }
    }
    trucks.push(truck);
  }

  // Background demand: new customer orders reserve stock at random sites.
  if (random() < 0.5) {
    const items = [...inventory.values()];
    const item = items[int(0, items.length - 1)];
    if (item) setItem(item, { reserved: Math.min(item.onHand, item.reserved + int(2, 10)) });
  }

  const forklifts: Forklift[] = prev.forklifts.map((f) => {
    let { status, batteryPct } = f;
    if (status === 'charging') {
      batteryPct = Math.min(100, batteryPct + 12);
      if (batteryPct >= 95) status = 'idle';
    } else {
      batteryPct = Math.max(0, batteryPct - (status === 'idle' ? 1 : 4));
      if (batteryPct < 20) status = 'charging';
      else if (random() < 0.4) status = (['idle', 'moving', 'lifting'] as const)[int(0, 2)] ?? 'idle';
    }
    if (status === f.status && batteryPct === f.batteryPct) return f;
    return { ...f, status, batteryPct, updatedAt: now };
  });

  return {
    ...prev,
    now,
    shipmentSeq,
    trucks,
    forklifts,
    docks: [...docks.values()],
    inventory: [...inventory.values()],
    shipments: pruneCompleted([...shipments.values()], windowPerSite),
  };
}

/** Keep only the newest N completed shipments per site so the on-time KPI is a rolling window. */
function pruneCompleted(list: Shipment[], perSite: number): Shipment[] {
  const keep = new Set<string>();
  const bySite = new Map<string, Shipment[]>();
  for (const s of list) {
    if (s.status !== 'completed') continue;
    const arr = bySite.get(s.siteId) ?? [];
    arr.push(s);
    bySite.set(s.siteId, arr);
  }
  for (const arr of bySite.values()) {
    arr.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
    arr.slice(0, perSite).forEach((s) => keep.add(s.id));
  }
  return list.filter((s) => s.status !== 'completed' || keep.has(s.id));
}
