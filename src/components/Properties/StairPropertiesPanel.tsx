'use client';

import React, { useState, useEffect } from 'react';
import { Stair } from '@/types/elements/Stair';

interface StairPropertiesPanelProps {
  stair: Stair;
  onUpdate: (updates: Partial<Stair>) => void;
  onDelete: () => void;
}

export default function StairPropertiesPanel({ stair, onUpdate, onDelete }: StairPropertiesPanelProps) {
  const [editValues, setEditValues] = useState({
    width: stair.width.toString(),
    length: stair.length.toString(),
    steps: stair.steps.toString(),
    stepHeight: stair.stepHeight.toString(),
    stepDepth: stair.stepDepth.toString(),
    color: stair.color,
  });

  useEffect(() => {
    setEditValues({
      width: stair.width.toString(),
      length: stair.length.toString(),
      steps: stair.steps.toString(),
      stepHeight: stair.stepHeight.toString(),
      stepDepth: stair.stepDepth.toString(),
      color: stair.color,
    });
  }, [stair]);

  const handleInputChange = (field: string, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleInputBlur = (field: string) => {
    const numericFields = ['width', 'length', 'steps', 'stepHeight', 'stepDepth'];

    if (numericFields.includes(field)) {
      const numValue = parseFloat(editValues[field as keyof typeof editValues] as string);
      if (!isNaN(numValue) && numValue > 0) {
        onUpdate({ [field]: numValue });
      } else {
        // Reset to current value if invalid
        setEditValues(prev => ({
          ...prev,
          [field]: (stair[field as keyof Stair] as number).toString()
        }));
      }
    } else {
      onUpdate({ [field]: editValues[field as keyof typeof editValues] });
    }
  };

  const handleTypeChange = (type: Stair['type']) => {
    onUpdate({ type });
  };

  const handleDirectionChange = (direction: Stair['direction']) => {
    onUpdate({ direction });
  };

  const handleOrientationChange = (orientation: Stair['orientation']) => {
    onUpdate({ orientation });
  };

  const handleHandrailChange = (side: 'left' | 'right', enabled: boolean) => {
    if (side === 'left') {
      onUpdate({ handrailLeft: enabled });
    } else {
      onUpdate({ handrailRight: enabled });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Stair Properties</h3>
        <button
          onClick={onDelete}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
      {/* Material */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Material
        </label>
        <input
          type="text"
          value={stair.material ?? ''}
          onChange={e => onUpdate({ material: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Concrete"
        />
      </div>
      {/* Floor ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Floor ID
        </label>
        <input
          type="text"
          value={stair.floorId ?? ''}
          onChange={e => onUpdate({ floorId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. floor-1"
        />
      </div>

      {/* Basic Properties */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width (cm)
          </label>
          <input
            type="number"
            value={editValues.width}
            onChange={(e) => handleInputChange('width', e.target.value)}
            onBlur={() => handleInputBlur('width')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="60"
            max="300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Length (cm)
          </label>
          <input
            type="number"
            value={editValues.length}
            onChange={(e) => handleInputChange('length', e.target.value)}
            onBlur={() => handleInputBlur('length')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="100"
            max="600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Steps
          </label>
          <input
            type="number"
            value={editValues.steps}
            onChange={(e) => handleInputChange('steps', e.target.value)}
            onBlur={() => handleInputBlur('steps')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="3"
            max="25"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Step Height (cm)
            </label>
            <input
              type="number"
              value={editValues.stepHeight}
              onChange={(e) => handleInputChange('stepHeight', e.target.value)}
              onBlur={() => handleInputBlur('stepHeight')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="15"
              max="25"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Step Depth (cm)
            </label>
            <input
              type="number"
              value={editValues.stepDepth}
              onChange={(e) => handleInputChange('stepDepth', e.target.value)}
              onBlur={() => handleInputBlur('stepDepth')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="20"
              max="35"
              step="0.5"
            />
          </div>
        </div>
      </div>

      {/* Stair Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stair Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['straight', 'L-shaped', 'U-shaped', 'spiral'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-3 py-2 text-sm rounded border transition-colors ${
                stair.type === type
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Direction and Orientation */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Direction
          </label>
          <div className="space-y-1">
            {(['up', 'down'] as const).map((direction) => (
              <label key={direction} className="flex items-center">
                <input
                  type="radio"
                  name="direction"
                  checked={stair.direction === direction}
                  onChange={() => handleDirectionChange(direction)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{direction}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Orientation
          </label>
          <div className="space-y-1">
            {(['horizontal', 'vertical'] as const).map((orientation) => (
              <label key={orientation} className="flex items-center">
                <input
                  type="radio"
                  name="orientation"
                  checked={stair.orientation === orientation}
                  onChange={() => handleOrientationChange(orientation)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{orientation}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Handrails */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Handrails
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={stair.handrailLeft}
              onChange={(e) => handleHandrailChange('left', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Left handrail</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={stair.handrailRight}
              onChange={(e) => handleHandrailChange('right', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Right handrail</span>
          </label>
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

      {/* Position Info */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Position</h4>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div>X: {Math.round(stair.x)}cm</div>
          <div>Y: {Math.round(stair.y)}cm</div>
        </div>
      </div>
    </div>
  );
}
