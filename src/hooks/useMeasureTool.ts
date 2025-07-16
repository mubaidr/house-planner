import { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { snapPoint, getWallSnapPoints } from '@/utils/snapping';

export interface MeasurementPoint {
  x: number;
  y: number;
  snapped: boolean;
  snapType?: 'grid' | 'endpoint' | 'midpoint';
}

export interface Measurement {
  id: string;
  startPoint: MeasurementPoint;
  endPoint: MeasurementPoint;
  distance: number;
  angle: number;
  label: string;
  timestamp: number;
}

interface MeasureState {
  isMeasuring: boolean;
  startPoint: MeasurementPoint | null;
  currentPoint: MeasurementPoint | null;
  measurements: Measurement[];
  showAllMeasurements: boolean;
}

export const useMeasureTool = () => {
  const [measureState, setMeasureState] = useState<MeasureState>({
    isMeasuring: false,
    startPoint: null,
    currentPoint: null,
    measurements: [],
    showAllMeasurements: true,
  });

  const { walls } = useDesignStore();
  const { activeTool, snapToGrid, gridSize } = useUIStore();

  const calculateDistance = useCallback((point1: MeasurementPoint, point2: MeasurementPoint): number => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }, []);

  const calculateAngle = useCallback((point1: MeasurementPoint, point2: MeasurementPoint): number => {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x);
  }, []);

  const getSnapPoint = useCallback((x: number, y: number): MeasurementPoint => {
    const snapPoints = getWallSnapPoints(walls);
    const snapResult = snapPoint(
      { x, y },
      gridSize,
      snapPoints,
      snapToGrid
    );

    return {
      x: snapResult.x,
      y: snapResult.y,
      snapped: snapResult.snapped,
      snapType: snapResult.snapType,
    };
  }, [walls, gridSize, snapToGrid]);

  const startMeasurement = useCallback((x: number, y: number) => {
    if (activeTool !== 'measure') return;

    const startPoint = getSnapPoint(x, y);
    
    setMeasureState(prev => ({
      ...prev,
      isMeasuring: true,
      startPoint,
      currentPoint: startPoint,
    }));
  }, [activeTool, getSnapPoint]);

  const updateMeasurement = useCallback((x: number, y: number) => {
    if (!measureState.isMeasuring || activeTool !== 'measure') return;

    const currentPoint = getSnapPoint(x, y);
    
    setMeasureState(prev => ({
      ...prev,
      currentPoint,
    }));
  }, [measureState.isMeasuring, activeTool, getSnapPoint]);

  const cancelMeasurement = useCallback(() => {
    setMeasureState(prev => ({
      ...prev,
      isMeasuring: false,
      startPoint: null,
      currentPoint: null,
    }));
  }, []);

  const finishMeasurement = useCallback(() => {
    if (!measureState.isMeasuring || !measureState.startPoint || !measureState.currentPoint) {
      return;
    }

    const distance = calculateDistance(measureState.startPoint, measureState.currentPoint);
    
    // Only create measurement if there's meaningful distance
    if (distance > 5) {
      const angle = calculateAngle(measureState.startPoint, measureState.currentPoint);
      
      const newMeasurement: Measurement = {
        id: `measurement-${Date.now()}`,
        startPoint: measureState.startPoint,
        endPoint: measureState.currentPoint,
        distance,
        angle,
        label: '', // Label is now handled by MeasurementDisplay
        timestamp: Date.now(),
      };

      setMeasureState(prev => ({
        ...prev,
        isMeasuring: false,
        startPoint: null,
        currentPoint: null,
        measurements: [...prev.measurements, newMeasurement],
      }));
    } else {
      // Cancel if distance is too small
      cancelMeasurement();
    }
  }, [measureState, calculateDistance, calculateAngle, cancelMeasurement]);

  const removeMeasurement = useCallback((id: string) => {
    setMeasureState(prev => ({
      ...prev,
      measurements: prev.measurements.filter(m => m.id !== id),
    }));
  }, []);

  const clearAllMeasurements = useCallback(() => {
    setMeasureState(prev => ({
      ...prev,
      measurements: [],
    }));
  }, []);

  const toggleShowAllMeasurements = useCallback(() => {
    setMeasureState(prev => ({
      ...prev,
      showAllMeasurements: !prev.showAllMeasurements,
    }));
  }, []);

  const getCurrentDistance = useCallback((): string | null => {
    if (!measureState.startPoint || !measureState.currentPoint) return null;
    
    const distance = calculateDistance(measureState.startPoint, measureState.currentPoint);
    return distance.toFixed(2);
  }, [measureState.startPoint, measureState.currentPoint, calculateDistance]);

  return {
    measureState,
    startMeasurement,
    updateMeasurement,
    finishMeasurement,
    cancelMeasurement,
    removeMeasurement,
    clearAllMeasurements,
    toggleShowAllMeasurements,
    getCurrentDistance,
  };
};