import { Wall } from '@/types/elements/Wall';

export interface Point {
  x: number;
  y: number;
}

export interface LineSegment {
  start: Point;
  end: Point;
}

export interface IntersectionResult {
  intersects: boolean;
  point?: Point;
  t1?: number; // Parameter for first line (0-1 means on segment)
  t2?: number; // Parameter for second line (0-1 means on segment)
}

export interface WallJoinResult {
  shouldJoin: boolean;
  joinPoint?: Point;
  wallsToUpdate: {
    wallId: string;
    updates: Partial<Wall>;
  }[];
  newWalls?: Wall[];
}

/**
 * Calculate intersection between two line segments
 */
export const calculateLineIntersection = (
  line1: LineSegment,
  line2: LineSegment,
  tolerance: number = 0.1
): IntersectionResult => {
  const { start: p1, end: p2 } = line1;
  const { start: p3, end: p4 } = line2;

  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  // Lines are parallel
  if (Math.abs(denom) < tolerance) {
    return { intersects: false };
  }

  const t1 = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const t2 = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  const intersectionPoint = {
    x: x1 + t1 * (x2 - x1),
    y: y1 + t1 * (y2 - y1),
  };

  return {
    intersects: true,
    point: intersectionPoint,
    t1,
    t2,
  };
};

/**
 * Check if two walls intersect and should be joined
 */
export const checkWallIntersection = (
  wall1: Wall,
  wall2: Wall
): IntersectionResult => {
  const line1: LineSegment = {
    start: { x: wall1.startX, y: wall1.startY },
    end: { x: wall1.endX, y: wall1.endY },
  };

  const line2: LineSegment = {
    start: { x: wall2.startX, y: wall2.startY },
    end: { x: wall2.endX, y: wall2.endY },
  };

  const intersection = calculateLineIntersection(line1, line2);
  
  if (!intersection.intersects || !intersection.point || intersection.t1 === undefined || intersection.t2 === undefined) {
    return { intersects: false };
  }

  // Check if intersection is within both line segments (with small tolerance for endpoints)
  const tolerance = 0.1;
  const onSegment1 = intersection.t1 >= -tolerance && intersection.t1 <= 1 + tolerance;
  const onSegment2 = intersection.t2 >= -tolerance && intersection.t2 <= 1 + tolerance;

  if (onSegment1 && onSegment2) {
    return intersection;
  }

  return { intersects: false };
};

/**
 * Find all walls that intersect with a given wall
 */
export const findIntersectingWalls = (
  targetWall: Wall,
  allWalls: Wall[]
): { wall: Wall; intersection: IntersectionResult }[] => {
  const intersections: { wall: Wall; intersection: IntersectionResult }[] = [];

  for (const wall of allWalls) {
    if (wall.id === targetWall.id) continue;

    const intersection = checkWallIntersection(targetWall, wall);
    if (intersection.intersects) {
      intersections.push({ wall, intersection });
    }
  }

  return intersections;
};

/**
 * Calculate how to join walls at intersection points
 */
export const calculateWallJoining = (
  newWall: Wall,
  existingWalls: Wall[]
): WallJoinResult => {
  const intersections = findIntersectingWalls(newWall, existingWalls);
  
  if (intersections.length === 0) {
    return { shouldJoin: false, wallsToUpdate: [] };
  }

  const wallsToUpdate: { wallId: string; updates: Partial<Wall> }[] = [];
  const newWalls: Wall[] = [];
  let joinPoint: Point | undefined;

  for (const { wall: intersectingWall, intersection } of intersections) {
    if (!intersection.point || intersection.t1 === undefined || intersection.t2 === undefined) continue;

    joinPoint = intersection.point;

    // If intersection is at the middle of the existing wall, split it
    if (intersection.t2 > 0.1 && intersection.t2 < 0.9) {
      // Split the existing wall into two parts
      const wall1: Wall = {
        ...intersectingWall,
        id: `${intersectingWall.id}-split1`,
        endX: intersection.point.x,
        endY: intersection.point.y,
      };

      const wall2: Wall = {
        ...intersectingWall,
        id: `${intersectingWall.id}-split2`,
        startX: intersection.point.x,
        startY: intersection.point.y,
      };

      newWalls.push(wall1, wall2);
      
      // Mark original wall for removal (by updating to zero length)
      wallsToUpdate.push({
        wallId: intersectingWall.id,
        updates: {
          startX: intersection.point.x,
          startY: intersection.point.y,
          endX: intersection.point.x,
          endY: intersection.point.y,
        },
      });
    }
    // If intersection is near an endpoint, extend/adjust the wall
    else if (intersection.t2 <= 0.1) {
      // Intersection near start of existing wall
      wallsToUpdate.push({
        wallId: intersectingWall.id,
        updates: {
          startX: intersection.point.x,
          startY: intersection.point.y,
        },
      });
    }
    else if (intersection.t2 >= 0.9) {
      // Intersection near end of existing wall
      wallsToUpdate.push({
        wallId: intersectingWall.id,
        updates: {
          endX: intersection.point.x,
          endY: intersection.point.y,
        },
      });
    }
  }

  return {
    shouldJoin: intersections.length > 0,
    joinPoint,
    wallsToUpdate,
    newWalls: newWalls.length > 0 ? newWalls : undefined,
  };
};

/**
 * Check if a point is near a wall endpoint
 */
export const isNearWallEndpoint = (
  point: Point,
  wall: Wall,
  tolerance: number = 15
): { isNear: boolean; endpoint?: 'start' | 'end'; snapPoint?: Point } => {
  const startDistance = Math.sqrt(
    Math.pow(point.x - wall.startX, 2) + Math.pow(point.y - wall.startY, 2)
  );
  
  const endDistance = Math.sqrt(
    Math.pow(point.x - wall.endX, 2) + Math.pow(point.y - wall.endY, 2)
  );

  if (startDistance <= tolerance) {
    return {
      isNear: true,
      endpoint: 'start',
      snapPoint: { x: wall.startX, y: wall.startY },
    };
  }

  if (endDistance <= tolerance) {
    return {
      isNear: true,
      endpoint: 'end',
      snapPoint: { x: wall.endX, y: wall.endY },
    };
  }

  return { isNear: false };
};

/**
 * Get all potential snap points from walls (endpoints and intersections)
 */
export const getWallSnapPointsWithIntersections = (walls: Wall[], includeMidpoints: boolean = false): Point[] => {
  const snapPoints: Point[] = [];

  // Add all wall endpoints
  walls.forEach(wall => {
    snapPoints.push(
      { x: wall.startX, y: wall.startY },
      { x: wall.endX, y: wall.endY }
    );
    
    // Add midpoints if requested
    if (includeMidpoints) {
      const midX = (wall.startX + wall.endX) / 2;
      const midY = (wall.startY + wall.endY) / 2;
      snapPoints.push({ x: midX, y: midY });
    }
  });

  // Add intersection points
  for (let i = 0; i < walls.length; i++) {
    for (let j = i + 1; j < walls.length; j++) {
      const intersection = checkWallIntersection(walls[i], walls[j]);
      if (intersection.intersects && intersection.point) {
        snapPoints.push(intersection.point);
      }
    }
  }

  // Remove duplicate points
  const uniquePoints: Point[] = [];
  snapPoints.forEach(point => {
    const isDuplicate = uniquePoints.some(existing => 
      Math.abs(existing.x - point.x) < 1 && Math.abs(existing.y - point.y) < 1
    );
    if (!isDuplicate) {
      uniquePoints.push(point);
    }
  });

  return uniquePoints;
};

/**
 * Calculate intersection point between two walls
 */
export const calculateIntersectionPoint = (wall1: Wall, wall2: Wall): Point | null => {
  const line1: LineSegment = {
    start: { x: wall1.startX, y: wall1.startY },
    end: { x: wall1.endX, y: wall1.endY }
  };
  
  const line2: LineSegment = {
    start: { x: wall2.startX, y: wall2.startY },
    end: { x: wall2.endX, y: wall2.endY }
  };
  
  const result = calculateLineIntersection(line1, line2);
  
  // Check if intersection point is actually on both line segments
  if (result.intersects && result.point && result.t1 !== undefined && result.t2 !== undefined) {
    const tolerance = 0.01;
    const onSegment1 = result.t1 >= -tolerance && result.t1 <= 1 + tolerance;
    const onSegment2 = result.t2 >= -tolerance && result.t2 <= 1 + tolerance;
    
    if (onSegment1 && onSegment2) {
      return result.point;
    }
  }
  
  return null;
};

/**
 * Check if two walls are connected at their endpoints
 */
export const areWallsConnected = (wall1: Wall, wall2: Wall, tolerance: number = 1): boolean => {
  const points1 = [
    { x: wall1.startX, y: wall1.startY },
    { x: wall1.endX, y: wall1.endY }
  ];
  
  const points2 = [
    { x: wall2.startX, y: wall2.startY },
    { x: wall2.endX, y: wall2.endY }
  ];
  
  for (const p1 of points1) {
    for (const p2 of points2) {
      const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
      if (distance <= tolerance) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Find all intersections between walls in a collection
 */
export const findWallIntersections = (walls: Wall[]): Array<{
  wall1: Wall;
  wall2: Wall;
  point: Point;
}> => {
  const intersections: Array<{
    wall1: Wall;
    wall2: Wall;
    point: Point;
  }> = [];

  for (let i = 0; i < walls.length; i++) {
    for (let j = i + 1; j < walls.length; j++) {
      const intersection = checkWallIntersection(walls[i], walls[j]);
      if (intersection.intersects && intersection.point) {
        intersections.push({
          wall1: walls[i],
          wall2: walls[j],
          point: intersection.point
        });
      }
    }
  }

  return intersections;
};

/**
 * Join two walls at their intersection point
 */
export const joinWallsAtIntersection = (wall1: Wall, wall2: Wall): {
  success: boolean;
  updatedWalls?: Wall[];
  error?: string;
} => {
  const intersection = calculateIntersectionPoint(wall1, wall2);
  
  if (!intersection) {
    // Check if walls are parallel
    const line1: LineSegment = {
      start: { x: wall1.startX, y: wall1.startY },
      end: { x: wall1.endX, y: wall1.endY }
    };
    
    const line2: LineSegment = {
      start: { x: wall2.startX, y: wall2.startY },
      end: { x: wall2.endX, y: wall2.endY }
    };
    
    const result = calculateLineIntersection(line1, line2);
    if (!result.intersects) {
      return { success: false, error: 'Walls are parallel', updatedWalls: [] };
    } else {
      return { success: false, error: 'Walls do not intersect', updatedWalls: [] };
    }
  }

  // Create updated walls that connect at the intersection point
  const updatedWall1: Wall = {
    ...wall1,
    endX: intersection.x,
    endY: intersection.y
  };

  const updatedWall2: Wall = {
    ...wall2,
    startX: intersection.x,
    startY: intersection.y
  };

  return {
    success: true,
    updatedWalls: [updatedWall1, updatedWall2]
  };
};