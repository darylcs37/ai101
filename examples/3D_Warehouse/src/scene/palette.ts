import type { DockStatus, ForkliftStatus, TruckStatus } from '../data/types';

/** Scene palette — mirrors the CSS tokens in styles/theme.css. */
export const COLORS = {
  ground: '#15171a',
  pad: '#1d2024',
  road: '#23262b',
  roadLine: '#3a3f46',
  building: '#2b2f35',
  roof: '#353a41',
  trim: '#f5a524',
  amber: '#f5a524',
  amberDim: '#7a5414',
  steel: '#59606a',
} as const;

export const TRUCK_COLORS: Record<TruckStatus, string> = {
  idle: '#7d8590',
  en_route: '#4ea8de',
  docked: '#f5a524',
  maintenance: '#e5484d',
};

export const DOCK_COLORS: Record<DockStatus, string> = {
  available: '#2f6f4f',
  occupied: '#f5a524',
  maintenance: '#a3363a',
};

export const FORKLIFT_COLORS: Record<ForkliftStatus, string> = {
  idle: '#8b939e',
  moving: '#f5c451',
  lifting: '#f5a524',
  charging: '#4ea8de',
};
