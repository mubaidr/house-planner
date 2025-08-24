import { useLightingStore } from '@/stores/lightingStore';
import { RenderQuality } from '@/types/materials3D';

export function RenderSettings() {
  const {
    renderQuality,
    performanceMode,
    frameRate,
    setRenderQuality,
    setPerformanceMode,
    optimizeForPerformance,
    resetToDefaults,
  } = useLightingStore();

  const handleQualityChange = <T extends keyof RenderQuality>(
    property: T,
    value: RenderQuality[T]
  ) => {
    setRenderQuality({
      ...renderQuality,
      [property]: value,
    });
  };

  const getPerformanceColor = () => {
    if (frameRate >= 50) return 'text-green-600';
    if (frameRate >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Render Settings</h3>
        <div className={`text-sm font-medium ${getPerformanceColor()}`}>
          {frameRate.toFixed(1)} FPS
        </div>
      </div>

      {/* Performance Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Performance Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {(['auto', 'performance', 'quality'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setPerformanceMode(mode)}
              className={`px-3 py-2 text-xs rounded capitalize transition ${
                performanceMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Auto: Adjusts quality based on performance | Performance: Prioritizes FPS | Quality: Best
          visuals
        </p>
      </div>

      {/* Texture Resolution */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Texture Resolution</label>
        <select
          value={renderQuality.textureResolution}
          onChange={e =>
            handleQualityChange(
              'textureResolution',
              e.target.value as RenderQuality['textureResolution']
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={performanceMode !== 'auto'}
        >
          <option value="low">Low (512px)</option>
          <option value="medium">Medium (1024px)</option>
          <option value="high">High (2048px)</option>
          <option value="ultra">Ultra (4096px)</option>
        </select>
      </div>

      {/* Shadow Quality */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Shadow Quality</label>
        <select
          value={renderQuality.shadowQuality}
          onChange={e =>
            handleQualityChange('shadowQuality', e.target.value as RenderQuality['shadowQuality'])
          }
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={performanceMode !== 'auto'}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Render Options */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={renderQuality.antiAliasing}
            onChange={e => handleQualityChange('antiAliasing', e.target.checked)}
            disabled={performanceMode !== 'auto'}
            className="rounded"
          />
          <span className="text-sm text-gray-600">Anti-Aliasing</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={renderQuality.postProcessing}
            onChange={e => handleQualityChange('postProcessing', e.target.checked)}
            disabled={performanceMode !== 'auto'}
            className="rounded"
          />
          <span className="text-sm text-gray-600">Post-Processing Effects</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={renderQuality.lodEnabled}
            onChange={e => handleQualityChange('lodEnabled', e.target.checked)}
            disabled={performanceMode !== 'auto'}
            className="rounded"
          />
          <span className="text-sm text-gray-600">Level of Detail (LOD)</span>
        </label>
      </div>

      {/* Max Textures */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Max Textures: {renderQuality.maxTextures}
        </label>
        <input
          type="range"
          min="10"
          max="200"
          step="10"
          value={renderQuality.maxTextures}
          onChange={e => handleQualityChange('maxTextures', parseInt(e.target.value))}
          disabled={performanceMode !== 'auto'}
          className="w-full"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2 pt-4 border-t border-gray-200">
        <button
          onClick={optimizeForPerformance}
          className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition"
        >
          Optimize for Performance
        </button>
        <button
          onClick={resetToDefaults}
          className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Performance Tips */}
      {frameRate < 30 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="text-sm font-medium text-yellow-800 mb-1">Performance Tips</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Reduce texture resolution to Medium or Low</li>
            <li>• Disable post-processing effects</li>
            <li>• Lower shadow quality</li>
            <li>• Enable Level of Detail (LOD)</li>
            <li>• Reduce max textures limit</li>
          </ul>
        </div>
      )}
    </div>
  );
}
