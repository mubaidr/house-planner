'use client';

import React from 'react';
import { Group, Line, Rect, Text } from 'react-konva';
import { Stair2D, Element2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';
import { Material } from '@/types/materials/Material';
import { ELEVATION_VIEW_CONFIG } from '../ElevationViewConfig';
// import { MaterialRenderer2D } from '@/utils/materialRenderer2D';

interface ElevationStairRenderer2DProps {
  stair: Stair2D;
  viewType: ViewType2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function ElevationStairRenderer2D({
  stair,
  viewType,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit,
}: ElevationStairRenderer2DProps) {
  // Suppress unused variable warnings
  void viewType;
  void onEdit;
  const material = stair.materialId ? getMaterialById(stair.materialId) : undefined;
  const position = stair.transform.position;

  // Get stair appearance
  const getStairAppearance = () => {
    if (showMaterials && material) {
      return {
        fill: material.color,
        stroke: material.color,
        strokeWidth: ELEVATION_VIEW_CONFIG.lineWeights.stair * scale,
        opacity: material.properties.opacity,
      };
    }

    return {
      fill: ELEVATION_VIEW_CONFIG.colors.stair,
      stroke: isSelected ? '#3b82f6' : ELEVATION_VIEW_CONFIG.colors.stair,
      strokeWidth: ELEVATION_VIEW_CONFIG.lineWeights.stair * scale,
      opacity: 1,
    };
  };

  const appearance = getStairAppearance();

  // Calculate stair profile for elevation view
  const stepCount = stair.steps.length;
  const avgRise = stair.totalRise / stepCount;
  const avgRun = stair.totalRun / stepCount;

  const stairX = position.x - stair.totalRun / 2;
  const stairY = ELEVATION_VIEW_CONFIG.heightReferences.groundLevel;

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    // Edit stair in elevation view
  };

  return (
    <Group>
      {/* Stair profile outline */}
      <Group>
        {stair.steps.map((step, index) => {
          const stepX = stairX + index * avgRun;
          const stepY = stairY - (index + 1) * avgRise;

          return (
            <Group key={`step-${index}`}>
              {/* Step tread (horizontal) */}
              <Line
                points={[
                  stepX,
                  stepY,
                  stepX + step.run,
                  stepY,
                ]}
                stroke={appearance.stroke}
                strokeWidth={appearance.strokeWidth}
                listening={index === 0 ? true : false}
                onClick={index === 0 ? handleClick : undefined}
                onTap={index === 0 ? handleClick : undefined}
                onDblClick={index === 0 ? handleDoubleClick : undefined}
                onDblTap={index === 0 ? handleDoubleClick : undefined}
              />

              {/* Step riser (vertical) */}
              <Line
                points={[
                  stepX + step.run,
                  stepY,
                  stepX + step.run,
                  stepY + step.rise,
                ]}
                stroke={appearance.stroke}
                strokeWidth={appearance.strokeWidth}
                listening={false}
              />

              {/* Step fill for material visualization */}
              {showMaterials && (
                <Rect
                  x={stepX}
                  y={stepY}
                  width={step.run}
                  height={step.rise}
                  fill={appearance.fill}
                  opacity={appearance.opacity * 0.3}
                  listening={false}
                />
              )}
            </Group>
          );
        })}
      </Group>

      {/* Stair underside (soffit) */}
      <Line
        points={[
          stairX,
          stairY,
          stairX + stair.totalRun,
          stairY - stair.totalRise,
        ]}
        stroke={appearance.stroke}
        strokeWidth={appearance.strokeWidth}
        dash={[4 * scale, 4 * scale]}
        opacity={0.6}
        listening={false}
      />

      {/* Handrail */}
      {stair.handrailSide !== 'none' && (
        <Group>
          {(stair.handrailSide === 'left' || stair.handrailSide === 'both') && (
            <Line
              points={[
                stairX,
                stairY - 36, // 36 inches handrail height
                stairX + stair.totalRun,
                stairY - stair.totalRise - 36,
              ]}
              stroke={appearance.stroke}
              strokeWidth={3 * scale}
              listening={false}
            />
          )}

          {(stair.handrailSide === 'right' || stair.handrailSide === 'both') && (
            <Line
              points={[
                stairX,
                stairY - 36,
                stairX + stair.totalRun,
                stairY - stair.totalRise - 36,
              ]}
              stroke={appearance.stroke}
              strokeWidth={3 * scale}
              listening={false}
            />
          )}

          {/* Handrail posts */}
          {Array.from({ length: Math.floor(stepCount / 3) + 1 }, (_, i) => {
            const postX = stairX + (i * 3 * avgRun);
            const postY = stairY - (i * 3 * avgRise);

            return (
              <Line
                key={`post-${i}`}
                points={[
                  postX,
                  postY,
                  postX,
                  postY - 36,
                ]}
                stroke={appearance.stroke}
                strokeWidth={2 * scale}
                opacity={0.7}
                listening={false}
              />
            );
          })}
        </Group>
      )}

      {/* Landing area (if present) */}
      {stair.landingSize && (
        <Rect
          x={stairX + stair.totalRun}
          y={stairY - stair.totalRise - stair.landingSize.height}
          width={stair.landingSize.width}
          height={stair.landingSize.height}
          fill={appearance.fill}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth}
          opacity={0.5}
          listening={false}
        />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <Group>
          <Rect
            x={stairX - 10}
            y={stairY - stair.totalRise - 10}
            width={stair.totalRun + 20}
            height={stair.totalRise + 20}
            stroke="#3b82f6"
            strokeWidth={2 * scale}
            dash={[8 * scale, 4 * scale]}
            fill="rgba(59, 130, 246, 0.1)"
            listening={false}
          />

          {/* Selection handles */}
          <Rect
            x={stairX - 3}
            y={stairY - 3}
            width={6}
            height={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
          <Rect
            x={stairX + stair.totalRun - 3}
            y={stairY - stair.totalRise - 3}
            width={6}
            height={6}
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
          x={stairX + stair.totalRun / 2}
          y={stairY - stair.totalRise / 2}
          text={`${stepCount} Steps\n${(stair.totalRise / 12).toFixed(1)}' Rise`}
          fontSize={10 * scale}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={40 * scale}
          width={80 * scale}
          listening={false}
        />
      )}

      {/* Step dimensions (when selected) */}
      {isSelected && (
        <Group>
          {/* Rise dimension */}
          <Line
            points={[
              stairX - 20 * scale,
              stairY,
              stairX - 20 * scale,
              stairY - avgRise,
            ]}
            stroke="#666666"
            strokeWidth={1 * scale}
            dash={[3 * scale, 3 * scale]}
            listening={false}
          />

          <Text
            x={stairX - 25 * scale}
            y={stairY - avgRise / 2}
            text={`${avgRise.toFixed(1)}"`}
            fontSize={8 * scale}
            fontFamily="Arial"
            fill="#666666"
            align="center"
            offsetX={15 * scale}
            width={30 * scale}
            rotation={-90}
            listening={false}
          />

          {/* Run dimension */}
          <Line
            points={[
              stairX,
              stairY + 15 * scale,
              stairX + avgRun,
              stairY + 15 * scale,
            ]}
            stroke="#666666"
            strokeWidth={1 * scale}
            dash={[3 * scale, 3 * scale]}
            listening={false}
          />

          <Text
            x={stairX + avgRun / 2}
            y={stairY + 20 * scale}
            text={`${avgRun.toFixed(1)}"`}
            fontSize={8 * scale}
            fontFamily="Arial"
            fill="#666666"
            align="center"
            offsetX={15 * scale}
            width={30 * scale}
            listening={false}
          />
        </Group>
      )}

      {/* Direction indicator */}
      <Text
        x={stairX + stair.totalRun / 2}
        y={stairY - stair.totalRise - 25 * scale}
        text={stair.direction.toUpperCase()}
        fontSize={12 * scale}
        fontFamily="Arial"
        fontStyle="bold"
        fill={appearance.stroke}
        align="center"
        offsetX={20 * scale}
        width={40 * scale}
        listening={false}
      />

      {/* Material overlay effects */}
      {showMaterials && material && material.properties.metallic > 0.5 && (
        <Group>
          {stair.steps.map((step, index) => {
            const stepX = stairX + index * avgRun;
            const stepY = stairY - (index + 1) * avgRise;

            return (
              <Rect
                key={`material-${index}`}
                x={stepX}
                y={stepY}
                width={step.run}
                height={step.rise}
                fill="linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)"
                opacity={material.properties.metallic * 0.3}
                listening={false}
              />
            );
          })}
        </Group>
      )}
    </Group>
  );
}
