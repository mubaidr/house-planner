'use client';

import React from 'react';
import { Material } from '@/types/materials/Material';

interface MaterialCardProps {
  material: Material;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export default function MaterialCard({ material, isSelected, onSelect, onEdit }: MaterialCardProps) {
  // const { applyMaterial } = useMaterialStore(); // TODO: Implement material application

  const handleDragStart = (e: React.DragEvent) => {
    const dragData = {
      type: 'material',
      materialId: material.id,
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Store drag data globally for canvas drop handling
    (window as unknown as { currentDragData: typeof dragData }).currentDragData = dragData;
  };

  const handleDragEnd = () => {
    // Clean up global drag data
    delete (window as unknown as { currentDragData?: unknown }).currentDragData;
  };

  const getCostDisplay = () => {
    if (!material.cost) return null;
    return `$${material.cost.pricePerUnit.toFixed(2)}/${material.cost.unit}`;
  };

  return (
    <div
      className={`relative bg-white rounded-lg border-2 transition-all cursor-pointer group ${
        isSelected
          ? 'border-blue-500 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={onSelect}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Material Preview */}
      <div className="aspect-square rounded-t-lg overflow-hidden relative">
        {material.texture ? (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: material.color,
              backgroundImage: `url(${material.texture})`,
              backgroundRepeat: 'repeat',
              backgroundSize: `${(material.properties.patternScale || 1) * 32}px`,
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
        
        {/* Overlay for metallic/reflective materials */}
        {material.properties.metallic > 0.5 && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-white to-transparent"
            style={{ opacity: material.properties.metallic * 0.3 }}
          />
        )}
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* Actions overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
            title="Edit material"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        {/* Custom material indicator */}
        {material.metadata.isCustom && (
          <div className="absolute top-2 left-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Material Info */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm mb-1 truncate" title={material.name}>
          {material.name}
        </h3>
        
        <p className="text-xs text-gray-500 mb-2 line-clamp-2" title={material.metadata.description}>
          {material.metadata.description}
        </p>

        {/* Properties */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span className="capitalize">{material.category}</span>
          {material.metadata.manufacturer && (
            <span className="truncate ml-2">{material.metadata.manufacturer}</span>
          )}
        </div>

        {/* Cost */}
        {material.cost && (
          <div className="text-xs font-medium text-green-600">
            {getCostDisplay()}
          </div>
        )}

        {/* Properties indicators */}
        <div className="flex items-center space-x-1 mt-2">
          {material.properties.metallic > 0.5 && (
            <div className="w-4 h-4 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full" title="Metallic" />
          )}
          {material.properties.reflectivity > 0.5 && (
            <div className="w-4 h-4 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full" title="Reflective" />
          )}
          {material.texture && (
            <div className="w-4 h-4 bg-gradient-to-r from-amber-200 to-amber-400 rounded-full" title="Textured" />
          )}
          {material.properties.fireResistance === 'A' && (
            <div className="w-4 h-4 bg-red-500 rounded-full" title="Fire Resistant" />
          )}
        </div>
      </div>

      {/* Drag indicator */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </div>
    </div>
  );
}