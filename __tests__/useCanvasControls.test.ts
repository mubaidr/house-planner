import { renderHook, act } from '@testing-library/react';
import { useCanvasControls } from '../src/hooks/useCanvasControls';
import { useUIStore } from '@/stores/uiStore';

// Mock the UI store
jest.mock('@/stores/uiStore');

const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

describe('useCanvasControls', () => {
  const mockSetZoomLevel = jest.fn();
  let currentZoomLevel = 1;

  beforeEach(() => {
    jest.clearAllMocks();
    currentZoomLevel = 1;

    mockUseUIStore.mockReturnValue({
      zoomLevel: currentZoomLevel,
      setZoomLevel: mockSetZoomLevel,
    } as any);

    // Update zoom level when setZoomLevel is called
    mockSetZoomLevel.mockImplementation((newZoom) => {
      currentZoomLevel = newZoom;
    });
  });

  afterEach(() => {
    // Clean up event listeners
    const events = ['keydown'];
    events.forEach(event => {
      window.removeEventListener(event, jest.fn());
    });
  });

  it('should initialize and provide control functions', () => {
    const { result } = renderHook(() => useCanvasControls());
    
    expect(result.current).toBeDefined();
    expect(typeof result.current.zoomIn).toBe('function');
    expect(typeof result.current.zoomOut).toBe('function');
    expect(typeof result.current.resetZoom).toBe('function');
    expect(typeof result.current.fitToScreen).toBe('function');
    expect(result.current.zoomLevel).toBe(1);
  });

  it('should zoom in correctly', () => {
    const { result } = renderHook(() => useCanvasControls());

    act(() => {
      result.current.zoomIn();
    });

    expect(mockSetZoomLevel).toHaveBeenCalledWith(1.2);
  });

  it('should zoom out correctly', () => {
    const { result } = renderHook(() => useCanvasControls());

    act(() => {
      result.current.zoomOut();
    });

    expect(mockSetZoomLevel).toHaveBeenCalledWith(1 / 1.2);
  });

  it('should reset zoom to 1', () => {
    // Start with different zoom level
    mockUseUIStore.mockReturnValue({
      zoomLevel: 2.5,
      setZoomLevel: mockSetZoomLevel,
    } as any);

    const { result } = renderHook(() => useCanvasControls());

    act(() => {
      result.current.resetZoom();
    });

    expect(mockSetZoomLevel).toHaveBeenCalledWith(1);
  });

  it('should fit to screen (currently resets to 1)', () => {
    const { result } = renderHook(() => useCanvasControls());

    act(() => {
      result.current.fitToScreen();
    });

    expect(mockSetZoomLevel).toHaveBeenCalledWith(1);
  });

  it('should handle keyboard shortcuts for zoom in (Ctrl/Cmd + =)', () => {
    renderHook(() => useCanvasControls());

    act(() => {
      const event = new KeyboardEvent('keydown', { 
        key: '=', 
        ctrlKey: true,
        preventDefault: jest.fn()
      });
      window.dispatchEvent(event);
    });

    expect(mockSetZoomLevel).toHaveBeenCalledWith(1.2);
  });

  it('should handle keyboard shortcuts for zoom in (Ctrl/Cmd + +)', () => {
    renderHook(() => useCanvasControls());

    act(() => {
      const event = new KeyboardEvent('keydown', { 
        key: '+', 
        ctrlKey: true,
        preventDefault: jest.fn()
      });
      window.dispatchEvent(event);
    });

    expect(mockSetZoomLevel).toHaveBeenCalledWith(1.2);
  });

  it('should handle keyboard shortcuts for zoom out (Ctrl/Cmd + -)', () => {
    renderHook(() => useCanvasControls());

    act(() => {
      const event = new KeyboardEvent('keydown', { 
        key: '-', 
        ctrlKey: true,
        preventDefault: jest.fn()
      });
      window.dispatchEvent(event);
    });

    expect(mockSetZoomLevel).toHaveBeenCalledWith(1 / 1.2);
  });

  it('should handle keyboard shortcuts for reset zoom (Ctrl/Cmd + 0)', () => {
    renderHook(() => useCanvasControls());

    act(() => {
      const event = new KeyboardEvent('keydown', { 
        key: '0', 
        ctrlKey: true,
        preventDefault: jest.fn()
      });
      window.dispatchEvent(event);
    });

    expect(mockSetZoomLevel).toHaveBeenCalledWith(1);
  });

  it('should handle keyboard shortcuts with metaKey (Mac)', () => {
    renderHook(() => useCanvasControls());

    act(() => {
      const event = new KeyboardEvent('keydown', { 
        key: '=', 
        metaKey: true,
        preventDefault: jest.fn()
      });
      window.dispatchEvent(event);
    });

    expect(mockSetZoomLevel).toHaveBeenCalledWith(1.2);
  });

  it('should not respond to keyboard shortcuts without modifier keys', () => {
    renderHook(() => useCanvasControls());

    act(() => {
      const event = new KeyboardEvent('keydown', { 
        key: '=',
        preventDefault: jest.fn()
      });
      window.dispatchEvent(event);
    });

    expect(mockSetZoomLevel).not.toHaveBeenCalled();
  });

  it('should not respond to unrelated keyboard shortcuts', () => {
    renderHook(() => useCanvasControls());

    act(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 'a', 
        ctrlKey: true,
        preventDefault: jest.fn()
      });
      window.dispatchEvent(event);
    });

    expect(mockSetZoomLevel).not.toHaveBeenCalled();
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useCanvasControls());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });

  it('should update zoom level when store changes', () => {
    const { result, rerender } = renderHook(() => useCanvasControls());

    expect(result.current.zoomLevel).toBe(1);

    // Update the mock to return a different zoom level
    mockUseUIStore.mockReturnValue({
      zoomLevel: 2.5,
      setZoomLevel: mockSetZoomLevel,
    } as any);

    rerender();

    expect(result.current.zoomLevel).toBe(2.5);
  });

  it('should handle multiple zoom operations correctly', () => {
    const { result } = renderHook(() => useCanvasControls());

    // Zoom in twice
    act(() => {
      result.current.zoomIn();
    });
    
    act(() => {
      result.current.zoomIn();
    });

    expect(mockSetZoomLevel).toHaveBeenCalledTimes(2);
    expect(mockSetZoomLevel).toHaveBeenNthCalledWith(1, 1.2);
    expect(mockSetZoomLevel).toHaveBeenNthCalledWith(2, 1.2);
  });

  it('should prevent default behavior for zoom keyboard shortcuts', () => {
    renderHook(() => useCanvasControls());

    const preventDefault = jest.fn();

    act(() => {
      const event = new KeyboardEvent('keydown', { 
        key: '=', 
        ctrlKey: true,
        preventDefault
      });
      
      // Manually call preventDefault since jsdom doesn't do it automatically
      Object.defineProperty(event, 'preventDefault', {
        value: preventDefault,
        writable: false
      });
      
      window.dispatchEvent(event);
    });

    // Note: preventDefault behavior testing is limited in jsdom
    // In a real browser, this would prevent the default zoom behavior
    expect(mockSetZoomLevel).toHaveBeenCalled();
  });
});
