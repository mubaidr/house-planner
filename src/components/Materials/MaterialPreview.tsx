'use client';

import React from 'react';
import { Material } from '@/types/materials/Material';
import { useMaterialStore } from '@/stores/materialStore';

interface MaterialPreviewProps {
  material: Material;
  onEdit: () => void;
  onClose: () => void;
}

export default function MaterialPreview({ material, onEdit, onClose }: MaterialPreviewProps) {
  const { duplicateMaterial, removeMaterial } = useMaterialStore();

  const handleDuplicate = () => {
    duplicateMaterial(material.id);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${material.name}"?`)) {
      removeMaterial(material.id);
      onClose();
    }
  };

  const formatProperty = (value: number, suffix: string = '') => {
    return `${(value * 100).toFixed(0)}%${suffix}`;
  };

  const formatCost = () => {
    if (!material.cost) return 'No pricing';
    return `$${material.cost.pricePerUnit.toFixed(2)} per ${material.cost.unit}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{material.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600">{material.metadata.description}</p>
      </div>

      {/* Large Preview */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 relative">
          {material.texture ? (
            <div
              className="w-full h-full"
              style={{
                backgroundColor: material.color,
                backgroundImage: `url(${material.texture})`,
                backgroundRepeat: 'repeat',
                backgroundSize: `${(material.properties.patternScale || 1) * 64}px`,
                transform: `rotate(${material.properties.patternRotation || 0}deg)`,
                opacity: material.properties.opacity,
              }}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                backgroundColor: material.color,
                opacity: material.properties.opacity,
              }}
            />
          )}
          
          {/* Metallic overlay */}
          {material.properties.metallic > 0.5 && (
            <div
              className="absolute inset-0 bg-gradient-to-br from-white to-transparent"
              style={{ opacity: material.properties.metallic * 0.3 }}
            />
          )}
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic Info */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="capitalize font-medium">{material.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Color:</span>
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: material.color }}
                />
                <span className="font-mono text-xs">{material.color}</span>
              </div>
            </div>
            {material.metadata.manufacturer && (
              <div className="flex justify-between">
                <span className="text-gray-600">Manufacturer:</span>
                <span className="font-medium">{material.metadata.manufacturer}</span>
              </div>
            )}
            {material.metadata.productCode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Product Code:</span>
                <span className="font-mono text-xs">{material.metadata.productCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Visual Properties */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Visual Properties</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Opacity:</span>
              <span>{formatProperty(material.properties.opacity)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Roughness:</span>
              <span>{formatProperty(material.properties.roughness)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Metallic:</span>
              <span>{formatProperty(material.properties.metallic)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reflectivity:</span>
              <span>{formatProperty(material.properties.reflectivity)}</span>
            </div>
            {material.texture && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pattern Scale:</span>
                  <span>{material.properties.patternScale || 1}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pattern Rotation:</span>
                  <span>{material.properties.patternRotation || 0}°</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Physical Properties */}
        {(material.properties.density || material.properties.thermalConductivity || material.properties.soundAbsorption) && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Physical Properties</h4>
            <div className="space-y-2 text-sm">
              {material.properties.density && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Density:</span>
                  <span>{material.properties.density} kg/m³</span>
                </div>
              )}
              {material.properties.thermalConductivity && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thermal Conductivity:</span>
                  <span>{material.properties.thermalConductivity} W/m·K</span>
                </div>
              )}
              {material.properties.soundAbsorption && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sound Absorption:</span>
                  <span>{formatProperty(material.properties.soundAbsorption)}</span>
                </div>
              )}
              {material.properties.fireResistance && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fire Resistance:</span>
                  <span className="font-medium">{material.properties.fireResistance.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cost Information */}
        {material.cost && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Cost Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium text-green-600">{formatCost()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span>{material.cost.currency}</span>
              </div>
              {material.cost.supplier && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Supplier:</span>
                  <span>{material.cost.supplier}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {material.metadata.tags.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {material.metadata.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-white space-y-2">
        <button
          onClick={onEdit}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit Material
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={handleDuplicate}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Duplicate
          </button>
          
          {material.metadata.isCustom && (
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}