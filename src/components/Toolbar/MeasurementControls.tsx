'use client';

import React from 'react';
import { useMeasureTool } from '@/hooks/useMeasureTool';

export default function MeasurementControls() {
  const {
    measureState,
    clearAllMeasurements,
    toggleShowAllMeasurements,
  } = useMeasureTool();
  const { removeMeasurement } = useMeasureTool();

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
        <button
          onClick={() => {
            const csv = [
              'id,startX,startY,endX,endY,distance,angle,label,timestamp',
              ...measurements.map(m =>
                `${m.id},${m.startPoint.x},${m.startPoint.y},${m.endPoint.x},${m.endPoint.y},${m.distance},${m.angle},"${m.label}",${m.timestamp}`
              ),
            ].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'measurements.csv'
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="w-full px-3 py-2 text-xs bg-green-100 text-green-700 border border-green-300 rounded hover:bg-green-200 transition-colors"
        >
          Export CSV
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
              className="text-xs p-2 bg-gray-50 rounded border flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-gray-800">
                  {measurement.label.split(' ')[0]}
                </div>
                <div className="text-gray-500">
                  #{measurements.length - index}
                </div>
              </div>
              <button
                onClick={() => removeMeasurement(measurement.id)}
                className="ml-2 px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100"
                title="Remove measurement"
              >
                ×
              </button>
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
