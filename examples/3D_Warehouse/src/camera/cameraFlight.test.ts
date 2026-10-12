import { describe, expect, it } from 'vitest';
import { createSeed } from '../data/seed';
import { easeInOutCubic, planFlight, poseForSelection, sampleFlight } from './cameraFlight';

const sites = createSeed().sites;

describe('camera flight', () => {
  it('eases with fixed endpoints', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });

  it('starts at the current pose and ends exactly on the site pose', () => {
    const from = poseForSelection('SITE-TUAS', sites);
    const to = poseForSelection('SITE-CHANGI', sites);
    const f = planFlight(from, to);
    expect(f.durationS).toBeGreaterThan(0.7);
    expect(sampleFlight(f, 0).pose).toEqual(from);
    const mid = sampleFlight(f, f.durationS / 2);
    expect(mid.done).toBe(false);
    expect(mid.pose.position[1]).toBeGreaterThan(from.position[1]); // arcs upward
    const end = sampleFlight(f, f.durationS + 1);
    expect(end.done).toBe(true);
    expect(end.pose).toEqual(to);
  });

  it('jumps instantly under reduced motion', () => {
    const f = planFlight(poseForSelection('SITE-TUAS', sites), poseForSelection('ALL', sites), true);
    expect(sampleFlight(f, 0)).toMatchObject({ done: true });
  });
});
