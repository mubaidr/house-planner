import { renderHook, act } from '@testing-library/react';
import { useWindowEditor } from '@/hooks/useWindowEditor';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useHistoryStore } from '@/stores/historyStore';
import { canPlaceWindow } from '@/utils/wallConstraints';
import { UpdateWindowCommand, RemoveWindowCommand } from '@/utils/history';

// Mock the dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');
jest.mock('@/stores/historyStore');
jest.mock('@/utils/wallConstraints');
jest.mock('@/utils/history', () => ({
  UpdateWindowCommand: jest.fn(),
  RemoveWindowCommand: jest.fn(),
}));

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseFloorStore = useFloorStore as jest.MockedFunction<typeof useFloorStore>;
const mockUseHistoryStore = useHistoryStore as jest.MockedFunction<typeof useHistoryStore>;
const mockCanPlaceWindow = canPlaceWindow as jest.MockedFunction<typeof canPlaceWindow>;
const MockUpdateWindowCommand = UpdateWindowCommand as jest.MockedFunction<typeof UpdateWindowCommand>;
const MockRemoveWindowCommand = RemoveWindowCommand as jest.MockedFunction<typeof RemoveWindowCommand>;

describe('useWindowEditor', () => {
  const mockWindows = [
    { 
      id: 'window-1', 
      x: 75, 
      y: 0, 
      width: 120, 
      height: 100, 
      wallId: 'wall-1', 
      materialId: 'default',
      style: 'casement',
      material: 'wood',
      color: '#8B4513',
      opacity: 0.7
    },
    { 
      id: 'window-2', 
      x: 175, 
      y: 100, 
      width: 100, 
      height: 80, 
      wallId: 'wall-2', 
      materialId: 'default' 
    },
  ];

  const mockDoors = [
    { id: 'door-1', x: 25, y: 0, width: 80, height: 200, wallId: 'wall-1', materialId: 'default' },
  ];

  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 300, endY: 0, thickness: 8, height: 240 },
    { id: 'wall-2', startX: 300, startY: 0, endX: 300, endY: 200, thickness: 8, height: 240 },
  ];

  const mockUpdateWindow = jest.fn();
  const mockRemoveWindow = jest.fn();
  const mockAddWindow = jest.fn();
  const mockUpdateElementInFloor = jest.fn();
  const mockExecuteCommand = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockReturnValue({
      windows: mockWindows,
      doors: mockDoors,
      walls: mockWalls,
      selectedElementId: null,
      selectedElementType: null,
      updateWindow: mockUpdateWindow,
      removeWindow: mockRemoveWindow,
      addWindow: mockAddWindow,
    } as any);

    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor-1',
      updateElementInFloor: mockUpdateElementInFloor,
    } as any);

    mockUseHistoryStore.mockReturnValue({
      executeCommand: mockExecuteCommand,
    } as any);

    mockCanPlaceWindow.mockReturnValue({
      isValid: true,
      position: { x: 150, y: 75 },
      wallId: 'wall-1',
    });

    MockUpdateWindowCommand.mockImplementation((windowId, updateFn, originalWindow, newWindow) => ({
      type: 'UPDATE_WINDOW',
      windowId,
      updateFn,
      originalWindow,
      newWindow,
      execute: jest.fn(),
      undo: jest.fn(),
    } as any));

    MockRemoveWindowCommand.mockImplementation((windowId, addFn, removeFn, window) => ({
      type: 'REMOVE_WINDOW',
      windowId,
      addFn,
      removeFn,
      window,
      execute: jest.fn(),
      undo: jest.fn(),
    } as any));
  });

  it('should initialize with default edit state', () => {
    const { result } = renderHook(() => useWindowEditor());

    expect(result.current.editState).toEqual({
      isDragging: false,
      dragType: null,
      originalWindow: null,
      dragStartPos: null,
    });

    expect(typeof result.current.startDrag).toBe('function');
    expect(typeof result.current.updateDrag).toBe('function');
    expect(typeof result.current.endDrag).toBe('function');
    expect(typeof result.current.deleteSelectedWindow).toBe('function');
  });

  it('should start drag operation for existing window', () => {
    const { result } = renderHook(() => useWindowEditor());

    act(() => {
      result.current.startDrag('window-1', 'move', 150, 75);
    });

    expect(result.current.editState.isDragging).toBe(true);
    expect(result.current.editState.dragType).toBe('move');
    expect(result.current.editState.originalWindow).toEqual(mockWindows[0]);
    expect(result.current.editState.dragStartPos).toEqual({ x: 150, y: 75 });
  });

  it('should not start drag for non-existent window', () => {
    const { result } = renderHook(() => useWindowEditor());

    act(() => {
      result.current.startDrag('non-existent-window', 'move', 150, 75);
    });

    expect(result.current.editState.isDragging).toBe(false);
    expect(result.current.editState.originalWindow).toBeNull();
  });

  it('should handle resize drag updates with style preservation', () => {
    const { result } = renderHook(() => useWindowEditor());

    // Start drag
    act(() => {
      result.current.startDrag('window-1', 'resize', 75, 0);
    });

    // Update drag with resize
    act(() => {
      result.current.updateDrag('window-1', 'resize', 150, 0);
    });

    expect(mockUpdateWindow).toHaveBeenCalledWith('window-1', {
      width: expect.any(Number), // Width calculated from drag distance
      style: 'casement', // Preserved from original
      material: 'wood', // Preserved from original
      color: '#8B4513', // Preserved from original
      opacity: 0.7, // Preserved from original
    });
    expect(mockUpdateElementInFloor).toHaveBeenCalledWith(
      'floor-1',
      'windows',
      'window-1',
      expect.objectContaining({ 
        width: expect.any(Number),
        style: 'casement',
      })
    );
  });

  it('should handle move drag updates with valid position', () => {
    const { result } = renderHook(() => useWindowEditor());

    // Start drag
    act(() => {
      result.current.startDrag('window-1', 'move', 75, 0);
    });

    // Update drag with move
    act(() => {
      result.current.updateDrag('window-1', 'move', 150, 75);
    });

    expect(mockCanPlaceWindow).toHaveBeenCalledWith(
      { x: 150, y: 75 },
      120, // window width
      mockWalls,
      mockDoors,
      [mockWindows[1]] // other windows (excluding current)
    );

    expect(mockUpdateWindow).toHaveBeenCalledWith('window-1', {
      x: 150,
      y: 75,
      wallId: 'wall-1',
      style: 'casement', // Preserved
      material: 'wood', // Preserved
      color: '#8B4513', // Preserved
      opacity: 0.7, // Preserved
    });
  });

  it('should not update drag when not dragging', () => {
    const { result } = renderHook(() => useWindowEditor());

    act(() => {
      result.current.updateDrag('window-1', 'move', 150, 75);
    });

    expect(mockUpdateWindow).not.toHaveBeenCalled();
    expect(mockCanPlaceWindow).not.toHaveBeenCalled();
  });

  it('should not update drag for non-existent window', () => {
    const { result } = renderHook(() => useWindowEditor());

    // Start drag for existing window
    act(() => {
      result.current.startDrag('window-1', 'move', 75, 0);
    });

    // Try to update drag for different window
    act(() => {
      result.current.updateDrag('non-existent-window', 'move', 150, 75);
    });

    expect(mockUpdateWindow).not.toHaveBeenCalled();
  });

  it('should handle move drag with invalid position', () => {
    mockCanPlaceWindow.mockReturnValue({
      isValid: false,
      position: { x: 150, y: 75 },
      wallId: null,
    });

    const { result } = renderHook(() => useWindowEditor());

    act(() => {
      result.current.startDrag('window-1', 'move', 75, 0);
      result.current.updateDrag('window-1', 'move', 150, 75);
    });

    expect(mockCanPlaceWindow).toHaveBeenCalledWith(
      { x: 150, y: 75 },
      120, // window width
      mockWalls,
      mockDoors,
      [mockWindows[1]] // other windows (excluding current)
    );
    expect(mockUpdateWindow).not.toHaveBeenCalled();
  });

  it('should end drag with valid changes and create command', () => {
    const { result } = renderHook(() => useWindowEditor());

    // Start drag
    act(() => {
      result.current.startDrag('window-1', 'move', 75, 0);
    });

    // Update drag to trigger position change
    act(() => {
      result.current.updateDrag('window-1', 'move', 150, 75);
    });

    // Simulate window position change in store
    const updatedWindow = { ...mockWindows[0], x: 150, y: 75, wallId: 'wall-1' };
    mockUseDesignStore.mockReturnValue({
      windows: [updatedWindow, mockWindows[1]],
      doors: mockDoors,
      walls: mockWalls,
      updateWindow: mockUpdateWindow,
      removeWindow: mockRemoveWindow,
      addWindow: mockAddWindow,
      selectedElementId: null,
      selectedElementType: null,
    } as any);

    // End drag
    act(() => {
      result.current.endDrag('window-1');
    });

    expect(mockCanPlaceWindow).toHaveBeenCalledTimes(2); // Once in updateDrag, once in endDrag
    expect(MockUpdateWindowCommand).toHaveBeenCalledWith(
      'window-1',
      mockUpdateWindow,
      mockWindows[0], // original window
      {
        x: 150,
        y: 75,
        width: 120,
        wallId: 'wall-1',
      }
    );
    expect(mockExecuteCommand).toHaveBeenCalled();

    expect(result.current.editState.isDragging).toBe(false);
    expect(result.current.editState.originalWindow).toBeNull();
  });

  it('should end drag without changes and not create command', () => {
    const { result } = renderHook(() => useWindowEditor());

    // Start drag
    act(() => {
      result.current.startDrag('window-1', 'move', 75, 0);
    });

    // End drag without changes (window remains the same)
    act(() => {
      result.current.endDrag('window-1');
    });

    expect(MockUpdateWindowCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
    expect(result.current.editState.isDragging).toBe(false);
  });

  it('should revert to original position when final position is invalid', () => {
    const { result } = renderHook(() => useWindowEditor());

    // Start drag
    act(() => {
      result.current.startDrag('window-1', 'move', 75, 0);
    });

    // Simulate window position change
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      windows: [
        { ...mockWindows[0], x: 150, y: 75 }, // Changed window
        mockWindows[1],
      ],
    } as any);

    // Mock invalid final position
    mockCanPlaceWindow.mockReturnValue({
      isValid: false,
      position: { x: 150, y: 75 },
      wallId: null,
    });

    // End drag
    act(() => {
      result.current.endDrag('window-1');
    });

    expect(mockUpdateWindow).toHaveBeenCalledWith('window-1', mockWindows[0]); // Revert to original
    expect(MockUpdateWindowCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should delete selected window', () => {
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      selectedElementId: 'window-1',
      selectedElementType: 'window',
    } as any);

    const { result } = renderHook(() => useWindowEditor());

    act(() => {
      result.current.deleteSelectedWindow();
    });

    expect(MockRemoveWindowCommand).toHaveBeenCalledWith(
      'window-1',
      mockAddWindow,
      mockRemoveWindow,
      mockWindows[0]
    );
    expect(mockExecuteCommand).toHaveBeenCalled();
  });

  it('should not delete when no window is selected', () => {
    const { result } = renderHook(() => useWindowEditor());

    act(() => {
      result.current.deleteSelectedWindow();
    });

    expect(MockRemoveWindowCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should not delete when selected element is not a window', () => {
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      selectedElementId: 'door-1',
      selectedElementType: 'door',
    } as any);

    const { result } = renderHook(() => useWindowEditor());

    act(() => {
      result.current.deleteSelectedWindow();
    });

    expect(MockRemoveWindowCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should enforce minimum and maximum width during resize', () => {
    const { result } = renderHook(() => useWindowEditor());

    // Start resize drag
    act(() => {
      result.current.startDrag('window-1', 'resize', 75, 0);
    });

    // Test minimum width (should be 60px)
    act(() => {
      result.current.updateDrag('window-1', 'resize', 80, 0); // Very small drag distance
    });

    expect(mockUpdateWindow).toHaveBeenCalledWith('window-1', expect.objectContaining({
      width: 60, // Minimum width enforced
    }));

    mockUpdateWindow.mockClear();

    // Test maximum width (should be 300px)
    act(() => {
      result.current.updateDrag('window-1', 'resize', 250, 0); // Large drag distance
    });

    expect(mockUpdateWindow).toHaveBeenCalledWith('window-1', expect.objectContaining({
      width: 300, // Maximum width enforced
    }));
  });

  it('should preserve window properties during resize', () => {
    const { result } = renderHook(() => useWindowEditor());

    act(() => {
      result.current.startDrag('window-1', 'resize', 75, 0);
      result.current.updateDrag('window-1', 'resize', 150, 0);
    });

    expect(mockUpdateWindow).toHaveBeenCalledWith('window-1', {
      width: expect.any(Number),
      style: 'casement',
      material: 'wood',
      color: '#8B4513',
      opacity: 0.7,
    });
  });

  it('should preserve window properties during move', () => {
    const { result } = renderHook(() => useWindowEditor());

    act(() => {
      result.current.startDrag('window-1', 'move', 75, 0);
      result.current.updateDrag('window-1', 'move', 150, 75);
    });

    expect(mockUpdateWindow).toHaveBeenCalledWith('window-1', {
      x: 150,
      y: 75,
      wallId: 'wall-1',
      style: 'casement',
      material: 'wood',
      color: '#8B4513',
      opacity: 0.7,
    });
  });

  it('should handle window without optional properties', () => {
    const { result } = renderHook(() => useWindowEditor());

    // Test with window-2 which doesn't have style, material, color, opacity
    act(() => {
      result.current.startDrag('window-2', 'resize', 175, 100);
      result.current.updateDrag('window-2', 'resize', 250, 100);
    });

    expect(mockUpdateWindow).toHaveBeenCalledWith('window-2', {
      width: expect.any(Number),
      // Should not include undefined properties
    });
  });

  it('should handle drag state transitions correctly', () => {
    const { result } = renderHook(() => useWindowEditor());

    // Initial state
    expect(result.current.editState.isDragging).toBe(false);

    // Start drag
    act(() => {
      result.current.startDrag('window-1', 'resize', 75, 0);
    });

    expect(result.current.editState.isDragging).toBe(true);
    expect(result.current.editState.dragType).toBe('resize');

    // End drag
    act(() => {
      result.current.endDrag('window-1');
    });

    expect(result.current.editState.isDragging).toBe(false);
    expect(result.current.editState.dragType).toBeNull();
    expect(result.current.editState.originalWindow).toBeNull();
    expect(result.current.editState.dragStartPos).toBeNull();
  });

  it('should handle multiple drag operations in sequence', () => {
    const { result } = renderHook(() => useWindowEditor());

    // First drag operation
    act(() => {
      result.current.startDrag('window-1', 'move', 75, 0);
      result.current.updateDrag('window-1', 'move', 150, 75);
      result.current.endDrag('window-1');
    });

    expect(result.current.editState.isDragging).toBe(false);

    // Second drag operation
    act(() => {
      result.current.startDrag('window-2', 'resize', 175, 100);
      result.current.updateDrag('window-2', 'resize', 250, 100);
      result.current.endDrag('window-2');
    });

    expect(result.current.editState.isDragging).toBe(false);
    expect(mockUpdateWindow).toHaveBeenCalledTimes(4); // 2 updates per drag operation
  });

  it('should not end drag when not dragging', () => {
    const { result } = renderHook(() => useWindowEditor());

    act(() => {
      result.current.endDrag('window-1');
    });

    expect(mockCanPlaceWindow).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should not delete when selected window does not exist', () => {
    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      selectedElementId: 'non-existent-window',
      selectedElementType: 'window',
    } as any);

    const { result } = renderHook(() => useWindowEditor());

    act(() => {
      result.current.deleteSelectedWindow();
    });

    expect(MockRemoveWindowCommand).not.toHaveBeenCalled();
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });
});