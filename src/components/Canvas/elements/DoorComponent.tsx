'use client';

import React from 'react';
import { Rect, Arc, Line, Text } from 'react-konva';
import { Door } from '@/types/elements/Door';
import { useDesignStore } from '@/stores/designStore';
import { useGlobalDoorAnimation } from '@/hooks/useDoorAnimation';
import { useDoorEditor } from '@/hooks/useDoorEditor';
import DoorHandles from './DoorHandles';

interface DoorComponentProps {
  door: Door;
}

export default function DoorComponent({ door }: DoorComponentProps) {
  const { selectElement, selectedElementId } = useDesignStore();
  const { getDoorState, toggleDoor } = useGlobalDoorAnimation();
  const { startDrag, updateDrag, endDrag } = useDoorEditor();
  
  const isSelected = selectedElementId === door.id;
  const doorState = getDoorState(door.id);

  const handleClick = () => {
    selectElement(door.id, 'door');
  };

  const handleDoubleClick = () => {
    toggleDoor(door.id);
  };

  const handleStartDrag = (handleType: 'resize' | 'move', x: number, y: number) => {
    startDrag(door.id, handleType, x, y);
  };

  const handleDrag = (handleType: 'resize' | 'move', x: number, y: number) => {
    updateDrag(door.id, handleType, x, y);
  };

  const handleEndDrag = () => {
    endDrag(door.id);
  };

  // Calculate door swing based on animation state and wall angle
  const swingAngle = doorState.currentAngle;
  const isLeftSwing = door.swingDirection === 'left';
  const wallAngle = door.wallAngle || 0;
  
  // Calculate door opening direction perpendicular to wall
  const wallDirX = Math.cos(wallAngle);
  const wallDirY = Math.sin(wallAngle);
  const perpDirX = -wallDirY; // Perpendicular to wall (90 degrees rotated)
  const perpDirY = wallDirX;
  
  // Position hinge at door center, offset slightly along wall direction
  const hingeOffsetX = (isLeftSwing ? -1 : 1) * (door.width / 2) * wallDirX;
  const hingeOffsetY = (isLeftSwing ? -1 : 1) * (door.width / 2) * wallDirY;
  const hingeX = door.x + hingeOffsetX;
  const hingeY = door.y + hingeOffsetY;

  // Calculate door panel position based on swing angle and wall orientation
  const swingRadians = (swingAngle * Math.PI) / 180;
  const swingDirX = Math.cos(wallAngle + (isLeftSwing ? -1 : 1) * swingRadians);
  const swingDirY = Math.sin(wallAngle + (isLeftSwing ? -1 : 1) * swingRadians);
  const doorEndX = hingeX + door.width * swingDirX;
  const doorEndY = hingeY + door.width * swingDirY;

  return (
    <>
      {/* Door opening (gap in wall) - simplified as a line along the wall */}
      <Rect
        x={door.x}
        y={door.y}
        width={door.width}
        height={4}
        rotation={(wallAngle * 180) / Math.PI}
        offsetX={door.width / 2}
        offsetY={2}
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
        rotation={(wallAngle * 180) / Math.PI + (isLeftSwing ? 0 : -90)}
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

      {/* Editing handles */}
      <DoorHandles
        door={door}
        isSelected={isSelected}
        onStartDrag={handleStartDrag}
        onDrag={handleDrag}
        onEndDrag={handleEndDrag}
      />
    </>
  );
}