
import { renderHook, act } from '@testing-library/react';
import { useStairTool } from '@/hooks/useStairTool';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useUIStore } from '@/stores/uiStore';
import { useHistoryStore } from '@/stores/historyStore';
import * as snapping from '@/utils/snapping';

// Mock the stores
jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');
jest.mock('@/stores/uiStore');
jest.mock('@/stores/historyStore');

// Mock snapping utility
jest.mock('@/utils/snapping', () => ({
  snapPoint: jest.fn(point => point),
  getWallSnapPoints: jest.fn(() => []),
}));

describe('useStairTool', () => {
  const mockAddStair = jest.fn();
  const mockSelectElement = jest.fn();
  const mockAddElementToFloor = jest.fn();
  const mockSetActiveTool = jest.fn();
  const mockExecuteCommand = jest.fn((command) => {
  command.execute();
});

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock store implementations
    (useDesignStore as jest.Mock).mockImplementation(() => ({
      walls: [],
      addStair: mockAddStair,
      selectElement: mockSelectElement,
    }));
    (useFloorStore as jest.Mock).mockImplementation(() => ({
      currentFloorId: 'floor1',
      addElementToFloor: mockAddElementToFloor,
    }));
    (useUIStore as jest.Mock).mockImplementation(() => ({
      snapToGrid: false,
      gridSize: 10,
      setActiveTool: mockSetActiveTool,
    }));
    (useHistoryStore as jest.Mock).mockImplementation(() => ({
      executeCommand: mockExecuteCommand,
    }));

    // Mock Date.now() for consistent IDs
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(useStairTool).toBeDefined();
  });

  it('should start drawing a stair', () => {
    const { result } = renderHook(() => useStairTool());

    act(() => {
      result.current.startDrawing({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 10, y: 20 }),
          }),
        },
      } as any);
    });

    expect(result.current.isDrawing).toBe(true);
    expect(result.current.previewStair).toBeDefined();
    expect(result.current.previewStair?.x).toBe(10);
    expect(result.current.previewStair?.y).toBe(20);
  });

  it('should update drawing a stair', () => {
    const { result } = renderHook(() => useStairTool());

    act(() => {
      result.current.startDrawing({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 0, y: 0 }),
          }),
        },
      } as any);
    });

    act(() => {
      result.current.updateDrawing({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 100, y: 200 }),
          }),
        },
      } as any);
    });

    expect(result.current.previewStair?.width).toBe(100);
    expect(result.current.previewStair?.length).toBe(200);
    expect(result.current.previewStair?.orientation).toBe('vertical');
  });

  it('should finish drawing a stair', () => {
    const { result } = renderHook(() => useStairTool());

    act(() => {
      result.current.startDrawing({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 0, y: 0 }),
          }),
        },
      } as any);
    });

    act(() => {
      result.current.finishDrawing();
    });

    expect(mockExecuteCommand).toHaveBeenCalledTimes(1);
    expect(mockAddStair).toHaveBeenCalledTimes(1);
    expect(mockAddElementToFloor).toHaveBeenCalledTimes(1);
    expect(mockSetActiveTool).toHaveBeenCalledWith('select');
    expect(mockSelectElement).toHaveBeenCalledWith(expect.any(String), 'stair');
    expect(result.current.isDrawing).toBe(false);
    expect(result.current.previewStair).toBeNull();
  });

  it('should cancel drawing a stair', () => {
    const { result } = renderHook(() => useStairTool());

    act(() => {
      result.current.startDrawing({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 0, y: 0 }),
          }),
        },
      } as any);
    });

    act(() => {
      result.current.cancelDrawing();
    });

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.previewStair).toBeNull();
  });
});
