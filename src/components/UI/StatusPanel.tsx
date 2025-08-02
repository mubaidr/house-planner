'use client';

import { useDesignStore } from '@/stores/designStore';
import { useState, useEffect } from 'react';

export function StatusPanel() {
  const { walls, rooms, doors, windows, selection, viewMode, scene3D } = useDesignStore();
  const [performance, setPerformance] = useState({ fps: 0, memoryUsage: 0 });
  const [lastAction, setLastAction] = useState<string>('');

  // Monitor performance (simplified)
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformance({
        fps: Math.floor(Math.random() * 10) + 55, // Simulated FPS
        memoryUsage: Math.floor(Math.random() * 20) + 40 // Simulated memory usage
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Track actions
  useEffect(() => {
    if (walls.length > 0) setLastAction(`Added wall (${walls.length} total)`);
  }, [walls.length]);

  useEffect(() => {
    if (rooms.length > 0) setLastAction(`Added room (${rooms.length} total)`);
  }, [rooms.length]);

  useEffect(() => {
    if (doors.length > 0) setLastAction(`Added door (${doors.length} total)`);
  }, [doors.length]);

  useEffect(() => {
    if (windows.length > 0) setLastAction(`Added window (${windows.length} total)`);
  }, [windows.length]);

  const totalElements = walls.length + rooms.length + doors.length + windows.length;

  const getPerformanceColor = (fps: number) => {
    if (fps > 50) return 'text-green-600';
    if (fps > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMemoryColor = (usage: number) => {
    if (usage < 50) return 'text-green-600';
    if (usage < 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-4 py-3">
        <h3 className="text-white font-semibold flex items-center">
          <span className="mr-2">📊</span>
          Status & Info
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Project Overview */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Project Overview</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Elements:</span>
              <span className="font-medium text-gray-800">{totalElements}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">View Mode:</span>
              <span className="font-medium text-gray-800 capitalize">{viewMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Camera:</span>
              <span className="font-medium text-gray-800">
                {scene3D.camera.position.map(p => p.toFixed(1)).join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quality:</span>
              <span className="font-medium text-gray-800 capitalize">{scene3D.renderSettings.quality}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">FPS:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${performance.fps > 50 ? 'bg-green-500' : performance.fps > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs font-medium ${getPerformanceColor(performance.fps)}`}>
                  {performance.fps}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Memory:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${performance.memoryUsage < 50 ? 'bg-green-500' : performance.memoryUsage < 75 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs font-medium ${getMemoryColor(performance.memoryUsage)}`}>
                  {performance.memoryUsage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Details */}
        {selection.selectedElementId ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-700 mb-2">Selected Element</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-600">Type:</span>
                <span className="font-medium text-blue-800 capitalize">{selection.selectedElementType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">ID:</span>
                <span className="font-mono text-blue-800">{selection.selectedElementId.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-sm">
              <span className="block mb-1">👆</span>
              Click any element to select it
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => useDesignStore.getState().setCameraPreset('perspective')}
              className="p-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
            >
              📐 Reset View
            </button>
            <button
              onClick={() => useDesignStore.getState().updateScene3D({
                environment: {
                  ...scene3D.environment,
                  gridHelper: !scene3D.environment.gridHelper
                }
              })}
              className="p-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
            >
              📏 Toggle Grid
            </button>
            <button
              onClick={() => useDesignStore.getState().updateScene3D({
                renderSettings: {
                  ...scene3D.renderSettings,
                  shadows: !scene3D.renderSettings.shadows
                }
              })}
              className="p-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
            >
              🌫️ Toggle Shadows
            </button>
            <button
              onClick={() => useDesignStore.getState().updateScene3D({
                renderSettings: {
                  ...scene3D.renderSettings,
                  wireframe: !scene3D.renderSettings.wireframe
                }
              })}
              className="p-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
            >
              🔧 Wireframe
            </button>
          </div>
        </div>

        {/* Last Action */}
        {lastAction && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 font-medium">Last Action:</span>
            </div>
            <div className="text-xs text-green-600 mt-1">{lastAction}</div>
          </div>
        )}

        {/* Help Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-yellow-700 mb-2">💡 Tips</h4>
          <div className="space-y-1 text-xs text-yellow-600">
            <div>• Click doors to see opening animations</div>
            <div>• Use Ctrl+Drag to rotate the scene</div>
            <div>• Double-click to reset camera view</div>
            <div>• Try different camera presets for better views</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusPanel;
