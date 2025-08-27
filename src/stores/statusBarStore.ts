import { create } from 'zustand';

interface StatusBarState {
  angle: number | null;
  setAngle: (angle: number | null) => void;
}

export const useStatusBarStore = create<StatusBarState>()(set => ({
  angle: null,
  setAngle: angle => set({ angle }),
}));
