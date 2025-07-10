import { useCallback, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export const useCanvasControls = () => {
  const { setZoomLevel, zoomLevel } = useUIStore();

  const zoomIn = useCallback(() => {
    setZoomLevel(zoomLevel * 1.2);
  }, [zoomLevel, setZoomLevel]);

  const zoomOut = useCallback(() => {
    setZoomLevel(zoomLevel / 1.2);
  }, [zoomLevel, setZoomLevel]);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, [setZoomLevel]);

  const fitToScreen = useCallback(() => {
    // This would calculate the optimal zoom to fit all elements
    // For now, just reset to 1
    setZoomLevel(1);
  }, [setZoomLevel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  return {
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    zoomLevel,
  };
};