'use client';

import React, { useState } from 'react';
import { useViewStore } from '@/stores/viewStore';
import { useHistoryStore } from '@/stores/historyStore';
import { ViewType2D } from '@/types/views';

export default function ViewSwitcher() {
  const { currentView, setViewWithHistory, isTransitioning } = useViewStore();
  const { executeCommand } = useHistoryStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const views: { mode: ViewType2D; label: string; icon: string; description: string }[] = [
    { mode: 'plan', label: 'Plan View', icon: '⬜', description: 'Top-down floor layout' },
    { mode: 'front', label: 'Front Elevation', icon: '⬛', description: 'Front view of building' },
    { mode: 'back', label: 'Back Elevation', icon: '⬛', description: 'Back view of building' },
    { mode: 'left', label: 'Left Elevation', icon: '⬛', description: 'Left side view' },
    { mode: 'right', label: 'Right Elevation', icon: '⬛', description: 'Right side view' },
  ];

  const handleViewChange = (view: ViewType2D) => {
    setViewWithHistory(view, executeCommand);
    setIsExpanded(false);
    if (process.env.NODE_ENV === 'development') {
      console.log(`Switching to ${view} view with history support`);
    }
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
              title={view.description}
            >
              <span className="text-lg">{view.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium">{view.label}</span>
                <span className="text-xs text-gray-500">{view.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main floating action button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group ${
          isTransitioning ? 'animate-pulse' : ''
        }`}
        title={`Current: ${currentViewData.label} - Click to switch views`}
        disabled={isTransitioning}
      >
        {isTransitioning ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        ) : (
          <span className="text-xl">{currentViewData.icon}</span>
        )}
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