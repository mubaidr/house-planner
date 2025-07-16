'use client';

import React from 'react';
import { Line } from 'react-konva';
import { useUIStore } from '@/stores/uiStore';

const Grid = React.memo(function GridComponent() {
  const { gridSize, canvasWidth, canvasHeight, gridVisible = true } = useUIStore();

  if (!gridVisible) return null;

  const lines = [];

  // Vertical lines
  for (let i = 0; i <= canvasWidth; i += gridSize) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i, 0, i, canvasHeight]}
        stroke="#e5e7eb"
        strokeWidth={0.5}
        listening={false}
      />
    );
  }

  // Horizontal lines
  for (let i = 0; i <= canvasHeight; i += gridSize) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i, canvasWidth, i]}
        stroke="#e5e7eb"
        strokeWidth={0.5}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
});

export default Grid;