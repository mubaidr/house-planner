import {
  calculateWallGeometry,
  calculateDoorPositionOnWall,
  calculateWindowPositionOnWall,
  generateRoomGeometry,
  createDoorGeometries,
  createWindowGeometries,
  getMaterialProperties
} from '@/utils/3d/geometryUtils';
import { Wall, Door, Window, Room, Material } from '@/types';// Mock wall for testing
const mockWall: Wall = {
  id: 'wall-test-1',
  startX: 0,
  startY: 0,
  endX: 4,
  endY: 0,
  height: 3,
  thickness: 0.2,
  materialId: 'material-1',
  color: '#CCCCCC'
};

// Mock door for testing
const mockDoor: Door = {
  id: 'door-test-1',
  wallId: 'wall-test-1',
  width: 0.9,
  height: 2.1,
  position: 50, // 50% along the wall (middle)
  openDirection: 'inward',
  materialId: 'material-1',
  color: '#8B4513'
};

// Mock window for testing
const mockWindow: Window = {
  id: 'window-test-1',
  wallId: 'wall-test-1',
  width: 1.2,
  height: 1.5,
  sillHeight: 0.9,
  position: 37.5, // 37.5% along the wall (1.5m on a 4m wall)
  materialId: 'material-1',
  color: '#FFFFFF'
};

// Mock room for testing
const mockRoom: Room = {
  id: 'room-test-1',
  name: 'Test Room',
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 3 },
    { x: 0, y: 3 }
  ],
  properties3D: {
    floorElevation: 0,
    floorThickness: 0.1,
    ceilingHeight: 3,
    textureScale: 1,
    materialProperties: {
      roughness: 0.8,
      metalness: 0.1,
      opacity: 1.0
    }
  },
  walls: ['wall-test-1']
};

// Mock materials
const mockMaterials: Material[] = [
  {
    id: 'material-1',
    name: 'Test Material',
    color: '#CCCCCC',
    properties: { roughness: 0.5, metalness: 0.2, opacity: 1.0 }
  },
  {
    id: 'material-floor',
    name: 'Floor Material',
    color: '#F5F5DC',
    properties: { roughness: 0.8, metalness: 0.1, opacity: 1.0 }
  }
];

describe('geometryUtils', () => {
  describe('calculateWallGeometry', () => {
    it('should calculate correct wall geometry', () => {
      const result = calculateWallGeometry(mockWall);

      expect(result.geometry.type).toBe('BoxGeometry');
      expect(result.position).toEqual([2, 1.5, 0]); // Center of wall
      expect(result.rotation).toEqual([0, 0, 0]); // No rotation for horizontal wall
    });

    it('should handle vertical wall correctly', () => {
      const verticalWall: Wall = {
        ...mockWall,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 4
      };

      const result = calculateWallGeometry(verticalWall);

      expect(result.position).toEqual([0, 1.5, 2]); // Center of vertical wall
      expect(result.rotation).toEqual([0, Math.PI / 2, 0]); // 90 degree rotation
    });
  });  describe('calculateDoorPositionOnWall', () => {
    it('should calculate correct door position on wall', () => {
      const result = calculateDoorPositionOnWall(mockDoor, mockWall);

      expect(result.position).toHaveLength(3);
      expect(result.rotation).toHaveLength(3);

      // Door should be positioned 50% along the wall (center of 4m wall = 2m)
      expect(result.position[0]).toBeCloseTo(2);
      expect(result.position[1]).toBeCloseTo(1.05); // Half of door height
      expect(result.position[2]).toBeCloseTo(0);
    });

    it('should handle door at wall end', () => {
      const doorAtEnd: Door = {
        ...mockDoor,
        position: 100 // 100% at wall end
      };

      const result = calculateDoorPositionOnWall(doorAtEnd, mockWall);

      expect(result.position[0]).toBeCloseTo(4);
    });
  });  describe('calculateWindowPositionOnWall', () => {
    it('should calculate correct window position on wall', () => {
      const result = calculateWindowPositionOnWall(mockWindow, mockWall);

      expect(result.position).toHaveLength(3);
      expect(result.rotation).toHaveLength(3);

      // Window should be positioned 37.5% along the wall (1.5m on a 4m wall)
      expect(result.position[0]).toBeCloseTo(1.5);

      // Window should be at sill height + half window height
      expect(result.position[1]).toBeCloseTo(1.65); // 0.9 + 1.5/2
      expect(result.position[2]).toBeCloseTo(0);
    });
  });

  describe('generateRoomGeometry', () => {
    it('should generate room geometry with floor and ceiling', () => {
      const result = generateRoomGeometry(mockRoom);

      expect(result.floorGeometry).toBeDefined();
      expect(result.ceilingGeometry).toBeDefined();
      expect(result.center).toEqual({ x: 2, y: 1.5 });

      // Center point should be at middle of room points
      expect(result.center.x).toBeCloseTo(2); // Middle of 4-unit room
      expect(result.center.y).toBeCloseTo(1.5); // Middle of 3-unit room
    });

    it('should handle room without ceiling', () => {
      const roomNoCeiling: Room = {
        ...mockRoom,
        properties3D: {
          ...mockRoom.properties3D!,
          ceilingHeight: 0
        }
      };

      const result = generateRoomGeometry(roomNoCeiling);

      expect(result.floorGeometry).toBeDefined();
      // Note: The current implementation always creates a ceiling geometry
      // even when ceilingHeight is 0, as it clones the floor
      expect(result.ceilingGeometry).toBeDefined();
    });
  });  describe('createDoorGeometries', () => {
    it('should create door geometries', () => {
      const result = createDoorGeometries(mockDoor);

      expect(result.frameGeometry.type).toBe('ExtrudeGeometry');
      expect(result.panelGeometry.type).toBe('BoxGeometry');
    });
  });

  describe('createWindowGeometries', () => {
    it('should create window geometries', () => {
      const result = createWindowGeometries(mockWindow);

      expect(result.frameGeometry.type).toBe('ExtrudeGeometry');
      expect(result.glassGeometry.type).toBe('PlaneGeometry');
      expect(result.sillGeometry.type).toBe('BoxGeometry');
    });
  });

  describe('getMaterialProperties', () => {
    it('should return material properties for existing material', () => {
      const result = getMaterialProperties('material-1', mockMaterials, '#FFFFFF');

      expect(result.color).toBe('#CCCCCC');
      expect(result.roughness).toBe(0.5);
      expect(result.metalness).toBe(0.2);
      expect(result.opacity).toBe(1.0);
    });

    it('should return fallback properties for non-existent material', () => {
      const result = getMaterialProperties('non-existent', mockMaterials, '#FF0000');

      // When material is not found, it falls back to first material in array
      expect(result.color).toBe('#CCCCCC'); // First material color
      expect(result.roughness).toBe(0.5);   // First material roughness
      expect(result.metalness).toBe(0.2);   // First material metalness
      expect(result.opacity).toBe(1.0);     // First material opacity
    });    it('should handle materials without properties', () => {
      const materialWithoutProps: Material = {
        id: 'simple-material',
        name: 'Simple Material',
        color: '#00FF00',
        properties: {} // Empty properties object
      };

      const result = getMaterialProperties('simple-material', [materialWithoutProps], '#FFFFFF');

      expect(result.color).toBe('#00FF00');
      expect(result.roughness).toBe(0.8); // Default value from function
      expect(result.metalness).toBe(0.0); // Default value from function
      expect(result.opacity).toBe(1.0); // Default value from function
    });
  });
});
