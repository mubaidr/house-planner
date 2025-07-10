'use client';

import React, { useState, useEffect } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useWallEditor } from '@/hooks/useWallEditor';
import { UpdateWallCommand } from '@/utils/history';
import { Wall } from '@/types/elements/Wall';

export default function PropertiesPanel() {
  const { selectedElementId, selectedElementType, walls, doors, windows, updateWall } = useDesignStore();
  const { executeCommand } = useHistoryStore();
  const { deleteSelectedWall } = useWallEditor();
  
  const [editValues, setEditValues] = useState<Partial<Wall>>({});

  const getSelectedElement = () => {
    if (!selectedElementId || !selectedElementType) return null;
    
    switch (selectedElementType) {
      case 'wall':
        return walls.find(w => w.id === selectedElementId);
      case 'door':
        return doors.find(d => d.id === selectedElementId);
      case 'window':
        return windows.find(w => w.id === selectedElementId);
      default:
        return null;
    }
  };

  const selectedElement = getSelectedElement();

  // Update edit values when selection changes
  useEffect(() => {
    if (selectedElement && selectedElementType === 'wall') {
      setEditValues({
        color: selectedElement.color,
        thickness: (selectedElement as Wall).thickness,
        height: (selectedElement as Wall).height,
      });
    } else {
      setEditValues({});
    }
  }, [selectedElement, selectedElementType]);

  const handlePropertyChange = (property: keyof Wall, value: string | number) => {
    if (!selectedElement || !selectedElementId || selectedElementType !== 'wall') return;

    const originalWall = selectedElement as Wall;
    const newValue = property === 'color' ? value : Number(value);
    
    // Update edit values for immediate UI feedback
    setEditValues(prev => ({ ...prev, [property]: newValue }));

    // Create and execute command for undo/redo support
    const command = new UpdateWallCommand(
      selectedElementId,
      updateWall,
      originalWall,
      { [property]: newValue }
    );
    
    executeCommand(command);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
        <p className="text-sm text-gray-600 mt-1">
          Edit selected element properties
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedElement ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2 capitalize">
                {selectedElementType} Properties
              </h3>
              
              {/* Common properties */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={editValues.color || selectedElement.color}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                  />
                </div>

                {selectedElementType === 'wall' && 'thickness' in selectedElement && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thickness (px)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={editValues.thickness ?? selectedElement.thickness}
                        onChange={(e) => handlePropertyChange('thickness', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="1000"
                        value={editValues.height ?? selectedElement.height}
                        onChange={(e) => handlePropertyChange('height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Position information (read-only) */}
                {selectedElementType === 'wall' && 'startX' in selectedElement && (
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Position</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Start:</span> 
                        <span className="ml-1">({Math.round(selectedElement.startX)}, {Math.round(selectedElement.startY)})</span>
                      </div>
                      <div>
                        <span className="text-gray-500">End:</span> 
                        <span className="ml-1">({Math.round(selectedElement.endX)}, {Math.round(selectedElement.endY)})</span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="text-gray-500">Length:</span> 
                      <span className="ml-1">
                        {Math.round(Math.sqrt(
                          Math.pow(selectedElement.endX - selectedElement.startX, 2) + 
                          Math.pow(selectedElement.endY - selectedElement.startY, 2)
                        ))}px
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={deleteSelectedWall}
                    className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
                  >
                    Delete {selectedElementType}
                  </button>
                </div>

                {(selectedElementType === 'door' || selectedElementType === 'window') && 'width' in selectedElement && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={selectedElement.width}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={selectedElement.height}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        readOnly
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-4">📐</div>
            <p>Select an element to edit its properties</p>
          </div>
        )}
      </div>
    </div>
  );
}