import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

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
  materialId?: string;
  type: 'load-bearing' | 'partition';
}

export interface Door {
  id: string;
  wallId: string;
  position: number; // Normalized position (0-100) along the wall
  width: number;
  height: number;
  thickness: number;
  type: 'hinged' | 'sliding' | 'folding' | 'revolving';
  swingDirection: 'left' | 'right' | 'both';
  materialId?: string;
  frameMaterialId?: string;
  isOpen: boolean;
  openAngle: number; // 0-90 degrees for hinged doors
  openOffset: number; // 0-1 for sliding doors
}

export interface Window {
  id: string;
  wallId: string;
  position: number; // Normalized position (0-100) along the wall
  width: number;
  height: number;
  thickness: number;
  type: 'single' | 'double' | 'triple' | 'awning' | 'casement' | 'slider';
  materialId?: string;
  frameMaterialId?: string;
}

export interface Stair {
  id: string;
  start: Vector3; // Base start point
  end: Vector3; // Base end point
  steps: number;
  stepHeight: number;
  stepDepth: number;
  width: number;
  type: 'straight' | 'spiral' | 'l-shaped' | 'u-shaped';
  materialId?: string;
  railingHeight?: number;
  hasHandrail?: boolean;
}

export interface Room {
  id: string;
  wallIds: string[]; // The walls that form the boundary of the room
  floorMaterialId?: string;
  ceilingMaterialId?: string;
  name?: string;
}

export interface Roof {
  id: string;
  points: Vector3[]; // Points defining the roof shape
  type: 'flat' | 'gable' | 'hip' | 'mansard';
  materialId?: string;
  height?: number; // For non-flat roofs
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
  activeTool: 'select' | 'wall' | 'door' | 'window' | 'room' | null;
}

export interface DesignActions {
  // Wall actions
  addWall: (wall: Omit<Wall, 'id'>) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  removeWall: (id: string) => void;

  // Door actions
  addDoor: (door: Omit<Door, 'id'>) => void;
  updateDoor: (id: string, updates: Partial<Door>) => void;
  removeDoor: (id: string) => void;

  // Window actions
  addWindow: (window: Omit<Window, 'id'>) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  removeWindow: (id: string) => void;

  // Stair actions
  addStair: (stair: Omit<Stair, 'id'>) => void;
  updateStair: (id: string, updates: Partial<Stair>) => void;
  removeStair: (id: string) => void;

  // Room actions
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  removeRoom: (id: string) => void;

  // Roof actions
  addRoof: (roof: Omit<Roof, 'id'>) => void;
  updateRoof: (id: string, updates: Partial<Roof>) => void;
  removeRoof: (id: string) => void;

  // Selection actions
  selectElement: (id: string | null, type: DesignState['selectedElementType']) => void;

  // View mode actions
  setViewMode: (mode: DesignState['viewMode']) => void;

  // Tool actions
  setActiveTool: (tool: DesignState['activeTool']) => void;

  // Material actions
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;

  // Helper functions
  getConnectedWalls: (wallId: string) => { start: Wall[]; end: Wall[] };
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
          state.walls.push({ ...wall, id });
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
          state.doors.push({ ...door, id, isOpen: false, openAngle: 0, openOffset: 0 });
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
          state.windows.push({ ...window, id });
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
          state.stairs.push({ ...stair, id });
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

      // Room actions
      addRoom: room =>
        set(state => {
          const id = `room-${Date.now()}`;
          state.rooms.push({ ...room, id });
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
          state.roofs.push({ ...roof, id });
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

      // Helper functions
      getConnectedWalls: wallId => {
        const { walls } = _get();
        const wall = walls.find(w => w.id === wallId);
        if (!wall) return { start: [], end: [] };

        const connectedAtStart = walls.filter(
          w =>
            w.id !== wallId &&
            ((w.start.x === wall.start.x && w.start.z === wall.start.z) ||
              (w.end.x === wall.start.x && w.end.z === wall.start.z))
        );

        const connectedAtEnd = walls.filter(
          w =>
            w.id !== wallId &&
            ((w.start.x === wall.end.x && w.start.z === wall.end.z) ||
              (w.end.x === wall.end.x && w.end.z === wall.end.z))
        );

        return { start: connectedAtStart, end: connectedAtEnd };
      },
    }))
  )
);
