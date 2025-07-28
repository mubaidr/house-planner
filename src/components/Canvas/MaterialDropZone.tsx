'use client';

import React, { useCallback } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { useMaterialApplication } from '@/hooks/useMaterialApplication';
import { useDesignStore } from '@/stores/designStore';
import { useMaterialStore } from '@/stores/materialStore';
import { KonvaDragEvent } from '@/types/konva';

interface MaterialDropZoneProps {
  elementId: string;
  elementType: 'wall' | 'door' | 'window' | 'room';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  isVisible: boolean;
}

export default function MaterialDropZone({
  elementId,
  elementType,
  x,
  y,
  width,
  height,
  rotation = 0,
  isVisible,
}: MaterialDropZoneProps) {
  const { applyMaterialToElement } = useMaterialApplication();
  const { selectedElementId, selectedElementType } = useDesignStore();
  const { getMaterialById } = useMaterialStore();

  const isSelected = selectedElementId === elementId && selectedElementType === elementType;

  const handleDragOver = useCallback((e: KonvaDragEvent) => {
    e.evt?.preventDefault();
    e.currentTarget.opacity(0.5);
  }, []);

  const handleDragLeave = useCallback((e: KonvaDragEvent) => {
    e.currentTarget.opacity(0);
  }, []);

  const handleDrop = useCallback((e: KonvaDragEvent) => {
    e.evt?.preventDefault();
    e.currentTarget.opacity(0);

    try {
      // In a real implementation, we would get the drag data from the browser event
      // For now, we'll use a simulated approach
      const dragData = (window as unknown as { currentDragData?: { type: string; materialId: string } }).currentDragData;

      if (dragData && dragData.type === 'material') {
        const material = getMaterialById(dragData.materialId);
        if (material) {
          applyMaterialToElement(elementId, elementType, dragData.materialId);
        }
      }
    } catch (error) {
      console.error('Error applying material:', error);
    }
  }, [elementId, elementType, applyMaterialToElement, getMaterialById]);

  if (!isVisible && !isSelected) return null;

  return (
    <Group>
      {/* Drop zone overlay */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        fill="rgba(59, 130, 246, 0.1)"
        stroke="rgba(59, 130, 246, 0.5)"
        strokeWidth={2}
        dash={[5, 5]}
        opacity={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        listening={true}
      />

      {/* Drop hint text */}
      {isSelected && (
        <Text
          x={x + width / 2}
          y={y + height / 2}
          text="Drop material here"
          fontSize={10}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={50}
          width={100}
          opacity={0.7}
          listening={false}
        />
      )}
    </Group>
  );
}
