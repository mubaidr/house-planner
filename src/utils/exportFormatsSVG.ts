/**
 * SVG Export Utilities
 * 
 * Provides SVG export functionality for CAD compatibility
 * SVG is vector-based and maintains precision for technical drawings
 */

import { Stage } from 'konva/lib/Stage';
import { ViewType2D } from '@/types/views';
import { Element2D } from '@/types/elements2D';

export interface SVGExportOptions {
  width: number;
  height: number;
  scale: number;
  includeGrid: boolean;
  includeMeasurements: boolean;
  includeAnnotations: boolean;
  precision: number; // Decimal places for coordinates
  units: 'mm' | 'cm' | 'in' | 'ft';
  strokeWidth: number;
  fontSize: number;
  title?: string;
  description?: string;
}

export const DEFAULT_SVG_OPTIONS: SVGExportOptions = {
  width: 800,
  height: 600,
  scale: 1,
  includeGrid: false,
  includeMeasurements: true,
  includeAnnotations: true,
  precision: 2,
  units: 'mm',
  strokeWidth: 1,
  fontSize: 12,
  title: 'House Plan',
  description: 'Exported from 2D House Planner',
};

/**
 * Export a Konva stage to SVG format
 */
export async function exportStageToSVG(
  stage: Stage,
  options: Partial<SVGExportOptions> = {}
): Promise<{ success: boolean; svg?: string; blob?: Blob; error?: string }> {
  try {
    const opts = { ...DEFAULT_SVG_OPTIONS, ...options };
    
    // Get stage dimensions
    const stageRect = stage.getClientRect();
    const width = opts.width || stageRect.width;
    const height = opts.height || stageRect.height;
    
    // Create SVG document
    const svg = createSVGDocument(width, height, opts);
    
    // Convert stage elements to SVG
    const svgContent = await convertStageToSVG(stage, opts);
    
    // Combine header and content
    const completeSVG = svg.replace('</svg>', svgContent + '</svg>');
    
    // Create blob
    const blob = new Blob([completeSVG], { type: 'image/svg+xml' });
    
    return {
      success: true,
      svg: completeSVG,
      blob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SVG export failed',
    };
  }
}

/**
 * Export multiple views to SVG
 */
export async function exportMultiViewToSVG(
  stages: Record<ViewType2D, Stage | null>,
  views: ViewType2D[],
  options: Partial<SVGExportOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_SVG_OPTIONS, ...options };
  
  // Calculate layout dimensions
  const viewWidth = opts.width / Math.ceil(Math.sqrt(views.length));
  const viewHeight = opts.height / Math.ceil(views.length / Math.ceil(Math.sqrt(views.length)));
  
  // Create master SVG document
  const svg = createSVGDocument(opts.width, opts.height, opts);
  let content = '';
  
  // Add title
  if (opts.title) {
    content += `<text x="${opts.width / 2}" y="30" text-anchor="middle" font-size="${opts.fontSize + 4}" font-weight="bold">${opts.title}</text>\n`;
  }
  
  // Process each view
  let viewIndex = 0;
  for (const view of views) {
    const stage = stages[view];
    if (!stage) continue;
    
    const col = viewIndex % Math.ceil(Math.sqrt(views.length));
    const row = Math.floor(viewIndex / Math.ceil(Math.sqrt(views.length)));
    
    const x = col * viewWidth + 20;
    const y = row * viewHeight + 60;
    
    // Add view group
    content += `<g transform="translate(${x}, ${y})">\n`;
    
    // Add view title
    content += `<text x="${viewWidth / 2}" y="20" text-anchor="middle" font-size="${opts.fontSize}" font-weight="bold">${view.toUpperCase()} VIEW</text>\n`;
    
    // Add view content
    const viewSVG = await convertStageToSVG(stage, {
      ...opts,
      width: viewWidth - 40,
      height: viewHeight - 40,
    });
    
    content += `<g transform="translate(0, 30)">\n${viewSVG}\n</g>\n`;
    content += `</g>\n`;
    
    viewIndex++;
  }
  
  // Complete SVG
  const completeSVG = svg.replace('</svg>', content + '</svg>');
  
  return new Blob([completeSVG], { type: 'image/svg+xml' });
}

/**
 * Create SVG document header
 */
function createSVGDocument(width: number, height: number, options: SVGExportOptions): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <style>
      .wall { fill: #f5f5f5; stroke: #333; stroke-width: ${options.strokeWidth}; }
      .door { fill: #8b4513; stroke: #654321; stroke-width: ${options.strokeWidth}; }
      .window { fill: #87ceeb; stroke: #4169e1; stroke-width: ${options.strokeWidth}; }
      .room { fill: #f0f0f0; stroke: #e0e0e0; stroke-width: ${options.strokeWidth * 0.5}; opacity: 0.3; }
      .dimension { stroke: #ff0000; stroke-width: ${options.strokeWidth * 0.5}; fill: none; }
      .dimension-text { font-family: Arial, sans-serif; font-size: ${options.fontSize}px; fill: #ff0000; }
      .grid { stroke: #e5e5e5; stroke-width: ${options.strokeWidth * 0.25}; }
      .annotation { font-family: Arial, sans-serif; font-size: ${options.fontSize}px; fill: #333; }
    </style>
  </defs>
  <metadata>
    <title>${options.title || 'House Plan'}</title>
    <description>${options.description || 'Exported from 2D House Planner'}</description>
    <units>${options.units}</units>
    <scale>${options.scale}</scale>
  </metadata>
</svg>`;`;
}

/**
 * Convert Konva stage to SVG elements
 */
async function convertStageToSVG(stage: Stage, options: SVGExportOptions): Promise<string> {
  let svg = '';
  
  // Add grid if enabled
  if (options.includeGrid) {
    svg += generateGridSVG(options.width, options.height, options);
  }
  
  // Process each layer
  const layers = stage.getLayers();
  for (const layer of layers) {
    svg += await convertLayerToSVG(layer, options);
  }
  
  return svg;
}

/**
 * Generate grid SVG
 */
function generateGridSVG(width: number, height: number, options: SVGExportOptions): string {
  const gridSize = 20; // Grid spacing
  let svg = '<g class="grid-group">\n';
  
  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    svg += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" class="grid" />`;
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" class="grid" />\n`
  }
  
  svg += '</g>\n';
  return svg;
}

/**
 * Convert Konva layer to SVG
 */
async function convertLayerToSVG(layer: any, options: SVGExportOptions): Promise<string> {
  let svg = '';
  const children = layer.getChildren();
  
  for (const child of children) {
    svg += convertNodeToSVG(child, options);
  }
  
  return svg;
}

/**
 * Convert Konva node to SVG element
 */
function convertNodeToSVG(node: any, options: SVGExportOptions): string {
  const className = node.className || '';
  const transform = getNodeTransform(node);
  
  switch (className) {
    case 'Line':
      return convertLineToSVG(node, transform, options);
    case 'Rect':
      return convertRectToSVG(node, transform, options);
    case 'Circle':
      return convertCircleToSVG(node, transform, options);
    case 'Text':
      return convertTextToSVG(node, transform, options);
    case 'Path':
      return convertPathToSVG(node, transform, options);
    case 'Group':
      return convertGroupToSVG(node, transform, options);
    default:
      return '';
  }
}

/**
 * Get node transformation
 */
function getNodeTransform(node: any): string {
  const x = node.x() || 0;
  const y = node.y() || 0;
  const rotation = node.rotation() || 0;
  const scaleX = node.scaleX() || 1;
  const scaleY = node.scaleY() || 1;
  
  let transform = '';
  
  if (x !== 0 || y !== 0) {
    transform += `translate(${x}, ${y}) `;
  }
  
  if (rotation !== 0) {
    transform += `rotate(${rotation * 180 / Math.PI}) `;
  }
  
  if (scaleX !== 1 || scaleY !== 1) {
    transform += `scale(${scaleX}, ${scaleY}) `;
  }
  
  return transform.trim();
}

/**
 * Convert Konva Line to SVG
 */
function convertLineToSVG(line: any, transform: string, options: SVGExportOptions): string {
  const points = line.points() || [];
  const stroke = line.stroke() || '#000';
  const strokeWidth = line.strokeWidth() || 1;
  const closed = line.closed() || false;
  
  if (points.length < 4) return '';
  
  let pathData = `M ${points[0]} ${points[1]}`;
  for (let i = 2; i < points.length; i += 2) {
    pathData += ` L ${points[i]} ${points[i + 1]}`;
  }
  
  if (closed) {
    pathData += ' Z';
  }
  
  const transformAttr = transform ? ` transform="${transform}"` : '';
  
  return `<path d="${pathData}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none"${transformAttr} />\n`;
}

/**
 * Convert Konva Rect to SVG
 */
function convertRectToSVG(rect: any, transform: string, options: SVGExportOptions): string {
  const x = rect.x() || 0;
  const y = rect.y() || 0;
  const width = rect.width() || 0;
  const height = rect.height() || 0;
  const fill = rect.fill() || 'none';
  const stroke = rect.stroke() || 'none';
  const strokeWidth = rect.strokeWidth() || 1;
  
  const transformAttr = transform ? ` transform="${transform}"` : '';
  
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${transformAttr} />\n`;
}

/**
 * Convert Konva Circle to SVG
 */
function convertCircleToSVG(circle: any, transform: string, options: SVGExportOptions): string {
  const x = circle.x() || 0;
  const y = circle.y() || 0;
  const radius = circle.radius() || 0;
  const fill = circle.fill() || 'none';
  const stroke = circle.stroke() || 'none';
  const strokeWidth = circle.strokeWidth() || 1;
  
  const transformAttr = transform ? ` transform="${transform}"` : '';
  
  return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${transformAttr} />\n`;
}

/**
 * Convert Konva Text to SVG
 */
function convertTextToSVG(text: any, transform: string, options: SVGExportOptions): string {
  const x = text.x() || 0;
  const y = text.y() || 0;
  const content = text.text() || '';
  const fontSize = text.fontSize() || options.fontSize;
  const fontFamily = text.fontFamily() || 'Arial';
  const fill = text.fill() || '#000';
  
  const transformAttr = transform ? ` transform="${transform}"` : '';
  
  return `<text x="${x}" y="${y}" font-family="${fontFamily}" font-size="${fontSize}" fill="${fill}"${transformAttr}>${content}</text>\n`;
}

/**
 * Convert Konva Path to SVG
 */
function convertPathToSVG(path: any, transform: string, options: SVGExportOptions): string {
  const data = path.data() || '';
  const fill = path.fill() || 'none';
  const stroke = path.stroke() || 'none';
  const strokeWidth = path.strokeWidth() || 1;
  
  const transformAttr = transform ? ` transform="${transform}"` : '';
  
  return `<path d="${data}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${transformAttr} />\n`;
}

/**
 * Convert Konva Group to SVG
 */
function convertGroupToSVG(group: any, transform: string, options: SVGExportOptions): string {
  const transformAttr = transform ? ` transform="${transform}"` : '';
  let svg = `<g${transformAttr}>\n`;
  
  const children = group.getChildren();
  for (const child of children) {
    svg += convertNodeToSVG(child, options);
  }
  
  svg += '</g>\n';
  return svg;
}

/**
 * Generate filename for SVG export
 */
export function generateSVGFilename(title: string = 'house-plan'): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${sanitizedTitle}-${timestamp}.svg`;
}