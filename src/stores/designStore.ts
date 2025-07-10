import { create } from 'zustand';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Room } from '@/utils/roomDetection';
import { updateElementsForWallMovement } from '@/utils/wallElementMovement';

export interface DesignState {
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  rooms: Room[];
  selectedElementId: string | null;
  selectedElementType: 'wall' | 'door' | 'window' | 'room' | null;
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
  updateRoom: (id: string, updates: Partial<Room>) => void;
  updateRooms: (rooms: Room[]) => void;
  selectElement: (id: string | null, type: 'wall' | 'door' | 'window' | 'room' | null) => void;
  clearSelection: () => void;
  clearAll: () => void;
}

export const useDesignStore = create<DesignState & DesignActions>((set) => ({
  // State
  walls: [],
  doors: [],
  windows: [],
  rooms: [],
  selectedElementId: null,
  selectedElementType: null,

  // Actions
  addWall: (wall) =>
    set((state) => ({
      walls: [...state.walls, wall],
    })),

  updateWall: (id, updates) =>
    set((state) => {
      const oldWall = state.walls.find(wall => wall.id === id);
      if (!oldWall) return state;

      const newWall = { ...oldWall, ...updates };
      
      // Check if wall position actually changed
      const positionChanged = 
        newWall.startX !== oldWall.startX ||
        newWall.startY !== oldWall.startY ||
        newWall.endX !== oldWall.endX ||
        newWall.endY !== oldWall.endY;

      if (positionChanged) {
        // Update doors and windows to move with the wall
        const { updatedDoors, updatedWindows } = updateElementsForWallMovement(
          state.doors,
          state.windows,
          id,
          oldWall,
          newWall
        );

        return {
          walls: state.walls.map((wall) =>
            wall.id === id ? newWall : wall
          ),
          doors: updatedDoors,
          windows: updatedWindows,
        };
      }

      // If only non-position properties changed, just update the wall
      return {
        walls: state.walls.map((wall) =>
          wall.id === id ? newWall : wall
        ),
      };
    }),

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

  updateRoom: (id, updates) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? { ...room, ...updates } : room
      ),
    })),

  updateRooms: (rooms) =>
    set(() => ({
      rooms,
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
      rooms: [],
      selectedElementId: null,
      selectedElementType: null,
    })),
}));