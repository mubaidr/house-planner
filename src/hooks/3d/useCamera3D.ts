import { useThree } from '@react-three/fiber';
import { useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { CameraPreset, getCameraPreset } from '@/components/Canvas3D/Camera/CameraPresets';

export interface CameraControls {
  setPreset: (presetName: string) => void;
  animateToPosition: (position: THREE.Vector3, target: THREE.Vector3, duration?: number) => void;
  getCurrentPosition: () => THREE.Vector3;
  getCurrentTarget: () => THREE.Vector3;
  resetCamera: () => void;
}

export function useCamera3D(): CameraControls {
  const { camera, controls } = useThree();

  const setPreset = useCallback((presetName: string) => {
    const preset = getCameraPreset(presetName);
    if (!preset) return;

    camera.position.copy(preset.position);
    if (controls && 'target' in controls) {
      (controls as any).target.copy(preset.target);
      (controls as any).update();
    }
  }, [camera, controls]);

  const animateToPosition = useCallback((
    position: THREE.Vector3,
    target: THREE.Vector3,
    duration: number = 1000
  ) => {
    const startPosition = camera.position.clone();
    const startTarget = controls && 'target' in controls 
      ? (controls as any).target.clone() 
      : new THREE.Vector3();

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate position
      camera.position.lerpVectors(startPosition, position, eased);
      
      // Interpolate target if controls exist
      if (controls && 'target' in controls) {
        (controls as any).target.lerpVectors(startTarget, target, eased);
        (controls as any).update();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [camera, controls]);

  const getCurrentPosition = useCallback(() => {
    return camera.position.clone();
  }, [camera]);

  const getCurrentTarget = useCallback(() => {
    if (controls && 'target' in controls) {
      return (controls as any).target.clone();
    }
    return new THREE.Vector3();
  }, [controls]);

  const resetCamera = useCallback(() => {
    setPreset('Default');
  }, [setPreset]);

  // Set default camera position on mount
  useEffect(() => {
    resetCamera();
  }, [resetCamera]);

  return {
    setPreset,
    animateToPosition,
    getCurrentPosition,
    getCurrentTarget,
    resetCamera
  };
}