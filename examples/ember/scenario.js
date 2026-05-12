// NATO EW C2 demo scenario — Suwałki Gap / Baltic AO
// All units, emitters, and fingerprints are SYNTHETIC for prototype demonstration.

export const AO_CENTER = [23.2, 54.1];
export const AO_BOUNDS = [[19.5, 52.8], [27.5, 55.8]];

// ============= RED FORCE — Emitters (ES detections) =============
export const redEmitters = [
  {
    id: 'R-37', callsign: 'BIG BIRD-4', nedb: '64N6E "BIG BIRD"', threat: 'GBAD surveillance',
    lat: 54.82, lon: 23.85, // Kaliningrad
    freqMHz: 2950, prfHz: 0, pw_us: 0, pattern: 'rotating', snr_db: 22,
    confidence: 0.94, classification: 'HOSTILE', lob: 47, firstSeen: '09:17:42Z',
    echelon: 'OPERATIONAL', system: 'S-400 Triumf', role: 'Early warning / acquisition',
    notes: 'Consistent PRF signature matching 64N6E. Elevation sweep detected.',
    coa: ['Suppress via standoff jamming (EC-130 / MALD-J)', 'Schedule reactive EA'],
    band: 'sband',
  },
  {
    id: 'R-12', callsign: 'GRAVE STONE', nedb: '92N6E "GRAVE STONE"', threat: 'GBAD engagement',
    lat: 54.97, lon: 21.75, freqMHz: 8400, prfHz: 1800, pw_us: 0.6, pattern: 'tracking',
    snr_db: 19, confidence: 0.88, classification: 'HOSTILE', lob: 112, firstSeen: '09:22:11Z',
    echelon: 'TACTICAL', system: 'S-400 engagement', role: 'Fire control / engagement',
    notes: 'Multi-mode AESA. Track-while-scan detected on friendly corridor.',
    coa: ['Priority suppression pre-H-hour', 'HARM engagement authorized'],
    band: 'xband',
  },
  {
    id: 'R-44', callsign: 'KRASUKHA', nedb: '1RL257 "KRASUKHA-4"', threat: 'EW / Jammer',
    lat: 54.53, lon: 22.80, freqMHz: 8000, prfHz: 0, pw_us: 0, pattern: 'barrage',
    snr_db: 27, confidence: 0.91, classification: 'HOSTILE', lob: 95, firstSeen: '09:08:04Z',
    echelon: 'OPERATIONAL', system: 'Krasukha-4', role: 'X-band counter-ISR jammer',
    notes: 'Wide-band noise, hopping. Degrades AWACS, JSTARS radar returns.',
    coa: ['Electromagnetic protection: frequency diversity', 'Geolocate precisely for kinetic prosecution'],
    band: 'xband',
  },
  {
    id: 'R-08', callsign: 'PODSOLNUKH', nedb: 'Podsolnukh-E OTH', threat: 'OTH surveillance',
    lat: 54.72, lon: 20.52, freqMHz: 7.5, prfHz: 50, pw_us: 80, pattern: 'sweep',
    snr_db: 14, confidence: 0.77, classification: 'HOSTILE', lob: 62, firstSeen: '08:58:30Z',
    echelon: 'STRATEGIC', system: 'Podsolnukh-E OTH', role: 'Surface wave OTH',
    notes: 'HF surface-wave surveillance. Long-range maritime/aerial detection.',
    coa: ['HF EA not authorized', 'Continue monitoring'],
    band: 'vhf',
  },
  {
    id: 'R-21', callsign: 'LEER-3', nedb: 'RB-341V "LEER-3"', threat: 'Comms EW / cyber-EM',
    lat: 54.28, lon: 24.12, freqMHz: 900, prfHz: 0, pw_us: 0, pattern: 'spoof',
    snr_db: 16, confidence: 0.83, classification: 'HOSTILE', lob: 18, firstSeen: '09:31:18Z',
    echelon: 'TACTICAL', system: 'RB-341V LEER-3', role: 'GSM suppression / BTS spoofing',
    notes: 'Cellular BTS emulation detected. Probable IMSI catcher + suppression.',
    coa: ['Advisory to civil authorities', 'EP: unit radio discipline'],
    band: 'uhf',
  },
  {
    id: 'R-55', callsign: 'GNOM', nedb: '1L269 "ZOOPARK-1M"', threat: 'Counter-battery radar',
    lat: 53.88, lon: 23.21, freqMHz: 3100, prfHz: 2400, pw_us: 0.4, pattern: 'sector',
    snr_db: 15, confidence: 0.72, classification: 'HOSTILE', lob: 205, firstSeen: '09:40:02Z',
    echelon: 'TACTICAL', system: '1L269 Zoopark-1M', role: 'Counter-battery / artillery loc',
    notes: 'Sector scan 60°. Threat to friendly fires.',
    coa: ['Reactive jamming on detection', 'Coordinate with fires cell'],
    band: 'sband',
  },
  {
    id: 'R-91', callsign: 'POLYANA', nedb: 'POLE-21 GNSS JAM', threat: 'GNSS jammer',
    lat: 54.40, lon: 20.95, freqMHz: 1575, prfHz: 0, pw_us: 0, pattern: 'cw',
    snr_db: 31, confidence: 0.96, classification: 'HOSTILE', lob: 78, firstSeen: '08:44:10Z',
    echelon: 'TACTICAL', system: 'POLE-21 cluster', role: 'GPS L1 / GLONASS jammer',
    notes: 'Confirmed cause of friendly PNT degradation in AO sector 3.',
    coa: ['Activate anti-jam GPS (M-code)', 'Kinetic prosecution — Priority 1'],
    band: 'lband',
  },
  {
    id: 'R-73', callsign: 'TIRADA', nedb: 'TIRADA-2 SATCOM', threat: 'SATCOM jammer',
    lat: 54.68, lon: 21.12, freqMHz: 12400, prfHz: 0, pw_us: 0, pattern: 'uplink',
    snr_db: 28, confidence: 0.89, classification: 'HOSTILE', lob: 88, firstSeen: '09:01:55Z',
    echelon: 'STRATEGIC', system: 'TIRADA-2S', role: 'SATCOM uplink jammer',
    notes: 'Ku-band uplink jamming against MILSTAR/INMARSAT.',
    coa: ['Reroute to SATCOM-B alternate', 'Assign EW aircraft to geolocate precisely'],
    band: 'kuband',
  },
  {
    id: 'R-05', callsign: 'UNKNOWN-05', nedb: 'UNRESOLVED', threat: 'Unclassified emitter',
    lat: 54.10, lon: 22.35, freqMHz: 5600, prfHz: 1200, pw_us: 0.3, pattern: 'agile',
    snr_db: 11, confidence: 0.41, classification: 'UNKNOWN', lob: 133, firstSeen: '09:38:50Z',
    echelon: '—', system: 'Pending', role: 'Frequency-agile, PRF jitter',
    notes: 'Fingerprint unmatched. AI flagged for analyst review.',
    coa: ['Task collection asset for deeper look', 'Correlate with SIGINT feeds'],
    band: 'sband',
    isNew: true,
  },
];

// ============= BLUE FORCE — EW Assets =============
export const blueAssets = [
  {
    id: 'B-01', name: 'EC-37B COMPASS CALL', role: 'Standoff airborne jammer', type: 'aircraft',
    lat: 53.50, lon: 21.80, hdg: 75, asset: 'USAF 55th ECG',
    capability: 'Suppress / deceive / degrade communications & radar',
    band: 'multi', status: 'on-station', fuel_min: 215,
  },
  {
    id: 'B-02', name: 'EA-18G GROWLER · EAGLE-2', role: 'Escort jamming', type: 'aircraft',
    lat: 53.85, lon: 22.30, hdg: 60, asset: 'USN VAQ-132',
    capability: 'NGJ-MB · AGM-88G HARM', band: 'multi', status: 'ingress', fuel_min: 92,
  },
  {
    id: 'B-03', name: 'EA-18G GROWLER · EAGLE-3', role: 'Escort jamming', type: 'aircraft',
    lat: 53.88, lon: 22.10, hdg: 60, asset: 'USN VAQ-132',
    capability: 'NGJ-MB · AGM-88G HARM', band: 'multi', status: 'ingress', fuel_min: 95,
  },
  {
    id: 'B-10', name: 'RC-135V RIVET JOINT', role: 'SIGINT / ES', type: 'aircraft',
    lat: 54.20, lon: 19.80, hdg: 110, asset: 'USAF 55th WG',
    capability: 'ELINT · COMINT · geolocation', band: 'multi', status: 'on-station', fuel_min: 380,
  },
  {
    id: 'B-11', name: 'RAF RIVET JOINT · AIRSEEKER', role: 'SIGINT / ES', type: 'aircraft',
    lat: 55.10, lon: 20.50, hdg: 200, asset: 'RAF 51 Sqn',
    capability: 'ELINT · COMINT', band: 'multi', status: 'on-station', fuel_min: 290,
  },
  {
    id: 'B-20', name: 'JEWCS LAND TEAM · ALPHA', role: 'Tactical EW / ES', type: 'ground',
    lat: 54.05, lon: 22.90, asset: 'NATO JEWCS',
    capability: 'DF · manpack EA · fingerprinting', band: 'vhf-uhf', status: 'deployed',
  },
  {
    id: 'B-21', name: 'PL 6th SOF · EW CELL', role: 'Tactical EW / COMINT', type: 'ground',
    lat: 53.62, lon: 23.32, asset: 'Poland JW GROM',
    capability: 'DF · COMINT · tactical EA', band: 'hf-uhf', status: 'deployed',
  },
  {
    id: 'B-30', name: 'LITHUANIAN EW COY', role: 'Comms protection', type: 'ground',
    lat: 54.68, lon: 24.30, asset: 'LTU 2nd MIB',
    capability: 'Direction finding · EP for C2 comms', band: 'vhf-uhf', status: 'deployed',
  },
  {
    id: 'B-40', name: 'SILENT SENTRY · PCL', role: 'Passive multistatic', type: 'ground',
    lat: 54.45, lon: 23.05, asset: 'NATO ARTEMIS',
    capability: 'FM / DVB-T based passive radar', band: 'vhf', status: 'deployed',
  },
  {
    id: 'B-50', name: 'USS PORTER · AN/SLQ-32', role: 'Shipboard EW', type: 'ship',
    lat: 55.25, lon: 19.80, hdg: 90, asset: 'USN 6th Fleet',
    capability: 'ES/EA · SEWIP Blk 3', band: 'multi', status: 'on-station',
  },
  {
    id: 'B-60', name: 'HAWKEYE 360 · CLUSTER 8', role: 'Space-based RF geoloc', type: 'space',
    lat: 54.00, lon: 22.00, asset: 'Commercial SIGINT',
    capability: 'RF geolocation (TDOA/FDOA)', band: 'vhf-kuband', status: 'tasked',
  },
];

// ============= JAMMING FOOTPRINTS =============
// Circular/cone approximations (radius in km)
export const jammingFootprints = [
  { emitterId: 'R-44', lat: 54.53, lon: 22.80, radiusKm: 120, color: 'magenta', label: 'Krasukha-4 EA bubble (X-band)' },
  { emitterId: 'R-91', lat: 54.40, lon: 20.95, radiusKm: 85, color: 'magenta', label: 'POLE-21 GNSS denial' },
  { emitterId: 'R-73', lat: 54.68, lon: 21.12, radiusKm: 200, color: 'magenta', label: 'TIRADA-2 SATCOM uplink jam' },
];

// ============= SIGINT / LOB CUTS =============
export const lobs = [
  { id: 'L1', from: [19.80, 54.20], target: [23.85, 54.82], emitter: 'R-37', platform: 'B-10' },
  { id: 'L2', from: [20.50, 55.10], target: [23.85, 54.82], emitter: 'R-37', platform: 'B-11' },
  { id: 'L3', from: [22.00, 54.00], target: [21.12, 54.68], emitter: 'R-73', platform: 'B-60' },
  { id: 'L4', from: [22.90, 54.05], target: [22.80, 54.53], emitter: 'R-44', platform: 'B-20' },
  { id: 'L5', from: [23.32, 53.62], target: [23.21, 53.88], emitter: 'R-55', platform: 'B-21' },
  { id: 'L6', from: [19.80, 55.25], target: [20.95, 54.40], emitter: 'R-91', platform: 'B-50' },
];

// ============= SENSOR COVERAGE =============
export const coverage = [
  { id: 'B-10', lat: 54.20, lon: 19.80, radiusKm: 320, color: 'blue' },
  { id: 'B-11', lat: 55.10, lon: 20.50, radiusKm: 320, color: 'blue' },
  { id: 'B-40', lat: 54.45, lon: 23.05, radiusKm: 120, color: 'blue' },
  { id: 'B-50', lat: 55.25, lon: 19.80, radiusKm: 180, color: 'blue' },
];

// ============= JRFL / Zones =============
export const zones = [
  { id: 'Z1', name: 'GUARDED — MEDEVAC COMMS 225–250 MHz', type: 'guarded',
    polygon: [[22.4, 53.7], [24.2, 53.7], [24.2, 54.6], [22.4, 54.6]] },
  { id: 'Z2', name: 'TABOO — CIVIL AVIATION TCAS 1030/1090', type: 'taboo',
    polygon: [[21.5, 53.4], [25.2, 53.4], [25.2, 55.3], [21.5, 55.3]] },
  { id: 'Z3', name: 'PROTECTED — ALLIED SATCOM KU UPLINK', type: 'protected',
    polygon: [[20.5, 53.8], [22.5, 53.8], [22.5, 55.0], [20.5, 55.0]] },
];

// ============= AI Analyst feed =============
export const aiFeed = [
  {
    t: 'T-00:04', sev: 'red', title: 'Krasukha-4 EA increasing — X-band degrade on AWACS',
    body: 'Emitter R-44 (R-LOB 095°) power +6 dB over last 90s. Projected −11 dB SNR on friendly X-band ISR.',
    emitter: 'R-44',
  },
  {
    t: 'T-00:07', sev: 'amber', title: 'Unresolved emitter R-05 · fingerprint candidates',
    body: 'Top match: 1L271 (0.41) · Alt. 9S36M (0.22). Task RC-135V for deeper look.',
    emitter: 'R-05',
  },
  {
    t: 'T-00:12', sev: 'red', title: 'GPS L1 denial expanding · POLE-21 cluster',
    body: 'Denial radius grew 14 km east. Friendly PNT down to 68% in sector 3. Recommend M-code failover.',
    emitter: 'R-91',
  },
  {
    t: 'T-00:18', sev: 'amber', title: 'New emitter cluster · S-band counter-battery',
    body: 'R-55 Zoopark-1M detected. Probable CBR for adversary artillery group NORTH.',
    emitter: 'R-55',
  },
  {
    t: 'T-00:23', sev: 'blue', title: 'Passive multistatic track correlated',
    body: 'Silent Sentry (B-40) correlates with RC-135V cut — emitter R-12 LOB refined to ±0.4°.',
    emitter: 'R-12',
  },
];

// ============= Generated COAs =============
export const coas = [
  {
    id: 'A', badge: 'COA-A', title: 'Standoff suppression with precision geolocation',
    score: 'p(success) 0.82 · risk LOW',
    rationale: 'Leverage EC-37B + 2× EA-18G with NGJ-MB to suppress R-37, R-12, and R-91 along ingress corridor. Precision geoloc via HawkEye-360 + RC-135V TDOA cuts enables HARM on R-91 POLE-21 cluster.',
    pros: ['Reversible EA — minimal escalation', 'Preserves civil SATCOM/TCAS', 'AWACS cover maintained'],
    cons: ['Limited effect on OTH R-08', 'Weather-dependent airborne assets'],
    steps: [
      { t: 'H-30', action: 'EC-37B Compass Call on-station, begin COMINT suppression of R-21' },
      { t: 'H-22', action: 'EAGLE-2/3 push into corridor, NGJ-MB reactive vs R-37' },
      { t: 'H-14', action: 'HARM engagement R-91 POLE-21 (pending ROE)' },
      { t: 'H-06', action: 'Silent Sentry + RC-135V TDOA on R-44 for kinetic handoff' },
      { t: 'H+00', action: 'Corridor opens, air package transit window' },
    ],
  },
  {
    id: 'B', badge: 'COA-B', title: 'Deception-first · inject false emitter picture',
    score: 'p(success) 0.67 · risk MEDIUM',
    rationale: 'Use MALD-J decoy swarm to saturate adversary GBAD picture with false tracks, delaying engagement of real strike package. Minimal hard kill.',
    pros: ['Highest survivability for strike package', 'Low signature — delays adversary reaction', 'Scalable'],
    cons: ['Non-persistent effect', 'Requires launch platforms forward', 'Reveals MALD-J TTP'],
    steps: [
      { t: 'H-40', action: 'Launch 24× MALD-J from F-15E pairs' },
      { t: 'H-25', action: 'Decoy swarm ingress, saturation of R-37 / R-12 picture' },
      { t: 'H-15', action: 'EAGLE-2/3 reactive EA pops selected emitters' },
      { t: 'H+00', action: 'Air package behind decoy screen' },
    ],
  },
  {
    id: 'C', badge: 'COA-C', title: 'Passive-only · preserve element of surprise',
    score: 'p(success) 0.58 · risk LOW',
    rationale: 'Continue ES/SIGINT collection; defer EA to reactive only. Preserves OPSEC of EW order of battle, suitable for Phase II (Deter).',
    pros: ['Zero attribution risk', 'Collects adversary TTPs', 'Meets ROE ES-only'],
    cons: ['No kinetic deterrent', 'Air package exposure high if strike authorized'],
    steps: [
      { t: 'H-60', action: 'Continuous ES on R-37/R-12/R-44/R-91' },
      { t: 'H-30', action: 'HE360 TDOA cluster on R-73 (TIRADA-2)' },
      { t: 'H+00', action: 'Reactive EA only if engagement criteria met' },
    ],
  },
];

// ============= CYBER DOMAIN — intrusion events / kill chain =============
// STIX-style cyber events tied to the EW operational picture.
export const cyberEvents = [
  {
    id: 'CY-01', stage: 'Reconnaissance', severity: 'amber',
    actor: 'APT28 / SOFACY (attrib. conf. 0.74)', ttp: 'T1595 · Active scanning',
    lat: 54.68, lon: 24.30, target: 'LTU 2nd MIB · C2 perimeter',
    ts: '08:42:11Z', t: 'T-48:00',
    detail: 'External scan of allied C2 edge. TCP 443/8443 enumeration from fast-flux infra in RU AS.',
    linked: ['R-21'],
  },
  {
    id: 'CY-02', stage: 'Initial Access', severity: 'red',
    actor: 'APT28 / SOFACY (attrib. conf. 0.81)', ttp: 'T1566.001 · Spearphish attachment',
    lat: 53.62, lon: 23.32, target: 'PL JW GROM — MILNET enclave',
    ts: '09:02:44Z', t: 'T-28:00',
    detail: 'Weaponised .lnk delivered to 6 operators. 1 beacon observed to C2 over HTTPS (443).',
    linked: ['B-21'],
  },
  {
    id: 'CY-03', stage: 'C2 Beaconing', severity: 'red',
    actor: 'APT28 / SOFACY', ttp: 'T1071.001 · HTTPS C2',
    lat: 55.25, lon: 19.80, target: 'USS PORTER · shipboard LAN segment',
    ts: '09:17:08Z', t: 'T-12:00',
    detail: 'Beacon cadence 48s ± 6s jitter to 185.x.x.x. SEWIP Blk 3 telemetry egress correlated.',
    linked: ['B-50', 'R-73'],
  },
  {
    id: 'CY-04', stage: 'Lateral Movement', severity: 'red',
    actor: 'APT28 / SOFACY', ttp: 'T1021.002 · SMB/admin shares',
    lat: 54.05, lon: 22.90, target: 'NATO JEWCS LAND · ALPHA',
    ts: '09:26:55Z', t: 'T-04:00',
    detail: 'Pass-the-hash from compromised host to 3 domain controllers. NEDB sync daemon enumerated.',
    linked: ['B-20'],
  },
  {
    id: 'CY-05', stage: 'Disruption', severity: 'amber',
    actor: 'RU GRU Unit 74455 (Sandworm) · attrib. conf. 0.63',
    ttp: 'T1499 · Endpoint DoS · T0814 · Comms denial',
    lat: 54.28, lon: 24.12, target: 'PL regional 5G MME',
    ts: '09:34:22Z', t: 'T+02:00',
    detail: 'Coordinated with LEER-3 RF suppression — creates hybrid denial on civil/mil tactical comms.',
    linked: ['R-21'],
  },
  {
    id: 'CY-06', stage: 'Collection', severity: 'amber',
    actor: 'Unknown', ttp: 'T1005 · Data from local system',
    lat: 54.45, lon: 23.05, target: 'Silent Sentry PCL · passive radar telemetry',
    ts: '09:39:04Z', t: 'T+05:00',
    detail: 'Anomalous staging of 2.1 GB into %TEMP% suggests ISR exfil attempt. Beacon dormant.',
    linked: ['B-40'],
  },
];

// Cyber network nodes rendered on the map
export const cyberNodes = [
  { id: 'NET-1', kind: 'c2-friendly', lat: 50.98, lon: 5.76, name: 'JFCBS Brunssum · C2 core', status: 'ok' },
  { id: 'NET-2', kind: 'c2-friendly', lat: 52.23, lon: 21.01, name: 'PL MoD · MILNET gateway', status: 'degraded' },
  { id: 'NET-3', kind: 'c2-friendly', lat: 54.68, lon: 25.28, name: 'LTU NCIRC · forward', status: 'ok' },
  { id: 'NET-4', kind: 'compromised', lat: 53.62, lon: 23.32, name: 'PL SOF enclave · beacon', status: 'compromised' },
  { id: 'NET-5', kind: 'compromised', lat: 54.05, lon: 22.90, name: 'JEWCS ALPHA · lateral', status: 'compromised' },
  { id: 'NET-6', kind: 'c2-hostile', lat: 55.60, lon: 37.65, name: 'RU GRU infra (attributed)', status: 'hostile' },
  { id: 'NET-7', kind: 'c2-hostile', lat: 54.72, lon: 20.52, name: 'KGD relay (fast-flux)', status: 'hostile' },
];

// Intrusion edges connecting nodes (kill-chain visualisation)
export const cyberLinks = [
  { from: 'NET-6', to: 'NET-7', stage: 'relay', sev: 'red' },
  { from: 'NET-7', to: 'NET-4', stage: 'beacon', sev: 'red' },
  { from: 'NET-4', to: 'NET-5', stage: 'lateral', sev: 'red' },
  { from: 'NET-5', to: 'NET-2', stage: 'pivot', sev: 'amber' },
  { from: 'NET-7', to: 'NET-3', stage: 'scan', sev: 'amber' },
];

// ============= SPACE DOMAIN — LEO tracks, overflights, GPS spoofing =============
export const satellites = [
  {
    id: 'SAT-01', name: 'HE360 CLUSTER-8A', operator: 'HawkEye-360 (commercial SIGINT)',
    altKm: 575, incDeg: 97.8, purpose: 'RF geolocation · TDOA/FDOA',
    aos: '09:22:14Z', los: '09:31:47Z', tca: '09:26:58Z',
    maxElev: 62, azAtTca: 186, status: 'tasked',
    tasked: 'R-73 TIRADA-2 TDOA cluster', linkedTimeline: 'T-22:00',
  },
  {
    id: 'SAT-02', name: 'LACROSSE-5', operator: 'US NRO (SAR ISR)',
    altKm: 718, incDeg: 68.0, purpose: 'SAR imaging · all-weather',
    aos: '09:41:02Z', los: '09:49:35Z', tca: '09:45:18Z',
    maxElev: 48, azAtTca: 72, status: 'on-station',
    tasked: 'Suwałki Gap damage assessment',
  },
  {
    id: 'SAT-03', name: 'USA-245 (GPS III-2)', operator: 'USSF / NAVSTAR',
    altKm: 20200, incDeg: 55.0, purpose: 'PNT · M-code',
    aos: '—', los: '—', tca: 'continuous',
    maxElev: 43, azAtTca: 210, status: 'degraded (L1 jam)',
    tasked: 'M-code failover active', linkedTimeline: 'T-12:00',
  },
  {
    id: 'SAT-04', name: 'AEHF-4', operator: 'USSF SATCOM',
    altKm: 35786, incDeg: 0.1, purpose: 'Protected MILSATCOM',
    aos: 'continuous', los: '—', tca: 'continuous',
    maxElev: 34, azAtTca: 165, status: 'reroute complete',
    tasked: 'SATCOM corridor for air package', linkedTimeline: 'T-15:00',
  },
];

// Pre-computed ground track sample points (lon, lat) for animation.
// Simple circular-orbit approximation — prototype demo data.
function _gt(lat0, lon0, inc, durationMin, pts = 80) {
  const out = [];
  const deg = Math.PI / 180;
  for (let i = 0; i < pts; i++) {
    const frac = (i - pts/2) / pts;
    const u = frac * durationMin * 3.6; // orbital angle in degrees
    const lat = Math.asin(Math.sin(inc * deg) * Math.sin(u * deg)) / deg;
    const lon = lon0 + Math.atan2(Math.cos(inc * deg) * Math.sin(u * deg), Math.cos(u * deg)) / deg;
    out.push([((lon + 540) % 360) - 180, lat0 + lat * 0.55]);
  }
  return out;
}

export const satTracks = {
  'SAT-01': _gt(54.0, 21.5, 97.8, 9, 80),
  'SAT-02': _gt(54.2, 20.8, 68.0, 8, 80),
  'SAT-03': _gt(46.0, 24.0, 55.0, 360, 120), // MEO, wide arc
  'SAT-04': [[24.0, 0], [24.0, 0]], // GEO, fixed sub-point
};

export const satFootprints = [
  { id: 'SAT-01', lat: 54.1, lon: 23.0, radiusKm: 2100, color: 'space' },
  { id: 'SAT-02', lat: 54.4, lon: 22.2, radiusKm: 1800, color: 'space' },
];

// GPS spoofing zones — distinct from RF jamming. Spoofed coord is where GNSS "claims" to be.
export const gpsSpoofZones = [
  {
    id: 'GS-01', lat: 54.40, lon: 20.95, radiusKm: 55,
    spoofCoord: [54.82, 22.40], // false position pushed ~90 km east
    confidence: 0.88, firstSeen: '08:51:22Z', t: 'T-34:00',
    emitter: 'R-91', affected: 'Civil aviation NOTAM · drone nav',
  },
  {
    id: 'GS-02', lat: 54.10, lon: 22.35, radiusKm: 28,
    spoofCoord: [53.95, 22.70],
    confidence: 0.62, firstSeen: '09:35:40Z', t: 'T+03:00',
    emitter: 'R-05', affected: 'Unknown drone / UA swarm candidate',
  },
];

// ============= MULTI-DOMAIN TIMELINE =============
// Unified timeline weaving EW, CYBER, and SPACE events against H-hour.
export const multiDomainTimeline = [
  { t: 'T-60:00', tmin: -60, dom: 'ew',    title: 'Continuous ES on R-37/R-12/R-44/R-91', detail: 'RC-135V + RAF Airseeker persistent collection.' },
  { t: 'T-48:00', tmin: -48, dom: 'cyber', title: 'External recon on LTU C2 perimeter', detail: 'APT28 scanning TCP 443/8443 — isolate-in-place posture.' },
  { t: 'T-40:00', tmin: -40, dom: 'ew',    title: 'MALD-J decoy swarm staging', detail: '24× MALD-J loaded on F-15E pairs.' },
  { t: 'T-34:00', tmin: -34, dom: 'space', title: 'GPS spoofing zone GS-01 detected', detail: 'POLE-21 cluster induces false PNT push.' },
  { t: 'T-30:00', tmin: -30, dom: 'ew',    title: 'EMCON BRAVO posture armed', detail: 'Comms discipline enforced across JOA BALTIC.' },
  { t: 'T-28:00', tmin: -28, dom: 'cyber', title: 'PL JW GROM spearphish delivered', detail: '1 beacon confirmed — network isolated, honeypot active.' },
  { t: 'T-22:00', tmin: -22, dom: 'space', title: 'HE360 CLUSTER-8A AOS window opens', detail: 'TDOA cluster tasking on R-73 TIRADA-2.' },
  { t: 'T-20:00', tmin: -20, dom: 'ew',    title: 'Link-16 EPM mode on all platforms', detail: 'Frequency-hopping EP baseline established.' },
  { t: 'T-18:00', tmin: -18, dom: 'ew',    title: 'EC-37B Compass Call on-station', detail: 'Begin COMINT suppression of R-21 LEER-3.' },
  { t: 'T-15:00', tmin: -15, dom: 'space', title: 'SATCOM reroute to AEHF-4 complete', detail: 'Protected comms path confirmed.' },
  { t: 'T-12:00', tmin: -12, dom: 'space', title: 'M-code GPS failover for air package', detail: 'PNT resiliency enabled; L1 denied region bypassed.' },
  { t: 'T-08:00', tmin:  -8, dom: 'ew',    title: 'EAGLE-2/3 NGJ-MB vs R-37 / R-12', detail: 'Reactive EA on ingress corridor.' },
  { t: 'T-04:00', tmin:  -4, dom: 'ew',    title: 'HARM engagement R-91 POLE-21', detail: 'Pending JFACC ROE release.' },
  { t: 'T-04:00', tmin:  -4, dom: 'cyber', title: 'Lateral movement detected at JEWCS ALPHA', detail: 'Pass-the-hash to DCs — containment in progress.' },
  { t: 'T+00:00', tmin:   0, dom: 'ew',    title: 'Corridor opens · air package transit', detail: 'Effects converge at H-hour.' },
  { t: 'T+02:00', tmin:   2, dom: 'cyber', title: 'Sandworm hybrid disruption on 5G MME', detail: 'Coordinated with LEER-3 RF suppression — civil/mil denial.' },
  { t: 'T+05:00', tmin:   5, dom: 'cyber', title: 'Silent Sentry exfil staging detected', detail: 'Beacon dormant — containment queued.' },
  { t: 'T+08:00', tmin:   8, dom: 'space', title: 'LACROSSE-5 SAR pass · BDA', detail: 'All-weather damage assessment.' },
];

// ============= Sequencer entries =============
export const effectsSeq = {
  ea: [
    { id: 'EA-1', name: 'EC-37B · Suppress R-21 COMINT', platform: 'B-01', target: 'R-21',
      band: 'UHF 900 MHz', start: 'T-18:00', dur: '42m', progress: 0.62, level: 'amber' },
    { id: 'EA-2', name: 'EAGLE-2 · NGJ-MB vs R-37', platform: 'B-02', target: 'R-37',
      band: 'S 2.95 GHz', start: 'T-08:00', dur: '12m', progress: 0.18, level: 'red' },
    { id: 'EA-3', name: 'EAGLE-3 · NGJ-MB vs R-12', platform: 'B-03', target: 'R-12',
      band: 'X 8.4 GHz', start: 'T-08:00', dur: '12m', progress: 0.18, level: 'red' },
    { id: 'EA-4', name: 'HARM Engagement · R-91', platform: 'B-02', target: 'R-91',
      band: 'L 1.575 GHz', start: 'T-04:00', dur: '90s', progress: 0.0, level: 'red', pending: true },
    { id: 'EA-5', name: 'MALD-J Screen · Corridor', platform: 'External', target: 'Multi',
      band: 'Multi', start: 'T-30:00', dur: '14m', progress: 1.0, level: 'green' },
  ],
  ep: [
    { id: 'EP-1', name: 'M-code GPS failover · Air package', platform: 'All', target: 'Friendly',
      band: 'L 1.575 GHz', start: 'T-12:00', dur: 'persistent', progress: 0.85, level: 'green' },
    { id: 'EP-2', name: 'Link-16 EPM mode on · All platforms', platform: 'All', target: 'Friendly',
      band: 'UHF', start: 'T-20:00', dur: 'persistent', progress: 1.0, level: 'green' },
    { id: 'EP-3', name: 'SATCOM reroute to AEHF-4', platform: 'Net', target: 'Friendly',
      band: 'Ka', start: 'T-15:00', dur: 'persistent', progress: 0.92, level: 'green' },
    { id: 'EP-4', name: 'EMCON posture BRAVO · comms discipline', platform: 'All', target: 'Friendly',
      band: 'All', start: 'T-30:00', dur: 'persistent', progress: 1.0, level: 'amber' },
  ],
  es: [
    { id: 'ES-1', name: 'RC-135V · Geoloc refinement R-44', platform: 'B-10', target: 'R-44',
      band: 'X', start: 'T-40:00', dur: 'continuous', progress: 0.70, level: 'amber' },
    { id: 'ES-2', name: 'HawkEye-360 · TDOA cluster R-73', platform: 'B-60', target: 'R-73',
      band: 'Ku', start: 'T-22:00', dur: '8m', progress: 0.35, level: 'amber' },
    { id: 'ES-3', name: 'Silent Sentry · Passive track R-12', platform: 'B-40', target: 'R-12',
      band: 'VHF', start: 'T-60:00', dur: 'continuous', progress: 0.88, level: 'green' },
    { id: 'ES-4', name: 'JEWCS ALPHA · DF on R-05 unknown', platform: 'B-20', target: 'R-05',
      band: 'S', start: 'T-02:00', dur: '—', progress: 0.12, level: 'amber' },
  ],
  cyber: [
    { id: 'CYA-1', name: 'Isolate PL SOF enclave · beacon contain', platform: 'NCIRC-FWD', target: 'NET-4',
      band: 'HTTPS 443', start: 'T-27:00', dur: 'persistent', progress: 0.74, level: 'amber' },
    { id: 'CYA-2', name: 'Null-route KGD fast-flux C2', platform: 'SOC', target: 'NET-7',
      band: 'IP 185.x/24', start: 'T-20:00', dur: 'persistent', progress: 0.91, level: 'green' },
    { id: 'CYA-3', name: 'Deceive lateral movement · canary creds', platform: 'JEWCS-CSIRT', target: 'NET-5',
      band: 'SMB 445', start: 'T-05:00', dur: '20m', progress: 0.22, level: 'red' },
    { id: 'CYA-4', name: 'Hunt Sandworm staging · EDR sweep', platform: 'NCIRC', target: 'Silent Sentry',
      band: 'EDR', start: 'T+04:00', dur: '30m', progress: 0.08, level: 'amber', pending: true },
  ],
  space: [
    { id: 'SP-1', name: 'HE360 CLUSTER-8A · TDOA tasking', platform: 'SAT-01', target: 'R-73',
      band: 'Ku', start: 'T-22:00', dur: '9m', progress: 0.55, level: 'amber' },
    { id: 'SP-2', name: 'AEHF-4 · SATCOM reroute', platform: 'SAT-04', target: 'Friendly',
      band: 'EHF', start: 'T-15:00', dur: 'persistent', progress: 1.0, level: 'green' },
    { id: 'SP-3', name: 'GPS M-code failover · air package', platform: 'SAT-03', target: 'Friendly',
      band: 'L1 M', start: 'T-12:00', dur: 'persistent', progress: 0.92, level: 'green' },
    { id: 'SP-4', name: 'LACROSSE-5 SAR · BDA pass', platform: 'SAT-02', target: 'AO', 
      band: 'SAR X', start: 'T+08:00', dur: '9m', progress: 0.0, level: 'amber', pending: true },
  ],
};
