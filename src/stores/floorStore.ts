import { create } from 'zustand';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Room } from '@/utils/roomDetection';

export interface Floor {
  id: string;
  name: string;
  level: number; // 0 = ground floor, 1 = first floor, etc.
  height: number; // Floor height in units
  isVisible: boolean;
  color: string; // Floor indicator color
  elements: {
    walls: Wall[];
    doors: Door[];
    windows: Window[];
    rooms: Room[];
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    description?: string;
    floorPlan?: string; // Base64 image of floor plan
  };
}

export interface FloorState {
  floors: Floor[];
  currentFloorId: string | null;
  showAllFloors: boolean;
  floorOpacity: number; // For ghost view of other floors
  nextFloorLevel: number;
}

export interface FloorActions {
  // Floor management
  addFloor: (name?: string) => Floor;
  removeFloor: (floorId: string) => void;
  updateFloor: (floorId: string, updates: Partial<Floor>) => void;
  duplicateFloor: (floorId: string, newName?: string) => Floor;

  // Floor navigation
  setCurrentFloor: (floorId: string) => void;
  getCurrentFloor: () => Floor | null;
  getFloorByLevel: (level: number) => Floor | null;

  // Floor visibility
  toggleFloorVisibility: (floorId: string) => void;
  setShowAllFloors: (show: boolean) => void;
  setFloorOpacity: (opacity: number) => void;

  // Element management per floor
  addElementToFloor: (floorId: string, elementType: 'walls' | 'doors' | 'windows' | 'rooms', element: Wall | Door | Window | Room) => void;
  removeElementFromFloor: (floorId: string, elementType: 'walls' | 'doors' | 'windows' | 'rooms', elementId: string) => void;
  updateElementInFloor: (floorId: string, elementType: 'walls' | 'doors' | 'windows' | 'rooms', elementId: string, updates: Partial<Wall | Door | Window | Room>) => void;

  // Floor ordering
  moveFloorUp: (floorId: string) => void;
  moveFloorDown: (floorId: string) => void;
  reorderFloors: (floorIds: string[]) => void;

  // Utility functions
  getFloorsOrderedByLevel: () => Floor[];
  getTotalFloors: () => number;
  getFloorElements: (floorId: string) => Floor['elements'] | null;

  // Import/Export
  exportFloorData: (floorId: string) => Floor | null;
  importFloorData: (floorData: Floor) => void;
  clearAllFloors: () => void;
}

const createDefaultFloor = (level: number, name?: string): Floor => ({
  id: `floor-${Date.now()}-${level}`,
  name: name || `${level === 0 ? 'Ground Floor' : level === 1 ? '1st Floor' : level === 2 ? '2nd Floor' : level === 3 ? '3rd Floor' : `${level}th Floor`}`,
  level,
  height: 300, // Default floor height
  isVisible: true,
  color: `hsl(${(level * 60) % 360}, 70%, 85%)`, // Different color per floor
  elements: {
    walls: [],
    doors: [],
    windows: [],
    rooms: [],
  },
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

const initialFloor = createDefaultFloor(0, 'Ground Floor');

export const useFloorStore = create<FloorState & FloorActions>((set, get) => ({
  // State
  floors: [initialFloor], // Start with ground floor
  currentFloorId: initialFloor.id, // Set initial current floor
  showAllFloors: false,
  floorOpacity: 0.3,
  nextFloorLevel: 1,

  // Floor management
  addFloor: (name?: string) => {
    const state = get();
    const newFloor = createDefaultFloor(state.nextFloorLevel, name);

    set((state) => ({
      floors: [...state.floors, newFloor],
      nextFloorLevel: state.nextFloorLevel + 1,
      currentFloorId: newFloor.id, // Switch to new floor
    }));

    return newFloor;
  },

  removeFloor: (floorId: string) => {
    const state = get();
    const floorToRemove = state.floors.find(f => f.id === floorId);

    if (!floorToRemove || state.floors.length <= 1) {
      console.warn('Cannot remove floor: minimum one floor required');
      return;
    }

    set((state) => {
      const remainingFloors = state.floors.filter(f => f.id !== floorId);
      const newCurrentFloorId = state.currentFloorId === floorId
        ? remainingFloors[0]?.id || null
        : state.currentFloorId;

      return {
        floors: remainingFloors,
        currentFloorId: newCurrentFloorId,
      };
    });
  },

  updateFloor: (floorId: string, updates: Partial<Floor>) => {
    set((state) => ({
      floors: state.floors.map(floor =>
        floor.id === floorId
          ? {
              ...floor,
              ...updates,
              metadata: {
                ...floor.metadata,
                ...updates.metadata,
                updatedAt: new Date()
              }
            }
          : floor
      ),
    }));
  },

  duplicateFloor: (floorId: string, newName?: string) => {
    const state = get();
    const floorToDuplicate = state.floors.find(f => f.id === floorId);

    if (!floorToDuplicate) return createDefaultFloor(0);

    const duplicatedFloor: Floor = {
      ...floorToDuplicate,
      id: `floor-${Date.now()}-${state.nextFloorLevel}`,
      name: newName || `${floorToDuplicate.name} (Copy)`,
      level: state.nextFloorLevel,
      elements: {
        walls: floorToDuplicate.elements.walls.map(wall => ({
          ...wall,
          id: `${wall.id}-copy-${Date.now()}`,
        })),
        doors: floorToDuplicate.elements.doors.map(door => ({
          ...door,
          id: `${door.id}-copy-${Date.now()}`,
        })),
        windows: floorToDuplicate.elements.windows.map(window => ({
          ...window,
          id: `${window.id}-copy-${Date.now()}`,
        })),
        rooms: floorToDuplicate.elements.rooms.map(room => ({
          ...room,
          id: `${room.id}-copy-${Date.now()}`,
        })),
      },
      metadata: {
        ...floorToDuplicate.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    set((state) => ({
      floors: [...state.floors, duplicatedFloor],
      nextFloorLevel: state.nextFloorLevel + 1,
      currentFloorId: duplicatedFloor.id,
    }));

    return duplicatedFloor;
  },

  // Floor navigation
  setCurrentFloor: (floorId: string) => {
    set({ currentFloorId: floorId });
  },

  getCurrentFloor: () => {
    const state = get();
    return state.floors.find(f => f.id === state.currentFloorId) || null;
  },

  getFloorByLevel: (level: number) => {
    const state = get();
    return state.floors.find(f => f.level === level) || null;
  },

  // Floor visibility
  toggleFloorVisibility: (floorId: string) => {
    set((state) => ({
      floors: state.floors.map(floor =>
        floor.id === floorId
          ? { ...floor, isVisible: !floor.isVisible }
          : floor
      ),
    }));
  },

  setShowAllFloors: (show: boolean) => {
    set({ showAllFloors: show });
  },

  setFloorOpacity: (opacity: number) => {
    set({ floorOpacity: Math.max(0, Math.min(1, opacity)) });
  },

  // Element management per floor
  addElementToFloor: (floorId: string, elementType: 'walls' | 'doors' | 'windows' | 'rooms', element: Wall | Door | Window | Room) => {
    set((state) => ({
      floors: state.floors.map(floor =>
        floor.id === floorId
          ? {
              ...floor,
              elements: {
                ...floor.elements,
                [elementType]: [...floor.elements[elementType], element],
              },
              metadata: { ...floor.metadata, updatedAt: new Date() },
            }
          : floor
      ),
    }));
  },

  removeElementFromFloor: (floorId: string, elementType: 'walls' | 'doors' | 'windows' | 'rooms', elementId: string) => {
    set((state) => ({
      floors: state.floors.map(floor =>
        floor.id === floorId
          ? {
              ...floor,
              elements: {
                ...floor.elements,
                [elementType]: floor.elements[elementType].filter((el: Wall | Door | Window | Room) => el.id !== elementId),
              },
              metadata: { ...floor.metadata, updatedAt: new Date() },
            }
          : floor
      ),
    }));
  },

  updateElementInFloor: (floorId: string, elementType: 'walls' | 'doors' | 'windows' | 'rooms', elementId: string, updates: Partial<Wall | Door | Window | Room>) => {
    set((state) => ({
      floors: state.floors.map(floor =>
        floor.id === floorId
          ? {
              ...floor,
              elements: {
                ...floor.elements,
                [elementType]: floor.elements[elementType].map((el: Wall | Door | Window | Room) =>
                  el.id === elementId ? { ...el, ...updates } : el
                ),
              },
              metadata: { ...floor.metadata, updatedAt: new Date() },
            }
          : floor
      ),
    }));
  },

  // Floor ordering
  moveFloorUp: (floorId: string) => {
    const state = get();
    const floor = state.floors.find(f => f.id === floorId);
    if (!floor || floor.level >= state.floors.length - 1) return;

    const floorAbove = state.floors.find(f => f.level === floor.level + 1);
    if (!floorAbove) return;

    set((state) => ({
      floors: state.floors.map(f => {
        if (f.id === floorId) return { ...f, level: f.level + 1 };
        if (f.id === floorAbove.id) return { ...f, level: f.level - 1 };
        return f;
      }),
    }));
  },

  moveFloorDown: (floorId: string) => {
    const state = get();
    const floor = state.floors.find(f => f.id === floorId);
    if (!floor || floor.level <= 0) return;

    const floorBelow = state.floors.find(f => f.level === floor.level - 1);
    if (!floorBelow) return;

    set((state) => ({
      floors: state.floors.map(f => {
        if (f.id === floorId) return { ...f, level: f.level - 1 };
        if (f.id === floorBelow.id) return { ...f, level: f.level + 1 };
        return f;
      }),
    }));
  },

  reorderFloors: (floorIds: string[]) => {
    set((state) => ({
      floors: state.floors.map(floor => {
        const newLevel = floorIds.indexOf(floor.id);
        return newLevel >= 0 ? { ...floor, level: newLevel } : floor;
      }),
    }));
  },

  // Utility functions
  getFloorsOrderedByLevel: () => {
    const state = get();
    return [...state.floors].sort((a, b) => a.level - b.level);
  },

  getTotalFloors: () => {
    const state = get();
    return state.floors.length;
  },

  getFloorElements: (floorId: string) => {
    const state = get();
    const floor = state.floors.find(f => f.id === floorId);
    return floor ? floor.elements : null;
  },

  // Import/Export
  exportFloorData: (floorId: string) => {
    const state = get();
    return state.floors.find(f => f.id === floorId) || null;
  },

  importFloorData: (floorData: Floor) => {
    const newFloor = {
      ...floorData,
      id: `floor-${Date.now()}-imported`,
      metadata: {
        ...floorData.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    set((state) => ({
      floors: [...state.floors, newFloor],
      currentFloorId: newFloor.id,
    }));
  },

  clearAllFloors: () => {
    const defaultFloor = createDefaultFloor(0, 'Ground Floor');
    set({
      floors: [defaultFloor],
      currentFloorId: defaultFloor.id,
      nextFloorLevel: 1,
    });
  },
}));
