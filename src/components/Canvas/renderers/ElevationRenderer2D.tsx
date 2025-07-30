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
  if (currentView !== viewType || currentView === 'plan') {
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
    'roof2d',      // Background
    'wall2d',      // Structure
    'door2d',      // Openings
    'window2d',    // Openings
    'stair2d',     // Features
    'dimension2d', // Annotations
    'annotation2d' // Foreground
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
                  {/* Render different element types for elevation view */}
                  {element.type === 'wall2d' && (
                    <ElevationWallRenderer2D
                      wall={element as Wall2D}
                      viewType={viewType}
                      isSelected={isSelected}
                      scale={scale}
                      showMaterials={showMaterials}
                      getMaterialById={getMaterialById}
                      onSelect={() => handleElementSelect(element.id, element)}
                      onEdit={(updates) => handleElementEdit(element.id, updates)}
                    />
                  )}
                  {element.type === 'door2d' && (
                    <ElevationDoorRenderer2D
                      door={element as Door2D}
                      viewType={viewType}
                      isSelected={isSelected}
                      scale={scale}
                      showMaterials={showMaterials}
                      getMaterialById={getMaterialById}
                      onSelect={() => handleElementSelect(element.id, element)}
                      onEdit={(updates) => handleElementEdit(element.id, updates)}
                    />
                  )}
                  {element.type === 'window2d' && (
                    <ElevationWindowRenderer2D
                      window={element as Window2D}
                      viewType={viewType}
                      isSelected={isSelected}
                      scale={scale}
                      showMaterials={showMaterials}
                      getMaterialById={getMaterialById}
                      onSelect={() => handleElementSelect(element.id, element)}
                      onEdit={(updates) => handleElementEdit(element.id, updates)}
                    />
                  )}
                  {element.type === 'stair2d' && (
                    <ElevationStairRenderer2D
                      stair={element as Stair2D}
                      viewType={viewType}
                      isSelected={isSelected}
                      scale={scale}
                      showMaterials={showMaterials}
                      getMaterialById={getMaterialById}
                      onSelect={() => handleElementSelect(element.id, element)}
                      onEdit={(updates) => handleElementEdit(element.id, updates)}
                    />
                  )}
                  {element.type === 'roof2d' && (
                    <ElevationRoofRenderer2D
                      roof={element as Roof2D}
                      viewType={viewType}
                      isSelected={isSelected}
                      scale={scale}
                      showMaterials={showMaterials}
                      getMaterialById={getMaterialById}
                      onSelect={() => handleElementSelect(element.id, element)}
                      onEdit={(updates) => handleElementEdit(element.id, updates)}
                    />
                  )}
                  {element.type === 'annotation2d' && showAnnotations && (
                    <ElevationAnnotationRenderer2D
                      annotation={element as Annotation2D}
                      viewType={viewType}
                      isSelected={isSelected}
                      scale={scale}
                      onSelect={() => handleElementSelect(element.id, element)}
                      onEdit={(updates) => handleElementEdit(element.id, updates)}
                    />
                  )}
                  {element.type === 'dimension2d' && showDimensions && (
                    <ElevationDimensionRenderer2D
                      dimension={element as Dimension2D}
                      viewType={viewType}
                      isSelected={isSelected}
                      scale={scale}
                      onSelect={() => handleElementSelect(element.id, element)}
                      onEdit={(updates) => handleElementEdit(element.id, updates)}
                    />
                  )}
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