/**
 * DXF Export Utilities
 * 
 * Provides DXF export functionality for CAD compatibility
 * DXF (Drawing Exchange Format) is widely supported by CAD software
 */

import { Stage } from 'konva/lib/Stage';
import { ViewType2D } from '@/types/views';

export interface DXFExportOptions {
  units: 'mm' | 'cm' | 'in' | 'ft';
  precision: number;
  includeGrid: boolean;
  includeMeasurements: boolean;
  includeAnnotations: boolean;
  layerPrefix: string;
  scale: number;
  title?: string;
  description?: string;
}

export const DEFAULT_DXF_OPTIONS: DXFExportOptions = {
  units: 'mm',
  precision: 2,
  includeGrid: false,
  includeMeasurements: true,
  includeAnnotations: true,
  layerPrefix: 'HP_', // House Planner prefix
  scale: 1,
  title: 'House Plan',
  description: 'Exported from 2D House Planner',
};

/**
 * DXF Layer definitions
 */
export const DXF_LAYERS = {
  WALLS: 'WALLS',
  DOORS: 'DOORS',
  WINDOWS: 'WINDOWS',
  STAIRS: 'STAIRS',
  ROOFS: 'ROOFS',
  ROOMS: 'ROOMS',
  DIMENSIONS: 'DIMENSIONS',
  ANNOTATIONS: 'ANNOTATIONS',
  GRID: 'GRID',
  CENTERLINES: 'CENTERLINES',
};

/**
 * DXF Color codes (AutoCAD standard)
 */
export const DXF_COLORS = {
  BLACK: 7,
  RED: 1,
  YELLOW: 2,
  GREEN: 3,
  CYAN: 4,
  BLUE: 5,
  MAGENTA: 6,
  WHITE: 7,
  GRAY: 8,
  LIGHT_GRAY: 9,
};

/**
 * Export a Konva stage to DXF format
 */
export async function exportStageToDXF(
  stage: Stage,
  options: Partial<DXFExportOptions> = {}
): Promise<{ success: boolean; dxf?: string; blob?: Blob; error?: string }> {
  try {
    const opts = { ...DEFAULT_DXF_OPTIONS, ...options };
    
    // Create DXF document
    let dxf = createDXFHeader(opts);
    
    // Add layers
    dxf += createDXFLayers(opts);
    
    // Convert stage elements to DXF entities
    const entities = await convertStageToDXF(stage, opts);
    dxf += entities;
    
    // Add DXF footer
    dxf += createDXFFooter();
    
    // Create blob
    const blob = new Blob([dxf], { type: 'application/dxf' });
    
    return {
      success: true,
      dxf,
      blob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'DXF export failed',
    };
  }
}

/**
 * Export multiple views to DXF
 */
export async function exportMultiViewToDXF(
  stages: Record<ViewType2D, Stage | null>,
  views: ViewType2D[],
  options: Partial<DXFExportOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_DXF_OPTIONS, ...options };
  
  // Create DXF document
  let dxf = createDXFHeader(opts);
  
  // Add layers for all views
  dxf += createDXFLayersMultiView(views, opts);
  
  // Process each view
  let viewOffset = 0;
  const viewSpacing = 1000; // Units between views
  
  for (const view of views) {
    const stage = stages[view];
    if (!stage) continue;
    
    // Add view-specific entities with offset
    const entities = await convertStageToDXF(stage, {
      ...opts,
      layerPrefix: `${opts.layerPrefix}${view.toUpperCase()}_`,
    }, viewOffset);
    
    dxf += entities;
    
    // Add view title as text
    dxf += createDXFText(
      viewOffset + 100,
      -50,
      `${view.toUpperCase()} VIEW`,
      5, // Text height
      `${opts.layerPrefix}TITLES`
    );
    
    viewOffset += viewSpacing;
  }
  
  // Add DXF footer
  dxf += createDXFFooter();
  
  return new Blob([dxf], { type: 'application/dxf' });
}

/**
 * Create DXF header section
 */
function createDXFHeader(options: DXFExportOptions): string {
  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$DWGCODEPAGE
3
ANSI_1252
9
$INSUNITS
70
${getUnitsCode(options.units)}
9
$MEASUREMENT
70
1
0
ENDSEC
`;
}

/**
 * Create DXF layers section
 */
function createDXFLayers(options: DXFExportOptions): string {
  let layers = `0
SECTION
2
TABLES
0
TABLE
2
LAYER
5
2
330
0
100
AcDbSymbolTable
70
${Object.keys(DXF_LAYERS).length}
`;

  // Add each layer
  Object.entries(DXF_LAYERS).forEach(([key, layerName], index) => {
    const fullLayerName = `${options.layerPrefix}${layerName}`;
    const color = getLayerColor(layerName);
    
    layers += `0
LAYER
5
${(10 + index).toString(16).toUpperCase()}
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
2
${fullLayerName}
70
0
62
${color}
6
CONTINUOUS
`;
  });

  layers += `0
ENDTAB
0
ENDSEC
`;

  return layers;
}

/**
 * Create DXF layers for multi-view export
 */
function createDXFLayersMultiView(views: ViewType2D[], options: DXFExportOptions): string {
  let layers = `0
SECTION
2
TABLES
0
TABLE
2
LAYER
5
2
330
0
100
AcDbSymbolTable
70
${Object.keys(DXF_LAYERS).length * views.length + 1}
`;

  let layerIndex = 10;

  // Add title layer
  layers += `0
LAYER
5
${layerIndex.toString(16).toUpperCase()}
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
2
${options.layerPrefix}TITLES
70
0
62
${DXF_COLORS.BLUE}
6
CONTINUOUS
`;
  layerIndex++;

  // Add layers for each view
  views.forEach(view => {
    Object.entries(DXF_LAYERS).forEach(([key, layerName]) => {
      const fullLayerName = `${options.layerPrefix}${view.toUpperCase()}_${layerName}`;
      const color = getLayerColor(layerName);
      
      layers += `0
LAYER
5
${layerIndex.toString(16).toUpperCase()}
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
2
${fullLayerName}
70
0
62
${color}
6
CONTINUOUS
`;
      layerIndex++;
    });
  });

  layers += `0
ENDTAB
0
ENDSEC
`;

  return layers;
}

/**
 * Convert Konva stage to DXF entities
 */
async function convertStageToDXF(
  stage: Stage,
  options: DXFExportOptions,
  offsetX: number = 0,
  offsetY: number = 0
): Promise<string> {
  let entities = `0
SECTION
2
ENTITIES
`;

  // Process each layer
  const layers = stage.getLayers();
  for (const layer of layers) {
    entities += await convertLayerToDXF(layer, options, offsetX, offsetY);
  }

  entities += `0
ENDSEC
`;

  return entities;
}

/**
 * Convert Konva layer to DXF entities
 */
async function convertLayerToDXF(
  layer: any,
  options: DXFExportOptions,
  offsetX: number,
  offsetY: number
): Promise<string> {
  let entities = '';
  const children = layer.getChildren();

  for (const child of children) {
    entities += convertNodeToDXF(child, options, offsetX, offsetY);
  }

  return entities;
}

/**
 * Convert Konva node to DXF entity
 */
function convertNodeToDXF(
  node: any,
  options: DXFExportOptions,
  offsetX: number,
  offsetY: number
): string {
  const className = node.className || '';
  
  switch (className) {
    case 'Line':
      return convertLineToDXF(node, options, offsetX, offsetY);
    case 'Rect':
      return convertRectToDXF(node, options, offsetX, offsetY);
    case 'Circle':
      return convertCircleToDXF(node, options, offsetX, offsetY);
    case 'Text':
      return convertTextToDXF(node, options, offsetX, offsetY);
    case 'Group':
      return convertGroupToDXF(node, options, offsetX, offsetY);
    default:
      return '';
  }
}

/**
 * Convert Konva Line to DXF LINE or POLYLINE
 */
function convertLineToDXF(
  line: any,
  options: DXFExportOptions,
  offsetX: number,
  offsetY: number
): string {
  const points = line.points() || [];
  const layerName = getNodeLayer(line, options);
  
  if (points.length < 4) return '';
  
  if (points.length === 4) {
    // Simple line
    return createDXFLine(
      points[0] + offsetX,
      points[1] + offsetY,
      points[2] + offsetX,
      points[3] + offsetY,
      layerName
    );
  } else {
    // Polyline
    return createDXFPolyline(points, offsetX, offsetY, layerName, line.closed());
  }
}

/**
 * Convert Konva Rect to DXF POLYLINE (rectangle)
 */
function convertRectToDXF(
  rect: any,
  options: DXFExportOptions,
  offsetX: number,
  offsetY: number
): string {
  const x = (rect.x() || 0) + offsetX;
  const y = (rect.y() || 0) + offsetY;
  const width = rect.width() || 0;
  const height = rect.height() || 0;
  const layerName = getNodeLayer(rect, options);
  
  // Create rectangle as polyline
  const points = [
    x, y,
    x + width, y,
    x + width, y + height,
    x, y + height
  ];
  
  return createDXFPolyline(points, 0, 0, layerName, true);
}

/**
 * Convert Konva Circle to DXF CIRCLE
 */
function convertCircleToDXF(
  circle: any,
  options: DXFExportOptions,
  offsetX: number,
  offsetY: number
): string {
  const x = (circle.x() || 0) + offsetX;
  const y = (circle.y() || 0) + offsetY;
  const radius = circle.radius() || 0;
  const layerName = getNodeLayer(circle, options);
  
  return createDXFCircle(x, y, radius, layerName);
}

/**
 * Convert Konva Text to DXF TEXT
 */
function convertTextToDXF(
  text: any,
  options: DXFExportOptions,
  offsetX: number,
  offsetY: number
): string {
  const x = (text.x() || 0) + offsetX;
  const y = (text.y() || 0) + offsetY;
  const content = text.text() || '';
  const height = text.fontSize() || 10;
  const layerName = getNodeLayer(text, options);
  
  return createDXFText(x, y, content, height, layerName);
}

/**
 * Convert Konva Group to DXF entities
 */
function convertGroupToDXF(
  group: any,
  options: DXFExportOptions,
  offsetX: number,
  offsetY: number
): string {
  let entities = '';
  const children = group.getChildren();
  
  const groupX = group.x() || 0;
  const groupY = group.y() || 0;
  
  for (const child of children) {
    entities += convertNodeToDXF(child, options, offsetX + groupX, offsetY + groupY);
  }
  
  return entities;
}

/**
 * Create DXF LINE entity
 */
function createDXFLine(x1: number, y1: number, x2: number, y2: number, layer: string): string {
  return `0
LINE
8
${layer}
10
${x1.toFixed(3)}
20
${y1.toFixed(3)}
30
0.0
11
${x2.toFixed(3)}
21
${y2.toFixed(3)}
31
0.0
`;
}

/**
 * Create DXF POLYLINE entity
 */
function createDXFPolyline(
  points: number[],
  offsetX: number,
  offsetY: number,
  layer: string,
  closed: boolean = false
): string {
  let polyline = `0
POLYLINE
8
${layer}
66
1
70
${closed ? 1 : 0}
`;

  // Add vertices
  for (let i = 0; i < points.length; i += 2) {
    polyline += `0
VERTEX
8
${layer}
10
${(points[i] + offsetX).toFixed(3)}
20
${(points[i + 1] + offsetY).toFixed(3)}
30
0.0
`;
  }

  polyline += `0
SEQEND
8
${layer}
`;

  return polyline;
}

/**
 * Create DXF CIRCLE entity
 */
function createDXFCircle(x: number, y: number, radius: number, layer: string): string {
  return `0
CIRCLE
8
${layer}
10
${x.toFixed(3)}
20
${y.toFixed(3)}
30
0.0
40
${radius.toFixed(3)}
`;
}

/**
 * Create DXF TEXT entity
 */
function createDXFText(x: number, y: number, text: string, height: number, layer: string): string {
  return `0
TEXT
8
${layer}
10
${x.toFixed(3)}
20
${y.toFixed(3)}
30
0.0
40
${height.toFixed(3)}
1
${text}
`;
}

/**
 * Create DXF footer
 */
function createDXFFooter(): string {
  return `0
EOF
`;
}

/**
 * Get units code for DXF
 */
function getUnitsCode(units: string): number {
  const codes = {
    mm: 4,
    cm: 5,
    in: 1,
    ft: 2,
  };
  return codes[units as keyof typeof codes] || 4;
}

/**
 * Get layer color for different element types
 */
function getLayerColor(layerName: string): number {
  const colors = {
    WALLS: DXF_COLORS.BLACK,
    DOORS: DXF_COLORS.RED,
    WINDOWS: DXF_COLORS.BLUE,
    STAIRS: DXF_COLORS.GREEN,
    ROOFS: DXF_COLORS.MAGENTA,
    ROOMS: DXF_COLORS.LIGHT_GRAY,
    DIMENSIONS: DXF_COLORS.RED,
    ANNOTATIONS: DXF_COLORS.CYAN,
    GRID: DXF_COLORS.GRAY,
    CENTERLINES: DXF_COLORS.YELLOW,
  };
  return colors[layerName as keyof typeof colors] || DXF_COLORS.BLACK;
}

/**
 * Get appropriate layer name for a node
 */
function getNodeLayer(node: any, options: DXFExportOptions): string {
  // Try to determine layer based on node properties or name
  const nodeName = node.name() || '';
  const className = node.className || '';
  
  if (nodeName.includes('wall') || className.includes('wall')) {
    return `${options.layerPrefix}${DXF_LAYERS.WALLS}`;
  } else if (nodeName.includes('door') || className.includes('door')) {
    return `${options.layerPrefix}${DXF_LAYERS.DOORS}`;
  } else if (nodeName.includes('window') || className.includes('window')) {
    return `${options.layerPrefix}${DXF_LAYERS.WINDOWS}`;
  } else if (nodeName.includes('stair') || className.includes('stair')) {
    return `${options.layerPrefix}${DXF_LAYERS.STAIRS}`;
  } else if (nodeName.includes('roof') || className.includes('roof')) {
    return `${options.layerPrefix}${DXF_LAYERS.ROOFS}`;
  } else if (nodeName.includes('room') || className.includes('room')) {
    return `${options.layerPrefix}${DXF_LAYERS.ROOMS}`;
  } else if (nodeName.includes('dimension') || className.includes('dimension')) {
    return `${options.layerPrefix}${DXF_LAYERS.DIMENSIONS}`;
  } else if (nodeName.includes('annotation') || className.includes('annotation')) {
    return `${options.layerPrefix}${DXF_LAYERS.ANNOTATIONS}`;
  } else if (nodeName.includes('grid') || className.includes('grid')) {
    return `${options.layerPrefix}${DXF_LAYERS.GRID}`;
  }
  
  // Default layer
  return `${options.layerPrefix}${DXF_LAYERS.WALLS}`;
}

/**
 * Generate filename for DXF export
 */
export function generateDXFFilename(title: string = 'house-plan'): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${sanitizedTitle}-${timestamp}.dxf`;
}