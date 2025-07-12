'use client';

import React, { useState } from 'react';
import { useFloorStore } from '@/stores/floorStore';

export default function FloorSwitcher() {
  const {
    floors,
    currentFloorId,
    showAllFloors,
    floorOpacity,
    setCurrentFloor,
    addFloor,
    removeFloor,
    duplicateFloor,
    toggleFloorVisibility,
    setShowAllFloors,
    setFloorOpacity,
    moveFloorUp,
    moveFloorDown,
    getFloorsOrderedByLevel,
    getTotalFloors,
  } = useFloorStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showFloorOptions, setShowFloorOptions] = useState<string | null>(null);
  const [newFloorName, setNewFloorName] = useState('');
  const [isAddingFloor, setIsAddingFloor] = useState(false);

  const orderedFloors = getFloorsOrderedByLevel();
  const currentFloor = floors.find(f => f.id === currentFloorId);

  const handleAddFloor = () => {
    if (isAddingFloor) {
      const name = newFloorName.trim() || undefined;
      addFloor(name);
      setNewFloorName('');
      setIsAddingFloor(false);
    } else {
      setIsAddingFloor(true);
    }
  };

  const handleCancelAddFloor = () => {
    setIsAddingFloor(false);
    setNewFloorName('');
  };

  const handleRemoveFloor = (floorId: string) => {
    if (getTotalFloors() > 1) {
      removeFloor(floorId);
      setShowFloorOptions(null);
    }
  };

  const handleDuplicateFloor = (floorId: string) => {
    const floor = floors.find(f => f.id === floorId);
    if (floor) {
      duplicateFloor(floorId, `${floor.name} (Copy)`);
      setShowFloorOptions(null);
    }
  };

  const getFloorIcon = (level: number) => {
    const icons = ['🏠', '🏢', '🏗️', '🏛️', '🏰', '🗼'];
    return icons[level] || '🏢';
  };

  return (
    <div className="fixed top-20 left-4 z-40">
      {/* Main Floor Switcher Button */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          title="Floor Switcher"
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">{currentFloor ? getFloorIcon(currentFloor.level) : '🏠'}</span>
            <div className="text-left">
              <div className="font-medium text-gray-900 text-sm">
                {currentFloor?.name || 'No Floor Selected'}
              </div>
              <div className="text-xs text-gray-500">
                {getTotalFloors()} floor{getTotalFloors() !== 1 ? 's' : ''} total
              </div>
            </div>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded Floor List */}
        {isExpanded && (
          <div className="border-t border-gray-200">
            {/* Floor List */}
            <div className="max-h-80 overflow-y-auto">
              {orderedFloors.map((floor) => (
                <div
                  key={floor.id}
                  className={`relative group ${
                    currentFloorId === floor.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => setCurrentFloor(floor.id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getFloorIcon(floor.level)}</span>
                      <div>
                        <div className={`font-medium text-sm ${
                          currentFloorId === floor.id ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {floor.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Level {floor.level} • {floor.elements.walls.length} walls
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {/* Visibility Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFloorVisibility(floor.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          floor.isVisible ? 'text-blue-600 hover:bg-blue-100' : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={floor.isVisible ? 'Hide floor' : 'Show floor'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {floor.isVisible ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          )}
                        </svg>
                      </button>

                      {/* Floor Options Menu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFloorOptions(showFloorOptions === floor.id ? null : floor.id);
                        }}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Floor options"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </button>

                  {/* Floor Options Dropdown */}
                  {showFloorOptions === floor.id && (
                    <div className="absolute right-2 top-12 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-40">
                      <button
                        onClick={() => handleDuplicateFloor(floor.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Duplicate</span>
                      </button>
                      
                      <button
                        onClick={() => moveFloorUp(floor.id)}
                        disabled={floor.level >= getTotalFloors() - 1}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                        <span>Move Up</span>
                      </button>
                      
                      <button
                        onClick={() => moveFloorDown(floor.id)}
                        disabled={floor.level <= 0}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                        <span>Move Down</span>
                      </button>
                      
                      {getTotalFloors() > 1 && (
                        <button
                          onClick={() => handleRemoveFloor(floor.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Floor Section */}
            <div className="border-t border-gray-200 p-3">
              {isAddingFloor ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newFloorName}
                    onChange={(e) => setNewFloorName(e.target.value)}
                    placeholder="Floor name (optional)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFloor()}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddFloor}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Floor
                    </button>
                    <button
                      onClick={handleCancelAddFloor}
                      className="px-3 py-2 text-gray-600 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddFloor}
                  className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Floor</span>
                </button>
              )}
            </div>

            {/* Floor Display Options */}
            <div className="border-t border-gray-200 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Show All Floors</label>
                <button
                  onClick={() => setShowAllFloors(!showAllFloors)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    showAllFloors ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      showAllFloors ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {showAllFloors && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Other Floors Opacity: {Math.round(floorOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={floorOpacity}
                    onChange={(e) => setFloorOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {(isExpanded || showFloorOptions) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsExpanded(false);
            setShowFloorOptions(null);
          }}
        />
      )}
    </div>
  );
}