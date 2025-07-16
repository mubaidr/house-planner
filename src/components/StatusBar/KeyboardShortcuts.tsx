'use client';

import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'File',
      items: [
        { key: 'Ctrl+S', description: 'Save project' },
        { key: 'Ctrl+O', description: 'Open project' },
        { key: 'Ctrl+E', description: 'Export project' },
      ]
    },
    {
      category: 'Tools',
      items: [
        { key: 'V', description: 'Select tool' },
        { key: 'W', description: 'Wall tool' },
        { key: 'D', description: 'Door tool' },
        { key: 'N', description: 'Window tool' },
        { key: 'S', description: 'Stair tool' },
        { key: 'R', description: 'Roof tool' },
        { key: 'M', description: 'Measure tool' },
      ]
    },
    {
      category: 'Edit',
      items: [
        { key: 'Ctrl+C', description: 'Copy selected element' },
        { key: 'Ctrl+V', description: 'Paste element' },
        { key: 'Ctrl+D', description: 'Duplicate element' },
        { key: 'Delete', description: 'Delete selected element' },
        { key: 'Ctrl+Z', description: 'Undo' },
        { key: 'Ctrl+Y', description: 'Redo' },
        { key: 'Ctrl+Shift+Z', description: 'Redo (alternative)' },
      ]
    },
    {
      category: 'View',
      items: [
        { key: '1', description: 'Plan view' },
        { key: '2', description: 'Front view' },
        { key: '3', description: 'Back view' },
        { key: '4', description: 'Left view' },
        { key: '5', description: 'Right view' },
        { key: 'Ctrl++', description: 'Zoom in' },
        { key: 'Ctrl+-', description: 'Zoom out' },
        { key: 'Ctrl+0', description: 'Reset zoom' },
      ]
    },
    {
      category: 'Navigation',
      items: [
        { key: 'Escape', description: 'Cancel current operation' },
        { key: 'Right-click', description: 'Context menu' },
        { key: 'Enter', description: 'Edit selected element' },
        { key: 'F4', description: 'Toggle properties panel' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Keyboard className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shortcuts.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.items.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700">{shortcut.description}</span>
                      <div className="flex items-center space-x-1">
                        {shortcut.key.split('+').map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-gray-400 text-sm">+</span>
                            )}
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Tip:</strong> Most shortcuts work when the canvas has focus.
              </p>
              <p>
                <strong>Context Menu:</strong> Right-click on any element for quick actions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
