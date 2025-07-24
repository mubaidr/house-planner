
import { renderHook, act } from '@testing-library/react';
import { useMeasureTool } from '@/hooks/useMeasureTool';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useUnitStore } from '@/stores/unitStore';
import * as snapping from '@/utils/snapping';
import * as unitUtils from '@/utils/unitUtils';

// Mock the stores
jest.mock('@/stores/designStore');
jest.mock('@/stores/uiStore');
jest.mock('@/stores/unitStore');

// Mock utility functions
jest.mock('@/utils/snapping', () => ({
  snapPoint: jest.fn(point => ({ ...point, snapped: false, snapType: undefined })),
  getWallSnapPoints: jest.fn(() => []),
}));
jest.mock('@/utils/unitUtils', () => ({
  formatLength: jest.fn((value, unitSystem, precision, showUnitLabels) => `${value.toFixed(precision)} ${unitSystem}`),
}));

describe('useMeasureTool', () => {
  const mockUseDesignStore = useDesignStore as unknown as jest.Mock;
  const mockUseUIStore = useUIStore as unknown as jest.Mock;
  const mockUseUnitStore = useUnitStore as unknown as jest.Mock;
  const mockSnapPoint = snapping.snapPoint as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDesignStore.mockReturnValue({
      walls: [],
    });
    mockUseUIStore.mockReturnValue({
      activeTool: 'measure',
      snapToGrid: false,
      gridSize: 10,
    });
    mockUseUnitStore.mockReturnValue({
      unitSystem: 'metric',
      precision: 2,
      showUnitLabels: true,
    });
    mockSnapPoint.mockImplementation(point => ({ ...point, snapped: false, snapType: undefined }));
  });

  it('should be defined', () => {
    expect(useMeasureTool).toBeDefined();
  });

  it('should start a measurement', () => {
    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(10, 20);
    });

    expect(result.current.measureState.isMeasuring).toBe(true);
    expect(result.current.measureState.startPoint).toEqual({ x: 10, y: 20, snapped: false, snapType: undefined });
    expect(result.current.measureState.currentPoint).toEqual({ x: 10, y: 20, snapped: false, snapType: undefined });
  });

  it('should update a measurement', () => {
    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(0, 0);
    });

    act(() => {
      result.current.updateMeasurement(100, 0);
    });

    expect(result.current.measureState.currentPoint).toEqual({ x: 100, y: 0, snapped: false, snapType: undefined });
  });

  it('should finish a measurement and add it to measurements', () => {
    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(0, 0);
    });

    act(() => {
      result.current.updateMeasurement(100, 0);
    });

    act(() => {
      result.current.finishMeasurement();
    });

    expect(result.current.measureState.isMeasuring).toBe(false);
    expect(result.current.measureState.startPoint).toBeNull();
    expect(result.current.measureState.currentPoint).toBeNull();
    expect(result.current.measureState.measurements).toHaveLength(1);
    // The hook stores raw pixel distance, so this remains 100
    expect(result.current.measureState.measurements[0].distance).toBeCloseTo(100);
  });

  it('should cancel a measurement if distance is too small', () => {
    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(0, 0);
    });

    act(() => {
      result.current.updateMeasurement(1, 0);
    });

    act(() => {
      result.current.finishMeasurement();
    });

    expect(result.current.measureState.isMeasuring).toBe(false);
    expect(result.current.measureState.startPoint).toBeNull();
    expect(result.current.measureState.currentPoint).toBeNull();
    // The threshold is 5, so a distance of 1 should not add a measurement
    expect(result.current.measureState.measurements).toHaveLength(0);
  });

  it('should remove a specific measurement', () => {
    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(0, 0);
    });
    act(() => {
      result.current.updateMeasurement(100, 0);
    });
    act(() => {
      result.current.finishMeasurement();
    });

    expect(result.current.measureState.measurements).toHaveLength(1);
    const measurementId = result.current.measureState.measurements[0].id;

    act(() => {
      result.current.removeMeasurement(measurementId);
    });

    expect(result.current.measureState.measurements).toHaveLength(0);
  });

  it('should clear all measurements', () => {
    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(0, 0);
    });
    act(() => {
      result.current.updateMeasurement(100, 0);
    });
    act(() => {
      result.current.finishMeasurement();
    });

    act(() => {
      result.current.startMeasurement(10, 10);
    });
    act(() => {
      result.current.updateMeasurement(110, 10);
    });
    act(() => {
      result.current.finishMeasurement();
    });

    expect(result.current.measureState.measurements).toHaveLength(2);

    act(() => {
      result.current.clearAllMeasurements();
    });

    expect(result.current.measureState.measurements).toHaveLength(0);
  });

  it('should toggle showAllMeasurements', () => {
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

  it('should return current distance formatted', () => {
    const { result } = renderHook(() => useMeasureTool());

    act(() => {
      result.current.startMeasurement(0, 0);
      result.current.updateMeasurement(200, 0);
    });

    // 200px = 2 meters, so formatted string should be '2.00 metric'
    expect(result.current.getCurrentDistance()).toBe('2.00 metric');
  });
});
