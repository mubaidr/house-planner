'use client';

import React from 'react';
import { Group, Line, Rect } from 'react-konva';
import { Wall2D, Element2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';
import { Material } from '@/types/materials/Material';
import { ELEVATION_VIEW_CONFIG } from '../ElevationViewConfig';
import { MaterialRenderer2D, MaterialPatternUtils } from '@/utils/materialRenderer2D';

interface ElevationWallRenderer2DProps {
  wall: Wall2D;
  viewType: ViewType2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function ElevationWallRenderer2D({
  wall,
  viewType,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit,
}: ElevationWallRenderer2DProps) {
  // Suppress unused variable warning
  void onEdit;
  const material = wall.materialId ? getMaterialById(wall.materialId) : undefined;

  // Initialize material renderer for elevation view
  const materialRenderer = React.useMemo(() => new MaterialRenderer2D(viewType), [viewType]);

  // Calculate wall properties for elevation view
  // In elevation views, walls are shown as vertical rectangles
  const wallLength = Math.sqrt(
    Math.pow(wall.endPoint.x - wall.startPoint.x, 2) +
    Math.pow(wall.endPoint.y - wall.startPoint.y, 2)
  );

  // Wall position in elevation view (projected from 3D to 2D)
  const wallX = wall.startPoint.x; // Horizontal position
  const wallY = ELEVATION_VIEW_CONFIG.heightReferences.groundLevel; // Base at ground level
  const wallWidth = wallLength;
  const wallHeight = wall.height;

  // Get wall appearance based on material or defaults
  const getWallAppearance = () => {
    if (showMaterials && material) {
      // Use advanced material pattern system for elevation view
      const materialPattern = materialRenderer.getKonvaFillPattern(material, scale);

      return {
        ...materialPattern,
        stroke: isSelected ? '#3b82f6' : material.color,
        strokeWidth: ELEVATION_VIEW_CONFIG.lineWeights.wall * scale,
      };
    }

    // Default appearance
    return {
      fill: ELEVATION_VIEW_CONFIG.colors.wall,
      stroke: isSelected ? '#3b82f6' : ELEVATION_VIEW_CONFIG.colors.wall,
      strokeWidth: ELEVATION_VIEW_CONFIG.lineWeights.wall * scale,
      opacity: 1,
    };
  };

  const appearance = getWallAppearance();

  // Handle wall selection
  const handleClick = () => {
    onSelect();
  };

  // Handle wall editing (double-click)
  const handleDoubleClick = () => {
    // Edit wall in elevation view
  };

  // Calculate wall visibility based on view direction
  const isWallVisibleInView = (): boolean => {
    const wallAngle = Math.atan2(
      wall.endPoint.y - wall.startPoint.y,
      wall.endPoint.x - wall.startPoint.x
    );
    const wallAngleDegrees = (wallAngle * 180) / Math.PI;

    // Determine if wall faces the current view direction
    switch (viewType) {
      case 'front':
        // Show walls that face south (negative Y direction)
        return Math.abs(wallAngleDegrees) < 45 || Math.abs(wallAngleDegrees) > 135;
      case 'back':
        // Show walls that face north (positive Y direction)
        return Math.abs(wallAngleDegrees - 180) < 45 || Math.abs(wallAngleDegrees + 180) < 45;
      case 'left':
        // Show walls that face west (negative X direction)
        return Math.abs(wallAngleDegrees - 90) < 45 || Math.abs(wallAngleDegrees + 270) < 45;
      case 'right':
        // Show walls that face east (positive X direction)
        return Math.abs(wallAngleDegrees + 90) < 45 || Math.abs(wallAngleDegrees - 270) < 45;
      default:
        return true;
    }
  };

  // Don't render if wall is not visible in this view
  if (!isWallVisibleInView()) {
    return null;
  }

  return (
    <Group>
      {/* Main wall body - rendered as rectangle for elevation view */}
      <Rect
        x={wallX}
        y={wallY - wallHeight} // Y grows downward, so subtract height
        width={wallWidth}
        height={wallHeight}
        {...appearance}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        shadowColor={isSelected ? '#3b82f6' : undefined}
        shadowBlur={isSelected ? 5 * scale : 0}
        shadowOpacity={isSelected ? 0.3 : 0}
      />

      {/* Wall thickness indicator (side edge) */}
      <Rect
        x={wallX + wallWidth}
        y={wallY - wallHeight}
        width={wall.thickness / 4} // Show thickness as thin edge
        height={wallHeight}
        fill={appearance.fill}
        stroke={appearance.stroke}
        strokeWidth={appearance.strokeWidth * 0.5}
        opacity={appearance.opacity * 0.7}
        listening={false}
      />

      {/* Material overlay effects for elevation view */}
      {showMaterials && material && material.properties.metallic > 0.5 && (
        <Rect
          x={wallX}
          y={wallY - wallHeight}
          width={wallWidth}
          height={wallHeight}
          fill="linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)"
          opacity={material.properties.metallic * 0.4}
          listening={false}
        />
      )}

      {/* Wall shadow (if material settings enabled) */}
      {showMaterials && ELEVATION_VIEW_CONFIG.materialSettings.showShadows && (
        <Rect
          x={wallX + wallWidth + wall.thickness / 4}
          y={wallY - wallHeight + 5 * scale}
          width={3 * scale}
          height={wallHeight - 5 * scale}
          fill="rgba(0, 0, 0, 0.2)"
          opacity={ELEVATION_VIEW_CONFIG.materialSettings.shadowOpacity}
          listening={false}
        />
      )}

      {/* Wall openings (doors and windows) */}
      {wall.openings.map((opening, index) => {
        const openingX = wallX + wallWidth * opening.positionOnWall - opening.width / 2;
        const openingY = wallY - (opening.type === 'door2d' ? opening.height : opening.sillHeight! + opening.height);

        return (
          <Group key={`opening-${index}`}>
            {/* Opening cutout */}
            <Rect
              x={openingX}
              y={openingY}
              width={opening.width}
              height={opening.height}
              fill={ELEVATION_VIEW_CONFIG.colors.background}
              stroke={opening.type === 'door2d' ? ELEVATION_VIEW_CONFIG.colors.door : ELEVATION_VIEW_CONFIG.colors.window}
              strokeWidth={1 * scale}
              listening={false}
            />

            {/* Window sill (for windows) */}
            {opening.type === 'window2d' && opening.sillHeight! > 0 && (
              <Line
                points={[
                  openingX - 2 * scale,
                  wallY - opening.sillHeight!,
                  openingX + opening.width + 2 * scale,
                  wallY - opening.sillHeight!,
                ]}
                stroke={ELEVATION_VIEW_CONFIG.colors.window}
                strokeWidth={2 * scale}
                listening={false}
              />
            )}
          </Group>
        );
      })}

      {/* Ground line at base of wall */}
      <Line
        points={[wallX, wallY, wallX + wallWidth, wallY]}
        stroke={ELEVATION_VIEW_CONFIG.colors.ground}
        strokeWidth={2 * scale}
        opacity={0.6}
        listening={false}
      />

      {/* Wall top line */}
      <Line
        points={[wallX, wallY - wallHeight, wallX + wallWidth, wallY - wallHeight]}
        stroke={appearance.stroke}
        strokeWidth={1 * scale}
        opacity={0.8}
        listening={false}
      />

      {/* Selection indicator */}
      {isSelected && (
        <Group>
          <Rect
            x={wallX - 5}
            y={wallY - wallHeight - 5}
            width={wallWidth + 10}
            height={wallHeight + 10}
            stroke="#3b82f6"
            strokeWidth={2 * scale}
            dash={[8 * scale, 4 * scale]}
            fill="rgba(59, 130, 246, 0.1)"
            listening={false}
          />

          {/* Selection handles */}
          <Rect
            x={wallX - 3}
            y={wallY - wallHeight / 2 - 3}
            width={6}
            height={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
          <Rect
            x={wallX + wallWidth - 3}
            y={wallY - wallHeight / 2 - 3}
            width={6}
            height={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
        </Group>
      )}

      {/* Wall height dimension (when selected) */}
      {isSelected && (
        <Group>
          {/* Height dimension line */}
          <Line
            points={[
              wallX - 15 * scale,
              wallY,
              wallX - 15 * scale,
              wallY - wallHeight,
            ]}
            stroke="#666666"
            strokeWidth={1 * scale}
            dash={[3 * scale, 3 * scale]}
            listening={false}
          />

          {/* Height text */}
          <Rect
            x={wallX - 25 * scale}
            y={wallY - wallHeight / 2 - 8 * scale}
            width={20 * scale}
            height={16 * scale}
            fill="#ffffff"
            stroke="#666666"
            strokeWidth={1 * scale}
            listening={false}
          />

          {/* Height value */}
          <Line
            points={[
              wallX - 25 * scale,
              wallY - wallHeight / 2,
              wallX - 5 * scale,
              wallY - wallHeight / 2,
            ]}
            stroke="#666666"
            strokeWidth={8 * scale}
            listening={false}
          />
        </Group>
      )}

      {/* Enhanced material pattern overlay using advanced pattern system */}
      {showMaterials && material && MaterialPatternUtils.shouldShowPattern(material, viewType, 'high') && (
        <Rect
          x={wallX}
          y={wallY - wallHeight}
          width={wallWidth}
          height={wallHeight}
          {...materialRenderer.getKonvaFillPattern(material, scale * 0.8)}
          opacity={0.4}
          listening={false}
        />
      )}
    </Group>
  );
}
