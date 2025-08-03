/**
 * Phase 3: Advanced Architectural View Presets
 *
 * Professional camera preset configurations for architectural visualization
 */

import * as THREE from 'three';
import { CameraState } from '@/types';

export interface ViewPreset {
  name: string;
  icon: string;
  description: string;
  camera: CameraState;
  orthographic?: boolean;
  fov?: number;
  category: 'architectural' | 'perspective' | 'section';
  shortcut?: string;
}

/**
 * Professional architectural view presets
 */
export const ARCHITECTURAL_VIEW_PRESETS: ViewPreset[] = [
  // Architectural Views
  {
    name: 'Plan',
    icon: '🏠',
    description: 'Top-down architectural plan view',
    category: 'architectural',
    orthographic: true,
    shortcut: 'Ctrl+1',
    camera: {
      position: [0, 50, 0],
      target: [0, 0, 0],
      fov: 50,
      zoom: 1,
    },
  },
  {
    name: 'Front Elevation',
    icon: '📐',
    description: 'Front elevation architectural view',
    category: 'architectural',
    orthographic: true,
    shortcut: 'Ctrl+2',
    camera: {
      position: [0, 10, 30],
      target: [0, 10, 0],
      fov: 60,
      zoom: 1,
    },
  },
  {
    name: 'Side Elevation',
    icon: '📏',
    description: 'Side elevation architectural view',
    category: 'architectural',
    orthographic: true,
    shortcut: 'Ctrl+3',
    camera: {
      position: [30, 10, 0],
      target: [0, 10, 0],
      fov: 60,
      zoom: 1,
    },
  },
  {
    name: 'Back Elevation',
    icon: '🏗️',
    description: 'Back elevation architectural view',
    category: 'architectural',
    orthographic: true,
    shortcut: 'Ctrl+4',
    camera: {
      position: [0, 10, -30],
      target: [0, 10, 0],
      fov: 60,
      zoom: 1,
    },
  },

  // 3D Perspective Views
  {
    name: 'Isometric',
    icon: '📦',
    description: 'Three-dimensional isometric view',
    category: 'perspective',
    shortcut: 'Ctrl+5',
    camera: {
      position: [20, 15, 20],
      target: [0, 5, 0],
      fov: 75,
      zoom: 1,
    },
  },
  {
    name: 'Bird\'s Eye',
    icon: '🦅',
    description: 'High-angle overview perspective',
    category: 'perspective',
    shortcut: 'Ctrl+6',
    camera: {
      position: [15, 25, 15],
      target: [0, 0, 0],
      fov: 65,
      zoom: 1,
    },
  },
  {
    name: 'Street View',
    icon: '🏘️',
    description: 'Ground-level street perspective',
    category: 'perspective',
    shortcut: 'Ctrl+7',
    camera: {
      position: [0, 2, 25],
      target: [0, 8, 0],
      fov: 85,
      zoom: 1,
    },
  },

  // Interior Views
  {
    name: 'Interior Walk',
    icon: '🚶',
    description: 'Interior walk-through perspective',
    category: 'perspective',
    shortcut: 'Ctrl+8',
    camera: {
      position: [0, 7, 0],
      target: [10, 7, 0],
      fov: 90,
      zoom: 1,
    },
  },
  {
    name: 'Room Corner',
    icon: '🏠',
    description: 'Room corner perspective view',
    category: 'perspective',
    shortcut: 'Ctrl+9',
    camera: {
      position: [-8, 8, -8],
      target: [0, 4, 0],
      fov: 75,
      zoom: 1,
    },
  },

  // Section Views
  {
    name: 'Section Cut',
    icon: '✂️',
    description: 'Cross-section architectural view',
    category: 'section',
    shortcut: 'Ctrl+0',
    camera: {
      position: [25, 10, 0],
      target: [0, 10, 0],
      fov: 60,
      zoom: 1,
    },
  },
];

/**
 * Get view preset by name
 */
export function getViewPreset(name: string): ViewPreset | undefined {
  return ARCHITECTURAL_VIEW_PRESETS.find(preset => preset.name === name);
}

/**
 * Get view presets by category
 */
export function getViewPresetsByCategory(category: ViewPreset['category']): ViewPreset[] {
  return ARCHITECTURAL_VIEW_PRESETS.filter(preset => preset.category === category);
}

/**
 * Calculate adaptive camera position based on model bounds
 */
export function calculateAdaptiveCameraPosition(
  bounds: THREE.Box3,
  presetName: string
): CameraState {
  const preset = getViewPreset(presetName);
  if (!preset) return ARCHITECTURAL_VIEW_PRESETS[0].camera;

  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  // Scale camera distance based on model size
  const scaleFactor = Math.max(1, maxDim / 10);

  return {
    position: [
      center.x + preset.camera.position[0] * scaleFactor,
      center.y + preset.camera.position[1] * scaleFactor,
      center.z + preset.camera.position[2] * scaleFactor,
    ],
    target: [center.x, center.y, center.z],
    fov: preset.camera.fov,
    zoom: preset.camera.zoom,
  };
}

/**
 * Animate between view presets with smooth transition
 */
export function createViewTransition(
  fromCamera: CameraState,
  toPreset: ViewPreset,
  _duration: number = 1500
): (progress: number) => CameraState {
  return (progress: number) => {
    const t = Math.min(Math.max(progress, 0), 1);

    // Smooth easing function (cubic ease out)
    const eased = 1 - Math.pow(1 - t, 3);

    return {
      position: [
        fromCamera.position[0] + (toPreset.camera.position[0] - fromCamera.position[0]) * eased,
        fromCamera.position[1] + (toPreset.camera.position[1] - fromCamera.position[1]) * eased,
        fromCamera.position[2] + (toPreset.camera.position[2] - fromCamera.position[2]) * eased,
      ],
      target: [
        fromCamera.target[0] + (toPreset.camera.target[0] - fromCamera.target[0]) * eased,
        fromCamera.target[1] + (toPreset.camera.target[1] - fromCamera.target[1]) * eased,
        fromCamera.target[2] + (toPreset.camera.target[2] - fromCamera.target[2]) * eased,
      ],
      fov: fromCamera.fov + (toPreset.camera.fov - fromCamera.fov) * eased,
      zoom: fromCamera.zoom + (toPreset.camera.zoom - fromCamera.zoom) * eased,
    };
  };
}

/**
 * Get keyboard shortcut for view preset
 */
export function getViewPresetShortcut(presetName: string): string | undefined {
  const preset = getViewPreset(presetName);
  return preset?.shortcut;
}

/**
 * Default camera settings for different view types
 */
export const DEFAULT_CAMERA_SETTINGS = {
  architectural: {
    orthographic: true,
    fov: 50,
    near: 0.1,
    far: 1000,
    controls: {
      enableDamping: false,
      enablePan: true,
      enableZoom: true,
      enableRotate: false,
    },
  },
  perspective: {
    orthographic: false,
    fov: 75,
    near: 0.1,
    far: 1000,
    controls: {
      enableDamping: true,
      dampingFactor: 0.05,
      enablePan: true,
      enableZoom: true,
      enableRotate: true,
    },
  },
  section: {
    orthographic: true,
    fov: 60,
    near: 0.1,
    far: 1000,
    controls: {
      enableDamping: false,
      enablePan: true,
      enableZoom: true,
      enableRotate: false,
    },
  },
};
