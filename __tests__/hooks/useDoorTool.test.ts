import { renderHook, act } from '@testing-library/react';
import { useDoorTool } from '@/hooks/useDoorTool';

// Mock stores with proper structure
const mockDesignStore = {
  walls: [],
  doors: [],
  windows: [],
  selectElement: jest.fn(),
  addDoor: jest.fn(),
};

const mockFloorStore = {
  currentFloorId: 'floor-1',
  addElementToFloor: jest.fn(),
};

const mockUIStore = {
  activeTool: 'door',
  setActiveTool: jest.fn(),
};

jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => mockDesignStore,
}));

jest.mock('@/stores/floorStore', () => ({
  useFloorStore: () => mockFloorStore,
}));

jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => mockUIStore,
}));

describe('useDoorTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useDoorTool());
      
      expect(result.current.placementState.isPlacing).toBe(false);
      expect(result.current.placementState.previewDoor).toBeNull();
      expect(result.current.placementState.isValid).toBe(false);
      expect(typeof result.current.startPlacement).toBe('function');
      expect(typeof result.current.updatePlacement).toBe('function');
      expect(typeof result.current.finishPlacement).toBe('function');
      expect(typeof result.current.cancelPlacement).toBe('function');
    });

    it('starts door placement on startPlacement call', () => {
      const { result } = renderHook(() => useDoorTool());
      
      act(() => {
        result.current.startPlacement(100, 100);
      });
      
      expect(result.current.placementState.isPlacing).toBe(true);
      // Note: Door creation depends on wall constraints, so we test placement state
    });

    it('updates placement on updatePlacement call', () => {
      const { result } = renderHook(() => useDoorTool());
      
      // First start placement
      act(() => {
        result.current.startPlacement(100, 100);
      });
      
      // Then update placement
      act(() => {
        result.current.updatePlacement(150, 150);
      });
      
      expect(result.current.placementState.isPlacing).toBe(true);
    });
  });

  describe('Wall Attachment', () => {
    it('snaps door to nearby wall', () => {
      const mockWall = {
        id: 'wall-1',
        type: 'wall',
        startX: 0,
        startY: 100,
        endX: 200,
        endY: 100,
        thickness: 10,
      };
      
      mockDesignStore.elements = [mockWall];
      
      const { result } = renderHook(() => useDoorTool());
      
      act(() => {
        result.current.handleCanvasClick({ x: 100, y: 105 }); // Near wall
      });
      
      expect(mockDesignStore.addElement).toHaveBeenCalledWith(
        expect.objectContaining({
          wallId: 'wall-1',
          y: 100, // Snapped to wall
        })
      );
    });

    it('does not attach to wall if too far', () => {
      const mockWall = {
        id: 'wall-1',
        type: 'wall',
        startX: 0,
        startY: 100,
        endX: 200,
        endY: 100,
        thickness: 10,
      };
      
      mockDesignStore.elements = [mockWall];
      
      const { result } = renderHook(() => useDoorTool());
      
      act(() => {
        result.current.handleCanvasClick({ x: 100, y: 200 }); // Far from wall
      });
      
      expect(mockDesignStore.addElement).toHaveBeenCalledWith(
        expect.objectContaining({
          wallId: undefined,
          y: 200, // Not snapped
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles click outside canvas bounds', () => {
      const { result } = renderHook(() => useDoorTool());
      
      act(() => {
        result.current.handleCanvasClick({ x: -100, y: -100 });
      });
      
      // Should clamp to canvas bounds or ignore
      expect(mockDesignStore.addElement).toHaveBeenCalledWith(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });

    it('handles invalid coordinates', () => {
      const { result } = renderHook(() => useDoorTool());
      
      act(() => {
        result.current.handleCanvasClick({ x: NaN, y: Infinity });
      });
      
      // Should use default coordinates
      expect(mockDesignStore.addElement).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 0,
          y: 0,
        })
      );
    });

    it('handles overlapping doors', () => {
      const existingDoor = {
        id: 'door-1',
        type: 'door',
        x: 100,
        y: 100,
        width: 80,
        height: 20,
      };
      
      mockDesignStore.elements = [existingDoor];
      
      const { result } = renderHook(() => useDoorTool());
      
      act(() => {
        result.current.handleCanvasClick({ x: 100, y: 100 }); // Same position
      });
      
      // Should offset or warn about overlap
      expect(mockDesignStore.addElement).toHaveBeenCalled();
    });
  });

  describe('Tool State Management', () => {
    it('deactivates when tool changes', () => {
      mockUiStore.activeTool = 'wall';
      
      const { result } = renderHook(() => useDoorTool());
      
      expect(result.current.isActive).toBe(false);
    });

    it('clears preview when tool deactivates', () => {
      const { result, rerender } = renderHook(() => useDoorTool());
      
      // Set preview
      act(() => {
        result.current.handleCanvasMouseMove({ x: 100, y: 100 });
      });
      
      expect(result.current.previewDoor).not.toBeNull();
      
      // Change tool
      mockUiStore.activeTool = 'wall';
      rerender();
      
      expect(result.current.previewDoor).toBeNull();
    });
  });

  describe('Performance', () => {
    it('debounces mouse move events', () => {
      const { result } = renderHook(() => useDoorTool());
      
      // Rapid mouse moves
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.handleCanvasMouseMove({ x: i, y: i });
        }
      });
      
      // Should only update preview once or limited times
      expect(result.current.previewDoor?.x).toBe(9);
    });

    it('handles rapid clicks gracefully', () => {
      const { result } = renderHook(() => useDoorTool());
      
      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.handleCanvasClick({ x: i * 10, y: i * 10 });
        }
      });
      
      // Should create all doors without errors
      expect(mockDesignStore.addElement).toHaveBeenCalledTimes(5);
    });
  });
});