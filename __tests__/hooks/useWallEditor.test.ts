import { renderHook, act } from '@testing-library/react';
import { useWallEditor } from '@/hooks/useWallEditor';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useWallIntersection } from '@/hooks/useWallIntersection';
import { RemoveWallCommand } from '@/utils/history';

// Declare mock functions that will be used across tests
const mockUpdateWall = jest.fn();
const mockRemoveWall = jest.fn();
const mockAddWall = jest.fn();
const mockUpdateElementInFloor = jest.fn();
const mockExecuteCommand = jest.fn();
const mockUpdateWallWithIntersectionHandling = jest.fn();

// Mock the RemoveWallCommand constructor
const MockRemoveWallCommand = jest.fn().mockImplementation(function(id, add, remove, wall) {
  this.id = id;
  this.add = add;
  this.remove = remove;
  this.wall = wall;
  this.type = 'REMOVE_WALL';
  this.wallId = id;
  this.execute = jest.fn();
  this.undo = jest.fn();
});

// Mock all direct dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');
jest.mock('@/stores/historyStore');
jest.mock('@/hooks/useWallIntersection');
 


describe('useWallEditor', () => {
  // Declare mock functions that will be used across tests
  const mockUpdateWall = jest.fn();
  const mockRemoveWall = jest.fn();
  const mockAddWall = jest.fn();
  const mockUpdateElementInFloor = jest.fn();
  const mockExecuteCommand = jest.fn();
  const mockUpdateWallWithIntersectionHandling = jest.fn();

  // Mock the RemoveWallCommand constructor
  const MockRemoveWallCommand = jest.fn().mockImplementation(function(id, add, remove, wall) {
    this.id = id;
    this.add = add;
    this.remove = remove;
    this.wall = wall;
    this.type = 'REMOVE_WALL';
    this.wallId = id;
    this.execute = jest.fn();
    this.undo = jest.fn();
  });

  const mockUseDesignStore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockImplementation(() => ({
      walls: [], // This will be mutated directly in tests
      updateWall: mockUpdateWall,
      removeWall: mockRemoveWall,
      addWall: mockAddWall,
      selectedElementId: null,
      selectedElementType: null,
    }));
    (useFloorStore as jest.Mock).mockReturnValue({
      currentFloorId: 'floor1',
      updateElementInFloor: mockUpdateElementInFloor,
    });
    (useHistoryStore as jest.Mock).mockReturnValue({
      executeCommand: mockExecuteCommand,
    });
    (useWallIntersection as jest.Mock).mockReturnValue({
      updateWallWithIntersectionHandling: mockUpdateWallWithIntersectionHandling,
    });

    // Mock the RemoveWallCommand from the history module
     
  });

  it('should be defined', () => {
    const { result } = renderHook(() => useWallEditor());
    expect(result.current).toBeDefined();
  });

  it('should start dragging a wall by its start handle', () => {
    // Set up specific mock data for this test
    (useDesignStore as jest.Mock).mockReturnValue({
      walls: [{ id: 'wall1', startX: 0, startY: 0, endX: 100, endY: 0 }],
      updateWall: mockUpdateWall,
      removeWall: mockRemoveWall,
      addWall: mockAddWall,
      selectedElementId: null,
      selectedElementType: null,
    });

    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.startDrag('wall1', 'start', 10, 10);
    });

    expect(result.current.editState.isDragging).toBe(true);
    expect(result.current.editState.dragType).toBe('start');
    expect(result.current.editState.originalWall).toEqual({ id: 'wall1', startX: 0, startY: 0, endX: 100, endY: 0 });
    expect(result.current.editState.dragStartPos).toEqual({ x: 10, y: 10 });
  });

  it('should update wall position when dragging by start handle', () => {
    (useDesignStore as jest.Mock).mockReturnValue({
      walls: [{ id: 'wall1', startX: 0, startY: 0, endX: 100, endY: 0 }],
      updateWall: mockUpdateWall,
      removeWall: mockRemoveWall,
      addWall: mockAddWall,
      selectedElementId: null,
      selectedElementType: null,
    });

    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.startDrag('wall1', 'start', 0, 0);
    });

    act(() => {
      result.current.updateDrag('wall1', 'start', 50, 50);
    });

    expect(mockUpdateWall).toHaveBeenCalledWith('wall1', { startX: 50, startY: 50 });
    expect(mockUpdateElementInFloor).toHaveBeenCalledWith('floor1', 'walls', 'wall1', { startX: 50, startY: 50 });
  });

  it('should update wall position when dragging by end handle', () => {
    (useDesignStore as jest.Mock).mockReturnValue({
      walls: [{ id: 'wall1', startX: 0, startY: 0, endX: 100, endY: 0 }],
      updateWall: mockUpdateWall,
      removeWall: mockRemoveWall,
      addWall: mockAddWall,
      selectedElementId: null,
      selectedElementType: null,
    });

    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.startDrag('wall1', 'end', 100, 0);
    });

    act(() => {
      result.current.updateDrag('wall1', 'end', 150, 50);
    });

    expect(mockUpdateWall).toHaveBeenCalledWith('wall1', { endX: 150, endY: 50 });
    expect(mockUpdateElementInFloor).toHaveBeenCalledWith('floor1', 'walls', 'wall1', { endX: 150, endY: 50 });
  });

  it('should move the entire wall when dragging by move handle', () => {
    (useDesignStore as jest.Mock).mockReturnValue({
      walls: [{ id: 'wall1', startX: 0, startY: 0, endX: 100, endY: 0 }],
      updateWall: mockUpdateWall,
      removeWall: mockRemoveWall,
      addWall: mockAddWall,
      selectedElementId: null,
      selectedElementType: null,
    });

    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.startDrag('wall1', 'move', 50, 0);
    });

    act(() => {
      result.current.updateDrag('wall1', 'move', 60, 10);
    });

    expect(mockUpdateWall).toHaveBeenCalledWith('wall1', { startX: 10, startY: 10, endX: 110, endY: 10 });
    expect(mockUpdateElementInFloor).toHaveBeenCalledWith('floor1', 'walls', 'wall1', { startX: 10, startY: 10, endX: 110, endY: 10 });
  });

  it('should call updateWallWithIntersectionHandling on endDrag if wall changed', () => {
    // Initial state of the wall in the store
    const initialWall = { id: 'wall1', startX: 0, startY: 0, endX: 100, endY: 0 };
    mockUseDesignStore.mockImplementation(() => ({
      walls: [initialWall],
      updateWall: mockUpdateWall,
      removeWall: mockRemoveWall,
      addWall: mockAddWall,
      selectedElementId: null,
      selectedElementType: null,
    }));

    const { result } = renderHook(() => useWallEditor());

    // Simulate start drag
    act(() => {
      result.current.startDrag('wall1', 'move', 0, 0);
    });

    // Manually update the wall in the store to simulate the effect of updateDrag
    // This is crucial because updateDrag directly modifies the store's state
    const updatedWall = { id: 'wall1', startX: 10, startY: 10, endX: 110, endY: 10 };
    mockUseDesignStore.mockImplementation(() => ({
      walls: [updatedWall],
      updateWall: mockUpdateWall,
      removeWall: mockRemoveWall,
      addWall: mockAddWall,
      selectedElementId: null,
      selectedElementType: null,
    }));

    act(() => {
      result.current.endDrag('wall1');
    });

    expect(mockUpdateWallWithIntersectionHandling).toHaveBeenCalledWith('wall1', {
      startX: 10,
      startY: 10,
      endX: 110,
      endY: 10,
    });
    expect(result.current.editState.isDragging).toBe(false);
  });

  it('should not call updateWallWithIntersectionHandling on endDrag if wall did not change', () => {
    (useDesignStore as jest.Mock).mockReturnValue({
      walls: [{ id: 'wall1', startX: 0, startY: 0, endX: 100, endY: 0 }],
      updateWall: mockUpdateWall,
      removeWall: mockRemoveWall,
      addWall: mockAddWall,
      selectedElementId: null,
      selectedElementType: null,
    });

    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.startDrag('wall1', 'move', 0, 0);
    });

    act(() => {
      result.current.endDrag('wall1');
    });

    expect(mockUpdateWallWithIntersectionHandling).not.toHaveBeenCalled();
    expect(result.current.editState.isDragging).toBe(false);
  });

  it('should delete selected wall', () => {
    (useDesignStore as jest.Mock).mockReturnValue({
      walls: [{ id: 'wall1', startX: 0, startY: 0, endX: 100, endY: 0 }],
      updateWall: mockUpdateWall,
      removeWall: mockRemoveWall,
      addWall: mockAddWall,
      selectedElementId: 'wall1',
      selectedElementType: 'wall',
    });

    const { result } = renderHook(() => useWallEditor());

    act(() => {
      result.current.deleteSelectedWall();
    });

    expect(mockExecuteCommand).toHaveBeenCalledTimes(1);
    // Verify that the command passed to executeCommand is an instance of our mock class
    expect(mockExecuteCommand.mock.calls[0][0]).toBeInstanceOf(MockRemoveWallCommand);
    const commandInstance = mockExecuteCommand.mock.calls[0][0];
    expect(commandInstance.wallId).toBe('wall1');
    expect(commandInstance.type).toBe('REMOVE_WALL');
  });
});
