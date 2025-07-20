import {
  snapToGrid,
  snapToPoints,
  getWallSnapPoints,
  snapPoint,
  Point,
  SnapResult,
} from '@/utils/snapping';

describe('snapping', () => {
  describe('snapToGrid', () => {
    it('should snap point to nearest grid intersection', () => {
      const result = snapToGrid({ x: 22, y: 18 }, 20);
      
      expect(result.x).toBe(20);
      expect(result.y).toBe(20);
      expect(result.snapped).toBe(true);
      expect(result.snapType).toBe('grid');
      expect(result.snapPoint).toEqual({ x: 20, y: 20, type: 'grid' });
    });

    it('should snap to closest grid point', () => {
      const result = snapToGrid({ x: 35, y: 45 }, 20);
      
      expect(result.x).toBe(40);
      expect(result.y).toBe(40);
      expect(result.snapped).toBe(true);
    });

    it('should not snap when point is too far from grid', () => {
      const result = snapToGrid({ x: 25, y: 25 }, 20, 3); // tolerance = 3
      
      expect(result.x).toBe(25);
      expect(result.y).toBe(25);
      expect(result.snapped).toBe(false);
      expect(result.snapType).toBeUndefined();
      expect(result.snapPoint).toBeUndefined();
    });

    it('should handle zero grid size gracefully', () => {
      const result = snapToGrid({ x: 10, y: 10 }, 0);
      
      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
      expect(result.snapped).toBe(false);
    });

    it('should handle negative coordinates', () => {
      const result = snapToGrid({ x: -22, y: -18 }, 20);
      
      expect(result.x).toBe(-20);
      expect(result.y).toBe(-20);
      expect(result.snapped).toBe(true);
    });

    it('should respect custom tolerance', () => {
      const result1 = snapToGrid({ x: 25, y: 25 }, 20, 5);
      expect(result1.snapped).toBe(true);
      
      const result2 = snapToGrid({ x: 25, y: 25 }, 20, 3);
      expect(result2.snapped).toBe(false);
    });

    it('should handle exact grid intersections', () => {
      const result = snapToGrid({ x: 40, y: 60 }, 20);
      
      expect(result.x).toBe(40);
      expect(result.y).toBe(60);
      expect(result.snapped).toBe(true);
    });

    it('should handle decimal grid sizes', () => {
      const result = snapToGrid({ x: 10.2, y: 15.3 }, 5.5);
      
      expect(result.x).toBe(11);
      expect(result.y).toBe(16.5);
      expect(result.snapped).toBe(true);
    });
  });

  describe('snapToPoints', () => {
    const snapPoints: Point[] = [
      { x: 10, y: 10 },
      { x: 50, y: 30 },
      { x: 100, y: 100 },
    ];

    it('should snap to closest point within tolerance', () => {
      const result = snapToPoints({ x: 12, y: 8 }, snapPoints);
      
      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
      expect(result.snapped).toBe(true);
      expect(result.snapType).toBe('endpoint');
      expect(result.snapPoint).toEqual({ x: 10, y: 10, type: 'endpoint' });
    });

    it('should not snap when no points are within tolerance', () => {
      const result = snapToPoints({ x: 200, y: 200 }, snapPoints);
      
      expect(result.x).toBe(200);
      expect(result.y).toBe(200);
      expect(result.snapped).toBe(false);
      expect(result.snapType).toBeUndefined();
    });

    it('should respect custom tolerance', () => {
      const result1 = snapToPoints({ x: 20, y: 20 }, snapPoints, 20);
      expect(result1.snapped).toBe(true);
      expect(result1.x).toBe(10);
      expect(result1.y).toBe(10);
      
      const result2 = snapToPoints({ x: 20, y: 20 }, snapPoints, 5);
      expect(result2.snapped).toBe(false);
    });

    it('should snap to first point found within tolerance', () => {
      const closePoints: Point[] = [
        { x: 10, y: 10 },
        { x: 12, y: 12 },
      ];
      
      const result = snapToPoints({ x: 11, y: 11 }, closePoints);
      
      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
      expect(result.snapped).toBe(true);
    });

    it('should handle empty snap points array', () => {
      const result = snapToPoints({ x: 10, y: 10 }, []);
      
      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
      expect(result.snapped).toBe(false);
    });

    it('should handle exact point matches', () => {
      const result = snapToPoints({ x: 50, y: 30 }, snapPoints);
      
      expect(result.x).toBe(50);
      expect(result.y).toBe(30);
      expect(result.snapped).toBe(true);
    });

    it('should calculate distance correctly', () => {
      // Point at distance exactly equal to tolerance
      const distance = 15;
      const testPoint = { x: 10 + distance, y: 10 };
      
      const result1 = snapToPoints(testPoint, snapPoints, distance);
      expect(result1.snapped).toBe(true);
      
      const result2 = snapToPoints(testPoint, snapPoints, distance - 0.1);
      expect(result2.snapped).toBe(false);
    });
  });

  describe('getWallSnapPoints', () => {
    const walls = [
      { startX: 0, startY: 0, endX: 100, endY: 0 },
      { startX: 100, startY: 0, endX: 100, endY: 100 },
      { startX: 50, startY: 50, endX: 150, endY: 150 },
    ];

    it('should generate endpoints and midpoints for all walls', () => {
      const points = getWallSnapPoints(walls);
      
      expect(points).toHaveLength(9); // 3 walls × 3 points each
    });

    it('should include correct endpoints', () => {
      const points = getWallSnapPoints(walls);
      
      expect(points).toContainEqual({ x: 0, y: 0 });
      expect(points).toContainEqual({ x: 100, y: 0 });
      expect(points).toContainEqual({ x: 100, y: 100 });
      expect(points).toContainEqual({ x: 50, y: 50 });
      expect(points).toContainEqual({ x: 150, y: 150 });
    });

    it('should include correct midpoints', () => {
      const points = getWallSnapPoints(walls);
      
      expect(points).toContainEqual({ x: 50, y: 0 }); // Midpoint of first wall
      expect(points).toContainEqual({ x: 100, y: 50 }); // Midpoint of second wall
      expect(points).toContainEqual({ x: 100, y: 100 }); // Midpoint of third wall
    });

    it('should handle empty walls array', () => {
      const points = getWallSnapPoints([]);
      
      expect(points).toEqual([]);
    });

    it('should handle single wall', () => {
      const singleWall = [{ startX: 10, startY: 20, endX: 30, endY: 40 }];
      const points = getWallSnapPoints(singleWall);
      
      expect(points).toHaveLength(3);
      expect(points).toContainEqual({ x: 10, y: 20 });
      expect(points).toContainEqual({ x: 30, y: 40 });
      expect(points).toContainEqual({ x: 20, y: 30 }); // Midpoint
    });

    it('should handle walls with same start and end points', () => {
      const pointWall = [{ startX: 50, startY: 50, endX: 50, endY: 50 }];
      const points = getWallSnapPoints(pointWall);
      
      expect(points).toHaveLength(3);
      expect(points).toContainEqual({ x: 50, y: 50 }); // All three points are the same
    });

    it('should handle negative coordinates', () => {
      const negativeWall = [{ startX: -10, startY: -20, endX: 10, endY: 20 }];
      const points = getWallSnapPoints(negativeWall);
      
      expect(points).toContainEqual({ x: -10, y: -20 });
      expect(points).toContainEqual({ x: 10, y: 20 });
      expect(points).toContainEqual({ x: 0, y: 0 }); // Midpoint
    });
  });

  describe('snapPoint', () => {
    const snapPoints: Point[] = [
      { x: 10, y: 10 },
      { x: 50, y: 50 },
    ];

    it('should prioritize point snapping over grid snapping', () => {
      const result = snapPoint(
        { x: 12, y: 8 }, // Close to point (10,10) and grid (20,0)
        20,
        snapPoints,
        true
      );
      
      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
      expect(result.snapType).toBe('endpoint');
    });

    it('should fall back to grid snapping when no points are close', () => {
      const result = snapPoint(
        { x: 22, y: 18 },
        20,
        snapPoints,
        true
      );
      
      expect(result.x).toBe(10); // Actually snaps to nearest point first
      expect(result.y).toBe(10);
      expect(result.snapType).toBe('endpoint');
    });

    it('should not snap to grid when grid snapping is disabled', () => {
      const result = snapPoint(
        { x: 22, y: 18 },
        20,
        [],
        false
      );
      
      expect(result.x).toBe(22);
      expect(result.y).toBe(18);
      expect(result.snapped).toBe(false);
    });

    it('should not snap when no snapping options are available', () => {
      const result = snapPoint(
        { x: 100, y: 100 },
        20,
        snapPoints,
        false
      );
      
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
      expect(result.snapped).toBe(false);
    });

    it('should respect custom tolerance', () => {
      const result1 = snapPoint(
        { x: 20, y: 20 },
        40,
        snapPoints,
        true,
        20 // Large tolerance
      );
      expect(result1.snapped).toBe(true);
      expect(result1.snapType).toBe('endpoint');
      
      const result2 = snapPoint(
        { x: 20, y: 20 },
        40,
        snapPoints,
        true,
        5 // Small tolerance
      );
      expect(result2.snapped).toBe(false); // Should not snap with small tolerance
    });

    it('should handle edge case where point and grid snap have same distance', () => {
      const edgeSnapPoints: Point[] = [{ x: 15, y: 15 }];
      
      const result = snapPoint(
        { x: 17, y: 17 }, // Equidistant from point (15,15) and grid (20,20)
        20,
        edgeSnapPoints,
        true,
        5
      );
      
      // Should prefer point snapping
      expect(result.snapType).toBe('endpoint');
    });
  });

  describe('integration tests', () => {
    it('should work with realistic wall layout', () => {
      const walls = [
        { startX: 0, startY: 0, endX: 200, endY: 0 },     // Bottom wall
        { startX: 200, startY: 0, endX: 200, endY: 150 }, // Right wall
        { startX: 200, startY: 150, endX: 0, endY: 150 }, // Top wall
        { startX: 0, startY: 150, endX: 0, endY: 0 },     // Left wall
      ];
      
      const snapPoints = getWallSnapPoints(walls);
      
      // Test snapping near a corner
      const result1 = snapPoint({ x: 3, y: 2 }, 20, snapPoints, true);
      expect(result1.x).toBe(0);
      expect(result1.y).toBe(0);
      expect(result1.snapType).toBe('endpoint');
      
      // Test snapping near a midpoint
      const result2 = snapPoint({ x: 98, y: 3 }, 20, snapPoints, true);
      expect(result2.x).toBe(100);
      expect(result2.y).toBe(0);
      expect(result2.snapType).toBe('endpoint');
    });

    it('should handle complex snapping scenarios', () => {
      const walls = [
        { startX: 50, startY: 50, endX: 150, endY: 50 },
        { startX: 100, startY: 25, endX: 100, endY: 75 },
      ];
      
      const snapPoints = getWallSnapPoints(walls);
      
      // Point near intersection should snap to intersection
      const result = snapPoint({ x: 98, y: 52 }, 10, snapPoints, true);
      expect(result.x).toBe(100);
      expect(result.y).toBe(50);
      expect(result.snapType).toBe('endpoint');
    });

    it('should maintain performance with many snap points', () => {
      const manyWalls = Array.from({ length: 100 }, (_, i) => ({
        startX: i * 10,
        startY: 0,
        endX: i * 10,
        endY: 100,
      }));
      
      const snapPoints = getWallSnapPoints(manyWalls);
      expect(snapPoints).toHaveLength(300); // 100 walls × 3 points
      
      const start = performance.now();
      const result = snapPoint({ x: 55, y: 55 }, 20, snapPoints, true);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(10); // Should complete in under 10ms
      expect(result.snapped).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle NaN and Infinity values', () => {
      expect(() => snapToGrid({ x: NaN, y: 10 }, 20)).not.toThrow();
      expect(() => snapToGrid({ x: Infinity, y: 10 }, 20)).not.toThrow();
      expect(() => snapToPoints({ x: NaN, y: 10 }, [{ x: 0, y: 0 }])).not.toThrow();
    });

    it('should handle very large coordinates', () => {
      const result = snapToGrid({ x: 1000000, y: 1000000 }, 20);
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
      expect(result.snapped).toBe(true);
    });

    it('should handle very small grid sizes', () => {
      const result = snapToGrid({ x: 1.001, y: 1.002 }, 0.001);
      expect(result.x).toBeCloseTo(1.001, 3);
      expect(result.y).toBeCloseTo(1.002, 3);
      expect(result.snapped).toBe(true);
    });

    it('should handle zero tolerance', () => {
      const result1 = snapToGrid({ x: 10.1, y: 10.1 }, 10, 0);
      expect(result1.snapped).toBe(false);
      
      const result2 = snapToPoints({ x: 10.1, y: 10.1 }, [{ x: 10, y: 10 }], 0);
      expect(result2.snapped).toBe(false);
    });
  });
});