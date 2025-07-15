'use client';

import React from 'react';
import { Group, Line, Rect, Text, Arrow } from 'react-konva';
import { Stair2D, Element2D } from '@/types/elements2D';
import { Material } from '@/types/materials/Material';
import { PLAN_VIEW_CONFIG } from '../PlanViewRenderer2D';

interface PlanStairRenderer2DProps {
  stair: Stair2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function PlanStairRenderer2D({
  stair,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit,
}: PlanStairRenderer2DProps) {
  // Suppress unused variable warning
  void onEdit;
  const material = stair.materialId ? getMaterialById(stair.materialId) : undefined;
  const position = stair.transform.position;
  const rotation = stair.transform.rotation;

  // Get stair appearance
  const getStairAppearance = () => {
    if (showMaterials && material) {
      return {
        fill: material.color,
        stroke: material.color,
        strokeWidth: PLAN_VIEW_CONFIG.lineWeights.stair * scale,
        opacity: material.properties.opacity,
      };
    }
    
    return {
      fill: PLAN_VIEW_CONFIG.colors.stair,
      stroke: isSelected ? '#3b82f6' : PLAN_VIEW_CONFIG.colors.stair,
      strokeWidth: PLAN_VIEW_CONFIG.lineWeights.stair * scale,
      opacity: 1,
    };
  };

  const appearance = getStairAppearance();

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    console.log('Edit stair:', stair.id);
  };

  // Calculate step positions
  const stepCount = stair.steps.length;
  const stepWidth = stair.totalRun / stepCount;

  return (
    <Group>
      {/* Stair outline */}
      <Rect
        x={position.x - stair.totalRun / 2}
        y={position.y - stair.dimensions.width / 2}
        width={stair.totalRun}
        height={stair.dimensions.width}
        rotation={rotation}
        fill={appearance.fill}
        stroke={appearance.stroke}
        strokeWidth={appearance.strokeWidth}
        opacity={0.3}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        shadowColor={isSelected ? '#3b82f6' : undefined}
        shadowBlur={isSelected ? 5 * scale : 0}
        shadowOpacity={isSelected ? 0.3 : 0}
      />

      {/* Individual step treads */}
      {stair.steps.map((step, index) => {
        const stepX = position.x - stair.totalRun / 2 + index * stepWidth;
        
        return (
          <Line
            key={`step-${index}`}
            points={[
              stepX + stepWidth,
              position.y - stair.dimensions.width / 2,
              stepX + stepWidth,
              position.y + stair.dimensions.width / 2,
            ]}
            rotation={rotation}
            stroke={appearance.stroke}
            strokeWidth={1 * scale}
            opacity={0.8}
            listening={false}
          />
        );
      })}

      {/* Direction arrow */}
      <Arrow
        x={position.x - stair.totalRun / 2 + 20 * scale}
        y={position.y}
        points={[
          0, 0,
          stair.totalRun - 40 * scale, 0,
        ]}
        rotation={rotation}
        stroke={appearance.stroke}
        strokeWidth={2 * scale}
        fill={appearance.stroke}
        pointerLength={8 * scale}
        pointerWidth={6 * scale}
        opacity={0.8}
        listening={false}
      />

      {/* Direction indicator text */}
      <Text
        x={position.x}
        y={position.y - 5 * scale}
        text={stair.direction.toUpperCase()}
        fontSize={10 * scale}
        fontFamily="Arial"
        fontStyle="bold"
        fill={appearance.stroke}
        align="center"
        offsetX={15 * scale}
        width={30 * scale}
        rotation={rotation}
        listening={false}
      />

      {/* Step count indicator */}
      <Text
        x={position.x}
        y={position.y + 10 * scale}
        text={`${stepCount} STEPS`}
        fontSize={8 * scale}
        fontFamily="Arial"
        fill={appearance.stroke}
        align="center"
        offsetX={25 * scale}
        width={50 * scale}
        rotation={rotation}
        listening={false}
      />

      {/* Handrail indicators */}
      {stair.handrailSide !== 'none' && (
        <Group>
          {(stair.handrailSide === 'left' || stair.handrailSide === 'both') && (
            <Line
              points={[
                position.x - stair.totalRun / 2,
                position.y - stair.dimensions.width / 2 - 5 * scale,
                position.x + stair.totalRun / 2,
                position.y - stair.dimensions.width / 2 - 5 * scale,
              ]}
              rotation={rotation}
              stroke={appearance.stroke}
              strokeWidth={2 * scale}
              dash={[4 * scale, 4 * scale]}
              opacity={0.6}
              listening={false}
            />
          )}
          
          {(stair.handrailSide === 'right' || stair.handrailSide === 'both') && (
            <Line
              points={[
                position.x - stair.totalRun / 2,
                position.y + stair.dimensions.width / 2 + 5 * scale,
                position.x + stair.totalRun / 2,
                position.y + stair.dimensions.width / 2 + 5 * scale,
              ]}
              rotation={rotation}
              stroke={appearance.stroke}
              strokeWidth={2 * scale}
              dash={[4 * scale, 4 * scale]}
              opacity={0.6}
              listening={false}
            />
          )}
        </Group>
      )}

      {/* Landing area (if present) */}
      {stair.landingSize && (
        <Rect
          x={position.x + stair.totalRun / 2}
          y={position.y - stair.landingSize.width / 2}
          width={stair.landingSize.height}
          height={stair.landingSize.width}
          rotation={rotation}
          fill={appearance.fill}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth}
          opacity={0.2}
          listening={false}
        />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <Group>
          <Rect
            x={position.x - stair.totalRun / 2 - 10}
            y={position.y - stair.dimensions.width / 2 - 10}
            width={stair.totalRun + 20}
            height={stair.dimensions.width + 20}
            rotation={rotation}
            stroke="#3b82f6"
            strokeWidth={2 * scale}
            dash={[8 * scale, 4 * scale]}
            fill="rgba(59, 130, 246, 0.1)"
            listening={false}
          />
          
          {/* Selection handles */}
          <Rect
            x={position.x - stair.totalRun / 2 - 3}
            y={position.y - 3}
            width={6}
            height={6}
            rotation={rotation}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
          <Rect
            x={position.x + stair.totalRun / 2 - 3}
            y={position.y - 3}
            width={6}
            height={6}
            rotation={rotation}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
        </Group>
      )}

      {/* Stair label (when selected) */}
      {isSelected && (
        <Text
          x={position.x}
          y={position.y + stair.dimensions.width / 2 + 20 * scale}
          text={`Stair: ${stepCount} steps, ${(stair.totalRise / 12).toFixed(1)}' rise`}
          fontSize={10 * scale}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={80 * scale}
          width={160 * scale}
          listening={false}
        />
      )}

      {/* Material overlay effects */}
      {showMaterials && material && material.properties.metallic > 0.5 && (
        <Rect
          x={position.x - stair.totalRun / 2}
          y={position.y - stair.dimensions.width / 2}
          width={stair.totalRun}
          height={stair.dimensions.width}
          rotation={rotation}
          fill="linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)"
          opacity={material.properties.metallic * 0.3}
          listening={false}
        />
      )}

      {/* Rise/run indicators (when selected) */}
      {isSelected && (
        <Group>
          <Text
            x={position.x - stair.totalRun / 2 + 10 * scale}
            y={position.y + stair.dimensions.width / 2 + 5 * scale}
            text={`R: ${(stair.totalRise / stepCount).toFixed(1)}"`}
            fontSize={7 * scale}
            fontFamily="Arial"
            fill="#666666"
            listening={false}
          />
          <Text
            x={position.x + stair.totalRun / 2 - 30 * scale}
            y={position.y + stair.dimensions.width / 2 + 5 * scale}
            text={`T: ${(stair.totalRun / stepCount).toFixed(1)}"`}
            fontSize={7 * scale}
            fontFamily="Arial"
            fill="#666666"
            listening={false}
          />
        </Group>
      )}
    </Group>
  );
}