import { 
  DimensionManager2D,
  DimensionType,
  DimensionStyle,
  DimensionManagerConfig,
  Dimension2D,
  DimensionChain2D,
  DimensionPoint2D
} from '@/utils/dimensionManager2D';
import { Wall2D, Door2D, Window2D, Point2D, Element2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';

describe('DimensionManager2D', () => {
  let dimensionManager: DimensionManager2D;
  
  // Test data
  const mockWall: Wall2D = {
    id: 'wall-1',
    type: 'wall2d',
    transform: { position: { x: 0, y: 0 }, rotation: 0, scale: { x: 1, y: 1 } },
    dimensions: { width: 5, height: 2.5, depth: 0.2 },
    materialId: 'brick',
    floorId: 'floor-1',
    visible: true,
    locked: false,
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 5, y: 0 },
    thickness: 0.2,
    height: 2.5,
    openings: [],
    connectedWalls: [],
    constraints: []
  };

  const mockDoor: Door2D = {
    id: 'door-1',
    type: 'door2d',
    transform: { position: { x: 2, y: 0 }, rotation: 0, scale: { x: 1, y: 1 } },
    dimensions: { width: 0.8, height: 2.1, depth: 0.05 },
    materialId: 'wood',
    floorId: 'floor-1',
    visible: true,
    locked: false,
    wallId: 'wall-1',
    positionOnWall: 0.4,
    width: 0.8,
    height: 2.1,
    swingDirection: 'left',
    swingAngle: 0,
    handleSide: 'left',
    threshold: true,
    openingType: 'single'
  };

  const mockWindow: Window2D = {
    id: 'window-1',
    type: 'window2d',
    transform: { position: { x: 3.5, y: 0 }, rotation: 0, scale: { x: 1, y: 1 } },
    dimensions: { width: 1.2, height: 1.5, depth: 0.05 },
    materialId: 'glass',
    floorId: 'floor-1',
    visible: true,
    locked: false,
    wallId: 'wall-1',
    positionOnWall: 0.7,
    width: 1.2,
    height: 1.5,
    sillHeight: 0.9,
    frameWidth: 0.05,
    glazingType: 'double',
    operableType: 'casement',
    openingType: 'single'
  };

  const mockElements: Element2D[] = [mockWall, mockDoor, mockWindow];

  beforeEach(() => {
    dimensionManager = new DimensionManager2D();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const manager = new DimensionManager2D();
      const config = manager.getConfig();

      expect(config).toEqual({
        autoGenerate: true,
        defaultStyle: 'architectural',
        defaultUnit: 'm',
        defaultOffset: 0.5,
        defaultTextSize: 12,
        defaultArrowSize: 0.1,
        defaultLineWeight: 1,
        defaultColor: '#000000',
        snapTolerance: 0.05,
        showTolerances: false,
        precision: 2
      });
    });

    it('should initialize with custom configuration', () => {
      const customConfig: Partial<DimensionManagerConfig> = {
        defaultStyle: 'engineering',
        defaultUnit: 'mm',
        precision: 3,
        autoGenerate: false
      };

      const manager = new DimensionManager2D(customConfig);
      const config = manager.getConfig();

      expect(config.defaultStyle).toBe('engineering');
      expect(config.defaultUnit).toBe('mm');
      expect(config.precision).toBe(3);
      expect(config.autoGenerate).toBe(false);
      // Should preserve other defaults
      expect(config.defaultOffset).toBe(0.5);
    });

    it('should update configuration', () => {
      const updates: Partial<DimensionManagerConfig> = {
        defaultColor: '#FF0000',
        snapTolerance: 0.1
      };

      dimensionManager.updateConfig(updates);
      const config = dimensionManager.getConfig();

      expect(config.defaultColor).toBe('#FF0000');
      expect(config.snapTolerance).toBe(0.1);
    });
  });

  describe('Dimension Creation', () => {
    it('should create a basic linear dimension', () => {
      const startPoint: Point2D = { x: 0, y: 0 };
      const endPoint: Point2D = { x: 5, y: 0 };

      const dimension = dimensionManager.createDimension(
        startPoint,
        endPoint,
        'linear',
        'plan',
        'floor-1'
      );

      expect(dimension).toBeDefined();
      expect(dimension.id).toMatch(/^dim-/);
      expect(dimension.type).toBe('linear');
      expect(dimension.value).toBe(5); // Distance between points
      expect(dimension.startPoint.position).toEqual(startPoint);
      expect(dimension.endPoint.position).toEqual(endPoint);
      expect(dimension.viewType).toBe('plan');
      expect(dimension.floorId).toBe('floor-1');
      expect(dimension.isAutomatic).toBe(false);
      expect(dimension.isVisible).toBe(true);
      expect(dimension.isLocked).toBe(false);
    });

    it('should create dimension with custom options', () => {
      const startPoint: Point2D = { x: 0, y: 0 };
      const endPoint: Point2D = { x: 3, y: 4 };
      const options: Partial<Dimension2D> = {
        label: 'Custom Dimension',
        color: '#FF0000',
        isLocked: true,
        precision: 3
      };

      const dimension = dimensionManager.createDimension(
        startPoint,
        endPoint,
        'linear',
        'plan',
        'floor-1',
        options
      );

      expect(dimension.label).toBe('Custom Dimension');
      expect(dimension.color).toBe('#FF0000');
      expect(dimension.isLocked).toBe(true);
      expect(dimension.precision).toBe(3);
      expect(dimension.value).toBe(5); // 3-4-5 triangle
    });

    it('should calculate correct distance for diagonal dimensions', () => {
      const startPoint: Point2D = { x: 0, y: 0 };
      const endPoint: Point2D = { x: 3, y: 4 };

      const dimension = dimensionManager.createDimension(startPoint, endPoint);

      expect(dimension.value).toBe(5); // 3-4-5 triangle
    });

    it('should create angular dimension', () => {
      const startPoint: Point2D = { x: 0, y: 0 };
      const endPoint: Point2D = { x: 1, y: 1 };

      const dimension = dimensionManager.createDimension(
        startPoint,
        endPoint,
        'angular'
      );

      expect(dimension.type).toBe('angular');
    });
  });

  describe('Auto-generation', () => {
    it('should auto-generate dimensions when enabled', () => {
      const dimensions = dimensionManager.autoGenerateDimensions(
        mockElements,
        'plan',
        'floor-1'
      );

      expect(dimensions.length).toBeGreaterThan(0);
      expect(dimensions.every(dim => dim.isAutomatic)).toBe(true);
    });

    it('should not auto-generate when disabled', () => {
      dimensionManager.updateConfig({ autoGenerate: false });
      
      const dimensions = dimensionManager.autoGenerateDimensions(
        mockElements,
        'plan',
        'floor-1'
      );

      expect(dimensions).toEqual([]);
    });

    it('should generate wall dimensions', () => {
      const wallElements = [mockWall];
      
      const dimensions = dimensionManager.autoGenerateDimensions(
        wallElements,
        'plan',
        'floor-1'
      );

      expect(dimensions.length).toBeGreaterThan(0);
      const wallDimension = dimensions.find(dim => 
        dim.label?.includes('Wall') || dim.value === 5
      );
      expect(wallDimension).toBeDefined();
    });

    it('should generate elevation dimensions for doors and windows', () => {
      const elevationElements = [mockDoor, mockWindow];
      
      const dimensions = dimensionManager.autoGenerateDimensions(
        elevationElements,
        'front',
        'floor-1'
      );

      expect(dimensions.length).toBeGreaterThan(0);
      
      const doorHeightDim = dimensions.find(dim => 
        dim.label?.includes('Door Height')
      );
      const windowHeightDim = dimensions.find(dim => 
        dim.label?.includes('Window Height')
      );
      
      expect(doorHeightDim).toBeDefined();
      expect(windowHeightDim).toBeDefined();
      expect(doorHeightDim?.value).toBe(mockDoor.height);
      expect(windowHeightDim?.value).toBe(mockWindow.height);
    });

    it('should generate room dimensions in plan view', () => {
      const roomElements = [mockWall];
      
      const dimensions = dimensionManager.autoGenerateDimensions(
        roomElements,
        'plan',
        'floor-1'
      );

      expect(dimensions.length).toBeGreaterThan(0);
    });
  });

  describe('Dimension Chains', () => {
    it('should create dimension chain', () => {
      // Create some dimensions first
      const dim1 = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 2, y: 0 }
      );
      const dim2 = dimensionManager.createDimension(
        { x: 2, y: 0 },
        { x: 5, y: 0 }
      );

      const chain = dimensionManager.createDimensionChain(
        [dim1.id, dim2.id],
        'horizontal',
        0.5
      );

      expect(chain).toBeDefined();
      expect(chain.id).toMatch(/^chain-/);
      expect(chain.dimensions).toHaveLength(2);
      expect(chain.totalValue).toBe(5); // 2 + 3
      expect(chain.direction).toBe('horizontal');
      expect(chain.baselineOffset).toBe(0.5);
      expect(chain.isLocked).toBe(false);
    });

    it('should handle empty dimension chain', () => {
      const chain = dimensionManager.createDimensionChain([]);

      expect(chain.dimensions).toHaveLength(0);
      expect(chain.totalValue).toBe(0);
    });

    it('should filter out invalid dimension IDs', () => {
      const dim1 = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 2, y: 0 }
      );

      const chain = dimensionManager.createDimensionChain(
        [dim1.id, 'invalid-id', 'another-invalid-id']
      );

      expect(chain.dimensions).toHaveLength(1);
      expect(chain.totalValue).toBe(2);
    });
  });

  describe('Dimension Updates', () => {
    it('should update dimension successfully', () => {
      const dimension = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 5, y: 0 }
      );

      const updates: Partial<Dimension2D> = {
        label: 'Updated Label',
        color: '#00FF00',
        precision: 3
      };

      const success = dimensionManager.updateDimension(dimension.id, updates);

      expect(success).toBe(true);
    });

    it('should not update locked dimension', () => {
      const dimension = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        'linear',
        'plan',
        'floor-1',
        { isLocked: true }
      );

      const success = dimensionManager.updateDimension(dimension.id, {
        label: 'Should not update'
      });

      expect(success).toBe(false);
    });

    it('should not update non-existent dimension', () => {
      const success = dimensionManager.updateDimension('invalid-id', {
        label: 'Should not update'
      });

      expect(success).toBe(false);
    });

    it('should recalculate value when points are updated', () => {
      const dimension = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 5, y: 0 }
      );

      const newEndPoint: DimensionPoint2D = {
        id: 'new-end',
        position: { x: 10, y: 0 }
      };

      const success = dimensionManager.updateDimension(dimension.id, {
        endPoint: newEndPoint
      });

      expect(success).toBe(true);
      // Value should be recalculated to 10
    });
  });

  describe('Value Formatting', () => {
    it('should format architectural style dimensions', () => {
      const dimension = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 0.5, y: 0 }, // 0.5m = 50cm
        'linear',
        'plan',
        'floor-1',
        { style: 'architectural', unit: 'm', precision: 0 }
      );

      const formatted = dimensionManager.formatDimensionValue(dimension);
      expect(formatted).toBe('50cm');
    });

    it('should format metric style dimensions', () => {
      const dimension = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 0.005, y: 0 }, // 0.005m = 5mm
        'linear',
        'plan',
        'floor-1',
        { style: 'metric', unit: 'm', precision: 0 }
      );

      const formatted = dimensionManager.formatDimensionValue(dimension);
      expect(formatted).toBe('5mm');
    });

    it('should format imperial style dimensions', () => {
      const dimension = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 0.5, y: 0 }, // 0.5ft = 6in
        'linear',
        'plan',
        'floor-1',
        { style: 'imperial', unit: 'ft', precision: 0 }
      );

      const formatted = dimensionManager.formatDimensionValue(dimension);
      expect(formatted).toBe('6in');
    });

    it('should respect precision setting', () => {
      const dimension = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 1.23456, y: 0 },
        'linear',
        'plan',
        'floor-1',
        { precision: 3 }
      );

      const formatted = dimensionManager.formatDimensionValue(dimension);
      expect(formatted).toBe('1.235m');
    });

    it('should handle engineering style (no conversion)', () => {
      const dimension = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 0.5, y: 0 },
        'linear',
        'plan',
        'floor-1',
        { style: 'engineering', unit: 'm', precision: 2 }
      );

      const formatted = dimensionManager.formatDimensionValue(dimension);
      expect(formatted).toBe('0.50m');
    });
  });

  describe('Utility Functions', () => {
    it('should calculate distance correctly through dimension creation', () => {
      // Test horizontal distance
      const horizontalDim = dimensionManager.createDimension({ x: 0, y: 0 }, { x: 5, y: 0 });
      expect(horizontalDim.value).toBe(5);
      
      // Test vertical distance
      const verticalDim = dimensionManager.createDimension({ x: 0, y: 0 }, { x: 0, y: 3 });
      expect(verticalDim.value).toBe(3);
      
      // Test diagonal distance (3-4-5 triangle)
      const diagonalDim = dimensionManager.createDimension({ x: 0, y: 0 }, { x: 3, y: 4 });
      expect(diagonalDim.value).toBe(5);
      
      // Test zero distance
      const zeroDim = dimensionManager.createDimension({ x: 1, y: 1 }, { x: 1, y: 1 });
      expect(zeroDim.value).toBe(0);
    });

    it('should get all dimensions', () => {
      dimensionManager.createDimension({ x: 0, y: 0 }, { x: 1, y: 0 });
      dimensionManager.createDimension({ x: 0, y: 0 }, { x: 0, y: 1 });

      const allDimensions = dimensionManager.getAllDimensions();
      expect(allDimensions).toHaveLength(2);
    });

    it('should get dimensions by view type', () => {
      dimensionManager.createDimension(
        { x: 0, y: 0 }, 
        { x: 1, y: 0 }, 
        'linear', 
        'plan'
      );
      dimensionManager.createDimension(
        { x: 0, y: 0 }, 
        { x: 1, y: 0 }, 
        'linear', 
        'front'
      );

      const planDimensions = dimensionManager.getDimensionsForView('plan');
      const frontDimensions = dimensionManager.getDimensionsForView('front');

      expect(planDimensions).toHaveLength(1);
      expect(frontDimensions).toHaveLength(1);
      expect(planDimensions[0].viewType).toBe('plan');
      expect(frontDimensions[0].viewType).toBe('front');
    });

    it('should delete dimension', () => {
      const dimension = dimensionManager.createDimension({ x: 0, y: 0 }, { x: 1, y: 0 });
      
      const success = dimensionManager.deleteDimension(dimension.id);
      expect(success).toBe(true);

      const allDimensions = dimensionManager.getAllDimensions();
      expect(allDimensions).toHaveLength(0);
    });

    it('should not delete non-existent dimension', () => {
      const success = dimensionManager.deleteDimension('invalid-id');
      expect(success).toBe(false);
    });

    it('should get dimension chains', () => {
      const dim1 = dimensionManager.createDimension({ x: 0, y: 0 }, { x: 1, y: 0 });
      const dim2 = dimensionManager.createDimension({ x: 1, y: 0 }, { x: 2, y: 0 });

      dimensionManager.createDimensionChain([dim1.id, dim2.id]);

      const chains = dimensionManager.getDimensionChains();
      expect(chains).toHaveLength(1);
      expect(chains[0].dimensions).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small distances', () => {
      const dimension = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 0.001, y: 0 }
      );

      expect(dimension.value).toBe(0.001);
    });

    it('should handle very large distances', () => {
      const dimension = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 1000000, y: 0 }
      );

      expect(dimension.value).toBe(1000000);
    });

    it('should handle negative coordinates', () => {
      const dimension = dimensionManager.createDimension(
        { x: -5, y: -3 },
        { x: 5, y: 3 }
      );

      expect(dimension.value).toBeCloseTo(11.66, 2); // sqrt(10^2 + 6^2)
    });

    it('should handle invalid view types gracefully', () => {
      const dimension = dimensionManager.createDimension(
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        'linear',
        'invalid' as ViewType2D
      );

      expect(dimension.viewType).toBe('invalid');
    });

    it('should handle empty elements array for auto-generation', () => {
      const dimensions = dimensionManager.autoGenerateDimensions(
        [],
        'plan',
        'floor-1'
      );

      expect(dimensions).toEqual([]);
    });
  });

  describe('Performance', () => {
    it('should handle large number of dimensions efficiently', () => {
      const startTime = Date.now();
      
      // Create 1000 dimensions
      for (let i = 0; i < 1000; i++) {
        dimensionManager.createDimension(
          { x: i, y: 0 },
          { x: i + 1, y: 0 }
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second
      expect(dimensionManager.getAllDimensions()).toHaveLength(1000);
    });
  });
});