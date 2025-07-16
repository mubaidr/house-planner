'use client';

import React from 'react';
import { Line, Circle, Text, Group } from 'react-konva';
import { Measurement, MeasurementPoint } from '@/hooks/useMeasureTool';
import useUnitStore from '@/stores/unitStore';

interface MeasurementDisplayProps {
  measurements: Measurement[];
  currentMeasurement?: {
    startPoint: MeasurementPoint;
    currentPoint: MeasurementPoint;
    distance: string;
  } | null;
  showAll: boolean;
  onRemoveMeasurement?: (id: string) => void;
}

interface MeasurementLineProps {
  measurement: Measurement;
  isTemporary?: boolean;
  onRemove?: () => void;
}

function MeasurementLine({ measurement, isTemporary = false, onRemove }: MeasurementLineProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { convertValue, getUnitSymbol } = useUnitStore();
  // These are used in the JSX below, so no need to declare them as unused.
  // These are used in the JSX below, so no need to declare them as unused.
  const { startPoint, endPoint, distance } = measurement;
  const color = isTemporary ? '#3b82f6' : '#ef4444';
  const opacity = isTemporary ? 0.8 : 1;

  const convertedDistance = convertValue(distance);
  const unitSymbol = getUnitSymbol();
  const label = `${convertedDistance.toFixed(2)} ${unitSymbol}`;

  // Calculate midpoint for label
  const midX = (startPoint.x + endPoint.x) / 2;
  const midY = (startPoint.y + endPoint.y) / 2;

  // Calculate angle for label rotation
  const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);

  // Adjust label position to avoid overlapping with line
  const labelOffset = 20;
  const labelX = midX + Math.sin(angle) * labelOffset;
  const labelY = midY - Math.cos(angle) * labelOffset;

  return (
    <Group>
      {/* Main measurement line */}
      <Line
        points={[startPoint.x, startPoint.y, endPoint.x, endPoint.y]}
        stroke={color}
        strokeWidth={2}
        opacity={opacity}
        dash={isTemporary ? [5, 5] : undefined}
        listening={false}
      />

      {/* Start point indicator */}
      <Circle
        x={startPoint.x}
        y={startPoint.y}
        radius={4}
        fill={color}
        stroke="white"
        strokeWidth={1}
        opacity={opacity}
        listening={false}
      />

      {/* End point indicator */}
      <Circle
        x={endPoint.x}
        y={endPoint.y}
        radius={4}
        fill={color}
        stroke="white"
        strokeWidth={1}
        opacity={opacity}
        listening={false}
      />

      {/* Extension lines for better visibility */}
      <Line
        points={[
          startPoint.x - Math.sin(angle) * 10,
          startPoint.y + Math.cos(angle) * 10,
          startPoint.x + Math.sin(angle) * 10,
          startPoint.y - Math.cos(angle) * 10,
        ]}
        stroke={color}
        strokeWidth={1}
        opacity={opacity * 0.7}
        listening={false}
      />
      <Line
        points={[
          endPoint.x - Math.sin(angle) * 10,
          endPoint.y + Math.cos(angle) * 10,
          endPoint.x + Math.sin(angle) * 10,
          endPoint.y - Math.cos(angle) * 10,
        ]}
        stroke={color}
        strokeWidth={1}
        opacity={opacity * 0.7}
        listening={false}
      />

      {/* Distance label background */}
      <Text
        x={labelX - 40}
        y={labelY - 8}
        width={80}
        height={16}
        text=""
        fill="white"
        stroke={color}
        strokeWidth={1}
        cornerRadius={4}
        opacity={opacity * 0.9}
        listening={false}
      />

      {/* Distance label */}
      <Text
        x={labelX - 40}
        y={labelY - 6}
        width={80}
        height={12}
        text={label}
        fontSize={10}
        fontFamily="Arial"
        fill={color}
        align="center"
        verticalAlign="middle"
        opacity={opacity}
        listening={!isTemporary}
        onClick={onRemove}
        onTap={onRemove}
      />

      {/* Remove button for permanent measurements */}
      {!isTemporary && onRemove && (
        <Group>
          <Circle
            x={labelX + 35}
            y={labelY}
            radius={8}
            fill="#ef4444"
            stroke="white"
            strokeWidth={1}
            opacity={0.8}
            onClick={onRemove}
            onTap={onRemove}
          />
          <Text
            x={labelX + 30}
            y={labelY - 4}
            width={10}
            height={8}
            text="×"
            fontSize={12}
            fontFamily="Arial"
            fill="white"
            align="center"
            onClick={onRemove}
            onTap={onRemove}
          />
        </Group>
      )}
    </Group>
  );
}

export default function MeasurementDisplay({
  measurements,
  currentMeasurement,
  showAll,
  onRemoveMeasurement,
}: MeasurementDisplayProps) {
  return (
    <>
      {/* Show existing measurements */}
      {showAll &&
        measurements.map((measurement) => (
          <MeasurementLine
            key={measurement.id}
            measurement={measurement}
            onRemove={() => onRemoveMeasurement?.(measurement.id)}
          />
        ))}

      {/* Show current measurement being drawn */}
      {currentMeasurement && (
        <MeasurementLine
          measurement={{
            id: 'current',
            startPoint: currentMeasurement.startPoint,
            endPoint: currentMeasurement.currentPoint,
            distance: 0, // Not used for display
            angle: 0, // Not used for display
            label: currentMeasurement.distance,
            timestamp: Date.now(),
          }}
          isTemporary={true}
        />
      )}
    </>
  );
}