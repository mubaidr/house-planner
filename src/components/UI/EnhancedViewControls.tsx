'use client';

import { useDesignStore } from '@/stores/designStore';
import { ViewMode, CameraPreset } from '@/types';
import { useState } from 'react';

export function EnhancedViewControls() {
  const { viewMode, setViewMode, setCameraPreset, scene3D, updateScene3D } = useDesignStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showInfoHUD, setShowInfoHUD] = useState(true);

  const viewModes: { value: ViewMode; label: string; icon: string; description: string }[] = [
    { value: '2d', label: '2D', icon: '📐', description: 'Top-down blueprint view' },
    { value: '3d', label: '3D', icon: '🏠', description: 'Interactive 3D view' },
    { value: 'hybrid', label: 'Split', icon: '⚡', description: '2D + 3D side by side' },
  ];

  const cameraPresets: { value: CameraPreset; label: string; icon: string }[] = [
    { value: 'perspective', label: 'Perspective', icon: '👁️' },
    { value: 'isometric', label: 'Isometric', icon: '📦' },
    { value: 'top', label: 'Top', icon: '⬆️' },
    { value: 'front', label: 'Front', icon: '➡️' },
    { value: 'back', label: 'Back', icon: '⬅️' },
    { value: 'left', label: 'Left', icon: '⬇️' },
    { value: 'right', label: 'Right', icon: '⬆️' },
  ];

  const qualityOptions = [
    { value: 'low', label: 'Low', description: 'Fast rendering' },
    { value: 'medium', label: 'Medium', description: 'Balanced' },
    { value: 'high', label: 'High', description: 'Best quality' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
        <h3 className="text-white font-semibold flex items-center">
          <span className="mr-2">🎮</span>
          View Controls
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Info HUD Toggle */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-700 flex items-center">
            <span className="mr-2">ℹ️</span>
            Info HUD
          </span>
          <input
            type="checkbox"
            checked={showInfoHUD}
            onChange={e => {
              setShowInfoHUD(e.target.checked);
              // Set global state for Info HUD in Scene3D if needed
              if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('toggleInfoHUD', { detail: e.target.checked }));
              }
            }}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
        {/* View Mode Selection */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            View Mode
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {viewModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value)}
                className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                  viewMode === mode.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-25'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{mode.icon}</span>
                  <div>
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-xs text-gray-500">{mode.description}</div>
                  </div>
                  {viewMode === mode.value && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Camera Controls (3D only) */}
        {viewMode === '3d' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Camera Presets
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {cameraPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setCameraPreset(preset.value)}
                  className="p-2 text-xs rounded-lg bg-gray-50 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all duration-150 flex items-center space-x-2"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render Quality */}
        {viewMode === '3d' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Render Quality
            </h4>
            <div className="flex space-x-2">
              {qualityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateScene3D({
                    renderSettings: {
                      ...scene3D.renderSettings,
                      quality: option.value as 'low' | 'medium' | 'high'
                    }
                  })}
                  className={`flex-1 p-2 text-xs rounded-lg transition-all duration-150 ${
                    scene3D.renderSettings.quality === option.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  <div>{option.label}</div>
                  <div className="text-xs opacity-75">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Settings Toggle */}
        {viewMode === '3d' && (
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-2 text-sm text-gray-600 hover:text-gray-800 flex items-center justify-between"
            >
              <span>Advanced Settings</span>
              <span className={`transform transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                {/* Rendering Options */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Rendering</h5>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="mr-2">🌫️</span>
                      Shadows
                    </span>
                    <input
                      type="checkbox"
                      checked={scene3D.renderSettings.shadows}
                      onChange={(e) => updateScene3D({
                        renderSettings: {
                          ...scene3D.renderSettings,
                          shadows: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="mr-2">🔧</span>
                      Wireframe
                    </span>
                    <input
                      type="checkbox"
                      checked={scene3D.renderSettings.wireframe}
                      onChange={(e) => updateScene3D({
                        renderSettings: {
                          ...scene3D.renderSettings,
                          wireframe: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="mr-2">🎨</span>
                      Post Processing
                    </span>
                    <input
                      type="checkbox"
                      checked={scene3D.renderSettings.postProcessing}
                      onChange={(e) => updateScene3D({
                        renderSettings: {
                          ...scene3D.renderSettings,
                          postProcessing: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>

                {/* Environment Options */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Environment</h5>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="mr-2">📏</span>
                      Grid Helper
                    </span>
                    <input
                      type="checkbox"
                      checked={scene3D.environment.gridHelper}
                      onChange={(e) => updateScene3D({
                        environment: {
                          ...scene3D.environment,
                          gridHelper: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <span className="mr-2">🏠</span>
                      Ground Plane
                    </span>
                    <input
                      type="checkbox"
                      checked={scene3D.environment.groundPlane}
                      onChange={(e) => updateScene3D({
                        environment: {
                          ...scene3D.environment,
                          groundPlane: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedViewControls;
