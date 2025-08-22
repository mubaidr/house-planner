import type { Door } from '@/stores/designStore';

export function DoorConfigPanel({
  door,
  onUpdate,
}: {
  door: Door;
  onUpdate: (id: string, updates: Partial<Door>) => void;
}) {
  const handleChange = <K extends keyof Door>(field: K, value: Door[K]) =>
    onUpdate(door.id, { [field]: value });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Width (m)</label>
        <input
          type="number"
          step="0.1"
          value={door.width}
          onChange={e => handleChange('width', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Height (m)</label>
        <input
          type="number"
          step="0.1"
          value={door.height}
          onChange={e => handleChange('height', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

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
