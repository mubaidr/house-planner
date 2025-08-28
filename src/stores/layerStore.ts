import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  opacity: number;
  elements: {
    walls: string[];
    doors: string[];
    windows: string[];
    stairs: string[];
    rooms: string[];
    roofs: string[];
  };
}

export interface LayerState {
  layers: Layer[];
  activeLayerId: string | null;
  defaultLayer: Layer;
}

export interface LayerActions {
  // Layer management
  addLayer: (layer: Omit<Layer, 'id'>) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  setActiveLayer: (id: string | null) => void;

  // Element assignment
  assignElementToLayer: (elementId: string, elementType: string, layerId: string) => void;
  removeElementFromLayer: (elementId: string, elementType: string, layerId: string) => void;

  // Layer visibility
  toggleLayerVisibility: (id: string) => void;
  setLayerVisibility: (id: string, visible: boolean) => void;

  // Layer locking
  toggleLayerLock: (id: string) => void;
  setLayerLock: (id: string, locked: boolean) => void;

  // Utility functions
  getLayerById: (id: string) => Layer | undefined;
  getElementsInLayer: (id: string) => string[];
  getVisibleLayers: () => Layer[];
  getUnlockedLayers: () => Layer[];
}

const DEFAULT_LAYER: Layer = {
  id: 'default',
  name: 'Default Layer',
  visible: true,
  locked: false,
  color: '#3b82f6',
  opacity: 1.0,
  elements: {
    walls: [],
    doors: [],
    windows: [],
    stairs: [],
    rooms: [],
    roofs: [],
  },
};

export const useLayerStore = create<LayerState & LayerActions>()(
  immer((set, get) => ({
    // Initial state
    layers: [DEFAULT_LAYER],
    activeLayerId: 'default',
    defaultLayer: DEFAULT_LAYER,

    // Layer management
    addLayer: layerData => {
      const newLayer: Layer = {
        ...layerData,
        id: `layer_${Date.now()}`,
        elements: {
          walls: [],
          doors: [],
          windows: [],
          stairs: [],
          rooms: [],
          roofs: [],
        },
      };

      set(state => {
        state.layers.push(newLayer);
      });
    },

    updateLayer: (id, updates) => {
      set(state => {
        const layer = state.layers.find(l => l.id === id);
        if (layer) {
          Object.assign(layer, updates);
        }
      });
    },

    removeLayer: id => {
      set(state => {
        // Don't allow removing the default layer
        if (id === 'default') return;

        state.layers = state.layers.filter(l => l.id !== id);

        // If the removed layer was active, switch to default
        if (state.activeLayerId === id) {
          state.activeLayerId = 'default';
        }
      });
    },

    setActiveLayer: id => {
      set(state => {
        const layer = state.layers.find(l => l.id === id);
        if (layer) {
          state.activeLayerId = id;
        }
      });
    },

    // Element assignment
    assignElementToLayer: (elementId, elementType, layerId) => {
      set(state => {
        const layer = state.layers.find(l => l.id === layerId);
        if (!layer) return;

        // Remove from all other layers first
        state.layers.forEach(l => {
          if (l.elements[elementType as keyof typeof l.elements]) {
            (l.elements as any)[elementType] = (l.elements as any)[elementType].filter(
              (id: string) => id !== elementId
            );
          }
        });

        // Add to target layer
        if (layer.elements[elementType as keyof typeof layer.elements]) {
          (layer.elements as any)[elementType].push(elementId);
        }
      });
    },

    removeElementFromLayer: (elementId, elementType, layerId) => {
      set(state => {
        const layer = state.layers.find(l => l.id === layerId);
        if (!layer) return;

        if (layer.elements[elementType as keyof typeof layer.elements]) {
          (layer.elements as any)[elementType] = (layer.elements as any)[elementType].filter(
            (id: string) => id !== elementId
          );
        }
      });
    },

    // Layer visibility
    toggleLayerVisibility: id => {
      set(state => {
        const layer = state.layers.find(l => l.id === id);
        if (layer) {
          layer.visible = !layer.visible;
        }
      });
    },

    setLayerVisibility: (id, visible) => {
      set(state => {
        const layer = state.layers.find(l => l.id === id);
        if (layer) {
          layer.visible = visible;
        }
      });
    },

    // Layer locking
    toggleLayerLock: id => {
      set(state => {
        const layer = state.layers.find(l => l.id === id);
        if (layer) {
          layer.locked = !layer.locked;
        }
      });
    },

    setLayerLock: (id, locked) => {
      set(state => {
        const layer = state.layers.find(l => l.id === id);
        if (layer) {
          layer.locked = locked;
        }
      });
    },

    // Utility functions
    getLayerById: id => {
      return get().layers.find(l => l.id === id);
    },

    getElementsInLayer: id => {
      const layer = get().layers.find(l => l.id === id);
      if (!layer) return [];

      return [
        ...layer.elements.walls,
        ...layer.elements.doors,
        ...layer.elements.windows,
        ...layer.elements.stairs,
        ...layer.elements.rooms,
        ...layer.elements.roofs,
      ];
    },

    getVisibleLayers: () => {
      return get().layers.filter(l => l.visible);
    },

    getUnlockedLayers: () => {
      return get().layers.filter(l => !l.locked);
    },
  }))
);
