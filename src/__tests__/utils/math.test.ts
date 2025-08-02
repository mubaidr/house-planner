import * as THREE from 'three';
import {
  calculateDistance,
  calculateAngle,
  createLineCoordinates,
  calculateMidpoint,
  degreesToRadians,
  radiansToDegrees,
  clamp,
  lerp,
  calculatePolygonArea,
  calculatePolygonPerimeter,
  calculatePolygonCenter,
  isPointInPolygon,
  normalizeVector3,
  crossProduct,
  dotProduct
} from '@/utils/math';

describe('Math Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two 3D points', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(3, 4, 0);
      expect(calculateDistance(start, end)).toBe(5);
    });

    it('should handle identical points', () => {
      const point = new THREE.Vector3(1, 2, 3);
      expect(calculateDistance(point, point)).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const start = new THREE.Vector3(-1, -2, -3);
      const end = new THREE.Vector3(1, 2, 3);
      const distance = calculateDistance(start, end);
      expect(distance).toBeCloseTo(Math.sqrt(4 + 16 + 36), 5);
    });
  });

  describe('calculateAngle', () => {
    it('should calculate angle between two points', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(1, 0, 1);
      const angle = calculateAngle(start, end);
      expect(angle).toBe(45);
    });

    it('should handle points on x-axis', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(1, 0, 0);
      expect(calculateAngle(start, end)).toBe(0);
    });

    it('should handle points on z-axis', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(0, 0, 1);
      expect(calculateAngle(start, end)).toBe(90);
    });
  });

  describe('createLineCoordinates', () => {
    it('should create coordinate array from two points', () => {
      const start = new THREE.Vector3(1, 2, 3);
      const end = new THREE.Vector3(4, 5, 6);
      const coords = createLineCoordinates(start, end);
      expect(coords).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('calculateMidpoint', () => {
    it('should calculate midpoint between two points', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(4, 6, 8);
      const midpoint = calculateMidpoint(start, end);
      expect(midpoint.x).toBe(2);
      expect(midpoint.y).toBe(3);
      expect(midpoint.z).toBe(4);
    });
  });

  describe('degreesToRadians', () => {
    it('should convert degrees to radians', () => {
      expect(degreesToRadians(0)).toBe(0);
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 5);
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2, 5);
    });
  });

  describe('radiansToDegrees', () => {
    it('should convert radians to degrees', () => {
      expect(radiansToDegrees(0)).toBe(0);
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180, 5);
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90, 5);
    });
  });

  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should interpolate between two values', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(10, 20, 0.3)).toBe(13);
    });
  });

  describe('calculatePolygonArea', () => {
    it('should calculate area of a triangle', () => {
      const triangle = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 3 }
      ];
      expect(calculatePolygonArea(triangle)).toBe(6);
    });

    it('should calculate area of a rectangle', () => {
      const rectangle = [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 5, y: 3 },
        { x: 0, y: 3 }
      ];
      expect(calculatePolygonArea(rectangle)).toBe(15);
    });

    it('should return 0 for less than 3 points', () => {
      expect(calculatePolygonArea([])).toBe(0);
      expect(calculatePolygonArea([{ x: 0, y: 0 }])).toBe(0);
      expect(calculatePolygonArea([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(0);
    });
  });

  describe('calculatePolygonPerimeter', () => {
    it('should calculate perimeter of a triangle', () => {
      const triangle = [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 4 }
      ];
      expect(calculatePolygonPerimeter(triangle)).toBe(12);
    });

    it('should return 0 for less than 2 points', () => {
      expect(calculatePolygonPerimeter([])).toBe(0);
      expect(calculatePolygonPerimeter([{ x: 0, y: 0 }])).toBe(0);
    });
  });

  describe('calculatePolygonCenter', () => {
    it('should calculate center of a polygon', () => {
      const square = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 }
      ];
      const center = calculatePolygonCenter(square);
      expect(center.x).toBe(1);
      expect(center.y).toBe(1);
    });

    it('should handle empty array', () => {
      const center = calculatePolygonCenter([]);
      expect(center.x).toBe(0);
      expect(center.y).toBe(0);
    });
  });

  describe('isPointInPolygon', () => {
    const square = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 4 }
    ];

    it('should detect point inside polygon', () => {
      expect(isPointInPolygon({ x: 2, y: 2 }, square)).toBe(true);
    });

    it('should detect point outside polygon', () => {
      expect(isPointInPolygon({ x: 5, y: 5 }, square)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isPointInPolygon({ x: 0, y: 0 }, square)).toBe(true); // vertex on boundary
      expect(isPointInPolygon({ x: 2, y: 0 }, square)).toBe(true); // edge on boundary
    });
  });

  describe('normalizeVector3', () => {
    it('should normalize a vector', () => {
      const vector = new THREE.Vector3(3, 4, 0);
      const normalized = normalizeVector3(vector);
      expect(normalized.length()).toBeCloseTo(1, 5);
      expect(normalized.x).toBeCloseTo(0.6, 5);
      expect(normalized.y).toBeCloseTo(0.8, 5);
    });
  });

  describe('crossProduct', () => {
    it('should calculate cross product', () => {
      const a = new THREE.Vector3(1, 0, 0);
      const b = new THREE.Vector3(0, 1, 0);
      const cross = crossProduct(a, b);
      expect(cross.x).toBe(0);
      expect(cross.y).toBe(0);
      expect(cross.z).toBe(1);
    });
  });

  describe('dotProduct', () => {
    it('should calculate dot product', () => {
      const a = new THREE.Vector3(1, 2, 3);
      const b = new THREE.Vector3(4, 5, 6);
      const dot = dotProduct(a, b);
      expect(dot).toBe(32); // 1*4 + 2*5 + 3*6 = 32
    });

    it('should return 0 for perpendicular vectors', () => {
      const a = new THREE.Vector3(1, 0, 0);
      const b = new THREE.Vector3(0, 1, 0);
      expect(dotProduct(a, b)).toBe(0);
    });
  });
});
