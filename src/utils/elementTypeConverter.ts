/**
 * Element Type Converter - Bridges legacy element types with new Element2D system
 * Converts between existing Wall/Door/Window types and Element2D types for view rendering
 */

import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Stair } from '@/types/elements/Stair';
import { Roof } from '@/types/elements/Roof';
import { Room } from '@/types/elements/Room';
import { Room as DetectedRoom } from '@/utils/roomDetection';
import { 
  Element2D, 
  Wall2D, 
  Door2D, 
  Window2D, 
  Stair2D, 
  Roof2D, 
  Room2D,
  Point2D,
  Transform2D,
  Dimensions2D,
  StepDefinition2D
} from '@/types/elements2D';

/**
 * Convert legacy Wall to Wall2D
 */
export function convertWallToWall2D(wall: Wall): Wall2D {
  const startPoint: Point2D = { x: wall.startX, y: wall.startY };
  const endPoint: Point2D = { x: wall.endX, y: wall.endY };
  
  // Calculate dimensions
  const length = Math.sqrt(
    Math.pow(wall.endX - wall.startX, 2) + 
    Math.pow(wall.endY - wall.startY, 2)
  );
  
  const dimensions: Dimensions2D = {
    width: length,
    height: wall.height,
    depth: wall.thickness
  };

  const transform: Transform2D = {
    position: startPoint,
    rotation: Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX),
    scale: { x: 1, y: 1 }
  };

  return {
    id: wall.id,
    type: 'wall2d',
    startPoint,
    endPoint,
    thickness: wall.thickness,
    height: wall.height,
    materialId: wall.materialId || undefined,
    transform,
    dimensions,
    floorId: '', // Will be set by caller
    visible: true,
    locked: false
  };
}

/**
 * Convert legacy Door to Door2D
 */
export function convertDoorToDoor2D(door: Door): Door2D {
  const position: Point2D = { x: door.x, y: door.y };
  
  const dimensions: Dimensions2D = {
    width: door.width,
    height: door.height,
    depth: 0.1 // Default door thickness
  };

  const transform: Transform2D = {
    position,
    rotation: door.wallAngle,
    scale: { x: 1, y: 1 }
  };

  return {
    id: door.id,
    type: 'door2d',
    width: door.width,
    height: door.height,
    wallId: door.wallId,
    swingDirection: door.swingDirection as 'left' | 'right',
    swingAngle: 0,
    handleSide: 'right',
    threshold: true,
    openingType: door.style === 'double' ? 'double' : 'single',
    positionOnWall: 0.5, // Default to center of wall
    materialId: door.materialId,
    transform,
    dimensions,
    floorId: '', // Will be set by caller
    visible: true,
    locked: false
  };
}

/**
 * Convert legacy Window to Window2D
 */
export function convertWindowToWindow2D(window: Window): Window2D {
  const position: Point2D = { x: window.x, y: window.y };
  
  const dimensions: Dimensions2D = {
    width: window.width,
    height: window.height,
    depth: 0.05 // Default window thickness
  };

  const transform: Transform2D = {
    position,
    rotation: window.wallAngle,
    scale: { x: 1, y: 1 }
  };

  return {
    id: window.id,
    type: 'window2d',
    width: window.width,
    height: window.height,
    wallId: window.wallId,
    sillHeight: 0.9, // Default sill height
    frameWidth: 0.05, // Default frame width
    glazingType: 'double',
    operableType: window.style === 'casement' ? 'casement' : 'fixed',
    openingType: window.style === 'double' ? 'double' : 'single',
    positionOnWall: 0.5, // Default to center of wall
    materialId: window.materialId,
    transform,
    dimensions,
    floorId: '', // Will be set by caller
    visible: true,
    locked: false
  };
}

/**
 * Convert legacy Stair to Stair2D
 */
export function convertStairToStair2D(stair: Stair): Stair2D {
  const position: Point2D = { x: stair.x, y: stair.y };
  
  const dimensions: Dimensions2D = {
    width: stair.width,
    height: stair.length, // Use length as height for stairs
    depth: stair.stepDepth || 0.2 // Default step depth
  };

  const transform: Transform2D = {
    position,
    rotation: stair.rotation || 0,
    scale: { x: 1, y: 1 }
  };

  const stepDefinitions: StepDefinition2D[] = Array.from({ length: stair.steps }, (_, i) => ({
    rise: stair.stepHeight,
    run: stair.stepDepth,
    width: stair.width
  }));

  return {
    id: stair.id,
    type: 'stair2d',
    steps: stepDefinitions,
    direction: stair.direction,
    totalRise: stair.steps * stair.stepHeight,
    totalRun: stair.steps * stair.stepDepth,
    handrailSide: stair.handrailLeft && stair.handrailRight ? 'both' : 
                  stair.handrailLeft ? 'left' : 
                  stair.handrailRight ? 'right' : 'none',
    materialId: stair.materialId,
    transform,
    dimensions,
    floorId: '', // Will be set by caller
    isVisible: true,
    layerIndex: 0,
    style: {
      strokeColor: stair.color || '#8B4513',
      fillColor: stair.color || '#8B4513',
      strokeWidth: 1,
      opacity: 1
    }
  };
}

/**
 * Convert legacy Roof to Roof2D
 */
export function convertRoofToRoof2D(roof: Roof): Roof2D {
  // Calculate center position from points
  const centerX = roof.points.reduce((sum, p) => sum + p.x, 0) / roof.points.length;
  const centerY = roof.points.reduce((sum, p) => sum + p.y, 0) / roof.points.length;
  const position: Point2D = { x: centerX, y: centerY };
  
  // Calculate approximate dimensions
  const minX = Math.min(...roof.points.map(p => p.x));
  const maxX = Math.max(...roof.points.map(p => p.x));
  const minY = Math.min(...roof.points.map(p => p.y));
  const maxY = Math.max(...roof.points.map(p => p.y));
  
  const dimensions: Dimensions2D = {
    width: maxX - minX,
    height: maxY - minY,
    depth: roof.height || 0.3
  };

  const transform: Transform2D = {
    position,
    rotation: 0,
    scale: { x: 1, y: 1 }
  };

  return {
    id: roof.id,
    type: 'roof2d',
    position,
    points: roof.points,
    roofType: roof.type,
    pitch: roof.pitch,
    height: roof.height || 3,
    overhang: roof.overhang,
    materialId: roof.materialId,
    transform,
    dimensions,
    floorId: '', // Will be set by caller
    isVisible: true,
    layerIndex: 2,
    style: {
      strokeColor: roof.color || '#8B4513',
      fillColor: roof.color || '#8B4513',
      strokeWidth: 1,
      opacity: 1
    }
  };
}

/**
 * Convert legacy Room to Room2D
 */
export function convertRoomToRoom2D(room: Room): Room2D {
  // Calculate center position from points
  const centerX = room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length;
  const centerY = room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length;
  const position: Point2D = { x: centerX, y: centerY };
  
  // Calculate approximate dimensions
  const minX = Math.min(...room.points.map(p => p.x));
  const maxX = Math.max(...room.points.map(p => p.x));
  const minY = Math.min(...room.points.map(p => p.y));
  const maxY = Math.max(...room.points.map(p => p.y));
  
  const dimensions: Dimensions2D = {
    width: maxX - minX,
    height: maxY - minY,
    depth: 0
  };

  const transform: Transform2D = {
    position,
    rotation: 0,
    scale: { x: 1, y: 1 }
  };

  return {
    id: room.id,
    type: 'room2d',
    position,
    points: room.points,
    name: room.name || 'Room',
    area: room.area || 0,
    materialId: room.materialId,
    transform,
    dimensions,
    floorId: '', // Will be set by caller
    isVisible: true,
    layerIndex: -1, // Render behind other elements
    style: {
      strokeColor: room.color || '#E5E5E5',
      fillColor: room.color || '#F5F5F5',
      strokeWidth: 1,
      opacity: 0.3
    }
  };
}

/**
 * Convert detected room to Room interface
 */
function convertDetectedRoomToRoom(detectedRoom: DetectedRoom): Room {
  return {
    id: detectedRoom.id,
    name: detectedRoom.name || 'Room',
    points: detectedRoom.points,
    area: detectedRoom.area,
    materialId: detectedRoom.materialId,
    color: detectedRoom.color || '#F5F5F5'
  };
}

/**
 * Convert mixed legacy elements to Element2D array
 */
export function convertElementsToElement2D(
  walls: Wall[] = [],
  doors: Door[] = [],
  windows: Window[] = [],
  stairs: Stair[] = [],
  roofs: Roof[] = [],
  rooms: (Room | DetectedRoom)[] = [],
  floorId: string = ''
): Element2D[] {
  const elements: Element2D[] = [];

  // Convert walls
  walls.forEach(wall => {
    const wall2d = convertWallToWall2D(wall);
    wall2d.floorId = floorId;
    elements.push(wall2d);
  });

  // Convert doors
  doors.forEach(door => {
    const door2d = convertDoorToDoor2D(door);
    door2d.floorId = floorId;
    elements.push(door2d);
  });

  // Convert windows
  windows.forEach(window => {
    const window2d = convertWindowToWindow2D(window);
    window2d.floorId = floorId;
    elements.push(window2d);
  });

  // Convert stairs
  stairs.forEach(stair => {
    const stair2d = convertStairToStair2D(stair);
    stair2d.floorId = floorId;
    elements.push(stair2d);
  });

  // Convert roofs
  roofs.forEach(roof => {
    const roof2d = convertRoofToRoof2D(roof);
    roof2d.floorId = floorId;
    elements.push(roof2d);
  });

  // Convert rooms
  rooms.forEach(room => {
    // Convert detected room to Room interface if needed
    const roomData = 'points' in room ? room : convertDetectedRoomToRoom(room as DetectedRoom);
    const room2d = convertRoomToRoom2D(roomData);
    room2d.floorId = floorId;
    elements.push(room2d);
  });

  return elements;
}

/**
 * Get element type string from Element2D for selection
 */
export function getElementTypeFromElement2D(element: Element2D): string {
  switch (element.type) {
    case 'wall2d': return 'wall';
    case 'door2d': return 'door';
    case 'window2d': return 'window';
    case 'stair2d': return 'stair';
    case 'roof2d': return 'roof';
    case 'room2d': return 'room';
    default: return 'unknown';
  }
}