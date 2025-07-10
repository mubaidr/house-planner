import { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useHistoryStore } from '@/stores/historyStore';
import { Wall } from '@/types/elements/Wall';
import { snapPoint, getWallSnapPoints, SnapResult } from '@/utils/snapping';
import { AddWallCommand } from '@/utils/history';

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

  const { addWall, removeWall, walls } = useDesignStore();
  const { snapToGrid, gridSize, activeTool } = useUIStore();
  const { executeCommand } = useHistoryStore();

  const startDrawing = useCallback((x: number, y: number) => {
    if (activeTool !== 'wall') return;

    const snapPoints = getWallSnapPoints(walls);
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

    const snapPoints = getWallSnapPoints(walls);
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

      // Use command pattern for undo/redo support
      const command = new AddWallCommand(
        newWall.id,
        addWall,
        removeWall,
        newWall
      );
      executeCommand(command);
    }

    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      currentSnapResult: null,
    });
  }, [drawingState, addWall, removeWall, executeCommand]);

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