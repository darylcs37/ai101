// ============================================================
// SENTINEL · HADR Satellite Monitoring System
// Interactive Logic
// ============================================================

// ---- Theme Toggle ----
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = 'dark';
  root.setAttribute('data-theme', theme);
  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    });
  }
})();

// ---- Mission Clock ----
function updateClock() {
  const now = new Date();
  const h = String(now.getUTCHours()).padStart(2, '0');
  const m = String(now.getUTCMinutes()).padStart(2, '0');
  const s = String(now.getUTCSeconds()).padStart(2, '0');
  const el = document.getElementById('clockDisplay');
  if (el) el.textContent = `${h}:${m}:${s}Z`;
}
updateClock();
setInterval(updateClock, 1000);

// ---- Lucide Icons ----
lucide.createIcons();

// ============================================================
// DATA
// ============================================================

const EVENTS = [
  { id: 'EVT-001', type: 'TYPHOON', sev: 'critical', loc: 'Visayas, Philippines', lat: 11.2, lng: 125.0, time: '08:42Z', conf: '91%', pop: '2.4M', src: 'Earth-2 Nowcast + Sentinel-1' },
  { id: 'EVT-002', type: 'FLOOD', sev: 'critical', loc: 'Luzon, Philippines', lat: 15.1, lng: 121.0, time: '06:18Z', conf: '87%', pop: '850K', src: 'AlphaEarth + SAR Mosaic' },
  { id: 'EVT-003', type: 'DISPLACEMENT', sev: 'high', loc: 'Mindanao Coast', lat: 7.5, lng: 125.5, time: '05:30Z', conf: '78%', pop: '340K', src: 'Pattern-of-Life Model v2' },
  { id: 'EVT-004', type: 'LANDSLIDE', sev: 'high', loc: 'Baguio, Luzon', lat: 16.4, lng: 120.6, time: '04:55Z', conf: '72%', pop: '120K', src: 'DEM + SAR Coherence' },
  { id: 'EVT-005', type: 'STORM SURGE', sev: 'critical', loc: 'Leyte Gulf', lat: 10.8, lng: 125.3, time: '07:12Z', conf: '84%', pop: '460K', src: 'Earth-2 CorrDiff Model' },
  { id: 'EVT-006', type: 'DAMAGE', sev: 'medium', loc: 'Samar Island', lat: 12.0, lng: 125.0, time: '03:40Z', conf: '68%', pop: '95K', src: 'AlphaEarth Foundations' },
  { id: 'EVT-007', type: 'AID CONVOY', sev: 'low', loc: 'Highway 54, Leyte', lat: 10.6, lng: 124.8, time: '09:01Z', conf: '99%', pop: '—', src: 'Pattern-of-Life Track' },
];

const ASSETS = [
  { id: 'SAT-01', name: 'SENTINEL-2A', type: 'Optical HR', res: '10m', status: 'live', lat: 13.0, lng: 122.0 },
  { id: 'SAT-02', name: 'SENTINEL-1B', type: 'SAR C-band', res: '5m', status: 'live', lat: 10.0, lng: 126.0 },
  { id: 'SAT-03', name: 'COSMO-SkyMed', type: 'SAR X-band', res: '1m', status: 'live', lat: 12.5, lng: 124.5 },
  { id: 'SAT-04', name: 'KOMPSAT-3A', type: 'Optical HR', res: '0.55m', status: 'live', lat: 8.0, lng: 125.0 },
  { id: 'SAT-05', name: 'PLANET-DOVE', type: 'Optical MS', res: '3m', status: 'live', lat: 15.0, lng: 120.5 },
  { id: 'SAT-06', name: 'ALOS-PALSAR', type: 'SAR L-band', res: '10m', status: 'live', lat: 9.5, lng: 123.0 },
  { id: 'SAT-07', name: 'MAXAR-WV3', type: 'Optical VHR', res: '0.31m', status: 'offline', lat: null, lng: null },
];

const RECS = [
  { n: 1, title: 'Pre-position medical assets to Leyte Gulf staging area', sub: 'Predicted surge landfall +34h · 460K at risk', p: 'p1' },
  { n: 2, title: 'Activate evacuation corridors Highway 54 & 19', sub: 'Displacement model indicates surge +6h · 3 provinces', p: 'p1' },
  { n: 3, title: 'Task COSMO-SkyMed to Mindanao for damage BDA', sub: 'Ground truth required for secondary flooding assessment', p: 'p2' },
  { n: 4, title: 'Deploy UNHCR rapid assessment team to Baguio', sub: 'Landslide probability 72% · Window: next 12h', p: 'p2' },
  { n: 5, title: 'Coordinate with PCG for maritime traffic management', sub: 'Vessel clustering anomaly · Manila Bay · Pattern-of-Life flag', p: 'p3' },
];

const TASKS = [
  { id: 'TSK-2401', desc: 'Optical collect · Typhoon damage BDA · Visayas', meta: 'KOMPSAT-3A · Priority 1 · Window: 10:30-11:45Z', status: 'active' },
  { id: 'TSK-2402', desc: 'SAR flood mapping · Luzon NE coastline', meta: 'SENTINEL-1B · Priority 1 · Window: 12:00-12:30Z', status: 'active' },
  { id: 'TSK-2403', desc: 'Change detection tasking · Mindanao interior', meta: 'COSMO-SkyMed · Priority 2 · Window: 14:00Z', status: 'pending' },
  { id: 'TSK-2404', desc: 'Multispectral collect · Aid depot validation', meta: 'PLANET-DOVE · Priority 3 · Completed 06:20Z', status: 'complete' },
];

const ARCHIVE = [
  { name: 'Leyte_SAR_20260419_0600Z', sensor: 'SAR', cloud: '0%', date: '2026-04-19 06:00Z' },
  { name: 'Visayas_OPT_20260419_0420Z', sensor: 'OPT', cloud: '12%', date: '2026-04-19 04:20Z' },
  { name: 'Luzon_MS_20260418_1800Z', sensor: 'MS', cloud: '8%', date: '2026-04-18 18:00Z' },
  { name: 'Mindanao_SAR_20260418_1200Z', sensor: 'SAR', cloud: '0%', date: '2026-04-18 12:00Z' },
];

// ============================================================
// MAP INITIALIZATION
// ============================================================

const map = L.map('map', {
  center: [11.0, 124.0],
  zoom: 7,
  zoomControl: false,
  attributionControl: true,
});

const tileLayers = {
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CartoDB',
    maxZoom: 19,
  }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri'
  }),
  topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }),
};
tileLayers.dark.addTo(map);

// Map controls
document.getElementById('btnZoomIn')?.addEventListener('click', () => map.zoomIn());
document.getElementById('btnZoomOut')?.addEventListener('click', () => map.zoomOut());
document.getElementById('btnHome')?.addEventListener('click', () => map.setView([11.0, 124.0], 7));

// Basemap switcher
document.querySelectorAll('.bm-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.bm-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(tileLayers).forEach(l => map.removeLayer(l));
    const bm = btn.dataset.basemap;
    if (tileLayers[bm]) tileLayers[bm].addTo(map);
  });
});

// 2D/3D toggle (mock)
document.querySelectorAll('.map-ctrl-btn[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.map-ctrl-btn[data-view]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ============================================================
// EVENT MARKERS
// ============================================================

const evIcons = {
  critical: '⚠', high: '!', medium: '◉', low: '↑'
};

const markerMap = {};

EVENTS.forEach(ev => {
  const icon = L.divIcon({
    html: `<div class="ev-marker ${ev.sev}">${evIcons[ev.sev]}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: '',
  });
  const marker = L.marker([ev.lat, ev.lng], { icon }).addTo(map);
  marker.on('click', () => showEventPopup(ev));
  markerMap[ev.id] = marker;
});

// Asset markers (satellite ground track indicator)
ASSETS.filter(a => a.lat).forEach(a => {
  const icon = L.divIcon({
    html: `<div class="asset-marker"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    className: '',
  });
  L.marker([a.lat, a.lng], { icon })
    .bindPopup(`<strong>${a.name}</strong><br/>${a.type} · ${a.res}`)
    .addTo(map);
});

// Draw a simulated polygon AOI
const aoiPoly = L.polygon([
  [8.0, 122.0], [8.0, 127.0], [16.0, 127.0], [16.0, 122.0]
], {
  color: '#00d4ff',
  fillColor: '#00d4ff',
  fillOpacity: 0.03,
  weight: 1,
  dashArray: '4 4',
}).addTo(map);

// Draw simulated typhoon track line
const typhoonTrack = L.polyline([
  [8.5, 130.0], [9.5, 128.5], [10.5, 127.0], [11.2, 125.5], [11.8, 124.0]
], {
  color: '#ff4757',
  weight: 2,
  dashArray: '6 4',
  opacity: 0.8,
}).addTo(map);

// Draw predicted path (dashed)
const typhoonPred = L.polyline([
  [11.8, 124.0], [12.5, 122.5], [13.2, 121.0]
], {
  color: '#ff4757',
  weight: 2,
  dashArray: '3 6',
  opacity: 0.5,
}).addTo(map);

// Typhoon eye marker
const typhoonIcon = L.divIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;border:2px solid #ff4757;background:rgba(255,71,87,0.1);display:flex;align-items:center;justify-content:center;font-size:12px;animation:pulse-red 2s infinite;box-shadow:0 0 12px rgba(255,71,87,0.5)">🌀</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: '',
});
L.marker([11.8, 124.0], { icon: typhoonIcon })
  .bindPopup('<strong>Typhoon MALAYA</strong><br/>Cat 3 · 185 km/h · 940 hPa')
  .addTo(map);

// ============================================================
// EVENT POPUP
// ============================================================

function showEventPopup(ev) {
  document.getElementById('epType').textContent = ev.type;
  document.getElementById('epSev').textContent = ev.sev.toUpperCase();
  document.getElementById('epSev').style.background = ev.sev === 'critical' ? 'var(--red-dim)' : ev.sev === 'high' ? 'var(--orange-dim)' : 'var(--blue-dim)';
  document.getElementById('epSev').style.color = ev.sev === 'critical' ? 'var(--red)' : ev.sev === 'high' ? 'var(--orange)' : 'var(--blue)';
  document.getElementById('epLoc').textContent = ev.loc;
  document.getElementById('epTime').textContent = ev.time;
  document.getElementById('epConf').textContent = ev.conf;
  document.getElementById('epPop').textContent = ev.pop;
  document.getElementById('epSrc').textContent = ev.src;
  document.getElementById('eventPopup').classList.remove('hidden');
  // pan to event
  map.flyTo([ev.lat, ev.lng], 9, { duration: 1 });
  // highlight event in list
  document.querySelectorAll('.event-item').forEach(el => el.classList.remove('selected'));
  document.getElementById(`evitem-${ev.id}`)?.classList.add('selected');
}

document.getElementById('epClose')?.addEventListener('click', () => {
  document.getElementById('eventPopup').classList.add('hidden');
  document.querySelectorAll('.event-item').forEach(el => el.classList.remove('selected'));
});

// ============================================================
// POPULATE SIDEBAR
// ============================================================

// Event list
const eventListEl = document.getElementById('eventList');
if (eventListEl) {
  EVENTS.forEach(ev => {
    const item = document.createElement('div');
    item.className = 'event-item';
    item.id = `evitem-${ev.id}`;
    item.dataset.testid = `event-item-${ev.id}`;
    item.innerHTML = `
      <div class="ev-sev-bar ${ev.sev}"></div>
      <div class="ev-content">
        <div class="ev-type ${ev.sev}">${ev.type}</div>
        <div class="ev-loc">${ev.loc}</div>
        <div class="ev-time">${ev.time}</div>
      </div>
    `;
    item.addEventListener('click', () => showEventPopup(ev));
    eventListEl.appendChild(item);
  });
}

// Asset list
const assetListEl = document.getElementById('assetList');
if (assetListEl) {
  ASSETS.forEach(a => {
    const item = document.createElement('div');
    item.className = 'asset-item';
    item.dataset.testid = `asset-item-${a.id}`;
    item.innerHTML = `
      <div class="asset-icon ${a.status}"><i data-lucide="satellite" class="icon-xs"></i></div>
      <div class="asset-info">
        <div class="asset-name">${a.name}</div>
        <div class="asset-sub">${a.type} · ${a.res}</div>
      </div>
      <div class="asset-status ${a.status}">${a.status === 'live' ? 'LIVE' : 'OFFLINE'}</div>
    `;
    assetListEl.appendChild(item);
  });
}
lucide.createIcons();

// Prescriptive recs
const recListEl = document.getElementById('recList');
if (recListEl) {
  RECS.forEach(r => {
    const item = document.createElement('div');
    item.className = 'rec-item';
    item.dataset.testid = `rec-item-${r.n}`;
    item.innerHTML = `
      <div class="rec-num">${r.n}</div>
      <div class="rec-body">
        <div class="rec-title">${r.title}</div>
        <div class="rec-sub">${r.sub}</div>
      </div>
      <div class="rec-priority ${r.p}">${r.p.toUpperCase()}</div>
    `;
    recListEl.appendChild(item);
  });
}

// Task queue
const taskQueueEl = document.getElementById('taskQueue');
if (taskQueueEl) {
  TASKS.forEach(t => {
    const item = document.createElement('div');
    item.className = 'task-item';
    item.dataset.testid = `task-item-${t.id}`;
    item.innerHTML = `
      <div class="task-status-dot ${t.status}"></div>
      <div class="task-info">
        <div class="task-id">${t.id}</div>
        <div class="task-desc">${t.desc}</div>
        <div class="task-meta">${t.meta}</div>
      </div>
      <div class="task-badge ${t.status}">${t.status.toUpperCase()}</div>
    `;
    taskQueueEl.appendChild(item);
  });
}

// Archive grid
const archiveGridEl = document.getElementById('archiveGrid');
if (archiveGridEl) {
  ARCHIVE.forEach(a => {
    const item = document.createElement('div');
    item.className = 'archive-item';
    const colors = { SAR: '#ff9f40', OPT: '#4285f4', MS: '#76b900' };
    const c = colors[a.sensor] || '#5c9dff';
    item.innerHTML = `
      <div class="arc-thumb" style="background:${c}22;color:${c}">${a.sensor}</div>
      <div class="arc-info">
        <div class="arc-name">${a.name}</div>
        <div class="arc-meta">${a.date}</div>
      </div>
      <div class="arc-cloud">${a.cloud}</div>
    `;
    archiveGridEl.appendChild(item);
  });
}

// Weather grid (Earth-2)
const wxData = [
  { label: 'WIND SPEED', val: '42 kt', trend: '↑ +8kt/6h' },
  { label: 'RAINFALL', val: '85 mm/h', trend: '↑ Intensifying' },
  { label: 'SEA STATE', val: '4.2m Hs', trend: '↑ Rough' },
  { label: 'VISIBILITY', val: '800m', trend: '↓ Degrading' },
];
const wxGridEl = document.getElementById('wxGrid');
if (wxGridEl) {
  wxData.forEach(w => {
    const card = document.createElement('div');
    card.className = 'wx-card';
    card.innerHTML = `
      <div class="wx-label">${w.label}</div>
      <div class="wx-val">${w.val}</div>
      <div class="wx-trend">${w.trend}</div>
    `;
    wxGridEl.appendChild(card);
  });
}

// ============================================================
// CHART: Pattern of Life (72h baseline vs observed)
// ============================================================

const polCtx = document.getElementById('polChart')?.getContext('2d');
if (polCtx) {
  const labels = Array.from({ length: 25 }, (_, i) => {
    const h = 72 - i * 3;
    // Only label every 12h interval
    if (h === 72) return '-72h';
    if (h === 48) return '-48h';
    if (h === 24) return '-24h';
    if (h === 0) return 'NOW';
    return '';
  });
  new Chart(polCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Baseline',
          data: [42,44,43,41,38,40,52,65,70,68,60,48,42,40,41,43,45,66,72,68,62,50,45,42,44],
          borderColor: 'rgba(92,157,255,0.5)',
          backgroundColor: 'rgba(92,157,255,0.05)',
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Observed',
          data: [45,46,44,42,39,41,54,68,72,71,64,52,45,43,44,46,80,140,185,160,130,90,72,65,60],
          borderColor: '#ff4757',
          backgroundColor: 'rgba(255,71,87,0.1)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: '#6b7590', font: { family: 'JetBrains Mono', size: 8 }, maxRotation: 0, autoSkip: false },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          ticks: { color: '#6b7590', font: { family: 'JetBrains Mono', size: 8 } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        }
      }
    }
  });
}

// ============================================================
// CHART: Predictive Risk Score (72h)
// ============================================================

const predictCtx = document.getElementById('predictChart')?.getContext('2d');
if (predictCtx) {
  const pLabels = ['+6h','+12h','+18h','+24h','+30h','+36h','+42h','+48h','+54h','+60h','+66h','+72h'];
  new Chart(predictCtx, {
    type: 'line',
    data: {
      labels: pLabels,
      datasets: [
        {
          label: 'Risk Score',
          data: [55, 62, 72, 80, 87, 91, 88, 84, 78, 72, 65, 58],
          borderColor: '#ff4757',
          backgroundColor: 'rgba(255,71,87,0.12)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#ff4757',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Uncertainty (upper)',
          data: [60, 70, 82, 90, 96, 98, 95, 91, 86, 80, 73, 66],
          borderColor: 'rgba(255,71,87,0.2)',
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderDash: [4,3],
          pointRadius: 0,
          tension: 0.4,
        }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: '#6b7590', font: { family: 'JetBrains Mono', size: 8 }, maxRotation: 0, maxTicksLimit: 6 },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          min: 0, max: 100,
          ticks: { color: '#6b7590', font: { family: 'JetBrains Mono', size: 8 }, stepSize: 25 },
          grid: { color: 'rgba(255,255,255,0.04)' },
        }
      }
    }
  });
}

// ============================================================
// CHART: Typhoon Track (wind speed over time)
// ============================================================

const typhCtx = document.getElementById('typhoonChart')?.getContext('2d');
if (typhCtx) {
  const typhLabels = ['-36h','-24h','-12h','NOW','+12h','+24h','+36h'];
  new Chart(typhCtx, {
    type: 'line',
    data: {
      labels: typhLabels,
      datasets: [
        {
          label: 'Wind Speed (km/h)',
          data: [95, 120, 155, 185, 195, 190, 155],
          borderColor: '#ff4757',
          backgroundColor: 'rgba(255,71,87,0.08)',
          borderWidth: 2,
          pointRadius: [2,2,2,5,2,2,2],
          pointBackgroundColor: (ctx) => ctx.dataIndex === 3 ? '#ff4757' : 'transparent',
          tension: 0.4,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: '#6b7590', font: { family: 'JetBrains Mono', size: 8 } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          ticks: { color: '#6b7590', font: { family: 'JetBrains Mono', size: 8 } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        }
      }
    }
  });
}

// ============================================================
// TABS
// ============================================================

document.querySelectorAll('.rtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.rtab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.rtab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const contentId = `tab-${tab.dataset.tab}`;
    document.getElementById(contentId)?.classList.add('active');
  });
});

// ============================================================
// AI CAPABILITY TOGGLES
// ============================================================

document.querySelectorAll('.ai-cap').forEach(cap => {
  cap.addEventListener('click', () => {
    const isActive = cap.classList.toggle('active');
    const statusEl = cap.querySelector('.ai-cap-status');
    if (statusEl) {
      if (isActive) {
        statusEl.textContent = 'ON';
        statusEl.className = 'ai-cap-status ' + (cap.closest('#tab-genai')?.querySelector('.earth2-header') ? 'on nvidia-on' : 'on');
      } else {
        statusEl.textContent = 'OFF';
        statusEl.className = 'ai-cap-status off';
      }
    }
  });
});

// ============================================================
// AI QUERY SIMULATION
// ============================================================

const ALPHA_RESPONSES = [
  '► Analysis complete · Flood extent Luzon coast: 2,847 km² inundated (↑340% vs 72h baseline)\n► Displacement vectors confirm 850K people in high-risk zones\n► Infrastructure damage detected: 14 bridges, 3 road segments severed\n► Confidence: 87% · Source: AlphaEarth Foundations 2025 · Sentinel-1 SAR fusion',
  '► Change detection running on AOI (Lat 8–16, Lon 122–127)\n► Structural damage: Urban fabric 12% modified in last 24h\n► Water body extent: +220% vs baseline (SAR coherence analysis)\n► Recommended: Activate damage BDA workflow',
  '► Land cover reclassification complete for Visayas region\n► Identified 3 new IDP camp formations (>500 shelter structures each)\n► Aid site accessibility: 2 of 5 pre-designated locations now inaccessible (road damage)\n► Alert: Port infrastructure Ormoc City — significant structural deformation detected',
];

document.getElementById('runAlphaQuery')?.addEventListener('click', () => {
  const resultEl = document.getElementById('alphaResult');
  if (!resultEl) return;
  resultEl.textContent = '⟳ Querying AlphaEarth Foundations model…';
  resultEl.classList.add('active');
  setTimeout(() => {
    resultEl.textContent = ALPHA_RESPONSES[Math.floor(Math.random() * ALPHA_RESPONSES.length)];
  }, 1400);
});

const EARTH2_RESPONSES = [
  '► Earth-2 CorrDiff downscaling complete (500× resolution)\n► Precipitation forecast Visayas: 120–185mm/24h · Peak at +18h\n► Flood depth model: 0.8–2.4m inundation across 1,200 km²\n► Storm surge: 3.2–4.8m above MSL · Eastern Leyte coast\n► Model skill score: 91% vs ERA5 reanalysis · Updated 06:00Z',
  '► Earth-2 Medium Range · 15-day ensemble (50 members)\n► Typhoon MALAYA track: 92% confidence within 80km cone\n► Landfall probability: 87% E Visayas · +34±4h\n► Post-landfall: Heavy rain 120h across Mindanao interior\n► Secondary flood risk: 78% confidence Mindanao river basin',
  '► Nowcast 0–6h · Typhoon MALAYA intensifying to Cat 4\n► Rapid intensification detected: +25kt in 6h\n► Eye diameter: 35km · Contracting (high-risk signal)\n► Rainfall maxima: 245mm/h in SW eyewall · Samar Island\n► Alert threshold exceeded: Issue HADR Stage 3 response',
];

document.getElementById('runEarth2Query')?.addEventListener('click', () => {
  const resultEl = document.getElementById('earth2Result');
  if (!resultEl) return;
  resultEl.textContent = '⟳ Running Earth-2 simulation on DGX Cloud…';
  resultEl.classList.add('active');
  setTimeout(() => {
    resultEl.textContent = EARTH2_RESPONSES[Math.floor(Math.random() * EARTH2_RESPONSES.length)];
  }, 1800);
});

// ============================================================
// COLLAPSE PANELS
// ============================================================

document.querySelectorAll('[data-collapse]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.dataset.collapse;
    const body = document.getElementById(`${id}-body`);
    if (body) {
      const isCollapsed = body.style.display === 'none';
      body.style.display = isCollapsed ? 'block' : 'none';
      const icon = btn.querySelector('svg');
      if (icon) {
        icon.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(-90deg)';
      }
    }
  });
});

// ============================================================
// TIMELINE
// ============================================================

const timeHours = [
  '2026-04-16 · 09:00Z',
  '2026-04-17 · 03:00Z',
  '2026-04-17 · 21:00Z',
  '2026-04-18 · 15:00Z',
  '2026-04-19 · 09:00Z (NOW)',
];

const tlSlider = document.getElementById('timelineSlider');
const tlDateEl = document.getElementById('tlDate');
if (tlSlider) {
  tlSlider.addEventListener('input', () => {
    const v = parseInt(tlSlider.value);
    const idx = Math.min(Math.floor(v / 25), timeHours.length - 1);
    if (tlDateEl) tlDateEl.textContent = timeHours[idx];
  });
}

// Timeline event ticks
const tlTrack = document.getElementById('tlEventsTrack');
if (tlTrack) {
  const ticks = [15, 30, 48, 63, 75, 85, 92];
  const cols = ['#ff4757','#ff9f40','#ff4757','#5c9dff','#ff9f40','#ff4757','#3ddc84'];
  ticks.forEach((pos, i) => {
    const tick = document.createElement('div');
    tick.style.cssText = `position:absolute;top:0;left:${pos}%;width:2px;height:4px;background:${cols[i]};border-radius:1px;`;
    tlTrack.appendChild(tick);
  });
}

// Play button animation
let playing = false;
let playInterval = null;
document.getElementById('btnPlayback')?.addEventListener('click', () => {
  playing = !playing;
  const btn = document.getElementById('btnPlayback');
  if (playing) {
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    playInterval = setInterval(() => {
      if (!tlSlider) return;
      const v = parseInt(tlSlider.value);
      if (v >= 100) { tlSlider.value = 0; } else { tlSlider.value = v + 1; }
      tlSlider.dispatchEvent(new Event('input'));
    }, 120);
  } else {
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>';
    clearInterval(playInterval);
  }
});

// ============================================================
// LEAFLET POPUP (inline fix for custom icons)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});

// ============================================================
// SEARCH (basic filter)
// ============================================================

document.getElementById('globalSearch')?.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.event-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = q === '' || text.includes(q) ? '' : 'none';
  });
});

// ============================================================
// RESPONSIVE: init icons again after all DOM ready
// ============================================================
window.addEventListener('load', () => {
  lucide.createIcons();
});
