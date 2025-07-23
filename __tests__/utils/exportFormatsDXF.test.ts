import { exportStageToDXF, exportMultiViewToDXF, DEFAULT_DXF_OPTIONS, DXF_LAYERS, DXF_COLORS, generateDXFFilename } from '@/utils/exportFormatsDXF';
import Konva from 'konva';

// Mock Blob for testing Blob.text()
const mockBlobText = jest.fn((content) => Promise.resolve(content));
const mockBlob = jest.fn(function (this: Blob, content, options) {
  // Call the original Blob constructor
  const actualBlob = new (jest.requireActual('buffer').Blob)(content, options);
  // Copy properties from the actual Blob to the mock instance
  Object.assign(this, actualBlob);
  // Override the text method with our mock
  this.text = () => mockBlobText(content[0]);
});

Object.defineProperty(global, 'Blob', {
  writable: true,
  value: mockBlob,
});

// Mock Konva objects and methods
const mockKonvaNode = {
  x: jest.fn(() => 0),
  y: jest.fn(() => 0),
  width: jest.fn(() => 100),
  height: jest.fn(() => 100),
  radius: jest.fn(() => 50),
  text: jest.fn(() => 'Test Text'),
  fontSize: jest.fn(() => 12),
  points: jest.fn(() => [0, 0, 100, 0]),
  closed: jest.fn(() => false),
  name: jest.fn(() => ''),
  className: '',
  getChildren: jest.fn(() => []),
};

const mockKonvaLayer = {
  getChildren: jest.fn(() => []),
};

const mockKonvaStage = {
  getLayers: jest.fn(() => [mockKonvaLayer]),
};

jest.mock('konva', () => ({
  Stage: jest.fn(() => mockKonvaStage),
  Layer: jest.fn(() => mockKonvaLayer),
  Line: jest.fn(() => ({ ...mockKonvaNode, className: 'Line' })),
  Rect: jest.fn(() => ({ ...mockKonvaNode, className: 'Rect' })),
  Circle: jest.fn(() => ({ ...mockKonvaNode, className: 'Circle' })),
  Text: jest.fn(() => ({ ...mockKonvaNode, className: 'Text' })),
  Group: jest.fn(() => ({ ...mockKonvaNode, className: 'Group' })),
}));

describe('exportFormatsDXF', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockKonvaLayer.getChildren.mockReturnValue([]);
    mockKonvaStage.getLayers.mockReturnValue([mockKonvaLayer]);
  });

  it('should export a stage to DXF with default options', async () => {
    const result = await exportStageToDXF(mockKonvaStage as any);
    expect(result.success).toBe(true);
    expect(result.dxf).toBeDefined();
    expect(result.blob).toBeInstanceOf(global.Blob);
    expect(result.dxf).toContain('SECTION\n2\nHEADER');
    expect(result.dxf).toContain('SECTION\n2\nTABLES');
    expect(result.dxf).toContain('SECTION\n2\nENTITIES');
    expect(result.dxf).toContain('0\nEOF');
  });

  it('should include a line entity in DXF', async () => {
    mockKonvaLayer.getChildren.mockReturnValue([
      { ...mockKonvaNode, className: 'Line', points: jest.fn(() => [0, 0, 100, 100]) },
    ]);
    const result = await exportStageToDXF(mockKonvaStage as any);
    expect(result.dxf).toContain('0\nLINE');
    expect(result.dxf).toContain('10\n0.000\n20\n0.000');
    expect(result.dxf).toContain('11\n100.000\n21\n100.000');
  });

  it('should include a rectangle entity in DXF', async () => {
    mockKonvaLayer.getChildren.mockReturnValue([
      { ...mockKonvaNode, className: 'Rect', x: jest.fn(() => 10), y: jest.fn(() => 20), width: jest.fn(() => 50), height: jest.fn(() => 30) },
    ]);
    const result = await exportStageToDXF(mockKonvaStage as any);
    expect(result.dxf).toContain('0\nPOLYLINE');
    expect(result.dxf).toContain('10\n10.000\n20\n20.000'); // Start point
    expect(result.dxf).toContain('10\n60.000\n20\n20.000'); // Top right
    expect(result.dxf).toContain('10\n60.000\n20\n50.000'); // Bottom right
    expect(result.dxf).toContain('10\n10.000\n20\n50.000'); // Bottom left
  });

  it('should include a circle entity in DXF', async () => {
    mockKonvaLayer.getChildren.mockReturnValue([
      { ...mockKonvaNode, className: 'Circle', x: jest.fn(() => 10), y: jest.fn(() => 20), radius: jest.fn(() => 30) },
    ]);
    const result = await exportStageToDXF(mockKonvaStage as any);
    expect(result.dxf).toContain('0\nCIRCLE');
    expect(result.dxf).toContain('10\n10.000\n20\n20.000');
    expect(result.dxf).toContain('40\n30.000');
  });

  it('should include a text entity in DXF', async () => {
    mockKonvaLayer.getChildren.mockReturnValue([
      { ...mockKonvaNode, className: 'Text', x: jest.fn(() => 10), y: jest.fn(() => 20), text: jest.fn(() => 'Hello'), fontSize: jest.fn(() => 15) },
    ]);
    const result = await exportStageToDXF(mockKonvaStage as any);
    expect(result.dxf).toContain('0\nTEXT');
    expect(result.dxf).toContain('10\n10.000\n20\n20.000');
    expect(result.dxf).toContain('40\n15.000');
    expect(result.dxf).toContain('1\nHello');
  });

  it('should export multiple views to DXF', async () => {
    const mockStages = {
      plan: mockKonvaStage as any,
      front: mockKonvaStage as any,
      back: null,
      left: mockKonvaStage as any,
      right: null,
    };
    const views = ['plan', 'front', 'left'] as any;
    const resultBlob = await exportMultiViewToDXF(mockStages, views);
    const resultDxf = await resultBlob.text();

    expect(resultBlob).toBeInstanceOf(global.Blob);
    expect(resultDxf).toContain('SECTION\n2\nHEADER');
    expect(resultDxf).toContain('SECTION\n2\nTABLES');
    expect(resultDxf).toContain('SECTION\n2\nENTITIES');
    expect(resultDxf).toContain('0\nEOF');

    // Check for view-specific layers and titles
    expect(resultDxf).toContain(`${DEFAULT_DXF_OPTIONS.layerPrefix}PLAN_WALLS`);
    expect(resultDxf).toContain(`${DEFAULT_DXF_OPTIONS.layerPrefix}FRONT_WALLS`);
    expect(resultDxf).toContain(`${DEFAULT_DXF_OPTIONS.layerPrefix}LEFT_WALLS`);
    expect(resultDxf).toContain('PLAN VIEW');
    expect(resultDxf).toContain('FRONT VIEW');
    expect(resultDxf).toContain('LEFT VIEW');
  });

  it('should generate DXF filename correctly', () => {
    const filename = generateDXFFilename('My House Plan');
    expect(filename).toMatch(/^my-house-plan-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}.dxf$/);
  });
});