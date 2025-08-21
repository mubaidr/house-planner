import React from 'react';
import type { Stair } from '@/stores/designStore';

export function StairConfigPanel({ stair, onUpdate }: { stair: Stair; onUpdate: (id: string, updates: Partial<Stair>) => void }) {
  const handleChange = <K extends keyof Stair>(field: K, value: Stair[K]) => onUpdate(stair.id, { [field]: value });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Steps</label>
        <input type="number" min={1} value={stair.steps} onChange={e => handleChange('steps', parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Step Height (m)</label>
        <input type="number" step="0.01" value={stair.stepHeight} onChange={e => handleChange('stepHeight', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Step Depth (m)</label>
        <input type="number" step="0.01" value={stair.stepDepth} onChange={e => handleChange('stepDepth', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Width (m)</label>
        <input type="number" step="0.01" value={stair.width} onChange={e => handleChange('width', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select value={stair.type} onChange={e => handleChange('type', e.target.value as Stair['type'])} className="mt-1 block w-full rounded-md border-gray-300">
          <option value="straight">Straight</option>
          <option value="l-shaped">L-shaped</option>
          <option value="u-shaped">U-shaped</option>
          <option value="spiral">Spiral</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={!!stair.hasHandrail} onChange={e => handleChange('hasHandrail', e.target.checked)} />
        <label className="text-sm">Has handrail</label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Railing Height (m)</label>
        <input type="number" step="0.01" value={stair.railingHeight || 0.9} onChange={e => handleChange('railingHeight', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300" />
      </div>
    </div>
  );
}
