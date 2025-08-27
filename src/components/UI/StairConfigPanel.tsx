import type { Stair } from '@/stores/designStore';
import { SliderInput } from './SliderInput';

export function StairConfigPanel({
  stair,
  onUpdate,
}: {
  stair: Stair;
  onUpdate: (id: string, updates: Partial<Stair>) => void;
}) {
  const handleChange = <K extends keyof Stair>(field: K, value: Stair[K]) =>
    onUpdate(stair.id, { [field]: value });

  return (
    <div className="space-y-4">
      <SliderInput
        label="Steps"
        value={stair.steps}
        min={2}
        max={30}
        step={1}
        onChange={value => handleChange('steps', value)}
        unit="steps"
      />

      <SliderInput
        label="Step Height"
        value={stair.stepHeight}
        min={0.1}
        max={0.3}
        step={0.01}
        onChange={value => handleChange('stepHeight', value)}
      />

      <SliderInput
        label="Step Depth"
        value={stair.stepDepth}
        min={0.2}
        max={0.5}
        step={0.01}
        onChange={value => handleChange('stepDepth', value)}
      />

      <SliderInput
        label="Width"
        value={stair.width}
        min={0.8}
        max={2.0}
        step={0.01}
        onChange={value => handleChange('width', value)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={stair.type}
          onChange={e => handleChange('type', e.target.value as Stair['type'])}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="straight">Straight</option>
          <option value="l-shaped">L-shaped</option>
          <option value="u-shaped">U-shaped</option>
          <option value="spiral">Spiral</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!stair.hasHandrail}
          onChange={e => handleChange('hasHandrail', e.target.checked)}
        />
        <label className="text-sm">Has handrail</label>
      </div>

      {stair.hasHandrail && (
        <SliderInput
          label="Railing Height"
          value={stair.railingHeight || 0.9}
          min={0.8}
          max={1.2}
          step={0.01}
          onChange={value => handleChange('railingHeight', value)}
        />
      )}
    </div>
  );
}
