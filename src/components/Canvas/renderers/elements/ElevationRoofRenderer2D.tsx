'use client';

import React from 'react';
import { Group, Line, Rect, Text } from 'react-konva';
import { Roof2D, Element2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';
import { Material } from '@/types/materials/Material';
import { ELEVATION_VIEW_CONFIG } from '../ElevationRenderer2D';
import { MaterialRenderer2D } from '@/utils/materialRenderer2D';

interface ElevationRoofRenderer2DProps {
  roof: Roof2D;
  viewType: ViewType2D;
  isSelected: boolean;
  scale: number;
  showMaterials: boolean;
  getMaterialById: (id: string) => Material | undefined;
  onSelect: () => void;
  onEdit: (updates: Partial<Element2D>) => void;
}

export default function ElevationRoofRenderer2D({
  roof,
  viewType: _viewType,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit: _onEdit,
}: ElevationRoofRenderer2DProps) {
  const material = roof.materialId ? getMaterialById(roof.materialId) : undefined;
  const position = roof.transform.position;

  // Get roof appearance
  const getRoofAppearance = () => {
    if (showMaterials && material) {
      return {
        fill: material.color,
        stroke: material.color,
        strokeWidth: ELEVATION_VIEW_CONFIG.lineWeights.roof * scale,
        opacity: material.properties.opacity,
      };
    }
    
    return {
      fill: ELEVATION_VIEW_CONFIG.colors.roof,
      stroke: isSelected ? '#3b82f6' : ELEVATION_VIEW_CONFIG.colors.roof,
      strokeWidth: ELEVATION_VIEW_CONFIG.lineWeights.roof * scale,
      opacity: 1,
    };
  };

  const appearance = getRoofAppearance();

  // Calculate roof profile based on type and pitch
  const roofWidth = roof.dimensions.width + 2 * roof.overhang;
  const roofX = position.x - roofWidth / 2;
  const roofBaseY = ELEVATION_VIEW_CONFIG.heightReferences.standardCeiling; // Start at ceiling level
  const pitchRadians = (roof.pitch * Math.PI) / 180;
  const ridgeHeight = roof.ridgeHeight || (roof.dimensions.width / 2) * Math.tan(pitchRadians);

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    console.log('Edit roof in elevation view:', roof.id);
  };

  // Render different roof types
  const renderRoofProfile = () => {
    switch (roof.roofType) {
      case 'gable':
        return renderGableRoof();
      case 'hip':
        return renderHipRoof();
      case 'shed':
        return renderShedRoof();
      case 'flat':
        return renderFlatRoof();
      case 'gambrel':
        return renderGambrelRoof();
      default:
        return renderGableRoof();
    }
  };

  const renderGableRoof = () => {
    const ridgeX = roofX + roofWidth / 2;
    const ridgeY = roofBaseY - ridgeHeight;
    
    return (
      <Group>
        {/* Left slope */}
        <Line
          points={[
            roofX,
            roofBaseY,
            ridgeX,
            ridgeY,
            roofX + roofWidth,
            roofBaseY,
          ]}
          fill={appearance.fill}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth}
          closed
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
        
        {/* Ridge line */}
        <Line
          points={[ridgeX, ridgeY, ridgeX, ridgeY]}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth * 1.5}
          listening={false}
        />
      </Group>
    );
  };

  const renderHipRoof = () => {
    const ridgeX = roofX + roofWidth / 2;
    const ridgeY = roofBaseY - ridgeHeight;
    const hipOffset = roofWidth * 0.1; // Hip offset from edges
    
    return (
      <Group>
        {/* Hip roof profile */}
        <Line
          points={[
            roofX,
            roofBaseY,
            roofX + hipOffset,
            ridgeY,
            roofX + roofWidth - hipOffset,
            ridgeY,
            roofX + roofWidth,
            roofBaseY,
          ]}
          fill={appearance.fill}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth}
          closed
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
        
        {/* Ridge line */}
        <Line
          points={[
            roofX + hipOffset,
            ridgeY,
            roofX + roofWidth - hipOffset,
            ridgeY,
          ]}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth * 1.5}
          listening={false}
        />
      </Group>
    );
  };

  const renderShedRoof = () => {
    const highY = roofBaseY - ridgeHeight;
    const lowY = roofBaseY - ridgeHeight * 0.3;
    
    return (
      <Line
        points={[
          roofX,
          highY,
          roofX + roofWidth,
          lowY,
          roofX + roofWidth,
          roofBaseY,
          roofX,
          roofBaseY,
        ]}
        fill={appearance.fill}
        stroke={appearance.stroke}
        strokeWidth={appearance.strokeWidth}
        closed
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
      />
    );
  };

  const renderFlatRoof = () => {
    const roofY = roofBaseY - 6; // Slight height for flat roof
    
    return (
      <Rect
        x={roofX}
        y={roofY}
        width={roofWidth}
        height={6}
        fill={appearance.fill}
        stroke={appearance.stroke}
        strokeWidth={appearance.strokeWidth}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
      />
    );
  };

  const renderGambrelRoof = () => {
    const ridgeX = roofX + roofWidth / 2;
    const ridgeY = roofBaseY - ridgeHeight;
    const breakY = roofBaseY - ridgeHeight * 0.6;
    const breakOffset = roofWidth * 0.25;
    
    return (
      <Line
        points={[
          roofX,
          roofBaseY,
          roofX + breakOffset,
          breakY,
          ridgeX,
          ridgeY,
          roofX + roofWidth - breakOffset,
          breakY,
          roofX + roofWidth,
          roofBaseY,
        ]}
        fill={appearance.fill}
        stroke={appearance.stroke}
        strokeWidth={appearance.strokeWidth}
        closed
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
      />
    );
  };

  return (
    <Group>
      {/* Main roof profile */}
      {renderRoofProfile()}

      {/* Gutters (if specified) */}
      {roof.gutterType && roof.gutterType !== 'none' && (
        <Group>
          <Rect
            x={roofX}
            y={roofBaseY}
            width={8 * scale}
            height={4 * scale}
            fill={appearance.stroke}
            opacity={0.7}
            listening={false}
          />
          <Rect
            x={roofX + roofWidth - 8 * scale}
            y={roofBaseY}
            width={8 * scale}
            height={4 * scale}
            fill={appearance.stroke}
            opacity={0.7}
            listening={false}
          />
        </Group>
      )}

      {/* Roof overhang indicators */}
      {roof.overhang > 0 && (
        <Group>
          <Line
            points={[
              roofX,
              roofBaseY + 2 * scale,
              roofX + roof.overhang,
              roofBaseY + 2 * scale,
            ]}
            stroke="#ff6b35"
            strokeWidth={2 * scale}
            dash={[4 * scale, 4 * scale]}
            opacity={0.6}
            listening={false}
          />
          <Line
            points={[
              roofX + roofWidth - roof.overhang,
              roofBaseY + 2 * scale,
              roofX + roofWidth,
              roofBaseY + 2 * scale,
            ]}
            stroke="#ff6b35"
            strokeWidth={2 * scale}
            dash={[4 * scale, 4 * scale]}
            opacity={0.6}
            listening={false}
          />
        </Group>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <Group>
          <Rect
            x={roofX - 10}
            y={roofBaseY - ridgeHeight - 10}
            width={roofWidth + 20}
            height={ridgeHeight + 20}
            stroke="#3b82f6"
            strokeWidth={2 * scale}
            dash={[8 * scale, 4 * scale]}
            fill="rgba(59, 130, 246, 0.1)"
            listening={false}
          />
          
          {/* Selection handles */}
          <Rect
            x={roofX - 3}
            y={roofBaseY - 3}
            width={6}
            height={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
          <Rect
            x={roofX + roofWidth - 3}
            y={roofBaseY - 3}
            width={6}
            height={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={1}
            listening={false}
          />
        </Group>
      )}

      {/* Roof label (when selected) */}
      {isSelected && (
        <Text
          x={position.x}
          y={roofBaseY - ridgeHeight - 20 * scale}
          text={`${roof.roofType.toUpperCase()} Roof\n${roof.pitch}° Pitch`}
          fontSize={10 * scale}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={40 * scale}
          width={80 * scale}
          listening={false}
        />
      )}

      {/* Roof pitch indicator (when selected) */}
      {isSelected && roof.pitch > 0 && (
        <Group>
          {/* Pitch angle arc */}
          <Line
            points={[
              roofX + roofWidth / 2,
              roofBaseY,
              roofX + roofWidth / 2 + 30 * scale,
              roofBaseY,
              roofX + roofWidth / 2,
              roofBaseY - ridgeHeight,
            ]}
            stroke="#666666"
            strokeWidth={1 * scale}
            dash={[2 * scale, 2 * scale]}
            opacity={0.5}
            listening={false}
          />
          
          <Text
            x={roofX + roofWidth / 2 + 15 * scale}
            y={roofBaseY - 10 * scale}
            text={`${roof.pitch}°`}
            fontSize={8 * scale}
            fontFamily="Arial"
            fill="#666666"
            listening={false}
          />
        </Group>
      )}

      {/* Material overlay effects */}
      {showMaterials && material && material.properties.metallic > 0.5 && (
        <Rect
          x={roofX}
          y={roofBaseY - ridgeHeight}
          width={roofWidth}
          height={ridgeHeight}
          fill="linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)"
          opacity={material.properties.metallic * 0.4}
          listening={false}
        />
      )}

      {/* Roof material pattern (if texture available) */}
      {showMaterials && material && material.texture && (
        <Rect
          x={roofX}
          y={roofBaseY - ridgeHeight}
          width={roofWidth}
          height={ridgeHeight}
          fillPatternImage={(() => {
            const img = new Image();
            img.src = material.texture;
            return img;
          })()}
          fillPatternScale={{
            x: (material.properties.patternScale || 1) * 0.3,
            y: (material.properties.patternScale || 1) * 0.3,
          }}
          fillPatternRotation={material.properties.patternRotation || 0}
          opacity={0.4}
          listening={false}
        />
      )}
    </Group>
  );
}