import {
  generatePDFTemplate,
  generateDXFTemplate,
  generateSVGTemplate,
  generateJSONTemplate,
  ExportTemplate,
  ExportFormat
} from '@/utils/exportTemplates';

// Mock the dependencies
jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => ({
    walls: [],
    doors: [],
    windows: [],
    rooms: [],
    annotations: [],
    currentFloor: 1
  })
}));

jest.mock('@/stores/unitStore', () => ({
  useUnitStore: () => ({
    unit: 'ft',
    precision: 2
  })
}));

describe('exportTemplates', () => {
  const mockDesignData = {
    walls: [
      {
        id: 'wall1',
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        thickness: 6,
        height: 96,
        material: 'drywall'
      }
    ],
    doors: [
      {
        id: 'door1',
        x: 50,
        y: 0,
        width: 36,
        height: 80,
        wallId: 'wall1',
        wallAngle: 0
      }
    ],
    windows: [
      {
        id: 'window1',
        x: 25,
        y: 0,
        width: 24,
        height: 36,
        wallId: 'wall1',
        wallAngle: 0
      }
    ],
    rooms: [
      {
        id: 'room1',
        name: 'Living Room',
        area: 200,
        perimeter: 60
      }
    ],
    annotations: [
      {
        id: 'annotation1',
        type: 'dimension',
        text: '10 ft',
        x: 50,
        y: 10
      }
    ]
  };

  describe('generatePDFTemplate', () => {
    it('should generate a valid PDF template', () => {
      const template = generatePDFTemplate(mockDesignData);
      
      expect(template).toBeDefined();
      expect(template.content).toBeDefined();
      expect(template.pageSize).toBe('A4');
      expect(template.pageOrientation).toBe('landscape');
      expect(template.info.title).toBe('Floor Plan');
    });

    it('should include all design elements in PDF template', () => {
      const template = generatePDFTemplate(mockDesignData);
      const content = JSON.stringify(template.content);
      
      expect(content).toContain('Living Room');
      expect(content).toContain('Walls');
      expect(content).toContain('Doors');
      expect(content).toContain('Windows');
    });

    it('should handle empty design data', () => {
      const emptyData = {
        walls: [],
        doors: [],
        windows: [],
        rooms: [],
        annotations: []
      };
      
      const template = generatePDFTemplate(emptyData);
      expect(template).toBeDefined();
      expect(template.content).toBeDefined();
    });
  });

  describe('generateDXFTemplate', () => {
    it('should generate a valid DXF template', () => {
      const template = generateDXFTemplate(mockDesignData);
      
      expect(template).toBeDefined();
      expect(typeof template).toBe('string');
      expect(template).toContain('SECTION');
      expect(template).toContain('ENTITIES');
      expect(template).toContain('EOF');
    });

    it('should include wall entities in DXF', () => {
      const template = generateDXFTemplate(mockDesignData);
      
      expect(template).toContain('LINE');
      expect(template).toContain('0\n0\n'); // Start coordinates
      expect(template).toContain('100\n0\n'); // End coordinates
    });

    it('should handle empty walls array', () => {
      const emptyData = {
        walls: [],
        doors: [],
        windows: [],
        rooms: [],
        annotations: []
      };
      
      const template = generateDXFTemplate(emptyData);
      expect(template).toContain('SECTION');
      expect(template).toContain('EOF');
    });
  });

  describe('generateSVGTemplate', () => {
    it('should generate a valid SVG template', () => {
      const template = generateSVGTemplate(mockDesignData);
      
      expect(template).toBeDefined();
      expect(typeof template).toBe('string');
      expect(template).toContain('<svg');
      expect(template).toContain('</svg>');
      expect(template).toContain('xmlns="http://www.w3.org/2000/svg"');
    });

    it('should include wall elements in SVG', () => {
      const template = generateSVGTemplate(mockDesignData);
      
      expect(template).toContain('<line');
      expect(template).toContain('x1="0"');
      expect(template).toContain('y1="0"');
      expect(template).toContain('x2="100"');
      expect(template).toContain('y2="0"');
    });

    it('should include door and window elements', () => {
      const template = generateSVGTemplate(mockDesignData);
      
      expect(template).toContain('<rect'); // For doors and windows
    });

    it('should have proper viewport dimensions', () => {
      const template = generateSVGTemplate(mockDesignData);
      
      expect(template).toContain('viewBox=');
      expect(template).toContain('width=');
      expect(template).toContain('height=');
    });
  });

  describe('generateJSONTemplate', () => {
    it('should generate a valid JSON template', () => {
      const template = generateJSONTemplate(mockDesignData);
      
      expect(template).toBeDefined();
      expect(typeof template).toBe('string');
      
      const parsed = JSON.parse(template);
      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('data');
    });

    it('should preserve all design data in JSON', () => {
      const template = generateJSONTemplate(mockDesignData);
      const parsed = JSON.parse(template);
      
      expect(parsed.data.walls).toHaveLength(1);
      expect(parsed.data.doors).toHaveLength(1);
      expect(parsed.data.windows).toHaveLength(1);
      expect(parsed.data.rooms).toHaveLength(1);
      expect(parsed.data.annotations).toHaveLength(1);
    });

    it('should include metadata', () => {
      const template = generateJSONTemplate(mockDesignData);
      const parsed = JSON.parse(template);
      
      expect(parsed.version).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.application).toBe('House Planner');
    });
  });

  describe('ExportTemplate interface', () => {
    it('should have correct structure for PDF template', () => {
      const template = generatePDFTemplate(mockDesignData) as ExportTemplate;
      
      expect(template).toHaveProperty('content');
      expect(template).toHaveProperty('pageSize');
      expect(template).toHaveProperty('pageOrientation');
      expect(template).toHaveProperty('info');
    });
  });

  describe('ExportFormat enum usage', () => {
    it('should handle different export formats', () => {
      const formats: ExportFormat[] = ['PDF', 'DXF', 'SVG', 'JSON'];
      
      formats.forEach(format => {
        switch (format) {
          case 'PDF':
            expect(() => generatePDFTemplate(mockDesignData)).not.toThrow();
            break;
          case 'DXF':
            expect(() => generateDXFTemplate(mockDesignData)).not.toThrow();
            break;
          case 'SVG':
            expect(() => generateSVGTemplate(mockDesignData)).not.toThrow();
            break;
          case 'JSON':
            expect(() => generateJSONTemplate(mockDesignData)).not.toThrow();
            break;
        }
      });
    });
  });
});