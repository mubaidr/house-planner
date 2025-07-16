'use client';

import React from 'react';
import Image from 'next/image';
import { MaterialTemplate } from '@/types/materials/MaterialTemplate';
import { useTemplateStore } from '@/stores/templateStore';
import { useMaterialStore } from '@/stores/materialStore';

interface TemplatePreviewProps {
  template: MaterialTemplate;
  onClose: () => void;
}

export default function TemplatePreview({ template, onClose }: TemplatePreviewProps) {
  const { applyTemplate, duplicateTemplate, removeTemplate } = useTemplateStore();
  const { getMaterialById } = useMaterialStore();

  const handleApplyTemplate = async () => {
    try {
      await applyTemplate(template.id);
      onClose();
    } catch (error) {
      console.error('Failed to apply template:', error);
    }
  };

  const handleDuplicate = () => {
    duplicateTemplate(template.id);
    onClose();
  };

  const handleDelete = () => {
    if (template.isBuiltIn) {
      alert('Built-in templates cannot be deleted.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      removeTemplate(template.id);
      onClose();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStyleIcon = (style: string) => {
    const icons: Record<string, string> = {
      modern: '✨',
      contemporary: '🏢',
      traditional: '🏛️',
      industrial: '⚙️',
      scandinavian: '❄️',
      mediterranean: '🌊',
      rustic: '🌲',
      minimalist: '⚪',
      luxury: '💎',
      eclectic: '🎨',
    };
    return icons[style] || '🏠';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{getStyleIcon(template.metadata.style)}</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{template.name}</h2>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Template Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Template Information</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{template.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Style:</span>
                  <span className="font-medium capitalize">{template.metadata.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(template.metadata.difficulty)}`}>
                    {template.metadata.difficulty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Materials:</span>
                  <span className="font-medium">{template.materials.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Author:</span>
                  <span className="font-medium">{template.metadata.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium">{template.metadata.usageCount} times</span>
                </div>
                {template.metadata.rating && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-medium">{template.metadata.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Cost Estimate */}
              {template.metadata.estimatedCost && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Estimated Cost</h4>
                  <div className="text-2xl font-bold text-green-600">
                    ${template.metadata.estimatedCost.min}-${template.metadata.estimatedCost.max}
                  </div>
                  <div className="text-sm text-green-600">
                    per {template.metadata.estimatedCost.unit}
                  </div>
                </div>
              )}
            </div>

            {/* Template Preview */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Preview</h3>

              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                {template.thumbnail ? (
                  <Image
                    src={template.thumbnail}
                    alt={template.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">{getStyleIcon(template.metadata.style)}</div>
                    <div className="text-gray-500">No preview available</div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {template.metadata.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Materials List */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Materials Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {template.materials.map((templateMaterial, index) => {
                const material = getMaterialById(templateMaterial.materialId);
                if (!material) return null;

                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {/* Material Preview */}
                    <div
                      className="w-12 h-12 rounded border border-gray-300 flex-shrink-0"
                      style={{
                        backgroundColor: material.color,
                        backgroundImage: material.texture ? `url(${material.texture})` : undefined,
                        backgroundRepeat: 'repeat',
                        backgroundSize: `${(material.properties.patternScale || 1) * 16}px`,
                        opacity: material.properties.opacity,
                      }}
                    />

                    {/* Material Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {material.name}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        For {templateMaterial.elementType}s
                      </div>
                      {templateMaterial.conditions && templateMaterial.conditions.length > 0 && (
                        <div className="text-xs text-blue-600">
                          Conditional application
                        </div>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="text-xs text-gray-400">
                      Priority: {templateMaterial.priority}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={handleDuplicate}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Duplicate
            </button>

            {!template.isBuiltIn && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleApplyTemplate}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Apply Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
