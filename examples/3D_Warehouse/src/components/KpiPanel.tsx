import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useKpiHistory, useSiteKpis } from '../hooks/useKpis';
import { ON_TIME_TARGET, type KpiTone } from '../selectors/kpis';
import { ALL_SITES, useWarehouseStore } from '../store/warehouseStore';
import { Sparkline } from './Sparkline';

export function KpiPanel() {
  const site = useWarehouseStore((s) => s.selectedSiteId);
  const siteName = useWarehouseStore((s) =>
    s.selectedSiteId === ALL_SITES ? 'All sites' : s.sites.find((x) => x.id === s.selectedSiteId)?.name ?? '',
  );
  const siteCodes = useWarehouseStore((s) => s.sites);
  const codeOf = (id: string) => siteCodes.find((x) => x.id === id)?.code ?? '';
  const k = useSiteKpis(site);
  const h = useKpiHistory(site, k);

  const pct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <section className="kpi-panel" aria-label={`Live KPIs — ${siteName}`}>
      <header className="kpi-panel__head">
        <h2>Live KPIs</h2>
        <span className="kpi-panel__scope">{siteName}</span>
      </header>

      <KpiCard
        label="On-time delivery"
        tone={k.onTime.tone}
        value={k.onTime.rate === null ? '—' : pct(k.onTime.rate)}
        series={h.onTime}
        meter={k.onTime.rate ?? 0}
        meterMark={ON_TIME_TARGET}
        detail={
          <>
            {k.onTime.onTime}/{k.onTime.measured} arrivals on time · target {pct(ON_TIME_TARGET)}
            {k.onTime.lateOpen > 0 && <span className="tone-text-bad"> · {k.onTime.lateOpen} running late</span>}
          </>
        }
      />

      <KpiCard
        label="Docks in use"
        tone={k.docks.tone}
        value={
          <>
            {k.docks.inUse}
            <small>/{k.docks.total}</small>
          </>
        }
        series={h.docks}
        meter={k.docks.utilisation}
        detail={
          <>
            {pct(k.docks.utilisation)} utilised
            {k.docks.maintenance > 0 && ` · ${k.docks.maintenance} in maintenance`}
          </>
        }
      />

      <KpiCard
        label="Active trucks"
        tone={k.trucks.tone}
        value={
          <>
            {k.trucks.active}
            <small>/{k.trucks.total}</small>
          </>
        }
        series={h.trucks}
        meter={k.trucks.total ? k.trucks.active / k.trucks.total : 0}
        detail={
          <>
            {k.trucks.enRoute} en route · {k.trucks.docked} docked
            {k.trucks.queued > 0 && <span className="tone-text-warn"> · {k.trucks.queued} queued at gate</span>}
          </>
        }
      />

      <KpiCard
        label="Low-stock alerts"
        tone={k.lowStock.tone}
        value={k.lowStock.count}
        series={h.lowStock}
        detail={
          k.lowStock.count === 0 ? (
            'All SKUs above reorder point'
          ) : (
            <ul className="alert-list">
              {k.lowStock.top.map((a) => (
                <li key={a.itemId} className={a.critical ? 'is-critical' : ''}>
                  <span className="alert-list__sku">{a.sku}</span>
                  <span className="alert-list__bin">
                    {site === ALL_SITES ? `${codeOf(a.siteId)} · ` : ''}
                    {a.bin}
                  </span>
                  <span className="alert-list__qty">
                    {a.available}/{a.reorderPoint}
                  </span>
                </li>
              ))}
              {k.lowStock.count > k.lowStock.top.length && (
                <li className="alert-list__more">+{k.lowStock.count - k.lowStock.top.length} more</li>
              )}
            </ul>
          )
        }
      />
    </section>
  );
}

interface KpiCardProps {
  label: string;
  value: ReactNode;
  tone: KpiTone;
  detail: ReactNode;
  series: number[];
  meter?: number;
  meterMark?: number;
}

function KpiCard({ label, value, tone, detail, series, meter, meterMark }: KpiCardProps) {
  const flash = useFlashOnChange(series[series.length - 1]);
  return (
    <article className={`kpi-card tone-${tone} ${flash ? 'is-flash' : ''}`}>
      <div className="kpi-card__top">
        <h3 className="kpi-card__label">{label}</h3>
        <span className="kpi-card__tone" aria-label={`Status: ${tone}`} />
      </div>
      <div className="kpi-card__row">
        <div className="kpi-card__value">{value}</div>
        <Sparkline values={series} />
      </div>
      {meter !== undefined && (
        <div className="kpi-meter" aria-hidden="true">
          <div className="kpi-meter__fill" style={{ width: `${Math.min(100, Math.max(0, meter * 100))}%` }} />
          {meterMark !== undefined && <div className="kpi-meter__mark" style={{ left: `${meterMark * 100}%` }} />}
        </div>
      )}
      <div className="kpi-card__detail">{detail}</div>
    </article>
  );
}

/** Briefly highlights a card when its headline value changes. */
function useFlashOnChange(value: number | undefined): boolean {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== undefined && value !== undefined && !Object.is(prev.current, value)) {
      setFlash(true);
      const t = window.setTimeout(() => setFlash(false), 650);
      prev.current = value;
      return () => window.clearTimeout(t);
    }
    prev.current = value;
    return undefined;
  }, [value]);
  return flash;
}
