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
  onElementSelect?: (elementId: string, element: Element2D) => void;
  onElementEdit?: (elementId: string, updates: Partial<Element2D>) => void;
  // Wall editing callbacks
  onWallStartDrag?: (wallId: string, handleType: 'start' | 'end' | 'move', x: number, y: number) => void;
  onWallDrag?: (wallId: string, handleType: 'start' | 'end' | 'move', x: number, y: number) => void;
  onWallEndDrag?: (wallId: string, handleType: 'start' | 'end' | 'move') => void;
}



export default PlanViewRenderer2DComponent;

export default PlanViewRenderer2DComponent;
  