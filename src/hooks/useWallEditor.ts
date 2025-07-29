import { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useWallIntersection } from '@/hooks/useWallIntersection';
import { Wall } from '@/types/elements/Wall';
// Intersection handling imports will be added when drag-time snapping is implemented
import { RemoveWallCommand } from '@/utils/history';

interface WallEditState {
  isDragging: boolean;
  dragType: 'start' | 'end' | 'move' | null;
  originalWall: Wall | null;
  dragStartPos: { x: number; y: number } | null;
}

export const useWallEditor = () => {
  const [editState, setEditState] = useState<WallEditState>({
    isDragging: false,
    dragType: null,
    originalWall: null,
    dragStartPos: null,
  });

  const { updateWall, removeWall, addWall, walls, selectedElementId, selectedElementType } = useDesignStore();
  const { currentFloorId, updateElementInFloor } = useFloorStore();
  const { executeCommand } = useHistoryStore();
  const { updateWallWithIntersectionHandling } = useWallIntersection();

  const startDrag = useCallback((wallId: string, handleType: 'start' | 'end' | 'move', x: number, y: number) => {
    const wall = walls.find(w => w.id === wallId);
    if (!wall) return;

    setEditState({
      isDragging: true,
      dragType: handleType,
      originalWall: JSON.parse(JSON.stringify(wall)),
      dragStartPos: { x, y },
    });
  }, [walls]);

  const updateDrag = useCallback((wallId: string, handleType: 'start' | 'end' | 'move', x: number, y: number) => {
    if (!editState.isDragging || !editState.originalWall || !editState.dragStartPos) return;

    const wall = walls.find(w => w.id === wallId);
    if (!wall) return;

    // Calculate updates based on handle type for live feedback
    let updates: Partial<Wall> = {};

    switch (handleType) {
      case 'start':
        updates = {
          startX: x,
          startY: y,
        };
        break;
      case 'end':
        updates = {
          endX: x,
          endY: y,
        };
        break;
      case 'move':
        const deltaX = x - editState.dragStartPos.x;
        const deltaY = y - editState.dragStartPos.y;
        updates = {
          startX: editState.originalWall.startX + deltaX,
          startY: editState.originalWall.startY + deltaY,
          endX: editState.originalWall.endX + deltaX,
          endY: editState.originalWall.endY + deltaY,
        };
        break;
    }

    // Apply updates immediately for live visual feedback
    if (Object.keys(updates).length > 0) {
      updateWall(wallId, updates);
      // Also update in floor store for visual rendering
      if (currentFloorId) {
        updateElementInFloor(currentFloorId, 'walls', wallId, updates);
      }
    }
  }, [editState, walls, updateWall, currentFloorId, updateElementInFloor]);

  const endDrag = useCallback((wallId: string) => {
    if (!editState.isDragging || !editState.originalWall) return;

    const currentWall = walls.find(w => w.id === wallId);
    if (!currentWall) return;

    // Check if wall actually changed
    const hasChanged =
      currentWall.startX !== editState.originalWall.startX ||
      currentWall.startY !== editState.originalWall.startY ||
      currentWall.endX !== editState.originalWall.endX ||
      currentWall.endY !== editState.originalWall.endY;

    if (hasChanged) {
      console.log('Wall changed, calling updateWallWithIntersectionHandling');
      // Use intersection-aware wall updating
      updateWallWithIntersectionHandling(wallId, {
        startX: currentWall.startX,
        startY: currentWall.startY,
        endX: currentWall.endX,
        endY: currentWall.endY,
      });
    } else {
      console.log('Wall did not change');
    }

    setEditState({
      isDragging: false,
      dragType: null,
      originalWall: null,
      dragStartPos: null,
    });
  }, [editState, walls, updateWallWithIntersectionHandling]);

  const deleteSelectedWall = useCallback(() => {
    if (selectedElementType !== 'wall' || !selectedElementId) return;

    const wall = walls.find(w => w.id === selectedElementId);
    if (!wall) return;

    const command = new RemoveWallCommand(
      selectedElementId,
      removeWall,
      addWall,
      wall
    );

    executeCommand(command);
  }, [selectedElementType, selectedElementId, walls, addWall, removeWall, executeCommand]);

  return {
    editState,
    startDrag,
    updateDrag,
    endDrag,
    deleteSelectedWall,
  };
};
