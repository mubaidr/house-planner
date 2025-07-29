import { useCallback } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useHistoryStore } from '@/stores/historyStore';
import { snapPoint } from '@/utils/snapping';
import { getWallSnapPointsWithIntersections } from '@/utils/wallIntersection';
import { updateElementsForWallMovement } from '@/utils/wallElementMovement';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Stair } from '@/types/elements/Stair';
import { Roof } from '@/types/elements/Roof';

export interface ElementMovementHooks {
  handleWallDragMove: (e: KonvaEventObject<DragEvent>, wallId: string) => void;
  handleDoorDragMove: (e: KonvaEventObject<DragEvent>, doorId: string) => void;
  handleWindowDragMove: (e: KonvaEventObject<DragEvent>, windowId: string) => void;
  handleStairDragMove: (e: KonvaEventObject<DragEvent>, stairId: string) => void;
  handleRoofDragMove: (e: KonvaEventObject<DragEvent>, roofId: string) => void;
  handleElementDragEnd: (elementId: string, elementType: string) => void;
}

export const useElementMovement = (): ElementMovementHooks => {
  const {
    walls,
    doors,
    windows,
    stairs,
    roofs,
    updateWall,
    updateDoor,
    updateWindow,
    updateStair,
    updateRoof
  } = useDesignStore();

  const { snapToGrid, gridSize } = useUIStore();
  const { executeCommand } = useHistoryStore();

  // Wall movement handler
  const handleWallDragMove = useCallback((e: KonvaEventObject<DragEvent>, wallId: string) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const wall = walls.find(w => w.id === wallId);
    if (!wall) return;

    // Get snap points including intersections
    const snapPoints = getWallSnapPointsWithIntersections(walls.filter(w => w.id !== wallId));

    // Apply snapping to the pointer position
    const snapResult = snapPoint(
      pointerPosition,
      gridSize,
      snapPoints,
      snapToGrid
    );

    // Calculate the delta from the wall's start point
    const deltaX = snapResult.x - wall.startX;
    const deltaY = snapResult.y - wall.startY;

    // Update wall position
    const updatedWall: Wall = {
      ...wall,
      startX: wall.startX + deltaX,
      startY: wall.startY + deltaY,
      endX: wall.endX + deltaX,
      endY: wall.endY + deltaY,
    };

    // Update the wall
    updateWall(wallId, {
      startX: updatedWall.startX,
      startY: updatedWall.startY,
      endX: updatedWall.endX,
      endY: updatedWall.endY,
    });

    // Update connected doors and windows
    const { updatedDoors, updatedWindows } = updateElementsForWallMovement(
      doors,
      windows,
      wallId,
      wall,
      updatedWall
    );

    // Apply updates to connected elements
    updatedDoors.forEach(door => {
      updateDoor(door.id, door);
    });

    updatedWindows.forEach(window => {
      updateWindow(window.id, window);
    });

  }, [walls, doors, windows, updateWall, updateDoor, updateWindow, gridSize, snapToGrid]);

  // Door movement handler (along wall)
  const handleDoorDragMove = useCallback((e: KonvaEventObject<DragEvent>, doorId: string) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const door = doors.find(d => d.id === doorId);
    if (!door) return;

    const wall = walls.find(w => w.id === door.wallId);
    if (!wall) return;

    // Calculate position along wall (0-1)
    const wallLength = Math.sqrt(
      Math.pow(wall.endX - wall.startX, 2) +
      Math.pow(wall.endY - wall.startY, 2)
    );

    if (wallLength === 0) return;

    // Project pointer position onto wall line
    const wallVector = {
      x: wall.endX - wall.startX,
      y: wall.endY - wall.startY
    };

    const pointerVector = {
      x: pointerPosition.x - wall.startX,
      y: pointerPosition.y - wall.startY
    };

    // Calculate dot product to find projection
    const dotProduct = (pointerVector.x * wallVector.x + pointerVector.y * wallVector.y);
    const projectionLength = dotProduct / wallLength;

    // Clamp position to wall bounds (leave space for door width)
    const doorHalfWidth = door.width / 2;
    const minPosition = doorHalfWidth / wallLength;
    const maxPosition = 1 - (doorHalfWidth / wallLength);

    const newPosition = Math.max(minPosition, Math.min(maxPosition, projectionLength / wallLength));

    // Calculate new absolute position from relative position on wall
    const newX = wall.startX + newPosition * wallVector.x;
    const newY = wall.startY + newPosition * wallVector.y;

    // Update door position
    updateDoor(doorId, {
      x: newX,
      y: newY
    });

  }, [doors, walls, updateDoor]);

  // Window movement handler (along wall)
  const handleWindowDragMove = useCallback((e: KonvaEventObject<DragEvent>, windowId: string) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const window = windows.find(w => w.id === windowId);
    if (!window) return;

    const wall = walls.find(w => w.id === window.wallId);
    if (!wall) return;

    // Calculate position along wall (similar to door logic)
    const wallLength = Math.sqrt(
      Math.pow(wall.endX - wall.startX, 2) +
      Math.pow(wall.endY - wall.startY, 2)
    );

    if (wallLength === 0) return;

    const wallVector = {
      x: wall.endX - wall.startX,
      y: wall.endY - wall.startY
    };

    const pointerVector = {
      x: pointerPosition.x - wall.startX,
      y: pointerPosition.y - wall.startY
    };

    const dotProduct = (pointerVector.x * wallVector.x + pointerVector.y * wallVector.y);
    const projectionLength = dotProduct / wallLength;

    // Clamp position to wall bounds
    const windowHalfWidth = window.width / 2;
    const minPosition = windowHalfWidth / wallLength;
    const maxPosition = 1 - (windowHalfWidth / wallLength);

    const newPosition = Math.max(minPosition, Math.min(maxPosition, projectionLength / wallLength));

    // Calculate new absolute position from relative position on wall
    const newX = wall.startX + newPosition * wallVector.x;
    const newY = wall.startY + newPosition * wallVector.y;

    updateWindow(windowId, {
      x: newX,
      y: newY
    });

  }, [windows, walls, updateWindow]);

  // Stair movement handler
  const handleStairDragMove = useCallback((e: KonvaEventObject<DragEvent>, stairId: string) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const stair = stairs.find(s => s.id === stairId);
    if (!stair) return;

    // Apply snapping
    const snapPoints = getWallSnapPointsWithIntersections(walls);
    const snapResult = snapPoint(
      pointerPosition,
      gridSize,
      snapPoints,
      snapToGrid
    );

    // Update stair position
    updateStair(stairId, {
      x: snapResult.x,
      y: snapResult.y
    });

  }, [stairs, walls, updateStair, gridSize, snapToGrid]);

  // Roof movement handler
  const handleRoofDragMove = useCallback((e: KonvaEventObject<DragEvent>, roofId: string) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const roof = roofs.find(r => r.id === roofId);
    if (!roof) return;

    // Apply snapping
    const snapPoints = getWallSnapPointsWithIntersections(walls);
    const snapResult = snapPoint(
      pointerPosition,
      gridSize,
      snapPoints,
      snapToGrid
    );

    // Calculate roof centroid (current position)
    const centroid = {
      x: roof.points.reduce((sum, p) => sum + p.x, 0) / roof.points.length,
      y: roof.points.reduce((sum, p) => sum + p.y, 0) / roof.points.length
    };

    // Calculate offset from current centroid to new position
    const deltaX = snapResult.x - centroid.x;
    const deltaY = snapResult.y - centroid.y;

    // Update roof by moving all points
    updateRoof(roofId, {
      points: roof.points.map(point => ({
        x: point.x + deltaX,
        y: point.y + deltaY
      }))
    });

  }, [roofs, walls, updateRoof, gridSize, snapToGrid]);

  // Generic drag end handler for history tracking
  const handleElementDragEnd = useCallback((elementId: string, elementType: string) => {
    // This could be used to create undo/redo commands for movements
    // For now, the movement is already applied via the drag move handlers
    console.log(`Element ${elementType} ${elementId} movement completed`);
  }, []);

  return {
    handleWallDragMove,
    handleDoorDragMove,
    handleWindowDragMove,
    handleStairDragMove,
    handleRoofDragMove,
    handleElementDragEnd,
  };
};
