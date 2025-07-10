'use client';

import React from 'react';
import { Rect, Arc } from 'react-konva';
import { Door } from '@/types/elements/Door';
import { useDesignStore } from '@/stores/designStore';

interface DoorComponentProps {
  door: Door;
}

export default function DoorComponent({ door }: DoorComponentProps) {
  const { selectElement, selectedElementId } = useDesignStore();
  
  const isSelected = selectedElementId === door.id;

  const handleClick = () => {
    selectElement(door.id, 'door');
  };

  return (
    <>
      {/* Door opening (gap in wall) */}
      <Rect
        x={door.x - door.width / 2}
        y={door.y - 2}
        width={door.width}
        height={4}
        fill="white"
        stroke={isSelected ? '#3b82f6' : '#666'}
        strokeWidth={isSelected ? 2 : 1}
        onClick={handleClick}
        onTap={handleClick}
      />
      
      {/* Door swing arc */}
      <Arc
        x={door.swingDirection === 'left' ? door.x - door.width / 2 : door.x + door.width / 2}
        y={door.y}
        innerRadius={0}
        outerRadius={door.width}
        angle={90}
        rotation={door.swingDirection === 'left' ? 0 : -90}
        stroke={isSelected ? '#3b82f6' : door.color}
        strokeWidth={1}
        dash={[5, 5]}
        opacity={0.7}
        onClick={handleClick}
        onTap={handleClick}
      />
    </>
  );
}