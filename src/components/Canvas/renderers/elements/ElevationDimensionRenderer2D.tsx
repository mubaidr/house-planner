'use client';

import React from 'react';
import { Group, Line, Text } from 'react-konva';
import { Dimension2D, Element2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';
import { Material } from '@/types/materials/Material';
import { ELEVATION_VIEW_CONFIG } from '../ElevationRenderer2D';

interface ElevationDimensionRenderer2DProps {
  dimension: Dimension2D;
  viewType: ViewType2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function ElevationDimensionRenderer2D({
  dimension,
  viewType,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit,
}: ElevationDimensionRenderer2DProps) {
  // Suppress unused variable warnings
  void viewType;
  void showMaterials;
  void getMaterialById;
  void onEdit;
  const startPoint = dimension.startPoint;
  const endPoint = dimension.endPoint;
  const dimensionLine = dimension.dimensionLine;

  // Calculate dimension properties
  const length = Math.sqrt(
    Math.pow(endPoint.x - startPoint.x, 2) + 
    Math.pow(endPoint.y - startPoint.y, 2)
  );
  
  const angle = Math.atan2(
    endPoint.y - startPoint.y,
    endPoint.x - startPoint.x
  );
  const angleDegrees = (angle * 180) / Math.PI;

  // Format dimension value
  const formatDimensionValue = (): string => {
    if (dimension.displayValue) {
      return dimension.displayValue;
    }

    const value = dimension.value;
    const precision = dimension.precision;

    switch (dimension.unit) {
      case 'ft':
        const feet = Math.floor(value / 12);
        const inches = value % 12;
        if (feet === 0) {
          return `${inches.toFixed(precision)}"`;
        } else if (inches === 0) {
          return `${feet}'`;
        } else {
          return `${feet}'-${inches.toFixed(precision)}"`;
        }
      case 'in':
        return `${value.toFixed(precision)}"`;
      case 'm':
        return `${(value * 0.0254).toFixed(precision)}m`;
      case 'cm':
        return `${(value * 2.54).toFixed(precision)}cm`;
      case 'mm':
        return `${(value * 25.4).toFixed(precision)}mm`;
      default:
        return `${value.toFixed(precision)}`;
    }
  };

  const dimensionText = formatDimensionValue();
  const textWidth = dimensionText.length * ELEVATION_VIEW_CONFIG.dimensionSettings.textSize * 0.6;

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    const newValue = prompt('Enter dimension value:', dimensionText);
    if (newValue && newValue !== dimensionText) {
      onEdit({ ...dimension, displayValue: newValue });
    }
  };

  // Calculate extension line positions
  const extensionLength = ELEVATION_VIEW_CONFIG.dimensionSettings.lineExtension * scale;
  
  // Perpendicular direction for extension lines
  const perpAngle = angle + Math.PI / 2;
  const perpX = Math.cos(perpAngle);
  const perpY = Math.sin(perpAngle);

  return (
    <Group>
      {/* Extension lines */}
      <Line
        points={[
          startPoint.x,
          startPoint.y,
          startPoint.x + perpX * extensionLength,
          startPoint.y + perpY * extensionLength,
        ]}
        stroke={ELEVATION_VIEW_CONFIG.colors.dimension}
        strokeWidth={ELEVATION_VIEW_CONFIG.lineWeights.dimension * scale}
        listening={false}
      />
      
      <Line
        points={[
          endPoint.x,
          endPoint.y,
          endPoint.x + perpX * extensionLength,
          endPoint.y + perpY * extensionLength,
        ]}
        stroke={ELEVATION_VIEW_CONFIG.colors.dimension}
        strokeWidth={ELEVATION_VIEW_CONFIG.lineWeights.dimension * scale}
        listening={false}
      />

      {/* Main dimension line */}
      <Line
        points={[
          dimensionLine.x - Math.cos(angle) * length / 2,
          dimensionLine.y - Math.sin(angle) * length / 2,
          dimensionLine.x + Math.cos(angle) * length / 2,
          dimensionLine.y + Math.sin(angle) * length / 2,
        ]}
        stroke={ELEVATION_VIEW_CONFIG.colors.dimension}
        strokeWidth={ELEVATION_VIEW_CONFIG.lineWeights.dimension * scale}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        shadowColor={isSelected ? '#3b82f6' : undefined}
        shadowBlur={isSelected ? 2 * scale : 0}
        shadowOpacity={isSelected ? 0.5 : 0}
      />

      {/* Dimension arrows */}
      {(() => {
        const arrowSize = ELEVATION_VIEW_CONFIG.dimensionSettings.arrowSize * scale;
        const arrowAngle1 = angle + Math.PI - 0.3;
        const arrowAngle2 = angle + Math.PI + 0.3;
        
        const startArrowX = dimensionLine.x - Math.cos(angle) * length / 2;
        const startArrowY = dimensionLine.y - Math.sin(angle) * length / 2;
        const endArrowX = dimensionLine.x + Math.cos(angle) * length / 2;
        const endArrowY = dimensionLine.y + Math.sin(angle) * length / 2;

        return (
          <Group>
            {/* Start arrow */}
            <Line
              points={[
                startArrowX,
                startArrowY,
                startArrowX + Math.cos(arrowAngle1) * arrowSize,
                startArrowY + Math.sin(arrowAngle1) * arrowSize,
              ]}
              stroke={ELEVATION_VIEW_CONFIG.colors.dimension}
              strokeWidth={ELEVATION_VIEW_CONFIG.lineWeights.dimension * scale}
              listening={false}
            />
            <Line
              points={[
                startArrowX,
                startArrowY,
                startArrowX + Math.cos(arrowAngle2) * arrowSize,
                startArrowY + Math.sin(arrowAngle2) * arrowSize,
              ]}
              stroke={ELEVATION_VIEW_CONFIG.colors.dimension}
              strokeWidth={ELEVATION_VIEW_CONFIG.lineWeights.dimension * scale}
              listening={false}
            />

            {/* End arrow */}
            <Line
              points={[
                endArrowX,
                endArrowY,
                endArrowX + Math.cos(arrowAngle1 + Math.PI) * arrowSize,
                endArrowY + Math.sin(arrowAngle1 + Math.PI) * arrowSize,
              ]}
              stroke={ELEVATION_VIEW_CONFIG.colors.dimension}
              strokeWidth={ELEVATION_VIEW_CONFIG.lineWeights.dimension * scale}
              listening={false}
            />
            <Line
              points={[
                endArrowX,
                endArrowY,
                endArrowX + Math.cos(arrowAngle2 + Math.PI) * arrowSize,
                endArrowY + Math.sin(arrowAngle2 + Math.PI) * arrowSize,
              ]}
              stroke={ELEVATION_VIEW_CONFIG.colors.dimension}
              strokeWidth={ELEVATION_VIEW_CONFIG.lineWeights.dimension * scale}
              listening={false}
            />
          </Group>
        );
      })()}

      {/* Text background (for better readability) */}
      <Line
        points={[
          dimensionLine.x - textWidth / 2 - 2 * scale,
          dimensionLine.y,
          dimensionLine.x + textWidth / 2 + 2 * scale,
          dimensionLine.y,
        ]}
        stroke="#ffffff"
        strokeWidth={ELEVATION_VIEW_CONFIG.dimensionSettings.textSize * scale + 2}
        opacity={0.8}
        listening={false}
      />

      {/* Dimension text */}
      <Text
        x={dimensionLine.x}
        y={dimensionLine.y - ELEVATION_VIEW_CONFIG.dimensionSettings.textSize * scale / 2}
        text={dimensionText}
        fontSize={ELEVATION_VIEW_CONFIG.dimensionSettings.textSize * scale}
        fontFamily="Arial"
        fill={isSelected ? '#3b82f6' : ELEVATION_VIEW_CONFIG.colors.dimension}
        align="center"
        offsetX={textWidth / 2}
        width={textWidth}
        rotation={Math.abs(angleDegrees) > 90 ? angleDegrees + 180 : angleDegrees}
        listening={false}
      />

      {/* Selection indicator */}
      {isSelected && (
        <Group>
          {/* Selection line */}
          <Line
            points={[
              dimensionLine.x - Math.cos(angle) * length / 2 - 10,
              dimensionLine.y - Math.sin(angle) * length / 2,
              dimensionLine.x + Math.cos(angle) * length / 2 + 10,
              dimensionLine.y + Math.sin(angle) * length / 2,
            ]}
            stroke="#3b82f6"
            strokeWidth={3 * scale}
            dash={[8 * scale, 4 * scale]}
            opacity={0.5}
            listening={false}
          />
          
          {/* Selection handles */}
          <Line
            points={[
              startPoint.x - 3,
              startPoint.y - 3,
              startPoint.x + 3,
              startPoint.y - 3,
              startPoint.x + 3,
              startPoint.y + 3,
              startPoint.x - 3,
              startPoint.y + 3,
            ]}
            closed
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
          
          <Line
            points={[
              endPoint.x - 3,
              endPoint.y - 3,
              endPoint.x + 3,
              endPoint.y - 3,
              endPoint.x + 3,
              endPoint.y + 3,
              endPoint.x - 3,
              endPoint.y + 3,
            ]}
            closed
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
          
          {/* Dimension line handle */}
          <Line
            points={[
              dimensionLine.x - 3,
              dimensionLine.y - 3,
              dimensionLine.x + 3,
              dimensionLine.y - 3,
              dimensionLine.x + 3,
              dimensionLine.y + 3,
              dimensionLine.x - 3,
              dimensionLine.y + 3,
            ]}
            closed
            fill="#ff6b35"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
        </Group>
      )}

      {/* Dimension type indicator (when selected) */}
      {isSelected && dimension.dimensionType !== 'linear' && (
        <Text
          x={dimensionLine.x}
          y={dimensionLine.y + ELEVATION_VIEW_CONFIG.dimensionSettings.textSize * scale + 5}
          text={dimension.dimensionType.toUpperCase()}
          fontSize={8 * scale}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={20 * scale}
          width={40 * scale}
          listening={false}
        />
      )}

      {/* Edit indicator (when selected) */}
      {isSelected && (
        <Text
          x={dimensionLine.x}
          y={dimensionLine.y + ELEVATION_VIEW_CONFIG.dimensionSettings.textSize * scale + 20}
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
    </Group>
  );
}