/**
 * Roof-Wall Connection Indicators Component
 * 
 * Renders visual indicators for roof-wall connections in the 2D canvas
 */

'use client';

import React from 'react';
import { Group, Circle, Line, Arc, Rect } from 'react-konva';
import { RoofWallConnection2D, RoofWallConnectionType } from '@/utils/roofWallIntegration2D';

interface RoofWallConnectionIndicatorsProps {
  connections: RoofWallConnection2D[];
  visible?: boolean;
  scale?: number;
  selectedConnectionId?: string;
  onConnectionSelect?: (connection: RoofWallConnection2D) => void;
}

export default function RoofWallConnectionIndicators({
  connections,
  visible = true,
  scale = 1,
  selectedConnectionId,
  onConnectionSelect
}: RoofWallConnectionIndicatorsProps) {

  if (!visible || connections.length === 0) {
    return null;
  }

  const handleConnectionClick = (connection: RoofWallConnection2D) => {
    onConnectionSelect?.(connection);
  };

  const renderConnectionIndicator = (connection: RoofWallConnection2D) => {
    const isSelected = selectedConnectionId === connection.id;
    const baseSize = 0.15 * scale;
    const strokeWidth = 0.015 * scale;

    // Use the first connection point as the primary indicator position
    const position = connection.connectionPoints[0] || { x: 0, y: 0 };

    const commonProps = {
      x: position.x,
      y: position.y,
      stroke: isSelected ? '#3b82f6' : getConnectionColor(connection.connectionType),
      strokeWidth,
      fill: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.8)',
      onClick: () => handleConnectionClick(connection),
      onTap: () => handleConnectionClick(connection),
    };

    switch (connection.connectionType) {
      case 'eave':
        return (
          <Group key={connection.id}>
            {/* Eave indicator - horizontal line with curve */}
            <Line
              points={[
                position.x - baseSize, position.y,
                position.x + baseSize, position.y
              ]}
              {...commonProps}
              strokeWidth={strokeWidth * 2}
            />
            {/* Overhang curve */}
            <Arc
              x={position.x + baseSize}
              y={position.y}
              innerRadius={0}
              outerRadius={baseSize * 0.5}
              angle={90}
              rotation={-45}
              stroke={commonProps.stroke}
              strokeWidth={strokeWidth}
              listening={false}
            />
            {/* Connection point */}
            <Circle
              {...commonProps}
              radius={baseSize * 0.3}
            />
          </Group>
        );

      case 'gable':
        return (
          <Group key={connection.id}>
            {/* Gable indicator - triangle */}
            <Line
              points={[
                position.x - baseSize * 0.7, position.y + baseSize * 0.5,
                position.x, position.y - baseSize * 0.5,
                position.x + baseSize * 0.7, position.y + baseSize * 0.5,
                position.x - baseSize * 0.7, position.y + baseSize * 0.5
              ]}
              closed
              {...commonProps}
            />
          </Group>
        );

      case 'hip':
        return (
          <Group key={connection.id}>
            {/* Hip indicator - diamond */}
            <Line
              points={[
                position.x, position.y - baseSize * 0.6,
                position.x + baseSize * 0.6, position.y,
                position.x, position.y + baseSize * 0.6,
                position.x - baseSize * 0.6, position.y,
                position.x, position.y - baseSize * 0.6
              ]}
              closed
              {...commonProps}
            />
          </Group>
        );

      case 'valley':
        return (
          <Group key={connection.id}>
            {/* Valley indicator - V shape */}
            <Line
              points={[
                position.x - baseSize * 0.6, position.y - baseSize * 0.3,
                position.x, position.y + baseSize * 0.6,
                position.x + baseSize * 0.6, position.y - baseSize * 0.3
              ]}
              {...commonProps}
              strokeWidth={strokeWidth * 2}
            />
            <Circle
              {...commonProps}
              radius={baseSize * 0.2}
            />
          </Group>
        );

      case 'ridge':
        return (
          <Group key={connection.id}>
            {/* Ridge indicator - peaked line */}
            <Line
              points={[
                position.x - baseSize, position.y + baseSize * 0.3,
                position.x - baseSize * 0.3, position.y - baseSize * 0.3,
                position.x + baseSize * 0.3, position.y - baseSize * 0.3,
                position.x + baseSize, position.y + baseSize * 0.3
              ]}
              {...commonProps}
              strokeWidth={strokeWidth * 2}
            />
          </Group>
        );

      case 'overhang':
        return (
          <Group key={connection.id}>
            {/* Overhang indicator - extended line with arrow */}
            <Line
              points={[
                position.x - baseSize * 0.5, position.y,
                position.x + baseSize * 1.2, position.y
              ]}
              {...commonProps}
              strokeWidth={strokeWidth * 1.5}
            />
            {/* Arrow head */}
            <Line
              points={[
                position.x + baseSize * 1.2, position.y,
                position.x + baseSize * 0.9, position.y - baseSize * 0.2,
                position.x + baseSize * 0.9, position.y + baseSize * 0.2,
                position.x + baseSize * 1.2, position.y
              ]}
              closed
              fill={commonProps.stroke}
              stroke={commonProps.stroke}
              strokeWidth={strokeWidth * 0.5}
              listening={false}
            />
            <Circle
              {...commonProps}
              radius={baseSize * 0.25}
            />
          </Group>
        );

      case 'flush':
        return (
          <Group key={connection.id}>
            {/* Flush indicator - simple line */}
            <Line
              points={[
                position.x - baseSize * 0.6, position.y,
                position.x + baseSize * 0.6, position.y
              ]}
              {...commonProps}
              strokeWidth={strokeWidth * 2}
            />
            <Rect
              x={position.x - baseSize * 0.2}
              y={position.y - baseSize * 0.2}
              width={baseSize * 0.4}
              height={baseSize * 0.4}
              stroke={commonProps.stroke}
              strokeWidth={commonProps.strokeWidth}
              fill={commonProps.fill}
              onClick={commonProps.onClick}
              onTap={commonProps.onTap}
            />
          </Group>
        );

      default:
        return (
          <Circle
            key={connection.id}
            {...commonProps}
            radius={baseSize * 0.5}
          />
        );
    }
  };

  const renderConnectionPath = (connection: RoofWallConnection2D) => {
    if (connection.connectionPoints.length < 2) return null;

    const isSelected = selectedConnectionId === connection.id;
    const points: number[] = [];
    
    connection.connectionPoints.forEach(point => {
      points.push(point.x, point.y);
    });

    return (
      <Line
        key={`path-${connection.id}`}
        points={points}
        stroke={isSelected ? '#3b82f6' : getConnectionColor(connection.connectionType)}
        strokeWidth={0.01 * scale}
        dash={[0.05 * scale, 0.03 * scale]}
        opacity={0.6}
        listening={false}
      />
    );
  };

  return (
    <Group>
      {/* Connection paths */}
      {connections.map(connection => renderConnectionPath(connection))}
      
      {/* Connection indicators */}
      {connections.map(connection => renderConnectionIndicator(connection))}
    </Group>
  );
}

/**
 * Get color for connection type
 */
function getConnectionColor(type: RoofWallConnectionType): string {
  switch (type) {
    case 'eave': return '#10b981';     // Green
    case 'gable': return '#3b82f6';    // Blue
    case 'hip': return '#8b5cf6';      // Purple
    case 'valley': return '#06b6d4';   // Cyan
    case 'ridge': return '#f59e0b';    // Amber
    case 'overhang': return '#ef4444'; // Red
    case 'flush': return '#6b7280';    // Gray
    default: return '#6b7280';         // Gray
  }
}

/**
 * Get connection type display name
 */
export function getConnectionTypeName(type: RoofWallConnectionType): string {
  switch (type) {
    case 'eave': return 'Eave Connection';
    case 'gable': return 'Gable End';
    case 'hip': return 'Hip Connection';
    case 'valley': return 'Valley';
    case 'ridge': return 'Ridge Line';
    case 'overhang': return 'Overhang';
    case 'flush': return 'Flush Connection';
    default: return 'Unknown Connection';
  }
}

/**
 * Get connection type description
 */
export function getConnectionTypeDescription(type: RoofWallConnectionType): string {
  switch (type) {
    case 'eave': return 'Roof edge connects to wall top with eave detail';
    case 'gable': return 'Triangular roof end connects to wall';
    case 'hip': return 'Hip roof connects to wall corner';
    case 'valley': return 'Valley between roof sections';
    case 'ridge': return 'Ridge line runs over wall';
    case 'overhang': return 'Roof extends beyond wall with overhang';
    case 'flush': return 'Roof sits flush with wall edge';
    default: return 'Unknown connection type';
  }
}