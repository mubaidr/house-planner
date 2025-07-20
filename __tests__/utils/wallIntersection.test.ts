import {
  findWallIntersections,
  getWallSnapPointsWithIntersections,
  calculateIntersectionPoint,
  areWallsConnected,
  joinWallsAtIntersection,
} from '@/utils/wallIntersection';
import { Wall } from '@/types/elements/Wall';

describe('Wall Intersection Utils', () => {
  const createWall = (id: string, startX: number, startY: number, endX: number, endY: number): Wall => ({
    id,
    type: 'wall',
    startX,
    startY,
    endX,
    endY,
    thickness: 6,
    height: 96,
    color: '#000000',
    materialId: 'default-wall',
    floorId: 'floor-1',
    visible: true,
    locked: false,
  });

  describe('calculateIntersectionPoint', () => {
    it('should calculate intersection of perpendicular walls', () => {
      const wall1 = createWall('wall-1', 0, 0, 100, 0); // Horizontal
      const wall2 = createWall('wall-2', 50, -50, 50, 50); // Vertical

      const intersection = calculateIntersectionPoint(wall1, wall2);

      expect(intersection).toEqual({ x: 50, y: 0 });
    });

    it('should calculate intersection of diagonal walls', () => {
      const wall1 = createWall('wall-1', 0, 0, 100, 100); // Diagonal up-right
      const wall2 = createWall('wall-2', 0, 100, 100, 0); // Diagonal down-right

      const intersection = calculateIntersectionPoint(wall1, wall2);

      expect(intersection).toEqual({ x: 50, y: 50 });
    });

    it('should return null for parallel walls', () => {
      const wall1 = createWall('wall-1', 0, 0, 100, 0); // Horizontal
      const wall2 = createWall('wall-2', 0, 10, 100, 10); // Parallel horizontal

      const intersection = calculateIntersectionPoint(wall1, wall2);

      expect(intersection).toBeNull();
    });

    it('should return null for non-intersecting walls', () => {
      const wall1 = createWall('wall-1', 0, 0, 50, 0); // Short horizontal
      const wall2 = createWall('wall-2', 60, -50, 60, 50); // Vertical, no intersection

      const intersection = calculateIntersectionPoint(wall1, wall2);

      expect(intersection).toBeNull();
    });

    it('should handle walls with same start/end points', () => {
      const wall1 = createWall('wall-1', 0, 0, 0, 0); // Point wall
      const wall2 = createWall('wall-2', 0, 0, 100, 0); // Normal wall

      const intersection = calculateIntersectionPoint(wall1, wall2);

      expect(intersection).toBeNull(); // Zero-length walls don't intersect
    });
  });

  describe('areWallsConnected', () => {
    it('should detect walls connected at endpoints', () => {
      const wall1 = createWall('wall-1', 0, 0, 100, 0);
      const wall2 = createWall('wall-2', 100, 0, 100, 100);

      expect(areWallsConnected(wall1, wall2)).toBe(true);
    });

    it('should detect walls connected with tolerance', () => {
      const wall1 = createWall('wall-1', 0, 0, 100, 0);
      const wall2 = createWall('wall-2', 99.5, 0, 99.5, 100); // Slightly off

      expect(areWallsConnected(wall1, wall2, 1)).toBe(true);
    });

    it('should return false for disconnected walls', () => {
      const wall1 = createWall('wall-1', 0, 0, 100, 0);
      const wall2 = createWall('wall-2', 200, 0, 200, 100);

      expect(areWallsConnected(wall1, wall2)).toBe(false);
    });

    it('should handle walls that overlap but are not connected at endpoints', () => {
      const wall1 = createWall('wall-1', 0, 0, 100, 0);
      const wall2 = createWall('wall-2', 50, 0, 150, 0); // Overlapping

      expect(areWallsConnected(wall1, wall2)).toBe(false);
    });
  });

  describe('findWallIntersections', () => {
    it('should find all intersections in a wall set', () => {
      const walls = [
        createWall('wall-1', 0, 0, 100, 0), // Horizontal
        createWall('wall-2', 50, -50, 50, 50), // Vertical intersecting
        createWall('wall-3', 200, 0, 300, 0), // Separate horizontal
        createWall('wall-4', 25, -25, 75, 25), // Diagonal intersecting wall-1
      ];

      const intersections = findWallIntersections(walls);

      expect(intersections).toHaveLength(3);
      
      // Check that we find the expected intersections
      const intersectionPoints = intersections.map(i => i.point);
      expect(intersectionPoints).toContainEqual({ x: 50, y: 0 }); // wall-1 & wall-2
      
      // Verify specific intersections exist
      const wall1Wall2 = intersections.find(i => 
        (i.wall1.id === 'wall-1' && i.wall2.id === 'wall-2') ||
        (i.wall1.id === 'wall-2' && i.wall2.id === 'wall-1')
      );
      expect(wall1Wall2).toBeDefined();
      expect(wall1Wall2?.point).toEqual({ x: 50, y: 0 });
    });

    it('should handle empty wall array', () => {
      const intersections = findWallIntersections([]);
      expect(intersections).toEqual([]);
    });

    it('should handle single wall', () => {
      const walls = [createWall('wall-1', 0, 0, 100, 0)];
      const intersections = findWallIntersections(walls);
      expect(intersections).toEqual([]);
    });

    it('should not find intersections for parallel walls', () => {
      const walls = [
        createWall('wall-1', 0, 0, 100, 0),
        createWall('wall-2', 0, 10, 100, 10),
        createWall('wall-3', 0, 20, 100, 20),
      ];

      const intersections = findWallIntersections(walls);
      expect(intersections).toEqual([]);
    });
  });

  describe('getWallSnapPointsWithIntersections', () => {
    it('should return snap points including intersections', () => {
      const walls = [
        createWall('wall-1', 0, 0, 100, 0),
        createWall('wall-2', 50, -50, 50, 50),
      ];

      const snapPoints = getWallSnapPointsWithIntersections(walls);

      expect(snapPoints).toContainEqual({ x: 0, y: 0 }); // Wall endpoints
      expect(snapPoints).toContainEqual({ x: 100, y: 0 });
      expect(snapPoints).toContainEqual({ x: 50, y: -50 });
      expect(snapPoints).toContainEqual({ x: 50, y: 50 });
      expect(snapPoints).toContainEqual({ x: 50, y: 0 }); // Intersection point
    });

    it('should include midpoints when specified', () => {
      const walls = [createWall('wall-1', 0, 0, 100, 0)];

      const snapPoints = getWallSnapPointsWithIntersections(walls, true);

      expect(snapPoints).toContainEqual({ x: 50, y: 0 }); // Midpoint
    });

    it('should handle empty walls array', () => {
      const snapPoints = getWallSnapPointsWithIntersections([]);
      expect(snapPoints).toEqual([]);
    });

    it('should remove duplicate points', () => {
      const walls = [
        createWall('wall-1', 0, 0, 100, 0),
        createWall('wall-2', 100, 0, 100, 100), // Connected at (100, 0)
      ];

      const snapPoints = getWallSnapPointsWithIntersections(walls);

      // Should not have duplicate (100, 0) points
      const point100_0 = snapPoints.filter(p => p.x === 100 && p.y === 0);
      expect(point100_0).toHaveLength(1);
    });
  });

  describe('joinWallsAtIntersection', () => {
    it('should join walls at intersection point', () => {
      const wall1 = createWall('wall-1', 0, 0, 100, 0);
      const wall2 = createWall('wall-2', 50, -50, 50, 50);

      const result = joinWallsAtIntersection(wall1, wall2);

      expect(result.success).toBe(true);
      expect(result.updatedWalls).toHaveLength(2);
      
      // Walls should be modified to connect at intersection
      const updatedWall1 = result.updatedWalls.find(w => w.id === 'wall-1');
      const updatedWall2 = result.updatedWalls.find(w => w.id === 'wall-2');
      
      expect(updatedWall1).toBeDefined();
      expect(updatedWall2).toBeDefined();
    });

    it('should handle walls that do not intersect', () => {
      const wall1 = createWall('wall-1', 0, 0, 100, 0);
      const wall2 = createWall('wall-2', 200, 0, 200, 100);

      const result = joinWallsAtIntersection(wall1, wall2);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Walls do not intersect');
      expect(result.updatedWalls).toEqual([]);
    });

    it('should handle parallel walls', () => {
      const wall1 = createWall('wall-1', 0, 0, 100, 0);
      const wall2 = createWall('wall-2', 0, 10, 100, 10);

      const result = joinWallsAtIntersection(wall1, wall2);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Walls are parallel');
      expect(result.updatedWalls).toEqual([]);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle T-junction intersections', () => {
      const walls = [
        createWall('wall-1', 0, 0, 100, 0), // Horizontal base
        createWall('wall-2', 50, 0, 50, 50), // Vertical T
      ];

      const intersections = findWallIntersections(walls);
      expect(intersections).toHaveLength(1);
      expect(intersections[0].point).toEqual({ x: 50, y: 0 });
    });

    it('should handle cross intersections', () => {
      const walls = [
        createWall('wall-1', 0, 50, 100, 50), // Horizontal
        createWall('wall-2', 50, 0, 50, 100), // Vertical
      ];

      const intersections = findWallIntersections(walls);
      expect(intersections).toHaveLength(1);
      expect(intersections[0].point).toEqual({ x: 50, y: 50 });
    });

    it('should handle multiple intersections on same wall', () => {
      const walls = [
        createWall('wall-1', 0, 0, 100, 0), // Long horizontal
        createWall('wall-2', 25, -25, 25, 25), // First vertical
        createWall('wall-3', 75, -25, 75, 25), // Second vertical
      ];

      const intersections = findWallIntersections(walls);
      expect(intersections).toHaveLength(2);
      expect(intersections.map(i => i.point)).toContainEqual({ x: 25, y: 0 });
      expect(intersections.map(i => i.point)).toContainEqual({ x: 75, y: 0 });
    });

    it('should handle walls with different thicknesses', () => {
      const wall1 = { ...createWall('wall-1', 0, 0, 100, 0), thickness: 6 };
      const wall2 = { ...createWall('wall-2', 50, -50, 50, 50), thickness: 12 };

      const intersection = calculateIntersectionPoint(wall1, wall2);
      expect(intersection).toEqual({ x: 50, y: 0 });
    });

    it('should handle very small walls', () => {
      const wall1 = createWall('wall-1', 0, 0, 1, 0); // 1 unit long
      const wall2 = createWall('wall-2', 0.5, -0.5, 0.5, 0.5); // Intersecting

      const intersection = calculateIntersectionPoint(wall1, wall2);
      expect(intersection).toEqual({ x: 0.5, y: 0 });
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of walls efficiently', () => {
      const walls = Array.from({ length: 100 }, (_, i) => 
        createWall(`wall-${i}`, i * 10, 0, i * 10 + 10, 10)
      );

      const startTime = Date.now();
      const intersections = findWallIntersections(walls);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(intersections).toBeDefined();
    });

    it('should optimize snap point calculation', () => {
      const walls = Array.from({ length: 50 }, (_, i) => 
        createWall(`wall-${i}`, i * 20, 0, i * 20 + 20, 0)
      );

      const startTime = Date.now();
      const snapPoints = getWallSnapPointsWithIntersections(walls, true);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500); // Should complete within 0.5 seconds
      expect(snapPoints.length).toBeGreaterThan(0);
    });
  });
});