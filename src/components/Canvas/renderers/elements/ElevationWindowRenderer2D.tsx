'use client';

import React from 'react';
import { Group, Line, Rect, Text } from 'react-konva';
import { Window2D, Element2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';
import { Material } from '@/types/materials/Material';
import { ELEVATION_VIEW_CONFIG } from '../ElevationRenderer2D';
import { MaterialRenderer2D } from '@/utils/materialRenderer2D';

interface ElevationWindowRenderer2DProps {
  window: Window2D;
  viewType: ViewType2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function ElevationWindowRenderer2D({
  window,
  viewType: _viewType,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit,
}: ElevationWindowRenderer2DProps) {
  // Suppress unused variable warning
  void onEdit;
  const material = window.materialId ? getMaterialById(window.materialId) : undefined;

  // Initialize material renderer for elevation view
  const materialRenderer = React.useMemo(() => new MaterialRenderer2D(_viewType), [_viewType]);

  // Get window appearance
  const getWindowAppearance = () => {
    if (showMaterials && material) {
      // Use advanced material pattern system for elevation view
      const materialPattern = materialRenderer.getKonvaFillPattern(material, scale);

      return {
        ...materialPattern,
        stroke: isSelected ? '#3b82f6' : material.color,
        strokeWidth: ELEVATION_VIEW_CONFIG.lineWeights.window * scale,
        opacity: (materialPattern.opacity || 1) * 0.7, // Windows are typically more transparent
      };
    }

    return {
      fill: ELEVATION_VIEW_CONFIG.colors.window,
      stroke: isSelected ? '#3b82f6' : ELEVATION_VIEW_CONFIG.colors.window,
      strokeWidth: ELEVATION_VIEW_CONFIG.lineWeights.window * scale,
      opacity: 0.7,
    };
  };

  const appearance = getWindowAppearance();
  const position = window.transform.position;

  // Window dimensions in elevation view
  const windowX = position.x - window.width / 2;
  const windowY = ELEVATION_VIEW_CONFIG.heightReferences.groundLevel - window.sillHeight - window.height;
  const windowWidth = window.width;
  const windowHeight = window.height;

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    // Edit window in elevation view
  };

  return (
    <Group>
      {/* Window frame */}
      <Rect
        x={windowX}
        y={windowY}
        width={windowWidth}
        height={windowHeight}
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

      {/* Window glazing (glass area) */}
      <Rect
        x={windowX + window.frameWidth}
        y={windowY + window.frameWidth}
        width={windowWidth - 2 * window.frameWidth}
        height={windowHeight - 2 * window.frameWidth}
        fill={appearance.fill}
        opacity={appearance.opacity}
        listening={false}
      />

      {/* Window mullions based on glazing type */}
      {window.glazingType !== 'single' && (
        <Group>
          {/* Vertical mullion for double/triple glazing */}
          <Line
            points={[
              windowX + windowWidth / 2,
              windowY + window.frameWidth,
              windowX + windowWidth / 2,
              windowY + windowHeight - window.frameWidth,
            ]}
            stroke={appearance.stroke}
            strokeWidth={2 * scale}
            listening={false}
          />

          {/* Horizontal mullion */}
          <Line
            points={[
              windowX + window.frameWidth,
              windowY + windowHeight / 2,
              windowX + windowWidth - window.frameWidth,
              windowY + windowHeight / 2,
            ]}
            stroke={appearance.stroke}
            strokeWidth={2 * scale}
            listening={false}
          />

          {/* Additional mullions for triple glazing */}
          {window.glazingType === 'triple' && (
            <Group>
              <Line
                points={[
                  windowX + windowWidth / 3,
                  windowY + window.frameWidth,
                  windowX + windowWidth / 3,
                  windowY + windowHeight - window.frameWidth,
                ]}
                stroke={appearance.stroke}
                strokeWidth={1 * scale}
                listening={false}
              />
              <Line
                points={[
                  windowX + (windowWidth * 2) / 3,
                  windowY + window.frameWidth,
                  windowX + (windowWidth * 2) / 3,
                  windowY + windowHeight - window.frameWidth,
                ]}
                stroke={appearance.stroke}
                strokeWidth={1 * scale}
                listening={false}
              />
            </Group>
          )}
        </Group>
      )}

      {/* Window sill */}
      <Rect
        x={windowX - 3 * scale}
        y={ELEVATION_VIEW_CONFIG.heightReferences.groundLevel - window.sillHeight - 2 * scale}
        width={windowWidth + 6 * scale}
        height={4 * scale}
        fill={appearance.stroke}
        opacity={0.8}
        listening={false}
      />

      {/* Window operation indicators */}
      {window.operableType !== 'fixed' && (
        <Group>
          {window.operableType === 'casement' && (
            // Casement window hinge and swing indicator
            <Group>
              <Line
                points={[
                  windowX + window.frameWidth,
                  windowY + window.frameWidth,
                  windowX + window.frameWidth,
                  windowY + windowHeight - window.frameWidth,
                ]}
                stroke={appearance.stroke}
                strokeWidth={3 * scale}
                listening={false}
              />
              <Line
                points={[
                  windowX + windowWidth - window.frameWidth,
                  windowY + windowHeight / 2,
                  windowX + windowWidth + 8 * scale,
                  windowY + windowHeight / 2 - 5 * scale,
                ]}
                stroke={appearance.stroke}
                strokeWidth={1 * scale}
                dash={[3 * scale, 3 * scale]}
                opacity={0.6}
                listening={false}
              />
            </Group>
          )}

          {window.operableType === 'sliding' && (
            // Sliding window tracks
            <Group>
              <Line
                points={[
                  windowX,
                  windowY - 2 * scale,
                  windowX + windowWidth,
                  windowY - 2 * scale,
                ]}
                stroke={appearance.stroke}
                strokeWidth={2 * scale}
                dash={[4 * scale, 4 * scale]}
                opacity={0.6}
                listening={false}
              />
              <Line
                points={[
                  windowX,
                  windowY + windowHeight + 2 * scale,
                  windowX + windowWidth,
                  windowY + windowHeight + 2 * scale,
                ]}
                stroke={appearance.stroke}
                strokeWidth={2 * scale}
                dash={[4 * scale, 4 * scale]}
                opacity={0.6}
                listening={false}
              />
            </Group>
          )}

          {window.operableType === 'awning' && (
            // Awning window hinge at bottom
            <Group>
              <Line
                points={[
                  windowX + window.frameWidth,
                  windowY + windowHeight - window.frameWidth,
                  windowX + windowWidth - window.frameWidth,
                  windowY + windowHeight - window.frameWidth,
                ]}
                stroke={appearance.stroke}
                strokeWidth={3 * scale}
                listening={false}
              />
              <Line
                points={[
                  windowX + windowWidth / 2,
                  windowY + window.frameWidth,
                  windowX + windowWidth / 2 + 8 * scale,
                  windowY - 5 * scale,
                ]}
                stroke={appearance.stroke}
                strokeWidth={1 * scale}
                dash={[3 * scale, 3 * scale]}
                opacity={0.6}
                listening={false}
              />
            </Group>
          )}
        </Group>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <Group>
          {/* Selection rectangle */}
          <Rect
            x={windowX - 5}
            y={windowY - 5}
            width={windowWidth + 10}
            height={windowHeight + 10}
            stroke="#3b82f6"
            strokeWidth={2 * scale}
            dash={[6 * scale, 3 * scale]}
            fill="rgba(59, 130, 246, 0.1)"
            listening={false}
          />

          {/* Selection handles */}
          <Rect
            x={windowX - 3}
            y={windowY + windowHeight / 2 - 3}
            width={6}
            height={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
          <Rect
            x={windowX + windowWidth - 3}
            y={windowY + windowHeight / 2 - 3}
            width={6}
            height={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
        </Group>
      )}

      {/* Material overlay effects (glass reflection) */}
      {showMaterials && material && material.properties.reflectivity > 0.3 && (
        <Rect
          x={windowX + window.frameWidth}
          y={windowY + window.frameWidth}
          width={windowWidth - 2 * window.frameWidth}
          height={windowHeight - 2 * window.frameWidth}
          fill="linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.2) 100%)"
          opacity={material.properties.reflectivity * 0.6}
          listening={false}
        />
      )}

      {/* Window label (when selected) */}
      {isSelected && (
        <Text
          x={position.x}
          y={windowY - 15 * scale}
          text={`Window ${window.width}"W x ${window.height}"H`}
          fontSize={10 * scale}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={60 * scale}
          width={120 * scale}
          listening={false}
        />
      )}

      {/* Window type indicator */}
      {(window.glazingType !== 'single' || window.operableType !== 'fixed') && (
        <Text
          x={windowX + windowWidth / 2}
          y={windowY - 8 * scale}
          text={`${window.glazingType.toUpperCase()} ${window.operableType.toUpperCase()}`}
          fontSize={7 * scale}
          fontFamily="Arial"
          fill={appearance.stroke}
          align="center"
          offsetX={40 * scale}
          width={80 * scale}
          opacity={0.7}
          listening={false}
        />
      )}

      {/* Window height and sill reference lines */}
      {isSelected && (
        <Group>
          {/* Sill height reference */}
          <Line
            points={[
              windowX - 15 * scale,
              ELEVATION_VIEW_CONFIG.heightReferences.groundLevel,
              windowX - 15 * scale,
              ELEVATION_VIEW_CONFIG.heightReferences.groundLevel - window.sillHeight,
            ]}
            stroke="#666666"
            strokeWidth={1 * scale}
            dash={[3 * scale, 3 * scale]}
            opacity={0.5}
            listening={false}
          />

          {/* Window height reference */}
          <Line
            points={[
              windowX + windowWidth + 10 * scale,
              windowY,
              windowX + windowWidth + 10 * scale,
              windowY + windowHeight,
            ]}
            stroke="#666666"
            strokeWidth={1 * scale}
            dash={[3 * scale, 3 * scale]}
            opacity={0.5}
            listening={false}
          />
        </Group>
      )}

      {/* Window depth indicator (frame thickness) */}
      <Rect
        x={windowX + windowWidth}
        y={windowY}
        width={window.frameWidth / 2}
        height={windowHeight}
        fill={appearance.stroke}
        opacity={0.4}
        listening={false}
      />
    </Group>
  );
}
