import { create } from 'zustand';
import { Material, MaterialApplication, MaterialCategory } from '@/types/materials/Material';
import { DEFAULT_MATERIALS } from '@/data/materialLibrary';

export interface MaterialState {
  materials: Material[];
  applications: MaterialApplication[];
  selectedMaterialId: string | null;
  selectedCategory: MaterialCategory | 'all';
  searchQuery: string;
  isLibraryOpen: boolean;
}

export interface MaterialActions {
  // Material management
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  removeMaterial: (id: string) => void;
  duplicateMaterial: (id: string) => void;
  
  // Material applications
  applyMaterial: (application: MaterialApplication) => void;
  removeMaterialApplication: (elementId: string, elementType: string) => void;
  getMaterialApplication: (elementId: string, elementType: string) => MaterialApplication | null;
  
  // UI state
  setSelectedMaterial: (id: string | null) => void;
  setSelectedCategory: (category: MaterialCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  toggleLibrary: () => void;
  setLibraryOpen: (open: boolean) => void;
  
  // Utility functions
  getFilteredMaterials: () => Material[];
  getMaterialById: (id: string) => Material | null;
  getApplicationsForElement: (elementId: string) => MaterialApplication[];
  
  // Import/Export
  importMaterials: (materials: Material[]) => void;
  exportMaterials: () => Material[];
  resetToDefaults: () => void;
}

export const useMaterialStore = create<MaterialState & MaterialActions>((set, get) => ({
  // State
  materials: DEFAULT_MATERIALS,
  applications: [],
  selectedMaterialId: null,
  selectedCategory: 'all',
  searchQuery: '',
  isLibraryOpen: false,

  // Material management
  addMaterial: (material) =>
    set((state) => ({
      materials: [...state.materials, material],
    })),

  updateMaterial: (id, updates) =>
    set((state) => ({
      materials: state.materials.map((material) =>
        material.id === id 
          ? { ...material, ...updates, metadata: { ...material.metadata, updatedAt: new Date() } }
          : material
      ),
    })),

  removeMaterial: (id) =>
    set((state) => ({
      materials: state.materials.filter((material) => material.id !== id),
      applications: state.applications.filter((app) => app.materialId !== id),
      selectedMaterialId: state.selectedMaterialId === id ? null : state.selectedMaterialId,
    })),

  duplicateMaterial: (id) => {
    const state = get();
    const material = state.materials.find(m => m.id === id);
    if (material) {
      const duplicate: Material = {
        ...material,
        id: `${material.id}-copy-${Date.now()}`,
        name: `${material.name} (Copy)`,
        metadata: {
          ...material.metadata,
          isCustom: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      set((state) => ({
        materials: [...state.materials, duplicate],
      }));
    }
  },

  // Material applications
  applyMaterial: (application) =>
    set((state) => {
      // Remove existing application for this element
      const filteredApplications = state.applications.filter(
        (app) => !(app.elementId === application.elementId && app.elementType === application.elementType)
      );
      return {
        applications: [...filteredApplications, application],
      };
    }),

  removeMaterialApplication: (elementId, elementType) =>
    set((state) => ({
      applications: state.applications.filter(
        (app) => !(app.elementId === elementId && app.elementType === elementType)
      ),
    })),

  getMaterialApplication: (elementId, elementType) => {
    const state = get();
    return state.applications.find(
      (app) => app.elementId === elementId && app.elementType === elementType
    ) || null;
  },

  // UI state
  setSelectedMaterial: (id) =>
    set(() => ({
      selectedMaterialId: id,
    })),

  setSelectedCategory: (category) =>
    set(() => ({
      selectedCategory: category,
    })),

  setSearchQuery: (query) =>
    set(() => ({
      searchQuery: query,
    })),

  toggleLibrary: () =>
    set((state) => ({
      isLibraryOpen: !state.isLibraryOpen,
    })),

  setLibraryOpen: (open) =>
    set(() => ({
      isLibraryOpen: open,
    })),

  // Utility functions
  getFilteredMaterials: () => {
    const state = get();
    let filtered = state.materials;

    // Filter by category
    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter((material) => material.category === state.selectedCategory);
    }

    // Filter by search query
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter((material) =>
        material.name.toLowerCase().includes(query) ||
        material.metadata.description.toLowerCase().includes(query) ||
        material.metadata.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (material.metadata.manufacturer && material.metadata.manufacturer.toLowerCase().includes(query))
      );
    }

    return filtered;
  },

  getMaterialById: (id) => {
    const state = get();
    return state.materials.find((material) => material.id === id) || null;
  },

  getApplicationsForElement: (elementId) => {
    const state = get();
    return state.applications.filter((app) => app.elementId === elementId);
  },

  // Import/Export
  importMaterials: (materials) =>
    set((state) => ({
      materials: [...state.materials, ...materials],
    })),

  exportMaterials: () => {
    const state = get();
    return state.materials.filter((material) => material.metadata.isCustom);
  },

  resetToDefaults: () =>
    set(() => ({
      materials: DEFAULT_MATERIALS,
      applications: [],
      selectedMaterialId: null,
    })),
}));