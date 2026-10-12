# WareTrack — site selector, camera flight and live KPI panel

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # KPI, simulation-invariant and camera-flight tests
npm run build      # typecheck + production build
```

## Layout

| Path | Role |
|---|---|
| `src/data/` | Types and deterministic seed (3 sites, 18 docks, 12 trucks, 8 forklifts, 40 SKU/bin records, 25 shipments). |
| `src/simulation/engine.ts` | Pure `tick()`: truck lifecycle, dock occupancy, arrivals, inventory moves. No mutation. |
| `src/simulation/liveUpdates.ts` | 2 s timer; pauses while the tab is hidden. |
| `src/store/warehouseStore.ts` | Zustand store: live state, `selectedSiteId` (`'ALL'` = network), run/pause. |
| `src/selectors/kpis.ts` | Pure KPI computation from live state. |
| `src/camera/cameraFlight.ts` | Pose per site, flight planning, eased + arced interpolation (pure, tested). |
| `src/camera/CameraRig.tsx` | Drives camera + OrbitControls target per frame; user drag cancels the flight. |
| `src/components/` | `TopBar`, `SiteSelector`, `KpiPanel`, `Sparkline`. |
| `src/scene/` | Presentation-only 3D: warehouses, docks, trucks, forklifts. |

## KPI definitions

- **On-time delivery** — completed shipments whose dock arrival ≤ ETA ÷ completed shipments with a recorded arrival (rolling 20 per site). Green ≥ 95 %, amber ≥ 85 %, red below. Open shipments past ETA are shown as "running late".
- **Docks in use** — occupied ÷ total docks; maintenance docks reported separately.
- **Active trucks** — en route + docked; trucks waiting at the gate for a free dock are flagged "queued".
- **Low-stock alerts** — SKU/bin records where on hand − reserved ≤ reorder point; critical when nothing is available.

## Controls

Click a site in the top bar, use ←/→ inside the selector, or press 0–3 anywhere (0 = network overview).
Drag to orbit; dragging interrupts a camera flight. `prefers-reduced-motion` cuts directly to the target.

## Integrating into an existing WareTrack scene

Keep your scene meshes; mount `<CameraRig />` inside your existing `<Canvas>` (remove any other `OrbitControls`),
render `<TopBar />` and `<KpiPanel />` outside the Canvas, and point `poseForSite` at your site coordinates.
If your store already exists, add `selectedSiteId` + `selectSite` and feed `computeKpis()` from your slices.
