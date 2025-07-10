import { Stage } from 'konva/lib/Stage';
import jsPDF from 'jspdf';

export interface ExportOptions {
  format: 'png' | 'pdf';
  quality: number; // 0.1 to 1.0 for PNG, DPI for PDF
  includeGrid: boolean;
  includeRooms: boolean;
  includeMeasurements: boolean;
  paperSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  scale?: number; // Scale factor for export
  title?: string;
  description?: string;
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
    // Get the stage bounds
    const stageBounds = stage.getClientRect();
    
    // Create a temporary stage for export
    const exportStage = stage.clone();
    exportStage.width(stageBounds.width);
    exportStage.height(stageBounds.height);
    
    // Apply scale if specified
    if (options.scale && options.scale !== 1) {
      exportStage.scale({ x: options.scale, y: options.scale });
      exportStage.width(stageBounds.width * options.scale);
      exportStage.height(stageBounds.height * options.scale);
    }
    
    // Generate the image
    const dataUrl = exportStage.toDataURL({
      mimeType: 'image/png',
      quality: options.quality,
      pixelRatio: 2, // High DPI for crisp export
    });
    
    // Convert to blob for download
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    exportStage.destroy();
    
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
 * Export canvas as PDF
 */
export const exportToPDF = async (
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
};

/**
 * Download file from blob
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
 * Generate filename with timestamp
 */
export const generateFilename = (
  format: 'png' | 'pdf',
  title?: string
): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const baseName = title ? title.replace(/[^a-zA-Z0-9]/g, '_') : 'house_plan';
  return `${baseName}_${timestamp}.${format}`;
};

/**
 * Get export preview (smaller version for UI)
 */
export const getExportPreview = async (
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