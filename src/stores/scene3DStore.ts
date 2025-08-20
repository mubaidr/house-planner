import { create } from 'zustand';

export interface Scene3DState {
  selectedElement: any;
  elements: any[];
  // Add other state properties as needed
}

export const useBoundStore = create<Scene3DState>((set) => ({
  selectedElement: null,
  elements: [],
  // Initialize other state properties
}));
