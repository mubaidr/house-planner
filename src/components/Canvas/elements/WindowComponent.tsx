'use client';

import React from 'react';
import { Rect, Line } from 'react-konva';
import { Window } from '@/types/elements/Window';
import { useDesignStore } from '@/stores/designStore';

interface WindowComponentProps {
  window: Window;
}

export default function WindowComponent({ window }: WindowComponentProps) {
  const { selectElement, selectedElementId } = useDesignStore();
  
  const isSelected = selectedElementId === window.id;

  const handleClick = () => {
    selectElement(window.id, 'window');
  };

  return (
    <>
      {/* Window frame */}
      <Rect
        x={window.x - window.width / 2}
        y={window.y - 2}
        width={window.width}
        height={4}
        fill="white"
        stroke={isSelected ? '#3b82f6' : window.color}
        strokeWidth={isSelected ? 2 : 1}
        onClick={handleClick}
        onTap={handleClick}
      />
      
      {/* Window glass (transparent) */}
      <Rect
        x={window.x - window.width / 2 + 2}
        y={window.y - 1}
        width={window.width - 4}
        height={2}
        fill="#87ceeb"
        opacity={window.opacity}
        onClick={handleClick}
        onTap={handleClick}
      />
      
      {/* Window divider (for double windows) */}
      {window.style === 'double' && (
        <Line
          points={[window.x, window.y - 1, window.x, window.y + 1]}
          stroke={isSelected ? '#3b82f6' : window.color}
          strokeWidth={1}
          onClick={handleClick}
          onTap={handleClick}
        />
      )}
    </>
  );
}