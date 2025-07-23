import { renderHook, act } from '@testing-library/react';
import { useWallTool } from '@/hooks/useWallTool';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useWallIntersection } from '@/hooks/useWallIntersection';
import { snapPoint } from '@/utils/snapping';
import { getWallSnapPointsWithIntersections } from '@/utils/wallIntersection';

// Mock the dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/uiStore');
jest.mock('@/hooks/useWallIntersection');
jest.mock('@/utils/snapping');
jest.mock('@/utils/wallIntersection');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;
const mockUseWallIntersection = useWallIntersection as jest.MockedFunction<typeof useWallIntersection>;
const mockSnapPoint = snapPoint as jest.MockedFunction<typeof snapPoint>;
const mockGetWallSnapPointsWithIntersections = getWallSnapPointsWithIntersections as jest.MockedFunction<typeof getWallSnapPointsWithIntersections>;

describe('useWallTool', () => {
  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 8, height: 240, color: '#666666' },
    { id: 'wall-2', startX: 100, startY: 0, endX: 100, endY: 100, thickness: 8, height: 240, color: '#666666' },
  ];

  const mockSnapPoints = [
    { x: 0, y: 0, type: 'endpoint' },
    { x: 100, y: 0, type: 'endpoint' },
    { x: 100, y: 100, type: 'endpoint' },
  ];

  const mockAddWallWithIntersectionHandling = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
    } as any);

    mockUseUIStore.mockReturnValue({
      snapToGrid: true,
      gridSize: 20,
      activeTool: 'wall',
    } as any);

    mockUseWallIntersection.mockReturnValue({
      addWallWithIntersectionHandling: mockAddWallWithIntersectionHandling,
    } as any);

    mockGetWallSnapPointsWithIntersections.mockReturnValue(mockSnapPoints);

    mockSnapPoint.mockImplementation((point, gridSize, snapPoints, snapToGrid) => ({
      x: snapToGrid ? Math.round(point.x / gridSize) * gridSize : point.x,
      y: snapToGrid ? Math.round(point.y / gridSize) * gridSize : point.y,
      snapped: snapToGrid,
      snapType: 'grid',
    }));
  });

  it('should initialize with default drawing state', () => {
    const { result } = renderHook(() => useWallTool());

    expect(result.current.drawingState).toEqual({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      currentSnapResult: null,
    });
    expect(typeof result.current.startDrawing).toBe('function');
    expect(typeof result.current.updateDrawing).toBe('function');
    expect(typeof result.current.finishDrawing).toBe('function');
    expect(typeof result.current.cancelDrawing).toBe('function');
  });

  it('should start drawing when wall tool is active', () => {
    const { result } = renderHook(() => useWallTool());

    act(() => {
      result.current.startDrawing(50, 75);
    });

    expect(mockGetWallSnapPointsWithIntersections).toHaveBeenCalledWith(mockWalls);
    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 50, y: 75 },
      20,
      mockSnapPoints,
      true
    );

    expect(result.current.drawingState.isDrawing).toBe(true);
    expect(result.current.drawingState.startPoint).toEqual({ x: 60, y: 80 }); // Snapped to grid
    expect(result.current.drawingState.currentPoint).toEqual({ x: 60, y: 80 });
    expect(result.current.drawingState.currentSnapResult).toEqual({
      x: 60,
      y: 80,
      snapped: true,
      snapType: 'grid',
    });
  });

  it('should not start drawing when wall tool is not active', () => {
    mockUseUIStore.mockReturnValue({
      snapToGrid: true,
      gridSize: 20,
      activeTool: 'door', // Different tool
    } as any);

    const { result } = renderHook(() => useWallTool());

    act(() => {
      result.current.startDrawing(50, 75);
    });

    expect(result.current.drawingState.isDrawing).toBe(false);
    expect(mockSnapPoint).not.toHaveBeenCalled();
  });

  it('should update drawing position when drawing is active', () => {
    const { result } = renderHook(() => useWallTool());

    // Start drawing
    act(() => {
      result.current.startDrawing(0, 0);
    });

    // Update drawing position
    act(() => {
      result.current.updateDrawing(100, 50);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 100, y: 50 },
      20,
      mockSnapPoints,
      true
    );

    expect(result.current.drawingState.currentPoint).toEqual({ x: 100, y: 60 }); // Snapped
    expect(result.current.drawingState.currentSnapResult).toEqual({
      x: 100,
      y: 60,
      snapped: true,
      snapType: 'grid',
    });
  });

  it('should not update drawing when not drawing', () => {
    const { result } = renderHook(() => useWallTool());

    act(() => {
      result.current.updateDrawing(100, 50);
    });

    expect(mockSnapPoint).not.toHaveBeenCalled();
    expect(result.current.drawingState.currentPoint).toBeNull();
  });

  it('should not update drawing when wall tool is not active', () => {
    mockUseUIStore.mockReturnValue({
      snapToGrid: true,
      gridSize: 20,
      activeTool: 'door',
    } as any);

    const { result } = renderHook(() => useWallTool());

    // Manually set drawing state to simulate starting with different tool
    act(() => {
      result.current.startDrawing(0, 0);
    });

    act(() => {
      result.current.updateDrawing(100, 50);
    });

    expect(result.current.drawingState.currentPoint).toBeNull();
  });

  it('should finish drawing and create wall when distance is sufficient', () => {
    const { result } = renderHook(() => useWallTool());

    // Start drawing
    act(() => {
      result.current.startDrawing(0, 0);
    });

    // Update to create sufficient distance
    act(() => {
      result.current.updateDrawing(100, 0);
    });

    // Finish drawing
    act(() => {
      result.current.finishDrawing();
    });

    expect(mockAddWallWithIntersectionHandling).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^wall-\d+-[a-z0-9]+$/),
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 8,
        height: 240,
        color: '#666666',
      })
    );

    expect(result.current.drawingState).toEqual({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      currentSnapResult: null,
    });
  });

  it('should not create wall when distance is too small', () => {
    const { result } = renderHook(() => useWallTool());

    // Start drawing
    act(() => {
      result.current.startDrawing(0, 0);
    });

    // Update to create insufficient distance (less than 5 pixels)
    act(() => {
      result.current.updateDrawing(2, 2);
    });

    // Finish drawing
    act(() => {
      result.current.finishDrawing();
    });

    expect(mockAddWallWithIntersectionHandling).not.toHaveBeenCalled();

    expect(result.current.drawingState).toEqual({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      currentSnapResult: null,
    });
  });

  it('should not finish drawing when not drawing', () => {
    const { result } = renderHook(() => useWallTool());

    act(() => {
      result.current.finishDrawing();
    });

    expect(mockAddWallWithIntersectionHandling).not.toHaveBeenCalled();
  });

  it('should cancel drawing and reset state', () => {
    const { result } = renderHook(() => useWallTool());

    // Start drawing
    act(() => {
      result.current.startDrawing(0, 0);
    });

    // Update drawing
    act(() => {
      result.current.updateDrawing(50, 50);
    });

    // Cancel drawing
    act(() => {
      result.current.cancelDrawing();
    });

    expect(result.current.drawingState).toEqual({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      currentSnapResult: null,
    });

    expect(mockAddWallWithIntersectionHandling).not.toHaveBeenCalled();
  });

  it('should handle snapping with different grid sizes', () => {
    mockUseUIStore.mockReturnValue({
      snapToGrid: true,
      gridSize: 10, // Different grid size
      activeTool: 'wall',
    } as any);

    const { result } = renderHook(() => useWallTool());

    act(() => {
      result.current.startDrawing(25, 35);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 25, y: 35 },
      10, // Should use the new grid size
      mockSnapPoints,
      true
    );
  });

  it('should handle snapping disabled', () => {
    mockUseUIStore.mockReturnValue({
      snapToGrid: false,
      gridSize: 20,
      activeTool: 'wall',
    } as any);

    const { result } = renderHook(() => useWallTool());

    act(() => {
      result.current.startDrawing(25, 35);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 25, y: 35 },
      20,
      mockSnapPoints,
      false // Snapping disabled
    );
  });

  it('should use wall intersection handling for wall creation', () => {
    const { result } = renderHook(() => useWallTool());

    // Start drawing
    act(() => {
      result.current.startDrawing(0, 0);
    });

    // Update to create sufficient distance
    act(() => {
      result.current.updateDrawing(100, 0);
    });

    // Finish drawing
    act(() => {
      result.current.finishDrawing();
    });

    expect(mockAddWallWithIntersectionHandling).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^wall-\d+-[a-z0-9]+$/),
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 8,
        height: 240,
        color: '#666666',
      })
    );
  });

  it('should generate unique wall IDs', () => {
    const { result } = renderHook(() => useWallTool());

    // Create first wall
    act(() => {
      result.current.startDrawing(0, 0);
    });
    act(() => {
      result.current.updateDrawing(100, 0);
    });
    act(() => {
      result.current.finishDrawing();
    });

    expect(mockAddWallWithIntersectionHandling).toHaveBeenCalledTimes(1);
    const firstWallId = mockAddWallWithIntersectionHandling.mock.calls[0][0].id;

    // Create second wall
    act(() => {
      result.current.startDrawing(0, 100);
    });
    act(() => {
      result.current.updateDrawing(100, 100);
    });
    act(() => {
      result.current.finishDrawing();
    });

    expect(mockAddWallWithIntersectionHandling).toHaveBeenCalledTimes(2);
    const secondWallId = mockAddWallWithIntersectionHandling.mock.calls[1][0].id;

    expect(firstWallId).not.toBe(secondWallId);
    expect(firstWallId).toMatch(/^wall-\d+-[a-z0-9]+$/);
    expect(secondWallId).toMatch(/^wall-\d+-[a-z0-9]+$/);
  });

  it('should calculate wall distance correctly', () => {
    const { result } = renderHook(() => useWallTool());

    // Test with distance above minimum (20 pixels, which is one grid unit)
    act(() => {
      result.current.startDrawing(0, 0);
    });
    act(() => {
      result.current.updateDrawing(20, 0);
    });
    act(() => {
      result.current.finishDrawing();
    });

    expect(mockAddWallWithIntersectionHandling).toHaveBeenCalled();

    mockAddWallWithIntersectionHandling.mockClear();

    // Test with distance just below minimum (both points snap to same location)
    act(() => {
      result.current.startDrawing(0, 0);
    });
    act(() => {
      result.current.updateDrawing(4, 0);
    });
    act(() => {
      result.current.finishDrawing();
    });

    expect(mockAddWallWithIntersectionHandling).not.toHaveBeenCalled();
  });

  it('should handle diagonal walls correctly', () => {
    const { result } = renderHook(() => useWallTool());

    act(() => {
      result.current.startDrawing(0, 0);
    });
    act(() => {
      result.current.updateDrawing(60, 80); // 3-4-5 triangle, distance = 100
    });
    act(() => {
      result.current.finishDrawing();
    });

    expect(mockAddWallWithIntersectionHandling).toHaveBeenCalledWith(
      expect.objectContaining({
        startX: 0,
        startY: 0,
        endX: 60,
        endY: 80,
      })
    );
  });
});