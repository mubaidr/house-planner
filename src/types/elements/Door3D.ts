import * as THREE from 'three';

export interface Door3DGeometry {
  width: number;
  height: number;
  thickness: number;
  frameWidth?: number;
  frameThickness?: number;
}

export interface Door3DPosition {
  wallId: string;
  position: number; // Percentage along wall (0-100)
  height: number; // Height from floor
  rotation: THREE.Euler;
  worldPosition: THREE.Vector3;
}

export interface Door3DAnimation {
  isOpen: boolean;
  openAngle: number; // Degrees
  openOffset: number; // For sliding doors (0-1)
  animationDuration: number; // Milliseconds
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface Door3DMaterial {
  panelMaterialId?: string;
  frameMaterialId?: string;
  handleMaterialId?: string;
  panelColor?: string;
  frameColor?: string;
  handleColor?: string;
  texture?: string;
  roughness?: number;
  metalness?: number;
}

export interface Door3DHardware {
  handleType: 'lever' | 'knob' | 'bar' | 'none';
  handlePosition: 'left' | 'right' | 'center';
  hingeType: 'standard' | 'heavy-duty' | 'concealed';
  lockType: 'none' | 'standard' | 'deadbolt' | 'electronic';
}

export interface Door3DProperties {
  id: string;
  type: 'hinged' | 'sliding' | 'folding' | 'revolving' | 'pocket';
  swingDirection: 'left' | 'right' | 'both';
  geometry: Door3DGeometry;
  position: Door3DPosition;
  animation: Door3DAnimation;
  material: Door3DMaterial;
  hardware: Door3DHardware;
  isSelected?: boolean;
  isHovered?: boolean;
  metadata?: Record<string, any>;
}

export interface Door3DEvents {
  onClick?: (door: Door3DProperties, event: THREE.Event) => void;
  onHover?: (door: Door3DProperties, event: THREE.Event) => void;
  onSelect?: (door: Door3DProperties) => void;
  onOpen?: (door: Door3DProperties) => void;
  onClose?: (door: Door3DProperties) => void;
  onAnimationComplete?: (door: Door3DProperties) => void;
}

export interface Door3DRenderOptions {
  showFrame?: boolean;
  showHandle?: boolean;
  showHinges?: boolean;
  showSwingPath?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
  opacity?: number;
  renderOrder?: number;
}

export interface Door3DLighting {
  emitLight?: boolean;
  lightColor?: string;
  lightIntensity?: number;
  lightDistance?: number;
  lightDecay?: number;
}
