import { useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useHistoryStore } from '@/stores/historyStore';
import {
  AlignableElement,
  alignLeft,
  alignRight,
  alignTop,
  alignBottom,
  alignCenterHorizontal,
  alignCenterVertical,
  distributeHorizontally,
  distributeVertically,
  generateAlignmentGuides
} from '@/utils/alignmentUtils';

export const useAlignmentTool = () => {
  const { walls, doors, windows, stairs, roofs, updateWall, updateDoor, updateWindow, updateStair, updateRoof } = useDesignStore();
  const { currentFloorId, updateElementInFloor } = useFloorStore();
  const { executeCommand } = useHistoryStore();

  // Get all selected elements (this would need to be implemented in the design store)
  const getSelectedElements = useCallback((): AlignableElement[] => {
    // Convert different element types to AlignableElement format
    const alignableElements: AlignableElement[] = [
      // Convert walls: use startX/Y for x/y
      ...walls.map(wall => ({
        id: wall.id,
        x: wall.startX,
        y: wall.startY,
        startX: wall.startX,
        startY: wall.startY,
        endX: wall.endX,
        endY: wall.endY,
      })),
      // Doors and windows already have x, y, width, height
      ...doors.map(door => ({
        id: door.id,
        x: door.x,
        y: door.y,
        width: door.width,
        height: door.height,
      })),
      ...windows.map(window => ({
        id: window.id,
        x: window.x,
        y: window.y,
        width: window.width,
        height: window.height,
      })),
      // Stairs have x, y, width, length (use as height)
      ...stairs.map(stair => ({
        id: stair.id,
        x: stair.x,
        y: stair.y,
        width: stair.width,
        height: stair.length, // Use length as height for alignment purposes
      })),
      // Convert roofs: use bounding box from points
      ...roofs.map(roof => ({
        id: roof.id,
        x: roof.points[0]?.x || 0,
        y: roof.points[0]?.y || 0,
        width: Math.max(...roof.points.map(p => p.x)) - Math.min(...roof.points.map(p => p.x)),
        height: Math.max(...roof.points.map(p => p.y)) - Math.min(...roof.points.map(p => p.y)),
      }))
    ];
    return alignableElements;
  }, [walls, doors, windows, stairs, roofs]);

  const applyAlignment = useCallback((
    alignmentFunction: (elements: AlignableElement[]) => AlignableElement[],
    description: string
  ) => {
    const selectedElements = getSelectedElements();
    if (selectedElements.length < 2) return;

    const originalElements = [...selectedElements];
    const alignedElements = alignmentFunction(selectedElements);

    executeCommand({
      execute: () => {
        alignedElements.forEach(element => {
          if ('startX' in element && element.startX !== undefined) {
            // Wall element
            updateWall(element.id, element);
            if (currentFloorId) {
              updateElementInFloor(currentFloorId, 'walls', element.id, element);
            }
          } else if (doors.find(d => d.id === element.id)) {
            updateDoor(element.id, element);
            if (currentFloorId) {
              updateElementInFloor(currentFloorId, 'doors', element.id, element);
            }
          } else if (windows.find(w => w.id === element.id)) {
            updateWindow(element.id, element);
            if (currentFloorId) {
              updateElementInFloor(currentFloorId, 'windows', element.id, element);
            }
          } else if (stairs.find(s => s.id === element.id)) {
            updateStair(element.id, element);
            if (currentFloorId) {
              updateElementInFloor(currentFloorId, 'stairs', element.id, element);
            }
          } else if (roofs.find(r => r.id === element.id)) {
            updateRoof(element.id, element);
            if (currentFloorId) {
              updateElementInFloor(currentFloorId, 'roofs', element.id, element);
            }
          }
        });
      },
      undo: () => {
        originalElements.forEach(element => {
          if ('startX' in element && element.startX !== undefined) {
            // Wall element
            updateWall(element.id, element);
            if (currentFloorId) {
              updateElementInFloor(currentFloorId, 'walls', element.id, element);
            }
          } else if (doors.find(d => d.id === element.id)) {
            updateDoor(element.id, element);
            if (currentFloorId) {
              updateElementInFloor(currentFloorId, 'doors', element.id, element);
            }
          } else if (windows.find(w => w.id === element.id)) {
            updateWindow(element.id, element);
            if (currentFloorId) {
              updateElementInFloor(currentFloorId, 'windows', element.id, element);
            }
          } else if (stairs.find(s => s.id === element.id)) {
            updateStair(element.id, element);
            if (currentFloorId) {
              updateElementInFloor(currentFloorId, 'stairs', element.id, element);
            }
          } else if (roofs.find(r => r.id === element.id)) {
            updateRoof(element.id, element);
            if (currentFloorId) {
              updateElementInFloor(currentFloorId, 'roofs', element.id, element);
            }
          }
        });
      },
      description,
    });
  }, [getSelectedElements, executeCommand, updateWall, updateDoor, updateWindow, updateStair, updateRoof, doors, windows, stairs, roofs, currentFloorId, updateElementInFloor]);

  const alignLeftElements = useCallback(() => {
    applyAlignment(alignLeft, 'Align left');
  }, [applyAlignment]);

  const alignRightElements = useCallback(() => {
    applyAlignment(alignRight, 'Align right');
  }, [applyAlignment]);

  const alignTopElements = useCallback(() => {
    applyAlignment(alignTop, 'Align top');
  }, [applyAlignment]);

  const alignBottomElements = useCallback(() => {
    applyAlignment(alignBottom, 'Align bottom');
  }, [applyAlignment]);

  const alignCenterHorizontalElements = useCallback(() => {
    applyAlignment(alignCenterHorizontal, 'Align center horizontal');
  }, [applyAlignment]);

  const alignCenterVerticalElements = useCallback(() => {
    applyAlignment(alignCenterVertical, 'Align center vertical');
  }, [applyAlignment]);

  const distributeHorizontallyElements = useCallback(() => {
    applyAlignment(distributeHorizontally, 'Distribute horizontally');
  }, [applyAlignment]);

  const distributeVerticallyElements = useCallback(() => {
    applyAlignment(distributeVertically, 'Distribute vertically');
  }, [applyAlignment]);

  const getAlignmentGuides = useCallback(() => {
    const allElements = getSelectedElements();
    return generateAlignmentGuides(allElements);
  }, [getSelectedElements]);

  return {
    alignLeftElements,
    alignRightElements,
    alignTopElements,
    alignBottomElements,
    alignCenterHorizontalElements,
    alignCenterVerticalElements,
    distributeHorizontallyElements,
    distributeVerticallyElements,
    getAlignmentGuides,
  };
};
