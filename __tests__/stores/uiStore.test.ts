import { act } from 'react-dom/test-utils';
import { useUIStore, Tool } from '../../src/stores/uiStore';

describe('uiStore - Comprehensive Tests', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useUIStore.setState({
        activeTool: 'select',
        showGrid: true,
        snapToGrid: true,
        gridSize: 20,
        zoomLevel: 1,
        canvasWidth: 800,
        canvasHeight: 600,
        sidebarCollapsed: false,
        propertiesPanelCollapsed: false,
        mouseCoordinates: { x: 0, y: 0 },
        showRooms: true,
        isExportDialogOpen: false,
        isImportDialogOpen: false,
        selectedSheet: null,
      });
    });
  });

  describe('Tool Management', () => {
    const tools: Tool[] = [
      'select', 'wall', 'door', 'window', 'stair', 'roof', 
      'measure', 'dimension', 'align', 'text-annotation', 
      'area-annotation', 'material-callout'
    ];

    tools.forEach(tool => {
      it(`should set active tool to ${tool}`, () => {
        act(() => {
          useUIStore.getState().setActiveTool(tool);
        });

        const state = useUIStore.getState();
        expect(state.activeTool).toBe(tool);
      });
    });

    it('should handle rapid tool switching', () => {
      act(() => {
        useUIStore.getState().setActiveTool('wall');
        useUIStore.getState().setActiveTool('door');
        useUIStore.getState().setActiveTool('select');
      });

      const state = useUIStore.getState();
      expect(state.activeTool).toBe('select');
    });
  });

  describe('Grid Management', () => {
    it('should toggle grid visibility', () => {
      const initialState = useUIStore.getState().showGrid;
      
      act(() => {
        useUIStore.getState().toggleGrid();
      });

      const state = useUIStore.getState();
      expect(state.showGrid).toBe(!initialState);
      expect(state.gridVisible).toBe(!initialState);
    });

    it('should toggle snap to grid', () => {
      const initialState = useUIStore.getState().snapToGrid;
      
      act(() => {
        useUIStore.getState().toggleSnapToGrid();
      });

      const state = useUIStore.getState();
      expect(state.snapToGrid).toBe(!initialState);
    });

    it('should set grid size', () => {
      act(() => {
        useUIStore.getState().setGridSize(30);
      });

      const state = useUIStore.getState();
      expect(state.gridSize).toBe(30);
    });

    it('should handle invalid grid sizes gracefully', () => {
      act(() => {
        useUIStore.getState().setGridSize(-10);
      });

      const state = useUIStore.getState();
      expect(state.gridSize).toBe(-10); // Store doesn't validate, component should
    });
  });

  describe('Zoom Management', () => {
    it('should set zoom level within bounds', () => {
      act(() => {
        useUIStore.getState().setZoomLevel(2.5);
      });

      const state = useUIStore.getState();
      expect(state.zoomLevel).toBe(2.5);
    });

    it('should clamp zoom level to minimum', () => {
      act(() => {
        useUIStore.getState().setZoomLevel(0.05);
      });

      const state = useUIStore.getState();
      expect(state.zoomLevel).toBe(0.1);
    });

    it('should clamp zoom level to maximum', () => {
      act(() => {
        useUIStore.getState().setZoomLevel(10);
      });

      const state = useUIStore.getState();
      expect(state.zoomLevel).toBe(5);
    });

    it('should handle edge case zoom values', () => {
      const testValues = [0.1, 0.5, 1, 2, 3, 4, 5];
      
      testValues.forEach(value => {
        act(() => {
          useUIStore.getState().setZoomLevel(value);
        });

        const state = useUIStore.getState();
        expect(state.zoomLevel).toBe(value);
      });
    });
  });

  describe('Canvas Size Management', () => {
    it('should set canvas size', () => {
      act(() => {
        useUIStore.getState().setCanvasSize(1200, 800);
      });

      const state = useUIStore.getState();
      expect(state.canvasWidth).toBe(1200);
      expect(state.canvasHeight).toBe(800);
    });

    it('should handle zero dimensions', () => {
      act(() => {
        useUIStore.getState().setCanvasSize(0, 0);
      });

      const state = useUIStore.getState();
      expect(state.canvasWidth).toBe(0);
      expect(state.canvasHeight).toBe(0);
    });

    it('should handle negative dimensions', () => {
      act(() => {
        useUIStore.getState().setCanvasSize(-100, -200);
      });

      const state = useUIStore.getState();
      expect(state.canvasWidth).toBe(-100);
      expect(state.canvasHeight).toBe(-200);
    });
  });

  describe('Panel Management', () => {
    it('should toggle sidebar', () => {
      const initialState = useUIStore.getState().sidebarCollapsed;
      
      act(() => {
        useUIStore.getState().toggleSidebar();
      });

      const state = useUIStore.getState();
      expect(state.sidebarCollapsed).toBe(!initialState);
    });

    it('should toggle properties panel', () => {
      const initialState = useUIStore.getState().propertiesPanelCollapsed;
      
      act(() => {
        useUIStore.getState().togglePropertiesPanel();
      });

      const state = useUIStore.getState();
      expect(state.propertiesPanelCollapsed).toBe(!initialState);
    });

    it('should handle multiple panel toggles', () => {
      act(() => {
        useUIStore.getState().toggleSidebar();
        useUIStore.getState().togglePropertiesPanel();
        useUIStore.getState().toggleSidebar();
      });

      const state = useUIStore.getState();
      expect(state.sidebarCollapsed).toBe(false); // Back to initial
      expect(state.propertiesPanelCollapsed).toBe(true); // Toggled once
    });
  });

  describe('Mouse Coordinates', () => {
    it('should set mouse coordinates', () => {
      act(() => {
        useUIStore.getState().setMouseCoordinates(150, 250);
      });

      const state = useUIStore.getState();
      expect(state.mouseCoordinates).toEqual({ x: 150, y: 250 });
    });

    it('should handle negative coordinates', () => {
      act(() => {
        useUIStore.getState().setMouseCoordinates(-50, -100);
      });

      const state = useUIStore.getState();
      expect(state.mouseCoordinates).toEqual({ x: -50, y: -100 });
    });

    it('should handle rapid coordinate updates', () => {
      act(() => {
        useUIStore.getState().setMouseCoordinates(10, 20);
        useUIStore.getState().setMouseCoordinates(30, 40);
        useUIStore.getState().setMouseCoordinates(50, 60);
      });

      const state = useUIStore.getState();
      expect(state.mouseCoordinates).toEqual({ x: 50, y: 60 });
    });
  });

  describe('Dialog Management', () => {
    it('should open export dialog', () => {
      act(() => {
        useUIStore.getState().setExportDialogOpen(true);
      });

      const state = useUIStore.getState();
      expect(state.isExportDialogOpen).toBe(true);
    });

    it('should close export dialog', () => {
      act(() => {
        useUIStore.getState().setExportDialogOpen(true);
        useUIStore.getState().setExportDialogOpen(false);
      });

      const state = useUIStore.getState();
      expect(state.isExportDialogOpen).toBe(false);
    });

    it('should open import dialog', () => {
      act(() => {
        useUIStore.getState().setImportDialogOpen(true);
      });

      const state = useUIStore.getState();
      expect(state.isImportDialogOpen).toBe(true);
    });

    it('should handle both dialogs simultaneously', () => {
      act(() => {
        useUIStore.getState().setExportDialogOpen(true);
        useUIStore.getState().setImportDialogOpen(true);
      });

      const state = useUIStore.getState();
      expect(state.isExportDialogOpen).toBe(true);
      expect(state.isImportDialogOpen).toBe(true);
    });
  });

  describe('Room Display', () => {
    it('should toggle room visibility', () => {
      const initialState = useUIStore.getState().showRooms;
      
      act(() => {
        useUIStore.getState().toggleRooms();
      });

      const state = useUIStore.getState();
      expect(state.showRooms).toBe(!initialState);
    });
  });

  describe('Sheet Selection', () => {
    const mockSheet = {
      id: 'sheet-1',
      name: 'Floor Plan 1',
      type: 'plan' as const,
      scale: 1,
      elements: [],
    };

    it('should set selected sheet', () => {
      act(() => {
        useUIStore.getState().setSelectedSheet(mockSheet);
      });

      const state = useUIStore.getState();
      expect(state.selectedSheet).toEqual(mockSheet);
    });

    it('should clear selected sheet', () => {
      act(() => {
        useUIStore.getState().setSelectedSheet(mockSheet);
        useUIStore.getState().setSelectedSheet(null);
      });

      const state = useUIStore.getState();
      expect(state.selectedSheet).toBeNull();
    });
  });

  describe('Computed Properties', () => {
    it('should compute gridVisible based on showGrid', () => {
      act(() => {
        useUIStore.getState().toggleGrid(); // Assuming starts true, becomes false
      });

      const state = useUIStore.getState();
      expect(state.gridVisible).toBe(state.showGrid);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined tool gracefully', () => {
      expect(() => {
        act(() => {
          // @ts-expect-error Testing edge case
          useUIStore.getState().setActiveTool(undefined);
        });
      }).not.toThrow();
    });

    it('should handle extreme zoom values', () => {
      const extremeValues = [Number.MIN_VALUE, Number.MAX_VALUE, Infinity, -Infinity];
      
      extremeValues.forEach(value => {
        act(() => {
          useUIStore.getState().setZoomLevel(value);
        });
        
        const state = useUIStore.getState();
        // Should be clamped to valid range
        expect(state.zoomLevel).toBeGreaterThanOrEqual(0.1);
        expect(state.zoomLevel).toBeLessThanOrEqual(5);
      });
    });

    it('should handle NaN values in coordinates', () => {
      act(() => {
        useUIStore.getState().setMouseCoordinates(NaN, NaN);
      });

      const state = useUIStore.getState();
      expect(state.mouseCoordinates.x).toBeNaN();
      expect(state.mouseCoordinates.y).toBeNaN();
    });
  });
});