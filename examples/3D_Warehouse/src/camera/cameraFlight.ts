import type { Site } from '../data/types';
import { ALL_SITES, type SiteSelection } from '../store/warehouseStore';

export type Vec3 = [number, number, number];

export interface CameraPose {
  position: Vec3;
  target: Vec3;
}

export interface CameraFlight {
  from: CameraPose;
  to: CameraPose;
  durationS: number;
  /** Peak extra height added mid-flight so long hops arc over the map instead of skimming it. */
  arcHeight: number;
}

/** Isometric-style offset from the orbit target. */
const SITE_OFFSET: Vec3 = [62, 70, 62];

export function poseForSite(site: Site): CameraPose {
  const { originX, originZ } = site.layout;
  return {
    target: [originX, 0, originZ],
    position: [originX + SITE_OFFSET[0], SITE_OFFSET[1], originZ + SITE_OFFSET[2]],
  };
}

/** Vertical field of view used by the scene camera (degrees). Keep in sync with WarehouseScene. */
export const CAMERA_FOV = 32;

/** Frames every warehouse: target at the bounding-box centre, distance fitted to the network extent. */
export function poseForOverview(sites: Site[]): CameraPose {
  if (sites.length === 0) return { target: [0, 0, 0], position: SITE_OFFSET };
  const xs = sites.map((s) => s.layout.originX);
  const zs = sites.map((s) => s.layout.originZ);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const radius = Math.max(...sites.map((s) => Math.hypot(s.layout.originX - cx, s.layout.originZ - cz)), 60) + 60;
  const distance = (radius / Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180)) * 0.82;
  const k = distance / Math.hypot(...SITE_OFFSET);
  // Nudge the framing toward screen-left so the network clears the KPI panel overlay.
  // Screen-right for this view direction is (1, 0, -1)/√2.
  const shift = radius * 0.22;
  const tx = cx - shift / Math.SQRT2;
  const tz = cz + shift / Math.SQRT2;
  return {
    target: [tx, 0, tz],
    position: [tx + SITE_OFFSET[0] * k, SITE_OFFSET[1] * k, tz + SITE_OFFSET[2] * k],
  };
}

export function poseForSelection(selection: SiteSelection, sites: Site[]): CameraPose {
  if (selection === ALL_SITES) return poseForOverview(sites);
  const site = sites.find((s) => s.id === selection);
  return site ? poseForSite(site) : poseForOverview(sites);
}

const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export function planFlight(from: CameraPose, to: CameraPose, reducedMotion = false): CameraFlight {
  const travel = Math.max(dist(from.target, to.target), dist(from.position, to.position));
  if (reducedMotion || travel < 0.01) return { from, to, durationS: 0, arcHeight: 0 };
  return {
    from,
    to,
    // Short hops feel snappy, cross-network hops stay readable.
    durationS: clamp(0.7 + travel / 260, 0.7, 2.2),
    arcHeight: clamp(travel * 0.18, 0, 55),
  };
}

/** Smooth start and stop with zero velocity at both ends. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function sampleFlight(flight: CameraFlight, elapsedS: number): { pose: CameraPose; done: boolean } {
  if (flight.durationS <= 0) return { pose: flight.to, done: true };
  const raw = clamp(elapsedS / flight.durationS, 0, 1);
  const e = easeInOutCubic(raw);
  const lerp = (a: Vec3, b: Vec3): Vec3 => [
    a[0] + (b[0] - a[0]) * e,
    a[1] + (b[1] - a[1]) * e,
    a[2] + (b[2] - a[2]) * e,
  ];
  const position = lerp(flight.from.position, flight.to.position);
  position[1] += Math.sin(Math.PI * raw) * flight.arcHeight;
  return { pose: { position, target: lerp(flight.from.target, flight.to.target) }, done: raw >= 1 };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
