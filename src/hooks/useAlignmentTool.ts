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
    // For now, return all elements - in a real implementation,
    // you'd track selected elements in the store
    const allElements: AlignableElement[] = [
      ...walls,
      ...doors,
      ...windows,
      ...stairs,
      ...roofs.map(roof => ({
        ...roof,
        x: roof.points[0]?.x || 0,
        y: roof.points[0]?.y || 0,
        width: Math.max(...roof.points.map(p => p.x)) - Math.min(...roof.points.map(p => p.x)),
        height: Math.max(...roof.points.map(p => p.y)) - Math.min(...roof.points.map(p => p.y)),
      }))
    ];
    return allElements;
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
      type: 'ALIGN_ELEMENTS',
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
