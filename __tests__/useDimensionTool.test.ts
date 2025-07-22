import { renderHook, act } from '@testing-library/react';
import { useDimensionTool } from '@/hooks/useDimensionTool';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { createDimensionAnnotation, createAutoDimensions } from '@/components/Canvas/DimensionAnnotations';
import { snapPoint, getWallSnapPoints } from '@/utils/snapping';

// Mock the dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/uiStore');
jest.mock('@/components/Canvas/DimensionAnnotations');
jest.mock('@/utils/snapping');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;
const mockCreateDimensionAnnotation = createDimensionAnnotation as jest.MockedFunction<typeof createDimensionAnnotation>;
const mockCreateAutoDimensions = createAutoDimensions as jest.MockedFunction<typeof createAutoDimensions>;
const mockSnapPoint = snapPoint as jest.MockedFunction<typeof snapPoint>;
const mockGetWallSnapPoints = getWallSnapPoints as jest.MockedFunction<typeof getWallSnapPoints>;

describe('useDimensionTool', () => {
  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 8, height: 240 },
    { id: 'wall-2', startX: 100, startY: 0, endX: 100, endY: 100, thickness: 8, height: 240 },
  ];

  const mockDoors = [
    { id: 'door-1', x: 50, y: 0, width: 36, height: 80, wallId: 'wall-1' },
  ];

  const mockWindows = [
    { id: 'window-1', x: 25, y: 0, width: 48, height: 36, wallId: 'wall-1' },
  ];

  const mockSnapPoints = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
  ];

  const mockAnnotation = {
    id: 'annotation-1',
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 100, y: 0 },
    distance: 100,
    label: '100.0cm',
    isPermanent: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: mockDoors,
      windows: mockWindows,
    } as any);

    mockUseUIStore.mockReturnValue({
      activeTool: 'dimension',
      snapToGrid: true,
      gridSize: 20,
    } as any);

    mockGetWallSnapPoints.mockReturnValue(mockSnapPoints);

    mockSnapPoint.mockImplementation((point, gridSize, snapPoints, snapToGrid) => ({
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
      snapped: snapToGrid,
      snapType: 'grid',
    }));

    mockCreateDimensionAnnotation.mockReturnValue(mockAnnotation);
    mockCreateAutoDimensions.mockReturnValue([mockAnnotation]);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDimensionTool());

    expect(result.current.state).toEqual({
      annotations: [],
      isCreating: false,
      startPoint: null,
      currentPoint: null,
      showAll: true,
      selectedId: null,
      style: {
        color: '#2563eb',
        strokeWidth: 1.5,
        fontSize: 12,
        arrowSize: 8,
        extensionLength: 20,
        textBackground: true,
        precision: 1,
        units: 'both',
      },
    });

    expect(typeof result.current.startDimension).toBe('function');
    expect(typeof result.current.updateDimension).toBe('function');
    expect(typeof result.current.finishDimension).toBe('function');
    expect(typeof result.current.cancelDimension).toBe('function');
  });

  it('should start dimension creation when dimension tool is active', () => {
    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.startDimension(50, 75);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 50, y: 75 },
      20,
      expect.any(Array),
      true
    );

    expect(result.current.state.isCreating).toBe(true);
    expect(result.current.state.startPoint).toEqual({ x: 60, y: 80, snapped: true, snapType: 'grid' });
    expect(result.current.state.currentPoint).toEqual({ x: 60, y: 80, snapped: true, snapType: 'grid' });
    expect(result.current.state.selectedId).toBeNull();
  });

  it('should not start dimension when tool is not active', () => {
    mockUseUIStore.mockReturnValue({
      activeTool: 'wall',
      snapToGrid: true,
      gridSize: 20,
    } as any);

    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.startDimension(50, 75);
    });

    expect(result.current.state.isCreating).toBe(false);
    expect(mockSnapPoint).not.toHaveBeenCalled();
  });

  it('should update dimension position when creating', () => {
    const { result } = renderHook(() => useDimensionTool());

    // Start dimension
    act(() => {
      result.current.startDimension(0, 0);
    });

    // Update position
    act(() => {
      result.current.updateDimension(100, 50);
    });

    expect(result.current.state.currentPoint).toEqual({ x: 100, y: 60, snapped: true, snapType: 'grid' });
  });

  it('should not update dimension when not creating', () => {
    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.updateDimension(100, 50);
    });

    expect(result.current.state.currentPoint).toBeNull();
  });

  it('should finish dimension and create annotation when distance is sufficient', () => {
    const { result } = renderHook(() => useDimensionTool());

    // Start dimension
    act(() => {
      result.current.startDimension(0, 0);
    });

    // Update to create sufficient distance
    act(() => {
      result.current.updateDimension(100, 0);
    });

    // Finish dimension
    act(() => {
      result.current.finishDimension();
    });

    expect(mockCreateDimensionAnnotation).toHaveBeenCalledWith(
      { x: 0, y: 0, snapped: true, snapType: 'grid' },
      { x: 100, y: 0, snapped: true, snapType: 'grid' },
      {
        isPermanent: true,
        style: expect.objectContaining({
          color: '#2563eb',
          strokeWidth: 1.5,
        }),
      }
    );

    expect(result.current.state.annotations).toContain(mockAnnotation);
    expect(result.current.state.isCreating).toBe(false);
    expect(result.current.state.startPoint).toBeNull();
    expect(result.current.state.currentPoint).toBeNull();
  });

  it('should not create annotation when distance is too small', () => {
    const { result } = renderHook(() => useDimensionTool());

    // Start dimension
    act(() => {
      result.current.startDimension(0, 0);
    });

    // Update to create insufficient distance
    act(() => {
      result.current.updateDimension(5, 0);
    });

    // Finish dimension
    act(() => {
      result.current.finishDimension();
    });

    expect(mockCreateDimensionAnnotation).not.toHaveBeenCalled();
    expect(result.current.state.annotations).toHaveLength(0);
    expect(result.current.state.isCreating).toBe(false);
  });

  it('should cancel dimension creation', () => {
    const { result } = renderHook(() => useDimensionTool());

    // Start dimension
    act(() => {
      result.current.startDimension(0, 0);
    });

    // Cancel dimension
    act(() => {
      result.current.cancelDimension();
    });

    expect(result.current.state.isCreating).toBe(false);
    expect(result.current.state.startPoint).toBeNull();
    expect(result.current.state.currentPoint).toBeNull();
  });

  it('should update style', () => {
    const { result } = renderHook(() => useDimensionTool());

    const newStyle = {
      color: '#ff0000',
      strokeWidth: 2,
      fontSize: 14,
      arrowSize: 10,
      extensionLength: 25,
      textBackground: false,
      precision: 2,
      units: 'metric' as const,
    };

    act(() => {
      result.current.updateStyle(newStyle);
    });

    expect(result.current.state.style).toEqual(newStyle);
  });

  it('should delete annotation', () => {
    const { result } = renderHook(() => useDimensionTool());

    // Add annotation first
    act(() => {
      result.current.updateAnnotation([mockAnnotation]);
    });

    // Select the annotation
    act(() => {
      result.current.selectAnnotation('annotation-1');
    });

    // Delete annotation
    act(() => {
      result.current.deleteAnnotation('annotation-1');
    });

    expect(result.current.state.annotations).toHaveLength(0);
    expect(result.current.state.selectedId).toBeNull();
  });

  it('should clear all annotations', () => {
    const { result } = renderHook(() => useDimensionTool());

    // Add annotations
    act(() => {
      result.current.updateAnnotation([mockAnnotation, { ...mockAnnotation, id: 'annotation-2' }]);
      result.current.selectAnnotation('annotation-1');
    });

    // Clear all
    act(() => {
      result.current.clearAllAnnotations();
    });

    expect(result.current.state.annotations).toHaveLength(0);
    expect(result.current.state.selectedId).toBeNull();
  });

  it('should toggle show all', () => {
    const { result } = renderHook(() => useDimensionTool());

    expect(result.current.state.showAll).toBe(true);

    act(() => {
      result.current.toggleShowAll();
    });

    expect(result.current.state.showAll).toBe(false);

    act(() => {
      result.current.toggleShowAll();
    });

    expect(result.current.state.showAll).toBe(true);
  });

  it('should auto-dimension walls', () => {
    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.autoDimensionWalls();
    });

    expect(mockCreateAutoDimensions).toHaveBeenCalledWith(mockWalls);
    expect(result.current.state.annotations).toContain(mockAnnotation);
  });

  it('should auto-dimension selected walls', () => {
    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.autoDimensionSelected(['wall-1'], 'wall');
    });

    expect(mockCreateDimensionAnnotation).toHaveBeenCalledWith(
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      expect.objectContaining({
        elementId: 'wall-1',
        elementType: 'wall',
      })
    );
  });

  it('should auto-dimension selected doors', () => {
    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.autoDimensionSelected(['door-1'], 'door');
    });

    expect(mockCreateDimensionAnnotation).toHaveBeenCalledWith(
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
      expect.objectContaining({
        elementId: 'door-1',
        elementType: 'door',
      })
    );
  });

  it('should auto-dimension selected windows', () => {
    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.autoDimensionSelected(['window-1'], 'window');
    });

    expect(mockCreateDimensionAnnotation).toHaveBeenCalledWith(
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
      expect.objectContaining({
        elementId: 'window-1',
        elementType: 'window',
      })
    );
  });

  it('should get current dimension when creating', () => {
    const { result } = renderHook(() => useDimensionTool());

    // Start dimension
    act(() => {
      result.current.startDimension(0, 0);
    });

    // Update position
    act(() => {
      result.current.updateDimension(100, 0);
    });

    const currentDimension = result.current.getCurrentDimension();

    expect(currentDimension).toEqual({
      startPoint: { x: 0, y: 0, snapped: true, snapType: 'grid' },
      endPoint: { x: 100, y: 0, snapped: true, snapType: 'grid' },
      distance: 100,
      label: '100.0cm',
    });
  });

  it('should return null for current dimension when not creating', () => {
    const { result } = renderHook(() => useDimensionTool());

    const currentDimension = result.current.getCurrentDimension();

    expect(currentDimension).toBeNull();
  });

  it('should select annotation', () => {
    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.selectAnnotation('annotation-1');
    });

    expect(result.current.state.selectedId).toBe('annotation-1');

    act(() => {
      result.current.selectAnnotation(null);
    });

    expect(result.current.state.selectedId).toBeNull();
  });

  it('should include door and window snap points', () => {
    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.startDimension(50, 75);
    });

    // Verify that snap points include wall endpoints plus door/window points
    const snapPointsCall = mockSnapPoint.mock.calls[0];
    const snapPoints = snapPointsCall[2];

    // Should include original wall snap points plus door and window snap points
    // Each door/window adds 2 snap points, so we should have at least 3 + 2 + 2 = 7 points
    expect(snapPoints.length).toBeGreaterThanOrEqual(7);
    expect(mockGetWallSnapPoints).toHaveBeenCalledWith(mockWalls);
  });

  it('should handle snapping disabled', () => {
    mockUseUIStore.mockReturnValue({
      activeTool: 'dimension',
      snapToGrid: false,
      gridSize: 20,
    } as any);

    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.startDimension(50, 75);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 50, y: 75 },
      20,
      expect.any(Array),
      false
    );
  });

  it('should handle different grid sizes', () => {
    mockUseUIStore.mockReturnValue({
      activeTool: 'dimension',
      snapToGrid: true,
      gridSize: 10,
    } as any);

    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.startDimension(25, 35);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 25, y: 35 },
      10,
      expect.any(Array),
      true
    );
  });

  it('should not finish dimension when not creating', () => {
    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.finishDimension();
    });

    expect(mockCreateDimensionAnnotation).not.toHaveBeenCalled();
    expect(result.current.state.annotations).toHaveLength(0);
  });

  it('should handle missing wall for door/window snap points', () => {
    const doorsWithInvalidWall = [
      { id: 'door-1', x: 50, y: 0, width: 36, height: 80, wallId: 'non-existent-wall' },
    ];

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: doorsWithInvalidWall,
      windows: mockWindows,
    } as any);

    const { result } = renderHook(() => useDimensionTool());

    // Should not throw error
    expect(() => {
      act(() => {
        result.current.startDimension(50, 75);
      });
    }).not.toThrow();
  });
});