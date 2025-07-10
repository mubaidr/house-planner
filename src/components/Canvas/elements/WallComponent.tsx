'use client';

import React from 'react';
import { Line } from 'react-konva';
import { Wall } from '@/types/elements/Wall';
import { useDesignStore } from '@/stores/designStore';
import { useWallEditor } from '@/hooks/useWallEditor';
import WallHandles from './WallHandles';

interface WallComponentProps {
  wall: Wall;
}

export default function WallComponent({ wall }: WallComponentProps) {
  const { selectElement, selectedElementId } = useDesignStore();
  const { startDrag, updateDrag, endDrag } = useWallEditor();
  
  const isSelected = selectedElementId === wall.id;

  const handleClick = () => {
    selectElement(wall.id, 'wall');
  };

  const handleStartDrag = (handleType: 'start' | 'end' | 'move', x: number, y: number) => {
    startDrag(wall.id, handleType, x, y);
  };

  const handleDrag = (handleType: 'start' | 'end' | 'move', x: number, y: number) => {
    updateDrag(wall.id, handleType, x, y);
  };

  const handleEndDrag = () => {
    endDrag(wall.id);
  };

  return (
    <>
      <Line
        points={[wall.startX, wall.startY, wall.endX, wall.endY]}
        stroke={isSelected ? '#3b82f6' : wall.color}
        strokeWidth={wall.thickness}
        lineCap="round"
        onClick={handleClick}
        onTap={handleClick}
        shadowColor={isSelected ? '#3b82f6' : undefined}
        shadowBlur={isSelected ? 5 : 0}
        shadowOpacity={isSelected ? 0.5 : 0}
      />
      
      <WallHandles
        wall={wall}
        isSelected={isSelected}
        onStartDrag={handleStartDrag}
        onDrag={handleDrag}
        onEndDrag={handleEndDrag}
      />
    </>
  );
}