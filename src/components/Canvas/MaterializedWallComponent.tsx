'use client';

import React from 'react';
import { Line, Rect } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Wall } from '@/types/elements/Wall';
import { useMaterialStore } from '@/stores/materialStore';
import WallHandles from './elements/WallHandles';

interface MaterializedWallComponentProps {
  wall: Wall;
  isSelected: boolean;
  onSelect: () => void;
  onStartDrag: (e: KonvaEventObject<DragEvent>) => void;
  onDrag: (e: KonvaEventObject<DragEvent>) => void;
  onEndDrag: (e: KonvaEventObject<DragEvent>) => void;
  // Wall editor callbacks for handles
  onWallStartDrag?: (handleType: 'start' | 'end' | 'move', x: number, y: number) => void;
  onWallDrag?: (handleType: 'start' | 'end' | 'move', x: number, y: number) => void;
  onWallEndDrag?: (handleType: 'start' | 'end' | 'move') => void;
}

export default function MaterializedWallComponent({
  wall,
  isSelected,
  onSelect,
  onStartDrag,
  onDrag,
  onEndDrag,
  onWallStartDrag,
  onWallDrag,
  onWallEndDrag,
}: MaterializedWallComponentProps) {
  const { getMaterialById } = useMaterialStore();
  
  const material = wall.materialId ? getMaterialById(wall.materialId) : null;
  
  const length = Math.sqrt(
    Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
  );
  
  const angle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX);
  const angleDegrees = (angle * 180) / Math.PI;

  const handleDragOver = (e: KonvaEventObject<DragEvent>) => {
    e.evt?.preventDefault();
  };

  const handleDrop = (e: KonvaEventObject<DragEvent>) => {
    e.evt?.preventDefault();
    // Material drop handling will be implemented here
  };

  // Get material properties or fallback to wall defaults
  const getWallAppearance = () => {
    if (material) {
      return {
        fill: material.color,
        opacity: material.properties.opacity,
        stroke: material.color,
        strokeWidth: 1,
        // Add texture pattern if available
        fillPatternImage: material.textureImage ? (() => {
          const img = new Image();
          img.src = material.textureImage;
          return img;
        })() : undefined,
        fillPatternScale: material.textureImage ? {
          x: material.properties.patternScale || 1,
          y: material.properties.patternScale || 1,
        } : undefined,
        fillPatternRotation: material.textureImage ? (material.properties.patternRotation || 0) : undefined,
      };
    }
    
    // Fallback to original wall appearance
    return {
      fill: wall.color,
      stroke: isSelected ? '#3b82f6' : '#666',
      strokeWidth: isSelected ? 2 : 1,
      opacity: 1,
    };
  };

  const appearance = getWallAppearance();

  return (
    <>
      {/* Main wall body */}
      <Rect
        x={wall.startX}
        y={wall.startY - wall.thickness / 2}
        width={length}
        height={wall.thickness}
        rotation={angleDegrees}
        {...appearance}
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={onStartDrag}
        onDragMove={onDrag}
        onDragEnd={onEndDrag}
        draggable={isSelected}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />

      {/* Material overlay effects */}
      {material && material.properties.metallic > 0.5 && (
        <Rect
          x={wall.startX}
          y={wall.startY - wall.thickness / 2}
          width={length}
          height={wall.thickness}
          rotation={angleDegrees}
          fill="linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)"
          opacity={material.properties.metallic * 0.3}
          listening={false}
        />
      )}

      {/* Reflectivity highlight */}
      {material && material.properties.reflectivity > 0.5 && (
        <Line
          points={[wall.startX, wall.startY, wall.endX, wall.endY]}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={2}
          opacity={material.properties.reflectivity * 0.5}
          listening={false}
        />
      )}

      {/* Wall centerline for reference */}
      <Line
        points={[wall.startX, wall.startY, wall.endX, wall.endY]}
        stroke={isSelected ? '#3b82f6' : '#999'}
        strokeWidth={1}
        dash={[5, 5]}
        opacity={0.5}
        listening={false}
      />

      {/* Editing handles */}
      {onWallStartDrag && onWallDrag && onWallEndDrag && (
        <WallHandles
          wall={wall}
          isSelected={isSelected}
          onStartDrag={onWallStartDrag}
          onDrag={onWallDrag}
          onEndDrag={onWallEndDrag}
        />
      )}
    </>
  );
}