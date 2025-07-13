import { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useHistoryStore } from '@/stores/historyStore';
import { Window } from '@/types/elements/Window';
import { canPlaceWindow, WallConstraintResult } from '@/utils/wallConstraints';
import { AddWindowCommand } from '@/utils/history';

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

  const { addWindow, removeWindow, walls, doors, windows } = useDesignStore();
  const { activeTool } = useUIStore();
  const { executeCommand } = useHistoryStore();

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

    // Use command pattern for undo/redo support
    const command = new AddWindowCommand(
      newWindow.id,
      addWindow,
      removeWindow,
      newWindow
    );
    executeCommand(command);

    setPlacementState({
      isPlacing: false,
      previewWindow: null,
      constraintResult: null,
      isValid: false,
    });
  }, [placementState, addWindow, removeWindow, executeCommand]);

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
