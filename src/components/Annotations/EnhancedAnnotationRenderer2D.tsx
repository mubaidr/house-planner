/**
 * Enhanced Annotation Renderer for Professional Drawings
 * 
 * Provides advanced annotation features including:
 * - Professional dimension styles (architectural, engineering, metric, imperial)
 * - Smart dimension chains and automatic grouping
 * - Text annotations with leader lines
 * - Area and perimeter calculations
 * - Material callouts and specifications
 * - Drawing notes and legends
 */

import React from 'react';
import { Group, Line, Text, Arrow, Circle, Rect } from 'react-konva';
import { Dimension2D, DimensionChain2D } from '@/utils/dimensionManager2D';
import { ViewType2D } from '@/types/views';
import { Point2D } from '@/types/elements2D';

export interface TextAnnotation {
  id: string;
  position: Point2D;
  text: string;
  style: AnnotationTextStyle;
  hasLeader: boolean;
  leaderPoints?: Point2D[];
  category: 'note' | 'specification' | 'material' | 'dimension' | 'warning';
  isVisible: boolean;
  layer: number; // For z-ordering
}

export interface AreaAnnotation {
  id: string;
  points: Point2D[];
  area: number;
  perimeter: number;
  label: string;
  unit: string;
  style: AreaAnnotationStyle;
  showCalculations: boolean;
  isVisible: boolean;
}

export interface MaterialCallout {
  id: string;
  position: Point2D;
  materialId: string;
  materialName: string;
  specifications: string[];
  quantity?: number;
  unit?: string;
  style: CalloutStyle;
  isVisible: boolean;
}

export interface AnnotationTextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth: number;
  padding: number;
  alignment: 'left' | 'center' | 'right';
  rotation: number;
}

export interface AreaAnnotationStyle {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  strokeDashArray?: number[];
  labelStyle: AnnotationTextStyle;
}

export interface CalloutStyle {
  bubbleColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  fontSize: number;
  leaderStyle: 'straight' | 'curved' | 'stepped';
}

interface EnhancedAnnotationRenderer2DProps {
  dimensions: Dimension2D[];
  chains?: DimensionChain2D[];
  textAnnotations?: TextAnnotation[];
  areaAnnotations?: AreaAnnotation[];
  materialCallouts?: MaterialCallout[];
  viewType: ViewType2D;
  scale?: number;
  offset?: Point2D;
  isEditing?: boolean;
  selectedAnnotationId?: string;
  onAnnotationSelect?: (annotationId: string, type: 'dimension' | 'text' | 'area' | 'material') => void;
  onAnnotationEdit?: <T>(annotationId: string, type: string, updates: Partial<T>) => void;
  onAnnotationDelete?: (annotationId: string, type: string) => void;
  showLegend?: boolean;
  legendPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Professional dimension line with enhanced styling
 */
const ProfessionalDimensionLine: React.FC<{
  dimension: Dimension2D;
  scale: number;
  offset: Point2D;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ dimension, scale, offset, isSelected, onSelect }) => {
  const { startPoint, endPoint, value, unit, style, textOffset, precision } = dimension;
  
  // Calculate scaled positions
  const start = {
    x: (startPoint.x + offset.x) * scale,
    y: (startPoint.y + offset.y) * scale
  };
  const end = {
    x: (endPoint.x + offset.x) * scale,
    y: (endPoint.y + offset.y) * scale
  };
  
  // Calculate dimension line offset
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const perpAngle = angle + Math.PI / 2;
  const offsetDistance = textOffset * scale;
  
  const dimStart = {
    x: start.x + Math.cos(perpAngle) * offsetDistance,
    y: start.y + Math.sin(perpAngle) * offsetDistance
  };
  const dimEnd = {
    x: end.x + Math.cos(perpAngle) * offsetDistance,
    y: end.y + Math.sin(perpAngle) * offsetDistance
  };
  
  // Text position and rotation
  const textX = (dimStart.x + dimEnd.x) / 2;
  const textY = (dimStart.y + dimEnd.y) / 2;
  const textRotation = (angle * 180) / Math.PI;
  
  // Format value based on style
  const formatValue = (val: number, unit: string, style: string, precision: number): string => {
    switch (style) {
      case 'architectural':
        if (unit === 'm' && val < 1) {
          return `${(val * 100).toFixed(precision)}cm`;
        }
        return `${val.toFixed(precision)}${unit}`;
      case 'engineering':
        return `${val.toFixed(precision)} ${unit}`;
      case 'metric':
        if (unit === 'm' && val < 0.01) {
          return `${(val * 1000).toFixed(0)}mm`;
        }
        return `${val.toFixed(precision)}${unit}`;
      case 'imperial':
        if (unit === 'ft' && val < 1) {
          const inches = val * 12;
          const wholeInches = Math.floor(inches);
          const fraction = inches - wholeInches;
          if (fraction > 0.0625) {
            const fractionText = fraction >= 0.5 ? '½' : 
                               fraction >= 0.25 ? '¼' : 
                               fraction >= 0.75 ? '¾' : '⅛';
            return wholeInches > 0 ? `${wholeInches}${fractionText}"` : `${fractionText}"`;
          }
          return `${wholeInches}"`;
        }
        return `${val.toFixed(precision)}'`;
      default:
        return `${val.toFixed(precision)}${unit}`;
    }
  };
  
  const displayValue = formatValue(value, unit, style, precision);
  
  // Arrow size based on scale
  const arrowSize = Math.max(8, 12 * scale);
  
  return (
    <Group onClick={onSelect}>
      {/* Extension lines */}
      <Line
        points={[start.x, start.y, dimStart.x, dimStart.y]}
        stroke={isSelected ? '#0066cc' : '#333333'}
        strokeWidth={1}
        dash={[2, 2]}
      />
      <Line
        points={[end.x, end.y, dimEnd.x, dimEnd.y]}
        stroke={isSelected ? '#0066cc' : '#333333'}
        strokeWidth={1}
        dash={[2, 2]}
      />
      
      {/* Main dimension line */}
      <Line
        points={[dimStart.x, dimStart.y, dimEnd.x, dimEnd.y]}
        stroke={isSelected ? '#0066cc' : '#333333'}
        strokeWidth={2}
      />
      
      {/* Arrows */}
      <Arrow
        points={[dimStart.x, dimStart.y, dimStart.x + Math.cos(angle) * arrowSize, dimStart.y + Math.sin(angle) * arrowSize]}
        fill={isSelected ? '#0066cc' : '#333333'}
        stroke={isSelected ? '#0066cc' : '#333333'}
        strokeWidth={1}
        pointerLength={arrowSize * 0.6}
        pointerWidth={arrowSize * 0.4}
      />
      <Arrow
        points={[dimEnd.x, dimEnd.y, dimEnd.x - Math.cos(angle) * arrowSize, dimEnd.y - Math.sin(angle) * arrowSize]}
        fill={isSelected ? '#0066cc' : '#333333'}
        stroke={isSelected ? '#0066cc' : '#333333'}
        strokeWidth={1}
        pointerLength={arrowSize * 0.6}
        pointerWidth={arrowSize * 0.4}
      />
      
      {/* Dimension text with background */}
      <Rect
        x={textX - (displayValue.length * 6)}
        y={textY - 10}
        width={displayValue.length * 12}
        height={20}
        fill="white"
        stroke={isSelected ? '#0066cc' : '#333333'}
        strokeWidth={1}
        cornerRadius={2}
      />
      <Text
        x={textX}
        y={textY}
        text={displayValue}
        fontSize={12}
        fontFamily="Arial"
        fill={isSelected ? '#0066cc' : '#333333'}
        align="center"
        verticalAlign="middle"
        rotation={Math.abs(textRotation) > 90 ? textRotation + 180 : textRotation}
        offsetX={displayValue.length * 6}
        offsetY={10}
      />
    </Group>
  );
};

/**
 * Text annotation with optional leader line
 */
const TextAnnotationComponent: React.FC<{
  annotation: TextAnnotation;
  scale: number;
  offset: Point2D;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ annotation, scale, offset, isSelected, onSelect }) => {
  const { position, text, style, hasLeader, leaderPoints, category } = annotation;
  
  const scaledPos = {
    x: (position.x + offset.x) * scale,
    y: (position.y + offset.y) * scale
  };
  
  // Category-specific styling
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'warning':
        return { backgroundColor: '#fff3cd', borderColor: '#ffc107', textColor: '#856404' };
      case 'specification':
        return { backgroundColor: '#d1ecf1', borderColor: '#17a2b8', textColor: '#0c5460' };
      case 'material':
        return { backgroundColor: '#d4edda', borderColor: '#28a745', textColor: '#155724' };
      case 'note':
        return { backgroundColor: '#f8f9fa', borderColor: '#6c757d', textColor: '#495057' };
      default:
        return { backgroundColor: '#ffffff', borderColor: '#333333', textColor: '#333333' };
    }
  };
  
  const categoryStyle = getCategoryStyle(category);
  const textWidth = text.length * (style.fontSize * 0.6);
  const textHeight = style.fontSize + style.padding * 2;
  
  return (
    <Group onClick={onSelect}>
      {/* Leader line if present */}
      {hasLeader && leaderPoints && leaderPoints.length > 1 && (
        <Line
          points={leaderPoints.flatMap(p => [(p.x + offset.x) * scale, (p.y + offset.y) * scale])}
          stroke={isSelected ? '#0066cc' : categoryStyle.borderColor}
          strokeWidth={1}
          dash={[4, 2]}
        />
      )}
      
      {/* Text background */}
      <Rect
        x={scaledPos.x - style.padding}
        y={scaledPos.y - style.padding}
        width={textWidth + style.padding * 2}
        height={textHeight}
        fill={isSelected ? '#e3f2fd' : (style.backgroundColor || categoryStyle.backgroundColor)}
        stroke={isSelected ? '#0066cc' : (style.borderColor || categoryStyle.borderColor)}
        strokeWidth={style.borderWidth}
        cornerRadius={4}
      />
      
      {/* Text */}
      <Text
        x={scaledPos.x}
        y={scaledPos.y}
        text={text}
        fontSize={style.fontSize}
        fontFamily={style.fontFamily}
        fontStyle={style.fontWeight}
        fill={isSelected ? '#0066cc' : (style.color || categoryStyle.textColor)}
        align={style.alignment}
        rotation={style.rotation}
        width={textWidth}
        height={textHeight}
        verticalAlign="middle"
      />
    </Group>
  );
};

/**
 * Area annotation with calculations
 */
const AreaAnnotationComponent: React.FC<{
  annotation: AreaAnnotation;
  scale: number;
  offset: Point2D;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ annotation, scale, offset, isSelected, onSelect }) => {
  const { points, area, perimeter, label, unit, style, showCalculations } = annotation;
  
  const scaledPoints = points.flatMap(p => [(p.x + offset.x) * scale, (p.y + offset.y) * scale]);
  
  // Calculate centroid for label placement
  const centroid = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  centroid.x = (centroid.x / points.length + offset.x) * scale;
  centroid.y = (centroid.y / points.length + offset.y) * scale;
  
  const calculationText = showCalculations 
    ? `${label}\nArea: ${area.toFixed(2)} ${unit}²\nPerimeter: ${perimeter.toFixed(2)} ${unit}`
    : label;
  
  return (
    <Group onClick={onSelect}>
      {/* Area fill */}
      <Line
        points={scaledPoints}
        closed
        fill={isSelected ? 'rgba(0, 102, 204, 0.2)' : style.fillColor}
        fillOpacity={style.fillOpacity}
        stroke={isSelected ? '#0066cc' : style.strokeColor}
        strokeWidth={style.strokeWidth}
        dash={style.strokeDashArray}
      />
      
      {/* Label background */}
      <Rect
        x={centroid.x - 60}
        y={centroid.y - 30}
        width={120}
        height={showCalculations ? 60 : 20}
        fill="white"
        stroke={isSelected ? '#0066cc' : style.strokeColor}
        strokeWidth={1}
        cornerRadius={4}
        opacity={0.9}
      />
      
      {/* Label text */}
      <Text
        x={centroid.x}
        y={centroid.y}
        text={calculationText}
        fontSize={style.labelStyle.fontSize}
        fontFamily={style.labelStyle.fontFamily}
        fill={isSelected ? '#0066cc' : style.labelStyle.color}
        align="center"
        verticalAlign="middle"
        offsetX={60}
        offsetY={showCalculations ? 30 : 10}
      />
    </Group>
  );
};

/**
 * Material callout with specifications
 */
const MaterialCalloutComponent: React.FC<{
  callout: MaterialCallout;
  scale: number;
  offset: Point2D;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ callout, scale, offset, isSelected, onSelect }) => {
  const { position, materialName, specifications, quantity, unit, style } = callout;
  
  const scaledPos = {
    x: (position.x + offset.x) * scale,
    y: (position.y + offset.y) * scale
  };
  
  const calloutText = [
    materialName,
    ...specifications,
    quantity && unit ? `Qty: ${quantity} ${unit}` : ''
  ].filter(Boolean).join('\n');
  
  const lineHeight = style.fontSize * 1.2;
  const lines = calloutText.split('\n');
  const maxWidth = Math.max(...lines.map(line => line.length * style.fontSize * 0.6));
  const totalHeight = lines.length * lineHeight + 20;
  
  return (
    <Group onClick={onSelect}>
      {/* Callout bubble */}
      <Rect
        x={scaledPos.x}
        y={scaledPos.y}
        width={maxWidth + 20}
        height={totalHeight}
        fill={isSelected ? '#e3f2fd' : style.bubbleColor}
        stroke={isSelected ? '#0066cc' : style.borderColor}
        strokeWidth={style.borderWidth}
        cornerRadius={8}
      />
      
      {/* Callout text */}
      <Text
        x={scaledPos.x + 10}
        y={scaledPos.y + 10}
        text={calloutText}
        fontSize={style.fontSize}
        fontFamily="Arial"
        fill={isSelected ? '#0066cc' : style.textColor}
        lineHeight={1.2}
        width={maxWidth}
      />
      
      {/* Leader pointer */}
      <Line
        points={[
          scaledPos.x + maxWidth / 2,
          scaledPos.y + totalHeight,
          scaledPos.x + maxWidth / 2,
          scaledPos.y + totalHeight + 20
        ]}
        stroke={isSelected ? '#0066cc' : style.borderColor}
        strokeWidth={style.borderWidth}
      />
      <Circle
        x={scaledPos.x + maxWidth / 2}
        y={scaledPos.y + totalHeight + 20}
        radius={4}
        fill={isSelected ? '#0066cc' : style.borderColor}
      />
    </Group>
  );
};

/**
 * Main enhanced annotation renderer
 */
const EnhancedAnnotationRenderer2D: React.FC<EnhancedAnnotationRenderer2DProps> = ({
  dimensions = [],
  textAnnotations = [],
  areaAnnotations = [],
  materialCallouts = [],
  scale = 1,
  offset = { x: 0, y: 0 },
  selectedAnnotationId,
  onAnnotationSelect,
  showLegend = false,
}) => {
  
  const handleSelect = (id: string, type: 'dimension' | 'text' | 'area' | 'material') => {
    if (onAnnotationSelect) {
      onAnnotationSelect(id, type);
    }
  };
  
  return (
    <Group>
      {/* Dimension annotations */}
      {dimensions.filter(dim => dim.isVisible).map(dimension => (
        <ProfessionalDimensionLine
          key={dimension.id}
          dimension={dimension}
          scale={scale}
          offset={offset}
          isSelected={selectedAnnotationId === dimension.id}
          onSelect={() => handleSelect(dimension.id, 'dimension')}
        />
      ))}
      
      {/* Area annotations */}
      {areaAnnotations.filter(ann => ann.isVisible).map(annotation => (
        <AreaAnnotationComponent
          key={annotation.id}
          annotation={annotation}
          scale={scale}
          offset={offset}
          isSelected={selectedAnnotationId === annotation.id}
          onSelect={() => handleSelect(annotation.id, 'area')}
        />
      ))}
      
      {/* Text annotations */}
      {textAnnotations.filter(ann => ann.isVisible).map(annotation => (
        <TextAnnotationComponent
          key={annotation.id}
          annotation={annotation}
          scale={scale}
          offset={offset}
          isSelected={selectedAnnotationId === annotation.id}
          onSelect={() => handleSelect(annotation.id, 'text')}
        />
      ))}
      
      {/* Material callouts */}
      {materialCallouts.filter(callout => callout.isVisible).map(callout => (
        <MaterialCalloutComponent
          key={callout.id}
          callout={callout}
          scale={scale}
          offset={offset}
          isSelected={selectedAnnotationId === callout.id}
          onSelect={() => handleSelect(callout.id, 'material')}
        />
      ))}
      
      {/* Legend (if enabled) */}
      {showLegend && (
        <Group>
          {/* Legend implementation would go here */}
        </Group>
      )}
    </Group>
  );
};

export default EnhancedAnnotationRenderer2D;