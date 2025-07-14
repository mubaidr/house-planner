'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Material } from '@/types/materials/Material';
import { useMaterialStore } from '@/stores/materialStore';
import { MaterialRenderer2D, MaterialPatternUtils, MATERIAL_PATTERNS } from '@/utils/materialRenderer2D';
import { ViewType2D } from '@/types/views';

interface MaterialPreviewProps {
  material: Material;
  onEdit: () => void;
  onClose: () => void;
}

export default function MaterialPreview({ material, onEdit, onClose }: MaterialPreviewProps) {
  const { duplicateMaterial, removeMaterial } = useMaterialStore();
  const [selectedView, setSelectedView] = useState<ViewType2D | 'plan'>('plan');
  
  // Canvas refs for different view previews
  const planCanvasRef = useRef<HTMLCanvasElement>(null);
  const elevationCanvasRef = useRef<HTMLCanvasElement>(null);
  const patternCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate pattern previews for different views
  useEffect(() => {
    // Plan view preview
    if (planCanvasRef.current) {
      const canvas = planCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const previewCanvas = MaterialPatternUtils.generatePatternPreview(material, 200);
        ctx.drawImage(previewCanvas, 0, 0, canvas.width, canvas.height);
      }
    }

    // Elevation view preview
    if (elevationCanvasRef.current) {
      const canvas = elevationCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const renderer = new MaterialRenderer2D('front');
        const pattern = renderer.getMaterialPattern(material);
        const previewCanvas = renderer['generatePatternCanvas'](pattern, 1);
        ctx.drawImage(previewCanvas, 0, 0, canvas.width, canvas.height);
      }
    }

    // Large pattern detail preview
    if (patternCanvasRef.current) {
      const canvas = patternCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const previewCanvas = MaterialPatternUtils.generatePatternPreview(material, 300);
        ctx.drawImage(previewCanvas, 0, 0, canvas.width, canvas.height);
      }
    }
  }, [material]);

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

  // Get pattern information
  const getPatternInfo = () => {
    const renderer = new MaterialRenderer2D('plan');
    const pattern = renderer.getMaterialPattern(material);
    return {
      type: pattern.type,
      hasTexture: !!material.texture,
      isSeamless: material.properties.seamless !== false,
      scale: material.properties.patternScale || 1,
      rotation: material.properties.patternRotation || 0,
    };
  };

  const patternInfo = getPatternInfo();

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

      {/* Enhanced Pattern Preview */}
      <div className="p-4 bg-white border-b border-gray-200">
        {/* View Switcher */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setSelectedView('plan')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                selectedView === 'plan'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Plan
            </button>
            <button
              onClick={() => setSelectedView('front')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                selectedView === 'front'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Elevation
            </button>
          </div>
        </div>

        {/* Large Pattern Preview */}
        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 relative bg-white">
          <canvas
            ref={patternCanvasRef}
            width={300}
            height={300}
            className="w-full h-full object-cover"
            style={{
              imageRendering: 'pixelated',
            }}
          />
          
          {/* Fallback background */}
          <div
            className="absolute inset-0 w-full h-full -z-10"
            style={{
              backgroundColor: material.color,
              opacity: material.properties.opacity,
            }}
          />
          
          {/* Pattern Type Badge */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded-md font-mono">
              {patternInfo.type.toUpperCase()}
            </span>
          </div>
          
          {/* Metallic overlay */}
          {material.properties.metallic > 0.5 && (
            <div
              className="absolute inset-0 bg-gradient-to-br from-white to-transparent"
              style={{ opacity: material.properties.metallic * 0.3 }}
            />
          )}
        </div>
        
        {/* View Comparison */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="text-center">
            <div className="aspect-square rounded border border-gray-200 overflow-hidden mb-2">
              <canvas
                ref={planCanvasRef}
                width={100}
                height={100}
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <span className="text-xs text-gray-500">Plan View</span>
          </div>
          <div className="text-center">
            <div className="aspect-square rounded border border-gray-200 overflow-hidden mb-2">
              <canvas
                ref={elevationCanvasRef}
                width={100}
                height={100}
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <span className="text-xs text-gray-500">Elevation View</span>
          </div>
        </div>
      </div>

      {/* Pattern Analysis */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Pattern Analysis</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 font-mono text-blue-600">{patternInfo.type}</span>
          </div>
          <div>
            <span className="text-gray-500">Scale:</span>
            <span className="ml-2 font-mono">{patternInfo.scale}x</span>
          </div>
          <div>
            <span className="text-gray-500">Rotation:</span>
            <span className="ml-2 font-mono">{patternInfo.rotation}°</span>
          </div>
          <div>
            <span className="text-gray-500">Seamless:</span>
            <span className={`ml-2 font-mono ${patternInfo.isSeamless ? 'text-green-600' : 'text-orange-600'}`}>
              {patternInfo.isSeamless ? 'Yes' : 'No'}
            </span>
          </div>
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