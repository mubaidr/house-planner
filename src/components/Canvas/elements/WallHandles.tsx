'use client';

import React from 'react';
import { Circle } from 'react-konva';
import { Wall } from '@/types/elements/Wall';

interface WallHandlesProps {
  wall: Wall;
  isSelected: boolean;
  onStartDrag: (handleType: 'start' | 'end' | 'move', x: number, y: number) => void;
  onDrag: (handleType: 'start' | 'end' | 'move', x: number, y: number) => void;
  onEndDrag: (handleType: 'start' | 'end' | 'move') => void;
}

export default function WallHandles({
  wall,
  isSelected,
  onStartDrag,
  onDrag,
  onEndDrag,
}: WallHandlesProps) {
  if (!isSelected) return null;

  const handleRadius = 6;
  const handleColor = '#3b82f6';
  const handleStroke = '#ffffff';

  return (
    <>
      {/* Start handle */}
      <Circle
        x={wall.startX}
        y={wall.startY}
        radius={handleRadius}
        fill={handleColor}
        stroke={handleStroke}
        strokeWidth={2}
        draggable
        onDragStart={() => onStartDrag('start', wall.startX, wall.startY)}
        onDragMove={(e) => {
          const pos = e.target.position();
          onDrag('start', pos.x, pos.y);
        }}
        onDragEnd={() => onEndDrag('start')}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'move';
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'default';
          }
        }}
      />

      {/* End handle */}
      <Circle
        x={wall.endX}
        y={wall.endY}
        radius={handleRadius}
        fill={handleColor}
        stroke={handleStroke}
        strokeWidth={2}
        draggable
        onDragStart={() => onStartDrag('end', wall.endX, wall.endY)}
        onDragMove={(e) => {
          const pos = e.target.position();
          onDrag('end', pos.x, pos.y);
        }}
        onDragEnd={() => onEndDrag('end')}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'move';
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'default';
          }
        }}
      />

      {/* Midpoint handle for moving entire wall */}
      <Circle
        x={(wall.startX + wall.endX) / 2}
        y={(wall.startY + wall.endY) / 2}
        radius={handleRadius - 1}
        fill="transparent"
        stroke={handleColor}
        strokeWidth={2}
        draggable
        onDragStart={() => onStartDrag('move', (wall.startX + wall.endX) / 2, (wall.startY + wall.endY) / 2)}
        onDragMove={(e) => {
          const pos = e.target.position();
          onDrag('move', pos.x, pos.y);
        }}
        onDragEnd={() => onEndDrag('move')}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'move';
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'default';
          }
        }}
      />
    </>
  );
}