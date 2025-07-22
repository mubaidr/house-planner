import { renderHook, act } from '@testing-library/react';
import { useAlignmentTool } from '../src/hooks/useAlignmentTool';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useHistoryStore } from '@/stores/historyStore';

// Mock the stores
jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');
jest.mock('@/stores/historyStore');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseFloorStore = useFloorStore as jest.MockedFunction<typeof useFloorStore>;
const mockUseHistoryStore = useHistoryStore as jest.MockedFunction<typeof useHistoryStore>;

describe('useAlignmentTool', () => {
  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 6, height: 96, materialId: 'default' },
    { id: 'wall-2', startX: 100, startY: 0, endX: 100, endY: 100, thickness: 6, height: 96, materialId: 'default' },
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
    { id: 'roof-1', points: [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 100, y: 100 }], materialId: 'default' },
  ];

  const mockUpdateWall = jest.fn();
  const mockUpdateDoor = jest.fn();
  const mockUpdateWindow = jest.fn();
  const mockUpdateStair = jest.fn();
  const mockUpdateRoof = jest.fn();
  const mockExecuteCommand = jest.fn();
  const mockUpdateElementInFloor = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: mockDoors,
      windows: mockWindows,
      stairs: mockStairs,
      roofs: mockRoofs,
      updateWall: mockUpdateWall,
      updateDoor: mockUpdateDoor,
      updateWindow: mockUpdateWindow,
      updateStair: mockUpdateStair,
      updateRoof: mockUpdateRoof,
    } as any);

    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor-1',
      updateElementInFloor: mockUpdateElementInFloor,
    } as any);

    mockUseHistoryStore.mockReturnValue({
      executeCommand: mockExecuteCommand,
    } as any);
  });

  it('should initialize and provide alignment functions', () => {
    const { result } = renderHook(() => useAlignmentTool());
    
    expect(result.current).toBeDefined();
    expect(typeof result.current.alignLeftElements).toBe('function');
    expect(typeof result.current.alignRightElements).toBe('function');
    expect(typeof result.current.alignTopElements).toBe('function');
    expect(typeof result.current.alignBottomElements).toBe('function');
    expect(typeof result.current.alignCenterHorizontalElements).toBe('function');
    expect(typeof result.current.alignCenterVerticalElements).toBe('function');
    expect(typeof result.current.distributeHorizontallyElements).toBe('function');
    expect(typeof result.current.distributeVerticallyElements).toBe('function');
    expect(typeof result.current.getAlignmentGuides).toBe('function');
  });

  it('should execute alignment commands through history store', () => {
    const { result } = renderHook(() => useAlignmentTool());

    act(() => {
      result.current.alignLeftElements();
    });

    expect(mockExecuteCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ALIGN_ELEMENTS',
        description: 'Align left',
        execute: expect.any(Function),
        undo: expect.any(Function),
      })
    );
  });

  it('should generate alignment guides for elements', () => {
    const { result } = renderHook(() => useAlignmentTool());

    const guides = result.current.getAlignmentGuides();
    expect(guides).toBeDefined();
    expect(Array.isArray(guides)).toBe(true);
  });

  it('should handle alignment with different element types', () => {
    const { result } = renderHook(() => useAlignmentTool());

    act(() => {
      result.current.alignTopElements();
    });

    expect(mockExecuteCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ALIGN_ELEMENTS',
        description: 'Align top',
      })
    );
  });

  it('should handle distribution operations', () => {
    const { result } = renderHook(() => useAlignmentTool());

    act(() => {
      result.current.distributeHorizontallyElements();
    });

    expect(mockExecuteCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ALIGN_ELEMENTS',
        description: 'Distribute horizontally',
      })
    );

    act(() => {
      result.current.distributeVerticallyElements();
    });

    expect(mockExecuteCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ALIGN_ELEMENTS',
        description: 'Distribute vertically',
      })
    );
  });

  it('should handle center alignment operations', () => {
    const { result } = renderHook(() => useAlignmentTool());

    act(() => {
      result.current.alignCenterHorizontalElements();
    });

    expect(mockExecuteCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Align center horizontal',
      })
    );

    act(() => {
      result.current.alignCenterVerticalElements();
    });

    expect(mockExecuteCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Align center vertical',
      })
    );
  });

  it('should handle empty element arrays gracefully', () => {
    // Mock empty arrays
    mockUseDesignStore.mockReturnValue({
      walls: [],
      doors: [],
      windows: [],
      stairs: [],
      roofs: [],
      updateWall: mockUpdateWall,
      updateDoor: mockUpdateDoor,
      updateWindow: mockUpdateWindow,
      updateStair: mockUpdateStair,
      updateRoof: mockUpdateRoof,
    } as any);

    const { result } = renderHook(() => useAlignmentTool());

    act(() => {
      result.current.alignLeftElements();
    });

    // Should not execute command with no elements
    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });
});
