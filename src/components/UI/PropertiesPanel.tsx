import { useMemo } from 'react';
import type { Door, Wall, Window, Stair } from '@/stores/designStore';
import { useDesignStore } from '@/stores/designStore';
import { DoorConfigPanel } from './DoorConfigPanel';
import { WindowConfigPanel } from './WindowConfigPanel';
import { StairConfigPanel } from './StairConfigPanel';

export function PropertiesPanel() {
  // Use a selector that returns the specific element to avoid re-renders when unrelated elements change
  // Simpler selector: read selected ID/type then resolve the concrete element.
  const selectedElementId = useDesignStore(state => state.selectedElementId);
  const selectedElementType = useDesignStore(state => state.selectedElementType);

  let selectedElement: Wall | Door | Window | Stair | null = null;
  if (selectedElementId && selectedElementType) {
    const state = useDesignStore.getState();
    switch (selectedElementType) {
      case 'wall':
        selectedElement = state.walls.find(w => w.id === selectedElementId) || null;
        break;
      case 'door':
        selectedElement = state.doors.find(d => d.id === selectedElementId) || null;
        break;
      case 'window':
        selectedElement = state.windows.find(w => w.id === selectedElementId) || null;
        break;
      case 'stair':
        selectedElement = state.stairs.find(s => s.id === selectedElementId) || null;
        break;
      default:
        selectedElement = null;
    }
  }

  const updateWall = useDesignStore(state => state.updateWall);
  const updateDoor = useDesignStore(state => state.updateDoor);
  const updateWindow = useDesignStore(state => state.updateWindow);
  const updateStair = useDesignStore(state => state.updateStair);

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
        <DoorConfigPanel door={selectedElement as Door} onUpdate={updateDoor} />
      )}

      {selectedElementType === 'window' && selectedElement && (
        <WindowConfigPanel window={selectedElement as Window} onUpdate={updateWindow} />
      )}

      {selectedElementType === 'stair' && selectedElement && (
        <StairConfigPanel stair={selectedElement as Stair} onUpdate={updateStair} />
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
  const handleChange = <K extends keyof Wall>(field: K, value: Wall[K]) => {
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
          onChange={e => handleChange('type', e.target.value as Wall['type'])}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="load-bearing">Load Bearing</option>
          <option value="partition">Partition</option>
        </select>
      </div>
    </div>
  );
}

// Removed local DoorProperties/WindowProperties in favor of dedicated panels
