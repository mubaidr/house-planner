'use client';

import React, { useState } from 'react';
import { useUIStore, Tool } from '@/stores/uiStore';

export default function ElementsSidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Structural Elements']);
  const { setActiveTool } = useUIStore();

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleElementClick = (elementName: string) => {
    // Map element names to tools
    const elementToToolMap: Record<string, Tool> = {
      'Wall': 'wall',
      'Door': 'door', 
      'Window': 'window',
      'Stairs': 'stair',
      'Roof': 'roof',
    };
    
    const tool = elementToToolMap[elementName];
    if (tool) {
      setActiveTool(tool);
    }
  };

  const elementCategories = [
    {
      name: 'Structural Elements',
      items: [
        { name: 'Wall', icon: '▬', description: 'Click to start drawing walls', tool: 'wall' },
        { name: 'Door', icon: '🚪', description: 'Click to place doors on walls', tool: 'door' },
        { name: 'Window', icon: '🪟', description: 'Click to place windows on walls', tool: 'window' },
      ],
    },
    {
      name: 'Advanced Elements',
      items: [
        { name: 'Stairs', icon: '🪜', description: 'Click to draw stairs between floors', tool: 'stair' },
        { name: 'Roof', icon: '🏠', description: 'Click to draw roof structures', tool: 'roof' },
      ],
    },
  ];

  // Filter elements based on search term
  const filteredCategories = elementCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Elements Library</h2>
        <p className="text-sm text-gray-600 mt-1">
          Click elements to activate drawing tools
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search elements..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Categories - Accordion Style */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map((category) => {
          const isExpanded = expandedCategories.includes(category.name);
          return (
            <div key={category.name} className="border-b border-gray-200">
              {/* Category Header - Clickable Accordion */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <h3 className="font-medium text-gray-800">{category.name}</h3>
                <span className={`transform transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : 'rotate-0'
                }`}>
                  &gt;
                </span>
              </button>
              
              {/* Category Items - Collapsible */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <div
                        key={item.name}
                        onClick={() => handleElementClick(item.name)}
                        className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                      >
                        <span className="text-xl mr-3">{item.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 group-hover:text-blue-700">{item.name}</div>
                          <div className="text-xs text-gray-600">{item.description}</div>
                        </div>
                        <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to use
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* No results message */}
        {filteredCategories.length === 0 && searchTerm && (
          <div className="p-4 text-center text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>No elements found for &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}