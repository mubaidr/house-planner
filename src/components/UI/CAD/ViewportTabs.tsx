import { Box, Camera, Grid3X3, Maximize, Plus } from 'lucide-react';
import React from 'react';

interface ViewportTabsProps {
  activeViewport: string;
  onViewportChange: (viewport: string) => void;
  theme: 'light' | 'dark' | 'classic';
}

interface Viewport {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  shortcut?: string;
}

const viewports: Viewport[] = [
  {
    id: 'perspective',
    name: 'Perspective',
    icon: <Box size={14} />,
    description: '3D Perspective View',
    shortcut: 'Ctrl+1',
  },
  {
    id: 'top',
    name: 'Top',
    icon: <Grid3X3 size={14} />,
    description: 'Top View (Plan)',
    shortcut: 'Ctrl+2',
  },
  {
    id: 'front',
    name: 'Front',
    icon: <Box size={14} />,
    description: 'Front Elevation',
    shortcut: 'Ctrl+3',
  },
  {
    id: 'right',
    name: 'Right',
    icon: <Box size={14} />,
    description: 'Right Elevation',
    shortcut: 'Ctrl+4',
  },
  {
    id: 'isometric',
    name: 'Isometric',
    icon: <Box size={14} />,
    description: 'Isometric View',
    shortcut: 'Ctrl+5',
  },
];

export function ViewportTabs({ activeViewport, onViewportChange, theme }: ViewportTabsProps) {
  return (
    <div
      className={`flex items-center border-b border-gray-600 ${
        theme === 'dark' ? 'bg-gray-800' : theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
      }`}
    >
      {/* Viewport Tabs */}
      <div className="flex items-center">
        {viewports.map(viewport => (
          <button
            key={viewport.id}
            onClick={() => onViewportChange(viewport.id)}
            className={`px-4 py-2 text-sm flex items-center space-x-2 border-r border-gray-600 transition-colors ${
              activeViewport === viewport.id
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'hover:bg-gray-700'
            }`}
            title={`${viewport.description}${viewport.shortcut ? ` (${viewport.shortcut})` : ''}`}
          >
            {viewport.icon}
            <span>{viewport.name}</span>
          </button>
        ))}
      </div>

      {/* Viewport Controls */}
      <div className="flex items-center ml-auto mr-2 space-x-1">
        <button className="p-1 hover:bg-gray-700 rounded" title="Add New Viewport">
          <Plus size={14} />
        </button>

        <button className="p-1 hover:bg-gray-700 rounded" title="Viewport Settings">
          <Camera size={14} />
        </button>

        <button className="p-1 hover:bg-gray-700 rounded" title="Maximize Viewport">
          <Maximize size={14} />
        </button>
      </div>
    </div>
  );
}
