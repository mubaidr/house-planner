import { create } from 'zustand';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';

export interface DesignState {
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  selectedElementId: string | null;
  selectedElementType: 'wall' | 'door' | 'window' | null;
}

export interface DesignActions {
  addWall: (wall: Wall) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  removeWall: (id: string) => void;
  addDoor: (door: Door) => void;
  updateDoor: (id: string, updates: Partial<Door>) => void;
  removeDoor: (id: string) => void;
  addWindow: (window: Window) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  removeWindow: (id: string) => void;
  selectElement: (id: string | null, type: 'wall' | 'door' | 'window' | null) => void;
  clearSelection: () => void;
  clearAll: () => void;
}

export const useDesignStore = create<DesignState & DesignActions>((set) => ({
  // State
  walls: [],
  doors: [],
  windows: [],
  selectedElementId: null,
  selectedElementType: null,

  // Actions
  addWall: (wall) =>
    set((state) => ({
      walls: [...state.walls, wall],
    })),

  updateWall: (id, updates) =>
    set((state) => ({
      walls: state.walls.map((wall) =>
        wall.id === id ? { ...wall, ...updates } : wall
      ),
    })),

  removeWall: (id) =>
    set((state) => ({
      walls: state.walls.filter((wall) => wall.id !== id),
      // Remove associated doors and windows
      doors: state.doors.filter((door) => door.wallId !== id),
      windows: state.windows.filter((window) => window.wallId !== id),
    })),

  addDoor: (door) =>
    set((state) => ({
      doors: [...state.doors, door],
    })),

  updateDoor: (id, updates) =>
    set((state) => ({
      doors: state.doors.map((door) =>
        door.id === id ? { ...door, ...updates } : door
      ),
    })),

  removeDoor: (id) =>
    set((state) => ({
      doors: state.doors.filter((door) => door.id !== id),
    })),

  addWindow: (window) =>
    set((state) => ({
      windows: [...state.windows, window],
    })),

  updateWindow: (id, updates) =>
    set((state) => ({
      windows: state.windows.map((window) =>
        window.id === id ? { ...window, ...updates } : window
      ),
    })),

  removeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((window) => window.id !== id),
    })),

  selectElement: (id, type) =>
    set(() => ({
      selectedElementId: id,
      selectedElementType: type,
    })),

  clearSelection: () =>
    set(() => ({
      selectedElementId: null,
      selectedElementType: null,
    })),

  clearAll: () =>
    set(() => ({
      walls: [],
      doors: [],
      windows: [],
      selectedElementId: null,
      selectedElementType: null,
    })),
}));