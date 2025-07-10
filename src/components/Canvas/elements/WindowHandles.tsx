'use client';

import React from 'react';
import { Circle, Rect } from 'react-konva';
import { Window } from '@/types/elements/Window';

interface WindowHandlesProps {
  window: Window;
  isSelected: boolean;
  onStartDrag: (handleType: 'resize' | 'move', x: number, y: number) => void;
  onDrag: (handleType: 'resize' | 'move', x: number, y: number) => void;
  onEndDrag: (handleType: 'resize' | 'move') => void;
}

export default function WindowHandles({
  window,
  isSelected,
  onStartDrag,
  onDrag,
  onEndDrag,
}: WindowHandlesProps) {
  if (!isSelected) return null;

  const handleRadius = 5;
  const handleColor = '#4A90E2';
  const handleStroke = '#ffffff';

  return (
    <>
      {/* Resize handles on both ends of the window */}
      <Circle
        x={window.x - window.width / 2}
        y={window.y}
        radius={handleRadius}
        fill={handleColor}
        stroke={handleStroke}
        strokeWidth={2}
        draggable
        onDragStart={() => onStartDrag('resize', window.x - window.width / 2, window.y)}
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
        x={window.x + window.width / 2}
        y={window.y}
        radius={handleRadius}
        fill={handleColor}
        stroke={handleStroke}
        strokeWidth={2}
        draggable
        onDragStart={() => onStartDrag('resize', window.x + window.width / 2, window.y)}
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
        x={window.x - 8}
        y={window.y - 8}
        width={16}
        height={16}
        fill="transparent"
        stroke={handleColor}
        strokeWidth={2}
        cornerRadius={2}
        draggable
        onDragStart={() => onStartDrag('move', window.x, window.y)}
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
        x={window.x}
        y={window.y}
        radius={2}
        fill={handleColor}
        listening={false}
      />
    </>
  );
}