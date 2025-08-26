import * as THREE from 'three';

export interface Window3DGeometry {
  width: number;
  height: number;
  thickness: number;
  frameWidth?: number;
  frameDepth?: number;
  sillHeight?: number;
  sillDepth?: number;
}

export interface Window3DPosition {
  wallId: string;
  position: number; // Percentage along wall (0-100)
  height: number; // Height from floor
  rotation: THREE.Euler;
  worldPosition: THREE.Vector3;
}

export interface Window3DGlazing {
  type: 'single' | 'double' | 'triple';
  paneThickness: number;
  airGap?: number; // For double/triple glazing
  tint?: string;
  opacity: number;
  reflectivity: number;
  transmittance: number;
}

export interface Window3DMaterial {
  frameMaterialId?: string;
  glassMaterialId?: string;
  sillMaterialId?: string;
  frameColor?: string;
  glassColor?: string;
  sillColor?: string;
  frameTexture?: string;
  roughness?: number;
  metalness?: number;
}

export interface Window3DOperating {
  type: 'fixed' | 'casement' | 'sliding' | 'awning' | 'hopper' | 'double-hung';
  isOperable: boolean;
  isOpen?: boolean;
  openAngle?: number; // For casement/awning windows
  openPosition?: number; // For sliding windows (0-1)
  operatingDirection?: 'left' | 'right' | 'up' | 'down' | 'both';
}

export interface Window3DProperties {
  id: string;
  style: 'modern' | 'traditional' | 'industrial' | 'colonial' | 'contemporary';
  geometry: Window3DGeometry;
  position: Window3DPosition;
  glazing: Window3DGlazing;
  material: Window3DMaterial;
  operating: Window3DOperating;
  isSelected?: boolean;
  isHovered?: boolean;
  metadata?: Record<string, unknown>;
}

export interface Window3DEvents {
  onClick?: (window: Window3DProperties, event: THREE.Event) => void;
  onHover?: (window: Window3DProperties, event: THREE.Event) => void;
  onSelect?: (window: Window3DProperties) => void;
  onOpen?: (window: Window3DProperties) => void;
  onClose?: (window: Window3DProperties) => void;
}

export interface Window3DRenderOptions {
  showFrame?: boolean;
  showSill?: boolean;
  showGlass?: boolean;
  showReflections?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
  opacity?: number;
  renderOrder?: number;
}

export interface Window3DLighting {
  allowsLight?: boolean;
  lightTransmission?: number;
  lightColor?: string;
  lightIntensity?: number;
  lightDistance?: number;
  lightDecay?: number;
  castLightShadows?: boolean;
}

export interface Window3DWeather {
  rainEffects?: boolean;
  condensation?: boolean;
  frost?: boolean;
  weatherStripping?: boolean;
}
