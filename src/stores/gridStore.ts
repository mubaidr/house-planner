import { create } from 'zustand';

interface GridState {
  isVisible: boolean;
  spacing: number;
  toggleVisibility: () => void;
  setSpacing: (spacing: number) => void;
}

export const useGridStore = create<GridState>()(set => ({
  isVisible: true,
  spacing: 1,
  toggleVisibility: () => set(state => ({ isVisible: !state.isVisible })),
  setSpacing: spacing => set({ spacing }),
}));
