import type { Dock, EpochMs, InventoryItem, Shipment, Truck } from '../data/types';
import { ALL_SITES, type SiteSelection } from '../store/warehouseStore';

export type KpiTone = 'good' | 'warn' | 'bad' | 'neutral';

export interface LowStockAlert {
  itemId: string;
  siteId: string;
  sku: string;
  description: string;
  bin: string;
  available: number;
  reorderPoint: number;
  critical: boolean;
}

export interface SiteKpis {
  onTime: { rate: number | null; onTime: number; measured: number; lateOpen: number; tone: KpiTone };
  docks: { inUse: number; total: number; maintenance: number; utilisation: number; tone: KpiTone };
  trucks: { active: number; enRoute: number; docked: number; queued: number; total: number; tone: KpiTone };
  lowStock: { count: number; critical: number; top: LowStockAlert[]; tone: KpiTone };
}

export interface KpiInput {
  now: EpochMs;
  docks: Dock[];
  trucks: Truck[];
  shipments: Shipment[];
  inventory: InventoryItem[];
}

export const ON_TIME_TARGET = 0.95;
export const ON_TIME_FLOOR = 0.85;
export const DOCK_UTILISATION_WARN = 0.85;

const inScope = (site: SiteSelection) => (siteId: string) => site === ALL_SITES || siteId === site;

/**
 * Pure KPI computation from live warehouse state.
 *
 * - On-time delivery rate: completed shipments with a recorded dock arrival at or before ETA ÷ completed shipments
 *   with a recorded arrival (rolling window kept by the simulation). `null` when nothing has been measured yet.
 * - Docks in use: occupied docks ÷ docks at the site (maintenance docks counted in the total and reported separately).
 * - Active trucks: trucks en route to, or docked at, the site.
 * - Low-stock alerts: SKU/bin records whose available cartons (on hand − reserved) are at or below reorder point.
 *   Critical when nothing is available.
 */
export function computeKpis(input: KpiInput, site: SiteSelection): SiteKpis {
  const match = inScope(site);

  // On-time delivery
  let onTime = 0;
  let measured = 0;
  let lateOpen = 0;
  for (const s of input.shipments) {
    if (!match(s.siteId)) continue;
    if (s.status === 'completed' && s.actualArrival !== null) {
      measured++;
      if (s.actualArrival <= s.eta) onTime++;
    } else if (s.status !== 'completed' && s.actualArrival === null && input.now > s.eta) {
      lateOpen++;
    }
  }
  const rate = measured === 0 ? null : onTime / measured;
  const onTimeTone: KpiTone =
    rate === null ? 'neutral' : rate >= ON_TIME_TARGET ? 'good' : rate >= ON_TIME_FLOOR ? 'warn' : 'bad';

  // Docks
  const siteDocks = input.docks.filter((d) => match(d.siteId));
  const inUse = siteDocks.filter((d) => d.status === 'occupied').length;
  const maintenance = siteDocks.filter((d) => d.status === 'maintenance').length;
  const total = siteDocks.length;
  const utilisation = total === 0 ? 0 : inUse / total;
  const serviceable = total - maintenance;
  const dockTone: KpiTone =
    total === 0 ? 'neutral' : inUse >= serviceable ? 'bad' : utilisation >= DOCK_UTILISATION_WARN ? 'warn' : 'good';

  // Trucks
  const siteTrucks = input.trucks.filter((t) => match(t.siteId));
  const enRoute = siteTrucks.filter((t) => t.status === 'en_route').length;
  const docked = siteTrucks.filter((t) => t.status === 'docked').length;
  const queued = siteTrucks.filter((t) => t.status === 'en_route' && t.routeProgress >= 1).length;
  const truckTone: KpiTone = queued > 0 ? 'warn' : 'good';

  // Low stock
  const alerts: LowStockAlert[] = [];
  for (const i of input.inventory) {
    if (!match(i.siteId)) continue;
    const available = i.onHand - i.reserved;
    if (available <= i.reorderPoint) {
      alerts.push({
        itemId: i.id,
        siteId: i.siteId,
        sku: i.sku,
        description: i.description,
        bin: i.bin,
        available,
        reorderPoint: i.reorderPoint,
        critical: available <= 0,
      });
    }
  }
  alerts.sort((a, b) => a.available / Math.max(1, a.reorderPoint) - b.available / Math.max(1, b.reorderPoint));
  const critical = alerts.filter((a) => a.critical).length;

  return {
    onTime: { rate, onTime, measured, lateOpen, tone: onTimeTone },
    docks: { inUse, total, maintenance, utilisation, tone: dockTone },
    trucks: { active: enRoute + docked, enRoute, docked, queued, total: siteTrucks.length, tone: truckTone },
    lowStock: {
      count: alerts.length,
      critical,
      top: alerts.slice(0, 3),
      tone: critical > 0 ? 'bad' : alerts.length > 0 ? 'warn' : 'good',
    },
  };
}
