import React, { useState } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { ViewMode } from '@/types';

interface ViewSwitcherFABProps {
  className?: string;
}

export function ViewSwitcherFAB({ className = '' }: ViewSwitcherFABProps) {
  const { viewMode, setViewMode } = useDesignStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const viewModes: { value: ViewMode; label: string; icon: string; color: string }[] = [
    { value: '2d', label: '2D', icon: '📐', color: 'bg-blue-500 hover:bg-blue-600' },
    { value: '3d', label: '3D', icon: '🏠', color: 'bg-green-500 hover:bg-green-600' },
    { value: 'hybrid', label: 'Split', icon: '⚡', color: 'bg-purple-500 hover:bg-purple-600' },
  ];

  const currentMode = viewModes.find(mode => mode.value === viewMode) || viewModes[1];

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setIsExpanded(false);
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {/* Expanded Options */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-2 animate-in slide-in-from-bottom-2">
          {viewModes.filter(mode => mode.value !== viewMode).map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              className={`w-12 h-12 rounded-full ${mode.color} text-white shadow-lg transform transition-all duration-200 hover:scale-110 flex items-center justify-center group relative`}
              title={`Switch to ${mode.label} view`}
            >
              <span className="text-lg">{mode.icon}</span>
              <div className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {mode.label} View
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full ${currentMode.color} text-white shadow-xl transform transition-all duration-300 hover:scale-110 flex items-center justify-center group relative ${
          isExpanded ? 'rotate-45' : ''
        }`}
        title={`Current: ${currentMode.label} view`}
      >
        <span className="text-xl">{isExpanded ? '✕' : currentMode.icon}</span>

        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {isExpanded ? 'Close' : `${currentMode.label} View - Click to switch`}
        </div>
      </button>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}

export default ViewSwitcherFAB;
