import {
  detectRooms,
  findConnectedWalls,
  isPointInPolygon,
  calculateRoomArea,
  getRoomCenter,
  validateRoom,
} from '@/utils/roomDetection';
import { Wall } from '@/types/elements/Wall';

// Mock wall creation helper
const createWall = (id: string, startX: number, startY: number, endX: number, endY: number): Wall => ({
  id,
  startX,
  startY,
  endX,
  endY,
  thickness: 10,
  height: 120,
  materialId: 'default',
  color: '#000000',
  type: 'wall',
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

describe('roomDetection', () => {
  describe('isPointInPolygon', () => {
    const squarePolygon = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];

    it('should detect point inside polygon', () => {
      expect(isPointInPolygon({ x: 50, y: 50 }, squarePolygon)).toBe(true);
      expect(isPointInPolygon({ x: 25, y: 75 }, squarePolygon)).toBe(true);
      expect(isPointInPolygon({ x: 1, y: 1 }, squarePolygon)).toBe(true);
    });

    it('should detect point outside polygon', () => {
      expect(isPointInPolygon({ x: 150, y: 50 }, squarePolygon)).toBe(false);
      expect(isPointInPolygon({ x: 50, y: 150 }, squarePolygon)).toBe(false);
      expect(isPointInPolygon({ x: -10, y: 50 }, squarePolygon)).toBe(false);
    });

    it('should handle points on polygon boundary', () => {
      expect(isPointInPolygon({ x: 0, y: 50 }, squarePolygon)).toBe(false); // On edge
      expect(isPointInPolygon({ x: 50, y: 0 }, squarePolygon)).toBe(false); // On edge
      expect(isPointInPolygon({ x: 0, y: 0 }, squarePolygon)).toBe(false); // On vertex
    });

    it('should handle triangular polygon', () => {
      const triangle = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 },
      ];

      expect(isPointInPolygon({ x: 50, y: 30 }, triangle)).toBe(true);
      expect(isPointInPolygon({ x: 25, y: 25 }, triangle)).toBe(true);
      expect(isPointInPolygon({ x: 75, y: 25 }, triangle)).toBe(true);
      expect(isPointInPolygon({ x: 10, y: 80 }, triangle)).toBe(false);
      expect(isPointInPolygon({ x: 90, y: 80 }, triangle)).toBe(false);
    });

    it('should handle empty polygon', () => {
      expect(isPointInPolygon({ x: 50, y: 50 }, [])).toBe(false);
    });

    it('should handle polygon with less than 3 points', () => {
      expect(isPointInPolygon({ x: 50, y: 50 }, [{ x: 0, y: 0 }])).toBe(false);
      expect(isPointInPolygon({ x: 50, y: 50 }, [{ x: 0, y: 0 }, { x: 100, y: 0 }])).toBe(false);
    });
  });

  describe('calculateRoomArea', () => {
    it('should calculate area of square room', () => {
      const square = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];

      expect(calculateRoomArea(square)).toBe(10000);
    });

    it('should calculate area of rectangular room', () => {
      const rectangle = [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 100 },
        { x: 0, y: 100 },
      ];

      expect(calculateRoomArea(rectangle)).toBe(20000);
    });

    it('should calculate area of triangular room', () => {
      const triangle = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 },
      ];

      expect(calculateRoomArea(triangle)).toBe(5000);
    });

    it('should handle room with negative coordinates', () => {
      const room = [
        { x: -50, y: -50 },
        { x: 50, y: -50 },
        { x: 50, y: 50 },
        { x: -50, y: 50 },
      ];

      expect(calculateRoomArea(room)).toBe(10000);
    });

    it('should return 0 for invalid polygons', () => {
      expect(calculateRoomArea([])).toBe(0);
      expect(calculateRoomArea([{ x: 0, y: 0 }])).toBe(0);
      expect(calculateRoomArea([{ x: 0, y: 0 }, { x: 100, y: 0 }])).toBe(0);
    });

    it('should handle clockwise vs counter-clockwise orientation', () => {
      const clockwise = [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 0 },
      ];

      const counterClockwise = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];

      const area1 = Math.abs(calculateRoomArea(clockwise));
      const area2 = Math.abs(calculateRoomArea(counterClockwise));
      expect(area1).toBe(area2);
      expect(area1).toBe(10000);
    });
  });

  describe('getRoomCenter', () => {
    it('should calculate center of square room', () => {
      const square = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];

      const center = getRoomCenter(square);
      expect(center.x).toBe(50);
      expect(center.y).toBe(50);
    });

    it('should calculate center of rectangular room', () => {
      const rectangle = [
        { x: 10, y: 20 },
        { x: 110, y: 20 },
        { x: 110, y: 70 },
        { x: 10, y: 70 },
      ];

      const center = getRoomCenter(rectangle);
      expect(center.x).toBe(60);
      expect(center.y).toBe(45);
    });

    it('should calculate center of triangular room', () => {
      const triangle = [
        { x: 0, y: 0 },
        { x: 60, y: 0 },
        { x: 30, y: 60 },
      ];

      const center = getRoomCenter(triangle);
      expect(center.x).toBe(30);
      expect(center.y).toBe(20);
    });

    it('should handle room with negative coordinates', () => {
      const room = [
        { x: -100, y: -100 },
        { x: 0, y: -100 },
        { x: 0, y: 0 },
        { x: -100, y: 0 },
      ];

      const center = getRoomCenter(room);
      expect(center.x).toBe(-50);
      expect(center.y).toBe(-50);
    });

    it('should handle empty or invalid polygons', () => {
      expect(getRoomCenter([])).toEqual({ x: 0, y: 0 });
      expect(getRoomCenter([{ x: 10, y: 20 }])).toEqual({ x: 10, y: 20 });
      expect(getRoomCenter([{ x: 0, y: 0 }, { x: 100, y: 0 }])).toEqual({ x: 50, y: 0 });
    });
  });

  describe('validateRoom', () => {
    it('should validate a proper room', () => {
      const validRoom = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];

      expect(validateRoom(validRoom)).toBe(true);
    });

    it('should reject room with insufficient points', () => {
      expect(validateRoom([])).toBe(false);
      expect(validateRoom([{ x: 0, y: 0 }])).toBe(false);
      expect(validateRoom([{ x: 0, y: 0 }, { x: 100, y: 0 }])).toBe(false);
    });

    it('should reject room with zero area', () => {
      const zeroAreaRoom = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 0 }, // All points on same line
      ];

      expect(validateRoom(zeroAreaRoom)).toBe(false);
    });

    it('should reject room with very small area', () => {
      const tinyRoom = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];

      expect(validateRoom(tinyRoom)).toBe(false);
    });

    it('should accept room with minimum valid area', () => {
      const minValidRoom = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
        { x: 0, y: 50 },
      ];

      expect(validateRoom(minValidRoom)).toBe(true);
    });

    it('should handle complex polygon shapes', () => {
      const lShapedRoom = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 100 },
      ];

      expect(validateRoom(lShapedRoom)).toBe(true);
    });
  });

  describe('findConnectedWalls', () => {
    it('should find walls connected to a given wall', () => {
      const walls = [
        createWall('wall1', 0, 0, 100, 0),     // Horizontal bottom
        createWall('wall2', 100, 0, 100, 100), // Vertical right
        createWall('wall3', 100, 100, 0, 100), // Horizontal top
        createWall('wall4', 0, 100, 0, 0),     // Vertical left
        createWall('wall5', 200, 0, 300, 0),   // Disconnected wall
      ];

      const connected = findConnectedWalls(walls[0], walls);
      
      expect(connected).toHaveLength(2); // Should find wall2 and wall4
      expect(connected.map(w => w.id)).toContain('wall2');
      expect(connected.map(w => w.id)).toContain('wall4');
      expect(connected.map(w => w.id)).not.toContain('wall5');
    });

    it('should handle wall with no connections', () => {
      const walls = [
        createWall('wall1', 0, 0, 100, 0),
        createWall('wall2', 200, 200, 300, 200), // Isolated wall
      ];

      const connected = findConnectedWalls(walls[1], walls);
      expect(connected).toHaveLength(0);
    });

    it('should handle empty wall array', () => {
      const wall = createWall('wall1', 0, 0, 100, 0);
      const connected = findConnectedWalls(wall, []);
      expect(connected).toHaveLength(0);
    });

    it('should not include the wall itself in connections', () => {
      const walls = [
        createWall('wall1', 0, 0, 100, 0),
        createWall('wall2', 100, 0, 100, 100),
      ];

      const connected = findConnectedWalls(walls[0], walls);
      expect(connected.map(w => w.id)).not.toContain('wall1');
    });

    it('should handle walls with approximate endpoint matching', () => {
      const walls = [
        createWall('wall1', 0, 0, 100, 0),
        createWall('wall2', 99.9, 0.1, 100, 100), // Slightly off endpoint
      ];

      const connected = findConnectedWalls(walls[0], walls);
      expect(connected).toHaveLength(1);
      expect(connected[0].id).toBe('wall2');
    });
  });

  describe('detectRooms', () => {
    it('should detect a simple rectangular room', () => {
      const walls = [
        createWall('wall1', 0, 0, 100, 0),     // Bottom
        createWall('wall2', 100, 0, 100, 100), // Right
        createWall('wall3', 100, 100, 0, 100), // Top
        createWall('wall4', 0, 100, 0, 0),     // Left
      ];

      const rooms = detectRooms(walls);
      
      expect(rooms.rooms).toHaveLength(1);
      expect(rooms.rooms[0].area).toBe(10000);
      expect(rooms.rooms[0].center.x).toBe(50);
      expect(rooms.rooms[0].center.y).toBe(50);
      expect(rooms.rooms[0].walls).toHaveLength(4);
    });

    it('should detect multiple rooms', () => {
      const walls = [
        // Room 1 (left)
        createWall('wall1', 0, 0, 50, 0),
        createWall('wall2', 50, 0, 50, 50),
        createWall('wall3', 50, 50, 0, 50),
        createWall('wall4', 0, 50, 0, 0),
        
        // Room 2 (right)
        createWall('wall5', 50, 0, 100, 0),
        createWall('wall6', 100, 0, 100, 50),
        createWall('wall7', 100, 50, 50, 50),
        // wall2 is shared between rooms
      ];

      const rooms = detectRooms(walls);
      
      expect(rooms).toHaveLength(2);
      expect(rooms.every(room => room.area > 0)).toBe(true);
    });

    it('should handle walls that do not form closed rooms', () => {
      const walls = [
        createWall('wall1', 0, 0, 100, 0),
        createWall('wall2', 100, 0, 100, 100),
        // Missing walls to close the room
      ];

      const rooms = detectRooms(walls);
      expect(rooms).toHaveLength(0);
    });

    it('should handle empty wall array', () => {
      const rooms = detectRooms([]);
      expect(rooms).toEqual([]);
    });

    it('should handle single wall', () => {
      const walls = [createWall('wall1', 0, 0, 100, 0)];
      const rooms = detectRooms(walls);
      expect(rooms).toEqual([]);
    });

    it('should detect L-shaped room', () => {
      const walls = [
        createWall('wall1', 0, 0, 100, 0),     // Bottom horizontal
        createWall('wall2', 100, 0, 100, 50),  // Right vertical (short)
        createWall('wall3', 100, 50, 150, 50), // Middle horizontal
        createWall('wall4', 150, 50, 150, 100),// Right vertical (tall)
        createWall('wall5', 150, 100, 0, 100), // Top horizontal
        createWall('wall6', 0, 100, 0, 0),     // Left vertical
      ];

      const rooms = detectRooms(walls);
      
      expect(rooms.rooms).toHaveLength(1);
      expect(rooms.rooms[0].area).toBeGreaterThan(0);
      expect(rooms.rooms[0].walls).toHaveLength(6);
    });

    it('should handle rooms with shared walls correctly', () => {
      const walls = [
        // Shared wall in the middle
        createWall('shared', 50, 0, 50, 100),
        
        // Left room
        createWall('left1', 0, 0, 50, 0),
        createWall('left2', 0, 0, 0, 100),
        createWall('left3', 0, 100, 50, 100),
        
        // Right room
        createWall('right1', 50, 0, 100, 0),
        createWall('right2', 100, 0, 100, 100),
        createWall('right3', 100, 100, 50, 100),
      ];

      const rooms = detectRooms(walls);
      
      expect(rooms).toHaveLength(2);
      
      // Both rooms should include the shared wall
      const sharedWallUsage = rooms.reduce((count, room) => {
        return count + (room.walls.some(w => w.id === 'shared') ? 1 : 0);
      }, 0);
      
      expect(sharedWallUsage).toBe(2);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle walls with zero length', () => {
      const walls = [
        createWall('wall1', 50, 50, 50, 50), // Zero length wall
        createWall('wall2', 0, 0, 100, 0),
        createWall('wall3', 100, 0, 100, 100),
        createWall('wall4', 100, 100, 0, 100),
        createWall('wall5', 0, 100, 0, 0),
      ];

      expect(() => detectRooms(walls)).not.toThrow();
      const rooms = detectRooms(walls);
      expect(Array.isArray(rooms)).toBe(true);
    });

    it('should handle walls with very large coordinates', () => {
      const walls = [
        createWall('wall1', 1000000, 1000000, 1000100, 1000000),
        createWall('wall2', 1000100, 1000000, 1000100, 1000100),
        createWall('wall3', 1000100, 1000100, 1000000, 1000100),
        createWall('wall4', 1000000, 1000100, 1000000, 1000000),
      ];

      const rooms = detectRooms(walls);
      expect(rooms.rooms).toHaveLength(1);
      expect(rooms.rooms[0].area).toBe(10000);
    });

    it('should handle floating point coordinates', () => {
      const walls = [
        createWall('wall1', 0.1, 0.1, 100.1, 0.1),
        createWall('wall2', 100.1, 0.1, 100.1, 100.1),
        createWall('wall3', 100.1, 100.1, 0.1, 100.1),
        createWall('wall4', 0.1, 100.1, 0.1, 0.1),
      ];

      const rooms = detectRooms(walls);
      expect(rooms.rooms).toHaveLength(1);
      expect(rooms.rooms[0].area).toBeCloseTo(10000, 1);
    });

    it('should handle duplicate walls', () => {
      const walls = [
        createWall('wall1', 0, 0, 100, 0),
        createWall('wall1-dup', 0, 0, 100, 0), // Duplicate
        createWall('wall2', 100, 0, 100, 100),
        createWall('wall3', 100, 100, 0, 100),
        createWall('wall4', 0, 100, 0, 0),
      ];

      expect(() => detectRooms(walls)).not.toThrow();
      const rooms = detectRooms(walls);
      expect(Array.isArray(rooms)).toBe(true);
    });
  });
});