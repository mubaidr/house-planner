import DimensionManager2D, { DEFAULT_STAGE_OPTIONS, DimensionManagerConfig, Dimension2D, DimensionChain2D, DimensionType, DimensionStyle } from '@/utils/dimensionManager2D';
import { Wall2D, Door2D, Window2D, Element2D, Point2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';

describe('DimensionManager2D', () => {
  let manager: DimensionManager2D;

  beforeEach(() => {
    manager = new DimensionManager2D();
  });

  it('should initialize with default config', () => {
    const config = manager.getConfig();
    expect(config.autoGenerate).toBe(true);
    expect(config.defaultUnit).toBe('m');
  });

  it('should initialize with custom config', () => {
    const customConfig: Partial<DimensionManagerConfig> = {
      defaultUnit: 'ft',
      snapTolerance: 0.1,
    };
    manager = new DimensionManager2D(customConfig);
    const config = manager.getConfig();
    expect(config.defaultUnit).toBe('ft');
    expect(config.snapTolerance).toBe(0.1);
  });

  it('should create a linear dimension', () => {
    const start: Point2D = { x: 0, y: 0 };
    const end: Point2D = { x: 100, y: 0 };
    const dimension = manager.createDimension(start, end);

    expect(dimension).toBeDefined();
    expect(dimension.type).toBe('linear');
    expect(dimension.value).toBe(100);
    expect(manager.getAllDimensions()).toHaveLength(1);
  });

  it('should update a dimension', () => {
    const start: Point2D = { x: 0, y: 0 };
    const end: Point2D = { x: 100, y: 0 };
    const dimension = manager.createDimension(start, end);

    const newEnd: Point2D = { x: 200, y: 0 };
    const updated = manager.updateDimension(dimension.id, { endPoint: { ...dimension.endPoint, position: newEnd } });
    expect(updated).toBe(true);
    expect(manager.getAllDimensions()[0].value).toBe(200);
  });

  it('should not update a locked dimension', () => {
    const start: Point2D = { x: 0, y: 0 };
    const end: Point2D = { x: 100, y: 0 };
    const dimension = manager.createDimension(start, end, 'linear', 'plan', 'floor-1', { isLocked: true });

    const newEnd: Point2D = { x: 200, y: 0 };
    const updated = manager.updateDimension(dimension.id, { endPoint: { ...dimension.endPoint, position: newEnd } });
    expect(updated).toBe(false);
    expect(manager.getAllDimensions()[0].value).toBe(100);
  });

  it('should delete a dimension', () => {
    const start: Point2D = { x: 0, y: 0 };
    const end: Point2D = { x: 100, y: 0 };
    const dimension = manager.createDimension(start, end);

    const deleted = manager.deleteDimension(dimension.id);
    expect(deleted).toBe(true);
    expect(manager.getAllDimensions()).toHaveLength(0);
  });

  it('should get dimensions for a specific view', () => {
    manager.createDimension({ x: 0, y: 0 }, { x: 10, y: 0 }, 'linear', 'plan', 'floor-1');
    manager.createDimension({ x: 0, y: 0 }, { x: 10, y: 0 }, 'linear', 'front', 'floor-1');

    const planDimensions = manager.getDimensionsForView('plan');
    expect(planDimensions).toHaveLength(1);
    expect(planDimensions[0].viewType).toBe('plan');
  });

  it('should get all dimensions', () => {
    manager.createDimension({ x: 0, y: 0 }, { x: 10, y: 0 });
    manager.createDimension({ x: 0, y: 0 }, { x: 20, y: 0 });
    expect(manager.getAllDimensions()).toHaveLength(2);
  });

  it('should create a dimension chain', () => {
    const dim1 = manager.createDimension({ x: 0, y: 0 }, { x: 10, y: 0 });
    const dim2 = manager.createDimension({ x: 10, y: 0 }, { x: 20, y: 0 });
    const chain = manager.createDimensionChain([dim1.id, dim2.id]);

    expect(chain).toBeDefined();
    expect(chain.dimensions).toHaveLength(2);
    expect(chain.totalValue).toBe(20);
    expect(manager.getDimensionChains()).toHaveLength(1);
  });

  it('should format dimension value correctly', () => {
    const dimension: Dimension2D = {
      id: 'test',
      type: 'linear',
      startPoint: { id: 's', position: { x: 0, y: 0 } },
      endPoint: { id: 'e', position: { x: 1, y: 0 } },
      value: 1.2345,
      unit: 'm',
      style: 'architectural',
      viewType: 'plan',
      floorId: 'f1',
      offset: 0,
      textSize: 0,
      arrowSize: 0,
      lineWeight: 0,
      color: '#000',
      isAutomatic: false,
      isLocked: false,
      isVisible: true,
      precision: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(manager.formatDimensionValue(dimension)).toBe('1.23m');

    dimension.value = 0.5;
    expect(manager.formatDimensionValue(dimension)).toBe('50.00cm');

    dimension.unit = 'ft';
    dimension.style = 'imperial';
    dimension.value = 0.5;
    expect(manager.formatDimensionValue(dimension)).toBe('6.00in');
  });

  it('should update config', () => {
    manager.updateConfig({ defaultUnit: 'cm' });
    expect(manager.getConfig().defaultUnit).toBe('cm');
  });

  it('should auto-generate dimensions for walls', () => {
    const walls: Wall2D[] = [
      { id: 'wall1', type: 'wall2d', startPoint: { x: 0, y: 0 }, endPoint: { x: 100, y: 0 }, thickness: 10, height: 200, transform: { position: { x: 50, y: 0 }, rotation: 0 } },
    ];
    const elements: Element2D[] = walls;
    const dimensions = manager.autoGenerateDimensions(elements, 'plan', 'floor-1');
    expect(dimensions).toHaveLength(1); // Wall length
    expect(dimensions[0].label).toContain('Wall');
  });

  it('should auto-generate dimensions for rooms in plan view', () => {
    const walls: Wall2D[] = [
      { id: 'w1', type: 'wall2d', startPoint: { x: 0, y: 0 }, endPoint: { x: 100, y: 0 }, thickness: 10, height: 200, transform: { position: { x: 50, y: 0 }, rotation: 0 } },
      { id: 'w2', type: 'wall2d', startPoint: { x: 100, y: 0 }, endPoint: { x: 100, y: 100 }, thickness: 10, height: 200, transform: { position: { x: 100, y: 50 }, rotation: 90 } },
      { id: 'w3', type: 'wall2d', startPoint: { x: 100, y: 100 }, endPoint: { x: 0, y: 100 }, thickness: 10, height: 200, transform: { position: { x: 50, y: 100 }, rotation: 180 } },
      { id: 'w4', type: 'wall2d', startPoint: { x: 0, y: 100 }, endPoint: { x: 0, y: 0 }, thickness: 10, height: 200, transform: { position: { x: 0, y: 50 }, rotation: 270 } },
    ];
    const elements: Element2D[] = walls;
    const dimensions = manager.autoGenerateDimensions(elements, 'plan', 'floor-1');
    expect(dimensions).toHaveLength(6); // 4 wall lengths + 2 room dimensions
    expect(dimensions.filter(d => d.label?.includes('Room'))).toHaveLength(2);
  });

  it('should auto-generate elevation dimensions for doors and windows in elevation view', () => {
    const doors: Door2D[] = [
      { id: 'd1', type: 'door2d', wallId: 'w1', x: 50, width: 30, height: 80, transform: { position: { x: 50, y: 0 }, rotation: 0 } },
    ];
    const windows: Window2D[] = [
      { id: 'win1', type: 'window2d', wallId: 'w2', x: 50, width: 40, height: 60, elevation: 30, transform: { position: { x: 50, y: 0 }, rotation: 0 } },
    ];
    const elements: Element2D[] = [...doors, ...windows];
    const dimensions = manager.autoGenerateDimensions(elements, 'front', 'floor-1');
    expect(dimensions).toHaveLength(2); // 1 door height + 1 window height
    expect(dimensions.filter(d => d.label?.includes('Height'))).toHaveLength(2);
  });
});