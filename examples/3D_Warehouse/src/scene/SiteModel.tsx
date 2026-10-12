import { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useShallow } from 'zustand/react/shallow';
import type { Group } from 'three';
import { MathUtils } from 'three';
import type { Dock, Forklift, Site, Truck } from '../data/types';
import { useWarehouseStore } from '../store/warehouseStore';
import { BUILDING, dockPosition, toWorld, truckPosition } from './layout';
import { COLORS, DOCK_COLORS, FORKLIFT_COLORS, TRUCK_COLORS } from './palette';
import type { Vec3 } from '../camera/cameraFlight';

/** Presentation only: reads state, maps it to geometry and colour. */
export const SiteModel = memo(function SiteModel({ site, selected }: { site: Site; selected: boolean }) {
  const docks = useWarehouseStore(useShallow((s) => s.docks.filter((d) => d.siteId === site.id)));
  const trucks = useWarehouseStore(useShallow((s) => s.trucks.filter((t) => t.siteId === site.id)));
  const forklifts = useWarehouseStore(useShallow((s) => s.forklifts.filter((f) => f.siteId === site.id)));

  const center = toWorld(site, 0, 0, 0);
  const heading = site.layout.heading;

  const dockSlotByTruck = useMemo(() => {
    const m = new Map<string, number>();
    docks.forEach((d) => d.truckId && m.set(d.truckId, d.slot));
    return m;
  }, [docks]);

  return (
    <group>
      {/* Concrete pad */}
      <mesh position={[center[0], 0.01, center[2]]} rotation={[-Math.PI / 2, 0, -heading]} receiveShadow>
        <planeGeometry args={[BUILDING.width + 40, BUILDING.depth + 50]} />
        <meshStandardMaterial color={COLORS.pad} roughness={1} />
      </mesh>

      {/* Selection ring */}
      <mesh position={[center[0], 0.03, center[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[44, 45.2, 96]} />
        <meshBasicMaterial color={COLORS.amber} transparent opacity={selected ? 0.85 : 0.12} />
      </mesh>

      {/* Approach road */}
      <Road site={site} />

      {/* Warehouse shell */}
      <group position={[center[0], 0, center[2]]} rotation={[0, heading, 0]}>
        <mesh position={[0, BUILDING.height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[BUILDING.width, BUILDING.height, BUILDING.depth]} />
          <meshStandardMaterial color={COLORS.building} roughness={0.85} metalness={0.15} />
        </mesh>
        <mesh position={[0, BUILDING.height + 0.25, 0]} castShadow>
          <boxGeometry args={[BUILDING.width + 0.6, 0.5, BUILDING.depth + 0.6]} />
          <meshStandardMaterial color={COLORS.roof} roughness={0.7} />
        </mesh>
        {/* Amber fascia stripe */}
        <mesh position={[0, BUILDING.height - 0.6, BUILDING.depth / 2 + 0.02]}>
          <planeGeometry args={[BUILDING.width, 0.5]} />
          <meshBasicMaterial color={COLORS.trim} />
        </mesh>
      </group>

      {docks.map((d) => (
        <DockPlate key={d.id} site={site} dock={d} count={docks.length} />
      ))}

      {trucks.map((t, i) => (
        <TruckModel key={t.id} truck={t} site={site} slot={dockSlotByTruck.get(t.id) ?? null} dockCount={docks.length} index={i} />
      ))}

      {forklifts.map((f, i) => (
        <ForkliftModel key={f.id} forklift={f} site={site} index={i} />
      ))}

      <Html position={[center[0], BUILDING.height + 6, center[2]]} center distanceFactor={80} zIndexRange={[5, 0]}>
        <div className={`site-tag ${selected ? 'is-selected' : ''}`}>
          <span className="site-tag__code">{site.code}</span>
          <span className="site-tag__name">{site.name}</span>
        </div>
      </Html>
    </group>
  );
});

function Road({ site }: { site: Site }) {
  const a = toWorld(site, 110, 31.6, 0.02);
  const b = toWorld(site, 20, 31.6, 0.02);
  const mid: Vec3 = [(a[0] + b[0]) / 2, 0.02, (a[2] + b[2]) / 2];
  return (
    <mesh position={mid} rotation={[-Math.PI / 2, 0, site.layout.heading]} receiveShadow>
      <planeGeometry args={[90, 9]} />
      <meshStandardMaterial color={COLORS.road} roughness={1} />
    </mesh>
  );
}

function DockPlate({ site, dock, count }: { site: Site; dock: Dock; count: number }) {
  const pos = dockPosition(site, dock.slot, count);
  return (
    <group position={pos} rotation={[0, site.layout.heading, 0]}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[5, 0.12, 3]} />
        <meshStandardMaterial color={DOCK_COLORS[dock.status]} emissive={DOCK_COLORS[dock.status]} emissiveIntensity={dock.status === 'occupied' ? 0.35 : 0.08} />
      </mesh>
      {/* Dock door */}
      <mesh position={[0, 2.2, -1.48]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color={dock.status === 'occupied' ? '#3b3020' : '#1a1c1f'} />
      </mesh>
    </group>
  );
}

/** Truck eases toward its target position each frame so state changes read as motion, not teleports. */
function TruckModel(props: { truck: Truck; site: Site; slot: number | null; dockCount: number; index: number }) {
  const { truck, site, slot, dockCount, index } = props;
  const ref = useRef<Group>(null);
  const target = truckPosition(truck, site, slot, dockCount, index);
  const color = TRUCK_COLORS[truck.status];

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-delta * 2.5);
    g.position.x = MathUtils.lerp(g.position.x, target.position[0], k);
    g.position.z = MathUtils.lerp(g.position.z, target.position[2], k);
    g.rotation.y = MathUtils.lerp(g.rotation.y, target.rotationY, k);
  });

  return (
    <group ref={ref} position={target.position} rotation={[0, target.rotationY, 0]}>
      {/* Trailer */}
      <mesh position={[0, 1.6, 1.2]} castShadow>
        <boxGeometry args={[2.4, 2.6, 7]} />
        <meshStandardMaterial color="#c9ccd1" roughness={0.6} />
      </mesh>
      {/* Cab tinted by status */}
      <mesh position={[0, 1.3, -3.2]} castShadow>
        <boxGeometry args={[2.4, 2.2, 1.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ForkliftModel({ forklift, site, index }: { forklift: Forklift; site: Site; index: number }) {
  const ref = useRef<Group>(null);
  const base = toWorld(site, -12 + index * 9, BUILDING.depth / 2 + 10, 0);
  const moving = forklift.status === 'moving' || forklift.status === 'lifting';

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime + index * 1.7;
    g.position.x = base[0] + (moving ? Math.sin(t * 0.6) * 4 : 0);
    g.position.z = base[2] + (moving ? Math.cos(t * 0.45) * 1.5 : 0);
  });

  return (
    <group ref={ref} position={base}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.4, 1.2, 2]} />
        <meshStandardMaterial color={FORKLIFT_COLORS[forklift.status]} roughness={0.5} />
      </mesh>
      <mesh position={[0, forklift.status === 'lifting' ? 1.6 : 0.4, -1.3]}>
        <boxGeometry args={[1.2, 0.12, 1]} />
        <meshStandardMaterial color={COLORS.steel} />
      </mesh>
    </group>
  );
}
