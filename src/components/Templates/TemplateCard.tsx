'use client';

import React from 'react';
import Image from 'next/image';
import { MaterialTemplate } from '@/types/materials/MaterialTemplate';
import { useTemplateStore } from '@/stores/templateStore';

interface TemplateCardProps {
  template: MaterialTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

export default function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const { applyTemplate, calculateTemplateCost } = useTemplateStore();

  const cost = calculateTemplateCost(template.id);

  const handleApplyTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await applyTemplate(template.id);
      console.log(`Applied template: ${template.name}`);
    } catch (error) {
      console.error('Failed to apply template:', error);
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
    <div
      className={`relative bg-white rounded-lg border-2 transition-all cursor-pointer group hover:shadow-lg ${
        isSelected
          ? 'border-purple-500 shadow-lg'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* Template Preview/Thumbnail */}
      <div className="aspect-video rounded-t-lg overflow-hidden relative bg-gradient-to-br from-gray-100 to-gray-200">
        {template.thumbnail ? (
          <Image
            src={template.thumbnail}
            alt={template.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">{getStyleIcon(template.metadata.style)}</div>
              <div className="text-sm text-gray-500 font-medium">{template.metadata.style}</div>
            </div>
          </div>
        )}
        
        {/* Built-in badge */}
        {template.isBuiltIn && (
          <div className="absolute top-2 left-2">
            <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
              Built-in
            </div>
          </div>
        )}

        {/* Rating */}
        {template.metadata.rating && (
          <div className="absolute top-2 right-2">
            <div className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full flex items-center space-x-1">
              <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{template.metadata.rating.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Apply button overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
          <button
            onClick={handleApplyTemplate}
            className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transform scale-95 hover:scale-100"
          >
            Apply Template
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight" title={template.name}>
            {template.name}
          </h3>
          <div className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(template.metadata.difficulty)}`}>
            {template.metadata.difficulty}
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mb-3 line-clamp-2" title={template.description}>
          {template.description}
        </p>

        {/* Template Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{template.materials.length} materials</span>
          <span className="capitalize">{template.category}</span>
        </div>

        {/* Cost */}
        {cost && (
          <div className="text-sm font-medium text-green-600 mb-3">
            ${cost.min}-${cost.max}/{cost.currency === 'USD' ? 'sq ft' : 'sq m'}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.metadata.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {template.metadata.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{template.metadata.tags.length - 3}
            </span>
          )}
        </div>

        {/* Usage count */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>by {template.metadata.author}</span>
          <span>{template.metadata.usageCount} uses</span>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-purple-500 rounded-lg pointer-events-none">
          <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}