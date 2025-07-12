'use client';

import React from 'react';
import { Group, Rect, Arc, Line } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Door } from '@/types/elements/Door';
import { useMaterialStore } from '@/stores/materialStore';
import { useGlobalDoorAnimation } from '@/hooks/useDoorAnimation';
import DoorHandles from './elements/DoorHandles';

interface MaterializedDoorComponentProps {
  door: Door;
  isSelected: boolean;
  onSelect: () => void;
  onStartDrag: (e: KonvaEventObject<DragEvent>) => void;
  onDrag: (e: KonvaEventObject<DragEvent>) => void;
  onEndDrag: (e: KonvaEventObject<DragEvent>) => void;
}

export default function MaterializedDoorComponent({
  door,
  isSelected,
  onSelect,
  onStartDrag,
  onDrag,
  onEndDrag,
}: MaterializedDoorComponentProps) {
  const { getMaterialById } = useMaterialStore();
  const { getDoorState, toggleDoor } = useGlobalDoorAnimation();
  
  const material = door.materialId ? getMaterialById(door.materialId) : null;
  const doorState = getDoorState(door.id);
  
  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    toggleDoor(door.id);
  };

  // Calculate door animation and positioning based on style
  const swingAngle = doorState.currentAngle;
  const wallAngle = door.wallAngle || 0;
  
  // Calculate wall direction
  const wallDirX = Math.cos(wallAngle);
  const wallDirY = Math.sin(wallAngle);
  
  // Calculate perpendicular direction for door swing
  const perpDirX = -wallDirY;
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

  // Get material appearance or fallback to door defaults
  const getDoorAppearance = () => {
    if (material) {
      return {
        fill: material.color,
        stroke: material.color,
        opacity: material.properties.opacity,
        fillPatternImage: material.texture ? (() => {
          const img = new Image();
          img.src = material.texture;
          return img;
        })() : undefined,
        fillPatternScale: material.texture ? {
          x: material.properties.patternScale || 1,
          y: material.properties.patternScale || 1,
        } : undefined,
        fillPatternRotation: material.texture ? (material.properties.patternRotation || 0) : undefined,
      };
    }
    
    return {
      fill: door.color,
      stroke: isSelected ? '#3b82f6' : '#666',
      opacity: 1,
    };
  };

  const appearance = getDoorAppearance();

  const renderSingleDoorContent = () => {
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
        
        {/* Animated door panel with material */}
        {swingAngle > 0 && (
          <>
            <Line
              points={[hingeX, hingeY, doorEndX, doorEndY]}
              stroke={appearance.stroke}
              strokeWidth={6}
              lineCap="round"
              opacity={appearance.opacity}
              onClick={handleClick}
              onTap={handleClick}
              onDblClick={handleDoubleClick}
              onDblTap={handleDoubleClick}
            />
            
            {/* Material overlay for door panel */}
            {material && material.texture && (
              <Rect
                x={hingeX}
                y={hingeY - 3}
                width={door.width}
                height={6}
                rotation={(Math.atan2(doorEndY - hingeY, doorEndX - hingeX) * 180) / Math.PI}
                {...appearance}
                listening={false}
              />
            )}
            
            {/* Metallic effect */}
            {material && material.properties.metallic > 0.5 && (
              <Line
                points={[hingeX, hingeY, doorEndX, doorEndY]}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={3}
                opacity={material.properties.metallic * 0.4}
                listening={false}
              />
            )}
          </>
        )}
        
        {/* Door handle */}
        {swingAngle > 0 && (
          <Rect
            x={doorEndX - 3}
            y={doorEndY - 1}
            width={6}
            height={2}
            fill={material ? (material.properties.metallic > 0.5 ? '#C0C0C0' : '#8B4513') : '#8B4513'}
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

  // Render based on door style
  const renderDoorContent = () => {
    switch (door.style) {
      case 'single':
        return renderSingleDoorContent();
      case 'double':
        // TODO: Implement double door with materials
        return renderSingleDoorContent();
      case 'sliding':
        // TODO: Implement sliding door with materials
        return renderSingleDoorContent();
      default:
        return renderSingleDoorContent();
    }
  };

  return (
    <Group>
      {renderDoorContent()}

      {/* Editing handles */}
      <DoorHandles
        door={door}
        isSelected={isSelected}
        onStartDrag={onStartDrag}
        onDrag={onDrag}
        onEndDrag={onEndDrag}
      />
    </Group>
  );
}