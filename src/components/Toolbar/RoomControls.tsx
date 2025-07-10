'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useDesignStore } from '@/stores/designStore';
import { detectRooms } from '@/utils/roomDetection';

export default function RoomControls() {
  const { showRooms, toggleRooms } = useUIStore();
  const { walls } = useDesignStore();
  
  const { rooms } = detectRooms(walls);

  return (
    <div className="flex items-center space-x-4">
      {/* Room visibility toggle */}
      <button
        onClick={toggleRooms}
        className={`px-3 py-2 text-sm rounded transition-colors ${
          showRooms
            ? 'bg-blue-100 text-blue-700 border border-blue-300'
            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
        }`}
        title="Toggle room detection overlay"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>Rooms</span>
          {rooms.length > 0 && (
            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {rooms.length}
            </span>
          )}
        </div>
      </button>

      {/* Room count and info */}
      {rooms.length > 0 && (
        <div className="text-sm text-gray-600">
          {rooms.length === 1 ? '1 room detected' : `${rooms.length} rooms detected`}
        </div>
      )}
    </div>
  );
}