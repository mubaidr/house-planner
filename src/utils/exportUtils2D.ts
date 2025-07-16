import { DrawingSheet, SheetViewPlacement, STANDARD_PAPER_SIZES, ViewType2D, Stage } from '@/types/drawingSheet2D';
import JSZip from 'jszip';
import jsPDF from 'jspdf';

export async function composeSheet(
  sheet: DrawingSheet,
  options: { pixelRatio: number; quality: number }
): Promise<HTMLCanvasElement> {
  const paperSize = STANDARD_PAPER_SIZES[sheet.size];
  const isLandscape = sheet.orientation === 'landscape';

  const canvasWidth = isLandscape ? paperSize.height : paperSize.width;
  const canvasHeight = isLandscape ? paperSize.width : paperSize.height;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D rendering context');
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const viewPlacement of sheet.views) {
    const viewCanvas = await captureView(viewPlacement.viewType, {
      pixelRatio: options.pixelRatio,
      quality: options.quality,
    });
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

export type ViewType = ViewType2D;

export interface MultiViewExportOptions {
  format: 'png' | 'pdf' | 'svg' | 'dxf';
  quality: number;
  pixelRatio: number;
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

export const PAPER_SIZES = {
  A4: { width: 595, height: 842 },
  A3: { width: 842, height: 1191 },
  A2: { width: 1191, height: 1684 },
  A1: { width: 1684, height: 2384 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  Tabloid: { width: 792, height: 1224 },
};

export const DEFAULT_MULTI_VIEW_OPTIONS: MultiViewExportOptions = {
  format: 'pdf',
  quality: 0.9,
  pixelRatio: 2,
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

export function generateDrawingSheetLayout(
  options: MultiViewExportOptions
): DrawingSheetLayout {
  const paperSize = PAPER_SIZES[options.paperSize];
  const isLandscape = options.orientation === 'landscape';

  const paperWidth = isLandscape ? paperSize.height : paperSize.width;
  const paperHeight = isLandscape ? paperSize.width : paperSize.height;

  const availableWidth = paperWidth - options.margins.left - options.margins.right;
  const availableHeight = paperHeight - options.margins.top - options.margins.bottom - 80;

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

function generateViewportLayouts(
  views: ViewType2D[],
  availableWidth: number,
  availableHeight: number,
  layout: 'grid' | 'sequential' | 'custom',
  spacing: number
): ViewportLayout[] {
  const viewports: ViewportLayout[] = [];

  if (layout === 'grid') {
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

export async function exportMultiViewToPDF(
  stages: Record<ViewType2D, Stage>,
  options: MultiViewExportOptions
): Promise<Blob> {
  const layout = generateDrawingSheetLayout(options);

  const pdf = new jsPDF({
    orientation: options.orientation,
    unit: 'pt',
    format: [layout.paperWidth, layout.paperHeight],
  });

  addTitleBlockToPDF(pdf, layout.titleBlock);

  for (const viewport of layout.viewports) {
    const stage = stages[viewport.viewType];
    if (stage) {
      await addViewToPDF(pdf, stage, viewport, options);
    }
  }

  return pdf.output('blob');
async function addViewToPDF(pdf: any, stage: any, viewport: any, options: any) {
  // Simulate adding a view image to the PDF at the viewport's position/size
  const dataURL = stage.toDataURL
    ? stage.toDataURL({
        mimeType: 'image/png',
        quality: options.quality || 1.0,
        pixelRatio: options.pixelRatio || 2,
      })
    : '';
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
}
}

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

  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const stageRegistry = new Map<ViewType, Stage>();

export function registerStage(viewType: ViewType, stage: Stage): void {
  stageRegistry.set(viewType, stage);
}

export function getStage(viewType: ViewType): Stage | undefined {
  return stageRegistry.get(viewType);
}

export function clearStageRegistry(): void {
  stageRegistry.clear();
}

export async function captureView(
  view: ViewType,
  options: { pixelRatio?: number; quality?: number } = {}
): Promise<HTMLCanvasElement> {
  const stage = getStage(view);

  if (!stage) {
    throw new Error(`No stage registered for view type: ${view}`);
  }

  try {
    const { pixelRatio = 2, quality = 1.0 } = options;
    const canvas = stage.toCanvas({
      pixelRatio,
      quality,
    });

    return canvas;
  } catch (error) {
    throw new Error(`Failed to capture view "${view}": ${error}`);
  }
}

export interface PNGExportOptions {
  mimeType?: string;
  quality?: number;
  pixelRatio?: number;
  width?: number;
  height?: number;
  filename?: string;
}

export const DEFAULT_PNG_OPTIONS: PNGExportOptions = {
  mimeType: 'image/png',
  quality: 1.0,
  pixelRatio: 2,
};

export async function exportPNG(
  view: ViewType,
  options: PNGExportOptions = {}
): Promise<void> {
  const stage = getStage(view);

  if (!stage) {
    throw new Error(`No stage registered for view type: ${view}`);
  }

  const opts = { ...DEFAULT_PNG_OPTIONS, ...options };

  try {
    const dataURL = stage.toDataURL({
      mimeType: opts.mimeType || 'image/png',
      quality: opts.quality || 1.0,
      pixelRatio: opts.pixelRatio || 2,
      width: opts.width,
      height: opts.height,
    });

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${opts.filename || 'house-plan'}-${view}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw new Error(`Failed to export PNG for view "${view}": ${error}`);
  }
}

export interface PDFExportOptions {
  paperSize?: 'A4' | 'A3' | 'A2' | 'A1' | 'Letter' | 'Legal' | 'Tabloid';
  orientation?: 'portrait' | 'landscape';
  scale?: number;
  addTitleBlock?: boolean;
  centerImage?: boolean;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  title?: string;
  description?: string;
  filename?: string;
}

export const DEFAULT_PDF_OPTIONS: PDFExportOptions = {
  paperSize: 'A4',
  orientation: 'landscape',
  scale: 1,
  addTitleBlock: true,
  centerImage: false,
  margins: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
};

export async function exportPDF(
  view: ViewType,
  options: PDFExportOptions = {}
): Promise<void> {
  const stage = getStage(view);

  if (!stage) {
    throw new Error(`No stage registered for view type: ${view}`);
  }

  const opts = { ...DEFAULT_PDF_OPTIONS, ...options };

  try {
    const paperSize = PAPER_SIZES[opts.paperSize || 'A4'];
    const isLandscape = opts.orientation === 'landscape';

    const paperWidth = isLandscape ? paperSize.height : paperSize.width;
    const paperHeight = isLandscape ? paperSize.width : paperSize.height;

    const pdf = new jsPDF({
      orientation: opts.orientation || 'landscape',
      unit: 'pt',
      format: [paperWidth, paperHeight],
    });

    const dataURL = stage.toDataURL({
      mimeType: 'image/png',
      quality: opts.quality || 1.0,
      pixelRatio: opts.pixelRatio || 2,
    });

    const margins = opts.margins || { top: 50, right: 50, bottom: 50, left: 50 };
    const availableWidth = paperWidth - margins.left - margins.right;
    const availableHeight = paperHeight - margins.top - margins.bottom;

    const titleBlockHeight = opts.addTitleBlock ? 80 : 0;
    const imageHeight = availableHeight - titleBlockHeight;

    const stageWidth = stage.width();
    const stageHeight = stage.height();

    const scaleX = availableWidth / stageWidth;
    const scaleY = imageHeight / stageHeight;
    const scale = Math.min(scaleX, scaleY) * (opts.scale || 1);

    const finalWidth = stageWidth * scale;
    const finalHeight = stageHeight * scale;

    let x = margins.left;
    let y = margins.top;

    if (opts.centerImage) {
      x = margins.left + (availableWidth - finalWidth) / 2;
      y = margins.top + (imageHeight - finalHeight) / 2;
    }

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

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, finalWidth, finalHeight);

    pdf.save(`${opts.filename || 'house-plan'}-${view}.pdf`);
  } catch (error) {
    throw new Error(`Failed to export PDF for view "${view}": ${error}`);
  }
}

export function generateExportPreview(): ExportPreview {
  return {
    dataUrl: '',
    width: 0,
    height: 0,
    viewports: [],
  };
}

export function addTitleBlockToPDF(pdf: jsPDF, titleBlock: TitleBlockLayout): void {
  const { x, y, width, height, title, description, date, scale, drawnBy, checkedBy, projectNumber } = titleBlock;
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(1);
  pdf.rect(x, y, width, height);
  pdf.setFontSize(12);
  pdf.text(title, x + 10, y + 20);
  pdf.text(description, x + 10, y + 35);
  pdf.text(`Date: ${date}`, x + 10, y + 50);
  pdf.text(`Scale: ${scale}`, x + 10, y + 65);
  pdf.text(`Drawn by: ${drawnBy}`, x + 10, y + 80);
  pdf.text(`Checked by: ${checkedBy}`, x + 10, y + 95);
  pdf.text(`Project #: ${projectNumber}`, x + 10, y + 110);
}

export default {
  composeSheet,
  exportMultiViewToPDF,
  generateExportPreview,
  batchExport,
  downloadBatchAsZip,
  generateDrawingSheetLayout,
  DEFAULT_MULTI_VIEW_OPTIONS,
  PAPER_SIZES,
  captureView,
  exportPNG,
  exportPDF,
  registerStage,
  getStage,
  clearStageRegistry,
  DEFAULT_PNG_OPTIONS,
  DEFAULT_PDF_OPTIONS,
};
