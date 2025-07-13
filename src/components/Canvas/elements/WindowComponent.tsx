'use client';

import React from 'react';
import { Rect, Line } from 'react-konva';
import { Window } from '@/types/elements/Window';
import { useDesignStore } from '@/stores/designStore';
import { useWindowEditor } from '@/hooks/useWindowEditor';
import WindowHandles from './WindowHandles';

interface WindowComponentProps {
  window: Window;
}

export default function WindowComponent({ window }: WindowComponentProps) {
  const { selectElement, selectedElementId } = useDesignStore();
  const { startDrag, updateDrag, endDrag } = useWindowEditor();

  const isSelected = selectedElementId === window.id;

  const handleClick = () => {
    selectElement(window.id, 'window');
  };

  const handleStartDrag = (handleType: 'resize' | 'move', x: number, y: number) => {
    startDrag(window.id, handleType, x, y);
  };

  const handleDrag = (handleType: 'resize' | 'move', x: number, y: number) => {
    updateDrag(window.id, handleType, x, y);
  };

  const handleEndDrag = () => {
    endDrag(window.id);
  };

  return (
    <>
      {/* Window frame */}
     <Rect
       x={window.x}
       y={window.y}
       width={window.width}
       height={4}
       rotation={((window.wallAngle || 0) * 180) / Math.PI}
       offsetX={window.width / 2}
       offsetY={2}
       fill={window.material ? window.material : 'white'}
       stroke={isSelected ? '#3b82f6' : window.color}
       strokeWidth={isSelected ? 2 : 1}
       onClick={handleClick}
       onTap={handleClick}
     />

     {/* Window glass (transparent) */}
     <Rect
       x={window.x}
       y={window.y}
       width={window.width - 4}
       height={2}
       rotation={((window.wallAngle || 0) * 180) / Math.PI}
       offsetX={(window.width - 4) / 2}
       offsetY={1}
       fill="#87ceeb"
       opacity={window.opacity}
       onClick={handleClick}
       onTap={handleClick}
     />

     {/* Window divider (for double windows) */}
     {window.style === 'double' && (
       <Line
         points={[0, -1, 0, 1]}
         x={window.x}
         y={window.y}
         rotation={((window.wallAngle || 0) * 180) / Math.PI}
         stroke={isSelected ? '#3b82f6' : window.color}
         strokeWidth={1}
         onClick={handleClick}
         onTap={handleClick}
       />
     )}
     {/* Casement window rendering */}
     {window.style === 'casement' && (
       <Line
         points={[0, 0, window.width / 2, -window.height / 2]}
         x={window.x}
         y={window.y}
         rotation={((window.wallAngle || 0) * 180) / Math.PI}
         stroke={isSelected ? '#3b82f6' : window.color}
         strokeWidth={2}
         onClick={handleClick}
         onTap={handleClick}
       />
     )}

      {/* Editing handles */}
      <WindowHandles
        window={window}
        isSelected={isSelected}
        onStartDrag={handleStartDrag}
        onDrag={handleDrag}
        onEndDrag={handleEndDrag}
      />
    </>
  );
}
