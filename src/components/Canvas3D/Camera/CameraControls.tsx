import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useDesignStore } from '@/stores/designStore';
import { CameraPreset } from '@/types';
import * as THREE from 'three';

interface CameraControlsProps {
  presets?: Record<CameraPreset, any>;
}

export function CameraControls({ presets: _presets }: CameraControlsProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const { scene3D, updateCameraState } = useDesignStore();

  // Update camera when store changes
  useFrame(() => {
    if (controlsRef.current) {
      const position = camera.position.toArray() as [number, number, number];
      const target = controlsRef.current.target.toArray() as [number, number, number];

      // Only update if changed significantly to avoid excessive updates
      const positionChanged = position.some((val, idx) =>
        Math.abs(val - scene3D.camera.position[idx]) > 0.1
      );
      const targetChanged = target.some((val, idx) =>
        Math.abs(val - scene3D.camera.target[idx]) > 0.1
      );

      if (positionChanged || targetChanged) {
        updateCameraState({
          position,
          target,
          fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : scene3D.camera.fov,
          zoom: camera.zoom,
        });
      }
    }
  });

  // Apply camera state from store
  useEffect(() => {
    if (controlsRef.current && camera) {
      camera.position.set(...scene3D.camera.position);
      controlsRef.current.target.set(...scene3D.camera.target);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = scene3D.camera.fov;
      }
      camera.zoom = scene3D.camera.zoom;
      camera.updateProjectionMatrix();
      controlsRef.current.update();
    }
  }, [scene3D.camera, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      dampingFactor={0.05}
      enableDamping={true}
      maxPolarAngle={Math.PI * 0.48} // Prevent going below ground
      minDistance={1}
      maxDistance={100}
      target={scene3D.camera.target}
    />
  );
}
