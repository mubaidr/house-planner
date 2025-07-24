import RoofMaterialCalculator from '@/utils/roofMaterialCalculations';
import { Roof } from '@/types/elements/Roof';

describe('RoofMaterialCalculator', () => {
  let calculator: RoofMaterialCalculator;
  let mockRoof: Roof;

  beforeEach(() => {
    calculator = new RoofMaterialCalculator();
    
    mockRoof = {
      id: 'roof-1',
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ],
      height: 300,
      pitch: 30,
      materialId: 'roof-material',
      floorId: 'floor-1',
      ridgeHeight: 350,
      eaveHeight: 300,
      roofType: 'gable'
    };
  });

  describe('calculateRoofArea', () => {
    it('should calculate area for simple rectangular roof', () => {
      const area = calculator.calculateRoofArea(mockRoof);
      expect(area).toBeCloseTo(10000, 0); // 100 * 100 = 10000
    });

    it('should handle triangular roof', () => {
      const triangularRoof = {
        ...mockRoof,
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 }
        ]
      };
      
      const area = calculator.calculateRoofArea(triangularRoof);
      expect(area).toBeCloseTo(5000, 0); // Triangle area = 0.5 * base * height
    });

    it('should return 0 for roof with less than 3 points', () => {
      const invalidRoof = {
        ...mockRoof,
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 }
        ]
      };
      
      const area = calculator.calculateRoofArea(invalidRoof);
      expect(area).toBe(0);
    });
  });

  describe('calculateSlopedArea', () => {
    it('should calculate sloped area based on pitch', () => {
      const slopedArea = calculator.calculateSlopedArea(mockRoof);
      const expectedMultiplier = 1 / Math.cos(30 * Math.PI / 180);
      expect(slopedArea).toBeCloseTo(10000 * expectedMultiplier, 0);
    });

    it('should handle zero pitch (flat roof)', () => {
      const flatRoof = { ...mockRoof, pitch: 0 };
      const slopedArea = calculator.calculateSlopedArea(flatRoof);
      expect(slopedArea).toBeCloseTo(10000, 0);
    });

    it('should handle steep pitch', () => {
      const steepRoof = { ...mockRoof, pitch: 60 };
      const slopedArea = calculator.calculateSlopedArea(steepRoof);
      const expectedMultiplier = 1 / Math.cos(60 * Math.PI / 180);
      expect(slopedArea).toBeCloseTo(10000 * expectedMultiplier, 0);
    });
  });

  describe('calculateMaterialQuantities', () => {
    it('should calculate shingle quantities', () => {
      const quantities = calculator.calculateMaterialQuantities(mockRoof, 'shingles');
      
      expect(quantities.primaryMaterial).toBeGreaterThan(0);
      expect(quantities.wasteFactor).toBe(0.1); // 10% waste for shingles
      expect(quantities.totalWithWaste).toBeGreaterThan(quantities.primaryMaterial);
    });

    it('should calculate metal roofing quantities', () => {
      const quantities = calculator.calculateMaterialQuantities(mockRoof, 'metal');
      
      expect(quantities.primaryMaterial).toBeGreaterThan(0);
      expect(quantities.wasteFactor).toBe(0.05); // 5% waste for metal
      expect(quantities.totalWithWaste).toBeGreaterThan(quantities.primaryMaterial);
    });

    it('should calculate tile quantities', () => {
      const quantities = calculator.calculateMaterialQuantities(mockRoof, 'tile');
      
      expect(quantities.primaryMaterial).toBeGreaterThan(0);
      expect(quantities.wasteFactor).toBe(0.15); // 15% waste for tiles
      expect(quantities.totalWithWaste).toBeGreaterThan(quantities.primaryMaterial);
    });

    it('should include accessories in calculations', () => {
      const quantities = calculator.calculateMaterialQuantities(mockRoof, 'shingles');
      
      expect(quantities.accessories).toBeDefined();
      expect(quantities.accessories.ridgeCap).toBeGreaterThan(0);
      expect(quantities.accessories.starter).toBeGreaterThan(0);
      expect(quantities.accessories.underlayment).toBeGreaterThan(0);
    });
  });

  describe('calculateRidgeLength', () => {
    it('should calculate ridge length for gable roof', () => {
      const ridgeLength = calculator.calculateRidgeLength(mockRoof);
      expect(ridgeLength).toBeGreaterThan(0);
    });

    it('should handle hip roof', () => {
      const hipRoof = { ...mockRoof, roofType: 'hip' as const };
      const ridgeLength = calculator.calculateRidgeLength(hipRoof);
      expect(ridgeLength).toBeGreaterThan(0);
    });

    it('should handle shed roof', () => {
      const shedRoof = { ...mockRoof, roofType: 'shed' as const };
      const ridgeLength = calculator.calculateRidgeLength(shedRoof);
      expect(ridgeLength).toBe(0); // Shed roofs typically don't have ridges
    });
  });

  describe('calculateEaveLength', () => {
    it('should calculate total eave length', () => {
      const eaveLength = calculator.calculateEaveLength(mockRoof);
      expect(eaveLength).toBe(400); // Perimeter of 100x100 square
    });

    it('should handle triangular roof', () => {
      const triangularRoof = {
        ...mockRoof,
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 }
        ]
      };
      
      const eaveLength = calculator.calculateEaveLength(triangularRoof);
      expect(eaveLength).toBeGreaterThan(0);
    });
  });

  describe('calculateCost', () => {
    it('should calculate total cost with labor and materials', () => {
      const materialCosts = {
        shingles: 2.5,
        metal: 8.0,
        tile: 5.0,
        membrane: 3.0
      };
      
      const laborRates = {
        shingles: 3.0,
        metal: 4.0,
        tile: 6.0,
        membrane: 2.5
      };
      
      const cost = calculator.calculateCost(mockRoof, 'shingles', materialCosts, laborRates);
      
      expect(cost.materialCost).toBeGreaterThan(0);
      expect(cost.laborCost).toBeGreaterThan(0);
      expect(cost.totalCost).toBe(cost.materialCost + cost.laborCost);
    });

    it('should handle missing cost data gracefully', () => {
      const cost = calculator.calculateCost(mockRoof, 'shingles', {}, {});
      
      expect(cost.materialCost).toBe(0);
      expect(cost.laborCost).toBe(0);
      expect(cost.totalCost).toBe(0);
    });
  });

  describe('generateMaterialList', () => {
    it('should generate comprehensive material list', () => {
      const materialList = calculator.generateMaterialList(mockRoof, 'shingles');
      
      expect(materialList).toHaveLength(4); // Primary + 3 accessories
      expect(materialList[0].name).toBe('Shingles');
      expect(materialList[0].quantity).toBeGreaterThan(0);
      expect(materialList[0].unit).toBe('sq ft');
      
      // Check accessories
      const accessories = materialList.slice(1);
      expect(accessories.some(item => item.name === 'Ridge Cap')).toBe(true);
      expect(accessories.some(item => item.name === 'Starter Strip')).toBe(true);
      expect(accessories.some(item => item.name === 'Underlayment')).toBe(true);
    });

    it('should handle different material types', () => {
      const metalList = calculator.generateMaterialList(mockRoof, 'metal');
      expect(metalList[0].name).toBe('Metal Roofing');
      expect(metalList[0].unit).toBe('sq ft');
      
      const tileList = calculator.generateMaterialList(mockRoof, 'tile');
      expect(tileList[0].name).toBe('Roof Tiles');
      expect(tileList[0].unit).toBe('sq ft');
    });
  });

  describe('edge cases', () => {
    it('should handle roof with duplicate points', () => {
      const roofWithDuplicates = {
        ...mockRoof,
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 0 }, // Duplicate
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ]
      };
      
      const area = calculator.calculateRoofArea(roofWithDuplicates);
      expect(area).toBeCloseTo(10000, 0);
    });

    it('should handle very small roof', () => {
      const smallRoof = {
        ...mockRoof,
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 0, y: 1 }
        ]
      };
      
      const area = calculator.calculateRoofArea(smallRoof);
      expect(area).toBe(1);
    });

    it('should handle negative pitch gracefully', () => {
      const negativePitchRoof = { ...mockRoof, pitch: -30 };
      const slopedArea = calculator.calculateSlopedArea(negativePitchRoof);
      expect(slopedArea).toBeGreaterThan(0);
    });
  });
});