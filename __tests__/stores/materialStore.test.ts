import { act } from 'react';
import { useMaterialStore } from '../../src/stores/materialStore';
import { Material, MaterialApplication } from '../../src/types/materials/Material';

describe('materialStore - Comprehensive Tests', () => {
  const mockMaterial: Material = {
    id: 'test-material-1',
    name: 'Test Brick',
    category: 'masonry',
    properties: {
      color: '#CC6633',
      texture: 'rough',
      pattern: 'running-bond',
      finish: 'natural',
    },
    metadata: {
      description: 'Test brick material',
      tags: ['brick', 'exterior'],
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockApplication: MaterialApplication = {
    id: 'app-1',
    materialId: 'test-material-1',
    elementId: 'wall-1',
    elementType: 'wall',
    appliedAt: new Date(),
  };

  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useMaterialStore.setState({
        materials: [],
        applications: [],
        selectedMaterialId: null,
        selectedCategory: 'all',
        searchQuery: '',
        isLibraryOpen: false,
      });
    });
  });

  describe('Material Management', () => {
    it('should add a material successfully', () => {
      act(() => {
        useMaterialStore.getState().addMaterial(mockMaterial);
      });

      const state = useMaterialStore.getState();
      expect(state.materials).toHaveLength(1);
      expect(state.materials[0]).toEqual(mockMaterial);
    });

    it('should update material properties', () => {
      act(() => {
        useMaterialStore.getState().addMaterial(mockMaterial);
        useMaterialStore.getState().updateMaterial('test-material-1', {
          name: 'Updated Brick',
          properties: { ...mockMaterial.properties, color: '#DD7744' },
        });
      });

      const state = useMaterialStore.getState();
      expect(state.materials[0].name).toBe('Updated Brick');
      expect(state.materials[0].properties.color).toBe('#DD7744');
      expect(state.materials[0].metadata.updatedAt).toBeInstanceOf(Date);
    });

    it('should remove a material and its applications', () => {
      act(() => {
        useMaterialStore.getState().addMaterial(mockMaterial);
        useMaterialStore.getState().applyMaterial(mockApplication);
        useMaterialStore.getState().removeMaterial('test-material-1');
      });

      const state = useMaterialStore.getState();
      expect(state.materials.some(m => m.id === 'test-material-1')).toBe(false);
      expect(state.applications).toHaveLength(0);
      expect(state.selectedMaterialId).toBeNull();
    });

    it('should duplicate a material with new ID and name', () => {
      act(() => {
        useMaterialStore.getState().addMaterial(mockMaterial);
        useMaterialStore.getState().duplicateMaterial('test-material-1');
      });

      const state = useMaterialStore.getState();
      expect(state.materials).toHaveLength(2);
      
      const duplicate = state.materials[1];
      expect(duplicate.id).not.toBe(mockMaterial.id);
      expect(duplicate.name).toBe('Test Brick (Copy)');
      expect(duplicate.metadata.isCustom).toBe(true);
      expect(duplicate.properties).toEqual(mockMaterial.properties);
    });

    it('should handle duplicating non-existent material', () => {
      act(() => {
        useMaterialStore.getState().duplicateMaterial('non-existent');
      });

      const state = useMaterialStore.getState();
      expect(state.materials).toHaveLength(0);
    });
  });

  describe('Material Applications', () => {
    beforeEach(() => {
      act(() => {
        useMaterialStore.getState().addMaterial(mockMaterial);
      });
    });

    it('should apply material to element', () => {
      act(() => {
        useMaterialStore.getState().applyMaterial(mockApplication);
      });

      const state = useMaterialStore.getState();
      expect(state.applications).toHaveLength(1);
      expect(state.applications[0]).toEqual(mockApplication);
    });

    it('should replace existing application for same element', () => {
      const secondApplication: MaterialApplication = {
        ...mockApplication,
        id: 'app-2',
        materialId: 'different-material',
      };

      act(() => {
        useMaterialStore.getState().applyMaterial(mockApplication);
        useMaterialStore.getState().applyMaterial(secondApplication);
      });

      const state = useMaterialStore.getState();
      expect(state.applications).toHaveLength(1);
      expect(state.applications[0].materialId).toBe('different-material');
    });

    it('should remove material application', () => {
      act(() => {
        useMaterialStore.getState().applyMaterial(mockApplication);
        useMaterialStore.getState().removeMaterialApplication('wall-1', 'wall');
      });

      const state = useMaterialStore.getState();
      expect(state.applications).toHaveLength(0);
    });

    it('should get material application for element', () => {
      act(() => {
        useMaterialStore.getState().applyMaterial(mockApplication);
      });

      const application = useMaterialStore.getState().getMaterialApplication('wall-1', 'wall');
      expect(application).toEqual(mockApplication);
    });

    it('should return null for non-existent application', () => {
      const application = useMaterialStore.getState().getMaterialApplication('wall-999', 'wall');
      expect(application).toBeNull();
    });

    it('should get applications for specific element', () => {
      const app2: MaterialApplication = {
        ...mockApplication,
        id: 'app-2',
        elementType: 'door',
      };

      act(() => {
        useMaterialStore.getState().applyMaterial(mockApplication);
        useMaterialStore.getState().applyMaterial(app2);
      });

      const applications = useMaterialStore.getState().getApplicationsForElement('wall-1');
      expect(applications).toHaveLength(2);
    });
  });

  describe('UI State Management', () => {
    it('should set selected material', () => {
      act(() => {
        useMaterialStore.getState().setSelectedMaterial('test-material-1');
      });

      const state = useMaterialStore.getState();
      expect(state.selectedMaterialId).toBe('test-material-1');
    });

    it('should clear selected material', () => {
      act(() => {
        useMaterialStore.getState().setSelectedMaterial('test-material-1');
        useMaterialStore.getState().setSelectedMaterial(null);
      });

      const state = useMaterialStore.getState();
      expect(state.selectedMaterialId).toBeNull();
    });

    it('should set selected category', () => {
      act(() => {
        useMaterialStore.getState().setSelectedCategory('masonry');
      });

      const state = useMaterialStore.getState();
      expect(state.selectedCategory).toBe('masonry');
    });

    it('should set search query', () => {
      act(() => {
        useMaterialStore.getState().setSearchQuery('brick');
      });

      const state = useMaterialStore.getState();
      expect(state.searchQuery).toBe('brick');
    });

    it('should toggle library open state', () => {
      const initialState = useMaterialStore.getState().isLibraryOpen;
      
      act(() => {
        useMaterialStore.getState().toggleLibrary();
      });

      const state = useMaterialStore.getState();
      expect(state.isLibraryOpen).toBe(!initialState);
    });

    it('should set library open state directly', () => {
      act(() => {
        useMaterialStore.getState().setLibraryOpen(true);
      });

      const state = useMaterialStore.getState();
      expect(state.isLibraryOpen).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    const materials: Material[] = [
      { ...mockMaterial, id: 'brick-1', name: 'Red Brick', category: 'masonry' },
      { ...mockMaterial, id: 'wood-1', name: 'Oak Wood', category: 'wood', metadata: { ...mockMaterial.metadata, tags: ['wood', 'interior'] } },
      { ...mockMaterial, id: 'concrete-1', name: 'Concrete Block', category: 'masonry', metadata: { ...mockMaterial.metadata, manufacturer: 'ACME Corp' } },
    ];

    beforeEach(() => {
      act(() => {
        materials.forEach(material => {
          useMaterialStore.getState().addMaterial(material);
        });
      });
    });

    it('should filter materials by category', () => {
      act(() => {
        useMaterialStore.getState().setSelectedCategory('masonry');
      });

      const filtered = useMaterialStore.getState().getFilteredMaterials();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(m => m.category === 'masonry')).toBe(true);
    });

    it('should filter materials by search query - name', () => {
      act(() => {
        useMaterialStore.getState().setSearchQuery('brick');
      });

      const filtered = useMaterialStore.getState().getFilteredMaterials();
      expect(filtered.length).toBeGreaterThanOrEqual(2); // Should find materials containing 'brick'
      expect(filtered.some(m => m.name.toLowerCase().includes('brick'))).toBe(true);
    });

    it('should filter materials by search query - tags', () => {
      act(() => {
        useMaterialStore.getState().setSearchQuery('interior');
      });

      const filtered = useMaterialStore.getState().getFilteredMaterials();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Oak Wood');
    });

    it('should filter materials by search query - manufacturer', () => {
      act(() => {
        useMaterialStore.getState().setSearchQuery('ACME');
      });

      const filtered = useMaterialStore.getState().getFilteredMaterials();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Concrete Block');
    });

    it('should combine category and search filters', () => {
      act(() => {
        useMaterialStore.getState().setSelectedCategory('masonry');
        useMaterialStore.getState().setSearchQuery('red');
      });

      const filtered = useMaterialStore.getState().getFilteredMaterials();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Red Brick');
    });

    it('should return all materials when no filters applied', () => {
      const filtered = useMaterialStore.getState().getFilteredMaterials();
      expect(filtered).toHaveLength(3);
    });

    it('should get material by ID', () => {
      const material = useMaterialStore.getState().getMaterialById('wood-1');
      expect(material?.name).toBe('Oak Wood');
    });

    it('should return null for non-existent material ID', () => {
      const material = useMaterialStore.getState().getMaterialById('non-existent');
      expect(material).toBeNull();
    });
  });

  describe('Import/Export', () => {
    const customMaterials: Material[] = [
      { ...mockMaterial, id: 'custom-1', metadata: { ...mockMaterial.metadata, isCustom: true } },
      { ...mockMaterial, id: 'default-1', metadata: { ...mockMaterial.metadata, isCustom: false } },
    ];

    it('should import materials', () => {
      act(() => {
        useMaterialStore.getState().importMaterials(customMaterials);
      });

      const state = useMaterialStore.getState();
      expect(state.materials).toHaveLength(2);
    });

    it('should export only custom materials', () => {
      act(() => {
        customMaterials.forEach(material => {
          useMaterialStore.getState().addMaterial(material);
        });
      });

      const exported = useMaterialStore.getState().exportMaterials();
      expect(exported).toHaveLength(1);
      expect(exported[0].id).toBe('custom-1');
    });

    it('should reset to defaults', () => {
      act(() => {
        useMaterialStore.getState().addMaterial(mockMaterial);
        useMaterialStore.getState().applyMaterial(mockApplication);
        useMaterialStore.getState().setSelectedMaterial('test-material-1');
        useMaterialStore.getState().resetToDefaults();
      });

      const state = useMaterialStore.getState();
      expect(state.materials.length).toBeGreaterThan(0); // Resets to DEFAULT_MATERIALS
      expect(state.applications).toHaveLength(0);
      expect(state.selectedMaterialId).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search query', () => {
      act(() => {
        useMaterialStore.getState().addMaterial(mockMaterial);
        useMaterialStore.getState().setSearchQuery('');
      });

      const filtered = useMaterialStore.getState().getFilteredMaterials();
      expect(filtered).toHaveLength(1);
    });

    it('should handle whitespace-only search query', () => {
      act(() => {
        useMaterialStore.getState().addMaterial(mockMaterial);
        useMaterialStore.getState().setSearchQuery('   ');
      });

      const filtered = useMaterialStore.getState().getFilteredMaterials();
      expect(filtered).toHaveLength(1);
    });

    it('should handle case-insensitive search', () => {
      act(() => {
        useMaterialStore.getState().addMaterial(mockMaterial);
        useMaterialStore.getState().setSearchQuery('BRICK');
      });

      const filtered = useMaterialStore.getState().getFilteredMaterials();
      expect(filtered).toHaveLength(1);
    });

    it('should handle materials without optional properties', () => {
      const minimalMaterial: Material = {
        id: 'minimal-1',
        name: 'Minimal Material',
        category: 'other',
        properties: { color: '#000000' },
        metadata: {
          description: '',
          tags: [],
          isCustom: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      act(() => {
        useMaterialStore.getState().addMaterial(minimalMaterial);
        useMaterialStore.getState().setSearchQuery('manufacturer');
      });

      const filtered = useMaterialStore.getState().getFilteredMaterials();
      expect(filtered).toHaveLength(0);
    });

    it('should handle rapid state changes', () => {
      act(() => {
        useMaterialStore.getState().addMaterial(mockMaterial);
        useMaterialStore.getState().setSelectedMaterial('test-material-1');
        useMaterialStore.getState().setSelectedCategory('masonry');
        useMaterialStore.getState().setSearchQuery('brick');
        useMaterialStore.getState().toggleLibrary();
        useMaterialStore.getState().removeMaterial('test-material-1');
      });

      const state = useMaterialStore.getState();
      expect(state.materials).toHaveLength(0);
      expect(state.selectedMaterialId).toBeNull();
      expect(state.selectedCategory).toBe('masonry');
      expect(state.searchQuery).toBe('brick');
      expect(state.isLibraryOpen).toBe(true);
    });
  });
});