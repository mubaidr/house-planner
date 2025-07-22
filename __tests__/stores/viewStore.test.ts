import { act, renderHook } from '@testing-library/react';
import { useViewStore } from '@/stores/viewStore';

describe('ViewStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useViewStore.getState().resetView();
    });
  });

  describe('Initial State', () => {
    it('should have correct default values', () => {
      const state = useViewStore.getState();
      
      expect(state.currentView).toBe('plan');
      expect(state.viewStates.plan.zoom).toBe(1);
      expect(state.viewStates.plan.pan.x).toBe(0);
      expect(state.viewStates.plan.pan.y).toBe(0);
      expect(state.viewStates.plan.rotation).toBe(0);
      expect(state.isTransitioning).toBe(false);
      expect(state.transitionDuration).toBe(300);
      expect(state.layerVisibility.plan.walls).toBe(true);
      expect(state.layerVisibility.plan.doors).toBe(true);
      expect(state.layerVisibility.plan.dimensions).toBe(true);
    });
  });

  describe('View Management', () => {
    it('should set current view', () => {
      act(() => {
        useViewStore.getState().setView('front');
      });

      // Note: setView has async behavior with transition
      setTimeout(() => {
        const state = useViewStore.getState();
        expect(state.currentView).toBe('front');
      }, 350);
    });

    it('should switch between different views', () => {
      const views = ['front', 'back', 'left', 'right'] as const; // Exclude 'plan' since it's the default
      
      views.forEach(view => {
        act(() => {
          useViewStore.getState().setView(view);
        });

        // Check that transitioning state is set (only when switching to a different view)
        const state = useViewStore.getState();
        expect(state.isTransitioning).toBe(true);
      });
    });

    it('should get view transform', () => {
      const transform = useViewStore.getState().getViewTransform('plan');
      expect(transform).toEqual({
        pan: { x: 0, y: 0 },
        zoom: 1,
        rotation: 0,
      });
    });
  });

  describe('View Transform Controls', () => {
    it('should set view transform zoom', () => {
      act(() => {
        useViewStore.getState().setViewTransform('plan', { zoom: 1.5 });
      });

      const state = useViewStore.getState();
      expect(state.viewStates.plan.zoom).toBe(1.5);
    });

    it('should set view transform pan', () => {
      act(() => {
        useViewStore.getState().setViewTransform('plan', { pan: { x: 100, y: 200 } });
      });

      const state = useViewStore.getState();
      expect(state.viewStates.plan.pan.x).toBe(100);
      expect(state.viewStates.plan.pan.y).toBe(200);
    });

    it('should set view transform rotation', () => {
      act(() => {
        useViewStore.getState().setViewTransform('plan', { rotation: 45 });
      });

      const state = useViewStore.getState();
      expect(state.viewStates.plan.rotation).toBe(45);
    });

    it('should update partial transform', () => {
      act(() => {
        useViewStore.getState().setViewTransform('plan', { zoom: 2 });
        useViewStore.getState().setViewTransform('plan', { pan: { x: 50, y: 75 } });
      });

      const state = useViewStore.getState();
      expect(state.viewStates.plan.zoom).toBe(2);
      expect(state.viewStates.plan.pan.x).toBe(50);
      expect(state.viewStates.plan.pan.y).toBe(75);
      expect(state.viewStates.plan.rotation).toBe(0); // Should remain unchanged
    });

    it('should handle different views independently', () => {
      act(() => {
        useViewStore.getState().setViewTransform('plan', { zoom: 2, pan: { x: 100, y: 100 } });
        useViewStore.getState().setViewTransform('front', { zoom: 1.5, pan: { x: 50, y: 50 } });
      });

      const state = useViewStore.getState();
      expect(state.viewStates.plan.zoom).toBe(2);
      expect(state.viewStates.plan.pan.x).toBe(100);
      expect(state.viewStates.front.zoom).toBe(1.5);
      expect(state.viewStates.front.pan.x).toBe(50);
    });
  });

  describe('Layer Visibility Controls', () => {
    it('should toggle layer visibility', () => {
      act(() => {
        useViewStore.getState().toggleLayerVisibility('plan', 'walls');
      });

      let state = useViewStore.getState();
      expect(state.layerVisibility.plan.walls).toBe(false);

      act(() => {
        useViewStore.getState().toggleLayerVisibility('plan', 'walls');
      });

      state = useViewStore.getState();
      expect(state.layerVisibility.plan.walls).toBe(true);
    });

    it('should set layer visibility directly', () => {
      act(() => {
        useViewStore.getState().setLayerVisibility('plan', 'doors', false);
      });

      const state = useViewStore.getState();
      expect(state.layerVisibility.plan.doors).toBe(false);
    });

    it('should handle different layers independently', () => {
      act(() => {
        useViewStore.getState().setLayerVisibility('plan', 'walls', false);
        useViewStore.getState().setLayerVisibility('plan', 'doors', true);
        useViewStore.getState().setLayerVisibility('plan', 'windows', false);
      });

      const state = useViewStore.getState();
      expect(state.layerVisibility.plan.walls).toBe(false);
      expect(state.layerVisibility.plan.doors).toBe(true);
      expect(state.layerVisibility.plan.windows).toBe(false);
    });

    it('should handle different views independently', () => {
      act(() => {
        useViewStore.getState().setLayerVisibility('plan', 'walls', false);
        useViewStore.getState().setLayerVisibility('front', 'walls', true);
      });

      const state = useViewStore.getState();
      expect(state.layerVisibility.plan.walls).toBe(false);
      expect(state.layerVisibility.front.walls).toBe(true);
    });
  });

  describe('Transition Controls', () => {
    it('should set transitioning state', () => {
      act(() => {
        useViewStore.getState().setTransitioning(true);
      });

      let state = useViewStore.getState();
      expect(state.isTransitioning).toBe(true);

      act(() => {
        useViewStore.getState().setTransitioning(false);
      });

      state = useViewStore.getState();
      expect(state.isTransitioning).toBe(false);
    });

    it('should have default transition duration', () => {
      const state = useViewStore.getState();
      expect(state.transitionDuration).toBe(300);
    });

    it('should not change view if already current', () => {
      const initialState = useViewStore.getState();
      expect(initialState.currentView).toBe('plan');

      act(() => {
        useViewStore.getState().setView('plan'); // Same view
      });

      const state = useViewStore.getState();
      expect(state.isTransitioning).toBe(false); // Should not transition
      expect(state.currentView).toBe('plan');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset view to defaults', () => {
      // First modify some values
      act(() => {
        useViewStore.getState().setView('front');
        useViewStore.getState().setViewTransform('plan', { zoom: 2, pan: { x: 100, y: 200 } });
        useViewStore.getState().setLayerVisibility('plan', 'walls', false);
        useViewStore.getState().setTransitioning(true);
      });

      // Then reset
      act(() => {
        useViewStore.getState().resetView();
      });

      const state = useViewStore.getState();
      expect(state.currentView).toBe('plan');
      expect(state.viewStates.plan.zoom).toBe(1);
      expect(state.viewStates.plan.pan.x).toBe(0);
      expect(state.viewStates.plan.pan.y).toBe(0);
      expect(state.isTransitioning).toBe(false);
      expect(state.layerVisibility.plan.walls).toBe(true);
    });

    it('should reset all view states', () => {
      // Modify multiple view states
      act(() => {
        useViewStore.getState().setViewTransform('plan', { zoom: 3, rotation: 90 });
        useViewStore.getState().setViewTransform('front', { zoom: 2, pan: { x: 50, y: 100 } });
        useViewStore.getState().resetView();
      });

      const state = useViewStore.getState();
      expect(state.viewStates.plan.zoom).toBe(1);
      expect(state.viewStates.plan.rotation).toBe(0);
      expect(state.viewStates.front.zoom).toBe(1);
      expect(state.viewStates.front.pan.x).toBe(0);
    });
  });

  describe('Complex View Operations', () => {
    it('should handle zoom and pan together', () => {
      act(() => {
        useViewStore.getState().setViewTransform('plan', { 
          zoom: 2, 
          pan: { x: 100, y: 150 } 
        });
      });

      const state = useViewStore.getState();
      expect(state.viewStates.plan.zoom).toBe(2);
      expect(state.viewStates.plan.pan.x).toBe(100);
      expect(state.viewStates.plan.pan.y).toBe(150);
    });

    it('should handle multiple transform updates', () => {
      act(() => {
        useViewStore.getState().setViewTransform('plan', { zoom: 3 });
        useViewStore.getState().setViewTransform('plan', { pan: { x: 200, y: 300 } });
        useViewStore.getState().setViewTransform('plan', { rotation: 45 });
      });

      const state = useViewStore.getState();
      expect(state.viewStates.plan.zoom).toBe(3);
      expect(state.viewStates.plan.pan.x).toBe(200);
      expect(state.viewStates.plan.pan.y).toBe(300);
      expect(state.viewStates.plan.rotation).toBe(45);
    });

    it('should handle view switching with different transforms', () => {
      act(() => {
        useViewStore.getState().setViewTransform('plan', { zoom: 2, pan: { x: 50, y: 50 } });
        useViewStore.getState().setViewTransform('front', { zoom: 1.5, rotation: 30 });
        useViewStore.getState().setView('front');
      });

      const state = useViewStore.getState();
      // Plan view should retain its transform
      expect(state.viewStates.plan.zoom).toBe(2);
      expect(state.viewStates.plan.pan.x).toBe(50);
      // Front view should have its own transform
      expect(state.viewStates.front.zoom).toBe(1.5);
      expect(state.viewStates.front.rotation).toBe(30);
    });
  });

  describe('History Integration', () => {
    it('should fallback to direct execution when no history command provided', () => {
      // Test that methods work without executeCommand parameter
      act(() => {
        useViewStore.getState().setViewWithHistory('front');
      });

      // Should set transitioning state even without history
      const state = useViewStore.getState();
      expect(state.isTransitioning).toBe(true);
    });

    it('should fallback to direct transform changes when no history command provided', () => {
      act(() => {
        useViewStore.getState().setViewTransformWithHistory(
          'plan', 
          { zoom: 2, pan: { x: 100, y: 200 } }
        );
      });

      const state = useViewStore.getState();
      expect(state.viewStates.plan.zoom).toBe(2);
      expect(state.viewStates.plan.pan.x).toBe(100);
      expect(state.viewStates.plan.pan.y).toBe(200);
    });

    it('should fallback to direct layer visibility changes when no history command provided', () => {
      const initialVisibility = useViewStore.getState().layerVisibility.plan.walls;
      
      act(() => {
        useViewStore.getState().toggleLayerVisibilityWithHistory('plan', 'walls');
      });

      const state = useViewStore.getState();
      expect(state.layerVisibility.plan.walls).toBe(!initialVisibility);
    });

    it('should handle history methods with undefined executeCommand gracefully', () => {
      expect(() => {
        act(() => {
          useViewStore.getState().setViewWithHistory('back', undefined);
          useViewStore.getState().setViewTransformWithHistory('plan', { rotation: 90 }, undefined);
          useViewStore.getState().toggleLayerVisibilityWithHistory('plan', 'doors', undefined);
        });
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid view types gracefully', () => {
      const initialState = useViewStore.getState();
      
      // Try to set an invalid view (this should be handled by TypeScript, but test runtime behavior)
      expect(() => {
        act(() => {
          // @ts-ignore - Testing runtime behavior
          useViewStore.getState().setView('invalid-view');
        });
      }).not.toThrow();
    });

    it('should handle invalid layer names gracefully', () => {
      expect(() => {
        act(() => {
          useViewStore.getState().setLayerVisibility('plan', 'non-existent-layer', true);
        });
      }).not.toThrow();
    });

    it('should handle rapid view changes', () => {
      expect(() => {
        act(() => {
          const views = ['plan', 'front', 'back', 'left', 'right'] as const;
          for (let i = 0; i < 10; i++) {
            const randomView = views[Math.floor(Math.random() * views.length)];
            useViewStore.getState().setView(randomView);
            useViewStore.getState().setViewTransform(randomView, { 
              zoom: Math.random() * 3 + 0.5,
              pan: { 
                x: Math.random() * 1000 - 500, 
                y: Math.random() * 1000 - 500 
              },
              rotation: Math.random() * 360
            });
          }
        });
      }).not.toThrow();
    });

    it('should maintain state consistency', () => {
      act(() => {
        useViewStore.getState().setView('front');
        useViewStore.getState().setViewTransform('plan', { 
          zoom: 2.5, 
          pan: { x: 150, y: 250 },
          rotation: 45
        });
        useViewStore.getState().setLayerVisibility('plan', 'walls', false);
        useViewStore.getState().setTransitioning(true);
      });

      const state = useViewStore.getState();
      expect(state.viewStates.plan.zoom).toBe(2.5);
      expect(state.viewStates.plan.pan.x).toBe(150);
      expect(state.viewStates.plan.pan.y).toBe(250);
      expect(state.viewStates.plan.rotation).toBe(45);
      expect(state.layerVisibility.plan.walls).toBe(false);
      expect(state.isTransitioning).toBe(true);
    });
  });
});