'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Measurement {
  id: string;
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
  distance: number;
  angle?: number;
  label: string;
  visible: boolean;
}

interface MeasureTool3DProps {
  isActive: boolean;
  onMeasurementComplete?: (measurement: Measurement) => void;
}

export function MeasureTool3D({ isActive, onMeasurementComplete }: MeasureTool3DProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<{
    startPoint: THREE.Vector3 | null;
    endPoint: THREE.Vector3 | null;
  }>({ startPoint: null, endPoint: null });
  const [mousePosition, setMousePosition] = useState<THREE.Vector3 | null>(null);
  const [showGrid] = useState(true);

  // Create measurement line geometry
  const createMeasurementLine = useCallback((start: THREE.Vector3, end: THREE.Vector3) => {
    return [start.x, start.y, start.z, end.x, end.y, end.z];
  }, []);

  // Calculate distance and create measurement
  const createMeasurement = useCallback((start: THREE.Vector3, end: THREE.Vector3): Measurement => {
    const distance = start.distanceTo(end);
    const angle = Math.atan2(end.z - start.z, end.x - start.x) * (180 / Math.PI);

    return {
      id: `measure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startPoint: start.clone(),
      endPoint: end.clone(),
      distance,
      angle,
      label: `${distance.toFixed(2)}m`,
      visible: true,
    };
  }, []);

  // Handle canvas click for measurement
  const handleCanvasClick = useCallback((event: any) => {
    if (!isActive) return;

    event.stopPropagation();

    // Get intersection point
    const point = event.point as THREE.Vector3;

    if (!currentMeasurement.startPoint) {
      // First click - set start point
      setCurrentMeasurement({
        startPoint: point.clone(),
        endPoint: null,
      });
    } else {
      // Second click - complete measurement
      const measurement = createMeasurement(currentMeasurement.startPoint, point);
      setMeasurements(prev => [...prev, measurement]);

      // Reset for next measurement
      setCurrentMeasurement({
        startPoint: null,
        endPoint: null,
      });

      // Callback
      onMeasurementComplete?.(measurement);
    }
  }, [isActive, currentMeasurement.startPoint, createMeasurement, onMeasurementComplete]);

  // Handle mouse move for preview
  const handleMouseMove = useCallback((event: any) => {
    if (!isActive || !currentMeasurement.startPoint) return;

    const point = event.point as THREE.Vector3;
    setMousePosition(point.clone());
  }, [isActive, currentMeasurement.startPoint]);

  // Current measurement line (preview)
  const previewLine = useMemo(() => {
    if (!currentMeasurement.startPoint || !mousePosition) return null;
    return createMeasurementLine(currentMeasurement.startPoint, mousePosition);
  }, [currentMeasurement.startPoint, mousePosition, createMeasurementLine]);  // Preview distance
  const previewDistance = useMemo(() => {
    if (!currentMeasurement.startPoint || !mousePosition) return 0;
    return currentMeasurement.startPoint.distanceTo(mousePosition);
  }, [currentMeasurement.startPoint, mousePosition]);

  // Measurement line component
  const MeasurementLine = ({ measurement }: { measurement: Measurement }) => {
    if (!measurement.visible) return null;

    const points = createMeasurementLine(measurement.startPoint, measurement.endPoint);
    const midPoint = measurement.startPoint.clone().lerp(measurement.endPoint, 0.5);

    return (
      <group>
        {/* Measurement line */}
        <Line
          points={[
            [points[0], points[1], points[2]],
            [points[3], points[4], points[5]]
          ]}
          color="#ff4444"
          lineWidth={3}
        />

        {/* Start point marker */}
        <Sphere
          position={[measurement.startPoint.x, measurement.startPoint.y, measurement.startPoint.z]}
          args={[0.1]}
        >
          <meshBasicMaterial color="#ff4444" />
        </Sphere>

        {/* End point marker */}
        <Sphere
          position={[measurement.endPoint.x, measurement.endPoint.y, measurement.endPoint.z]}
          args={[0.1]}
        >
          <meshBasicMaterial color="#ff4444" />
        </Sphere>

        {/* Distance label */}
        <Text
          position={[midPoint.x, midPoint.y + 0.5, midPoint.z]}
          fontSize={0.3}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {measurement.label}
        </Text>

        {/* Angle label (if available) */}
        {measurement.angle !== undefined && (
          <Text
            position={[midPoint.x, midPoint.y - 0.3, midPoint.z]}
            fontSize={0.2}
            color="#ff8888"
            anchorX="center"
            anchorY="middle"
          >
            {measurement.angle.toFixed(1)}°
          </Text>
        )}
      </group>
    );
  };

  // Preview line component
  const PreviewLine = () => {
    if (!previewLine || !currentMeasurement.startPoint || !mousePosition) return null;

    const midPoint = currentMeasurement.startPoint.clone().lerp(mousePosition, 0.5);

    return (
      <group>
        {/* Preview line */}
        <Line
          points={[
            [previewLine[0], previewLine[1], previewLine[2]],
            [previewLine[3], previewLine[4], previewLine[5]]
          ]}
          color="#44ff44"
          lineWidth={2}
          dashed={true}
          dashSize={0.1}
          gapSize={0.05}
        />

        {/* Start point marker */}
        <Sphere
          position={[currentMeasurement.startPoint.x, currentMeasurement.startPoint.y, currentMeasurement.startPoint.z]}
          args={[0.1]}
        >
          <meshBasicMaterial color="#44ff44" />
        </Sphere>

        {/* Mouse point marker */}
        <Sphere
          position={[mousePosition.x, mousePosition.y, mousePosition.z]}
          args={[0.08]}
        >
          <meshBasicMaterial color="#88ff88" transparent opacity={0.7} />
        </Sphere>

        {/* Preview distance label */}
        <Text
          position={[midPoint.x, midPoint.y + 0.5, midPoint.z]}
          fontSize={0.25}
          color="#44ff44"
          anchorX="center"
          anchorY="middle"
        >
          {previewDistance.toFixed(2)}m
        </Text>
      </group>
    );
  };

  // Click handler plane (invisible)
  const ClickPlane = () => (
    <mesh
      onPointerDown={handleCanvasClick}
      onPointerMove={handleMouseMove}
      visible={false}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );

  return (
    <group>
      {/* Measurement lines */}
      {measurements.map(measurement => (
        <MeasurementLine key={measurement.id} measurement={measurement} />
      ))}

      {/* Preview line */}
      <PreviewLine />

      {/* Click handler */}
      {isActive && <ClickPlane />}

      {/* Measurement grid (optional) */}
      {showGrid && isActive && (
        <gridHelper
          args={[50, 50, '#ff4444', '#ffaaaa']}
          position={[0, 0.01, 0]}
        />
      )}
    </group>
  );
}

// Measurement Panel UI (to be used in the interface)
export interface MeasurementPanelProps {
  measurements: Measurement[];
  onRemoveMeasurement: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onClearAll: () => void;
}

export function MeasurementPanel({
  measurements,
  onRemoveMeasurement,
  onToggleVisibility,
  onClearAll,
}: MeasurementPanelProps) {
  return (
    <div className="measurement-panel bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Measurements</h4>
        <button
          onClick={onClearAll}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {measurements.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-4">
            Click two points to create a measurement
          </div>
        ) : (
          measurements.map((measurement, index) => (
            <div
              key={measurement.id}
              className="flex items-center justify-between bg-gray-50 rounded p-2"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  Measurement {index + 1}
                </div>
                <div className="text-xs text-gray-600">
                  {measurement.distance.toFixed(2)}m
                  {measurement.angle !== undefined && (
                    <span className="ml-2">∠ {measurement.angle.toFixed(1)}°</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onToggleVisibility(measurement.id)}
                  className={`w-6 h-6 text-xs rounded ${
                    measurement.visible
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  👁
                </button>
                <button
                  onClick={() => onRemoveMeasurement(measurement.id)}
                  className="w-6 h-6 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MeasureTool3D;
