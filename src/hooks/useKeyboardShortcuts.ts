import { useDesignStore } from '@/stores/designStore';
import { useEffect } from 'react';

export function useKeyboardShortcuts() {
  const {
    removeWall,
    removeDoor,
    removeWindow,
    removeStair,
    selectedElementId,
    selectedElementType,
    setActiveTool,
  } = useDesignStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Delete selected element
      if (event.key === 'Delete' && selectedElementId) {
        switch (selectedElementType) {
          case 'wall':
            removeWall(selectedElementId);
            break;
          case 'door':
            removeDoor(selectedElementId);
            break;
          case 'window':
            removeWindow(selectedElementId);
            break;
          case 'stair':
            removeStair(selectedElementId);
            break;
        }
      }

      // Tool shortcuts (single key presses)
      if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case 'w':
            event.preventDefault();
            setActiveTool('wall');
            break;
          case 'd':
            event.preventDefault();
            setActiveTool('add-door');
            break;
          case 'n':
            event.preventDefault();
            setActiveTool('add-window');
            break;
          case 'r':
            event.preventDefault();
            setActiveTool('room');
            break;
          case 'm':
            event.preventDefault();
            setActiveTool('measure');
            break;
          case 's':
            event.preventDefault();
            setActiveTool('select');
            break;
          case 'c':
            event.preventDefault();
            setActiveTool('copy');
            break;
          case 'escape':
            event.preventDefault();
            setActiveTool(null);
            break;
          case 's':
            event.preventDefault();
            // Save project (Ctrl+S is handled separately)
            if (!event.ctrlKey) {
              setActiveTool('select');
            }
            break;
        }
      }

      // Ctrl key combinations
      if (event.ctrlKey && !event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'c':
            event.preventDefault();
            // Copy functionality is handled by the CopyTool3D
            setActiveTool('copy');
            break;
          case 'z':
            event.preventDefault();
            // Import here to avoid circular dependencies
            import('@/stores/designStore').then(({ useDesignStore }) => {
              useDesignStore.getState().undo();
            });
            break;
          case 'y':
            event.preventDefault();
            // Import here to avoid circular dependencies
            import('@/stores/designStore').then(({ useDesignStore }) => {
              useDesignStore.getState().redo();
            });
            break;
          case 's':
            event.preventDefault();
            // TODO: Implement save functionality
            console.log('Save not implemented yet');
            break;
          case 'o':
            event.preventDefault();
            // TODO: Implement open functionality
            console.log('Open not implemented yet');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedElementId,
    selectedElementType,
    removeWall,
    removeDoor,
    removeWindow,
    removeStair,
    setActiveTool,
  ]);
}
