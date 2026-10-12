import { describe, expect, it } from 'vitest';
import { computeKpis, type KpiInput } from './kpis';
import type { Dock, InventoryItem, Shipment, Truck } from '../data/types';

const T = 1_000_000;
const dock = (id: string, siteId: string, status: Dock['status']): Dock => ({ id, siteId, label: id, slot: 0, status, truckId: null, updatedAt: T });
const truck = (id: string, siteId: string, status: Truck['status'], routeProgress = 0.5): Truck => ({ id, plate: '', driver: '', capacityKg: 1, siteId, status, shipmentId: null, routeProgress, updatedAt: T });
const ship = (id: string, siteId: string, p: Partial<Shipment>): Shipment => ({ id, siteId, direction: 'inbound', truckId: 't', dockId: null, status: 'completed', eta: T, actualArrival: T, completedAt: T, dwellMs: 1, lines: [], ...p });
const item = (id: string, siteId: string, onHand: number, reserved: number, reorderPoint: number): InventoryItem => ({ id, siteId, sku: id, description: '', bin: 'A01', onHand, reserved, reorderPoint, updatedAt: T });

const input: KpiInput = {
  now: T + 10,
  docks: [dock('a1', 'A', 'occupied'), dock('a2', 'A', 'available'), dock('a3', 'A', 'maintenance'), dock('b1', 'B', 'occupied')],
  trucks: [truck('t1', 'A', 'en_route'), truck('t2', 'A', 'docked'), truck('t3', 'A', 'idle'), truck('t4', 'A', 'en_route', 1), truck('t5', 'B', 'maintenance')],
  shipments: [
    ship('s1', 'A', { actualArrival: T }), // exactly on ETA → on time
    ship('s2', 'A', { actualArrival: T + 1 }), // late
    ship('s3', 'A', { status: 'in_transit', actualArrival: null, completedAt: null, eta: T }), // open + overdue
    ship('s4', 'A', { status: 'completed', actualArrival: null }), // no arrival → not measured
    ship('s5', 'B', { actualArrival: T - 5 }),
  ],
  inventory: [item('i1', 'A', 50, 30, 20), item('i2', 'A', 10, 10, 5), item('i3', 'A', 100, 0, 20), item('i4', 'B', 5, 0, 10)],
};

describe('computeKpis', () => {
  it('computes site-scoped values', () => {
    const k = computeKpis(input, 'A');
    expect(k.onTime).toMatchObject({ rate: 0.5, onTime: 1, measured: 2, lateOpen: 1, tone: 'bad' });
    expect(k.docks).toMatchObject({ inUse: 1, total: 3, maintenance: 1 });
    expect(k.trucks).toMatchObject({ active: 3, enRoute: 2, docked: 1, queued: 1, total: 4, tone: 'warn' });
    expect(k.lowStock.count).toBe(2); // i1 (20 ≤ 20) and i2 (0 ≤ 5)
    expect(k.lowStock.critical).toBe(1);
    expect(k.lowStock.top[0]!.itemId).toBe('i2');
  });

  it('aggregates across the network', () => {
    const k = computeKpis(input, 'ALL');
    expect(k.onTime.measured).toBe(3);
    expect(k.docks.inUse).toBe(2);
    expect(k.lowStock.count).toBe(3);
  });

  it('returns null rate when nothing measured', () => {
    expect(computeKpis({ ...input, shipments: [] }, 'A').onTime.rate).toBeNull();
  });
});
