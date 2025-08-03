'use client';

import React, { useState, useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import {
  ARCHITECTURAL_VIEW_PRESETS,
  getViewPresetsByCategory,
  ViewPreset,
} from '@/data/viewPresets';

interface ViewPresetPanelProps {
  className?: string;
  compact?: boolean;
  showCategories?: boolean;
}

export function ViewPresetPanel({
  className = '',
  compact = false,
  showCategories = true,
}: ViewPresetPanelProps) {
  const { updateCameraState, scene3D } = useDesignStore();
  const [activeCategory, setActiveCategory] = useState<ViewPreset['category']>('perspective');
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle view preset selection with animation
  const handlePresetSelect = useCallback(
    async (preset: ViewPreset) => {
      if (isAnimating) return;

      setIsAnimating(true);

      try {
        // Update camera state with smooth animation
        updateCameraState(preset.camera);

        // Animate to new position
        const animationDuration = 1000;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / animationDuration, 1);

          if (progress >= 1) {
            setIsAnimating(false);
            return;
          }

          requestAnimationFrame(animate);
        };

        animate();
      } catch (error) {
        console.error('Error setting camera preset:', error);
        setIsAnimating(false);
      }
    },
    [updateCameraState, isAnimating]
  );

  // Get current camera position to highlight active preset
  const isPresetActive = useCallback(
    (preset: ViewPreset) => {
      const currentCamera = scene3D.camera;
      const threshold = 1.0;

      return (
        Math.abs(currentCamera.position[0] - preset.camera.position[0]) < threshold &&
        Math.abs(currentCamera.position[1] - preset.camera.position[1]) < threshold &&
        Math.abs(currentCamera.position[2] - preset.camera.position[2]) < threshold
      );
    },
    [scene3D.camera]
  );

  const categories = [
    { key: 'architectural' as const, label: 'Architectural', icon: '🏗️' },
    { key: 'perspective' as const, label: 'Perspective', icon: '👁️' },
    { key: 'section' as const, label: 'Section', icon: '✂️' },
  ];

  const currentPresets = showCategories
    ? getViewPresetsByCategory(activeCategory)
    : ARCHITECTURAL_VIEW_PRESETS;

  if (compact) {
    return (
      <div className={`view-preset-panel-compact ${className}`}>
        <div className="grid grid-cols-2 gap-1">
          {ARCHITECTURAL_VIEW_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              disabled={isAnimating}
              className={`preset-button-compact ${
                isPresetActive(preset) ? 'active' : ''
              } ${isAnimating ? 'animating' : ''}`}
              title={`${preset.description} (${preset.shortcut || 'No shortcut'})`}
            >
              <span className="preset-icon">{preset.icon}</span>
              <span className="preset-name">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`view-preset-panel bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="panel-header border-b border-gray-100 p-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center">
          📷 Camera Views
          {isAnimating && (
            <span className="ml-2 text-xs text-blue-600 animate-pulse">Animating...</span>
          )}
        </h4>
      </div>

      {showCategories && (
        <div className="category-tabs border-b border-gray-100">
          <div className="flex">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeCategory === category.key
                    ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="preset-grid p-3">
        <div className="grid grid-cols-2 gap-2">
          {currentPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              disabled={isAnimating}
              className={`preset-button ${
                isPresetActive(preset) ? 'active' : ''
              } ${isAnimating ? 'animating' : ''}`}
              title={preset.description}
            >
              <div className="preset-content">
                <div className="preset-icon">{preset.icon}</div>
                <div className="preset-info">
                  <div className="preset-name">{preset.name}</div>
                  {preset.shortcut && (
                    <div className="preset-shortcut">{preset.shortcut}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-footer border-t border-gray-100 p-2">
        <div className="text-xs text-gray-500 text-center">
          Use keyboard shortcuts or double-click to focus on objects
        </div>
      </div>
    </div>
  );
}

// Keyboard shortcut handler component
export function ViewPresetShortcuts() {
  const { updateCameraState } = useDesignStore();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;

      const shortcutMap: Record<string, ViewPreset> = {};
      ARCHITECTURAL_VIEW_PRESETS.forEach((preset) => {
        if (preset.shortcut) {
          const key = preset.shortcut.split('+').pop()?.toLowerCase();
          if (key) {
            shortcutMap[key] = preset;
          }
        }
      });

      const preset = shortcutMap[event.key];
      if (preset) {
        event.preventDefault();
        updateCameraState(preset.camera);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [updateCameraState]);

  return null;
}

export default ViewPresetPanel;
