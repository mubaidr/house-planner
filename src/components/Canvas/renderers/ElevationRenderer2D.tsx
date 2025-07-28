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
  onElementSelect?: (elementId: string, element: Element2D) => void;
  onElementEdit?: (elementId: string, updates: Partial<Element2D>) => void;
}

const ElevationRenderer2DComponent = React.memo(function ElevationRenderer2DComponent({
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
  if (currentView !== viewType || !viewType.includes('elevation')) {
    return null;
  }

  // Use the parameters to avoid unused variable warnings
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _renderingConfig = {
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
    const layerName = element.type;
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
  const elementsByType = projectedElements.reduce((acc: any, element: any) => {
    if (!acc[element.type]) acc[element.type] = [];
    acc[element.type].push(element);
    return acc;
  }, {});

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

  const handleElementSelect = (elementId: string, element: Element2D) => {
    onElementSelect?.(elementId, element);
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
            {typeElements.map((element: any) => {
              const isSelected = selectedElementId === element.id && 
                               selectedElementType === element.type;
              
              return (
                <Group key={element.id}>
                  {/* Placeholder for element rendering */}
                </Group>
              );
            })}
          </Group>
        );
      })}
    </Group>
  );
});

export default ElevationRenderer2DComponent;