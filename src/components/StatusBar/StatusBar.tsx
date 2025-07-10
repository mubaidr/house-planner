'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useDesignStore } from '@/stores/designStore';

export default function StatusBar() {
  const { 
    activeTool, 
    showGrid, 
    snapToGrid, 
    gridSize, 
    zoomLevel,
    mouseCoordinates,
    toggleGrid,
    toggleSnapToGrid 
  } = useUIStore();
  
  const { walls, doors, windows } = useDesignStore();

  const totalElements = walls.length + doors.length + windows.length;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white text-sm text-gray-600">
      {/* Left side - Tool and element info */}
      <div className="flex items-center space-x-4">
        <span>
          Tool: <span className="font-medium capitalize">{activeTool}</span>
        </span>
        <span>
          Elements: <span className="font-medium">{totalElements}</span>
        </span>
        <span>
          Walls: <span className="font-medium">{walls.length}</span>
        </span>
      </div>

      {/* Center - Grid and snap controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleGrid}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            showGrid 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Grid: {showGrid ? 'ON' : 'OFF'}
        </button>
        
        <button
          onClick={toggleSnapToGrid}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            snapToGrid 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Snap: {snapToGrid ? 'ON' : 'OFF'}
        </button>
        
        <span>Grid: {gridSize}px</span>
      </div>

      {/* Right side - Zoom and coordinates */}
      <div className="flex items-center space-x-4">
        <span>
          Coordinates: <span className="font-medium">({mouseCoordinates.x}, {mouseCoordinates.y})</span>
        </span>
        <span>
          Zoom: <span className="font-medium">{Math.round(zoomLevel * 100)}%</span>
        </span>
        <span>
          Ready
        </span>
      </div>
    </div>
  );
}