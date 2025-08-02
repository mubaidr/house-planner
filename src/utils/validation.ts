import { Wall, Door, Window, Room, Material } from '@/types';

/**
 * Validate wall data
 */
export function validateWall(wall: Partial<Wall>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof wall.startX !== 'number' || isNaN(wall.startX)) {
    errors.push('startX must be a valid number');
  }
  if (typeof wall.startY !== 'number' || isNaN(wall.startY)) {
    errors.push('startY must be a valid number');
  }
  if (typeof wall.endX !== 'number' || isNaN(wall.endX)) {
    errors.push('endX must be a valid number');
  }
  if (typeof wall.endY !== 'number' || isNaN(wall.endY)) {
    errors.push('endY must be a valid number');
  }
  if (typeof wall.thickness !== 'number' || wall.thickness <= 0) {
    errors.push('thickness must be a positive number');
  }
  if (typeof wall.height !== 'number' || wall.height <= 0) {
    errors.push('height must be a positive number');
  }
  if (!wall.color || typeof wall.color !== 'string') {
    errors.push('color must be a valid string');
  }

  // Check if wall has zero length
  if (wall.startX === wall.endX && wall.startY === wall.endY) {
    errors.push('wall cannot have zero length');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate door data
 */
export function validateDoor(door: Partial<Door>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!door.wallId || typeof door.wallId !== 'string') {
    errors.push('wallId must be a valid string');
  }
  if (typeof door.width !== 'number' || door.width <= 0) {
    errors.push('width must be a positive number');
  }
  if (typeof door.height !== 'number' || door.height <= 0) {
    errors.push('height must be a positive number');
  }
  if (!door.openDirection || !['left', 'right', 'inward', 'outward'].includes(door.openDirection)) {
    errors.push('openDirection must be one of: left, right, inward, outward');
  }
  if (!door.color || typeof door.color !== 'string') {
    errors.push('color must be a valid string');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate window data
 */
export function validateWindow(window: Partial<Window>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!window.wallId || typeof window.wallId !== 'string') {
    errors.push('wallId must be a valid string');
  }
  if (typeof window.width !== 'number' || window.width <= 0) {
    errors.push('width must be a positive number');
  }
  if (typeof window.height !== 'number' || window.height <= 0) {
    errors.push('height must be a positive number');
  }
  if (typeof window.sillHeight !== 'number' || window.sillHeight < 0) {
    errors.push('sillHeight must be a non-negative number');
  }
  if (!window.color || typeof window.color !== 'string') {
    errors.push('color must be a valid string');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate room data
 */
export function validateRoom(room: Partial<Room>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!room.points || !Array.isArray(room.points) || room.points.length < 3) {
    errors.push('points must be an array with at least 3 points');
  } else {
    room.points.forEach((point, index) => {
      if (typeof point.x !== 'number' || isNaN(point.x)) {
        errors.push(`point ${index} x coordinate must be a valid number`);
      }
      if (typeof point.y !== 'number' || isNaN(point.y)) {
        errors.push(`point ${index} y coordinate must be a valid number`);
      }
    });
  }

  if (room.ceilingHeight !== undefined && (typeof room.ceilingHeight !== 'number' || room.ceilingHeight <= 0)) {
    errors.push('ceilingHeight must be a positive number');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate material data
 */
export function validateMaterial(material: Partial<Material>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!material.name || typeof material.name !== 'string' || material.name.trim().length === 0) {
    errors.push('name must be a non-empty string');
  }
  if (!material.color || typeof material.color !== 'string') {
    errors.push('color must be a valid string');
  }

  if (material.properties) {
    if (material.properties.roughness !== undefined) {
      if (typeof material.properties.roughness !== 'number' || material.properties.roughness < 0 || material.properties.roughness > 1) {
        errors.push('roughness must be a number between 0 and 1');
      }
    }
    if (material.properties.metalness !== undefined) {
      if (typeof material.properties.metalness !== 'number' || material.properties.metalness < 0 || material.properties.metalness > 1) {
        errors.push('metalness must be a number between 0 and 1');
      }
    }
    if (material.properties.opacity !== undefined) {
      if (typeof material.properties.opacity !== 'number' || material.properties.opacity < 0 || material.properties.opacity > 1) {
        errors.push('opacity must be a number between 0 and 1');
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate hex color string
 */
export function validateHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate RGB color object
 */
export function validateRGBColor(color: { r: number; g: number; b: number }): boolean {
  return (
    typeof color.r === 'number' && color.r >= 0 && color.r <= 255 &&
    typeof color.g === 'number' && color.g >= 0 && color.g <= 255 &&
    typeof color.b === 'number' && color.b >= 0 && color.b <= 255
  );
}

/**
 * Validate coordinates are within bounds
 */
export function validateCoordinates(x: number, y: number, bounds?: { minX: number; maxX: number; minY: number; maxY: number }): boolean {
  if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
    return false;
  }

  if (bounds) {
    return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
  }

  return true;
}
