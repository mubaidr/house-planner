import {
  exportToFile,
  downloadFile,
  generateFileName,
  validateExportData,
  ExportOptions,
  ExportResult
} from '@/utils/exportUtils';

// Mock Konva Stage
const mockStage = {
  toDataURL: jest.fn(() => 'data:image/png;base64,mockImageData'),
  toCanvas: jest.fn(() => ({
    toBlob: jest.fn((callback) => callback(new Blob(['mock'], { type: 'image/png' })))
  })),
  width: jest.fn(() => 800),
  height: jest.fn(() => 600),
  getChildren: jest.fn(() => []),
  findOne: jest.fn()
};

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement and click
const mockAnchor = {
  href: '',
  download: '',
  click: jest.fn(),
  style: { display: '' }
};

Object.defineProperty(document, 'createElement', {
  writable: true,
  value: jest.fn(() => mockAnchor)
});

Object.defineProperty(document.body, 'appendChild', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(document.body, 'removeChild', {
  writable: true,
  value: jest.fn()
});

describe('exportUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportToFile', () => {
    const mockOptions: ExportOptions = {
      format: 'PNG',
      quality: 0.8,
      scale: 1,
      fileName: 'test-export'
    };

    it('should export stage to PNG file', async () => {
      const result = await exportToFile(mockStage as any, mockOptions);
      
      expect(result.success).toBe(true);
      expect(result.fileName).toContain('test-export');
      expect(result.fileName).toContain('.png');
      expect(mockStage.toDataURL).toHaveBeenCalledWith({
        mimeType: 'image/png',
        quality: 0.8,
        pixelRatio: 1
      });
    });

    it('should export stage to JPEG file', async () => {
      const jpegOptions = { ...mockOptions, format: 'JPEG' as const };
      const result = await exportToFile(mockStage as any, jpegOptions);
      
      expect(result.success).toBe(true);
      expect(result.fileName).toContain('.jpg');
      expect(mockStage.toDataURL).toHaveBeenCalledWith({
        mimeType: 'image/jpeg',
        quality: 0.8,
        pixelRatio: 1
      });
    });

    it('should handle export errors', async () => {
      mockStage.toDataURL.mockImplementationOnce(() => {
        throw new Error('Export failed');
      });

      const result = await exportToFile(mockStage as any, mockOptions);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Export failed');
    });

    it('should use default options when not provided', async () => {
      await exportToFile(mockStage as any, { format: 'PNG' });
      
      expect(mockStage.toDataURL).toHaveBeenCalledWith({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 1
      });
    });
  });

  describe('downloadFile', () => {
    it('should download a file with correct attributes', () => {
      const blob = new Blob(['test content'], { type: 'text/plain' });
      downloadFile(blob, 'test-file.txt');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(mockAnchor.download).toBe('test-file.txt');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
    });

    it('should clean up object URL after download', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      downloadFile(blob, 'test.txt');

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
  });

  describe('generateFileName', () => {
    it('should generate filename with timestamp when no name provided', () => {
      const fileName = generateFileName();
      
      expect(fileName).toMatch(/^floor-plan-\d{4}-\d{2}-\d{2}-\d{6}$/);
    });

    it('should use provided base name', () => {
      const fileName = generateFileName('my-design');
      
      expect(fileName).toMatch(/^my-design-\d{4}-\d{2}-\d{2}-\d{6}$/);
    });

    it('should sanitize invalid characters', () => {
      const fileName = generateFileName('my/design\\with:invalid*chars');
      
      expect(fileName).not.toContain('/');
      expect(fileName).not.toContain('\\');
      expect(fileName).not.toContain(':');
      expect(fileName).not.toContain('*');
      expect(fileName).toMatch(/^my-design-with-invalid-chars-\d{4}-\d{2}-\d{2}-\d{6}$/);
    });

    it('should handle empty string', () => {
      const fileName = generateFileName('');
      
      expect(fileName).toMatch(/^floor-plan-\d{4}-\d{2}-\d{2}-\d{6}$/);
    });
  });

  describe('validateExportData', () => {
    const validStage = {
      width: () => 800,
      height: () => 600,
      getChildren: () => [{ children: [] }]
    };

    it('should validate correct export data', () => {
      const options: ExportOptions = {
        format: 'PNG',
        quality: 0.8,
        scale: 1
      };

      const result = validateExportData(validStage as any, options);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid stage', () => {
      const result = validateExportData(null as any, { format: 'PNG' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Stage is required');
    });

    it('should detect invalid format', () => {
      const result = validateExportData(validStage as any, { format: 'INVALID' as any });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid export format');
    });

    it('should detect invalid quality range', () => {
      const result = validateExportData(validStage as any, { 
        format: 'PNG', 
        quality: 1.5 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Quality must be between 0 and 1');
    });

    it('should detect invalid scale', () => {
      const result = validateExportData(validStage as any, { 
        format: 'PNG', 
        scale: -1 
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Scale must be greater than 0');
    });

    it('should detect empty stage', () => {
      const emptyStage = {
        width: () => 0,
        height: () => 0,
        getChildren: () => []
      };

      const result = validateExportData(emptyStage as any, { format: 'PNG' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Stage has no content to export');
    });
  });

  describe('ExportResult interface', () => {
    it('should have correct structure for successful export', async () => {
      const result = await exportToFile(mockStage as any, { format: 'PNG' });
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('fileName');
      expect(result.success).toBe(true);
      expect(typeof result.fileName).toBe('string');
    });

    it('should have correct structure for failed export', async () => {
      mockStage.toDataURL.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const result = await exportToFile(mockStage as any, { format: 'PNG' });
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result.success).toBe(false);
      expect(typeof result.error).toBe('string');
    });
  });

  describe('error handling', () => {
    it('should handle stage.toDataURL throwing error', async () => {
      mockStage.toDataURL.mockImplementationOnce(() => {
        throw new Error('Canvas error');
      });

      const result = await exportToFile(mockStage as any, { format: 'PNG' });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Canvas error');
    });

    it('should handle blob creation failure', async () => {
      mockStage.toCanvas.mockImplementationOnce(() => ({
        toBlob: jest.fn((callback) => callback(null))
      }));

      const result = await exportToFile(mockStage as any, { format: 'PNG' });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create blob');
    });
  });
});