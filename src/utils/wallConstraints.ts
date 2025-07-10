import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';

export interface Point {
  x: number;
  y: number;
}

export interface WallSegment {
  wall: Wall;
  startPoint: Point;
  endPoint: Point;
  length: number;
  angle: number;
}

export interface WallConstraintResult {
  isValid: boolean;
  wallId: string | null;
  position: Point;
  wallSegment: WallSegment | null;
  distanceFromStart: number;
  error?: string;
}

/**
 * Calculate the distance from a point to a line segment
 */
export const pointToLineDistance = (
  point: Point,
  lineStart: Point,
  lineEnd: Point
): { distance: number; closestPoint: Point; t: number } => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  let t = -1;
  if (lenSq !== 0) {
    t = dot / lenSq;
  }

  let closestPoint: Point;
  if (t < 0) {
    closestPoint = { x: lineStart.x, y: lineStart.y };
  } else if (t > 1) {
    closestPoint = { x: lineEnd.x, y: lineEnd.y };
  } else {
    closestPoint = {
      x: lineStart.x + t * C,
      y: lineStart.y + t * D,
    };
  }

  const distance = Math.sqrt(
    Math.pow(point.x - closestPoint.x, 2) + Math.pow(point.y - closestPoint.y, 2)
  );

  return { distance, closestPoint, t };
};

/**
 * Find the closest wall to a given point within tolerance
 */
export const findClosestWall = (
  point: Point,
  walls: Wall[],
  tolerance: number = 20
): WallConstraintResult => {
  let minDistance = Infinity;
  let bestResult: WallConstraintResult = {
    isValid: false,
    wallId: null,
    position: point,
    wallSegment: null,
    distanceFromStart: 0,
    error: 'No wall found within tolerance',
  };

  for (const wall of walls) {
    const lineStart = { x: wall.startX, y: wall.startY };
    const lineEnd = { x: wall.endX, y: wall.endY };
    
    const { distance, closestPoint, t } = pointToLineDistance(point, lineStart, lineEnd);
    
    // Only consider points that are actually on the wall segment (not extensions)
    if (t >= 0 && t <= 1 && distance < tolerance && distance < minDistance) {
      minDistance = distance;
      
      const wallLength = Math.sqrt(
        Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
      );
      
      const angle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX);
      
      bestResult = {
        isValid: true,
        wallId: wall.id,
        position: closestPoint,
        wallSegment: {
          wall,
          startPoint: lineStart,
          endPoint: lineEnd,
          length: wallLength,
          angle,
        },
        distanceFromStart: t * wallLength,
      };
    }
  }

  return bestResult;
};

/**
 * Check if a door can be placed at a specific position on a wall
 */
export const canPlaceDoor = (
  position: Point,
  doorWidth: number,
  walls: Wall[],
  existingDoors: Door[],
  existingWindows: Window[]
): WallConstraintResult => {
  const wallResult = findClosestWall(position, walls);
  
  if (!wallResult.isValid || !wallResult.wallSegment) {
    return {
      ...wallResult,
      error: 'No suitable wall found for door placement',
    };
  }

  const { wallSegment, distanceFromStart } = wallResult;
  const halfDoorWidth = doorWidth / 2;

  // Check if door fits within wall bounds
  if (distanceFromStart - halfDoorWidth < 0 || 
      distanceFromStart + halfDoorWidth > wallSegment.length) {
    return {
      ...wallResult,
      isValid: false,
      error: 'Door does not fit within wall boundaries',
    };
  }

  // Check for conflicts with existing doors on the same wall
  for (const door of existingDoors) {
    if (door.wallId === wallResult.wallId) {
      const doorStart = distanceFromStart - halfDoorWidth;
      const doorEnd = distanceFromStart + halfDoorWidth;
      const existingStart = door.x - door.width / 2;
      const existingEnd = door.x + door.width / 2;

      // Check for overlap
      if (!(doorEnd < existingStart || doorStart > existingEnd)) {
        return {
          ...wallResult,
          isValid: false,
          error: 'Door overlaps with existing door',
        };
      }
    }
  }

  // Check for conflicts with existing windows on the same wall
  for (const window of existingWindows) {
    if (window.wallId === wallResult.wallId) {
      const doorStart = distanceFromStart - halfDoorWidth;
      const doorEnd = distanceFromStart + halfDoorWidth;
      const windowStart = window.x - window.width / 2;
      const windowEnd = window.x + window.width / 2;

      // Check for overlap
      if (!(doorEnd < windowStart || doorStart > windowEnd)) {
        return {
          ...wallResult,
          isValid: false,
          error: 'Door overlaps with existing window',
        };
      }
    }
  }

  return wallResult;
};

/**
 * Check if a window can be placed at a specific position on a wall
 */
export const canPlaceWindow = (
  position: Point,
  windowWidth: number,
  walls: Wall[],
  existingDoors: Door[],
  existingWindows: Window[]
): WallConstraintResult => {
  const wallResult = findClosestWall(position, walls);
  
  if (!wallResult.isValid || !wallResult.wallSegment) {
    return {
      ...wallResult,
      error: 'No suitable wall found for window placement',
    };
  }

  const { wallSegment, distanceFromStart } = wallResult;
  const halfWindowWidth = windowWidth / 2;

  // Check if window fits within wall bounds
  if (distanceFromStart - halfWindowWidth < 0 || 
      distanceFromStart + halfWindowWidth > wallSegment.length) {
    return {
      ...wallResult,
      isValid: false,
      error: 'Window does not fit within wall boundaries',
    };
  }

  // Check for conflicts with existing doors on the same wall
  for (const door of existingDoors) {
    if (door.wallId === wallResult.wallId) {
      const windowStart = distanceFromStart - halfWindowWidth;
      const windowEnd = distanceFromStart + halfWindowWidth;
      const doorStart = door.x - door.width / 2;
      const doorEnd = door.x + door.width / 2;

      // Check for overlap
      if (!(windowEnd < doorStart || windowStart > doorEnd)) {
        return {
          ...wallResult,
          isValid: false,
          error: 'Window overlaps with existing door',
        };
      }
    }
  }

  // Check for conflicts with existing windows on the same wall
  for (const window of existingWindows) {
    if (window.wallId === wallResult.wallId) {
      const windowStart = distanceFromStart - halfWindowWidth;
      const windowEnd = distanceFromStart + halfWindowWidth;
      const existingStart = window.x - window.width / 2;
      const existingEnd = window.x + window.width / 2;

      // Check for overlap
      if (!(windowEnd < existingStart || windowStart > existingEnd)) {
        return {
          ...wallResult,
          isValid: false,
          error: 'Window overlaps with existing window',
        };
      }
    }
  }

  return wallResult;
};