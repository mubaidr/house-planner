import React, { useState } from 'react';
import { 
  Camera, Eye, Grid, Lightbulb, Palette, 
  Settings, Maximize, RotateCcw, ZoomIn, 
  ZoomOut, Move, Target, Square
} from 'lucide-react';

interface ViewportManagerProps {
  activeViewport: string;
  className?: string;
  theme: 'light' | 'dark' | 'classic';
}

export function ViewportManager({ activeViewport, className = '', theme }: ViewportManagerProps) {
  const [showControls, setShowControls] = useState(false);
  const [viewportSettings, setViewportSettings] = useState({
    showGrid: true,
    showAxes: true,
    showLighting: true,
    wireframe: false,
    shadows: true,
    antialiasing: true
  });

  const toggleSetting = (setting: keyof typeof viewportSettings) => {
    setViewportSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className={`${className} select-none`}>
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-600">
        {/* Viewport Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-600">
          <div className="flex items-center space-x-2">
            <Camera size={14} />
            <span className="text-sm font-medium capitalize">{activeViewport}</span>
          </div>
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-1 hover:bg-gray-700 rounded"
            title="Viewport Settings"
          >
            <Settings size={14} />
          </button>
        </div>

        {/* Quick Controls */}
        <div className="p-2">
          <div className="grid grid-cols-3 gap-1">
            <button
              className="p-2 hover:bg-gray-700 rounded flex flex-col items-center"
              title="Zoom Extents"
              onClick={() => console.log('Zoom extents')}
            >
              <Maximize size={14} />
              <span className="text-xs mt-1">Fit</span>
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded flex flex-col items-center"
              title="Zoom In"
              onClick={() => console.log('Zoom in')}
            >
              <ZoomIn size={14} />
              <span className="text-xs mt-1">Zoom+</span>
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded flex flex-col items-center"
              title="Zoom Out"
              onClick={() => console.log('Zoom out')}
            >
              <ZoomOut size={14} />
              <span className="text-xs mt-1">Zoom-</span>
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded flex flex-col items-center"
              title="Pan"
              onClick={() => console.log('Pan')}
            >
              <Move size={14} />
              <span className="text-xs mt-1">Pan</span>
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded flex flex-col items-center"
              title="Rotate"
              onClick={() => console.log('Rotate')}
            >
              <RotateCcw size={14} />
              <span className="text-xs mt-1">Rotate</span>
            </button>
            <button
              className={`p-2 rounded flex flex-col items-center ${
                viewportSettings.showGrid 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-700'
              }`}
              title="Toggle Grid"
              onClick={() => toggleSetting('showGrid')}
            >
              <Grid size={14} />
              <span className="text-xs mt-1">Grid</span>
            </button>
          </div>
        </div>

        {/* Extended Controls */}
        {showControls && (
          <div className="border-t border-gray-600 p-2">
            <div className="space-y-2">
              <div className="text-xs text-gray-400 mb-2">Display Options</div>
              
              <div className="space-y-1">
                <label className="flex items-center justify-between text-xs">
                  <span>Show Axes</span>
                  <input
                    type="checkbox"
                    checked={viewportSettings.showAxes}
                    onChange={() => toggleSetting('showAxes')}
                    className="w-3 h-3"
                  />
                </label>
                
                <label className="flex items-center justify-between text-xs">
                  <span>Lighting</span>
                  <input
                    type="checkbox"
                    checked={viewportSettings.showLighting}
                    onChange={() => toggleSetting('showLighting')}
                    className="w-3 h-3"
                  />
                </label>
                
                <label className="flex items-center justify-between text-xs">
                  <span>Wireframe</span>
                  <input
                    type="checkbox"
                    checked={viewportSettings.wireframe}
                    onChange={() => toggleSetting('wireframe')}
                    className="w-3 h-3"
                  />
                </label>
                
                <label className="flex items-center justify-between text-xs">
                  <span>Shadows</span>
                  <input
                    type="checkbox"
                    checked={viewportSettings.shadows}
                    onChange={() => toggleSetting('shadows')}
                    className="w-3 h-3"
                  />
                </label>
                
                <label className="flex items-center justify-between text-xs">
                  <span>Anti-aliasing</span>
                  <input
                    type="checkbox"
                    checked={viewportSettings.antialiasing}
                    onChange={() => toggleSetting('antialiasing')}
                    className="w-3 h-3"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}