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
// ============================================================
// ENCOM GLOBE INITIALIZATION
// ============================================================

let globe = null;
let globeAnimating = false;
let globeScale = 1.1;

// Color palette matching SENTINEL ops theme
const GLOBE_COLORS = {
  base: '#003344',         // deep teal hex tiles
  marker: '#00d4ff',       // cyan — HADR events
  pin: '#ff4757',          // red — critical alerts
  satellite: '#3ddc84',    // green — live satellites
};

// Wait for DOM + grid.js to load, then init
function initEncomGlobe() {
  const container = document.getElementById('globe-container');
  if (!container || typeof ENCOM === 'undefined' || typeof grid === 'undefined') {
    setTimeout(initEncomGlobe, 100);
    return;
  }

  // Use window dimensions minus sidebar widths for accurate sizing
  // Left sidebar: 220px, Right sidebar: 300px, header: 48px
  const sidebarLeft = 220;
  const sidebarRight = 300;
  const headerH = 48;
  const w = window.innerWidth - sidebarLeft - sidebarRight;
  const h = window.innerHeight - headerH;

  // Build HADR pin data timed for intro sequence
  const hadrData = EVENTS.map((ev, i) => ({
    lat: ev.lat,
    lng: ev.lng,
    label: ev.type,
    when: 500 + i * 300,
  }));

  globe = new ENCOM.Globe(w, h, {
    font: 'JetBrains Mono, monospace',
    data: hadrData,
    tiles: grid.tiles,
    baseColor: GLOBE_COLORS.base,
    markerColor: GLOBE_COLORS.marker,
    pinColor: GLOBE_COLORS.pin,
    satelliteColor: GLOBE_COLORS.satellite,
    scale: globeScale,
    dayLength: 35000,           // ~40s per rotation
    introLinesDuration: 3000,   // 3s intro animation
    maxPins: 80,
    maxMarkers: 20,
    viewAngle: 0,
  });

  container.appendChild(globe.domElement);

  globe.init(function() {
    // After init: add satellite constellation for live assets
    const liveAssets = ASSETS.filter(a => a.lat && a.status === 'live');
    const constellation = liveAssets.map(a => ({
      lat: a.lat,
      lon: a.lng,
      altitude: 1.8 + Math.random() * 0.4,
    }));
    setTimeout(() => {
      globe.addConstellation(constellation, {
        coreColor: GLOBE_COLORS.satellite,
        numWaves: 3,
      });
    }, 2500);

    // Add HADR event markers
    setTimeout(() => {
      EVENTS.filter(e => e.sev === 'critical').forEach(ev => {
        globe.addMarker(ev.lat, ev.lng, ev.type, true);
      });
      EVENTS.filter(e => e.sev === 'high').forEach(ev => {
        globe.addMarker(ev.lat, ev.lng, ev.type, false);
      });
    }, 1500);

    // Typhoon eye special marker
    setTimeout(() => {
      globe.addPin(11.8, 124.0, 'TYPHOON MALAYA');
    }, 800);

    // Start render loop
    globeAnimating = true;
    animateGlobe();
  });
}

function animateGlobe() {
  if (!globeAnimating) return;
  requestAnimationFrame(animateGlobe);
  if (globe) globe.tick();
}

// Resize handler
function onGlobeResize() {
  if (!globe) return;
  const container = document.getElementById('globe-container');
  if (!container) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  globe.camera.aspect = w / h;
  globe.camera.updateProjectionMatrix();
  globe.renderer.setSize(w, h);
}
window.addEventListener('resize', onGlobeResize, false);

// Map controls wired to globe
document.getElementById('btnZoomIn')?.addEventListener('click', () => {
  if (!globe) return;
  globeScale = Math.min(globeScale + 0.15, 2.5);
  globe.setScale(globeScale);
});
document.getElementById('btnZoomOut')?.addEventListener('click', () => {
  if (!globe) return;
  globeScale = Math.max(globeScale - 0.15, 0.3);
  globe.setScale(globeScale);
});
document.getElementById('btnHome')?.addEventListener('click', () => {
  if (!globe) return;
  globeScale = 1.1;
  globe.setScale(1.1);
});

// Basemap switcher → change globe base color
const globeColorMap = {
  dark: '#003344',
  satellite: '#001a2e',
  topo: '#0a2e0a',
};
document.querySelectorAll('.bm-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.bm-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const bm = btn.dataset.basemap;
    if (globe && globeColorMap[bm]) globe.setBaseColor(globeColorMap[bm]);
  });
});

// 2D/3D toggle — label only (globe is always 3D)
document.querySelectorAll('.map-ctrl-btn[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.map-ctrl-btn[data-view]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Boot the globe
initEncomGlobe();

// ============================================================
// GLOBE LABEL (overlay for selected event focus)
// ============================================================
// Lat/lon focused view: globe.setTarget if API supports, otherwise addMarker highlight

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
  // Highlight on globe: add a temporary bright marker at event location
  if (globe) {
    globe.addPin(ev.lat, ev.lng, ev.type + ' · ' + ev.loc);
  }
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

// ============================================================
// CHINESE SATELLITE MARKETPLACES DATA
// ============================================================

const CHINESE_MARKETPLACES = {
  aggregators: [
    {
      nameEn: 'PIE-Engine Data Marketplace',
      nameCn: '航天宏图 (Piesat)',
      url: 'https://www.pieengine.com/',
      desc: "China's answer to Google Earth Engine — cloud-based processing platform with a massive data marketplace. Search and procure data from domestic satellites (Gaofen, Jilin-1) and international ones. Closest Chinese equivalent to an ImageHunter-style multi-constellation broker.",
      tags: ['agg', 'api', 'opt', 'sar'],
    },
    {
      nameEn: 'Sino Imaging',
      nameCn: '中科星维 (Zhongke Xingwei)',
      url: 'http://www.sinoimaging.com/',
      desc: 'One of the closest functional equivalents to Apollo Mapping. Acts as a premium reseller and aggregator offering tasking and archive services for domestic Chinese satellites and select international ones. Heavy B2B and government focus.',
      tags: ['agg', 'opt', 'hr'],
    },
    {
      nameEn: 'Wuhan Optics Valley Data Exchange',
      nameCn: '光谷卫星数据交易平台',
      url: null,
      desc: "Hosted in Wuhan's Optics Valley — China's largest geospatial industry hub. A literal trading exchange platform where multiple providers list data and users purchase it, aiming to standardize pricing and licensing across the Chinese industry.",
      tags: ['agg', 'opt', 'sar'],
    },
  ],
  operators: [
    {
      nameEn: 'Jilin-1 Data Center',
      nameCn: '吉林一号网 (Changguang CGST)',
      url: 'https://www.jl1.cn/',
      desc: "Operates China's largest commercial constellation (~100+ satellites, similar to Planet/Maxar in scale). The portal features an intuitive archive search with instant preview and online purchasing — the closest China has to a 'Planet Explorer' experience.",
      tags: ['op', 'opt', 'hr', 'api'],
    },
    {
      nameEn: 'Siwei Earth',
      nameCn: '四维地球 (China Siwei / CASC)',
      url: 'http://www.siweiearth.com/',
      desc: 'State-backed but commercially operated (CASC). Operates high-resolution optical and SAR satellites. Sleek, modern portal for searching, viewing, and purchasing data with API access. Strong for precision BDA and urban monitoring.',
      tags: ['op', 'opt', 'sar', 'hr', 'api'],
    },
    {
      nameEn: '21AT Data Portal',
      nameCn: '二十一世纪空间 (Beijing-2/3)',
      url: 'http://www.21at.com.cn/',
      desc: 'Operators of the Beijing-2 and Beijing-3 very-high-resolution satellites. Direct commercial portal for archive search and satellite tasking. Strong for high-res urban change detection.',
      tags: ['op', 'opt', 'hr'],
    },
  ],
  govt: [
    {
      nameEn: 'National Earth Observation Data Center',
      nameCn: '国家对地观测科学数据中心 (NODCC)',
      url: 'https://www.nodcc.cn/',
      desc: 'Primary national repository. Aggregates data from Gaofen (GF) series, Ziyuan (ZY) series, and CBERS. Lower-resolution data is free for registered Chinese researchers; high-resolution commercial data requires formal purchase requests.',
      tags: ['gov', 'opt', 'sar'],
    },
    {
      nameEn: 'Natural Resources Satellite Cloud Platform',
      nameCn: '自然资源卫星遥感云服务平台 (MNR)',
      url: 'http://www.sasclouds.cn/',
      desc: 'Run by the Ministry of Natural Resources. Massive archive of government-owned satellites. Highly searchable but access and purchasing is geared toward institutional users. Key for multi-sensor land monitoring data.',
      tags: ['gov', 'opt'],
    },
    {
      nameEn: 'Wuhan University LIESMARS Hub',
      nameCn: '武汉大学遥感数据平台',
      url: null,
      desc: 'Academic-grade archive maintained by Wuhan University\'s State Key Lab. Provides research access to processed Gaofen and SAR datasets. Useful as a reference/validation data source for AI model training.',
      tags: ['gov', 'opt', 'sar'],
    },
  ],
};

// Render marketplace lists
function renderMarketplaceSection(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  data.forEach(item => {
    const el = document.createElement('div');
    el.className = 'mkt-item';
    const urlHTML = item.url
      ? `<a href="${item.url}" target="_blank" class="mkt-url" rel="noopener">${new URL(item.url).hostname.replace('www.','')}</a>`
      : `<span class="mkt-url no-url">Portal TBC</span>`;
    const tagsHTML = item.tags.map(t => `<span class="mkt-tag ${t}">${t.toUpperCase()}</span>`).join('');
    el.innerHTML = `
      <div class="mkt-item-top">
        <span class="mkt-flag">🇨🇳</span>
        <div class="mkt-names">
          <div class="mkt-name-en">${item.nameEn}</div>
          <div class="mkt-name-cn">${item.nameCn}</div>
        </div>
        ${urlHTML}
      </div>
      <div class="mkt-desc">${item.desc}</div>
      <div class="mkt-tags">${tagsHTML}</div>
    `;
    container.appendChild(el);
  });
}

renderMarketplaceSection(CHINESE_MARKETPLACES.aggregators, 'mktAggregators');
renderMarketplaceSection(CHINESE_MARKETPLACES.operators, 'mktOperators');
renderMarketplaceSection(CHINESE_MARKETPLACES.govt, 'mktGovt');

// ============================================================
// GENAI VENTURE CONCEPTS DATA
// ============================================================

const VENTURES = [
  {
    num: 1,
    title: '"Text-to-Earth" Natural Language Geospatial Broker',
    subtitle: 'Universal LLM-driven interface across multiple satellite marketplaces',
    problem: 'Current satellite marketplaces require specialized knowledge — sensor types, resolution, incidence angles, complex coordinate systems.',
    solution: 'An LLM-driven interface that acts as a universal broker. User types: <strong>"Show me flooding along the Yangtze delta from last week, and task a satellite to monitor the three most likely areas for industrial runoff."</strong> The GenAI translates this into API calls, searches Jilin-1, Siwei, Planet, and tasks new satellites if needed.',
    loop: [
      { label: 'SAT MARKETPLACE', cls: 'mkt', desc: 'Raw imagery supply' },
      { label: 'LLM BROKER', cls: 'ai', desc: 'Intelligent procurement' },
      { label: 'MULTIMODAL OUTPUT', cls: 'phys', desc: 'Clean NL report + visual overlays' },
    ],
    revenue: 'Transaction fees on data purchases · SaaS subscription for AI broker · Premium fees for automated tasking logic',
  },
  {
    num: 2,
    title: '"What-If" Climate & Infrastructure Underwriting Engine',
    subtitle: 'Fuses satellite archives with Earth-2 generative weather for counterfactual risk',
    problem: 'Parametric insurance models rely on historical data, which fails to predict unprecedented compound climate events.',
    solution: 'Pulls historical flood/heat imagery from satellite marketplaces, uses Earth-2 to <strong>generate synthetic meteorological scenarios</strong> (e.g., "What if Typhoon Hato hit 50km further west at high tide?"), then uses GenAI diffusion models to generate synthetic satellite imagery of the resulting damage.',
    loop: [
      { label: 'SAT ARCHIVE', cls: 'mkt', desc: 'Baseline geometry + spectral' },
      { label: 'EARTH-2 PHYSICS', cls: 'phys', desc: 'Atmospheric forcing model' },
      { label: 'GEN DIFFUSION', cls: 'ai', desc: 'Visual/structural impact sim' },
    ],
    revenue: 'API-based pricing per scenario generated · Enterprise SaaS licensing for major reinsurance firms',
  },
  {
    num: 3,
    title: 'Synthetic SAR & Cloud-Penetrating Data Factory',
    subtitle: 'GenAI translates optical to synthetic SAR; sparse SAR removes clouds from optical',
    problem: 'Optical satellite imagery is useless during monsoon season, at night, or through wildfire smoke. SAR is expensive, hard to interpret, and sparse in archive.',
    solution: 'User searches a marketplace for a tropical port image — but it\'s 90% cloud-covered. Platform buys the cheap clouded optical + low-frequency SAR from a different provider. A <strong>generative diffusion model (trained on Earth-2 physics)</strong> fuses them, creating a high-resolution, photorealistic cloud-free image.',
    loop: [
      { label: 'CLOUDED OPTICAL', cls: 'mkt', desc: 'Cheap raw data' },
      { label: 'SPARSE SAR', cls: 'mkt', desc: 'Cloud-penetrating radar' },
      { label: 'GEN RESTORER', cls: 'ai', desc: 'Premium synthetic clear output' },
    ],
    revenue: 'Selling premium "synthetic clear" imagery at markup over raw clouded data. Cost is only compute — massive margins.',
  },
  {
    num: 4,
    title: 'Predictive Supply Chain & Commodity "Shadow" Tracker',
    subtitle: 'Simulates future supply chain states from satellite observations + weather forecasts',
    problem: 'Financial firms want economic indicators before official reports. They count ships/oil tanks today — but this only tells them the present.',
    solution: 'Buys wide-swath satellite imagery to count vessels at major ports. Feeds into an LLM alongside Earth-2\'s 10-day weather forecasts. GenAI simulates the next two weeks: <strong>"Based on current port queues and the Earth-2 typhoon forecast closing Shanghai for 3 days, here is the iron ore supply disruption scenario."</strong>',
    loop: [
      { label: 'SAT COUNTS', cls: 'mkt', desc: 'Ships, crops, oil tanks' },
      { label: 'EARTH-2 WX', cls: 'phys', desc: 'Physics-informed forecast' },
      { label: 'LLM SIMULATOR', cls: 'ai', desc: 'Forward-projected intelligence' },
    ],
    revenue: 'High-ticket hedge fund subscriptions · Per-query intelligence reports',
  },
  {
    num: 5,
    title: 'Automated "Future-State" Urban & Energy Planner',
    subtitle: 'Text prompt → satellite DEM/spectral data → physically-accurate 20-year climate sim',
    problem: 'Urban planners and renewable energy developers struggle to visualize how infrastructure will interact with a changing climate over 20 years.',
    solution: '<strong>Developer prompts:</strong> "Simulate the shading and microclimate impact of a 50MW solar farm in Inner Mongolia over the next decade, factoring in Earth-2 sandstorm predictions." Platform buys DEM + multispectral soil data from a marketplace, overlays AI-generated 3D solar panels, uses Earth-2 to simulate how panels alter local albedo and withstand future sandstorms.',
    loop: [
      { label: 'DEM + MS DATA', cls: 'mkt', desc: 'Terrain + soil from marketplace' },
      { label: 'GEN 3D DESIGN', cls: 'ai', desc: 'Proposed infrastructure sim' },
      { label: 'EARTH-2 CLIMATE', cls: 'phys', desc: '20yr interaction forecast' },
    ],
    revenue: 'SaaS subscription for engineering/architectural firms · Pay-per-compute-hour for heavy Earth-2 simulations',
  },
];

// Render venture cards
const ventureListEl = document.getElementById('ventureList');
if (ventureListEl) {
  VENTURES.forEach(v => {
    const card = document.createElement('div');
    card.className = 'venture-card';
    card.dataset.testid = `venture-card-${v.num}`;

    const loopHTML = v.loop.map((l, i) => `
      <span class="vc-loop-item ${l.cls}" title="${l.desc}">${l.label}</span>
      ${i < v.loop.length - 1 ? '<span class="vc-loop-arrow">→</span>' : ''}
    `).join('');

    card.innerHTML = `
      <div class="vc-header">
        <div class="vc-num">${v.num}</div>
        <div class="vc-titles">
          <div class="vc-title">${v.title}</div>
          <div class="vc-subtitle">${v.subtitle}</div>
        </div>
        <i data-lucide="chevron-down" class="icon-xs vc-chevron"></i>
      </div>
      <div class="vc-body">
        <div class="vc-section">
          <div class="vc-section-label">THE PROBLEM</div>
          <p>${v.problem}</p>
        </div>
        <div class="vc-section">
          <div class="vc-section-label">THE SOLUTION</div>
          <p>${v.solution}</p>
        </div>
        <div class="vc-section">
          <div class="vc-section-label">GENAI ↔ MARKETPLACE LOOP</div>
          <div class="vc-loop-row">${loopHTML}</div>
        </div>
        <div class="vc-revenue">
          <span class="vc-revenue-label">REV</span>
          <p>${v.revenue}</p>
        </div>
      </div>
    `;

    // Toggle expand
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
      lucide.createIcons();
    });

    ventureListEl.appendChild(card);
  });
  lucide.createIcons();
}
