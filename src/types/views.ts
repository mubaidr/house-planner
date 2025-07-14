/**
 * View Types and Configuration for 2D Multi-View System
 * 
 * This file defines the view types, configurations, and projection
 * settings for the 2D architectural drawing system.
 */

import { Point2D, Element2D } from './elements2D';

/**
 * Available view types in the 2D system
 */
export type ViewType2D = 'plan' | 'front' | 'back' | 'left' | 'right';

/**
 * View configuration for each view type
 */
export interface ViewConfig2D {
  type: ViewType2D;
  label: string;
  icon: string;
  description: string;
  projection: ProjectionConfig2D;
  defaultScale: number;
  gridConfig: GridConfig2D;
  renderConfig: RenderConfig2D;
  measurementConfig: MeasurementConfig2D;
}

/**
 * Projection configuration for transforming 3D space to 2D view
 */
export interface ProjectionConfig2D {
  // Primary axes for this view (which 3D axes map to 2D x,y)
  primaryAxis: 'xy' | 'xz' | 'yz';
  
  // Direction vectors for the view
  viewDirection: { x: number; y: number; z: number };
  upDirection: { x: number; y: number; z: number };
  rightDirection: { x: number; y: number; z: number };
  
  // Flip axes if needed
  flipX: boolean;
  flipY: boolean;
  
  // Scale factors for different dimensions
  scaleFactors: {
    width: number;   // Horizontal scale
    height: number;  // Vertical scale
    depth: number;   // Depth representation (for thickness)
  };
}

/**
 * Grid configuration for each view
 */
export interface GridConfig2D {
  majorGridSize: number;    // Major grid lines (e.g., 12 inches)
  minorGridSize: number;    // Minor grid lines (e.g., 1 inch)
  majorGridColor: string;
  minorGridColor: string;
  majorGridWeight: number;
  minorGridWeight: number;
  showLabels: boolean;
  labelFrequency: number;   // Show label every N major grid lines
  snapToGrid: boolean;
  snapTolerance: number;
}

/**
 * Rendering configuration for each view
 */
export interface RenderConfig2D {
  // Line weights for different element types
  lineWeights: {
    wall: number;
    door: number;
    window: number;
    stair: number;
    roof: number;
    annotation: number;
    dimension: number;
    hidden: number;
  };
  
  // Line styles
  lineStyles: {
    visible: 'solid' | 'dashed' | 'dotted';
    hidden: 'solid' | 'dashed' | 'dotted';
    centerline: 'solid' | 'dashed' | 'dotted';
    dimension: 'solid' | 'dashed' | 'dotted';
  };
  
  // Colors for different element types
  colors: {
    wall: string;
    door: string;
    window: string;
    stair: string;
    roof: string;
    annotation: string;
    dimension: string;
    grid: string;
    background: string;
  };
  
  // Material rendering settings
  showMaterials: boolean;
  materialOpacity: number;
  showMaterialPatterns: boolean;
  patternScale: number;
}

/**
 * Measurement and dimension configuration
 */
export interface MeasurementConfig2D {
  unit: 'ft' | 'in' | 'm' | 'cm' | 'mm';
  precision: number;
  showDimensions: boolean;
  dimensionTextSize: number;
  dimensionLineExtension: number;
  dimensionTextOffset: number;
  arrowSize: number;
  arrowType: 'arrow' | 'tick' | 'dot' | 'none';
}

/**
 * View state for managing current view settings
 */
export interface ViewState2D {
  currentView: ViewType2D;
  viewConfigs: Record<ViewType2D, ViewConfig2D>;
  isTransitioning: boolean;
  transitionDuration: number;
  
  // Pan and zoom state for each view
  viewStates: Record<ViewType2D, {
    pan: Point2D;
    zoom: number;
    rotation: number; // For rotated views
  }>;
  
  // Layer visibility per view
  layerVisibility: Record<ViewType2D, Record<string, boolean>>;
  
  // Custom view settings
  customSettings: Record<ViewType2D, Partial<ViewConfig2D>>;
}

/**
 * View transition configuration
 */
export interface ViewTransition2D {
  fromView: ViewType2D;
  toView: ViewType2D;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  animateElements: boolean;
  preserveSelection: boolean;
}

/**
 * Default view configurations
 */
export const DEFAULT_VIEW_CONFIGS: Record<ViewType2D, ViewConfig2D> = {
  plan: {
    type: 'plan',
    label: 'Plan View',
    icon: '⬜',
    description: 'Top-down view showing floor layout',
    projection: {
      primaryAxis: 'xy',
      viewDirection: { x: 0, y: 0, z: -1 },
      upDirection: { x: 0, y: 1, z: 0 },
      rightDirection: { x: 1, y: 0, z: 0 },
      flipX: false,
      flipY: false,
      scaleFactors: { width: 1, height: 1, depth: 0.1 }
    },
    defaultScale: 1,
    gridConfig: {
      majorGridSize: 12, // 1 foot
      minorGridSize: 1,  // 1 inch
      majorGridColor: '#cccccc',
      minorGridColor: '#eeeeee',
      majorGridWeight: 1,
      minorGridWeight: 0.5,
      showLabels: true,
      labelFrequency: 5,
      snapToGrid: true,
      snapTolerance: 6
    },
    renderConfig: {
      lineWeights: {
        wall: 2,
        door: 1,
        window: 1,
        stair: 1.5,
        roof: 1,
        annotation: 0.5,
        dimension: 0.5,
        hidden: 0.5
      },
      lineStyles: {
        visible: 'solid',
        hidden: 'dashed',
        centerline: 'dashed',
        dimension: 'solid'
      },
      colors: {
        wall: '#333333',
        door: '#8B4513',
        window: '#4169E1',
        stair: '#696969',
        roof: '#A0522D',
        annotation: '#FF0000',
        dimension: '#0000FF',
        grid: '#CCCCCC',
        background: '#FFFFFF'
      },
      showMaterials: true,
      materialOpacity: 0.7,
      showMaterialPatterns: true,
      patternScale: 1
    },
    measurementConfig: {
      unit: 'ft',
      precision: 2,
      showDimensions: true,
      dimensionTextSize: 10,
      dimensionLineExtension: 6,
      dimensionTextOffset: 4,
      arrowSize: 6,
      arrowType: 'arrow'
    }
  },
  
  front: {
    type: 'front',
    label: 'Front Elevation',
    icon: '⬛',
    description: 'Front view showing vertical elements',
    projection: {
      primaryAxis: 'xz',
      viewDirection: { x: 0, y: 1, z: 0 },
      upDirection: { x: 0, y: 0, z: 1 },
      rightDirection: { x: 1, y: 0, z: 0 },
      flipX: false,
      flipY: false,
      scaleFactors: { width: 1, height: 1, depth: 0.1 }
    },
    defaultScale: 1,
    gridConfig: {
      majorGridSize: 12,
      minorGridSize: 1,
      majorGridColor: '#cccccc',
      minorGridColor: '#eeeeee',
      majorGridWeight: 1,
      minorGridWeight: 0.5,
      showLabels: true,
      labelFrequency: 5,
      snapToGrid: true,
      snapTolerance: 6
    },
    renderConfig: {
      lineWeights: {
        wall: 2,
        door: 1.5,
        window: 1.5,
        stair: 1.5,
        roof: 2,
        annotation: 0.5,
        dimension: 0.5,
        hidden: 0.5
      },
      lineStyles: {
        visible: 'solid',
        hidden: 'dashed',
        centerline: 'dashed',
        dimension: 'solid'
      },
      colors: {
        wall: '#333333',
        door: '#8B4513',
        window: '#4169E1',
        stair: '#696969',
        roof: '#A0522D',
        annotation: '#FF0000',
        dimension: '#0000FF',
        grid: '#CCCCCC',
        background: '#FFFFFF'
      },
      showMaterials: true,
      materialOpacity: 0.8,
      showMaterialPatterns: true,
      patternScale: 1
    },
    measurementConfig: {
      unit: 'ft',
      precision: 2,
      showDimensions: true,
      dimensionTextSize: 10,
      dimensionLineExtension: 6,
      dimensionTextOffset: 4,
      arrowSize: 6,
      arrowType: 'arrow'
    }
  },
  
  back: {
    type: 'back',
    label: 'Back Elevation',
    icon: '⬛',
    description: 'Back view showing rear vertical elements',
    projection: {
      primaryAxis: 'xz',
      viewDirection: { x: 0, y: -1, z: 0 },
      upDirection: { x: 0, y: 0, z: 1 },
      rightDirection: { x: -1, y: 0, z: 0 },
      flipX: true,
      flipY: false,
      scaleFactors: { width: 1, height: 1, depth: 0.1 }
    },
    defaultScale: 1,
    gridConfig: {
      majorGridSize: 12,
      minorGridSize: 1,
      majorGridColor: '#cccccc',
      minorGridColor: '#eeeeee',
      majorGridWeight: 1,
      minorGridWeight: 0.5,
      showLabels: true,
      labelFrequency: 5,
      snapToGrid: true,
      snapTolerance: 6
    },
    renderConfig: {
      lineWeights: {
        wall: 2,
        door: 1.5,
        window: 1.5,
        stair: 1.5,
        roof: 2,
        annotation: 0.5,
        dimension: 0.5,
        hidden: 0.5
      },
      lineStyles: {
        visible: 'solid',
        hidden: 'dashed',
        centerline: 'dashed',
        dimension: 'solid'
      },
      colors: {
        wall: '#333333',
        door: '#8B4513',
        window: '#4169E1',
        stair: '#696969',
        roof: '#A0522D',
        annotation: '#FF0000',
        dimension: '#0000FF',
        grid: '#CCCCCC',
        background: '#FFFFFF'
      },
      showMaterials: true,
      materialOpacity: 0.8,
      showMaterialPatterns: true,
      patternScale: 1
    },
    measurementConfig: {
      unit: 'ft',
      precision: 2,
      showDimensions: true,
      dimensionTextSize: 10,
      dimensionLineExtension: 6,
      dimensionTextOffset: 4,
      arrowSize: 6,
      arrowType: 'arrow'
    }
  },
  
  left: {
    type: 'left',
    label: 'Left Elevation',
    icon: '⬛',
    description: 'Left side view showing side vertical elements',
    projection: {
      primaryAxis: 'yz',
      viewDirection: { x: 1, y: 0, z: 0 },
      upDirection: { x: 0, y: 0, z: 1 },
      rightDirection: { x: 0, y: 1, z: 0 },
      flipX: false,
      flipY: false,
      scaleFactors: { width: 1, height: 1, depth: 0.1 }
    },
    defaultScale: 1,
    gridConfig: {
      majorGridSize: 12,
      minorGridSize: 1,
      majorGridColor: '#cccccc',
      minorGridColor: '#eeeeee',
      majorGridWeight: 1,
      minorGridWeight: 0.5,
      showLabels: true,
      labelFrequency: 5,
      snapToGrid: true,
      snapTolerance: 6
    },
    renderConfig: {
      lineWeights: {
        wall: 2,
        door: 1.5,
        window: 1.5,
        stair: 1.5,
        roof: 2,
        annotation: 0.5,
        dimension: 0.5,
        hidden: 0.5
      },
      lineStyles: {
        visible: 'solid',
        hidden: 'dashed',
        centerline: 'dashed',
        dimension: 'solid'
      },
      colors: {
        wall: '#333333',
        door: '#8B4513',
        window: '#4169E1',
        stair: '#696969',
        roof: '#A0522D',
        annotation: '#FF0000',
        dimension: '#0000FF',
        grid: '#CCCCCC',
        background: '#FFFFFF'
      },
      showMaterials: true,
      materialOpacity: 0.8,
      showMaterialPatterns: true,
      patternScale: 1
    },
    measurementConfig: {
      unit: 'ft',
      precision: 2,
      showDimensions: true,
      dimensionTextSize: 10,
      dimensionLineExtension: 6,
      dimensionTextOffset: 4,
      arrowSize: 6,
      arrowType: 'arrow'
    }
  },
  
  right: {
    type: 'right',
    label: 'Right Elevation',
    icon: '⬛',
    description: 'Right side view showing side vertical elements',
    projection: {
      primaryAxis: 'yz',
      viewDirection: { x: -1, y: 0, z: 0 },
      upDirection: { x: 0, y: 0, z: 1 },
      rightDirection: { x: 0, y: -1, z: 0 },
      flipX: true,
      flipY: false,
      scaleFactors: { width: 1, height: 1, depth: 0.1 }
    },
    defaultScale: 1,
    gridConfig: {
      majorGridSize: 12,
      minorGridSize: 1,
      majorGridColor: '#cccccc',
      minorGridColor: '#eeeeee',
      majorGridWeight: 1,
      minorGridWeight: 0.5,
      showLabels: true,
      labelFrequency: 5,
      snapToGrid: true,
      snapTolerance: 6
    },
    renderConfig: {
      lineWeights: {
        wall: 2,
        door: 1.5,
        window: 1.5,
        stair: 1.5,
        roof: 2,
        annotation: 0.5,
        dimension: 0.5,
        hidden: 0.5
      },
      lineStyles: {
        visible: 'solid',
        hidden: 'dashed',
        centerline: 'dashed',
        dimension: 'solid'
      },
      colors: {
        wall: '#333333',
        door: '#8B4513',
        window: '#4169E1',
        stair: '#696969',
        roof: '#A0522D',
        annotation: '#FF0000',
        dimension: '#0000FF',
        grid: '#CCCCCC',
        background: '#FFFFFF'
      },
      showMaterials: true,
      materialOpacity: 0.8,
      showMaterialPatterns: true,
      patternScale: 1
    },
    measurementConfig: {
      unit: 'ft',
      precision: 2,
      showDimensions: true,
      dimensionTextSize: 10,
      dimensionLineExtension: 6,
      dimensionTextOffset: 4,
      arrowSize: 6,
      arrowType: 'arrow'
    }
  }
};

/**
 * View utility functions
 */
export interface ViewUtils2D {
  getViewConfig: (viewType: ViewType2D) => ViewConfig2D;
  projectPoint: (point: { x: number; y: number; z: number }, viewType: ViewType2D) => Point2D;
  unprojectPoint: (point: Point2D, viewType: ViewType2D, defaultZ?: number) => { x: number; y: number; z: number };
  isElementVisibleInView: (element: Element2D, viewType: ViewType2D) => boolean;
  getElementBoundsInView: (element: Element2D, viewType: ViewType2D) => { min: Point2D; max: Point2D };
  transformElementForView: (element: Element2D, viewType: ViewType2D) => Element2D;
}

/**
 * View-specific layer definitions
 */
export const VIEW_LAYERS: Record<ViewType2D, string[]> = {
  plan: [
    'walls',
    'doors',
    'windows',
    'stairs',
    'rooms',
    'furniture',
    'electrical',
    'plumbing',
    'dimensions',
    'annotations'
  ],
  front: [
    'walls',
    'doors',
    'windows',
    'roof',
    'exterior-materials',
    'dimensions',
    'annotations'
  ],
  back: [
    'walls',
    'doors',
    'windows',
    'roof',
    'exterior-materials',
    'dimensions',
    'annotations'
  ],
  left: [
    'walls',
    'doors',
    'windows',
    'roof',
    'exterior-materials',
    'dimensions',
    'annotations'
  ],
  right: [
    'walls',
    'doors',
    'windows',
    'roof',
    'exterior-materials',
    'dimensions',
    'annotations'
  ]
};