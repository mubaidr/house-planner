'use client';

import React, { useState } from 'react';
import { useMaterialStore } from '@/stores/materialStore';
import { MATERIAL_CATEGORIES } from '@/data/materialLibrary';
import { MaterialCategory } from '@/types/materials/Material';
import MaterialCard from './MaterialCard';
import MaterialEditor from './MaterialEditor';
import MaterialPreview from './MaterialPreview';

export default function MaterialLibrary() {
  const {
    isLibraryOpen,
    setLibraryOpen,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    getFilteredMaterials,
    selectedMaterialId,
    setSelectedMaterial,
    getMaterialById,
  } = useMaterialStore();

  const [showEditor, setShowEditor] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);

  const filteredMaterials = getFilteredMaterials();
  const selectedMaterial = selectedMaterialId ? getMaterialById(selectedMaterialId) : null;

  const handleEditMaterial = (materialId: string) => {
    setEditingMaterialId(materialId);
    setShowEditor(true);
  };

  const handleCreateMaterial = () => {
    setEditingMaterialId(null);
    setShowEditor(true);
  };

  if (!isLibraryOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Material Library</h2>
              <p className="text-sm text-gray-600">{filteredMaterials.length} materials available</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateMaterial}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Material</span>
            </button>

            <button
              onClick={() => setLibraryOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>🎯</span>
                    <span>All Materials</span>
                  </div>
                </button>

                {Object.entries(MATERIAL_CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as MaterialCategory)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Materials Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
                  <p className="text-gray-500">Try adjusting your search or category filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMaterials.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      isSelected={selectedMaterialId === material.id}
                      onSelect={() => setSelectedMaterial(material.id)}
                      onEdit={() => handleEditMaterial(material.id)}
                      onDuplicate={() => useMaterialStore.getState().duplicateMaterial(material.id)}
                      onRemove={() => useMaterialStore.getState().removeMaterial(material.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Material Preview */}
            {selectedMaterial && (
              <div className="w-80 border-l border-gray-200">
                <MaterialPreview
                  material={selectedMaterial}
                  onEdit={() => handleEditMaterial(selectedMaterial.id)}
                  onClose={() => setSelectedMaterial(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Material Editor Modal */}
      {showEditor && (
        <MaterialEditor
          materialId={editingMaterialId}
          onClose={() => {
            setShowEditor(false);
            setEditingMaterialId(null);
          }}
        />
      )}
    </div>
  );
}
