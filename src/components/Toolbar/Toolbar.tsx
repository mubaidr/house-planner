'use client';

import React, { useState } from 'react';
import { useUIStore, Tool } from '@/stores/uiStore';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { saveDesign, loadDesign, getSavedDesigns, loadAutoSave } from '@/utils/storage';
import ToolButton from './ToolButton';
import ExportButton from './ExportButton';
import MaterialsButton from './MaterialsButton';

interface ToolbarProps {
  stageRef?: React.RefObject<any>;
}

export default function Toolbar({ stageRef }: ToolbarProps) {
  const { activeTool, setActiveTool, toggleSidebar, togglePropertiesPanel } = useUIStore();
  const { walls, doors, windows, addWall, addDoor, addWindow, clearAll } = useDesignStore();
  const { undo, redo, canUndo, canRedo, getUndoDescription, getRedoDescription } = useHistoryStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [designName, setDesignName] = useState('');

  const tools: { id: Tool; label: string; icon: string; shortcut?: string }[] = [
    { id: 'select', label: 'Select', icon: '↖', shortcut: 'V' },
    { id: 'measure', label: 'Measure', icon: '📏', shortcut: 'M' },
  ];

  const handleSave = () => {
    if (!designName.trim()) {
      setShowSaveDialog(true);
      return;
    }

    const designData = { walls, doors, windows };
    saveDesign(designName, designData);
    setShowSaveDialog(false);
    setDesignName('');
    alert('Design saved successfully!');
  };

  const handleLoad = (designId: string) => {
    const design = loadDesign(designId);
    if (design) {
      clearAll();
      design.data.walls.forEach(wall => addWall(wall));
      design.data.doors.forEach(door => addDoor(door));
      design.data.windows.forEach(window => addWindow(window));
      setShowLoadDialog(false);
      alert('Design loaded successfully!');
    }
  };

  const handleLoadAutoSave = () => {
    const autoSaveData = loadAutoSave();
    if (autoSaveData) {
      clearAll();
      autoSaveData.walls.forEach(wall => addWall(wall));
      autoSaveData.doors.forEach(door => addDoor(door));
      autoSaveData.windows.forEach(window => addWindow(window));
      alert('Auto-save loaded successfully!');
    } else {
      alert('No auto-save data found.');
    }
  };

  const savedDesigns = getSavedDesigns();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white">
      {/* Left side - Main tools */}
      <div className="flex items-center space-x-1">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          title="Toggle Sidebar"
        >
          ☰
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Undo/Redo buttons */}
        <button
          onClick={undo}
          disabled={!canUndo()}
          className={`p-2 rounded transition-colors ${
            canUndo()
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title={`Undo${getUndoDescription() ? `: ${getUndoDescription()}` : ''} (Ctrl+Z)`}
        >
          ↶
        </button>

        <button
          onClick={redo}
          disabled={!canRedo()}
          className={`p-2 rounded transition-colors ${
            canRedo()
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title={`Redo${getRedoDescription() ? `: ${getRedoDescription()}` : ''} (Ctrl+Y)`}
        >
          ↷
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {tools.map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool.id}
            label={tool.label}
            icon={tool.icon}
            shortcut={tool.shortcut}
            isActive={activeTool === tool.id}
            onClick={() => setActiveTool(tool.id)}
          />
        ))}
      </div>

      {/* Center - App title and tool info */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-gray-800">2D House Planner</h1>
        <p className="text-xs text-gray-500 mt-1">
          Active Tool: <span className="capitalize font-medium">{activeTool}</span>
        </p>
      </div>

      {/* Right side - View and panel controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          title="Save Design"
        >
          Save
        </button>

        <button
          onClick={() => setShowLoadDialog(true)}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          title="Load Design"
        >
          Load
        </button>

        {/* Materials Button */}
        <MaterialsButton />

        {/* Export Button */}
        <ExportButton stage={stageRef?.current} />

        <button
          onClick={handleLoadAutoSave}
          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
          title="Load Auto-save"
        >
          Auto-save
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={togglePropertiesPanel}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          title="Toggle Properties Panel"
        >
          ⚙️
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Design</h3>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="Enter design name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!designName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Load Design</h3>
            {savedDesigns.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No saved designs found.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {savedDesigns.map((design) => (
                  <div
                    key={design.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{design.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(design.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLoad(design.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
