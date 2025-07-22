import { renderHook, act } from '@testing-library/react';
import { useMeasureTool } from '@/hooks/useMeasureTool';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useUnitStore } from '@/stores/unitStore';
import { snapPoint, getWallSnapPoints } from '@/utils/snapping';
import { formatLength } from '@/utils/unitUtils';

// Mock the dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/uiStore');
jest.mock('@/stores/unitStore');
jest.mock('@/utils/snapping');
jest.mock('@/utils/unitUtils');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;
const mockUseUnitStore = useUnitStore as jest.MockedFunction<typeof useUnitStore>;
const mockSnapPoint = snapPoint as jest.MockedFunction<typeof snapPoint>;
const mockGetWallSnapPoints = getWallSnapPoints as jest.MockedFunction<typeof getWallSnapPoints>;
const mockFormatLength = formatLength as jest.MockedFunction<typeof formatLength>;

describe('useMeasureTool', () => {
  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 8, height: 240 },
    { id: 'wall-2', startX: 100, startY: 0, endX: 100, endY: 100, thickness: 8, height: 240 },
  ];

  const mockSnapPoints = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
    } as any);

    mockUseUIStore.mockReturnValue({
      activeTool: 'measure',
      snapToGrid: true,
      gridSize: 20,
    } as any);

    mockUseUnitStore.mockReturnValue({
      unitSystem: 'metric',
      precision: 1,
      showUnitLabels: true,
    } as any);

    mockGetWallSnapPoints.mockReturnValue(mockSnapPoints);

    mockSnapPoint.mockImplementation((point, gridSize, snapPoints, snapToGrid) => ({
      x: snapToGrid ? Math.round(point.x / gridSize) * gridSize : point.x,
      y: snapToGrid ? Math.round(point.y / gridSize) * gridSize : point.y,
      snapped: snapToGrid,
      snapType: 'grid' as const,
    }));

    mockFormatLength.mockImplementation((length, unitSystem, precision, showLabels) => 
      `${length.toFixed(precision)}${showLabels ? 'm' : ''}`
    );
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMeasureTool());

    expect(result.current.measureState).toEqual({
      isMeasuring: false,
      startPoint: null,
      currentPoint: null,
      measurements: [],
      showAllMeasurements: true,
    });

    expect(typeof result.current.startMeasurement).toBe('function');
    expect(typeof result.current.updateMeasurement).toBe('function');
    expect(typeof result.current.finishMeasurement).toBe('function');
    expect(typeof result.current.cancelMeasurement).toBe('function');
    expect(typeof result.current.removeMeasurement).toBe('function');
    expect(typeof result.current.clearAllMeasurements).toBe('function');
    expect(typeof result.current.toggleShowAllMeasurements).toBe('function');
    expect(typeof result.current.getCurrentDistance).toBe('function');
  });

  it('should start measurement when measure tool is active', () => {
    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(50, 75);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 50, y: 75 },
      20,
      mockSnapPoints,
      true
    );

    expect(result.current.measureState.isMeasuring).toBe(true);
    expect(result.current.measureState.startPoint).toEqual({
      x: 60,
      y: 80,
      snapped: true,
      snapType: 'grid',
    });
    expect(result.current.measureState.currentPoint).toEqual({
      x: 60,
      y: 80,
      snapped: true,
      snapType: 'grid',
    });
  });

  it('should not start measurement when tool is not active', () => {
    mockUseUIStore.mockReturnValue({
      activeTool: 'wall',
      snapToGrid: true,
      gridSize: 20,
    } as any);

    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(50, 75);
    });

    expect(result.current.measureState.isMeasuring).toBe(false);
    expect(mockSnapPoint).not.toHaveBeenCalled();
  });

  it('should update measurement position when measuring', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Start measurement
    act(() => {
      result.current.startMeasurement(0, 0);
    });

    // Update position
    act(() => {
      result.current.updateMeasurement(100, 50);
    });

    expect(result.current.measureState.currentPoint).toEqual({
      x: 100,
      y: 60,
      snapped: true,
      snapType: 'grid',
    });
  });

  it('should not update measurement when not measuring', () => {
    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.updateMeasurement(100, 50);
    });

    expect(result.current.measureState.currentPoint).toBeNull();
  });

  it('should finish measurement and create measurement when distance is sufficient', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Start measurement
    act(() => {
      result.current.startMeasurement(0, 0);
    });

    // Update to create sufficient distance
    act(() => {
      result.current.updateMeasurement(100, 0);
    });

    // Finish measurement
    act(() => {
      result.current.finishMeasurement();
    });

    expect(result.current.measureState.measurements).toHaveLength(1);
    
    const measurement = result.current.measureState.measurements[0];
    expect(measurement.id).toMatch(/^measurement-\d+$/);
    expect(measurement.startPoint).toEqual({
      x: 0,
      y: 0,
      snapped: true,
      snapType: 'grid',
    });
    expect(measurement.endPoint).toEqual({
      x: 100,
      y: 0,
      snapped: true,
      snapType: 'grid',
    });
    expect(measurement.distance).toBe(100);
    expect(measurement.angle).toBe(0);
    expect(measurement.label).toBe('');
    expect(measurement.timestamp).toBeGreaterThan(0);

    expect(result.current.measureState.isMeasuring).toBe(false);
    expect(result.current.measureState.startPoint).toBeNull();
    expect(result.current.measureState.currentPoint).toBeNull();
  });

  it('should not create measurement when distance is too small', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Start measurement
    act(() => {
      result.current.startMeasurement(0, 0);
    });

    // Update to create insufficient distance
    act(() => {
      result.current.updateMeasurement(3, 0);
    });

    // Finish measurement
    act(() => {
      result.current.finishMeasurement();
    });

    expect(result.current.measureState.measurements).toHaveLength(0);
    expect(result.current.measureState.isMeasuring).toBe(false);
  });

  it('should cancel measurement', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Start measurement
    act(() => {
      result.current.startMeasurement(0, 0);
    });

    // Cancel measurement
    act(() => {
      result.current.cancelMeasurement();
    });

    expect(result.current.measureState.isMeasuring).toBe(false);
    expect(result.current.measureState.startPoint).toBeNull();
    expect(result.current.measureState.currentPoint).toBeNull();
  });

  it('should remove specific measurement', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Create a measurement
    act(() => {
      result.current.startMeasurement(0, 0);
      result.current.updateMeasurement(100, 0);
      result.current.finishMeasurement();
    });

    const measurementId = result.current.measureState.measurements[0].id;

    // Remove the measurement
    act(() => {
      result.current.removeMeasurement(measurementId);
    });

    expect(result.current.measureState.measurements).toHaveLength(0);
  });

  it('should clear all measurements', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Create multiple measurements
    act(() => {
      result.current.startMeasurement(0, 0);
      result.current.updateMeasurement(100, 0);
      result.current.finishMeasurement();
    });

    act(() => {
      result.current.startMeasurement(0, 100);
      result.current.updateMeasurement(100, 100);
      result.current.finishMeasurement();
    });

    expect(result.current.measureState.measurements).toHaveLength(2);

    // Clear all measurements
    act(() => {
      result.current.clearAllMeasurements();
    });

    expect(result.current.measureState.measurements).toHaveLength(0);
  });

  it('should toggle show all measurements', () => {
    const { result } = renderHook(() => useMeasureTool());

    expect(result.current.measureState.showAllMeasurements).toBe(true);

    act(() => {
      result.current.toggleShowAllMeasurements();
    });

    expect(result.current.measureState.showAllMeasurements).toBe(false);

    act(() => {
      result.current.toggleShowAllMeasurements();
    });

    expect(result.current.measureState.showAllMeasurements).toBe(true);
  });

  it('should get current distance when measuring', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Start measurement
    act(() => {
      result.current.startMeasurement(0, 0);
    });

    // Update position
    act(() => {
      result.current.updateMeasurement(100, 0);
    });

    const currentDistance = result.current.getCurrentDistance();

    expect(mockFormatLength).toHaveBeenCalledWith(1, 'metric', 1, true); // 100px / 100 = 1m
    expect(currentDistance).toBe('1.0m');
  });

  it('should return null for current distance when not measuring', () => {
    const { result } = renderHook(() => useMeasureTool());

    const currentDistance = result.current.getCurrentDistance();

    expect(currentDistance).toBeNull();
    expect(mockFormatLength).not.toHaveBeenCalled();
  });

  it('should calculate distance correctly', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Test diagonal measurement
    act(() => {
      result.current.startMeasurement(0, 0);
      result.current.updateMeasurement(60, 80); // 3-4-5 triangle
      result.current.finishMeasurement();
    });

    const measurement = result.current.measureState.measurements[0];
    expect(measurement.distance).toBe(100); // sqrt(60^2 + 80^2) = 100
  });

  it('should calculate angle correctly', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Test horizontal measurement (angle = 0)
    act(() => {
      result.current.startMeasurement(0, 0);
      result.current.updateMeasurement(100, 0);
      result.current.finishMeasurement();
    });

    let measurement = result.current.measureState.measurements[0];
    expect(measurement.angle).toBe(0);

    // Test vertical measurement (angle = π/2)
    act(() => {
      result.current.startMeasurement(0, 0);
      result.current.updateMeasurement(0, 100);
      result.current.finishMeasurement();
    });

    measurement = result.current.measureState.measurements[1];
    expect(measurement.angle).toBeCloseTo(Math.PI / 2);
  });

  it('should handle snapping disabled', () => {
    mockUseUIStore.mockReturnValue({
      activeTool: 'measure',
      snapToGrid: false,
      gridSize: 20,
    } as any);

    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(50, 75);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 50, y: 75 },
      20,
      mockSnapPoints,
      false
    );
  });

  it('should handle different grid sizes', () => {
    mockUseUIStore.mockReturnValue({
      activeTool: 'measure',
      snapToGrid: true,
      gridSize: 10,
    } as any);

    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(25, 35);
    });

    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 25, y: 35 },
      10,
      mockSnapPoints,
      true
    );
  });

  it('should handle different unit systems', () => {
    mockUseUnitStore.mockReturnValue({
      unitSystem: 'imperial',
      precision: 2,
      showUnitLabels: false,
    } as any);

    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(0, 0);
      result.current.updateMeasurement(100, 0);
    });

    result.current.getCurrentDistance();

    // The distance should be 100px / 100 = 1m
    expect(mockFormatLength).toHaveBeenCalledWith(1, 'imperial', 2, false);
  });

  it('should not finish measurement when not measuring', () => {
    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.finishMeasurement();
    });

    expect(result.current.measureState.measurements).toHaveLength(0);
  });

  it('should generate unique measurement IDs', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Create first measurement
    act(() => {
      result.current.startMeasurement(0, 0);
      result.current.updateMeasurement(100, 0);
      result.current.finishMeasurement();
    });

    const firstId = result.current.measureState.measurements[0].id;

    // Create second measurement
    act(() => {
      result.current.startMeasurement(0, 100);
      result.current.updateMeasurement(100, 100);
      result.current.finishMeasurement();
    });

    const secondId = result.current.measureState.measurements[1].id;

    expect(firstId).not.toBe(secondId);
    expect(firstId).toMatch(/^measurement-\d+$/);
    expect(secondId).toMatch(/^measurement-\d+$/);
  });

  it('should handle removing non-existent measurement', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Create one measurement
    act(() => {
      result.current.startMeasurement(0, 0);
      result.current.updateMeasurement(100, 0);
      result.current.finishMeasurement();
    });

    expect(result.current.measureState.measurements).toHaveLength(1);

    // Try to remove non-existent measurement
    act(() => {
      result.current.removeMeasurement('non-existent-id');
    });

    // Should still have the original measurement
    expect(result.current.measureState.measurements).toHaveLength(1);
  });

  it('should use wall snap points for snapping', () => {
    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(50, 75);
    });

    expect(mockGetWallSnapPoints).toHaveBeenCalledWith(mockWalls);
    expect(mockSnapPoint).toHaveBeenCalledWith(
      { x: 50, y: 75 },
      20,
      mockSnapPoints,
      true
    );
  });

  it('should handle exact minimum distance threshold', () => {
    const { result } = renderHook(() => useMeasureTool());

    // Test with exact minimum distance (5 pixels)
    act(() => {
      result.current.startMeasurement(0, 0);
      result.current.updateMeasurement(5, 0);
      result.current.finishMeasurement();
    });

    expect(result.current.measureState.measurements).toHaveLength(0); // 5 is not > 5

    // Test with distance just above minimum
    act(() => {
      result.current.startMeasurement(0, 0);
      result.current.updateMeasurement(6, 0);
      result.current.finishMeasurement();
    });

    expect(result.current.measureState.measurements).toHaveLength(1);
  });
});