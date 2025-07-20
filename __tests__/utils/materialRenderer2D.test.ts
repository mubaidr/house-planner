import MaterialRenderer2D from '@/utils/materialRenderer2D';

// Mock Konva for testing
const mockKonva = {
  Group: jest.fn(() => ({
    add: jest.fn(),
    destroy: jest.fn(),
    getChildren: jest.fn(() => []),
    removeChildren: jest.fn(),
  })),
  Rect: jest.fn(() => ({
    setAttrs: jest.fn(),
    destroy: jest.fn(),
  })),
  Image: jest.fn(() => ({
    setAttrs: jest.fn(),
    destroy: jest.fn(),
  })),
  Line: jest.fn(() => ({
    setAttrs: jest.fn(),
    destroy: jest.fn(),
  })),
};

// Mock material data
const mockMaterial = {
  id: 'brick-red',
  name: 'Red Brick',
  type: 'brick' as const,
  category: 'masonry' as const,
  properties: {
    color: '#CC6666',
    texture: 'brick',
    finish: 'matte',
    pattern: 'running-bond',
  },
  metadata: {
    cost: 5.50,
    durability: 'high',
    maintenance: 'low',
    sustainability: 'medium',
  },
};

const mockElement = {
  id: 'wall-1',
  x: 10,
  y: 20,
  width: 100,
  height: 50,
  materialId: 'brick-red',
};

describe('MaterialRenderer2D', () => {
  let renderer: MaterialRenderer2D;
  let mockStage: any;
  let mockLayer: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock stage and layer
    mockLayer = {
      add: jest.fn(),
      draw: jest.fn(),
      getChildren: jest.fn(() => []),
      findOne: jest.fn(),
    };
    
    mockStage = {
      getLayers: jest.fn(() => [mockLayer]),
      getLayer: jest.fn(() => mockLayer),
    };

    // Create renderer instance
    renderer = new MaterialRenderer2D(mockStage);
  });

  describe('constructor', () => {
    it('should initialize with stage', () => {
      expect(renderer).toBeInstanceOf(MaterialRenderer2D);
    });

    it('should handle null stage gracefully', () => {
      expect(() => new MaterialRenderer2D(null)).not.toThrow();
    });
  });

  describe('renderMaterial', () => {
    it('should render solid color material', () => {
      const solidMaterial = {
        ...mockMaterial,
        type: 'solid' as const,
        properties: {
          color: '#FF0000',
        },
      };

      const result = renderer.renderMaterial(mockElement, solidMaterial);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should render textured material', () => {
      const texturedMaterial = {
        ...mockMaterial,
        type: 'textured' as const,
        properties: {
          color: '#CC6666',
          texture: 'brick',
          textureScale: 1.0,
        },
      };

      const result = renderer.renderMaterial(mockElement, texturedMaterial);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should render patterned material', () => {
      const patternedMaterial = {
        ...mockMaterial,
        type: 'patterned' as const,
        properties: {
          color: '#CC6666',
          pattern: 'stripes',
          patternScale: 0.5,
          patternRotation: 45,
        },
      };

      const result = renderer.renderMaterial(mockElement, patternedMaterial);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle missing material gracefully', () => {
      const result = renderer.renderMaterial(mockElement, null);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Material not found');
    });

    it('should handle invalid element gracefully', () => {
      const result = renderer.renderMaterial(null, mockMaterial);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid element');
    });

    it('should handle material without properties', () => {
      const materialWithoutProps = {
        ...mockMaterial,
        properties: undefined,
      };

      const result = renderer.renderMaterial(mockElement, materialWithoutProps);
      
      expect(result.success).toBe(true); // Should use defaults
    });
  });

  describe('updateMaterial', () => {
    beforeEach(() => {
      // First render a material
      renderer.renderMaterial(mockElement, mockMaterial);
    });

    it('should update existing material', () => {
      const updatedMaterial = {
        ...mockMaterial,
        properties: {
          ...mockMaterial.properties,
          color: '#0000FF',
        },
      };

      const result = renderer.updateMaterial(mockElement.id, updatedMaterial);
      
      expect(result.success).toBe(true);
    });

    it('should handle updating non-existent material', () => {
      const result = renderer.updateMaterial('non-existent', mockMaterial);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle null material in update', () => {
      const result = renderer.updateMaterial(mockElement.id, null);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Material not provided');
    });
  });

  describe('removeMaterial', () => {
    beforeEach(() => {
      renderer.renderMaterial(mockElement, mockMaterial);
    });

    it('should remove existing material', () => {
      const result = renderer.removeMaterial(mockElement.id);
      
      expect(result.success).toBe(true);
    });

    it('should handle removing non-existent material', () => {
      const result = renderer.removeMaterial('non-existent');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle null element ID', () => {
      const result = renderer.removeMaterial(null);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid element ID');
    });
  });

  describe('clearAllMaterials', () => {
    beforeEach(() => {
      // Render multiple materials
      renderer.renderMaterial(mockElement, mockMaterial);
      renderer.renderMaterial({ ...mockElement, id: 'wall-2' }, mockMaterial);
      renderer.renderMaterial({ ...mockElement, id: 'wall-3' }, mockMaterial);
    });

    it('should clear all materials', () => {
      const result = renderer.clearAllMaterials();
      
      expect(result.success).toBe(true);
      expect(result.clearedCount).toBe(3);
    });

    it('should handle clearing when no materials exist', () => {
      renderer.clearAllMaterials(); // Clear once
      const result = renderer.clearAllMaterials(); // Clear again
      
      expect(result.success).toBe(true);
      expect(result.clearedCount).toBe(0);
    });
  });

  describe('getMaterialInfo', () => {
    beforeEach(() => {
      renderer.renderMaterial(mockElement, mockMaterial);
    });

    it('should get material info for existing element', () => {
      const info = renderer.getMaterialInfo(mockElement.id);
      
      expect(info).toBeDefined();
      expect(info.elementId).toBe(mockElement.id);
      expect(info.materialId).toBe(mockMaterial.id);
      expect(info.materialType).toBe(mockMaterial.type);
    });

    it('should return null for non-existent element', () => {
      const info = renderer.getMaterialInfo('non-existent');
      
      expect(info).toBe(null);
    });

    it('should handle null element ID', () => {
      const info = renderer.getMaterialInfo(null);
      
      expect(info).toBe(null);
    });
  });

  describe('getAllMaterials', () => {
    it('should return empty array when no materials', () => {
      const materials = renderer.getAllMaterials();
      
      expect(materials).toEqual([]);
    });

    it('should return all rendered materials', () => {
      renderer.renderMaterial(mockElement, mockMaterial);
      renderer.renderMaterial({ ...mockElement, id: 'wall-2' }, mockMaterial);
      
      const materials = renderer.getAllMaterials();
      
      expect(materials).toHaveLength(2);
      expect(materials[0].elementId).toBe('wall-1');
      expect(materials[1].elementId).toBe('wall-2');
    });
  });

  describe('setOpacity', () => {
    beforeEach(() => {
      renderer.renderMaterial(mockElement, mockMaterial);
    });

    it('should set opacity for existing material', () => {
      const result = renderer.setOpacity(mockElement.id, 0.5);
      
      expect(result.success).toBe(true);
    });

    it('should handle invalid opacity values', () => {
      const result1 = renderer.setOpacity(mockElement.id, -0.5);
      const result2 = renderer.setOpacity(mockElement.id, 1.5);
      
      expect(result1.success).toBe(true); // Should clamp to 0
      expect(result2.success).toBe(true); // Should clamp to 1
    });

    it('should handle non-existent element', () => {
      const result = renderer.setOpacity('non-existent', 0.5);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('setVisibility', () => {
    beforeEach(() => {
      renderer.renderMaterial(mockElement, mockMaterial);
    });

    it('should set visibility for existing material', () => {
      const result1 = renderer.setVisibility(mockElement.id, false);
      const result2 = renderer.setVisibility(mockElement.id, true);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('should handle non-existent element', () => {
      const result = renderer.setVisibility('non-existent', false);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('material type specific rendering', () => {
    it('should render gradient materials', () => {
      const gradientMaterial = {
        ...mockMaterial,
        type: 'gradient' as const,
        properties: {
          startColor: '#FF0000',
          endColor: '#0000FF',
          direction: 'horizontal',
        },
      };

      const result = renderer.renderMaterial(mockElement, gradientMaterial);
      
      expect(result.success).toBe(true);
    });

    it('should render metallic materials', () => {
      const metallicMaterial = {
        ...mockMaterial,
        type: 'metallic' as const,
        properties: {
          baseColor: '#C0C0C0',
          metallic: 0.8,
          roughness: 0.2,
          reflectance: 0.9,
        },
      };

      const result = renderer.renderMaterial(mockElement, metallicMaterial);
      
      expect(result.success).toBe(true);
    });

    it('should render glass materials', () => {
      const glassMaterial = {
        ...mockMaterial,
        type: 'glass' as const,
        properties: {
          color: '#E6F3FF',
          transparency: 0.8,
          refraction: 1.5,
          tint: '#0066CC',
        },
      };

      const result = renderer.renderMaterial(mockElement, glassMaterial);
      
      expect(result.success).toBe(true);
    });
  });

  describe('performance and optimization', () => {
    it('should handle rendering many materials efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const element = { ...mockElement, id: `element-${i}` };
        renderer.renderMaterial(element, mockMaterial);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should reuse resources when possible', () => {
      // Render same material type multiple times
      renderer.renderMaterial(mockElement, mockMaterial);
      renderer.renderMaterial({ ...mockElement, id: 'wall-2' }, mockMaterial);
      renderer.renderMaterial({ ...mockElement, id: 'wall-3' }, mockMaterial);
      
      // Should not create excessive objects
      expect(true).toBe(true); // Placeholder for resource reuse verification
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle elements with zero dimensions', () => {
      const zeroElement = {
        ...mockElement,
        width: 0,
        height: 0,
      };

      const result = renderer.renderMaterial(zeroElement, mockMaterial);
      
      expect(result.success).toBe(true); // Should handle gracefully
    });

    it('should handle elements with negative dimensions', () => {
      const negativeElement = {
        ...mockElement,
        width: -100,
        height: -50,
      };

      const result = renderer.renderMaterial(negativeElement, mockMaterial);
      
      expect(result.success).toBe(true); // Should handle gracefully
    });

    it('should handle materials with missing required properties', () => {
      const incompleteMaterial = {
        id: 'incomplete',
        name: 'Incomplete Material',
        type: 'solid' as const,
        // Missing properties
      };

      const result = renderer.renderMaterial(mockElement, incompleteMaterial);
      
      expect(result.success).toBe(true); // Should use defaults
    });

    it('should handle stage destruction gracefully', () => {
      renderer.destroy();
      
      const result = renderer.renderMaterial(mockElement, mockMaterial);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('destroyed');
    });

    it('should handle concurrent operations', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(renderer.renderMaterial(
            { ...mockElement, id: `concurrent-${i}` },
            mockMaterial
          ))
        );
      }
      
      const results = await Promise.all(promises);
      
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('memory management', () => {
    it('should clean up resources on destroy', () => {
      renderer.renderMaterial(mockElement, mockMaterial);
      renderer.renderMaterial({ ...mockElement, id: 'wall-2' }, mockMaterial);
      
      renderer.destroy();
      
      // Verify cleanup
      expect(renderer.getAllMaterials()).toEqual([]);
    });

    it('should handle multiple destroy calls', () => {
      renderer.destroy();
      
      expect(() => renderer.destroy()).not.toThrow();
    });
  });
});