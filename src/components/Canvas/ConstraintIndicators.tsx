'use client';

import React from 'react';
import { Line, Circle, Text } from 'react-konva';
import { WallConstraintResult } from '@/utils/wallConstraints';

interface ConstraintIndicatorsProps {
  constraintResult: WallConstraintResult | null;
  isValid: boolean;
  elementWidth?: number;
}

const ConstraintIndicators = React.memo(function ConstraintIndicatorsComponent({
  constraintResult,
  isValid,
  elementWidth = 80,
}: ConstraintIndicatorsProps) {
  if (!constraintResult) return null;

  const { position, wallSegment, error } = constraintResult;
  const halfWidth = elementWidth / 2;

  return (
    <>
      {/* Wall highlight when hovering */}
      {wallSegment && (
        <Line
          points={[
            wallSegment.startPoint.x,
            wallSegment.startPoint.y,
            wallSegment.endPoint.x,
            wallSegment.endPoint.y,
          ]}
          stroke={isValid ? '#10b981' : '#ef4444'}
          strokeWidth={wallSegment.wall.thickness + 4}
          opacity={0.3}
          listening={false}
        />
      )}

      {/* Placement position indicator */}
      <Circle
        x={position.x}
        y={position.y}
        radius={8}
        stroke={isValid ? '#10b981' : '#ef4444'}
        strokeWidth={2}
        fill="transparent"
        listening={false}
      />

      {/* Element width indicator */}
      {isValid && (
        <>
          <Line
            points={[
              position.x - halfWidth,
              position.y - 15,
              position.x + halfWidth,
              position.y - 15,
            ]}
            stroke="#10b981"
            strokeWidth={2}
            listening={false}
          />
          <Circle
            x={position.x - halfWidth}
            y={position.y - 15}
            radius={3}
            fill="#10b981"
            listening={false}
          />
          <Circle
            x={position.x + halfWidth}
            y={position.y - 15}
            radius={3}
            fill="#10b981"
            listening={false}
          />
        </>
      )}

      {/* Error message */}
      {!isValid && error && (
        <Text
          x={position.x - 50}
          y={position.y + 20}
          text={error}
          fontSize={12}
          fill="#ef4444"
          width={100}
          align="center"
          listening={false}
        />
      )}

      {/* Valid placement message */}
      {isValid && (
        <Text
          x={position.x - 40}
          y={position.y + 20}
          text="Click to place"
          fontSize={12}
          fill="#10b981"
          width={80}
          align="center"
          listening={false}
        />
      )}
    </>
  );
});

export default ConstraintIndicators;