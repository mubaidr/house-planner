import {
  validateWallPlacement,
  checkWallIntersections,
  findNearbyWalls,
  getWallConstraints,
  isValidWallLength,
  checkMinimumWallSpacing,
  validateWallAngle,
  getWallSnapPoints,
  checkWallOverlap,
  validateWallConnection
} from '@/utils/wallConstraints';
import { Wall } from '@/types/elements/Wall';

describe('wallConstraints', () => {
  const mockWalls: Wall[] = [
    {
      id: 'wall-1',
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 0,
      thickness: 8,
      height: 240,
      color: '#000000'
    },
    {
      id: 'wall-2',
      startX: 100,
      startY: 0,
      endX: 100,
      endY: 100,
      thickness: 8,
      height: 240,
      color: '#000000'
    },
    {
      id: 'wall-3',
      startX: 50,
      startY: 50,
      endX: 150,
      endY: 50,
      thickness: 8,
      height: 240,
      color: '#000000'
    }
  ];

  describe('validateWallPlacement', () => {
    it('should validate a valid wall placement', () => {
      const newWall: Partial<Wall> = {
        startX: 200,
        startY: 0,
        endX: 300,
        endY: 0,
        thickness: 8,
        height: 240
      };

      const result = validateWallPlacement(newWall as Wall, mockWalls);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject wall with invalid length', () => {
      const newWall: Partial<Wall> = {
        startX: 0,
        startY: 0,
        endX: 1,
        endY: 0,
        thickness: 8,
        height: 240
      };

      const result = validateWallPlacement(newWall as Wall, mockWalls);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Wall length is too short');
    });

    it('should reject overlapping walls', () => {
      const newWall: Partial<Wall> = {
        startX: 25,
        startY: 0,
        endX: 75,
        endY: 0,
        thickness: 8,
        height: 240
      };

      const result = validateWallPlacement(newWall as Wall, mockWalls);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Wall overlaps with existing wall');
    });
  });

  describe('checkWallIntersections', () => {
    it('should detect intersecting walls', () => {
      const wall1: Wall = {
        id: 'test-1',
        startX: 0,
        startY: 50,
        endX: 100,
        endY: 50,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const wall2: Wall = {
        id: 'test-2',
        startX: 50,
        startY: 0,
        endX: 50,
        endY: 100,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const intersections = checkWallIntersections(wall1, [wall2]);
      expect(intersections).toHaveLength(1);
      expect(intersections[0].point.x).toBe(50);
      expect(intersections[0].point.y).toBe(50);
    });

    it('should not detect intersection for parallel walls', () => {
      const wall1: Wall = {
        id: 'test-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const wall2: Wall = {
        id: 'test-2',
        startX: 0,
        startY: 20,
        endX: 100,
        endY: 20,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const intersections = checkWallIntersections(wall1, [wall2]);
      expect(intersections).toHaveLength(0);
    });
  });

  describe('findNearbyWalls', () => {
    it('should find walls within specified radius', () => {
      const point = { x: 50, y: 10 };
      const radius = 20;

      const nearbyWalls = findNearbyWalls(point, mockWalls, radius);
      expect(nearbyWalls.length).toBeGreaterThan(0);
      expect(nearbyWalls).toContain(mockWalls[0]); // Should include wall-1
    });

    it('should not find walls outside radius', () => {
      const point = { x: 200, y: 200 };
      const radius = 10;

      const nearbyWalls = findNearbyWalls(point, mockWalls, radius);
      expect(nearbyWalls).toHaveLength(0);
    });
  });

  describe('isValidWallLength', () => {
    it('should accept valid wall lengths', () => {
      expect(isValidWallLength(50)).toBe(true);
      expect(isValidWallLength(100)).toBe(true);
      expect(isValidWallLength(1000)).toBe(true);
    });

    it('should reject too short walls', () => {
      expect(isValidWallLength(5)).toBe(false);
      expect(isValidWallLength(0)).toBe(false);
      expect(isValidWallLength(-10)).toBe(false);
    });
  });

  describe('checkMinimumWallSpacing', () => {
    it('should accept walls with adequate spacing', () => {
      const newWall: Wall = {
        id: 'test',
        startX: 0,
        startY: 50,
        endX: 100,
        endY: 50,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const result = checkMinimumWallSpacing(newWall, mockWalls);
      expect(result).toBe(true);
    });

    it('should reject walls too close to existing walls', () => {
      const newWall: Wall = {
        id: 'test',
        startX: 0,
        startY: 2,
        endX: 100,
        endY: 2,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const result = checkMinimumWallSpacing(newWall, mockWalls);
      expect(result).toBe(false);
    });
  });

  describe('validateWallAngle', () => {
    it('should accept standard angles', () => {
      expect(validateWallAngle(0)).toBe(true);    // Horizontal
      expect(validateWallAngle(90)).toBe(true);   // Vertical
      expect(validateWallAngle(45)).toBe(true);   // Diagonal
      expect(validateWallAngle(180)).toBe(true);  // Horizontal (opposite)
    });

    it('should handle angle normalization', () => {
      expect(validateWallAngle(360)).toBe(true);  // Should normalize to 0
      expect(validateWallAngle(-90)).toBe(true);  // Should normalize to 270
    });
  });

  describe('getWallSnapPoints', () => {
    it('should return snap points for a wall', () => {
      const wall = mockWalls[0];
      const snapPoints = getWallSnapPoints(wall);

      expect(snapPoints).toHaveLength(3); // Start, middle, end
      expect(snapPoints[0]).toEqual({ x: 0, y: 0 });    // Start
      expect(snapPoints[1]).toEqual({ x: 50, y: 0 });   // Middle
      expect(snapPoints[2]).toEqual({ x: 100, y: 0 });  // End
    });

    it('should include perpendicular snap points', () => {
      const wall = mockWalls[0];
      const snapPoints = getWallSnapPoints(wall, true);

      expect(snapPoints.length).toBeGreaterThan(3);
    });
  });

  describe('checkWallOverlap', () => {
    it('should detect overlapping walls', () => {
      const wall1: Wall = {
        id: 'test-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const wall2: Wall = {
        id: 'test-2',
        startX: 50,
        startY: 0,
        endX: 150,
        endY: 0,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const overlap = checkWallOverlap(wall1, wall2);
      expect(overlap.hasOverlap).toBe(true);
      expect(overlap.overlapLength).toBeGreaterThan(0);
    });

    it('should not detect overlap for non-overlapping walls', () => {
      const wall1: Wall = {
        id: 'test-1',
        startX: 0,
        startY: 0,
        endX: 50,
        endY: 0,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const wall2: Wall = {
        id: 'test-2',
        startX: 100,
        startY: 0,
        endX: 150,
        endY: 0,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const overlap = checkWallOverlap(wall1, wall2);
      expect(overlap.hasOverlap).toBe(false);
      expect(overlap.overlapLength).toBe(0);
    });
  });

  describe('validateWallConnection', () => {
    it('should validate proper wall connections', () => {
      const result = validateWallConnection(mockWalls[0], mockWalls[1]);
      expect(result.isConnected).toBe(true);
      expect(result.connectionPoint).toEqual({ x: 100, y: 0 });
    });

    it('should reject improper connections', () => {
      const wall1: Wall = {
        id: 'test-1',
        startX: 0,
        startY: 0,
        endX: 50,
        endY: 0,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const wall2: Wall = {
        id: 'test-2',
        startX: 100,
        startY: 100,
        endX: 150,
        endY: 100,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const result = validateWallConnection(wall1, wall2);
      expect(result.isConnected).toBe(false);
      expect(result.connectionPoint).toBeNull();
    });
  });

  describe('getWallConstraints', () => {
    it('should return comprehensive constraints for wall placement', () => {
      const constraints = getWallConstraints(mockWalls);

      expect(constraints).toHaveProperty('minLength');
      expect(constraints).toHaveProperty('maxLength');
      expect(constraints).toHaveProperty('minSpacing');
      expect(constraints).toHaveProperty('allowedAngles');
      expect(constraints).toHaveProperty('snapTolerance');
    });

    it('should include snap points from existing walls', () => {
      const constraints = getWallConstraints(mockWalls);

      expect(constraints.snapPoints).toBeDefined();
      expect(constraints.snapPoints.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty wall array', () => {
      const newWall: Wall = {
        id: 'test',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 8,
        height: 240,
        color: '#000000'
      };

      const result = validateWallPlacement(newWall, []);
      expect(result.isValid).toBe(true);
    });

    it('should handle walls with zero thickness', () => {
      const wall: Wall = {
        id: 'test',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 0,
        height: 240,
        color: '#000000'
      };

      const result = validateWallPlacement(wall, []);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Wall thickness must be greater than 0');
    });

    it('should handle walls with negative dimensions', () => {
      const wall: Wall = {
        id: 'test',
        startX: 100,
        startY: 100,
        endX: 0,
        endY: 0,
        thickness: 8,
        height: -240,
        color: '#000000'
      };

      const result = validateWallPlacement(wall, []);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Wall height must be greater than 0');
    });
  });
});