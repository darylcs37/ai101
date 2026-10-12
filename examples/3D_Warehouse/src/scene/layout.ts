import type { Site, Truck } from '../data/types';
import type { Vec3 } from '../camera/cameraFlight';

/** Pure geometry helpers. No business rules: they only map state → world positions. */

export const BUILDING = { width: 44, depth: 26, height: 9 };
const DOCK_SPACING = 6.4;

/** Rotate a local (x, z) offset by the site heading and translate to the site origin. */
export function toWorld(site: Site, lx: number, lz: number, y = 0): Vec3 {
  const { originX, originZ, heading } = site.layout;
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  return [originX + lx * c + lz * s, y, originZ - lx * s + lz * c];
}

export function dockLocalX(slot: number, count: number): number {
  return (slot - (count - 1) / 2) * DOCK_SPACING;
}

export function dockPosition(site: Site, slot: number, count: number): Vec3 {
  return toWorld(site, dockLocalX(slot, count), BUILDING.depth / 2 + 1.5, 0.05);
}

/**
 * Where to draw a truck. en_route trucks travel along the approach road towards the gate;
 * docked trucks back onto their dock; idle and maintenance trucks park in the yard.
 */
export function truckPosition(
  truck: Truck,
  site: Site,
  dockSlot: number | null,
  dockCount: number,
  yardIndex: number,
): { position: Vec3; rotationY: number } {
  const heading = site.layout.heading;
  if (truck.status === 'docked' && dockSlot !== null) {
    return { position: toWorld(site, dockLocalX(dockSlot, dockCount), BUILDING.depth / 2 + 6, 0), rotationY: heading };
  }
  if (truck.status === 'en_route') {
    // Road runs from off-site (local x = +110) to the gate (local x = +30) along local z = +30.
    const p = Math.min(1, Math.max(0, truck.routeProgress));
    const lx = 110 - 80 * p + yardIndex * 0.01;
    return { position: toWorld(site, lx, 30 + (yardIndex % 2) * 3.2, 0), rotationY: heading + Math.PI / 2 };
  }
  // Yard parking bays to the left of the building; maintenance bay further out.
  const bayX = truck.status === 'maintenance' ? -42 : -34;
  const bayZ = -9 + yardIndex * 5.5;
  return { position: toWorld(site, bayX, bayZ, 0), rotationY: heading };
}
