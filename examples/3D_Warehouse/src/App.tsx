import { KpiPanel } from './components/KpiPanel';
import { TopBar } from './components/TopBar';
import { WarehouseScene } from './scene/WarehouseScene';
import { useLiveUpdates } from './simulation/liveUpdates';

export function App() {
  useLiveUpdates();
  return (
    <div className="app">
      <TopBar />
      <main className="stage">
        <WarehouseScene />
        <KpiPanel />
        <div className="legend" aria-hidden="true">
          <span><i style={{ background: '#4ea8de' }} />En route</span>
          <span><i style={{ background: '#f5a524' }} />Docked</span>
          <span><i style={{ background: '#7d8590' }} />Idle</span>
          <span><i style={{ background: '#e5484d' }} />Maintenance</span>
          <span className="legend__keys">Keys 0–3 switch site · drag to orbit</span>
        </div>
      </main>
    </div>
  );
}
