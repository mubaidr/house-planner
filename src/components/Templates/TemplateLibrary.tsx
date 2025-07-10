'use client';

import React, { useState } from 'react';
import { useTemplateStore } from '@/stores/templateStore';
import { TEMPLATE_CATEGORIES, DESIGN_STYLES } from '@/data/materialTemplates';
import { TemplateCategory, DesignStyle } from '@/types/materials/MaterialTemplate';
import TemplateCard from './TemplateCard';
import TemplatePreview from './TemplatePreview';
import TemplateCreator from './TemplateCreator';

export default function TemplateLibrary() {
  const {
    isTemplateLibraryOpen,
    setTemplateLibraryOpen,
    selectedCategory,
    setSelectedCategory,
    selectedStyle,
    setSelectedStyle,
    searchQuery,
    setSearchQuery,
    getFilteredTemplates,
    selectedTemplateId,
    setSelectedTemplate,
    getTemplateById,
    isCreatingTemplate,
    setCreatingTemplate,
  } = useTemplateStore();

  const [showPreview, setShowPreview] = useState(false);

  const filteredTemplates = getFilteredTemplates();
  const selectedTemplate = selectedTemplateId ? getTemplateById(selectedTemplateId) : null;

  const handleCreateTemplate = () => {
    setCreatingTemplate(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowPreview(true);
  };

  if (!isTemplateLibraryOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Material Templates</h2>
              <p className="text-sm text-gray-600">{filteredTemplates.length} templates available</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateTemplate}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Template</span>
            </button>
            
            <button
              onClick={() => setTemplateLibraryOpen(false)}
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
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filters */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>🎯</span>
                      <span>All Categories</span>
                    </div>
                  </button>
                  
                  {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key as TemplateCategory)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === key
                          ? 'bg-purple-100 text-purple-700'
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

              {/* Design Styles */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Design Style</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedStyle('all')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedStyle === 'all'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Styles
                  </button>
                  
                  {Object.entries(DESIGN_STYLES).map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedStyle(key as DesignStyle)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedStyle === key
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-sm">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplateId === template.id}
                    onSelect={() => handleTemplateSelect(template.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Template Creator Modal */}
      {isCreatingTemplate && (
        <TemplateCreator
          onClose={() => setCreatingTemplate(false)}
        />
      )}
    </div>
  );
}