'use client';

import React from 'react';
import { Group, Line, Arc, Rect, Text } from 'react-konva';
import { Door2D, Element2D } from '@/types/elements2D';
import { Material } from '@/types/materials/Material';
import { PLAN_VIEW_CONFIG } from '../PlanViewConfig';
import { MaterialRenderer2D } from '@/utils/materialRenderer2D';

interface PlanDoorRenderer2DProps {
  door: Door2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function PlanDoorRenderer2D({
  door,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit,
}: PlanDoorRenderer2DProps) {
  // Suppress unused variable warning
  void onEdit;
  const material = door.materialId ? getMaterialById(door.materialId) : undefined;

  // Initialize material renderer for plan view
  const materialRenderer = React.useMemo(() => new MaterialRenderer2D('plan'), []);

  // Get door appearance
  const getDoorAppearance = () => {
    if (showMaterials && material) {
      // Use advanced material pattern system
      const materialPattern = materialRenderer.getKonvaFillPattern(material, scale);

      return {
        ...materialPattern,
        stroke: isSelected ? '#3b82f6' : material.color,
        strokeWidth: PLAN_VIEW_CONFIG.lineWeights.door * scale,
      };
    }

    return {
      fill: PLAN_VIEW_CONFIG.colors.door,
      stroke: isSelected ? '#3b82f6' : PLAN_VIEW_CONFIG.colors.door,
      strokeWidth: PLAN_VIEW_CONFIG.lineWeights.door * scale,
      opacity: 1,
    };
  };

  const appearance = getDoorAppearance();
  const position = door.transform.position;
  const rotation = door.transform.rotation;

  // Calculate door swing direction multiplier
  const swingMultiplier = door.swingDirection === 'left' ? -1 : 1;

  // Calculate swing arc end point
  const swingEndX = position.x + Math.cos((rotation + door.swingAngle * swingMultiplier) * Math.PI / 180) * door.width;
  const swingEndY = position.y + Math.sin((rotation + door.swingAngle * swingMultiplier) * Math.PI / 180) * door.width;

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    // Could trigger door properties dialog
  };

  return (
    <Group>
      {/* Door opening (gap in wall) - this is typically handled by the wall renderer */}

      {/* Door panel */}
      <Rect
        x={position.x - door.width / 2}
        y={position.y - door.dimensions.depth! / 2}
        width={door.width}
        height={door.dimensions.depth!}
        rotation={rotation}
        {...appearance}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        shadowColor={isSelected ? '#3b82f6' : undefined}
        shadowBlur={isSelected ? 3 * scale : 0}
        shadowOpacity={isSelected ? 0.3 : 0}
      />

      {/* Door swing arc */}
      <Arc
        x={position.x}
        y={position.y}
        innerRadius={0}
        outerRadius={door.width}
        angle={Math.abs(door.swingAngle)}
        rotation={rotation + (door.swingDirection === 'left' ? -Math.abs(door.swingAngle) : 0)}
        stroke={appearance.stroke}
        strokeWidth={1 * scale}
        dash={[3 * scale, 3 * scale]}
        opacity={0.6}
        listening={false}
      />

      {/* Door swing line (from hinge to door edge) */}
      <Line
        points={[position.x, position.y, swingEndX, swingEndY]}
        stroke={appearance.stroke}
        strokeWidth={1 * scale}
        dash={[2 * scale, 2 * scale]}
        opacity={0.5}
        listening={false}
      />

      {/* Door hinge point */}
      <Arc
        x={position.x}
        y={position.y}
        innerRadius={0}
        outerRadius={2 * scale}
        angle={360}
        fill={appearance.stroke}
        listening={false}
      />

      {/* Door handle indicator */}
      {(() => {
        const handleSide = door.handleSide === 'left' ? -1 : 1;
        const handleOffset = door.width * 0.8; // Handle is 80% along the door width
        const handleX = position.x + Math.cos(rotation * Math.PI / 180) * handleOffset * handleSide;
        const handleY = position.y + Math.sin(rotation * Math.PI / 180) * handleOffset * handleSide;

        return (
          <Arc
            x={handleX}
            y={handleY}
            innerRadius={0}
            outerRadius={1.5 * scale}
            angle={360}
            fill={appearance.stroke}
            stroke={appearance.stroke}
            strokeWidth={0.5 * scale}
            listening={false}
          />
        );
      })()}

      {/* Door threshold indicator */}
      {door.threshold && (
        <Line
          points={[
            position.x - door.width / 2,
            position.y,
            position.x + door.width / 2,
            position.y,
          ]}
          rotation={rotation}
          stroke={appearance.stroke}
          strokeWidth={3 * scale}
          opacity={0.8}
          listening={false}
        />
      )}

      {/* Door type indicator */}
      {door.openingType !== 'single' && (
        <Text
          x={position.x}
          y={position.y - door.width / 2 - 10 * scale}
          text={door.openingType.toUpperCase()}
          fontSize={8 * scale}
          fontFamily="Arial"
          fill={appearance.stroke}
          align="center"
          offsetX={20 * scale}
          width={40 * scale}
          listening={false}
        />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <Group>
          {/* Selection rectangle around door */}
          <Rect
            x={position.x - door.width / 2 - 5}
            y={position.y - door.dimensions.depth! / 2 - 5}
            width={door.width + 10}
            height={door.dimensions.depth! + 10}
            rotation={rotation}
            stroke="#3b82f6"
            strokeWidth={2 * scale}
            dash={[6 * scale, 3 * scale]}
            fill="rgba(59, 130, 246, 0.1)"
            listening={false}
          />

          {/* Selection arc for swing */}
          <Arc
            x={position.x}
            y={position.y}
            innerRadius={door.width - 5}
            outerRadius={door.width + 5}
            angle={Math.abs(door.swingAngle)}
            rotation={rotation + (door.swingDirection === 'left' ? -Math.abs(door.swingAngle) : 0)}
            stroke="#3b82f6"
            strokeWidth={2 * scale}
            opacity={0.5}
            listening={false}
          />
        </Group>
      )}

      {/* Material overlay effects */}
      {showMaterials && material && material.properties.metallic > 0.5 && (
        <Rect
          x={position.x - door.width / 2}
          y={position.y - door.dimensions.depth! / 2}
          width={door.width}
          height={door.dimensions.depth!}
          rotation={rotation}
          fill="linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)"
          opacity={material.properties.metallic * 0.3}
          listening={false}
        />
      )}

      {/* Door swing animation indicator (if door is animating) */}
      {door.swingAngle > 0 && (
        <Group>
          {/* Animated door position */}
          <Rect
            x={position.x - door.width / 2}
            y={position.y - door.dimensions.depth! / 2}
            width={door.width}
            height={door.dimensions.depth!}
            rotation={rotation + door.swingAngle * swingMultiplier}
            fill={appearance.fill}
            stroke={appearance.stroke}
            strokeWidth={appearance.strokeWidth}
            opacity={0.6}
            listening={false}
          />

          {/* Motion blur effect */}
          <Arc
            x={position.x}
            y={position.y}
            innerRadius={door.width * 0.9}
            outerRadius={door.width * 1.1}
            angle={Math.abs(door.swingAngle)}
            rotation={rotation + (door.swingDirection === 'left' ? -Math.abs(door.swingAngle) : 0)}
            fill="rgba(139, 69, 19, 0.2)"
            listening={false}
          />
        </Group>
      )}

      {/* Door label (when selected or in annotation mode) */}
      {isSelected && (
        <Text
          x={position.x}
          y={position.y + door.width / 2 + 15 * scale}
          text={`Door ${door.width}"W x ${door.height}"H`}
          fontSize={10 * scale}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={50 * scale}
          width={100 * scale}
          listening={false}
        />
      )}
    </Group>
  );
}
