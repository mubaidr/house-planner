import { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useHistoryStore } from '@/stores/historyStore';
import { Door } from '@/types/elements/Door';
import { canPlaceDoor } from '@/utils/wallConstraints';
import { UpdateDoorCommand, RemoveDoorCommand } from '@/utils/history';

interface DoorEditState {
  isDragging: boolean;
  dragType: 'resize' | 'move' | null;
  originalDoor: Door | null;
  dragStartPos: { x: number; y: number } | null;
}

export const useDoorEditor = () => {
  const [editState, setEditState] = useState<DoorEditState>({
    isDragging: false,
    dragType: null,
    originalDoor: null,
    dragStartPos: null,
  });

  const { updateDoor, removeDoor, addDoor, doors, windows, walls, selectedElementId, selectedElementType } = useDesignStore();
  const { currentFloorId, updateElementInFloor } = useFloorStore();
  const { executeCommand } = useHistoryStore();

  const startDrag = useCallback((doorId: string, handleType: 'resize' | 'move', x: number, y: number) => {
    const door = doors.find(d => d.id === doorId);
    if (!door) return;

    setEditState({
      isDragging: true,
      dragType: handleType,
      originalDoor: { ...door },
      dragStartPos: { x, y },
    });
  }, [doors]);

  const updateDrag = useCallback((doorId: string, handleType: 'resize' | 'move', x: number, y: number) => {
    if (!editState.isDragging || !editState.originalDoor || !editState.dragStartPos) return;

    const door = doors.find(d => d.id === doorId);
    if (!door) return;

    let updates: Partial<Door> = {};

    switch (handleType) {
      case 'resize':
        // Calculate new width based on drag distance
        const dragDistance = Math.abs(x - editState.originalDoor.x);
        const newWidth = Math.max(40, Math.min(200, dragDistance * 2)); // Min 40px, max 200px
        updates = { width: newWidth };
        break;
      case 'move':
        // Validate new position against wall constraints
        const constraintResult = canPlaceDoor(
          { x, y },
          door.width,
          walls,
          doors.filter(d => d.id !== doorId),
          windows
        );
        
        if (constraintResult.isValid && constraintResult.wallId) {
          updates = {
            x: constraintResult.position.x,
            y: constraintResult.position.y,
            wallId: constraintResult.wallId,
          };
        }
        break;
    }

    // Apply updates immediately for live feedback
    if (Object.keys(updates).length > 0) {
      updateDoor(doorId, updates);
      // Also update in floor store for visual rendering
      if (currentFloorId) {
        updateElementInFloor(currentFloorId, 'doors', doorId, updates);
      }
    }
  }, [editState, doors, walls, windows, updateDoor, currentFloorId, updateElementInFloor]);

  const endDrag = useCallback((doorId: string) => {
    if (!editState.isDragging || !editState.originalDoor) return;

    const currentDoor = doors.find(d => d.id === doorId);
    if (!currentDoor) return;

    // Check if door actually changed
    const hasChanged = 
      currentDoor.x !== editState.originalDoor.x ||
      currentDoor.y !== editState.originalDoor.y ||
      currentDoor.width !== editState.originalDoor.width ||
      currentDoor.wallId !== editState.originalDoor.wallId;

    if (hasChanged) {
      // Validate final position
      const constraintResult = canPlaceDoor(
        { x: currentDoor.x, y: currentDoor.y },
        currentDoor.width,
        walls,
        doors.filter(d => d.id !== doorId),
        windows
      );

      if (constraintResult.isValid) {
        // Create command for undo/redo
        const command = new UpdateDoorCommand(
          doorId,
          updateDoor,
          editState.originalDoor,
          {
            x: currentDoor.x,
            y: currentDoor.y,
            width: currentDoor.width,
            wallId: currentDoor.wallId,
          }
        );
        
        // Reset to original state first, then execute command
        updateDoor(doorId, editState.originalDoor);
        executeCommand(command);
      } else {
        // Invalid position, revert to original
        updateDoor(doorId, editState.originalDoor);
      }
    }

    setEditState({
      isDragging: false,
      dragType: null,
      originalDoor: null,
      dragStartPos: null,
    });
  }, [editState, doors, walls, windows, updateDoor, executeCommand]);

  const deleteSelectedDoor = useCallback(() => {
    if (selectedElementType !== 'door' || !selectedElementId) return;

    const door = doors.find(d => d.id === selectedElementId);
    if (!door) return;

    const command = new RemoveDoorCommand(
      selectedElementId,
      addDoor,
      removeDoor,
      door
    );
    
    executeCommand(command);
  }, [selectedElementType, selectedElementId, doors, addDoor, removeDoor, executeCommand]);

  return {
    editState,
    startDrag,
    updateDrag,
    endDrag,
    deleteSelectedDoor,
  };
};