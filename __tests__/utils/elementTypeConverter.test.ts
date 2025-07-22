import { 
  convertWallToWall2D,
  convertDoorToDoor2D,
  convertWindowToWindow2D,
  convertStairToStair2D,
  convertRoofToRoof2D,
  convertRoomToRoom2D,
  convertElementsToElement2D,
  getElementTypeFromElement2D
} from '@/utils/elementTypeConverter';

describe('elementTypeConverter', () => {
  describe('convertWallToWall2D', () => {
    it('converts wall to Wall2D successfully', () => {
      const wall = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 10,
        height: 96,
        materialId: 'default'
      };

      const result = convertWallToWall2D(wall);

      expect(result).toEqual(
        expect.objectContaining({
          id: 'wall-1',
          type: 'wall2d',
          start: { x: 0, y: 0 },
          end: { x: 100, y: 0 },
          thickness: 10,
          height: 96,
        })
      );
    });

    it('converts door to window successfully', () => {
      const door = {
        id: 'door-1',
        type: 'door',
        x: 100,
        y: 100,
        width: 80,
        height: 20,
        wallId: 'wall-1',
      };

      const result = convertElement(door, 'window');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'door-1',
          type: 'window',
          x: 100,
          y: 100,
          wallId: 'wall-1',
        })
      );
    });

    it('handles unsupported conversions', () => {
      const roof = {
        id: 'roof-1',
        type: 'roof',
        points: [[0, 0], [100, 0], [50, 50]],
      };

      expect(() => {
        convertElement(roof, 'door');
      }).toThrow('Unsupported conversion from roof to door');
    });

    it('preserves common properties during conversion', () => {
      const element = {
        id: 'element-1',
        type: 'wall',
        material: 'brick',
        color: '#FF0000',
        isSelected: true,
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
      };

      const result = convertElement(element, 'door');

      expect(result.material).toBe('brick');
      expect(result.color).toBe('#FF0000');
      expect(result.isSelected).toBe(true);
    });
  });

  describe('validateElement', () => {
    it('validates wall data successfully', () => {
      const wallData = {
        id: 'wall-1',
        type: 'wall',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 10,
      };

      const result = validateElement(wallData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects missing required properties', () => {
      const invalidWall = {
        id: 'wall-1',
        type: 'wall',
        startX: 0,
        // Missing startY, endX, endY
      };

      const result = validateElement(invalidWall);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required property: startY');
      expect(result.errors).toContain('Missing required property: endX');
      expect(result.errors).toContain('Missing required property: endY');
    });

    it('detects invalid property types', () => {
      const invalidWall = {
        id: 'wall-1',
        type: 'wall',
        startX: 'invalid',
        startY: 0,
        endX: 100,
        endY: 0,
      };

      const result = validateElement(invalidWall);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid type for startX: expected number, got string');
    });

    it('validates door data with wall reference', () => {
      const doorData = {
        id: 'door-1',
        type: 'door',
        x: 100,
        y: 100,
        width: 80,
        height: 20,
        wallId: 'wall-1',
      };

      const result = validateElement(doorData);

      expect(result.isValid).toBe(true);
    });

    it('detects invalid door placement', () => {
      const invalidDoor = {
        id: 'door-1',
        type: 'door',
        x: 100,
        y: 100,
        width: -80, // Negative width
        height: 20,
      };

      const result = validateElement(invalidDoor);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Width must be positive');
    });
  });

  describe('migrateElement', () => {
    it('migrates v1 wall to current version', () => {
      const v1Wall = {
        id: 'wall-1',
        type: 'wall',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 0 },
        width: 10,
        version: 1,
      };

      const result = migrateElement(v1Wall);

      expect(result).toEqual(
        expect.objectContaining({
          id: 'wall-1',
          type: 'wall',
          startX: 0,
          startY: 0,
          endX: 100,
          endY: 0,
          thickness: 10,
          version: expect.any(Number),
        })
      );
    });

    it('migrates v2 door to current version', () => {
      const v2Door = {
        id: 'door-1',
        type: 'door',
        position: { x: 100, y: 100 },
        size: { width: 80, height: 20 },
        wall: 'wall-1',
        version: 2,
      };

      const result = migrateElement(v2Door);

      expect(result).toEqual(
        expect.objectContaining({
          id: 'door-1',
          type: 'door',
          x: 100,
          y: 100,
          width: 80,
          height: 20,
          wallId: 'wall-1',
          version: expect.any(Number),
        })
      );
    });

    it('handles already current version', () => {
      const currentElement = {
        id: 'element-1',
        type: 'wall',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        version: 3, // Current version
      };

      const result = migrateElement(currentElement);

      expect(result).toEqual(currentElement);
    });

    it('handles missing version property', () => {
      const noVersionElement = {
        id: 'element-1',
        type: 'wall',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 0 },
      };

      const result = migrateElement(noVersionElement);

      expect(result.version).toBeDefined();
      expect(result.startX).toBe(0);
      expect(result.endX).toBe(100);
    });
  });

  describe('getElementDefaults', () => {
    it('returns wall defaults', () => {
      const defaults = getElementDefaults('wall');

      expect(defaults).toEqual(
        expect.objectContaining({
          type: 'wall',
          thickness: expect.any(Number),
          height: expect.any(Number),
          material: expect.any(String),
          color: expect.any(String),
        })
      );
    });

    it('returns door defaults', () => {
      const defaults = getElementDefaults('door');

      expect(defaults).toEqual(
        expect.objectContaining({
          type: 'door',
          width: expect.any(Number),
          height: expect.any(Number),
          doorType: expect.any(String),
          openDirection: expect.any(String),
        })
      );
    });

    it('returns window defaults', () => {
      const defaults = getElementDefaults('window');

      expect(defaults).toEqual(
        expect.objectContaining({
          type: 'window',
          width: expect.any(Number),
          height: expect.any(Number),
          windowType: expect.any(String),
        })
      );
    });

    it('handles unknown element type', () => {
      expect(() => {
        getElementDefaults('unknown' as any);
      }).toThrow('Unknown element type: unknown');
    });
  });

  describe('Edge Cases', () => {
    it('handles null input', () => {
      expect(() => {
        convertElement(null as any, 'door');
      }).toThrow('Invalid element data');
    });

    it('handles undefined input', () => {
      expect(() => {
        convertElement(undefined as any, 'door');
      }).toThrow('Invalid element data');
    });

    it('handles circular references in element data', () => {
      const element: any = {
        id: 'element-1',
        type: 'wall',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
      };
      element.self = element; // Circular reference

      expect(() => {
        validateElement(element);
      }).not.toThrow(); // Should handle gracefully
    });

    it('handles very large coordinate values', () => {
      const largeElement = {
        id: 'element-1',
        type: 'wall',
        startX: Number.MAX_SAFE_INTEGER,
        startY: Number.MAX_SAFE_INTEGER,
        endX: Number.MAX_SAFE_INTEGER,
        endY: Number.MAX_SAFE_INTEGER,
      };

      const result = validateElement(largeElement);
      expect(result.isValid).toBe(true);
    });

    it('handles NaN and Infinity values', () => {
      const invalidElement = {
        id: 'element-1',
        type: 'wall',
        startX: NaN,
        startY: Infinity,
        endX: -Infinity,
        endY: 0,
      };

      const result = validateElement(invalidElement);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid coordinate value: startX is NaN');
      expect(result.errors).toContain('Invalid coordinate value: startY is Infinity');
    });

    it('handles empty string IDs', () => {
      const element = {
        id: '',
        type: 'wall',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
      };

      const result = validateElement(element);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ID cannot be empty');
    });

    it('handles special characters in IDs', () => {
      const element = {
        id: 'wall-1!@#$%',
        type: 'wall',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
      };

      const result = validateElement(element);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ID contains invalid characters');
    });
  });

  describe('Performance', () => {
    it('handles large datasets efficiently', () => {
      const elements = Array.from({ length: 1000 }, (_, i) => ({
        id: `element-${i}`,
        type: 'wall',
        startX: i,
        startY: i,
        endX: i + 100,
        endY: i,
      }));

      const startTime = performance.now();
      elements.forEach(element => validateElement(element));
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('caches validation results for identical elements', () => {
      const element = {
        id: 'wall-1',
        type: 'wall',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
      };

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        validateElement(element);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be fast due to caching
    });
  });
});