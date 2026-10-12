import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { computeKpis, type SiteKpis } from '../selectors/kpis';
import { useWarehouseStore, type SiteSelection } from '../store/warehouseStore';

/** Subscribes only to the slices KPIs depend on; recomputes once per simulation tick. */
export function useSiteKpis(site: SiteSelection): SiteKpis {
  const input = useWarehouseStore(
    useShallow((s) => ({
      now: s.now,
      docks: s.docks,
      trucks: s.trucks,
      shipments: s.shipments,
      inventory: s.inventory,
    })),
  );
  return useMemo(() => computeKpis(input, site), [input, site]);
}

export interface KpiSeries {
  onTime: number[];
  docks: number[];
  trucks: number[];
  lowStock: number[];
}

const HISTORY = 30;

/** Rolling per-site history for sparklines. Resets when the site changes so trends never mix sites. */
export function useKpiHistory(site: SiteSelection, kpis: SiteKpis): KpiSeries {
  const tickCount = useWarehouseStore((s) => s.tickCount);
  const ref = useRef<{ site: SiteSelection; series: KpiSeries }>({ site, series: empty() });
  const [, force] = useState(0);

  useEffect(() => {
    if (ref.current.site !== site) ref.current = { site, series: empty() };
    const s = ref.current.series;
    push(s.onTime, kpis.onTime.rate === null ? NaN : kpis.onTime.rate * 100);
    push(s.docks, kpis.docks.inUse);
    push(s.trucks, kpis.trucks.active);
    push(s.lowStock, kpis.lowStock.count);
    force((n) => n + 1);
    // Sample once per tick (and once per site switch).
  }, [tickCount, site]); // eslint-disable-line react-hooks/exhaustive-deps

  return ref.current.site === site ? ref.current.series : empty();
}

function empty(): KpiSeries {
  return { onTime: [], docks: [], trucks: [], lowStock: [] };
}
function push(arr: number[], v: number) {
  arr.push(v);
  if (arr.length > HISTORY) arr.shift();
}
