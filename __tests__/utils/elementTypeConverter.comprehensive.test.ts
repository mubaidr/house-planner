import {
  convertToWall,
  convertToDoor,
  convertToWindow,
  convertToStair,
  convertToRoof,
  convertToRoom,
  convertElementType,
  validateElementConversion,
  getConversionOptions,
} from '../../src/utils/elementTypeConverter';
import { Wall } from '../../src/types/elements/Wall';
import { Door } from '../../src/types/elements/Door';
import { Window } from '../../src/types/elements/Window';

describe('elementTypeConverter - Comprehensive Tests', () => {
  const mockWall: Wall = {
    id: 'wall-1',
    type: 'wall',
    startX: 0,
    startY: 0,
    endX: 100,
    endY: 0,
    thickness: 6,
    height: 96,
    color: '#000000',
    materialId: 'default-wall',
    floorId: 'floor-1',
    visible: true,
    locked: false,
  };

  const mockDoor: Door = {
    id: 'door-1',
    type: 'door',
    wallId: 'wall-1',
    position: 50,
    width: 36,
    height: 84,
    swing: 'inward',
    hinge: 'left',
    materialId: 'default-door',
    floorId: 'floor-1',
    visible: true,
    locked: false,
  };

  describe('convertToWall', () => {
    it('should convert door to wall', () => {
      const result = convertToWall(mockDoor);
      
      expect(result.type).toBe('wall');
      expect(result.id).toContain('wall-');
      expect(result.floorId).toBe(mockDoor.floorId);
      expect(result.visible).toBe(mockDoor.visible);
      expect(result.locked).toBe(mockDoor.locked);
    });

    it('should handle conversion with custom properties', () => {
      const customDoor = { ...mockDoor, customProperty: 'test' };
      const result = convertToWall(customDoor);
      
      expect(result.type).toBe('wall');
      expect(result).toHaveProperty('thickness');
      expect(result).toHaveProperty('height');
    });

    it('should preserve common properties during conversion', () => {
      const result = convertToWall(mockDoor);
      
      expect(result.floorId).toBe(mockDoor.floorId);
      expect(result.materialId).toBe(mockDoor.materialId);
      expect(result.visible).toBe(mockDoor.visible);
      expect(result.locked).toBe(mockDoor.locked);
    });
  });

  describe('convertToDoor', () => {
    it('should convert wall to door', () => {
      const result = convertToDoor(mockWall);
      
      expect(result.type).toBe('door');
      expect(result.id).toContain('door-');
      expect(result).toHaveProperty('wallId');
      expect(result).toHaveProperty('position');
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('swing');
      expect(result).toHaveProperty('hinge');
    });

    it('should set default door properties', () => {
      const result = convertToDoor(mockWall);
      
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
      expect(['inward', 'outward']).toContain(result.swing);
      expect(['left', 'right']).toContain(result.hinge);
    });
  });

  describe('convertToWindow', () => {
    it('should convert wall to window', () => {
      const result = convertToWindow(mockWall);
      
      expect(result.type).toBe('window');
      expect(result.id).toContain('window-');
      expect(result).toHaveProperty('wallId');
      expect(result).toHaveProperty('position');
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
    });

    it('should set appropriate window dimensions', () => {
      const result = convertToWindow(mockWall);
      
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
      expect(result.height).toBeLessThan(mockWall.height);
    });
  });

  describe('convertElementType', () => {
    it('should convert between different element types', () => {
      const wallToDoor = convertElementType(mockWall, 'door');
      expect(wallToDoor.type).toBe('door');
      
      const doorToWindow = convertElementType(mockDoor, 'window');
      expect(doorToWindow.type).toBe('window');
    });

    it('should handle same-type conversion', () => {
      const result = convertElementType(mockWall, 'wall');
      expect(result.type).toBe('wall');
      expect(result.id).toBe(mockWall.id);
    });

    it('should throw error for invalid conversions', () => {
      expect(() => {
        // @ts-expect-error Testing invalid type
        convertElementType(mockWall, 'invalid-type');
      }).toThrow();
    });
  });

  describe('validateElementConversion', () => {
    it('should validate valid conversions', () => {
      expect(validateElementConversion(mockWall, 'door')).toBe(true);
      expect(validateElementConversion(mockWall, 'window')).toBe(true);
      expect(validateElementConversion(mockDoor, 'window')).toBe(true);
    });

    it('should reject invalid conversions', () => {
      // @ts-expect-error Testing invalid type
      expect(validateElementConversion(mockWall, 'invalid')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateElementConversion(null, 'wall')).toBe(false);
      expect(validateElementConversion(undefined, 'door')).toBe(false);
    });
  });

  describe('getConversionOptions', () => {
    it('should return available conversion options for wall', () => {
      const options = getConversionOptions(mockWall);
      
      expect(options).toContain('door');
      expect(options).toContain('window');
      expect(options.length).toBeGreaterThan(0);
    });

    it('should return different options for different element types', () => {
      const wallOptions = getConversionOptions(mockWall);
      const doorOptions = getConversionOptions(mockDoor);
      
      expect(wallOptions).not.toEqual(doorOptions);
    });

    it('should handle unknown element types', () => {
      const unknownElement = { type: 'unknown', id: 'test' };
      const options = getConversionOptions(unknownElement);
      
      expect(Array.isArray(options)).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined inputs gracefully', () => {
      expect(() => convertToWall(null)).not.toThrow();
      expect(() => convertToDoor(undefined)).not.toThrow();
    });

    it('should handle elements with missing properties', () => {
      const incompleteElement = { id: 'test', type: 'wall' };
      
      expect(() => convertToDoor(incompleteElement)).not.toThrow();
      const result = convertToDoor(incompleteElement);
      expect(result.type).toBe('door');
    });

    it('should preserve custom metadata during conversion', () => {
      const elementWithMetadata = {
        ...mockWall,
        metadata: { custom: 'data', timestamp: new Date() }
      };
      
      const result = convertToDoor(elementWithMetadata);
      expect(result.metadata).toEqual(elementWithMetadata.metadata);
    });

    it('should handle circular conversion chains', () => {
      let element = mockWall;
      
      // Convert through multiple types and back
      element = convertElementType(element, 'door');
      element = convertElementType(element, 'window');
      element = convertElementType(element, 'wall');
      
      expect(element.type).toBe('wall');
    });
  });
});