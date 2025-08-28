import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useLayerStore } from './layerStore';

// Types
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Wall {
  id: string;
  start: Vector3;
  end: Vector3;
  height: number;
  thickness: number;
  type: 'interior' | 'exterior' | 'load-bearing';
  materialId?: string;
  layerId?: string;
}

export interface Door {
  id: string;
  wallId: string;
  position: number; // Position along wall (0-100)
  width: number;
  height: number;
  thickness: number;
  type: 'single' | 'double' | 'sliding';
  swingDirection: 'left' | 'right';
  isOpen: boolean;
  openAngle: number;
  openOffset: number;
  materialId?: string;
  layerId?: string;
}

export interface Window {
  id: string;
  wallId: string;
  position: number; // Position along wall (0-100)
  width: number;
  height: number;
  thickness: number;
  type: 'single' | 'double' | 'triple';
  glazing: 'single' | 'double' | 'triple';
  materialId?: string;
  layerId?: string;
}

export interface Stair {
  id: string;
  start: Vector3; // Base start point
  end: Vector3; // Base end point
  steps: number;
  stepHeight: number;
  stepDepth: number;
  width: number;
  type: 'straight' | 'l-shaped' | 'u-shaped' | 'spiral';
  radius?: number; // for spiral stairs
  materialId?: string;
  railingHeight?: number;
  hasHandrail?: boolean;
  layerId?: string;
}

export interface Room {
  id: string;
  wallIds: string[]; // The walls that form the boundary of the room
  floorMaterialId?: string;
  ceilingMaterialId?: string;
  layerId?: string;
}

export interface Roof {
  id: string;
  type: 'flat' | 'pitched' | 'hipped' | 'mansard';
  height: number;
  materialId?: string;
  layerId?: string;
}

export interface Material {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  map?: string;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string;
}

export interface DesignState {
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  stairs: Stair[];
  rooms: Room[];
  roofs: Roof[];
  materials: Material[];
  selectedElementId: string | null;
  selectedElementType: 'wall' | 'door' | 'window' | 'room' | 'stair' | 'roof' | null;
  viewMode: '2d' | '3d' | 'hybrid';
  activeTool:
    | 'select'
    | 'wall'
    | 'door'
    | 'window'
    | 'room'
    | 'measure'
    | 'add-door'
    | 'add-window'
    | 'copy'
    | null;
}

export interface DesignActions {
  // Wall operations
  addWall: (wall: Omit<Wall, 'id'>) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  removeWall: (id: string) => void;
  getConnectedWalls: (wallId: string) => { start: Wall[]; end: Wall[] };

  // Door operations
  addDoor: (door: Omit<Door, 'id'>) => void;
  updateDoor: (id: string, updates: Partial<Door>) => void;
  removeDoor: (id: string) => void;

  // Window operations
  addWindow: (window: Omit<Window, 'id'>) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  removeWindow: (id: string) => void;

  // Stair operations
  addStair: (stair: Omit<Stair, 'id'>) => void;
  updateStair: (id: string, updates: Partial<Stair>) => void;
  removeStair: (id: string) => void;

  // Room operations
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  removeRoom: (id: string) => void;

  // Roof operations
  addRoof: (roof: Omit<Roof, 'id'>) => void;
  updateRoof: (id: string, updates: Partial<Roof>) => void;
  removeRoof: (id: string) => void;

  // Material operations
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  removeMaterial: (id: string) => void;

  // Selection operations
  selectElement: (id: string | null, type: DesignState['selectedElementType']) => void;

  // Tool operations
  setActiveTool: (tool: DesignState['activeTool']) => void;

  // View operations
  setViewMode: (mode: DesignState['viewMode']) => void;

  // File operations
  saveProject: (filename?: string, description?: string) => Promise<void>;
  loadProject: (file: File) => Promise<void>;
  newProject: () => void;
  exportAsJSON: () => Promise<string>;
  importFromJSON: (jsonString: string) => void;

  // Export operations
  exportToOBJ: (filename?: string) => Promise<void>;
  exportToSTL: (filename?: string) => Promise<void>;
  exportToDAE: (filename?: string) => Promise<void>;
  exportToGLTF: (filename?: string) => Promise<void>;

  // Undo/Redo operations
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

export const useDesignStore = create<DesignState & DesignActions>()(
  subscribeWithSelector(
    immer((set, _get) => ({
      // Initial state
      walls: [],
      doors: [],
      windows: [],
      stairs: [],
      rooms: [],
      roofs: [],
      materials: [
        {
          id: 'wall-default',
          name: 'Default Wall',
          color: '#cccccc',
          roughness: 0.8,
          metalness: 0.1,
          opacity: 1,
        },
        {
          id: 'door-wood',
          name: 'Wood Door',
          color: '#8B4513',
          roughness: 0.7,
          metalness: 0.2,
          opacity: 1,
        },
        {
          id: 'window-glass',
          name: 'Glass Window',
          color: '#87CEEB',
          roughness: 0.1,
          metalness: 0.0,
          opacity: 0.3,
        },
        {
          id: 'floor-wood',
          name: 'Wood Floor',
          color: '#DEB887',
          roughness: 0.6,
          metalness: 0.1,
          opacity: 1,
        },
        {
          id: 'ceiling-white',
          name: 'White Ceiling',
          color: '#F5F5F5',
          roughness: 0.9,
          metalness: 0.0,
          opacity: 1,
        },
        {
          id: 'stair-wood',
          name: 'Wood Stairs',
          color: '#8B4513',
          roughness: 0.7,
          metalness: 0.2,
          opacity: 1,
        },
        {
          id: 'roof-red',
          name: 'Red Roof',
          color: '#8B0000',
          roughness: 0.8,
          metalness: 0.1,
          opacity: 1,
        },
      ],
      selectedElementId: null,
      selectedElementType: null,
      viewMode: '3d',
      activeTool: null,

      // Wall actions
      addWall: wall =>
        set(state => {
          const id = `wall-${Date.now()}`;
          const activeLayerId = useLayerStore.getState().activeLayerId;
          state.walls.push({ ...wall, id, layerId: activeLayerId || 'default' });
        }),

      updateWall: (id, updates) =>
        set(state => {
          const wallIndex = state.walls.findIndex(w => w.id === id);
          if (wallIndex !== -1) {
            state.walls[wallIndex] = { ...state.walls[wallIndex], ...updates };
          }
        }),

      removeWall: id =>
        set(state => {
          state.walls = state.walls.filter(w => w.id !== id);
          // Also remove any doors/windows attached to this wall
          state.doors = state.doors.filter(d => d.wallId !== id);
          state.windows = state.windows.filter(w => w.wallId !== id);
        }),

      // Door actions
      addDoor: door =>
        set(state => {
          const id = `door-${Date.now()}`;
          const activeLayerId = useLayerStore.getState().activeLayerId;
          state.doors.push({ ...door, id, layerId: activeLayerId || 'default' });
        }),

      addWindow: window =>
        set(state => {
          const id = `window-${Date.now()}`;
          const activeLayerId = useLayerStore.getState().activeLayerId;
          state.windows.push({ ...window, id, layerId: activeLayerId || 'default' });
        }),

      addStair: stair =>
        set(state => {
          const id = `stair-${Date.now()}`;
          const activeLayerId = useLayerStore.getState().activeLayerId;
          state.stairs.push({ ...stair, id, layerId: activeLayerId || 'default' });
        }),

      addRoom: room =>
        set(state => {
          const id = `room-${Date.now()}`;
          const activeLayerId = useLayerStore.getState().activeLayerId;
          state.rooms.push({ ...room, id, layerId: activeLayerId || 'default' });
        }),

      addRoof: roof =>
        set(state => {
          const id = `roof-${Date.now()}`;
          const activeLayerId = useLayerStore.getState().activeLayerId;
          state.roofs.push({ ...roof, id, layerId: activeLayerId || 'default' });
        }),

      updateDoor: (id, updates) =>
        set(state => {
          const doorIndex = state.doors.findIndex(d => d.id === id);
          if (doorIndex !== -1) {
            state.doors[doorIndex] = { ...state.doors[doorIndex], ...updates };
          }
        }),

      removeDoor: id =>
        set(state => {
          state.doors = state.doors.filter(d => d.id !== id);
        }),

      // Window actions
      addWindow: window =>
        set(state => {
          const id = `window-${Date.now()}`;
          const activeLayerId = useLayerStore.getState().activeLayerId;
          state.windows.push({
            ...window,
            id,
            glazing: 'single',
            layerId: activeLayerId || 'default',
          });
        }),

      updateWindow: (id, updates) =>
        set(state => {
          const windowIndex = state.windows.findIndex(w => w.id === id);
          if (windowIndex !== -1) {
            state.windows[windowIndex] = { ...state.windows[windowIndex], ...updates };
          }
        }),

      removeWindow: id =>
        set(state => {
          state.windows = state.windows.filter(w => w.id !== id);
        }),

      // Stair actions
      addStair: stair =>
        set(state => {
          const id = `stair-${Date.now()}`;
          const activeLayerId = useLayerStore.getState().activeLayerId;
          state.stairs.push({ ...stair, id, layerId: activeLayerId || 'default' });
        }),

      updateStair: (id, updates) =>
        set(state => {
          const stairIndex = state.stairs.findIndex(s => s.id === id);
          if (stairIndex !== -1) {
            state.stairs[stairIndex] = { ...state.stairs[stairIndex], ...updates };
          }
        }),

      removeStair: id =>
        set(state => {
          state.stairs = state.stairs.filter(s => s.id !== id);
        }),

      updateRoom: (id, updates) =>
        set(state => {
          const roomIndex = state.rooms.findIndex(r => r.id === id);
          if (roomIndex !== -1) {
            state.rooms[roomIndex] = { ...state.rooms[roomIndex], ...updates };
          }
        }),

      removeRoom: id =>
        set(state => {
          state.rooms = state.rooms.filter(r => r.id !== id);
        }),

      // Roof actions
      addRoof: roof =>
        set(state => {
          const id = `roof-${Date.now()}`;
          const activeLayerId = useLayerStore.getState().activeLayerId;
          state.roofs.push({ ...roof, id, layerId: activeLayerId || 'default' });
        }),

      updateRoof: (id, updates) =>
        set(state => {
          const roofIndex = state.roofs.findIndex(r => r.id === id);
          if (roofIndex !== -1) {
            state.roofs[roofIndex] = { ...state.roofs[roofIndex], ...updates };
          }
        }),

      removeRoof: id =>
        set(state => {
          state.roofs = state.roofs.filter(r => r.id !== id);
        }),

      // Selection actions
      selectElement: (id, type) =>
        set(state => {
          state.selectedElementId = id;
          state.selectedElementType = type;
        }),

      // View mode actions
      setViewMode: mode =>
        set(state => {
          state.viewMode = mode;
        }),

      // Tool actions
      setActiveTool: tool =>
        set(state => {
          state.activeTool = tool;
        }),

      // Material actions
      addMaterial: material =>
        set(state => {
          const id = `material-${Date.now()}`;
          state.materials.push({ ...material, id });
        }),

      updateMaterial: (id, updates) =>
        set(state => {
          const materialIndex = state.materials.findIndex(m => m.id === id);
          if (materialIndex !== -1) {
            state.materials[materialIndex] = { ...state.materials[materialIndex], ...updates };
          }
        }),

      // Clear all
      clearAll: () =>
        set(state => {
          state.walls = [];
          state.doors = [];
          state.windows = [];
          state.stairs = [];
          state.rooms = [];
          state.roofs = [];
          state.selectedElementId = null;
          state.selectedElementType = null;
          state.activeTool = null;
        }),

      // Helper functions
      getConnectedWalls: wallId => {
        const { walls } = _get();
        const wall = walls.find(w => w.id === wallId);
        if (!wall) return { start: [], end: [] };

        const connectedAtStart = walls.filter(
          w =>
            w.id !== wallId &&
            ((Math.abs(w.start.x - wall.start.x) < 0.01 &&
              Math.abs(w.start.z - wall.start.z) < 0.01) ||
              (Math.abs(w.end.x - wall.start.x) < 0.01 && Math.abs(w.end.z - wall.start.z) < 0.01))
        );

        const connectedAtEnd = walls.filter(
          w =>
            w.id !== wallId &&
            ((Math.abs(w.start.x - wall.end.x) < 0.01 && Math.abs(w.start.z - wall.end.z) < 0.01) ||
              (Math.abs(w.end.x - wall.end.x) < 0.01 && Math.abs(w.end.z - wall.end.z) < 0.01))
        );

        return { start: connectedAtStart, end: connectedAtEnd };
      },

      // Material operations
      removeMaterial: id => {
        set(state => {
          state.materials = state.materials.filter(m => m.id !== id);
        });
      },

      // File operations
      saveProject: async (filename, description) => {
        const state = _get();
        const { FileOperations } = await import('@/utils/fileOperations');
        await FileOperations.saveProject(state, filename, description);
      },

      loadProject: async file => {
        const { FileOperations } = await import('@/utils/fileOperations');
        const loadedState = await FileOperations.loadProject(file);
        set(loadedState);
      },

      newProject: () => {
        set(state => {
          state.walls = [];
          state.doors = [];
          state.windows = [];
          state.stairs = [];
          state.rooms = [];
          state.roofs = [];
          state.selectedElementId = null;
          state.selectedElementType = null;
          state.activeTool = null;
        });
      },

      exportAsJSON: async () => {
        const state = _get();
        const { FileOperations } = await import('@/utils/fileOperations');
        return FileOperations.exportAsJSON(state);
      },

      importFromJSON: async jsonString => {
        const { FileOperations } = await import('@/utils/fileOperations');
        const importedState = FileOperations.importFromJSON(jsonString);
        set(importedState);
      },

      // Undo/Redo operations
      undo: () => {
        // TODO: Implement undo functionality
        console.log('Undo not implemented yet');
        return false;
      },

      redo: () => {
        // TODO: Implement redo functionality
        console.log('Redo not implemented yet');
        return false;
      },

      canUndo: () => {
        // TODO: Check if undo is available
        return false;
      },

      canRedo: () => {
        // TODO: Check if redo is available
        return false;
      },

      clearHistory: () => {
        // TODO: Clear command history
        console.log('Clear history not implemented yet');
      },

      // Export operations
      exportToOBJ: async filename => {
        const state = _get();
        const { ExportFormats } = await import('@/utils/exportFormats');
        const objData = ExportFormats.exportOBJ(state);
        ExportFormats.downloadExport(objData, filename || 'house-model', 'obj');
      },

      exportToSTL: async filename => {
        const state = _get();
        const { ExportFormats } = await import('@/utils/exportFormats');
        const stlData = ExportFormats.exportSTL(state);
        ExportFormats.downloadExport(stlData, filename || 'house-model', 'stl');
      },

      exportToDAE: async filename => {
        const state = _get();
        const { ExportFormats } = await import('@/utils/exportFormats');
        const daeData = ExportFormats.exportDAE(state);
        ExportFormats.downloadExport(daeData, filename || 'house-model', 'dae');
      },

      exportToGLTF: async filename => {
        const state = _get();
        const { ExportFormats } = await import('@/utils/exportFormats');
        const gltfData = await ExportFormats.exportGLTF(state);
        ExportFormats.downloadExport(gltfData, filename || 'house-model', 'gltf');
      },
    }))
  )
);
