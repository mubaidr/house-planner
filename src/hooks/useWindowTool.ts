import { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useUIStore } from '@/stores/uiStore';
import { Window } from '@/types/elements/Window';
import { canPlaceWindow, WallConstraintResult } from '@/utils/wallConstraints';
// import { AddWindowCommand } from '@/utils/history'; // Removed - using floor store as single source of truth

interface WindowPlacementState {
  isPlacing: boolean;
  previewWindow: Window | null;
  constraintResult: WallConstraintResult | null;
  isValid: boolean;
}

export const useWindowTool = () => {
  const [placementState, setPlacementState] = useState<WindowPlacementState>({
    isPlacing: false,
    previewWindow: null,
    constraintResult: null,
    isValid: false,
  });

  const { walls, doors, windows, selectElement } = useDesignStore();
  const { currentFloorId, addElementToFloor } = useFloorStore();
  const { activeTool, setActiveTool } = useUIStore();

  const startPlacement = useCallback(
    (
      x: number,
      y: number,
      options?: {
        style?: 'single' | 'double' | 'casement'
        material?: string
        color?: string
        opacity?: number
      }
    ) => {
      if (activeTool !== 'window') return

      const windowWidth = 100 // Default window width
      const constraintResult = canPlaceWindow(
        { x, y },
        windowWidth,
        walls,
        doors,
        windows
      )

      if (constraintResult.isValid && constraintResult.wallId) {
        const previewWindow: Window = {
          id: `window-preview-${Date.now()}`,
          x: constraintResult.position.x,
          y: constraintResult.position.y,
          width: windowWidth,
          height: 80, // Default window height
          wallId: constraintResult.wallId,
          wallAngle: constraintResult.wallSegment?.angle || 0,
          style: options?.style ?? 'single',
          material: options?.material,
          color: options?.color ?? '#4A90E2',
          opacity: options?.opacity ?? 0.7,
        }

        setPlacementState({
          isPlacing: true,
          previewWindow,
          constraintResult,
          isValid: true,
        })
      } else {
        setPlacementState({
          isPlacing: true,
          previewWindow: null,
          constraintResult,
          isValid: false,
        })
      }
    },
    [activeTool, walls, doors, windows]
  )

  const updatePlacement = useCallback((x: number, y: number) => {
    if (!placementState.isPlacing || activeTool !== 'window') return;

    const windowWidth = 100;
    const constraintResult = canPlaceWindow(
      { x, y },
      windowWidth,
      walls,
      doors,
      windows
    );

    if (constraintResult.isValid && constraintResult.wallId) {
      const previewWindow: Window = {
        id: `window-preview-${Date.now()}`,
        x: constraintResult.position.x,
        y: constraintResult.position.y,
        width: windowWidth,
        height: 80,
        wallId: constraintResult.wallId,
        wallAngle: constraintResult.wallSegment?.angle || 0,
        style: 'single',
        color: '#4A90E2',
        opacity: 0.7,
      };

      setPlacementState(prev => ({
        ...prev,
        previewWindow,
        constraintResult,
        isValid: true,
      }));
    } else {
      setPlacementState(prev => ({
        ...prev,
        previewWindow: null,
        constraintResult,
        isValid: false,
      }));
    }
  }, [placementState.isPlacing, activeTool, walls, doors, windows]);

  const finishPlacement = useCallback(() => {
    if (!placementState.isPlacing || !placementState.isValid || !placementState.previewWindow) {
      return;
    }

    const newWindow: Window = {
      ...placementState.previewWindow,
      id: `window-${Date.now()}`,
    };

    // Add to current floor (single source of truth)
    if (currentFloorId) {
      addElementToFloor(currentFloorId, 'windows', newWindow);
    }

    // Switch to select tool and select the new window
    setActiveTool('select');
    selectElement(newWindow.id, 'window');

    setPlacementState({
      isPlacing: false,
      previewWindow: null,
      constraintResult: null,
      isValid: false,
    });
  }, [placementState, currentFloorId, addElementToFloor, setActiveTool, selectElement]);

  const cancelPlacement = useCallback(() => {
    setPlacementState({
      isPlacing: false,
      previewWindow: null,
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
