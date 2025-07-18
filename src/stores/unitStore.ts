import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UnitSystem = 'metric' | 'imperial';

export interface UnitState {
  unitSystem: UnitSystem;
  precision: number;
  showUnitLabels: boolean;
  displayFormat: 'decimal' | 'fractional';
}

export interface UnitActions {
  setUnitSystem: (system: UnitSystem) => void;
  setPrecision: (precision: number) => void;
  toggleUnitLabels: () => void;
  setDisplayFormat: (format: 'decimal' | 'fractional') => void;
}

export const useUnitStore = create<UnitState & UnitActions>()(
  persist(
    (set) => ({
      // Default state
      unitSystem: 'metric',
      precision: 2,
      showUnitLabels: true,
      displayFormat: 'decimal',

      // Actions
      setUnitSystem: (system) => set({ unitSystem: system }),
      setPrecision: (precision) => set({ precision: Math.max(0, Math.min(6, precision)) }),
      toggleUnitLabels: () => set((state) => ({ showUnitLabels: !state.showUnitLabels })),
      setDisplayFormat: (format) => set({ displayFormat: format }),
    }),
    {
      name: 'unit-preferences',
    }
  )
);