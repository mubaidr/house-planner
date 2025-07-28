/**
 * Configuration constants for elevation view rendering
 */
export const ELEVATION_VIEW_CONFIG = {
  colors: {
    dimension: '#666666',
    wall: '#333333',
    door: '#8B4513',
    window: '#4169E1',
    roof: '#654321',
    stair: '#708090',
    background: '#FFFFFF',
    grid: '#E5E5E5',
    selected: '#3B82F6',
    ground: '#8B7355',
    shadow: '#00000020'
  },
  
  lineWeights: {
    dimension: 1,
    wall: 2,
    door: 1.5,
    window: 1.5,
    roof: 2,
    stair: 1.5,
    grid: 0.5,
    outline: 3
  },
  
  dimensionSettings: {
    textSize: 12,
    lineExtension: 10,
    arrowSize: 8,
    lineWidth: 1,
    offset: 20,
    precision: 2
  },
  
  materialSettings: {
    patternScale: 1,
    opacity: 0.8,
    strokeWidth: 1,
    showShadows: true,
    shadowOffset: 2,
    shadowOpacity: 0.3
  },
  
  heightReferences: {
    groundLevel: 0,
    standardCeiling: 240, // 8 feet in cm
    standardDoor: 200,    // Standard door height
    standardWindow: 120   // Standard window sill height
  },
  
  viewSettings: {
    scale: 1,
    gridSize: 20,
    snapTolerance: 5,
    selectionTolerance: 10
  }
} as const;

export type ElevationViewConfig = typeof ELEVATION_VIEW_CONFIG;