import { useDesignStore } from '@/stores/designStore';
import { Material3DConfig, MaterialCategory } from '@/types/materials3D';
import { material3DSystem } from '@/utils/3d/materials3D';
import { useEffect, useMemo, useState } from 'react';

interface MaterialEditorProps {
  isOpen: boolean;
  onClose: () => void;
  elementId?: string;
  elementType?: MaterialCategory;
}

export function MaterialEditor({ isOpen, onClose, elementType }: MaterialEditorProps) {
  const { addMaterial, updateMaterial } = useDesignStore();
  const [selectedMaterial, setSelectedMaterial] = useState<Material3DConfig | null>(null);
  const [activeCategory, setActiveCategory] = useState<MaterialCategory>('wall');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Get material library for active category
  const materialLibrary = useMemo(() => {
    return material3DSystem.getMaterialLibrary(activeCategory);
  }, [activeCategory]);

  // Initialize with element type if provided
  useEffect(() => {
    if (elementType) {
      setActiveCategory(elementType);
    }
  }, [elementType]);

  const categories: MaterialCategory[] = [
    'wall',
    'floor',
    'ceiling',
    'door',
    'window',
    'roof',
    'stair',
  ];

  const handleMaterialSelect = (material: Material3DConfig) => {
    setSelectedMaterial(material);
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    const newMaterial: Material3DConfig = {
      id: `custom-${Date.now()}`,
      name: 'New Material',
      category: activeCategory,
      baseColor: '#cccccc',
      roughness: 0.5,
      metalness: 0.0,
      opacity: 1.0,
    };
    setSelectedMaterial(newMaterial);
    setIsCreatingNew(true);
  };

  const handleSaveMaterial = () => {
    if (!selectedMaterial) return;

    if (!selectedMaterial) return;

    // Convert Material3DConfig to Material interface
    const materialForStore = {
      id: selectedMaterial.id,
      name: selectedMaterial.name,
      color: selectedMaterial.baseColor,
      roughness: selectedMaterial.roughness,
      metalness: selectedMaterial.metalness,
      opacity: selectedMaterial.opacity,
    };

    if (isCreatingNew) {
      addMaterial(materialForStore);
      material3DSystem.addMaterialToLibrary(selectedMaterial);
    } else {
      updateMaterial(selectedMaterial.id, materialForStore);
    }

    setIsCreatingNew(false);
  };

  const handlePropertyChange = <T extends keyof Material3DConfig>(
    property: T,
    value: Material3DConfig[T]
  ) => {
    if (!selectedMaterial) return;

    setSelectedMaterial({
      ...selectedMaterial,
      [property]: value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-4/5 h-4/5 max-w-6xl flex">
        {/* Sidebar - Categories and Materials */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Material Editor</h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Categories</h3>
            <div className="grid grid-cols-2 gap-1">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-2 text-xs rounded capitalize ${
                    activeCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Materials List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-600">Materials</h3>
              <button
                onClick={handleCreateNew}
                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                + New
              </button>
            </div>

            <div className="space-y-2">
              {materialLibrary?.materials.map(material => (
                <div
                  key={material.id}
                  onClick={() => handleMaterialSelect(material)}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedMaterial?.id === material.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: material.baseColor }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{material.name}</div>
                      <div className="text-xs text-gray-500">
                        R: {material.roughness} | M: {material.metalness}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {selectedMaterial ? (
            <>
              {/* Material Preview */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">{selectedMaterial.name}</h3>
                  <button
                    onClick={handleSaveMaterial}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {isCreatingNew ? 'Create' : 'Save'}
                  </button>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                  <div
                    className="w-16 h-16 rounded border-2 border-gray-300"
                    style={{ backgroundColor: selectedMaterial.baseColor }}
                  />
                  <div className="text-sm text-gray-600">
                    <div>Category: {selectedMaterial.category}</div>
                    <div>Opacity: {Math.round(selectedMaterial.opacity * 100)}%</div>
                  </div>
                </div>
              </div>

              {/* Properties Editor */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Basic Properties */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-3">Basic Properties</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                        <input
                          type="text"
                          value={selectedMaterial.name}
                          onChange={e => handlePropertyChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Base Color
                        </label>
                        <input
                          type="color"
                          value={selectedMaterial.baseColor}
                          onChange={e => handlePropertyChange('baseColor', e.target.value)}
                          className="w-full h-10 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PBR Properties */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-3">PBR Properties</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Roughness: {selectedMaterial.roughness.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={selectedMaterial.roughness}
                          onChange={e =>
                            handlePropertyChange('roughness', parseFloat(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Metalness: {selectedMaterial.metalness.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={selectedMaterial.metalness}
                          onChange={e =>
                            handlePropertyChange('metalness', parseFloat(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Opacity: {selectedMaterial.opacity.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={selectedMaterial.opacity}
                          onChange={e =>
                            handlePropertyChange('opacity', parseFloat(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Texture Mapping */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-3">Texture Mapping</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          U Repeat
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={selectedMaterial.textureRepeat?.u || 1}
                          onChange={e =>
                            handlePropertyChange('textureRepeat', {
                              ...selectedMaterial.textureRepeat,
                              u: parseFloat(e.target.value),
                              v: selectedMaterial.textureRepeat?.v || 1,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          V Repeat
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={selectedMaterial.textureRepeat?.v || 1}
                          onChange={e =>
                            handlePropertyChange('textureRepeat', {
                              ...selectedMaterial.textureRepeat,
                              u: selectedMaterial.textureRepeat?.u || 1,
                              v: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a material to edit or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
