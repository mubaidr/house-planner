import { useDesignStore } from '@/stores/designStore';
import { act, renderHook } from '@testing-library/react';


describe('Design Store', () => {
  beforeEach(() => {
    // Use store's reset action for test isolation
    const { result } = renderHook(() => useDesignStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('Wall operations', () => {
    it('should add a wall', () => {
      const { result } = renderHook(() => useDesignStore());

      const wallData = {
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 0,
        thickness: 0.2,
        height: 3,
        color: '#ffffff'
      };

      act(() => {
        result.current.addWall(wallData);
      });

      expect(result.current.walls).toHaveLength(1);
      expect(result.current.walls[0]).toMatchObject(wallData);
      expect(result.current.walls[0].id).toBeDefined();
    });

    it('should update a wall', () => {
      const { result } = renderHook(() => useDesignStore());

      const wallData = {
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 0,
        thickness: 0.2,
        height: 3,
        color: '#ffffff'
      };

      act(() => {
        result.current.addWall(wallData);
      });

      const wallId = result.current.walls[0].id;
      const updates = { color: '#ff0000', height: 4 };

      act(() => {
        result.current.updateWall(wallId, updates);
      });

      expect(result.current.walls[0].color).toBe('#ff0000');
      expect(result.current.walls[0].height).toBe(4);
      expect(result.current.walls[0].startX).toBe(0); // unchanged
    });

    it('should delete a wall and related elements', () => {
      const { result } = renderHook(() => useDesignStore());

      // Add wall, door, and window
      const wallData = {
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 0,
        thickness: 0.2,
        height: 3,
        color: '#ffffff'
      };

      act(() => {
        result.current.addWall(wallData);
      });

      const wallId = result.current.walls[0].id;

      act(() => {
        result.current.addDoor({
          wallId,
          position: 2,
          width: 0.8,
          height: 2.1,
          openDirection: 'left',
          color: '#8B4513'
        });

        result.current.addWindow({
          wallId,
          position: 3,
          width: 1.2,
          height: 1.5,
          sillHeight: 1.0,
          color: '#FFFFFF'
        });
      });

      expect(result.current.walls).toHaveLength(1);
      expect(result.current.doors).toHaveLength(1);
      expect(result.current.windows).toHaveLength(1);

      act(() => {
        result.current.deleteWall(wallId);
      });

      expect(result.current.walls).toHaveLength(0);
      expect(result.current.doors).toHaveLength(0); // should be deleted
      expect(result.current.windows).toHaveLength(0); // should be deleted
    });
  });

  describe('Door operations', () => {
    it('should add a door', () => {
      const { result } = renderHook(() => useDesignStore());

      const doorData = {
        wallId: 'wall-123',
        position: 2,
        width: 0.8,
        height: 2.1,
        openDirection: 'left' as const,
        color: '#8B4513'
      };

      act(() => {
        result.current.addDoor(doorData);
      });

      expect(result.current.doors).toHaveLength(1);
      expect(result.current.doors[0]).toMatchObject(doorData);
      expect(result.current.doors[0].id).toBeDefined();
    });

    it('should update a door', () => {
      const { result } = renderHook(() => useDesignStore());

      const doorData = {
        wallId: 'wall-123',
        position: 2,
        width: 0.8,
        height: 2.1,
        openDirection: 'left' as const,
        color: '#8B4513'
      };

      act(() => {
        result.current.addDoor(doorData);
      });

      const doorId = result.current.doors[0].id;
      const updates = { width: 0.9, openDirection: 'right' as const };

      act(() => {
        result.current.updateDoor(doorId, updates);
      });

      expect(result.current.doors[0].width).toBe(0.9);
      expect(result.current.doors[0].openDirection).toBe('right');
    });

    it('should delete a door', () => {
      const { result } = renderHook(() => useDesignStore());

      const doorData = {
        wallId: 'wall-123',
        position: 2,
        width: 0.8,
        height: 2.1,
        openDirection: 'left' as const,
        color: '#8B4513'
      };

      act(() => {
        result.current.addDoor(doorData);
      });

      const doorId = result.current.doors[0].id;

      act(() => {
        result.current.deleteDoor(doorId);
      });

      expect(result.current.doors).toHaveLength(0);
    });
  });

  describe('Window operations', () => {
    it('should add a window', () => {
      const { result } = renderHook(() => useDesignStore());

      const windowData = {
        wallId: 'wall-123',
        position: 3,
        width: 1.2,
        height: 1.5,
        sillHeight: 1.0,
        color: '#FFFFFF'
      };

      act(() => {
        result.current.addWindow(windowData);
      });

      expect(result.current.windows).toHaveLength(1);
      expect(result.current.windows[0]).toMatchObject(windowData);
      expect(result.current.windows[0].id).toBeDefined();
    });

    it('should update a window', () => {
      const { result } = renderHook(() => useDesignStore());

      const windowData = {
        wallId: 'wall-123',
        position: 3,
        width: 1.2,
        height: 1.5,
        sillHeight: 1.0,
        color: '#FFFFFF'
      };

      act(() => {
        result.current.addWindow(windowData);
      });

      const windowId = result.current.windows[0].id;
      const updates = { width: 1.5, sillHeight: 0.8 };

      act(() => {
        result.current.updateWindow(windowId, updates);
      });

      expect(result.current.windows[0].width).toBe(1.5);
      expect(result.current.windows[0].sillHeight).toBe(0.8);
    });

    it('should delete a window', () => {
      const { result } = renderHook(() => useDesignStore());

      const windowData = {
        wallId: 'wall-123',
        position: 3,
        width: 1.2,
        height: 1.5,
        sillHeight: 1.0,
        color: '#FFFFFF'
      };

      act(() => {
        result.current.addWindow(windowData);
      });

      const windowId = result.current.windows[0].id;

      act(() => {
        result.current.deleteWindow(windowId);
      });

      expect(result.current.windows).toHaveLength(0);
    });
  });

  describe('Room operations', () => {
    it('should add a room', () => {
      const { result } = renderHook(() => useDesignStore());

      const roomData = {
        name: 'Living Room',
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 3 },
          { x: 0, y: 3 }
        ],
        roomType: 'living',
        ceilingHeight: 3
      };

      act(() => {
        result.current.addRoom(roomData);
      });

      expect(result.current.rooms).toHaveLength(1);
      expect(result.current.rooms[0]).toMatchObject(roomData);
      expect(result.current.rooms[0].id).toBeDefined();
    });

    it('should update a room', () => {
      const { result } = renderHook(() => useDesignStore());

      const roomData = {
        name: 'Living Room',
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 3 },
          { x: 0, y: 3 }
        ],
        roomType: 'living',
        ceilingHeight: 3
      };

      act(() => {
        result.current.addRoom(roomData);
      });

      const roomId = result.current.rooms[0].id;
      const updates = { name: 'Updated Room', ceilingHeight: 4 };

      act(() => {
        result.current.updateRoom(roomId, updates);
      });

      expect(result.current.rooms[0].name).toBe('Updated Room');
      expect(result.current.rooms[0].ceilingHeight).toBe(4);
    });

    it('should delete a room', () => {
      const { result } = renderHook(() => useDesignStore());

      const roomData = {
        name: 'Living Room',
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 3 },
          { x: 0, y: 3 }
        ],
        roomType: 'living',
        ceilingHeight: 3
      };

      act(() => {
        result.current.addRoom(roomData);
      });

      const roomId = result.current.rooms[0].id;

      act(() => {
        result.current.deleteRoom(roomId);
      });

      expect(result.current.rooms).toHaveLength(0);
    });
  });

  describe('Material operations', () => {
    it('should add a material', () => {
      const { result } = renderHook(() => useDesignStore());

      const materialData = {
        name: 'Wood',
        color: '#8B4513',
        properties: {
          roughness: 0.7,
          metalness: 0.0,
          opacity: 1.0
        }
      };

      act(() => {
        result.current.addMaterial(materialData);
      });

      expect(result.current.materials.length).toBeGreaterThan(3); // includes defaults
      const addedMaterial = result.current.materials.find(m => m.name === 'Wood');
      expect(addedMaterial).toMatchObject(materialData);
      expect(addedMaterial?.id).toBeDefined();
    });

    it('should update a material', () => {
      const { result } = renderHook(() => useDesignStore());

      const materialData = {
        name: 'Wood',
        color: '#8B4513',
        properties: {
          roughness: 0.7,
          metalness: 0.0,
          opacity: 1.0
        }
      };

      act(() => {
        result.current.addMaterial(materialData);
      });

      const materialId = result.current.materials.find(m => m.name === 'Wood')?.id;
      const updates = { color: '#654321', properties: { roughness: 0.8 } };

      if (materialId) {
        act(() => {
          result.current.updateMaterial(materialId, updates);
        });

        const updatedMaterial = result.current.materials.find(m => m.id === materialId);
        expect(updatedMaterial?.color).toBe('#654321');
        expect(updatedMaterial?.properties.roughness).toBe(0.8);
      } else {
        throw new Error('Material ID not found for update test');
      }
    });

    it('should delete a material', () => {
      const { result } = renderHook(() => useDesignStore());

      const materialData = {
        name: 'Wood',
        color: '#8B4513',
        properties: {
          roughness: 0.7,
          metalness: 0.0,
          opacity: 1.0
        }
      };

      act(() => {
        result.current.addMaterial(materialData);
      });

      const materialId = result.current.materials.find(m => m.name === 'Wood')?.id;
      const initialCount = result.current.materials.length;

      if (materialId) {
        act(() => {
          result.current.deleteMaterial(materialId);
        });

        expect(result.current.materials).toHaveLength(initialCount - 1);
        expect(result.current.materials.find(m => m.id === materialId)).toBeUndefined();
      } else {
        throw new Error('Material ID not found for delete test');
      }
    });
  });

  describe('Selection operations', () => {
    it('should select an element', () => {
      const { result } = renderHook(() => useDesignStore());

      act(() => {
        result.current.selectElement('wall-123', 'wall');
      });

      expect(result.current.selection.selectedElementId).toBe('wall-123');
      expect(result.current.selection.selectedElementType).toBe('wall');
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useDesignStore());

      act(() => {
        result.current.selectElement('wall-123', 'wall');
        result.current.selectElement(null, null);
      });

      expect(result.current.selection.selectedElementId).toBe(null);
      expect(result.current.selection.selectedElementType).toBe(null);
    });

    it('should hover an element', () => {
      const { result } = renderHook(() => useDesignStore());

      act(() => {
        result.current.hoverElement('door-456', 'door');
      });

      expect(result.current.selection.hoveredElementId).toBe('door-456');
      expect(result.current.selection.hoveredElementType).toBe('door');
    });
  });

  describe('View operations', () => {
    it('should set view mode', () => {
      const { result } = renderHook(() => useDesignStore());

      act(() => {
        result.current.setViewMode('3d');
      });

      expect(result.current.viewMode).toBe('3d');
      expect(result.current.scene3D.initialized).toBe(true);
    });

    it('should set camera preset', () => {
      const { result } = renderHook(() => useDesignStore());

      act(() => {
        result.current.setCameraPreset('top');
      });

      expect(result.current.scene3D.camera.position).toEqual([0, 20, 0]);
      expect(result.current.scene3D.camera.target).toEqual([0, 0, 0]);
    });

    it('should update camera state', () => {
      const { result } = renderHook(() => useDesignStore());

      const cameraUpdate = {
        position: [5, 5, 5] as [number, number, number],
        fov: 60
      };

      act(() => {
        result.current.updateCameraState(cameraUpdate);
      });

      expect(result.current.scene3D.camera.position).toEqual([5, 5, 5]);
      expect(result.current.scene3D.camera.fov).toBe(60);
    });
  });

  describe('3D operations', () => {
    it('should initialize scene3D', () => {
      const { result } = renderHook(() => useDesignStore());

      act(() => {
        result.current.initializeScene3D();
      });

      expect(result.current.scene3D.initialized).toBe(true);
    });

    it('should update scene3D configuration', () => {
      const { result } = renderHook(() => useDesignStore());

      const sceneUpdate = {
        lighting: {
          ambientIntensity: 0.6,
          directionalIntensity: 1.0,
          directionalPosition: [10, 10, 5] as [number, number, number],
          shadows: true,
          shadowIntensity: 0.3,
        },
        renderSettings: {
          quality: 'high' as const,
          shadows: true,
          postProcessing: false,
          wireframe: false,
          antialias: true,
        }
      };

      act(() => {
        result.current.updateScene3D(sceneUpdate);
      });

      expect(result.current.scene3D.lighting.ambientIntensity).toBe(0.6);
      expect(result.current.scene3D.renderSettings.quality).toBe('high');
    });

    it('should update 3D properties for elements', () => {
      const { result } = renderHook(() => useDesignStore());

      // Add a wall first
      act(() => {
        result.current.addWall({
          startX: 0,
          startY: 0,
          endX: 5,
          endY: 0,
          thickness: 0.2,
          height: 3,
          color: '#ffffff'
        });
      });

      const wallId = result.current.walls[0].id;
      const properties3D = {
        elevation: 0.1,
        textureScale: 2,
        materialProperties: {
          roughness: 0.8,
          metalness: 0.1,
          opacity: 1.0
        }
      };

      act(() => {
        result.current.update3DProperties(wallId, 'wall', properties3D);
      });

      expect(result.current.walls[0].properties3D).toMatchObject(properties3D);
    });
  });

  describe('Default state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useDesignStore());

      expect(result.current.walls).toEqual([]);
      expect(result.current.doors).toEqual([]);
      expect(result.current.windows).toEqual([]);
      expect(result.current.rooms).toEqual([]);
      expect(result.current.materials).toHaveLength(3); // default materials
      expect(result.current.viewMode).toBe('3d');
      expect(result.current.activeFloor).toBe(0);
      expect(result.current.selection.selectedElementId).toBe(null);
      expect(result.current.scene3D.initialized).toBe(false);
    });

    it('should have default materials', () => {
      const { result } = renderHook(() => useDesignStore());

      const materialNames = result.current.materials.map(m => m.name);
      expect(materialNames).toContain('Default Wall');
      expect(materialNames).toContain('Wood Floor');
      expect(materialNames).toContain('White Ceiling');
    });
  });
});
