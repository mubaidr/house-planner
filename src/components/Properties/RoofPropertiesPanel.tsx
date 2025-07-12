'use client';

import React, { useState, useEffect } from 'react';
import { Roof } from '@/types/elements/Roof';

interface RoofPropertiesPanelProps {
  roof: Roof;
  onUpdate: (updates: Partial<Roof>) => void;
  onDelete: () => void;
}

export default function RoofPropertiesPanel({ roof, onUpdate, onDelete }: RoofPropertiesPanelProps) {
  const [editValues, setEditValues] = useState({
    height: roof.height.toString(),
    pitch: roof.pitch.toString(),
    overhang: roof.overhang.toString(),
    ridgeHeight: roof.ridgeHeight.toString(),
    gutterHeight: roof.gutterHeight.toString(),
    color: roof.color,
  });

  useEffect(() => {
    setEditValues({
      height: roof.height.toString(),
      pitch: roof.pitch.toString(),
      overhang: roof.overhang.toString(),
      ridgeHeight: roof.ridgeHeight.toString(),
      gutterHeight: roof.gutterHeight.toString(),
      color: roof.color,
    });
  }, [roof]);

  const handleInputChange = (field: string, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleInputBlur = (field: string) => {
    const numericFields = ['height', 'pitch', 'overhang', 'ridgeHeight', 'gutterHeight'];
    
    if (numericFields.includes(field)) {
      const numValue = parseFloat(editValues[field as keyof typeof editValues] as string);
      if (!isNaN(numValue) && numValue >= 0) {
        onUpdate({ [field]: numValue });
      } else {
        // Reset to current value if invalid
        setEditValues(prev => ({ 
          ...prev, 
          [field]: (roof[field as keyof Roof] as number).toString() 
        }));
      }
    } else {
      onUpdate({ [field]: editValues[field as keyof typeof editValues] });
    }
  };

  const handleTypeChange = (type: Roof['type']) => {
    onUpdate({ type });
  };

  const getBounds = () => {
    if (roof.points.length === 0) return { width: 0, height: 0, area: 0 };
    
    const xs = roof.points.map(p => p.x);
    const ys = roof.points.map(p => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    
    // Simple polygon area calculation (shoelace formula)
    let area = 0;
    for (let i = 0; i < roof.points.length; i++) {
      const j = (i + 1) % roof.points.length;
      area += roof.points[i].x * roof.points[j].y;
      area -= roof.points[j].x * roof.points[i].y;
    }
    area = Math.abs(area) / 2;
    
    return { width, height, area };
  };

  const bounds = getBounds();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Roof Properties</h3>
        <button
          onClick={onDelete}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Roof Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Roof Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['gable', 'hip', 'shed', 'flat', 'mansard'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-3 py-2 text-sm rounded border transition-colors ${
                roof.type === type
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Properties */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (cm)
          </label>
          <input
            type="number"
            value={editValues.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            onBlur={() => handleInputBlur('height')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="200"
            max="800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pitch (degrees)
          </label>
          <input
            type="number"
            value={editValues.pitch}
            onChange={(e) => handleInputChange('pitch', e.target.value)}
            onBlur={() => handleInputBlur('pitch')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="60"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overhang (cm)
          </label>
          <input
            type="number"
            value={editValues.overhang}
            onChange={(e) => handleInputChange('overhang', e.target.value)}
            onBlur={() => handleInputBlur('overhang')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="150"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ridge Height (cm)
            </label>
            <input
              type="number"
              value={editValues.ridgeHeight}
              onChange={(e) => handleInputChange('ridgeHeight', e.target.value)}
              onBlur={() => handleInputBlur('ridgeHeight')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="250"
              max="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gutter Height (cm)
            </label>
            <input
              type="number"
              value={editValues.gutterHeight}
              onChange={(e) => handleInputChange('gutterHeight', e.target.value)}
              onBlur={() => handleInputBlur('gutterHeight')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="200"
              max="400"
            />
          </div>
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={editValues.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            onBlur={() => handleInputBlur('color')}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={editValues.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            onBlur={() => handleInputBlur('color')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#8B4513"
          />
        </div>
      </div>

      {/* Roof Information */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Roof Information</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div>Points: {roof.points.length}</div>
          <div>Width: {Math.round(bounds.width)}cm</div>
          <div>Height: {Math.round(bounds.height)}cm</div>
          <div>Area: {Math.round(bounds.area / 10000)}m²</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
        <div className="space-y-2">
          <button
            onClick={() => onUpdate({ pitch: 30, type: 'gable' })}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Standard Gable (30°)
          </button>
          <button
            onClick={() => onUpdate({ pitch: 0, type: 'flat' })}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Flat Roof (0°)
          </button>
          <button
            onClick={() => onUpdate({ pitch: 45, type: 'hip' })}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Hip Roof (45°)
          </button>
        </div>
      </div>
    </div>
  );
}