import { renderHook, act } from '@testing-library/react';
import { useRoofTool } from '@/hooks/useRoofTool';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useUIStore } from '@/stores/uiStore';
import { useHistoryStore } from '@/stores/historyStore';
import * as snapping from '@/utils/snapping';

// Define mock functions as singletons
const mockAddRoof = jest.fn();
const mockSelectElement = jest.fn();
const mockAddElementToFloor = jest.fn();
const mockSetActiveTool = jest.fn();
const mockExecuteCommand = jest.fn((command) => {
  command.execute();
});

// Mock the stores to return the singleton mock functions
jest.mock('@/stores/designStore', () => ({
  useDesignStore: jest.fn(() => ({
    walls: [],
    addRoof: mockAddRoof,
    selectElement: mockSelectElement,
  })),
}));
jest.mock('@/stores/floorStore', () => ({
  useFloorStore: jest.fn(() => ({
    currentFloorId: 'floor1',
    addElementToFloor: mockAddElementToFloor,
  })),
}));
jest.mock('@/stores/uiStore', () => ({
  useUIStore: jest.fn(() => ({
    snapToGrid: false,
    gridSize: 10,
    setActiveTool: mockSetActiveTool,
  })),
}));
jest.mock('@/stores/historyStore', () => ({
  useHistoryStore: jest.fn(() => ({
    executeCommand: mockExecuteCommand,
  })),
}));

// Mock snapping utility
jest.mock('@/utils/snapping', () => ({
  snapPoint: jest.fn(point => point),
}));

describe('useRoofTool', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset mock implementations for the stores (important for tests that modify mock behavior)
    (useDesignStore as jest.Mock).mockImplementation(() => ({
      walls: [],
      addRoof: mockAddRoof,
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
    (snapping.snapPoint as jest.Mock).mockImplementation(point => point);

    // Mock Date.now() for consistent IDs
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(useRoofTool).toBeDefined();
  });

  it('should start drawing a roof', () => {
    const { result } = renderHook(() => useRoofTool());

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
    expect(result.current.roofPoints).toEqual([{ x: 10, y: 20 }]);
  });

  it('should add points to roof and create preview', () => {
    const { result } = renderHook(() => useRoofTool());

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
      result.current.startDrawing({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 100, y: 0 }),
          }),
        },
      } as any);
    });

    act(() => {
      result.current.startDrawing({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 100, y: 100 }),
          }),
        },
      } as any);
    });

    expect(result.current.roofPoints).toHaveLength(3);
    expect(result.current.previewRoof).toBeDefined();
    expect(result.current.previewRoof?.points).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ]);
  });

  it('should update drawing preview', () => {
    const { result } = renderHook(() => useRoofTool());

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
      result.current.startDrawing({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 100, y: 0 }),
          }),
        },
      } as any);
    });

    act(() => {
      result.current.updateDrawing({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 50, y: 50 }),
          }),
        },
      } as any);
    });

    expect(result.current.previewRoof?.points).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 50 },
    ]);
  });

  it('should finish drawing a roof', () => {
    const { result } = renderHook(() => useRoofTool());

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
      result.current.startDrawing({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 100, y: 0 }),
          }),
        },
      } as any);
    });
    act(() => {
      result.current.startDrawing({
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 100, y: 100 }),
          }),
        },
      } as any);
    });

    act(() => {
      result.current.finishDrawing();
    });

    expect(mockExecuteCommand).toHaveBeenCalledTimes(1);
    expect(mockAddRoof).toHaveBeenCalledTimes(1);
    expect(mockAddElementToFloor).toHaveBeenCalledTimes(1);
    expect(mockSetActiveTool).toHaveBeenCalledWith('select');
    expect(mockSelectElement).toHaveBeenCalledWith('roof-1234567890', 'roof');
    expect(result.current.isDrawing).toBe(false);
    expect(result.current.roofPoints).toHaveLength(0);
    expect(result.current.previewRoof).toBeNull();
  });

  it('should cancel drawing a roof', () => {
    const { result } = renderHook(() => useRoofTool());

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
    expect(result.current.roofPoints).toHaveLength(0);
    expect(result.current.previewRoof).toBeNull();
  });

  it('should generate roof from walls', () => {
    // Set walls directly on the mocked store instance before rendering the hook
    (useDesignStore as jest.Mock).mockImplementation(() => ({
      walls: [
        { startX: 0, startY: 0, endX: 100, endY: 0 },
        { startX: 100, startY: 0, endX: 100, endY: 100 },
        { startX: 100, startY: 100, endX: 0, endY: 100 },
        { startX: 0, startY: 100, endX: 0, endY: 0 },
      ],
      addRoof: mockAddRoof,
      selectElement: mockSelectElement,
    }));

    const { result } = renderHook(() => useRoofTool());

    act(() => {
      result.current.generateFromWalls();
    });

    expect(mockExecuteCommand).toHaveBeenCalledTimes(1);
    expect(mockAddRoof).toHaveBeenCalledTimes(1);
    expect(mockAddRoof).toHaveBeenCalledWith(expect.objectContaining({
      id: 'roof-1234567890',
      points: expect.arrayContaining([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ]),
    }));
  });
});