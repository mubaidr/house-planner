'use client';

import React from 'react';
import { Circle, Rect } from 'react-konva';
import { Door } from '@/types/elements/Door';

interface DoorHandlesProps {
  door: Door;
  isSelected: boolean;
  onStartDrag: (handleType: 'resize' | 'move', x: number, y: number) => void;
  onDrag: (handleType: 'resize' | 'move', x: number, y: number) => void;
  onEndDrag: (handleType: 'resize' | 'move') => void;
}

export default function DoorHandles({
  door,
  isSelected,
  onStartDrag,
  onDrag,
  onEndDrag,
}: DoorHandlesProps) {
  if (!isSelected) return null;

  const handleRadius = 5;
  const handleColor = '#3b82f6';
  const handleStroke = '#ffffff';

  return (
    <>
      {/* Resize handles on both ends of the door */}
      <Circle
        x={door.x - door.width / 2}
        y={door.y}
        radius={handleRadius}
        fill={handleColor}
        stroke={handleStroke}
        strokeWidth={2}
        draggable
        onDragStart={() => onStartDrag('resize', door.x - door.width / 2, door.y)}
        onDragMove={(e) => {
          const pos = e.target.position();
          onDrag('resize', pos.x, pos.y);
        }}
        onDragEnd={() => onEndDrag('resize')}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'ew-resize';
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'default';
          }
        }}
      />

      <Circle
        x={door.x + door.width / 2}
        y={door.y}
        radius={handleRadius}
        fill={handleColor}
        stroke={handleStroke}
        strokeWidth={2}
        draggable
        onDragStart={() => onStartDrag('resize', door.x + door.width / 2, door.y)}
        onDragMove={(e) => {
          const pos = e.target.position();
          onDrag('resize', pos.x, pos.y);
        }}
        onDragEnd={() => onEndDrag('resize')}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'ew-resize';
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) {
            container.style.cursor = 'default';
          }
        }}
      />

      {/* Move handle in the center */}
      <Rect
        x={door.x - 8}
        y={door.y - 8}
        width={16}
        height={16}
        fill="transparent"
        stroke={handleColor}
        strokeWidth={2}
        cornerRadius={2}
        draggable
        onDragStart={() => onStartDrag('move', door.x, door.y)}
        onDragMove={(e) => {
          const pos = e.target.position();
          onDrag('move', pos.x + 8, pos.y + 8); // Adjust for handle offset
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

      {/* Center dot for move handle */}
      <Circle
        x={door.x}
        y={door.y}
        radius={2}
        fill={handleColor}
        listening={false}
      />
    </>
  );
}