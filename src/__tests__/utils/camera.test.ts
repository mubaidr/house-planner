import {
  CAMERA_PRESETS,
  calculateOptimalCameraPosition,
  interpolateCameraPosition,
  sphericalToCartesian,
  cartesianToSpherical,
  validateCameraPosition,
  calculateLookAtMatrix
} from '@/utils/camera';

// Mock Three.js for testing
jest.mock('three', () => ({
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    copy: jest.fn(),
    clone: jest.fn(),
    normalize: jest.fn(),
    cross: jest.fn(),
    dot: jest.fn()
  })),
  Box3: jest.fn().mockImplementation(() => ({
    min: { x: -1, y: -1, z: -1 },
    max: { x: 1, y: 1, z: 1 },
    isEmpty: jest.fn().mockReturnValue(false),
    setFromObject: jest.fn().mockReturnThis(),
    union: jest.fn().mockReturnThis(),
    getCenter: jest.fn().mockImplementation((target) => {
      target.x = 0;
      target.y = 0;
      target.z = 0;
      return target;
    }),
    getSize: jest.fn().mockImplementation((target) => {
      target.x = 2;
      target.y = 2;
      target.z = 2;
      return target;
    })
  })),
  Matrix4: jest.fn().mockImplementation(() => ({
    lookAt: jest.fn(),
    identity: jest.fn(),
    makeTranslation: jest.fn(),
    makeRotationFromEuler: jest.fn()
  }))
}));

const mockObject3D = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

describe('Camera Utils', () => {
  describe('CAMERA_PRESETS', () => {
    it('should have all required presets', () => {
      expect(CAMERA_PRESETS.perspective).toBeDefined();
      expect(CAMERA_PRESETS.top).toBeDefined();
      expect(CAMERA_PRESETS.front).toBeDefined();
      expect(CAMERA_PRESETS.back).toBeDefined();
      expect(CAMERA_PRESETS.left).toBeDefined();
      expect(CAMERA_PRESETS.right).toBeDefined();
      expect(CAMERA_PRESETS.isometric).toBeDefined();
    });

    it('should have valid position and target arrays', () => {
      Object.values(CAMERA_PRESETS).forEach(preset => {
        expect(preset.position).toHaveLength(3);
        expect(preset.target).toHaveLength(3);
        expect(preset.position.every(coord => typeof coord === 'number')).toBe(true);
        expect(preset.target.every(coord => typeof coord === 'number')).toBe(true);
      });
    });

    it('should have different positions for different presets', () => {
      const positions = Object.values(CAMERA_PRESETS).map(preset => preset.position.join(','));
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(positions.length); // All positions should be unique
    });
  });

  describe('calculateOptimalCameraPosition', () => {
    it('should return default preset for empty objects array', () => {
      const result = calculateOptimalCameraPosition([]);
      expect(result).toEqual(CAMERA_PRESETS.perspective);
    });

    it('should handle single object', () => {
      const objects = [mockObject3D as any];
      const result = calculateOptimalCameraPosition(objects);

      expect(result.position).toHaveLength(3);
      expect(result.target).toHaveLength(3);
      expect(result.position.every(coord => typeof coord === 'number')).toBe(true);
      expect(result.target.every(coord => typeof coord === 'number')).toBe(true);
    });

    it('should handle multiple objects', () => {
      const objects = [
        { ...mockObject3D, position: { x: -5, y: 0, z: -5 } },
        { ...mockObject3D, position: { x: 5, y: 0, z: 5 } }
      ] as any[];

      const result = calculateOptimalCameraPosition(objects);
      expect(result.position).toHaveLength(3);
      expect(result.target).toHaveLength(3);
    });
  });

  describe('interpolateCameraPosition', () => {
    const start = {
      position: [0, 0, 0] as [number, number, number],
      target: [0, 0, 0] as [number, number, number]
    };
    const end = {
      position: [10, 10, 10] as [number, number, number],
      target: [5, 5, 5] as [number, number, number]
    };

    it('should return start position at t=0', () => {
      const result = interpolateCameraPosition(start, end, 0);
      expect(result.position).toEqual([0, 0, 0]);
      expect(result.target).toEqual([0, 0, 0]);
    });

    it('should return end position at t=1', () => {
      const result = interpolateCameraPosition(start, end, 1);
      expect(result.position).toEqual([10, 10, 10]);
      expect(result.target).toEqual([5, 5, 5]);
    });

    it('should interpolate correctly at t=0.5', () => {
      const result = interpolateCameraPosition(start, end, 0.5);
      expect(result.position).toEqual([5, 5, 5]);
      expect(result.target).toEqual([2.5, 2.5, 2.5]);
    });

    it('should clamp values outside 0-1 range', () => {
      const resultNegative = interpolateCameraPosition(start, end, -0.5);
      expect(resultNegative.position).toEqual([0, 0, 0]);

      const resultOver = interpolateCameraPosition(start, end, 1.5);
      expect(resultOver.position).toEqual([10, 10, 10]);
    });
  });

  describe('sphericalToCartesian', () => {
    it('should convert spherical coordinates correctly', () => {
      const [x, y, z] = sphericalToCartesian(1, 0, Math.PI / 2);
      expect(x).toBeCloseTo(1, 5);
      expect(y).toBeCloseTo(0, 5);
      expect(z).toBeCloseTo(0, 5);
    });

    it('should handle radius of 0', () => {
      const [x, y, z] = sphericalToCartesian(0, 0, 0);
      expect(x).toBe(0);
      expect(y).toBe(0);
      expect(z).toBe(0);
    });

    it('should handle different angles', () => {
      const [x, y, z] = sphericalToCartesian(2, Math.PI / 4, Math.PI / 2);
      expect(x).toBeCloseTo(Math.sqrt(2), 5);
      expect(y).toBeCloseTo(0, 5);
      expect(z).toBeCloseTo(Math.sqrt(2), 5);
    });
  });

  describe('cartesianToSpherical', () => {
    it('should convert cartesian coordinates correctly', () => {
      const result = cartesianToSpherical(1, 0, 0);
      expect(result.radius).toBeCloseTo(1, 5);
      expect(result.theta).toBeCloseTo(0, 5);
      expect(result.phi).toBeCloseTo(Math.PI / 2, 5);
    });

    it('should handle origin point', () => {
      const result = cartesianToSpherical(0, 0, 0);
      expect(result.radius).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const result = cartesianToSpherical(-1, 1, -1);
      expect(result.radius).toBeCloseTo(Math.sqrt(3), 5);
      expect(typeof result.theta).toBe('number');
      expect(typeof result.phi).toBe('number');
    });
  });

  describe('validateCameraPosition', () => {
    it('should validate correct positions', () => {
      expect(validateCameraPosition([1, 2, 3])).toBe(true);
      expect(validateCameraPosition([0, 0, 1])).toBe(true);
      expect(validateCameraPosition([-5, 10, -3])).toBe(true);
    });

    it('should reject invalid positions', () => {
      expect(validateCameraPosition([NaN, 0, 0])).toBe(false);
      expect(validateCameraPosition([0, Infinity, 0])).toBe(false);
      expect(validateCameraPosition(['invalid' as any, 0, 0])).toBe(false);
      expect(validateCameraPosition([1, 2] as any)).toBe(false); // wrong length
    });

    it('should reject positions too close to origin', () => {
      expect(validateCameraPosition([0, 0, 0])).toBe(false);
      expect(validateCameraPosition([0.05, 0, 0])).toBe(false);
    });

    it('should accept positions just far enough from origin', () => {
      expect(validateCameraPosition([0.1, 0, 0])).toBe(true);
      expect(validateCameraPosition([0, 0.1, 0])).toBe(true);
    });
  });

  describe('calculateLookAtMatrix', () => {
    it('should create a matrix', () => {
      const matrix = calculateLookAtMatrix([1, 1, 1], [0, 0, 0]);
      expect(matrix).toBeDefined();
      expect(typeof matrix.lookAt).toBe('function');
    });

    it('should handle same position and target', () => {
      const matrix = calculateLookAtMatrix([0, 0, 0], [0, 0, 0]);
      expect(matrix).toBeDefined();
    });

    it('should handle custom up vector', () => {
      const matrix = calculateLookAtMatrix([1, 1, 1], [0, 0, 0], [0, 0, 1]);
      expect(matrix).toBeDefined();
    });
  });

  describe('spherical/cartesian conversion consistency', () => {
    it('should be consistent when converting back and forth', () => {
      const originalX = 3;
      const originalY = 4;
      const originalZ = 5;

      const spherical = cartesianToSpherical(originalX, originalY, originalZ);
      const [x, y, z] = sphericalToCartesian(spherical.radius, spherical.theta, spherical.phi);

      expect(x).toBeCloseTo(originalX, 5);
      expect(y).toBeCloseTo(originalY, 5);
      expect(z).toBeCloseTo(originalZ, 5);
    });
  });
});
