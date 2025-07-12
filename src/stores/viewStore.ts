import { create } from 'zustand';

export type ViewMode = '2D' | 'isometric' | 'front' | 'back' | 'left' | 'right';

export interface ViewTransform {
  scale: { x: number; y: number };
  rotation: number;
  offset: { x: number; y: number };
  perspective?: {
    skewX: number;
    skewY: number;
  };
}

export interface ViewState {
  currentView: ViewMode;
  transforms: Record<ViewMode, ViewTransform>;
  isTransitioning: boolean;
  transitionDuration: number;
}

export interface ViewActions {
  setView: (view: ViewMode) => void;
  getViewTransform: (view: ViewMode) => ViewTransform;
  setTransitioning: (transitioning: boolean) => void;
  resetView: () => void;
}

const DEFAULT_TRANSFORMS: Record<ViewMode, ViewTransform> = {
  '2D': {
    scale: { x: 1, y: 1 },
    rotation: 0,
    offset: { x: 0, y: 0 },
  },
  'isometric': {
    scale: { x: 1, y: 0.866 }, // cos(30°) for isometric
    rotation: 30,
    offset: { x: 0, y: 0 },
    perspective: {
      skewX: 30,
      skewY: 0,
    },
  },
  'front': {
    scale: { x: 1, y: 1 },
    rotation: 0,
    offset: { x: 0, y: 0 },
    perspective: {
      skewX: 0,
      skewY: 0,
    },
  },
  'back': {
    scale: { x: -1, y: 1 }, // Flip horizontally
    rotation: 0,
    offset: { x: 0, y: 0 },
    perspective: {
      skewX: 0,
      skewY: 0,
    },
  },
  'left': {
    scale: { x: 0.3, y: 1 }, // Compressed side view
    rotation: 0,
    offset: { x: 0, y: 0 },
    perspective: {
      skewX: 0,
      skewY: 15,
    },
  },
  'right': {
    scale: { x: -0.3, y: 1 }, // Compressed side view, flipped
    rotation: 0,
    offset: { x: 0, y: 0 },
    perspective: {
      skewX: 0,
      skewY: -15,
    },
  },
};

export const useViewStore = create<ViewState & ViewActions>((set, get) => ({
  // State
  currentView: '2D',
  transforms: DEFAULT_TRANSFORMS,
  isTransitioning: false,
  transitionDuration: 300,

  // Actions
  setView: (view: ViewMode) => {
    const state = get();
    if (state.currentView === view) return;

    set({ isTransitioning: true });
    
    // Simulate transition delay
    setTimeout(() => {
      set({ 
        currentView: view,
        isTransitioning: false 
      });
    }, state.transitionDuration);
  },

  getViewTransform: (view: ViewMode) => {
    const state = get();
    return state.transforms[view];
  },

  setTransitioning: (transitioning: boolean) => {
    set({ isTransitioning: transitioning });
  },

  resetView: () => {
    set({ 
      currentView: '2D',
      isTransitioning: false 
    });
  },
}));