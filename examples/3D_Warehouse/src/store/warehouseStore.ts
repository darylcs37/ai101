import { create } from 'zustand';
import { createSeed, SEED_SNAPSHOT } from '../data/seed';
import type { SiteId } from '../data/types';
import { tick, type SimState, type TickOptions } from '../simulation/engine';

/** `ALL` = network overview (camera frames every warehouse, KPIs aggregate all sites). */
export const ALL_SITES = 'ALL' as const;
export type SiteSelection = SiteId | typeof ALL_SITES;

export interface WarehouseStore extends SimState {
  selectedSiteId: SiteSelection;
  running: boolean;
  tickCount: number;
  selectSite: (id: SiteSelection) => void;
  setRunning: (running: boolean) => void;
  advance: (opts?: TickOptions) => void;
  reset: () => void;
}

function initialSim(): SimState {
  const seed = createSeed();
  return { ...seed, now: SEED_SNAPSHOT, shipmentSeq: seed.shipments.length };
}

export const useWarehouseStore = create<WarehouseStore>()((set, get) => ({
  ...initialSim(),
  selectedSiteId: 'SITE-TUAS',
  running: true,
  tickCount: 0,

  selectSite: (id) => {
    if (id !== ALL_SITES && !get().sites.some((s) => s.id === id)) return;
    set({ selectedSiteId: id });
  },
  setRunning: (running) => set({ running }),
  advance: (opts) =>
    set((state) => {
      const next = tick(state, opts);
      return {
        now: next.now,
        shipmentSeq: next.shipmentSeq,
        trucks: next.trucks,
        forklifts: next.forklifts,
        docks: next.docks,
        inventory: next.inventory,
        shipments: next.shipments,
        tickCount: state.tickCount + 1,
      };
    }),
  reset: () => set({ ...initialSim(), tickCount: 0 }),
}));
