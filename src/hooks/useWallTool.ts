import { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useWallIntersection } from '@/hooks/useWallIntersection';
import { Wall } from '@/types/elements/Wall';
import { snapPoint, SnapResult } from '@/utils/snapping';
import { getWallSnapPointsWithIntersections } from '@/utils/wallIntersection';

interface WallDrawingState {
  isDrawing: boolean;
  startPoint: { x: number; y: number } | null;
  currentPoint: { x: number; y: number } | null;
  currentSnapResult: SnapResult | null;
}

export const useWallTool = () => {
  const [drawingState, setDrawingState] = useState<WallDrawingState>({
    isDrawing: false,
    startPoint: null,
    currentPoint: null,
    currentSnapResult: null,
  });

  const { walls } = useDesignStore();
  const { snapToGrid, gridSize, activeTool } = useUIStore();
  const { addWallWithIntersectionHandling } = useWallIntersection();

  const startDrawing = useCallback((x: number, y: number) => {
    if (activeTool !== 'wall') return;

    // Use enhanced snap points that include intersections
    const snapPoints = getWallSnapPointsWithIntersections(walls);
    const snapResult = snapPoint(
      { x, y },
      gridSize,
      snapPoints,
      snapToGrid
    );

    setDrawingState({
      isDrawing: true,
      startPoint: { x: snapResult.x, y: snapResult.y },
      currentPoint: { x: snapResult.x, y: snapResult.y },
      currentSnapResult: snapResult,
    });
  }, [activeTool, walls, gridSize, snapToGrid]);

  const updateDrawing = useCallback((x: number, y: number) => {
    if (!drawingState.isDrawing || activeTool !== 'wall') return;

    // Use enhanced snap points that include intersections
    const snapPoints = getWallSnapPointsWithIntersections(walls);
    const snapResult = snapPoint(
      { x, y },
      gridSize,
      snapPoints,
      snapToGrid
    );

    setDrawingState(prev => ({
      ...prev,
      currentPoint: { x: snapResult.x, y: snapResult.y },
      currentSnapResult: snapResult,
    }));
  }, [drawingState.isDrawing, activeTool, walls, gridSize, snapToGrid]);

  const finishDrawing = useCallback(() => {
    if (!drawingState.isDrawing || !drawingState.startPoint || !drawingState.currentPoint) {
      return;
    }

    // Don't create walls with zero length
    const distance = Math.sqrt(
      Math.pow(drawingState.currentPoint.x - drawingState.startPoint.x, 2) +
      Math.pow(drawingState.currentPoint.y - drawingState.startPoint.y, 2)
    );

    if (distance > 5) { // Minimum wall length
      const newWall: Wall = {
        id: `wall-${Date.now()}`,
        startX: drawingState.startPoint.x,
        startY: drawingState.startPoint.y,
        endX: drawingState.currentPoint.x,
        endY: drawingState.currentPoint.y,
        thickness: 8,
        height: 240,
        color: '#666666',
      };

      // Use intersection-aware wall creation
      addWallWithIntersectionHandling(newWall);
    }

    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      currentSnapResult: null,
    });
  }, [drawingState, addWallWithIntersectionHandling]);

  const cancelDrawing = useCallback(() => {
    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      currentSnapResult: null,
    });
  }, []);

  return {
    drawingState,
    startDrawing,
    updateDrawing,
    finishDrawing,
    cancelDrawing,
  };
};