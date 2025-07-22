import {
  findWallIntersections,
  joinWalls,
  splitWallAtPoint,
  mergeWalls,
  validateWallJoin
} from '@/utils/wallJoining2D';

describe('wallJoining2D', () => {
  describe('findWallIntersections', () => {
    it('finds intersection between perpendicular walls', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 50,
        startY: -50,
        endX: 50,
        endY: 50,
      };

      const intersections = findWallIntersections([wall1, wall2]);

      expect(intersections).toHaveLength(1);
      expect(intersections[0]).toEqual({
        point: { x: 50, y: 0 },
        wall1Id: 'wall-1',
        wall2Id: 'wall-2',
        type: 'cross',
      });
    });

    it('finds T-junction intersection', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 50,
        startY: 0,
        endX: 50,
        endY: 50,
      };

      const intersections = findWallIntersections([wall1, wall2]);

      expect(intersections).toHaveLength(1);
      expect(intersections[0].type).toBe('t-junction');
    });

    it('finds corner intersection', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 100,
        startY: 0,
        endX: 100,
        endY: 100,
      };

      const intersections = findWallIntersections([wall1, wall2]);

      expect(intersections).toHaveLength(1);
      expect(intersections[0].type).toBe('corner');
    });

    it('handles parallel walls with no intersection', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 0,
        startY: 10,
        endX: 100,
        endY: 10,
      };

      const intersections = findWallIntersections([wall1, wall2]);

      expect(intersections).toHaveLength(0);
    });

    it('handles overlapping walls', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 50,
        startY: 0,
        endX: 150,
        endY: 0,
      };

      const intersections = findWallIntersections([wall1, wall2]);

      expect(intersections).toHaveLength(1);
      expect(intersections[0].type).toBe('overlap');
    });
  });

  describe('joinWalls', () => {
    it('joins two walls at intersection point', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 10,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 50,
        startY: -50,
        endX: 50,
        endY: 50,
        thickness: 10,
      };

      const result = joinWalls(wall1, wall2, { x: 50, y: 0 });

      expect(result.success).toBe(true);
      expect(result.joinPoint).toEqual({ x: 50, y: 0 });
      expect(result.modifiedWalls).toHaveLength(2);
    });

    it('handles walls with different thicknesses', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 10,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 50,
        startY: -50,
        endX: 50,
        endY: 50,
        thickness: 20,
      };

      const result = joinWalls(wall1, wall2, { x: 50, y: 0 });

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Wall thickness mismatch');
    });

    it('fails to join walls that are too far apart', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 10,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 200,
        startY: 200,
        endX: 300,
        endY: 200,
        thickness: 10,
      };

      const result = joinWalls(wall1, wall2, { x: 150, y: 100 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Walls are too far apart');
    });
  });

  describe('splitWallAtPoint', () => {
    it('splits wall at midpoint', () => {
      const wall = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 10,
        material: 'drywall',
      };

      const result = splitWallAtPoint(wall, { x: 50, y: 0 });

      expect(result.success).toBe(true);
      expect(result.newWalls).toHaveLength(2);
      
      const [wall1, wall2] = result.newWalls!;
      expect(wall1.endX).toBe(50);
      expect(wall2.startX).toBe(50);
      expect(wall1.material).toBe('drywall');
      expect(wall2.material).toBe('drywall');
    });

    it('fails to split at wall endpoint', () => {
      const wall = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 10,
      };

      const result = splitWallAtPoint(wall, { x: 0, y: 0 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot split at endpoint');
    });

    it('fails to split at point not on wall', () => {
      const wall = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 10,
      };

      const result = splitWallAtPoint(wall, { x: 50, y: 50 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Point not on wall');
    });
  });

  describe('mergeWalls', () => {
    it('merges collinear walls', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 50,
        endY: 0,
        thickness: 10,
        material: 'drywall',
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 50,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 10,
        material: 'drywall',
      };

      const result = mergeWalls(wall1, wall2);

      expect(result.success).toBe(true);
      expect(result.mergedWall).toEqual(
        expect.objectContaining({
          startX: 0,
          startY: 0,
          endX: 100,
          endY: 0,
          thickness: 10,
          material: 'drywall',
        })
      );
    });

    it('fails to merge non-collinear walls', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 50,
        endY: 0,
        thickness: 10,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 50,
        startY: 0,
        endX: 100,
        endY: 50,
        thickness: 10,
      };

      const result = mergeWalls(wall1, wall2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Walls are not collinear');
    });

    it('fails to merge walls with different materials', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 50,
        endY: 0,
        thickness: 10,
        material: 'drywall',
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 50,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 10,
        material: 'brick',
      };

      const result = mergeWalls(wall1, wall2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Material mismatch');
    });
  });

  describe('validateWallJoin', () => {
    it('validates valid wall join', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 10,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 50,
        startY: -50,
        endX: 50,
        endY: 50,
        thickness: 10,
      };

      const validation = validateWallJoin(wall1, wall2, { x: 50, y: 0 });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('detects structural issues', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 5,
        isLoadBearing: true,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 50,
        startY: -50,
        endX: 50,
        endY: 50,
        thickness: 20,
        isLoadBearing: false,
      };

      const validation = validateWallJoin(wall1, wall2, { x: 50, y: 0 });

      expect(validation.warnings).toContain('Load-bearing wall joined to non-load-bearing wall');
      expect(validation.warnings).toContain('Significant thickness difference');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero-length walls', () => {
      const wall = {
        id: 'wall-1',
        startX: 50,
        startY: 50,
        endX: 50,
        endY: 50,
        thickness: 10,
      };

      const result = splitWallAtPoint(wall, { x: 50, y: 50 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot split zero-length wall');
    });

    it('handles walls with extreme coordinates', () => {
      const wall1 = {
        id: 'wall-1',
        startX: -1000000,
        startY: -1000000,
        endX: 1000000,
        endY: 1000000,
        thickness: 10,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 0,
        startY: -1000000,
        endX: 0,
        endY: 1000000,
        thickness: 10,
      };

      const intersections = findWallIntersections([wall1, wall2]);

      expect(intersections).toHaveLength(1);
      expect(intersections[0].point).toEqual({ x: 0, y: 0 });
    });

    it('handles floating point precision issues', () => {
      const wall1 = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 0.1 + 0.2, // 0.30000000000000004
        endY: 0,
        thickness: 10,
      };
      
      const wall2 = {
        id: 'wall-2',
        startX: 0.3,
        startY: 0,
        endX: 0.6,
        endY: 0,
        thickness: 10,
      };

      const result = mergeWalls(wall1, wall2);

      expect(result.success).toBe(true); // Should handle floating point precision
    });
  });
});