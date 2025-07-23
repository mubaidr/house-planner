import { AlignableElement, getElementBounds, alignLeft, alignRight, alignTop, alignBottom, alignCenterHorizontal, alignCenterVertical, distributeHorizontally, distributeVertically, generateAlignmentGuides } from '@/utils/alignmentUtils';

describe('alignmentUtils', () => {
  const mockRectElement1: AlignableElement = { id: 'rect1', x: 0, y: 0, width: 100, height: 50 };
  const mockRectElement2: AlignableElement = { id: 'rect2', x: 50, y: 20, width: 80, height: 60 };
  const mockRectElement3: AlignableElement = { id: 'rect3', x: 20, y: 10, width: 120, height: 40 };

  const mockWallElement1: AlignableElement = { id: 'wall1', startX: 0, startY: 0, endX: 100, endY: 0 };
  const mockWallElement2: AlignableElement = { id: 'wall2', startX: 50, startY: 20, endX: 50, endY: 100 };
  const mockWallElement3: AlignableElement = { id: 'wall3', startX: 20, startY: 50, endX: 120, endY: 50 };

  describe('getElementBounds', () => {
    it('should return correct bounds for rectangular element', () => {
      const bounds = getElementBounds(mockRectElement1);
      expect(bounds).toEqual({
        x: 0, y: 0, width: 100, height: 50,
        centerX: 50, centerY: 25, left: 0, right: 100, top: 0, bottom: 50,
      });
    });

    it('should return correct bounds for wall element', () => {
      const bounds = getElementBounds(mockWallElement1);
      expect(bounds).toEqual({
        x: 0, y: 0, width: 100, height: 1,
        centerX: 50, centerY: 0.5, left: 0, right: 100, top: 0, bottom: 1,
      });
    });

    it('should handle vertical wall element', () => {
      const wall: AlignableElement = { id: 'wallV', startX: 10, startY: 0, endX: 10, endY: 50 };
      const bounds = getElementBounds(wall);
      expect(bounds).toEqual({
        x: 10, y: 0, width: 1, height: 50,
        centerX: 10.5, centerY: 25, left: 10, right: 11, top: 0, bottom: 50,
      });
    });
  });

  describe('alignment functions', () => {
    it('should align elements to the left', () => {
      const elements = [mockRectElement1, mockRectElement2, mockRectElement3];
      const aligned = alignLeft(elements);
      expect(aligned[0].x).toBe(0);
      expect(aligned[1].x).toBe(0);
      expect(aligned[2].x).toBe(0);
    });

    it('should align elements to the right', () => {
      const elements = [mockRectElement1, mockRectElement2, mockRectElement3];
      const aligned = alignRight(elements);
      expect(aligned[0].x).toBe(40);
      expect(aligned[1].x).toBe(60);
      expect(aligned[2].x).toBe(20);
    });

    it('should align elements to the top', () => {
      const elements = [mockRectElement1, mockRectElement2, mockRectElement3];
      const aligned = alignTop(elements);
      expect(aligned[0].y).toBe(0);
      expect(aligned[1].y).toBe(0);
      expect(aligned[2].y).toBe(0);
    });

    it('should align elements to the bottom', () => {
      const elements = [mockRectElement1, mockRectElement2, mockRectElement3];
      const aligned = alignBottom(elements);
      expect(aligned[0].y).toBe(30);
      expect(aligned[1].y).toBe(20);
      expect(aligned[2].y).toBe(40);
    });

    it('should align elements horizontally to center', () => {
      const elements = [mockRectElement1, mockRectElement2, mockRectElement3];
      const aligned = alignCenterHorizontal(elements);
      // Calculate expected center X based on initial positions
      const initialCenterXs = [50, 90, 80];
      const avgCenterX = initialCenterXs.reduce((sum, x) => sum + x, 0) / initialCenterXs.length;
      
      expect(getElementBounds(aligned[0]).centerX).toBeCloseTo(avgCenterX);
      expect(getElementBounds(aligned[1]).centerX).toBeCloseTo(avgCenterX);
      expect(getElementBounds(aligned[2]).centerX).toBeCloseTo(avgCenterX);
    });

    it('should align elements vertically to center', () => {
      const elements = [mockRectElement1, mockRectElement2, mockRectElement3];
      const aligned = alignCenterVertical(elements);
      // Calculate expected center Y based on initial positions
      const initialCenterYs = [25, 50, 30];
      const avgCenterY = initialCenterYs.reduce((sum, y) => sum + y, 0) / initialCenterYs.length;

      expect(getElementBounds(aligned[0]).centerY).toBeCloseTo(avgCenterY);
      expect(getElementBounds(aligned[1]).centerY).toBeCloseTo(avgCenterY);
      expect(getElementBounds(aligned[2]).centerY).toBeCloseTo(avgCenterY);
    });
  });

  describe('distribution functions', () => {
    it('should distribute elements horizontally', () => {
      const elements = [
        { id: 'e1', x: 0, y: 0, width: 10, height: 10 },
        { id: 'e2', x: 50, y: 0, width: 10, height: 10 },
        { id: 'e3', x: 100, y: 0, width: 10, height: 10 },
      ];
      const distributed = distributeHorizontally(elements);
      expect(getElementBounds(distributed[0]).centerX).toBeCloseTo(5);
      expect(getElementBounds(distributed[1]).centerX).toBeCloseTo(55);
      expect(getElementBounds(distributed[2]).centerX).toBeCloseTo(105);
    });

    it('should distribute elements vertically', () => {
      const elements = [
        { id: 'e1', x: 0, y: 0, width: 10, height: 10 },
        { id: 'e2', x: 0, y: 50, width: 10, height: 10 },
        { id: 'e3', x: 0, y: 100, width: 10, height: 10 },
      ];
      const distributed = distributeVertically(elements);
      expect(getElementBounds(distributed[0]).centerY).toBeCloseTo(5);
      expect(getElementBounds(distributed[1]).centerY).toBeCloseTo(55);
      expect(getElementBounds(distributed[2]).centerY).toBeCloseTo(105);
    });
  });

  describe('generateAlignmentGuides', () => {
    it('should generate horizontal and vertical guides', () => {
      const elements = [
        { id: 'e1', x: 0, y: 0, width: 10, height: 10 },
        { id: 'e2', x: 5, y: 0, width: 10, height: 10 }, // Aligned top
        { id: 'e3', x: 0, y: 5, width: 10, height: 10 }, // Aligned left
      ];
      const guides = generateAlignmentGuides(elements);
      expect(guides.length).toBeGreaterThan(0);
      const horizontalGuide = guides.find(g => g.type === 'horizontal' && g.position === 0);
      expect(horizontalGuide).toBeDefined();
      expect(horizontalGuide?.elements).toEqual(expect.arrayContaining(['e1', 'e2']));

      const verticalGuide = guides.find(g => g.type === 'vertical' && g.position === 0);
      expect(verticalGuide).toBeDefined();
      expect(verticalGuide?.elements).toEqual(expect.arrayContaining(['e1', 'e3']));
    });

    it('should respect tolerance', () => {
      const elements = [
        { id: 'e1', x: 0, y: 0, width: 10, height: 10 },
        { id: 'e2', x: 5, y: 0, width: 10, height: 10 }, // Aligned top
      ];
      const guides = generateAlignmentGuides(elements, 2);
      const horizontalGuide = guides.find(g => g.type === 'horizontal' && g.position === 0);
      expect(horizontalGuide).toBeDefined();
      expect(horizontalGuide?.elements).toEqual(expect.arrayContaining(['e1', 'e2']));
    });
  });
});