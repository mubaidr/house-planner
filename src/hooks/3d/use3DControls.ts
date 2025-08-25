import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useState } from 'react';

export interface Controls3D {
  enableOrbit: boolean;
  enablePan: boolean;
  enableZoom: boolean;
  enableDamping: boolean;
  dampingFactor: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
}

export interface Controls3DActions {
  updateControls: (settings: Partial<Controls3D>) => void;
  enableControls: () => void;
  disableControls: () => void;
  resetControls: () => void;
  saveState: () => void;
  restoreState: () => void;
}

const defaultControls: Controls3D = {
  enableOrbit: true,
  enablePan: true,
  enableZoom: true,
  enableDamping: true,
  dampingFactor: 0.05,
  minDistance: 1,
  maxDistance: 100,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI,
  autoRotate: false,
  autoRotateSpeed: 2.0,
};

export function use3DControls(): [Controls3D, Controls3DActions] {
  const { controls } = useThree();
  const [controlSettings, setControlSettings] = useState<Controls3D>(defaultControls);
  const [savedState, setSavedState] = useState<Partial<Controls3D> | null>(null);

  // Apply control settings to the actual controls
  useEffect(() => {
    if (!controls || !('enableRotate' in controls)) return;

    const orbitControls = controls as any;

    orbitControls.enableRotate = controlSettings.enableOrbit;
    orbitControls.enablePan = controlSettings.enablePan;
    orbitControls.enableZoom = controlSettings.enableZoom;
    orbitControls.enableDamping = controlSettings.enableDamping;
    orbitControls.dampingFactor = controlSettings.dampingFactor;
    orbitControls.minDistance = controlSettings.minDistance;
    orbitControls.maxDistance = controlSettings.maxDistance;
    orbitControls.minPolarAngle = controlSettings.minPolarAngle;
    orbitControls.maxPolarAngle = controlSettings.maxPolarAngle;
    orbitControls.autoRotate = controlSettings.autoRotate;
    orbitControls.autoRotateSpeed = controlSettings.autoRotateSpeed;

    orbitControls.update();
  }, [controls, controlSettings]);

  const updateControls = useCallback((settings: Partial<Controls3D>) => {
    setControlSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const enableControls = useCallback(() => {
    if (!controls || !('enabled' in controls)) return;
    (controls as any).enabled = true;
  }, [controls]);

  const disableControls = useCallback(() => {
    if (!controls || !('enabled' in controls)) return;
    (controls as any).enabled = false;
  }, [controls]);

  const resetControls = useCallback(() => {
    setControlSettings(defaultControls);
    if (controls && 'reset' in controls) {
      (controls as any).reset();
    }
  }, [controls]);

  const saveState = useCallback(() => {
    setSavedState({ ...controlSettings });
  }, [controlSettings]);

  const restoreState = useCallback(() => {
    if (savedState) {
      setControlSettings(prev => ({ ...prev, ...savedState }));
    }
  }, [savedState]);

  const actions: Controls3DActions = {
    updateControls,
    enableControls,
    disableControls,
    resetControls,
    saveState,
    restoreState,
  };

  return [controlSettings, actions];
}
