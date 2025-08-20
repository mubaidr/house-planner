import type { Door, Wall, Window } from '@/stores/designStore';
import { useDesignStore } from '@/stores/designStore';

export function PropertiesPanel() {
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectedElementType = useDesignStore(state => state.selectedElementType);
  const { walls, doors, windows } = useDesignStore(state => ({
    walls: state.walls,
    doors: state.doors,
    windows: state.windows,
  })) as { walls: Wall[]; doors: Door[]; windows: Window[] };
  const updateWall = useDesignStore(state => state.updateWall);
  const updateDoor = useDesignStore(state => state.updateDoor);
  const updateWindow = useDesignStore(state => state.updateWindow);

  // Get the selected element
  const selectedElement = (() => {
    if (!selectedElementId || !selectedElementType) return null;

    switch (selectedElementType) {
      case 'wall':
        return walls.find(w => w.id === selectedElementId);
      case 'door':
        return doors.find(d => d.id === selectedElementId);
      case 'window':
        return windows.find(w => w.id === selectedElementId);
      default:
        return null;
    }
  })();

  // If no element is selected, show a message
  if (!selectedElement) {
    return (
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-bold mb-2">Properties</h2>
        <p className="text-gray-500">Select an element to view and edit its properties</p>
      </div>
    );
  }

  // Render properties based on element type
  return (
    <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg w-80">
      <h2 className="text-lg font-bold mb-2">
        {selectedElementType
          ? selectedElementType.charAt(0).toUpperCase() + selectedElementType.slice(1)
          : ''}{' '}
        Properties
      </h2>

      {selectedElementType === 'wall' && selectedElement && (
        <WallProperties wall={selectedElement as Wall} onUpdate={updateWall} />
      )}

      {selectedElementType === 'door' && selectedElement && (
        <DoorProperties door={selectedElement as Door} onUpdate={updateDoor} />
      )}

      {selectedElementType === 'window' && selectedElement && (
        <WindowProperties window={selectedElement as Window} onUpdate={updateWindow} />
      )}
    </div>
  );
}

// Wall properties component
function WallProperties({
  wall,
  onUpdate,
}: {
  wall: Wall;
  onUpdate: (id: string, updates: Partial<Wall>) => void;
}) {
  const handleChange = (field: string, value: any) => {
    onUpdate(wall.id, { [field]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Height (m)</label>
        <input
          type="number"
          step="0.1"
          value={wall.height}
          onChange={e => handleChange('height', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Thickness (m)</label>
        <input
          type="number"
          step="0.01"
          value={wall.thickness}
          onChange={e => handleChange('thickness', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={wall.type}
          onChange={e => handleChange('type', e.target.value as any)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="load-bearing">Load Bearing</option>
          <option value="partition">Partition</option>
        </select>
      </div>
    </div>
  );
}

// Door properties component
function DoorProperties({
  door,
  onUpdate,
}: {
  door: Door;
  onUpdate: (id: string, updates: Partial<Door>) => void;
}) {
  const handleChange = (field: string, value: any) => {
    onUpdate(door.id, { [field]: value });
  };

  const handleToggleOpen = () => {
    onUpdate(door.id, { isOpen: !door.isOpen });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Width (m)</label>
        <input
          type="number"
          step="0.1"
          value={door.width}
          onChange={e => handleChange('width', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Height (m)</label>
        <input
          type="number"
          step="0.1"
          value={door.height}
          onChange={e => handleChange('height', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={door.type}
          onChange={e => handleChange('type', e.target.value as any)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="hinged">Hinged</option>
          <option value="sliding">Sliding</option>
          <option value="folding">Folding</option>
          <option value="revolving">Revolving</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Swing Direction</label>
        <select
          value={door.swingDirection}
          onChange={e => handleChange('swingDirection', e.target.value as any)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="flex items-center">
        <label className="block text-sm font-medium text-gray-700 mr-2">Open</label>
        <button
          onClick={handleToggleOpen}
          className={`px-3 py-1 rounded transition ${
            door.isOpen ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {door.isOpen ? 'Open' : 'Closed'}
        </button>
      </div>

      {door.type === 'hinged' && door.isOpen && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Open Angle (°)</label>
          <input
            type="range"
            min="0"
            max="90"
            value={door.openAngle}
            onChange={e => handleChange('openAngle', parseInt(e.target.value))}
            className="mt-1 block w-full"
          />
          <div className="text-right text-sm text-gray-500">{door.openAngle}°</div>
        </div>
      )}

      {door.type === 'sliding' && door.isOpen && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Open Offset</label>
          <input
            type="range"
            min="0"
            max="100"
            value={door.openOffset * 100}
            onChange={e => handleChange('openOffset', parseInt(e.target.value) / 100)}
            className="mt-1 block w-full"
          />
          <div className="text-right text-sm text-gray-500">
            {Math.round(door.openOffset * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}

// Window properties component
function WindowProperties({
  window,
  onUpdate,
}: {
  window: Window;
  onUpdate: (id: string, updates: Partial<Window>) => void;
}) {
  const handleChange = (field: string, value: any) => {
    onUpdate(window.id, { [field]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Width (m)</label>
        <input
          type="number"
          step="0.1"
          value={window.width}
          onChange={e => handleChange('width', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Height (m)</label>
        <input
          type="number"
          step="0.1"
          value={window.height}
          onChange={e => handleChange('height', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={window.type}
          onChange={e => handleChange('type', e.target.value as any)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
          <option value="awning">Awning</option>
          <option value="casement">Casement</option>
          <option value="slider">Slider</option>
        </select>
      </div>
    </div>
  );
}
