'use client';

import React from 'react';
import { Group, Line, Text } from 'react-konva';
import { Roof } from '@/types/elements/Roof';

interface RoofComponentProps {
  roof: Roof;
  isSelected?: boolean;
  onSelect?: () => void;
  onDragEnd?: (e: unknown) => void;
}

export default function RoofComponent({ 
  roof, 
  isSelected = false, 
  onSelect, 
  onDragEnd 
}: RoofComponentProps) {
  
  const renderRoofOutline = () => {
    if (roof.points.length < 3) return null;

    // Create the roof outline
    const outlinePoints = roof.points.flatMap(point => [point.x, point.y]);
    
    return (
      <Line
        points={outlinePoints}
        stroke="#654321"
        strokeWidth={3}
        fill={roof.color}
        fillPatternImage={undefined} // Could add roof texture here
        closed
        opacity={0.8}
      />
    );
  };

  const renderRoofStructure = () => {
    if (roof.points.length < 3) return null;

    const elements = [];
    
    // Calculate center point for ridge line
    const centerX = roof.points.reduce((sum, p) => sum + p.x, 0) / roof.points.length;
    const centerY = roof.points.reduce((sum, p) => sum + p.y, 0) / roof.points.length;

    // Draw ridge lines based on roof type
    switch (roof.type) {
      case 'gable':
        // Find the longest edge for the ridge
        let longestEdge = { start: roof.points[0], end: roof.points[1], length: 0 };
        for (let i = 0; i < roof.points.length; i++) {
          const start = roof.points[i];
          const end = roof.points[(i + 1) % roof.points.length];
          const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          if (length > longestEdge.length) {
            longestEdge = { start, end, length };
          }
        }

        // Draw ridge line
        elements.push(
          <Line
            key="ridge"
            points={[longestEdge.start.x, longestEdge.start.y, longestEdge.end.x, longestEdge.end.y]}
            stroke="#8B4513"
            strokeWidth={4}
          />
        );
        break;

      case 'hip':
        // Draw lines from center to each corner
        roof.points.forEach((point, index) => {
          elements.push(
            <Line
              key={`hip-${index}`}
              points={[centerX, centerY, point.x, point.y]}
              stroke="#8B4513"
              strokeWidth={2}
            />
          );
        });
        break;

      case 'shed':
        // Draw a single slope line
        const firstPoint = roof.points[0];
        const lastPoint = roof.points[roof.points.length - 1];
        elements.push(
          <Line
            key="shed-ridge"
            points={[firstPoint.x, firstPoint.y, lastPoint.x, lastPoint.y]}
            stroke="#8B4513"
            strokeWidth={3}
          />
        );
        break;
    }

    return elements;
  };

  const renderOverhang = () => {
    if (roof.overhang <= 0) return null;

    // Create overhang outline (larger than main roof)
    const overhangPoints = roof.points.map(point => {
      const angle = Math.atan2(point.y - (roof.points.reduce((sum, p) => sum + p.y, 0) / roof.points.length), 
                              point.x - (roof.points.reduce((sum, p) => sum + p.x, 0) / roof.points.length));
      return {
        x: point.x + Math.cos(angle) * roof.overhang,
        y: point.y + Math.sin(angle) * roof.overhang
      };
    });

    const overhangOutline = overhangPoints.flatMap(point => [point.x, point.y]);

    return (
      <Line
        points={overhangOutline}
        stroke="#654321"
        strokeWidth={1}
        fill={roof.color}
        opacity={0.3}
        closed
        dash={[5, 5]}
      />
    );
  };

  const getBounds = () => {
    if (roof.points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    
    const xs = roof.points.map(p => p.x);
    const ys = roof.points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  const bounds = getBounds();

  return (
    <Group
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      {/* Selection outline */}
      {isSelected && bounds.width > 0 && (
        <Line
          points={[
            bounds.x - 5, bounds.y - 5,
            bounds.x + bounds.width + 5, bounds.y - 5,
            bounds.x + bounds.width + 5, bounds.y + bounds.height + 5,
            bounds.x - 5, bounds.y + bounds.height + 5
          ]}
          stroke="#007bff"
          strokeWidth={2}
          dash={[5, 5]}
          closed
        />
      )}

      {/* Overhang (drawn first, behind main roof) */}
      {renderOverhang()}

      {/* Main roof outline */}
      {renderRoofOutline()}

      {/* Roof structure lines */}
      {renderRoofStructure()}

      {/* Labels */}
      {bounds.width > 0 && (
        <>
          <Text
            x={bounds.x + bounds.width / 2}
            y={bounds.y + bounds.height / 2 - 10}
            text={`${roof.type} roof`}
            fontSize={12}
            fill="#333"
            align="center"
            offsetX={30}
          />
          <Text
            x={bounds.x + bounds.width / 2}
            y={bounds.y + bounds.height / 2 + 5}
            text={`${roof.pitch}° pitch`}
            fontSize={10}
            fill="#666"
            align="center"
            offsetX={25}
          />
        </>
      )}
    </Group>
  );
}