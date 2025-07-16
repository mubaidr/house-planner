
import React from 'react';
import { ElementType } from '@/types/elements2D';

interface ContextMenuProps {
  x: number;
  y: number;
  isVisible: boolean;
  onClose: () => void;
  selectedElementType: ElementType | null;
  selectedElementId: string | null;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onProperties: () => void;
  hasClipboardData: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  isVisible,
  onClose,
  selectedElementType,
  selectedElementId,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onEdit,
  onProperties,
  hasClipboardData,
}) => {
  if (!isVisible) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      className="absolute bg-white shadow-lg rounded-md py-1 z-50"
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      {selectedElementId && (
        <>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => handleAction(onEdit)}
          >
            Edit {selectedElementType}
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => handleAction(onProperties)}
          >
            Properties
          </button>
          <div className="border-t border-gray-200 my-1" />
        </>
      )}
      <button
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => handleAction(onCopy)}
        disabled={!selectedElementId}
      >
        Copy
      </button>
      <button
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => handleAction(onPaste)}
        disabled={!hasClipboardData}
      >
        Paste
      </button>
      <button
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => handleAction(onDuplicate)}
        disabled={!selectedElementId}
      >
        Duplicate
      </button>
      {selectedElementId && (
        <>
          <div className="border-t border-gray-200 my-1" />
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
            onClick={() => handleAction(onDelete)}
          >
            Delete {selectedElementType}
          </button>
        </>
      )}
    </div>
  );
};

export default ContextMenu;
