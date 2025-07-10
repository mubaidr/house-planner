import { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useHistoryStore } from '@/stores/historyStore';
import { Wall } from '@/types/elements/Wall';
import { snapPoint, getWallSnapPoints } from '@/utils/snapping';
import { UpdateWallCommand, RemoveWallCommand } from '@/utils/history';

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
  const { snapToGrid, gridSize } = useUIStore();
  const { executeCommand } = useHistoryStore();

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

    // Get snap points from other walls (excluding current wall)
    const otherWalls = walls.filter(w => w.id !== wallId);
    const snapPoints = getWallSnapPoints(otherWalls);
    
    const snapResult = snapPoint(
      { x, y },
      gridSize,
      snapPoints,
      snapToGrid
    );

    let updates: Partial<Wall> = {};

    switch (handleType) {
      case 'start':
        updates = {
          startX: snapResult.x,
          startY: snapResult.y,
        };
        break;
      case 'end':
        updates = {
          endX: snapResult.x,
          endY: snapResult.y,
        };
        break;
      case 'move':
        const deltaX = snapResult.x - editState.dragStartPos.x;
        const deltaY = snapResult.y - editState.dragStartPos.y;
        updates = {
          startX: editState.originalWall.startX + deltaX,
          startY: editState.originalWall.startY + deltaY,
          endX: editState.originalWall.endX + deltaX,
          endY: editState.originalWall.endY + deltaY,
        };
        break;
    }

    // Apply updates immediately for live feedback
    updateWall(wallId, updates);
  }, [editState, walls, gridSize, snapToGrid, updateWall]);

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
      // Create command for undo/redo
      const command = new UpdateWallCommand(
        wallId,
        updateWall,
        editState.originalWall,
        {
          startX: currentWall.startX,
          startY: currentWall.startY,
          endX: currentWall.endX,
          endY: currentWall.endY,
        }
      );
      
      // Reset to original state first, then execute command
      updateWall(wallId, editState.originalWall);
      executeCommand(command);
    }

    setEditState({
      isDragging: false,
      dragType: null,
      originalWall: null,
      dragStartPos: null,
    });
  }, [editState, walls, updateWall, executeCommand]);

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