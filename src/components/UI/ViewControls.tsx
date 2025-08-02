import { useDesignStore } from '@/stores/designStore';
import { ViewMode, CameraPreset } from '@/types';

export function ViewControls() {
  const { viewMode, setViewMode, setCameraPreset, scene3D } = useDesignStore();

  const viewModes: { value: ViewMode; label: string }[] = [
    { value: '2d', label: '2D' },
    { value: '3d', label: '3D' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const cameraPresets: { value: CameraPreset; label: string }[] = [
    { value: 'perspective', label: 'Perspective' },
    { value: 'top', label: 'Top' },
    { value: 'front', label: 'Front' },
    { value: 'back', label: 'Back' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'isometric', label: 'Isometric' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">View Mode</h3>
        <div className="flex space-x-2">
          {viewModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setViewMode(mode.value)}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === mode.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === '3d' && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Camera View</h3>
          <div className="grid grid-cols-2 gap-2">
            {cameraPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setCameraPreset(preset.value)}
                className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {viewMode === '3d' && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Render Settings</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={scene3D.renderSettings.shadows}
                onChange={(e) => useDesignStore.getState().updateScene3D({
                  renderSettings: {
                    ...scene3D.renderSettings,
                    shadows: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Shadows</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={scene3D.environment.gridHelper}
                onChange={(e) => useDesignStore.getState().updateScene3D({
                  environment: {
                    ...scene3D.environment,
                    gridHelper: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Grid</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={scene3D.renderSettings.wireframe}
                onChange={(e) => useDesignStore.getState().updateScene3D({
                  renderSettings: {
                    ...scene3D.renderSettings,
                    wireframe: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Wireframe</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
