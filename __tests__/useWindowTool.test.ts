import { renderHook, act } from '@testing-library/react';
import { useWindowTool } from '@/hooks/useWindowTool';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useUIStore } from '@/stores/uiStore';
import { canPlaceWindow } from '@/utils/wallConstraints';
import { Window } from '@/types/elements/Window';

// Mock dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');
jest.mock('@/stores/uiStore');
jest.mock('@/utils/wallConstraints');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseFloorStore = useFloorStore as jest.MockedFunction<typeof useFloorStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;
const mockCanPlaceWindow = canPlaceWindow as jest.MockedFunction<typeof canPlaceWindow>;

describe('useWindowTool', () => {
  // Mock store functions
  const mockSelectElement = jest.fn();
  const mockAddElementToFloor = jest.fn();
  const mockSetActiveTool = jest.fn();

  // Mock data
  const mockWalls = [
    { id: 'wall-1', x1: 0, y1: 0, x2: 100, y2: 0 },
    { id: 'wall-2', x1: 100, y1: 0, x2: 100, y2: 100 },
  ];
  const mockDoors = [
    { id: 'door-1', x: 50, y: 0, wallId: 'wall-1' },
  ];
  const mockWindows = [
    { id: 'window-1', x: 25, y: 0, wallId: 'wall-1' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: mockDoors,
      windows: mockWindows,
      selectElement: mockSelectElement,
    } as any);

    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor-1',
      addElementToFloor: mockAddElementToFloor,
    } as any);

    mockUseUIStore.mockReturnValue({
      activeTool: 'window',
      setActiveTool: mockSetActiveTool,
    } as any);
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useWindowTool());

      expect(result.current.placementState).toEqual({
        isPlacing: false,
        previewWindow: null,
        constraintResult: null,
        isValid: false,
      });
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useWindowTool());

      expect(typeof result.current.startPlacement).toBe('function');
      expect(typeof result.current.updatePlacement).toBe('function');
      expect(typeof result.current.finishPlacement).toBe('function');
      expect(typeof result.current.cancelPlacement).toBe('function');
    });
  });

  describe('startPlacement', () => {
    it('should start placement when tool is active and position is valid', () => {
      const mockConstraintResult = {
        isValid: true,
        wallId: 'wall-1',
        position: { x: 75, y: 0 },
        wallSegment: { angle: 0 },
      };

      mockCanPlaceWindow.mockReturnValue(mockConstraintResult);

      const { result } = renderHook(() => useWindowTool());

      act(() => {
        result.current.startPlacement(75, 0);
      });

      expect(mockCanPlaceWindow).toHaveBeenCalledWith(
        { x: 75, y: 0 },
        100, // Default window width
        mockWalls,
        mockDoors,
        mockWindows
      );

      expect(result.current.placementState.isPlacing).toBe(true);
      expect(result.current.placementState.isValid).toBe(true);
      expect(result.current.placementState.previewWindow).toMatchObject({
        x: 75,
        y: 0,
        width: 100,
        height: 80,
        wallId: 'wall-1',
        wallAngle: 0,
        style: 'single',
        color: '#4A90E2',
        opacity: 0.7,
      });
    });

    it('should handle invalid placement position', () => {
      const mockConstraintResult = {
        isValid: false,
        wallId: null,
        position: { x: 200, y: 200 },
      };

      mockCanPlaceWindow.mockReturnValue(mockConstraintResult);

      const { result } = renderHook(() => useWindowTool());

      act(() => {
        result.current.startPlacement(200, 200);
      });

      expect(result.current.placementState.isPlacing).toBe(true);
      expect(result.current.placementState.isValid).toBe(false);
      expect(result.current.placementState.previewWindow).toBe(null);
    });

    it('should not start placement when tool is not active', () => {
      mockUseUIStore.mockReturnValue({
        activeTool: 'select',
        setActiveTool: mockSetActiveTool,
      } as any);

      const { result } = renderHook(() => useWindowTool());

      act(() => {
        result.current.startPlacement(75, 0);
      });

      expect(mockCanPlaceWindow).not.toHaveBeenCalled();
      expect(result.current.placementState.isPlacing).toBe(false);
    });

    it('should accept custom window options', () => {
      const mockConstraintResult = {
        isValid: true,
        wallId: 'wall-1',
        position: { x: 75, y: 0 },
        wallSegment: { angle: 0 },
      };

      mockCanPlaceWindow.mockReturnValue(mockConstraintResult);

      const { result } = renderHook(() => useWindowTool());

      const customOptions = {
        style: 'double' as const,
        material: 'glass',
        color: '#FF0000',
        opacity: 0.5,
      };

      act(() => {
        result.current.startPlacement(75, 0, customOptions);
      });

      expect(result.current.placementState.previewWindow).toMatchObject({
        style: 'double',
        material: 'glass',
        color: '#FF0000',
        opacity: 0.5,
      });
    });
  });

  describe('updatePlacement', () => {
    beforeEach(() => {
      // Setup initial placement state
      const mockConstraintResult = {
        isValid: true,
        wallId: 'wall-1',
        position: { x: 75, y: 0 },
        wallSegment: { angle: 0 },
      };
      mockCanPlaceWindow.mockReturnValue(mockConstraintResult);
    });

    it('should update placement position when placing', () => {
      const { result } = renderHook(() => useWindowTool());

      // Start placement first
      act(() => {
        result.current.startPlacement(75, 0);
      });

      // Update to new position
      const newConstraintResult = {
        isValid: true,
        wallId: 'wall-2',
        position: { x: 100, y: 50 },
        wallSegment: { angle: 90 },
      };
      mockCanPlaceWindow.mockReturnValue(newConstraintResult);

      act(() => {
        result.current.updatePlacement(100, 50);
      });

      expect(result.current.placementState.previewWindow).toMatchObject({
        x: 100,
        y: 50,
        wallId: 'wall-2',
        wallAngle: 90,
      });
    });

    it('should not update when not placing', () => {
      const { result } = renderHook(() => useWindowTool());

      act(() => {
        result.current.updatePlacement(100, 50);
      });

      expect(mockCanPlaceWindow).not.toHaveBeenCalled();
    });

    it('should not update when tool is not active', () => {
      mockUseUIStore.mockReturnValue({
        activeTool: 'select',
        setActiveTool: mockSetActiveTool,
      } as any);

      const { result } = renderHook(() => useWindowTool());

      act(() => {
        result.current.updatePlacement(100, 50);
      });

      expect(mockCanPlaceWindow).not.toHaveBeenCalled();
    });

    it('should handle invalid update position', () => {
      const { result } = renderHook(() => useWindowTool());

      // Start placement first
      act(() => {
        result.current.startPlacement(75, 0);
      });

      // Update to invalid position
      const invalidConstraintResult = {
        isValid: false,
        wallId: null,
        position: { x: 200, y: 200 },
      };
      mockCanPlaceWindow.mockReturnValue(invalidConstraintResult);

      act(() => {
        result.current.updatePlacement(200, 200);
      });

      expect(result.current.placementState.isValid).toBe(false);
      expect(result.current.placementState.previewWindow).toBe(null);
    });
  });

  describe('finishPlacement', () => {
    it('should finish placement and add window to floor', () => {
      const mockConstraintResult = {
        isValid: true,
        wallId: 'wall-1',
        position: { x: 75, y: 0 },
        wallSegment: { angle: 0 },
      };
      mockCanPlaceWindow.mockReturnValue(mockConstraintResult);

      const { result } = renderHook(() => useWindowTool());

      // Start placement first
      act(() => {
        result.current.startPlacement(75, 0);
      });

      // Finish placement
      act(() => {
        result.current.finishPlacement();
      });

      expect(mockAddElementToFloor).toHaveBeenCalledWith(
        'floor-1',
        'windows',
        expect.objectContaining({
          x: 75,
          y: 0,
          width: 100,
          height: 80,
          wallId: 'wall-1',
        })
      );

      expect(mockSetActiveTool).toHaveBeenCalledWith('select');
      expect(mockSelectElement).toHaveBeenCalledWith(
        expect.stringMatching(/^window-\d+$/),
        'window'
      );

      expect(result.current.placementState.isPlacing).toBe(false);
      expect(result.current.placementState.previewWindow).toBe(null);
    });

    it('should not finish placement when not placing', () => {
      const { result } = renderHook(() => useWindowTool());

      act(() => {
        result.current.finishPlacement();
      });

      expect(mockAddElementToFloor).not.toHaveBeenCalled();
      expect(mockSetActiveTool).not.toHaveBeenCalled();
      expect(mockSelectElement).not.toHaveBeenCalled();
    });

    it('should not finish placement when position is invalid', () => {
      const mockConstraintResult = {
        isValid: false,
        wallId: null,
        position: { x: 200, y: 200 },
      };
      mockCanPlaceWindow.mockReturnValue(mockConstraintResult);

      const { result } = renderHook(() => useWindowTool());

      // Start placement with invalid position
      act(() => {
        result.current.startPlacement(200, 200);
      });

      act(() => {
        result.current.finishPlacement();
      });

      expect(mockAddElementToFloor).not.toHaveBeenCalled();
    });

    it('should not finish placement when no current floor', () => {
      mockUseFloorStore.mockReturnValue({
        currentFloorId: null,
        addElementToFloor: mockAddElementToFloor,
      } as any);

      const mockConstraintResult = {
        isValid: true,
        wallId: 'wall-1',
        position: { x: 75, y: 0 },
        wallSegment: { angle: 0 },
      };
      mockCanPlaceWindow.mockReturnValue(mockConstraintResult);

      const { result } = renderHook(() => useWindowTool());

      act(() => {
        result.current.startPlacement(75, 0);
      });

      act(() => {
        result.current.finishPlacement();
      });

      expect(mockAddElementToFloor).not.toHaveBeenCalled();
    });
  });

  describe('cancelPlacement', () => {
    it('should cancel placement and reset state', () => {
      const mockConstraintResult = {
        isValid: true,
        wallId: 'wall-1',
        position: { x: 75, y: 0 },
        wallSegment: { angle: 0 },
      };
      mockCanPlaceWindow.mockReturnValue(mockConstraintResult);

      const { result } = renderHook(() => useWindowTool());

      // Start placement first
      act(() => {
        result.current.startPlacement(75, 0);
      });

      expect(result.current.placementState.isPlacing).toBe(true);

      // Cancel placement
      act(() => {
        result.current.cancelPlacement();
      });

      expect(result.current.placementState).toEqual({
        isPlacing: false,
        previewWindow: null,
        constraintResult: null,
        isValid: false,
      });
    });

    it('should work when not currently placing', () => {
      const { result } = renderHook(() => useWindowTool());

      act(() => {
        result.current.cancelPlacement();
      });

      expect(result.current.placementState).toEqual({
        isPlacing: false,
        previewWindow: null,
        constraintResult: null,
        isValid: false,
      });
    });
  });

  describe('Store Integration', () => {
    it('should react to changes in walls, doors, and windows', () => {
      const { result, rerender } = renderHook(() => useWindowTool());

      // Change the mock data
      const newWalls = [{ id: 'wall-3', x1: 0, y1: 100, x2: 100, y2: 100 }];
      mockUseDesignStore.mockReturnValue({
        walls: newWalls,
        doors: [],
        windows: [],
        selectElement: mockSelectElement,
      } as any);

      rerender();

      const mockConstraintResult = {
        isValid: true,
        wallId: 'wall-3',
        position: { x: 50, y: 100 },
        wallSegment: { angle: 0 },
      };
      mockCanPlaceWindow.mockReturnValue(mockConstraintResult);

      act(() => {
        result.current.startPlacement(50, 100);
      });

      expect(mockCanPlaceWindow).toHaveBeenCalledWith(
        { x: 50, y: 100 },
        100,
        newWalls,
        [],
        []
      );
    });

    it('should react to tool changes', () => {
      const { result, rerender } = renderHook(() => useWindowTool());

      // Change active tool
      mockUseUIStore.mockReturnValue({
        activeTool: 'door',
        setActiveTool: mockSetActiveTool,
      } as any);

      rerender();

      act(() => {
        result.current.startPlacement(75, 0);
      });

      expect(mockCanPlaceWindow).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing wallSegment in constraint result', () => {
      const mockConstraintResult = {
        isValid: true,
        wallId: 'wall-1',
        position: { x: 75, y: 0 },
        wallSegment: undefined,
      };
      mockCanPlaceWindow.mockReturnValue(mockConstraintResult);

      const { result } = renderHook(() => useWindowTool());

      act(() => {
        result.current.startPlacement(75, 0);
      });

      expect(result.current.placementState.previewWindow?.wallAngle).toBe(0);
    });

    it('should generate unique window IDs', () => {
      const mockConstraintResult = {
        isValid: true,
        wallId: 'wall-1',
        position: { x: 75, y: 0 },
        wallSegment: { angle: 0 },
      };
      mockCanPlaceWindow.mockReturnValue(mockConstraintResult);

      const { result } = renderHook(() => useWindowTool());

      act(() => {
        result.current.startPlacement(75, 0);
      });

      const firstId = result.current.placementState.previewWindow?.id;

      act(() => {
        result.current.cancelPlacement();
      });

      act(() => {
        result.current.startPlacement(75, 0);
      });

      const secondId = result.current.placementState.previewWindow?.id;

      expect(firstId).not.toBe(secondId);
      expect(firstId).toMatch(/^window-preview-\d+$/);
      expect(secondId).toMatch(/^window-preview-\d+$/);
    });
  });
});