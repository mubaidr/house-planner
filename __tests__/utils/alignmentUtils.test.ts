import {
  AlignableElement,
  getElementBounds,
} from '@/utils/alignmentUtils';

// Mock elements for testing
const createMockElement = (id: string, x: number, y: number, width: number, height: number): AlignableElement => ({
  id,
  x,
  y,
  width,
  height,
});

describe('alignmentUtils', () => {
  describe('getElementBounds', () => {
    it('should calculate correct bounds for single element', () => {
      const element = createMockElement('1', 10, 20, 50, 30);
      const bounds = getElementBounds(element);
      
      expect(bounds).toEqual({
        x: 10,
        y: 20,
        left: 10,
        right: 60,
        top: 20,
        bottom: 50,
        centerX: 35,
        centerY: 35,
        width: 50,
        height: 30,
      });
    });

    it('should handle zero-sized elements', () => {
      const element = createMockElement('1', 10, 20, 0, 0);
      const bounds = getElementBounds(element);
      
      expect(bounds).toEqual({
        x: 10,
        y: 20,
        left: 10,
        right: 60,
        top: 20,
        bottom: 70,
        centerX: 35,
        centerY: 45,
        width: 50,
        height: 50,
      });
    });

    it('should handle negative coordinates', () => {
      const element = createMockElement('1', -10, -20, 30, 40);
      const bounds = getElementBounds(element);
      
      expect(bounds).toEqual({
        x: -10,
        y: -20,
        left: -10,
        right: 20,
        top: -20,
        bottom: 20,
        centerX: 5,
        centerY: 0,
        width: 30,
        height: 40,
      });
    });
  });

  describe('integration with actual alignment functions', () => {
    it('should work with wall elements', () => {
      const wallElement = {
        id: 'wall-1',
        x: 0, // This will be ignored for walls
        y: 0, // This will be ignored for walls
        startX: 10,
        startY: 20,
        endX: 100,
        endY: 20,
      };
      
      const bounds = getElementBounds(wallElement);
      
      expect(bounds.left).toBe(10);
      expect(bounds.right).toBe(100);
      expect(bounds.top).toBe(20);
      expect(bounds.bottom).toBe(21); // Minimum height of 1
      expect(bounds.width).toBe(90);
      expect(bounds.height).toBe(1);
      expect(bounds.centerX).toBe(55);
      expect(bounds.centerY).toBe(20.5);
    });

    it('should work with rectangular elements', () => {
      const rectElement = createMockElement('rect-1', 50, 75, 100, 50);
      const bounds = getElementBounds(rectElement);
      
      expect(bounds.left).toBe(50);
      expect(bounds.right).toBe(150);
      expect(bounds.top).toBe(75);
      expect(bounds.bottom).toBe(125);
      expect(bounds.width).toBe(100);
      expect(bounds.height).toBe(50);
      expect(bounds.centerX).toBe(100);
      expect(bounds.centerY).toBe(100);
    });
  });

  describe('edge cases', () => {
    it('should handle elements with undefined dimensions', () => {
      const element = {
        id: 'test',
        x: 10,
        y: 20,
        // width and height undefined
      };
      
      const bounds = getElementBounds(element);
      
      // Should use default dimensions
      expect(bounds.width).toBe(50);
      expect(bounds.height).toBe(50);
    });

    it('should handle wall elements with same start and end points', () => {
      const pointWall = {
        id: 'point-wall',
        x: 0,
        y: 0,
        startX: 50,
        startY: 50,
        endX: 50,
        endY: 50,
      };
      
      const bounds = getElementBounds(pointWall);
      
      expect(bounds.width).toBe(1); // Minimum width
      expect(bounds.height).toBe(1); // Minimum height
      expect(bounds.left).toBe(50);
      expect(bounds.top).toBe(50);
    });

    it('should handle negative dimensions gracefully', () => {
      const element = createMockElement('neg', 10, 10, -20, -30);
      const bounds = getElementBounds(element);
      
      expect(bounds.width).toBe(-20);
      expect(bounds.height).toBe(-30);
      expect(bounds.right).toBe(-10); // 10 + (-20)
      expect(bounds.bottom).toBe(-20); // 10 + (-30)
    });
  });
});