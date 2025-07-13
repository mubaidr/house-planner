import { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useHistoryStore } from '@/stores/historyStore';
import { Window } from '@/types/elements/Window';
import { canPlaceWindow } from '@/utils/wallConstraints';
import { UpdateWindowCommand, RemoveWindowCommand } from '@/utils/history';

interface WindowEditState {
  isDragging: boolean;
  dragType: 'resize' | 'move' | null;
  originalWindow: Window | null;
  dragStartPos: { x: number; y: number } | null;
}

export const useWindowEditor = () => {
  const [editState, setEditState] = useState<WindowEditState>({
    isDragging: false,
    dragType: null,
    originalWindow: null,
    dragStartPos: null,
  });

  const { updateWindow, removeWindow, addWindow, doors, windows, walls, selectedElementId, selectedElementType } = useDesignStore();
  const { currentFloorId, updateElementInFloor } = useFloorStore();
  const { executeCommand } = useHistoryStore();

  const startDrag = useCallback((windowId: string, handleType: 'resize' | 'move', x: number, y: number) => {
    const window = windows.find(w => w.id === windowId);
    if (!window) return;

    setEditState({
      isDragging: true,
      dragType: handleType,
      originalWindow: { ...window },
      dragStartPos: { x, y },
    });
  }, [windows]);

  const updateDrag = useCallback((windowId: string, handleType: 'resize' | 'move', x: number, y: number) => {
    if (!editState.isDragging || !editState.originalWindow || !editState.dragStartPos) return;

    const window = windows.find(w => w.id === windowId);
    if (!window) return;

    let updates: Partial<Window> = {};

    switch (handleType) {
      case 'resize':
        // Calculate new width based on drag distance
        const dragDistance = Math.abs(x - editState.originalWindow.x);
        const newWidth = Math.max(60, Math.min(300, dragDistance * 2)); // Min 60px, max 300px
        updates = { width: newWidth };
        // Allow editing style, material, color, opacity if present
        if (editState.originalWindow.style) updates.style = editState.originalWindow.style;
        if (editState.originalWindow.material) updates.material = editState.originalWindow.material;
        if (editState.originalWindow.color) updates.color = editState.originalWindow.color;
        if (editState.originalWindow.opacity !== undefined) updates.opacity = editState.originalWindow.opacity;
        break;
      case 'move':
        // Validate new position against wall constraints
        const constraintResult = canPlaceWindow(
          { x, y },
          window.width,
          walls,
          doors,
          windows.filter(w => w.id !== windowId)
        );

        if (constraintResult.isValid && constraintResult.wallId) {
          updates = {
            x: constraintResult.position.x,
            y: constraintResult.position.y,
            wallId: constraintResult.wallId,
          };
          // Allow editing style, material, color, opacity if present
          if (editState.originalWindow.style) updates.style = editState.originalWindow.style;
          if (editState.originalWindow.material) updates.material = editState.originalWindow.material;
          if (editState.originalWindow.color) updates.color = editState.originalWindow.color;
          if (editState.originalWindow.opacity !== undefined) updates.opacity = editState.originalWindow.opacity;
        }
        break;
    }

    // Apply updates immediately for live feedback
    if (Object.keys(updates).length > 0) {
      updateWindow(windowId, updates);
      // Also update in floor store for visual rendering
      if (currentFloorId) {
        updateElementInFloor(currentFloorId, 'windows', windowId, updates);
      }
    }
  }, [editState, windows, walls, doors, updateWindow, currentFloorId, updateElementInFloor]);

  const endDrag = useCallback((windowId: string) => {
    if (!editState.isDragging || !editState.originalWindow) return;

    const currentWindow = windows.find(w => w.id === windowId);
    if (!currentWindow) return;

    // Check if window actually changed
    const hasChanged =
      currentWindow.x !== editState.originalWindow.x ||
      currentWindow.y !== editState.originalWindow.y ||
      currentWindow.width !== editState.originalWindow.width ||
      currentWindow.wallId !== editState.originalWindow.wallId;

    if (hasChanged) {
      // Validate final position
      const constraintResult = canPlaceWindow(
        { x: currentWindow.x, y: currentWindow.y },
        currentWindow.width,
        walls,
        doors,
        windows.filter(w => w.id !== windowId)
      );

      if (constraintResult.isValid) {
        // Create command for undo/redo
        const command = new UpdateWindowCommand(
          windowId,
          updateWindow,
          editState.originalWindow,
          {
            x: currentWindow.x,
            y: currentWindow.y,
            width: currentWindow.width,
            wallId: currentWindow.wallId,
          }
        );

        // Reset to original state first, then execute command
        updateWindow(windowId, editState.originalWindow);
        executeCommand(command);
      } else {
        // Invalid position, revert to original
        updateWindow(windowId, editState.originalWindow);
      }
    }

    setEditState({
      isDragging: false,
      dragType: null,
      originalWindow: null,
      dragStartPos: null,
    });
  }, [editState, windows, walls, doors, updateWindow, executeCommand]);

  const deleteSelectedWindow = useCallback(() => {
    if (selectedElementType !== 'window' || !selectedElementId) return;

    const window = windows.find(w => w.id === selectedElementId);
    if (!window) return;

    const command = new RemoveWindowCommand(
      selectedElementId,
      addWindow,
      removeWindow,
      window
    );

    executeCommand(command);
  }, [selectedElementType, selectedElementId, windows, addWindow, removeWindow, executeCommand]);

  return {
    editState,
    startDrag,
    updateDrag,
    endDrag,
    deleteSelectedWindow,
  };
};
