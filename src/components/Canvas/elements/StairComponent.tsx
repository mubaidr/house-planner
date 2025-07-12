'use client';

import React from 'react';
import { Group, Rect, Line, Text } from 'react-konva';
import { Stair } from '@/types/elements/Stair';

interface StairComponentProps {
  stair: Stair;
  isSelected?: boolean;
  onSelect?: () => void;
  onDragEnd?: (e: unknown) => void;
}

export default function StairComponent({ 
  stair, 
  isSelected = false, 
  onSelect, 
  onDragEnd 
}: StairComponentProps) {
  const stepWidth = stair.orientation === 'horizontal' ? stair.width / stair.steps : stair.width;
  const stepDepth = stair.orientation === 'horizontal' ? stair.stepDepth : stair.length / stair.steps;

  const renderSteps = () => {
    const steps = [];
    
    for (let i = 0; i < stair.steps; i++) {
      const stepX = stair.orientation === 'horizontal' 
        ? stair.x + (i * stepWidth)
        : stair.x;
      const stepY = stair.orientation === 'horizontal' 
        ? stair.y
        : stair.y + (i * stepDepth);
      
      const currentStepWidth = stair.orientation === 'horizontal' ? stepWidth : stair.width;
      const currentStepHeight = stair.orientation === 'horizontal' ? stair.length : stepDepth;

      // Step tread
      steps.push(
        <Rect
          key={`step-${i}`}
          x={stepX}
          y={stepY}
          width={currentStepWidth}
          height={currentStepHeight}
          fill={stair.color}
          stroke="#654321"
          strokeWidth={1}
        />
      );

      // Step riser (vertical part)
      if (i < stair.steps - 1) {
        const riserX = stair.orientation === 'horizontal' 
          ? stepX + stepWidth
          : stepX;
        const riserY = stair.orientation === 'horizontal' 
          ? stepY
          : stepY + stepDepth;
        
        steps.push(
          <Line
            key={`riser-${i}`}
            points={stair.orientation === 'horizontal' 
              ? [riserX, riserY, riserX, riserY + stair.length]
              : [riserX, riserY, riserX + stair.width, riserY]
            }
            stroke="#654321"
            strokeWidth={2}
          />
        );
      }
    }

    return steps;
  };

  const renderHandrails = () => {
    const handrails = [];
    
    if (stair.handrailLeft) {
      const leftRailPoints = stair.orientation === 'horizontal'
        ? [stair.x, stair.y - 10, stair.x + stair.width, stair.y - 10]
        : [stair.x - 10, stair.y, stair.x - 10, stair.y + stair.length];
      
      handrails.push(
        <Line
          key="handrail-left"
          points={leftRailPoints}
          stroke="#8B4513"
          strokeWidth={3}
        />
      );
    }

    if (stair.handrailRight) {
      const rightRailPoints = stair.orientation === 'horizontal'
        ? [stair.x, stair.y + stair.length + 10, stair.x + stair.width, stair.y + stair.length + 10]
        : [stair.x + stair.width + 10, stair.y, stair.x + stair.width + 10, stair.y + stair.length];
      
      handrails.push(
        <Line
          key="handrail-right"
          points={rightRailPoints}
          stroke="#8B4513"
          strokeWidth={3}
        />
      );
    }

    return handrails;
  };

  const renderDirectionArrow = () => {
    const centerX = stair.x + stair.width / 2;
    const centerY = stair.y + stair.length / 2;
    
    const arrowSize = 20;
    const arrowPoints = stair.direction === 'up'
      ? stair.orientation === 'horizontal'
        ? [centerX - arrowSize, centerY, centerX + arrowSize, centerY, centerX, centerY - arrowSize]
        : [centerX, centerY - arrowSize, centerX, centerY + arrowSize, centerX + arrowSize, centerY]
      : stair.orientation === 'horizontal'
        ? [centerX - arrowSize, centerY, centerX + arrowSize, centerY, centerX, centerY + arrowSize]
        : [centerX, centerY - arrowSize, centerX, centerY + arrowSize, centerX - arrowSize, centerY];

    return (
      <Line
        points={arrowPoints}
        stroke="#333"
        strokeWidth={2}
        fill="#333"
        closed
      />
    );
  };

  return (
    <Group
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      {/* Selection outline */}
      {isSelected && (
        <Rect
          x={stair.x - 5}
          y={stair.y - 5}
          width={stair.width + 10}
          height={stair.length + 10}
          stroke="#007bff"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
        />
      )}

      {/* Steps */}
      {renderSteps()}

      {/* Handrails */}
      {renderHandrails()}

      {/* Direction arrow */}
      {renderDirectionArrow()}

      {/* Label */}
      <Text
        x={stair.x + stair.width / 2}
        y={stair.y + stair.length / 2 - 10}
        text={`${stair.steps} steps`}
        fontSize={12}
        fill="#333"
        align="center"
        offsetX={30}
      />

      {/* Type label */}
      <Text
        x={stair.x + stair.width / 2}
        y={stair.y + stair.length / 2 + 5}
        text={stair.type}
        fontSize={10}
        fill="#666"
        align="center"
        offsetX={20}
      />
    </Group>
  );
}