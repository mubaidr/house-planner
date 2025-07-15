/**
 * Unit tests for exportUtils2D.ts core functions
 * 
 * These tests cover the three main functions:
 * - captureView
 * - exportPNG
 * - exportPDF
 */

import { Stage } from 'konva/lib/Stage';
import { 
  captureView, 
  exportPNG, 
  exportPDF, 
  registerStage, 
  getStage,
  clearStageRegistry,
  ViewType,
  PNGExportOptions,
  PDFExportOptions,
  DEFAULT_PNG_OPTIONS,
  DEFAULT_PDF_OPTIONS
} from '../src/utils/exportUtils2D';

// Mock Konva Stage
const mockStage = {
  toCanvas: jest.fn(),
  toDataURL: jest.fn(),
  width: jest.fn(),
  height: jest.fn(),
} as unknown as Stage;

// Mock DOM elements
const mockCanvas = {
  width: 800,
  height: 600,
  toDataURL: jest.fn(),
} as unknown as HTMLCanvasElement;

const mockLink = {
  href: '',
  download: '',
  click: jest.fn(),
} as unknown as HTMLAnchorElement;

// Mock jsPDF
const mockPDF = {
  addImage: jest.fn(),
  rect: jest.fn(),
  setDrawColor: jest.fn(),
  setLineWidth: jest.fn(),
  save: jest.fn(),
  setFontSize: jest.fn(),
  setFont: jest.fn(),
  text: jest.fn(),
  output: jest.fn(),
} as any;

// Mock modules
jest.mock('konva/lib/Stage');
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn(() => mockPDF),
}));

// Mock DOM methods
Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName: string) => {
    if (tagName === 'a') {
      return mockLink;
    }
    return mockCanvas;
  }),
  writable: true,
});

Object.defineProperty(document, 'body', {
  value: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
  writable: true,
});

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'mock-url'),
  writable: true,
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn(),
  writable: true,
});

describe('exportUtils2D Core Functions', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Clear stage registry
    clearStageRegistry();
    
    // Setup default mock behaviors
    mockStage.toCanvas.mockReturnValue(mockCanvas);
    mockStage.toDataURL.mockReturnValue('data:image/png;base64,mockdata');
    mockStage.width.mockReturnValue(800);
    mockStage.height.mockReturnValue(600);
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mockdata');
    mockPDF.output.mockReturnValue('mock-blob');
    
    // Reset DOM mocks
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return mockCanvas;
    });
  });

  describe('Stage Registry Functions', () => {
    it('should register and retrieve stages correctly', () => {
      const viewType: ViewType = 'plan';
      
      // Register a stage
      registerStage(viewType, mockStage);
      
      // Retrieve the stage
      const retrievedStage = getStage(viewType);
      
      expect(retrievedStage).toBe(mockStage);
    });

    it('should return undefined for unregistered view types', () => {
      const viewType: ViewType = 'front';
      
      const retrievedStage = getStage(viewType);
      
      expect(retrievedStage).toBeUndefined();
    });
  });

  describe('captureView', () => {
    it('should capture a view and return canvas when stage is registered', async () => {
      const viewType: ViewType = 'plan';
      registerStage(viewType, mockStage);
      
      const result = await captureView(viewType);
      
      expect(mockStage.toCanvas).toHaveBeenCalledWith({
        pixelRatio: 2,
        quality: 1.0,
      });
      expect(result).toBe(mockCanvas);
    });

    it('should throw error when stage is not registered', async () => {
      const viewType: ViewType = 'plan';
      
      await expect(captureView(viewType)).rejects.toThrow(
        'No stage registered for view type: plan'
      );
    });

    it('should throw error when stage.toCanvas fails', async () => {
      const viewType: ViewType = 'plan';
      registerStage(viewType, mockStage);
      
      mockStage.toCanvas.mockImplementation(() => {
        throw new Error('Canvas creation failed');
      });
      
      await expect(captureView(viewType)).rejects.toThrow(
        'Failed to capture view "plan": Error: Canvas creation failed'
      );
    });
  });

  describe('exportPNG', () => {
    it('should export PNG with default options', async () => {
      const viewType: ViewType = 'plan';
      registerStage(viewType, mockStage);
      
      await exportPNG(viewType);
      
      expect(mockStage.toDataURL).toHaveBeenCalledWith({
        mimeType: DEFAULT_PNG_OPTIONS.mimeType,
        quality: DEFAULT_PNG_OPTIONS.quality,
        pixelRatio: DEFAULT_PNG_OPTIONS.pixelRatio,
        width: undefined,
        height: undefined,
      });
      
      expect(mockLink.download).toBe('house-plan-plan.png');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should export PNG with custom options', async () => {
      const viewType: ViewType = 'front';
      const options: PNGExportOptions = {
        filename: 'custom-plan',
        quality: 0.8,
        pixelRatio: 1,
        width: 1200,
        height: 800,
      };
      
      registerStage(viewType, mockStage);
      
      await exportPNG(viewType, options);
      
      expect(mockStage.toDataURL).toHaveBeenCalledWith({
        mimeType: 'image/png',
        quality: 0.8,
        pixelRatio: 1,
        width: 1200,
        height: 800,
      });
      
      expect(mockLink.download).toBe('custom-plan-front.png');
    });

    it('should throw error when stage is not registered', async () => {
      const viewType: ViewType = 'plan';
      
      await expect(exportPNG(viewType)).rejects.toThrow(
        'No stage registered for view type: plan'
      );
    });

    it('should throw error when toDataURL fails', async () => {
      const viewType: ViewType = 'plan';
      registerStage(viewType, mockStage);
      
      mockStage.toDataURL.mockImplementation(() => {
        throw new Error('Data URL creation failed');
      });
      
      await expect(exportPNG(viewType)).rejects.toThrow(
        'Failed to export PNG for view "plan": Error: Data URL creation failed'
      );
    });
  });

  describe('exportPDF', () => {
    it('should export PDF with default options', async () => {
      const viewType: ViewType = 'plan';
      registerStage(viewType, mockStage);
      
      await exportPDF(viewType);
      
      expect(mockStage.toDataURL).toHaveBeenCalledWith({
        mimeType: 'image/png',
        quality: DEFAULT_PDF_OPTIONS.quality,
        pixelRatio: DEFAULT_PDF_OPTIONS.pixelRatio,
      });
      
      expect(mockPDF.addImage).toHaveBeenCalled();
      expect(mockPDF.rect).toHaveBeenCalled();
      expect(mockPDF.save).toHaveBeenCalledWith('house-plan-plan.pdf');
    });

    it('should export PDF with custom options', async () => {
      const viewType: ViewType = 'front';
      const options: PDFExportOptions = {
        filename: 'custom-plan',
        paperSize: 'A3',
        orientation: 'portrait',
        title: 'Custom House Plan',
        addTitleBlock: true,
        scale: 0.8,
      };
      
      registerStage(viewType, mockStage);
      
      await exportPDF(viewType, options);
      
      expect(mockStage.toDataURL).toHaveBeenCalledWith({
        mimeType: 'image/png',
        quality: 1.0,
        pixelRatio: 2,
      });
      
      expect(mockPDF.addImage).toHaveBeenCalled();
      expect(mockPDF.save).toHaveBeenCalledWith('custom-plan-front.pdf');
    });

    it('should handle portrait orientation correctly', async () => {
      const viewType: ViewType = 'plan';
      const options: PDFExportOptions = {
        orientation: 'portrait',
        paperSize: 'A4',
      };
      
      registerStage(viewType, mockStage);
      
      await exportPDF(viewType, options);
      
      // A4 portrait should be 595x842
      expect(mockPDF.addImage).toHaveBeenCalled();
      expect(mockPDF.save).toHaveBeenCalledWith('house-plan-plan.pdf');
    });

    it('should handle landscape orientation correctly', async () => {
      const viewType: ViewType = 'plan';
      const options: PDFExportOptions = {
        orientation: 'landscape',
        paperSize: 'A4',
      };
      
      registerStage(viewType, mockStage);
      
      await exportPDF(viewType, options);
      
      // A4 landscape should be 842x595
      expect(mockPDF.addImage).toHaveBeenCalled();
      expect(mockPDF.save).toHaveBeenCalledWith('house-plan-plan.pdf');
    });

    it('should add title block when enabled', async () => {
      const viewType: ViewType = 'plan';
      const options: PDFExportOptions = {
        addTitleBlock: true,
        title: 'Test Title',
        description: 'Test Description',
      };
      
      registerStage(viewType, mockStage);
      
      await exportPDF(viewType, options);
      
      // Should have called text methods for title block
      expect(mockPDF.text).toHaveBeenCalledWith('Test Title', expect.any(Number), expect.any(Number));
      expect(mockPDF.text).toHaveBeenCalledWith('Test Description', expect.any(Number), expect.any(Number));
    });

    it('should throw error when stage is not registered', async () => {
      const viewType: ViewType = 'plan';
      
      await expect(exportPDF(viewType)).rejects.toThrow(
        'No stage registered for view type: plan'
      );
    });

    it('should throw error when PDF creation fails', async () => {
      const viewType: ViewType = 'plan';
      registerStage(viewType, mockStage);
      
      mockStage.toDataURL.mockImplementation(() => {
        throw new Error('PDF creation failed');
      });
      
      await expect(exportPDF(viewType)).rejects.toThrow(
        'Failed to export PDF for view "plan": Error: PDF creation failed'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle stage dimension errors gracefully', async () => {
      const viewType: ViewType = 'plan';
      registerStage(viewType, mockStage);
      
      mockStage.width.mockImplementation(() => {
        throw new Error('Width access failed');
      });
      
      await expect(exportPDF(viewType)).rejects.toThrow(
        'Failed to export PDF for view "plan"'
      );
    });

    it('should handle DOM manipulation errors gracefully', async () => {
      const viewType: ViewType = 'plan';
      registerStage(viewType, mockStage);
      
      // Mock document.createElement to throw error
      jest.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('DOM error');
      });
      
      await expect(exportPNG(viewType)).rejects.toThrow(
        'Failed to export PNG for view "plan"'
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple view types correctly', async () => {
      const viewTypes: ViewType[] = ['plan', 'front', 'back', 'left', 'right'];
      
      // Register all view types
      viewTypes.forEach(viewType => {
        registerStage(viewType, mockStage);
      });
      
      // Export PNG for each view type
      for (const viewType of viewTypes) {
        await exportPNG(viewType, { filename: `test-${viewType}` });
        expect(mockLink.download).toBe(`test-${viewType}-${viewType}.png`);
      }
    });

    it('should handle rapid successive exports', async () => {
      const viewType: ViewType = 'plan';
      registerStage(viewType, mockStage);
      
      // Perform multiple exports rapidly
      const promises = Array(5).fill(null).map((_, i) => 
        exportPNG(viewType, { filename: `rapid-${i}` })
      );
      
      await Promise.all(promises);
      
      expect(mockStage.toDataURL).toHaveBeenCalledTimes(5);
      expect(mockLink.click).toHaveBeenCalledTimes(5);
    });
  });
});
