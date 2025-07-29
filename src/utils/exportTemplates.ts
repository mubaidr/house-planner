/**
 * Template-Based Export System
 *
 * Provides predefined professional layouts and templates for
 * architectural drawing exports with industry-standard formatting
 */

import { ViewType2D } from '@/types/views';
import { MultiViewExportOptions } from './exportUtils2D';

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'technical' | 'presentation';
  paperSize: 'A4' | 'A3' | 'A2' | 'A1' | 'Letter' | 'Legal' | 'Tabloid';
  orientation: 'portrait' | 'landscape';
  views: ViewType2D[];
  layout: TemplateLayout;
  titleBlock: TemplateTitleBlock;
  options: Partial<MultiViewExportOptions>;
  preview?: string; // Base64 preview image
}

export interface TemplateLayout {
  type: 'grid' | 'sequential' | 'custom';
  viewports: TemplateViewport[];
  spacing: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface TemplateViewport {
  viewType: ViewType2D;
  x: number; // Percentage of available width
  y: number; // Percentage of available height
  width: number; // Percentage of available width
  height: number; // Percentage of available height
  scale: number;
  showTitle: boolean;
  titlePosition: 'top' | 'bottom' | 'left' | 'right';
  border: boolean;
  borderStyle: 'solid' | 'dashed' | 'dotted';
}

export interface TemplateTitleBlock {
  enabled: boolean;
  position: 'bottom' | 'right' | 'top';
  width: number; // Points
  height: number; // Points
  fields: TitleBlockField[];
  logo?: {
    enabled: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    width: number;
    height: number;
  };
}

export interface TitleBlockField {
  id: string;
  label: string;
  value: string;
  x: number; // Percentage of title block width
  y: number; // Percentage of title block height
  width: number; // Percentage of title block width
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  alignment: 'left' | 'center' | 'right';
  editable: boolean;
}

/**
 * Predefined export templates
 */
export const EXPORT_TEMPLATES: ExportTemplate[] = [
  // Residential Templates
  {
    id: 'residential-basic',
    name: 'Residential Basic',
    description: 'Simple layout for residential floor plans with plan view and front elevation',
    category: 'residential',
    paperSize: 'A3',
    orientation: 'landscape',
    views: ['plan', 'front'],
    layout: {
      type: 'custom',
      viewports: [
        {
          viewType: 'plan',
          x: 5,
          y: 15,
          width: 60,
          height: 70,
          scale: 1,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
        {
          viewType: 'front',
          x: 70,
          y: 15,
          width: 25,
          height: 70,
          scale: 1,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
      ],
      spacing: 20,
      margins: { top: 50, right: 50, bottom: 120, left: 50 },
    },
    titleBlock: {
      enabled: true,
      position: 'bottom',
      width: 400,
      height: 100,
      fields: [
        { id: 'title', label: 'Project Title', value: 'Residential Floor Plan', x: 5, y: 10, width: 60, fontSize: 16, fontWeight: 'bold', alignment: 'left', editable: true },
        { id: 'date', label: 'Date', value: new Date().toLocaleDateString(), x: 70, y: 10, width: 25, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'scale', label: 'Scale', value: '1:100', x: 70, y: 30, width: 25, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'drawn-by', label: 'Drawn By', value: 'User', x: 70, y: 50, width: 25, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'project-no', label: 'Project No.', value: 'HP-001', x: 70, y: 70, width: 25, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
      ],
    },
    options: {
      includeGrid: false,
      includeMeasurements: true,
      includeAnnotations: true,
      quality: 0.9,
    },
  },
  {
    id: 'residential-complete',
    name: 'Residential Complete',
    description: 'Comprehensive layout with all views for complete residential documentation',
    category: 'residential',
    paperSize: 'A1',
    orientation: 'landscape',
    views: ['plan', 'front', 'back', 'left', 'right'],
    layout: {
      type: 'custom',
      viewports: [
        {
          viewType: 'plan',
          x: 5,
          y: 5,
          width: 45,
          height: 60,
          scale: 1,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
        {
          viewType: 'front',
          x: 55,
          y: 5,
          width: 20,
          height: 25,
          scale: 1,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
        {
          viewType: 'back',
          x: 80,
          y: 5,
          width: 15,
          height: 25,
          scale: 1,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
        {
          viewType: 'left',
          x: 55,
          y: 35,
          width: 20,
          height: 25,
          scale: 1,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
        {
          viewType: 'right',
          x: 80,
          y: 35,
          width: 15,
          height: 25,
          scale: 1,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
      ],
      spacing: 15,
      margins: { top: 50, right: 50, bottom: 150, left: 50 },
    },
    titleBlock: {
      enabled: true,
      position: 'bottom',
      width: 600,
      height: 120,
      fields: [
        { id: 'title', label: 'Project Title', value: 'Residential House Plans', x: 5, y: 10, width: 50, fontSize: 18, fontWeight: 'bold', alignment: 'left', editable: true },
        { id: 'subtitle', label: 'Subtitle', value: 'Floor Plan and Elevations', x: 5, y: 30, width: 50, fontSize: 12, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'date', label: 'Date', value: new Date().toLocaleDateString(), x: 60, y: 10, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'scale', label: 'Scale', value: '1:100', x: 60, y: 25, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'drawn-by', label: 'Drawn By', value: 'User', x: 60, y: 40, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'checked-by', label: 'Checked By', value: '', x: 60, y: 55, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'project-no', label: 'Project No.', value: 'HP-001', x: 80, y: 10, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'sheet-no', label: 'Sheet', value: '1 of 1', x: 80, y: 25, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
      ],
      logo: {
        enabled: true,
        position: 'top-right',
        width: 80,
        height: 40,
      },
    },
    options: {
      includeGrid: false,
      includeMeasurements: true,
      includeAnnotations: true,
      quality: 0.95,
    },
  },
  // Commercial Templates
  {
    id: 'commercial-standard',
    name: 'Commercial Standard',
    description: 'Professional layout for commercial projects with detailed title block',
    category: 'commercial',
    paperSize: 'A2',
    orientation: 'landscape',
    views: ['plan', 'front', 'left'],
    layout: {
      type: 'custom',
      viewports: [
        {
          viewType: 'plan',
          x: 5,
          y: 10,
          width: 55,
          height: 70,
          scale: 1,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
        {
          viewType: 'front',
          x: 65,
          y: 10,
          width: 30,
          height: 35,
          scale: 1,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
        {
          viewType: 'left',
          x: 65,
          y: 50,
          width: 30,
          height: 30,
          scale: 1,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
      ],
      spacing: 20,
      margins: { top: 60, right: 50, bottom: 140, left: 50 },
    },
    titleBlock: {
      enabled: true,
      position: 'bottom',
      width: 700,
      height: 120,
      fields: [
        { id: 'company', label: 'Company', value: 'Architecture Firm', x: 5, y: 5, width: 40, fontSize: 12, fontWeight: 'bold', alignment: 'left', editable: true },
        { id: 'title', label: 'Project Title', value: 'Commercial Building', x: 5, y: 20, width: 40, fontSize: 16, fontWeight: 'bold', alignment: 'left', editable: true },
        { id: 'address', label: 'Project Address', value: 'Project Address', x: 5, y: 35, width: 40, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'drawing-title', label: 'Drawing Title', value: 'Floor Plan and Elevations', x: 5, y: 50, width: 40, fontSize: 12, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'date', label: 'Date', value: new Date().toLocaleDateString(), x: 50, y: 5, width: 20, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'scale', label: 'Scale', value: '1:100', x: 50, y: 20, width: 20, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'drawn-by', label: 'Drawn By', value: 'User', x: 50, y: 35, width: 20, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'checked-by', label: 'Checked By', value: '', x: 50, y: 50, width: 20, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'project-no', label: 'Project No.', value: 'COM-001', x: 75, y: 5, width: 20, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'drawing-no', label: 'Drawing No.', value: 'A-001', x: 75, y: 20, width: 20, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'revision', label: 'Revision', value: 'A', x: 75, y: 35, width: 20, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'sheet-no', label: 'Sheet', value: '1 of 1', x: 75, y: 50, width: 20, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
      ],
      logo: {
        enabled: true,
        position: 'top-left',
        width: 100,
        height: 50,
      },
    },
    options: {
      includeGrid: true,
      includeMeasurements: true,
      includeAnnotations: true,
      quality: 0.95,
    },
  },
  // Technical Templates
  {
    id: 'technical-detailed',
    name: 'Technical Detailed',
    description: 'Detailed technical layout with precise measurements and annotations',
    category: 'technical',
    paperSize: 'A1',
    orientation: 'landscape',
    views: ['plan', 'front', 'left'],
    layout: {
      type: 'custom',
      viewports: [
        {
          viewType: 'plan',
          x: 5,
          y: 5,
          width: 60,
          height: 70,
          scale: 1.5,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
        {
          viewType: 'front',
          x: 70,
          y: 5,
          width: 25,
          height: 35,
          scale: 1.2,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
        {
          viewType: 'left',
          x: 70,
          y: 45,
          width: 25,
          height: 30,
          scale: 1.2,
          showTitle: true,
          titlePosition: 'top',
          border: true,
          borderStyle: 'solid',
        },
      ],
      spacing: 15,
      margins: { top: 50, right: 50, bottom: 160, left: 50 },
    },
    titleBlock: {
      enabled: true,
      position: 'bottom',
      width: 800,
      height: 140,
      fields: [
        { id: 'title', label: 'Technical Drawing', value: 'Technical Construction Plans', x: 5, y: 5, width: 50, fontSize: 18, fontWeight: 'bold', alignment: 'left', editable: true },
        { id: 'specification', label: 'Specification', value: 'Detailed measurements and construction notes', x: 5, y: 25, width: 50, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'tolerance', label: 'Tolerance', value: '±2mm unless noted', x: 5, y: 40, width: 50, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'material', label: 'Material Standard', value: 'As per local building code', x: 5, y: 55, width: 50, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'date', label: 'Date', value: new Date().toLocaleDateString(), x: 60, y: 5, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'scale', label: 'Scale', value: '1:50', x: 60, y: 20, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'units', label: 'Units', value: 'mm', x: 60, y: 35, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'drawn-by', label: 'Drawn By', value: 'User', x: 60, y: 50, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'checked-by', label: 'Checked By', value: '', x: 80, y: 5, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'approved-by', label: 'Approved By', value: '', x: 80, y: 20, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'project-no', label: 'Project No.', value: 'TECH-001', x: 80, y: 35, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
        { id: 'drawing-no', label: 'Drawing No.', value: 'T-001', x: 80, y: 50, width: 15, fontSize: 10, fontWeight: 'normal', alignment: 'left', editable: true },
      ],
    },
    options: {
      includeGrid: true,
      includeMeasurements: true,
      includeAnnotations: true,
      quality: 0.98,
      precision: 3,
    },
  },
  // Presentation Templates
  {
    id: 'presentation-clean',
    name: 'Presentation Clean',
    description: 'Clean, minimal layout perfect for client presentations',
    category: 'presentation',
    paperSize: 'A3',
    orientation: 'landscape',
    views: ['plan', 'front'],
    layout: {
      type: 'custom',
      viewports: [
        {
          viewType: 'plan',
          x: 10,
          y: 20,
          width: 50,
          height: 60,
          scale: 1,
          showTitle: false,
          titlePosition: 'top',
          border: false,
          borderStyle: 'solid',
        },
        {
          viewType: 'front',
          x: 65,
          y: 20,
          width: 30,
          height: 60,
          scale: 1,
          showTitle: false,
          titlePosition: 'top',
          border: false,
          borderStyle: 'solid',
        },
      ],
      spacing: 30,
      margins: { top: 80, right: 50, bottom: 80, left: 50 },
    },
    titleBlock: {
      enabled: true,
      position: 'top',
      width: 600,
      height: 60,
      fields: [
        { id: 'title', label: 'Project Title', value: 'House Design Concept', x: 20, y: 20, width: 60, fontSize: 24, fontWeight: 'bold', alignment: 'center', editable: true },
        { id: 'subtitle', label: 'Subtitle', value: 'Architectural Presentation', x: 20, y: 45, width: 60, fontSize: 12, fontWeight: 'normal', alignment: 'center', editable: true },
      ],
    },
    options: {
      includeGrid: false,
      includeMeasurements: false,
      includeAnnotations: false,
      quality: 0.95,
    },
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: ExportTemplate['category']): ExportTemplate[] {
  return EXPORT_TEMPLATES.filter(template => template.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ExportTemplate | undefined {
  return EXPORT_TEMPLATES.find(template => template.id === id);
}

/**
 * Apply template to export options
 */
export function applyTemplate(
  template: ExportTemplate,
  customOptions: Partial<MultiViewExportOptions> = {}
): MultiViewExportOptions {
  const baseOptions: MultiViewExportOptions = {
    format: 'pdf',
    quality: 0.9,
    pixelRatio: 2,
    includeGrid: false,
    includeMeasurements: true,
    includeAnnotations: true,
    paperSize: template.paperSize,
    orientation: template.orientation,
    scale: 1,
    title: template.titleBlock.fields.find(f => f.id === 'title')?.value || 'House Plan',
    description: template.description,
    views: template.views,
    layout: template.layout.type,
    spacing: template.layout.spacing,
    margins: template.layout.margins,
    ...template.options,
    ...customOptions,
  };

  return baseOptions;
}

/**
 * Create custom template from current settings
 */
export function createCustomTemplate(
  name: string,
  description: string,
  category: ExportTemplate['category'],
  options: MultiViewExportOptions,
  viewports: TemplateViewport[],
  titleBlock: TemplateTitleBlock
): ExportTemplate {
  const id = `custom-${Date.now()}`;

  return {
    id,
    name,
    description,
    category,
    paperSize: options.paperSize,
    orientation: options.orientation,
    views: options.views,
    layout: {
      type: 'custom',
      viewports,
      spacing: options.spacing,
      margins: options.margins,
    },
    titleBlock,
    options,
  };
}

/**
 * Generate template preview
 */
export function generateTemplatePreview(template: ExportTemplate): string {
  // Create a simple SVG preview of the template layout
  const width = 200;
  const height = 150;

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${width}" height="${height}" fill="white" stroke="#ccc" stroke-width="1"/>`;

  // Draw viewports
  template.layout.viewports.forEach(viewport => {
    const x = (viewport.x / 100) * width;
    const y = (viewport.y / 100) * height;
    const w = (viewport.width / 100) * width;
    const h = (viewport.height / 100) * height;

    svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f0f0f0" stroke="#666" stroke-width="1"/>`;

    if (viewport.showTitle) {
      svg += `<text x="${x + w/2}" y="${y - 5}" text-anchor="middle" font-size="8" fill="#333">${viewport.viewType.toUpperCase()}</text>`;
    }
  });

  // Draw title block
  if (template.titleBlock.enabled) {
    const tbHeight = 20; // Scaled down
    const tbY = template.titleBlock.position === 'bottom' ? height - tbHeight : 0;
    svg += `<rect x="0" y="${tbY}" width="${width}" height="${tbHeight}" fill="#e0e0e0" stroke="#666" stroke-width="1"/>`;
    svg += `<text x="10" y="${tbY + 12}" font-size="8" fill="#333">Title Block</text>`;
  }

  svg += '</svg>';

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Validate template configuration
 */
export function validateTemplate(template: ExportTemplate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!template.name) errors.push('Template name is required');
  if (!template.description) errors.push('Template description is required');
  if (template.views.length === 0) errors.push('At least one view must be selected');

  // Check viewport configuration
  template.layout.viewports.forEach((viewport, index) => {
    if (viewport.x < 0 || viewport.x > 100) {
      errors.push(`Viewport ${index + 1}: X position must be between 0 and 100`);
    }
    if (viewport.y < 0 || viewport.y > 100) {
      errors.push(`Viewport ${index + 1}: Y position must be between 0 and 100`);
    }
    if (viewport.width <= 0 || viewport.width > 100) {
      errors.push(`Viewport ${index + 1}: Width must be between 0 and 100`);
    }
    if (viewport.height <= 0 || viewport.height > 100) {
      errors.push(`Viewport ${index + 1}: Height must be between 0 and 100`);
    }
    if (viewport.x + viewport.width > 100) {
      errors.push(`Viewport ${index + 1}: Viewport extends beyond page width`);
    }
    if (viewport.y + viewport.height > 100) {
      errors.push(`Viewport ${index + 1}: Viewport extends beyond page height`);
    }
  });

  // Check for viewport overlaps
  for (let i = 0; i < template.layout.viewports.length; i++) {
    for (let j = i + 1; j < template.layout.viewports.length; j++) {
      const vp1 = template.layout.viewports[i];
      const vp2 = template.layout.viewports[j];

      if (viewportsOverlap(vp1, vp2)) {
        errors.push(`Viewports ${i + 1} and ${j + 1} overlap`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if two viewports overlap
 */
function viewportsOverlap(vp1: TemplateViewport, vp2: TemplateViewport): boolean {
  return !(
    vp1.x + vp1.width <= vp2.x ||
    vp2.x + vp2.width <= vp1.x ||
    vp1.y + vp1.height <= vp2.y ||
    vp2.y + vp2.height <= vp1.y
  );
}

const ExportTemplatesUtils = {
  EXPORT_TEMPLATES,
  getTemplatesByCategory,
  getTemplateById,
  applyTemplate,
  createCustomTemplate,
  generateTemplatePreview,
  validateTemplate,
};

export default ExportTemplatesUtils;
