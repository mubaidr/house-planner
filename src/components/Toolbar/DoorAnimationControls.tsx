'use client';

import React from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useGlobalDoorAnimation } from '@/hooks/useDoorAnimation';

export default function DoorAnimationControls() {
  const { doors } = useDesignStore();
  const { resetAllDoors } = useGlobalDoorAnimation();

  if (doors.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40 min-w-[200px]">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Door Controls</h3>
      
      {/* Controls */}
      <div className="space-y-2">
        <button
          onClick={resetAllDoors}
          className="w-full px-3 py-2 text-xs bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition-colors"
        >
          Close All Doors ({doors.length})
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>• Double-click doors to open/close</div>
          <div>• Smooth animation with easing</div>
          <div>• Visual swing direction</div>
          <div>• Interactive door handles</div>
        </div>
      </div>

      {/* Door list */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">
          Doors in design:
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {doors.map((door, index) => (
            <div
              key={door.id}
              className="text-xs p-2 bg-gray-50 rounded border flex justify-between items-center"
            >
              <span className="font-medium text-gray-800">
                Door #{index + 1}
              </span>
              <span className="text-gray-500 capitalize">
                {door.swingDirection} swing
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}