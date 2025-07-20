import { act, renderHook } from '@testing-library/react';
import { useDesignStore } from '@/stores/designStore';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';

describe('DesignStore Integration Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
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
      });
    });
  });

  describe('Wall Management', () => {
    it('should add and manage walls correctly', () => {
      const wall: Wall = {
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

      act(() => {
        useDesignStore.getState().addWall(wall);
      });

      expect(useDesignStore.getState().walls).toHaveLength(1);
      expect(useDesignStore.getState().walls[0]).toEqual(wall);
    });

    it('should update wall properties', () => {
      const wall: Wall = {
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

      act(() => {
        useDesignStore.getState().addWall(wall);
      });

      act(() => {
        useDesignStore.getState().updateWall('wall-1', {
          endX: 200,
          color: '#ff0000',
        });
      });

      const updatedWall = useDesignStore.getState().walls[0];
      expect(updatedWall.endX).toBe(200);
      expect(updatedWall.color).toBe('#ff0000');
      expect(updatedWall.startX).toBe(0); // Should remain unchanged
    });

    it('should remove walls', () => {
      const wall: Wall = {
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

      act(() => {
        useDesignStore.getState().addWall(wall);
      });

      expect(useDesignStore.getState().walls).toHaveLength(1);

      act(() => {
        useDesignStore.getState().removeWall('wall-1');
      });

      expect(useDesignStore.getState().walls).toHaveLength(0);
    });
  });

  describe('Door Management', () => {
    it('should add doors to walls', () => {
      const wall: Wall = {
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

      const door: Door = {
        id: 'door-1',
        type: 'door',
        wallId: 'wall-1',
        positionOnWall: 0.5,
        width: 36,
        height: 80,
        swingDirection: 'right',
        doorType: 'single',
        materialId: 'default-door',
        floorId: 'floor-1',
        visible: true,
        locked: false,
      };

      act(() => {
        useDesignStore.getState().addWall(wall);
        useDesignStore.getState().addDoor(door);
      });

      expect(useDesignStore.getState().doors).toHaveLength(1);
      expect(useDesignStore.getState().doors[0].wallId).toBe('wall-1');
    });

    it('should remove doors when parent wall is removed', () => {
      const wall: Wall = {
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

      const door: Door = {
        id: 'door-1',
        type: 'door',
        wallId: 'wall-1',
        positionOnWall: 0.5,
        width: 36,
        height: 80,
        swingDirection: 'right',
        doorType: 'single',
        materialId: 'default-door',
        floorId: 'floor-1',
        visible: true,
        locked: false,
      };

      act(() => {
        useDesignStore.getState().addWall(wall);
        useDesignStore.getState().addDoor(door);
      });

      expect(useDesignStore.getState().doors).toHaveLength(1);

      act(() => {
        useDesignStore.getState().removeWall('wall-1');
      });

      // Door should be removed when wall is removed
      expect(useDesignStore.getState().doors).toHaveLength(0);
    });
  });

  describe('Element Selection', () => {
    it('should select and deselect elements', () => {
      const wall: Wall = {
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

      act(() => {
        useDesignStore.getState().addWall(wall);
      });

      // Select wall
      act(() => {
        useDesignStore.getState().selectElement('wall-1', 'wall');
      });

      expect(useDesignStore.getState().selectedElementId).toBe('wall-1');
      expect(useDesignStore.getState().selectedElementType).toBe('wall');

      // Deselect
      act(() => {
        useDesignStore.getState().selectElement(null, null);
      });

      expect(useDesignStore.getState().selectedElementId).toBeNull();
      expect(useDesignStore.getState().selectedElementType).toBeNull();
    });

    it('should handle selecting non-existent elements', () => {
      act(() => {
        useDesignStore.getState().selectElement('non-existent', 'wall');
      });

      expect(useDesignStore.getState().selectedElementId).toBe('non-existent');
      expect(useDesignStore.getState().selectedElementType).toBe('wall');
    });
  });

  describe('Complex Workflows', () => {
    it('should handle complete wall-door-window workflow', () => {
      // Create wall
      const wall: Wall = {
        id: 'wall-1',
        type: 'wall',
        startX: 0,
        startY: 0,
        endX: 200,
        endY: 0,
        thickness: 6,
        height: 96,
        color: '#000000',
        materialId: 'default-wall',
        floorId: 'floor-1',
        visible: true,
        locked: false,
      };

      // Create door
      const door: Door = {
        id: 'door-1',
        type: 'door',
        wallId: 'wall-1',
        positionOnWall: 0.3,
        width: 36,
        height: 80,
        swingDirection: 'right',
        doorType: 'single',
        materialId: 'default-door',
        floorId: 'floor-1',
        visible: true,
        locked: false,
      };

      // Create window
      const window: Window = {
        id: 'window-1',
        type: 'window',
        wallId: 'wall-1',
        positionOnWall: 0.7,
        width: 48,
        height: 36,
        sillHeight: 36,
        windowType: 'single',
        materialId: 'default-window',
        floorId: 'floor-1',
        visible: true,
        locked: false,
      };

      act(() => {
        useDesignStore.getState().addWall(wall);
        useDesignStore.getState().addDoor(door);
        useDesignStore.getState().addWindow(window);
      });

      // Verify all elements are added
      expect(useDesignStore.getState().walls).toHaveLength(1);
      expect(useDesignStore.getState().doors).toHaveLength(1);
      expect(useDesignStore.getState().windows).toHaveLength(1);

      // Update wall
      act(() => {
        useDesignStore.getState().updateWall('wall-1', { endX: 300 });
      });

      expect(useDesignStore.getState().walls[0].endX).toBe(300);

      // Update door position
      act(() => {
        useDesignStore.getState().updateDoor('door-1', { positionOnWall: 0.4 });
      });

      expect(useDesignStore.getState().doors[0].positionOnWall).toBe(0.4);

      // Remove window
      act(() => {
        useDesignStore.getState().removeWindow('window-1');
      });

      expect(useDesignStore.getState().windows).toHaveLength(0);
      expect(useDesignStore.getState().doors).toHaveLength(1); // Door should remain
    });

    it('should handle multiple walls with intersections', () => {
      const wall1: Wall = {
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

      const wall2: Wall = {
        id: 'wall-2',
        type: 'wall',
        startX: 100,
        startY: 0,
        endX: 100,
        endY: 100,
        thickness: 6,
        height: 96,
        color: '#000000',
        materialId: 'default-wall',
        floorId: 'floor-1',
        visible: true,
        locked: false,
      };

      act(() => {
        useDesignStore.getState().addWall(wall1);
        useDesignStore.getState().addWall(wall2);
      });

      expect(useDesignStore.getState().walls).toHaveLength(2);

      // Walls should connect at (100, 0)
      const walls = useDesignStore.getState().walls;
      expect(walls[0].endX).toBe(walls[1].startX);
      expect(walls[0].endY).toBe(walls[1].startY);
    });
  });

  describe('State Consistency', () => {
    it('should maintain state consistency during rapid updates', () => {
      const wall: Wall = {
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

      act(() => {
        useDesignStore.getState().addWall(wall);
      });

      // Perform rapid updates
      act(() => {
        for (let i = 0; i < 10; i++) {
          useDesignStore.getState().updateWall('wall-1', { endX: 100 + i * 10 });
        }
      });

      expect(useDesignStore.getState().walls[0].endX).toBe(190);
      expect(useDesignStore.getState().walls).toHaveLength(1);
    });

    it('should handle concurrent element operations', () => {
      act(() => {
        // Add multiple elements simultaneously
        useDesignStore.getState().addWall({
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
        });

        useDesignStore.getState().addWall({
          id: 'wall-2',
          type: 'wall',
          startX: 100,
          startY: 0,
          endX: 100,
          endY: 100,
          thickness: 6,
          height: 96,
          color: '#000000',
          materialId: 'default-wall',
          floorId: 'floor-1',
          visible: true,
          locked: false,
        });

        useDesignStore.getState().selectElement('wall-1', 'wall');
      });

      expect(useDesignStore.getState().walls).toHaveLength(2);
      expect(useDesignStore.getState().selectedElementId).toBe('wall-1');
    });
  });
});