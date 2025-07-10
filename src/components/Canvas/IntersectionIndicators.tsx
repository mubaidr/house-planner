'use client';

import React from 'react';
import { Circle, Line } from 'react-konva';
import { useDesignStore } from '@/stores/designStore';
import { findIntersectingWalls } from '@/utils/wallIntersection';

export default function IntersectionIndicators() {
  const { walls } = useDesignStore();

  // Find all intersection points
  const intersectionPoints: { x: number; y: number }[] = [];
  
  for (let i = 0; i < walls.length; i++) {
    const intersections = findIntersectingWalls(walls[i], walls);
    intersections.forEach(({ intersection }) => {
      if (intersection.point) {
        // Check if this intersection point already exists
        const exists = intersectionPoints.some(point => 
          Math.abs(point.x - intersection.point!.x) < 1 && 
          Math.abs(point.y - intersection.point!.y) < 1
        );
        if (!exists) {
          intersectionPoints.push(intersection.point);
        }
      }
    });
  }

  return (
    <>
      {intersectionPoints.map((point, index) => (
        <React.Fragment key={`intersection-${index}`}>
          {/* Intersection point indicator */}
          <Circle
            x={point.x}
            y={point.y}
            radius={6}
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth={2}
            opacity={0.8}
            listening={false}
          />
          
          {/* Cross indicator for better visibility */}
          <Line
            points={[point.x - 4, point.y, point.x + 4, point.y]}
            stroke="#ffffff"
            strokeWidth={2}
            listening={false}
          />
          <Line
            points={[point.x, point.y - 4, point.x, point.y + 4]}
            stroke="#ffffff"
            strokeWidth={2}
            listening={false}
          />
        </React.Fragment>
      ))}
    </>
  );
}