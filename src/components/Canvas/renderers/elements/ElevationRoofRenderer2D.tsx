'use client';

import React from 'react';
import { Group, Line, Rect, Text } from 'react-konva';
import { Roof2D, Element2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';
import { Material } from '@/types/materials/Material';
import { ELEVATION_VIEW_CONFIG } from '../ElevationRenderer2D';
// import { MaterialRenderer2D } from '@/utils/materialRenderer2D';

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
  viewType,
  isSelected,
  scale,
  showMaterials,
  getMaterialById,
  onSelect,
  onEdit,
}: ElevationRoofRenderer2DProps) {
  // Suppress unused variable warnings
  void viewType;
  void onEdit;
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
    // Edit roof in elevation view
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
      case 'mansard':
        return renderMansardRoof();
      case 'butterfly':
        return renderButterflyRoof();
      case 'saltbox':
        return renderSaltboxRoof();
      case 'monitor':
        return renderMonitorRoof();
      case 'sawtooth':
        return renderSawtoothRoof();
      case 'shed-dormer':
        return renderShedDormerRoof();
      default:
        return renderGableRoof();
    }
  };

  const renderGableRoof = () => {
    const ridgeX = roofX + roofWidth / 2;
    void ridgeX;

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
    void ridgeX;
    void ridgeX;
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
    void ridgeX;
    void ridgeX;
    const ridgeY = roofBaseY - ridgeHeight;
    const breakY = roofBaseY - ridgeHeight * 0.6;
    const breakOffset = roofWidth * 0.25;

    return (
      <Group>
        {/* Main gambrel profile */}
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

        {/* Break lines to show gambrel structure */}
        <Line
          points={[roofX + breakOffset, breakY, roofX + breakOffset, breakY]}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth * 1.2}
          listening={false}
        />
        <Line
          points={[roofX + roofWidth - breakOffset, breakY, roofX + roofWidth - breakOffset, breakY]}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth * 1.2}
          listening={false}
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

  const renderMansardRoof = () => {
    const centerX = roofX + roofWidth / 2;
    const mansardHeight = ridgeHeight * 0.8;
    const flatWidth = roofWidth * 0.4;
    const flatX = centerX - flatWidth / 2;
    const steepY = roofBaseY - mansardHeight;
    const flatY = roofBaseY - ridgeHeight;

    return (
      <Group>
        {/* Mansard profile with steep lower section and flat upper section */}
        <Line
          points={[
            roofX,
            roofBaseY,
            flatX,
            steepY,
            flatX,
            flatY,
            flatX + flatWidth,
            flatY,
            flatX + flatWidth,
            steepY,
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

        {/* Transition lines to show mansard structure */}
        <Line
          points={[flatX, steepY, flatX, flatY]}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth * 1.2}
          listening={false}
        />
        <Line
          points={[flatX + flatWidth, steepY, flatX + flatWidth, flatY]}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth * 1.2}
          listening={false}
        />

        {/* Flat section outline */}
        <Line
          points={[flatX, flatY, flatX + flatWidth, flatY]}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth * 1.5}
          listening={false}
        />
      </Group>
    );
  };

  const renderButterflyRoof = () => {
    // Butterfly roof - inverted V shape (valley in center)
    const centerX = roofX + roofWidth / 2;
    const valleyY = roofBaseY - ridgeHeight * 0.3; // Valley is lower than edges
    const edgeY = roofBaseY - ridgeHeight;

    return (
      <Group>
        {/* Butterfly profile - inverted V */}
        <Line
          points={[
            roofX,
            edgeY,
            centerX,
            valleyY,
            roofX + roofWidth,
            edgeY,
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

        {/* Valley line */}
        <Line
          points={[centerX, valleyY, centerX, valleyY]}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth * 1.5}
          listening={false}
        />

        {/* Drainage indicator */}
        <Line
          points={[centerX, valleyY, centerX, valleyY + 10 * scale]}
          stroke="#0066cc"
          strokeWidth={2 * scale}
          listening={false}
        />
      </Group>
    );
  };

  const renderSaltboxRoof = () => {
    // Saltbox roof - asymmetrical gable with one long slope
    const ridgeX = roofX + roofWidth * 0.35; // Ridge offset to one side
    void ridgeX;
    const ridgeY = roofBaseY - ridgeHeight;

    return (
      <Group>
        {/* Saltbox profile - asymmetrical */}
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

        {/* Asymmetry indicator */}
        <Line
          points={[ridgeX, ridgeY - 5 * scale, ridgeX, ridgeY + 5 * scale]}
          stroke="#ff6b35"
          strokeWidth={2 * scale}
          dash={[3 * scale, 3 * scale]}
          listening={false}
        />
      </Group>
    );
  };

  const renderMonitorRoof = () => {
    // Monitor roof - raised center section with clerestory windows
    const monitorWidth = roofWidth * 0.6;
    const monitorX = roofX + (roofWidth - monitorWidth) / 2;
    const lowerRidgeY = roofBaseY - ridgeHeight * 0.7;
    const upperRidgeY = roofBaseY - ridgeHeight;

    return (
      <Group>
        {/* Lower roof sections */}
        <Line
          points={[
            roofX,
            roofBaseY,
            monitorX,
            lowerRidgeY,
            monitorX,
            upperRidgeY,
            monitorX + monitorWidth,
            upperRidgeY,
            monitorX + monitorWidth,
            lowerRidgeY,
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

        {/* Monitor section outline */}
        <Line
          points={[
            monitorX,
            upperRidgeY,
            monitorX + monitorWidth,
            upperRidgeY,
          ]}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth * 1.5}
          listening={false}
        />

        {/* Clerestory windows indication */}
        <Line
          points={[
            monitorX + monitorWidth * 0.2,
            upperRidgeY,
            monitorX + monitorWidth * 0.2,
            lowerRidgeY,
          ]}
          stroke="#87ceeb"
          strokeWidth={3 * scale}
          listening={false}
        />
        <Line
          points={[
            monitorX + monitorWidth * 0.8,
            upperRidgeY,
            monitorX + monitorWidth * 0.8,
            lowerRidgeY,
          ]}
          stroke="#87ceeb"
          strokeWidth={3 * scale}
          listening={false}
        />
      </Group>
    );
  };

  const renderSawtoothRoof = () => {
    // Sawtooth roof - series of ridges and valleys
    const numTeeth = 3;
    const toothWidth = roofWidth / numTeeth;
    const ridgeY = roofBaseY - ridgeHeight;
    const valleyY = roofBaseY - ridgeHeight * 0.6;

    const points: number[] = [];

    // Build sawtooth profile
    for (let i = 0; i <= numTeeth; i++) {
      const x = roofX + i * toothWidth;
      if (i === 0) {
        points.push(x, roofBaseY);
      } else {
        points.push(x - toothWidth * 0.7, ridgeY); // Ridge
        points.push(x, valleyY); // Valley
      }
    }
    points.push(roofX + roofWidth, roofBaseY);
    points.push(roofX, roofBaseY);

    return (
      <Group>
        {/* Sawtooth profile */}
        <Line
          points={points}
          fill={appearance.fill}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth}
          closed
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />

        {/* Glazing indicators (north-facing slopes) */}
        {Array.from({ length: numTeeth }, (_, i) => (
          <Line
            key={i}
            points={[
              roofX + i * toothWidth + toothWidth * 0.3,
              valleyY,
              roofX + (i + 1) * toothWidth,
              valleyY,
            ]}
            stroke="#87ceeb"
            strokeWidth={4 * scale}
            listening={false}
          />
        ))}
      </Group>
    );
  };

  const renderShedDormerRoof = () => {
    // Shed dormer roof - main gable with shed dormer
    const ridgeX = roofX + roofWidth / 2;
    const ridgeY = roofBaseY - ridgeHeight;
    const dormerWidth = roofWidth * 0.4;
    const dormerX = roofX + roofWidth * 0.3;
    const dormerTopY = roofBaseY - ridgeHeight * 0.8;
    const dormerBottomY = roofBaseY - ridgeHeight * 0.4;

    return (
      <Group>
        {/* Main gable roof */}
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

        {/* Shed dormer */}
        <Line
          points={[
            dormerX,
            dormerBottomY,
            dormerX,
            dormerTopY,
            dormerX + dormerWidth,
            dormerBottomY,
          ]}
          fill={appearance.fill}
          stroke={appearance.stroke}
          strokeWidth={appearance.strokeWidth}
          closed
          listening={false}
        />

        {/* Dormer window */}
        <Line
          points={[
            dormerX + dormerWidth * 0.2,
            dormerTopY,
            dormerX + dormerWidth * 0.8,
            dormerTopY,
          ]}
          stroke="#87ceeb"
          strokeWidth={4 * scale}
          listening={false}
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
