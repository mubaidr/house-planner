'use client';

import React from 'react';
import { Group, Line, Rect, Text } from 'react-konva';
import { Door2D, Element2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';
import { Material } from '@/types/materials/Material';
import { ELEVATION_VIEW_CONFIG } from '../ElevationRenderer2D';
import { MaterialRenderer2D } from '@/utils/materialRenderer2D';

interface ElevationDoorRenderer2DProps {
  door: Door2D;
  viewType: ViewType2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function ElevationDoorRenderer2D({
  door,
  viewType,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit,
}: ElevationDoorRenderer2DProps) {
  // Suppress unused variable warnings
  void onEdit;
  const material = door.materialId ? getMaterialById(door.materialId) : undefined;

  // Initialize material renderer for elevation view
  const materialRenderer = React.useMemo(() => new MaterialRenderer2D(viewType), [viewType]);

  // Get door appearance
  const getDoorAppearance = () => {
    if (showMaterials && material) {
      // Use advanced material pattern system for elevation view
      const materialPattern = materialRenderer.getKonvaFillPattern(material, scale);

      return {
        ...materialPattern,
        stroke: isSelected ? '#3b82f6' : material.color,
        strokeWidth: ELEVATION_VIEW_CONFIG.lineWeights.door * scale,
      };
    }

    return {
      fill: ELEVATION_VIEW_CONFIG.colors.door,
      stroke: isSelected ? '#3b82f6' : ELEVATION_VIEW_CONFIG.colors.door,
      strokeWidth: ELEVATION_VIEW_CONFIG.lineWeights.door * scale,
      opacity: 1,
    };
  };

  const appearance = getDoorAppearance();
  const position = door.transform.position;

  // Door dimensions in elevation view
  const doorX = position.x - door.width / 2;
  const doorY = ELEVATION_VIEW_CONFIG.heightReferences.groundLevel - door.height;
  const doorWidth = door.width;
  const doorHeight = door.height;

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    // Edit door in elevation view
  };

  return (
    <Group>
      {/* Door frame */}
      <Rect
        x={doorX}
        y={doorY}
        width={doorWidth}
        height={doorHeight}
        fill={appearance.fill}
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

      {/* Door panels (for visual detail) */}
      <Group>
        {/* Upper panel */}
        <Rect
          x={doorX + 3 * scale}
          y={doorY + 3 * scale}
          width={doorWidth - 6 * scale}
          height={doorHeight * 0.4 - 3 * scale}
          fill="transparent"
          stroke={appearance.stroke}
          strokeWidth={1 * scale}
          opacity={0.6}
          listening={false}
        />

        {/* Lower panel */}
        <Rect
          x={doorX + 3 * scale}
          y={doorY + doorHeight * 0.4 + 3 * scale}
          width={doorWidth - 6 * scale}
          height={doorHeight * 0.6 - 6 * scale}
          fill="transparent"
          stroke={appearance.stroke}
          strokeWidth={1 * scale}
          opacity={0.6}
          listening={false}
        />
      </Group>

      {/* Door handle */}
      {(() => {
        const handleSide = door.handleSide === 'left' ? 0.2 : 0.8;
        const handleX = doorX + doorWidth * handleSide;
        const handleY = doorY + doorHeight * 0.5;

        return (
          <Group>
            {/* Handle */}
            <Rect
              x={handleX - 1 * scale}
              y={handleY - 3 * scale}
              width={2 * scale}
              height={6 * scale}
              fill={appearance.stroke}
              listening={false}
            />

            {/* Handle knob */}
            <Rect
              x={handleX - 2 * scale}
              y={handleY - 1 * scale}
              width={4 * scale}
              height={2 * scale}
              fill={appearance.stroke}
              cornerRadius={1 * scale}
              listening={false}
            />
          </Group>
        );
      })()}

      {/* Door threshold */}
      {door.threshold && (
        <Rect
          x={doorX - 2 * scale}
          y={ELEVATION_VIEW_CONFIG.heightReferences.groundLevel - 2 * scale}
          width={doorWidth + 4 * scale}
          height={4 * scale}
          fill={appearance.stroke}
          opacity={0.8}
          listening={false}
        />
      )}

      {/* Door type indicator (for non-single doors) */}
      {door.openingType !== 'single' && (
        <Group>
          {door.openingType === 'double' && (
            // Center divider for double doors
            <Line
              points={[
                doorX + doorWidth / 2,
                doorY,
                doorX + doorWidth / 2,
                doorY + doorHeight,
              ]}
              stroke={appearance.stroke}
              strokeWidth={2 * scale}
              listening={false}
            />
          )}

          {door.openingType === 'sliding' && (
            // Sliding track indicator
            <Line
              points={[
                doorX - 5 * scale,
                doorY - 3 * scale,
                doorX + doorWidth + 5 * scale,
                doorY - 3 * scale,
              ]}
              stroke={appearance.stroke}
              strokeWidth={2 * scale}
              dash={[4 * scale, 4 * scale]}
              opacity={0.7}
              listening={false}
            />
          )}

          {door.openingType === 'folding' && (
            // Folding door segments
            <Group>
              <Line
                points={[
                  doorX + doorWidth * 0.25,
                  doorY,
                  doorX + doorWidth * 0.25,
                  doorY + doorHeight,
                ]}
                stroke={appearance.stroke}
                strokeWidth={1 * scale}
                dash={[2 * scale, 2 * scale]}
                opacity={0.6}
                listening={false}
              />
              <Line
                points={[
                  doorX + doorWidth * 0.5,
                  doorY,
                  doorX + doorWidth * 0.5,
                  doorY + doorHeight,
                ]}
                stroke={appearance.stroke}
                strokeWidth={1 * scale}
                dash={[2 * scale, 2 * scale]}
                opacity={0.6}
                listening={false}
              />
              <Line
                points={[
                  doorX + doorWidth * 0.75,
                  doorY,
                  doorX + doorWidth * 0.75,
                  doorY + doorHeight,
                ]}
                stroke={appearance.stroke}
                strokeWidth={1 * scale}
                dash={[2 * scale, 2 * scale]}
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
            x={doorX - 5}
            y={doorY - 5}
            width={doorWidth + 10}
            height={doorHeight + 10}
            stroke="#3b82f6"
            strokeWidth={2 * scale}
            dash={[6 * scale, 3 * scale]}
            fill="rgba(59, 130, 246, 0.1)"
            listening={false}
          />

          {/* Selection handles */}
          <Rect
            x={doorX - 3}
            y={doorY + doorHeight / 2 - 3}
            width={6}
            height={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
          <Rect
            x={doorX + doorWidth - 3}
            y={doorY + doorHeight / 2 - 3}
            width={6}
            height={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
        </Group>
      )}

      {/* Material overlay effects */}
      {showMaterials && material && material.properties.metallic > 0.5 && (
        <Rect
          x={doorX}
          y={doorY}
          width={doorWidth}
          height={doorHeight}
          fill="linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)"
          opacity={material.properties.metallic * 0.3}
          listening={false}
        />
      )}

      {/* Door label (when selected) */}
      {isSelected && (
        <Text
          x={position.x}
          y={doorY - 15 * scale}
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

      {/* Door swing direction indicator (subtle) */}
      {door.swingDirection && (
        <Text
          x={doorX + (door.swingDirection === 'left' ? 5 * scale : doorWidth - 15 * scale)}
          y={doorY + 5 * scale}
          text={door.swingDirection === 'left' ? 'L' : 'R'}
          fontSize={8 * scale}
          fontFamily="Arial"
          fill={appearance.stroke}
          opacity={0.6}
          listening={false}
        />
      )}

      {/* Door height reference line */}
      {isSelected && (
        <Group>
          <Line
            points={[
              doorX - 10 * scale,
              ELEVATION_VIEW_CONFIG.heightReferences.groundLevel,
              doorX - 10 * scale,
              doorY,
            ]}
            stroke="#666666"
            strokeWidth={1 * scale}
            dash={[3 * scale, 3 * scale]}
            opacity={0.5}
            listening={false}
          />

          {/* Height arrows */}
          <Line
            points={[
              doorX - 12 * scale,
              ELEVATION_VIEW_CONFIG.heightReferences.groundLevel - 3 * scale,
              doorX - 10 * scale,
              ELEVATION_VIEW_CONFIG.heightReferences.groundLevel,
              doorX - 8 * scale,
              ELEVATION_VIEW_CONFIG.heightReferences.groundLevel - 3 * scale,
            ]}
            stroke="#666666"
            strokeWidth={1 * scale}
            listening={false}
          />
          <Line
            points={[
              doorX - 12 * scale,
              doorY + 3 * scale,
              doorX - 10 * scale,
              doorY,
              doorX - 8 * scale,
              doorY + 3 * scale,
            ]}
            stroke="#666666"
            strokeWidth={1 * scale}
            listening={false}
          />
        </Group>
      )}
    </Group>
  );
}
