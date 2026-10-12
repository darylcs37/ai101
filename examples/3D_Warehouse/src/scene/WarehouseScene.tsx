import { Canvas } from '@react-three/fiber';
import { CameraRig } from '../camera/CameraRig';
import { CAMERA_FOV } from '../camera/cameraFlight';
import { ALL_SITES, useWarehouseStore } from '../store/warehouseStore';
import { SiteModel } from './SiteModel';
import { COLORS } from './palette';

/** Canvas is mounted once; site switches only move the camera. */
export function WarehouseScene() {
  const sites = useWarehouseStore((s) => s.sites);
  const selected = useWarehouseStore((s) => s.selectedSiteId);

  return (
    <Canvas
      className="scene"
      shadows
      dpr={[1, 2]}
      camera={{ fov: CAMERA_FOV, near: 1, far: 4000, position: [0, 300, 300] }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#0d0e10']} />
      <fog attach="fog" args={['#0d0e10', 700, 1800]} />
      <hemisphereLight args={['#c9d4e3', '#1a1610', 0.55]} />
      <directionalLight
        position={[160, 260, 120]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-320}
        shadow-camera-right={320}
        shadow-camera-top={320}
        shadow-camera-bottom={-320}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2400, 2400]} />
        <meshStandardMaterial color={COLORS.ground} roughness={1} />
      </mesh>
      <gridHelper args={[2400, 120, COLORS.amberDim, '#1c1f23']} position={[0, 0.015, 0]} />

      {sites.map((site) => (
        <SiteModel key={site.id} site={site} selected={selected === ALL_SITES || selected === site.id} />
      ))}

      <CameraRig />
    </Canvas>
  );
}
