import { Wall3D } from './Wall3D';
import { Room3D } from './Room3D';
import { useDesignStore } from '@/stores/designStore';

interface ElementRenderer3DProps {
  onElementSelect?: (id: string, type: string) => void;
}

export function ElementRenderer3D({ onElementSelect }: ElementRenderer3DProps) {
  const { walls, rooms, selectElement } = useDesignStore();

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
            onSelect={() => handleSelect(room.id, 'room')}
          />
        ))}
      </group>

      {/* Render walls */}
      <group name="walls">
        {walls.map(wall => (
          <Wall3D
            key={wall.id}
            wall={wall}
            onSelect={() => handleSelect(wall.id, 'wall')}
          />
        ))}
      </group>
    </group>
  );
}
