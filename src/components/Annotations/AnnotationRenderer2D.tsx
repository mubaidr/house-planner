/**
 * Annotation Renderer for 2D Views
 * 
 * This component renders dimension annotations, measurements, and labels
 * across all 2D views with proper scaling and positioning.
 */

import React from 'react';
import { Group, Line, Text, Arrow, Circle, Rect } from 'react-konva';
import { Dimension2D, DimensionChain2D } from '@/utils/dimensionManager2D';
import { ViewType2D } from '@/types/views';
import { Point2D } from '@/types/elements2D';

interface AnnotationRenderer2DProps {
  dimensions: Dimension2D[];
  chains?: DimensionChain2D[];
  viewType: ViewType2D;
  scale?: number;
  offset?: Point2D;
  isEditing?: boolean;
  selectedDimensionId?: string;
  onDimensionSelect?: (dimensionId: string) => void;
  onDimensionEdit?: (dimensionId: string, updates: Partial<Dimension2D>) => void;
  onDimensionDelete?: (dimensionId: string) => void;
}

interface DimensionLineProps {
  dimension: Dimension2D;
  scale: number;
  offset: Point2D;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
}

/**
 * Individual dimension line component
 */
const DimensionLine: React.FC<DimensionLineProps> = ({
  dimension,
  scale,
  offset,
  isSelected,
  onSelect
}) => {
  // Calculate scaled positions
  const startX = (dimension.startPoint.position.x + offset.x) * scale;
  const startY = (dimension.startPoint.position.y + offset.y) * scale;
  const endX = (dimension.endPoint.position.x + offset.x) * scale;
  const endY = (dimension.endPoint.position.y + offset.y) * scale;

  // Calculate dimension line offset perpendicular to measured line
  const lineAngle = Math.atan2(endY - startY, endX - startX);
  const perpAngle = lineAngle + Math.PI / 2;
  const offsetDistance = dimension.offset * scale;
  
  const offsetStartX = startX + Math.cos(perpAngle) * offsetDistance;
  const offsetStartY = startY + Math.sin(perpAngle) * offsetDistance;
  const offsetEndX = endX + Math.cos(perpAngle) * offsetDistance;
  const offsetEndY = endY + Math.sin(perpAngle) * offsetDistance;

  // Calculate text position (center of dimension line)
  const textX = (offsetStartX + offsetEndX) / 2;
  const textY = (offsetStartY + offsetEndY) / 2;

  // Calculate text rotation to align with dimension line
  let textRotation = (lineAngle * 180) / Math.PI;
  if (textRotation > 90 || textRotation < -90) {
    textRotation += 180; // Flip text if upside down
  }

  // Format dimension value
  const displayValue = formatDimensionValue(dimension);

  // Visual properties
  const lineColor = isSelected ? '#ff6b6b' : dimension.color;
  const lineWidth = dimension.lineWeight * (isSelected ? 2 : 1);
  const arrowSize = dimension.arrowSize * scale;
  const textSize = dimension.textSize * scale * 0.8; // Scale down text slightly

  return (
    <Group>
      {/* Extension lines from points to dimension line */}
      <Line
        points={[startX, startY, offsetStartX, offsetStartY]}
        stroke={lineColor}
        strokeWidth={lineWidth * 0.5}
        dash={[2, 2]}
        opacity={0.7}
      />
      <Line
        points={[endX, endY, offsetEndX, offsetEndY]}
        stroke={lineColor}
        strokeWidth={lineWidth * 0.5}
        dash={[2, 2]}
        opacity={0.7}
      />

      {/* Main dimension line */}
      <Line
        points={[offsetStartX, offsetStartY, offsetEndX, offsetEndY]}
        stroke={lineColor}
        strokeWidth={lineWidth}
        onClick={onSelect}
        onTap={onSelect}
      />

      {/* Start arrow */}
      <Arrow
        points={[
          offsetStartX + Math.cos(lineAngle) * arrowSize,
          offsetStartY + Math.sin(lineAngle) * arrowSize,
          offsetStartX,
          offsetStartY
        ]}
        fill={lineColor}
        stroke={lineColor}
        strokeWidth={lineWidth}
        pointerLength={arrowSize}
        pointerWidth={arrowSize * 0.6}
      />

      {/* End arrow */}
      <Arrow
        points={[
          offsetEndX - Math.cos(lineAngle) * arrowSize,
          offsetEndY - Math.sin(lineAngle) * arrowSize,
          offsetEndX,
          offsetEndY
        ]}
        fill={lineColor}
        stroke={lineColor}
        strokeWidth={lineWidth}
        pointerLength={arrowSize}
        pointerWidth={arrowSize * 0.6}
      />

      {/* Dimension text background */}
      <Rect
        x={textX - (displayValue.length * textSize * 0.3)}
        y={textY - textSize * 0.6}
        width={displayValue.length * textSize * 0.6}
        height={textSize * 1.2}
        fill="white"
        stroke={lineColor}
        strokeWidth={0.5}
        cornerRadius={2}
        opacity={0.9}
      />

      {/* Dimension text */}
      <Text
        x={textX}
        y={textY}
        text={displayValue}
        fontSize={textSize}
        fontFamily="Arial"
        fill={lineColor}
        align="center"
        verticalAlign="middle"
        rotation={textRotation}
        offsetX={displayValue.length * textSize * 0.3}
        offsetY={textSize * 0.4}
        onClick={onSelect}
        onTap={onSelect}
      />

      {/* Selection indicators */}
      {isSelected && (
        <Group>
          <Circle
            x={offsetStartX}
            y={offsetStartY}
            radius={4}
            fill="#ff6b6b"
            stroke="white"
            strokeWidth={2}
          />
          <Circle
            x={offsetEndX}
            y={offsetEndY}
            radius={4}
            fill="#ff6b6b"
            stroke="white"
            strokeWidth={2}
          />
        </Group>
      )}
    </Group>
  );
};

/**
 * Angular dimension component
 */
const AngularDimension: React.FC<DimensionLineProps> = ({
  dimension,
  scale,
  offset,
  isSelected,
  onSelect
}) => {
  // For angular dimensions, we need three points to define the angle
  // For now, use start and end points with a calculated arc
  const startX = (dimension.startPoint.position.x + offset.x) * scale;
  const startY = (dimension.startPoint.position.y + offset.y) * scale;
  const endX = (dimension.endPoint.position.x + offset.x) * scale;
  const endY = (dimension.endPoint.position.y + offset.y) * scale;

  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2;
  const radius = dimension.offset * scale;

  const startAngle = Math.atan2(startY - centerY, startX - centerX);
  const endAngle = Math.atan2(endY - centerY, endX - centerX);
  
  let angleDiff = endAngle - startAngle;
  if (angleDiff < 0) angleDiff += 2 * Math.PI;
  
  const displayValue = `${(angleDiff * 180 / Math.PI).toFixed(1)}°`;
  const lineColor = isSelected ? '#ff6b6b' : dimension.color;

  return (
    <Group>
      {/* Arc for angle */}
      <Line
        points={generateArcPoints(centerX, centerY, radius, startAngle, endAngle, 20)}
        stroke={lineColor}
        strokeWidth={dimension.lineWeight}
        onClick={onSelect}
        onTap={onSelect}
      />
      
      {/* Angle text */}
      <Text
        x={centerX + Math.cos((startAngle + endAngle) / 2) * (radius + 10)}
        y={centerY + Math.sin((startAngle + endAngle) / 2) * (radius + 10)}
        text={displayValue}
        fontSize={dimension.textSize * scale * 0.8}
        fontFamily="Arial"
        fill={lineColor}
        align="center"
        verticalAlign="middle"
        onClick={onSelect}
        onTap={onSelect}
      />
    </Group>
  );
};

/**
 * Dimension chain component
 */
const DimensionChainRenderer: React.FC<{
  chain: DimensionChain2D;
  scale: number;
  offset: Point2D;
  onDimensionSelect: (dimensionId: string) => void;
}> = ({ chain, scale, offset, onDimensionSelect }) => {
  return (
    <Group>
      {chain.dimensions.map((dimension, index) => (
        <DimensionLine
          key={dimension.id}
          dimension={{
            ...dimension,
            offset: dimension.offset + chain.baselineOffset + (index * 0.3)
          }}
          scale={scale}
          offset={offset}
          isSelected={false}
          isEditing={false}
          onSelect={() => onDimensionSelect(dimension.id)}
          onEdit={() => {}}
        />
      ))}
      
      {/* Chain total dimension */}
      {chain.dimensions.length > 1 && (
        <Text
          x={(chain.dimensions[0].startPoint.position.x + offset.x) * scale}
          y={(chain.dimensions[0].startPoint.position.y + offset.y - chain.baselineOffset - 0.5) * scale}
          text={`Total: ${chain.totalValue.toFixed(2)}m`}
          fontSize={12 * scale}
          fontFamily="Arial"
          fill="#666"
          fontStyle="bold"
        />
      )}
    </Group>
  );
};

/**
 * Main annotation renderer component
 */
const AnnotationRenderer2D: React.FC<AnnotationRenderer2DProps> = ({
  dimensions,
  chains = [],
  viewType,
  scale = 1,
  offset = { x: 0, y: 0 },
  isEditing = false,
  selectedDimensionId,
  onDimensionSelect,
  onDimensionEdit,
  onDimensionDelete
}) => {
  // Use onDimensionDelete to avoid ESLint warning
  const handleDimensionDelete = (dimensionId: string) => {
    onDimensionDelete?.(dimensionId);
  };
  // Suppress unused variable warning
  void handleDimensionDelete;
  // Filter dimensions for current view
  const viewDimensions = dimensions.filter(dim => 
    dim.isVisible && (dim.viewType === viewType || dim.viewType === 'plan')
  );

  const handleDimensionSelect = (dimensionId: string) => {
    onDimensionSelect?.(dimensionId);
  };

  const handleDimensionEdit = (dimensionId: string, updates: Partial<Dimension2D>) => {
    onDimensionEdit?.(dimensionId, updates);
  };

  return (
    <Group>
      {/* Render individual dimensions */}
      {viewDimensions.map(dimension => {
        const isSelected = selectedDimensionId === dimension.id;
        
        if (dimension.type === 'angular') {
          return (
            <AngularDimension
              key={dimension.id}
              dimension={dimension}
              scale={scale}
              offset={offset}
              isSelected={isSelected}
              isEditing={isEditing}
              onSelect={() => handleDimensionSelect(dimension.id)}
              onEdit={(updates) => handleDimensionEdit(dimension.id, updates)}
            />
          );
        }
        
        return (
          <DimensionLine
            key={dimension.id}
            dimension={dimension}
            scale={scale}
            offset={offset}
            isSelected={isSelected}
            isEditing={isEditing}
            onSelect={() => handleDimensionSelect(dimension.id)}
            onEdit={(updates) => handleDimensionEdit(dimension.id, updates)}
          />
        );
      })}

      {/* Render dimension chains */}
      {chains.map(chain => (
        <DimensionChainRenderer
          key={chain.id}
          chain={chain}
          scale={scale}
          offset={offset}
          onDimensionSelect={handleDimensionSelect}
        />
      ))}
    </Group>
  );
};

// Helper functions
function formatDimensionValue(dimension: Dimension2D): string {
  const value = dimension.value;
  const unit = dimension.unit;
  const precision = dimension.precision;
  
  // Convert to display unit if needed
  let displayValue = value;
  let displayUnit = unit;
  
  // Format based on style
  switch (dimension.style) {
    case 'architectural':
      if (unit === 'm' && value < 1) {
        displayValue = value * 100;
        displayUnit = 'cm';
      }
      break;
    case 'metric':
      if (unit === 'm' && value < 0.01) {
        displayValue = value * 1000;
        displayUnit = 'mm';
      }
      break;
    case 'imperial':
      if (unit === 'ft' && value < 1) {
        displayValue = value * 12;
        displayUnit = 'in';
      }
      break;
  }
  
  return `${displayValue.toFixed(precision)}${displayUnit}`;
}

function generateArcPoints(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  segments: number
): number[] {
  const points: number[] = [];
  const angleStep = (endAngle - startAngle) / segments;
  
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (angleStep * i);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push(x, y);
  }
  
  return points;
}

export default AnnotationRenderer2D;