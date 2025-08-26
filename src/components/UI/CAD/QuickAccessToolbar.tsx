import {
  ClipboardPaste,
  Copy,
  Download,
  FileText,
  FolderOpen,
  Grid,
  Layers,
  Maximize,
  Redo,
  Save,
  Search,
  Settings,
  Square,
  Target,
  Undo,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface QuickAccessToolbarProps {
  height: number;
  theme: 'light' | 'dark' | 'classic';
}

interface QuickTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  separator?: boolean;
}

export function QuickAccessToolbar({ height, theme }: QuickAccessToolbarProps) {
  const [customTools, setCustomTools] = useState<string[]>([]);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const defaultTools: QuickTool[] = [
    {
      id: 'new',
      name: 'New',
      icon: <FileText size={16} />,
      shortcut: 'Ctrl+N',
      action: () => console.log('New file'),
    },
    {
      id: 'open',
      name: 'Open',
      icon: <FolderOpen size={16} />,
      shortcut: 'Ctrl+O',
      action: () => console.log('Open file'),
    },
    {
      id: 'save',
      name: 'Save',
      icon: <Save size={16} />,
      shortcut: 'Ctrl+S',
      action: () => console.log('Save file'),
    },
    { separator: true, id: 'sep1', name: '', icon: null, action: () => {} },
    {
      id: 'undo',
      name: 'Undo',
      icon: <Undo size={16} />,
      shortcut: 'Ctrl+Z',
      action: () => console.log('Undo'),
    },
    {
      id: 'redo',
      name: 'Redo',
      icon: <Redo size={16} />,
      shortcut: 'Ctrl+Y',
      action: () => console.log('Redo'),
    },
    { separator: true, id: 'sep2', name: '', icon: null, action: () => {} },
    {
      id: 'copy',
      name: 'Copy',
      icon: <Copy size={16} />,
      shortcut: 'Ctrl+C',
      action: () => console.log('Copy'),
    },
    {
      id: 'paste',
      name: 'Paste',
      icon: <ClipboardPaste size={16} />,
      shortcut: 'Ctrl+V',
      action: () => console.log('Paste'),
    },
    { separator: true, id: 'sep3', name: '', icon: null, action: () => {} },
    {
      id: 'zoom-in',
      name: 'Zoom In',
      icon: <ZoomIn size={16} />,
      action: () => console.log('Zoom in'),
    },
    {
      id: 'zoom-out',
      name: 'Zoom Out',
      icon: <ZoomOut size={16} />,
      action: () => console.log('Zoom out'),
    },
    {
      id: 'zoom-extents',
      name: 'Zoom Extents',
      icon: <Maximize size={16} />,
      shortcut: 'Ctrl+E',
      action: () => console.log('Zoom extents'),
    },
    { separator: true, id: 'sep4', name: '', icon: null, action: () => {} },
    {
      id: 'grid',
      name: 'Grid',
      icon: <Grid size={16} />,
      shortcut: 'F7',
      action: () => console.log('Toggle grid'),
    },
    {
      id: 'snap',
      name: 'Snap',
      icon: <Target size={16} />,
      shortcut: 'F9',
      action: () => console.log('Toggle snap'),
    },
    {
      id: 'ortho',
      name: 'Ortho',
      icon: <Square size={16} />,
      shortcut: 'F8',
      action: () => console.log('Toggle ortho'),
    },
  ];

  const availableTools: QuickTool[] = [
    ...defaultTools,
    {
      id: 'import',
      name: 'Import',
      icon: <Upload size={16} />,
      action: () => console.log('Import'),
    },
    {
      id: 'export',
      name: 'Export',
      icon: <Download size={16} />,
      action: () => console.log('Export'),
    },
    {
      id: 'layers',
      name: 'Layers',
      icon: <Layers size={16} />,
      action: () => console.log('Layers'),
    },
    {
      id: 'search',
      name: 'Search',
      icon: <Search size={16} />,
      shortcut: 'Ctrl+F',
      action: () => console.log('Search'),
    },
  ];

  const visibleTools = defaultTools.concat(
    availableTools.filter(tool => customTools.includes(tool.id))
  );

  const addCustomTool = useCallback((toolId: string) => {
    setCustomTools(prev => {
      if (!prev.includes(toolId)) {
        return [...prev, toolId];
      }
      return prev;
    });
  }, []);

  const removeCustomTool = useCallback((toolId: string) => {
    setCustomTools(prev => prev.filter(id => id !== toolId));
  }, []);

  return (
    <div
      className={`w-full border-b border-gray-600 flex items-center px-2 relative ${
        theme === 'dark' ? 'bg-gray-800' : theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
      }`}
      style={{ height }}
    >
      {/* Quick Access Tools */}
      <div className="flex items-center space-x-1">
        {visibleTools.map(tool => {
          if (tool.separator) {
            return <div key={tool.id} className="w-px h-6 bg-gray-600 mx-1" />;
          }

          return (
            <button
              key={tool.id}
              onClick={tool.action}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title={`${tool.name}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
            >
              {tool.icon}
            </button>
          );
        })}
      </div>

      {/* Customize Button */}
      <div className="ml-auto">
        <button
          onClick={() => setShowCustomizer(!showCustomizer)}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Customize Quick Access Toolbar"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Customizer Dropdown */}
      {showCustomizer && (
        <div className="absolute top-full right-2 mt-1 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-3">
            <div className="text-sm font-medium mb-2">Customize Toolbar</div>
            <div className="text-xs text-gray-400 mb-3">
              Add or remove tools from the quick access toolbar
            </div>

            <div className="space-y-2">
              {availableTools
                .filter(tool => !tool.separator && !defaultTools.some(dt => dt.id === tool.id))
                .map(tool => (
                  <div key={tool.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {tool.icon}
                      <span className="text-sm">{tool.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (customTools.includes(tool.id)) {
                          removeCustomTool(tool.id);
                        } else {
                          addCustomTool(tool.id);
                        }
                      }}
                      className={`text-xs px-2 py-1 rounded ${
                        customTools.includes(tool.id)
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {customTools.includes(tool.id) ? 'Remove' : 'Add'}
                    </button>
                  </div>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-600">
              <button
                onClick={() => setCustomTools([])}
                className="text-xs text-gray-400 hover:text-white"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
