'use client';

import React from 'react';
import { Group, Line, Rect, Text, Circle } from 'react-konva';
import { Annotation2D, Element2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';
import { Material } from '@/types/materials/Material';

interface ElevationAnnotationRenderer2DProps {
  annotation: Annotation2D;
  viewType: ViewType2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function ElevationAnnotationRenderer2D({
  annotation,
  viewType: _viewType,
  isSelected,
  scale,
  showMaterials: _showMaterials,
  getMaterialById: _getMaterialById,
  onSelect,
  onEdit,
}: ElevationAnnotationRenderer2DProps) {
  const position = annotation.transform.position;
  const rotation = annotation.transform.rotation;

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    const newText = prompt('Enter annotation text:', annotation.text);
    if (newText && newText !== annotation.text) {
      onEdit({ ...annotation, text: newText });
    }
  };

  // Calculate text dimensions for background
  const textWidth = annotation.text.length * annotation.fontSize * 0.6;
  const textHeight = annotation.fontSize * 1.2;

  return (
    <Group>
      {/* Background rectangle (if specified) */}
      {annotation.backgroundColor && (
        <Rect
          x={position.x - textWidth / 2 - 4 * scale}
          y={position.y - textHeight / 2 - 2 * scale}
          width={textWidth + 8 * scale}
          height={textHeight + 4 * scale}
          rotation={rotation}
          fill={annotation.backgroundColor}
          stroke={annotation.color}
          strokeWidth={1 * scale}
          opacity={0.9}
          cornerRadius={2 * scale}
          listening={false}
        />
      )}

      {/* Main annotation text */}
      <Text
        x={position.x}
        y={position.y - annotation.fontSize / 2}
        text={annotation.text}
        fontSize={annotation.fontSize * scale}
        fontFamily={annotation.fontFamily}
        fill={annotation.color}
        align="center"
        offsetX={textWidth / 2}
        width={textWidth}
        rotation={rotation}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        shadowColor={isSelected ? '#3b82f6' : undefined}
        shadowBlur={isSelected ? 2 * scale : 0}
        shadowOpacity={isSelected ? 0.5 : 0}
      />

      {/* Leader line (if specified) */}
      {annotation.leader && (
        <Group>
          {/* Leader line */}
          <Line
            points={[
              annotation.leader.startPoint.x,
              annotation.leader.startPoint.y,
              annotation.leader.endPoint.x,
              annotation.leader.endPoint.y,
            ]}
            stroke={annotation.color}
            strokeWidth={1 * scale}
            opacity={0.8}
            listening={false}
          />

          {/* Arrow or marker at end */}
          {annotation.leader.arrowType === 'arrow' && (
            <Line
              points={[
                annotation.leader.endPoint.x - 5 * scale,
                annotation.leader.endPoint.y - 3 * scale,
                annotation.leader.endPoint.x,
                annotation.leader.endPoint.y,
                annotation.leader.endPoint.x - 5 * scale,
                annotation.leader.endPoint.y + 3 * scale,
              ]}
              stroke={annotation.color}
              strokeWidth={1 * scale}
              fill={annotation.color}
              closed
              listening={false}
            />
          )}

          {annotation.leader.arrowType === 'dot' && (
            <Circle
              x={annotation.leader.endPoint.x}
              y={annotation.leader.endPoint.y}
              radius={2 * scale}
              fill={annotation.color}
              listening={false}
            />
          )}

          {annotation.leader.arrowType === 'circle' && (
            <Circle
              x={annotation.leader.endPoint.x}
              y={annotation.leader.endPoint.y}
              radius={3 * scale}
              stroke={annotation.color}
              strokeWidth={1 * scale}
              listening={false}
            />
          )}
        </Group>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <Group>
          <Rect
            x={position.x - textWidth / 2 - 8 * scale}
            y={position.y - textHeight / 2 - 6 * scale}
            width={textWidth + 16 * scale}
            height={textHeight + 12 * scale}
            rotation={rotation}
            stroke="#3b82f6"
            strokeWidth={2 * scale}
            dash={[6 * scale, 3 * scale]}
            fill="rgba(59, 130, 246, 0.1)"
            listening={false}
          />
          
          {/* Selection handles */}
          <Rect
            x={position.x - 3}
            y={position.y - 3}
            width={6}
            height={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
          
          {/* Leader handle (if leader exists) */}
          {annotation.leader && (
            <Rect
              x={annotation.leader.endPoint.x - 3}
              y={annotation.leader.endPoint.y - 3}
              width={6}
              height={6}
              fill="#ff6b35"
              stroke="#ffffff"
              strokeWidth={1}
              listening={false}
            />
          )}
        </Group>
      )}

      {/* Edit indicator (when selected) */}
      {isSelected && (
        <Text
          x={position.x}
          y={position.y + textHeight / 2 + 15 * scale}
          text="Double-click to edit"
          fontSize={8 * scale}
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