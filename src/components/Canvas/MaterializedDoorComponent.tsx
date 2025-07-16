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

  const renderDoubleDoorContent = () => {
    // Render two single doors mirrored about the center
    return (
      <>
        {renderSingleDoorContentWithOverride({ x: door.x - door.width / 4, width: door.width / 2 })}
        {renderSingleDoorContentWithOverride({ x: door.x + door.width / 4, width: door.width / 2, swingDirection: door.swingDirection === 'left' ? 'right' : 'left' })}
      </>
    )
  }

  const renderSlidingDoorContent = () => {
    // Render a sliding panel along the wall
    const slideOffset = doorState.currentAngle / 90 * door.width
    return (
      <>
        <Rect
          x={door.x - door.width / 2 + slideOffset}
          y={door.y - 2}
          width={door.width}
          height={4}
          rotation={(door.wallAngle || 0) * 180 / Math.PI}
          offsetX={0}
          offsetY={0}
          fill={material ? material.color : '#ccc'}
          stroke={isSelected ? '#3b82f6' : '#666'}
          strokeWidth={isSelected ? 2 : 1}
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
      </>
    )
  }

  // Accepts an optional override for door object (for double doors)
  const renderSingleDoorContentWithOverride = (override?: Partial<Door>) => {
    const d = { ...door, ...override }
    // Position hinge at door edge along wall direction
    const hingeOffsetX = hingeOffset * d.width * wallDirX
    const hingeOffsetY = hingeOffset * d.width * wallDirY
    const hingeX = d.x + hingeOffsetX
    const hingeY = d.y + hingeOffsetY
    const swingRadians = (swingAngle * Math.PI) / 180
    const swingDirX = perpDirX * Math.cos(swingRadians) - perpDirY * Math.sin(swingRadians) * swingMultiplier
    const swingDirY = perpDirX * Math.sin(swingRadians) + perpDirY * Math.cos(swingRadians) * swingMultiplier
    const doorEndX = hingeX + d.width * swingDirX * swingMultiplier
    const doorEndY = hingeY + d.width * swingDirY * swingMultiplier
    return (
      <>
        <Rect
          x={d.x}
          y={d.y}
          width={d.width}
          height={4}
          rotation={(wallAngle * 180) / Math.PI}
          offsetX={d.width / 2}
          offsetY={2}
          fill="white"
          stroke={isSelected ? '#3b82f6' : '#666'}
          strokeWidth={isSelected ? 2 : 1}
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
        <Arc
          x={hingeX}
          y={hingeY}
          innerRadius={0}
          outerRadius={d.width}
          angle={90}
          rotation={(wallAngle * 180) / Math.PI + (swingMultiplier > 0 ? 90 : 0)}
          stroke={isSelected ? '#3b82f6' : d.color}
          strokeWidth={1}
          dash={[5, 5]}
          opacity={0.3}
          listening={false}
        />
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
            {material && material.texture && (
              <Rect
                x={hingeX}
                y={hingeY - 3}
                width={d.width}
                height={6}
                rotation={(Math.atan2(doorEndY - hingeY, doorEndX - hingeX) * 180) / Math.PI}
                {...appearance}
                listening={false}
              />
            )}
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
    )
  }

  const renderDoorContent = () => {
    switch (door.style) {
      case 'single':
        return renderSingleDoorContentWithOverride()
      case 'double':
        return renderDoubleDoorContent()
      case 'sliding':
        return renderSlidingDoorContent()
      default:
        return renderSingleDoorContentWithOverride()
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
