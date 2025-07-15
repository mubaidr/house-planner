import { Stage } from 'konva/lib/Stage';
import jsPDF from 'jspdf';

export interface ExportOptions {
  format: 'png' | 'pdf' | 'svg' | 'dxf';
  quality: number; // 0.1 to 1.0 for PNG, DPI for PDF
  includeGrid: boolean;
  includeRooms: boolean;
  includeMeasurements: boolean;
  paperSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  scale?: number; // Scale factor for export
  title?: string;
  description?: string;
  // Additional options for new formats
  units?: 'mm' | 'cm' | 'in' | 'ft';
  precision?: number;
}

export interface ExportResult {
  success: boolean;
  dataUrl?: string;
  blob?: Blob;
  error?: string;
}

/**
 * Export canvas as PNG image
 */
export const exportToPNG = async (
  stage: Stage,
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    // Configure stage for export
    const originalScale = { x: stage.scaleX(), y: stage.scaleY() };
    const originalPosition = { x: stage.x(), y: stage.y() };
    
    // Reset stage position and apply export scale
    stage.position({ x: 0, y: 0 });
    if (options.scale && options.scale !== 1) {
      stage.scale({ 
        x: originalScale.x * options.scale, 
        y: originalScale.y * options.scale 
      });
    }
    
    // Hide grid if not included in export
    if (!options.includeGrid) {
      const gridLayers = stage.find('.grid-layer');
      gridLayers.forEach(layer => layer.hide());
    }
    
    // Hide measurements if not included
    if (!options.includeMeasurements) {
      const measurementLayers = stage.find('.measurement-layer');
      measurementLayers.forEach(layer => layer.hide());
    }
    
    // Generate the image
    const dataUrl = stage.toDataURL({
      mimeType: 'image/png',
      quality: options.quality,
      pixelRatio: options.quality >= 0.9 ? 2 : 1, // High quality uses 2x pixel ratio
    });
    
    // Convert to blob
    const blob = await dataURLToBlob(dataUrl);
    
    // Restore original stage state
    stage.scale(originalScale);
    stage.position(originalPosition);
    
    // Show hidden layers
    if (!options.includeGrid) {
      const gridLayers = stage.find('.grid-layer');
      gridLayers.forEach(layer => layer.show());
    }
    
    if (!options.includeMeasurements) {
      const measurementLayers = stage.find('.measurement-layer');
      measurementLayers.forEach(layer => layer.show());
    }
    
    return {
      success: true,
      dataUrl,
      blob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Export canvas as PDF document
 */
export const exportToPDF = async (
  stage: Stage,
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    // First generate PNG
    const pngResult = await exportToPNG(stage, { ...options, format: 'png' });
    if (!pngResult.success || !pngResult.dataUrl) {
      return { success: false, error: 'Failed to generate PNG for PDF' };
    }
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: options.orientation || 'landscape',
      unit: 'mm',
      format: options.paperSize || 'A4',
    });
    
    // Get PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add title if provided
    if (options.title) {
      pdf.setFontSize(16);
      pdf.text(options.title, 20, 20);
    }
    
    // Add description if provided
    if (options.description) {
      pdf.setFontSize(10);
      pdf.text(options.description, 20, options.title ? 30 : 20);
    }
    
    // Calculate image position and size
    const margin = 20;
    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2) - (options.title ? 20 : 0) - (options.description ? 10 : 0);
    
    // Add the image
    const yPosition = margin + (options.title ? 20 : 0) + (options.description ? 10 : 0);
    pdf.addImage(
      pngResult.dataUrl,
      'PNG',
      margin,
      yPosition,
      availableWidth,
      availableHeight,
      undefined,
      'FAST'
    );
    
    // Add metadata
    pdf.setProperties({
      title: options.title || 'House Plan',
      subject: options.description || 'Created with 2D House Planner',
      creator: '2D House Planner',
      keywords: 'house plan, architecture, design',
    });
    
    // Convert to blob
    const pdfBlob = pdf.output('blob');
    
    return {
      success: true,
      blob: pdfBlob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PDF generation failed',
    };
  }
};

/**
 * Generate preview image for export dialog
 */
export const getExportPreview = async (
  stage: Stage,
  maxWidth: number = 300,
  maxHeight: number = 200
): Promise<string> => {
  try {
    // Calculate scale to fit preview dimensions
    const stageBounds = stage.getClientRect();
    const scaleX = maxWidth / stageBounds.width;
    const scaleY = maxHeight / stageBounds.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
    
    const previewResult = await exportToPNG(stage, {
      format: 'png',
      quality: 0.7,
      scale,
      includeGrid: false,
      includeRooms: true,
      includeMeasurements: false,
    });
    
    return previewResult.dataUrl || '';
  } catch (error) {
    console.error('Failed to generate preview:', error);
    return '';
  }
};

/**
 * Convert data URL to Blob
 */
const dataURLToBlob = async (dataURL: string): Promise<Blob> => {
  const response = await fetch(dataURL);
  return response.blob();
};

/**
 * Download file to user's device
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate filename based on options
 */
export const generateFilename = (
  format: 'png' | 'pdf',
  title?: string
): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const baseName = title ? title.replace(/[^a-zA-Z0-9]/g, '_') : 'house_plan';
  return `${baseName}_${timestamp}.${format}`;
};

/**
 * Export canvas as PDF (duplicate removed)
 */
// Removed duplicate function
/*
const exportToPDFDuplicate = async (
  stage: Stage,
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    // Paper size configurations (in mm)
    const paperSizes = {
      A4: { width: 210, height: 297 },
      A3: { width: 297, height: 420 },
      Letter: { width: 215.9, height: 279.4 },
      Legal: { width: 215.9, height: 355.6 },
    };
    
    const paperSize = paperSizes[options.paperSize || 'A4'];
    const isLandscape = options.orientation === 'landscape';
    
    const pdfWidth = isLandscape ? paperSize.height : paperSize.width;
    const pdfHeight = isLandscape ? paperSize.width : paperSize.height;
    
    // Create PDF document
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.paperSize || 'A4',
    });
    
    // Get stage image
    const stageBounds = stage.getClientRect();
    const dataUrl = stage.toDataURL({
      mimeType: 'image/png',
      quality: 1.0,
      pixelRatio: 2,
    });
    
    // Calculate dimensions to fit the page with margins
    const margin = 20; // 20mm margin
    const availableWidth = pdfWidth - 2 * margin;
    const availableHeight = pdfHeight - 2 * margin - 30; // Extra space for title
    
    const aspectRatio = stageBounds.width / stageBounds.height;
    let imageWidth = availableWidth;
    let imageHeight = availableWidth / aspectRatio;
    
    if (imageHeight > availableHeight) {
      imageHeight = availableHeight;
      imageWidth = availableHeight * aspectRatio;
    }
    
    // Add title if provided
    if (options.title) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(options.title, pdfWidth / 2, margin, { align: 'center' });
    }
    
    // Add description if provided
    if (options.description) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(options.description, pdfWidth / 2, margin + 10, { align: 'center' });
    }
    
    // Add the image
    const imageY = options.title ? margin + 20 : margin;
    const imageX = (pdfWidth - imageWidth) / 2;
    
    pdf.addImage(dataUrl, 'PNG', imageX, imageY, imageWidth, imageHeight);
    
    // Add metadata
    pdf.setProperties({
      title: options.title || 'House Plan',
      subject: 'Architectural Floor Plan',
      author: '2D House Planner',
      creator: '2D House Planner Web App',
    });
    
    // Convert to blob
    const pdfBlob = pdf.output('blob');
    const pdfDataUrl = pdf.output('datauristring');
    
    return {
      success: true,
      dataUrl: pdfDataUrl,
      blob: pdfBlob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
*/

/**
 * Download file from blob (duplicate removed)
 */
/*
const downloadFileDuplicate = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
*/

/**
 * Generate filename with timestamp (duplicate removed)
 */
/*
const generateFilenameDuplicate = (
  format: 'png' | 'pdf',
  title?: string
): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const baseName = title ? title.replace(/[^a-zA-Z0-9]/g, '_') : 'house_plan';
  return `${baseName}_${timestamp}.${format}`;
};
*/

/**
 * Get export preview (smaller version for UI) (duplicate removed)
 */
/*
const getExportPreviewDuplicate = async (
  stage: Stage,
  maxWidth: number = 200,
  maxHeight: number = 150
): Promise<string> => {
  const stageBounds = stage.getClientRect();
  const aspectRatio = stageBounds.width / stageBounds.height;
  
  let previewWidth = maxWidth;
  let previewHeight = maxWidth / aspectRatio;
  
  if (previewHeight > maxHeight) {
    previewHeight = maxHeight;
    previewWidth = maxHeight * aspectRatio;
  }
  
  const scale = previewWidth / stageBounds.width;
  
  return stage.toDataURL({
    mimeType: 'image/png',
    quality: 0.8,
    pixelRatio: scale,
  });
};
*/