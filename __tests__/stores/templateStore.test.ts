import { act, renderHook } from '@testing-library/react';
import { useTemplateStore } from '@/stores/templateStore';
import { MaterialTemplate, TemplateCategory, DesignStyle } from '@/types/materials/MaterialTemplate';

// Mock template for testing
const mockTemplate: MaterialTemplate = {
  id: 'test-template-1',
  name: 'Test Template',
  description: 'A test template for unit testing',
  category: 'residential',
  style: 'modern',
  materials: [
    {
      id: 'mat-1',
      elementType: 'wall',
      materialId: 'brick-red',
      properties: {
        color: '#CC6666',
        texture: 'brick',
        finish: 'matte'
      }
    }
  ],
  metadata: {
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    author: 'Test Author',
    version: '1.0.0',
    tags: ['test', 'mock'],
    style: 'modern',
    isBuiltIn: false,
    estimatedCost: {
      min: 1000,
      max: 2000,
      currency: 'USD'
    }
  }
};

const mockTemplate2: MaterialTemplate = {
  id: 'test-template-2',
  name: 'Commercial Template',
  description: 'A commercial template',
  category: 'commercial',
  style: 'industrial',
  materials: [],
  metadata: {
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    author: 'Test Author 2',
    version: '1.0.0',
    tags: ['commercial'],
    style: 'industrial',
    isBuiltIn: false
  }
};

describe('TemplateStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useTemplateStore.setState({
        templates: [],
        applications: [],
        selectedTemplateId: null,
        selectedCategory: 'all',
        selectedStyle: 'all',
        searchQuery: '',
        isTemplateLibraryOpen: false,
        isCreatingTemplate: false,
      });
    });
  });

  describe('Initial State', () => {
    it('should have correct default values', () => {
      const state = useTemplateStore.getState();
      
      expect(state.templates).toEqual([]);
      expect(state.applications).toEqual([]);
      expect(state.selectedTemplateId).toBe(null);
      expect(state.selectedCategory).toBe('all');
      expect(state.selectedStyle).toBe('all');
      expect(state.searchQuery).toBe('');
      expect(state.isTemplateLibraryOpen).toBe(false);
      expect(state.isCreatingTemplate).toBe(false);
    });
  });

  describe('Template Management', () => {
    describe('addTemplate', () => {
      it('should add a new template', () => {
        act(() => {
          useTemplateStore.getState().addTemplate(mockTemplate);
        });

        const state = useTemplateStore.getState();
        expect(state.templates).toHaveLength(1);
        expect(state.templates[0]).toEqual(mockTemplate);
      });

      it('should add multiple templates', () => {
        act(() => {
          useTemplateStore.getState().addTemplate(mockTemplate);
          useTemplateStore.getState().addTemplate(mockTemplate2);
        });

        const state = useTemplateStore.getState();
        expect(state.templates).toHaveLength(2);
        expect(state.templates[0]).toEqual(mockTemplate);
        expect(state.templates[1]).toEqual(mockTemplate2);
      });
    });

    describe('updateTemplate', () => {
      beforeEach(() => {
        act(() => {
          useTemplateStore.getState().addTemplate(mockTemplate);
        });
      });

      it('should update existing template', () => {
        const updates = {
          name: 'Updated Template Name',
          description: 'Updated description'
        };

        act(() => {
          useTemplateStore.getState().updateTemplate(mockTemplate.id, updates);
        });

        const state = useTemplateStore.getState();
        expect(state.templates[0].name).toBe('Updated Template Name');
        expect(state.templates[0].description).toBe('Updated description');
        expect(state.templates[0].id).toBe(mockTemplate.id); // ID should remain unchanged
      });

      it('should not update non-existent template', () => {
        const initialState = useTemplateStore.getState();
        
        act(() => {
          useTemplateStore.getState().updateTemplate('non-existent', { name: 'New Name' });
        });

        const state = useTemplateStore.getState();
        expect(state.templates).toEqual(initialState.templates);
      });
    });

    describe('removeTemplate', () => {
      beforeEach(() => {
        act(() => {
          useTemplateStore.getState().addTemplate(mockTemplate);
          useTemplateStore.getState().addTemplate(mockTemplate2);
        });
      });

      it('should remove existing template', () => {
        act(() => {
          useTemplateStore.getState().removeTemplate(mockTemplate.id);
        });

        const state = useTemplateStore.getState();
        expect(state.templates).toHaveLength(1);
        expect(state.templates[0].id).toBe(mockTemplate2.id);
      });

      it('should handle removing non-existent template', () => {
        const initialLength = useTemplateStore.getState().templates.length;
        
        act(() => {
          useTemplateStore.getState().removeTemplate('non-existent');
        });

        const state = useTemplateStore.getState();
        expect(state.templates).toHaveLength(initialLength);
      });

      it('should clear selectedTemplateId if removed template was selected', () => {
        act(() => {
          useTemplateStore.getState().setSelectedTemplate(mockTemplate.id);
          useTemplateStore.getState().removeTemplate(mockTemplate.id);
        });

        const state = useTemplateStore.getState();
        expect(state.selectedTemplateId).toBe(null);
      });
    });

    describe('duplicateTemplate', () => {
      beforeEach(() => {
        act(() => {
          useTemplateStore.getState().addTemplate(mockTemplate);
        });
      });

      it('should create duplicate with new ID', () => {
        act(() => {
          useTemplateStore.getState().duplicateTemplate(mockTemplate.id);
        });

        const state = useTemplateStore.getState();
        expect(state.templates).toHaveLength(2);
        
        const duplicate = state.templates[1];
        expect(duplicate.id).not.toBe(mockTemplate.id);
        expect(duplicate.name).toBe(`${mockTemplate.name} (Copy)`);
        expect(duplicate.description).toBe(mockTemplate.description);
        expect(duplicate.category).toBe(mockTemplate.category);
      });

      it('should handle duplicating non-existent template', () => {
        const initialLength = useTemplateStore.getState().templates.length;
        
        act(() => {
          useTemplateStore.getState().duplicateTemplate('non-existent');
        });

        const state = useTemplateStore.getState();
        expect(state.templates).toHaveLength(initialLength);
      });
    });
  });

  describe('UI State Management', () => {
    describe('setSelectedTemplate', () => {
      it('should set selected template ID', () => {
        act(() => {
          useTemplateStore.getState().setSelectedTemplate('template-123');
        });

        const state = useTemplateStore.getState();
        expect(state.selectedTemplateId).toBe('template-123');
      });

      it('should clear selected template', () => {
        act(() => {
          useTemplateStore.getState().setSelectedTemplate('template-123');
          useTemplateStore.getState().setSelectedTemplate(null);
        });

        const state = useTemplateStore.getState();
        expect(state.selectedTemplateId).toBe(null);
      });
    });

    describe('setSelectedCategory', () => {
      it('should set category filter', () => {
        act(() => {
          useTemplateStore.getState().setSelectedCategory('residential');
        });

        const state = useTemplateStore.getState();
        expect(state.selectedCategory).toBe('residential');
      });

      it('should set to all categories', () => {
        act(() => {
          useTemplateStore.getState().setSelectedCategory('commercial');
          useTemplateStore.getState().setSelectedCategory('all');
        });

        const state = useTemplateStore.getState();
        expect(state.selectedCategory).toBe('all');
      });
    });

    describe('setSelectedStyle', () => {
      it('should set style filter', () => {
        act(() => {
          useTemplateStore.getState().setSelectedStyle('modern');
        });

        const state = useTemplateStore.getState();
        expect(state.selectedStyle).toBe('modern');
      });
    });

    describe('setSearchQuery', () => {
      it('should set search query', () => {
        act(() => {
          useTemplateStore.getState().setSearchQuery('modern kitchen');
        });

        const state = useTemplateStore.getState();
        expect(state.searchQuery).toBe('modern kitchen');
      });

      it('should handle empty search query', () => {
        act(() => {
          useTemplateStore.getState().setSearchQuery('test');
          useTemplateStore.getState().setSearchQuery('');
        });

        const state = useTemplateStore.getState();
        expect(state.searchQuery).toBe('');
      });
    });

    describe('Template Library State', () => {
      it('should toggle template library', () => {
        act(() => {
          useTemplateStore.getState().toggleTemplateLibrary();
        });

        let state = useTemplateStore.getState();
        expect(state.isTemplateLibraryOpen).toBe(true);

        act(() => {
          useTemplateStore.getState().toggleTemplateLibrary();
        });

        state = useTemplateStore.getState();
        expect(state.isTemplateLibraryOpen).toBe(false);
      });

      it('should set template library open state', () => {
        act(() => {
          useTemplateStore.getState().setTemplateLibraryOpen(true);
        });

        let state = useTemplateStore.getState();
        expect(state.isTemplateLibraryOpen).toBe(true);

        act(() => {
          useTemplateStore.getState().setTemplateLibraryOpen(false);
        });

        state = useTemplateStore.getState();
        expect(state.isTemplateLibraryOpen).toBe(false);
      });

      it('should set creating template state', () => {
        act(() => {
          useTemplateStore.getState().setCreatingTemplate(true);
        });

        let state = useTemplateStore.getState();
        expect(state.isCreatingTemplate).toBe(true);

        act(() => {
          useTemplateStore.getState().setCreatingTemplate(false);
        });

        state = useTemplateStore.getState();
        expect(state.isCreatingTemplate).toBe(false);
      });
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      act(() => {
        useTemplateStore.getState().addTemplate(mockTemplate);
        useTemplateStore.getState().addTemplate(mockTemplate2);
      });
    });

    describe('getTemplateById', () => {
      it('should return template by ID', () => {
        const template = useTemplateStore.getState().getTemplateById(mockTemplate.id);
        expect(template).toEqual(mockTemplate);
      });

      it('should return null for non-existent ID', () => {
        const template = useTemplateStore.getState().getTemplateById('non-existent');
        expect(template).toBe(null);
      });
    });

    describe('getFilteredTemplates', () => {
      it('should return all templates when no filters applied', () => {
        const filtered = useTemplateStore.getState().getFilteredTemplates();
        expect(filtered).toHaveLength(2);
      });

      it('should filter by category', () => {
        act(() => {
          useTemplateStore.getState().setSelectedCategory('residential');
        });

        const filtered = useTemplateStore.getState().getFilteredTemplates();
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe(mockTemplate.id);
      });

      it('should filter by style', () => {
        act(() => {
          useTemplateStore.getState().setSelectedStyle('modern');
        });

        const filtered = useTemplateStore.getState().getFilteredTemplates();
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe(mockTemplate.id);
      });

      it('should filter by search query', () => {
        act(() => {
          useTemplateStore.getState().setSearchQuery('Commercial');
        });

        const filtered = useTemplateStore.getState().getFilteredTemplates();
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe(mockTemplate2.id);
      });

      it('should apply multiple filters', () => {
        act(() => {
          useTemplateStore.getState().setSelectedCategory('residential');
          useTemplateStore.getState().setSelectedStyle('modern');
          useTemplateStore.getState().setSearchQuery('Test');
        });

        const filtered = useTemplateStore.getState().getFilteredTemplates();
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe(mockTemplate.id);
      });

      it('should return empty array when no matches', () => {
        act(() => {
          useTemplateStore.getState().setSearchQuery('NonExistentTemplate');
        });

        const filtered = useTemplateStore.getState().getFilteredTemplates();
        expect(filtered).toHaveLength(0);
      });
    });

    describe('calculateTemplateCost', () => {
      it('should return cost for template with cost metadata', () => {
        const cost = useTemplateStore.getState().calculateTemplateCost(mockTemplate.id);
        expect(cost).toEqual({
          min: 1000,
          max: 2000,
          currency: 'USD'
        });
      });

      it('should return null for template without cost metadata', () => {
        const cost = useTemplateStore.getState().calculateTemplateCost(mockTemplate2.id);
        expect(cost).toBe(null);
      });

      it('should return null for non-existent template', () => {
        const cost = useTemplateStore.getState().calculateTemplateCost('non-existent');
        expect(cost).toBe(null);
      });
    });
  });

  describe('Import/Export', () => {
    beforeEach(() => {
      act(() => {
        useTemplateStore.getState().addTemplate(mockTemplate);
        useTemplateStore.getState().addTemplate(mockTemplate2);
      });
    });

    describe('exportTemplates', () => {
      it('should export all templates', () => {
        const exported = useTemplateStore.getState().exportTemplates();
        expect(exported).toHaveLength(2);
        expect(exported).toEqual([mockTemplate, mockTemplate2]);
      });

      it('should export empty array when no templates', () => {
        act(() => {
          useTemplateStore.setState({ templates: [] });
        });

        const exported = useTemplateStore.getState().exportTemplates();
        expect(exported).toEqual([]);
      });
    });

    describe('importTemplates', () => {
      it('should import templates and merge with existing', () => {
        const newTemplate: MaterialTemplate = {
          ...mockTemplate,
          id: 'imported-template',
          name: 'Imported Template'
        };

        act(() => {
          useTemplateStore.getState().importTemplates([newTemplate]);
        });

        const state = useTemplateStore.getState();
        expect(state.templates).toHaveLength(3);
        expect(state.templates.find(t => t.id === 'imported-template')).toBeDefined();
      });

      it('should handle importing empty array', () => {
        const initialLength = useTemplateStore.getState().templates.length;

        act(() => {
          useTemplateStore.getState().importTemplates([]);
        });

        const state = useTemplateStore.getState();
        expect(state.templates).toHaveLength(initialLength);
      });
    });

    describe('resetToDefaults', () => {
      it('should reset to built-in templates only', () => {
        act(() => {
          useTemplateStore.getState().resetToDefaults();
        });

        const state = useTemplateStore.getState();
        // Should contain built-in templates (mocked as empty for this test)
        expect(Array.isArray(state.templates)).toBe(true);
        expect(state.selectedTemplateId).toBe(null);
        expect(state.selectedCategory).toBe('all');
        expect(state.selectedStyle).toBe('all');
        expect(state.searchQuery).toBe('');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle operations on empty template list', () => {
      expect(() => {
        act(() => {
          useTemplateStore.getState().removeTemplate('any-id');
          useTemplateStore.getState().updateTemplate('any-id', {});
          useTemplateStore.getState().duplicateTemplate('any-id');
        });
      }).not.toThrow();
    });

    it('should handle invalid filter combinations', () => {
      act(() => {
        useTemplateStore.getState().addTemplate(mockTemplate);
        useTemplateStore.getState().setSelectedCategory('commercial');
        useTemplateStore.getState().setSelectedStyle('modern');
      });

      const filtered = useTemplateStore.getState().getFilteredTemplates();
      expect(filtered).toHaveLength(0); // No templates match commercial + modern
    });

    it('should handle case-insensitive search', () => {
      act(() => {
        useTemplateStore.getState().addTemplate(mockTemplate);
        useTemplateStore.getState().setSearchQuery('TEST');
      });

      const filtered = useTemplateStore.getState().getFilteredTemplates();
      expect(filtered).toHaveLength(1);
    });
  });
});