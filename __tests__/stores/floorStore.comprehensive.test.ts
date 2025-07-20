import { act } from 'react';
import { useFloorStore } from '../../src/stores/floorStore';
import { Floor } from '../../src/stores/floorStore';

describe('floorStore - Comprehensive Tests', () => {
  const mockFloor: Floor = {
    id: 'floor-1',
    name: 'Ground Floor',
    level: 0,
    height: 120,
    isVisible: true,
    color: '#000000',
    elements: {
      walls: [],
      doors: [],
      windows: [],
      stairs: [],
      roofs: [],
      rooms: [],
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useFloorStore.getState().clearAllFloors();
    });
  });

  describe('Floor Management', () => {
    it('should add a floor successfully', () => {
      const initialFloorCount = useFloorStore.getState().floors.length;
      
      act(() => {
        useFloorStore.getState().addFloor('Test Floor');
      });

      const state = useFloorStore.getState();
      expect(state.floors).toHaveLength(initialFloorCount + 1);
      expect(state.floors[state.floors.length - 1].name).toBe('Test Floor');
    });

    it('should update floor properties', () => {
      let floorId: string;
      
      act(() => {
        const newFloor = useFloorStore.getState().addFloor('Test Floor');
        floorId = newFloor.id;
        useFloorStore.getState().updateFloor(floorId, {
          name: 'Updated Ground Floor',
          height: 144,
        });
      });

      const state = useFloorStore.getState();
      const updatedFloor = state.floors.find(f => f.id === floorId);
      expect(updatedFloor?.name).toBe('Updated Ground Floor');
      expect(updatedFloor?.height).toBe(144);
    });

    it('should remove a floor', () => {
      let floorId: string;
      const initialFloorCount = useFloorStore.getState().floors.length;
      
      act(() => {
        const newFloor = useFloorStore.getState().addFloor('Test Floor');
        floorId = newFloor.id;
        useFloorStore.getState().removeFloor(floorId);
      });

      const state = useFloorStore.getState();
      expect(state.floors).toHaveLength(initialFloorCount);
      expect(state.floors.find(f => f.id === floorId)).toBeUndefined();
    });

    it('should handle removing non-existent floor gracefully', () => {
      const initialFloorCount = useFloorStore.getState().floors.length;
      
      act(() => {
        useFloorStore.getState().removeFloor('non-existent');
      });

      const state = useFloorStore.getState();
      expect(state.floors).toHaveLength(initialFloorCount);
    });
  });

  describe('Active Floor Management', () => {
    it('should set current floor', () => {
      let floorId: string;
      
      act(() => {
        const newFloor = useFloorStore.getState().addFloor('Test Floor');
        floorId = newFloor.id;
        useFloorStore.getState().setCurrentFloor(floorId);
      });

      const state = useFloorStore.getState();
      expect(state.currentFloorId).toBe(floorId);
    });

    it('should get current floor', () => {
      let floorId: string;
      let addedFloor: Floor;
      
      act(() => {
        addedFloor = useFloorStore.getState().addFloor('Test Floor');
        floorId = addedFloor.id;
        useFloorStore.getState().setCurrentFloor(floorId);
      });

      const currentFloor = useFloorStore.getState().getCurrentFloor();
      expect(currentFloor?.id).toBe(floorId);
      expect(currentFloor?.name).toBe('Test Floor');
    });

    it('should return null for non-existent current floor', () => {
      act(() => {
        useFloorStore.getState().setCurrentFloor('non-existent');
      });

      const currentFloor = useFloorStore.getState().getCurrentFloor();
      expect(currentFloor).toBeNull();
    });
  });

  describe('Floor Elements Management', () => {
    it('should update floor elements', () => {
      const mockWall = {
        id: 'wall-1',
        type: 'wall' as const,
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 6,
        height: 96,
        color: '#000000',
        materialId: 'default-wall',
        floorId: 'floor-1',
        visible: true,
        locked: false,
      };

      let floorId: string;
      
      act(() => {
        const newFloor = useFloorStore.getState().addFloor('Test Floor');
        floorId = newFloor.id;
        useFloorStore.getState().setCurrentFloor(floorId);
        useFloorStore.getState().addElementToFloor(floorId, 'walls', mockWall);
      });

      const currentFloor = useFloorStore.getState().getCurrentFloor();
      expect(currentFloor?.elements.walls).toHaveLength(1);
      expect(currentFloor?.elements.walls[0]).toEqual(mockWall);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined inputs gracefully', () => {
      expect(() => {
        act(() => {
          // @ts-expect-error Testing edge case
          useFloorStore.getState().addFloor(null);
        });
      }).not.toThrow();
    });

    it('should handle multiple floors with same ID', () => {
      const initialFloorCount = useFloorStore.getState().floors.length;
      
      act(() => {
        useFloorStore.getState().addFloor('Floor 1');
        useFloorStore.getState().addFloor('Floor 2');
      });

      const state = useFloorStore.getState();
      // Should add both floors since they get unique IDs
      expect(state.floors.length).toBe(initialFloorCount + 2);
    });

    it('should maintain state consistency during rapid updates', () => {
      let floor1Id: string;
      let floor2Id: string;
      const initialFloorCount = useFloorStore.getState().floors.length;

      act(() => {
        const floor1 = useFloorStore.getState().addFloor('Floor 1');
        const floor2 = useFloorStore.getState().addFloor('Floor 2');
        floor1Id = floor1.id;
        floor2Id = floor2.id;
        useFloorStore.getState().setCurrentFloor(floor2Id);
        useFloorStore.getState().removeFloor(floor1Id);
      });

      const state = useFloorStore.getState();
      expect(state.floors).toHaveLength(initialFloorCount + 1);
      expect(state.floors.find(f => f.id === floor2Id)).toBeDefined();
      expect(state.floors.find(f => f.id === floor1Id)).toBeUndefined();
      expect(state.currentFloorId).toBe(floor2Id);
    });
  });
});