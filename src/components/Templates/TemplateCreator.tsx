'use client';

import React, { useState } from 'react';
import { MaterialTemplate, TemplateCategory, DesignStyle } from '@/types/materials/MaterialTemplate';
import { useTemplateStore } from '@/stores/templateStore';
import { useDesignStore } from '@/stores/designStore';
import { useMaterialStore } from '@/stores/materialStore';
import { TEMPLATE_CATEGORIES, DESIGN_STYLES } from '@/data/materialTemplates';

interface TemplateCreatorProps {
  onClose: () => void;
}

export default function TemplateCreator({ onClose }: TemplateCreatorProps) {
  const { addTemplate } = useTemplateStore();
  const { walls, doors, windows, rooms } = useDesignStore();
  const { getMaterialById } = useMaterialStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom' as TemplateCategory,
    style: 'contemporary' as DesignStyle,
    tags: [] as string[],
    includeWalls: true,
    includeDoors: true,
    includeWindows: true,
    includeRooms: true,
  });

  const [newTag, setNewTag] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field: string, value: string | boolean | TemplateCategory | DesignStyle) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const analyzeCurrentDesign = () => {
    const materials: { id: string; name: string; category: string }[] = [];
    let materialCount = 0;

    // Analyze walls
    if (formData.includeWalls) {
      walls.forEach(wall => {
        if (wall.materialId) {
          materials.push({
            elementType: 'wall',
            materialId: wall.materialId,
            priority: 1,
          });
          materialCount++;
        }
      });
    }

    // Analyze doors
    if (formData.includeDoors) {
      doors.forEach(door => {
        if (door.materialId) {
          materials.push({
            elementType: 'door',
            materialId: door.materialId,
            priority: 1,
          });
          materialCount++;
        }
      });
    }

    // Analyze windows
    if (formData.includeWindows) {
      windows.forEach(window => {
        if (window.materialId) {
          materials.push({
            elementType: 'window',
            materialId: window.materialId,
            priority: 1,
          });
          materialCount++;
        }
      });
    }

    // Analyze rooms
    if (formData.includeRooms) {
      rooms.forEach(room => {
        if (room.materialId) {
          materials.push({
            elementType: 'room',
            materialId: room.materialId,
            conditions: room.roomType ? [{
              type: 'roomType' as const,
              property: 'roomType',
              value: room.roomType,
              operator: 'equals' as const,
            }] : undefined,
            priority: 1,
          });
          materialCount++;
        }
      });
    }

    return { materials, materialCount };
  };

  const handleCreateTemplate = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    setIsCreating(true);

    try {
      const { materials } = analyzeCurrentDesign();

      const template: MaterialTemplate = {
        id: `template-${Date.now()}`,
        name: formData.name,
        description: formData.description || 'Custom template created from current design',
        category: formData.category,
        materials,
        designData: {
          walls: walls,
          doors: doors,
          windows: windows,
          stairs: [], // Assuming stairs are not yet part of the template creation logic
          roofs: [],   // Assuming roofs are not yet part of the template creation logic
          rooms: rooms,
        },
        metadata: {
          author: 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: formData.tags,
          style: formData.style,
          difficulty: 'intermediate',
          usageCount: 0,
        },
        isBuiltIn: false,
      };

      addTemplate(template);
      onClose();
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const { materials: analyzedMaterials, materialCount } = analyzeCurrentDesign();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Create Material Template</h2>
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
          {/* Template Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Template Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Design Style
                </label>
                <select
                  value={formData.style}
                  onChange={(e) => handleInputChange('style', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(DESIGN_STYLES).map(([key, style]) => (
                    <option key={key} value={key}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Describe this template..."
              />
            </div>
          </div>

          {/* Element Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Include Elements</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.includeWalls}
                  onChange={(e) => handleInputChange('includeWalls', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Walls ({walls.filter(w => w.materialId).length})</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.includeDoors}
                  onChange={(e) => handleInputChange('includeDoors', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Doors ({doors.filter(d => d.materialId).length})</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.includeWindows}
                  onChange={(e) => handleInputChange('includeWindows', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Windows ({windows.filter(w => w.materialId).length})</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.includeRooms}
                  onChange={(e) => handleInputChange('includeRooms', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Rooms ({rooms.filter(r => r.materialId).length})</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Tags</h3>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add a tag..."
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Add
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-purple-500 hover:text-purple-700"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Template Preview</h3>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">
                This template will include {materialCount} material applications:
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {analyzedMaterials.map((material, index) => {
                  const materialData = getMaterialById(material.materialId);
                  return (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{
                          backgroundColor: materialData?.color || '#ccc',
                        }}
                      />
                      <span className="capitalize">{material.elementType}:</span>
                      <span className="font-medium">{materialData?.name || 'Unknown Material'}</span>
                    </div>
                  );
                })}
              </div>
              
              {materialCount === 0 && (
                <div className="text-sm text-gray-500 italic">
                  No materials found in current design. Make sure to apply materials to elements before creating a template.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateTemplate}
            disabled={isCreating || !formData.name.trim() || materialCount === 0}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
}