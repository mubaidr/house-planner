import { exportStageToSVG, exportMultiViewToSVG, DEFAULT_SVG_OPTIONS, generateSVGFilename } from '@/utils/exportFormatsSVG';
import Konva from 'konva';

// Mock Blob for testing Blob.text()
const mockBlobText = jest.fn((content) => Promise.resolve(content));
const mockBlob = jest.fn(function (this: Blob, content, options) {
  return {
    text: () => mockBlobText(content[0]),
  };
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
  className: 'Shape',
  getChildren: jest.fn(() => []),
  stroke: jest.fn(() => '#000'),
  strokeWidth: jest.fn(() => 1),
  fill: jest.fn(() => 'none'),
  rotation: jest.fn(() => 0),
  scaleX: jest.fn(() => 1),
  scaleY: jest.fn(() => 1),
  fontFamily: jest.fn(() => 'Arial'),
  data: jest.fn(() => 'M0 0L10 10'),
};

const mockKonvaLayer = {
  getChildren: jest.fn(() => []),
};

const mockKonvaStage = {
  getLayers: jest.fn(() => [mockKonvaLayer]),
  getClientRect: jest.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
};

jest.mock('konva', () => ({
  Stage: jest.fn(() => mockKonvaStage),
  Layer: jest.fn(() => mockKonvaLayer),
  Line: jest.fn(() => ({ ...mockKonvaNode, className: 'Line' })),
  Rect: jest.fn(() => ({ ...mockKonvaNode, className: 'Rect' })),
  Circle: jest.fn(() => ({ ...mockKonvaNode, className: 'Circle' })),
  Text: jest.fn(() => ({ ...mockKonvaNode, className: 'Text' })),
  Path: jest.fn(() => ({ ...mockKonvaNode, className: 'Path' })),
  Group: jest.fn(() => ({ ...mockKonvaNode, className: 'Group' })),
}));

describe('exportFormatsSVG', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockKonvaLayer.getChildren.mockReturnValue([]);
    mockKonvaStage.getLayers.mockReturnValue([mockKonvaLayer]);
  });

  it('should export a stage to SVG with default options', async () => {
    const result = await exportStageToSVG(mockKonvaStage as any);
    expect(result.success).toBe(true);
    expect(result.svg).toBeDefined();
    expect(result.blob).toBeDefined();
    expect(result.svg).toContain('<svg');
    expect(result.svg).toContain('</svg>');
  });

  it('should include a line entity in SVG', async () => {
    mockKonvaLayer.getChildren.mockReturnValue([
      { ...mockKonvaNode, className: 'Line', points: jest.fn(() => [0, 0, 100, 100]) },
    ]);
    const result = await exportStageToSVG(mockKonvaStage as any);
    expect(result.svg).toContain('<path d="M 0 0 L 100 100"');
  });

  it('should include a rectangle entity in SVG', async () => {
    mockKonvaLayer.getChildren.mockReturnValue([
      { ...mockKonvaNode, className: 'Rect', x: jest.fn(() => 10), y: jest.fn(() => 20), width: jest.fn(() => 50), height: jest.fn(() => 30) },
    ]);
    const result = await exportStageToSVG(mockKonvaStage as any);
    expect(result.svg).toContain('<rect x="10" y="20" width="50" height="30"');
  });

  it('should include a circle entity in SVG', async () => {
    mockKonvaLayer.getChildren.mockReturnValue([
      { ...mockKonvaNode, className: 'Circle', x: jest.fn(() => 10), y: jest.fn(() => 20), radius: jest.fn(() => 30) },
    ]);
    const result = await exportStageToSVG(mockKonvaStage as any);
    expect(result.svg).toContain('<circle cx="10" cy="20" r="30"');
  });

  it('should include a text entity in SVG', async () => {
    mockKonvaLayer.getChildren.mockReturnValue([
      { ...mockKonvaNode, className: 'Text', x: jest.fn(() => 10), y: jest.fn(() => 20), text: jest.fn(() => 'Hello'), fontSize: jest.fn(() => 15) },
    ]);
    const result = await exportStageToSVG(mockKonvaStage as any);
    expect(result.svg).toContain('<text x="10" y="20" font-family="Arial" font-size="15" fill="#000">Hello</text>');
  });

  it('should include a path entity in SVG', async () => {
    mockKonvaLayer.getChildren.mockReturnValue([
      { ...mockKonvaNode, className: 'Path', data: jest.fn(() => 'M10 10L20 20') },
    ]);
    const result = await exportStageToSVG(mockKonvaStage as any);
    expect(result.svg).toContain('<path d="M10 10L20 20"');
  });

  it('should include a group entity in SVG', async () => {
    mockKonvaLayer.getChildren.mockReturnValue([
      { ...mockKonvaNode, className: 'Group', getChildren: jest.fn(() => [{ ...mockKonvaNode, className: 'Line', points: jest.fn(() => [0, 0, 10, 10]) }]) },
    ]);
    const result = await exportStageToSVG(mockKonvaStage as any);
    expect(result.svg).toContain('<g>');
    expect(result.svg).toContain('<path d="M 0 0 L 10 10"');
  });

  it('should export multiple views to SVG', async () => {
    const mockStages = {
      plan: mockKonvaStage as any,
      front: mockKonvaStage as any,
      back: null,
      left: mockKonvaStage as any,
      right: null,
    };
    const views = ['plan', 'front', 'left'] as any;
    const resultBlob = await exportMultiViewToSVG(mockStages, views);
    const resultSvg = await resultBlob.text();

    expect(resultBlob).toBeDefined();
    expect(resultSvg).toContain('<svg');
    expect(resultSvg).toContain('PLAN VIEW');
    expect(resultSvg).toContain('FRONT VIEW');
    expect(resultSvg).toContain('LEFT VIEW');
  });

  it('should generate SVG filename correctly', () => {
    const filename = generateSVGFilename('My House Plan');
    expect(filename).toMatch(/^my-house-plan-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.svg$/);
  });
});