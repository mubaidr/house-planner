import { Export3DSystem } from '@/utils/3d/export3D';
import { useThree } from '@react-three/fiber';
import { saveAs } from 'file-saver';
import { useState } from 'react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { scene } = useThree();
  const [exportType, setExportType] = useState<'gltf' | 'obj'>('gltf');

  const handleExport = async () => {
    const exportSystem = new Export3DSystem();
    let blob: Blob;
    let filename: string;

    switch (exportType) {
      case 'gltf':
        blob = await exportSystem.exportGLTF(scene);
        filename = 'scene.gltf';
        break;
      case 'obj':
        blob = await exportSystem.exportOBJ(scene);
        filename = 'scene.obj';
        break;
    }

    saveAs(blob, filename);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Export Scene</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Format</label>
            <select
              value={exportType}
              onChange={e => setExportType(e.target.value as 'gltf' | 'obj')}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="gltf">GLTF</option>
              <option value="obj">OBJ</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
