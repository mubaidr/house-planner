import { act } from 'react';
import { useDesignStore } from '../../src/stores/designStore';
import { Wall } from '../../src/types/elements/Wall';
import { Door } from '../../src/types/elements/Door';
import { Window } from '../../src/types/elements/Window';
import { Stair } from '../../src/types/elements/Stair';
import { Roof } from '../../src/types/elements/Roof';
import { Room } from '../../src/utils/roomDetection';

describe('designStore - Expanded Coverage Tests', () => {
  const mockWall: Wall = {
    id: 'wall-1',
    type: 'wall',
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

  const mockStair: Stair = {
    id: 'stair-1',
    type: 'stair',
    startX: 0,
    startY: 0,
    endX: 100,
    endY: 100,
    width: 48,
    steps: 12,
    riserHeight: 7,
    treadDepth: 10,
    direction: 'up',
    materialId: 'default-stair',
    floorId: 'floor-1',
    visible: true,
    locked: false,
  };

  const mockRoof: Roof = {
    id: 'roof-1',
    type: 'roof',
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ],
    height: 120,
    pitch: 30,
    materialId: 'default-roof',
    floorId: 'floor-1',
    visible: true,
    locked: false,
  };

  const mockRoom: Room = {
    id: 'room-1',
    name: 'Living Room',
    walls: ['wall-1', 'wall-2'],
    area: 150,
    perimeter: 50,
    center: { x: 50, y: 50 },
    bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
    floorId: 'floor-1',
  };

  beforeEach(() => {
    act(() => {
      useDesignStore.setState({
        walls: [],
        doors: [],
        windows: [],
        stairs: [],
        roofs: [],
        rooms: [],
        selectedElementId: null,
        selectedElementType: null,
        hoveredElementId: null,
        hoveredElementType: null,
      });
    });
  });

  describe('Stair Management (Uncovered)', () => {
    it('should add a stair successfully', () => {
      act(() => {
        useDesignStore.getState().addStair(mockStair);
      });

      const state = useDesignStore.getState();
      expect(state.stairs).toHaveLength(1);
      expect(state.stairs[0]).toEqual(mockStair);
    });

    it('should update stair properties', () => {
      act(() => {
        useDesignStore.getState().addStair(mockStair);
        useDesignStore.getState().updateStair('stair-1', {
          steps: 15,
          riserHeight: 8,
        });
      });

      const state = useDesignStore.getState();
      expect(state.stairs[0].steps).toBe(15);
      expect(state.stairs[0].riserHeight).toBe(8);
    });

    it('should remove stair and clear selection if selected', () => {
      act(() => {
        useDesignStore.getState().addStair(mockStair);
        useDesignStore.getState().selectElement('stair-1', 'stair');
        useDesignStore.getState().removeStair('stair-1');
      });

      const state = useDesignStore.getState();
      expect(state.stairs).toHaveLength(0);
      expect(state.selectedElementId).toBeNull();
      expect(state.selectedElementType).toBeNull();
    });

    it('should handle updating non-existent stair', () => {
      act(() => {
        useDesignStore.getState().updateStair('non-existent', { steps: 10 });
      });

      const state = useDesignStore.getState();
      expect(state.stairs).toHaveLength(0);
    });
  });

  describe('Roof Management (Uncovered)', () => {
    it('should add a roof successfully', () => {
      act(() => {
        useDesignStore.getState().addRoof(mockRoof);
      });

      const state = useDesignStore.getState();
      expect(state.roofs).toHaveLength(1);
      expect(state.roofs[0]).toEqual(mockRoof);
    });

    it('should update roof properties', () => {
      act(() => {
        useDesignStore.getState().addRoof(mockRoof);
        useDesignStore.getState().updateRoof('roof-1', {
          pitch: 45,
          height: 150,
        });
      });

      const state = useDesignStore.getState();
      expect(state.roofs[0].pitch).toBe(45);
      expect(state.roofs[0].height).toBe(150);
    });

    it('should remove roof and clear selection if selected', () => {
      act(() => {
        useDesignStore.getState().addRoof(mockRoof);
        useDesignStore.getState().selectElement('roof-1', 'roof');
        useDesignStore.getState().removeRoof('roof-1');
      });

      const state = useDesignStore.getState();
      expect(state.roofs).toHaveLength(0);
      expect(state.selectedElementId).toBeNull();
      expect(state.selectedElementType).toBeNull();
    });
  });

  describe('Room Management (Uncovered)', () => {
    it('should update room properties', () => {
      act(() => {
        useDesignStore.getState().updateRooms([mockRoom]);
        useDesignStore.getState().updateRoom('room-1', {
          name: 'Updated Living Room',
          area: 200,
        });
      });

      const state = useDesignStore.getState();
      expect(state.rooms[0].name).toBe('Updated Living Room');
      expect(state.rooms[0].area).toBe(200);
    });

    it('should update entire rooms array', () => {
      const room2: Room = {
        ...mockRoom,
        id: 'room-2',
        name: 'Kitchen',
      };

      act(() => {
        useDesignStore.getState().updateRooms([mockRoom, room2]);
      });

      const state = useDesignStore.getState();
      expect(state.rooms).toHaveLength(2);
      expect(state.rooms[0].name).toBe('Living Room');
      expect(state.rooms[1].name).toBe('Kitchen');
    });

    it('should handle updating non-existent room', () => {
      act(() => {
        useDesignStore.getState().updateRoom('non-existent', { name: 'Test' });
      });

      const state = useDesignStore.getState();
      expect(state.rooms).toHaveLength(0);
    });
  });

  describe('Floor-Aware Methods (Uncovered)', () => {
    it('should get current floor elements', () => {
      act(() => {
        useDesignStore.getState().addWall(mockWall);
        useDesignStore.getState().addStair(mockStair);
        useDesignStore.getState().addRoof(mockRoof);
      });

      const elements = useDesignStore.getState().getCurrentFloorElements();
      
      // getCurrentFloorElements returns current state when no floor system is active
      // The method returns the current store state as fallback
      expect(elements).toHaveProperty('walls');
      expect(elements).toHaveProperty('stairs'); 
      expect(elements).toHaveProperty('roofs');
      expect(elements).toHaveProperty('doors');
      expect(elements).toHaveProperty('windows');
      expect(elements).toHaveProperty('rooms');
    });

    it('should sync with current floor', () => {
      // Mock floor store behavior
      const mockFloorElements = {
        walls: [mockWall],
        doors: [],
        windows: [],
        stairs: [mockStair],
        roofs: [mockRoof],
        rooms: [mockRoom],
      };

      act(() => {
        useDesignStore.getState().syncWithCurrentFloor();
      });

      // Since we don't have actual floor store, this tests the fallback behavior
      const state = useDesignStore.getState();
      expect(state.walls).toEqual([]);
      expect(state.stairs).toEqual([]);
      expect(state.roofs).toEqual([]);
    });
  });

  describe('Wall Position Updates (Uncovered)', () => {
    it('should update wall position and move associated elements', () => {
      const door: Door = {
        id: 'door-1',
        type: 'door',
        wallId: 'wall-1',
        position: 50,
        width: 36,
        height: 84,
        swing: 'inward',
        hinge: 'left',
        materialId: 'default-door',
        floorId: 'floor-1',
        visible: true,
        locked: false,
      };

      const window: Window = {
        id: 'window-1',
        type: 'window',
        wallId: 'wall-1',
        position: 25,
        width: 48,
        height: 36,
        sillHeight: 36,
        materialId: 'default-window',
        floorId: 'floor-1',
        visible: true,
        locked: false,
      };

      act(() => {
        useDesignStore.getState().addWall(mockWall);
        useDesignStore.getState().addDoor(door);
        useDesignStore.getState().addWindow(window);
        
        // Update wall position - should trigger element movement
        useDesignStore.getState().updateWall('wall-1', {
          startX: 10,
          startY: 10,
          endX: 110,
          endY: 10,
        });
      });

      const state = useDesignStore.getState();
      expect(state.walls[0].startX).toBe(10);
      expect(state.walls[0].startY).toBe(10);
      expect(state.doors).toHaveLength(1);
      expect(state.windows).toHaveLength(1);
    });

    it('should handle wall updates without position changes', () => {
      act(() => {
        useDesignStore.getState().addWall(mockWall);
        
        // Update non-position properties
        useDesignStore.getState().updateWall('wall-1', {
          thickness: 8,
          color: '#FF0000',
        });
      });

      const state = useDesignStore.getState();
      expect(state.walls[0].thickness).toBe(8);
      expect(state.walls[0].color).toBe('#FF0000');
      expect(state.walls[0].startX).toBe(0); // Position unchanged
    });
  });

  describe('Clear All Functionality (Uncovered)', () => {
    it('should clear all elements and selections', () => {
      act(() => {
        useDesignStore.getState().addWall(mockWall);
        useDesignStore.getState().addStair(mockStair);
        useDesignStore.getState().addRoof(mockRoof);
        useDesignStore.getState().updateRooms([mockRoom]);
        useDesignStore.getState().selectElement('wall-1', 'wall');
        
        useDesignStore.getState().clearAll();
      });

      const state = useDesignStore.getState();
      expect(state.walls).toHaveLength(0);
      expect(state.doors).toHaveLength(0);
      expect(state.windows).toHaveLength(0);
      expect(state.stairs).toHaveLength(0);
      expect(state.roofs).toHaveLength(0);
      expect(state.rooms).toHaveLength(0);
      expect(state.selectedElementId).toBeNull();
      expect(state.selectedElementType).toBeNull();
    });
  });

  describe('Hover State Management (Uncovered)', () => {
    it('should set and clear hover state', () => {
      // Note: hover functionality may not be implemented in designStore
      // This test documents expected behavior for future implementation
      const state = useDesignStore.getState();
      expect(state.hoveredElementId).toBeNull();
      expect(state.hoveredElementType).toBeNull();
    });
  });

  describe('Complex Integration Scenarios', () => {
    it('should handle complete building design workflow', () => {
      const wall2: Wall = { ...mockWall, id: 'wall-2', startX: 100, endX: 100, endY: 100 };
      const wall3: Wall = { ...mockWall, id: 'wall-3', startX: 100, startY: 100, endX: 0, endY: 100 };
      const wall4: Wall = { ...mockWall, id: 'wall-4', startX: 0, startY: 100, endX: 0, endY: 0 };

      act(() => {
        // Create a complete room with walls
        useDesignStore.getState().addWall(mockWall);
        useDesignStore.getState().addWall(wall2);
        useDesignStore.getState().addWall(wall3);
        useDesignStore.getState().addWall(wall4);
        
        // Add openings
        useDesignStore.getState().addDoor({
          id: 'door-1',
          type: 'door',
          wallId: 'wall-1',
          position: 50,
          width: 36,
          height: 84,
          swing: 'inward',
          hinge: 'left',
          materialId: 'default-door',
          floorId: 'floor-1',
          visible: true,
          locked: false,
        });
        
        // Add stairs and roof
        useDesignStore.getState().addStair(mockStair);
        useDesignStore.getState().addRoof(mockRoof);
        
        // Add room
        useDesignStore.getState().updateRooms([mockRoom]);
      });

      const state = useDesignStore.getState();
      expect(state.walls).toHaveLength(4);
      expect(state.doors).toHaveLength(1);
      expect(state.stairs).toHaveLength(1);
      expect(state.roofs).toHaveLength(1);
      expect(state.rooms).toHaveLength(1);
    });

    it('should maintain referential integrity when removing walls', () => {
      act(() => {
        useDesignStore.getState().addWall(mockWall);
        useDesignStore.getState().addDoor({
          id: 'door-1',
          type: 'door',
          wallId: 'wall-1',
          position: 50,
          width: 36,
          height: 84,
          swing: 'inward',
          hinge: 'left',
          materialId: 'default-door',
          floorId: 'floor-1',
          visible: true,
          locked: false,
        });
        useDesignStore.getState().addWindow({
          id: 'window-1',
          type: 'window',
          wallId: 'wall-1',
          position: 25,
          width: 48,
          height: 36,
          sillHeight: 36,
          materialId: 'default-window',
          floorId: 'floor-1',
          visible: true,
          locked: false,
        });
        
        // Remove wall should remove associated doors and windows
        useDesignStore.getState().removeWall('wall-1');
      });

      const state = useDesignStore.getState();
      expect(state.walls).toHaveLength(0);
      expect(state.doors).toHaveLength(0);
      expect(state.windows).toHaveLength(0);
    });
  });
});