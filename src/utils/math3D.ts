import * as THREE from 'three';

/**
 * Calculate the area of a 2D polygon using the shoelace formula
 * @param points Array of 2D points defining the polygon
 * @returns Area of the polygon
 */
export function calculatePolygonArea(points: THREE.Vector2[]): number {
  if (points.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area / 2);
}

/**
 * Calculate the perimeter of a 2D polygon
 * @param points Array of 2D points defining the polygon
 * @returns Perimeter of the polygon
 */
export function calculatePolygonPerimeter(points: THREE.Vector2[]): number {
  if (points.length < 2) return 0;

  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    perimeter += points[i].distanceTo(points[j]);
  }

  return perimeter;
}

/**
 * Check if a point is inside a 2D polygon using the ray casting algorithm
 * @param point Point to check
 * @param polygon Array of 2D points defining the polygon
 * @returns True if point is inside polygon
 */
export function isPointInPolygon(point: THREE.Vector2, polygon: THREE.Vector2[]): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Convert 3D wall start/end points to 2D points for polygon operations
 * @param walls Array of walls with 3D start/end points
 * @returns Array of 2D points
 */
export function wallsToPoints(
  walls: { start: { x: number; z: number }; end: { x: number; z: number } }[]
): THREE.Vector2[] {
  if (walls.length === 0) return [];

  // Extract unique points from walls
  const pointsMap = new Map<string, THREE.Vector2>();

  walls.forEach(wall => {
    const startKey = `${wall.start.x},${wall.start.z}`;
    const endKey = `${wall.end.x},${wall.end.z}`;

    if (!pointsMap.has(startKey)) {
      pointsMap.set(startKey, new THREE.Vector2(wall.start.x, wall.start.z));
    }

    if (!pointsMap.has(endKey)) {
      pointsMap.set(endKey, new THREE.Vector2(wall.end.x, wall.end.z));
    }
  });

  // Convert map values to array
  return Array.from(pointsMap.values());
}

/**
 * Sort points to form a closed polygon (simple convex hull approximation)
 * @param points Array of 2D points
 * @returns Sorted points forming a polygon
 */
export function sortPointsToPolygon(points: THREE.Vector2[]): THREE.Vector2[] {
  if (points.length <= 3) return points;

  // Find centroid
  const centroid = new THREE.Vector2();
  points.forEach(point => centroid.add(point));
  centroid.divideScalar(points.length);

  // Sort points by angle relative to centroid
  return points.sort((a, b) => {
    const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
    const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
    return angleA - angleB;
  });
}
