import {
  AO_CENTER, AO_BOUNDS, redEmitters, blueAssets, jammingFootprints, lobs,
  coverage, zones, aiFeed, coas, effectsSeq,
  cyberEvents, cyberNodes, cyberLinks,
  satellites, satTracks, satFootprints,
  gpsSpoofZones, multiDomainTimeline,
} from './scenario.js';

// ============================================================
// 0. UTILITIES
// ============================================================
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

function toast({ title, desc, kind = '' }) {
  const el = document.createElement('div');
  el.className = `toast ${kind ? 'toast-' + kind : ''}`;
  el.innerHTML = `<div class="toast-title">${title}</div>${desc ? `<div class="toast-desc">${desc}</div>` : ''}`;
  $('#toaster').appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = 0; el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 300);
  }, 4200);
}

// circle polygon in GeoJSON
function geoCircle([lon, lat], radiusKm, points = 64) {
  const coords = [];
  const earthR = 6371;
  const latR = (radiusKm / earthR) * (180 / Math.PI);
  const lonR = latR / Math.cos((lat * Math.PI) / 180);
  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * 2 * Math.PI;
    coords.push([lon + lonR * Math.cos(theta), lat + latR * Math.sin(theta)]);
  }
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] } };
}

// ============================================================
// 1. CLOCK (Zulu)
// ============================================================
function tickClock() {
  const d = new Date();
  const z = d.toISOString().slice(11, 19) + 'Z';
  $('#zulu').textContent = z;

  // countdown T-clock
  const secs = 4 * 60 + 12 - Math.floor(Date.now() / 1000) % (60);
  const mm = String(Math.max(0, Math.floor(secs / 60))).padStart(2, '0');
  const ss = String(Math.max(0, secs % 60)).padStart(2, '0');
  const sc = $('#seq-clock');
  if (sc) sc.textContent = `T-00:${mm}:${ss}`;
}
setInterval(tickClock, 1000); tickClock();

// ============================================================
// 2. THEME TOGGLE
// ============================================================
$('#theme-toggle').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  // re-style map on theme change
  if (window._map) window._map.setStyle(buildMapStyle());
});

// ============================================================
// 3. MAP (MapLibre, no external tiles — custom vector from CDN)
//    We use a free CARTO dark style as base — no API key needed.
// ============================================================
import maplibregl from 'https://esm.sh/maplibre-gl@4.7.1?target=es2020';

function buildMapStyle() {
  const theme = document.documentElement.getAttribute('data-theme');
  const light = theme === 'light';
  // Use CARTO basemap (free, no key)
  const base = light
    ? 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
  return base;
}

const map = new maplibregl.Map({
  container: 'map',
  style: buildMapStyle(),
  center: AO_CENTER,
  zoom: 6.5,
  pitch: 0,
  bearing: 0,
  attributionControl: { compact: true },
  maxZoom: 14,
  minZoom: 4,
});
window._map = map;
map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

// ============================================================
// 4. ADD OPERATIONAL LAYERS when style ready
// ============================================================
function addOpsLayers() {
  // --- COVERAGE (faint blue rings) ---
  map.addSource('coverage', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: coverage.map(c => ({
        ...geoCircle([c.lon, c.lat], c.radiusKm),
        properties: { id: c.id },
      })),
    },
  });
  map.addLayer({
    id: 'coverage-fill', type: 'fill', source: 'coverage',
    paint: { 'fill-color': '#3d8bff', 'fill-opacity': 0.04 },
  });
  map.addLayer({
    id: 'coverage-line', type: 'line', source: 'coverage',
    paint: { 'line-color': '#3d8bff', 'line-opacity': 0.25, 'line-width': 1, 'line-dasharray': [3, 3] },
  });

  // --- JAMMING FOOTPRINTS (magenta bubble) ---
  map.addSource('jamming', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: jammingFootprints.map(j => ({
        ...geoCircle([j.lon, j.lat], j.radiusKm),
        properties: { emitterId: j.emitterId, label: j.label },
      })),
    },
  });
  map.addLayer({
    id: 'jamming-fill', type: 'fill', source: 'jamming',
    paint: {
      'fill-color': '#ff5aa8', 'fill-opacity': 0.10,
    },
  });
  map.addLayer({
    id: 'jamming-line', type: 'line', source: 'jamming',
    paint: { 'line-color': '#ff5aa8', 'line-opacity': 0.5, 'line-width': 1.2, 'line-dasharray': [1, 2] },
  });

  // --- JCEWL / JRFL zones ---
  map.addSource('zones', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: zones.map(z => ({
        type: 'Feature',
        properties: { name: z.name, type: z.type },
        geometry: { type: 'Polygon', coordinates: [z.polygon] },
      })),
    },
  });
  const zoneColor = ['match', ['get', 'type'],
    'guarded', '#a97af5',
    'taboo', '#ff4757',
    'protected', '#47e0e7',
    '#a97af5'];
  map.addLayer({
    id: 'zones-fill', type: 'fill', source: 'zones',
    layout: { visibility: 'none' },
    paint: { 'fill-color': zoneColor, 'fill-opacity': 0.06 },
  });
  map.addLayer({
    id: 'zones-line', type: 'line', source: 'zones',
    layout: { visibility: 'none' },
    paint: { 'line-color': zoneColor, 'line-width': 1.4, 'line-opacity': 0.7, 'line-dasharray': [2, 2] },
  });

  // --- LOBs / SIGINT cuts (cyan) ---
  map.addSource('lobs', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: lobs.map(l => ({
        type: 'Feature',
        properties: { id: l.id, emitter: l.emitter, platform: l.platform },
        geometry: { type: 'LineString', coordinates: [l.from, l.target] },
      })),
    },
  });
  map.addLayer({
    id: 'lobs-line', type: 'line', source: 'lobs',
    paint: { 'line-color': '#47e0e7', 'line-width': 1.1, 'line-opacity': 0.55, 'line-dasharray': [2, 2] },
  });

  // --- AO graticule ---
  const grat = [];
  for (let lon = 19; lon <= 28; lon++) grat.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[lon, 52], [lon, 57]] }, properties: {} });
  for (let lat = 52; lat <= 57; lat++) grat.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[19, lat], [28, lat]] }, properties: {} });
  map.addSource('graticule', { type: 'geojson', data: { type: 'FeatureCollection', features: grat } });
  map.addLayer({ id: 'graticule-line', type: 'line', source: 'graticule',
    paint: { 'line-color': '#3d8bff', 'line-opacity': 0.06, 'line-width': 0.5 } });

  // --- AO frame ---
  map.addSource('ao', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[
        [AO_BOUNDS[0][0], AO_BOUNDS[0][1]], [AO_BOUNDS[1][0], AO_BOUNDS[0][1]],
        [AO_BOUNDS[1][0], AO_BOUNDS[1][1]], [AO_BOUNDS[0][0], AO_BOUNDS[1][1]],
        [AO_BOUNDS[0][0], AO_BOUNDS[0][1]],
      ]] },
    },
  });
  map.addLayer({
    id: 'ao-line', type: 'line', source: 'ao',
    paint: { 'line-color': '#3d8bff', 'line-width': 1.5, 'line-dasharray': [4, 2], 'line-opacity': 0.6 },
  });
}

// ============================================================
// 5. HTML MARKERS for emitters and blue assets
// ============================================================
const redMarkers = new Map();
const blueMarkers = new Map();

function emitterGlyph(e) {
  if (e.threat.includes('GNSS')) return 'G';
  if (e.threat.includes('SATCOM')) return 'K';
  if (e.threat.includes('Jammer') || e.threat.includes('EW')) return 'J';
  if (e.threat.includes('OTH')) return 'O';
  if (e.threat.includes('CB') || e.threat.includes('Counter')) return 'C';
  if (e.classification === 'UNKNOWN') return '?';
  return 'R';
}

function blueGlyph(a) {
  if (a.type === 'aircraft') return '▲';
  if (a.type === 'ship') return '▬';
  if (a.type === 'space') return '✦';
  return '■';
}

function buildEmitterPopup(e) {
  return `
    <div class="popup">
      <div class="popup-head">
        <span class="popup-tag ${e.classification === 'UNKNOWN' ? 'amber' : 'red'}">${e.classification}</span>
        <span class="popup-title">${e.callsign} · ${e.id}</span>
      </div>
      <div class="popup-grid">
        <span class="k">NEDB</span><span class="v">${e.nedb}</span>
        <span class="k">Role</span><span class="v">${e.role}</span>
        <span class="k">Freq</span><span class="v">${e.freqMHz} MHz</span>
        <span class="k">PRF</span><span class="v">${e.prfHz || '—'} Hz</span>
        <span class="k">PW</span><span class="v">${e.pw_us || '—'} µs</span>
        <span class="k">SNR</span><span class="v">${e.snr_db} dB</span>
        <span class="k">LOB</span><span class="v">${e.lob}°</span>
        <span class="k">Conf.</span><span class="v">${(e.confidence * 100).toFixed(0)}%</span>
      </div>
      <div class="popup-actions">
        <button data-action="inspect" data-id="${e.id}">Inspect</button>
        <button data-action="task" data-id="${e.id}">Task ES</button>
        <button data-action="coa" data-id="${e.id}">Suggest COA</button>
      </div>
    </div>`;
}

function buildBluePopup(a) {
  return `
    <div class="popup">
      <div class="popup-head">
        <span class="popup-tag blue">${a.type.toUpperCase()}</span>
        <span class="popup-title">${a.name}</span>
      </div>
      <div class="popup-grid">
        <span class="k">Asset</span><span class="v">${a.asset}</span>
        <span class="k">Role</span><span class="v">${a.role}</span>
        <span class="k">Cap.</span><span class="v">${a.capability}</span>
        <span class="k">Band</span><span class="v">${a.band}</span>
        <span class="k">Status</span><span class="v">${a.status}</span>
        ${a.fuel_min ? `<span class="k">Fuel</span><span class="v">${a.fuel_min} min</span>` : ''}
      </div>
    </div>`;
}

function addMarkers() {
  redEmitters.forEach(e => {
    const el = document.createElement('div');
    el.className = `marker red ${e.isNew ? 'new' : ''}`;
    el.innerHTML = `<span class="m-glyph">${emitterGlyph(e)}</span>`;
    const m = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([e.lon, e.lat])
      .setPopup(new maplibregl.Popup({ closeButton: true, offset: 14 }).setHTML(buildEmitterPopup(e)))
      .addTo(map);
    el.addEventListener('click', () => { selectEmitter(e); });
    redMarkers.set(e.id, m);
  });
  blueAssets.forEach(a => {
    const el = document.createElement('div');
    el.className = 'marker blue';
    el.innerHTML = `<span class="m-glyph">${blueGlyph(a)}</span>`;
    const m = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([a.lon, a.lat])
      .setPopup(new maplibregl.Popup({ closeButton: true, offset: 14 }).setHTML(buildBluePopup(a)))
      .addTo(map);
    blueMarkers.set(a.id, m);
  });
  $('#count-red').textContent = redEmitters.length;
  $('#count-blue').textContent = blueAssets.length;
}

// Popup delegate
document.body.addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const e = redEmitters.find(x => x.id === id);
  if (!e) return;
  if (btn.dataset.action === 'inspect') selectEmitter(e);
  if (btn.dataset.action === 'task') {
    toast({ kind: 'green', title: `ES tasking submitted · ${e.callsign}`, desc: `Assigned to RC-135V RIVET JOINT. Cut within 4 min.` });
  }
  if (btn.dataset.action === 'coa') {
    activateRTab('plan');
    $('#intent').value = `Generate a COA to suppress emitter ${e.callsign} (${e.nedb}) while preserving civil EMS and allied SATCOM.`;
    toast({ title: 'Planner primed', desc: `Context loaded for ${e.callsign}. Click Generate COAs.` });
  }
});

// ============================================================
// 5b. CYBER + SPACE MAP OVERLAYS (MapLibre)
// ============================================================
const cyberNodeMarkers = new Map();
const gpsSpoofMarkers = new Map();
const satMarkers = new Map();
let satAnim = 0;

function addCyberSpaceLayers() {
  // --- Cyber links (polylines) ---
  const linkFeatures = cyberLinks.map(l => {
    const a = cyberNodes.find(n => n.id === l.from);
    const b = cyberNodes.find(n => n.id === l.to);
    if (!a || !b) return null;
    return {
      type: 'Feature',
      properties: { sev: l.sev, stage: l.stage },
      geometry: { type: 'LineString', coordinates: [[a.lon, a.lat], [b.lon, b.lat]] },
    };
  }).filter(Boolean);

  map.addSource('cyber-links', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: linkFeatures },
  });
  map.addLayer({
    id: 'cyber-links-line', type: 'line', source: 'cyber-links',
    paint: {
      'line-color': ['match', ['get', 'sev'], 'red', '#ff4757', 'amber', '#ffb020', '#00ff9d'],
      'line-width': 1.2, 'line-opacity': 0.6, 'line-dasharray': [1, 3],
    },
  });

  // --- GPS spoof zones (polygons) ---
  map.addSource('gps-spoof-zones', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: gpsSpoofZones.map(g => ({
        ...geoCircle([g.lon, g.lat], g.radiusKm),
        properties: { id: g.id, conf: g.confidence },
      })),
    },
  });
  map.addLayer({
    id: 'gps-spoof-fill', type: 'fill', source: 'gps-spoof-zones',
    paint: { 'fill-color': '#ffa350', 'fill-opacity': 0.09 },
  });
  map.addLayer({
    id: 'gps-spoof-line', type: 'line', source: 'gps-spoof-zones',
    paint: { 'line-color': '#ffa350', 'line-width': 1.4, 'line-opacity': 0.55, 'line-dasharray': [3, 2] },
  });
  // Offset lines showing where GPS "claims" the position to be
  map.addSource('gps-spoof-drift', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: gpsSpoofZones.map(g => ({
        type: 'Feature',
        properties: { id: g.id },
        geometry: { type: 'LineString', coordinates: [[g.lon, g.lat], [g.spoofCoord[1], g.spoofCoord[0]]] },
      })),
    },
  });
  map.addLayer({
    id: 'gps-spoof-drift-line', type: 'line', source: 'gps-spoof-drift',
    paint: {
      'line-color': '#ffa350', 'line-width': 1.2, 'line-opacity': 0.9,
      'line-dasharray': [1, 1],
    },
  });

  // --- Satellite ground tracks (polylines) ---
  const trackFeatures = satellites.filter(s => satTracks[s.id]).map(s => ({
    type: 'Feature',
    properties: { id: s.id, name: s.name },
    geometry: { type: 'LineString', coordinates: satTracks[s.id] },
  }));
  map.addSource('sat-tracks', { type: 'geojson', data: { type: 'FeatureCollection', features: trackFeatures } });
  map.addLayer({
    id: 'sat-tracks-line', type: 'line', source: 'sat-tracks',
    paint: { 'line-color': '#bf7fff', 'line-width': 1.0, 'line-opacity': 0.55, 'line-dasharray': [2, 1] },
  });

  // --- Satellite coverage footprints ---
  map.addSource('sat-footprint', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: satFootprints.map(f => ({
        ...geoCircle([f.lon, f.lat], f.radiusKm),
        properties: { id: f.id },
      })),
    },
  });
  map.addLayer({
    id: 'sat-footprint-fill', type: 'fill', source: 'sat-footprint',
    layout: { visibility: 'none' },
    paint: { 'fill-color': '#bf7fff', 'fill-opacity': 0.04 },
  });
  map.addLayer({
    id: 'sat-footprint-line', type: 'line', source: 'sat-footprint',
    layout: { visibility: 'none' },
    paint: { 'line-color': '#bf7fff', 'line-width': 1, 'line-opacity': 0.4, 'line-dasharray': [4, 2] },
  });
}

function addCyberSpaceMarkers() {
  // Cyber network nodes
  cyberNodes.forEach(n => {
    const el = document.createElement('div');
    const kindClass = n.kind === 'compromised' ? 'compromised' : n.kind === 'c2-hostile' ? 'hostile' : '';
    el.className = `cyber-node ${kindClass}`;
    el.innerHTML = n.kind === 'compromised' ? '!' : n.kind === 'c2-hostile' ? 'X' : 'N';
    el.title = `${n.id} · ${n.name}`;
    const m = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([n.lon, n.lat])
      .setPopup(new maplibregl.Popup({ closeButton: true, offset: 14 }).setHTML(`
        <div class="popup">
          <div class="popup-head">
            <span class="popup-tag ${n.kind === 'compromised' ? 'red' : n.kind === 'c2-hostile' ? 'red' : 'blue'}">${n.kind.toUpperCase().replace('C2-', '')}</span>
            <span class="popup-title">${n.name}</span>
          </div>
          <div class="popup-grid">
            <span class="k">ID</span><span class="v">${n.id}</span>
            <span class="k">Status</span><span class="v">${n.status}</span>
            <span class="k">Lat/Lon</span><span class="v">${n.lat.toFixed(2)}, ${n.lon.toFixed(2)}</span>
          </div>
          <div class="popup-actions">
            <button data-action="cyber" data-id="${n.id}">Review in Cyber panel</button>
          </div>
        </div>
      `))
      .addTo(map);
    el.addEventListener('click', () => { activateRTab('cysp'); });
    cyberNodeMarkers.set(n.id, m);
  });
  $('#count-cyber').textContent = cyberNodes.length;

  // GPS spoof markers (at centre of denial zone)
  gpsSpoofZones.forEach(g => {
    const el = document.createElement('div');
    el.className = 'gps-spoof-marker';
    el.title = `${g.id} · GPS spoof (${(g.confidence*100).toFixed(0)}%)`;
    const m = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([g.lon, g.lat])
      .addTo(map);
    gpsSpoofMarkers.set(g.id, m);
  });

  // Satellite position markers (LEO only — animate along track)
  satellites.filter(s => satTracks[s.id] && s.altKm < 2000).forEach(s => {
    const el = document.createElement('div');
    el.className = 'sat-marker';
    el.title = `${s.name} · ${s.altKm} km`;
    const track = satTracks[s.id];
    const [lon, lat] = track[Math.floor(track.length / 2)];
    const m = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([lon, lat])
      .setPopup(new maplibregl.Popup({ closeButton: true, offset: 14 }).setHTML(`
        <div class="popup">
          <div class="popup-head">
            <span class="popup-tag" style="background:rgba(191,127,255,.15); color:#bf7fff">SPACE</span>
            <span class="popup-title">${s.name}</span>
          </div>
          <div class="popup-grid">
            <span class="k">Operator</span><span class="v">${s.operator}</span>
            <span class="k">Altitude</span><span class="v">${s.altKm} km</span>
            <span class="k">Inclination</span><span class="v">${s.incDeg}°</span>
            <span class="k">Purpose</span><span class="v">${s.purpose}</span>
            <span class="k">AOS → LOS</span><span class="v">${s.aos} → ${s.los}</span>
            <span class="k">Tasking</span><span class="v">${s.tasked}</span>
          </div>
        </div>
      `))
      .addTo(map);
    satMarkers.set(s.id, m);
  });

  // Animate LEO sats along their tracks
  function animateSats() {
    satAnim += 0.001;
    satMarkers.forEach((marker, id) => {
      const track = satTracks[id];
      if (!track || track.length < 2) return;
      const t = ((satAnim) % 1);
      const idx = Math.floor(t * (track.length - 1));
      const frac = t * (track.length - 1) - idx;
      const a = track[idx], b = track[Math.min(idx + 1, track.length - 1)];
      const lon = a[0] + (b[0] - a[0]) * frac;
      const lat = a[1] + (b[1] - a[1]) * frac;
      marker.setLngLat([lon, lat]);
    });
    requestAnimationFrame(animateSats);
  }
  requestAnimationFrame(animateSats);
}

// ============================================================
// 6. LAYER TOGGLES
// ============================================================
// Each entry can have `markers` (Map of MapLibre markers) and/or `layers` (array of layer IDs).
const layerMap = {
  'red-emitters': { markers: () => redMarkers },
  'blue-assets':  { markers: () => blueMarkers },
  'sigint':       { layers: ['lobs-line'] },
  'jamming':      { layers: ['jamming-fill', 'jamming-line'] },
  'coverage':     { layers: ['coverage-fill', 'coverage-line'] },
  'jcewl':        { layers: ['zones-fill', 'zones-line'] },
  'fsa':          { layers: [] },
  'heatmap':      { layers: [] },
  'cyber-nodes':  { markers: () => cyberNodeMarkers },
  'cyber-links':  { layers: ['cyber-links-line'] },
  'gps-spoof':    { markers: () => gpsSpoofMarkers, layers: ['gps-spoof-fill', 'gps-spoof-line', 'gps-spoof-drift-line'] },
  'sat-tracks':   { markers: () => satMarkers, layers: ['sat-tracks-line'] },
  'sat-footprint':{ layers: ['sat-footprint-fill', 'sat-footprint-line'] },
};

$$('#layer-list input[type=checkbox]').forEach(cb => {
  cb.addEventListener('change', () => {
    const key = cb.dataset.layer;
    const vis = cb.checked ? 'visible' : 'none';
    const entry = layerMap[key];
    if (!entry) return;
    if (entry.layers) {
      entry.layers.forEach(lid => { if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', vis); });
    }
    if (entry.markers) {
      entry.markers().forEach(m => m.getElement().style.display = cb.checked ? '' : 'none');
    }
  });
});

// ============================================================
// 7. NEDB search list
// ============================================================
const nedbList = $('#nedb-list');
function renderNedb(filter = '') {
  const q = filter.toLowerCase();
  nedbList.innerHTML = '';
  redEmitters
    .filter(e => !q || e.nedb.toLowerCase().includes(q) || e.callsign.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))
    .forEach(e => {
      const li = document.createElement('li');
      li.className = 'nedb-item';
      const color = e.classification === 'UNKNOWN' ? 'var(--accent-amber)' : 'var(--accent-red)';
      li.innerHTML = `
        <span class="nedb-dot" style="background:${color}; color:${color}"></span>
        <div class="nedb-meta">
          <div class="nedb-name">${e.callsign}</div>
          <div class="nedb-sub">${e.nedb} · ${e.freqMHz} MHz</div>
        </div>
        <span class="nedb-conf">${(e.confidence * 100).toFixed(0)}%</span>
      `;
      li.addEventListener('click', () => {
        selectEmitter(e);
        map.flyTo({ center: [e.lon, e.lat], zoom: 9, speed: 1.2 });
      });
      nedbList.appendChild(li);
    });
}
$('#emitter-search').addEventListener('input', e => renderNedb(e.target.value));

// ============================================================
// 8. ENTITY INSPECTOR
// ============================================================
function selectEmitter(e) {
  $$('#nedb-list .nedb-item').forEach(li => li.classList.remove('active'));
  const i = redEmitters.indexOf(e);
  const items = $$('#nedb-list .nedb-item');
  if (items[i]) items[i].classList.add('active');

  activateRTab('entity');
  const empty = $('#entity-empty');
  const detail = $('#entity-detail');
  empty.hidden = true; detail.hidden = false;

  detail.innerHTML = `
    <div class="entity-hero">
      <div class="entity-class">
        <span class="live-dot" style="background:var(--accent-red); box-shadow:0 0 8px var(--accent-red)"></span>
        ${e.classification} · PRIORITY ${e.confidence > 0.9 ? '1' : e.confidence > 0.75 ? '2' : '3'}
      </div>
      <div class="entity-name">${e.callsign}</div>
      <div class="entity-callsign">${e.id} · NEDB: ${e.nedb}</div>
      <div class="entity-params">
        <div class="param"><span class="param-label">Frequency</span><span class="param-value">${e.freqMHz} MHz</span></div>
        <div class="param"><span class="param-label">PRF</span><span class="param-value">${e.prfHz || '—'} Hz</span></div>
        <div class="param"><span class="param-label">Pulse width</span><span class="param-value">${e.pw_us || '—'} µs</span></div>
        <div class="param"><span class="param-label">Pattern</span><span class="param-value">${e.pattern}</span></div>
        <div class="param"><span class="param-label">SNR</span><span class="param-value">${e.snr_db} dB</span></div>
        <div class="param"><span class="param-label">LOB</span><span class="param-value">${e.lob}°</span></div>
        <div class="param"><span class="param-label">First seen</span><span class="param-value">${e.firstSeen}</span></div>
        <div class="param"><span class="param-label">Confidence</span><span class="param-value">${(e.confidence * 100).toFixed(0)}%</span></div>
      </div>
    </div>

    <div class="fingerprint">
      <div class="fp-title">RF fingerprint · PDW burst (2.4s)</div>
      <canvas class="fp-canvas" id="fp-canvas"></canvas>
    </div>

    <div class="ai-section">
      <div class="ai-section-title">AI attribution</div>
      <div class="coa" style="margin-top:4px">
        <div class="coa-body" style="padding:10px 12px">
          <div class="rationale">${e.notes}</div>
          <div class="coa-pros" style="margin-top:8px">
            <div>
              <h6>Recommended COAs</h6>
              <ul>${e.coa.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="entity-actions">
      <button class="btn" data-act="task">Task collection</button>
      <button class="btn btn-primary" data-act="plan">Build COA</button>
    </div>
  `;
  drawFingerprint(e);

  // action buttons
  detail.querySelector('[data-act="task"]').addEventListener('click', () => {
    toast({ kind: 'green', title: `ES tasking submitted`, desc: `${e.callsign} assigned to nearest SIGINT asset.` });
  });
  detail.querySelector('[data-act="plan"]').addEventListener('click', () => {
    activateRTab('plan');
    $('#intent').value = `Suppress emitter ${e.callsign} (${e.nedb}) at ${e.freqMHz} MHz. Preserve civil EMS and allied SATCOM.`;
  });

  // highlight on map
  redMarkers.forEach(m => m.getElement().style.filter = '');
  const m = redMarkers.get(e.id);
  if (m) {
    m.getElement().style.filter = 'drop-shadow(0 0 12px var(--accent-red))';
    map.flyTo({ center: [e.lon, e.lat], zoom: Math.max(map.getZoom(), 8), speed: 0.8 });
  }
}

function drawFingerprint(e) {
  const canvas = $('#fp-canvas');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr; canvas.height = 80 * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, 80);

  // Simulated pulse train
  const cs = getComputedStyle(document.documentElement);
  const accent = cs.getPropertyValue('--accent').trim() || '#3d8bff';
  const red = cs.getPropertyValue('--accent-red').trim() || '#ff4757';
  ctx.strokeStyle = accent; ctx.lineWidth = 1;
  ctx.beginPath();
  let x = 0;
  const period = e.prfHz ? 8 + (2400 / e.prfHz) : 18;
  while (x < rect.width) {
    // noise floor
    for (let i = 0; i < period - 2; i++) {
      const y = 70 - Math.random() * 5;
      ctx.lineTo(x + i, y);
    }
    // pulse
    ctx.lineTo(x + period - 2, 70);
    ctx.lineTo(x + period - 1, 10 + Math.random() * 15);
    ctx.lineTo(x + period, 10 + Math.random() * 15);
    ctx.lineTo(x + period + 1, 70);
    x += period + 2;
  }
  ctx.stroke();

  // Frequency markers
  ctx.fillStyle = red;
  ctx.font = '10px var(--font-mono)';
  ctx.fillText(`${e.freqMHz} MHz`, 8, 14);
  if (e.prfHz) ctx.fillText(`PRF ${e.prfHz} Hz`, 8, 28);
}

// ============================================================
// 9. AI FEED
// ============================================================
function renderAiFeed() {
  const ul = $('#ai-feed');
  ul.innerHTML = '';
  aiFeed.forEach(f => {
    const li = document.createElement('li');
    li.className = `sev-${f.sev}`;
    li.innerHTML = `
      <div class="ai-feed-head">
        <span>${f.t}</span>
        <span>${f.emitter}</span>
      </div>
      <div class="ai-feed-title">${f.title}</div>
      <div class="ai-feed-sub">${f.body}</div>
    `;
    li.addEventListener('click', () => {
      const e = redEmitters.find(x => x.id === f.emitter);
      if (e) { selectEmitter(e); }
    });
    ul.appendChild(li);
  });
}

$('#ai-send').addEventListener('click', () => {
  const q = $('#ai-input').value.trim();
  if (!q) return;
  toast({ title: 'AI analyst reply', desc: 'Context: 31 active emitters, 6 high-priority. See feed for refined narrative.' });
  $('#ai-input').value = '';
});
$$('.ai-chips .chip').forEach(c => c.addEventListener('click', () => {
  $('#ai-input').value = c.textContent;
  $('#ai-input').focus();
}));

// ============================================================
// 10. THREAT RIBBON (live stream, simulated)
// ============================================================
const ribbonItems = [
  { t: 'now', desc: 'New track: R-05 frequency-agile, PRF jitter', freq: '5600 MHz', sev: 'medium' },
  { t: '−00:32', desc: 'R-44 EA power +6 dB · X-band', freq: '8.0 GHz', sev: 'high' },
  { t: '−01:12', desc: 'GPS L1 denial expanding · POLE-21', freq: '1.575 GHz', sev: 'high' },
  { t: '−02:08', desc: 'TIRADA-2 Ku-band uplink jam', freq: '12.4 GHz', sev: 'medium' },
  { t: '−04:44', desc: 'Silent Sentry passive correlation · R-12', freq: '8.4 GHz', sev: 'low' },
  { t: '−06:21', desc: 'HE360 TDOA cut refined · R-73', freq: 'Ku', sev: 'low' },
  { t: '−08:03', desc: 'OTH sweep R-08 · HF', freq: '7.5 MHz', sev: 'medium' },
  { t: '−10:15', desc: 'R-21 LEER-3 BTS spoofing', freq: '900 MHz', sev: 'medium' },
];

function renderRibbon() {
  const track = $('#ribbon-track');
  track.innerHTML = '';
  ribbonItems.forEach(r => {
    const d = document.createElement('div');
    d.className = `rib-item sev-${r.sev === 'high' ? 'high' : r.sev}`;
    d.innerHTML = `
      <span class="rib-time">${r.t}</span>
      <span class="rib-desc">${r.desc}</span>
      <span class="rib-freq">${r.freq}</span>
    `;
    track.appendChild(d);
  });
}

// ============================================================
// 11. WATERFALL (canvas)
// ============================================================
function initWaterfall() {
  const canvas = $('#waterfall');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 90 * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', () => { const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = 90 * dpr; ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr); });

  const rect = () => canvas.getBoundingClientRect();

  // Pre-place emitter markers across frequency
  const bands = [
    { mhz: 7.5, label: 'HF', x: 0.02 },
    { mhz: 100, label: 'VHF', x: 0.08 },
    { mhz: 900, label: 'UHF', x: 0.20 },
    { mhz: 1575, label: 'L', x: 0.32 },
    { mhz: 2950, label: 'S', x: 0.45 },
    { mhz: 3100, label: 'S', x: 0.48 },
    { mhz: 5600, label: 'C', x: 0.58 },
    { mhz: 8000, label: 'X', x: 0.68 },
    { mhz: 8400, label: 'X', x: 0.72 },
    { mhz: 12400, label: 'Ku', x: 0.86 },
  ];

  let frame = 0;

  function tick() {
    const r = rect();
    const w = r.width, h = 90;
    // shift down
    const img = ctx.getImageData(0, 0, w * dpr, (h - 1) * dpr);
    ctx.putImageData(img, 0, 1 * dpr);

    // New top line: emit noise floor
    const lineData = ctx.createImageData(w * dpr, 1 * dpr);
    for (let x = 0; x < w * dpr; x++) {
      const noise = Math.floor(Math.random() * 8);
      const i = x * 4;
      lineData.data[i] = 4 + noise;
      lineData.data[i + 1] = 7 + noise;
      lineData.data[i + 2] = 14 + noise;
      lineData.data[i + 3] = 255;
    }
    // Paint emitter bands
    bands.forEach((b, i) => {
      const intensity = 0.55 + 0.4 * Math.sin(frame / 13 + i * 0.7);
      const px = Math.floor(b.x * w * dpr);
      const width = 10 + Math.floor(Math.random() * 20);
      const [rC, gC, bC] = i % 3 === 0 ? [255, 71, 87] : i % 3 === 1 ? [255, 176, 32] : [71, 224, 231];
      for (let dx = -width; dx <= width; dx++) {
        const x = px + dx;
        if (x < 0 || x >= w * dpr) continue;
        const fall = Math.max(0, 1 - Math.abs(dx) / width);
        const a = fall * intensity;
        const idx = x * 4;
        lineData.data[idx] = Math.min(255, lineData.data[idx] + rC * a);
        lineData.data[idx + 1] = Math.min(255, lineData.data[idx + 1] + gC * a);
        lineData.data[idx + 2] = Math.min(255, lineData.data[idx + 2] + bC * a);
      }
    });
    ctx.putImageData(lineData, 0, 0);

    // Band labels overlay
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.font = '9px JetBrains Mono, monospace';
    bands.forEach(b => ctx.fillText(b.label, b.x * w, 10));
    ctx.restore();

    frame++;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

$$('.strip-bands .band').forEach(b => {
  b.addEventListener('click', () => {
    $$('.strip-bands .band').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
  });
});

// ============================================================
// 12. TABS (right rail)
// ============================================================
function activateRTab(name) {
  $$('.rtab').forEach(t => t.classList.toggle('active', t.dataset.rtab === name));
  $$('.rpanel').forEach(p => p.classList.toggle('active', p.dataset.rpanel === name));
}
$$('.rtab').forEach(t => t.addEventListener('click', () => activateRTab(t.dataset.rtab)));

// View switch (top)
$$('.view-btn').forEach(b => b.addEventListener('click', () => {
  $$('.view-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  const view = b.dataset.view;
  // Visual-only effect for this prototype: different layer mixes
  if (view === 'ems') {
    if (map.getLayer('jamming-fill')) map.setPaintProperty('jamming-fill', 'fill-opacity', 0.18);
  } else {
    if (map.getLayer('jamming-fill')) map.setPaintProperty('jamming-fill', 'fill-opacity', 0.10);
  }
  if (view === 'planning') activateRTab('plan');
  if (view === 'effects') activateRTab('effect');
  if (view === 'cop') activateRTab('entity');
  if (view === 'multi') {
    activateRTab('cysp');
    showGlobe(true);
  } else {
    showGlobe(false);
  }
  // Space HUD visible on EMS + Multi
  $('#space-hud').hidden = !(view === 'ems' || view === 'multi');
}));

// ============================================================
// 13. COA GENERATION
// ============================================================
function renderCoas() {
  const list = $('#coa-list');
  list.innerHTML = '';
  coas.forEach(c => {
    const el = document.createElement('div');
    el.className = 'coa';
    el.innerHTML = `
      <div class="coa-head">
        <span class="coa-badge coa-${c.id.toLowerCase()}">${c.badge}</span>
        <span class="coa-title">${c.title}</span>
        <span class="coa-score">${c.score}</span>
      </div>
      <div class="coa-body">
        <div class="rationale">${c.rationale}</div>
        <div class="coa-pros">
          <div>
            <h6>Pros</h6>
            <ul>${c.pros.map(p => `<li>${p}</li>`).join('')}</ul>
          </div>
          <div>
            <h6>Cons</h6>
            <ul>${c.cons.map(p => `<li>${p}</li>`).join('')}</ul>
          </div>
        </div>
      </div>
      <div class="coa-foot">
        <button class="btn" data-coa-detail="${c.id}">View timeline</button>
        <button class="btn btn-primary" data-coa-adopt="${c.id}">Adopt → Effects</button>
      </div>
    `;
    list.appendChild(el);
  });
  list.addEventListener('click', (ev) => {
    const adopt = ev.target.closest('[data-coa-adopt]');
    if (adopt) {
      toast({ kind: 'green', title: `${adopt.dataset.coaAdopt} adopted`, desc: 'Effects sequencer updated and deconflicted against JRFL/JCEWL.' });
      activateRTab('effect');
    }
    const detail = ev.target.closest('[data-coa-detail]');
    if (detail) {
      const c = coas.find(x => x.id === detail.dataset.coaDetail);
      if (c) showTimeline(c);
    }
  }, { once: false });
}

function showTimeline(c) {
  const scrim = $('#scrim');
  scrim.innerHTML = `
    <div style="background:var(--bg-raised); border:1px solid var(--border-2); border-radius:12px; padding:28px; width:min(680px, 92vw); box-shadow: 0 40px 120px rgba(0,0,0,.6);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 20px;">
        <div>
          <div style="font-family:var(--font-mono); font-size:11px; color:var(--text-faint); letter-spacing:.14em; text-transform:uppercase">${c.badge}</div>
          <div style="font-size:18px; font-weight:600; margin-top:4px">${c.title}</div>
          <div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted); margin-top:4px">${c.score}</div>
        </div>
        <button class="icon-btn" id="scrim-close">×</button>
      </div>
      <div style="position:relative; padding-left:22px;">
        <div style="position:absolute; left:9px; top:6px; bottom:6px; width:2px; background:var(--border);"></div>
        ${c.steps.map((s, i) => `
          <div style="display:flex; gap:14px; padding: 10px 0; position:relative;">
            <span style="position:absolute; left:-21px; top:14px; width:10px; height:10px; border-radius:50%; background:var(--accent); box-shadow:0 0 8px var(--accent)"></span>
            <div style="flex:0 0 70px; font-family:var(--font-mono); font-size:11px; color:var(--accent); letter-spacing:.06em">${s.t}</div>
            <div style="flex:1; font-size:13px; color:var(--text); line-height:1.5">${s.action}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  scrim.hidden = false;
  $('#scrim-close').addEventListener('click', () => { scrim.hidden = true; });
  scrim.addEventListener('click', (e) => { if (e.target === scrim) scrim.hidden = true; });
}

$('#gen-coa').addEventListener('click', () => {
  const btn = $('#gen-coa');
  btn.innerHTML = '<span class="btn-glyph">●</span>Generating…';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '<span class="btn-glyph">✦</span>Generate COAs';
    btn.disabled = false;
    renderCoas();
    toast({ kind: 'green', title: 'GenAI Planner · 3 COAs ready', desc: 'Deconflicted against JRFL v26.04.1 and JCEWL. Review pros/cons.' });
  }, 1100);
});

// ============================================================
// 14. EFFECTS SEQUENCER
// ============================================================
let currentSeqTab = 'ea';
function renderSeq() {
  const body = $('#seq-body');
  body.innerHTML = '';
  effectsSeq[currentSeqTab].forEach(it => {
    const el = document.createElement('div');
    el.className = `seq-item seq-${it.level}`;
    el.innerHTML = `
      <div class="seq-head">
        <span>${it.id} · ${it.platform}${it.pending ? ' · <span class="text-amber">PENDING ROE</span>' : ''}</span>
        <span>→ ${it.target}</span>
      </div>
      <div class="seq-name">${it.name}</div>
      <div class="seq-meta">
        <span><b>${it.band}</b></span>
        <span>Start <b>${it.start}</b></span>
        <span>Dur <b>${it.dur}</b></span>
      </div>
      <div class="seq-bar"><div class="seq-bar-fill" style="width:${it.progress * 100}%; background:${it.level === 'red' ? 'linear-gradient(90deg, var(--accent-red), var(--accent-magenta))' : it.level === 'green' ? 'linear-gradient(90deg, var(--accent-green), var(--accent-cyan))' : 'linear-gradient(90deg, var(--accent-amber), var(--accent-hi))'}"></div></div>
    `;
    body.appendChild(el);
  });
}
$$('.seq-tab').forEach(t => t.addEventListener('click', () => {
  $$('.seq-tab').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  currentSeqTab = t.dataset.seq;
  renderSeq();
}));
$('#btn-execute').addEventListener('click', () => {
  const btn = $('#btn-execute');
  btn.textContent = 'SYNCING…';
  setTimeout(() => {
    btn.textContent = 'ARMED · SYNC COMPLETE';
    btn.style.filter = 'saturate(1.3)';
    toast({ kind: 'red', title: 'Effects sequence ARMED', desc: 'JEMSOC ack received. Execute authority held at JFACC.' });
  }, 900);
});

// ============================================================
// 15. MAP TOOLS
// ============================================================
$('#tool-fit').addEventListener('click', () => {
  map.fitBounds(AO_BOUNDS, { padding: 80, duration: 900 });
});
['tool-measure', 'tool-rect', 'tool-cone'].forEach(id => {
  $('#' + id).addEventListener('click', (e) => {
    e.currentTarget.classList.toggle('active');
    toast({ title: `Tool ${id.replace('tool-', '')} ready`, desc: 'Click two points on the map to define.' });
  });
});

// ============================================================
// 16. INIT
// ============================================================
map.on('load', () => {
  addOpsLayers();
  addMarkers();
  renderNedb();
  renderAiFeed();
  renderRibbon();
  renderCoas();
  renderSeq();
  initWaterfall();

  setTimeout(() => {
    toast({ title: 'NEDB sync complete · 31 emitters', desc: '9 unresolved flagged for analyst review.' });
  }, 1200);
  setTimeout(() => {
    toast({ kind: 'red', title: 'Priority detection · R-91 POLE-21', desc: 'GNSS denial expanding. AI recommends kinetic prosecution.' });
  }, 3600);
});

// ============================================================
// 17. CESIUM GLOBE (3D multi-domain view)
// ============================================================
let cesiumViewer = null;
let cesiumInitialized = false;

function showGlobe(show) {
  const mapEl = document.getElementById('map');
  const globeEl = document.getElementById('globe');
  const loading = document.getElementById('globe-loading');
  if (show) {
    mapEl.style.display = 'none';
    globeEl.hidden = false;
    if (!cesiumInitialized) {
      loading.hidden = false;
      // Defer so loading spinner paints first
      setTimeout(() => {
        try {
          initCesium();
        } catch (err) {
          console.error('Cesium init failed', err);
          toast({ kind: 'red', title: '3D globe init failed', desc: err.message || 'CesiumJS not available — see console.' });
        }
        loading.hidden = true;
        cesiumInitialized = true;
      }, 60);
    }
  } else {
    globeEl.hidden = true;
    mapEl.style.display = '';
    loading.hidden = true;
  }
}

function initCesium() {
  if (typeof Cesium === 'undefined') {
    throw new Error('Cesium library not loaded');
  }
  Cesium.Ion.defaultAccessToken = '';

  cesiumViewer = new Cesium.Viewer('globe', {
    baseLayer: new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
      url: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      credit: '© CARTO · OpenStreetMap contributors',
      minimumLevel: 0,
      maximumLevel: 18,
    })),
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: false,
    creditContainer: document.createElement('div'),
  });
  cesiumViewer.scene.globe.enableLighting = false;
  cesiumViewer.scene.skyAtmosphere.show = false;
  cesiumViewer.scene.skyBox.show = false;
  cesiumViewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#05070d');
  cesiumViewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a0f1a');
  cesiumViewer.scene.fog.enabled = false;

  cesiumViewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(23.2, 48.0, 2500000),
    orientation: {
      heading: 0,
      pitch: -Cesium.Math.PI_OVER_THREE,
      roll: 0,
    },
    duration: 0,
  });

  addCesiumEntities();
  addCesiumOverlayPanels();
}

function addCesiumEntities() {
  const v = cesiumViewer;

  // --- Red emitters (billboards) ---
  redEmitters.forEach(e => {
    v.entities.add({
      id: 'red-' + e.id,
      position: Cesium.Cartesian3.fromDegrees(e.lon, e.lat),
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString(e.classification === 'UNKNOWN' ? '#ffb020' : '#ff4757'),
        outlineColor: Cesium.Color.fromCssColorString('#ffffff'),
        outlineWidth: 1,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: e.callsign,
        font: '10px "JetBrains Mono", monospace',
        fillColor: Cesium.Color.fromCssColorString(e.classification === 'UNKNOWN' ? '#ffb020' : '#ff4757'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(10, 0),
        scaleByDistance: new Cesium.NearFarScalar(5e5, 1.0, 5e6, 0.6),
        translucencyByDistance: new Cesium.NearFarScalar(3e6, 1.0, 1e7, 0.0),
      },
      description: `<div style="color:#c4c6c9; font-family: monospace">
        <b>${e.callsign}</b> · ${e.nedb}<br>
        Freq: ${e.freqMHz} MHz · SNR ${e.snr_db} dB<br>
        Conf: ${(e.confidence*100).toFixed(0)}%
      </div>`,
    });
  });

  // --- Blue assets ---
  blueAssets.forEach(a => {
    v.entities.add({
      id: 'blue-' + a.id,
      position: Cesium.Cartesian3.fromDegrees(a.lon, a.lat, a.type === 'space' ? 500000 : 8000),
      point: {
        pixelSize: 9,
        color: Cesium.Color.fromCssColorString('#3d8bff'),
        outlineColor: Cesium.Color.fromCssColorString('#0a0f1a'),
        outlineWidth: 2,
        heightReference: a.type === 'space' ? undefined : Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: a.asset,
        font: '10px "JetBrains Mono", monospace',
        fillColor: Cesium.Color.fromCssColorString('#3d8bff'),
        style: Cesium.LabelStyle.FILL,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(10, 0),
        translucencyByDistance: new Cesium.NearFarScalar(3e6, 1.0, 1e7, 0.0),
      },
    });
  });

  // --- Jamming footprints (magenta ellipses) ---
  jammingFootprints.forEach(j => {
    v.entities.add({
      id: 'jam-' + j.emitterId,
      position: Cesium.Cartesian3.fromDegrees(j.lon, j.lat),
      ellipse: {
        semiMinorAxis: j.radiusKm * 1000,
        semiMajorAxis: j.radiusKm * 1000,
        material: Cesium.Color.fromCssColorString('#ff5aa8').withAlpha(0.15),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#ff5aa8').withAlpha(0.6),
        outlineWidth: 1,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
  });

  // --- SIGINT LOBs (polylines) ---
  lobs.forEach(l => {
    v.entities.add({
      id: 'lob-' + l.id,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([l.from[0], l.from[1], l.target[0], l.target[1]]),
        width: 1.2,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString('#47e0e7').withAlpha(0.7),
          dashLength: 14,
        }),
      },
    });
  });

  // --- GPS spoof zones ---
  gpsSpoofZones.forEach(g => {
    v.entities.add({
      id: 'gps-' + g.id,
      position: Cesium.Cartesian3.fromDegrees(g.lon, g.lat),
      ellipse: {
        semiMinorAxis: g.radiusKm * 1000,
        semiMajorAxis: g.radiusKm * 1000,
        material: Cesium.Color.fromCssColorString('#ffa350').withAlpha(0.12),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#ffa350').withAlpha(0.7),
        outlineWidth: 1.5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString('#ffa350'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1,
      },
      label: {
        text: g.id + ' · GPS spoof',
        font: '10px "JetBrains Mono", monospace',
        fillColor: Cesium.Color.fromCssColorString('#ffa350'),
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        pixelOffset: new Cesium.Cartesian2(10, 0),
      },
    });
    // Drift line — true vs spoofed
    v.entities.add({
      id: 'gps-drift-' + g.id,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([g.lon, g.lat, g.spoofCoord[1], g.spoofCoord[0]]),
        width: 1.4,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString('#ffa350'),
          dashLength: 8,
        }),
      },
    });
  });

  // --- Cyber network nodes (3D billboards) ---
  cyberNodes.forEach(n => {
    const color = n.kind === 'c2-hostile' ? '#ff4757'
                : n.kind === 'compromised' ? '#ffb020'
                : '#00ff9d';
    v.entities.add({
      id: 'cyber-' + n.id,
      position: Cesium.Cartesian3.fromDegrees(n.lon, n.lat, 50000),
      point: {
        pixelSize: 11,
        color: Cesium.Color.fromCssColorString(color),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
      },
      label: {
        text: n.name,
        font: '9px "JetBrains Mono", monospace',
        fillColor: Cesium.Color.fromCssColorString(color),
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        pixelOffset: new Cesium.Cartesian2(12, 0),
        translucencyByDistance: new Cesium.NearFarScalar(4e6, 1.0, 1.5e7, 0.0),
      },
    });
  });

  // --- Cyber intrusion links (polyline arcs) ---
  cyberLinks.forEach((l, i) => {
    const a = cyberNodes.find(n => n.id === l.from);
    const b = cyberNodes.find(n => n.id === l.to);
    if (!a || !b) return;
    const color = l.sev === 'red' ? '#ff4757' : '#ffb020';
    v.entities.add({
      id: 'cylink-' + i,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          a.lon, a.lat, 50000,
          b.lon, b.lat, 50000,
        ]),
        width: 1.6,
        arcType: Cesium.ArcType.GEODESIC,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString(color).withAlpha(0.8),
          dashLength: 18,
        }),
      },
    });
  });

  // --- Satellites (3D orbits) ---
  satellites.forEach(s => {
    const track = satTracks[s.id];
    if (!track || track.length < 2) return;
    const alt = s.altKm * 1000;
    // Orbit ring
    const orbitPositions = [];
    track.forEach(([lon, lat]) => {
      orbitPositions.push(lon, lat, alt);
    });
    v.entities.add({
      id: 'sat-orbit-' + s.id,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(orbitPositions),
        width: 1.2,
        material: Cesium.Color.fromCssColorString('#bf7fff').withAlpha(0.55),
      },
    });
    // Sat icon at mid-track
    const [lon, lat] = track[Math.floor(track.length / 2)];
    v.entities.add({
      id: 'sat-' + s.id,
      position: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString('#bf7fff'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
      },
      label: {
        text: s.name,
        font: '10px "JetBrains Mono", monospace',
        fillColor: Cesium.Color.fromCssColorString('#bf7fff'),
        style: Cesium.LabelStyle.FILL,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        pixelOffset: new Cesium.Cartesian2(12, 0),
        translucencyByDistance: new Cesium.NearFarScalar(6e6, 1.0, 3e7, 0.0),
      },
    });
  });

  // --- Satellite footprints on ground ---
  satFootprints.forEach(f => {
    v.entities.add({
      id: 'sat-fp-' + f.id,
      position: Cesium.Cartesian3.fromDegrees(f.lon, f.lat),
      ellipse: {
        semiMinorAxis: f.radiusKm * 1000,
        semiMajorAxis: f.radiusKm * 1000,
        material: Cesium.Color.fromCssColorString('#bf7fff').withAlpha(0.06),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#bf7fff').withAlpha(0.35),
        outlineWidth: 1,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
  });

  // --- AO frame on globe ---
  v.entities.add({
    id: 'ao-frame',
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(AO_BOUNDS[0][0], AO_BOUNDS[0][1], AO_BOUNDS[1][0], AO_BOUNDS[1][1]),
      material: Cesium.Color.fromCssColorString('#3d8bff').withAlpha(0.04),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString('#3d8bff').withAlpha(0.7),
      outlineWidth: 1.5,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });

  // Animate LEO satellites along their tracks
  let satPhase = 0;
  const leoSats = satellites.filter(s => s.altKm < 2000 && satTracks[s.id]);
  setInterval(() => {
    satPhase += 0.005;
    leoSats.forEach(s => {
      const track = satTracks[s.id];
      if (!track || track.length < 2) return;
      const t = satPhase % 1;
      const idx = Math.floor(t * (track.length - 1));
      const frac = t * (track.length - 1) - idx;
      const a = track[idx], b = track[Math.min(idx + 1, track.length - 1)];
      const lon = a[0] + (b[0] - a[0]) * frac;
      const lat = a[1] + (b[1] - a[1]) * frac;
      const entity = v.entities.getById('sat-' + s.id);
      if (entity) {
        entity.position = Cesium.Cartesian3.fromDegrees(lon, lat, s.altKm * 1000);
      }
    });
  }, 50);
}

function addCesiumOverlayPanels() {
  const globeEl = document.getElementById('globe');
  // Stats panel (top-left)
  const stats = document.createElement('div');
  stats.className = 'globe-panel globe-panel-stats';
  stats.innerHTML = `
    <div class="gp-head">✦ Multi-Domain Globe</div>
    <div class="gp-row"><span>Emitters</span><strong>${redEmitters.length}</strong></div>
    <div class="gp-row"><span>Blue assets</span><strong>${blueAssets.length}</strong></div>
    <div class="gp-row"><span>Cyber nodes</span><strong>${cyberNodes.length}</strong></div>
    <div class="gp-row"><span>LEO+MEO+GEO</span><strong>${satellites.length}</strong></div>
    <div class="gp-row"><span>GPS spoof zones</span><strong>${gpsSpoofZones.length}</strong></div>
    <div class="gp-row"><span>View</span><strong>JOA BALTIC</strong></div>
  `;
  globeEl.appendChild(stats);

  // Legend panel (bottom-left)
  const legend = document.createElement('div');
  legend.className = 'globe-panel globe-panel-legend';
  legend.innerHTML = `
    <div class="gp-head">Legend</div>
    <div class="globe-legend-item" style="color:#ff4757"><span class="gl-sw" style="background:#ff4757"></span>Red emitter (ES)</div>
    <div class="globe-legend-item" style="color:#3d8bff"><span class="gl-sw" style="background:#3d8bff"></span>Blue asset (EA/EP)</div>
    <div class="globe-legend-item" style="color:#ff5aa8"><span class="gl-sw" style="background:#ff5aa8"></span>EA footprint</div>
    <div class="globe-legend-item" style="color:#47e0e7"><span class="gl-sw" style="background:#47e0e7"></span>SIGINT LOB</div>
    <div class="globe-legend-item" style="color:#00ff9d"><span class="gl-sw" style="background:#00ff9d"></span>Cyber node / intrusion</div>
    <div class="globe-legend-item" style="color:#bf7fff"><span class="gl-sw" style="background:#bf7fff"></span>Satellite orbit (LEO/MEO/GEO)</div>
    <div class="globe-legend-item" style="color:#ffa350"><span class="gl-sw" style="background:#ffa350"></span>GPS spoofing zone</div>
  `;
  globeEl.appendChild(legend);
}

// ============================================================
// 18. CYBER / SPACE RIGHT-RAIL PANELS
// ============================================================
function renderCyberPanel() {
  const ul = $('#cyber-list');
  if (!ul) return;
  ul.innerHTML = '';
  cyberEvents.forEach(e => {
    const li = document.createElement('li');
    li.className = `cyber-item sev-${e.severity}`;
    li.innerHTML = `
      <span class="cyber-item-id sev-${e.severity}">${e.id}</span>
      <div class="cyber-item-main">
        <div class="cyber-item-stage">${e.stage} · ${e.ttp.split(' · ')[0]}</div>
        <div class="cyber-item-title">${e.target}</div>
        <div class="cyber-item-meta">${e.actor.split(' (')[0]}</div>
      </div>
      <span class="cyber-item-t">${e.t}</span>
    `;
    li.title = e.detail;
    li.addEventListener('click', () => {
      toast({ kind: e.severity === 'red' ? 'red' : '', title: `${e.id} · ${e.stage}`, desc: e.detail });
      if (!cesiumInitialized) {
        map.flyTo({ center: [e.lon, e.lat], zoom: 8, speed: 1.2 });
      }
    });
    ul.appendChild(li);
  });
  const cc = $('#cyber-count');
  if (cc) cc.textContent = `${cyberEvents.length} events`;
  const cn = $('#count-cyber');
  if (cn) cn.textContent = cyberNodes.length;
}

function renderSatPanel() {
  const ul = $('#sat-list');
  if (!ul) return;
  ul.innerHTML = '';
  satellites.forEach(s => {
    const orbit = s.altKm < 2000 ? 'leo' : s.altKm < 25000 ? 'meo' : 'geo';
    const orbitLabel = orbit.toUpperCase();
    const li = document.createElement('li');
    li.className = 'sat-item';
    const isContinuous = s.aos === 'continuous' || s.aos === '—';
    li.innerHTML = `
      <div class="sat-item-orbit ${orbit}">${orbitLabel}</div>
      <div class="sat-item-main">
        <div class="sat-item-name">${s.name}</div>
        <div class="sat-item-meta">${s.altKm} km · inc ${s.incDeg}° · ${s.purpose}</div>
        <div class="sat-item-meta" style="color:var(--text-faint); margin-top:2px">→ ${s.tasked}</div>
      </div>
      <div class="sat-item-window">
        ${isContinuous ? '<span style="color:var(--accent-green)">CONTINUOUS</span>' : `<div>AOS ${s.aos.slice(0,5)}Z</div><div class="countdown">El ${s.maxElev}°</div>`}
      </div>
    `;
    li.addEventListener('click', () => {
      toast({ title: s.name, desc: `${s.purpose} · status: ${s.status}` });
    });
    ul.appendChild(li);
  });
}

function renderGpsPanel() {
  const ul = $('#gps-list');
  if (!ul) return;
  ul.innerHTML = '';
  gpsSpoofZones.forEach(g => {
    const li = document.createElement('li');
    li.className = 'gps-item';
    const drift = Math.round(
      Math.sqrt(Math.pow((g.spoofCoord[1]-g.lon)*111*Math.cos(g.lat*Math.PI/180), 2)
              + Math.pow((g.spoofCoord[0]-g.lat)*111, 2))
    );
    li.innerHTML = `
      <div class="gps-item-head">
        <span>${g.id} · ${g.t}</span>
        <span>${(g.confidence*100).toFixed(0)}%</span>
      </div>
      <div class="gps-item-detail">Affected: ${g.affected}</div>
      <div class="gps-item-drift">False push ≈ ${drift} km · emitter ${g.emitter} · radius ${g.radiusKm} km</div>
    `;
    li.addEventListener('click', () => {
      map.flyTo({ center: [g.lon, g.lat], zoom: 9, speed: 1.2 });
      toast({ kind: 'red', title: `GPS spoofing · ${g.id}`, desc: `${g.affected} · false push ≈ ${drift} km east.` });
    });
    ul.appendChild(li);
  });
}

function renderOverflightHud() {
  const list = $('#overflight-list');
  if (!list) return;
  list.innerHTML = '';
  // Show LEO satellites with AOS windows
  const leo = satellites.filter(s => s.aos && s.aos !== 'continuous' && s.aos !== '—');
  leo.forEach(s => {
    const aos = s.aos.slice(0, 5);
    const el = document.createElement('div');
    el.className = 'hud-item';
    const glyph = s.name.includes('HE360') ? 'SI' : s.name.includes('LACROSSE') ? 'SAR' : '◉';
    el.innerHTML = `
      <div class="hud-item-glyph">${glyph}</div>
      <div class="hud-item-main">
        <div class="hud-item-name">${s.name}</div>
        <div class="hud-item-meta">AOS ${aos} · El ${s.maxElev}° · Az ${s.azAtTca}°</div>
      </div>
      <div class="hud-item-countdown">AOS ${aos}</div>
    `;
    el.addEventListener('click', () => {
      activateRTab('cysp');
      toast({ title: s.name, desc: `${s.purpose} · tasking: ${s.tasked}` });
    });
    list.appendChild(el);
  });
}

// ============================================================
// 19. MULTI-DOMAIN TIMELINE MODAL
// ============================================================
function showMultiDomainTimeline() {
  const scrim = $('#scrim');
  // Min/max t in minutes for scaling strip
  const tmins = multiDomainTimeline.map(e => e.tmin);
  const minT = Math.min(...tmins);
  const maxT = Math.max(...tmins);
  const range = maxT - minT;
  const tickPositions = [-60, -48, -30, -15, 0, 8];
  const pct = (tmin) => ((tmin - minT) / range) * 100;

  scrim.innerHTML = `
    <div class="mdt-modal">
      <div class="mdt-head">
        <div>
          <div class="mdt-title-tag">H-HOUR · UNIFIED TIMELINE · EA / EP / ES + CYBER + SPACE</div>
          <div class="mdt-title">Multi-Domain Effects — OP IRON DAWN 26</div>
          <div class="mdt-sub">${multiDomainTimeline.length} events across 3 domains · H-60 min to H+08 min · JEMSOC deconflicted</div>
        </div>
        <button class="icon-btn" id="mdt-close" aria-label="Close">×</button>
      </div>

      <div class="mdt-timeline-strip">
        ${tickPositions.map(t => {
          const p = pct(t);
          const label = (t === 0) ? 'H' : (t < 0 ? `H${t}` : `H+${t}`);
          return `<div class="mdt-tick" style="left:${p}%"></div><div class="mdt-tick-label" style="left:${p}%">${label}</div>`;
        }).join('')}
        <div class="mdt-hzero" style="left:${pct(0)}%"></div>
        <div class="mdt-hzero-label" style="left:${pct(0)}%">H-ZERO</div>
        ${multiDomainTimeline.map(e => `
          <div class="mdt-event-marker dom-${e.dom}" style="left:${pct(e.tmin)}%" title="${e.t} — ${e.title}"></div>
        `).join('')}
      </div>

      <div class="mdt-lanes">
        ${multiDomainTimeline.map(e => `
          <div class="mdt-lane ${e.tmin === 0 ? 't-zero' : ''}">
            <div class="mdt-lane-t">${e.t}</div>
            <span class="dom-tag dom-${e.dom}">${e.dom.toUpperCase()}</span>
            <div class="mdt-lane-body">
              <div class="mdt-lane-title">${e.title}</div>
              <div class="mdt-lane-detail">${e.detail}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="mdt-legend">
        <span class="mdt-legend-item dom-ew">Electromagnetic (EA/EP/ES)</span>
        <span class="mdt-legend-item dom-cyber">Cyber kill-chain</span>
        <span class="mdt-legend-item dom-space">Space · PNT · SATCOM</span>
      </div>
    </div>
  `;
  scrim.hidden = false;
  $('#mdt-close').addEventListener('click', () => { scrim.hidden = true; });
  scrim.addEventListener('click', (e) => { if (e.target === scrim) scrim.hidden = true; });
}

// ============================================================
// 20. WATERFALL ENHANCEMENTS (SDR carriers + tune interaction)
// ============================================================
// Carrier frequency → waterfall x-position mapping.
// Use the same band layout the waterfall uses internally.
const SDR_BANDS = [
  { mhz: 7.5, x: 0.02 },
  { mhz: 100, x: 0.08 },
  { mhz: 900, x: 0.20 },
  { mhz: 1575, x: 0.32 },
  { mhz: 2950, x: 0.45 },
  { mhz: 3100, x: 0.48 },
  { mhz: 5600, x: 0.58 },
  { mhz: 8000, x: 0.68 },
  { mhz: 8400, x: 0.72 },
  { mhz: 12400, x: 0.86 },
];
function freqToX(mhz) {
  // Piecewise linear interpolation on the same anchors
  if (mhz <= SDR_BANDS[0].mhz) return SDR_BANDS[0].x;
  if (mhz >= SDR_BANDS[SDR_BANDS.length-1].mhz) return SDR_BANDS[SDR_BANDS.length-1].x;
  for (let i = 0; i < SDR_BANDS.length - 1; i++) {
    const a = SDR_BANDS[i], b = SDR_BANDS[i+1];
    if (mhz >= a.mhz && mhz <= b.mhz) {
      // log-ish interpolation
      const la = Math.log10(a.mhz), lb = Math.log10(b.mhz), lm = Math.log10(mhz);
      const frac = (lm - la) / (lb - la);
      return a.x + (b.x - a.x) * frac;
    }
  }
  return 0.5;
}

function buildSdrCarriers() {
  const host = $('#sdr-carriers');
  if (!host) return;
  host.innerHTML = '';
  // Build carriers from red emitters (their freq)
  const carriers = redEmitters.map(e => ({
    id: e.id,
    callsign: e.callsign,
    mhz: e.freqMHz,
    hostile: e.classification !== 'UNKNOWN',
  }));
  carriers.forEach(c => {
    const el = document.createElement('div');
    el.className = 'sdr-carrier';
    const pct = freqToX(c.mhz) * 100;
    el.style.left = pct + '%';
    el.dataset.label = `${c.callsign} ${c.mhz<1000 ? c.mhz+' MHz' : (c.mhz/1000).toFixed(1)+' GHz'}`;
    el.dataset.mhz = c.mhz;
    host.appendChild(el);
  });
  tuneToFreq(parseFloat($('#sdr-freq').value) || 8400);
}

function tuneToFreq(mhz) {
  // Highlight nearest carrier
  const host = $('#sdr-carriers');
  if (!host) return;
  let best = null, bestDelta = Infinity;
  [...host.children].forEach(ch => {
    ch.classList.remove('tuned');
    const cf = parseFloat(ch.dataset.mhz);
    const d = Math.abs(Math.log10(cf) - Math.log10(mhz));
    if (d < bestDelta) { bestDelta = d; best = ch; }
  });
  if (best && bestDelta < 0.12) best.classList.add('tuned');
  const meta = $('#strip-meta');
  if (meta) {
    const label = mhz < 1000 ? `${mhz} MHz` : `${(mhz/1000).toFixed(2)} GHz`;
    const mode = $('#sdr-mode') ? $('#sdr-mode').value : 'CW';
    meta.textContent = `TUNED ${label} · ${mode} · RBW 24.7 MHz · sub 0.27/s`;
  }
}

// ============================================================
// 21. WIRE UP MULTI-DOMAIN HANDLERS
// ============================================================
function wireMultiDomainHandlers() {
  const openTl = $('#open-timeline');
  if (openTl) openTl.addEventListener('click', showMultiDomainTimeline);

  const freqInput = $('#sdr-freq');
  if (freqInput) {
    freqInput.addEventListener('input', () => {
      const mhz = parseFloat(freqInput.value);
      if (!isNaN(mhz)) tuneToFreq(mhz);
    });
  }
  const modeSel = $('#sdr-mode');
  if (modeSel) {
    modeSel.addEventListener('change', () => {
      tuneToFreq(parseFloat(freqInput.value) || 8400);
      toast({ title: `Demod mode ${modeSel.value}`, desc: 'WebSDR subscription updated · bitstream renegotiating.' });
    });
  }
}

// ============================================================
// 22. INIT HOOK (append to map.on('load'))
// ============================================================
map.on('load', () => {
  try {
    addCyberSpaceLayers();
    addCyberSpaceMarkers();
  } catch (e) { console.error('cyber/space layers', e); }
  renderCyberPanel();
  renderSatPanel();
  renderGpsPanel();
  renderOverflightHud();
  buildSdrCarriers();
  wireMultiDomainHandlers();
  // Simulate live cyber alert after a few seconds
  setTimeout(() => {
    toast({ kind: 'red', title: 'CYBER · APT28 lateral movement', desc: 'JEWCS ALPHA host enumerated DCs — containment initiated.' });
  }, 5800);
  setTimeout(() => {
    toast({ title: 'SPACE · HE360 CLUSTER-8A AOS', desc: 'TDOA tasking on R-73 TIRADA-2 live. Cut expected in 4 min.' });
  }, 8200);
});
