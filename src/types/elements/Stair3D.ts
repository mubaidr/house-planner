import * as THREE from 'three';

export interface Stair3DGeometry {
  totalRise: number;
  totalRun: number;
  stepCount: number;
  stepRise: number;
  stepRun: number;
  width: number;
  thickness: number;
  nosing?: number;
}

export interface Stair3DPosition {
  start: THREE.Vector3;
  end: THREE.Vector3;
  center: THREE.Vector3;
  rotation: THREE.Euler;
  landingPositions?: THREE.Vector3[];
}

export interface Stair3DRailing {
  hasHandrail: boolean;
  railingHeight: number;
  railingType: 'simple' | 'balusters' | 'glass' | 'cable' | 'solid';
  railingMaterialId?: string;
  railingColor?: string;
  balusterSpacing?: number;
  balusterCount?: number;
}

export interface Stair3DMaterial {
  stepMaterialId?: string;
  riserMaterialId?: string;
  stringerMaterialId?: string;
  stepColor?: string;
  riserColor?: string;
  stringerColor?: string;
  stepTexture?: string;
  roughness?: number;
  metalness?: number;
}

export interface Stair3DStructure {
  stringerType: 'closed' | 'open' | 'mono' | 'zigzag';
  stringerCount: number;
  stringerWidth: number;
  stringerThickness: number;
  supportType: 'wall-mounted' | 'self-supporting' | 'suspended';
}

export interface Stair3DLanding {
  hasTopLanding: boolean;
  hasBottomLanding: boolean;
  topLandingSize?: { width: number; depth: number };
  bottomLandingSize?: { width: number; depth: number };
  intermediateLandings?: {
    position: number; // Step number
    size: { width: number; depth: number };
  }[];
}

export interface Stair3DProperties {
  id: string;
  type: 'straight' | 'l-shaped' | 'u-shaped' | 'spiral' | 'curved' | 'winder';
  geometry: Stair3DGeometry;
  position: Stair3DPosition;
  railing: Stair3DRailing;
  material: Stair3DMaterial;
  structure: Stair3DStructure;
  landing: Stair3DLanding;
  radius?: number; // For spiral/curved stairs
  spiralDirection?: 'clockwise' | 'counterclockwise'; // For spiral stairs
  isSelected?: boolean;
  isHovered?: boolean;
  metadata?: Record<string, any>;
}

export interface Stair3DEvents {
  onClick?: (stair: Stair3DProperties, event: THREE.Event) => void;
  onHover?: (stair: Stair3DProperties, event: THREE.Event) => void;
  onSelect?: (stair: Stair3DProperties) => void;
  onStepOn?: (stair: Stair3DProperties, stepIndex: number) => void;
}

export interface Stair3DRenderOptions {
  showSteps?: boolean;
  showRisers?: boolean;
  showStringers?: boolean;
  showRailing?: boolean;
  showLandings?: boolean;
  showDimensions?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
  opacity?: number;
  renderOrder?: number;
}

export interface Stair3DCode {
  buildingCode: 'IBC' | 'IRC' | 'local' | 'custom';
  maxRise: number;
  minRun: number;
  maxRiseRunSum: number;
  minHeadroom: number;
  minWidth: number;
  railingRequired: boolean;
  railingHeight: number;
  isCompliant?: boolean;
  violations?: string[];
}