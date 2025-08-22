import { create } from 'zustand';
import type { Door, Roof, Room, Stair, Wall, Window } from './designStore';

export type SceneElement = Wall | Door | Window | Stair | Room | Roof;

export interface Scene3DState {
  selectedElement: SceneElement | null;
  elements: SceneElement[];
  // Add other state properties as needed
}

export const useBoundStore = create<Scene3DState>(() => ({
  selectedElement: null,
  elements: [],
  // Initialize other state properties
}));
