import { renderHook, act } from '@testing-library/react';
import { useStairTool } from '@/hooks/useStairTool';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useUIStore } from '@/stores/uiStore';
import { useHistoryStore } from '@/stores/historyStore';
import { snapPoint } from '@/utils/snapping';

// Mock the dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');
jest.mock('@/stores/uiStore');
jest.mock('@/stores/historyStore');
jest.mock('@/utils/snapping');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseFloorStore = useFloorStore as jest.MockedFunction<typeof useFloorStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;
const mockUseHistoryStore = useHistoryStore as jest.MockedFunction<typeof useHistoryStore>;
const mockSnapPoint = snapPoint as jest.MockedFunction<typeof snapPoint>;

// Mock Konva event object
const createMockKonvaEvent = (x: number, y: number) => ({
  target: {
    getStage: () => ({
      getPointerPosition: () => ({ x, y }),
    }),
  },
} as any);

describe('useStairTool', () => {
  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 200, endY: 0, thickness: 8, height: 240 },
    { id: 'wall-2', startX: 200, startY: 0, endX: 200, endY: 200, thickness: 8, height: 240 },
  ];

  const mockAddStair = jest.fn();
  const mockSelectElement = jest.fn();
  const mockAddElementToFloor = jest.fn();
  const mockSetActiveTool = jest.fn();
  const mockExecuteCommand = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      addStair: mockAddStair,
      selectElement: mockSelectElement,
    } as any);

    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor-1',
      addElementToFloor: mockAddElementToFloor,
    } as any);

    mockUseUIStore.mockReturnValue({
      snapToGrid: true,
      gridSize: 20,
      setActiveTool: mockSetActiveTool,
    } as any);

    mockUseHistoryStore.mockReturnValue({
      executeCommand: mockExecuteCommand,
    } as any);

    mockSnapPoint.mockImplementation((point, gridSize, snapPoints, snapToGrid) => ({
      x: snapToGrid ? Math.round(point.x / gridSize) * gridSize : point.x,
      y: snapToGrid ? Math.round(point.y / gridSize) * gridSize : point.y,
      snapped: snapToGrid,
      snapType: 'grid' as const,
    }));
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useStairTool());

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.previewStair).toBeNull();
    expect(typeof result.current.startDrawing).toBe('function');
    expect(typeof result.current.updateDrawing).toBe('function');
    expect(typeof result.current.finishDrawing).toBe('function');
    expect(typeof result.current.cancelDrawing).toBe('function');
  });

  it('should start drawing and create preview stair', () => {
    const { result } = renderHook(() => useStairTool());

    const mockEvent = createMockKonvaEvent(100, 150);

    act(() => {
      result.current.startDrawing(mockEvent);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 100, y: 150 },
      20,
      expect.arrayContaining([
        { x: 0, y: 0 }, // wall-1 start
        { x: 200, y: 0 }, // wall-1 end
        { x: 100, y: 0 }, // wall-1 midpoint
        { x: 200, y: 0 }, // wall-2 start
        { x: 200, y: 200 }, // wall-2 end
        { x: 200, y: 100 }, // wall-2 midpoint
      ]),
      true
    );

    expect(result.current.isDrawing).toBe(true);
    expect(result.current.previewStair).toEqual({
      id: expect.stringMatching(/^stair-\d+-[a-z0-9]+$/),
      x: 100, // Snapped position
      y: 160, // Snapped position (150 rounded to nearest 20)
      width: 120,
      length: 200,
      steps: 12,
      stepHeight: 18,
      stepDepth: 25,
      direction: 'up',
      orientation: 'horizontal',
      type: 'straight',
      material: 'Concrete',
      materialId: undefined,
      color: '#8B4513',
      handrailLeft: true,
      handrailRight: true,
      floorId: undefined,
    });
  });

  it('should not start drawing when stage is not available', () => {
    const { result } = renderHook(() => useStairTool());

    const mockEvent = {
      target: {
        getStage: () => null,
      },
    } as any;

    act(() => {
      result.current.startDrawing(mockEvent);
    });

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.previewStair).toBeNull();
  });

  it('should not start drawing when pointer position is not available', () => {
    const { result } = renderHook(() => useStairTool());

    const mockEvent = {
      target: {
        getStage: () => ({
          getPointerPosition: () => null,
        }),
      },
    } as any;

    act(() => {
      result.current.startDrawing(mockEvent);
    });

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.previewStair).toBeNull();
  });

  it('should update drawing dimensions and orientation', () => {
    const { result } = renderHook(() => useStairTool());

    // Start drawing
    const startEvent = createMockKonvaEvent(100, 100);
    act(() => {
      result.current.startDrawing(startEvent);
    });

    // Update drawing - horizontal orientation (width > length)
    const updateEvent = createMockKonvaEvent(250, 150);
    act(() => {
      result.current.updateDrawing(updateEvent);
    });

    expect(result.current.previewStair).toEqual(
      expect.objectContaining({
        width: 150, // abs(250 - 100)
        length: 100, // abs(150 - 100), but minimum 100 enforced
        orientation: 'horizontal', // width > length
        steps: 3, // Math.max(3, Math.min(20, Math.floor(100 / 25)))
      })
    );
  });

  it('should update drawing with vertical orientation', () => {
    const { result } = renderHook(() => useStairTool());

    // Start drawing
    const startEvent = createMockKonvaEvent(100, 100);
    act(() => {
      result.current.startDrawing(startEvent);
    });

    // Update drawing - vertical orientation (length > width)
    const updateEvent = createMockKonvaEvent(150, 300);
    act(() => {
      result.current.updateDrawing(updateEvent);
    });

    expect(result.current.previewStair).toEqual(
      expect.objectContaining({
        width: 60, // abs(150 - 100), but minimum 60 enforced
        length: 200, // abs(300 - 100)
        orientation: 'vertical', // length > width
        steps: 8, // Math.max(3, Math.min(20, Math.floor(200 / 25)))
      })
    );
  });

  it('should enforce minimum dimensions', () => {
    const { result } = renderHook(() => useStairTool());

    // Start drawing
    const startEvent = createMockKonvaEvent(100, 100);
    act(() => {
      result.current.startDrawing(startEvent);
    });

    // Update drawing with very small dimensions
    const updateEvent = createMockKonvaEvent(110, 110);
    act(() => {
      result.current.updateDrawing(updateEvent);
    });

    expect(result.current.previewStair).toEqual(
      expect.objectContaining({
        width: 60, // Minimum width enforced
        length: 100, // Minimum length enforced
        steps: 3, // Math.max(3, Math.min(20, Math.floor(100 / 25)))
      })
    );
  });

  it('should calculate steps based on length', () => {
    const { result } = renderHook(() => useStairTool());

    // Start drawing
    const startEvent = createMockKonvaEvent(100, 100);
    act(() => {
      result.current.startDrawing(startEvent);
    });

    // Test different lengths
    const testCases = [
      { length: 50, expectedSteps: 3 }, // Math.max(3, Math.floor(50/25)) = 3
      { length: 100, expectedSteps: 4 }, // Math.max(3, Math.floor(100/25)) = 4
      { length: 250, expectedSteps: 10 }, // Math.max(3, Math.floor(250/25)) = 10
      { length: 600, expectedSteps: 20 }, // Math.min(20, Math.floor(600/25)) = 20
    ];

    testCases.forEach(({ length, expectedSteps }) => {
      const updateEvent = createMockKonvaEvent(100, 100 + length);
      act(() => {
        result.current.updateDrawing(updateEvent);
      });

      expect(result.current.previewStair?.steps).toBe(expectedSteps);
    });
  });

  it('should not update drawing when not drawing', () => {
    const { result } = renderHook(() => useStairTool());

    const updateEvent = createMockKonvaEvent(200, 200);
    act(() => {
      result.current.updateDrawing(updateEvent);
    });

    expect(result.current.previewStair).toBeNull();
  });

  it('should not update drawing when stage is not available', () => {
    const { result } = renderHook(() => useStairTool());

    // Start drawing first
    const startEvent = createMockKonvaEvent(100, 100);
    act(() => {
      result.current.startDrawing(startEvent);
    });

    const mockEvent = {
      target: {
        getStage: () => null,
      },
    } as any;

    const originalPreviewStair = result.current.previewStair;

    act(() => {
      result.current.updateDrawing(mockEvent);
    });

    // Should remain unchanged
    expect(result.current.previewStair).toEqual(originalPreviewStair);
  });

  it('should finish drawing and create stair with command', () => {
    const { result } = renderHook(() => useStairTool());

    // Start drawing
    const startEvent = createMockKonvaEvent(100, 100);
    act(() => {
      result.current.startDrawing(startEvent);
    });

    // Update drawing
    const updateEvent = createMockKonvaEvent(200, 250);
    act(() => {
      result.current.updateDrawing(updateEvent);
    });

    // Finish drawing
    act(() => {
      result.current.finishDrawing();
    });

    expect(mockExecuteCommand).toHaveBeenCalledWith({
      type: 'ADD_STAIR',
      execute: expect.any(Function),
      undo: expect.any(Function),
      description: 'Add stair',
    });

    // Test the execute function
    const command = mockExecuteCommand.mock.calls[0][0];
    command.execute();

    expect(mockAddElementToFloor).toHaveBeenCalledWith(
      'floor-1',
      'stairs',
      expect.objectContaining({
        id: expect.stringMatching(/^stair-\d+-[a-z0-9]+$/),
        x: 100,
        y: 100,
      })
    );
    expect(mockAddStair).toHaveBeenCalled();

    expect(mockSetActiveTool).toHaveBeenCalledWith('select');
    expect(mockSelectElement).toHaveBeenCalledWith(
      expect.stringMatching(/^stair-\d+-[a-z0-9]+$/),
      'stair'
    );

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.previewStair).toBeNull();
  });

  it('should not finish drawing when not drawing', () => {
    const { result } = renderHook(() => useStairTool());

    act(() => {
      result.current.finishDrawing();
    });

    expect(mockExecuteCommand).not.toHaveBeenCalled();
    expect(mockAddStair).not.toHaveBeenCalled();
  });

  it('should not finish drawing when no preview stair exists', () => {
    const { result } = renderHook(() => useStairTool());

    // Manually set drawing state without preview stair
    act(() => {
      const startEvent = createMockKonvaEvent(100, 100);
      result.current.startDrawing(startEvent);
    });

    // Clear preview stair
    act(() => {
      result.current.cancelDrawing();
    });

    // Try to finish
    act(() => {
      result.current.finishDrawing();
    });

    expect(mockExecuteCommand).not.toHaveBeenCalled();
  });

  it('should cancel drawing and reset state', () => {
    const { result } = renderHook(() => useStairTool());

    // Start drawing
    const startEvent = createMockKonvaEvent(100, 100);
    act(() => {
      result.current.startDrawing(startEvent);
    });

    expect(result.current.isDrawing).toBe(true);
    expect(result.current.previewStair).not.toBeNull();

    // Cancel drawing
    act(() => {
      result.current.cancelDrawing();
    });

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.previewStair).toBeNull();
  });

  it('should handle snapping disabled', () => {
    mockUseUIStore.mockReturnValue({
      snapToGrid: false,
      gridSize: 20,
      setActiveTool: mockSetActiveTool,
    } as any);

    const { result } = renderHook(() => useStairTool());

    const mockEvent = createMockKonvaEvent(105, 155);

    act(() => {
      result.current.startDrawing(mockEvent);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 105, y: 155 },
      20,
      expect.any(Array),
      false // Snapping disabled
    );

    expect(result.current.previewStair?.x).toBe(105); // Not snapped
    expect(result.current.previewStair?.y).toBe(155); // Not snapped
  });

  it('should handle different grid sizes', () => {
    mockUseUIStore.mockReturnValue({
      snapToGrid: true,
      gridSize: 10,
      setActiveTool: mockSetActiveTool,
    } as any);

    const { result } = renderHook(() => useStairTool());

    const mockEvent = createMockKonvaEvent(105, 155);

    act(() => {
      result.current.startDrawing(mockEvent);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 105, y: 155 },
      10, // Different grid size
      expect.any(Array),
      true
    );
  });

  it('should generate wall snap points correctly', () => {
    const { result } = renderHook(() => useStairTool());

    const mockEvent = createMockKonvaEvent(100, 100);

    act(() => {
      result.current.startDrawing(mockEvent);
    });

    const snapPointsCall = mockSnapPoint.mock.calls[0];
    const snapPoints = snapPointsCall[2];

    // Should include start, end, and midpoint for each wall
    expect(snapPoints).toEqual(
      expect.arrayContaining([
        { x: 0, y: 0 }, // wall-1 start
        { x: 200, y: 0 }, // wall-1 end
        { x: 100, y: 0 }, // wall-1 midpoint
        { x: 200, y: 0 }, // wall-2 start
        { x: 200, y: 200 }, // wall-2 end
        { x: 200, y: 100 }, // wall-2 midpoint
      ])
    );
  });

  it('should generate unique stair IDs', () => {
    const { result } = renderHook(() => useStairTool());

    // Create first stair
    const startEvent1 = createMockKonvaEvent(100, 100);
    act(() => {
      result.current.startDrawing(startEvent1);
    });

    const firstStairId = result.current.previewStair?.id;

    act(() => {
      result.current.cancelDrawing();
    });

    // Create second stair
    const startEvent2 = createMockKonvaEvent(200, 200);
    act(() => {
      result.current.startDrawing(startEvent2);
    });

    const secondStairId = result.current.previewStair?.id;

    expect(firstStairId).not.toBe(secondStairId);
    expect(firstStairId).toMatch(/^stair-\d+-[a-z0-9]+$/);
    expect(secondStairId).toMatch(/^stair-\d+-[a-z0-9]+$/);
  });

  it('should handle complete drawing workflow', () => {
    const { result } = renderHook(() => useStairTool());

    // Start drawing
    const startEvent = createMockKonvaEvent(50, 50);
    act(() => {
      result.current.startDrawing(startEvent);
    });

    expect(result.current.isDrawing).toBe(true);

    // Update multiple times
    const updateEvent1 = createMockKonvaEvent(100, 100);
    act(() => {
      result.current.updateDrawing(updateEvent1);
    });

    const updateEvent2 = createMockKonvaEvent(150, 200);
    act(() => {
      result.current.updateDrawing(updateEvent2);
    });

    expect(result.current.previewStair).toEqual(
      expect.objectContaining({
        width: 90, // abs(150 - 60) with snapping
        length: 140, // abs(200 - 60) with snapping  
        orientation: 'vertical', // length > width
        steps: 5, // Math.max(3, Math.min(20, Math.floor(140 / 25)))
      })
    );

    // Finish drawing
    act(() => {
      result.current.finishDrawing();
    });

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.previewStair).toBeNull();
    expect(mockExecuteCommand).toHaveBeenCalled();
    expect(mockSetActiveTool).toHaveBeenCalledWith('select');
  });
});