import * as THREE from 'three';

export interface CameraPreset {
  name: string;
  position: THREE.Vector3;
  target: THREE.Vector3;
  description: string;
}

export const cameraPresets: CameraPreset[] = [
  {
    name: 'Default',
    position: new THREE.Vector3(10, 10, 10),
    target: new THREE.Vector3(0, 0, 0),
    description: 'Default perspective view',
  },
  {
    name: 'Front View',
    position: new THREE.Vector3(0, 5, 15),
    target: new THREE.Vector3(0, 2, 0),
    description: 'Front elevation view',
  },
  {
    name: 'Side View',
    position: new THREE.Vector3(15, 5, 0),
    target: new THREE.Vector3(0, 2, 0),
    description: 'Side elevation view',
  },
  {
    name: 'Top View',
    position: new THREE.Vector3(0, 20, 0),
    target: new THREE.Vector3(0, 0, 0),
    description: 'Top-down floor plan view',
  },
  {
    name: 'Isometric',
    position: new THREE.Vector3(10, 10, 10),
    target: new THREE.Vector3(0, 0, 0),
    description: 'Isometric perspective',
  },
  {
    name: 'Interior',
    position: new THREE.Vector3(2, 1.8, 2),
    target: new THREE.Vector3(0, 1.8, 0),
    description: 'Interior walkthrough view',
  },
  {
    name: 'Aerial',
    position: new THREE.Vector3(0, 30, 20),
    target: new THREE.Vector3(0, 0, 0),
    description: 'Aerial overview',
  },
];

export function getCameraPreset(name: string): CameraPreset | undefined {
  return cameraPresets.find(preset => preset.name === name);
}

export function getPresetNames(): string[] {
  return cameraPresets.map(preset => preset.name);
}
