'use client';

import React, { useState } from 'react';

type ViewMode = '2D' | 'isometric' | 'front' | 'back' | 'left' | 'right';

export default function ViewSwitcher() {
  const [currentView, setCurrentView] = useState<ViewMode>('2D');
  const [isExpanded, setIsExpanded] = useState(false);

  const views: { mode: ViewMode; label: string; icon: string }[] = [
    { mode: '2D', label: 'Top View', icon: '⬜' },
    { mode: 'isometric', label: 'Isometric', icon: '🔷' },
    { mode: 'front', label: 'Front', icon: '⬛' },
    { mode: 'back', label: 'Back', icon: '⬛' },
    { mode: 'left', label: 'Left', icon: '⬛' },
    { mode: 'right', label: 'Right', icon: '⬛' },
  ];

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
    setIsExpanded(false);
    // TODO: Implement actual view switching logic in Phase 3
    console.log(`Switching to ${view} view`);
  };

  const currentViewData = views.find(v => v.mode === currentView) || views[0];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded view options */}
      {isExpanded && (
        <div className="mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {views.map((view) => (
            <button
              key={view.mode}
              onClick={() => handleViewChange(view.mode)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                currentView === view.mode ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{view.icon}</span>
              <span className="font-medium">{view.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main floating action button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group"
        title={`Current: ${currentViewData.label} - Click to switch views`}
      >
        <span className="text-xl">{currentViewData.icon}</span>
      </button>

      {/* View label */}
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
          {currentViewData.label}
        </span>
      </div>
    </div>
  );
}