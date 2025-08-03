import { Wall3D } from './Wall3D';
import { Room3D } from './Room3D';
import { Door3D } from './Door3D';
import { Window3D } from './Window3D';
import { useDesignStore } from '@/stores/designStore';

interface ElementRenderer3DProps {
  onElementSelect?: (id: string, type: string) => void;
}

export function ElementRenderer3D({ onElementSelect }: ElementRenderer3DProps) {
  const { walls, rooms, doors, windows, selectElement, selection } = useDesignStore();

  const handleSelect = (id: string, type: 'wall' | 'room' | 'door' | 'window') => {
    selectElement(id, type);
    onElementSelect?.(id, type);
  };

  return (
    <group name="architectural-elements">
      {/* Render rooms first (floors/ceilings) */}
      <group name="rooms">
        {rooms.map(room => (
          <Room3D
            key={room.id}
            room={room}
            isSelected={selection.selectedElementId === room.id && selection.selectedElementType === 'room'}
            onSelect={() => handleSelect(room.id, 'room')}
          />
        ))}
      </group>

      {/* Render walls with Phase 2 enhanced selection handling */}
      <group name="walls">
        {walls.map(wall => (
          <Wall3D
            key={wall.id}
            wall={wall}
            isSelected={selection.selectedElementId === wall.id && selection.selectedElementType === 'wall'}
            onSelect={() => handleSelect(wall.id, 'wall')}
          />
        ))}
      </group>

      {/* Render doors with Phase 2 enhanced wall integration */}
      <group name="doors">
        {doors.map(door => (
          <Door3D
            key={door.id}
            door={door}
            isSelected={selection.selectedElementId === door.id && selection.selectedElementType === 'door'}
            onClick={() => handleSelect(door.id, 'door')}
          />
        ))}
      </group>

      {/* Render windows with Phase 2 enhanced wall integration */}
      <group name="windows">
        {windows.map(window => (
          <Window3D
            key={window.id}
            window={window}
            isSelected={selection.selectedElementId === window.id && selection.selectedElementType === 'window'}
            onClick={() => handleSelect(window.id, 'window')}
          />
        ))}
      </group>
    </group>
  );
}
