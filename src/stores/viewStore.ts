import { create } from 'zustand';
import { ViewType2D } from '@/types/views';
import { Point2D } from '@/types/elements2D';
import { Command, ChangeViewCommand, ChangeViewTransformCommand } from '@/utils/history';
import { ToggleLayerVisibilityCommand } from '@/utils/history';

export interface ViewTransform2D {
  pan: Point2D;
  zoom: number;
  rotation: number;
}

export interface ViewState {
  currentView: ViewType2D;
  viewStates: Record<ViewType2D, ViewTransform2D>;
  isTransitioning: boolean;
  transitionDuration: number;
  layerVisibility: Record<ViewType2D, Record<string, boolean>>;
}

export interface ViewActions {
  setView: (view: ViewType2D) => void;
  setViewWithHistory: (view: ViewType2D, executeCommand?: (command: Command) => void) => void;
  getViewTransform: (view: ViewType2D) => ViewTransform2D;
  setViewTransform: (view: ViewType2D, transform: Partial<ViewTransform2D>) => void;
  setViewTransformWithHistory: (view: ViewType2D, transform: Partial<ViewTransform2D>, executeCommand?: (command: Command) => void) => void;
  setTransitioning: (transitioning: boolean) => void;
  resetView: () => void;
  toggleLayerVisibility: (view: ViewType2D, layer: string) => void;
  toggleLayerVisibilityWithHistory: (view: ViewType2D, layer: string, executeCommand?: (command: Command) => void) => void;
  setLayerVisibility: (view: ViewType2D, layer: string, visible: boolean) => void;
}

const DEFAULT_VIEW_TRANSFORMS: Record<ViewType2D, ViewTransform2D> = {
  plan: {
    pan: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0,
  },
  front: {
    pan: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0,
  },
  back: {
    pan: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0,
  },
  left: {
    pan: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0,
  },
  right: {
    pan: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0,
  },
};

const DEFAULT_LAYER_VISIBILITY: Record<ViewType2D, Record<string, boolean>> = {
  plan: {
    walls: true,
    doors: true,
    windows: true,
    stairs: true,
    rooms: true,
    furniture: true,
    electrical: false,
    plumbing: false,
    dimensions: true,
    annotations: true,
  },
  front: {
    walls: true,
    doors: true,
    windows: true,
    roof: true,
    'exterior-materials': true,
    dimensions: true,
    annotations: true,
  },
  back: {
    walls: true,
    doors: true,
    windows: true,
    roof: true,
    'exterior-materials': true,
    dimensions: true,
    annotations: true,
  },
  left: {
    walls: true,
    doors: true,
    windows: true,
    roof: true,
    'exterior-materials': true,
    dimensions: true,
    annotations: true,
  },
  right: {
    walls: true,
    doors: true,
    windows: true,
    roof: true,
    'exterior-materials': true,
    dimensions: true,
    annotations: true,
  },
};

export const useViewStore = create<ViewState & ViewActions>((set, get) => ({
  // State
  currentView: 'plan' as ViewType2D,
  viewStates: DEFAULT_VIEW_TRANSFORMS,
  isTransitioning: false,
  transitionDuration: 300,
  layerVisibility: DEFAULT_LAYER_VISIBILITY,

  // Actions
  setView: (view: ViewType2D) => {
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

  setViewWithHistory: (view: ViewType2D, executeCommand?: (command: Command) => void) => {
    const state = get();
    if (state.currentView === view) return;

    if (executeCommand) {
      const command = new ChangeViewCommand(
        state.currentView,
        view,
        (newView: ViewType2D) => {
          set({ isTransitioning: true });
          setTimeout(() => {
            set({
              currentView: newView,
              isTransitioning: false
            });
          }, state.transitionDuration);
        }
      );
      executeCommand(command);
    } else {
      // Fallback to direct execution if no history system available
      get().setView(view);
    }
  },

  getViewTransform: (view: ViewType2D) => {
    const state = get();
    return state.viewStates[view];
  },

  setViewTransform: (view: ViewType2D, transform: Partial<ViewTransform2D>) => {
    set((state) => ({
      viewStates: {
        ...state.viewStates,
        [view]: {
          ...state.viewStates[view],
          ...transform,
        },
      },
    }));
  },

  setViewTransformWithHistory: (view: ViewType2D, transform: Partial<ViewTransform2D>, executeCommand?: (command: Command) => void) => {
    const state = get();
    const oldTransform = state.viewStates[view];
    const newTransform = { ...oldTransform, ...transform };

    if (executeCommand) {
      const command = new ChangeViewTransformCommand(
        oldTransform,
        newTransform,
        (newT) => {
          set((currentState) => ({
            viewStates: {
              ...currentState.viewStates,
              [view]: newT,
            },
          }));
        }
      );
      executeCommand(command);
    } else {
      // Fallback to direct execution if no history system available
      get().setViewTransform(view, transform);
    }
  },

  setTransitioning: (transitioning: boolean) => {
    set({ isTransitioning: transitioning });
  },

  resetView: () => {
    set({
      currentView: 'plan',
      viewStates: DEFAULT_VIEW_TRANSFORMS,
      isTransitioning: false,
      layerVisibility: DEFAULT_LAYER_VISIBILITY,
    });
  },

  toggleLayerVisibility: (view: ViewType2D, layer: string) => {
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [view]: {
          ...state.layerVisibility[view],
          [layer]: !state.layerVisibility[view][layer],
        },
      },
    }));
  },

  toggleLayerVisibilityWithHistory: (view: ViewType2D, layer: string) => {
    const state = get();
    const oldVisibility = state.layerVisibility[view][layer];
    const newVisibility = !oldVisibility;

    return (executeCommand?: (command: Command) => void) => {
      if (executeCommand) {
        const command = new ToggleLayerVisibilityCommand(
          view,
          layer,
          oldVisibility,
          newVisibility,
          (targetView: ViewType2D, targetLayer: string, visible: boolean) => {
            set((currentState) => ({
              layerVisibility: {
                ...currentState.layerVisibility,
                [targetView]: {
                  ...currentState.layerVisibility[targetView],
                  [targetLayer]: visible,
                },
              },
            }));
          }
        );
        executeCommand(command);
      } else {
        set((currentState) => ({
          layerVisibility: {
            ...currentState.layerVisibility,
            [view]: {
              ...currentState.layerVisibility[view],
              [layer]: newVisibility,
            },
          },
        }));
      }
    };
  },

  setLayerVisibility: (view: ViewType2D, layer: string, visible: boolean) => {
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [view]: {
          ...state.layerVisibility[view],
          [layer]: visible,
        },
      },
    }));
  },
}));
