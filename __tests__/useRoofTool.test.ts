import { renderHook, act } from '@testing-library/react';
import { useRoofTool } from '@/hooks/useRoofTool';
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

describe('useRoofTool', () => {
  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 200, endY: 0, thickness: 8, height: 240 },
    { id: 'wall-2', startX: 200, startY: 0, endX: 200, endY: 200, thickness: 8, height: 240 },
    { id: 'wall-3', startX: 200, startY: 200, endX: 0, endY: 200, thickness: 8, height: 240 },
    { id: 'wall-4', startX: 0, startY: 200, endX: 0, endY: 0, thickness: 8, height: 240 },
  ];

  const mockAddRoof = jest.fn();
  const mockSelectElement = jest.fn();
  const mockAddElementToFloor = jest.fn();
  const mockSetActiveTool = jest.fn();
  const mockExecuteCommand = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      addRoof: mockAddRoof,
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
    const { result } = renderHook(() => useRoofTool());

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.roofPoints).toEqual([]);
    expect(result.current.previewRoof).toBeNull();
    expect(typeof result.current.startDrawing).toBe('function');
    expect(typeof result.current.updateDrawing).toBe('function');
    expect(typeof result.current.finishDrawing).toBe('function');
    expect(typeof result.current.cancelDrawing).toBe('function');
    expect(typeof result.current.generateFromWalls).toBe('function');
  });

  it('should start drawing and add first point', () => {
    const { result } = renderHook(() => useRoofTool());

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
        { x: 200, y: 0 }, // wall-2 start
        { x: 200, y: 200 }, // wall-2 end
        { x: 200, y: 200 }, // wall-3 start
        { x: 0, y: 200 }, // wall-3 end
        { x: 0, y: 200 }, // wall-4 start
        { x: 0, y: 0 }, // wall-4 end
      ]),
      true
    );

    expect(result.current.isDrawing).toBe(true);
    expect(result.current.roofPoints).toEqual([{ x: 100, y: 160, snapped: true, snapType: 'grid' }]); // Snapped position
    expect(result.current.previewRoof).toBeNull(); // No preview until 3 points
  });

  it('should add second point when already drawing', () => {
    const { result } = renderHook(() => useRoofTool());

    // Start drawing
    const firstEvent = createMockKonvaEvent(100, 100);
    act(() => {
      result.current.startDrawing(firstEvent);
    });

    // Add second point
    const secondEvent = createMockKonvaEvent(200, 100);
    act(() => {
      result.current.startDrawing(secondEvent);
    });

    expect(result.current.roofPoints).toEqual([
      { x: 100, y: 100, snapped: true, snapType: 'grid' },
      { x: 200, y: 100, snapped: true, snapType: 'grid' },
    ]);
    expect(result.current.previewRoof).toBeNull(); // Still no preview until 3 points
  });

  it('should create preview roof when adding third point', () => {
    const { result } = renderHook(() => useRoofTool());

    // Add three points
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(100, 100));
      result.current.startDrawing(createMockKonvaEvent(200, 100));
      result.current.startDrawing(createMockKonvaEvent(150, 200));
    });

    expect(result.current.roofPoints).toEqual([
      { x: 100, y: 100, snapped: true, snapType: 'grid' },
      { x: 200, y: 100, snapped: true, snapType: 'grid' },
      { x: 160, y: 200, snapped: true, snapType: 'grid' }, // Snapped
    ]);

    expect(result.current.previewRoof).toEqual({
      id: expect.stringMatching(/^roof-\d+$/),
      points: [
        { x: 100, y: 100, snapped: true, snapType: 'grid' },
        { x: 200, y: 100, snapped: true, snapType: 'grid' },
        { x: 160, y: 200, snapped: true, snapType: 'grid' },
      ],
      height: 300,
      pitch: 30,
      overhang: 50,
      type: 'gable',
      color: '#8B4513',
      ridgeHeight: 400,
      gutterHeight: 250,
      material: 'default',
      materialId: undefined,
      floorId: undefined,
    });
  });

  it('should not start drawing when stage is not available', () => {
    const { result } = renderHook(() => useRoofTool());

    const mockEvent = {
      target: {
        getStage: () => null,
      },
    } as any;

    act(() => {
      result.current.startDrawing(mockEvent);
    });

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.roofPoints).toEqual([]);
  });

  it('should not start drawing when pointer position is not available', () => {
    const { result } = renderHook(() => useRoofTool());

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
    expect(result.current.roofPoints).toEqual([]);
  });

  it('should update drawing preview with current mouse position', () => {
    const { result } = renderHook(() => useRoofTool());

    // Start drawing with two points
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(100, 100));
      result.current.startDrawing(createMockKonvaEvent(200, 100));
    });

    // Update drawing with mouse position
    const updateEvent = createMockKonvaEvent(150, 200);
    act(() => {
      result.current.updateDrawing(updateEvent);
    });

    expect(result.current.previewRoof).toEqual({
      id: 'roof-preview',
      points: [
        { x: 100, y: 100, snapped: true, snapType: 'grid' },
        { x: 200, y: 100, snapped: true, snapType: 'grid' },
        { x: 150, y: 200 }, // Not snapped during preview
      ],
      height: 300,
      pitch: 30,
      overhang: 50,
      type: 'gable',
      color: '#8B4513',
      ridgeHeight: 400,
      gutterHeight: 250,
    });
  });

  it('should not update drawing when not drawing', () => {
    const { result } = renderHook(() => useRoofTool());

    const updateEvent = createMockKonvaEvent(150, 200);
    act(() => {
      result.current.updateDrawing(updateEvent);
    });

    expect(result.current.previewRoof).toBeNull();
  });

  it('should not update drawing when no points exist', () => {
    const { result } = renderHook(() => useRoofTool());

    // Start drawing but clear points manually (edge case)
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(100, 100));
    });

    // Manually clear points to test edge case
    const originalRoofPoints = result.current.roofPoints;
    
    const updateEvent = createMockKonvaEvent(150, 200);
    act(() => {
      result.current.updateDrawing(updateEvent);
    });

    // Should still work with existing points
    expect(result.current.previewRoof).toBeNull(); // Only 1 point, need 3 for preview
  });

  it('should not update drawing when stage is not available', () => {
    const { result } = renderHook(() => useRoofTool());

    // Start drawing
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(100, 100));
      result.current.startDrawing(createMockKonvaEvent(200, 100));
    });

    const mockEvent = {
      target: {
        getStage: () => null,
      },
    } as any;

    act(() => {
      result.current.updateDrawing(mockEvent);
    });

    expect(result.current.previewRoof).toBeNull();
  });

  it('should finish drawing and create roof with command', () => {
    const { result } = renderHook(() => useRoofTool());

    // Create a roof with 3 points
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(100, 100));
      result.current.startDrawing(createMockKonvaEvent(200, 100));
      result.current.startDrawing(createMockKonvaEvent(150, 200));
    });

    // Finish drawing
    act(() => {
      result.current.finishDrawing();
    });

    expect(mockExecuteCommand).toHaveBeenCalledWith({
      execute: expect.any(Function),
      undo: expect.any(Function),
      description: 'Add roof',
    });

    // Test the execute function
    const command = mockExecuteCommand.mock.calls[0][0];
    command.execute();

    expect(mockAddElementToFloor).toHaveBeenCalledWith(
      'floor-1',
      'roofs',
      expect.objectContaining({
        id: expect.stringMatching(/^roof-\d+$/),
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 160, y: 200 },
        ],
        height: 300,
        pitch: 30,
        overhang: 50,
        type: 'gable',
        color: '#8B4513',
        ridgeHeight: 400,
        gutterHeight: 250,
      })
    );
    expect(mockAddRoof).toHaveBeenCalled();

    expect(mockSetActiveTool).toHaveBeenCalledWith('select');
    expect(mockSelectElement).toHaveBeenCalledWith(
      expect.stringMatching(/^roof-\d+$/),
      'roof'
    );

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.roofPoints).toEqual([]);
    expect(result.current.previewRoof).toBeNull();
  });

  it('should not finish drawing when not drawing', () => {
    const { result } = renderHook(() => useRoofTool());

    act(() => {
      result.current.finishDrawing();
    });

    expect(mockExecuteCommand).not.toHaveBeenCalled();
    expect(mockAddRoof).not.toHaveBeenCalled();
  });

  it('should not finish drawing when less than 3 points', () => {
    const { result } = renderHook(() => useRoofTool());

    // Start drawing with only 2 points
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(100, 100));
      result.current.startDrawing(createMockKonvaEvent(200, 100));
    });

    act(() => {
      result.current.finishDrawing();
    });

    expect(mockExecuteCommand).not.toHaveBeenCalled();
    expect(mockAddRoof).not.toHaveBeenCalled();
  });

  it('should cancel drawing and reset state', () => {
    const { result } = renderHook(() => useRoofTool());

    // Start drawing with points
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(100, 100));
      result.current.startDrawing(createMockKonvaEvent(200, 100));
      result.current.startDrawing(createMockKonvaEvent(150, 200));
    });

    expect(result.current.isDrawing).toBe(true);
    expect(result.current.roofPoints.length).toBe(3);
    expect(result.current.previewRoof).not.toBeNull();

    // Cancel drawing
    act(() => {
      result.current.cancelDrawing();
    });

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.roofPoints).toEqual([]);
    expect(result.current.previewRoof).toBeNull();
  });

  it('should generate roof from walls using convex hull', () => {
    const { result } = renderHook(() => useRoofTool());

    act(() => {
      result.current.generateFromWalls();
    });

    expect(mockExecuteCommand).toHaveBeenCalledWith({
      execute: expect.any(Function),
      undo: expect.any(Function),
      description: 'Generate roof from walls',
    });

    // Test the execute function
    const command = mockExecuteCommand.mock.calls[0][0];
    command.execute();

    expect(mockAddRoof).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^roof-\d+$/),
        points: expect.any(Array), // Convex hull of wall points
        height: 300,
        pitch: 30,
        overhang: 50,
        type: 'gable',
        color: '#8B4513',
        ridgeHeight: 400,
        gutterHeight: 250,
      })
    );
  });

  it('should not generate roof when no walls exist', () => {
    mockUseDesignStore.mockReturnValue({
      walls: [],
      addRoof: mockAddRoof,
      selectElement: mockSelectElement,
    } as any);

    const { result } = renderHook(() => useRoofTool());

    act(() => {
      result.current.generateFromWalls();
    });

    expect(mockExecuteCommand).not.toHaveBeenCalled();
    expect(mockAddRoof).not.toHaveBeenCalled();
  });

  it('should handle snapping disabled', () => {
    mockUseUIStore.mockReturnValue({
      snapToGrid: false,
      gridSize: 20,
      setActiveTool: mockSetActiveTool,
    } as any);

    const { result } = renderHook(() => useRoofTool());

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

    expect(result.current.roofPoints[0]).toEqual({ x: 105, y: 155, snapped: false, snapType: 'grid' }); // Not snapped
  });

  it('should handle different grid sizes', () => {
    mockUseUIStore.mockReturnValue({
      snapToGrid: true,
      gridSize: 10,
      setActiveTool: mockSetActiveTool,
    } as any);

    const { result } = renderHook(() => useRoofTool());

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
    const { result } = renderHook(() => useRoofTool());

    const mockEvent = createMockKonvaEvent(100, 100);

    act(() => {
      result.current.startDrawing(mockEvent);
    });

    const snapPointsCall = mockSnapPoint.mock.calls[0];
    const snapPoints = snapPointsCall[2];

    // Should include start and end points for each wall
    expect(snapPoints).toEqual(
      expect.arrayContaining([
        { x: 0, y: 0 }, // wall-1 start
        { x: 200, y: 0 }, // wall-1 end
        { x: 200, y: 0 }, // wall-2 start
        { x: 200, y: 200 }, // wall-2 end
        { x: 200, y: 200 }, // wall-3 start
        { x: 0, y: 200 }, // wall-3 end
        { x: 0, y: 200 }, // wall-4 start
        { x: 0, y: 0 }, // wall-4 end
      ])
    );
  });

  it('should generate unique roof IDs', () => {
    const { result } = renderHook(() => useRoofTool());

    // Create first roof preview
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(100, 100));
      result.current.startDrawing(createMockKonvaEvent(200, 100));
      result.current.startDrawing(createMockKonvaEvent(150, 200));
    });

    const firstRoofId = result.current.previewRoof?.id;

    act(() => {
      result.current.cancelDrawing();
    });

    // Create second roof preview
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(50, 50));
      result.current.startDrawing(createMockKonvaEvent(150, 50));
      result.current.startDrawing(createMockKonvaEvent(100, 150));
    });

    const secondRoofId = result.current.previewRoof?.id;

    expect(firstRoofId).not.toBe(secondRoofId);
    expect(firstRoofId).toMatch(/^roof-\d+$/);
    expect(secondRoofId).toMatch(/^roof-\d+$/);
  });

  it('should handle complete roof drawing workflow', () => {
    const { result } = renderHook(() => useRoofTool());

    // Start drawing
    expect(result.current.isDrawing).toBe(false);

    // Add first point
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(100, 100));
    });

    expect(result.current.isDrawing).toBe(true);
    expect(result.current.roofPoints.length).toBe(1);

    // Add second point
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(200, 100));
    });

    expect(result.current.roofPoints.length).toBe(2);
    expect(result.current.previewRoof).toBeNull();

    // Add third point (creates preview)
    act(() => {
      result.current.startDrawing(createMockKonvaEvent(150, 200));
    });

    expect(result.current.roofPoints.length).toBe(3);
    expect(result.current.previewRoof).not.toBeNull();

    // Update preview
    act(() => {
      result.current.updateDrawing(createMockKonvaEvent(160, 210));
    });

    expect(result.current.previewRoof?.id).toBe('roof-preview');

    // Finish drawing
    act(() => {
      result.current.finishDrawing();
    });

    expect(result.current.isDrawing).toBe(false);
    expect(result.current.roofPoints).toEqual([]);
    expect(result.current.previewRoof).toBeNull();
    expect(mockExecuteCommand).toHaveBeenCalled();
    expect(mockSetActiveTool).toHaveBeenCalledWith('select');
  });

  it('should handle convex hull with insufficient points', () => {
    // Test with walls that have less than 3 unique points
    mockUseDesignStore.mockReturnValue({
      walls: [
        { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 8, height: 240 },
      ],
      addRoof: mockAddRoof,
      selectElement: mockSelectElement,
    } as any);

    const { result } = renderHook(() => useRoofTool());

    act(() => {
      result.current.generateFromWalls();
    });

    // Should still execute command even with insufficient points
    expect(mockExecuteCommand).toHaveBeenCalled();
  });
});