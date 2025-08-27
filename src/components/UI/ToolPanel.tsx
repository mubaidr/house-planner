import { useDesignStore } from '@/stores/designStore';
import { useState } from 'react';
import { ExportDialog } from './ExportDialog';
import { GridControls } from './GridControls';

export function ToolPanel() {
  const addWall = useDesignStore(state => state.addWall);
  const addDoor = useDesignStore(state => state.addDoor);
  const addWindow = useDesignStore(state => state.addWindow);
  const addStair = useDesignStore(state => state.addStair);
  const addRoom = useDesignStore(state => state.addRoom);
  const walls = useDesignStore(state => state.walls);
  const activeTool = useDesignStore(state => state.activeTool);
  const setActiveTool = useDesignStore(state => state.setActiveTool);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tools');

  const handleAddWall = () => {
    // Add a random wall for testing
    addWall({
      start: { x: Math.random() * 10 - 5, y: 0, z: Math.random() * 10 - 5 },
      end: { x: Math.random() * 10 - 5, y: 0, z: Math.random() * 10 - 5 },
      height: 2.5 + Math.random() * 1,
      thickness: 0.2 + Math.random() * 0.1,
      type: 'load-bearing',
    });
  };

  const handleAddDoor = () => {
    // Add a door to the first wall if available
    if (walls.length > 0) {
      addDoor({
        wallId: walls[0].id,
        position: 50, // Middle of wall
        width: 0.8 + Math.random() * 0.2,
        height: 2.0 + Math.random() * 0.2,
        thickness: 0.05 + Math.random() * 0.05,
        type: 'hinged',
        swingDirection: 'left',
        isOpen: false,
        openAngle: 0,
        openOffset: 0,
      });
    } else {
      alert('Please add a wall first');
    }
  };

  const handleAddWindow = () => {
    // Add a window to the first wall if available
    if (walls.length > 0) {
      addWindow({
        wallId: walls[0].id,
        position: 70, // 70% along the wall
        width: 1.2 + Math.random() * 0.3,
        height: 1.5 + Math.random() * 0.3,
        thickness: 0.05 + Math.random() * 0.05,
        type: 'double',
        glazing: 'double',
      });
    } else {
      alert('Please add a wall first');
    }
  };

  const handleAddStair = (type: 'straight' | 'l-shaped' | 'u-shaped' | 'spiral' = 'straight') => {
    // Add a stair
    addStair({
      start: { x: Math.random() * 10 - 5, y: 0, z: Math.random() * 10 - 5 },
      end: { x: Math.random() * 10 - 5, y: 0, z: Math.random() * 10 - 5 },
      steps: 16,
      stepHeight: 0.15,
      stepDepth: 0.3,
      width: 1.2,
      type: type,
      radius: type === 'spiral' ? 2 : undefined,
    });
  };

  const handleAddRoom = () => {
    // Add a room with the first few walls
    if (walls.length > 0) {
      addRoom({
        wallIds: walls.slice(0, Math.min(4, walls.length)).map(w => w.id),
        name: `Room ${Date.now()}`,
      });
    } else {
      alert('Please add walls first');
    }
  };

  const clearAll = useDesignStore(state => state.clearAll);

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all elements?')) {
      clearAll();
    }
  };

  const handleToolToggle = (tool: 'wall' | 'room' | 'measure' | 'select') => {
    setActiveTool(activeTool === tool ? null : tool);
  };

  return (
    <>
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg w-80">
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'tools' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'view' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
          >
            View
          </button>
        </div>

        {activeTab === 'tools' && (
          <div className="space-y-2">
            <button
              onClick={() => handleToolToggle('wall')}
              className={`w-full px-3 py-2 text-white rounded hover:opacity-90 transition ${
                activeTool === 'wall' ? 'bg-blue-700' : 'bg-blue-500'
              }`}
            >
              {activeTool === 'wall' ? 'Drawing Wall (Click to Cancel)' : 'Draw Wall'}
            </button>
            <button
              onClick={() => handleToolToggle('room')}
              className={`w-full px-3 py-2 text-white rounded hover:opacity-90 transition ${
                activeTool === 'room' ? 'bg-purple-700' : 'bg-purple-500'
              }`}
            >
              {activeTool === 'room' ? 'Creating Room (Click to Cancel)' : 'Create Room'}
            </button>
            <button
              onClick={() => handleToolToggle('select')}
              className={`w-full px-3 py-2 text-white rounded hover:opacity-90 transition ${
                activeTool === 'select' ? 'bg-gray-700' : 'bg-gray-500'
              }`}
            >
              {activeTool === 'select' ? 'Selection Mode (Click to Cancel)' : 'Select & Manipulate'}
            </button>
            <button
              onClick={() => handleToolToggle('measure')}
              className={`w-full px-3 py-2 text-white rounded hover:opacity-90 transition ${
                activeTool === 'measure' ? 'bg-teal-700' : 'bg-teal-500'
              }`}
            >
              {activeTool === 'measure' ? 'Measuring (Click to Cancel)' : 'Measure Tool'}
            </button>
            <button
              onClick={handleAddWall}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Add Wall (Random)
            </button>
            <button
              onClick={handleAddDoor}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Add Door
            </button>
            <button
              onClick={handleAddWindow}
              className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              Add Window
            </button>
            <button
              onClick={() => handleAddStair('straight')}
              className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Add Straight Stairs
            </button>
            <button
              onClick={() => handleAddStair('l-shaped')}
              className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Add L-Shaped Stairs
            </button>
            <button
              onClick={() => handleAddStair('u-shaped')}
              className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Add U-Shaped Stairs
            </button>
            <button
              onClick={() => handleAddStair('spiral')}
              className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Add Spiral Stairs
            </button>
            <button
              onClick={handleAddRoom}
              className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            >
              Add Room (Random)
            </button>
            <button
              onClick={handleClearAll}
              className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsExportDialogOpen(true)}
              className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Export
            </button>
          </div>
        )}

        {activeTab === 'view' && <GridControls />}
      </div>
      <ExportDialog isOpen={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)} />
    </>
  );
}
