import * as THREE from 'three';

export interface Room3DGeometry {
  area: number;
  perimeter: number;
  height: number;
  volume: number;
  floorPoints: THREE.Vector2[];
  ceilingPoints: THREE.Vector2[];
}

export interface Room3DPosition {
  center: THREE.Vector3;
  bounds: THREE.Box3;
  floorLevel: number;
  ceilingLevel: number;
}

export interface Room3DMaterials {
  floorMaterialId?: string;
  ceilingMaterialId?: string;
  wallMaterialId?: string;
  floorColor?: string;
  ceilingColor?: string;
  floorTexture?: string;
  ceilingTexture?: string;
  floorRoughness?: number;
  ceilingRoughness?: number;
}

export interface Room3DLighting {
  ambientLight?: {
    color: string;
    intensity: number;
  };
  naturalLight?: {
    windowIds: string[];
    lightLevel: number;
  };
  artificialLight?: {
    fixtureIds: string[];
    lightLevel: number;
  };
}

export interface Room3DClimate {
  temperature?: number;
  humidity?: number;
  ventilation?: {
    airflow: number;
    ventIds: string[];
  };
  heating?: {
    heatingType: 'radiator' | 'underfloor' | 'forced-air' | 'none';
    heatingIds: string[];
  };
}

export interface Room3DProperties {
  id: string;
  name: string;
  type:
    | 'living'
    | 'bedroom'
    | 'kitchen'
    | 'bathroom'
    | 'office'
    | 'dining'
    | 'utility'
    | 'storage'
    | 'other';
  wallIds: string[];
  doorIds: string[];
  windowIds: string[];
  geometry: Room3DGeometry;
  position: Room3DPosition;
  materials: Room3DMaterials;
  lighting: Room3DLighting;
  climate: Room3DClimate;
  isSelected?: boolean;
  isHovered?: boolean;
  metadata?: Record<string, any>;
}

export interface Room3DEvents {
  onClick?: (room: Room3DProperties, event: THREE.Event) => void;
  onHover?: (room: Room3DProperties, event: THREE.Event) => void;
  onSelect?: (room: Room3DProperties) => void;
  onEnter?: (room: Room3DProperties) => void;
  onExit?: (room: Room3DProperties) => void;
}

export interface Room3DRenderOptions {
  showFloor?: boolean;
  showCeiling?: boolean;
  showBounds?: boolean;
  showLabels?: boolean;
  showDimensions?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
  opacity?: number;
  renderOrder?: number;
}

export interface Room3DAnalysis {
  accessibility?: {
    wheelchairAccessible: boolean;
    doorWidth: number;
    clearanceSpace: number;
  };
  acoustics?: {
    soundLevel: number;
    reverberation: number;
    soundproofing: number;
  };
  safety?: {
    fireExits: string[];
    smokeDetectors: string[];
    emergencyLighting: string[];
  };
}
