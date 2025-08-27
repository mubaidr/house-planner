import { useGridStore } from '@/stores/gridStore';
import { SliderInput } from './SliderInput';

export function GridControls() {
  const { isVisible, spacing, toggleVisibility, setSpacing } = useGridStore();

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-80">
      <h3 className="text-lg font-bold mb-2">Grid Settings</h3>
      <div className="flex items-center justify-between">
        <label htmlFor="grid-visibility" className="text-sm font-medium text-gray-700">Show Grid</label>
        <input
          id="grid-visibility"
          type="checkbox"
          checked={isVisible}
          onChange={toggleVisibility}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
      {isVisible && (
        <div className="mt-4">
          <SliderInput
            label="Spacing"
            value={spacing}
            min={0.1}
            max={5}
            step={0.1}
            onChange={setSpacing}
            unit="m"
          />
        </div>
      )}
    </div>
  );
}
