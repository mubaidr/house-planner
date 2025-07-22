import {
  generateExportPreview,
  exportPNG,
  exportPDF,
  generateDrawingSheetLayout,
  exportToSVG,
  createDrawingSheet,
} from '@/utils/exportUtils2D';
import { Element2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';

// Mock dependencies
jest.mock('konva/lib/Node');
jest.mock('jspdf');
jest.mock('file-saver');

// Mock stage for export functions
const mockStage = {
  toDataURL: jest.fn(() => 'data:image/png;base64,mock-data'),
  toCanvas: jest.fn(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    return canvas;
  }),
  width: jest.fn(() => 800),
  height: jest.fn(() => 600),
};

// Mock the stage registry
jest.mock('@/utils/exportUtils2D', () => {
  const actual = jest.requireActual('@/utils/exportUtils2D');
  return {
    ...actual,
    getStage: jest.fn(() => mockStage),
    registerStage: jest.fn(),
    clearStageRegistry: jest.fn(),
  };
});

describe('Export Utils 2D', () => {
  const mockElements: Element2D[] = [
    {
      id: 'wall-1',
      type: 'wall2d',
      transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      dimensions: { width: 100, height: 6 },
      floorId: 'floor-1',
      visible: true,
      locked: false,
    },
    {
      id: 'door-1',
      type: 'door2d',
      transform: { x: 50, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      dimensions: { width: 36, height: 80 },
      floorId: 'floor-1',
      visible: true,
      locked: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock canvas and context
    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: jest.fn(() => ({
        fillStyle: '',
        fillRect: jest.fn(),
        strokeStyle: '',
        strokeRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        clearRect: jest.fn(),
        drawImage: jest.fn(),
        toDataURL: jest.fn(() => 'data:image/png;base64,mock-data'),
      })),
      toDataURL: jest.fn(() => 'data:image/png;base64,mock-data'),
      style: {},
    };

    global.document.createElement = jest.fn(() => mockCanvas as any);
    global.window.devicePixelRatio = 2;
  });

  describe('generateExportPreview', () => {
    it('should generate preview with correct dimensions', async () => {
      const preview = await generateExportPreview(mockElements, 'plan', {
        width: 400,
        height: 300,
        scale: 1,
        quality: 0.8,
      });

      expect(preview).toEqual({
        dataUrl: 'data:image/png;base64,mock-data',
        width: 400,
        height: 300,
        viewports: expect.any(Array),
        scale: expect.any(Number),
        bounds: expect.any(Object),
      });
    });

    it('should handle empty elements array', async () => {
      const preview = await generateExportPreview([], 'plan');

      expect(preview.dataUrl).toBe('data:image/png;base64,mock-data');
      expect(preview.width).toBe(400); // Default width
      expect(preview.height).toBe(300); // Default height
    });

    it('should calculate correct scale for fitting elements', async () => {
      const largeElements: Element2D[] = [
        {
          id: 'wall-large',
          type: 'wall2d',
          transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
          dimensions: { width: 1000, height: 6 },
          floorId: 'floor-1',
          visible: true,
          locked: false,
        },
      ];

      const preview = await generateExportPreview(largeElements, 'plan', {
        width: 400,
        height: 300,
      });

      expect(preview.scale).toBeLessThanOrEqual(1); // Should scale down to fit or be 1
    });

    it('should filter elements by view type', async () => {
      const elementsWithRoof: Element2D[] = [
        ...mockElements,
        {
          id: 'roof-1',
          type: 'roof2d',
          transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
          dimensions: { width: 120, height: 100 },
          floorId: 'floor-1',
          visible: true,
          locked: false,
        },
      ];

      const planPreview = await generateExportPreview(elementsWithRoof, 'plan');
      const frontPreview = await generateExportPreview(elementsWithRoof, 'front');

      // Different views should show different elements
      expect(planPreview.viewports).toBeDefined();
      expect(frontPreview.viewports).toBeDefined();
    });

    it('should handle high DPI displays', async () => {
      global.window.devicePixelRatio = 3;

      const preview = await generateExportPreview(mockElements, 'plan');

      expect(preview.dataUrl).toBe('data:image/png;base64,mock-data');
      // Canvas should be scaled for high DPI
    });
  });

  describe('exportToPNG', () => {
    it('should export elements to PNG format', async () => {
      const mockSaveAs = jest.fn();
      require('file-saver').saveAs = mockSaveAs;

      await exportPNG('plan', {
        filename: 'test-export',
        width: 1920,
        height: 1080,
        quality: 0.9,
      });

      expect(mockSaveAs).toHaveBeenCalledWith(
        expect.any(Object),
        'test-export-plan.png'
      );
    });

    it('should handle export errors gracefully', async () => {
      const mockSaveAs = jest.fn(() => {
        throw new Error('Export failed');
      });
      require('file-saver').saveAs = mockSaveAs;

      await expect(
        exportPNG('plan', { filename: 'test' })
      ).rejects.toThrow('Export failed');
    });

    it('should use default filename if not provided', async () => {
      const mockSaveAs = jest.fn();
      require('file-saver').saveAs = mockSaveAs;

      await exportPNG('plan');

      expect(mockSaveAs).toHaveBeenCalledWith(
        expect.any(Object),
        'house-plan-plan.png'
      );
    });
  });

  describe('exportToPDF', () => {
    it('should export elements to PDF format', async () => {
      const mockJsPDF = {
        addImage: jest.fn(),
        save: jest.fn(),
        internal: {
          pageSize: { width: 210, height: 297 },
        },
      };
      require('jspdf').jsPDF = jest.fn(() => mockJsPDF);

      await exportPDF('plan', {
        filename: 'test-export',
        paperSize: 'A4',
        orientation: 'landscape',
      });

      expect(mockJsPDF.save).toHaveBeenCalledWith('test-export.pdf');
      expect(mockJsPDF.addImage).toHaveBeenCalled();
    });

    it('should handle multiple views in PDF', async () => {
      const mockJsPDF = {
        addImage: jest.fn(),
        addPage: jest.fn(),
        save: jest.fn(),
        internal: {
          pageSize: { width: 210, height: 297 },
        },
      };
      require('jspdf').jsPDF = jest.fn(() => mockJsPDF);

      await exportPDF('plan');

      expect(mockJsPDF.addPage).toHaveBeenCalledTimes(3); // 4 views - 1 (first page)
      expect(mockJsPDF.addImage).toHaveBeenCalledTimes(4);
    });

    it('should include title block when specified', async () => {
      const mockJsPDF = {
        addImage: jest.fn(),
        text: jest.fn(),
        setFontSize: jest.fn(),
        save: jest.fn(),
        internal: {
          pageSize: { width: 210, height: 297 },
        },
      };
      require('jspdf').jsPDF = jest.fn(() => mockJsPDF);

      await exportPDF('plan', {
        addTitleBlock: true,
        title: 'Test Project',
        filename: 'A-001',
      });

      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('Test Project'),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('exportToSVG', () => {
    it('should export elements to SVG format', async () => {
      const mockSaveAs = jest.fn();
      require('file-saver').saveAs = mockSaveAs;

      await exportToSVG(mockElements, 'plan', {
        filename: 'test-export',
        width: 800,
        height: 600,
      });

      expect(mockSaveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'test-export.svg'
      );

      // Check that SVG content was generated
      const blobCall = mockSaveAs.mock.calls[0][0];
      expect(blobCall.type).toBe('image/svg+xml');
    });

    it('should generate valid SVG markup', async () => {
      const mockSaveAs = jest.fn();
      require('file-saver').saveAs = mockSaveAs;

      await exportToSVG(mockElements, 'plan');

      const blobCall = mockSaveAs.mock.calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
    });

    it('should handle view transformations in SVG', async () => {
      const mockSaveAs = jest.fn();
      require('file-saver').saveAs = mockSaveAs;

      await exportToSVG(mockElements, 'front');

      expect(mockSaveAs).toHaveBeenCalled();
    });
  });

  describe('createDrawingSheet', () => {
    it('should create drawing sheet with title block', () => {
      const sheet = createDrawingSheet({
        elements: mockElements,
        views: ['plan'],
        paperSize: 'A4',
        orientation: 'landscape',
        projectName: 'Test Project',
        drawingNumber: 'A-001',
        scale: '1:100',
        date: '2024-12-01',
      });

      expect(sheet).toEqual({
        paperSize: 'A4',
        orientation: 'landscape',
        titleBlock: {
          projectName: 'Test Project',
          drawingNumber: 'A-001',
          scale: '1:100',
          date: '2024-12-01',
        },
        viewports: expect.any(Array),
        elements: mockElements,
      });
    });

    it('should calculate viewport layout for multiple views', () => {
      const sheet = createDrawingSheet({
        elements: mockElements,
        views: ['plan', 'front', 'left', 'right'],
        paperSize: 'A3',
        orientation: 'landscape',
      });

      expect(sheet.viewports).toHaveLength(4);
      expect(sheet.viewports[0]).toEqual({
        view: 'plan',
        x: expect.any(Number),
        y: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number),
        scale: expect.any(Number),
      });
    });

    it('should handle different paper sizes', () => {
      const a4Sheet = createDrawingSheet({
        elements: mockElements,
        views: ['plan'],
        paperSize: 'A4',
      });

      const a3Sheet = createDrawingSheet({
        elements: mockElements,
        views: ['plan'],
        paperSize: 'A3',
      });

      expect(a3Sheet.viewports[0].width).toBeGreaterThan(a4Sheet.viewports[0].width);
    });
  });

  describe('Error Handling', () => {
    it('should handle canvas creation failure', async () => {
      global.document.createElement = jest.fn(() => null);

      await expect(
        generateExportPreview(mockElements, 'plan')
      ).rejects.toThrow('Failed to create canvas for export preview');
    });

    it('should handle context creation failure', async () => {
      const mockCanvas = {
        getContext: jest.fn(() => null),
      };
      global.document.createElement = jest.fn(() => mockCanvas as any);

      await expect(
        generateExportPreview(mockElements, 'plan')
      ).rejects.toThrow('Failed to get canvas context for preview');
    });

    it('should handle invalid view types', async () => {
      await expect(
        generateExportPreview(mockElements, 'invalid' as ViewType2D)
      ).rejects.toThrow('Invalid view type: invalid');
    });

    it('should handle empty elements gracefully', async () => {
      const preview = await generateExportPreview([], 'plan');

      expect(preview.dataUrl).toBeDefined();
      expect(preview.bounds).toEqual({
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        width: 0,
        height: 0,
      });
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of elements efficiently', async () => {
      const manyElements: Element2D[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `element-${i}`,
        type: 'wall2d',
        transform: { x: i * 10, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        dimensions: { width: 10, height: 6 },
        floorId: 'floor-1',
        visible: true,
        locked: false,
      }));

      const startTime = Date.now();
      const preview = await generateExportPreview(manyElements, 'plan');
      const endTime = Date.now();

      expect(preview.dataUrl).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should optimize rendering for high-resolution exports', async () => {
      const preview = await generateExportPreview(mockElements, 'plan', {
        width: 4000,
        height: 3000,
        quality: 1.0,
      });

      expect(preview.width).toBe(4000);
      expect(preview.height).toBe(3000);
      expect(preview.dataUrl).toBeDefined();
    });
  });
});