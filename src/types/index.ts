// Core architectural elements
export interface Wall {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  height: number;
  material?: string;
  materialId?: string;
  color: string;
  properties3D?: Wall3DProperties;
}

export interface Wall3DProperties {
  elevation: number;
  textureScale: number;
  materialProperties: {
    roughness: number;
    metalness: number;
    opacity: number;
  };
}

export interface Door {
  id: string;
  wallId: string;
  position: number | { x: number; y: number; z: number }; // position along wall (0-1) or 3D position
  width: number;
  height: number;
  thickness?: number;
  openDirection: 'left' | 'right' | 'inward' | 'outward';
  color: string;
  materialId?: string;
  material?: Material; // Resolved material
  rotation?: number;
  properties3D?: Door3DProperties;
}

export interface Door3DProperties {
  frameThickness: number;
  panelStyle: 'solid' | 'glass' | 'panel';
  handleStyle: 'modern' | 'classic' | 'minimal';
}

export interface Window {
  id: string;
  wallId: string;
  position: number | { x: number; y: number; z: number }; // position along wall (0-1) or 3D position
  width: number;
  height: number;
  thickness?: number;
  sillHeight: number;
  color: string;
  materialId?: string;
  material?: Material; // Resolved material
  rotation?: number;
  properties3D?: Window3DProperties;
}

export interface Window3DProperties {
  frameThickness: number;
  glassType: 'clear' | 'tinted' | 'frosted';
  frameStyle: 'modern' | 'classic' | 'industrial';
}

export interface Room {
  id: string;
  name?: string;
  points: { x: number; y: number }[];
  area?: number;
  perimeter?: number;
  center?: { x: number; y: number };
  walls?: string[];
  roomType?: string;
  floorMaterialId?: string;
  ceilingHeight?: number;
  properties3D?: Room3DProperties;
}

export interface Room3DProperties {
  floorElevation: number;
  ceilingMaterialId?: string;
  wallMaterialIds?: Record<string, string>; // wallId -> materialId
}

// Material system
export interface Material {
  id: string;
  name: string;
  color: string;
  textureImage?: string;
  properties: MaterialProperties;
}

export interface MaterialProperties {
  patternScale?: number;
  patternRotation?: number;
  reflectivity?: number;
  opacity?: number;
  // 3D-specific properties
  roughness?: number;
  metalness?: number;
  normalMap?: string;
  bumpMap?: string;
}

// View and camera types
export type ViewMode = '2d' | '3d' | 'hybrid';

export type CameraPreset = 'perspective' | 'top' | 'front' | 'back' | 'left' | 'right' | 'isometric';

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  zoom: number;
}

// Selection and interaction
export type ElementType = 'wall' | 'door' | 'window' | 'room' | 'floor' | 'ceiling';

export interface SelectionState {
  selectedElementId: string | null;
  selectedElementType: ElementType | null;
  hoveredElementId: string | null;
  hoveredElementType: ElementType | null;
}

// 3D Scene configuration
export interface Scene3DConfig {
  initialized: boolean;
  camera: CameraState;
  lighting: LightingConfig;
  renderSettings: RenderSettings;
  environment: EnvironmentConfig;
}

export interface LightingConfig {
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
  shadows: boolean;
  shadowIntensity: number;
}

export interface RenderSettings {
  quality: 'low' | 'medium' | 'high';
  shadows: boolean;
  postProcessing: boolean;
  wireframe: boolean;
  antialias: boolean;
}

export interface EnvironmentConfig {
  background: 'transparent' | 'gradient' | 'skybox';
  backgroundColors: [string, string]; // gradient colors
  groundPlane: boolean;
  gridHelper: boolean;
}

// Design state
export interface DesignState {
  // Core elements
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  rooms: Room[];

  // Materials
  materials: Material[];

  // Selection
  selection: SelectionState;

  // View state
  viewMode: ViewMode;
  activeFloor: number;

  // 3D scene
  scene3D: Scene3DConfig;
}

// Actions interface
export interface DesignActions {
  // Wall actions
  addWall: (wall: Omit<Wall, 'id'>) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  deleteWall: (id: string) => void;

  // Door actions
  addDoor: (door: Omit<Door, 'id'>) => void;
  updateDoor: (id: string, updates: Partial<Door>) => void;
  deleteDoor: (id: string) => void;

  // Window actions
  addWindow: (window: Omit<Window, 'id'>) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  deleteWindow: (id: string) => void;

  // Room actions
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  // Material actions
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  // Selection actions
  selectElement: (id: string | null, type: ElementType | null) => void;
  hoverElement: (id: string | null, type: ElementType | null) => void;

  // View actions
  setViewMode: (mode: ViewMode) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  updateCameraState: (state: Partial<CameraState>) => void;

  // 3D actions
  update3DProperties: (elementId: string, elementType: ElementType, properties: any) => void;
  updateScene3D: (config: Partial<Scene3DConfig>) => void;
  initializeScene3D: () => void;
}
