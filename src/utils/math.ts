import * as THREE from 'three';

/**
 * Calculate the distance between two 3D points
 */
export function calculateDistance(start: THREE.Vector3, end: THREE.Vector3): number {
  return start.distanceTo(end);
}

/**
 * Calculate the angle between two 3D points in degrees
 */
export function calculateAngle(start: THREE.Vector3, end: THREE.Vector3): number {
  return Math.atan2(end.z - start.z, end.x - start.x) * (180 / Math.PI);
}

/**
 * Create line coordinates array from two 3D points
 */
export function createLineCoordinates(start: THREE.Vector3, end: THREE.Vector3): number[] {
  return [start.x, start.y, start.z, end.x, end.y, end.z];
}

/**
 * Calculate the midpoint between two 3D points
 */
export function calculateMidpoint(start: THREE.Vector3, end: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2,
    (start.z + end.z) / 2
  );
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Calculate the area of a polygon given its vertices
 */
export function calculatePolygonArea(points: { x: number; y: number }[]): number {
  if (points.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Calculate the perimeter of a polygon given its vertices
 */
export function calculatePolygonPerimeter(points: { x: number; y: number }[]): number {
  if (points.length < 2) return 0;

  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
}

/**
 * Calculate the center point (centroid) of a polygon
 */
export function calculatePolygonCenter(points: { x: number; y: number }[]): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };

  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);

  return {
    x: sumX / points.length,
    y: sumY / points.length
  };
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export function isPointInPolygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
  const { x, y } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { x: xi, y: yi } = polygon[i];
    const { x: xj, y: yj } = polygon[j];

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Normalize a vector 3D
 */
export function normalizeVector3(vector: THREE.Vector3): THREE.Vector3 {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  if (length === 0) return new THREE.Vector3(0, 0, 0);
  return new THREE.Vector3(vector.x / length, vector.y / length, vector.z / length);
}

/**
 * Calculate cross product of two 3D vectors
 */
export function crossProduct(a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}

/**
 * Calculate dot product of two 3D vectors
 */
export function dotProduct(a: THREE.Vector3, b: THREE.Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
