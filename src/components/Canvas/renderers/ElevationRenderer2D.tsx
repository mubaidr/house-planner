'use client';

import React from 'react';
import { Group } from 'react-konva';
import { Element2D, Wall2D, Door2D, Window2D, Stair2D, Roof2D, Annotation2D, Dimension2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';
import { ViewProjectionUtils } from '@/utils/viewProjection';
import { useViewStore } from '@/stores/viewStore';
import { useDesignStore } from '@/stores/designStore';
import { useMaterialStore } from '@/stores/materialStore';
import { Material } from '@/types/materials/Material';

// Import individual elevation element renderers
import ElevationWallRenderer2D from './elements/ElevationWallRenderer2D';
import ElevationDoorRenderer2D from './elements/ElevationDoorRenderer2D';
import ElevationWindowRenderer2D from './elements/ElevationWindowRenderer2D';
import ElevationStairRenderer2D from './elements/ElevationStairRenderer2D';
import ElevationRoofRenderer2D from './elements/ElevationRoofRenderer2D';
import ElevationAnnotationRenderer2D from './elements/ElevationAnnotationRenderer2D';
import ElevationDimensionRenderer2D from './elements/ElevationDimensionRenderer2D';

interface ElevationRenderer2DProps {
  elements: Element2D[];
  viewType: ViewType2D; // front, back, left, right
  scale: number;
  showMaterials?: boolean;
  showDimensions?: boolean;
  showAnnotations?: boolean;
  onElementSelect?: (elementId: string, elementType: string) => void;
  onElementEdit?: (elementId: string, updates: Partial<Element2D>) => void;
}

export default function ElevationRenderer2D({
  elements,
  viewType,
  scale,
  showMaterials = true,
  showDimensions = true,
  showAnnotations = true,
  onElementSelect,
  onElementEdit,
}: ElevationRenderer2DProps) {
  const { currentView, layerVisibility } = useViewStore();
  const { selectedElementId, selectedElementType } = useDesignStore();
  const { getMaterialById } = useMaterialStore();

  // Only render if current view matches the elevation view type
  if (currentView !== viewType || !isElevationView(viewType)) {
    return null;
  }

  // Use the parameters to avoid unused variable warnings
  const renderingConfig = {
    showDimensions,
    showAnnotations,
    showMaterials,
  };

  // Get layer visibility for current elevation view
  const elevationLayerVisibility = layerVisibility[viewType] || {};

  // Filter elements by visibility and project them for elevation view
  const visibleElements = elements.filter(element => {
    // Check if element is visible in this elevation view
    if (!ViewProjectionUtils.isElementVisibleInView(element, viewType)) {
      return false;
    }

    // Check layer visibility
    const layerName = getElementLayerName(element.type);
    if (elevationLayerVisibility[layerName] === false) {
      return false;
    }

    return element.visible;
  });

  // Project elements to elevation view coordinates
  const projectedElements = visibleElements.map(element =>
    ViewProjectionUtils.transformElementForView(element, viewType)
  );

  // Group elements by type for proper rendering order
  const elementsByType = groupElementsByType(projectedElements);

  // Render elements in proper Z-order for elevation views (back to front)
  const renderOrder = [
    'roofs',     // Background
    'walls',     // Structure
    'doors',     // Openings
    'windows',   // Openings
    'stairs',    // Features
    'dimensions', // Annotations
    'annotations' // Foreground
  ];

  const handleElementSelect = (elementId: string, elementType: string) => {
    onElementSelect?.(elementId, elementType);
  };

  const handleElementEdit = (elementId: string, updates: Partial<Element2D>) => {
    onElementEdit?.(elementId, updates);
  };

  return (
    <Group>
      {renderOrder.map(elementType => {
        const typeElements = elementsByType[elementType] || [];
        
        return (
          <Group key={elementType}>
            {typeElements.map(element => {
              const isSelected = selectedElementId === element.id && 
                               selectedElementType === getElementTypeString(element.type);
              
              return renderElementByType(
                element,
                elementType,
                viewType,
                isSelected,
                scale,
                showMaterials,
                getMaterialById,
                handleElementSelect,
                handleElementEdit
              );
            })}
          </Group>
        );
      })}
    </Group>
  );
}

/**
 * Check if view type is an elevation view
 */
function isElevationView(viewType: ViewType2D): boolean {
  return ['front', 'back', 'left', 'right'].includes(viewType);
}

/**
 * Get the layer name for an element type
 */
function getElementLayerName(elementType: string): string {
  const layerMap: Record<string, string> = {
    'wall2d': 'walls',
    'door2d': 'doors',
    'window2d': 'windows',
    'stair2d': 'stairs',
    'roof2d': 'roof',
    'annotation2d': 'annotations',
    'dimension2d': 'dimensions',
  };
  
  return layerMap[elementType] || 'misc';
}

/**
 * Get element type string for selection
 */
function getElementTypeString(elementType: string): string {
  const typeMap: Record<string, string> = {
    'wall2d': 'wall',
    'door2d': 'door',
    'window2d': 'window',
    'stair2d': 'stair',
    'roof2d': 'roof',
    'annotation2d': 'annotation',
    'dimension2d': 'dimension',
  };
  
  return typeMap[elementType] || elementType;
}

/**
 * Group elements by their type for rendering
 */
function groupElementsByType(elements: Element2D[]): Record<string, Element2D[]> {
  const groups: Record<string, Element2D[]> = {
    walls: [],
    doors: [],
    windows: [],
    stairs: [],
    roofs: [],
    dimensions: [],
    annotations: [],
  };

  elements.forEach(element => {
    switch (element.type) {
      case 'wall2d':
        groups.walls.push(element);
        break;
      case 'door2d':
        groups.doors.push(element);
        break;
      case 'window2d':
        groups.windows.push(element);
        break;
      case 'stair2d':
        groups.stairs.push(element);
        break;
      case 'roof2d':
        groups.roofs.push(element);
        break;
      case 'dimension2d':
        groups.dimensions.push(element);
        break;
      case 'annotation2d':
        groups.annotations.push(element);
        break;
    }
  });

  return groups;
}

/**
 * Render an element based on its type for elevation views
 */
function renderElementByType(
  element: Element2D,
  elementType: string,
  viewType: ViewType2D,
  isSelected: boolean,
  scale: number,
  showMaterials: boolean,
  getMaterialById: (id: string) => Material | undefined,
  onSelect: (elementId: string, elementType: string) => void,
  onEdit: (elementId: string, updates: Partial<Element2D>) => void
): React.ReactNode {
  const commonProps = {
    key: element.id,
    element,
    viewType,
    isSelected,
    scale,
    showMaterials,
    getMaterialById,
    onSelect: () => onSelect(element.id, getElementTypeString(element.type)),
    onEdit: (updates: Partial<Element2D>) => onEdit(element.id, updates),
  };

  switch (elementType) {
    case 'walls':
      return (
        <ElevationWallRenderer2D
          {...commonProps}
          wall={element as Wall2D}
        />
      );
    
    case 'doors':
      return (
        <ElevationDoorRenderer2D
          {...commonProps}
          door={element as Door2D}
        />
      );
    
    case 'windows':
      return (
        <ElevationWindowRenderer2D
          {...commonProps}
          window={element as Window2D}
        />
      );
    
    case 'stairs':
      return (
        <ElevationStairRenderer2D
          {...commonProps}
          stair={element as Stair2D}
        />
      );
    
    case 'roofs':
      return (
        <ElevationRoofRenderer2D
          {...commonProps}
          roof={element as Roof2D}
        />
      );
    
    case 'dimensions':
      return (
        <ElevationDimensionRenderer2D
          {...commonProps}
          dimension={element as Dimension2D}
        />
      );
    
    case 'annotations':
      return (
        <ElevationAnnotationRenderer2D
          {...commonProps}
          annotation={element as Annotation2D}
        />
      );
    
    default:
      return null;
  }
}

/**
 * Elevation view specific rendering configuration
 */
export const ELEVATION_VIEW_CONFIG = {
  // Rendering scales for different element types in elevation views
  elementScales: {
    wall: 1.0,
    door: 1.0,
    window: 1.0,
    stair: 1.0,
    roof: 1.0,
    annotation: 1.0,
    dimension: 1.0,
  },
  
  // Line weights for elevation views (in pixels)
  lineWeights: {
    wall: 2,
    door: 1.5,
    window: 1.5,
    stair: 1.5,
    roof: 2,
    annotation: 0.5,
    dimension: 0.5,
    hidden: 0.5,
  },
  
  // Colors for elevation view elements
  colors: {
    wall: '#333333',
    door: '#8B4513',
    window: '#4169E1',
    stair: '#696969',
    roof: '#A0522D',
    annotation: '#FF0000',
    dimension: '#0000FF',
    grid: '#CCCCCC',
    background: '#FFFFFF',
    ground: '#8B7355', // Ground line color
    sky: '#87CEEB',    // Sky background
  },
  
  // Material rendering settings for elevation views
  materialSettings: {
    showPatterns: true,
    patternScale: 1.0,
    opacity: 0.8,
    showTextures: true,
    showShadows: true,
    shadowOpacity: 0.3,
  },
  
  // Dimension settings for elevation views
  dimensionSettings: {
    textSize: 10,
    lineExtension: 6,
    textOffset: 4,
    arrowSize: 6,
    precision: 2,
  },
  
  // Height references for elevation views
  heightReferences: {
    groundLevel: 0,
    standardCeiling: 96, // 8 feet
    standardDoor: 84,    // 7 feet
    standardWindow: {
      sill: 36,          // 3 feet
      head: 84,          // 7 feet
    },
  },
};