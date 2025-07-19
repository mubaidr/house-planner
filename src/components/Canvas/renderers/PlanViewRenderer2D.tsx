'use client';

import React from 'react';
import { Group } from 'react-konva';
import { Element2D } from '@/types/elements2D';
import { useViewStore } from '@/stores/viewStore';

interface PlanViewRenderer2DProps {
  elements: Element2D[];
  scale: number;
  showMaterials?: boolean;
  showDimensions?: boolean;
  showAnnotations?: boolean;
  onElementSelect?: (elementId: string, element: Element2D) => void;
  onElementEdit?: (elementId: string, updates: Partial<Element2D>) => void;
}

const PlanViewRenderer2DComponent = React.memo(function PlanViewRenderer2DComponent({
  elements,
  scale,
}: PlanViewRenderer2DProps) {
  const { currentView } = useViewStore();

  if (currentView !== 'plan') {
    return null;
  }

  return <Group />;
});

export default PlanViewRenderer2DComponent;
