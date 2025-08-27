import type { Window as WindowType } from '@/stores/designStore';
import { useDesignStore } from '@/stores/designStore';
import { SliderInput } from './SliderInput';

export function WindowConfigPanel({
  window,
  onUpdate,
}: {
  window: WindowType;
  onUpdate: (id: string, updates: Partial<WindowType>) => void;
}) {
  const walls = useDesignStore(state => state.walls);
  const parentWall = walls.find(w => w.id === window.wallId);

  const wallLength = parentWall
    ? Math.sqrt(
        Math.pow(parentWall.end.x - parentWall.start.x, 2) +
          Math.pow(parentWall.end.z - parentWall.start.z, 2)
      )
    : 3.0;

  const handleChange = <K extends keyof WindowType>(field: K, value: WindowType[K]) =>
    onUpdate(window.id, { [field]: value });

  const handleWidthPreset = (width: number) => {
    onUpdate(window.id, { width });
  };

  return (
    <div className="space-y-4">
      <SliderInput
        label="Width"
        value={window.width}
        min={0.4}
        max={wallLength}
        step={0.01}
        onChange={value => handleChange('width', value)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-500">Presets</label>
        <div className="mt-1 flex space-x-2">
          <button onClick={() => handleWidthPreset(0.6)} className="px-2 py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300">0.6m</button>
          <button onClick={() => handleWidthPreset(0.9)} className="px-2 py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300">0.9m</button>
          <button onClick={() => handleWidthPreset(1.2)} className="px-2 py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300">1.2m</button>
        </div>
      </div>

      <SliderInput
        label="Height"
        value={window.height}
        min={0.4}
        max={2.0}
        step={0.01}
        onChange={value => handleChange('height', value)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={window.type}
          onChange={e => handleChange('type', e.target.value as WindowType['type'])}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
          <option value="awning">Awning</option>
          <option value="casement">Casement</option>
          <option value="slider">Slider</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Glazing</label>
        <select
          value={window.glazing}
          onChange={e => handleChange('glazing', e.target.value as WindowType['glazing'])}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
        </select>
      </div>
    </div>
  );
}
