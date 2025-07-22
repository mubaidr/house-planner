/**
 * Stage Generator for Multi-View Export
 * 
 * This utility creates Konva stages for different views to enable
 * multi-view export functionality.
 */

import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';
import { Layer } from 'konva/lib/Layer';
import { ViewType2D } from '@/types/views';
import { Element2D } from '@/types/elements2D';
import { convertElementsToElement2D } from './elementTypeConverter';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Stair } from '@/types/elements/Stair';
import { Roof } from '@/types/elements/Roof';
import { Room } from '@/types/elements/Room';

export interface StageGenerationOptions {
  width: number;
  height: number;
  scale: number;
  showGrid: boolean;
  showMaterials: boolean;
  showDimensions: boolean;
  showAnnotations: boolean;
}

export interface ViewElements {
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  stairs: Stair[];
  roofs: Roof[];
  rooms: Room[];
}

/**
 * Default stage generation options
 */
export const DEFAULT_STAGE_OPTIONS: StageGenerationOptions = {
  width: 800,
  height: 600,
  scale: 1,
  showGrid: false,
  showMaterials: true,
  showDimensions: true,
  showAnnotations: true,
};

/**
 * Generate a Konva stage for a specific view
 */
export async function generateStageForView(
  viewType: ViewType2D,
  elements: ViewElements,
  floorId: string,
  options: Partial<StageGenerationOptions> = {}
): Promise<Stage> {
  // Merge options with defaults
  const opts = { ...DEFAULT_STAGE_OPTIONS, ...options };
  
  // Create a temporary container for the stage
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = `${opts.width}px`;
  container.style.height = `${opts.height}px`;
  document.body.appendChild(container);
  
  try {
    // Create the stage
    const stage = new Konva.Stage({
      container,
      width: opts.width,
      height: opts.height,
    });
    
    // Create main layer
    const layer = new Konva.Layer();
    stage.add(layer);
    
    // Filter elements based on view type
    const filteredElements = filterElementsForView(viewType, elements);
    
    // Convert to Element2D format
    const elements2D = convertElementsToElement2D(
      filteredElements.walls,
      filteredElements.doors,
      filteredElements.windows,
      filteredElements.stairs,
      filteredElements.roofs,
      filteredElements.rooms,
      floorId
    );
    
    // Add grid if enabled
    if (opts.showGrid) {
      addGridToLayer(layer, opts.width, opts.height);
    }
    
    // Render elements based on view type
    if (viewType === 'plan') {
      await renderPlanViewElements(layer, elements2D, opts);
    } else {
      await renderElevationViewElements(layer, elements2D, viewType, opts);
    }
    
    // Center the content
    centerStageContent(stage, layer);
    
    layer.draw();
    
    return stage;
  } finally {
    // Clean up the temporary container
    document.body.removeChild(container);
  }
}

/**
 * Filter elements based on view type
 */
function filterElementsForView(viewType: ViewType2D, elements: ViewElements): ViewElements {
  if (viewType === 'plan') {
    // Plan view shows all elements except roofs
    return {
      ...elements,
      roofs: [], // Don't show roofs in plan view
    };
  } else {
    // Elevation views show walls, doors, windows, stairs, and roofs
    return {
      walls: elements.walls,
      doors: elements.doors,
      windows: elements.windows,
      stairs: elements.stairs,
      roofs: elements.roofs,
      rooms: [], // Don't show rooms in elevation views
    };
  }
}

/**
 * Add grid to layer
 */
function addGridToLayer(layer: Layer, width: number, height: number): void {
  const gridSize = 20; // Grid spacing in pixels
  const gridColor = '#E5E5E5';
  
  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    const line = new Konva.Line({
      points: [x, 0, x, height],
      stroke: gridColor,
      strokeWidth: 0.5,
      listening: false,
    });
    layer.add(line);
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    const line = new Konva.Line({
      points: [0, y, width, y],
      stroke: gridColor,
      strokeWidth: 0.5,
      listening: false,
    });
    layer.add(line);
  }
}

/**
 * Render elements for plan view
 */
async function renderPlanViewElements(
  layer: Layer,
  elements: Element2D[],
  options: StageGenerationOptions
): Promise<void> {
  // Sort elements by layer index (rooms first, then walls, then openings)
  const sortedElements = elements.sort((a, b) => {
    const layerOrder = { room2d: 0, wall2d: 1, door2d: 2, window2d: 2, stair2d: 3 };
    return (layerOrder[a.type] || 999) - (layerOrder[b.type] || 999);
  });
  
  for (const element of sortedElements) {
    switch (element.type) {
      case 'wall2d':
        addWallToPlanView(layer, element, options);
        break;
      case 'door2d':
        addDoorToPlanView(layer, element, options);
        break;
      case 'window2d':
        addWindowToPlanView(layer, element, options);
        break;
      case 'stair2d':
        addStairToPlanView(layer, element, options);
        break;
      case 'room2d':
        addRoomToPlanView(layer, element, options);
        break;
    }
  }
}

/**
 * Render elements for elevation view
 */
async function renderElevationViewElements(
  layer: Layer,
  elements: Element2D[],
  viewType: ViewType2D,
  options: StageGenerationOptions
): Promise<void> {
  // Sort elements by depth (back to front)
  const sortedElements = elements.sort((a, b) => {
    return (a.transform.position.y || 0) - (b.transform.position.y || 0);
  });
  
  for (const element of sortedElements) {
    switch (element.type) {
      case 'wall2d':
        addWallToElevationView(layer, element, viewType, options);
        break;
      case 'door2d':
        addDoorToElevationView(layer, element, viewType, options);
        break;
      case 'window2d':
        addWindowToElevationView(layer, element, viewType, options);
        break;
      case 'stair2d':
        addStairToElevationView(layer, element, viewType, options);
        break;
      case 'roof2d':
        addRoofToElevationView(layer, element, viewType, options);
        break;
    }
  }
  
  // Add ground line
  addGroundLineToElevationView(layer, options);
}

/**
 * Add wall to plan view
 */
function addWallToPlanView(layer: Layer, wall: any, options: StageGenerationOptions): void {
  const line = new Konva.Line({
    points: [
      wall.startPoint.x,
      wall.startPoint.y,
      wall.endPoint.x,
      wall.endPoint.y,
    ],
    stroke: '#333333',
    strokeWidth: wall.thickness || 8,
    lineCap: 'round',
    listening: false,
  });
  layer.add(line);
}

/**
 * Add door to plan view
 */
function addDoorToPlanView(layer: Layer, door: any, options: StageGenerationOptions): void {
  const rect = new Konva.Rect({
    x: door.transform.position.x - door.width / 2,
    y: door.transform.position.y - 2,
    width: door.width,
    height: 4,
    fill: '#8B4513',
    stroke: '#654321',
    strokeWidth: 1,
    rotation: door.transform.rotation * (180 / Math.PI),
    listening: false,
  });
  layer.add(rect);
  
  // Add door swing arc
  const arc = new Konva.Arc({
    x: door.transform.position.x,
    y: door.transform.position.y,
    innerRadius: 0,
    outerRadius: door.width,
    angle: 90,
    rotation: door.transform.rotation * (180 / Math.PI),
    stroke: '#8B4513',
    strokeWidth: 1,
    dash: [5, 5],
    listening: false,
  });
  layer.add(arc);
}

/**
 * Add window to plan view
 */
function addWindowToPlanView(layer: Layer, window: any, options: StageGenerationOptions): void {
  const rect = new Konva.Rect({
    x: window.transform.position.x - window.width / 2,
    y: window.transform.position.y - 2,
    width: window.width,
    height: 4,
    fill: '#4169E1',
    stroke: '#1E3A8A',
    strokeWidth: 1,
    rotation: window.transform.rotation * (180 / Math.PI),
    listening: false,
  });
  layer.add(rect);
}

/**
 * Add stair to plan view
 */
function addStairToPlanView(layer: Layer, stair: any, options: StageGenerationOptions): void {
  const rect = new Konva.Rect({
    x: stair.transform.position.x - stair.dimensions.width / 2,
    y: stair.transform.position.y - stair.dimensions.height / 2,
    width: stair.dimensions.width,
    height: stair.dimensions.height,
    fill: '#D3D3D3',
    stroke: '#696969',
    strokeWidth: 2,
    rotation: stair.transform.rotation * (180 / Math.PI),
    listening: false,
  });
  layer.add(rect);
  
  // Add step lines
  const stepCount = stair.steps?.length || 10;
  const stepHeight = stair.dimensions.height / stepCount;
  
  for (let i = 1; i < stepCount; i++) {
    const line = new Konva.Line({
      points: [
        stair.transform.position.x - stair.dimensions.width / 2,
        stair.transform.position.y - stair.dimensions.height / 2 + i * stepHeight,
        stair.transform.position.x + stair.dimensions.width / 2,
        stair.transform.position.y - stair.dimensions.height / 2 + i * stepHeight,
      ],
      stroke: '#696969',
      strokeWidth: 1,
      rotation: stair.transform.rotation * (180 / Math.PI),
      listening: false,
    });
    layer.add(line);
  }
}

/**
 * Add room to plan view
 */
function addRoomToPlanView(layer: Layer, room: any, options: StageGenerationOptions): void {
  if (!room.points || room.points.length < 3) return;
  
  const points = room.points.flatMap((p: any) => [p.x, p.y]);
  
  const polygon = new Konva.Line({
    points,
    closed: true,
    fill: room.style?.fillColor || '#F5F5F5',
    stroke: room.style?.strokeColor || '#E5E5E5',
    strokeWidth: 1,
    opacity: 0.3,
    listening: false,
  });
  layer.add(polygon);
}

/**
 * Add wall to elevation view
 */
function addWallToElevationView(layer: Layer, wall: any, viewType: ViewType2D, options: StageGenerationOptions): void {
  // Check if wall is visible in this elevation view
  const wallVector = {
    x: wall.endPoint.x - wall.startPoint.x,
    y: wall.endPoint.y - wall.startPoint.y
  };
  
  // Determine if wall is perpendicular to view direction
  let isVisible = false;
  let wallLength = 0;
  let wallPosition = 0;
  
  switch (viewType) {
    case 'front':
    case 'back':
      // Walls parallel to X-axis are visible
      if (Math.abs(wallVector.y) < 0.1) {
        isVisible = true;
        wallLength = Math.abs(wallVector.x);
        wallPosition = Math.min(wall.startPoint.x, wall.endPoint.x);
      }
      break;
    case 'left':
    case 'right':
      // Walls parallel to Y-axis are visible
      if (Math.abs(wallVector.x) < 0.1) {
        isVisible = true;
        wallLength = Math.abs(wallVector.y);
        wallPosition = Math.min(wall.startPoint.y, wall.endPoint.y);
      }
      break;
  }
  
  if (isVisible && wallLength > 0.1) {
    const groundLevel = options.height * 0.8; // Ground at 80% of canvas height
    const wallHeight = wall.height || 96;
    
    const rect = new Konva.Rect({
      x: wallPosition,
      y: groundLevel - wallHeight,
      width: wallLength,
      height: wallHeight,
      fill: options.showMaterials ? '#F5F5F5' : '#E5E5E5',
      stroke: '#333333',
      strokeWidth: 2,
      listening: false,
    });
    layer.add(rect);
  }
}

/**
 * Add door to elevation view
 */
function addDoorToElevationView(layer: Layer, door: any, viewType: ViewType2D, options: StageGenerationOptions): void {
  // Check if door is visible in this elevation view (similar to wall logic)
  const groundLevel = options.height * 0.8;
  const doorHeight = door.height || 84;
  
  // For now, render all doors - in a real implementation, you'd check wall visibility
  const rect = new Konva.Rect({
    x: door.transform.position.x - door.width / 2,
    y: groundLevel - doorHeight,
    width: door.width,
    height: doorHeight,
    fill: '#8B4513',
    stroke: '#654321',
    strokeWidth: 2,
    listening: false,
  });
  layer.add(rect);
}

/**
 * Add window to elevation view
 */
function addWindowToElevationView(layer: Layer, window: any, viewType: ViewType2D, options: StageGenerationOptions): void {
  const groundLevel = options.height * 0.8;
  const sillHeight = 36; // 3 feet default
  const windowHeight = window.height || 48;
  
  // For now, render all windows - in a real implementation, you'd check wall visibility
  const rect = new Konva.Rect({
    x: window.transform.position.x - window.width / 2,
    y: groundLevel - sillHeight - windowHeight,
    width: window.width,
    height: windowHeight,
    fill: '#87CEEB',
    stroke: '#4169E1',
    strokeWidth: 2,
    listening: false,
  });
  layer.add(rect);
}

/**
 * Add stair to elevation view
 */
function addStairToElevationView(layer: Layer, stair: any, viewType: ViewType2D, options: StageGenerationOptions): void {
  const groundLevel = options.height * 0.8;
  
  // Draw stair profile
  const stepCount = stair.steps?.length || 10;
  const stepRise = 7; // inches
  const stepRun = 11; // inches
  
  const points: number[] = [stair.transform.position.x, groundLevel]; // Start at ground
  
  for (let i = 0; i < stepCount; i++) {
    const x = stair.transform.position.x + i * stepRun;
    const y = groundLevel - i * stepRise;
    points.push(x, y, x + stepRun, y); // Horizontal step
    if (i < stepCount - 1) {
      points.push(x + stepRun, y - stepRise); // Vertical riser
    }
  }
  
  const line = new Konva.Line({
    points,
    stroke: '#696969',
    strokeWidth: 2,
    listening: false,
  });
  layer.add(line);
}

/**
 * Add roof to elevation view
 */
function addRoofToElevationView(layer: Layer, roof: any, viewType: ViewType2D, options: StageGenerationOptions): void {
  if (!roof.points || roof.points.length < 3) return;
  
  // Project roof points to elevation
  const projectedPoints = roof.points
    .map((p: any) => projectPointToElevation(p, viewType))
    .flatMap((p: any) => [p.x, p.y - 200]); // Raise roof above walls
  
  const polygon = new Konva.Line({
    points: projectedPoints,
    closed: true,
    fill: '#A0522D',
    stroke: '#8B4513',
    strokeWidth: 2,
    listening: false,
  });
  layer.add(polygon);
}

/**
 * Add ground line to elevation view
 */
function addGroundLineToElevationView(layer: Layer, options: StageGenerationOptions): void {
  const groundLevel = options.height * 0.8; // Ground at 80% of canvas height
  
  const line = new Konva.Line({
    points: [0, groundLevel, options.width, groundLevel],
    stroke: '#8B7355',
    strokeWidth: 3,
    listening: false,
  });
  layer.add(line);
  
  // Add sky background
  const sky = new Konva.Rect({
    x: 0,
    y: 0,
    width: options.width,
    height: groundLevel,
    fill: '#E6F3FF',
    opacity: 0.3,
    listening: false,
  });
  layer.add(sky);
  layer.moveToBottom(sky);
}

/**
 * Project a point to elevation view coordinates
 */
function projectPointToElevation(point: { x: number; y: number }, viewType: ViewType2D): { x: number; y: number } {
  switch (viewType) {
    case 'front':
      // Front view: X stays X, Y becomes height (inverted)
      return { x: point.x, y: -point.y };
    case 'back':
      // Back view: X is flipped, Y becomes height (inverted)
      return { x: -point.x, y: -point.y };
    case 'left':
      // Left view: Y becomes X, X becomes height (inverted)
      return { x: point.y, y: -point.x };
    case 'right':
      // Right view: Y becomes X (flipped), X becomes height (inverted)
      return { x: -point.y, y: -point.x };
    default:
      return point;
  }
}

/**
 * Center stage content
 */
function centerStageContent(stage: Stage, layer: Layer): void {
  const bbox = layer.getClientRect();
  if (bbox.width > 0 && bbox.height > 0) {
    const scale = Math.min(
      (stage.width() * 0.8) / bbox.width,
      (stage.height() * 0.8) / bbox.height
    );
    
    layer.scale({ x: scale, y: scale });
    layer.position({
      x: (stage.width() - bbox.width * scale) / 2 - bbox.x * scale,
      y: (stage.height() - bbox.height * scale) / 2 - bbox.y * scale,
    });
  }
}

/**
 * Generate stages for all views
 */
export async function generateAllViewStages(
  elements: ViewElements,
  floorId: string,
  options: Partial<StageGenerationOptions> = {}
): Promise<Record<ViewType2D, Stage | null>> {
  const views: ViewType2D[] = ['plan', 'front', 'back', 'left', 'right'];
  const stages: Record<ViewType2D, Stage | null> = {
    plan: null,
    front: null,
    back: null,
    left: null,
    right: null,
  };
  
  for (const view of views) {
    try {
      stages[view] = await generateStageForView(view, elements, floorId, options);
    } catch (error) {
      console.error(`Failed to generate stage for ${view} view:`, error);
      stages[view] = null;
    }
  }
  
  return stages;
}

/**
 * Clean up generated stages
 */
export function cleanupStages(stages: Record<ViewType2D, Stage | null>): void {
  Object.values(stages).forEach(stage => {
    if (stage) {
      stage.destroy();
    }
  });
}