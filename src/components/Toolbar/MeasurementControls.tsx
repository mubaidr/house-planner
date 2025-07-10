'use client';

import React from 'react';
import { useMeasureTool } from '@/hooks/useMeasureTool';

export default function MeasurementControls() {
  const {
    measureState,
    clearAllMeasurements,
    toggleShowAllMeasurements,
  } = useMeasureTool();

  const { measurements, showAllMeasurements } = measureState;

  if (measurements.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40 min-w-[200px]">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Measurements</h3>
      
      {/* Controls */}
      <div className="space-y-2 mb-3">
        <button
          onClick={toggleShowAllMeasurements}
          className={`w-full px-3 py-2 text-xs rounded transition-colors ${
            showAllMeasurements
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}
        >
          {showAllMeasurements ? 'Hide' : 'Show'} Measurements
        </button>
        
        <button
          onClick={clearAllMeasurements}
          className="w-full px-3 py-2 text-xs bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 transition-colors"
        >
          Clear All ({measurements.length})
        </button>
      </div>

      {/* Measurement list */}
      {showAllMeasurements && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          <div className="text-xs text-gray-500 mb-2">
            Recent measurements:
          </div>
          {measurements.slice(-5).reverse().map((measurement, index) => (
            <div
              key={measurement.id}
              className="text-xs p-2 bg-gray-50 rounded border"
            >
              <div className="font-medium text-gray-800">
                {measurement.label.split(' ')[0]} {/* Show just the cm value */}
              </div>
              <div className="text-gray-500">
                #{measurements.length - index}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>• Click two points to measure</div>
          <div>• Snaps to walls and grid</div>
          <div>• Click × to remove</div>
        </div>
      </div>
    </div>
  );
}