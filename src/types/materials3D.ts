import * as THREE from 'three';

// Enhanced Material Configuration for Phase 4
export interface Material3DConfig {
  id: string;
  name: string;
  category: MaterialCategory;

  // PBR Properties
  baseColor: string;
  roughness: number;
  metalness: number;
  opacity: number;
  emissive?: string;
  emissiveIntensity?: number;

  // Texture Maps
  diffuseMap?: string;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string;
  displacementMap?: string;
  emissiveMap?: string;

  // Texture Settings
  textureRepeat?: { u: number; v: number };
  textureOffset?: { u: number; v: number };
  textureRotation?: number;

  // Material Specific Properties
  clearcoat?: number;
  clearcoatRoughness?: number;
  transmission?: number;
  thickness?: number;
  ior?: number; // Index of refraction

  // Animation Properties
  animated?: boolean;
  animationSpeed?: number;
}

export type MaterialCategory =
  | 'wall'
  | 'floor'
  | 'ceiling'
  | 'door'
  | 'window'
  | 'roof'
  | 'stair'
  | 'furniture'
  | 'landscape'
  | 'custom';

export interface MaterialLibrary {
  category: MaterialCategory;
  materials: Material3DConfig[];
}

export interface TextureInfo {
  url: string;
  type: 'diffuse' | 'normal' | 'roughness' | 'metalness' | 'ao' | 'displacement' | 'emissive';
  size: { width: number; height: number };
  format: string;
}

export interface MaterialPreset {
  id: string;
  name: string;
  description: string;
  materials: Record<MaterialCategory, string>; // Material ID for each category
  preview?: string; // Preview image URL
}

// Lighting Configuration
export interface LightingConfig {
  ambient: {
    intensity: number;
    color: string;
  };
  directional: {
    position: [number, number, number];
    intensity: number;
    color: string;
    shadows: boolean;
    shadowMapSize: number;
  };
  environment: {
    preset: EnvironmentPreset;
    background: boolean;
    intensity: number;
  };
  timeOfDay: {
    hour: number; // 0-23
    season: 'spring' | 'summer' | 'autumn' | 'winter';
  };
  postProcessing: {
    enabled: boolean;
    bloom: boolean;
    ssao: boolean;
    toneMapping: THREE.ToneMapping;
    exposure: number;
  };
}

export type EnvironmentPreset =
  | 'sunset'
  | 'dawn'
  | 'noon'
  | 'night'
  | 'overcast'
  | 'studio'
  | 'warehouse'
  | 'apartment'
  | 'forest'
  | 'city'
  | 'custom';

// Material Application Context
export interface MaterialContext {
  elementType: MaterialCategory;
  elementId: string;
  surface?: 'front' | 'back' | 'top' | 'bottom' | 'left' | 'right' | 'all';
  uvMapping?: 'planar' | 'cylindrical' | 'spherical' | 'box' | 'custom';
}

// Performance and Quality Settings
export interface RenderQuality {
  textureResolution: 'low' | 'medium' | 'high' | 'ultra';
  shadowQuality: 'low' | 'medium' | 'high';
  antiAliasing: boolean;
  postProcessing: boolean;
  maxTextures: number;
  lodEnabled: boolean;
}
