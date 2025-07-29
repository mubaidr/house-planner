import { useEffect, useCallback, useState } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useAccessibilityAnnouncer } from '@/components/Accessibility/AccessibilityAnnouncer';

interface KeyboardNavigationState {
  focusedElementId: string | null;
  focusedElementType: 'wall' | 'door' | 'window' | 'stair' | 'roof' | 'room' | null;
  isCanvasFocused: boolean;
  navigationMode: 'browse' | 'edit';
}

interface ElementInfo {
  id: string;
  type: 'wall' | 'door' | 'window' | 'stair' | 'roof' | 'room';
  element: any;
}

export function useCanvasKeyboardNavigation() {
  const [navigationState, setNavigationState] = useState<KeyboardNavigationState>({
    focusedElementId: null,
    focusedElementType: null,
    isCanvasFocused: false,
    navigationMode: 'browse',
  });

  const {
    walls,
    doors,
    windows,
    stairs,
    roofs,
    rooms,
    selectElement,
    removeWall,
    removeDoor,
    removeWindow,
    removeStair,
    removeRoof,
    updateWall,
    updateStair,
    updateRoof
  } = useDesignStore();

  // Remove unused accessibility store for now
  const {
    announceElementSelected,
    announceElementDeleted,
    announceElementMoved
  } = useAccessibilityAnnouncer();

  // Get all elements in a flat array for navigation
  const getAllElements = useCallback((): ElementInfo[] => {
    return [
      ...walls.map(w => ({ id: w.id, type: 'wall' as const, element: w })),
      ...doors.map(d => ({ id: d.id, type: 'door' as const, element: d })),
      ...windows.map(w => ({ id: w.id, type: 'window' as const, element: w })),
      ...stairs.map(s => ({ id: s.id, type: 'stair' as const, element: s })),
      ...roofs.map(r => ({ id: r.id, type: 'roof' as const, element: r })),
      ...rooms.map(r => ({ id: r.id, type: 'room' as const, element: r })),
    ];
  }, [walls, doors, windows, stairs, roofs, rooms]);

  // Navigate to next/previous element
  const navigateElements = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const elements = getAllElements();
    if (elements.length === 0) return;

    const currentIndex = elements.findIndex(e => e.id === navigationState.focusedElementId);
    let nextIndex: number;

    switch (direction) {
      case 'right':
      case 'down':
        nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % elements.length;
        break;
      case 'left':
      case 'up':
        nextIndex = currentIndex === -1 ? elements.length - 1 : (currentIndex - 1 + elements.length) % elements.length;
        break;
      default:
        return;
    }

    const nextElement = elements[nextIndex];
    if (nextElement) {
      setNavigationState(prev => ({
        ...prev,
        focusedElementId: nextElement.id,
        focusedElementType: nextElement.type,
      }));

      announceElementSelected(nextElement.type, nextElement.id);
    }
  }, [navigationState.focusedElementId, getAllElements, announceElementSelected]);

  // Select the currently focused element
  const selectFocusedElement = useCallback(() => {
    if (navigationState.focusedElementId && navigationState.focusedElementType) {
      selectElement(navigationState.focusedElementId, navigationState.focusedElementType);
      announceElementSelected(navigationState.focusedElementType, navigationState.focusedElementId);
    }
  }, [navigationState.focusedElementId, navigationState.focusedElementType, selectElement, announceElementSelected]);

  // Delete the currently focused element
  const deleteFocusedElement = useCallback(() => {
    if (!navigationState.focusedElementId || !navigationState.focusedElementType) return;

    const elementId = navigationState.focusedElementId;
    const elementType = navigationState.focusedElementType;

    switch (elementType) {
      case 'wall':
        removeWall(elementId);
        break;
      case 'door':
        removeDoor(elementId);
        break;
      case 'window':
        removeWindow(elementId);
        break;
      case 'stair':
        removeStair(elementId);
        break;
      case 'roof':
        removeRoof(elementId);
        break;
      default:
        return;
    }

    announceElementDeleted(elementType, elementId);

    // Clear focus after deletion
    setNavigationState(prev => ({
      ...prev,
      focusedElementId: null,
      focusedElementType: null,
    }));
  }, [navigationState.focusedElementId, navigationState.focusedElementType, removeWall, removeDoor, removeWindow, removeStair, removeRoof, announceElementDeleted]);

  // Move focused element with keyboard
  const moveFocusedElement = useCallback((direction: 'up' | 'down' | 'left' | 'right', distance: number = 10) => {
    if (!navigationState.focusedElementId || !navigationState.focusedElementType) return;

    const elementId = navigationState.focusedElementId;
    const elementType = navigationState.focusedElementType;

    let deltaX = 0;
    let deltaY = 0;

    switch (direction) {
      case 'up':
        deltaY = -distance;
        break;
      case 'down':
        deltaY = distance;
        break;
      case 'left':
        deltaX = -distance;
        break;
      case 'right':
        deltaX = distance;
        break;
    }

    // Apply movement based on element type
    switch (elementType) {
      case 'wall':
        const wall = walls.find(w => w.id === elementId);
        if (wall) {
          updateWall(elementId, {
            startX: wall.startX + deltaX,
            startY: wall.startY + deltaY,
            endX: wall.endX + deltaX,
            endY: wall.endY + deltaY,
          });
        }
        break;
      case 'stair':
        const stair = stairs.find(s => s.id === elementId);
        if (stair) {
          updateStair(elementId, {
            x: stair.x + deltaX,
            y: stair.y + deltaY,
          });
        }
        break;
      case 'roof':
        const roof = roofs.find(r => r.id === elementId);
        if (roof) {
          updateRoof(elementId, {
            points: roof.points.map(point => ({
              x: point.x + deltaX,
              y: point.y + deltaY,
            })),
          });
        }
        break;
      // Doors and windows move along their parent wall, so we don't move them directly
      case 'door':
      case 'window':
        // Could implement moving along wall here
        break;
    }

    announceElementMoved(elementType, elementId, direction, distance);
  }, [navigationState.focusedElementId, navigationState.focusedElementType, walls, stairs, roofs, updateWall, updateStair, updateRoof, announceElementMoved]);

  // Get the currently focused element
  const getFocusedElement = useCallback(() => {
    const elements = getAllElements();
    return elements.find(e => e.id === navigationState.focusedElementId);
  }, [navigationState.focusedElementId, getAllElements]);

  // Set canvas focus state
  const setIsCanvasFocused = useCallback((focused: boolean) => {
    setNavigationState(prev => ({
      ...prev,
      isCanvasFocused: focused,
    }));
  }, []);

  return {
    focusedElementId: navigationState.focusedElementId,
    focusedElementType: navigationState.focusedElementType,
    isCanvasFocused: navigationState.isCanvasFocused,
    navigationMode: navigationState.navigationMode,
    setIsCanvasFocused,
    navigateElements,
    selectFocusedElement,
    deleteFocusedElement,
    moveFocusedElement,
    getAllElements,
    getFocusedElement,
  };
}

export default useCanvasKeyboardNavigation;
