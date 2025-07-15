import { DrawingSheet, SheetViewPlacement, STANDARD_PAPER_SIZES } from '@/types/drawingSheet2D';
import JSZip from 'jszip';

export async function composeSheet(sheet: DrawingSheet): Promise<HTMLCanvasElement> {
  const paperSize = STANDARD_PAPER_SIZES[sheet.size];
  const isLandscape = sheet.orientation === 'landscape';

  const canvasWidth = isLandscape ? paperSize.height : paperSize.width;
  const canvasHeight = isLandscape ? paperSize.width : paperSize.height;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const viewPlacement of sheet.views) {
    const viewCanvas = await captureView(viewPlacement.viewType);
    const positionX = viewPlacement.position.x;
    const positionY = viewPlacement.position.y;

    ctx.drawImage(
      viewCanvas,
      0,
      0,
      viewCanvas.width,
      viewCanvas.height,
      positionX,
      positionY,
      viewCanvas.width * viewPlacement.scale,
      viewCanvas.height * viewPlacement.scale
    );
  }

  // Draw title block
  drawTitleBlock(ctx, sheet);

  return canvas;
}

function drawTitleBlock(ctx: CanvasRenderingContext2D, sheet: DrawingSheet): void {
  const margin = sheet.margin;
  const titleBlockHeight = 80;
  const width = ctx.canvas.width - 2 * margin;
  const height = titleBlockHeight;
  const x = margin;
  const y = ctx.canvas.height - margin - titleBlockHeight;

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = 'black';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(sheet.title, x + 10, y + 25);
}

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
import jsPDF from 'jspdf';

// Type alias for consistency with the task requirements
export type ViewType = ViewType2D;

export interface MultiViewExportOptions {
  format: 'png' | 'pdf' | 'svg' | 'dxf';
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
  // Additional options for new formats
  units?: 'mm' | 'cm' | 'in' | 'ft';
  precision?: number;
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

// Batch export functionality
export interface BatchExportItem {
  id: string;
  name: string;
  stages: Record<ViewType2D, Stage | null>;
  options: MultiViewExportOptions;
}

export interface BatchExportResult {
  id: string;
  name: string;
  blob: Blob;
  success: boolean;
  error?: string;
}

export async function batchExport(
  items: BatchExportItem[],
  onProgress?: (completed: number, total: number, currentItem: string) => void
): Promise<BatchExportResult[]> {
  const results: BatchExportResult[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (onProgress) {
      onProgress(i, items.length, item.name);
    }
    
    try {
      const blob = await exportMultiViewToPDF(item.stages, item.options);
      results.push({
        id: item.id,
        name: item.name,
        blob,
        success: true,
      });
    } catch (error) {
      results.push({
        id: item.id,
        name: item.name,
        blob: new Blob(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  if (onProgress) {
    onProgress(items.length, items.length, 'Complete');
  }
  
  return results;
}

export async function downloadBatchAsZip(
  results: BatchExportResult[],
  filename: string = 'house-plans-batch'
): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  for (const result of results) {
    if (result.success) {
      zip.file(`${result.name}.pdf`, result.blob);
    }
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  // Create download link
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
 * Batch export multiple sheets/floors with progress tracking
 */
export async function batchExport(
  sheets: Array<{
    name: string;
    stages: Record<ViewType2D, Stage>;
    options: MultiViewExportOptions;
  }>,
  format: 'pdf' | 'png' = 'pdf',
  onProgress?: (progress: number, currentItem: string) => void
): Promise<Array<{ name: string; blob: Blob; success: boolean; error?: string }>> {
  const results: Array<{ name: string; blob: Blob; success: boolean; error?: string }> = [];
  
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const progress = ((i + 1) / sheets.length) * 100;
    
    // Update progress
    if (onProgress) {
      onProgress(progress, `Exporting ${sheet.name}...`);
    }
    
    try {
      let blob: Blob;
      
      if (format === 'pdf') {
        blob = await exportMultiViewToPDF(sheet.stages, sheet.options);
      } else {
        // For PNG, export each view separately and create a zip
        const pngBlobs: Array<{ name: string; blob: Blob }> = [];
        
        for (const [viewType, stage] of Object.entries(sheet.stages)) {
          if (stage) {
            const dataURL = stage.toDataURL({
              mimeType: 'image/png',
              quality: sheet.options.quality,
              pixelRatio: 2,
            });
            
            // Convert data URL to blob
            const response = await fetch(dataURL);
            const pngBlob = await response.blob();
            
            pngBlobs.push({
              name: `${sheet.name}-${viewType}.png`,
              blob: pngBlob,
            });
          }
        }
        
        // Create ZIP for PNG files
        const zip = new JSZip();
        pngBlobs.forEach(({ name, blob }) => {
          zip.file(name, blob);
        });
        
        blob = await zip.generateAsync({ type: 'blob' });
      }
      
      results.push({
        name: sheet.name,
        blob,
        success: true,
      });
    } catch (error) {
      console.error(`Failed to export ${sheet.name}:`, error);
      results.push({
        name: sheet.name,
        blob: new Blob(), // Empty blob for failed exports
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return results;
}

/**
 * Download multiple files as a ZIP archive using JSZip
 */
export async function downloadBatchAsZip(
  files: Array<{ name: string; blob: Blob }>,
  zipName: string = 'house-plans.zip'
): Promise<void> {
  const zip = new JSZip();
  
  // Add each file to the ZIP
  files.forEach(({ name, blob }) => {
    const fileName = name.includes('.') ? name : `${name}.pdf`;
    zip.file(fileName, blob);
  });
  
  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  // Create download link
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipName;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

// =============================================================================
// CORE EXPORT UTILITIES
// =============================================================================

/**
 * Options for PNG export
 */
export interface PNGExportOptions {
  filename?: string;
  quality?: number;
  pixelRatio?: number;
  mimeType?: string;
  width?: number;
  height?: number;
}

/**
 * Options for PDF export
 */
export interface PDFExportOptions {
  filename?: string;
  paperSize?: keyof typeof PAPER_SIZES;
  orientation?: 'portrait' | 'landscape';
  title?: string;
  description?: string;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  scale?: number;
  quality?: number;
  pixelRatio?: number;
  centerImage?: boolean;
  addTitleBlock?: boolean;
}

/**
 * Default PNG export options
 */
export const DEFAULT_PNG_OPTIONS: PNGExportOptions = {
  filename: 'house-plan',
  quality: 1.0,
  pixelRatio: 2,
  mimeType: 'image/png',
};

/**
 * Default PDF export options
 */
export const DEFAULT_PDF_OPTIONS: PDFExportOptions = {
  filename: 'house-plan',
  paperSize: 'A4',
  orientation: 'landscape',
  title: 'House Plan',
  description: 'Created with 2D House Planner',
  margins: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
  scale: 1,
  quality: 1.0,
  pixelRatio: 2,
  centerImage: true,
  addTitleBlock: false,
};

/**
 * Registry to store stage references for each view type
 */
const stageRegistry = new Map<ViewType, Stage>();

/**
 * Register a stage for a specific view type
 */
export function registerStage(viewType: ViewType, stage: Stage): void {
  stageRegistry.set(viewType, stage);
}

/**
 * Get a registered stage for a specific view type
 */
export function getStage(viewType: ViewType): Stage | undefined {
  return stageRegistry.get(viewType);
}

/**
 * Clear all registered stages (for testing)
 */
export function clearStageRegistry(): void {
  stageRegistry.clear();
}

/**
 * Capture a view as an HTML canvas element using Konva's stage.toCanvas()
 * @param view - The view type to capture
 * @returns Promise that resolves to an HTMLCanvasElement
 */
export async function captureView(view: ViewType): Promise<HTMLCanvasElement> {
  const stage = getStage(view);
  
  if (!stage) {
    throw new Error(`No stage registered for view type: ${view}`);
  }
  
  try {
    // Use Konva's toCanvas method to get the canvas
    const canvas = stage.toCanvas({
      pixelRatio: 2, // High resolution
      quality: 1.0,
    });
    
    return canvas;
  } catch (error) {
    throw new Error(`Failed to capture view "${view}": ${error}`);
  }
}

/**
 * Export a view as PNG and trigger download
 * @param view - The view type to export
 * @param options - PNG export options
 */
export async function exportPNG(view: ViewType, options: PNGExportOptions = {}): Promise<void> {
  const stage = getStage(view);
  
  if (!stage) {
    throw new Error(`No stage registered for view type: ${view}`);
  }
  
  const opts = { ...DEFAULT_PNG_OPTIONS, ...options };
  
  try {
    // Get the data URL using Konva's toDataURL method
    const dataURL = stage.toDataURL({
      mimeType: opts.mimeType || 'image/png',
      quality: opts.quality || 1.0,
      pixelRatio: opts.pixelRatio || 2,
      width: opts.width,
      height: opts.height,
    });
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${opts.filename || 'house-plan'}-${view}.png`;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    throw new Error(`Failed to export PNG for view "${view}": ${error}`);
  }
}

/**
 * Export a view as PDF using jsPDF
 * @param view - The view type to export
 * @param options - PDF export options
 */
export async function exportPDF(view: ViewType, options: PDFExportOptions = {}): Promise<void> {
  const stage = getStage(view);
  
  if (!stage) {
    throw new Error(`No stage registered for view type: ${view}`);
  }
  
  const opts = { ...DEFAULT_PDF_OPTIONS, ...options };
  
  try {
    // Get the paper size
    const paperSize = PAPER_SIZES[opts.paperSize || 'A4'];
    const isLandscape = opts.orientation === 'landscape';
    
    const paperWidth = isLandscape ? paperSize.height : paperSize.width;
    const paperHeight = isLandscape ? paperSize.width : paperSize.height;
    
    // Create PDF document
    const pdf = new jsPDF({
      orientation: opts.orientation || 'landscape',
      unit: 'pt',
      format: [paperWidth, paperHeight],
    });
    
    // Get stage as image
    const dataURL = stage.toDataURL({
      mimeType: 'image/png',
      quality: opts.quality || 1.0,
      pixelRatio: opts.pixelRatio || 2,
    });
    
    // Calculate available space for image
    const margins = opts.margins || { top: 50, right: 50, bottom: 50, left: 50 };
    const availableWidth = paperWidth - margins.left - margins.right;
    const availableHeight = paperHeight - margins.top - margins.bottom;
    
    // Reserve space for title block if enabled
    const titleBlockHeight = opts.addTitleBlock ? 80 : 0;
    const imageHeight = availableHeight - titleBlockHeight;
    
    // Get original stage dimensions
    const stageWidth = stage.width();
    const stageHeight = stage.height();
    
    // Calculate scale to fit image within available space
    const scaleX = availableWidth / stageWidth;
    const scaleY = imageHeight / stageHeight;
    const scale = Math.min(scaleX, scaleY) * (opts.scale || 1);
    
    // Calculate final image dimensions
    const finalWidth = stageWidth * scale;
    const finalHeight = stageHeight * scale;
    
    // Calculate position (center if specified)
    let x = margins.left;
    let y = margins.top;
    
    if (opts.centerImage) {
      x = margins.left + (availableWidth - finalWidth) / 2;
      y = margins.top + (imageHeight - finalHeight) / 2;
    }
    
    // Add title block if enabled
    if (opts.addTitleBlock) {
      const titleBlock: TitleBlockLayout = {
        x: margins.left,
        y: paperHeight - margins.bottom,
        width: availableWidth,
        height: titleBlockHeight,
        title: opts.title || 'House Plan',
        description: opts.description || 'Created with 2D House Planner',
        date: new Date().toLocaleDateString(),
        scale: `1:${Math.round(1 / scale)}`,
        drawnBy: 'User',
        checkedBy: '',
        projectNumber: '',
      };
      
      addTitleBlockToPDF(pdf, titleBlock);
    }
    
    // Add image to PDF
    pdf.addImage(
      dataURL,
      'PNG',
      x,
      y,
      finalWidth,
      finalHeight,
      undefined,
      'FAST'
    );
    
    // Add border around image
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, finalWidth, finalHeight);
    
    // Save the PDF
    pdf.save(`${opts.filename || 'house-plan'}-${view}.pdf`);
    
  } catch (error) {
    throw new Error(`Failed to export PDF for view "${view}": ${error}`);
  }
}

export default {
  // Multi-view export functions
  composeSheet,
  exportMultiViewToPDF,
  generateExportPreview,
  batchExport,
  downloadBatchAsZip,
  generateDrawingSheetLayout,
  DEFAULT_MULTI_VIEW_OPTIONS,
  PAPER_SIZES,
  // Core export functions
  captureView,
  exportPNG,
  exportPDF,
  registerStage,
  getStage,
  clearStageRegistry,
  DEFAULT_PNG_OPTIONS,
  DEFAULT_PDF_OPTIONS,
};
