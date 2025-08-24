import {
  interpolateLightingByTime,
  lightingPresets,
} from '@/components/Canvas3D/Lighting/LightingPresets';
import { EnvironmentPreset, LightingConfig } from '@/types/materials3D';
import { useEffect, useState } from 'react';

interface LightingPanelProps {
  config: LightingConfig;
  onChange: (config: LightingConfig) => void;
}

export function LightingPanel({ config, onChange }: LightingPanelProps) {
  const [isTimeAnimated, setIsTimeAnimated] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Time animation effect
  useEffect(() => {
    if (!isTimeAnimated) return;

    const interval = setInterval(() => {
      const newHour = (config.timeOfDay.hour + animationSpeed * 0.1) % 24;
      const newConfig = interpolateLightingByTime(newHour);
      onChange({
        ...newConfig,
        timeOfDay: {
          ...newConfig.timeOfDay,
          hour: newHour,
        },
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isTimeAnimated, animationSpeed, config.timeOfDay.hour, onChange]);

  const handlePresetChange = (preset: EnvironmentPreset) => {
    onChange(lightingPresets[preset]);
  };

  const handlePropertyChange = <T extends keyof LightingConfig>(
    section: T,
    property: string,
    value: LightingConfig[T] extends Record<string, infer U> ? U : never
  ) => {
    onChange({
      ...config,
      [section]: {
        ...config[section],
        [property]: value,
      },
    });
  };

  const presetOptions: EnvironmentPreset[] = [
    'sunset',
    'dawn',
    'noon',
    'night',
    'overcast',
    'studio',
    'warehouse',
    'apartment',
    'forest',
    'city',
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Lighting & Environment</h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Auto Time:</label>
          <input
            type="checkbox"
            checked={isTimeAnimated}
            onChange={e => setIsTimeAnimated(e.target.checked)}
            className="rounded"
          />
        </div>
      </div>

      {/* Environment Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Environment Preset</label>
        <div className="grid grid-cols-3 gap-2">
          {presetOptions.map(preset => (
            <button
              key={preset}
              onClick={() => handlePresetChange(preset)}
              className={`px-3 py-2 text-xs rounded capitalize transition ${
                config.environment.preset === preset
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Time of Day */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Time of Day: {Math.floor(config.timeOfDay.hour)}:00
        </label>
        <input
          type="range"
          min="0"
          max="23"
          step="0.1"
          value={config.timeOfDay.hour}
          onChange={e => handlePropertyChange('timeOfDay', 'hour', parseFloat(e.target.value))}
          className="w-full"
          disabled={isTimeAnimated}
        />
        {isTimeAnimated && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Animation Speed: {animationSpeed}x
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={animationSpeed}
              onChange={e => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Ambient Light */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">Ambient Light</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Intensity: {config.ambient.intensity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={config.ambient.intensity}
              onChange={e =>
                handlePropertyChange('ambient', 'intensity', parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
            <input
              type="color"
              value={config.ambient.color}
              onChange={e => handlePropertyChange('ambient', 'color', e.target.value)}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Directional Light */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">Directional Light (Sun)</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Intensity: {config.directional.intensity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.01"
              value={config.directional.intensity}
              onChange={e =>
                handlePropertyChange('directional', 'intensity', parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
            <input
              type="color"
              value={config.directional.color}
              onChange={e => handlePropertyChange('directional', 'color', e.target.value)}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">X Position</label>
              <input
                type="number"
                min="-50"
                max="50"
                step="1"
                value={config.directional.position[0]}
                onChange={e =>
                  handlePropertyChange('directional', 'position', [
                    parseFloat(e.target.value),
                    config.directional.position[1],
                    config.directional.position[2],
                  ])
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Y Position</label>
              <input
                type="number"
                min="1"
                max="50"
                step="1"
                value={config.directional.position[1]}
                onChange={e =>
                  handlePropertyChange('directional', 'position', [
                    config.directional.position[0],
                    parseFloat(e.target.value),
                    config.directional.position[2],
                  ])
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Z Position</label>
              <input
                type="number"
                min="-50"
                max="50"
                step="1"
                value={config.directional.position[2]}
                onChange={e =>
                  handlePropertyChange('directional', 'position', [
                    config.directional.position[0],
                    config.directional.position[1],
                    parseFloat(e.target.value),
                  ])
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.directional.shadows}
                onChange={e => handlePropertyChange('directional', 'shadows', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Enable Shadows</span>
            </label>
            {config.directional.shadows && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Shadow Quality
                </label>
                <select
                  value={config.directional.shadowMapSize}
                  onChange={e =>
                    handlePropertyChange('directional', 'shadowMapSize', parseInt(e.target.value))
                  }
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={512}>Low (512)</option>
                  <option value={1024}>Medium (1024)</option>
                  <option value={2048}>High (2048)</option>
                  <option value={4096}>Ultra (4096)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Environment Settings */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">Environment</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Environment Intensity: {config.environment.intensity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={config.environment.intensity}
              onChange={e =>
                handlePropertyChange('environment', 'intensity', parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.environment.background}
              onChange={e => handlePropertyChange('environment', 'background', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Show Environment Background</span>
          </label>
        </div>
      </div>

      {/* Post Processing */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">Post Processing</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.postProcessing.enabled}
              onChange={e => handlePropertyChange('postProcessing', 'enabled', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Enable Post Processing</span>
          </label>

          {config.postProcessing.enabled && (
            <div className="ml-6 space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.postProcessing.bloom}
                  onChange={e => handlePropertyChange('postProcessing', 'bloom', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Bloom Effect</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.postProcessing.ssao}
                  onChange={e => handlePropertyChange('postProcessing', 'ssao', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">SSAO (Ambient Occlusion)</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Exposure: {config.postProcessing.exposure.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.01"
                  value={config.postProcessing.exposure}
                  onChange={e =>
                    handlePropertyChange('postProcessing', 'exposure', parseFloat(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
