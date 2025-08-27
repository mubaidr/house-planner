import { create } from 'zustand';

interface ToolState {
  hoveredWallId: string | null;
  setHoveredWallId: (id: string | null) => void;
}

export const useToolStore = create<ToolState>()(set => ({
  hoveredWallId: null,
  setHoveredWallId: id => set({ hoveredWallId: id }),
}));
