import { useEffect, useRef, useState, type ElementRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useWarehouseStore } from '../store/warehouseStore';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { planFlight, poseForSelection, sampleFlight, type CameraFlight, type Vec3 } from './cameraFlight';

type Controls = ElementRef<typeof OrbitControls>;

/**
 * Owns the camera. Watches the selected site and flies position + orbit target together.
 * - Retargeting mid-flight starts from the current interpolated pose, so rapid switching never jumps.
 * - Any user drag/zoom cancels the flight and hands control back immediately.
 * - prefers-reduced-motion cuts straight to the destination.
 * - The Canvas is never remounted; only the camera and controls target change.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const [controls, setControls] = useState<Controls | null>(null);
  const flight = useRef<{ plan: CameraFlight; elapsed: number } | null>(null);
  const placed = useRef(false);
  const selectedSiteId = useWarehouseStore((s) => s.selectedSiteId);
  const sites = useWarehouseStore((s) => s.sites);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!controls) return;
    const to = poseForSelection(selectedSiteId, sites);

    if (!placed.current) {
      // First mount: place the camera without animating.
      camera.position.set(...to.position);
      controls.target.set(...to.target);
      controls.update();
      placed.current = true;
      return;
    }

    const from = {
      position: camera.position.toArray() as Vec3,
      target: controls.target.toArray() as Vec3,
    };
    flight.current = { plan: planFlight(from, to, reducedMotion), elapsed: 0 };
  }, [controls, selectedSiteId, sites, camera, reducedMotion]);

  // User input wins over the scripted flight.
  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      flight.current = null;
    };
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, [controls]);

  useFrame((_, delta) => {
    const f = flight.current;
    if (!f || !controls) return;
    // Clamp delta so a dropped frame or a background tab does not skip the whole animation.
    f.elapsed += Math.min(delta, 0.1);
    const { pose, done } = sampleFlight(f.plan, f.elapsed);
    camera.position.set(...pose.position);
    controls.target.set(...pose.target);
    controls.update();
    if (done) flight.current = null;
  });

  return (
    <OrbitControls
      ref={setControls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={30}
      maxDistance={1000}
      maxPolarAngle={Math.PI * 0.42}
      screenSpacePanning={false}
    />
  );
}
