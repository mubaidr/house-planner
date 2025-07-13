'use client';

import React, { useState, useCallback } from 'react';
import { Group, Line, Text, Circle, Arrow } from 'react-konva';
// import { useUIStore } from '@/stores/uiStore'; // Removed unused import

export interface DimensionAnnotation {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  distance: number;
  label: string;
  offset: number; // Distance from the measured line
  style: DimensionStyle;
  isVisible: boolean;
  isPermanent: boolean;
  elementId?: string; // Associated wall/door/window ID
  elementType?: 'wall' | 'door' | 'window' | 'room';
  createdAt: number;
  updatedAt: number;
}

export interface DimensionStyle {
  color: string;
  strokeWidth: number;
  fontSize: number;
  arrowSize: number;
  extensionLength: number;
  textBackground: boolean;
  precision: number; // Decimal places
  units: 'metric' | 'imperial' | 'both';
}

interface DimensionAnnotationsProps {
  annotations: DimensionAnnotation[];
  onUpdate: (annotations: DimensionAnnotation[]) => void;
  showAll: boolean;
}

const DEFAULT_STYLE: DimensionStyle = {
  color: '#2563eb',
  strokeWidth: 1.5,
  fontSize: 12,
  arrowSize: 8,
  extensionLength: 20,
  textBackground: true,
  precision: 1,
  units: 'both',
};

const DimensionLine: React.FC<{
  annotation: DimensionAnnotation;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<DimensionAnnotation>) => void;
  onDelete: () => void;
}> = ({ annotation, isSelected, onSelect, onUpdate, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);

  const { startPoint, endPoint, offset, style, label } = annotation;

  // Calculate dimension line geometry
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  // const length = Math.sqrt(dx * dx + dy * dy); // Removed unused variable
  const angle = Math.atan2(dy, dx);

  // Unit vector perpendicular to the measured line
  const perpX = -Math.sin(angle);
  const perpY = Math.cos(angle);

  // Offset points for dimension line
  const offsetStartX = startPoint.x + perpX * offset;
  const offsetStartY = startPoint.y + perpY * offset;
  const offsetEndX = endPoint.x + perpX * offset;
  const offsetEndY = endPoint.y + perpY * offset;

  // Extension lines
  const extStartX = startPoint.x + perpX * (offset - style.extensionLength);
  const extStartY = startPoint.y + perpY * (offset - style.extensionLength);
  const extEndX = endPoint.x + perpX * (offset - style.extensionLength);
  const extEndY = endPoint.y + perpY * (offset - style.extensionLength);

  // Text position (middle of dimension line)
  const textX = (offsetStartX + offsetEndX) / 2;
  const textY = (offsetStartY + offsetEndY) / 2;

  // Text rotation to align with dimension line
  const textRotation = angle * 180 / Math.PI;
  const normalizedRotation = textRotation > 90 || textRotation < -90
    ? textRotation + 180
    : textRotation;

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragMove = useCallback((e: any) => {
    if (!isDragging) return;

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    // Calculate new offset based on mouse position
    const mouseX = pointerPosition.x;
    const mouseY = pointerPosition.y;

    // Project mouse position onto perpendicular line
    const toMouseX = mouseX - startPoint.x;
    const toMouseY = mouseY - startPoint.y;
    const newOffset = toMouseX * perpX + toMouseY * perpY;

    onUpdate({ offset: Math.max(20, Math.abs(newOffset)) * Math.sign(newOffset || 1) });
  }, [isDragging, startPoint, perpX, perpY, onUpdate]);

  return (
    <Group>
      {/* Extension lines */}
      <Line
        points={[startPoint.x, startPoint.y, extStartX, extStartY]}
        stroke={style.color}
        strokeWidth={style.strokeWidth * 0.7}
        opacity={0.7}
        listening={false}
      />
      <Line
        points={[endPoint.x, endPoint.y, extEndX, extEndY]}
        stroke={style.color}
        strokeWidth={style.strokeWidth * 0.7}
        opacity={0.7}
        listening={false}
      />

      {/* Main dimension line */}
      <Line
        points={[offsetStartX, offsetStartY, offsetEndX, offsetEndY]}
        stroke={style.color}
        strokeWidth={isSelected ? style.strokeWidth * 1.5 : style.strokeWidth}
        listening={false}
      />

      {/* Arrow heads */}
      <Arrow
        points={[offsetStartX, offsetStartY, offsetStartX + Math.cos(angle) * style.arrowSize, offsetStartY + Math.sin(angle) * style.arrowSize]}
        fill={style.color}
        stroke={style.color}
        strokeWidth={style.strokeWidth}
        pointerLength={style.arrowSize}
        pointerWidth={style.arrowSize * 0.7}
        listening={false}
      />
      <Arrow
        points={[offsetEndX, offsetEndY, offsetEndX - Math.cos(angle) * style.arrowSize, offsetEndY - Math.sin(angle) * style.arrowSize]}
        fill={style.color}
        stroke={style.color}
        strokeWidth={style.strokeWidth}
        pointerLength={style.arrowSize}
        pointerWidth={style.arrowSize * 0.7}
        listening={false}
      />

      {/* Text background */}
      {style.textBackground && (
        <Text
          x={textX}
          y={textY - style.fontSize / 2}
          text={label}
          fontSize={style.fontSize}
          fontFamily="Arial"
          fill="white"
          stroke="white"
          strokeWidth={3}
          align="center"
          offsetX={label.length * style.fontSize * 0.3}
          rotation={normalizedRotation}
          listening={false}
        />
      )}

      {/* Text */}
      <Text
        x={textX}
        y={textY - style.fontSize / 2}
        text={label}
        fontSize={style.fontSize}
        fontFamily="Arial"
        fontStyle={isSelected ? 'bold' : 'normal'}
        fill={style.color}
        align="center"
        offsetX={label.length * style.fontSize * 0.3}
        rotation={normalizedRotation}
        listening={false}
      />

      {/* Interactive area for selection and dragging */}
      <Line
        points={[offsetStartX, offsetStartY, offsetEndX, offsetEndY]}
        stroke="transparent"
        strokeWidth={20}
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
        draggable={isSelected}
        hitStrokeWidth={20}
      />

      {/* Selection indicators */}
      {isSelected && (
        <Group>
          {/* Control points */}
          <Circle
            x={offsetStartX}
            y={offsetStartY}
            radius={4}
            fill={style.color}
            stroke="white"
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              const newX = e.target.x();
              const newY = e.target.y();
              onUpdate({ startPoint: { x: newX, y: newY } });
            }}
          />
          <Circle
            x={offsetEndX}
            y={offsetEndY}
            radius={4}
            fill={style.color}
            stroke="white"
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              const newX = e.target.x();
              const newY = e.target.y();
              onUpdate({ endPoint: { x: newX, y: newY } });
            }}
          />

          {/* Delete button */}
          <Circle
            x={textX + 20}
            y={textY - 20}
            radius={8}
            fill="red"
            opacity={0.8}
            onClick={onDelete}
            onTap={onDelete}
          />
          <Text
            x={textX + 20}
            y={textY - 20}
            text="×"
            fontSize={12}
            fontFamily="Arial"
            fill="white"
            align="center"
            offsetX={3}
            offsetY={6}
            listening={false}
          />
        </Group>
      )}
    </Group>
  );
};

export default function DimensionAnnotations({
  annotations,
  onUpdate,
  showAll
}: DimensionAnnotationsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // const { activeTool } = useUIStore(); // Removed unused variable

  const handleSelect = useCallback((id: string) => {
    setSelectedId(selectedId === id ? null : id);
  }, [selectedId]);

  const handleUpdateAnnotation = useCallback((id: string, updates: Partial<DimensionAnnotation>) => {
    const updatedAnnotations = annotations.map(annotation =>
      annotation.id === id
        ? { ...annotation, ...updates, updatedAt: Date.now() }
        : annotation
    );
    onUpdate(updatedAnnotations);
  }, [annotations, onUpdate]);

  const handleDeleteAnnotation = useCallback((id: string) => {
    const updatedAnnotations = annotations.filter(annotation => annotation.id !== id);
    onUpdate(updatedAnnotations);
    setSelectedId(null);
  }, [annotations, onUpdate]);

  // Filter visible annotations
  const visibleAnnotations = annotations.filter(annotation =>
    showAll && annotation.isVisible
  );

  return (
    <Group>
      {visibleAnnotations.map(annotation => (
        <DimensionLine
          key={annotation.id}
          annotation={annotation}
          isSelected={selectedId === annotation.id}
          onSelect={() => handleSelect(annotation.id)}
          onUpdate={(updates) => handleUpdateAnnotation(annotation.id, updates)}
          onDelete={() => handleDeleteAnnotation(annotation.id)}
        />
      ))}
    </Group>
  );
}

// Utility functions for creating dimension annotations
export const createDimensionAnnotation = (
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number },
  options: Partial<DimensionAnnotation> = {}
): DimensionAnnotation => {
  const distance = Math.sqrt(
    Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
  );

  const style = { ...DEFAULT_STYLE, ...options.style };
  const label = formatDimensionLabel(distance, style);

  return {
    id: `dimension-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    startPoint,
    endPoint,
    distance,
    label,
    offset: 30,
    style,
    isVisible: true,
    isPermanent: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...options,
  };
};

export const formatDimensionLabel = (distance: number, style: DimensionStyle): string => {
  const precision = style.precision;

  switch (style.units) {
    case 'metric':
      if (distance > 100) {
        return `${(distance / 100).toFixed(precision)}m`;
      } else {
        return `${distance.toFixed(precision)}cm`;
      }

    case 'imperial':
      const totalInchesImperial = distance / 2.54;
      if (totalInchesImperial > 12) {
        const feet = Math.floor(totalInchesImperial / 12);
        const remainingInches = totalInchesImperial % 12;
        return remainingInches > 0
          ? `${feet}'-${remainingInches.toFixed(precision)}"`
          : `${feet}'`;
      } else {
        return `${totalInchesImperial.toFixed(precision)}"`;
      }

    case 'both':
    default:
      const cm = distance.toFixed(precision);
      const totalInchesBoth = distance / 2.54;
      const feetBoth = Math.floor(totalInchesBoth / 12);
      const inchesBoth = totalInchesBoth % 12;

      if (feetBoth > 0) {
        return `${cm}cm (${feetBoth}'-${inchesBoth.toFixed(precision)}")`;
      } else {
        return `${cm}cm (${totalInchesBoth.toFixed(precision)}")`;
      }
  }
};

// Auto-dimension utilities
export const createAutoDimensions = (walls: Array<{ id: string; startX: number; startY: number; endX: number; endY: number }>): DimensionAnnotation[] => {
  const annotations: DimensionAnnotation[] = [];

  walls.forEach((wall, index) => {
    // Create dimension for each wall
    const annotation = createDimensionAnnotation(
      { x: wall.startX, y: wall.startY },
      { x: wall.endX, y: wall.endY },
      {
        elementId: wall.id,
        elementType: 'wall',
        offset: 40 + (index % 3) * 20, // Stagger offsets
      }
    );

    annotations.push(annotation);
  });

  return annotations;
};
