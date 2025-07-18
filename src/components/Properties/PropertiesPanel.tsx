'use client';

import React, { useState, useEffect } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useUnitStore } from '@/stores/unitStore';
import RoomPropertiesPanel from './RoomPropertiesPanel';
import StairPropertiesPanel from './StairPropertiesPanel';
import RoofPropertiesPanel from './RoofPropertiesPanel';
import UnitSettings from '../Settings/UnitSettings';
import { useWallEditor } from '@/hooks/useWallEditor';
import { useDoorEditor } from '@/hooks/useDoorEditor';
import { useWindowEditor } from '@/hooks/useWindowEditor';
import { UpdateWallCommand, UpdateDoorCommand, UpdateWindowCommand } from '@/utils/history';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Stair } from '@/types/elements/Stair';
import { Roof } from '@/types/elements/Roof';

export default function PropertiesPanel() {
  const { selectedElementId, selectedElementType, walls, doors, windows, stairs, roofs, rooms, updateWall, updateDoor, updateWindow, updateStair, updateRoof, updateRoom, removeStair, removeRoof } = useDesignStore();
  const { executeCommand } = useHistoryStore();
  const { deleteSelectedWall } = useWallEditor();
  const { deleteSelectedDoor } = useDoorEditor();
  const { deleteSelectedWindow } = useWindowEditor();
  
  const [editValues, setEditValues] = useState<Record<string, string | number>>({});

  const getSelectedElement = () => {
    if (!selectedElementId || !selectedElementType) return null;
    
    switch (selectedElementType) {
      case 'wall':
        return walls.find(w => w.id === selectedElementId);
      case 'door':
        return doors.find(d => d.id === selectedElementId);
      case 'window':
        return windows.find(w => w.id === selectedElementId);
      case 'stair':
        return stairs.find(s => s.id === selectedElementId);
      case 'roof':
        return roofs.find(r => r.id === selectedElementId);
      case 'room':
        return rooms.find(r => r.id === selectedElementId);
      default:
        return null;
    }
  };

  const selectedElement = getSelectedElement();

  // Update edit values when selection changes
  useEffect(() => {
    if (selectedElement) {
      switch (selectedElementType) {
        case 'wall':
          const wall = selectedElement as Wall;
          setEditValues({
            color: wall.color,
            thickness: wall.thickness,
            height: wall.height,
          });
          break;
        case 'door':
          const door = selectedElement as Door;
          setEditValues({
            color: door.color,
            width: door.width,
            height: door.height,
            swingDirection: door.swingDirection,
            style: door.style,
          });
          break;
        case 'window':
          const window = selectedElement as Window;
          setEditValues({
            color: window.color,
            width: window.width,
            height: window.height,
            style: window.style,
            opacity: window.opacity,
          });
          break;
        default:
          setEditValues({});
      }
    } else {
      setEditValues({});
    }
  }, [selectedElement, selectedElementType]);

  const handlePropertyChange = (property: string, value: string | number) => {
    if (!selectedElement || !selectedElementId || !selectedElementType) return;

    // Update edit values for immediate UI feedback
    setEditValues(prev => ({ ...prev, [property]: value }));

    // Create and execute appropriate command based on element type
    switch (selectedElementType) {
      case 'wall':
        const originalWall = selectedElement as Wall;
        const wallValue = property === 'color' ? value : Number(value);
        const wallCommand = new UpdateWallCommand(
          selectedElementId,
          updateWall,
          originalWall,
          { [property]: wallValue }
        );
        executeCommand(wallCommand);
        break;
        
      case 'door':
        const originalDoor = selectedElement as Door;
        let doorValue: string | number = value;
        if (property === 'width' || property === 'height') {
          doorValue = Number(value);
        }
        const doorCommand = new UpdateDoorCommand(
          selectedElementId,
          updateDoor,
          originalDoor,
          { [property]: doorValue }
        );
        executeCommand(doorCommand);
        break;
        
      case 'window':
        const originalWindow = selectedElement as Window;
        let windowValue: string | number = value;
        if (property === 'width' || property === 'height' || property === 'opacity') {
          windowValue = Number(value);
        }
        const windowCommand = new UpdateWindowCommand(
          selectedElementId,
          updateWindow,
          originalWindow,
          { [property]: windowValue }
        );
        executeCommand(windowCommand);
        break;
    }
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
          selectedElementType === 'room' ? (
            <RoomPropertiesPanel 
              room={selectedElement as import('@/utils/roomDetection').Room}
              onUpdate={updateRoom}
            />
          ) : selectedElementType === 'stair' ? (
            <StairPropertiesPanel
              stair={selectedElement as Stair}
              onUpdate={(updates) => {
                executeCommand({
                  type: 'UPDATE_STAIR',
                  execute: () => updateStair(selectedElementId, updates),
                  undo: () => updateStair(selectedElementId, selectedElement as Stair),
                  description: 'Update stair properties',
                });
              }}
              onDelete={() => {
                executeCommand({
                  type: 'DELETE_STAIR',
                  execute: () => removeStair(selectedElementId),
                  undo: () => updateStair(selectedElementId, selectedElement as Stair),
                  description: 'Delete stair',
                });
              }}
            />
          ) : selectedElementType === 'roof' ? (
            <RoofPropertiesPanel
              roof={selectedElement as Roof}
              onUpdate={(updates) => {
                executeCommand({
                  type: 'UPDATE_ROOF',
                  execute: () => updateRoof(selectedElementId, updates),
                  undo: () => updateRoof(selectedElementId, selectedElement as Roof),
                  description: 'Update roof properties',
                });
              }}
              onDelete={() => {
                executeCommand({
                  type: 'DELETE_ROOF',
                  execute: () => removeRoof(selectedElementId),
                  undo: () => updateRoof(selectedElementId, selectedElement as Roof),
                  description: 'Delete roof',
                });
              }}
            />
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2 capitalize">
                  {selectedElementType} Properties
                </h3>
              </div>
              
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

                {/* Wall-specific properties */}
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

                {/* Door-specific properties */}
                {selectedElementType === 'door' && 'width' in selectedElement && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width {useUnitStore().showUnitLabels ? (useUnitStore().unitSystem === 'metric' ? '(m)' : '(ft)') : ''}
                      </label>
                      <input
                        type="number"
                        min="0.4"
                        max="2"
                        step="0.1"
                        value={(editValues.width ?? selectedElement.width) / 100}
                        onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value) * 100)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height {useUnitStore().showUnitLabels ? (useUnitStore().unitSystem === 'metric' ? '(m)' : '(ft)') : ''}
                      </label>
                      <input
                        type="number"
                        min="1.5"
                        max="2.5"
                        step="0.1"
                        value={(editValues.height ?? selectedElement.height) / 100}
                        onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value) * 100)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Swing Direction
                      </label>
                      <select
                        value={editValues.swingDirection ?? (selectedElement as Door).swingDirection}
                        onChange={(e) => handlePropertyChange('swingDirection', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="inward">Inward</option>
                        <option value="outward">Outward</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Style
                      </label>
                      <select
                        value={editValues.style ?? (selectedElement as Door).style}
                        onChange={(e) => handlePropertyChange('style', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="sliding">Sliding</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Window-specific properties */}
                {selectedElementType === 'window' && 'width' in selectedElement && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        min="60"
                        max="300"
                        value={editValues.width ?? selectedElement.width}
                        onChange={(e) => handlePropertyChange('width', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        min="40"
                        max="150"
                        value={editValues.height ?? selectedElement.height}
                        onChange={(e) => handlePropertyChange('height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Style
                      </label>
                      <select
                        value={editValues.style ?? (selectedElement as Window).style}
                        onChange={(e) => handlePropertyChange('style', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="casement">Casement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opacity
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={editValues.opacity ?? (selectedElement as Window).opacity}
                        onChange={(e) => handlePropertyChange('opacity', e.target.value)}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round((Number(editValues.opacity ?? (selectedElement as Window).opacity) * 100))}%
                      </div>
                    </div>
                  </>
                )}

                {/* Position information (read-only) */}
                {selectedElementType === 'wall' && 'startX' in selectedElement && (() => {
                  const { unitSystem, precision, showUnitLabels } = useUnitStore();
                  const { formatLength } = require('@/utils/unitUtils');
                  
                  // Calculate length in pixels
                  const lengthPx = Math.sqrt(
                    Math.pow(selectedElement.endX - selectedElement.startX, 2) + 
                    Math.pow(selectedElement.endY - selectedElement.startY, 2)
                  );
                  
                  // Convert to meters (assuming 100px = 1m)
                  const lengthInMeters = lengthPx / 100;
                  
                  return (
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Position</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Start:</span> 
                          <span className="ml-1">
                            ({formatLength(selectedElement.startX / 100, unitSystem, precision, showUnitLabels)}, 
                             {formatLength(selectedElement.startY / 100, unitSystem, precision, showUnitLabels)})
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">End:</span> 
                          <span className="ml-1">
                            ({formatLength(selectedElement.endX / 100, unitSystem, precision, showUnitLabels)}, 
                             {formatLength(selectedElement.endY / 100, unitSystem, precision, showUnitLabels)})
                          </span>
                        </div>
                      </div>
                      <div className="mt-1">
                        <span className="text-gray-500">Length:</span> 
                        <span className="ml-1">
                          {formatLength(lengthInMeters, unitSystem, precision, showUnitLabels)}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Actions */}
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      switch (selectedElementType) {
                        case 'wall':
                          deleteSelectedWall();
                          break;
                        case 'door':
                          deleteSelectedDoor();
                          break;
                        case 'window':
                          deleteSelectedWindow();
                          break;
                      }
                    }}
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
          )
        ) : (
          <div className="space-y-6">
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-4">📐</div>
              <p>Select an element to edit its properties</p>
            </div>
            
            {/* Show unit settings when no element is selected */}
            <UnitSettings />
          </div>
        )}
      </div>
    </div>
  );
}