import { useDesignStore } from '@/stores/designStore';

export function ToolPanel() {
  const { addWall, addRoom, walls, rooms } = useDesignStore();

  const createSampleWall = () => {
    addWall({
      startX: Math.random() * 10 - 5,
      startY: Math.random() * 10 - 5,
      endX: Math.random() * 10 + 5,
      endY: Math.random() * 10 + 5,
      thickness: 0.2,
      height: 3,
      color: '#f3f4f6',
      materialId: 'wall-default',
    });
  };

  const createSampleRoom = () => {
    addRoom({
      name: `Room ${rooms.length + 1}`,
      points: [
        { x: -3, y: -3 },
        { x: 3, y: -3 },
        { x: 3, y: 3 },
        { x: -3, y: 3 },
      ],
      roomType: 'living',
      floorMaterialId: 'floor-wood',
      ceilingHeight: 3,
    });
  };

  const clearAll = () => {
    const state = useDesignStore.getState();
    walls.forEach(wall => state.deleteWall(wall.id));
    rooms.forEach(room => state.deleteRoom(room.id));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Tools</h3>

      <div className="space-y-2">
        <button
          onClick={createSampleWall}
          className="w-full px-3 py-2 bg-primary-500 text-white text-sm rounded hover:bg-primary-600"
        >
          Add Wall
        </button>

        <button
          onClick={createSampleRoom}
          className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
        >
          Add Room
        </button>

        <button
          onClick={clearAll}
          className="w-full px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Clear All
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Walls: {walls.length}</div>
          <div>Rooms: {rooms.length}</div>
        </div>
      </div>
    </div>
  );
}
