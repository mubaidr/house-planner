import { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
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

  const { removeWall, addWall, walls, selectedElementId, selectedElementType } = useDesignStore();
  const { executeCommand } = useHistoryStore();
  const { updateWallWithIntersectionHandling } = useWallIntersection();

  const startDrag = useCallback((wallId: string, handleType: 'start' | 'end' | 'move', x: number, y: number) => {
    const wall = walls.find(w => w.id === wallId);
    if (!wall) return;

    setEditState({
      isDragging: true,
      dragType: handleType,
      originalWall: { ...wall },
      dragStartPos: { x, y },
    });
  }, [walls]);

  const updateDrag = useCallback((wallId: string, handleType: 'start' | 'end' | 'move', x: number, y: number) => {
    if (!editState.isDragging || !editState.originalWall || !editState.dragStartPos) return;

    const wall = walls.find(w => w.id === wallId);
    if (!wall) return;

    // Note: Live feedback during drag is handled by the drag handles themselves
    // Snap calculation and actual wall updates with intersection handling happen in endDrag
    
    // Suppress unused parameter warnings - these will be used when drag-time snapping is implemented
    void handleType;
    void x;
    void y;
  }, [editState, walls]);

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
      // Use intersection-aware wall updating
      updateWallWithIntersectionHandling(wallId, {
        startX: currentWall.startX,
        startY: currentWall.startY,
        endX: currentWall.endX,
        endY: currentWall.endY,
      });
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
      addWall,
      removeWall,
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