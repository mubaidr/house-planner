import { useState, useCallback } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useUIStore } from '@/stores/uiStore';
import { useHistoryStore } from '@/stores/historyStore';
import { Stair } from '@/types/elements/Stair';
import { snapPoint } from '@/utils/snapping';

export const useStairTool = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [previewStair, setPreviewStair] = useState<Stair | null>(null);

  const { walls, addStair, selectElement } = useDesignStore();
  const { currentFloorId, addElementToFloor } = useFloorStore();
  const { snapToGrid, gridSize, setActiveTool } = useUIStore();
  const { executeCommand } = useHistoryStore();

  const startDrawing = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Snap to grid or points
    const snapPoints = walls.flatMap(wall => [
      { x: wall.startX, y: wall.startY },
      { x: wall.endX, y: wall.endY },
      { x: (wall.startX + wall.endX) / 2, y: (wall.startY + wall.endY) / 2 }
    ]);

    const snappedPos = snapPoint(pos, gridSize, snapPoints, snapToGrid);

    const newStair: Stair = {
      id: `stair-${Date.now()}`,
      x: snappedPos.x,
      y: snappedPos.y,
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
    };

    setPreviewStair(newStair);
    setIsDrawing(true);
  }, [walls, gridSize, snapToGrid]);

  const updateDrawing = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !previewStair) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Calculate dimensions based on mouse position
    const width = Math.abs(pos.x - previewStair.x);
    const length = Math.abs(pos.y - previewStair.y);

    // Determine orientation based on aspect ratio
    const orientation = width > length ? 'horizontal' : 'vertical';

    // Calculate number of steps based on length
    const steps = Math.max(3, Math.min(20, Math.floor(length / 25)));

    setPreviewStair({
      ...previewStair,
      width: Math.max(60, width), // Minimum width
      length: Math.max(100, length), // Minimum length
      steps,
      orientation,
    });
  }, [isDrawing, previewStair]);

  const finishDrawing = useCallback(() => {
    if (!isDrawing || !previewStair) return;

    executeCommand({
      type: 'ADD_STAIR',
      execute: () => {
        // Add to current floor first
        if (currentFloorId) {
          addElementToFloor(currentFloorId, 'stairs', previewStair);
        }
        addStair(previewStair);
      },
      undo: () => {
        // Remove stair logic would go here
      },
      description: 'Add stair',
    });

    // Switch to select tool and select the new stair
    setActiveTool('select');
    selectElement(previewStair.id, 'stair');

    setIsDrawing(false);
    setPreviewStair(null);
  }, [isDrawing, previewStair, addStair, executeCommand, currentFloorId, addElementToFloor, setActiveTool, selectElement]);

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setPreviewStair(null);
  }, []);

  return {
    isDrawing,
    previewStair,
    startDrawing,
    updateDrawing,
    finishDrawing,
    cancelDrawing,
  };
};
