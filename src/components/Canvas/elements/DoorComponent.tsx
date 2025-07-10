'use client';

import React from 'react';
import { Rect, Arc, Line, Text } from 'react-konva';
import { Door } from '@/types/elements/Door';
import { useDesignStore } from '@/stores/designStore';
import { useGlobalDoorAnimation } from '@/hooks/useDoorAnimation';

interface DoorComponentProps {
  door: Door;
}

export default function DoorComponent({ door }: DoorComponentProps) {
  const { selectElement, selectedElementId } = useDesignStore();
  const { getDoorState, toggleDoor } = useGlobalDoorAnimation();
  
  const isSelected = selectedElementId === door.id;
  const doorState = getDoorState(door.id);

  const handleClick = () => {
    selectElement(door.id, 'door');
  };

  const handleDoubleClick = () => {
    toggleDoor(door.id);
  };

  // Calculate door swing based on animation state
  const swingAngle = doorState.currentAngle;
  const isLeftSwing = door.swingDirection === 'left';
  const hingeX = isLeftSwing ? door.x - door.width / 2 : door.x + door.width / 2;
  const hingeY = door.y;

  // Calculate door panel position based on swing angle
  const radians = (swingAngle * Math.PI) / 180;
  const doorEndX = hingeX + (isLeftSwing ? -1 : 1) * door.width * Math.cos(radians);
  const doorEndY = hingeY + (isLeftSwing ? -1 : 1) * door.width * Math.sin(radians);

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
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
      />
      
      {/* Door swing arc (always visible for reference) */}
      <Arc
        x={hingeX}
        y={hingeY}
        innerRadius={0}
        outerRadius={door.width}
        angle={90}
        rotation={isLeftSwing ? 0 : -90}
        stroke={isSelected ? '#3b82f6' : door.color}
        strokeWidth={1}
        dash={[5, 5]}
        opacity={0.3}
        listening={false}
      />
      
      {/* Animated door panel */}
      {swingAngle > 0 && (
        <Line
          points={[hingeX, hingeY, doorEndX, doorEndY]}
          stroke={isSelected ? '#3b82f6' : door.color}
          strokeWidth={3}
          lineCap="round"
          opacity={0.8}
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
      )}
      
      {/* Door handle indicator */}
      {swingAngle > 0 && (
        <Rect
          x={doorEndX - 3}
          y={doorEndY - 1}
          width={6}
          height={2}
          fill={isSelected ? '#3b82f6' : '#8B4513'}
          cornerRadius={1}
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
      )}
      
      {/* Hinge indicator */}
      <Rect
        x={hingeX - 2}
        y={hingeY - 1}
        width={4}
        height={2}
        fill={isSelected ? '#3b82f6' : '#333'}
        cornerRadius={1}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
      />
      
      {/* Interactive hint (only when selected) */}
      {isSelected && !doorState.isAnimating && (
        <Rect
          x={door.x - 30}
          y={door.y - 15}
          width={60}
          height={12}
          fill="rgba(59, 130, 246, 0.9)"
          cornerRadius={6}
          listening={false}
        />
      )}
      
      {isSelected && !doorState.isAnimating && (
        <Text
          x={door.x - 30}
          y={door.y - 12}
          width={60}
          height={8}
          text={`Double-click to ${doorState.isOpen ? 'close' : 'open'}`}
          fontSize={8}
          fontFamily="Arial"
          fill="white"
          align="center"
          listening={false}
        />
      )}
    </>
  );
}