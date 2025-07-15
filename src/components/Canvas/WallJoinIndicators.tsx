/**
 * Wall Join Indicators Component
 * 
 * Renders visual indicators for wall joins in the 2D canvas
 */

'use client';

import React from 'react';
import { Group, Circle, Line, Arc } from 'react-konva';
import { WallJoint2D, WallJointType } from '@/utils/wallJoining2D';
// import { useDesignStore } from '@/stores/designStore'; // Not used

interface WallJoinIndicatorsProps {
  joints: WallJoint2D[];
  visible?: boolean;
  scale?: number;
  selectedJointId?: string;
  onJointSelect?: (joint: WallJoint2D) => void;
}

export default function WallJoinIndicators({
  joints,
  visible = true,
  scale = 1,
  selectedJointId,
  onJointSelect
}: WallJoinIndicatorsProps) {

  if (!visible || joints.length === 0) {
    return null;
  }

  const handleJointClick = (joint: WallJoint2D) => {
    onJointSelect?.(joint);
  };

  const renderJointIndicator = (joint: WallJoint2D) => {
    const isSelected = selectedJointId === joint.id;
    const baseSize = 0.2 * scale;
    const strokeWidth = 0.02 * scale;

    const commonProps = {
      x: joint.position.x,
      y: joint.position.y,
      stroke: isSelected ? '#3b82f6' : getJointColor(joint.type),
      strokeWidth,
      fill: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.8)',
      onClick: () => handleJointClick(joint),
      onTap: () => handleJointClick(joint),
    };

    switch (joint.type) {
      case 'corner':
        return (
          <Group key={joint.id}>
            {/* Corner indicator - small square */}
            <Circle
              {...commonProps}
              radius={baseSize * 0.6}
            />
            {/* Corner angle indicator */}
            <Arc
              x={joint.position.x}
              y={joint.position.y}
              innerRadius={baseSize * 0.8}
              outerRadius={baseSize * 1.0}
              angle={90}
              rotation={joint.angle - 45}
              stroke={commonProps.stroke}
              strokeWidth={strokeWidth * 0.5}
              listening={false}
            />
          </Group>
        );

      case 'tee':
        return (
          <Group key={joint.id}>
            {/* T-junction indicator */}
            <Circle
              {...commonProps}
              radius={baseSize * 0.8}
            />
            {/* T-shape indicator */}
            <Line
              points={[
                joint.position.x - baseSize * 0.5, joint.position.y,
                joint.position.x + baseSize * 0.5, joint.position.y
              ]}
              stroke={commonProps.stroke}
              strokeWidth={strokeWidth}
              listening={false}
            />
            <Line
              points={[
                joint.position.x, joint.position.y - baseSize * 0.5,
                joint.position.x, joint.position.y
              ]}
              stroke={commonProps.stroke}
              strokeWidth={strokeWidth}
              listening={false}
            />
          </Group>
        );

      case 'cross':
        return (
          <Group key={joint.id}>
            {/* Cross junction indicator */}
            <Circle
              {...commonProps}
              radius={baseSize}
            />
            {/* Cross shape indicator */}
            <Line
              points={[
                joint.position.x - baseSize * 0.6, joint.position.y,
                joint.position.x + baseSize * 0.6, joint.position.y
              ]}
              stroke={commonProps.stroke}
              strokeWidth={strokeWidth}
              listening={false}
            />
            <Line
              points={[
                joint.position.x, joint.position.y - baseSize * 0.6,
                joint.position.x, joint.position.y + baseSize * 0.6
              ]}
              stroke={commonProps.stroke}
              strokeWidth={strokeWidth}
              listening={false}
            />
          </Group>
        );

      case 'acute':
      case 'obtuse':
        return (
          <Group key={joint.id}>
            {/* Angle indicator */}
            <Circle
              {...commonProps}
              radius={baseSize * 0.7}
            />
            {/* Angle arc */}
            <Arc
              x={joint.position.x}
              y={joint.position.y}
              innerRadius={baseSize * 0.9}
              outerRadius={baseSize * 1.1}
              angle={joint.angle}
              rotation={-joint.angle / 2}
              stroke={commonProps.stroke}
              strokeWidth={strokeWidth * 0.5}
              listening={false}
            />
          </Group>
        );

      case 'butt':
        return (
          <Group key={joint.id}>
            {/* Butt joint indicator - small rectangle */}
            <Line
              points={[
                joint.position.x - baseSize * 0.3, joint.position.y - baseSize * 0.1,
                joint.position.x + baseSize * 0.3, joint.position.y - baseSize * 0.1,
                joint.position.x + baseSize * 0.3, joint.position.y + baseSize * 0.1,
                joint.position.x - baseSize * 0.3, joint.position.y + baseSize * 0.1
              ]}
              closed
              {...commonProps}
            />
          </Group>
        );

      case 'overlap':
        return (
          <Group key={joint.id}>
            {/* Overlap indicator - overlapping circles */}
            <Circle
              x={joint.position.x - baseSize * 0.2}
              y={joint.position.y}
              radius={baseSize * 0.5}
              stroke={commonProps.stroke}
              strokeWidth={strokeWidth}
              fill="rgba(255, 165, 0, 0.3)"
              onClick={() => handleJointClick(joint)}
              onTap={() => handleJointClick(joint)}
            />
            <Circle
              x={joint.position.x + baseSize * 0.2}
              y={joint.position.y}
              radius={baseSize * 0.5}
              stroke={commonProps.stroke}
              strokeWidth={strokeWidth}
              fill="rgba(255, 165, 0, 0.3)"
              listening={false}
            />
          </Group>
        );

      default:
        return (
          <Circle
            key={joint.id}
            {...commonProps}
            radius={baseSize * 0.5}
          />
        );
    }
  };

  return (
    <Group>
      {joints.map(joint => renderJointIndicator(joint))}
    </Group>
  );
}

/**
 * Get color for joint type
 */
function getJointColor(type: WallJointType): string {
  switch (type) {
    case 'corner': return '#10b981'; // Green
    case 'tee': return '#3b82f6';    // Blue
    case 'cross': return '#8b5cf6';  // Purple
    case 'acute': return '#f59e0b';  // Amber
    case 'obtuse': return '#ef4444'; // Red
    case 'butt': return '#6b7280';   // Gray
    case 'overlap': return '#f97316'; // Orange
    default: return '#6b7280';       // Gray
  }
}

/**
 * Get joint type display name
 */
export function getJointTypeName(type: WallJointType): string {
  switch (type) {
    case 'corner': return 'Corner Joint';
    case 'tee': return 'T-Junction';
    case 'cross': return 'Cross Junction';
    case 'acute': return 'Acute Angle';
    case 'obtuse': return 'Obtuse Angle';
    case 'butt': return 'Butt Joint';
    case 'overlap': return 'Overlap';
    default: return 'Unknown Joint';
  }
}