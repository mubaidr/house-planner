import { 
  calculateNewElementPosition, 
  updateElementsForWallMovement 
} from '@/utils/wallElementMovement';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';

describe('wallElementMovement', () => {
  let mockWall: Wall;
  let mockDoor: Door;
  let mockWindow: Window;

  beforeEach(() => {
    mockWall = {
      id: 'wall-1',
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 0,
      thickness: 10,
      height: 250,
      materialId: 'material-1',
      floorId: 'floor-1'
    };

    mockDoor = {
      id: 'door-1',
      x: 50,
      y: 0,
      width: 80,
      height: 200,
      wallId: 'wall-1',
      wallAngle: 0,
      isOpen: false,
      openAngle: 0,
      materialId: 'door-material',
      floorId: 'floor-1'
    };

    mockWindow = {
      id: 'window-1',
      x: 25,
      y: 0,
      width: 60,
      height: 120,
      wallId: 'wall-1',
      wallAngle: 0,
      sillHeight: 90,
      materialId: 'window-material',
      floorId: 'floor-1'
    };
  });

  describe('calculateNewElementPosition', () => {
    it('should maintain element position when wall does not move', () => {
      const newWall = { ...mockWall };
      const result = calculateNewElementPosition(mockDoor, mockWall, newWall);
      
      expect(result.x).toBe(50);
      expect(result.y).toBe(0);
      expect(result.wallAngle).toBe(0);
    });

    it('should move element when wall translates', () => {
      const newWall = { ...mockWall, startX: 10, endX: 110 };
      const result = calculateNewElementPosition(mockDoor, mockWall, newWall);
      
      expect(result.x).toBe(60); // Moved 10 units with wall
      expect(result.y).toBe(0);
      expect(result.wallAngle).toBe(0);
    });

    it('should maintain relative position when wall length changes', () => {
      const newWall = { ...mockWall, endX: 200 }; // Double length
      const result = calculateNewElementPosition(mockDoor, mockWall, newWall);
      
      expect(result.x).toBe(100); // Should be at middle of new wall
      expect(result.y).toBe(0);
      expect(result.wallAngle).toBe(0);
    });

    it('should handle wall rotation correctly', () => {
      const newWall = { ...mockWall, endX: 0, endY: 100 }; // 90 degree rotation
      const result = calculateNewElementPosition(mockDoor, mockWall, newWall);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(50); // Rotated position
      expect(result.wallAngle).toBeCloseTo(Math.PI / 2, 2);
    });

    it('should handle zero-length walls gracefully', () => {
      const zeroWall = { ...mockWall, endX: 0, endY: 0 };
      const result = calculateNewElementPosition(mockDoor, mockWall, zeroWall);
      
      expect(result.x).toBe(50); // Original position maintained
      expect(result.y).toBe(0);
      expect(result.wallAngle).toBe(0);
    });

    it('should maintain perpendicular offset from wall', () => {
      const offsetDoor = { ...mockDoor, y: 5 }; // 5 units away from wall
      const newWall = { ...mockWall, startX: 10, endX: 110 };
      const result = calculateNewElementPosition(offsetDoor, mockWall, newWall);
      
      expect(result.x).toBe(60);
      expect(result.y).toBe(5); // Perpendicular distance maintained
    });

    it('should handle angled walls correctly', () => {
      const angledWall = { ...mockWall, endX: 70.71, endY: 70.71 }; // 45 degrees
      const newAngledWall = { ...angledWall, startX: 10, startY: 10, endX: 80.71, endY: 80.71 };
      
      const result = calculateNewElementPosition(mockDoor, angledWall, newAngledWall);
      
      expect(result.x).toBeCloseTo(45.36, 1); // Translated position
      expect(result.y).toBeCloseTo(45.36, 1);
      expect(result.wallAngle).toBeCloseTo(Math.PI / 4, 2);
    });
  });

  describe('updateElementsForWallMovement', () => {
    it('should update doors and windows for the specified wall', () => {
      const doors = [mockDoor];
      const windows = [mockWindow];
      const newWall = { ...mockWall, startX: 10, endX: 110 };
      
      const result = updateElementsForWallMovement(doors, windows, 'wall-1', mockWall, newWall);
      
      expect(result.updatedDoors).toHaveLength(1);
      expect(result.updatedDoors[0].x).toBe(60);
      expect(result.updatedWindows).toHaveLength(1);
      expect(result.updatedWindows[0].x).toBe(35);
    });

    it('should not update elements on other walls', () => {
      const otherDoor = { ...mockDoor, id: 'door-2', wallId: 'wall-2' };
      const doors = [mockDoor, otherDoor];
      const windows = [mockWindow];
      const newWall = { ...mockWall, startX: 10, endX: 110 };
      
      const result = updateElementsForWallMovement(doors, windows, 'wall-1', mockWall, newWall);
      
      expect(result.updatedDoors).toHaveLength(2);
      expect(result.updatedDoors[0].x).toBe(60); // Updated
      expect(result.updatedDoors[1].x).toBe(50); // Not updated
      expect(result.updatedDoors[1].id).toBe('door-2');
    });

    it('should handle empty arrays gracefully', () => {
      const newWall = { ...mockWall, startX: 10, endX: 110 };
      
      const result = updateElementsForWallMovement([], [], 'wall-1', mockWall, newWall);
      
      expect(result.updatedDoors).toHaveLength(0);
      expect(result.updatedWindows).toHaveLength(0);
    });

    it('should preserve element properties other than position', () => {
      const doors = [mockDoor];
      const windows = [mockWindow];
      const newWall = { ...mockWall, startX: 10, endX: 110 };
      
      const result = updateElementsForWallMovement(doors, windows, 'wall-1', mockWall, newWall);
      
      const updatedDoor = result.updatedDoors[0];
      expect(updatedDoor.id).toBe(mockDoor.id);
      expect(updatedDoor.width).toBe(mockDoor.width);
      expect(updatedDoor.height).toBe(mockDoor.height);
      expect(updatedDoor.materialId).toBe(mockDoor.materialId);
      
      const updatedWindow = result.updatedWindows[0];
      expect(updatedWindow.id).toBe(mockWindow.id);
      expect(updatedWindow.width).toBe(mockWindow.width);
      expect(updatedWindow.sillHeight).toBe(mockWindow.sillHeight);
    });
  });
});