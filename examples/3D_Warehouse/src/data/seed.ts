import type {
  Dock,
  Forklift,
  InventoryItem,
  Shipment,
  Site,
  Truck,
  TruckStatus,
  WarehouseData,
} from './types';

/** Fixed, fictional snapshot: 12 Oct 2026 08:00 SGT. The simulated clock starts here. */
export const SEED_SNAPSHOT: number = Date.UTC(2026, 9, 12, 0, 0, 0);

const MIN = 60_000;

const SITES: Omit<Site, 'dockIds'>[] = [
  {
    id: 'SITE-TUAS',
    code: 'TUA',
    name: 'Tuas Mega DC',
    city: 'Singapore',
    country: 'SG',
    timezone: 'Asia/Singapore',
    layout: { originX: -140, originZ: 30, heading: 0 },
  },
  {
    id: 'SITE-CHANGI',
    code: 'CHG',
    name: 'Changi Airfreight Hub',
    city: 'Singapore',
    country: 'SG',
    timezone: 'Asia/Singapore',
    layout: { originX: 140, originZ: -10, heading: -0.25 },
  },
  {
    id: 'SITE-SENAI',
    code: 'SEN',
    name: 'Senai Cross-Dock',
    city: 'Johor Bahru',
    country: 'MY',
    timezone: 'Asia/Kuala_Lumpur',
    layout: { originX: -10, originZ: -150, heading: 0.2 },
  },
];

const DOCKS_PER_SITE = 6;

/** Truck status pattern per site (4 trucks each → 12 total). */
const TRUCK_PATTERN: Record<string, TruckStatus[]> = {
  'SITE-TUAS': ['docked', 'docked', 'en_route', 'idle'],
  'SITE-CHANGI': ['docked', 'en_route', 'en_route', 'maintenance'],
  'SITE-SENAI': ['docked', 'en_route', 'idle', 'idle'],
};

const DRIVERS = [
  'A. Rahman', 'L. Tan', 'K. Muthu', 'J. Lim', 'S. Wong', 'R. Kumar',
  'M. Ismail', 'D. Ong', 'P. Nair', 'H. Goh', 'Z. Hassan', 'C. Teo',
];

const SKU_CATALOGUE: Array<[string, string]> = [
  ['ELC-1042', 'USB-C chargers, 65 W'],
  ['ELC-2210', 'Wi-Fi 7 routers'],
  ['FMC-0311', 'Instant noodles, 30-pack'],
  ['FMC-0874', 'Bottled water, 24 × 500 ml'],
  ['PHA-1190', 'Surgical masks, 50-box'],
  ['PHA-2045', 'Hand sanitiser, 1 L'],
  ['AUT-3302', 'Brake pads, front'],
  ['AUT-4410', 'Engine oil 5W-30, 4 L'],
  ['APP-5120', 'Work boots, assorted'],
  ['APP-5233', 'Hi-vis vests'],
  ['HOM-6001', 'LED bulbs, 10-pack'],
  ['HOM-6188', 'Extension reels, 15 m'],
  ['IND-7002', 'Pallet wrap film'],
  ['IND-7105', 'Cable ties, 1000-pack'],
];

/** Small deterministic PRNG so the seed is identical on every load. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeed(): WarehouseData {
  const rand = mulberry32(20261012);
  const int = (min: number, max: number) => Math.floor(min + rand() * (max - min + 1));
  const t0 = SEED_SNAPSHOT;

  const sites: Site[] = SITES.map((s) => ({
    ...s,
    dockIds: Array.from({ length: DOCKS_PER_SITE }, (_, i) => `${s.id}-D${i + 1}`),
  }));

  const docks: Dock[] = sites.flatMap((s) =>
    s.dockIds.map((id, slot) => ({
      id,
      siteId: s.id,
      label: `D${slot + 1}`,
      slot,
      // One dock at Changi is out of service to make utilisation non-trivial.
      status: s.id === 'SITE-CHANGI' && slot === 5 ? 'maintenance' : 'available',
      truckId: null,
      updatedAt: t0,
    })),
  );

  // Inventory: 14 + 13 + 13 = 40 SKU/bin records.
  const inventory: InventoryItem[] = [];
  sites.forEach((s, si) => {
    const count = si === 0 ? 14 : 13;
    for (let i = 0; i < count; i++) {
      const [sku, description] = SKU_CATALOGUE[(i + si * 3) % SKU_CATALOGUE.length]!;
      const reorderPoint = int(20, 60);
      // Roughly 1 in 5 records starts close to or below its reorder point.
      const lowish = rand() < 0.2;
      const onHand = lowish ? int(Math.floor(reorderPoint * 0.4), reorderPoint + 10) : int(reorderPoint * 2, reorderPoint * 6);
      const reserved = int(0, Math.floor(onHand * 0.35));
      inventory.push({
        id: `INV-${s.code}-${String(i + 1).padStart(2, '0')}`,
        siteId: s.id,
        sku,
        description,
        bin: `${String.fromCharCode(65 + (i % 6))}${String(int(1, 24)).padStart(2, '0')}-${int(1, 5)}`,
        onHand,
        reserved,
        reorderPoint,
        updatedAt: t0,
      });
    }
  });

  const trucks: Truck[] = [];
  const shipments: Shipment[] = [];
  let shipmentSeq = 1;
  const nextShipmentId = () => `SH-${String(shipmentSeq++).padStart(4, '0')}`;

  const linesFor = (siteId: string): Shipment['lines'] => {
    const pool = inventory.filter((it) => it.siteId === siteId);
    const n = int(1, 3);
    return Array.from({ length: n }, () => ({
      inventoryItemId: pool[int(0, pool.length - 1)]!.id,
      cartons: int(4, 24),
    }));
  };

  sites.forEach((s, si) => {
    const pattern = TRUCK_PATTERN[s.id]!;
    let dockCursor = 0;
    pattern.forEach((status, ti) => {
      const idx = si * 4 + ti;
      const truck: Truck = {
        id: `TRK-${String(idx + 1).padStart(2, '0')}`,
        plate: `${s.country === 'MY' ? 'JQA' : 'XD'} ${int(1000, 9999)} ${String.fromCharCode(65 + int(0, 25))}`,
        driver: DRIVERS[idx]!,
        capacityKg: [7500, 12000, 16000][idx % 3]!,
        siteId: s.id,
        status,
        shipmentId: null,
        routeProgress: 0,
        updatedAt: t0,
      };

      if (status === 'docked') {
        const dock = docks.find((d) => d.siteId === s.id && d.slot === dockCursor && d.status === 'available')!;
        dockCursor += 2;
        const arrival = t0 - int(5, 20) * MIN;
        const sh: Shipment = {
          id: nextShipmentId(),
          siteId: s.id,
          direction: rand() < 0.5 ? 'inbound' : 'outbound',
          truckId: truck.id,
          dockId: dock.id,
          status: 'at_dock',
          eta: arrival + int(-10, 15) * MIN,
          actualArrival: arrival,
          completedAt: null,
          dwellMs: int(20, 40) * MIN,
          lines: linesFor(s.id),
        };
        dock.status = 'occupied';
        dock.truckId = truck.id;
        truck.shipmentId = sh.id;
        shipments.push(sh);
      } else if (status === 'en_route') {
        truck.routeProgress = Math.round(rand() * 60) / 100;
        const sh: Shipment = {
          id: nextShipmentId(),
          siteId: s.id,
          direction: rand() < 0.5 ? 'inbound' : 'outbound',
          truckId: truck.id,
          dockId: null,
          status: 'in_transit',
          // One of these is already behind schedule at snapshot time.
          eta: t0 + (idx === 6 ? -10 : int(10, 45)) * MIN,
          actualArrival: null,
          completedAt: null,
          dwellMs: int(20, 40) * MIN,
          lines: linesFor(s.id),
        };
        truck.shipmentId = sh.id;
        shipments.push(sh);
      }
      trucks.push(truck);
    });
  });

  // Next scheduled jobs for idle / en-route trucks (5 total).
  const scheduledFor = ['TRK-04', 'TRK-11', 'TRK-12', 'TRK-03', 'TRK-07'];
  scheduledFor.forEach((truckId, i) => {
    const truck = trucks.find((t) => t.id === truckId)!;
    shipments.push({
      id: nextShipmentId(),
      siteId: truck.siteId,
      direction: i % 2 === 0 ? 'inbound' : 'outbound',
      truckId,
      dockId: null,
      status: 'scheduled',
      eta: t0 + int(60, 150) * MIN,
      actualArrival: null,
      completedAt: null,
      dwellMs: int(20, 40) * MIN,
      lines: linesFor(truck.siteId),
    });
  });

  // Completed history (12) so the on-time KPI has a baseline. ~75 % on time.
  for (let i = 0; i < 12; i++) {
    const s = sites[i % 3]!;
    const siteTrucks = trucks.filter((t) => t.siteId === s.id);
    const truck = siteTrucks[i % siteTrucks.length]!;
    const eta = t0 - int(90, 600) * MIN;
    const lateBy = rand() < 0.25 ? int(5, 50) : -int(0, 20);
    const actualArrival = eta + lateBy * MIN;
    const dwellMs = int(20, 40) * MIN;
    const dock = docks.filter((d) => d.siteId === s.id)[i % DOCKS_PER_SITE]!;
    shipments.push({
      id: nextShipmentId(),
      siteId: s.id,
      direction: i % 2 === 0 ? 'inbound' : 'outbound',
      truckId: truck.id,
      dockId: dock.id,
      status: 'completed',
      eta,
      actualArrival,
      completedAt: actualArrival + dwellMs,
      dwellMs,
      lines: linesFor(s.id),
    });
  }

  // Forklifts: 3 / 3 / 2 = 8.
  const forklifts: Forklift[] = [];
  const perSite = [3, 3, 2];
  let fl = 1;
  sites.forEach((s, si) => {
    for (let i = 0; i < perSite[si]!; i++) {
      forklifts.push({
        id: `FLK-${String(fl).padStart(2, '0')}`,
        siteId: s.id,
        name: `Forklift ${s.code}-${i + 1}`,
        status: (['idle', 'moving', 'lifting', 'charging'] as const)[int(0, 3)] ?? 'idle',
        batteryPct: int(25, 100),
        dockId: null,
        updatedAt: t0,
      });
      fl++;
    }
  });

  return { sites, docks, trucks, forklifts, inventory, shipments };
}
