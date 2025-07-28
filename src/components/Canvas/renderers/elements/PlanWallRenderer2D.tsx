'use client';

import React from 'react';
import { Wall2D, Element2D } from '@/types/elements2D';
import { Material } from '@/types/materials/Material';
import MaterializedWallComponent from '../../MaterializedWallComponent';

interface PlanWallRenderer2DProps {
  wall: Wall2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
  // Wall editing callbacks
  onWallStartDrag?: (handleType: 'start' | 'end' | 'move', x: number, y: number) => void;
  onWallDrag?: (handleType: 'start' | 'end' | 'move', x: number, y: number) => void;
  onWallEndDrag?: (handleType: 'start' | 'end' | 'move') => void;
}

export default function PlanWallRenderer2D({
  wall,
  isSelected,
  onSelect,
  onWallStartDrag,
  onWallDrag,
  onWallEndDrag,
}: PlanWallRenderer2DProps) {
  
  // Calculate wall properties for plan view
  const angle = Math.atan2(
    wall.endPoint.y - wall.startPoint.y, 
    wall.endPoint.x - wall.startPoint.x
  );
  const angleDegrees = (angle * 180) / Math.PI;

  

  // Convert Wall2D to Wall format for MaterializedWallComponent
  const wallForComponent = {
    ...wall,
    startX: wall.startPoint.x,
    startY: wall.startPoint.y,
    endX: wall.endPoint.x,
    endY: wall.endPoint.y,
    // Include calculated angle for proper orientation
    angle: angleDegrees,
    color: '#333333', // Default wall color
  };

  return (
    <MaterializedWallComponent
      wall={wallForComponent}
      isSelected={isSelected}
      onSelect={onSelect}
      onStartDrag={() => {}}
      onDrag={() => {}}
      onEndDrag={() => {}}
      onWallStartDrag={onWallStartDrag}
      onWallDrag={onWallDrag}
      onWallEndDrag={onWallEndDrag}
    />
  );
}