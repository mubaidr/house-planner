'use client';

import React, { useState, useEffect } from 'react';
import { Roof } from '@/types/elements/Roof';
import RoofMaterialCalculator, { RoofMaterialQuantities } from '@/utils/roofMaterialCalculations';

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
    material: roof.material ?? '',
    materialId: roof.materialId ?? '',
    floorId: roof.floorId ?? '',
  });

  const [showMaterialCalculations, setShowMaterialCalculations] = useState(false);
  const [materialType, setMaterialType] = useState<'asphalt' | 'metal' | 'tile' | 'slate' | 'wood' | 'membrane'>('asphalt');
  const [materialQuantities, setMaterialQuantities] = useState<RoofMaterialQuantities | null>(null);
  const [climate, setClimate] = useState<'temperate' | 'cold' | 'hot' | 'coastal'>('temperate');

  useEffect(() => {
    setEditValues({
      height: roof.height.toString(),
      pitch: roof.pitch.toString(),
      overhang: roof.overhang.toString(),
      ridgeHeight: roof.ridgeHeight.toString(),
      gutterHeight: roof.gutterHeight.toString(),
      color: roof.color,
      material: roof.material ?? '',
      materialId: roof.materialId ?? '',
      floorId: roof.floorId ?? '',
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
      if (field === 'materialId') {
        onUpdate({ materialId: editValues.materialId })
      }
      if (field === 'material') {
        onUpdate({ material: editValues.material })
      }
      if (field === 'floorId') {
        onUpdate({ floorId: editValues.floorId })
      }
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

  const calculateMaterials = () => {
    const calculator = new RoofMaterialCalculator({
      materialType,
      climate,
      complexity: ['gambrel', 'mansard', 'butterfly', 'monitor', 'sawtooth', 'shed-dormer'].includes(roof.type) ? 'complex' : 'moderate'
    });

    let quantities: RoofMaterialQuantities;
    
    if (roof.type === 'gambrel') {
      quantities = calculator.calculateGambrelMaterials(roof);
    } else if (roof.type === 'mansard') {
      quantities = calculator.calculateMansardMaterials(roof);
    } else if (['butterfly', 'saltbox', 'monitor', 'sawtooth', 'shed-dormer'].includes(roof.type)) {
      quantities = calculator.calculateComplexRoofMaterials(roof);
    } else {
      quantities = calculator.calculateMaterials(roof);
    }
    
    setMaterialQuantities(quantities);
    setShowMaterialCalculations(true);
  };

  const getMaterialRecommendations = () => {
    const calculator = new RoofMaterialCalculator();
    return calculator.getMaterialRecommendations(roof.type, roof.pitch, climate);
  };

  const recommendations = getMaterialRecommendations();

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
        <div className="grid grid-cols-3 gap-2">
          {(['gable', 'hip', 'shed', 'flat', 'gambrel', 'mansard', 'butterfly', 'saltbox', 'monitor', 'sawtooth', 'shed-dormer'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-3 py-2 text-sm rounded border transition-colors ${
                roof.type === type
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type === 'shed-dormer' ? 'Shed Dormer' : type.charAt(0).toUpperCase() + type.slice(1)}
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
      {/* Material */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Material
        </label>
        <input
          type="text"
          value={editValues.material}
          onChange={(e) => handleInputChange('material', e.target.value)}
          onBlur={() => handleInputBlur('material')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Material name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Material ID
        </label>
        <input
          type="text"
          value={editValues.materialId}
          onChange={(e) => handleInputChange('materialId', e.target.value)}
          onBlur={() => handleInputBlur('materialId')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Material ID"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Floor ID
        </label>
        <input
          type="text"
          value={editValues.floorId}
          onChange={(e) => handleInputChange('floorId', e.target.value)}
          onBlur={() => handleInputBlur('floorId')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Floor ID"
        />
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

      {/* Material Recommendations */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Material Recommendations</h4>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Climate</label>
            <select
              value={climate}
              onChange={(e) => setClimate(e.target.value as 'temperate' | 'cold' | 'hot' | 'coastal')}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="temperate">Temperate</option>
              <option value="cold">Cold/Snow</option>
              <option value="hot">Hot/Dry</option>
              <option value="coastal">Coastal</option>
            </select>
          </div>
          
          {recommendations.recommended.length > 0 && (
            <div>
              <span className="text-xs font-medium text-green-600">Recommended:</span>
              <div className="text-xs text-gray-600">
                {recommendations.recommended.join(', ')}
              </div>
            </div>
          )}
          
          {recommendations.suitable.length > 0 && (
            <div>
              <span className="text-xs font-medium text-blue-600">Suitable:</span>
              <div className="text-xs text-gray-600">
                {recommendations.suitable.join(', ')}
              </div>
            </div>
          )}
          
          {recommendations.notRecommended.length > 0 && (
            <div>
              <span className="text-xs font-medium text-red-600">Not Recommended:</span>
              <div className="text-xs text-gray-600">
                {recommendations.notRecommended.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Material Calculations */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Material Calculator</h4>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Material Type</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value as 'asphalt' | 'metal' | 'tile' | 'slate' | 'wood' | 'membrane')}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="asphalt">Asphalt Shingles</option>
              <option value="metal">Metal Roofing</option>
              <option value="tile">Clay/Concrete Tile</option>
              <option value="slate">Slate</option>
              <option value="wood">Wood Shingles</option>
              <option value="membrane">Membrane (Flat)</option>
            </select>
          </div>
          
          <button
            onClick={calculateMaterials}
            className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Calculate Materials
          </button>
        </div>
      </div>

      {/* Material Quantities Display */}
      {showMaterialCalculations && materialQuantities && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Material Quantities</h4>
            <button
              onClick={() => setShowMaterialCalculations(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-gray-600">Roof Area:</span>
                <div>{Math.round(materialQuantities.roofingArea)} sq ft</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Material:</span>
                <div>{Math.round(materialQuantities.roofingMaterial)} units</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-gray-600">Underlayment:</span>
                <div>{Math.round(materialQuantities.underlayment)} rolls</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Gutters:</span>
                <div>{Math.round(materialQuantities.gutterLength)} ft</div>
              </div>
            </div>
            
            {materialQuantities.nails > 0 && (
              <div>
                <span className="font-medium text-gray-600">Nails:</span>
                <span className="ml-1">{Math.round(materialQuantities.nails)} lbs</span>
              </div>
            )}
            
            {materialQuantities.screws > 0 && (
              <div>
                <span className="font-medium text-gray-600">Screws:</span>
                <span className="ml-1">{materialQuantities.screws} count</span>
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium text-gray-600">Material Cost:</span>
                  <div>${Math.round(materialQuantities.materialCost).toLocaleString()}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Labor Cost:</span>
                  <div>${Math.round(materialQuantities.laborCost).toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-1">
                <span className="font-medium text-gray-700">Total Cost:</span>
                <span className="ml-1 font-bold text-green-600">
                  ${Math.round(materialQuantities.totalCost).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 pt-1">
              Waste Factor: {Math.round(materialQuantities.wasteFactor * 100)}% | 
              Complexity: {materialQuantities.complexityFactor}x
            </div>
          </div>
        </div>
      )}

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
            onClick={() => onUpdate({ pitch: 45, type: 'gambrel' })}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Gambrel Roof (45°)
          </button>
          <button
            onClick={() => onUpdate({ pitch: 50, type: 'mansard' })}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Mansard Roof (50°)
          </button>
          <button
            onClick={() => onUpdate({ pitch: 0, type: 'flat' })}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Flat Roof (0°)
          </button>
          <button
            onClick={() => onUpdate({ pitch: 15, type: 'butterfly' })}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Butterfly Roof (15°)
          </button>
          <button
            onClick={() => onUpdate({ pitch: 35, type: 'saltbox' })}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Saltbox Roof (35°)
          </button>
          <button
            onClick={() => onUpdate({ pitch: 25, type: 'monitor' })}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Monitor Roof (25°)
          </button>
          <button
            onClick={() => onUpdate({ pitch: 30, type: 'sawtooth' })}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Sawtooth Roof (30°)
          </button>
          <button
            onClick={() => onUpdate({ pitch: 35, type: 'shed-dormer' })}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Shed Dormer (35°)
          </button>
        </div>
      </div>
    </div>
  );
}
