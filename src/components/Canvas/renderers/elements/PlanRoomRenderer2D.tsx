'use client';

import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Room2D, Element2D } from '@/types/elements2D';
import { Material } from '@/types/materials/Material';
import { PLAN_VIEW_CONFIG } from '../PlanViewRenderer2D';
import { MaterialRenderer2D, MaterialPatternUtils } from '@/utils/materialRenderer2D';

interface PlanRoomRenderer2DProps {
  room: Room2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function PlanRoomRenderer2D({
  room,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit,
}: PlanRoomRenderer2DProps) {
  const floorMaterial = room.floorMaterialId ? getMaterialById(room.floorMaterialId) : undefined;
  const position = room.transform.position;
  
  // Initialize material renderer for plan view
  const materialRenderer = React.useMemo(() => new MaterialRenderer2D('plan'), []);

  // Get room appearance
  const getRoomAppearance = () => {
    if (showMaterials && floorMaterial) {
      // Use advanced material pattern system
      const materialPattern = materialRenderer.getKonvaFillPattern(floorMaterial, scale);
      
      return {
        ...materialPattern,
        stroke: isSelected ? '#3b82f6' : floorMaterial.color,
        strokeWidth: PLAN_VIEW_CONFIG.lineWeights.room * scale,
        opacity: (materialPattern.opacity || 1) * 0.3, // Rooms are subtle in plan view
      };
    }
    
    return {
      fill: PLAN_VIEW_CONFIG.colors.room,
      stroke: isSelected ? '#3b82f6' : 'transparent',
      strokeWidth: PLAN_VIEW_CONFIG.lineWeights.room * scale,
      opacity: 0.1, // Very subtle fill for rooms
    };
  };

  const appearance = getRoomAppearance();

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    // Could trigger room properties dialog
    const newName = prompt('Enter room name:', room.name);
    if (newName && newName !== room.name) {
      onEdit({ ...room, name: newName });
    }
  };

  // Calculate room type icon
  const getRoomTypeIcon = (roomType: string): string => {
    const icons: Record<string, string> = {
      bedroom: '🛏️',
      bathroom: '🚿',
      kitchen: '🍳',
      living: '🛋️',
      dining: '🍽️',
      office: '💼',
      storage: '📦',
      other: '🏠',
    };
    return icons[roomType] || icons.other;
  };

  return (
    <Group>
      {/* Room fill area */}
      <Rect
        x={position.x - room.dimensions.width / 2}
        y={position.y - room.dimensions.height / 2}
        width={room.dimensions.width}
        height={room.dimensions.height}
        rotation={room.transform.rotation}
        {...appearance}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
      />

      {/* Room boundary outline (when selected or for clarity) */}
      {(isSelected || !showMaterials) && (
        <Rect
          x={position.x - room.dimensions.width / 2}
          y={position.y - room.dimensions.height / 2}
          width={room.dimensions.width}
          height={room.dimensions.height}
          rotation={room.transform.rotation}
          fill="transparent"
          stroke={isSelected ? '#3b82f6' : '#cccccc'}
          strokeWidth={(isSelected ? 2 : 1) * scale}
          dash={isSelected ? [8 * scale, 4 * scale] : [2 * scale, 2 * scale]}
          opacity={0.7}
          listening={false}
        />
      )}

      {/* Room center point indicator */}
      <Rect
        x={position.x - 2}
        y={position.y - 2}
        width={4}
        height={4}
        fill={isSelected ? '#3b82f6' : '#999999'}
        opacity={0.5}
        listening={false}
      />

      {/* Room label */}
      <Group>
        {/* Room name */}
        <Text
          x={position.x}
          y={position.y - 15 * scale}
          text={room.name}
          fontSize={12 * scale}
          fontFamily="Arial"
          fontStyle={isSelected ? 'bold' : 'normal'}
          fill={isSelected ? '#3b82f6' : '#333333'}
          align="center"
          offsetX={50 * scale}
          width={100 * scale}
          listening={false}
        />

        {/* Room type icon */}
        <Text
          x={position.x - 20 * scale}
          y={position.y - 15 * scale}
          text={getRoomTypeIcon(room.roomType)}
          fontSize={14 * scale}
          fontFamily="Arial"
          align="center"
          listening={false}
        />

        {/* Room area */}
        <Text
          x={position.x}
          y={position.y}
          text={`${(room.area / 144).toFixed(1)} sq ft`}
          fontSize={10 * scale}
          fontFamily="Arial"
          fill="#666666"
          align="center"
          offsetX={40 * scale}
          width={80 * scale}
          listening={false}
        />

        {/* Room dimensions */}
        <Text
          x={position.x}
          y={position.y + 12 * scale}
          text={`${(room.dimensions.width / 12).toFixed(1)}' × ${(room.dimensions.height / 12).toFixed(1)}'`}
          fontSize={8 * scale}
          fontFamily="Arial"
          fill="#888888"
          align="center"
          offsetX={30 * scale}
          width={60 * scale}
          listening={false}
        />
      </Group>

      {/* Room type indicator (when selected) */}
      {isSelected && (
        <Text
          x={position.x}
          y={position.y + 30 * scale}
          text={room.roomType.toUpperCase()}
          fontSize={8 * scale}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={25 * scale}
          width={50 * scale}
          listening={false}
        />
      )}

      {/* Edit indicator (when selected) */}
      {isSelected && (
        <Text
          x={position.x}
          y={position.y + 45 * scale}
          text="Double-click to edit"
          fontSize={7 * scale}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={40 * scale}
          width={80 * scale}
          listening={false}
        />
      )}

      {/* Material pattern overlay for floor */}
      {showMaterials && floorMaterial && floorMaterial.texture && (
        <Rect
          x={position.x - room.dimensions.width / 2}
          y={position.y - room.dimensions.height / 2}
          width={room.dimensions.width}
          height={room.dimensions.height}
          rotation={room.transform.rotation}
          fillPatternImage={(() => {
            const img = new Image();
            img.src = floorMaterial.texture;
            return img;
          })()}
          fillPatternScale={{
            x: (floorMaterial.properties.patternScale || 1) * 0.5,
            y: (floorMaterial.properties.patternScale || 1) * 0.5,
          }}
          fillPatternRotation={floorMaterial.properties.patternRotation || 0}
          opacity={0.2}
          listening={false}
        />
      )}

      {/* Room boundary walls indicator (subtle lines showing which walls bound this room) */}
      {room.boundaryWalls.length > 0 && isSelected && (
        <Group>
          {/* This would typically connect to actual wall positions */}
          {/* For now, we'll show a subtle boundary indicator */}
          <Rect
            x={position.x - room.dimensions.width / 2 - 1}
            y={position.y - room.dimensions.height / 2 - 1}
            width={room.dimensions.width + 2}
            height={room.dimensions.height + 2}
            rotation={room.transform.rotation}
            fill="transparent"
            stroke="#ff6b35"
            strokeWidth={1 * scale}
            dash={[4 * scale, 4 * scale]}
            opacity={0.5}
            listening={false}
          />
        </Group>
      )}

      {/* Ceiling height indicator (when different from standard) */}
      {room.ceilingHeight !== 96 && isSelected && ( // 96 inches = 8 feet standard
        <Text
          x={position.x + room.dimensions.width / 2 - 10 * scale}
          y={position.y - room.dimensions.height / 2 + 5 * scale}
          text={`${(room.ceilingHeight / 12).toFixed(1)}'H`}
          fontSize={7 * scale}
          fontFamily="Arial"
          fill="#666666"
          align="right"
          width={20 * scale}
          listening={false}
        />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <Rect
          x={position.x - room.dimensions.width / 2 - 10}
          y={position.y - room.dimensions.height / 2 - 10}
          width={room.dimensions.width + 20}
          height={room.dimensions.height + 20}
          rotation={room.transform.rotation}
          stroke="#3b82f6"
          strokeWidth={2 * scale}
          dash={[10 * scale, 5 * scale]}
          fill="rgba(59, 130, 246, 0.05)"
          listening={false}
        />
      )}
    </Group>
  );
}