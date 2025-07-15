/**
 * Enhanced Export Utilities for 2D Multi-View System
 * 
 * This module provides advanced export capabilities including:
 * - Multi-view export (all views in one document)
 * - Real-time export preview
 * - Batch export functionality
 * - Professional drawing layout system
 */

import { Stage } from 'konva/lib/Stage';
import { ViewType2D } from '@/types/views';
import { Element2D } from '@/types/elements2D';
import jsPDF from 'jspdf';

export interface MultiViewExportOptions {
  format: 'png' | 'pdf' | 'svg';
  quality: number;
  includeGrid: boolean;
  includeMeasurements: boolean;
  includeAnnotations: boolean;
  paperSize: 'A4' | 'A3' | 'A2' | 'A1' | 'Letter' | 'Legal' | 'Tabloid';
  orientation: 'portrait' | 'landscape';
  scale: number;
  title: string;
  description: string;
  views: ViewType2D[];
  layout: 'grid' | 'sequential' | 'custom';
  spacing: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface DrawingSheetLayout {
  paperWidth: number;
  paperHeight: number;
  viewports: ViewportLayout[];
  titleBlock: TitleBlockLayout;
  scale: number;
}

export interface ViewportLayout {
  viewType: ViewType2D;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  title: string;
}

export interface TitleBlockLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  description: string;
  date: string;
  scale: string;
  drawnBy: string;
  checkedBy: string;
  projectNumber: string;
}

export interface ExportPreview {
  dataUrl: string;
  width: number;
  height: number;
  viewports: ViewportLayout[];
}

/**
 * Paper size definitions in points (72 DPI)
 */
export const PAPER_SIZES = {
  A4: { width: 595, height: 842 },
  A3: { width: 842, height: 1191 },
  A2: { width: 1191, height: 1684 },
  A1: { width: 1684, height: 2384 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  Tabloid: { width: 792, height: 1224 },
};

/**
 * Default export options for multi-view export
 */
export const DEFAULT_MULTI_VIEW_OPTIONS: MultiViewExportOptions = {
  format: 'pdf',
  quality: 0.9,
  includeGrid: false,
  includeMeasurements: true,
  includeAnnotations: true,
  paperSize: 'A3',
  orientation: 'landscape',
  scale: 1,
  title: 'House Plan - Multi-View',
  description: 'Created with 2D House Planner',
  views: ['plan', 'front', 'back', 'left', 'right'],
  layout: 'grid',
  spacing: 20,
  margins: {
    top: 50,
    right: 50,
    bottom: 100,
    left: 50,
  },
};

/**
 * Generate drawing sheet layout for multi-view export
 */
export function generateDrawingSheetLayout(
  options: MultiViewExportOptions
): DrawingSheetLayout {
  const paperSize = PAPER_SIZES[options.paperSize];
  const isLandscape = options.orientation === 'landscape';
  
  const paperWidth = isLandscape ? paperSize.height : paperSize.width;
  const paperHeight = isLandscape ? paperSize.width : paperSize.height;
  
  const availableWidth = paperWidth - options.margins.left - options.margins.right;
  const availableHeight = paperHeight - options.margins.top - options.margins.bottom - 80; // Reserve space for title block
  
  const viewports = generateViewportLayouts(
    options.views,
    availableWidth,
    availableHeight,
    options.layout,
    options.spacing
  );
  
  const titleBlock: TitleBlockLayout = {
    x: options.margins.left,
    y: paperHeight - options.margins.bottom,
    width: availableWidth,
    height: 80,
    title: options.title,
    description: options.description,
    date: new Date().toLocaleDateString(),
    scale: `1:${Math.round(1 / options.scale)}`,
    drawnBy: 'User',
    checkedBy: '',
    projectNumber: '',
  };
  
  return {
    paperWidth,
    paperHeight,
    viewports,
    titleBlock,
    scale: options.scale,
  };
}

/**
 * Generate viewport layouts based on the selected layout type
 */
function generateViewportLayouts(
  views: ViewType2D[],
  availableWidth: number,
  availableHeight: number,
  layout: 'grid' | 'sequential' | 'custom',
  spacing: number
): ViewportLayout[] {
  const viewports: ViewportLayout[] = [];
  
  if (layout === 'grid') {
    // Calculate grid dimensions
    const cols = Math.ceil(Math.sqrt(views.length));
    const rows = Math.ceil(views.length / cols);
    
    const viewportWidth = (availableWidth - (cols - 1) * spacing) / cols;
    const viewportHeight = (availableHeight - (rows - 1) * spacing) / rows;
    
    views.forEach((view, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      viewports.push({
        viewType: view,
        x: col * (viewportWidth + spacing),
        y: row * (viewportHeight + spacing),
        width: viewportWidth,
        height: viewportHeight,
        scale: 1,
        title: getViewTitle(view),
      });
    });
  } else if (layout === 'sequential') {
    // Arrange views in a single row or column
    const isHorizontal = availableWidth > availableHeight;
    
    if (isHorizontal) {
      const viewportWidth = (availableWidth - (views.length - 1) * spacing) / views.length;
      const viewportHeight = availableHeight;
      
      views.forEach((view, index) => {
        viewports.push({
          viewType: view,
          x: index * (viewportWidth + spacing),
          y: 0,
          width: viewportWidth,
          height: viewportHeight,
          scale: 1,
          title: getViewTitle(view),
        });
      });
    } else {
      const viewportWidth = availableWidth;
      const viewportHeight = (availableHeight - (views.length - 1) * spacing) / views.length;
      
      views.forEach((view, index) => {
        viewports.push({
          viewType: view,
          x: 0,
          y: index * (viewportHeight + spacing),
          width: viewportWidth,
          height: viewportHeight,
          scale: 1,
          title: getViewTitle(view),
        });
      });
    }
  }
  
  return viewports;
}

/**
 * Get display title for a view type
 */
function getViewTitle(viewType: ViewType2D): string {
  const titles = {
    plan: 'Plan View',
    front: 'Front Elevation',
    back: 'Back Elevation',
    left: 'Left Elevation',
    right: 'Right Elevation',
  };
  return titles[viewType];
}

/**
 * Export multiple views to a single PDF document
 */
export async function exportMultiViewToPDF(
  stages: Record<ViewType2D, Stage>,
  options: MultiViewExportOptions
): Promise<Blob> {
  const layout = generateDrawingSheetLayout(options);
  
  // Create PDF document
  const pdf = new jsPDF({
    orientation: options.orientation,
    unit: 'pt',
    format: [layout.paperWidth, layout.paperHeight],
  });
  
  // Add title block
  addTitleBlockToPDF(pdf, layout.titleBlock);
  
  // Add each view to the PDF
  for (const viewport of layout.viewports) {
    const stage = stages[viewport.viewType];
    if (stage) {
      await addViewToPDF(pdf, stage, viewport, options);
    }
  }
  
  return pdf.output('blob');
}

/**
 * Add a title block to the PDF
 */
function addTitleBlockToPDF(pdf: jsPDF, titleBlock: TitleBlockLayout): void {
  const { x, y, width, height } = titleBlock;
  
  // Draw title block border
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(1);
  pdf.rect(x, y, width, height);
  
  // Add title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(titleBlock.title, x + 10, y + 20);
  
  // Add description
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(titleBlock.description, x + 10, y + 35);
  
  // Add metadata in right column
  const rightColumnX = x + width - 150;
  pdf.text(`Date: ${titleBlock.date}`, rightColumnX, y + 20);
  pdf.text(`Scale: ${titleBlock.scale}`, rightColumnX, y + 35);
  pdf.text(`Drawn by: ${titleBlock.drawnBy}`, rightColumnX, y + 50);
}

/**
 * Add a single view to the PDF
 */
async function addViewToPDF(
  pdf: jsPDF,
  stage: Stage,
  viewport: ViewportLayout,
  options: MultiViewExportOptions
): Promise<void> {
  // Get stage as image
  const dataURL = stage.toDataURL({
    mimeType: 'image/png',
    quality: options.quality,
    pixelRatio: 2,
  });
  
  // Add view title
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(viewport.title, viewport.x, viewport.y - 5);
  
  // Add image to PDF
  pdf.addImage(
    dataURL,
    'PNG',
    viewport.x,
    viewport.y,
    viewport.width,
    viewport.height,
    undefined,
    'FAST'
  );
  
  // Add viewport border
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.rect(viewport.x, viewport.y, viewport.width, viewport.height);
}

/**
 * Generate real-time export preview
 */
export async function generateExportPreview(
  stages: Record<ViewType2D, Stage>,
  options: MultiViewExportOptions
): Promise<ExportPreview> {
  const layout = generateDrawingSheetLayout(options);
  
  // Create a temporary canvas for preview
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Set canvas size
  const previewScale = 0.2; // Scale down for preview
  canvas.width = layout.paperWidth * previewScale;
  canvas.height = layout.paperHeight * previewScale;
  
  // Clear canvas with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw title block
  drawTitleBlockPreview(ctx, layout.titleBlock, previewScale);
  
  // Draw each viewport
  for (const viewport of layout.viewports) {
    const stage = stages[viewport.viewType];
    if (stage) {
      await drawViewportPreview(ctx, stage, viewport, previewScale);
    }
  }
  
  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
    viewports: layout.viewports,
  };
}

/**
 * Draw title block in preview canvas
 */
function drawTitleBlockPreview(
  ctx: CanvasRenderingContext2D,
  titleBlock: TitleBlockLayout,
  scale: number
): void {
  const x = titleBlock.x * scale;
  const y = titleBlock.y * scale;
  const width = titleBlock.width * scale;
  const height = titleBlock.height * scale;
  
  // Draw border
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
  
  // Add text
  ctx.fillStyle = 'black';
  ctx.font = `${12 * scale}px Arial`;
  ctx.fillText(titleBlock.title, x + 5, y + 15);
}

/**
 * Draw viewport preview in canvas
 */
async function drawViewportPreview(
  ctx: CanvasRenderingContext2D,
  stage: Stage,
  viewport: ViewportLayout,
  scale: number
): Promise<void> {
  const x = viewport.x * scale;
  const y = viewport.y * scale;
  const width = viewport.width * scale;
  const height = viewport.height * scale;
  
  // Draw viewport border
  ctx.strokeStyle = 'gray';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
  
  // Draw placeholder for view content
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
  
  // Add view title
  ctx.fillStyle = 'black';
  ctx.font = `${10 * scale}px Arial`;
  ctx.fillText(viewport.title, x + 5, y - 5);
}

/**
 * Batch export multiple projects or configurations
 */
export async function batchExport(
  exportConfigs: Array<{
    name: string;
    stages: Record<ViewType2D, Stage>;
    options: MultiViewExportOptions;
  }>
): Promise<Array<{ name: string; blob: Blob }>> {
  const results: Array<{ name: string; blob: Blob }> = [];
  
  for (const config of exportConfigs) {
    try {
      const blob = await exportMultiViewToPDF(config.stages, config.options);
      results.push({
        name: config.name,
        blob,
      });
    } catch (error) {
      console.error(`Failed to export ${config.name}:`, error);
    }
  }
  
  return results;
}

/**
 * Download multiple files as a ZIP archive
 */
export async function downloadBatchAsZip(
  files: Array<{ name: string; blob: Blob }>,
  zipName: string = 'house-plans.zip'
): Promise<void> {
  // This would require a ZIP library like JSZip
  // For now, download files individually
  for (const file of files) {
    const url = URL.createObjectURL(file.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default {
  exportMultiViewToPDF,
  generateExportPreview,
  batchExport,
  downloadBatchAsZip,
  generateDrawingSheetLayout,
  DEFAULT_MULTI_VIEW_OPTIONS,
  PAPER_SIZES,
};