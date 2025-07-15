'use client';

import React from 'react';
import { Line, Rect } from 'react-konva';
import { Wall2D, Element2D } from '@/types/elements2D';
import { Material } from '@/types/materials/Material';
import { PLAN_VIEW_CONFIG } from '../PlanViewRenderer2D';
import { MaterialRenderer2D } from '@/utils/materialRenderer2D';
import MaterializedWallComponent from '../../MaterializedWallComponent';

interface PlanWallRenderer2DProps {
  wall: Wall2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
  // Wall editing callbacks
  onWallStartDrag?: (handleType: 'start' | 'end' | 'move', x: number, y: number) => void;
  onWallDrag?: (handleType: 'start' | 'end' | 'move', x: number, y: number) => void;
  onWallEndDrag?: (handleType: 'start' | 'end' | 'move') => void;
}

export default function PlanWallRenderer2D({
  wall,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit,
  onWallStartDrag,
  onWallDrag,
  onWallEndDrag,
}: PlanWallRenderer2DProps) {
  // Suppress unused variable warning
  void onEdit;
  const material = wall.materialId ? getMaterialById(wall.materialId) : undefined;
  
  // Initialize material renderer for plan view
  const materialRenderer = React.useMemo(() => new MaterialRenderer2D('plan'), []);
  
  // Calculate wall properties for plan view
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

  // Get wall appearance (computed but not used in current implementation)
  // getWallAppearance();

  // Convert Wall2D to Wall format for MaterializedWallComponent
  const wallForComponent = {
    ...wall,
    startX: wall.startPoint.x,
    startY: wall.startPoint.y,
    endX: wall.endPoint.x,
    endY: wall.endPoint.y,
    // Include calculated angle for proper orientation
    angle: angleDegrees,
  };

  return (
    <MaterializedWallComponent
      wall={wallForComponent}
      isSelected={isSelected}
      onSelect={onSelect}
      onStartDrag={() => {}}
      onDrag={() => {}}
      onEndDrag={() => {}}
      onWallStartDrag={onWallStartDrag}
      onWallDrag={onWallDrag}
      onWallEndDrag={onWallEndDrag}
    />
  );

  /* Original custom rendering - replaced with MaterializedWallComponent
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
      {/* showMaterials && material && material.properties.metallic > 0.5 && (
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
      )} */}

      {/* Reflectivity highlight */}
      {/* showMaterials && material && material.properties.reflectivity > 0.5 && (
        <Line
          points={[wall.startPoint.x, wall.startPoint.y, wall.endPoint.x, wall.endPoint.y]}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={2 * scale}
          opacity={material.properties.reflectivity * 0.5}
          listening={false}
        />
      )} */}

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
      {/*<Line
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
    </Group>
  );*/
}