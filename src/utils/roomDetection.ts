import { Wall } from '@/types/elements/Wall';
import { Point } from './wallIntersection';

export interface Room {
  id: string;
  name: string;
  vertices: Point[];
  walls: string[]; // Wall IDs that form this room
  area: number;
  perimeter: number;
  center: Point;
  color: string;
  roomType?: string;
  isCustomNamed?: boolean;
  materialId?: string;
}

export interface RoomDetectionResult {
  rooms: Room[];
  closedShapes: Point[][];
}

/**
 * Check if two points are approximately equal
 */
const pointsEqual = (p1: Point, p2: Point, tolerance: number = 2): boolean => {
  return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
};

/**
 * Get all endpoints from walls
 */
const getWallEndpoints = (walls: Wall[]): { point: Point; wallIds: string[] }[] => {
  const endpointMap = new Map<string, { point: Point; wallIds: string[] }>();

  walls.forEach(wall => {
    const startKey = `${Math.round(wall.startX)},${Math.round(wall.startY)}`;
    const endKey = `${Math.round(wall.endX)},${Math.round(wall.endY)}`;

    // Start point
    if (endpointMap.has(startKey)) {
      endpointMap.get(startKey)!.wallIds.push(wall.id);
    } else {
      endpointMap.set(startKey, {
        point: { x: wall.startX, y: wall.startY },
        wallIds: [wall.id]
      });
    }

    // End point
    if (endpointMap.has(endKey)) {
      endpointMap.get(endKey)!.wallIds.push(wall.id);
    } else {
      endpointMap.set(endKey, {
        point: { x: wall.endX, y: wall.endY },
        wallIds: [wall.id]
      });
    }
  });

  return Array.from(endpointMap.values());
};

/**
 * Build a graph of connected walls
 */
const buildWallGraph = (walls: Wall[]): Map<string, string[]> => {
  const graph = new Map<string, string[]>();
  const endpoints = getWallEndpoints(walls);

  // Initialize graph
  walls.forEach(wall => {
    graph.set(wall.id, []);
  });

  // Connect walls that share endpoints
  endpoints.forEach(({ wallIds }) => {
    if (wallIds.length >= 2) {
      // Connect all walls at this endpoint
      for (let i = 0; i < wallIds.length; i++) {
        for (let j = i + 1; j < wallIds.length; j++) {
          const wall1 = wallIds[i];
          const wall2 = wallIds[j];
          
          if (!graph.get(wall1)!.includes(wall2)) {
            graph.get(wall1)!.push(wall2);
          }
          if (!graph.get(wall2)!.includes(wall1)) {
            graph.get(wall2)!.push(wall1);
          }
        }
      }
    }
  });

  return graph;
};

/**
 * Find cycles in the wall graph using DFS
 */
const findCycles = (graph: Map<string, string[]>, _walls: Wall[]): string[][] => {
  const visited = new Set<string>();
  const cycles: string[][] = [];

  const dfs = (
    current: string,
    path: string[],
    start: string,
    parent: string | null
  ): void => {
    if (path.length > 2 && current === start) {
      // Found a cycle
      cycles.push([...path]);
      return;
    }

    if (path.length > 10) {
      // Prevent infinite loops
      return;
    }

    const neighbors = graph.get(current) || [];
    for (const neighbor of neighbors) {
      if (neighbor === parent) continue; // Don't go back immediately
      
      if (neighbor === start && path.length >= 3) {
        // Complete the cycle
        cycles.push([...path, neighbor]);
      } else if (!path.includes(neighbor)) {
        dfs(neighbor, [...path, neighbor], start, current);
      }
    }
  };

  // Try starting from each wall
  for (const wallId of graph.keys()) {
    if (!visited.has(wallId)) {
      dfs(wallId, [wallId], wallId, null);
      visited.add(wallId);
    }
  }

  // Remove duplicate cycles (same walls in different order)
  const uniqueCycles: string[][] = [];
  cycles.forEach(cycle => {
    const sortedCycle = [...cycle].sort();
    const isDuplicate = uniqueCycles.some(existing => {
      const sortedExisting = [...existing].sort();
      return sortedExisting.length === sortedCycle.length &&
             sortedExisting.every((id, i) => id === sortedCycle[i]);
    });
    
    if (!isDuplicate && cycle.length >= 3) {
      uniqueCycles.push(cycle);
    }
  });

  return uniqueCycles;
};

/**
 * Convert wall cycle to polygon vertices
 */
const cycleToPolygon = (wallIds: string[], walls: Wall[]): Point[] => {
  const wallMap = new Map(walls.map(w => [w.id, w]));
  const vertices: Point[] = [];
  
  if (wallIds.length === 0) return vertices;

  // Start with first wall
  const firstWall = wallMap.get(wallIds[0]);
  if (!firstWall) return vertices;

  let currentPoint = { x: firstWall.startX, y: firstWall.startY };
  vertices.push(currentPoint);

  // Follow the walls to build the polygon
  for (let i = 0; i < wallIds.length; i++) {
    const wall = wallMap.get(wallIds[i]);
    if (!wall) continue;

    const startPoint = { x: wall.startX, y: wall.startY };
    const endPoint = { x: wall.endX, y: wall.endY };

    // Determine which end of the wall to use
    if (pointsEqual(currentPoint, startPoint)) {
      currentPoint = endPoint;
    } else if (pointsEqual(currentPoint, endPoint)) {
      currentPoint = startPoint;
    } else {
      // Find the closest endpoint
      const distToStart = Math.sqrt(
        Math.pow(currentPoint.x - startPoint.x, 2) + 
        Math.pow(currentPoint.y - startPoint.y, 2)
      );
      const distToEnd = Math.sqrt(
        Math.pow(currentPoint.x - endPoint.x, 2) + 
        Math.pow(currentPoint.y - endPoint.y, 2)
      );
      
      currentPoint = distToStart < distToEnd ? endPoint : startPoint;
    }

    if (i < wallIds.length - 1) {
      vertices.push(currentPoint);
    }
  }

  return vertices;
};

/**
 * Calculate polygon area using shoelace formula
 */
const calculatePolygonArea = (vertices: Point[]): number => {
  if (vertices.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area) / 2;
};

/**
 * Calculate polygon perimeter
 */
const calculatePolygonPerimeter = (vertices: Point[]): number => {
  if (vertices.length < 2) return 0;

  let perimeter = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    const dx = vertices[j].x - vertices[i].x;
    const dy = vertices[j].y - vertices[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
};

/**
 * Calculate polygon centroid
 */
const calculatePolygonCenter = (vertices: Point[]): Point => {
  if (vertices.length === 0) return { x: 0, y: 0 };

  let x = 0, y = 0;
  vertices.forEach(vertex => {
    x += vertex.x;
    y += vertex.y;
  });

  return {
    x: x / vertices.length,
    y: y / vertices.length
  };
};

/**
 * Generate room colors
 */
const generateRoomColor = (index: number): string => {
  const colors = [
    '#E3F2FD', // Light Blue
    '#F3E5F5', // Light Purple
    '#E8F5E8', // Light Green
    '#FFF3E0', // Light Orange
    '#FCE4EC', // Light Pink
    '#F1F8E9', // Light Lime
    '#E0F2F1', // Light Teal
    '#FFF8E1', // Light Yellow
  ];
  return colors[index % colors.length];
};

/**
 * Detect rooms from walls
 */
export const detectRooms = (walls: Wall[]): RoomDetectionResult => {
  if (walls.length < 3) {
    return { rooms: [], closedShapes: [] };
  }

  const graph = buildWallGraph(walls);
  const cycles = findCycles(graph, walls);
  const rooms: Room[] = [];
  const closedShapes: Point[][] = [];

  cycles.forEach((wallIds, index) => {
    const vertices = cycleToPolygon(wallIds, walls);
    
    if (vertices.length >= 3) {
      closedShapes.push(vertices);
      
      const area = calculatePolygonArea(vertices);
      const perimeter = calculatePolygonPerimeter(vertices);
      const center = calculatePolygonCenter(vertices);

      // Only create rooms for shapes with reasonable area
      if (area > 100) { // Minimum area threshold
        const room: Room = {
          id: `room-${Date.now()}-${index}`,
          name: `Room ${rooms.length + 1}`,
          vertices,
          walls: wallIds,
          area,
          perimeter,
          center,
          color: generateRoomColor(index),
        };

        rooms.push(room);
      }
    }
  });

  return { rooms, closedShapes };
};

/**
 * Check if walls form a closed shape
 */
export const isClosedShape = (walls: Wall[]): boolean => {
  const result = detectRooms(walls);
  return result.rooms.length > 0;
};

/**
 * Get room information for display
 */
export const getRoomInfo = (room: Room): string => {
  const areaInSqFt = (room.area / 144).toFixed(1); // Convert from sq pixels to sq feet (rough)
  const perimeterInFt = (room.perimeter / 12).toFixed(1); // Convert from pixels to feet (rough)
  
  return `${room.name}\nArea: ${areaInSqFt} sq ft\nPerimeter: ${perimeterInFt} ft`;
};