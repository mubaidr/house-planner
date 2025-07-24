

import { RoofWallIntegrationSystem2D, RoofWallIntegrationUtils } from '@/utils/roofWallIntegration2D';
import { Roof2D, Wall2D } from '@/types/elements';

// Mock RoofPitchCalculator
jest.mock('@/utils/roofPitchCalculations', () => ({
  RoofPitchCalculator: jest.fn().mockImplementation(() => ({
    calculatePitchFromRoof: jest.fn().mockReturnValue([]),
    calculateRoofGeometry: jest.fn(),
    findOptimalPitch: jest.fn(),
    validatePitch: jest.fn().mockReturnValue({ valid: true }),
    calculatePitchFromRiseRun: jest.fn(),
  })),
}));

describe('RoofWallIntegrationSystem2D', () => {
  it('should be defined', () => {
    expect(RoofWallIntegrationSystem2D).toBeDefined();
  });

  it('should be instantiable', () => {
    const system = new RoofWallIntegrationSystem2D();
    expect(system).toBeInstanceOf(RoofWallIntegrationSystem2D);
  });

  describe('constructor', () => {
    it('should create an instance with default configuration', () => {
      const system = new RoofWallIntegrationSystem2D();
      const config = system.getConfiguration();
      expect(config.defaultOverhang).toBe(0.5);
    });

    it('should create an instance with custom configuration', () => {
      const system = new RoofWallIntegrationSystem2D({ defaultOverhang: 1.0 });
      const config = system.getConfiguration();
      expect(config.defaultOverhang).toBe(1.0);
    });
  });

  describe('updateConfiguration', () => {
    it('should update the configuration', () => {
      const system = new RoofWallIntegrationSystem2D();
      system.updateConfiguration({ defaultOverhang: 1.5 });
      const config = system.getConfiguration();
      expect(config.defaultOverhang).toBe(1.5);
    });
  });

  describe('analyzeRoofWallIntegration', () => {
    it('should analyze roof-wall integration and return results', () => {
      const system = new RoofWallIntegrationSystem2D();
      const roofs: Roof2D[] = [
        {
          id: 'roof1',
          type: 'roof',
          dimensions: { width: 10, height: 5 },
          transform: { position: { x: 5, y: 2.5 }, rotation: 0 },
          metadata: { points: [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 5 },
            { x: 0, y: 5 },
          ] },
        },
      ];
      const walls: Wall2D[] = [
        {
          id: 'wall1',
          type: 'wall',
          startPoint: { x: 5, y: -2 },
          endPoint: { x: 5, y: 7 },
          height: 3,
        },
      ];

      const result = system.analyzeRoofWallIntegration(roofs, walls);

      expect(result).toBeDefined();
      expect(result.connections).toHaveLength(1);
      expect(result.intersections).toHaveLength(2);
      expect(result.modifiedRoofs).toHaveLength(1);
      expect(result.modifiedWalls).toHaveLength(1);
      expect(result.warnings).toHaveLength(0);
    });
  });
});


describe('RoofWallIntegrationUtils', () => {
  it('should be defined', () => {
    expect(RoofWallIntegrationUtils).toBeDefined();
  });

  describe('createDefaultConfig', () => {
    it('should return a default configuration object', () => {
      const config = RoofWallIntegrationUtils.createDefaultConfig();
      expect(config).toBeDefined();
      expect(config.defaultOverhang).toBe(0.5);
      expect(config.minOverhang).toBe(0.1);
      expect(config.maxOverhang).toBe(2.0);
    });
  });

  describe('validateConfig', () => {
    it('should return an empty array for a valid configuration', () => {
      const config = { defaultOverhang: 1, minOverhang: 0.5, maxOverhang: 2 };
      const errors = RoofWallIntegrationUtils.validateConfig(config);
      expect(errors).toHaveLength(0);
    });

    it('should return an error for a negative overhang', () => {
      const config = { defaultOverhang: -1 };
      const errors = RoofWallIntegrationUtils.validateConfig(config);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Default overhang must be non-negative');
    });
  });
});
