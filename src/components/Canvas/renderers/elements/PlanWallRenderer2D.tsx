'use client';

import React from 'react';
import { Group, Line, Rect } from 'react-konva';
import { Wall2D, Element2D } from '@/types/elements2D';
import { Material } from '@/types/materials/Material';
import { PLAN_VIEW_CONFIG } from '../PlanViewRenderer2D';
import { MaterialRenderer2D, MaterialPatternUtils } from '@/utils/materialRenderer2D';

interface PlanWallRenderer2DProps {
  wall: Wall2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function PlanWallRenderer2D({
  wall,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit: _onEdit,
}: PlanWallRenderer2DProps) {
  const material = wall.materialId ? getMaterialById(wall.materialId) : undefined;
  
  // Initialize material renderer for plan view
  const materialRenderer = React.useMemo(() => new MaterialRenderer2D('plan'), []);
  
  // Calculate wall properties for plan view
  const length = Math.sqrt(
    Math.pow(wall.endPoint.x - wall.startPoint.x, 2) + 
    Math.pow(wall.endPoint.y - wall.startPoint.y, 2)
  );
  
  const angle = Math.atan2(
    wall.endPoint.y - wall.startPoint.y, 
    wall.endPoint.x - wall.startPoint.x
  );
  const angleDegrees = (angle * 180) / Math.PI;

  // Get wall appearance based on material or defaults
  const getWallAppearance = () => {
    if (showMaterials && material) {
      // Use advanced material pattern system
      const materialPattern = materialRenderer.getKonvaFillPattern(material, scale);
      
      return {
        ...materialPattern,
        stroke: isSelected ? '#3b82f6' : material.color,
        strokeWidth: PLAN_VIEW_CONFIG.lineWeights.wall * scale,
      };
    }
    
    // Default appearance
    return {
      fill: PLAN_VIEW_CONFIG.colors.wall,
      stroke: isSelected ? '#3b82f6' : PLAN_VIEW_CONFIG.colors.wall,
      strokeWidth: PLAN_VIEW_CONFIG.lineWeights.wall * scale,
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
    // Could trigger wall properties dialog
    console.log('Edit wall:', wall.id);
  };

  return (
    <Group>
      {/* Main wall body - rendered as rectangle for plan view */}
      <Rect
        x={wall.startPoint.x}
        y={wall.startPoint.y - wall.thickness / 2}
        width={length}
        height={wall.thickness}
        rotation={angleDegrees}
        {...appearance}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        shadowColor={isSelected ? '#3b82f6' : undefined}
        shadowBlur={isSelected ? 5 * scale : 0}
        shadowOpacity={isSelected ? 0.3 : 0}
      />

      {/* Material overlay effects for plan view */}
      {showMaterials && material && material.properties.metallic > 0.5 && (
        <Rect
          x={wall.startPoint.x}
          y={wall.startPoint.y - wall.thickness / 2}
          width={length}
          height={wall.thickness}
          rotation={angleDegrees}
          fill="linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)"
          opacity={material.properties.metallic * 0.3}
          listening={false}
        />
      )}

      {/* Reflectivity highlight */}
      {showMaterials && material && material.properties.reflectivity > 0.5 && (
        <Line
          points={[wall.startPoint.x, wall.startPoint.y, wall.endPoint.x, wall.endPoint.y]}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={2 * scale}
          opacity={material.properties.reflectivity * 0.5}
          listening={false}
        />
      )}

      {/* Wall centerline for reference (shown when selected or in edit mode) */}
      {isSelected && (
        <Line
          points={[wall.startPoint.x, wall.startPoint.y, wall.endPoint.x, wall.endPoint.y]}
          stroke="#3b82f6"
          strokeWidth={1 * scale}
          dash={[5 * scale, 5 * scale]}
          opacity={0.7}
          listening={false}
        />
      )}

      {/* Wall end caps for better visual definition */}
      <Line
        points={[
          wall.startPoint.x - Math.sin(angle) * wall.thickness / 2,
          wall.startPoint.y + Math.cos(angle) * wall.thickness / 2,
          wall.startPoint.x + Math.sin(angle) * wall.thickness / 2,
          wall.startPoint.y - Math.cos(angle) * wall.thickness / 2,
        ]}
        stroke={appearance.stroke}
        strokeWidth={appearance.strokeWidth}
        opacity={appearance.opacity}
        listening={false}
      />
      
      <Line
        points={[
          wall.endPoint.x - Math.sin(angle) * wall.thickness / 2,
          wall.endPoint.y + Math.cos(angle) * wall.thickness / 2,
          wall.endPoint.x + Math.sin(angle) * wall.thickness / 2,
          wall.endPoint.y - Math.cos(angle) * wall.thickness / 2,
        ]}
        stroke={appearance.stroke}
        strokeWidth={appearance.strokeWidth}
        opacity={appearance.opacity}
        listening={false}
      />

      {/* Selection indicator */}
      {isSelected && (
        <Rect
          x={wall.startPoint.x - 5}
          y={wall.startPoint.y - wall.thickness / 2 - 5}
          width={length + 10}
          height={wall.thickness + 10}
          rotation={angleDegrees}
          stroke="#3b82f6"
          strokeWidth={2 * scale}
          dash={[8 * scale, 4 * scale]}
          fill="rgba(59, 130, 246, 0.1)"
          listening={false}
        />
      )}

      {/* Wall openings indicators (doors and windows) */}
      {wall.openings.map((opening, index) => {
        const openingPosition = {
          x: wall.startPoint.x + (wall.endPoint.x - wall.startPoint.x) * opening.positionOnWall,
          y: wall.startPoint.y + (wall.endPoint.y - wall.startPoint.y) * opening.positionOnWall,
        };

        return (
          <Group key={`opening-${index}`}>
            {/* Opening gap in wall */}
            <Rect
              x={openingPosition.x - opening.width / 2}
              y={openingPosition.y - wall.thickness / 2}
              width={opening.width}
              height={wall.thickness}
              rotation={angleDegrees}
              fill={PLAN_VIEW_CONFIG.colors.background}
              stroke={PLAN_VIEW_CONFIG.colors.wall}
              strokeWidth={0.5 * scale}
              listening={false}
            />
            
            {/* Opening indicator line */}
            <Line
              points={[
                openingPosition.x - opening.width / 2,
                openingPosition.y,
                openingPosition.x + opening.width / 2,
                openingPosition.y,
              ]}
              stroke={opening.type === 'door2d' ? PLAN_VIEW_CONFIG.colors.door : PLAN_VIEW_CONFIG.colors.window}
              strokeWidth={2 * scale}
              rotation={angleDegrees}
              listening={false}
            />
          </Group>
        );
      })}

      {/* Wall constraints indicators */}
      {isSelected && wall.constraints.map((constraint, index) => {
        // Render constraint indicators based on type
        switch (constraint.type) {
          case 'parallel':
            return (
              <Line
                key={`constraint-${index}`}
                points={[
                  wall.startPoint.x - 10,
                  wall.startPoint.y - 10,
                  wall.startPoint.x + 10,
                  wall.startPoint.y + 10,
                ]}
                stroke="#ff6b35"
                strokeWidth={2 * scale}
                listening={false}
              />
            );
          case 'perpendicular':
            return (
              <Rect
                key={`constraint-${index}`}
                x={wall.startPoint.x - 5}
                y={wall.startPoint.y - 5}
                width={10}
                height={10}
                stroke="#ff6b35"
                strokeWidth={2 * scale}
                fill="rgba(255, 107, 53, 0.2)"
                listening={false}
              />
            );
          default:
            return null;
        }
      })}
    </Group>
  );
}