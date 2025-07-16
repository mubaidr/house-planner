import { useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useFloorStore } from '@/stores/floorStore';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Stair } from '@/types/elements/Stair';
import { Roof } from '@/types/elements/Roof';

interface ClipboardData {
  type: 'wall' | 'door' | 'window' | 'stair' | 'roof';
  element: Wall | Door | Window | Stair | Roof;
}

export const useClipboard = () => {
  const {
    selectedElementId,
    selectedElementType,
    walls,
    doors,
    windows,
    stairs,
    roofs,
    addWall,
    addDoor,
    addWindow,
    addStair,
    addRoof,
    selectElement
  } = useDesignStore();
  const { executeCommand } = useHistoryStore();
  const { currentFloorId, addElementToFloor } = useFloorStore();

  const copyElement = useCallback(() => {
    if (!selectedElementId || !selectedElementType) return null;

    let element: Wall | Door | Window | Stair | Roof | undefined;

    switch (selectedElementType) {
      case 'wall':
        element = walls.find(w => w.id === selectedElementId);
        break;
      case 'door':
        element = doors.find(d => d.id === selectedElementId);
        break;
      case 'window':
        element = windows.find(w => w.id === selectedElementId);
        break;
      case 'stair':
        element = stairs.find(s => s.id === selectedElementId);
        break;
      case 'roof':
        element = roofs.find(r => r.id === selectedElementId);
        break;
    }

    if (element) {
      const clipboardData: ClipboardData = {
        type: selectedElementType,
        element: { ...element }
      };

      // Store in localStorage for persistence across sessions
      localStorage.setItem('house-planner-clipboard', JSON.stringify(clipboardData));

      return clipboardData;
    }

    return null;
  }, [selectedElementId, selectedElementType, walls, doors, windows, stairs, roofs]);

  const pasteElement = useCallback((offsetX: number = 50, offsetY: number = 50) => {
    try {
      const clipboardJson = localStorage.getItem('house-planner-clipboard');
      if (!clipboardJson) return null;

      const clipboardData: ClipboardData = JSON.parse(clipboardJson);
      const { type, element } = clipboardData;

      // Generate new ID and offset position
      const newId = `${type}-${Date.now()}`;
      let newElement: Wall | Door | Window | Stair | Roof;

      switch (type) {
        case 'wall':
          const wallElement = element as Wall;
          newElement = {
            ...wallElement,
            id: newId,
            startX: wallElement.startX + offsetX,
            startY: wallElement.startY + offsetY,
            endX: wallElement.endX + offsetX,
            endY: wallElement.endY + offsetY,
          };
          break;

        case 'door':
          const doorElement = element as Door;
          newElement = {
            ...doorElement,
            id: newId,
            x: doorElement.x + offsetX,
            y: doorElement.y + offsetY,
            wallId: '', // Clear wall association for pasted doors
          };
          break;

        case 'window':
          const windowElement = element as Window;
          newElement = {
            ...windowElement,
            id: newId,
            x: windowElement.x + offsetX,
            y: windowElement.y + offsetY,
            wallId: '', // Clear wall association for pasted windows
          };
          break;

        case 'stair':
          const stairElement = element as Stair;
          newElement = {
            ...stairElement,
            id: newId,
            x: stairElement.x + offsetX,
            y: stairElement.y + offsetY,
          };
          break;

        case 'roof':
          const roofElement = element as Roof;
          newElement = {
            ...roofElement,
            id: newId,
            position: {
              ...roofElement.position,
              x: roofElement.position.x + offsetX,
              y: roofElement.position.y + offsetY,
            },
          };
          break;

        default:
          return null;
      }

      // Add element with history support
      executeCommand({
        type: `PASTE_${type.toUpperCase()}`,
        execute: () => {
          // Add to current floor first
          if (currentFloorId) {
            addElementToFloor(currentFloorId, `${type}s` as 'walls' | 'doors' | 'windows' | 'stairs' | 'roofs', newElement);
          }

          // Add to design store
          switch (type) {
            case 'wall':
              addWall(newElement as Wall);
              break;
            case 'door':
              addDoor(newElement as Door);
              break;
            case 'window':
              addWindow(newElement as Window);
              break;
            case 'stair':
              addStair(newElement as Stair);
              break;
            case 'roof':
              addRoof(newElement as Roof);
              break;
          }

          // Select the new element
          selectElement(newId, type);
        },
        undo: () => {
          // Remove element logic would go here
        },
        description: `Paste ${type}`,
      });

      return newElement;

    } catch (error) {
      console.error('Error pasting element:', error);
      return null;
    }
  }, [executeCommand, currentFloorId, addElementToFloor, addWall, addDoor, addWindow, addStair, addRoof, selectElement]);

  const hasClipboardData = useCallback(() => {
    try {
      const clipboardJson = localStorage.getItem('house-planner-clipboard');
      return !!clipboardJson;
    } catch {
      return false;
    }
  }, []);

  const getClipboardType = useCallback(() => {
    try {
      const clipboardJson = localStorage.getItem('house-planner-clipboard');
      if (!clipboardJson) return null;

      const clipboardData: ClipboardData = JSON.parse(clipboardJson);
      return clipboardData.type;
    } catch {
      return null;
    }
  }, []);

  return {
    copyElement,
    pasteElement,
    hasClipboardData,
    getClipboardType,
  };
};
