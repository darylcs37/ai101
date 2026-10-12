import { describe, expect, it } from 'vitest';
import { createSeed, mulberry32, SEED_SNAPSHOT } from '../data/seed';
import { tick, type SimState } from './engine';

const start = (): SimState => {
  const s = createSeed();
  return { ...s, now: SEED_SNAPSHOT, shipmentSeq: s.shipments.length };
};

function assertInvariants(s: SimState) {
  for (const d of s.docks) {
    if (d.status === 'occupied') {
      const t = s.trucks.find((x) => x.id === d.truckId);
      expect(t?.status).toBe('docked');
      expect(t?.siteId).toBe(d.siteId);
    } else expect(d.truckId).toBeNull();
  }
  for (const t of s.trucks) {
    if (t.status === 'docked') expect(s.docks.filter((d) => d.truckId === t.id)).toHaveLength(1);
    if (t.status === 'en_route' || t.status === 'docked') {
      const sh = s.shipments.find((x) => x.id === t.shipmentId);
      expect(sh?.status).toBe(t.status === 'docked' ? 'at_dock' : 'in_transit');
    }
  }
  for (const i of s.inventory) {
    expect(i.onHand).toBeGreaterThanOrEqual(0);
    expect(i.reserved).toBeGreaterThanOrEqual(0);
    expect(i.onHand - i.reserved).toBeGreaterThanOrEqual(0);
  }
}

describe('seed', () => {
  it('has the expected counts and is deterministic', () => {
    const s = createSeed();
    expect(s.sites).toHaveLength(3);
    expect(s.docks).toHaveLength(18);
    expect(s.trucks).toHaveLength(12);
    expect(s.forklifts).toHaveLength(8);
    expect(s.inventory).toHaveLength(40);
    expect(s.shipments).toHaveLength(25);
    expect(JSON.stringify(createSeed())).toBe(JSON.stringify(s));
  });
});

describe('tick', () => {
  it('keeps docks, trucks and shipments consistent over a long run', () => {
    const random = mulberry32(7);
    let s = start();
    assertInvariants(s);
    for (let i = 0; i < 400; i++) {
      s = tick(s, { random });
      assertInvariants(s);
    }
    expect(s.now).toBe(SEED_SNAPSHOT + 400 * 5 * 60_000);
    expect(s.shipments.some((x) => x.status === 'completed' && x.completedAt! > SEED_SNAPSHOT)).toBe(true);
  });

  it('does not mutate the previous state', () => {
    const s = start();
    const snapshot = JSON.stringify(s);
    tick(s, { random: mulberry32(1) });
    expect(JSON.stringify(s)).toBe(snapshot);
  });
});
