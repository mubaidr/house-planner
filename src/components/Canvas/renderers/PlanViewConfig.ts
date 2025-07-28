/**
 * Configuration constants for plan view rendering
 */
export const PLAN_VIEW_CONFIG = {
  colors: {
    dimension: '#666666',
    wall: '#333333',
    door: '#8B4513',
    window: '#4169E1',
    room: '#F5F5F5',
    stair: '#708090',
    annotation: '#000000',
    background: '#FFFFFF',
    grid: '#E5E5E5',
    selected: '#3B82F6'
  },
  
  lineWeights: {
    dimension: 1,
    wall: 2,
    door: 1.5,
    window: 1.5,
    room: 1,
    stair: 1.5,
    annotation: 1,
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
  
  viewSettings: {
    scale: 1,
    gridSize: 20,
    snapTolerance: 5,
    selectionTolerance: 10
  }
} as const;

export type PlanViewConfig = typeof PLAN_VIEW_CONFIG;