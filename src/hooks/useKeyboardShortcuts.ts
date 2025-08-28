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

      // Tool shortcuts
      if (event.key === 'w') {
        setActiveTool('wall');
      }
      if (event.key === 'd') {
        setActiveTool('add-door');
      }
      if (event.key === 'r') {
        setActiveTool('room');
      }
      if (event.key === 'm') {
        setActiveTool('measure');
      }
      if (event.key === 's') {
        setActiveTool('select');
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
