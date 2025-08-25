import * as THREE from 'three';

export interface Wall3DGeometry {
  width: number;
  height: number;
  thickness: number;
  segments?: number;
}

export interface Wall3DPosition {
  start: THREE.Vector3;
  end: THREE.Vector3;
  center: THREE.Vector3;
  rotation: THREE.Euler;
}

export interface Wall3DConnection {
  wallId: string;
  connectionType: 'corner' | 'junction' | 'end';
  angle: number;
}

export interface Wall3DMaterial {
  materialId?: string;
  color?: string;
  texture?: string;
  roughness?: number;
  metalness?: number;
  normalMap?: string;
}

export interface Wall3DOpenings {
  doors: string[];
  windows: string[];
}

export interface Wall3DProperties {
  id: string;
  type: 'load-bearing' | 'partition' | 'exterior' | 'interior';
  geometry: Wall3DGeometry;
  position: Wall3DPosition;
  material: Wall3DMaterial;
  openings: Wall3DOpenings;
  connections: Wall3DConnection[];
  isSelected?: boolean;
  isHovered?: boolean;
  metadata?: Record<string, any>;
}

export interface Wall3DEvents {
  onClick?: (wall: Wall3DProperties, event: THREE.Event) => void;
  onHover?: (wall: Wall3DProperties, event: THREE.Event) => void;
  onSelect?: (wall: Wall3DProperties) => void;
  onDeselect?: (wall: Wall3DProperties) => void;
}

export interface Wall3DRenderOptions {
  showWireframe?: boolean;
  showNormals?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
  opacity?: number;
  renderOrder?: number;
}
