'use client';

import React from 'react';
import { Rect, Arc, Line } from 'react-konva';
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

  // Calculate door animation and positioning based on style
  const swingAngle = doorState.currentAngle;
  const wallAngle = door.wallAngle || 0;
  
  // Calculate wall direction
  const wallDirX = Math.cos(wallAngle);
  const wallDirY = Math.sin(wallAngle);
  
  // Calculate perpendicular direction for door swing
  const perpDirX = -wallDirY; // Perpendicular to wall (90 degrees rotated)
  const perpDirY = wallDirX;
  
  // Determine swing direction based on door.swingDirection
  let swingMultiplier = 1;
  let hingeOffset = 0.5;
  
  switch (door.swingDirection) {
    case 'left':
      swingMultiplier = -1;
      hingeOffset = -0.5;
      break;
    case 'right':
      swingMultiplier = 1;
      hingeOffset = 0.5;
      break;
    case 'inward':
      swingMultiplier = 1;
      hingeOffset = -0.5;
      break;
    case 'outward':
      swingMultiplier = -1;
      hingeOffset = 0.5;
      break;
  }

  // Calculate door-specific properties based on style
  const renderSingleDoor = () => {
    // Position hinge at door edge along wall direction
    const hingeOffsetX = hingeOffset * door.width * wallDirX;
    const hingeOffsetY = hingeOffset * door.width * wallDirY;
    const hingeX = door.x + hingeOffsetX;
    const hingeY = door.y + hingeOffsetY;

    // Calculate door panel position based on swing angle and direction
    const swingRadians = (swingAngle * Math.PI) / 180;
    const swingDirX = perpDirX * Math.cos(swingRadians) - perpDirY * Math.sin(swingRadians) * swingMultiplier;
    const swingDirY = perpDirX * Math.sin(swingRadians) + perpDirY * Math.cos(swingRadians) * swingMultiplier;
    const doorEndX = hingeX + door.width * swingDirX * swingMultiplier;
    const doorEndY = hingeY + door.width * swingDirY * swingMultiplier;

    return { hingeX, hingeY, doorEndX, doorEndY, swingMultiplier };
  };

  const renderDoubleDoor = () => {
    // For double doors, create two panels that swing in opposite directions
    const halfWidth = door.width / 2;
    
    // Left panel
    const leftHingeX = door.x - (halfWidth / 2) * wallDirX;
    const leftHingeY = door.y - (halfWidth / 2) * wallDirY;
    const leftSwingRadians = (swingAngle * Math.PI) / 180;
    const leftSwingDirX = perpDirX * Math.cos(leftSwingRadians) - perpDirY * Math.sin(leftSwingRadians) * -1;
    const leftSwingDirY = perpDirX * Math.sin(leftSwingRadians) + perpDirY * Math.cos(leftSwingRadians) * -1;
    const leftDoorEndX = leftHingeX + halfWidth * leftSwingDirX * -1;
    const leftDoorEndY = leftHingeY + halfWidth * leftSwingDirY * -1;
    
    // Right panel
    const rightHingeX = door.x + (halfWidth / 2) * wallDirX;
    const rightHingeY = door.y + (halfWidth / 2) * wallDirY;
    const rightSwingDirX = perpDirX * Math.cos(leftSwingRadians) - perpDirY * Math.sin(leftSwingRadians) * 1;
    const rightSwingDirY = perpDirX * Math.sin(leftSwingRadians) + perpDirY * Math.cos(leftSwingRadians) * 1;
    const rightDoorEndX = rightHingeX + halfWidth * rightSwingDirX * 1;
    const rightDoorEndY = rightHingeY + halfWidth * rightSwingDirY * 1;

    return {
      left: { hingeX: leftHingeX, hingeY: leftHingeY, doorEndX: leftDoorEndX, doorEndY: leftDoorEndY },
      right: { hingeX: rightHingeX, hingeY: rightHingeY, doorEndX: rightDoorEndX, doorEndY: rightDoorEndY },
      halfWidth
    };
  };

  const renderSlidingDoor = () => {
    // For sliding doors, calculate slide position along the wall
    const slideDistance = (door.width * swingAngle) / 90; // Slide proportional to angle
    const slideDirection = swingMultiplier > 0 ? 1 : -1;
    const slideX = door.x + slideDistance * wallDirX * slideDirection;
    const slideY = door.y + slideDistance * wallDirY * slideDirection;

    return { slideX, slideY, slideDistance };
  };

  // Render based on door style
  const renderDoorContent = () => {
    switch (door.style) {
      case 'single':
        return renderSingleDoorContent();
      case 'double':
        return renderDoubleDoorContent();
      case 'sliding':
        return renderSlidingDoorContent();
      default:
        return renderSingleDoorContent();
    }
  };

  const renderSingleDoorContent = () => {
    const { hingeX, hingeY, doorEndX, doorEndY } = renderSingleDoor();
    
    return (
      <>
        {/* Door opening (gap in wall) */}
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
        
        {/* Door swing arc */}
        <Arc
          x={hingeX}
          y={hingeY}
          innerRadius={0}
          outerRadius={door.width}
          angle={90}
          rotation={(wallAngle * 180) / Math.PI + (swingMultiplier > 0 ? 90 : 0)}
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
        
        {/* Door handle */}
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
      </>
    );
  };

  const renderDoubleDoorContent = () => {
    const { left, right, halfWidth } = renderDoubleDoor();
    
    return (
      <>
        {/* Door opening (gap in wall) */}
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
        
        {/* Left door swing arc */}
        <Arc
          x={left.hingeX}
          y={left.hingeY}
          innerRadius={0}
          outerRadius={halfWidth}
          angle={90}
          rotation={(wallAngle * 180) / Math.PI + 90}
          stroke={isSelected ? '#3b82f6' : door.color}
          strokeWidth={1}
          dash={[5, 5]}
          opacity={0.3}
          listening={false}
        />
        
        {/* Right door swing arc */}
        <Arc
          x={right.hingeX}
          y={right.hingeY}
          innerRadius={0}
          outerRadius={halfWidth}
          angle={90}
          rotation={(wallAngle * 180) / Math.PI}
          stroke={isSelected ? '#3b82f6' : door.color}
          strokeWidth={1}
          dash={[5, 5]}
          opacity={0.3}
          listening={false}
        />
        
        {/* Animated left door panel */}
        {swingAngle > 0 && (
          <Line
            points={[left.hingeX, left.hingeY, left.doorEndX, left.doorEndY]}
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
        
        {/* Animated right door panel */}
        {swingAngle > 0 && (
          <Line
            points={[right.hingeX, right.hingeY, right.doorEndX, right.doorEndY]}
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
        
        {/* Door handles */}
        {swingAngle > 0 && (
          <>
            <Rect
              x={left.doorEndX - 3}
              y={left.doorEndY - 1}
              width={6}
              height={2}
              fill={isSelected ? '#3b82f6' : '#8B4513'}
              cornerRadius={1}
              onClick={handleClick}
              onTap={handleClick}
              onDblClick={handleDoubleClick}
              onDblTap={handleDoubleClick}
            />
            <Rect
              x={right.doorEndX - 3}
              y={right.doorEndY - 1}
              width={6}
              height={2}
              fill={isSelected ? '#3b82f6' : '#8B4513'}
              cornerRadius={1}
              onClick={handleClick}
              onTap={handleClick}
              onDblClick={handleDoubleClick}
              onDblTap={handleDoubleClick}
            />
          </>
        )}
        
        {/* Hinge indicators */}
        <Rect
          x={left.hingeX - 2}
          y={left.hingeY - 1}
          width={4}
          height={2}
          fill={isSelected ? '#3b82f6' : '#333'}
          cornerRadius={1}
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
        <Rect
          x={right.hingeX - 2}
          y={right.hingeY - 1}
          width={4}
          height={2}
          fill={isSelected ? '#3b82f6' : '#333'}
          cornerRadius={1}
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
        
        {/* Center divider */}
        <Line
          points={[door.x - 2 * wallDirX, door.y - 2 * wallDirY, door.x + 2 * wallDirX, door.y + 2 * wallDirY]}
          stroke={isSelected ? '#3b82f6' : '#666'}
          strokeWidth={2}
          lineCap="round"
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
      </>
    );
  };

  const renderSlidingDoorContent = () => {
    const { slideX, slideY } = renderSlidingDoor();
    
    return (
      <>
        {/* Door track */}
        <Line
          points={[
            door.x - door.width * wallDirX, door.y - door.width * wallDirY,
            door.x + door.width * wallDirX, door.y + door.width * wallDirY
          ]}
          stroke={isSelected ? '#3b82f6' : '#666'}
          strokeWidth={2}
          dash={[3, 3]}
          opacity={0.5}
          listening={false}
        />
        
        {/* Door opening (gap in wall) */}
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
        
        {/* Sliding door panel */}
        <Rect
          x={slideX}
          y={slideY}
          width={door.width}
          height={6}
          rotation={(wallAngle * 180) / Math.PI}
          offsetX={door.width / 2}
          offsetY={3}
          fill={door.color}
          stroke={isSelected ? '#3b82f6' : '#333'}
          strokeWidth={2}
          opacity={0.8}
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
        
        {/* Door handle */}
        <Rect
          x={slideX + (door.width * 0.8) * wallDirX}
          y={slideY + (door.width * 0.8) * wallDirY}
          width={8}
          height={3}
          rotation={(wallAngle * 180) / Math.PI}
          offsetX={4}
          offsetY={1.5}
          fill={isSelected ? '#3b82f6' : '#8B4513'}
          cornerRadius={1}
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
      </>
    );
  };

  return (
    <>
      {renderDoorContent()}

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