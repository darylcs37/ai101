import { useWarehouseStore, ALL_SITES } from '../store/warehouseStore';
import { SiteSelector } from './SiteSelector';

export function TopBar() {
  const now = useWarehouseStore((s) => s.now);
  const running = useWarehouseStore((s) => s.running);
  const setRunning = useWarehouseStore((s) => s.setRunning);
  const selected = useWarehouseStore((s) => s.selectedSiteId);
  const site = useWarehouseStore((s) => s.sites.find((x) => x.id === s.selectedSiteId));
  const timezone = selected === ALL_SITES || !site ? 'Asia/Singapore' : site.timezone;

  const time = new Intl.DateTimeFormat('en-SG', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
  const date = new Intl.DateTimeFormat('en-SG', { timeZone: timezone, day: '2-digit', month: 'short' }).format(now);

  return (
    <header className="topbar">
      <div className="brand">
        <svg className="brand__mark" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 10 12 4l9 6v10H3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M7 20v-6h10v6M7 17h10" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="brand__name">WARE<span>TRACK</span></span>
      </div>

      <SiteSelector />

      <div className="topbar__status">
        <button
          type="button"
          className={`live-toggle ${running ? 'is-live' : ''}`}
          onClick={() => setRunning(!running)}
          aria-pressed={running}
        >
          <span className="live-toggle__dot" aria-hidden="true" />
          {running ? 'LIVE' : 'PAUSED'}
        </button>
        <div className="sim-clock" title={`Simulated time, ${timezone}`}>
          <span className="sim-clock__time">{time}</span>
          <span className="sim-clock__meta">{date} · {timezone.split('/')[1]?.replace('_', ' ')}</span>
        </div>
      </div>
    </header>
  );
}
