'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Material, MaterialCategory, MaterialProperties } from '@/types/materials/Material';
import { useMaterialStore } from '@/stores/materialStore';
import { MATERIAL_CATEGORIES } from '@/data/materialLibrary';

interface MaterialEditorProps {
  materialId: string | null; // null for creating new material
  onClose: () => void;
}

export default function MaterialEditor({ materialId, onClose }: MaterialEditorProps) {
  const { getMaterialById, addMaterial, updateMaterial } = useMaterialStore();

  const existingMaterial = materialId ? getMaterialById(materialId) : null;
  const isEditing = !!existingMaterial;

  const [formData, setFormData] = useState<Partial<Material>>({
    name: '',
    category: 'wall',
    color: '#FFFFFF',
    properties: {
      opacity: 1,
      roughness: 0.5,
      metallic: 0,
      reflectivity: 0.1,
      patternScale: 1,
      patternRotation: 0,
      seamless: true,
    },
    metadata: {
      description: '',
      tags: [],
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const [newTag, setNewTag] = useState('');
  const [, setTextureFile] = useState<File | null>(null);
  const [texturePreview, setTexturePreview] = useState<string>('');

  useEffect(() => {
    if (existingMaterial) {
      setFormData(existingMaterial);
      if (existingMaterial.textureImage) {
        setTexturePreview(existingMaterial.textureImage);
      }
    }
  }, [existingMaterial]);

  const handleInputChange = (field: string, value: string | MaterialCategory) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePropertiesChange = (field: keyof MaterialProperties, value: number | boolean) => {
    setFormData(prev => ({
      ...prev,
      properties: {
        ...prev.properties!,
        [field]: value,
      },
    }));
  };

  const handleMetadataChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        [field]: value,
      },
    }));
  };

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTextureFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setTexturePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.metadata?.tags.includes(newTag.trim())) {
      handleMetadataChange('tags', [...(formData.metadata?.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleMetadataChange('tags', formData.metadata?.tags.filter(tag => tag !== tagToRemove) || []);
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('Please enter a material name');
      return;
    }

    const materialData: Material = {
      id: existingMaterial?.id || `material-${Date.now()}`,
      name: formData.name,
      category: formData.category as MaterialCategory,
      color: formData.color || '#FFFFFF',
      textureImage: texturePreview || undefined,
      properties: formData.properties as MaterialProperties,
      cost: formData.cost || {
        pricePerUnit: 0,
        unit: 'sqft',
        currency: 'USD',
        lastUpdated: new Date()
      },
      metadata: {
        ...formData.metadata!,
        updatedAt: new Date(),
      },
    };

    if (isEditing) {
      updateMaterial(materialData.id, materialData);
    } else {
      addMaterial(materialData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Material' : 'Create New Material'}
          </h2>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter material name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category || 'wall'}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(MATERIAL_CATEGORIES).map(([key, category]) => (
                        <option key={key} value={key}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.metadata?.description || ''}
                      onChange={(e) => handleMetadataChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe this material..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={formData.metadata?.manufacturer || ''}
                      onChange={(e) => handleMetadataChange('manufacturer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Manufacturer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Code
                    </label>
                    <input
                      type="text"
                      value={formData.metadata?.productCode || ''}
                      onChange={(e) => handleMetadataChange('productCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Product code or SKU"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Cost</h4>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost?.pricePerUnit ?? ''}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            cost: {
                              ...prev.cost,
                              pricePerUnit: parseFloat(e.target.value) || 0,
                              unit: prev.cost?.unit || 'sqft',
                              currency: prev.cost?.currency || 'USD',
                              lastUpdated: new Date(),
                            },
                          }))
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Price"
                      />
                      <select
                        value={formData.cost?.unit ?? 'sqft'}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            cost: {
                              ...prev.cost,
                              pricePerUnit: prev.cost?.pricePerUnit || 0,
                              unit: e.target.value as 'sqft' | 'sqm' | 'linear_ft' | 'linear_m' | 'piece',
                              currency: prev.cost?.currency || 'USD',
                              lastUpdated: new Date(),
                            },
                          }))
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="sqft">sqft</option>
                        <option value="sqm">sqm</option>
                        <option value="linear_ft">linear_ft</option>
                        <option value="linear_m">linear_m</option>
                        <option value="piece">piece</option>
                      </select>
                      <input
                        type="text"
                        value={formData.cost?.currency ?? 'USD'}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            cost: {
                              ...prev.cost,
                              pricePerUnit: prev.cost?.pricePerUnit || 0,
                              unit: prev.cost?.unit || 'sqft',
                              currency: e.target.value,
                              lastUpdated: new Date(),
                            },
                          }))
                        }
                        className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Currency"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>

                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a tag..."
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {formData.metadata?.tags && formData.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
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
              </div>
            </div>

            {/* Right Column - Visual Properties */}
            <div className="space-y-6">
              {/* Visual Properties */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Visual Properties</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.color || '#FFFFFF'}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color || '#FFFFFF'}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texture Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTextureUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {texturePreview && (
                      <div className="mt-2">
                        <Image
                          src={texturePreview}
                          alt="Texture preview"
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover border border-gray-300 rounded"
                        />
                      </div>
                    )}
                  </div>

                  {/* Property Sliders */}
                  {[
                    { key: 'opacity', label: 'Opacity', min: 0, max: 1, step: 0.01 },
                    { key: 'roughness', label: 'Roughness', min: 0, max: 1, step: 0.01 },
                    { key: 'metallic', label: 'Metallic', min: 0, max: 1, step: 0.01 },
                    { key: 'reflectivity', label: 'Reflectivity', min: 0, max: 1, step: 0.01 },
                    { key: 'patternScale', label: 'Pattern Scale', min: 0.1, max: 5, step: 0.1 },
                    { key: 'patternRotation', label: 'Pattern Rotation', min: 0, max: 360, step: 1 },
                  ].map(({ key, label, min, max, step }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}: {(formData.properties?.[key as keyof MaterialProperties] as number || 0).toFixed(key === 'patternRotation' ? 0 : 2)}
                        {key === 'patternRotation' ? '°' : key.includes('Scale') ? 'x' : ''}
                      </label>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={formData.properties?.[key as keyof MaterialProperties] as number || 0}
                        onChange={(e) => handlePropertiesChange(key as keyof MaterialProperties, parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Material Preview */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-300 relative">
                  {texturePreview ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: formData.color,
                        backgroundImage: `url(${texturePreview})`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: `${((formData.properties?.patternScale || 1) * 64)}px`,
                        transform: `rotate(${formData.properties?.patternRotation || 0}deg)`,
                        opacity: formData.properties?.opacity || 1,
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: formData.color,
                        opacity: formData.properties?.opacity || 1,
                      }}
                    />
                  )}

                  {/* Metallic overlay */}
                  {(formData.properties?.metallic || 0) > 0.5 && (
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-white to-transparent"
                      style={{ opacity: (formData.properties?.metallic || 0) * 0.3 }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Update Material' : 'Create Material'}
          </button>
        </div>
      </div>
    </div>
  );
}
