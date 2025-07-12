'use client';

import React from 'react';
import { useDimensionTool } from '@/hooks/useDimensionTool';
import { useUIStore } from '@/stores/uiStore';
import { useDesignStore } from '@/stores/designStore';

export default function DimensionControls() {
  const {
    state,
    clearAllAnnotations,
    toggleShowAll,
    autoDimensionWalls,
    autoDimensionSelected,
  } = useDimensionTool();

  const { activeTool, setActiveTool } = useUIStore();
  const { selectedElementId, selectedElementType } = useDesignStore();

  const { annotations, showAll } = state;

  const isDimensionTool = activeTool === 'dimension';

  return (
    <div className="fixed top-20 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40 min-w-[250px]">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
        <span className="mr-2">📏</span>
        Dimension Annotations
      </h3>
      
      {/* Tool Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setActiveTool(isDimensionTool ? 'select' : 'dimension')}
          className={`w-full px-3 py-2 text-sm rounded transition-colors ${
            isDimensionTool
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          {isDimensionTool ? 'Exit Dimension Tool' : 'Activate Dimension Tool'}
        </button>
      </div>

      {/* Controls */}
      <div className="space-y-2 mb-4">
        <button
          onClick={toggleShowAll}
          className={`w-full px-3 py-2 text-xs rounded transition-colors ${
            showAll
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}
        >
          {showAll ? 'Hide' : 'Show'} Dimensions ({annotations.length})
        </button>
        
        <button
          onClick={autoDimensionWalls}
          className="w-full px-3 py-2 text-xs bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition-colors"
          disabled={annotations.length > 20} // Prevent too many auto-dimensions
        >
          Auto-Dimension All Walls
        </button>

        {selectedElementId && selectedElementType && (
          <button
            onClick={() => autoDimensionSelected([selectedElementId], selectedElementType as 'wall' | 'door' | 'window')}
            className="w-full px-3 py-2 text-xs bg-purple-100 text-purple-700 border border-purple-300 rounded hover:bg-purple-200 transition-colors"
          >
            Dimension Selected {selectedElementType}
          </button>
        )}
        
        {annotations.length > 0 && (
          <button
            onClick={clearAllAnnotations}
            className="w-full px-3 py-2 text-xs bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 transition-colors"
          >
            Clear All Dimensions
          </button>
        )}
      </div>

      {/* Dimension List */}
      {showAll && annotations.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-y-auto mb-4">
          <div className="text-xs text-gray-500 mb-2">
            Recent dimensions:
          </div>
          {annotations.slice(-5).reverse().map((annotation, index) => (
            <div
              key={annotation.id}
              className="text-xs p-2 bg-gray-50 rounded border"
            >
              <div className="font-medium text-gray-800">
                {annotation.label}
              </div>
              <div className="text-gray-500 flex justify-between">
                <span>#{annotations.length - index}</span>
                {annotation.elementType && (
                  <span className="capitalize">{annotation.elementType}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          {isDimensionTool ? (
            <>
              <div>• Click two points to create dimension</div>
              <div>• Snaps to walls, doors, windows</div>
              <div>• Drag dimension line to adjust offset</div>
              <div>• Click dimension to select/edit</div>
              <div>• Click × on selected to delete</div>
            </>
          ) : (
            <>
              <div>• Activate tool to create dimensions</div>
              <div>• Use auto-dimension for quick setup</div>
              <div>• Dimensions show in metric and imperial</div>
              <div>• Permanent annotations with leader lines</div>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      {isDimensionTool && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-medium text-blue-600">
            🎯 Dimension Tool Active
          </div>
          <div className="text-xs text-gray-500">
            Click two points to measure
          </div>
        </div>
      )}
    </div>
  );
}

// Dimension Style Editor Component
export const DimensionStyleEditor: React.FC<{
  onStyleChange: (style: {
    color: string;
    strokeWidth: number;
    fontSize: number;
    precision: number;
    units: 'metric' | 'imperial' | 'both';
    textBackground: boolean;
  }) => void;
}> = ({ onStyleChange }) => {
  const [style, setStyle] = React.useState({
    color: '#2563eb',
    strokeWidth: 1.5,
    fontSize: 12,
    precision: 1,
    units: 'both' as 'metric' | 'imperial' | 'both',
    textBackground: true,
  });

  const handleChange = (key: string, value: string | number | boolean) => {
    const newStyle = { ...style, [key]: value };
    setStyle(newStyle);
    onStyleChange(newStyle);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Dimension Style</h4>
      
      {/* Color */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Color</label>
        <input
          type="color"
          value={style.color}
          onChange={(e) => handleChange('color', e.target.value)}
          className="w-full h-8 rounded border border-gray-300"
        />
      </div>

      {/* Stroke Width */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Line Width</label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={style.strokeWidth}
          onChange={(e) => handleChange('strokeWidth', parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-500">{style.strokeWidth}px</div>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Text Size</label>
        <input
          type="range"
          min="8"
          max="16"
          step="1"
          value={style.fontSize}
          onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-500">{style.fontSize}px</div>
      </div>

      {/* Precision */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Precision</label>
        <select
          value={style.precision}
          onChange={(e) => handleChange('precision', parseInt(e.target.value))}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
        >
          <option value={0}>0 decimal places</option>
          <option value={1}>1 decimal place</option>
          <option value={2}>2 decimal places</option>
        </select>
      </div>

      {/* Units */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Units</label>
        <select
          value={style.units}
          onChange={(e) => handleChange('units', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
        >
          <option value="metric">Metric only</option>
          <option value="imperial">Imperial only</option>
          <option value="both">Both (metric + imperial)</option>
        </select>
      </div>

      {/* Text Background */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="textBackground"
          checked={style.textBackground}
          onChange={(e) => handleChange('textBackground', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="textBackground" className="text-xs text-gray-600">
          Text background
        </label>
      </div>
    </div>
  );
};