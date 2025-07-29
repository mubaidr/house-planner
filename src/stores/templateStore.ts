import { create } from 'zustand';
import { MaterialTemplate, TemplateApplication, TemplateCategory, DesignStyle } from '@/types/materials/MaterialTemplate';
import { BUILT_IN_TEMPLATES } from '@/data/materialTemplates';
import { useDesignStore } from './designStore';
import { useHistoryStore } from './historyStore';

export interface TemplateState {
  templates: MaterialTemplate[];
  applications: TemplateApplication[];
  selectedTemplateId: string | null;
  selectedCategory: TemplateCategory | 'all';
  selectedStyle: DesignStyle | 'all';
  searchQuery: string;
  isTemplateLibraryOpen: boolean;
  isCreatingTemplate: boolean;
}

export interface TemplateActions {
  // Template management
  addTemplate: (template: MaterialTemplate) => void;
  updateTemplate: (id: string, updates: Partial<MaterialTemplate>) => void;
  removeTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;

  // Template application
  applyTemplate: (templateId: string, targetElements?: string[]) => Promise<TemplateApplication>;
  undoTemplateApplication: (applicationId: string) => void;
  getTemplateApplications: () => TemplateApplication[];

  // UI state
  setSelectedTemplate: (id: string | null) => void;
  setSelectedCategory: (category: TemplateCategory | 'all') => void;
  setSelectedStyle: (style: DesignStyle | 'all') => void;
  setSearchQuery: (query: string) => void;
  toggleTemplateLibrary: () => void;
  setTemplateLibraryOpen: (open: boolean) => void;
  setCreatingTemplate: (creating: boolean) => void;

  // Utility functions
  getFilteredTemplates: () => MaterialTemplate[];
  getTemplateById: (id: string) => MaterialTemplate | null;
  createTemplateFromCurrentDesign: (name: string, description: string) => MaterialTemplate;
  calculateTemplateCost: (templateId: string) => { min: number; max: number; currency: string } | null;

  // Import/Export
  importTemplates: (templates: MaterialTemplate[]) => void;
  exportTemplates: () => MaterialTemplate[];
  resetToDefaults: () => void;
}

export const useTemplateStore = create<TemplateState & TemplateActions>((set, get) => ({
  // State
  templates: BUILT_IN_TEMPLATES,
  applications: [],
  selectedTemplateId: null,
  selectedCategory: 'all',
  selectedStyle: 'all',
  searchQuery: '',
  isTemplateLibraryOpen: false,
  isCreatingTemplate: false,

  // Template management
  addTemplate: (template) =>
    set((state) => ({
      templates: [...state.templates, template],
    })),

  updateTemplate: (id, updates) =>
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === id
          ? { ...template, ...updates, metadata: { ...template.metadata, updatedAt: new Date() } }
          : template
      ),
    })),

  removeTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((template) => template.id !== id && template.isBuiltIn !== true),
      selectedTemplateId: state.selectedTemplateId === id ? null : state.selectedTemplateId,
    })),

  duplicateTemplate: (id) => {
    const state = get();
    const template = state.templates.find(t => t.id === id);
    if (template) {
      const duplicate: MaterialTemplate = {
        ...template,
        id: `${template.id}-copy-${Date.now()}`,
        name: `${template.name} (Copy)`,
        metadata: {
          ...template.metadata,
          author: 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
        },
        isBuiltIn: false,
      };
      set((state) => ({
        templates: [...state.templates, duplicate],
      }));
    }
  },

  // Template application
  applyTemplate: async (templateId) => {
    const state = get();
    const template = state.templates.find(t => t.id === templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    if (!template.designData) {
      throw new Error('Template does not contain design data.');
    }

    const currentDesignState = useDesignStore.getState();
    const { executeCommand } = useHistoryStore.getState();

    executeCommand({
      execute: () => {
            useDesignStore.setState(template.designData!);
      },
      undo: () => {
        useDesignStore.setState(currentDesignState);
      },
      description: `Apply template: ${template.name}`,
    });

    const application: TemplateApplication = {
      templateId,
      appliedAt: new Date(),
      elementsAffected: [], // This could be more specific if needed
      materialsApplied: [], // This could be more specific if needed
    };

    // Update usage count
    set((state) => ({
      templates: state.templates.map(t =>
        t.id === templateId
          ? { ...t, metadata: { ...t.metadata, usageCount: t.metadata.usageCount + 1 } }
          : t
      ),
      applications: [...state.applications, application],
    }));

    return application;
  },

  undoTemplateApplication: (applicationId) => {
    // Implementation would reverse the material applications
    set((state) => ({
      applications: state.applications.filter(app => app.templateId !== applicationId),
    }));
  },

  getTemplateApplications: () => {
    const state = get();
    return state.applications;
  },

  // UI state
  setSelectedTemplate: (id) =>
    set(() => ({
      selectedTemplateId: id,
    })),

  setSelectedCategory: (category) =>
    set(() => ({
      selectedCategory: category,
    })),

  setSelectedStyle: (style) =>
    set(() => ({
      selectedStyle: style,
    })),

  setSearchQuery: (query) =>
    set(() => ({
      searchQuery: query,
    })),

  toggleTemplateLibrary: () =>
    set((state) => ({
      isTemplateLibraryOpen: !state.isTemplateLibraryOpen,
    })),

  setTemplateLibraryOpen: (open) =>
    set(() => ({
      isTemplateLibraryOpen: open,
    })),

  setCreatingTemplate: (creating) =>
    set(() => ({
      isCreatingTemplate: creating,
    })),

  // Utility functions
  getFilteredTemplates: () => {
    const state = get();
    let filtered = state.templates;

    // Filter by category
    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter((template) => template.category === state.selectedCategory);
    }

    // Filter by style
    if (state.selectedStyle !== 'all') {
      filtered = filtered.filter((template) => template.metadata.style === state.selectedStyle);
    }

    // Filter by search query
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter((template) =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(query)) ||
        template.metadata.author.toLowerCase().includes(query)
      );
    }

    return filtered;
  },

  getTemplateById: (id) => {
    const state = get();
    return state.templates.find((template) => template.id === id) || null;
  },

  createTemplateFromCurrentDesign: (name, description) => {
    const designState = useDesignStore.getState();
    const newTemplate: MaterialTemplate = {
      id: `custom-${Date.now()}`,
      name,
      description,
      category: 'custom',
      materials: [], // You might want to extract materials from the designState if needed
      designData: {
        walls: designState.walls,
        doors: designState.doors,
        windows: designState.windows,
        stairs: designState.stairs,
        roofs: designState.roofs,
        rooms: designState.rooms,
      },
      metadata: {
        author: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['custom'],
        style: 'contemporary',
        difficulty: 'intermediate',
        usageCount: 0,
      },
      isBuiltIn: false,
    };

    set((state) => ({
      templates: [...state.templates, newTemplate],
    }));

    return newTemplate;
  },

  calculateTemplateCost: (templateId) => {
    const state = get();
    const template = state.templates.find(t => t.id === templateId);

    if (!template || !template.metadata.estimatedCost) {
      return null;
    }

    return {
      min: template.metadata.estimatedCost.min,
      max: template.metadata.estimatedCost.max,
      currency: template.metadata.estimatedCost.currency,
    };
  },

  // Import/Export
  importTemplates: (templates) =>
    set((state) => ({
      templates: [...state.templates, ...templates.map(t => ({ ...t, isBuiltIn: false }))],
    })),

  exportTemplates: () => {
    const state = get();
    return state.templates.filter((template) => !template.isBuiltIn);
  },

  resetToDefaults: () =>
    set(() => ({
      templates: BUILT_IN_TEMPLATES,
      applications: [],
      selectedTemplateId: null,
    })),
}));
