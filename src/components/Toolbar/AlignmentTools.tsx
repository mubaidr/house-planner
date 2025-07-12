'use client';

import React from 'react';
import { useAlignmentTool } from '@/hooks/useAlignmentTool';
import { useUIStore } from '@/stores/uiStore';

export default function AlignmentTools() {
  const { activeTool, setActiveTool } = useUIStore();
  const {
    alignLeftElements,
    alignRightElements,
    alignTopElements,
    alignBottomElements,
    alignCenterHorizontalElements,
    alignCenterVerticalElements,
    distributeHorizontallyElements,
    distributeVerticallyElements,
  } = useAlignmentTool();

  const isAlignmentActive = activeTool === 'align';

  if (!isAlignmentActive) {
    return (
      <button
        onClick={() => setActiveTool('align')}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        title="Alignment Tools"
      >
        <span>⚡</span>
        Align
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-800">Alignment Tools</h3>
        <button
          onClick={() => setActiveTool('select')}
          className="text-gray-400 hover:text-gray-600"
          title="Close alignment tools"
        >
          ✕
        </button>
      </div>

      {/* Alignment Controls */}
      <div className="space-y-2">
        <div className="text-xs text-gray-600 font-medium">Align</div>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={alignLeftElements}
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Align Left"
          >
            ⫷
          </button>
          <button
            onClick={alignCenterVerticalElements}
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Align Center Vertical"
          >
            ⫸
          </button>
          <button
            onClick={alignRightElements}
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Align Right"
          >
            ⫷
          </button>
          <button
            onClick={alignTopElements}
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Align Top"
          >
            ⫶
          </button>
          <button
            onClick={alignCenterHorizontalElements}
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Align Center Horizontal"
          >
            ⫯
          </button>
          <button
            onClick={alignBottomElements}
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Align Bottom"
          >
            ⫷
          </button>
        </div>
      </div>

      {/* Distribution Controls */}
      <div className="space-y-2">
        <div className="text-xs text-gray-600 font-medium">Distribute</div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={distributeHorizontallyElements}
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Distribute Horizontally"
          >
            ↔
          </button>
          <button
            onClick={distributeVerticallyElements}
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Distribute Vertically"
          >
            ↕
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Select multiple elements to enable alignment
      </div>
    </div>
  );
}