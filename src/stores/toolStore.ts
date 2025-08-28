import { create } from 'zustand';

interface ToolState {
  hoveredWallId: string | null;
  hoveredElementId: string | null;
  hoveredElementType: 'wall' | 'door' | 'window' | 'stair' | null;
  setHoveredWallId: (id: string | null) => void;
  setHoveredElement: (id: string | null, type: 'wall' | 'door' | 'window' | 'stair' | null) => void;
}

export const useToolStore = create<ToolState>()(set => ({
  hoveredWallId: null,
  hoveredElementId: null,
  hoveredElementType: null,
  setHoveredWallId: id => set({ hoveredWallId: id }),
  setHoveredElement: (id, type) => set({ hoveredElementId: id, hoveredElementType: type }),
}));
