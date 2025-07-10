import { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useHistoryStore } from '@/stores/historyStore';
import { Door } from '@/types/elements/Door';
import { canPlaceDoor, WallConstraintResult } from '@/utils/wallConstraints';
import { AddDoorCommand } from '@/utils/history';

interface DoorPlacementState {
  isPlacing: boolean;
  previewDoor: Door | null;
  constraintResult: WallConstraintResult | null;
  isValid: boolean;
}

export const useDoorTool = () => {
  const [placementState, setPlacementState] = useState<DoorPlacementState>({
    isPlacing: false,
    previewDoor: null,
    constraintResult: null,
    isValid: false,
  });

  const { addDoor, removeDoor, walls, doors, windows } = useDesignStore();
  const { activeTool } = useUIStore();
  const { executeCommand } = useHistoryStore();

  const startPlacement = useCallback((x: number, y: number) => {
    if (activeTool !== 'door') return;

    const doorWidth = 80; // Default door width
    const constraintResult = canPlaceDoor(
      { x, y },
      doorWidth,
      walls,
      doors,
      windows
    );

    if (constraintResult.isValid && constraintResult.wallId) {
      const previewDoor: Door = {
        id: `door-preview-${Date.now()}`,
        x: constraintResult.position.x,
        y: constraintResult.position.y,
        width: doorWidth,
        height: 200, // Default door height
        wallId: constraintResult.wallId,
        swingDirection: 'right',
        style: 'single',
        color: '#8B4513',
      };

      setPlacementState({
        isPlacing: true,
        previewDoor,
        constraintResult,
        isValid: true,
      });
    } else {
      setPlacementState({
        isPlacing: true,
        previewDoor: null,
        constraintResult,
        isValid: false,
      });
    }
  }, [activeTool, walls, doors, windows]);

  const updatePlacement = useCallback((x: number, y: number) => {
    if (!placementState.isPlacing || activeTool !== 'door') return;

    const doorWidth = 80;
    const constraintResult = canPlaceDoor(
      { x, y },
      doorWidth,
      walls,
      doors,
      windows
    );

    if (constraintResult.isValid && constraintResult.wallId) {
      const previewDoor: Door = {
        id: `door-preview-${Date.now()}`,
        x: constraintResult.position.x,
        y: constraintResult.position.y,
        width: doorWidth,
        height: 200,
        wallId: constraintResult.wallId,
        swingDirection: 'right',
        style: 'single',
        color: '#8B4513',
      };

      setPlacementState(prev => ({
        ...prev,
        previewDoor,
        constraintResult,
        isValid: true,
      }));
    } else {
      setPlacementState(prev => ({
        ...prev,
        previewDoor: null,
        constraintResult,
        isValid: false,
      }));
    }
  }, [placementState.isPlacing, activeTool, walls, doors, windows]);

  const finishPlacement = useCallback(() => {
    if (!placementState.isPlacing || !placementState.isValid || !placementState.previewDoor) {
      return;
    }

    const newDoor: Door = {
      ...placementState.previewDoor,
      id: `door-${Date.now()}`,
    };

    // Use command pattern for undo/redo support
    const command = new AddDoorCommand(
      newDoor.id,
      addDoor,
      removeDoor,
      newDoor
    );
    executeCommand(command);

    setPlacementState({
      isPlacing: false,
      previewDoor: null,
      constraintResult: null,
      isValid: false,
    });
  }, [placementState, addDoor, removeDoor, executeCommand]);

  const cancelPlacement = useCallback(() => {
    setPlacementState({
      isPlacing: false,
      previewDoor: null,
      constraintResult: null,
      isValid: false,
    });
  }, []);

  return {
    placementState,
    startPlacement,
    updatePlacement,
    finishPlacement,
    cancelPlacement,
  };
};