/**
 * Drawing Sheet Layout Types for 2D Multi-View Export
 * 
 * This file defines the types and interfaces for professional
 * drawing sheet layouts used in multi-view export functionality.
 */

import { ViewType2D } from './views';

/**
 * Standard paper sizes in points (72 DPI)
 */
export interface PaperSize {
  width: number;
  height: number;
  name: string;
}

/**
 * Drawing sheet configuration
 */
export interface DrawingSheet2D {
  id: string;
  name: string;
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  scale: number;
  margins: Margins2D;
  viewports: Viewport2D[];
  titleBlock: TitleBlock2D;
  border: Border2D;
  grid?: Grid2D;
  metadata: SheetMetadata2D;
}

/**
 * Margins for drawing sheet
 */
export interface Margins2D {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Viewport definition for a specific view
 */
export interface Viewport2D {
  id: string;
  viewType: ViewType2D;
  position: Position2D;
  size: Size2D;
  scale: number;
  title: string;
  showTitle: boolean;
  showBorder: boolean;
  showGrid: boolean;
  showDimensions: boolean;
  showAnnotations: boolean;
  clipBounds?: Bounds2D;
}

/**
 * Position coordinates
 */
export interface Position2D {
  x: number;
  y: number;
}

/**
 * Size dimensions
 */
export interface Size2D {
  width: number;
  height: number;
}

/**
 * Bounding box
 */
export interface Bounds2D {
  min: Position2D;
  max: Position2D;
}

/**
 * Title block configuration
 */
export interface TitleBlock2D {
  position: Position2D;
  size: Size2D;
  visible: boolean;
  fields: TitleBlockField2D[];
  border: Border2D;
  background?: string;
}

/**
 * Title block field
 */
export interface TitleBlockField2D {
  id: string;
  label: string;
  value: string;
  position: Position2D;
  size: Size2D;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  alignment: 'left' | 'center' | 'right';
  visible: boolean;
}

/**
 * Border configuration
 */
export interface Border2D {
  visible: boolean;
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
}

/**
 * Grid configuration for drawing sheet
 */
export interface Grid2D {
  visible: boolean;
  majorSpacing: number;
  minorSpacing: number;
  majorColor: string;
  minorColor: string;
  majorWidth: number;
  minorWidth: number;
}

/**
 * Sheet metadata
 */
export interface SheetMetadata2D {
  title: string;
  description: string;
  projectName: string;
  projectNumber: string;
  drawnBy: string;
  checkedBy: string;
  approvedBy: string;
  dateCreated: string;
  dateModified: string;
  revision: string;
  revisionDate: string;
  scale: string;
  units: 'ft' | 'in' | 'm' | 'cm' | 'mm';
  notes: string[];
}

/**
 * Layout template for common drawing sheet configurations
 */
export interface LayoutTemplate2D {
  id: string;
  name: string;
  description: string;
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  viewportCount: number;
  viewportLayout: 'grid' | 'sequential' | 'custom';
  defaultViews: ViewType2D[];
  preview?: string; // Base64 encoded preview image
}

/**
 * Export configuration for multi-view export
 */
export interface MultiViewExportConfig2D {
  format: 'pdf' | 'png' | 'svg' | 'dwg';
  quality: number;
  resolution: number; // DPI
  colorMode: 'color' | 'grayscale' | 'blackwhite';
  compression: boolean;
  embedFonts: boolean;
  includeMetadata: boolean;
  watermark?: Watermark2D;
}

/**
 * Watermark configuration
 */
export interface Watermark2D {
  text: string;
  position: Position2D;
  rotation: number;
  opacity: number;
  fontSize: number;
  color: string;
}

/**
 * Standard paper sizes
 */
export const STANDARD_PAPER_SIZES: Record<string, PaperSize> = {
  A4: { width: 595, height: 842, name: 'A4' },
  A3: { width: 842, height: 1191, name: 'A3' },
  A2: { width: 1191, height: 1684, name: 'A2' },
  A1: { width: 1684, height: 2384, name: 'A1' },
  A0: { width: 2384, height: 3370, name: 'A0' },
  Letter: { width: 612, height: 792, name: 'Letter' },
  Legal: { width: 612, height: 1008, name: 'Legal' },
  Tabloid: { width: 792, height: 1224, name: 'Tabloid' },
  Arch_A: { width: 648, height: 864, name: 'Arch A' },
  Arch_B: { width: 864, height: 1296, name: 'Arch B' },
  Arch_C: { width: 1296, height: 1728, name: 'Arch C' },
  Arch_D: { width: 1728, height: 2592, name: 'Arch D' },
  Arch_E: { width: 2592, height: 3456, name: 'Arch E' },
};

/**
 * Default layout templates
 */
export const DEFAULT_LAYOUT_TEMPLATES: LayoutTemplate2D[] = [
  {
    id: 'single-plan',
    name: 'Single Plan View',
    description: 'Single plan view with title block',
    paperSize: STANDARD_PAPER_SIZES.A4,
    orientation: 'landscape',
    viewportCount: 1,
    viewportLayout: 'custom',
    defaultViews: ['plan'],
  },
  {
    id: 'plan-elevations',
    name: 'Plan + Elevations',
    description: 'Plan view with four elevation views',
    paperSize: STANDARD_PAPER_SIZES.A3,
    orientation: 'landscape',
    viewportCount: 5,
    viewportLayout: 'grid',
    defaultViews: ['plan', 'front', 'back', 'left', 'right'],
  },
  {
    id: 'elevations-only',
    name: 'Elevations Only',
    description: 'Four elevation views in grid layout',
    paperSize: STANDARD_PAPER_SIZES.A3,
    orientation: 'landscape',
    viewportCount: 4,
    viewportLayout: 'grid',
    defaultViews: ['front', 'back', 'left', 'right'],
  },
  {
    id: 'sequential-views',
    name: 'Sequential Views',
    description: 'All views arranged sequentially',
    paperSize: STANDARD_PAPER_SIZES.A2,
    orientation: 'landscape',
    viewportCount: 5,
    viewportLayout: 'sequential',
    defaultViews: ['plan', 'front', 'back', 'left', 'right'],
  },
];

/**
 * Default title block fields
 */
export const DEFAULT_TITLE_BLOCK_FIELDS: TitleBlockField2D[] = [
  {
    id: 'title',
    label: 'Title',
    value: 'House Plan',
    position: { x: 10, y: 20 },
    size: { width: 200, height: 20 },
    fontSize: 16,
    fontWeight: 'bold',
    alignment: 'left',
    visible: true,
  },
  {
    id: 'project',
    label: 'Project',
    value: '',
    position: { x: 10, y: 40 },
    size: { width: 200, height: 15 },
    fontSize: 12,
    fontWeight: 'normal',
    alignment: 'left',
    visible: true,
  },
  {
    id: 'date',
    label: 'Date',
    value: new Date().toLocaleDateString(),
    position: { x: 250, y: 20 },
    size: { width: 100, height: 15 },
    fontSize: 10,
    fontWeight: 'normal',
    alignment: 'left',
    visible: true,
  },
  {
    id: 'scale',
    label: 'Scale',
    value: '1:100',
    position: { x: 250, y: 35 },
    size: { width: 100, height: 15 },
    fontSize: 10,
    fontWeight: 'normal',
    alignment: 'left',
    visible: true,
  },
  {
    id: 'drawn-by',
    label: 'Drawn By',
    value: 'User',
    position: { x: 250, y: 50 },
    size: { width: 100, height: 15 },
    fontSize: 10,
    fontWeight: 'normal',
    alignment: 'left',
    visible: true,
  },
];

/**
 * Utility functions for drawing sheet operations
 */
export class DrawingSheetUtils {
  /**
   * Create a new drawing sheet with default settings
   */
  static createDefaultSheet(template: LayoutTemplate2D): DrawingSheet2D {
    const paperSize = template.paperSize;
    const isLandscape = template.orientation === 'landscape';
    
    const sheetWidth = isLandscape ? paperSize.height : paperSize.width;
    const sheetHeight = isLandscape ? paperSize.width : paperSize.height;
    
    const margins: Margins2D = {
      top: 50,
      right: 50,
      bottom: 100,
      left: 50,
    };
    
    const titleBlockHeight = 80;
    const titleBlock: TitleBlock2D = {
      position: { x: margins.left, y: sheetHeight - margins.bottom },
      size: { width: sheetWidth - margins.left - margins.right, height: titleBlockHeight },
      visible: true,
      fields: [...DEFAULT_TITLE_BLOCK_FIELDS],
      border: {
        visible: true,
        color: '#000000',
        width: 1,
        style: 'solid',
      },
    };
    
    const viewports = this.generateViewports(
      template.defaultViews,
      {
        x: margins.left,
        y: margins.top,
        width: sheetWidth - margins.left - margins.right,
        height: sheetHeight - margins.top - margins.bottom - titleBlockHeight - 20,
      },
      template.viewportLayout
    );
    
    return {
      id: `sheet-${Date.now()}`,
      name: template.name,
      paperSize: template.paperSize,
      orientation: template.orientation,
      scale: 1,
      margins,
      viewports,
      titleBlock,
      border: {
        visible: true,
        color: '#000000',
        width: 2,
        style: 'solid',
      },
      metadata: {
        title: 'House Plan',
        description: 'Created with 2D House Planner',
        projectName: '',
        projectNumber: '',
        drawnBy: 'User',
        checkedBy: '',
        approvedBy: '',
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        revision: 'A',
        revisionDate: new Date().toISOString(),
        scale: '1:100',
        units: 'ft',
        notes: [],
      },
    };
  }
  
  /**
   * Generate viewport layouts
   */
  static generateViewports(
    views: ViewType2D[],
    availableArea: { x: number; y: number; width: number; height: number },
    layout: 'grid' | 'sequential' | 'custom'
  ): Viewport2D[] {
    const viewports: Viewport2D[] = [];
    const spacing = 20;
    
    if (layout === 'grid') {
      const cols = Math.ceil(Math.sqrt(views.length));
      const rows = Math.ceil(views.length / cols);
      
      const viewportWidth = (availableArea.width - (cols - 1) * spacing) / cols;
      const viewportHeight = (availableArea.height - (rows - 1) * spacing) / rows;
      
      views.forEach((view, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        viewports.push({
          id: `viewport-${view}`,
          viewType: view,
          position: {
            x: availableArea.x + col * (viewportWidth + spacing),
            y: availableArea.y + row * (viewportHeight + spacing),
          },
          size: { width: viewportWidth, height: viewportHeight },
          scale: 1,
          title: this.getViewTitle(view),
          showTitle: true,
          showBorder: true,
          showGrid: false,
          showDimensions: true,
          showAnnotations: true,
        });
      });
    } else if (layout === 'sequential') {
      const isHorizontal = availableArea.width > availableArea.height;
      
      if (isHorizontal) {
        const viewportWidth = (availableArea.width - (views.length - 1) * spacing) / views.length;
        const viewportHeight = availableArea.height;
        
        views.forEach((view, index) => {
          viewports.push({
            id: `viewport-${view}`,
            viewType: view,
            position: {
              x: availableArea.x + index * (viewportWidth + spacing),
              y: availableArea.y,
            },
            size: { width: viewportWidth, height: viewportHeight },
            scale: 1,
            title: this.getViewTitle(view),
            showTitle: true,
            showBorder: true,
            showGrid: false,
            showDimensions: true,
            showAnnotations: true,
          });
        });
      } else {
        const viewportWidth = availableArea.width;
        const viewportHeight = (availableArea.height - (views.length - 1) * spacing) / views.length;
        
        views.forEach((view, index) => {
          viewports.push({
            id: `viewport-${view}`,
            viewType: view,
            position: {
              x: availableArea.x,
              y: availableArea.y + index * (viewportHeight + spacing),
            },
            size: { width: viewportWidth, height: viewportHeight },
            scale: 1,
            title: this.getViewTitle(view),
            showTitle: true,
            showBorder: true,
            showGrid: false,
            showDimensions: true,
            showAnnotations: true,
          });
        });
      }
    }
    
    return viewports;
  }
  
  /**
   * Get display title for view type
   */
  static getViewTitle(viewType: ViewType2D): string {
    const titles = {
      plan: 'Plan View',
      front: 'Front Elevation',
      back: 'Back Elevation',
      left: 'Left Elevation',
      right: 'Right Elevation',
    };
    return titles[viewType];
  }
}

const DrawingSheetExports = {
  STANDARD_PAPER_SIZES,
  DEFAULT_LAYOUT_TEMPLATES,
  DEFAULT_TITLE_BLOCK_FIELDS,
  DrawingSheetUtils,
};

export default DrawingSheetExports;
