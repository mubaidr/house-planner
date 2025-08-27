import type { Door } from '@/stores/designStore';
import { useDesignStore } from '@/stores/designStore';
import { SliderInput } from './SliderInput';

export function DoorConfigPanel({
  door,
  onUpdate,
}: {
  door: Door;
  onUpdate: (id: string, updates: Partial<Door>) => void;
}) {
  const walls = useDesignStore(state => state.walls);
  const parentWall = walls.find(w => w.id === door.wallId);

  const wallLength = parentWall
    ? Math.sqrt(
        Math.pow(parentWall.end.x - parentWall.start.x, 2) +
          Math.pow(parentWall.end.z - parentWall.start.z, 2)
      )
    : 2.5;

  const handleChange = <K extends keyof Door>(field: K, value: Door[K]) =>
    onUpdate(door.id, { [field]: value });

  const handleWidthPreset = (width: number) => {
    onUpdate(door.id, { width });
  };

  return (
    <div className="space-y-4">
      <SliderInput
        label="Width"
        value={door.width}
        min={0.5}
        max={wallLength}
        step={0.01}
        onChange={value => handleChange('width', value)}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-500">Presets</label>
        <div className="mt-1 flex space-x-2">
          <button onClick={() => handleWidthPreset(0.8)} className="px-2 py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300">0.8m</button>
          <button onClick={() => handleWidthPreset(0.9)} className="px-2 py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300">0.9m</button>
          <button onClick={() => handleWidthPreset(1.0)} className="px-2 py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300">1.0m</button>
        </div>
      </div>

      <SliderInput
        label="Height"
        value={door.height}
        min={1.8}
        max={2.4}
        step={0.01}
        onChange={value => handleChange('height', value)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={door.type}
          onChange={e => handleChange('type', e.target.value as Door['type'])}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="hinged">Hinged</option>
          <option value="sliding">Sliding</option>
          <option value="folding">Folding</option>
          <option value="revolving">Revolving</option>
        </select>
      </div>
    </div>
  );
}
