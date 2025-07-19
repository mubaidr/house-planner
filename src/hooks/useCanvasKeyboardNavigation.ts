import { useEffect, useCallback } from 'react';

export function useCanvasKeyboardNavigation(
  canvasRef: React.RefObject<HTMLDivElement>,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || !canvasRef.current) return;

    // Basic keyboard navigation placeholder
    switch (event.key) {
      case 'Escape':
        // Handle escape key
        break;
      case 'Delete':
      case 'Backspace':
        // Handle delete key
        break;
      default:
        break;
    }
  }, [enabled, canvasRef]);

  useEffect(() => {
    if (!enabled) return;

    const element = canvasRef.current;
    if (!element) return;

    element.addEventListener('keydown', handleKeyDown);
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown, canvasRef]);
}

export default useCanvasKeyboardNavigation;
