import { create } from 'zustand';

export type Tool = 'select' | 'wall' | 'door' | 'window' | 'stair' | 'roof' | 'measure' | 'dimension' | 'align';

export interface UIState {
  activeTool: Tool;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  zoomLevel: number;
  canvasWidth: number;
  canvasHeight: number;
  sidebarCollapsed: boolean;
  propertiesPanelCollapsed: boolean;
  mouseCoordinates: { x: number; y: number };
  showRooms: boolean;
  gridVisible?: boolean;
}

export interface UIActions {
  setActiveTool: (tool: Tool) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  setZoomLevel: (level: number) => void;
  setCanvasSize: (width: number, height: number) => void;
  toggleSidebar: () => void;
  togglePropertiesPanel: () => void;
  setMouseCoordinates: (x: number, y: number) => void;
  toggleRooms: () => void;
}

export const useUIStore = create<UIState & UIActions>((set, get) => ({
  // State
  activeTool: 'select',
  showGrid: true,
  snapToGrid: true,
  gridSize: 20,
  zoomLevel: 1,
  canvasWidth: 800,
  canvasHeight: 600,
  sidebarCollapsed: false,
  propertiesPanelCollapsed: false,
  mouseCoordinates: { x: 0, y: 0 },
  showRooms: true,
  get gridVisible() {
    return get().showGrid
  },

  // Actions
  setActiveTool: (tool) =>
    set(() => ({
      activeTool: tool,
    })),

  toggleGrid: () =>
    set((state) => ({
      showGrid: !state.showGrid,
    })),

  toggleSnapToGrid: () =>
    set((state) => ({
      snapToGrid: !state.snapToGrid,
    })),

  setGridSize: (size) =>
    set(() => ({
      gridSize: size,
    })),

  setZoomLevel: (level) =>
    set(() => ({
      zoomLevel: Math.max(0.1, Math.min(5, level)),
    })),

  setCanvasSize: (width, height) =>
    set(() => ({
      canvasWidth: width,
      canvasHeight: height,
    })),

  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),

  togglePropertiesPanel: () =>
    set((state) => ({
      propertiesPanelCollapsed: !state.propertiesPanelCollapsed,
    })),

  setMouseCoordinates: (x, y) =>
    set(() => ({
      mouseCoordinates: { x, y },
    })),

  toggleRooms: () =>
    set((state) => ({
      showRooms: !state.showRooms,
    })),
}));
