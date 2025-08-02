import React, { useState } from 'react';
import { useDesignStore } from '@/stores/designStore';

interface BottomStatusBarProps {
  measureToolActive: boolean;
  onMeasureToggle: () => void;
  manipulatorActive: boolean;
  onManipulatorToggle: () => void;
}

export function BottomStatusBar({
  measureToolActive,
  onMeasureToggle,
  manipulatorActive,
  onManipulatorToggle,
}: BottomStatusBarProps) {
  const { scene3D, updateScene3D } = useDesignStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const quickToggles = [
    {
      id: 'grid',
      label: 'Grid',
      icon: '📏',
      active: scene3D.environment.gridHelper,
      onClick: () => updateScene3D({
        environment: {
          ...scene3D.environment,
          gridHelper: !scene3D.environment.gridHelper
        }
      })
    },
    {
      id: 'ground',
      label: 'Ground',
      icon: '🏠',
      active: scene3D.environment.groundPlane,
      onClick: () => updateScene3D({
        environment: {
          ...scene3D.environment,
          groundPlane: !scene3D.environment.groundPlane
        }
      })
    },
    {
      id: 'shadows',
      label: 'Shadows',
      icon: '🌫️',
      active: scene3D.renderSettings.shadows,
      onClick: () => updateScene3D({
        renderSettings: {
          ...scene3D.renderSettings,
          shadows: !scene3D.renderSettings.shadows
        }
      })
    },
    {
      id: 'wireframe',
      label: 'Wireframe',
      icon: '🔧',
      active: scene3D.renderSettings.wireframe,
      onClick: () => updateScene3D({
        renderSettings: {
          ...scene3D.renderSettings,
          wireframe: !scene3D.renderSettings.wireframe
        }
      })
    },
    {
      id: 'measure',
      label: 'Measure',
      icon: '📐',
      active: measureToolActive,
      onClick: onMeasureToggle
    },
    {
      id: 'manipulator',
      label: 'Move',
      icon: '🎮',
      active: manipulatorActive,
      onClick: onManipulatorToggle
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className={`bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'px-4 py-2'
      }`}>
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            title="Expand status bar"
          >
            <span className="text-sm">⬆️</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1">
            {/* Collapse Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors mr-2"
              title="Collapse status bar"
            >
              <span className="text-sm">⬇️</span>
            </button>

            {/* Quick Toggles */}
            {quickToggles.map((toggle) => (
              <button
                key={toggle.id}
                onClick={toggle.onClick}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  toggle.active
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={`Toggle ${toggle.label}`}
              >
                <span>{toggle.icon}</span>
                <span className="hidden sm:inline">{toggle.label}</span>
              </button>
            ))}

            {/* Quality Indicator */}
            <div className="ml-4 px-3 py-2 bg-gray-50 rounded-lg flex items-center space-x-2">
              <span className="text-sm">🎨</span>
              <span className="text-xs text-gray-600 capitalize">
                {scene3D.renderSettings.quality}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BottomStatusBar;
