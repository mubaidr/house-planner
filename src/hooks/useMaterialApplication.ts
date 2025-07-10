import { useCallback } from 'react';
import { useMaterialStore } from '@/stores/materialStore';
import { useDesignStore } from '@/stores/designStore';
import { MaterialApplication } from '@/types/materials/Material';

export const useMaterialApplication = () => {
  const { applyMaterial, getMaterialApplication, removeMaterialApplication } = useMaterialStore();
  const { walls, doors, windows, rooms, updateWall, updateDoor, updateWindow, updateRoom } = useDesignStore();

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
        }
        break;
      case 'door':
        const door = doors.find(d => d.id === elementId);
        if (door) {
          updateDoor(elementId, { materialId });
        }
        break;
      case 'window':
        const window = windows.find(w => w.id === elementId);
        if (window) {
          updateWindow(elementId, { materialId });
        }
        break;
      case 'room':
        const room = rooms.find(r => r.id === elementId);
        if (room) {
          updateRoom(elementId, { materialId });
        }
        break;
    }
  }, [applyMaterial, walls, doors, windows, rooms, updateWall, updateDoor, updateWindow, updateRoom]);

  const removeMaterialFromElement = useCallback((
    elementId: string,
    elementType: 'wall' | 'door' | 'window' | 'room'
  ) => {
    removeMaterialApplication(elementId, elementType);

    // Remove material reference from element
    switch (elementType) {
      case 'wall':
        updateWall(elementId, { materialId: undefined });
        break;
      case 'door':
        updateDoor(elementId, { materialId: undefined });
        break;
      case 'window':
        updateWindow(elementId, { materialId: undefined });
        break;
      case 'room':
        updateRoom(elementId, { materialId: undefined });
        break;
    }
  }, [removeMaterialApplication, updateWall, updateDoor, updateWindow, updateRoom]);

  const getElementMaterial = useCallback((
    elementId: string,
    elementType: 'wall' | 'door' | 'window' | 'room'
  ) => {
    return getMaterialApplication(elementId, elementType);
  }, [getMaterialApplication]);

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
      // This would need to be implemented based on your canvas hit detection
      console.log('Material dropped at:', canvasPosition, 'Material ID:', dropData.materialId);
      
      // TODO: Implement hit detection to find which element is at the drop position
      // For now, this is a placeholder for the integration
    } catch (error) {
      console.error('Error handling material drop:', error);
    }
  }, []);

  return {
    applyMaterialToElement,
    removeMaterialFromElement,
    getElementMaterial,
    handleCanvasDrop,
  };
};