'use client';

import React from 'react';
import { Group } from 'react-konva';
import { Element2D, Wall2D, Door2D, Window2D, Stair2D, Room2D, Annotation2D, Dimension2D } from '@/types/elements2D';
import { ViewProjectionUtils } from '@/utils/viewProjection';
import { useViewStore } from '@/stores/viewStore';
import { useDesignStore } from '@/stores/designStore';
import { useMaterialStore } from '@/stores/materialStore';

// Import individual element renderers
import PlanWallRenderer2D from './elements/PlanWallRenderer2D';
import PlanDoorRenderer2D from './elements/PlanDoorRenderer2D';
import PlanWindowRenderer2D from './elements/PlanWindowRenderer2D';
import PlanStairRenderer2D from './elements/PlanStairRenderer2D';
import PlanRoomRenderer2D from './elements/PlanRoomRenderer2D';
import PlanAnnotationRenderer2D from './elements/PlanAnnotationRenderer2D';
import PlanDimensionRenderer2D from './elements/PlanDimensionRenderer2D';

interface PlanViewRenderer2DProps {
  elements: Element2D[];
  scale: number;
  showMaterials?: boolean;
  showDimensions?: boolean;
  showAnnotations?: boolean;
  onElementSelect?: (elementId: string, elementType: string) => void;
  onElementEdit?: (elementId: string, updates: Partial<Element2D>) => void;
}

export default function PlanViewRenderer2D({
  elements,
  scale,
  showMaterials = true,
  showDimensions = true,
  showAnnotations = true,
  onElementSelect,
  onElementEdit,
}: PlanViewRenderer2DProps) {
  const { currentView, layerVisibility } = useViewStore();
  const { selectedElementId, selectedElementType } = useDesignStore();
  const { getMaterialById } = useMaterialStore();

  // Only render if current view is plan
  if (currentView !== 'plan') {
    return null;
  }

  // Use the parameters to avoid unused variable warnings
  const renderingConfig = {
    showDimensions,
    showAnnotations,
    showMaterials,
  };

  // Get layer visibility for plan view
  const planLayerVisibility = layerVisibility.plan || {};

  // Filter elements by visibility and project them for plan view
  const visibleElements = elements.filter(element => {
    // Check if element is visible in plan view
    if (!ViewProjectionUtils.isElementVisibleInView(element, 'plan')) {
      return false;
    }

    // Check layer visibility
    const layerName = getElementLayerName(element.type);
    if (planLayerVisibility[layerName] === false) {
      return false;
    }

    return element.visible;
  });

  // Project elements to plan view coordinates
  const projectedElements = visibleElements.map(element =>
    ViewProjectionUtils.transformElementForView(element, 'plan')
  );

  // Group elements by type for proper rendering order
  const elementsByType = groupElementsByType(projectedElements);

  // Render elements in proper Z-order (bottom to top)
  const renderOrder = [
    'rooms',
    'walls', 
    'doors',
    'windows',
    'stairs',
    'dimensions',
    'annotations'
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
 * Get the layer name for an element type
 */
function getElementLayerName(elementType: string): string {
  const layerMap: Record<string, string> = {
    'wall2d': 'walls',
    'door2d': 'doors',
    'window2d': 'windows',
    'stair2d': 'stairs',
    'room2d': 'rooms',
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
    'room2d': 'room',
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
    rooms: [],
    walls: [],
    doors: [],
    windows: [],
    stairs: [],
    dimensions: [],
    annotations: [],
  };

  elements.forEach(element => {
    switch (element.type) {
      case 'room2d':
        groups.rooms.push(element);
        break;
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
 * Render an element based on its type
 */
function renderElementByType(
  element: Element2D,
  elementType: string,
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
    isSelected,
    scale,
    showMaterials,
    getMaterialById,
    onSelect: () => onSelect(element.id, getElementTypeString(element.type)),
    onEdit: (updates: Partial<Element2D>) => onEdit(element.id, updates),
  };

  switch (elementType) {
    case 'rooms':
      return (
        <PlanRoomRenderer2D
          {...commonProps}
          room={element as Room2D}
        />
      );
    
    case 'walls':
      return (
        <PlanWallRenderer2D
          {...commonProps}
          wall={element as Wall2D}
        />
      );
    
    case 'doors':
      return (
        <PlanDoorRenderer2D
          {...commonProps}
          door={element as Door2D}
        />
      );
    
    case 'windows':
      return (
        <PlanWindowRenderer2D
          {...commonProps}
          window={element as Window2D}
        />
      );
    
    case 'stairs':
      return (
        <PlanStairRenderer2D
          {...commonProps}
          stair={element as Stair2D}
        />
      );
    
    case 'dimensions':
      return (
        <PlanDimensionRenderer2D
          {...commonProps}
          dimension={element as Dimension2D}
        />
      );
    
    case 'annotations':
      return (
        <PlanAnnotationRenderer2D
          {...commonProps}
          annotation={element as Annotation2D}
        />
      );
    
    default:
      return null;
  }
}

/**
 * Plan view specific rendering configuration
 */
export const PLAN_VIEW_CONFIG = {
  // Rendering scales for different element types
  elementScales: {
    wall: 1.0,
    door: 1.0,
    window: 1.0,
    stair: 1.0,
    room: 1.0,
    annotation: 1.0,
    dimension: 1.0,
  },
  
  // Line weights for plan view (in pixels)
  lineWeights: {
    wall: 2,
    door: 1,
    window: 1,
    stair: 1.5,
    room: 0.5,
    annotation: 0.5,
    dimension: 0.5,
    hidden: 0.5,
  },
  
  // Colors for plan view elements
  colors: {
    wall: '#333333',
    door: '#8B4513',
    window: '#4169E1',
    stair: '#696969',
    room: '#F5F5F5',
    annotation: '#FF0000',
    dimension: '#0000FF',
    grid: '#CCCCCC',
    background: '#FFFFFF',
  },
  
  // Material rendering settings for plan view
  materialSettings: {
    showPatterns: true,
    patternScale: 1.0,
    opacity: 0.7,
    showTextures: true,
  },
  
  // Dimension settings for plan view
  dimensionSettings: {
    textSize: 10,
    lineExtension: 6,
    textOffset: 4,
    arrowSize: 6,
    precision: 2,
  },
};