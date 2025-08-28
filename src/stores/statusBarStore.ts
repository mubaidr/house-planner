import { create } from 'zustand';

interface StatusBarState {
  angle: number | null;
  measurement: number | null;
  setAngle: (angle: number | null) => void;
  setMeasurement: (measurement: number | null) => void;
}

export const useStatusBarStore = create<StatusBarState>()(set => ({
  angle: null,
  measurement: null,
  setAngle: angle => set({ angle }),
  setMeasurement: measurement => set({ measurement }),
}));
