import { act, renderHook } from '@testing-library/react';
import { useViewStore } from '@/stores/viewStore';

describe('ViewStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useViewStore.setState({
        currentView: 'plan',
        zoom: 1,
        panX: 0,
        panY: 0,
        showGrid: true,
        gridSize: 20,
        snapToGrid: true,
        showMeasurements: true,
        showDimensions: false,
        viewportWidth: 800,
        viewportHeight: 600,
      });
    });
  });

  describe('Initial State', () => {
    it('should have correct default values', () => {
      const state = useViewStore.getState();
      
      expect(state.currentView).toBe('plan');
      expect(state.zoom).toBe(1);
      expect(state.panX).toBe(0);
      expect(state.panY).toBe(0);
      expect(state.showGrid).toBe(true);
      expect(state.gridSize).toBe(20);
      expect(state.snapToGrid).toBe(true);
      expect(state.showMeasurements).toBe(true);
      expect(state.showDimensions).toBe(false);
      expect(state.viewportWidth).toBe(800);
      expect(state.viewportHeight).toBe(600);
    });
  });

  describe('View Management', () => {
    it('should set current view', () => {
      act(() => {
        useViewStore.getState().setCurrentView('elevation');
      });

      const state = useViewStore.getState();
      expect(state.currentView).toBe('elevation');
    });

    it('should switch between different views', () => {
      const views = ['plan', 'elevation', '3d'] as const;
      
      views.forEach(view => {
        act(() => {
          useViewStore.getState().setCurrentView(view);
        });

        const state = useViewStore.getState();
        expect(state.currentView).toBe(view);
      });
    });
  });

  describe('Zoom Controls', () => {
    it('should set zoom level', () => {
      act(() => {
        useViewStore.getState().setZoom(1.5);
      });

      const state = useViewStore.getState();
      expect(state.zoom).toBe(1.5);
    });

    it('should zoom in', () => {
      act(() => {
        useViewStore.getState().zoomIn();
      });

      const state = useViewStore.getState();
      expect(state.zoom).toBeGreaterThan(1);
    });

    it('should zoom out', () => {
      act(() => {
        useViewStore.getState().setZoom(2);
        useViewStore.getState().zoomOut();
      });

      const state = useViewStore.getState();
      expect(state.zoom).toBeLessThan(2);
    });

    it('should reset zoom', () => {
      act(() => {
        useViewStore.getState().setZoom(3);
        useViewStore.getState().resetZoom();
      });

      const state = useViewStore.getState();
      expect(state.zoom).toBe(1);
    });

    it('should clamp zoom to reasonable bounds', () => {
      act(() => {
        useViewStore.getState().setZoom(0.01); // Very small
      });

      let state = useViewStore.getState();
      expect(state.zoom).toBeGreaterThanOrEqual(0.1);

      act(() => {
        useViewStore.getState().setZoom(100); // Very large
      });

      state = useViewStore.getState();
      expect(state.zoom).toBeLessThanOrEqual(10);
    });
  });

  describe('Pan Controls', () => {
    it('should set pan position', () => {
      act(() => {
        useViewStore.getState().setPan(100, 200);
      });

      const state = useViewStore.getState();
      expect(state.panX).toBe(100);
      expect(state.panY).toBe(200);
    });

    it('should pan by delta', () => {
      act(() => {
        useViewStore.getState().setPan(50, 75);
        useViewStore.getState().panBy(25, 50);
      });

      const state = useViewStore.getState();
      expect(state.panX).toBe(75);
      expect(state.panY).toBe(125);
    });

    it('should reset pan', () => {
      act(() => {
        useViewStore.getState().setPan(100, 200);
        useViewStore.getState().resetPan();
      });

      const state = useViewStore.getState();
      expect(state.panX).toBe(0);
      expect(state.panY).toBe(0);
    });

    it('should center view', () => {
      act(() => {
        useViewStore.getState().centerView();
      });

      const state = useViewStore.getState();
      expect(state.panX).toBe(0);
      expect(state.panY).toBe(0);
      expect(state.zoom).toBe(1);
    });
  });

  describe('Grid Controls', () => {
    it('should toggle grid visibility', () => {
      act(() => {
        useViewStore.getState().toggleGrid();
      });

      let state = useViewStore.getState();
      expect(state.showGrid).toBe(false);

      act(() => {
        useViewStore.getState().toggleGrid();
      });

      state = useViewStore.getState();
      expect(state.showGrid).toBe(true);
    });

    it('should set grid size', () => {
      act(() => {
        useViewStore.getState().setGridSize(50);
      });

      const state = useViewStore.getState();
      expect(state.gridSize).toBe(50);
    });

    it('should clamp grid size to reasonable bounds', () => {
      act(() => {
        useViewStore.getState().setGridSize(1); // Very small
      });

      let state = useViewStore.getState();
      expect(state.gridSize).toBeGreaterThanOrEqual(5);

      act(() => {
        useViewStore.getState().setGridSize(1000); // Very large
      });

      state = useViewStore.getState();
      expect(state.gridSize).toBeLessThanOrEqual(200);
    });

    it('should toggle snap to grid', () => {
      act(() => {
        useViewStore.getState().toggleSnapToGrid();
      });

      let state = useViewStore.getState();
      expect(state.snapToGrid).toBe(false);

      act(() => {
        useViewStore.getState().toggleSnapToGrid();
      });

      state = useViewStore.getState();
      expect(state.snapToGrid).toBe(true);
    });
  });

  describe('Display Options', () => {
    it('should toggle measurements', () => {
      act(() => {
        useViewStore.getState().toggleMeasurements();
      });

      let state = useViewStore.getState();
      expect(state.showMeasurements).toBe(false);

      act(() => {
        useViewStore.getState().toggleMeasurements();
      });

      state = useViewStore.getState();
      expect(state.showMeasurements).toBe(true);
    });

    it('should toggle dimensions', () => {
      act(() => {
        useViewStore.getState().toggleDimensions();
      });

      let state = useViewStore.getState();
      expect(state.showDimensions).toBe(true);

      act(() => {
        useViewStore.getState().toggleDimensions();
      });

      state = useViewStore.getState();
      expect(state.showDimensions).toBe(false);
    });
  });

  describe('Viewport Management', () => {
    it('should set viewport size', () => {
      act(() => {
        useViewStore.getState().setViewportSize(1200, 900);
      });

      const state = useViewStore.getState();
      expect(state.viewportWidth).toBe(1200);
      expect(state.viewportHeight).toBe(900);
    });

    it('should handle viewport resize', () => {
      act(() => {
        useViewStore.getState().setViewportSize(1920, 1080);
      });

      const state = useViewStore.getState();
      expect(state.viewportWidth).toBe(1920);
      expect(state.viewportHeight).toBe(1080);
    });
  });

  describe('Complex View Operations', () => {
    it('should handle zoom and pan together', () => {
      act(() => {
        useViewStore.getState().setZoom(2);
        useViewStore.getState().setPan(100, 150);
      });

      const state = useViewStore.getState();
      expect(state.zoom).toBe(2);
      expect(state.panX).toBe(100);
      expect(state.panY).toBe(150);
    });

    it('should reset view completely', () => {
      act(() => {
        useViewStore.getState().setZoom(3);
        useViewStore.getState().setPan(200, 300);
        useViewStore.getState().setGridSize(100);
        useViewStore.getState().toggleGrid();
        useViewStore.getState().resetView();
      });

      const state = useViewStore.getState();
      expect(state.zoom).toBe(1);
      expect(state.panX).toBe(0);
      expect(state.panY).toBe(0);
      // Grid settings should remain as they were set by user
    });

    it('should fit content to view', () => {
      const bounds = { minX: -100, minY: -50, maxX: 200, maxY: 150 };
      
      act(() => {
        useViewStore.getState().fitToView(bounds);
      });

      const state = useViewStore.getState();
      expect(state.zoom).toBeGreaterThan(0);
      expect(state.zoom).toBeLessThanOrEqual(10);
      // Pan should be adjusted to center the content
    });
  });

  describe('View Utilities', () => {
    it('should convert screen to world coordinates', () => {
      act(() => {
        useViewStore.getState().setZoom(2);
        useViewStore.getState().setPan(50, 100);
      });

      const worldCoords = useViewStore.getState().screenToWorld(100, 200);
      expect(typeof worldCoords.x).toBe('number');
      expect(typeof worldCoords.y).toBe('number');
    });

    it('should convert world to screen coordinates', () => {
      act(() => {
        useViewStore.getState().setZoom(2);
        useViewStore.getState().setPan(50, 100);
      });

      const screenCoords = useViewStore.getState().worldToScreen(100, 200);
      expect(typeof screenCoords.x).toBe('number');
      expect(typeof screenCoords.y).toBe('number');
    });

    it('should get visible bounds', () => {
      const bounds = useViewStore.getState().getVisibleBounds();
      expect(bounds).toHaveProperty('minX');
      expect(bounds).toHaveProperty('minY');
      expect(bounds).toHaveProperty('maxX');
      expect(bounds).toHaveProperty('maxY');
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative zoom values', () => {
      act(() => {
        useViewStore.getState().setZoom(-1);
      });

      const state = useViewStore.getState();
      expect(state.zoom).toBeGreaterThan(0);
    });

    it('should handle zero viewport size', () => {
      act(() => {
        useViewStore.getState().setViewportSize(0, 0);
      });

      const state = useViewStore.getState();
      expect(state.viewportWidth).toBeGreaterThan(0);
      expect(state.viewportHeight).toBeGreaterThan(0);
    });

    it('should handle rapid view changes', () => {
      expect(() => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            useViewStore.getState().setZoom(Math.random() * 5 + 0.5);
            useViewStore.getState().setPan(Math.random() * 1000 - 500, Math.random() * 1000 - 500);
            useViewStore.getState().toggleGrid();
          }
        });
      }).not.toThrow();
    });

    it('should maintain state consistency', () => {
      act(() => {
        useViewStore.getState().setCurrentView('elevation');
        useViewStore.getState().setZoom(2.5);
        useViewStore.getState().setPan(150, 250);
        useViewStore.getState().setGridSize(30);
        useViewStore.getState().toggleMeasurements();
      });

      const state = useViewStore.getState();
      expect(state.currentView).toBe('elevation');
      expect(state.zoom).toBe(2.5);
      expect(state.panX).toBe(150);
      expect(state.panY).toBe(250);
      expect(state.gridSize).toBe(30);
      expect(state.showMeasurements).toBe(false);
    });
  });
});