import { useDesignStore } from '@/stores/designStore';

export function ToolPanel() {
  const addWall = useDesignStore(state => state.addWall);
  const addDoor = useDesignStore(state => state.addDoor);
  const addWindow = useDesignStore(state => state.addWindow);
  const addStair = useDesignStore(state => state.addStair);
  const addRoom = useDesignStore(state => state.addRoom);
  const walls = useDesignStore(state => state.walls);

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
      });
    } else {
      alert('Please add a wall first');
    }
  };

  const handleAddStair = () => {
    // Add a stair
    addStair({
      start: { x: Math.random() * 10 - 5, y: 0, z: Math.random() * 10 - 5 },
      end: { x: Math.random() * 10 - 5, y: 0, z: Math.random() * 10 - 5 },
      steps: 10,
      stepHeight: 0.15,
      stepDepth: 0.3,
      width: 1.2,
      type: 'straight',
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

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all elements?')) {
      // We would need to implement a clearAll action in the store
      // For now, we'll just alert
      alert('Clear all functionality would be implemented here');
    }
  };

  return (
    <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold mb-2">Tools</h2>
      <div className="space-y-2">
        <button
          onClick={handleAddWall}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Add Wall
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
          onClick={handleAddStair}
          className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
        >
          Add Stairs
        </button>
        <button
          onClick={handleAddRoom}
          className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
        >
          Add Room
        </button>
        <button
          onClick={handleClearAll}
          className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
