import { renderHook, act } from '@testing-library/react';
import { useDoorEditor } from '@/hooks/useDoorEditor';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useHistoryStore } from '@/stores/historyStore';
import { canPlaceDoor } from '@/utils/wallConstraints';
import { UpdateDoorCommand, RemoveDoorCommand } from '@/utils/history';

// Mock the dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');
jest.mock('@/stores/historyStore');
jest.mock('@/utils/wallConstraints');
jest.mock('@/utils/history', () => ({
  UpdateDoorCommand: jest.fn(),
  RemoveDoorCommand: jest.fn(),
}));

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseFloorStore = useFloorStore as jest.MockedFunction<typeof useFloorStore>;
const mockUseHistoryStore = useHistoryStore as jest.MockedFunction<typeof useHistoryStore>;
const mockCanPlaceDoor = canPlaceDoor as jest.MockedFunction<typeof canPlaceDoor>;
const MockUpdateDoorCommand = UpdateDoorCommand as jest.MockedFunction<typeof UpdateDoorCommand>;
const MockRemoveDoorCommand = RemoveDoorCommand as jest.MockedFunction<typeof RemoveDoorCommand>;

describe('useDoorEditor', () => {
  const mockDoors = [
    { id: 'door-1', x: 50, y: 0, width: 80, height: 200, wallId: 'wall-1', materialId: 'default' },
    { id: 'door-2', x: 150, y: 100, width: 90, height: 200, wallId: 'wall-2', materialId: 'default' },
  ];

  const mockWindows = [
    { id: 'window-1', x: 25, y: 0, width: 60, height: 120, wallId: 'wall-1', materialId: 'default' },
  ];

  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 200, endY: 0, thickness: 8, height: 240 },
    { id: 'wall-2', startX: 200, startY: 0, endX: 200, endY: 200, thickness: 8, height: 240 },
  ];

  const mockUpdateDoor = jest.fn();
  const mockRemoveDoor = jest.fn();
  const mockAddDoor = jest.fn();
  const mockUpdateElementInFloor = jest.fn();
  const mockExecuteCommand = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockReturnValue({
      doors: mockDoors,
      windows: mockWindows,
      walls: mockWalls,
      selectedElementId: null,
      selectedElementType: null,
      updateDoor: mockUpdateDoor,
      removeDoor: mockRemoveDoor,
      addDoor: mockAddDoor,
    } as any);

    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor-1',
      updateElementInFloor: mockUpdateElementInFloor,
    } as any);

    mockUseHistoryStore.mockReturnValue({
      executeCommand: mockExecuteCommand,
    } as any);

    mockCanPlaceDoor.mockReturnValue({
      isValid: true,
      position: { x: 100, y: 50 },
      wallId: 'wall-1',
    });

    MockUpdateDoorCommand.mockImplementation((doorId, updateFn, originalDoor, newDoor) => ({
      type: 'UPDATE_DOOR',
      doorId,
      updateFn,
      originalDoor,
      newDoor,
      execute: jest.fn(),
      undo: jest.fn(),
    } as any));

    MockRemoveDoorCommand.mockImplementation((doorId, addFn, removeFn, door) => ({
      type: 'REMOVE_DOOR',
      doorId,
      addFn,
      removeFn,
      door,
      execute: jest.fn(),
      undo: jest.fn(),
    } as any));
  });

  it('should initialize with default edit state', () => {
    const { result } = renderHook(() => useDoorEditor());

    expect(result.current.editState).toEqual({
      isDragging: false,
      dragType: null,
      originalDoor: null,
      dragStartPos: null,
    });

    expect(typeof result.current.startDrag).toBe('function');
    expect(typeof result.current.updateDrag).toBe('function');
    expect(typeof result.current.endDrag).toBe('function');
    expect(typeof result.current.deleteSelectedDoor).toBe('function');
  });

  it('should start drag operation for existing door', () => {
    const { result } = renderHook(() => useDoorEditor());

    act(() => {
      result.current.startDrag('door-1', 'move', 100, 50);
    });

    expect(result.current.editState.isDragging).toBe(true);
    expect(result.current.editState.dragType).toBe('move');
    expect(result.current.editState.originalDoor).toEqual(mockDoors[0]);
    expect(result.current.editState.dragStartPos).toEqual({ x: 100, y: 50 });
  });

  it('should not start drag for non-existent door', () => {
    const { result } = renderHook(() => useDoorEditor());

    act(() => {
      result.current.startDrag('non-existent-door', 'move', 100, 50);
    });

    expect(result.current.editState.isDragging).toBe(false);
    expect(result.current.editState.originalDoor).toBeNull();
  });

  it('should handle resize drag updates', () => {
    const { result } = renderHook(() => useDoorEditor());

    // Start drag
    act(() => {
      result.current.startDrag('door-1', 'resize', 50, 0);
    });

    // Update drag with resize
    act(() => {
      result.current.updateDrag('door-1', 'resize', 120, 0);
    });

    expect(mockUpdateDoor).toHaveBeenCalledWith('door-1', {
      width: expect.any(Number), // Width calculated from drag distance
    });
    expect(mockUpdateElementInFloor).toHaveBeenCalledWith(
      'floor-1',
      'doors',
      'door-1',
      expect.objectContaining({ width: expect.any(Number) })
    );
  });

  it('should handle move drag updates with valid position', () => {
    const { result } = renderHook(() => useDoorEditor());

    // Start drag
    act(() => {
      result.current.startDrag('door-1', 'move', 50, 0);
    });

    // Update drag with move
    act(() => {
      result.current.updateDrag('door-1', 'move', 100, 50);
    });

    expect(mockCanPlaceDoor).toHaveBeenCalledWith(
      { x: 100, y: 50 },
      80, // door width
      mockWalls,
      [mockDoors[1]], // other doors (excluding current)
      mockWindows
    );

    expect(mockUpdateDoor).toHaveBeenCalledWith('door-1', {
      x: 100,
      y: 50,
      wallId: 'wall-1',
    });
  });

  it('should not update drag when not dragging', () => {
    const { result } = renderHook(() => useDoorEditor());

    act(() => {
      result.current.updateDrag('door-1', 'move', 100, 50);
    });

    expect(mockUpdateDoor).not.toHaveBeenCalled();
    expect(mockCanPlaceDoor).not.toHaveBeenCalled();
  });

  it('should not update drag for non-existent door', () => {
    const { result } = renderHook(() => useDoorEditor());

    // Start drag for existing door
    act(() => {
      result.current.startDrag('door-1', 'move', 50, 0);
    });

    // Try to update drag for different door
    act(() => {
      result.current.updateDrag('non-existent-door', 'move', 100, 50);
    });

    expect(mockUpdateDoor).not.toHaveBeenCalled();
  });

  it('should handle move drag with invalid position', () => {
    mockCanPlaceDoor.mockReturnValue({
      isValid: false,
      position: { x: 100, y: 50 },
      wallId: null,
    });

    const { result } = renderHook(() => useDoorEditor());

    act(() => {
      result.current.startDrag('door-1', 'move', 50, 0);
      result.current.updateDrag('door-1', 'move', 100, 50);
    });

    expect(mockCanPlaceDoor).toHaveBeenCalledWith(
      { x: 100, y: 50 },
      80, // door width
      mockWalls,
      [mockDoors[1]], // other doors (excluding current)
      mockWindows
    );
    expect(mockUpdateDoor).not.toHaveBeenCalled();
  });

  it('should end drag with valid changes and create command', () => {
    const { result } = renderHook(() => useDoorEditor());

    // Start drag
    act(() => {
      result.current.startDrag('door-1', 'move', 50, 0);
    });

    // Update drag to trigger position change
    act(() => {
      result.current.updateDrag('door-1', 'move', 100, 50);
    });

    // Simulate door position change in store
    const updatedDoor = { ...mockDoors[0], x: 100, y: 50, wallId: 'wall-1' };
    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: [updatedDoor, mockDoors[1]],
      windows: mockWindows,
      updateDoor: mockUpdateDoor,
      removeDoor: mockRemoveDoor,
      addDoor: mockAddDoor,
      selectedElementId: null,
      selectedElementType: null,
    } as any);

    // End drag
    act(() => {
      result.current.endDrag('door-1');
    });

    expect(mockCanPlaceDoor).toHaveBeenCalledTimes(2); // Once in updateDrag, once in endDrag
    expect(MockUpdateDoorCommand).toHaveBeenCalledWith(
      'door-1',
      mockUpdateDoor,
      mockDoors[0], // original door
      {
        x: 100,
        y: 50,
        width: 80,
        wallId: 'wall-1',
      }
    );
    expect(mockExecuteCommand).toHaveBeenCalled();

    expect(result.current.editState.isDragging).toBe(false);
    expect(result.current.editState.originalDoor).toBeNull();
  });

  it('should end drag without changes and not create command', () => {
    const { result } = renderHook(() => useDoorEditor());

    // Start drag
    act(() => {
      result.current.startDrag('door-1', 'move', 50, 0);
    });

    // End drag without changes (door remains the same)
    act(() => {
      result.current.endDrag('door-1');
    });

    expect(MockUpdateDoorCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
    expect(result.current.editState.isDragging).toBe(false);
  });

  it('should revert to original position when final position is invalid', () => {
    const { result } = renderHook(() => useDoorEditor());

    // Start drag
    act(() => {
      result.current.startDrag('door-1', 'move', 50, 0);
    });

    // Update drag to trigger position change (this will call canPlaceDoor and succeed)
    act(() => {
      result.current.updateDrag('door-1', 'move', 100, 50);
    });

    // Simulate door position change in store
    const updatedDoor = { ...mockDoors[0], x: 100, y: 50, wallId: 'wall-1' };
    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: [updatedDoor, mockDoors[1]],
      windows: mockWindows,
      updateDoor: mockUpdateDoor,
      removeDoor: mockRemoveDoor,
      addDoor: mockAddDoor,
      selectedElementId: null,
      selectedElementType: null,
    } as any);

    // Mock invalid final position for endDrag validation
    mockCanPlaceDoor.mockReturnValueOnce({
      isValid: true,
      position: { x: 100, y: 50 },
      wallId: 'wall-1',
    }).mockReturnValueOnce({
      isValid: false,
      position: { x: 100, y: 50 },
      wallId: null,
    });

    // End drag
    act(() => {
      result.current.endDrag('door-1');
    });

    expect(mockUpdateDoor).toHaveBeenCalledWith('door-1', mockDoors[0]); // Revert to original
    expect(MockUpdateDoorCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should not end drag when not dragging', () => {
    const { result } = renderHook(() => useDoorEditor());

    act(() => {
      result.current.endDrag('door-1');
    });

    expect(mockCanPlaceDoor).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should delete selected door', () => {
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      selectedElementId: 'door-1',
      selectedElementType: 'door',
    } as any);

    const { result } = renderHook(() => useDoorEditor());

    act(() => {
      result.current.deleteSelectedDoor();
    });

    expect(MockRemoveDoorCommand).toHaveBeenCalledWith(
      'door-1',
      mockAddDoor,
      mockRemoveDoor,
      mockDoors[0]
    );
    expect(mockExecuteCommand).toHaveBeenCalled();
  });

  it('should not delete when no door is selected', () => {
    const { result } = renderHook(() => useDoorEditor());

    act(() => {
      result.current.deleteSelectedDoor();
    });

    expect(MockRemoveDoorCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should not delete when selected element is not a door', () => {
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      selectedElementId: 'wall-1',
      selectedElementType: 'wall',
    } as any);

    const { result } = renderHook(() => useDoorEditor());

    act(() => {
      result.current.deleteSelectedDoor();
    });

    expect(MockRemoveDoorCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should not delete when selected door does not exist', () => {
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      selectedElementId: 'non-existent-door',
      selectedElementType: 'door',
    } as any);

    const { result } = renderHook(() => useDoorEditor());

    act(() => {
      result.current.deleteSelectedDoor();
    });

    expect(MockRemoveDoorCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should enforce minimum and maximum width during resize', () => {
    const { result } = renderHook(() => useDoorEditor());

    // Start resize drag
    act(() => {
      result.current.startDrag('door-1', 'resize', 50, 0);
    });

    // Test minimum width (should be 40px)
    act(() => {
      result.current.updateDrag('door-1', 'resize', 55, 0); // Very small drag distance
    });

    expect(mockUpdateDoor).toHaveBeenCalledWith('door-1', {
      width: 40, // Minimum width enforced
    });

    mockUpdateDoor.mockClear();

    // Test maximum width (should be 200px)
    act(() => {
      result.current.updateDrag('door-1', 'resize', 200, 0); // Large drag distance
    });

    expect(mockUpdateDoor).toHaveBeenCalledWith('door-1', {
      width: 200, // Maximum width enforced
    });
  });

  it('should handle drag state transitions correctly', () => {
    const { result } = renderHook(() => useDoorEditor());

    // Initial state
    expect(result.current.editState.isDragging).toBe(false);

    // Start drag
    act(() => {
      result.current.startDrag('door-1', 'resize', 50, 0);
    });

    expect(result.current.editState.isDragging).toBe(true);
    expect(result.current.editState.dragType).toBe('resize');

    // End drag
    act(() => {
      result.current.endDrag('door-1');
    });

    expect(result.current.editState.isDragging).toBe(false);
    expect(result.current.editState.dragType).toBeNull();
    expect(result.current.editState.originalDoor).toBeNull();
    expect(result.current.editState.dragStartPos).toBeNull();
  });

  it('should handle multiple drag operations in sequence', () => {
    const { result } = renderHook(() => useDoorEditor());

    // First drag operation - just start and end without changes
    act(() => {
      result.current.startDrag('door-1', 'move', 50, 0);
      result.current.endDrag('door-1');
    });

    expect(result.current.editState.isDragging).toBe(false);

    // Second drag operation - just start and end without changes
    act(() => {
      result.current.startDrag('door-2', 'resize', 150, 100);
      result.current.endDrag('door-2');
    });

    expect(result.current.editState.isDragging).toBe(false);
    // No updates should happen since we didn't call updateDrag
    expect(mockUpdateDoor).not.toHaveBeenCalled();
  });
});