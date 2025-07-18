'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useDesignStore } from '@/stores/designStore';
import { useUnitStore } from '@/stores/unitStore';
import { formatLength } from '@/utils/unitUtils';

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
  const { unitSystem, setUnitSystem, showUnitLabels, toggleUnitLabels } = useUnitStore();

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

      {/* Center - Grid, snap, and unit controls */}
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

        <div className="flex items-center space-x-2">
          <span>Units:</span>
          <select
            value={unitSystem}
            onChange={(e) => setUnitSystem(e.target.value as 'metric' | 'imperial')}
            className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
          >
            <option value="metric">Metric (m)</option>
            <option value="imperial">Imperial (ft)</option>
          </select>
          <button
            onClick={toggleUnitLabels}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              showUnitLabels 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Toggle unit labels"
          >
            Labels: {showUnitLabels ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Right side - Zoom and coordinates */}
      <div className="flex items-center space-x-4">
        <span>
          Coordinates: <span className="font-medium">({formatLength(mouseCoordinates.x / 100, unitSystem, 1, showUnitLabels)}, {formatLength(mouseCoordinates.y / 100, unitSystem, 1, showUnitLabels)})</span>
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