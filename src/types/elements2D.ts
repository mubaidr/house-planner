/**
 * 2D Element Types for Multi-View Architectural Drawing System
 * 
 * This file defines the core 2D element types that can be rendered
 * in different views (Plan, Front, Back, Left, Right) with proper
 * dimensional accuracy and material visualization.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Dimensions2D {
  width: number;
  height: number;
  depth?: number; // For elevation views
}

export interface Transform2D {
  position: Point2D;
  rotation: number; // In degrees
  scale: { x: number; y: number };
}

/**
 * Base interface for all 2D elements
 */
export interface Element2D {
  id: string;
  type: Element2DType;
  transform: Transform2D;
  dimensions: Dimensions2D;
  materialId?: string;
  floorId: string;
  visible: boolean;
  locked: boolean;
  metadata?: Record<string, unknown>;
}

export type Element2DType = 
  | 'wall2d' 
  | 'door2d' 
  | 'window2d' 
  | 'stair2d' 
  | 'roof2d' 
  | 'room2d'
  | 'annotation2d'
  | 'dimension2d';

/**
 * 2D Wall Element
 */
export interface Wall2D extends Element2D {
  type: 'wall2d';
  startPoint: Point2D;
  endPoint: Point2D;
  thickness: number;
  height: number;
  materialId: string;
  openings: Opening2D[];
  connectedWalls: string[]; // IDs of connected walls
  constraints: WallConstraint2D[];
}

export interface WallConstraint2D {
  type: 'parallel' | 'perpendicular' | 'aligned' | 'fixed-length';
  targetWallId?: string;
  value?: number;
}

/**
 * 2D Opening (Door/Window) Element
 */
export interface Opening2D extends Element2D {
  type: 'door2d' | 'window2d';
  wallId: string;
  positionOnWall: number; // 0-1, position along wall
  width: number;
  height: number;
  sillHeight?: number; // For windows
  swingDirection?: 'left' | 'right' | 'none'; // For doors
  openingType: 'single' | 'double' | 'sliding' | 'folding';
}

export interface Door2D extends Opening2D {
  type: 'door2d';
  swingDirection: 'left' | 'right';
  swingAngle: number; // Current swing angle for animation
  handleSide: 'left' | 'right';
  threshold: boolean;
}

export interface Window2D extends Opening2D {
  type: 'window2d';
  sillHeight: number;
  frameWidth: number;
  glazingType: 'single' | 'double' | 'triple';
  operableType: 'fixed' | 'casement' | 'sliding' | 'awning';
}

/**
 * 2D Stair Element
 */
export interface Stair2D extends Element2D {
  type: 'stair2d';
  steps: StepDefinition2D[];
  direction: 'up' | 'down';
  totalRise: number;
  totalRun: number;
  handrailSide: 'left' | 'right' | 'both' | 'none';
  landingSize?: Dimensions2D;
}

export interface StepDefinition2D {
  rise: number; // Height of step
  run: number; // Depth of step
  width: number; // Width of step
}

/**
 * 2D Roof Element
 */
export interface Roof2D extends Element2D {
  type: 'roof2d';
  roofType: 'gable' | 'hip' | 'shed' | 'flat' | 'gambrel';
  pitch: number; // Degrees
  overhang: number;
  ridgeHeight: number;
  coveringWalls: string[]; // Wall IDs that this roof covers
  gutterType?: 'none' | 'box' | 'half-round';
}

/**
 * 2D Room Element
 */
export interface Room2D extends Element2D {
  type: 'room2d';
  name: string;
  roomType: 'bedroom' | 'bathroom' | 'kitchen' | 'living' | 'dining' | 'office' | 'storage' | 'other';
  area: number; // Square feet/meters
  perimeter: number;
  boundaryWalls: string[]; // Wall IDs that form room boundary
  floorMaterialId?: string;
  ceilingMaterialId?: string;
  ceilingHeight: number;
}

/**
 * 2D Annotation Elements
 */
export interface Annotation2D extends Element2D {
  type: 'annotation2d';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  leader?: {
    startPoint: Point2D;
    endPoint: Point2D;
    arrowType: 'none' | 'arrow' | 'dot' | 'circle';
  };
}

export interface Dimension2D extends Element2D {
  type: 'dimension2d';
  startPoint: Point2D;
  endPoint: Point2D;
  dimensionLine: Point2D; // Position of dimension line
  value: number; // Measured value
  unit: 'ft' | 'in' | 'm' | 'cm' | 'mm';
  precision: number; // Decimal places
  displayValue?: string; // Override display value
  dimensionType: 'linear' | 'angular' | 'radial' | 'diameter';
}

/**
 * View-specific rendering data
 */
export interface ViewRenderData2D {
  viewType: ViewType2D;
  elements: Element2D[];
  visibleLayers: string[];
  scale: number;
  origin: Point2D;
  bounds: {
    min: Point2D;
    max: Point2D;
  };
}

export type ViewType2D = 'plan' | 'front' | 'back' | 'left' | 'right';

/**
 * Layer management for 2D views
 */
export interface Layer2D {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  lineWeight: number;
  elementTypes: Element2DType[];
  order: number; // Z-order for rendering
}

/**
 * Material application for 2D elements
 */
export interface MaterialApplication2D {
  elementId: string;
  materialId: string;
  surface: 'front' | 'back' | 'top' | 'bottom' | 'left' | 'right' | 'all';
  uvMapping?: {
    scale: { u: number; v: number };
    offset: { u: number; v: number };
    rotation: number;
  };
}

/**
 * Utility types for element collections
 */
export type Element2DCollection = {
  walls: Wall2D[];
  doors: Door2D[];
  windows: Window2D[];
  stairs: Stair2D[];
  roofs: Roof2D[];
  rooms: Room2D[];
  annotations: Annotation2D[];
  dimensions: Dimension2D[];
};

/**
 * Element creation helpers
 */
export interface Element2DFactory {
  createWall: (startPoint: Point2D, endPoint: Point2D, thickness: number, height: number) => Wall2D;
  createDoor: (wallId: string, position: number, width: number, height: number) => Door2D;
  createWindow: (wallId: string, position: number, width: number, height: number, sillHeight: number) => Window2D;
  createStair: (position: Point2D, totalRise: number, totalRun: number, stepCount: number) => Stair2D;
  createRoof: (coveringWalls: string[], roofType: Roof2D['roofType'], pitch: number) => Roof2D;
  createRoom: (boundaryWalls: string[], name: string, roomType: Room2D['roomType']) => Room2D;
  createAnnotation: (position: Point2D, text: string) => Annotation2D;
  createDimension: (startPoint: Point2D, endPoint: Point2D, dimensionLine: Point2D) => Dimension2D;
}