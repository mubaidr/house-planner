import { renderHook, act } from '@testing-library/react';
import { useWallEditor } from '@/hooks/useWallEditor';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useWallIntersection } from '@/hooks/useWallIntersection';
import { RemoveWallCommand } from '@/utils/history';

// Mock the dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');
jest.mock('@/stores/historyStore');
jest.mock('@/hooks/useWallIntersection');
jest.mock('@/utils/history', () => ({
  RemoveWallCommand: jest.fn(),
}));

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseFloorStore = useFloorStore as jest.MockedFunction<typeof useFloorStore>;
const mockUseHistoryStore = useHistoryStore as jest.MockedFunction<typeof useHistoryStore>;
const mockUseWallIntersection = useWallIntersection as jest.MockedFunction<typeof useWallIntersection>;
const MockRemoveWallCommand = RemoveWallCommand as jest.MockedFunction<typeof RemoveWallCommand>;

describe('useWallEditor', () => {
  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 200, endY: 0, thickness: 8, height: 240, color: '#666666' },
    { id: 'wall-2', startX: 200, startY: 0, endX: 200, endY: 200, thickness: 8, height: 240, color: '#666666' },
  ];

  const mockUpdateWall = jest.fn();
  const mockRemoveWall = jest.fn();
  const mockAddWall = jest.fn();
  const mockUpdateElementInFloor = jest.fn();
  const mockExecuteCommand = jest.fn();
  const mockUpdateWallWithIntersectionHandling = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      selectedElementId: null,
      selectedElementType: null,
      updateWall: mockUpdateWall,
      removeWall: mockRemoveWall,
      addWall: mockAddWall,
    } as any);

    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor-1',
      updateElementInFloor: mockUpdateElementInFloor,
    } as any);

    mockUseHistoryStore.mockReturnValue({
      executeCommand: mockExecuteCommand,
    } as any);

    mockUseWallIntersection.mockReturnValue({
      updateWallWithIntersectionHandling: mockUpdateWallWithIntersectionHandling,
    } as any);

    MockRemoveWallCommand.mockImplementation((wallId, addFn, removeFn, wall) => ({
      type: 'REMOVE_WALL',
      wallId,
      addFn,
      removeFn,
      wall,
      execute: jest.fn(),
      undo: jest.fn(),
    } as any));
  });

  it('should initialize with default edit state', () => {
    const { result } = renderHook(() => useWallEditor());

    expect(result.current.editState).toEqual({
      isDragging: false,
      dragType: null,
      originalWall: null,
      dragStartPos: null,
    });

    expect(typeof result.current.startDrag).toBe('function');
    expect(typeof result.current.updateDrag).toBe('function');
    expect(typeof result.current.endDrag).toBe('function');
    expect(typeof result.current.deleteSelectedWall).toBe('function');
  });

  it('should start drag operation for existing wall', () => {
    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.startDrag('wall-1', 'start', 100, 50);
    });

    expect(result.current.editState.isDragging).toBe(true);
    expect(result.current.editState.dragType).toBe('start');
    expect(result.current.editState.originalWall).toEqual(mockWalls[0]);
    expect(result.current.editState.dragStartPos).toEqual({ x: 100, y: 50 });
  });

  it('should not start drag for non-existent wall', () => {
    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.startDrag('non-existent-wall', 'start', 100, 50);
    });

    expect(result.current.editState.isDragging).toBe(false);
    expect(result.current.editState.originalWall).toBeNull();
  });

  it('should handle start point drag updates', () => {
    const { result } = renderHook(() => useWallEditor());

    // Start drag
    act(() => {
      result.current.startDrag('wall-1', 'start', 0, 0);
    });

    // Update drag
    act(() => {
      result.current.updateDrag('wall-1', 'start', 50, 25);
    });

    expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', {
      startX: 50,
      startY: 25,
    });
    expect(mockUpdateElementInFloor).toHaveBeenCalledWith(
      'floor-1',
      'walls',
      'wall-1',
      { startX: 50, startY: 25 }
    );
  });

  it('should handle end point drag updates', () => {
    const { result } = renderHook(() => useWallEditor());

    // Start drag
    act(() => {
      result.current.startDrag('wall-1', 'end', 200, 0);
    });

    // Update drag
    act(() => {
      result.current.updateDrag('wall-1', 'end', 250, 50);
    });

    expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', {
      endX: 250,
      endY: 50,
    });
    expect(mockUpdateElementInFloor).toHaveBeenCalledWith(
      'floor-1',
      'walls',
      'wall-1',
      { endX: 250, endY: 50 }
    );
  });

  it('should handle move drag updates', () => {
    const { result } = renderHook(() => useWallEditor());

    // Start drag
    act(() => {
      result.current.startDrag('wall-1', 'move', 100, 50);
    });

    // Update drag (move by 50, 25)
    act(() => {
      result.current.updateDrag('wall-1', 'move', 150, 75);
    });

    expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', {
      startX: 50,  // original 0 + delta 50
      startY: 25,  // original 0 + delta 25
      endX: 250,   // original 200 + delta 50
      endY: 25,    // original 0 + delta 25
    });
  });

  it('should not update drag when not dragging', () => {
    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.updateDrag('wall-1', 'start', 50, 25);
    });

    expect(mockUpdateWall).not.toHaveBeenCalled();
    expect(mockUpdateElementInFloor).not.toHaveBeenCalled();
  });

  it('should not update drag for non-existent wall', () => {
    const { result } = renderHook(() => useWallEditor());

    // Start drag for existing wall
    act(() => {
      result.current.startDrag('wall-1', 'start', 0, 0);
    });

    // Try to update drag for different wall
    act(() => {
      result.current.updateDrag('non-existent-wall', 'start', 50, 25);
    });

    expect(mockUpdateWall).not.toHaveBeenCalled();
  });

  it('should end drag with changes and use intersection handling', () => {
    const { result } = renderHook(() => useWallEditor());

    // Start drag
    act(() => {
      result.current.startDrag('wall-1', 'start', 0, 0);
    });

    // Simulate wall position change
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      walls: [
        { ...mockWalls[0], startX: 50, startY: 25 }, // Changed wall
        mockWalls[1],
      ],
    } as any);

    // End drag
    act(() => {
      result.current.endDrag('wall-1');
    });

    expect(mockUpdateWallWithIntersectionHandling).toHaveBeenCalledWith('wall-1', {
      startX: 50,
      startY: 25,
      endX: 200,
      endY: 0,
    });

    expect(result.current.editState.isDragging).toBe(false);
    expect(result.current.editState.originalWall).toBeNull();
  });

  it('should end drag without changes and not call intersection handling', () => {
    const { result } = renderHook(() => useWallEditor());

    // Start drag
    act(() => {
      result.current.startDrag('wall-1', 'start', 0, 0);
    });

    // End drag without changes (wall remains the same)
    act(() => {
      result.current.endDrag('wall-1');
    });

    expect(mockUpdateWallWithIntersectionHandling).not.toHaveBeenCalled();
    expect(result.current.editState.isDragging).toBe(false);
  });

  it('should not end drag when not dragging', () => {
    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.endDrag('wall-1');
    });

    expect(mockUpdateWallWithIntersectionHandling).not.toHaveBeenCalled();
  });

  it('should delete selected wall', () => {
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      selectedElementId: 'wall-1',
      selectedElementType: 'wall',
    } as any);

    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.deleteSelectedWall();
    });

    expect(MockRemoveWallCommand).toHaveBeenCalledWith(
      'wall-1',
      mockAddWall,
      mockRemoveWall,
      mockWalls[0]
    );
    expect(mockExecuteCommand).toHaveBeenCalled();
  });

  it('should not delete when no wall is selected', () => {
    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.deleteSelectedWall();
    });

    expect(MockRemoveWallCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should not delete when selected element is not a wall', () => {
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      selectedElementId: 'door-1',
      selectedElementType: 'door',
    } as any);

    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.deleteSelectedWall();
    });

    expect(MockRemoveWallCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should handle drag state transitions correctly', () => {
    const { result } = renderHook(() => useWallEditor());

    // Initial state
    expect(result.current.editState.isDragging).toBe(false);

    // Start drag
    act(() => {
      result.current.startDrag('wall-1', 'end', 200, 0);
    });

    expect(result.current.editState.isDragging).toBe(true);
    expect(result.current.editState.dragType).toBe('end');

    // End drag
    act(() => {
      result.current.endDrag('wall-1');
    });

    expect(result.current.editState.isDragging).toBe(false);
    expect(result.current.editState.dragType).toBeNull();
    expect(result.current.editState.originalWall).toBeNull();
    expect(result.current.editState.dragStartPos).toBeNull();
  });

  it('should handle different drag types', () => {
    const { result } = renderHook(() => useWallEditor());

    const dragTypes = ['start', 'end', 'move'] as const;

    dragTypes.forEach(dragType => {
      act(() => {
        result.current.startDrag('wall-1', dragType, 100, 50);
      });

      expect(result.current.editState.dragType).toBe(dragType);

      act(() => {
        result.current.endDrag('wall-1');
      });
    });
  });

  it('should calculate move deltas correctly', () => {
    const { result } = renderHook(() => useWallEditor());

    // Start move drag at (100, 50)
    act(() => {
      result.current.startDrag('wall-1', 'move', 100, 50);
    });

    // Move to (150, 100) - delta of (50, 50)
    act(() => {
      result.current.updateDrag('wall-1', 'move', 150, 100);
    });

    expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', {
      startX: 50,   // original 0 + delta 50
      startY: 50,   // original 0 + delta 50
      endX: 250,    // original 200 + delta 50
      endY: 50,     // original 0 + delta 50
    });
  });

  it('should handle multiple drag operations in sequence', () => {
    const { result } = renderHook(() => useWallEditor());

    // First drag operation
    act(() => {
      result.current.startDrag('wall-1', 'start', 0, 0);
      result.current.updateDrag('wall-1', 'start', 25, 25);
      result.current.endDrag('wall-1');
    });

    expect(result.current.editState.isDragging).toBe(false);

    // Second drag operation
    act(() => {
      result.current.startDrag('wall-2', 'end', 200, 200);
      result.current.updateDrag('wall-2', 'end', 250, 250);
      result.current.endDrag('wall-2');
    });

    expect(result.current.editState.isDragging).toBe(false);
    expect(mockUpdateWall).toHaveBeenCalledTimes(4); // 2 updates per drag operation
  });

  it('should preserve wall properties during updates', () => {
    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.startDrag('wall-1', 'start', 0, 0);
      result.current.updateDrag('wall-1', 'start', 50, 25);
    });

    // Should only update position, not other properties
    expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', {
      startX: 50,
      startY: 25,
    });

    // Should not include thickness, height, color, etc.
    const updateCall = mockUpdateWall.mock.calls[0][1];
    expect(updateCall).not.toHaveProperty('thickness');
    expect(updateCall).not.toHaveProperty('height');
    expect(updateCall).not.toHaveProperty('color');
  });

  it('should not delete when selected wall does not exist', () => {
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      selectedElementId: 'non-existent-wall',
      selectedElementType: 'wall',
    } as any);

    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.deleteSelectedWall();
    });

    expect(MockRemoveWallCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should use intersection handling for wall updates', () => {
    const { result } = renderHook(() => useWallEditor());

    // Verify that useWallIntersection hook is called
    expect(mockUseWallIntersection).toHaveBeenCalled();

    // Start and end drag to trigger intersection handling
    act(() => {
      result.current.startDrag('wall-1', 'start', 0, 0);
    });

    // Simulate wall change
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      walls: [
        { ...mockWalls[0], startX: 50, startY: 25 },
        mockWalls[1],
      ],
    } as any);

    act(() => {
      result.current.endDrag('wall-1');
    });

    expect(mockUpdateWallWithIntersectionHandling).toHaveBeenCalledWith('wall-1', {
      startX: 50,
      startY: 25,
      endX: 200,
      endY: 0,
    });
  });
});