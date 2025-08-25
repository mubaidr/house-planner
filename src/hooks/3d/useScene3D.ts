import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';

export interface Scene3DSettings {
  backgroundColor: string;
  fogEnabled: boolean;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  gridEnabled: boolean;
  gridSize: number;
  gridDivisions: number;
  axesEnabled: boolean;
  shadowsEnabled: boolean;
  shadowMapSize: number;
}

export interface Scene3DActions {
  updateSettings: (settings: Partial<Scene3DSettings>) => void;
  addObject: (object: THREE.Object3D) => void;
  removeObject: (object: THREE.Object3D) => void;
  clearScene: () => void;
  getObjectById: (id: string) => THREE.Object3D | undefined;
  getObjectsByType: (type: string) => THREE.Object3D[];
  exportScene: () => THREE.Scene;
}

const defaultSettings: Scene3DSettings = {
  backgroundColor: '#f0f0f0',
  fogEnabled: false,
  fogColor: '#ffffff',
  fogNear: 10,
  fogFar: 100,
  gridEnabled: true,
  gridSize: 20,
  gridDivisions: 20,
  axesEnabled: false,
  shadowsEnabled: true,
  shadowMapSize: 2048,
};

export function useScene3D(): [Scene3DSettings, Scene3DActions] {
  const { scene, gl } = useThree();
  const [settings, setSettings] = useState<Scene3DSettings>(defaultSettings);

  // Apply scene settings
  useEffect(() => {
    // Background color
    scene.background = new THREE.Color(settings.backgroundColor);

    // Fog
    if (settings.fogEnabled) {
      scene.fog = new THREE.Fog(settings.fogColor, settings.fogNear, settings.fogFar);
    } else {
      scene.fog = null;
    }

    // Shadows
    gl.shadowMap.enabled = settings.shadowsEnabled;
    if (settings.shadowsEnabled) {
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
      // Update shadow map size for all lights in the scene
      scene.traverse((object) => {
        if (object instanceof THREE.Light && object.castShadow) {
          object.shadow.mapSize.width = settings.shadowMapSize;
          object.shadow.mapSize.height = settings.shadowMapSize;
        }
      });
    }
  }, [scene, gl, settings]);

  const updateSettings = useCallback((newSettings: Partial<Scene3DSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const addObject = useCallback(
    (object: THREE.Object3D) => {
      scene.add(object);
    },
    [scene]
  );

  const removeObject = useCallback(
    (object: THREE.Object3D) => {
      scene.remove(object);
    },
    [scene]
  );

  const clearScene = useCallback(() => {
    // Remove all objects except lights and camera
    const objectsToRemove: THREE.Object3D[] = [];
    scene.traverse(object => {
      if (!(object instanceof THREE.Light) && !(object instanceof THREE.Camera)) {
        objectsToRemove.push(object);
      }
    });

    objectsToRemove.forEach(object => {
      if (object.parent) {
        object.parent.remove(object);
      }
    });
  }, [scene]);

  const getObjectById = useCallback(
    (id: string): THREE.Object3D | undefined => {
      return scene.getObjectById(parseInt(id));
    },
    [scene]
  );

  const getObjectsByType = useCallback(
    (type: string): THREE.Object3D[] => {
      const objects: THREE.Object3D[] = [];
      scene.traverse(object => {
        if (object.userData.type === type) {
          objects.push(object);
        }
      });
      return objects;
    },
    [scene]
  );

  const exportScene = useCallback((): THREE.Scene => {
    return scene.clone();
  }, [scene]);

  const actions: Scene3DActions = {
    updateSettings,
    addObject,
    removeObject,
    clearScene,
    getObjectById,
    getObjectsByType,
    exportScene,
  };

  return [settings, actions];
}
