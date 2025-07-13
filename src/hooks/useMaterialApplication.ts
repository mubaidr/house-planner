import { useCallback } from 'react';
import { useMaterialStore } from '@/stores/materialStore';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { MaterialApplication } from '@/types/materials/Material';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Room } from '@/utils/roomDetection';

// Hit detection helper functions
const isPointOnWall = (x: number, y: number, wall: Wall): boolean => {
  const tolerance = wall.thickness / 2 + 5; // Add some tolerance for easier selection
  
  // Calculate distance from point to line segment
  const A = x - wall.startX;
  const B = y - wall.startY;
  const C = wall.endX - wall.startX;
  const D = wall.endY - wall.startY;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B) <= tolerance;
  
  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));
  
  const xx = wall.startX + param * C;
  const yy = wall.startY + param * D;
  
  const dx = x - xx;
  const dy = y - yy;
  
  return Math.sqrt(dx * dx + dy * dy) <= tolerance;
};

const isPointOnDoor = (x: number, y: number, door: Door): boolean => {
  // Simple rectangular hit detection for doors
  const tolerance = 10;
  return (
    x >= door.x - tolerance &&
    x <= door.x + door.width + tolerance &&
    y >= door.y - tolerance &&
    y <= door.y + door.height + tolerance
  );
};

const isPointOnWindow = (x: number, y: number, window: Window): boolean => {
  // Simple rectangular hit detection for windows
  const tolerance = 10;
  return (
    x >= window.x - tolerance &&
    x <= window.x + window.width + tolerance &&
    y >= window.y - tolerance &&
    y <= window.y + window.height + tolerance
  );
};

const isPointInRoom = (x: number, y: number, room: Room): boolean => {
  // Point-in-polygon test using ray casting algorithm
  const vertices = room.vertices;
  let inside = false;
  
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    if (
      vertices[i].y > y !== vertices[j].y > y &&
      x < ((vertices[j].x - vertices[i].x) * (y - vertices[i].y)) / (vertices[j].y - vertices[i].y) + vertices[i].x
    ) {
      inside = !inside;
    }
  }
  
  return inside;
};

export const useMaterialApplication = () => {
  const { applyMaterial, getMaterialApplication, removeMaterialApplication } = useMaterialStore();
  const { walls, doors, windows, rooms, updateWall, updateDoor, updateWindow, updateRoom } = useDesignStore();
  const { currentFloorId, updateElementInFloor } = useFloorStore();

  const applyMaterialToElement = useCallback((
    elementId: string,
    elementType: 'wall' | 'door' | 'window' | 'room',
    materialId: string,
    coverage: number = 100
  ) => {
    const application: MaterialApplication = {
      elementId,
      elementType,
      materialId,
      appliedAt: new Date(),
      coverage,
    };

    applyMaterial(application);

    // Update the element's visual properties if needed
    switch (elementType) {
      case 'wall':
        const wall = walls.find(w => w.id === elementId);
        if (wall) {
          updateWall(elementId, { materialId });
          if (currentFloorId) {
            updateElementInFloor(currentFloorId, 'walls', elementId, { materialId });
          }
        }
        break;
      case 'door':
        const door = doors.find(d => d.id === elementId);
        if (door) {
          updateDoor(elementId, { materialId });
          if (currentFloorId) {
            updateElementInFloor(currentFloorId, 'doors', elementId, { materialId });
          }
        }
        break;
      case 'window':
        const window = windows.find(w => w.id === elementId);
        if (window) {
          updateWindow(elementId, { materialId });
          if (currentFloorId) {
            updateElementInFloor(currentFloorId, 'windows', elementId, { materialId });
          }
        }
        break;
      case 'room':
        const room = rooms.find(r => r.id === elementId);
        if (room) {
          updateRoom(elementId, { materialId });
        }
        break;
    }
  }, [applyMaterial, walls, doors, windows, rooms, updateWall, updateDoor, updateWindow, updateRoom, currentFloorId, updateElementInFloor]);

  const removeMaterialFromElement = useCallback((
    elementId: string,
    elementType: 'wall' | 'door' | 'window' | 'room'
  ) => {
    removeMaterialApplication(elementId, elementType);

    // Remove material reference from element
    switch (elementType) {
      case 'wall':
        updateWall(elementId, { materialId: undefined });
        if (currentFloorId) {
          updateElementInFloor(currentFloorId, 'walls', elementId, { materialId: undefined });
        }
        break;
      case 'door':
        updateDoor(elementId, { materialId: undefined });
        if (currentFloorId) {
          updateElementInFloor(currentFloorId, 'doors', elementId, { materialId: undefined });
        }
        break;
      case 'window':
        updateWindow(elementId, { materialId: undefined });
        if (currentFloorId) {
          updateElementInFloor(currentFloorId, 'windows', elementId, { materialId: undefined });
        }
        break;
      case 'room':
        updateRoom(elementId, { materialId: undefined });
        break;
    }
  }, [removeMaterialApplication, updateWall, updateDoor, updateWindow, updateRoom, currentFloorId, updateElementInFloor]);

  const getElementMaterial = useCallback((
    elementId: string,
    elementType: 'wall' | 'door' | 'window' | 'room'
  ) => {
    return getMaterialApplication(elementId, elementType);
  }, [getMaterialApplication]);

  const findElementAtPosition = useCallback((x: number, y: number) => {
    // Check walls first
    for (const wall of walls) {
      if (isPointOnWall(x, y, wall)) {
        return { type: 'wall' as const, element: wall };
      }
    }
    
    // Check doors
    for (const door of doors) {
      if (isPointOnDoor(x, y, door)) {
        return { type: 'door' as const, element: door };
      }
    }
    
    // Check windows
    for (const window of windows) {
      if (isPointOnWindow(x, y, window)) {
        return { type: 'window' as const, element: window };
      }
    }
    
    // Check rooms
    for (const room of rooms) {
      if (isPointInRoom(x, y, room)) {
        return { type: 'room' as const, element: room };
      }
    }
    
    return null;
  }, [walls, doors, windows, rooms]);

  const handleCanvasDrop = useCallback((
    e: DragEvent,
    canvasPosition: { x: number; y: number }
  ) => {
    e.preventDefault();
    
    try {
      const data = e.dataTransfer?.getData('application/json');
      if (!data) return;

      const dropData = JSON.parse(data);
      if (dropData.type !== 'material') return;

      // Find the element at the drop position
      const hitResult = findElementAtPosition(canvasPosition.x, canvasPosition.y);
      
      if (hitResult) {
        applyMaterialToElement(
          hitResult.element.id,
          hitResult.type,
          dropData.materialId
        );
        console.log(`Applied material "${dropData.materialId}" to ${hitResult.type} ${hitResult.element.id}`);
      } else {
        console.log('No element found at drop position');
      }
    } catch (error) {
      console.error('Error handling material drop:', error);
    }
  }, [findElementAtPosition, applyMaterialToElement]);

  return {
    applyMaterialToElement,
    removeMaterialFromElement,
    getElementMaterial,
    handleCanvasDrop,
    findElementAtPosition,
  };
};