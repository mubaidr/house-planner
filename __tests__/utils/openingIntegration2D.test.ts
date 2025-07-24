import OpeningIntegrator2D from '@/utils/openingIntegration2D';

// Minimal type definitions for test compatibility
type Point2D = { x: number; y: number };
type Wall2D = {
  id: string;
  type: 'wall';
  start: Point2D;
  end: Point2D;
  thickness: number;
  height: number;
  materialId: string;
  floorId: string;
};

type Door2D = {
  id: string;
  type: 'door';
  position: Point2D;
  dimensions: { width: number; height: number; depth: number };
  wallId: string;
  wallAngle: number;
  isOpen: boolean;
  openAngle: number;
  materialId: string;
  floorId: string;
};

type Window2D = {
  id: string;
  type: 'window';
  position: Point2D;
  dimensions: { width: number; height: number; depth: number };
  wallId: string;
  wallAngle: number;
  sillHeight: number;
  frameWidth: number;
  glazingType: string;
  operableType: string;
  materialId: string;
  floorId: string;
};

type Opening2D = Door2D | Window2D;

describe('OpeningIntegrator2D', () => {
  let mockWall: Wall2D;
  let mockDoor: Door2D;
  let mockWindow: Window2D;

  beforeEach(() => {
    mockWall = {
      id: 'wall-1',
      type: 'wall',
      start: { x: 0, y: 0 },
      end: { x: 100, y: 0 },
      thickness: 0.2,
      height: 250,
      materialId: 'material-1',
      floorId: 'floor-1'
    };

    mockDoor = {
      id: 'door-1',
      type: 'door',
      position: { x: 50, y: 0 },
      dimensions: { width: 80, height: 200, depth: 0.2 },
      wallId: 'wall-1',
      wallAngle: 0,
      isOpen: false,
      openAngle: 0,
      materialId: 'door-material',
      floorId: 'floor-1'
    };

    mockWindow = {
      id: 'window-1',
      type: 'window',
      position: { x: 25, y: 0 },
      dimensions: { width: 60, height: 120, depth: 0.2 },
      wallId: 'wall-1',
      wallAngle: 0,
      sillHeight: 90,
      frameWidth: 5,
      glazingType: 'double',
      operableType: 'sliding',
      materialId: 'window-material',
      floorId: 'floor-1'
    };
  });

  describe('validateOpeningPlacement', () => {
    it('should validate door placement on wall', () => {
      const result = OpeningIntegrator2D.validateOpeningPlacement(mockDoor, mockWall);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate window placement on wall', () => {
      const result = OpeningIntegrator2D.validateOpeningPlacement(mockWindow, mockWall);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect opening too wide for wall', () => {
      const oversizedDoor: Door2D = { ...mockDoor, dimensions: { ...mockDoor.dimensions, width: 150 } };
      const result = OpeningIntegrator2D.validateOpeningPlacement(oversizedDoor, mockWall);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Opening too wide'))).toBe(true);
    });

    it('should detect opening position outside wall bounds', () => {
      const edgeDoor: Door2D = { ...mockDoor, position: { x: -10, y: 0 } };
      const result = OpeningIntegrator2D.validateOpeningPlacement(edgeDoor, mockWall);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('outside wall bounds'))).toBe(true);
    });
  });

  describe('calculateOpeningGeometry', () => {
    it('should calculate correct opening geometry', () => {
      const geometry = OpeningIntegrator2D.calculateOpeningGeometry(mockDoor, mockWall);
      expect(geometry.position.x).toBeCloseTo(50, 1);
      expect(geometry.position.y).toBeCloseTo(0, 1);
      expect(geometry.angle).toBeCloseTo(0, 2);
      expect(geometry.isValid).toBe(true);
    });

    it('should handle angled walls', () => {
      const angledWall: Wall2D = { ...mockWall, end: { x: 70.71, y: 70.71 } };
      const geometry = OpeningIntegrator2D.calculateOpeningGeometry(mockDoor, angledWall);
      expect(geometry.position.x).toBeCloseTo(35.36, 1);
      expect(geometry.position.y).toBeCloseTo(35.36, 1);
      expect(geometry.angle).toBeCloseTo(Math.PI / 4, 2);
    });
  });

  describe('snapOpeningToWall', () => {
    it('should snap opening to wall constraints', () => {
      const unsnappedDoor: Door2D = { ...mockDoor, position: { x: 5, y: 0 } };
      const snappedDoor = OpeningIntegrator2D.snapOpeningToWall(unsnappedDoor, mockWall);
      expect((snappedDoor as Door2D).position.x).toBeGreaterThanOrEqual(0);
      expect((snappedDoor as Door2D).position.x).toBeLessThanOrEqual(100);
    });

    it('should not change position if autoAlign is false', () => {
      const unsnappedDoor: Door2D = { ...mockDoor, position: { x: 5, y: 0 } };
      const snappedDoor = OpeningIntegrator2D.snapOpeningToWall(unsnappedDoor, mockWall, { autoAlign: false });
      expect((snappedDoor as Door2D).position.x).toBe(5);
    });
  });

  describe('getOpeningsForWall', () => {
    it('should return openings for specific wall', () => {
      const allOpenings = [mockDoor, mockWindow];
      const wallOpenings = OpeningIntegrator2D.getOpeningsForWall(mockWall as any, allOpenings as any);
      expect(wallOpenings).toContain(mockDoor);
      expect(wallOpenings).toContain(mockWindow);
    });

    it('should filter out openings not on wall', () => {
      const otherDoor: Door2D = { ...mockDoor, id: 'door-2', position: { x: 200, y: 0 } };
      const allOpenings = [mockDoor, mockWindow, otherDoor];
      const wallOpenings = OpeningIntegrator2D.getOpeningsForWall(mockWall as any, allOpenings as any);
      expect(wallOpenings).not.toContain(otherDoor);
    });
  });
});
