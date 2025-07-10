'use client';

import React from 'react';
import { useMaterialStore } from '@/stores/materialStore';
import { useMaterialApplication } from '@/hooks/useMaterialApplication';

interface MaterialPropertiesSectionProps {
  elementId: string;
  elementType: 'wall' | 'door' | 'window' | 'room';
  currentMaterialId?: string;
}

export default function MaterialPropertiesSection({
  elementId,
  elementType,
  currentMaterialId,
}: MaterialPropertiesSectionProps) {
  const { materials, getMaterialById, setLibraryOpen } = useMaterialStore();
  const { applyMaterialToElement, removeMaterialFromElement } = useMaterialApplication();

  const currentMaterial = currentMaterialId ? getMaterialById(currentMaterialId) : null;

  const handleMaterialChange = (materialId: string) => {
    if (materialId === 'none') {
      removeMaterialFromElement(elementId, elementType);
    } else {
      applyMaterialToElement(elementId, elementType, materialId);
    }
  };

  const handleOpenLibrary = () => {
    setLibraryOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Material</h4>
        
        {/* Current Material Display */}
        {currentMaterial ? (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {/* Material Preview */}
              <div
                className="w-12 h-12 rounded border border-gray-300 flex-shrink-0"
                style={{
                  backgroundColor: currentMaterial.color,
                  backgroundImage: currentMaterial.texture ? `url(${currentMaterial.texture})` : undefined,
                  backgroundRepeat: 'repeat',
                  backgroundSize: `${(currentMaterial.properties.patternScale || 1) * 16}px`,
                  opacity: currentMaterial.properties.opacity,
                }}
              />
              
              {/* Material Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {currentMaterial.name}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {currentMaterial.category}
                </div>
                {currentMaterial.cost && (
                  <div className="text-xs text-green-600">
                    ${currentMaterial.cost.pricePerUnit.toFixed(2)}/{currentMaterial.cost.unit}
                  </div>
                )}
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => handleMaterialChange('none')}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove material"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg text-center text-gray-500">
            No material applied
          </div>
        )}

        {/* Quick Material Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Quick Select
          </label>
          <select
            value={currentMaterialId || 'none'}
            onChange={(e) => handleMaterialChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="none">No Material</option>
            {materials
              .filter(m => m.category === elementType || m.category === 'paint' || elementType === 'room')
              .slice(0, 10) // Show first 10 relevant materials
              .map(material => (
                <option key={material.id} value={material.id}>
                  {material.name} ({material.category})
                </option>
              ))}
          </select>
        </div>

        {/* Open Material Library Button */}
        <button
          onClick={handleOpenLibrary}
          className="w-full mt-3 px-4 py-2 bg-purple-100 text-purple-700 border border-purple-300 rounded-md hover:bg-purple-200 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
          </svg>
          <span>Browse Material Library</span>
        </button>

        {/* Material Properties Display */}
        {currentMaterial && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Material Properties</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Opacity:</span>
                <span>{(currentMaterial.properties.opacity * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Roughness:</span>
                <span>{(currentMaterial.properties.roughness * 100).toFixed(0)}%</span>
              </div>
              {currentMaterial.properties.metallic > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Metallic:</span>
                  <span>{(currentMaterial.properties.metallic * 100).toFixed(0)}%</span>
                </div>
              )}
              {currentMaterial.properties.reflectivity > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Reflective:</span>
                  <span>{(currentMaterial.properties.reflectivity * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Drag and Drop Hint */}
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          💡 Tip: Drag materials from the library directly onto elements in the canvas
        </div>
      </div>
    </div>
  );
}