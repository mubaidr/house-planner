'use client';

import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import { Material } from '@/types/materials/Material';

interface MaterialRendererProps {
  material: Material;
  shape: 'rect' | 'line' | 'polygon';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: number[];
  rotation?: number;
  strokeWidth?: number;
  listening?: boolean;
  onClick?: () => void;
  onTap?: () => void;
}

export default function MaterialRenderer({
  material,
  shape,
  x,
  y,
  width,
  height,
  points,
  rotation = 0,
  strokeWidth = 1,
  listening = true,
  onClick,
  onTap,
}: MaterialRendererProps) {
  const getPatternImage = () => {
    if (!material.texture) return null;

    const image = new Image();
    image.src = material.texture;
    return image;
  };

  const getFillPatternProps = () => {
    if (!material.texture) {
      return {
        fill: material.color,
        opacity: material.properties.opacity,
      };
    }

    const patternImage = getPatternImage();
    if (!patternImage) {
      return {
        fill: material.color,
        opacity: material.properties.opacity,
      };
    }

    return {
      fillPatternImage: patternImage,
      fillPatternScale: {
        x: material.properties.patternScale || 1,
        y: material.properties.patternScale || 1,
      },
      fillPatternRotation: material.properties.patternRotation || 0,
      fillPatternRepeat: 'repeat',
      opacity: material.properties.opacity,
    };
  };

  const getStrokeProps = () => {
    return {
      stroke: material.color,
      strokeWidth,
      opacity: material.properties.opacity,
    };
  };

  const commonProps = {
    x,
    y,
    rotation,
    listening,
    onClick,
    onTap,
  };

  if (shape === 'rect' && width && height) {
    return (
      <Group>
        <Rect
          {...commonProps}
          width={width}
          height={height}
          {...getFillPatternProps()}
        />

        {/* Metallic overlay effect */}
        {material.properties.metallic > 0.5 && (
          <Rect
            {...commonProps}
            width={width}
            height={height}
            fill="linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)"
            opacity={material.properties.metallic * 0.3}
            listening={false}
          />
        )}

        {/* Reflectivity effect */}
        {material.properties.reflectivity > 0.5 && (
          <Rect
            {...commonProps}
            width={width}
            height={height}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1}
            opacity={material.properties.reflectivity * 0.5}
            listening={false}
          />
        )}
      </Group>
    );
  }

  if (shape === 'line' && points) {
    return (
      <Group>
        <Line
          {...commonProps}
          points={points}
          {...getStrokeProps()}
        />

        {/* Metallic effect for lines */}
        {material.properties.metallic > 0.5 && (
          <Line
            {...commonProps}
            points={points}
            stroke="rgba(255,255,255,0.8)"
            strokeWidth={strokeWidth * 0.5}
            opacity={material.properties.metallic * 0.4}
            listening={false}
          />
        )}
      </Group>
    );
  }

  if (shape === 'polygon' && points && points.length >= 6) {
    return (
      <Group>
        <Line
          {...commonProps}
          points={points}
          closed
          {...getFillPatternProps()}
        />
        {material.properties?.metallic > 0.5 && (
          <Line
            {...commonProps}
            points={points}
            closed
            fill="linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)"
            opacity={(material.properties?.metallic ?? 0) * 0.3}
            listening={false}
          />
        )}
        {material.properties?.reflectivity > 0.5 && (
          <Line
            {...commonProps}
            points={points}
            closed
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1}
            opacity={(material.properties?.reflectivity ?? 0) * 0.5}
            listening={false}
          />
        )}
      </Group>
    )
  }

  return null;
}
