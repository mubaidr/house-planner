'use client';

import React from 'react';
import { Circle, Line } from 'react-konva';

interface SnapIndicatorsProps {
  snapPoint?: { x: number; y: number; type: 'grid' | 'endpoint' | 'midpoint' } | null;
  showGridLines?: boolean;
  gridSize?: number;
  canvasWidth?: number;
  canvasHeight?: number;
}

export default function SnapIndicators({
  snapPoint,
  showGridLines = false,
  canvasWidth = 800,
  canvasHeight = 600,
}: SnapIndicatorsProps) {
  return (
    <>
      {/* Snap point indicator */}
      {snapPoint && (
        <>
          {/* Snap point circle */}
          <Circle
            x={snapPoint.x}
            y={snapPoint.y}
            radius={6}
            stroke={snapPoint.type === 'grid' ? '#3b82f6' : '#10b981'}
            strokeWidth={2}
            fill="transparent"
            listening={false}
          />
          
          {/* Inner dot */}
          <Circle
            x={snapPoint.x}
            y={snapPoint.y}
            radius={2}
            fill={snapPoint.type === 'grid' ? '#3b82f6' : '#10b981'}
            listening={false}
          />
          
          {/* Crosshair lines for precise positioning */}
          <Line
            points={[snapPoint.x - 10, snapPoint.y, snapPoint.x + 10, snapPoint.y]}
            stroke={snapPoint.type === 'grid' ? '#3b82f6' : '#10b981'}
            strokeWidth={1}
            opacity={0.7}
            listening={false}
          />
          <Line
            points={[snapPoint.x, snapPoint.y - 10, snapPoint.x, snapPoint.y + 10]}
            stroke={snapPoint.type === 'grid' ? '#3b82f6' : '#10b981'}
            strokeWidth={1}
            opacity={0.7}
            listening={false}
          />
        </>
      )}
      
      {/* Grid highlight lines */}
      {showGridLines && snapPoint?.type === 'grid' && (
        <>
          {/* Vertical grid line */}
          <Line
            points={[snapPoint.x, 0, snapPoint.x, canvasHeight]}
            stroke="#3b82f6"
            strokeWidth={1}
            opacity={0.3}
            dash={[5, 5]}
            listening={false}
          />
          
          {/* Horizontal grid line */}
          <Line
            points={[0, snapPoint.y, canvasWidth, snapPoint.y]}
            stroke="#3b82f6"
            strokeWidth={1}
            opacity={0.3}
            dash={[5, 5]}
            listening={false}
          />
        </>
      )}
    </>
  );
}