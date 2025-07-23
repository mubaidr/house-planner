import RoofPitchCalculator, {
  calculateRoofPitch,
  calculateRoofArea,
  calculateRoofMaterials,
  validateRoofGeometry,
  getRoofDimensions,
  calculateGutterLength,
  calculateRidgeLength,
  getRoofSlope,
  convertPitchUnits,
  calculateDrainageArea
} from '@/utils/roofPitchCalculations';

describe('roofPitchCalculations', () => {
  describe('calculateRoofPitch', () => {
    it('should calculate pitch from rise and run', () => {
      const pitch = calculateRoofPitch(6, 12); // 6:12 pitch
      expect(pitch.ratio).toEqual({ rise: 6, run: 12 });
      expect(pitch.degrees).toBeCloseTo(26.57, 2);
      expect(pitch.percentage).toBeCloseTo(50, 1);
      expect(pitch.decimal).toBeCloseTo(0.5, 2);
    });

    it('should handle steep pitches', () => {
      const pitch = calculateRoofPitch(12, 12); // 45-degree pitch
      expect(pitch.degrees).toBeCloseTo(45, 1);
      expect(pitch.percentage).toBe(100);
      expect(pitch.decimal).toBe(1);
    });

    it('should handle flat roofs', () => {
      const pitch = calculateRoofPitch(0, 12);
      expect(pitch.degrees).toBe(0);
      expect(pitch.percentage).toBe(0);
      expect(pitch.decimal).toBe(0);
    });

    it('should handle very steep pitches', () => {
      const pitch = calculateRoofPitch(24, 12); // 24:12 pitch
      expect(pitch.degrees).toBeCloseTo(63.43, 2);
      expect(pitch.percentage).toBe(200);
      expect(pitch.decimal).toBe(2);
    });
  });

  describe('calculateRoofArea', () => {
    it('should calculate area for simple gable roof', () => {
      const roofData = {
        type: 'gable' as const,
        width: 30, // feet
        length: 40, // feet
        pitch: { rise: 6, run: 12 }
      };

      const area = calculateRoofArea(roofData);
      
      // For 6:12 pitch, slope factor ≈ 1.118
      const expectedArea = 30 * 40 * 1.118;
      expect(area.totalArea).toBeCloseTo(expectedArea, 1);
      expect(area.sections).toHaveLength(2); // Two roof planes
    });

    it('should calculate area for hip roof', () => {
      const roofData = {
        type: 'hip' as const,
        width: 30,
        length: 40,
        pitch: { rise: 8, run: 12 }
      };

      const area = calculateRoofArea(roofData);
      expect(area.totalArea).toBeGreaterThan(0);
      expect(area.sections).toHaveLength(4); // Four roof planes
    });

    it('should calculate area for shed roof', () => {
      const roofData = {
        type: 'shed' as const,
        width: 20,
        length: 30,
        pitch: { rise: 4, run: 12 }
      };

      const area = calculateRoofArea(roofData);
      expect(area.sections).toHaveLength(1); // Single roof plane
    });

    it('should handle complex roof with dormers', () => {
      const roofData = {
        type: 'gable' as const,
        width: 40,
        length: 50,
        pitch: { rise: 8, run: 12 },
        dormers: [
          { width: 8, length: 6, pitch: { rise: 8, run: 12 } },
          { width: 10, length: 8, pitch: { rise: 8, run: 12 } }
        ]
      };

      const area = calculateRoofArea(roofData);
      expect(area.totalArea).toBeGreaterThan(0);
      expect(area.sections.length).toBeGreaterThan(2); // Main roof + dormer sections
    });
  });

  describe('calculateRoofMaterials', () => {
    it('should calculate shingle materials', () => {
      const roofArea = 2000; // sq ft
      const materials = calculateRoofMaterials(roofArea, 'asphalt_shingles');

      expect(materials.primary.quantity).toBeGreaterThan(0);
      expect(materials.primary.unit).toBe('squares');
      expect(materials.underlayment.quantity).toBeGreaterThan(0);
      expect(materials.fasteners.quantity).toBeGreaterThan(0);
    });

    it('should calculate metal roofing materials', () => {
      const roofArea = 1500;
      const materials = calculateRoofMaterials(roofArea, 'metal');

      expect(materials.primary.quantity).toBeGreaterThan(0);
      expect(materials.primary.unit).toBe('panels');
      expect(materials.trim.quantity).toBeGreaterThan(0);
    });

    it('should calculate tile materials', () => {
      const roofArea = 2500;
      const materials = calculateRoofMaterials(roofArea, 'clay_tile');

      expect(materials.primary.quantity).toBeGreaterThan(0);
      expect(materials.primary.unit).toBe('tiles');
      expect(materials.mortar.quantity).toBeGreaterThan(0);
    });

    it('should include waste factor in calculations', () => {
      const roofArea = 1000;
      const materialsWithWaste = calculateRoofMaterials(roofArea, 'asphalt_shingles', 0.1);
      const materialsWithoutWaste = calculateRoofMaterials(roofArea, 'asphalt_shingles', 0);

      expect(materialsWithWaste.primary.quantity).toBeGreaterThan(materialsWithoutWaste.primary.quantity);
    });
  });

  describe('validateRoofGeometry', () => {
    it('should validate correct roof geometry', () => {
      const roofData = {
        type: 'gable' as const,
        width: 30,
        length: 40,
        pitch: { rise: 6, run: 12 },
        height: 15
      };

      const validation = validateRoofGeometry(roofData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid pitch', () => {
      const roofData = {
        type: 'gable' as const,
        width: 30,
        length: 40,
        pitch: { rise: -1, run: 12 }, // Invalid negative rise
        height: 15
      };

      const validation = validateRoofGeometry(roofData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Rise must be non-negative');
    });

    it('should detect invalid dimensions', () => {
      const roofData = {
        type: 'gable' as const,
        width: 0, // Invalid width
        length: 40,
        pitch: { rise: 6, run: 12 },
        height: 15
      };

      const validation = validateRoofGeometry(roofData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Width must be greater than 0');
    });

    it('should detect unrealistic pitch', () => {
      const roofData = {
        type: 'gable' as const,
        width: 30,
        length: 40,
        pitch: { rise: 50, run: 12 }, // Extremely steep
        height: 15
      };

      const validation = validateRoofGeometry(roofData);
      expect(validation.isValid).toBe(false);
      expect(validation.warnings).toContain('Pitch is extremely steep (>45°)');
    });
  });

  describe('getRoofDimensions', () => {
    it('should calculate roof dimensions for gable roof', () => {
      const roofData = {
        type: 'gable' as const,
        width: 30,
        length: 40,
        pitch: { rise: 6, run: 12 }
      };

      const dimensions = getRoofDimensions(roofData);
      
      expect(dimensions.ridgeLength).toBe(40);
      expect(dimensions.rafterLength).toBeCloseTo(13.42, 2); // √(12² + 6²)
      expect(dimensions.peakHeight).toBe(7.5); // (30/2) * (6/12)
    });

    it('should calculate roof dimensions for hip roof', () => {
      const roofData = {
        type: 'hip' as const,
        width: 30,
        length: 40,
        pitch: { rise: 8, run: 12 }
      };

      const dimensions = getRoofDimensions(roofData);
      
      expect(dimensions.ridgeLength).toBeLessThan(40); // Hip roof has shorter ridge
      expect(dimensions.hipLength).toBeGreaterThan(0);
      expect(dimensions.peakHeight).toBe(10); // (30/2) * (8/12)
    });

    it('should calculate roof dimensions for shed roof', () => {
      const roofData = {
        type: 'shed' as const,
        width: 20,
        length: 30,
        pitch: { rise: 4, run: 12 }
      };

      const dimensions = getRoofDimensions(roofData);
      
      expect(dimensions.ridgeLength).toBe(0); // No ridge in shed roof
      expect(dimensions.rafterLength).toBeCloseTo(12.65, 2); // √(12² + 4²)
      expect(dimensions.totalHeight).toBeCloseTo(6.67, 2); // 20 * (4/12)
    });
  });

  describe('calculateGutterLength', () => {
    it('should calculate gutter length for gable roof', () => {
      const roofData = {
        type: 'gable' as const,
        width: 30,
        length: 40,
        pitch: { rise: 6, run: 12 }
      };

      const gutterLength = calculateGutterLength(roofData);
      expect(gutterLength).toBe(80); // 2 * 40 (both eaves)
    });

    it('should calculate gutter length for hip roof', () => {
      const roofData = {
        type: 'hip' as const,
        width: 30,
        length: 40,
        pitch: { rise: 8, run: 12 }
      };

      const gutterLength = calculateGutterLength(roofData);
      expect(gutterLength).toBe(140); // Perimeter: 2 * (30 + 40)
    });

    it('should calculate gutter length for shed roof', () => {
      const roofData = {
        type: 'shed' as const,
        width: 20,
        length: 30,
        pitch: { rise: 4, run: 12 }
      };

      const gutterLength = calculateGutterLength(roofData);
      expect(gutterLength).toBe(30); // Only one eave
    });
  });

  describe('calculateRidgeLength', () => {
    it('should calculate ridge length for gable roof', () => {
      const roofData = {
        type: 'gable' as const,
        width: 30,
        length: 40,
        pitch: { rise: 6, run: 12 }
      };

      const ridgeLength = calculateRidgeLength(roofData);
      expect(ridgeLength).toBe(40);
    });

    it('should calculate ridge length for hip roof', () => {
      const roofData = {
        type: 'hip' as const,
        width: 30,
        length: 40,
        pitch: { rise: 8, run: 12 }
      };

      const ridgeLength = calculateRidgeLength(roofData);
      expect(ridgeLength).toBe(10); // length - width = 40 - 30
    });

    it('should return 0 for shed roof', () => {
      const roofData = {
        type: 'shed' as const,
        width: 20,
        length: 30,
        pitch: { rise: 4, run: 12 }
      };

      const ridgeLength = calculateRidgeLength(roofData);
      expect(ridgeLength).toBe(0);
    });
  });

  describe('getRoofSlope', () => {
    it('should calculate slope factor correctly', () => {
      expect(getRoofSlope({ rise: 6, run: 12 })).toBeCloseTo(1.118, 3);
      expect(getRoofSlope({ rise: 8, run: 12 })).toBeCloseTo(1.202, 3);
      expect(getRoofSlope({ rise: 12, run: 12 })).toBeCloseTo(1.414, 3);
      expect(getRoofSlope({ rise: 0, run: 12 })).toBe(1);
    });
  });

  describe('convertPitchUnits', () => {
    it('should convert between pitch units', () => {
      const pitch = { rise: 6, run: 12 };
      
      const degrees = convertPitchUnits(pitch, 'degrees');
      expect(degrees).toBeCloseTo(26.57, 2);
      
      const percentage = convertPitchUnits(pitch, 'percentage');
      expect(percentage).toBe(50);
      
      const decimal = convertPitchUnits(pitch, 'decimal');
      expect(decimal).toBeCloseTo(0.5, 2);
    });

    it('should handle edge cases', () => {
      expect(convertPitchUnits({ rise: 0, run: 12 }, 'degrees')).toBe(0);
      expect(convertPitchUnits({ rise: 12, run: 12 }, 'degrees')).toBeCloseTo(45, 1);
      expect(convertPitchUnits({ rise: 12, run: 0 }, 'degrees')).toBe(90);
    });
  });

  describe('calculateDrainageArea', () => {
    it('should calculate drainage area for roof section', () => {
      const roofSection = {
        area: 1000, // sq ft
        pitch: { rise: 6, run: 12 },
        gutterLength: 40
      };

      const drainageArea = calculateDrainageArea(roofSection);
      expect(drainageArea.area).toBe(1000);
      expect(drainageArea.flowRate).toBeGreaterThan(0);
      expect(drainageArea.downspoutCount).toBeGreaterThan(0);
    });

    it('should recommend more downspouts for larger areas', () => {
      const largeSection = {
        area: 2000,
        pitch: { rise: 8, run: 12 },
        gutterLength: 80
      };

      const smallSection = {
        area: 500,
        pitch: { rise: 8, run: 12 },
        gutterLength: 20
      };

      const largeDrainage = calculateDrainageArea(largeSection);
      const smallDrainage = calculateDrainageArea(smallSection);

      expect(largeDrainage.downspoutCount).toBeGreaterThan(smallDrainage.downspoutCount);
    });
  });

  describe('RoofPitchCalculator class', () => {
    let calculator: RoofPitchCalculator;

    beforeEach(() => {
      calculator = new RoofPitchCalculator();
    });

    it('should calculate comprehensive roof data', () => {
      const roofData = {
        type: 'gable' as const,
        width: 30,
        length: 40,
        pitch: { rise: 6, run: 12 }
      };

      const result = calculator.calculate(roofData);

      expect(result.area).toBeDefined();
      expect(result.dimensions).toBeDefined();
      expect(result.materials).toBeDefined();
      expect(result.drainage).toBeDefined();
    });

    it('should validate input before calculation', () => {
      const invalidRoofData = {
        type: 'gable' as const,
        width: -10, // Invalid
        length: 40,
        pitch: { rise: 6, run: 12 }
      };

      expect(() => calculator.calculate(invalidRoofData)).toThrow();
    });

    it('should support different material types', () => {
      const roofData = {
        type: 'gable' as const,
        width: 30,
        length: 40,
        pitch: { rise: 6, run: 12 }
      };

      const shingleResult = calculator.calculate(roofData, 'asphalt_shingles');
      const metalResult = calculator.calculate(roofData, 'metal');

      expect(shingleResult.materials.primary.unit).toBe('squares');
      expect(metalResult.materials.primary.unit).toBe('panels');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle zero run gracefully', () => {
      expect(() => calculateRoofPitch(6, 0)).not.toThrow();
      const result = calculateRoofPitch(6, 0);
      expect(result.degrees).toBe(90);
    });

    it('should handle very small dimensions', () => {
      const roofData = {
        type: 'shed' as const,
        width: 0.1,
        length: 0.1,
        pitch: { rise: 1, run: 12 }
      };

      const area = calculateRoofArea(roofData);
      expect(area.totalArea).toBeGreaterThan(0);
    });

    it('should handle very large dimensions', () => {
      const roofData = {
        type: 'gable' as const,
        width: 1000,
        length: 2000,
        pitch: { rise: 8, run: 12 }
      };

      const area = calculateRoofArea(roofData);
      expect(area.totalArea).toBeGreaterThan(0);
      expect(Number.isFinite(area.totalArea)).toBe(true);
    });

    it('should handle invalid roof types gracefully', () => {
      const roofData = {
        type: 'invalid' as any,
        width: 30,
        length: 40,
        pitch: { rise: 6, run: 12 }
      };

      expect(() => calculateRoofArea(roofData)).not.toThrow();
    });
  });
});