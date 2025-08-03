'use client';

import React, { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';

interface LightingPanelProps {
  className?: string;
  expanded?: boolean;
}

export function LightingPanel({ className = '', expanded = false }: LightingPanelProps) {
  const { scene3D, updateScene3D } = useDesignStore();
  const [isExpanded, setIsExpanded] = useState(expanded);

  // Lighting presets for different scenarios
  const lightingPresets = [
    {
      name: 'Natural Day',
      icon: '☀️',
      description: 'Bright natural daylight',
      config: {
        ambientIntensity: 0.6,
        directionalIntensity: 1.0,
        directionalPosition: [10, 20, 10] as [number, number, number],
        shadows: true,
        shadowIntensity: 0.5,
        background: 'skybox' as const,
      },
    },
    {
      name: 'Golden Hour',
      icon: '🌅',
      description: 'Warm golden hour lighting',
      config: {
        ambientIntensity: 0.4,
        directionalIntensity: 0.8,
        directionalPosition: [20, 10, 15] as [number, number, number],
        shadows: true,
        shadowIntensity: 0.3,
        background: 'gradient' as const,
      },
    },
    {
      name: 'Overcast',
      icon: '☁️',
      description: 'Soft overcast lighting',
      config: {
        ambientIntensity: 0.8,
        directionalIntensity: 0.3,
        directionalPosition: [0, 20, 0] as [number, number, number],
        shadows: false,
        shadowIntensity: 0.1,
        background: 'gradient' as const,
      },
    },
    {
      name: 'Interior',
      icon: '💡',
      description: 'Artificial interior lighting',
      config: {
        ambientIntensity: 0.5,
        directionalIntensity: 0.6,
        directionalPosition: [5, 15, 5] as [number, number, number],
        shadows: true,
        shadowIntensity: 0.4,
        background: 'transparent' as const,
      },
    },
    {
      name: 'Evening',
      icon: '🌆',
      description: 'Dramatic evening lighting',
      config: {
        ambientIntensity: 0.2,
        directionalIntensity: 0.4,
        directionalPosition: [-10, 5, 10] as [number, number, number],
        shadows: true,
        shadowIntensity: 0.8,
        background: 'gradient' as const,
      },
    },
    {
      name: 'Technical',
      icon: '🔬',
      description: 'Uniform technical lighting',
      config: {
        ambientIntensity: 0.9,
        directionalIntensity: 0.2,
        directionalPosition: [0, 30, 0] as [number, number, number],
        shadows: false,
        shadowIntensity: 0.1,
        background: 'transparent' as const,
      },
    },
  ];

  const handlePresetSelect = useCallback(
    (preset: (typeof lightingPresets)[0]) => {
      updateScene3D({
        lighting: {
          ...scene3D.lighting,
          ambientIntensity: preset.config.ambientIntensity,
          directionalIntensity: preset.config.directionalIntensity,
          directionalPosition: preset.config.directionalPosition,
          shadows: preset.config.shadows,
          shadowIntensity: preset.config.shadowIntensity,
        },
        environment: {
          ...scene3D.environment,
          background: preset.config.background,
        },
      });
    },
    [updateScene3D, scene3D]
  );

  const handleAmbientChange = useCallback(
    (value: number) => {
      updateScene3D({
        lighting: {
          ...scene3D.lighting,
          ambientIntensity: value,
        },
      });
    },
    [updateScene3D, scene3D.lighting]
  );

  const handleDirectionalIntensityChange = useCallback(
    (value: number) => {
      updateScene3D({
        lighting: {
          ...scene3D.lighting,
          directionalIntensity: value,
        },
      });
    },
    [updateScene3D, scene3D.lighting]
  );

  const handleDirectionalPositionChange = useCallback(
    (index: number, value: number) => {
      const newPosition = [...scene3D.lighting.directionalPosition] as [number, number, number];
      newPosition[index] = value;
      updateScene3D({
        lighting: {
          ...scene3D.lighting,
          directionalPosition: newPosition,
        },
      });
    },
    [updateScene3D, scene3D.lighting]
  );

  const handleShadowToggle = useCallback(() => {
    updateScene3D({
      lighting: {
        ...scene3D.lighting,
        shadows: !scene3D.lighting.shadows,
      },
    });
  }, [updateScene3D, scene3D.lighting]);

  const handleShadowIntensityChange = useCallback(
    (value: number) => {
      updateScene3D({
        lighting: {
          ...scene3D.lighting,
          shadowIntensity: value,
        },
      });
    },
    [updateScene3D, scene3D.lighting]
  );

  return (
    <div className={`lighting-panel card ${className}`}>
      <div className="panel-header">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            💡 Lighting & Environment
          </h4>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className="panel-content p-3 space-y-4">
          {/* Lighting Presets */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Quick Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {lightingPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className="preset-button-compact"
                  title={preset.description}
                >
                  <span className="preset-icon">{preset.icon}</span>
                  <span className="preset-name">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ambient Light Controls */}
          <div className="space-y-3">
            <h5 className="text-xs font-medium text-gray-600">Ambient Light</h5>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Intensity: {scene3D.lighting.ambientIntensity.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={scene3D.lighting.ambientIntensity}
                onChange={(e) => handleAmbientChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Directional Light Controls */}
          <div className="space-y-3">
            <h5 className="text-xs font-medium text-gray-600">Directional Light (Sun)</h5>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Intensity: {scene3D.lighting.directionalIntensity.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={scene3D.lighting.directionalIntensity}
                onChange={(e) => handleDirectionalIntensityChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">X Position</label>
                <input
                  type="number"
                  value={scene3D.lighting.directionalPosition[0]}
                  onChange={(e) => handleDirectionalPositionChange(0, parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Y Position</label>
                <input
                  type="number"
                  value={scene3D.lighting.directionalPosition[1]}
                  onChange={(e) => handleDirectionalPositionChange(1, parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Z Position</label>
                <input
                  type="number"
                  value={scene3D.lighting.directionalPosition[2]}
                  onChange={(e) => handleDirectionalPositionChange(2, parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                />
              </div>
            </div>
          </div>

          {/* Shadow Controls */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={scene3D.lighting.shadows}
                onChange={handleShadowToggle}
                className="rounded"
              />
              <span className="text-xs text-gray-600">Enable Shadows</span>
            </label>

            {scene3D.lighting.shadows && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Shadow Intensity: {scene3D.lighting.shadowIntensity.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={scene3D.lighting.shadowIntensity}
                  onChange={(e) => handleShadowIntensityChange(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Environment Settings */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Background</label>
            <select
              value={scene3D.environment.background}
              onChange={(e) => updateScene3D({
                environment: {
                  ...scene3D.environment,
                  background: e.target.value as 'transparent' | 'gradient' | 'skybox',
                },
              })}
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
            >
              <option value="transparent">Transparent</option>
              <option value="gradient">Gradient</option>
              <option value="skybox">Skybox</option>
            </select>
          </div>

          {/* Grid and Ground Plane */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={scene3D.environment.gridHelper}
                onChange={(e) => updateScene3D({
                  environment: {
                    ...scene3D.environment,
                    gridHelper: e.target.checked,
                  },
                })}
                className="rounded"
              />
              <span className="text-xs text-gray-600">Show Grid</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={scene3D.environment.groundPlane}
                onChange={(e) => updateScene3D({
                  environment: {
                    ...scene3D.environment,
                    groundPlane: e.target.checked,
                  },
                })}
                className="rounded"
              />
              <span className="text-xs text-gray-600">Show Ground Plane</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default LightingPanel;
