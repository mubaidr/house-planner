import { useDesignStore } from '@/stores/designStore';

export function ViewControls() {
  const viewMode = useDesignStore(state => state.viewMode);
  const setViewMode = useDesignStore(state => state.setViewMode);

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold mb-2">View Mode</h2>
      <div className="flex space-x-2">
        <button
          onClick={() => setViewMode('2d')}
          className={`px-4 py-2 rounded transition ${
            viewMode === '2d' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          2D
        </button>
        <button
          onClick={() => setViewMode('3d')}
          className={`px-4 py-2 rounded transition ${
            viewMode === '3d' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          3D
        </button>
        <button
          onClick={() => setViewMode('hybrid')}
          className={`px-4 py-2 rounded transition ${
            viewMode === 'hybrid' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Hybrid
        </button>
      </div>
    </div>
  );
}