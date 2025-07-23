import {
  projectTo2D,
  projectTo3D,
  transformPoint,
  getViewMatrix,
  applyViewTransform,
  calculateViewBounds,
  screenToWorld,
  worldToScreen,
  isPointInView,
  getProjectionMatrix,
  ViewType,
  ProjectionType
} from '@/utils/viewProjection';

describe('viewProjection', () => {
  describe('projectTo2D', () => {
    it('should project 3D point to 2D plan view', () => {
      const point3D = { x: 100, y: 200, z: 50 };
      const result = projectTo2D(point3D, 'plan');

      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('should project 3D point to 2D elevation view', () => {
      const point3D = { x: 100, y: 200, z: 50 };
      const result = projectTo2D(point3D, 'elevation');

      expect(result).toEqual({ x: 100, y: 50 });
    });

    it('should project 3D point to 2D section view', () => {
      const point3D = { x: 100, y: 200, z: 50 };
      const result = projectTo2D(point3D, 'section');

      expect(result).toEqual({ x: 200, y: 50 });
    });

    it('should handle isometric projection', () => {
      const point3D = { x: 100, y: 200, z: 50 };
      const result = projectTo2D(point3D, 'isometric');

      expect(result.x).toBeCloseTo(100 - 200 * Math.cos(Math.PI / 6), 5);
      expect(result.y).toBeCloseTo(50 + 100 * Math.sin(Math.PI / 6) + 200 * Math.sin(Math.PI / 6), 5);
    });
  });

  describe('projectTo3D', () => {
    it('should project 2D point to 3D with default height', () => {
      const point2D = { x: 100, y: 200 };
      const result = projectTo3D(point2D, 'plan');

      expect(result).toEqual({ x: 100, y: 200, z: 0 });
    });

    it('should project 2D point to 3D with specified height', () => {
      const point2D = { x: 100, y: 200 };
      const result = projectTo3D(point2D, 'plan', 50);

      expect(result).toEqual({ x: 100, y: 200, z: 50 });
    });

    it('should project elevation view to 3D', () => {
      const point2D = { x: 100, y: 50 };
      const result = projectTo3D(point2D, 'elevation', 0, 200);

      expect(result).toEqual({ x: 100, y: 200, z: 50 });
    });

    it('should project section view to 3D', () => {
      const point2D = { x: 200, y: 50 };
      const result = projectTo3D(point2D, 'section', 100);

      expect(result).toEqual({ x: 100, y: 200, z: 50 });
    });
  });

  describe('transformPoint', () => {
    it('should apply translation transform', () => {
      const point = { x: 100, y: 200 };
      const transform = {
        translateX: 50,
        translateY: 30,
        scaleX: 1,
        scaleY: 1,
        rotation: 0
      };

      const result = transformPoint(point, transform);
      expect(result).toEqual({ x: 150, y: 230 });
    });

    it('should apply scale transform', () => {
      const point = { x: 100, y: 200 };
      const transform = {
        translateX: 0,
        translateY: 0,
        scaleX: 2,
        scaleY: 0.5,
        rotation: 0
      };

      const result = transformPoint(point, transform);
      expect(result).toEqual({ x: 200, y: 100 });
    });

    it('should apply rotation transform', () => {
      const point = { x: 100, y: 0 };
      const transform = {
        translateX: 0,
        translateY: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: Math.PI / 2 // 90 degrees
      };

      const result = transformPoint(point, transform);
      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(100, 5);
    });

    it('should apply combined transforms', () => {
      const point = { x: 100, y: 100 };
      const transform = {
        translateX: 50,
        translateY: 50,
        scaleX: 2,
        scaleY: 2,
        rotation: Math.PI / 4 // 45 degrees
      };

      const result = transformPoint(point, transform);
      // After scaling: (200, 200)
      // After rotation: (0, 200√2)
      // After translation: (50, 50 + 200√2)
      expect(result.x).toBeCloseTo(50, 5);
      expect(result.y).toBeCloseTo(50 + 200 * Math.sqrt(2), 5);
    });
  });

  describe('getViewMatrix', () => {
    it('should return identity matrix for plan view', () => {
      const matrix = getViewMatrix('plan');
      
      expect(matrix).toEqual([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ]);
    });

    it('should return elevation view matrix', () => {
      const matrix = getViewMatrix('elevation');
      
      expect(matrix[0]).toEqual([1, 0, 0, 0]); // X unchanged
      expect(matrix[1]).toEqual([0, 0, 1, 0]); // Y becomes Z
      expect(matrix[2]).toEqual([0, 1, 0, 0]); // Z becomes Y
      expect(matrix[3]).toEqual([0, 0, 0, 1]); // W unchanged
    });

    it('should return isometric view matrix', () => {
      const matrix = getViewMatrix('isometric');
      
      // Should be a valid 4x4 transformation matrix
      expect(matrix).toHaveLength(4);
      expect(matrix[0]).toHaveLength(4);
      expect(matrix[3]).toEqual([0, 0, 0, 1]); // Bottom row should be [0,0,0,1]
    });
  });

  describe('calculateViewBounds', () => {
    it('should calculate bounds for a set of points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 100, y: 200 },
        { x: 50, y: 150 },
        { x: -25, y: 75 }
      ];

      const bounds = calculateViewBounds(points);
      
      expect(bounds.minX).toBe(-25);
      expect(bounds.maxX).toBe(100);
      expect(bounds.minY).toBe(0);
      expect(bounds.maxY).toBe(200);
      expect(bounds.width).toBe(125);
      expect(bounds.height).toBe(200);
    });

    it('should handle single point', () => {
      const points = [{ x: 50, y: 100 }];
      const bounds = calculateViewBounds(points);
      
      expect(bounds.minX).toBe(50);
      expect(bounds.maxX).toBe(50);
      expect(bounds.minY).toBe(100);
      expect(bounds.maxY).toBe(100);
      expect(bounds.width).toBe(0);
      expect(bounds.height).toBe(0);
    });

    it('should handle empty points array', () => {
      const bounds = calculateViewBounds([]);
      
      expect(bounds.minX).toBe(0);
      expect(bounds.maxX).toBe(0);
      expect(bounds.minY).toBe(0);
      expect(bounds.maxY).toBe(0);
      expect(bounds.width).toBe(0);
      expect(bounds.height).toBe(0);
    });
  });

  describe('screenToWorld', () => {
    it('should convert screen coordinates to world coordinates', () => {
      const screenPoint = { x: 400, y: 300 };
      const viewport = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        scale: 1,
        offsetX: 0,
        offsetY: 0
      };

      const worldPoint = screenToWorld(screenPoint, viewport);
      expect(worldPoint).toEqual({ x: 400, y: 300 });
    });

    it('should handle viewport scaling', () => {
      const screenPoint = { x: 400, y: 300 };
      const viewport = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        scale: 2,
        offsetX: 0,
        offsetY: 0
      };

      const worldPoint = screenToWorld(screenPoint, viewport);
      expect(worldPoint).toEqual({ x: 200, y: 150 });
    });

    it('should handle viewport offset', () => {
      const screenPoint = { x: 400, y: 300 };
      const viewport = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        scale: 1,
        offsetX: 100,
        offsetY: 50
      };

      const worldPoint = screenToWorld(screenPoint, viewport);
      expect(worldPoint).toEqual({ x: 500, y: 350 });
    });
  });

  describe('worldToScreen', () => {
    it('should convert world coordinates to screen coordinates', () => {
      const worldPoint = { x: 400, y: 300 };
      const viewport = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        scale: 1,
        offsetX: 0,
        offsetY: 0
      };

      const screenPoint = worldToScreen(worldPoint, viewport);
      expect(screenPoint).toEqual({ x: 400, y: 300 });
    });

    it('should handle viewport scaling', () => {
      const worldPoint = { x: 200, y: 150 };
      const viewport = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        scale: 2,
        offsetX: 0,
        offsetY: 0
      };

      const screenPoint = worldToScreen(worldPoint, viewport);
      expect(screenPoint).toEqual({ x: 400, y: 300 });
    });

    it('should handle viewport offset', () => {
      const worldPoint = { x: 500, y: 350 };
      const viewport = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        scale: 1,
        offsetX: 100,
        offsetY: 50
      };

      const screenPoint = worldToScreen(worldPoint, viewport);
      expect(screenPoint).toEqual({ x: 400, y: 300 });
    });
  });

  describe('isPointInView', () => {
    const viewport = {
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      scale: 1,
      offsetX: 0,
      offsetY: 0
    };

    it('should return true for points inside viewport', () => {
      const point = { x: 400, y: 300 };
      expect(isPointInView(point, viewport)).toBe(true);
    });

    it('should return false for points outside viewport', () => {
      expect(isPointInView({ x: -100, y: 300 }, viewport)).toBe(false);
      expect(isPointInView({ x: 900, y: 300 }, viewport)).toBe(false);
      expect(isPointInView({ x: 400, y: -100 }, viewport)).toBe(false);
      expect(isPointInView({ x: 400, y: 700 }, viewport)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isPointInView({ x: 0, y: 0 }, viewport)).toBe(true);
      expect(isPointInView({ x: 800, y: 600 }, viewport)).toBe(false); // Exclusive bounds
    });
  });

  describe('getProjectionMatrix', () => {
    it('should return orthographic projection matrix', () => {
      const matrix = getProjectionMatrix('orthographic', {
        left: -100,
        right: 100,
        top: 100,
        bottom: -100,
        near: 0.1,
        far: 1000
      });

      expect(matrix).toHaveLength(4);
      expect(matrix[0]).toHaveLength(4);
      // Orthographic matrix should have specific structure
      expect(matrix[0][0]).toBeCloseTo(0.01, 5); // 2/(right-left)
      expect(matrix[1][1]).toBeCloseTo(0.01, 5); // 2/(top-bottom)
    });

    it('should return perspective projection matrix', () => {
      const matrix = getProjectionMatrix('perspective', {
        fov: Math.PI / 4, // 45 degrees
        aspect: 16 / 9,
        near: 0.1,
        far: 1000
      });

      expect(matrix).toHaveLength(4);
      expect(matrix[0]).toHaveLength(4);
      // Perspective matrix should have specific structure
      expect(matrix[2][3]).toBe(-1); // Perspective projection marker
    });
  });

  describe('applyViewTransform', () => {
    it('should apply view transform to multiple points', () => {
      const points = [
        { x: 0, y: 0, z: 0 },
        { x: 100, y: 100, z: 100 }
      ];

      const transform = {
        translateX: 50,
        translateY: 50,
        translateZ: 50,
        scaleX: 2,
        scaleY: 2,
        scaleZ: 2,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0
      };

      const result = applyViewTransform(points, transform);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ x: 50, y: 50, z: 50 });
      expect(result[1]).toEqual({ x: 250, y: 250, z: 250 });
    });

    it('should handle empty points array', () => {
      const result = applyViewTransform([], {
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0
      });

      expect(result).toEqual([]);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle invalid view types gracefully', () => {
      const point3D = { x: 100, y: 200, z: 50 };
      
      // Should default to plan view for invalid type
      const result = projectTo2D(point3D, 'invalid' as ViewType);
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('should handle zero scale transforms', () => {
      const point = { x: 100, y: 200 };
      const transform = {
        translateX: 0,
        translateY: 0,
        scaleX: 0,
        scaleY: 0,
        rotation: 0
      };

      const result = transformPoint(point, transform);
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should handle very large coordinates', () => {
      const point = { x: 1e6, y: 1e6 };
      const transform = {
        translateX: 1e6,
        translateY: 1e6,
        scaleX: 1,
        scaleY: 1,
        rotation: 0
      };

      const result = transformPoint(point, transform);
      expect(result).toEqual({ x: 2e6, y: 2e6 });
    });

    it('should handle negative coordinates', () => {
      const point = { x: -100, y: -200 };
      const transform = {
        translateX: 50,
        translateY: 100,
        scaleX: 2,
        scaleY: 2,
        rotation: 0
      };

      const result = transformPoint(point, transform);
      expect(result).toEqual({ x: -150, y: -300 });
    });
  });
});