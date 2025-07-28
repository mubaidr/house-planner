'use client';

import React, { useState } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useGlobalDoorAnimation } from '@/hooks/useDoorAnimation';

export default function DoorFloatingControls() {
  const { doors, selectedElementId, selectedElementType } = useDesignStore();
  const { getDoorState, toggleDoor, resetAllDoors } = useGlobalDoorAnimation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show if there are doors and a door is selected
  const selectedDoor = selectedElementType === 'door' && selectedElementId 
    ? doors.find((door: any) => door.id === selectedElementId)
    : null;

  if (!selectedDoor) return null;

  const doorState = getDoorState(selectedDoor.id);

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {/* Expanded controls */}
      {isExpanded && (
        <div className="mb-3 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
          <div className="text-sm font-semibold text-gray-800 mb-3">
            Door Controls
          </div>
          
          {/* Selected door info */}
          <div className="mb-3 p-2 bg-blue-50 rounded border">
            <div className="text-xs text-blue-700 font-medium">
              Selected Door
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {doorState.isOpen ? 'Open' : 'Closed'} • {selectedDoor.style} • {selectedDoor.swingDirection} swing
            </div>
            <div className="text-xs text-blue-500 mt-1">
              {selectedDoor.width}×{selectedDoor.height}px
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-2">
            <button
              onClick={() => toggleDoor(selectedDoor.id)}
              disabled={doorState.isAnimating}
              className={`w-full px-3 py-2 text-sm rounded transition-colors ${
                doorState.isAnimating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : doorState.isOpen
                  ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
              }`}
            >
              {doorState.isAnimating 
                ? 'Animating...' 
                : doorState.isOpen 
                ? 'Close Door' 
                : 'Open Door'
              }
            </button>

            {doors.length > 1 && (
              <button
                onClick={resetAllDoors}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
              >
                Close All Doors ({doors.length})
              </button>
            )}
          </div>

          {/* Animation info */}
          {doorState.isAnimating && (
            <div className="mb-3 p-2 bg-yellow-50 rounded border border-yellow-200">
              <div className="text-xs text-yellow-700 font-medium">
                Animating...
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                {selectedDoor.style === 'sliding' ? 'Sliding' : 'Swinging'} {doorState.isOpen ? 'open' : 'closed'}
              </div>
            </div>
          )}

          {/* Quick tips */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <div>• Double-click door to toggle</div>
              <div>• Use properties panel to change style</div>
              {selectedDoor.style === 'double' && <div>• Double doors open together</div>}
              {selectedDoor.style === 'sliding' && <div>• Sliding door moves along track</div>}
            </div>
          </div>
        </div>
      )}

      {/* Main floating action button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
          isExpanded
            ? 'bg-blue-600 text-white rotate-45'
            : doorState.isOpen
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {isExpanded ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ) : doorState.isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {/* Quick toggle button (when collapsed) */}
      {!isExpanded && (
        <button
          onClick={() => toggleDoor(selectedDoor.id)}
          disabled={doorState.isAnimating}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-white rounded-full shadow-md border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {doorState.isAnimating ? 'Animating...' : doorState.isOpen ? 'Close' : 'Open'}
        </button>
      )}
    </div>
  );
}