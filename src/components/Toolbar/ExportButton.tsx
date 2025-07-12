'use client';

import React, { useState } from 'react';
import { Stage } from 'konva/lib/Stage';
import ExportDialog from '../Export/ExportDialog';

interface ExportButtonProps {
  stage: Stage | null; // Konva Stage reference
}

export default function ExportButton({ stage }: ExportButtonProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowExportDialog(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        title="Export design as PNG or PDF"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Export</span>
      </button>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        stage={stage}
      />
    </>
  );
}