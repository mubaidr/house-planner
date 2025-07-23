import { MaterialRenderer2D, MaterialPatternUtils } from '@/utils/materialRenderer2D';

// Mock material data
const mockMaterial = {
  id: 'brick-red',
  name: 'Red Brick',
  category: 'masonry',
  color: '#CC6666',
  properties: {
    opacity: 1.0,
    roughness: 0.5,
    metallic: 0.0,
    reflectivity: 0.1,
    patternScale: 1.0,
    patternRotation: 0,
    seamless: true,
  },
  cost: {
    pricePerUnit: 5.50,
    unit: 'sqft',
    currency: 'USD',
    lastUpdated: new Date(),
  },
  metadata: {
    description: 'Red brick material',
    tags: ['brick', 'masonry'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

describe('MaterialRenderer2D', () => {
  let renderer: MaterialRenderer2D;

  beforeEach(() => {
    renderer = new MaterialRenderer2D('plan');
  });

  describe('constructor', () => {
    it('should initialize with plan view', () => {
      const planRenderer = new MaterialRenderer2D('plan');
      expect(planRenderer).toBeDefined();
    });

    it('should initialize with elevation view', () => {
      const elevationRenderer = new MaterialRenderer2D('elevation');
      expect(elevationRenderer).toBeDefined();
    });
  });

  describe('getMaterialPattern', () => {
    it('should get pattern for solid material', () => {
      const result = renderer.getMaterialPattern(mockMaterial);
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
      expect(result.color).toBe(mockMaterial.color);
    });

    it('should get pattern for textured material', () => {
      const texturedMaterial = {
        ...mockMaterial,
        texture: 'https://example.com/texture.jpg',
        properties: {
          ...mockMaterial.properties,
          patternScale: 2.0,
        },
      };

      const result = renderer.getMaterialPattern(texturedMaterial);
      
      expect(result).toBeDefined();
      expect(result.scale).toBe(2.0);
    });

    it('should get pattern for rough material', () => {
      const patternedMaterial = {
        ...mockMaterial,
        name: 'Rough Surface', // Change name to avoid "brick" keyword
        properties: {
          ...mockMaterial.properties,
          roughness: 0.9, // This should trigger stipple pattern
        },
      };

      const result = renderer.getMaterialPattern(patternedMaterial);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('stipple');
    });

    it('should handle material without properties', () => {
      const materialWithoutProps = {
        ...mockMaterial,
        properties: {},
      };

      const result = renderer.getMaterialPattern(materialWithoutProps);
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });

  describe('getKonvaFillPattern', () => {
    it('should get Konva fill pattern for solid material', () => {
      const result = renderer.getKonvaFillPattern(mockMaterial);
      
      expect(result).toBeDefined();
      expect(result.fill || result.fillPatternImage).toBeDefined();
      expect(result.opacity).toBeDefined();
    });

    it('should get Konva fill pattern with scale', () => {
      const result = renderer.getKonvaFillPattern(mockMaterial, 2.0);
      
      expect(result).toBeDefined();
    });

    it('should handle glass material', () => {
      const glassMaterial = {
        ...mockMaterial,
        properties: {
          ...mockMaterial.properties,
          opacity: 0.3,
        },
      };

      const result = renderer.getKonvaFillPattern(glassMaterial);
      
      expect(result).toBeDefined();
      expect(result.opacity).toBeLessThan(1);
    });
  });

  describe('clearCache', () => {
    it('should clear pattern cache', () => {
      // Generate some patterns to populate cache
      renderer.getMaterialPattern(mockMaterial);
      
      // Clear cache should not throw
      expect(() => renderer.clearCache()).not.toThrow();
    });
  });

  describe('updateViewConfig', () => {
    it('should update view configuration', () => {
      const newConfig = {
        materialSettings: {
          patternScale: 2.0,
          lineWidth: 2,
          opacity: 0.5,
          showTextures: false,
          showPatterns: true,
          detailLevel: 'high' as const,
        },
      };

      expect(() => renderer.updateViewConfig(newConfig)).not.toThrow();
    });
  });
});

describe('MaterialPatternUtils', () => {
  describe('getPatternForView', () => {
    it('should get pattern for plan view', () => {
      const result = MaterialPatternUtils.getPatternForView(mockMaterial, 'plan');
      
      expect(result).toBeDefined();
    });

    it('should get pattern for elevation view', () => {
      const result = MaterialPatternUtils.getPatternForView(mockMaterial, 'elevation');
      
      expect(result).toBeDefined();
    });
  });

  describe('shouldShowPattern', () => {
    it('should return false for low detail level', () => {
      const result = MaterialPatternUtils.shouldShowPattern(mockMaterial, 'plan', 'low');
      
      expect(result).toBe(false);
    });

    it('should return true for high detail level', () => {
      const result = MaterialPatternUtils.shouldShowPattern(mockMaterial, 'plan', 'high');
      
      expect(result).toBe(true);
    });
  });

  describe('getSimplifiedPattern', () => {
    it('should get simplified pattern', () => {
      const result = MaterialPatternUtils.getSimplifiedPattern(mockMaterial);
      
      expect(result).toBeDefined();
      expect(result.fill).toBe(mockMaterial.color);
      expect(result.opacity).toBeDefined();
    });
  });

  describe('generatePatternPreview', () => {
    it('should generate pattern preview canvas', () => {
      // Mock Canvas API for test environment
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn().mockReturnValue({
          fillStyle: '',
          fillRect: jest.fn(),
          createPattern: jest.fn().mockReturnValue({}),
        }),
      };
      
      // Mock document.createElement to return our mock canvas
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation(() => {
        const canvas = { ...mockCanvas };
        // Allow width and height to be set
        Object.defineProperty(canvas, 'width', { writable: true, value: 0 });
        Object.defineProperty(canvas, 'height', { writable: true, value: 0 });
        return canvas;
      });
      
      const result = MaterialPatternUtils.generatePatternPreview(mockMaterial, 64);
      
      expect(result).toBeDefined();
      expect(result.width).toBe(64);
      expect(result.height).toBe(64);
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });
  });
});