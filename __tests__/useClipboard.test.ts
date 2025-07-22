import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '@/hooks/useClipboard';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useFloorStore } from '@/stores/floorStore';

// Mock the stores
jest.mock('@/stores/designStore');
jest.mock('@/stores/historyStore');
jest.mock('@/stores/floorStore');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseHistoryStore = useHistoryStore as jest.MockedFunction<typeof useHistoryStore>;
const mockUseFloorStore = useFloorStore as jest.MockedFunction<typeof useFloorStore>;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useClipboard', () => {
  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 6, height: 96, materialId: 'default' },
  ];

  const mockDoors = [
    { id: 'door-1', x: 50, y: 0, width: 36, height: 80, wallId: 'wall-1', materialId: 'default' },
  ];

  const mockWindows = [
    { id: 'window-1', x: 100, y: 50, width: 48, height: 36, wallId: 'wall-2', materialId: 'default' },
  ];

  const mockStairs = [
    { id: 'stair-1', x: 200, y: 200, width: 120, height: 240, steps: 12, materialId: 'default' },
  ];

  const mockRoofs = [
    { id: 'roof-1', points: [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 100, y: 100 }], materialId: 'default', position: { x: 0, y: 0 } },
  ];

  const mockAddWall = jest.fn();
  const mockAddDoor = jest.fn();
  const mockAddWindow = jest.fn();
  const mockAddStair = jest.fn();
  const mockAddRoof = jest.fn();
  const mockSelectElement = jest.fn();
  const mockExecuteCommand = jest.fn();
  const mockAddElementToFloor = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    mockUseDesignStore.mockReturnValue({
      selectedElementId: null,
      selectedElementType: null,
      walls: mockWalls,
      doors: mockDoors,
      windows: mockWindows,
      stairs: mockStairs,
      roofs: mockRoofs,
      addWall: mockAddWall,
      addDoor: mockAddDoor,
      addWindow: mockAddWindow,
      addStair: mockAddStair,
      addRoof: mockAddRoof,
      selectElement: mockSelectElement,
    } as any);

    mockUseHistoryStore.mockReturnValue({
      executeCommand: mockExecuteCommand,
    } as any);

    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor-1',
      addElementToFloor: mockAddElementToFloor,
    } as any);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useClipboard());
    
    expect(typeof result.current.copyElement).toBe('function');
    expect(typeof result.current.pasteElement).toBe('function');
    expect(typeof result.current.hasClipboardData).toBe('function');
    expect(typeof result.current.getClipboardType).toBe('function');
  });

  it('should return null when copying with no selected element', () => {
    const { result } = renderHook(() => useClipboard());
    
    const copiedData = result.current.copyElement();
    
    expect(copiedData).toBeNull();
  });

  it('should copy wall element successfully', () => {
    mockUseDesignStore.mockReturnValue({
      selectedElementId: 'wall-1',
      selectedElementType: 'wall',
      walls: mockWalls,
      doors: mockDoors,
      windows: mockWindows,
      stairs: mockStairs,
      roofs: mockRoofs,
      addWall: mockAddWall,
      addDoor: mockAddDoor,
      addWindow: mockAddWindow,
      addStair: mockAddStair,
      addRoof: mockAddRoof,
      selectElement: mockSelectElement,
    } as any);

    const { result } = renderHook(() => useClipboard());
    
    const copiedData = result.current.copyElement();
    
    expect(copiedData).toEqual({
      type: 'wall',
      element: mockWalls[0]
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'house-planner-clipboard',
      JSON.stringify({
        type: 'wall',
        element: mockWalls[0]
      })
    );
  });

  it('should copy door element successfully', () => {
    mockUseDesignStore.mockReturnValue({
      selectedElementId: 'door-1',
      selectedElementType: 'door',
      walls: mockWalls,
      doors: mockDoors,
      windows: mockWindows,
      stairs: mockStairs,
      roofs: mockRoofs,
      addWall: mockAddWall,
      addDoor: mockAddDoor,
      addWindow: mockAddWindow,
      addStair: mockAddStair,
      addRoof: mockAddRoof,
      selectElement: mockSelectElement,
    } as any);

    const { result } = renderHook(() => useClipboard());
    
    const copiedData = result.current.copyElement();
    
    expect(copiedData).toEqual({
      type: 'door',
      element: mockDoors[0]
    });
  });

  it('should paste wall element successfully', () => {
    const clipboardData = {
      type: 'wall',
      element: mockWalls[0]
    };
    
    localStorageMock.setItem('house-planner-clipboard', JSON.stringify(clipboardData));

    const { result } = renderHook(() => useClipboard());
    
    let pastedElement: any;
    act(() => {
      pastedElement = result.current.pasteElement(50, 50);
    });

    expect(mockExecuteCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PASTE_WALL',
        description: 'Paste wall',
        execute: expect.any(Function),
        undo: expect.any(Function),
      })
    );

    // Execute the command to test the actual pasting
    const command = mockExecuteCommand.mock.calls[0][0];
    command.execute();

    expect(mockAddElementToFloor).toHaveBeenCalledWith(
      'floor-1',
      'walls',
      expect.objectContaining({
        startX: 50, // original 0 + offset 50
        startY: 50, // original 0 + offset 50
        endX: 150, // original 100 + offset 50
        endY: 50,  // original 0 + offset 50
      })
    );
    expect(mockAddWall).toHaveBeenCalled();
    expect(mockSelectElement).toHaveBeenCalled();
  });

  it('should paste door element with cleared wall association', () => {
    const clipboardData = {
      type: 'door',
      element: mockDoors[0]
    };
    
    localStorageMock.setItem('house-planner-clipboard', JSON.stringify(clipboardData));

    const { result } = renderHook(() => useClipboard());
    
    act(() => {
      result.current.pasteElement(25, 25);
    });

    const command = mockExecuteCommand.mock.calls[0][0];
    command.execute();

    expect(mockAddElementToFloor).toHaveBeenCalledWith(
      'floor-1',
      'doors',
      expect.objectContaining({
        x: 75, // original 50 + offset 25
        y: 25, // original 0 + offset 25
        wallId: '', // Should be cleared
      })
    );
  });

  it('should paste roof element successfully', () => {
    const clipboardData = {
      type: 'roof',
      element: mockRoofs[0]
    };
    
    localStorageMock.setItem('house-planner-clipboard', JSON.stringify(clipboardData));

    const { result } = renderHook(() => useClipboard());
    
    act(() => {
      result.current.pasteElement(100, 100);
    });

    const command = mockExecuteCommand.mock.calls[0][0];
    command.execute();

    expect(mockAddElementToFloor).toHaveBeenCalledWith(
      'floor-1',
      'roofs',
      expect.objectContaining({
        position: {
          x: 100, // original 0 + offset 100
          y: 100, // original 0 + offset 100
        }
      })
    );
  });

  it('should return null when pasting with no clipboard data', () => {
    const { result } = renderHook(() => useClipboard());
    
    const pastedElement = result.current.pasteElement();
    
    expect(pastedElement).toBeNull();
  });

  it('should handle invalid clipboard data gracefully', () => {
    localStorageMock.setItem('house-planner-clipboard', 'invalid json');

    const { result } = renderHook(() => useClipboard());
    
    const pastedElement = result.current.pasteElement();
    
    expect(pastedElement).toBeNull();
  });

  it('should check if clipboard has data', () => {
    const { result } = renderHook(() => useClipboard());
    
    // No data initially
    expect(result.current.hasClipboardData()).toBe(false);
    
    // Add data
    localStorageMock.setItem('house-planner-clipboard', JSON.stringify({
      type: 'wall',
      element: mockWalls[0]
    }));
    
    expect(result.current.hasClipboardData()).toBe(true);
  });

  it('should get clipboard type', () => {
    const { result } = renderHook(() => useClipboard());
    
    // No data initially
    expect(result.current.getClipboardType()).toBeNull();
    
    // Add wall data
    localStorageMock.setItem('house-planner-clipboard', JSON.stringify({
      type: 'wall',
      element: mockWalls[0]
    }));
    
    expect(result.current.getClipboardType()).toBe('wall');
  });

  it('should handle getClipboardType with invalid data', () => {
    localStorageMock.setItem('house-planner-clipboard', 'invalid json');

    const { result } = renderHook(() => useClipboard());
    
    expect(result.current.getClipboardType()).toBeNull();
  });

  it('should use default offset values when not provided', () => {
    const clipboardData = {
      type: 'wall',
      element: mockWalls[0]
    };
    
    localStorageMock.setItem('house-planner-clipboard', JSON.stringify(clipboardData));

    const { result } = renderHook(() => useClipboard());
    
    act(() => {
      result.current.pasteElement(); // No offset provided
    });

    const command = mockExecuteCommand.mock.calls[0][0];
    command.execute();

    expect(mockAddElementToFloor).toHaveBeenCalledWith(
      'floor-1',
      'walls',
      expect.objectContaining({
        startX: 50, // original 0 + default offset 50
        startY: 50, // original 0 + default offset 50
      })
    );
  });

  it('should handle all element types in copy operation', () => {
    const elementTypes = [
      { type: 'wall', id: 'wall-1', elements: mockWalls },
      { type: 'door', id: 'door-1', elements: mockDoors },
      { type: 'window', id: 'window-1', elements: mockWindows },
      { type: 'stair', id: 'stair-1', elements: mockStairs },
      { type: 'roof', id: 'roof-1', elements: mockRoofs },
    ];

    elementTypes.forEach(({ type, id, elements }) => {
      mockUseDesignStore.mockReturnValue({
        selectedElementId: id,
        selectedElementType: type,
        walls: type === 'wall' ? elements : [],
        doors: type === 'door' ? elements : [],
        windows: type === 'window' ? elements : [],
        stairs: type === 'stair' ? elements : [],
        roofs: type === 'roof' ? elements : [],
        addWall: mockAddWall,
        addDoor: mockAddDoor,
        addWindow: mockAddWindow,
        addStair: mockAddStair,
        addRoof: mockAddRoof,
        selectElement: mockSelectElement,
      } as any);

      const { result } = renderHook(() => useClipboard());
      const copiedData = result.current.copyElement();

      expect(copiedData).toEqual({
        type,
        element: elements[0]
      });
    });
  });
});