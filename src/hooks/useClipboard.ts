import { useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useFloorStore } from '@/stores/floorStore';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Stair } from '@/types/elements/Stair';
import { Roof } from '@/types/elements/Roof';
import { Room } from '@/types/elements/Room';
import { Command } from '@/types/commands';
import { handleError } from '@/utils/errorHandler';

interface ClipboardData {
  type: 'wall' | 'door' | 'window' | 'stair' | 'roof' | 'room';
  element: Wall | Door | Window | Stair | Roof | Room;
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
    removeWall,
    removeDoor,
    removeWindow,
    removeStair,
    removeRoof,
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
            points: roofElement.points.map(point => ({
              x: point.x + offsetX,
              y: point.y + offsetY,
            })),
          };
          break;

        default:
          return null;
      }

      // Add element with history support
      executeCommand({
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
      handleError(error instanceof Error ? error : new Error('Paste operation failed'), {
        category: 'drawing',
        source: 'useClipboard.paste',
        operation: 'pasteElement'
      }, {
        userMessage: 'Failed to paste the copied element. The clipboard data may be corrupted.',
        suggestions: ['Try copying the element again', 'Check if the element type is supported', 'Ensure clipboard data is valid']
      });
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

  const clearClipboard = useCallback(() => {
    try {
      localStorage.removeItem('house-planner-clipboard');
    } catch (error) {
      handleError(error as Error, {
        source: 'useClipboard.clearClipboard',
        category: 'storage',
        operation: 'clear clipboard'
      });
    }
  }, []);

  const copySelectedElements = useCallback(async (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      await navigator.clipboard.writeText(JSON.stringify({ elements: [], type: 'house-planner-elements' }));
      return;
    }

    const elements = selectedIds.map(id => {
      return walls.find(w => w.id === id) ||
             doors.find(d => d.id === id) ||
             windows.find(w => w.id === id) ||
             roofs.find(r => r.id === id) ||
             stairs.find(s => s.id === id);
    }).filter(Boolean);

    const clipboardData = {
      elements,
      type: 'clipboard_data'
    };

    await navigator.clipboard.writeText(JSON.stringify(clipboardData));
  }, [walls, doors, windows, roofs, stairs]);

  const pasteElements = useCallback(async (offsetX: number = 0, offsetY: number = 0) => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const data = JSON.parse(clipboardText);

      if (data.type !== 'clipboard_data' || !data.elements) {
        return;
      }

      const commands: Command[] = data.elements.map((element: any) => {
        const newElement = {
          ...element,
          id: `${element.type || 'element'}-${Date.now()}-${Math.random()}`,
        };

        // Apply offset if element has position properties
        if (element.startX !== undefined) {
          newElement.startX += offsetX;
          newElement.endX += offsetX;
        }
        if (element.startY !== undefined) {
          newElement.startY += offsetY;
          newElement.endY += offsetY;
        }
        if (element.x !== undefined) {
          newElement.x += offsetX;
        }
        if (element.y !== undefined) {
          newElement.y += offsetY;
        }

        return {
          execute: () => {
            if (element.type === 'wall') addWall(newElement);
            else if (element.type === 'door') addDoor(newElement);
            else if (element.type === 'window') addWindow(newElement);
            else if (element.type === 'roof') addRoof(newElement);
            else if (element.type === 'stair') addStair(newElement);
          },
          undo: () => {
            if (element.type === 'wall') removeWall(newElement.id);
            else if (element.type === 'door') removeDoor(newElement.id);
            else if (element.type === 'window') removeWindow(newElement.id);
            else if (element.type === 'roof') removeRoof(newElement.id);
            else if (element.type === 'stair') removeStair(newElement.id);
          },
          description: `Paste ${element.type}`,
        };
      });

      if (commands.length > 0) {
        executeCommand({
          execute: () => commands.forEach(cmd => cmd.execute()),
          undo: () => commands.forEach(cmd => cmd.undo()),
          description: 'Paste elements',
        });
      }
    } catch {
      // Handle clipboard errors silently - ignore parsing errors
    }
  }, [addWall, addDoor, addWindow, addRoof, addStair, removeWall, removeDoor, removeWindow, removeRoof, removeStair, executeCommand]);

  const duplicateElements = useCallback(async (selectedIds: string[], offsetX: number = 20, offsetY: number = 20) => {
    await copySelectedElements(selectedIds);
    await pasteElements(offsetX, offsetY);
  }, [copySelectedElements, pasteElements]);

  const canPaste = useCallback(async (): Promise<boolean> => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const data = JSON.parse(clipboardText);
      return data.type === 'clipboard_data' && Array.isArray(data.elements);
    } catch {
      return false;
    }
  }, []);

  return {
    copyElement,
    pasteElement,
    hasClipboardData,
    getClipboardType,
    clearClipboard,
    copySelectedElements,
    pasteElements,
    duplicateElements,
    canPaste,
  };
};
