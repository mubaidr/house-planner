import React from 'react';
import { useUIStore } from '@/stores/uiStore';

const ImportDialog: React.FC = () => {
  const { isImportDialogOpen, setImportDialogOpen } = useUIStore();

  if (!isImportDialogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Import Annotations</h2>
        {/* Add import functionality here */}
        <button
          onClick={() => setImportDialogOpen(false)}
          className="mt-4 px-4 py-2 bg-gray-300 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ImportDialog;