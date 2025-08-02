import { useDesignStore } from '@/stores/designStore';

export function ToolPanel() {
  const { addWall, addRoom, addDoor, addWindow, walls, rooms, doors, windows } = useDesignStore();

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

  const createSampleDoor = () => {
    // For demo purposes, place door at a random 3D position
    addDoor({
      wallId: walls.length > 0 ? walls[0].id : 'demo-wall',
      position: { x: Math.random() * 5, y: 0, z: Math.random() * 5 },
      width: 0.9,
      height: 2.1,
      thickness: 0.05,
      openDirection: Math.random() > 0.5 ? 'left' : 'right',
      color: '#8B4513',
      materialId: 'door-wood',
      properties3D: {
        frameThickness: 0.08,
        panelStyle: 'solid',
        handleStyle: 'modern'
      }
    });
  };

  const createSampleWindow = () => {
    // For demo purposes, place window at a random 3D position
    addWindow({
      wallId: walls.length > 0 ? walls[0].id : 'demo-wall',
      position: { x: Math.random() * 5, y: 1, z: Math.random() * 5 },
      width: 1.2,
      height: 1.5,
      thickness: 0.15,
      sillHeight: 1.0,
      color: '#FFFFFF',
      materialId: 'window-frame',
      properties3D: {
        frameThickness: 0.08,
        glassType: 'clear',
        frameStyle: 'modern'
      }
    });
  };

  const clearAll = () => {
    const state = useDesignStore.getState();
    walls.forEach(wall => state.deleteWall(wall.id));
    rooms.forEach(room => state.deleteRoom(room.id));
    doors.forEach(door => state.deleteDoor(door.id));
    windows.forEach(window => state.deleteWindow(window.id));
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
          onClick={createSampleDoor}
          className="w-full px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
        >
          Add Door
        </button>

        <button
          onClick={createSampleWindow}
          className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Add Window
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
          <div>Doors: {doors.length}</div>
          <div>Windows: {windows.length}</div>
        </div>
      </div>
    </div>
  );
}
