'use client';

import React from 'react';
import { Group, Line, Rect, Text } from 'react-konva';
import { Window2D, Element2D } from '@/types/elements2D';
import { Material } from '@/types/materials/Material';
import { PLAN_VIEW_CONFIG } from '../PlanViewRenderer2D';
import { MaterialRenderer2D } from '@/utils/materialRenderer2D';

interface PlanWindowRenderer2DProps {
  window: Window2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function PlanWindowRenderer2D({
  window,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit,
}: PlanWindowRenderer2DProps) {
  // Suppress unused variable warning
  void onEdit;
  const material = window.materialId ? getMaterialById(window.materialId) : undefined;

  // Initialize material renderer for plan view
  const materialRenderer = React.useMemo(() => new MaterialRenderer2D('plan'), []);

  // Get window appearance
  const getWindowAppearance = () => {
    if (showMaterials && material) {
      // Use advanced material pattern system
      const materialPattern = materialRenderer.getKonvaFillPattern(material, scale);

      return {
        ...materialPattern,
        stroke: isSelected ? '#3b82f6' : material.color,
        strokeWidth: PLAN_VIEW_CONFIG.lineWeights.window * scale,
        opacity: (materialPattern.opacity || 1) * 0.7, // Windows are typically more transparent
      };
    }

    return {
      fill: PLAN_VIEW_CONFIG.colors.window,
      stroke: isSelected ? '#3b82f6' : PLAN_VIEW_CONFIG.colors.window,
      strokeWidth: PLAN_VIEW_CONFIG.lineWeights.window * scale,
      opacity: 0.7, // Windows are typically more transparent in plan view
    };
  };

  const appearance = getWindowAppearance();
  const position = window.transform.position;
  const rotation = window.transform.rotation;

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    // Could trigger window properties dialog
  };

  return (
    <Group>
      {/* Window opening (gap in wall) - typically handled by wall renderer */}

      {/* Window frame */}
      <Rect
        x={position.x - window.width / 2}
        y={position.y - window.frameWidth / 2}
        width={window.width}
        height={window.frameWidth}
        rotation={rotation}
        fill={appearance.stroke}
        stroke={appearance.stroke}
        strokeWidth={appearance.strokeWidth}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        shadowColor={isSelected ? '#3b82f6' : undefined}
        shadowBlur={isSelected ? 3 * scale : 0}
        shadowOpacity={isSelected ? 0.3 : 0}
      />

      {/* Window glazing (glass) */}
      <Rect
        x={position.x - window.width / 2 + window.frameWidth}
        y={position.y - window.frameWidth / 2 + window.frameWidth / 4}
        width={window.width - 2 * window.frameWidth}
        height={window.frameWidth / 2}
        rotation={rotation}
        fill={appearance.fill}
        opacity={appearance.opacity}
        listening={false}
      />

      {/* Window mullions/dividers based on glazing type */}
      {window.glazingType !== 'single' && (
        <Group>
          {/* Vertical mullion for double/triple glazing */}
          <Line
            points={[
              position.x,
              position.y - window.frameWidth / 2,
              position.x,
              position.y + window.frameWidth / 2,
            ]}
            rotation={rotation}
            stroke={appearance.stroke}
            strokeWidth={1 * scale}
            listening={false}
          />

          {/* Additional mullion for triple glazing */}
          {window.glazingType === 'triple' && (
            <Group>
              <Line
                points={[
                  position.x - window.width / 4,
                  position.y - window.frameWidth / 2,
                  position.x - window.width / 4,
                  position.y + window.frameWidth / 2,
                ]}
                rotation={rotation}
                stroke={appearance.stroke}
                strokeWidth={1 * scale}
                listening={false}
              />
              <Line
                points={[
                  position.x + window.width / 4,
                  position.y - window.frameWidth / 2,
                  position.x + window.width / 4,
                  position.y + window.frameWidth / 2,
                ]}
                rotation={rotation}
                stroke={appearance.stroke}
                strokeWidth={1 * scale}
                listening={false}
              />
            </Group>
          )}
        </Group>
      )}

      {/* Window operation indicators */}
      {window.operableType !== 'fixed' && (
        <Group>
          {window.operableType === 'casement' && (
            // Casement window swing indicator
            <Line
              points={[
                position.x - window.width / 2,
                position.y,
                position.x - window.width / 2 - 15 * scale,
                position.y - 10 * scale,
              ]}
              rotation={rotation}
              stroke={appearance.stroke}
              strokeWidth={1 * scale}
              dash={[3 * scale, 3 * scale]}
              opacity={0.6}
              listening={false}
            />
          )}

          {window.operableType === 'sliding' && (
            // Sliding window track indicators
            <Group>
              <Line
                points={[
                  position.x - window.width / 2,
                  position.y - window.frameWidth / 2 - 3 * scale,
                  position.x + window.width / 2,
                  position.y - window.frameWidth / 2 - 3 * scale,
                ]}
                rotation={rotation}
                stroke={appearance.stroke}
                strokeWidth={1 * scale}
                dash={[2 * scale, 2 * scale]}
                opacity={0.5}
                listening={false}
              />
              <Line
                points={[
                  position.x - window.width / 2,
                  position.y + window.frameWidth / 2 + 3 * scale,
                  position.x + window.width / 2,
                  position.y + window.frameWidth / 2 + 3 * scale,
                ]}
                rotation={rotation}
                stroke={appearance.stroke}
                strokeWidth={1 * scale}
                dash={[2 * scale, 2 * scale]}
                opacity={0.5}
                listening={false}
              />
            </Group>
          )}

          {window.operableType === 'awning' && (
            // Awning window hinge indicator
            <Line
              points={[
                position.x - window.width / 2,
                position.y + window.frameWidth / 2,
                position.x + window.width / 2,
                position.y + window.frameWidth / 2,
              ]}
              rotation={rotation}
              stroke={appearance.stroke}
              strokeWidth={2 * scale}
              listening={false}
            />
          )}
        </Group>
      )}

      {/* Window sill indicator (in plan view, shown as thicker line) */}
      <Line
        points={[
          position.x - window.width / 2 - 2 * scale,
          position.y + window.frameWidth / 2 + 2 * scale,
          position.x + window.width / 2 + 2 * scale,
          position.y + window.frameWidth / 2 + 2 * scale,
        ]}
        rotation={rotation}
        stroke={appearance.stroke}
        strokeWidth={3 * scale}
        opacity={0.6}
        listening={false}
      />

      {/* Selection indicator */}
      {isSelected && (
        <Group>
          {/* Selection rectangle around window */}
          <Rect
            x={position.x - window.width / 2 - 5}
            y={position.y - window.frameWidth / 2 - 5}
            width={window.width + 10}
            height={window.frameWidth + 10}
            rotation={rotation}
            stroke="#3b82f6"
            strokeWidth={2 * scale}
            dash={[6 * scale, 3 * scale]}
            fill="rgba(59, 130, 246, 0.1)"
            listening={false}
          />

          {/* Selection handles */}
          <Rect
            x={position.x - window.width / 2 - 3}
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
            x={position.x + window.width / 2 - 3}
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

      {/* Material overlay effects */}
      {showMaterials && material && material.properties.reflectivity > 0.3 && (
        <Rect
          x={position.x - window.width / 2 + window.frameWidth}
          y={position.y - window.frameWidth / 2 + window.frameWidth / 4}
          width={window.width - 2 * window.frameWidth}
          height={window.frameWidth / 2}
          rotation={rotation}
          fill="linear-gradient(45deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)"
          opacity={material.properties.reflectivity * 0.5}
          listening={false}
        />
      )}

      {/* Window type indicator */}
      {(window.glazingType !== 'single' || window.operableType !== 'fixed') && (
        <Text
          x={position.x}
          y={position.y - window.frameWidth / 2 - 12 * scale}
          text={`${window.glazingType.toUpperCase()} ${window.operableType.toUpperCase()}`}
          fontSize={7 * scale}
          fontFamily="Arial"
          fill={appearance.stroke}
          align="center"
          offsetX={30 * scale}
          width={60 * scale}
          listening={false}
        />
      )}

      {/* Window label (when selected) */}
      {isSelected && (
        <Text
          x={position.x}
          y={position.y + window.frameWidth / 2 + 15 * scale}
          text={`Window ${window.width}"W x ${window.height}"H`}
          fontSize={10 * scale}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={50 * scale}
          width={100 * scale}
          listening={false}
        />
      )}

      {/* Window opening direction indicator (for operable windows) */}
      {window.operableType === 'casement' && (
        <Line
          points={[
            position.x,
            position.y,
            position.x - 8 * scale,
            position.y - 8 * scale,
          ]}
          rotation={rotation}
          stroke={appearance.stroke}
          strokeWidth={1 * scale}
          opacity={0.7}
          listening={false}
        />
      )}
    </Group>
  );
}
