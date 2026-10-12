import { useEffect, useMemo, useRef, type KeyboardEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { computeKpis } from '../selectors/kpis';
import { ALL_SITES, useWarehouseStore, type SiteSelection } from '../store/warehouseStore';

interface Option {
  id: SiteSelection;
  code: string;
  label: string;
  hint: string;
}

/**
 * Segmented radio group. Arrow keys move between sites, number keys 0–3 jump directly
 * (0 = network overview). Each option shows an attention dot computed from live state.
 */
export function SiteSelector() {
  const sites = useWarehouseStore((s) => s.sites);
  const selected = useWarehouseStore((s) => s.selectedSiteId);
  const selectSite = useWarehouseStore((s) => s.selectSite);
  const live = useWarehouseStore(
    useShallow((s) => ({ now: s.now, docks: s.docks, trucks: s.trucks, shipments: s.shipments, inventory: s.inventory })),
  );
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const options: Option[] = useMemo(
    () => [
      { id: ALL_SITES, code: 'ALL', label: 'Network', hint: `${sites.length} sites` },
      ...sites.map((s) => ({ id: s.id, code: s.code, label: s.name, hint: `${s.city}, ${s.country}` })),
    ],
    [sites],
  );

  const attention = useMemo(() => {
    const m = new Map<SiteSelection, 'bad' | 'warn' | null>();
    for (const o of options) {
      const k = computeKpis(live, o.id);
      m.set(o.id, k.lowStock.critical > 0 || k.onTime.tone === 'bad' ? 'bad' : k.onTime.lateOpen > 0 || k.trucks.queued > 0 ? 'warn' : null);
    }
    return m;
  }, [options, live]);

  // Global number-key shortcuts (ignored while typing in inputs).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 0 && n < options.length) selectSite(options[n]!.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [options, selectSite]);

  const onArrow = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const i = options.findIndex((o) => o.id === selected);
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    selectSite(options[next]!.id);
    buttons.current[next]?.focus();
  };

  return (
    <div className="site-selector" role="radiogroup" aria-label="Warehouse site" onKeyDown={onArrow}>
      {options.map((o, i) => {
        const active = o.id === selected;
        const flag = attention.get(o.id);
        return (
          <button
            key={o.id}
            ref={(el) => (buttons.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            className={`site-option ${active ? 'is-active' : ''}`}
            onClick={() => selectSite(o.id)}
            title={`${o.label} — press ${i}`}
          >
            <span className="site-option__code">{o.code}</span>
            <span className="site-option__text">
              <span className="site-option__label">{o.label}</span>
              <span className="site-option__hint">{o.hint}</span>
            </span>
            {flag && <span className={`site-option__flag tone-${flag}`} aria-label={flag === 'bad' ? 'Needs attention' : 'Watch'} />}
          </button>
        );
      })}
    </div>
  );
}
