import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';

/**
 * Calculate the new position and angle of a door or window when its parent wall moves
 */
export function calculateNewElementPosition(
  element: Door | Window,
  oldWall: Wall,
  newWall: Wall
): { x: number; y: number; wallAngle: number } {
  // Calculate the element's position relative to the old wall
  const oldWallLength = Math.sqrt(
    Math.pow(oldWall.endX - oldWall.startX, 2) + 
    Math.pow(oldWall.endY - oldWall.startY, 2)
  );
  
  const newWallLength = Math.sqrt(
    Math.pow(newWall.endX - newWall.startX, 2) + 
    Math.pow(newWall.endY - newWall.startY, 2)
  );

  // If wall length is zero, return current position
  if (oldWallLength === 0 || newWallLength === 0) {
    return { x: element.x, y: element.y, wallAngle: element.wallAngle };
  }

  // Calculate the element's position as a ratio along the old wall
  const elementToStartX = element.x - oldWall.startX;
  const elementToStartY = element.y - oldWall.startY;
  
  // Project the element position onto the old wall direction
  const oldWallDirX = (oldWall.endX - oldWall.startX) / oldWallLength;
  const oldWallDirY = (oldWall.endY - oldWall.startY) / oldWallLength;
  
  const projectionLength = elementToStartX * oldWallDirX + elementToStartY * oldWallDirY;
  const ratioAlongWall = projectionLength / oldWallLength;
  
  // Calculate perpendicular distance from wall
  const perpX = elementToStartX - projectionLength * oldWallDirX;
  const perpY = elementToStartY - projectionLength * oldWallDirY;
  
  // Apply the same ratio to the new wall
  const newWallDirX = (newWall.endX - newWall.startX) / newWallLength;
  const newWallDirY = (newWall.endY - newWall.startY) / newWallLength;
  
  const newProjectionLength = ratioAlongWall * newWallLength;
  
  // Calculate new position maintaining the same relative position
  const newX = newWall.startX + newProjectionLength * newWallDirX + perpX;
  const newY = newWall.startY + newProjectionLength * newWallDirY + perpY;
  
  // Calculate the new wall angle
  const newWallAngle = Math.atan2(newWall.endY - newWall.startY, newWall.endX - newWall.startX);
  
  return { x: newX, y: newY, wallAngle: newWallAngle };
}

/**
 * Update doors and windows positions when their parent wall moves
 */
export function updateElementsForWallMovement(
  doors: Door[],
  windows: Window[],
  wallId: string,
  oldWall: Wall,
  newWall: Wall
): {
  updatedDoors: Door[];
  updatedWindows: Window[];
} {
  const updatedDoors = doors.map(door => {
    if (door.wallId === wallId) {
      const newPositionAndAngle = calculateNewElementPosition(door, oldWall, newWall);
      return { ...door, ...newPositionAndAngle };
    }
    return door;
  });

  const updatedWindows = windows.map(window => {
    if (window.wallId === wallId) {
      const newPositionAndAngle = calculateNewElementPosition(window, oldWall, newWall);
      return { ...window, ...newPositionAndAngle };
    }
    return window;
  });

  return { updatedDoors, updatedWindows };
}