import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  DesignState,
  DesignActions,
  ViewMode,
  CameraPreset,
  Scene3DConfig,
  CameraState,
  Wall,
  Door,
  Window,
  Room,
  Material
} from '@/types';

// Default scene configuration
const DEFAULT_SCENE_CONFIG: Scene3DConfig = {
  initialized: false,
  camera: {
    position: [10, 10, 10],
    target: [0, 0, 0],
    fov: 50,
    zoom: 1,
  },
  lighting: {
    ambientIntensity: 0.4,
    directionalIntensity: 0.8,
    directionalPosition: [10, 10, 5],
    shadows: true,
    shadowIntensity: 0.3,
  },
  renderSettings: {
    quality: 'medium',
    shadows: true,
    postProcessing: false,
    wireframe: false,
    antialias: true,
  },
  environment: {
    background: 'gradient',
    backgroundColors: ['#f0f9ff', '#e0f2fe'],
    groundPlane: true,
    gridHelper: true,
  },
  physics: {
    enabled: true,
    debug: false,
    gravity: [0, -9.81, 0],
    paused: false,
  },
};

// Camera presets
const CAMERA_PRESETS: Record<CameraPreset, CameraState> = {
  perspective: {
    position: [10, 10, 10],
    target: [0, 0, 0],
    fov: 50,
    zoom: 1,
  },
  top: {
    position: [0, 20, 0],
    target: [0, 0, 0],
    fov: 50,
    zoom: 1,
  },
  front: {
    position: [0, 5, 15],
    target: [0, 5, 0],
    fov: 50,
    zoom: 1,
  },
  back: {
    position: [0, 5, -15],
    target: [0, 5, 0],
    fov: 50,
    zoom: 1,
  },
  left: {
    position: [-15, 5, 0],
    target: [0, 5, 0],
    fov: 50,
    zoom: 1,
  },
  right: {
    position: [15, 5, 0],
    target: [0, 5, 0],
    fov: 50,
    zoom: 1,
  },
  isometric: {
    position: [10, 10, 10],
    target: [0, 0, 0],
    fov: 30,
    zoom: 1,
  },
};

// Default materials
const DEFAULT_MATERIALS: Material[] = [
  {
    id: 'wall-default',
    name: 'Default Wall',
    color: '#f3f4f6',
    properties: {
      roughness: 0.8,
      metalness: 0.0,
      opacity: 1.0,
    },
  },
  {
    id: 'floor-wood',
    name: 'Wood Floor',
    color: '#8b5a2b',
    properties: {
      roughness: 0.7,
      metalness: 0.0,
      opacity: 1.0,
      patternScale: 1.0,
    },
  },
  {
    id: 'ceiling-white',
    name: 'White Ceiling',
    color: '#ffffff',
    properties: {
      roughness: 0.9,
      metalness: 0.0,
      opacity: 1.0,
    },
  },
];

interface EnhancedDesignState extends DesignState {}
interface EnhancedDesignActions extends DesignActions {}

export const useDesignStore = create<EnhancedDesignState & EnhancedDesignActions>()(
  subscribeWithSelector(
    immer((set, _get) => ({
      // Initial state
      walls: [],
      doors: [],
      windows: [],
      rooms: [],
      materials: DEFAULT_MATERIALS,

      selection: {
        selectedElementId: null,
        selectedElementType: null,
        hoveredElementId: null,
        hoveredElementType: null,
      },

      viewMode: '3d' as ViewMode,
      activeFloor: 0,
      scene3D: DEFAULT_SCENE_CONFIG,

      // Reset action for tests
      reset: () => set(() => ({
        walls: [],
        doors: [],
        windows: [],
        rooms: [],
        materials: DEFAULT_MATERIALS,
        selection: {
          selectedElementId: null,
          selectedElementType: null,
          hoveredElementId: null,
          hoveredElementType: null,
        },
        viewMode: '3d' as ViewMode,
        activeFloor: 0,
        scene3D: DEFAULT_SCENE_CONFIG,
      })),
      // Wall actions
      addWall: (wall) => set((state) => {
        const newWall: Wall = {
          ...wall,
          id: `wall-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        state.walls.push(newWall);
      }),

      updateWall: (id, updates) => set((state) => {
        const wallIndex = state.walls.findIndex(w => w.id === id);
        if (wallIndex >= 0) {
          Object.assign(state.walls[wallIndex], updates);
        }
      }),

      deleteWall: (id) => set((state) => {
        state.walls = state.walls.filter(w => w.id !== id);
        // Also remove related doors and windows
        state.doors = state.doors.filter(d => d.wallId !== id);
        state.windows = state.windows.filter(w => w.wallId !== id);
      }),

      // Door actions
      addDoor: (door) => set((state) => {
        const newDoor: Door = {
          ...door,
          id: `door-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        state.doors.push(newDoor);
      }),

      updateDoor: (id, updates) => set((state) => {
        const doorIndex = state.doors.findIndex(d => d.id === id);
        if (doorIndex >= 0) {
          Object.assign(state.doors[doorIndex], updates);
        }
      }),

      deleteDoor: (id) => set((state) => {
        state.doors = state.doors.filter(d => d.id !== id);
      }),

      // Window actions
      addWindow: (window) => set((state) => {
        const newWindow: Window = {
          ...window,
          id: `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        state.windows.push(newWindow);
      }),

      updateWindow: (id, updates) => set((state) => {
        const windowIndex = state.windows.findIndex(w => w.id === id);
        if (windowIndex >= 0) {
          Object.assign(state.windows[windowIndex], updates);
        }
      }),

      deleteWindow: (id) => set((state) => {
        state.windows = state.windows.filter(w => w.id !== id);
      }),

      // Room actions
      addRoom: (room) => set((state) => {
        const newRoom: Room = {
          ...room,
          id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        state.rooms.push(newRoom);
      }),

      updateRoom: (id, updates) => set((state) => {
        const roomIndex = state.rooms.findIndex(r => r.id === id);
        if (roomIndex >= 0) {
          Object.assign(state.rooms[roomIndex], updates);
        }
      }),

      deleteRoom: (id) => set((state) => {
        state.rooms = state.rooms.filter(r => r.id !== id);
      }),

      // Material actions
      addMaterial: (material) => set((state) => {
        const newMaterial: Material = {
          ...material,
          id: `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        state.materials.push(newMaterial);
      }),

      updateMaterial: (id, updates) => set((state) => {
        const materialIndex = state.materials.findIndex(m => m.id === id);
        if (materialIndex >= 0) {
          Object.assign(state.materials[materialIndex], updates);
        }
      }),

      deleteMaterial: (id) => set((state) => {
        state.materials = state.materials.filter(m => m.id !== id);
      }),

      // Selection actions
      selectElement: (id, type) => set((state) => {
        state.selection.selectedElementId = id;
        state.selection.selectedElementType = type;
      }),

      hoverElement: (id, type) => set((state) => {
        state.selection.hoveredElementId = id;
        state.selection.hoveredElementType = type;
      }),

      // View actions
      setViewMode: (mode) => set((state) => {
        state.viewMode = mode;
        if (mode === '3d' && !state.scene3D.initialized) {
          state.scene3D.initialized = true;
        }
      }),

      setCameraPreset: (preset) => set((state) => {
        const presetConfig = CAMERA_PRESETS[preset];
        if (presetConfig) {
          state.scene3D.camera = { ...presetConfig };
        }
      }),

      updateCameraState: (cameraState) => set((state) => {
        Object.assign(state.scene3D.camera, cameraState);
      }),

      // 3D actions
      update3DProperties: (elementId, elementType, properties) => set((state) => {
        let element;
        switch (elementType) {
          case 'wall':
            element = state.walls.find(w => w.id === elementId);
            if (element) element.properties3D = { ...element.properties3D, ...properties };
            break;
          case 'door':
            element = state.doors.find(d => d.id === elementId);
            if (element) element.properties3D = { ...element.properties3D, ...properties };
            break;
          case 'window':
            element = state.windows.find(w => w.id === elementId);
            if (element) element.properties3D = { ...element.properties3D, ...properties };
            break;
          case 'room':
            element = state.rooms.find(r => r.id === elementId);
            if (element) element.properties3D = { ...element.properties3D, ...properties };
            break;
        }
      }),

      updateScene3D: (config) => set((state) => {
        Object.assign(state.scene3D, config);
      }),

      initializeScene3D: () => set((state) => {
        if (!state.scene3D.initialized) {
          state.scene3D.initialized = true;
        }
      }),
    }))
  )
);
