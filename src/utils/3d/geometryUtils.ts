/**
 * 3D Geometry Utility Functions for Phase 2 Implementation
 *
 * This module provides utilities for generating and calculating 3D geometries
 * for architectural elements as specified in the Phase 2 roadmap.
 */

import * as THREE from 'three';
import { Wall, Door, Window, Room } from '@/types';

/**
 * Calculate wall geometry with enhanced positioning logic
 */
export function calculateWallGeometry(wall: Wall): {
  geometry: THREE.BoxGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
} {
  const length = Math.sqrt(
    Math.pow(wall.endX - wall.startX, 2) +
    Math.pow(wall.endY - wall.startY, 2)
  );

  const geometry = new THREE.BoxGeometry(length, wall.height, wall.thickness);

  // Center position calculation
  const centerX = (wall.startX + wall.endX) / 2;
  const centerZ = (wall.startY + wall.endY) / 2;
  const centerY = wall.height / 2;

  // Rotation calculation
  const angle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX);

  return {
    geometry,
    position: [centerX, centerY, centerZ],
    rotation: [0, angle, 0],
    length,
  };
}

/**
 * Calculate door position on a wall
 */
export function calculateDoorPositionOnWall(door: Door, wall: Wall): {
  position: [number, number, number];
  rotation: [number, number, number];
} {
  const wallLength = Math.sqrt(
    Math.pow(wall.endX - wall.startX, 2) +
    Math.pow(wall.endY - wall.startY, 2)
  );

  // If position is a percentage along the wall
  let positionOnWall: number;
  if (typeof door.position === 'number') {
    positionOnWall = door.position / 100; // Convert percentage to ratio
  } else if (typeof door.position === 'object') {
    // Use absolute position
    return {
      position: [door.position.x, door.position.y, door.position.z],
      rotation: [0, door.rotation || 0, 0],
    };
  } else {
    positionOnWall = 0.5; // Default to center
  }

  const wallAngle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX);

  // Calculate position along the wall
  const x = wall.startX + Math.cos(wallAngle) * wallLength * positionOnWall;
  const z = wall.startY + Math.sin(wallAngle) * wallLength * positionOnWall;
  const y = door.height / 2;

  return {
    position: [x, y, z],
    rotation: [0, wallAngle, 0],
  };
}

/**
 * Calculate window position on a wall
 */
export function calculateWindowPositionOnWall(window: Window, wall: Wall): {
  position: [number, number, number];
  rotation: [number, number, number];
} {
  const wallLength = Math.sqrt(
    Math.pow(wall.endX - wall.startX, 2) +
    Math.pow(wall.endY - wall.startY, 2)
  );

  // If position is a percentage along the wall
  let positionOnWall: number;
  if (typeof window.position === 'number') {
    positionOnWall = window.position / 100; // Convert percentage to ratio
  } else if (typeof window.position === 'object') {
    // Use absolute position
    return {
      position: [window.position.x, window.position.y, window.position.z],
      rotation: [0, window.rotation || 0, 0],
    };
  } else {
    positionOnWall = 0.5; // Default to center
  }

  const wallAngle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX);

  // Calculate position along the wall
  const x = wall.startX + Math.cos(wallAngle) * wallLength * positionOnWall;
  const z = wall.startY + Math.sin(wallAngle) * wallLength * positionOnWall;
  const y = (window.sillHeight || 1) + window.height / 2;

  return {
    position: [x, y, z],
    rotation: [0, wallAngle, 0],
  };
}

/**
 * Generate room floor and ceiling geometries
 */
export function generateRoomGeometry(room: Room): {
  floorGeometry: THREE.ExtrudeGeometry | THREE.ShapeGeometry;
  ceilingGeometry: THREE.ExtrudeGeometry | THREE.ShapeGeometry;
  center: { x: number; y: number };
} {
  if (room.points.length < 3) {
    throw new Error('Room must have at least 3 points');
  }

  // Create shape from room points
  const shape = new THREE.Shape();
  shape.moveTo(room.points[0].x, room.points[0].y);

  for (let i = 1; i < room.points.length; i++) {
    shape.lineTo(room.points[i].x, room.points[i].y);
  }
  shape.closePath();

  // Calculate room center
  const center = {
    x: room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length,
    y: room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length,
  };

  // Create floor geometry
  let floorGeometry: THREE.ExtrudeGeometry | THREE.ShapeGeometry;
  if (room.properties3D?.floorThickness && room.properties3D.floorThickness > 0) {
    // Extruded floor with thickness
    floorGeometry = new THREE.ExtrudeGeometry(shape, {
      depth: room.properties3D.floorThickness,
      bevelEnabled: false,
    });
    floorGeometry.rotateX(-Math.PI / 2);
  } else {
    // Flat floor
    floorGeometry = new THREE.ShapeGeometry(shape);
    floorGeometry.rotateX(-Math.PI / 2);
  }

  // Ceiling uses the same geometry
  const ceilingGeometry = floorGeometry.clone();

  return {
    floorGeometry,
    ceilingGeometry,
    center,
  };
}

/**
 * Calculate wall intersections and connections
 */
export function calculateWallIntersections(walls: Wall[]): Map<string, string[]> {
  const intersections = new Map<string, string[]>();

  for (let i = 0; i < walls.length; i++) {
    const wallA = walls[i];
    const connectedWalls: string[] = [];

    for (let j = 0; j < walls.length; j++) {
      if (i === j) continue;

      const wallB = walls[j];

      // Check if walls share endpoints (are connected)
      const aStart = { x: wallA.startX, y: wallA.startY };
      const aEnd = { x: wallA.endX, y: wallA.endY };
      const bStart = { x: wallB.startX, y: wallB.startY };
      const bEnd = { x: wallB.endX, y: wallB.endY };

      const tolerance = 0.01;

      if (
        Math.abs(aStart.x - bStart.x) < tolerance && Math.abs(aStart.y - bStart.y) < tolerance ||
        Math.abs(aStart.x - bEnd.x) < tolerance && Math.abs(aStart.y - bEnd.y) < tolerance ||
        Math.abs(aEnd.x - bStart.x) < tolerance && Math.abs(aEnd.y - bStart.y) < tolerance ||
        Math.abs(aEnd.x - bEnd.x) < tolerance && Math.abs(aEnd.y - bEnd.y) < tolerance
      ) {
        connectedWalls.push(wallB.id);
      }
    }

    intersections.set(wallA.id, connectedWalls);
  }

  return intersections;
}

/**
 * Create door frame and panel geometries
 */
export function createDoorGeometries(door: Door): {
  frameGeometry: THREE.ExtrudeGeometry;
  panelGeometry: THREE.BoxGeometry;
} {
  const frameThickness = door.properties3D?.frameThickness || 0.1;

  // Create frame shape
  const frameShape = new THREE.Shape();
  frameShape.moveTo(0, 0);
  frameShape.lineTo(door.width, 0);
  frameShape.lineTo(door.width, door.height);
  frameShape.lineTo(0, door.height);
  frameShape.closePath();

  // Create door opening hole
  const hole = new THREE.Path();
  hole.moveTo(frameThickness, frameThickness);
  hole.lineTo(door.width - frameThickness, frameThickness);
  hole.lineTo(door.width - frameThickness, door.height - frameThickness);
  hole.lineTo(frameThickness, door.height - frameThickness);
  hole.closePath();
  frameShape.holes.push(hole);

  const frameGeometry = new THREE.ExtrudeGeometry(frameShape, {
    depth: door.thickness || 0.2,
    bevelEnabled: false,
  });

  // Create door panel
  const panelWidth = door.width - frameThickness * 2;
  const panelHeight = door.height - frameThickness * 2;
  const panelGeometry = new THREE.BoxGeometry(
    panelWidth,
    panelHeight,
    (door.thickness || 0.2) * 0.8
  );

  return { frameGeometry, panelGeometry };
}

/**
 * Create window frame and glass geometries
 */
export function createWindowGeometries(window: Window): {
  frameGeometry: THREE.ExtrudeGeometry;
  glassGeometry: THREE.PlaneGeometry;
  sillGeometry: THREE.BoxGeometry;
} {
  const frameThickness = window.properties3D?.frameThickness || 0.08;

  // Create frame shape
  const frameShape = new THREE.Shape();
  frameShape.moveTo(0, 0);
  frameShape.lineTo(window.width, 0);
  frameShape.lineTo(window.width, window.height);
  frameShape.lineTo(0, window.height);
  frameShape.closePath();

  // Create glass opening hole
  const hole = new THREE.Path();
  hole.moveTo(frameThickness, frameThickness);
  hole.lineTo(window.width - frameThickness, frameThickness);
  hole.lineTo(window.width - frameThickness, window.height - frameThickness);
  hole.lineTo(frameThickness, window.height - frameThickness);
  hole.closePath();
  frameShape.holes.push(hole);

  const frameGeometry = new THREE.ExtrudeGeometry(frameShape, {
    depth: window.thickness || 0.15,
    bevelEnabled: false,
  });

  // Create glass pane
  const glassWidth = window.width - frameThickness * 2;
  const glassHeight = window.height - frameThickness * 2;
  const glassGeometry = new THREE.PlaneGeometry(glassWidth, glassHeight);

  // Create window sill
  const sillGeometry = new THREE.BoxGeometry(
    window.width + 0.1,
    0.05,
    0.1
  );

  return { frameGeometry, glassGeometry, sillGeometry };
}

/**
 * Get material properties with fallbacks
 */
export function getMaterialProperties(
  materialId: string | undefined,
  materials: any[],
  defaultColor: string = '#ffffff'
): {
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
} {
  const material = materials.find(m => m.id === materialId) || materials[0];

  return {
    color: material?.color || defaultColor,
    roughness: material?.properties?.roughness || 0.8,
    metalness: material?.properties?.metalness || 0.0,
    opacity: material?.properties?.opacity || 1.0,
  };
}
