import type { Window as WindowType } from '@/stores/designStore';

export function WindowConfigPanel({
  window,
  onUpdate,
}: {
  window: WindowType;
  onUpdate: (id: string, updates: Partial<WindowType>) => void;
}) {
  const handleChange = <K extends keyof WindowType>(field: K, value: WindowType[K]) =>
    onUpdate(window.id, { [field]: value });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Width (m)</label>
        <input
          type="number"
          step="0.1"
          value={window.width}
          onChange={e => handleChange('width', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Height (m)</label>
        <input
          type="number"
          step="0.1"
          value={window.height}
          onChange={e => handleChange('height', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

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
