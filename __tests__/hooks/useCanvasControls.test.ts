import { renderHook, act } from '@testing-library/react';
import { useCanvasControls } from '@/hooks/useCanvasControls';
import { useUIStore } from '@/stores/uiStore';

// Mock the UI store
jest.mock('@/stores/uiStore');

const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

describe('useCanvasControls', () => {
  let mockSetZoomLevel: jest.Mock;

  beforeEach(() => {
    mockSetZoomLevel = jest.fn();
    
    mockUseUIStore.mockReturnValue({
      zoomLevel: 1,
      setZoomLevel: mockSetZoomLevel,
      // Add other required properties with default values
      selectedTool: 'wall',
      setSelectedTool: jest.fn(),
      isGridVisible: true,
      setGridVisible: jest.fn(),
      isSnapEnabled: true,
      setSnapEnabled: jest.fn(),
      panX: 0,
      panY: 0,
      setPanX: jest.fn(),
      setPanY: jest.fn(),
      selectedElementIds: [],
      setSelectedElementIds: jest.fn(),
      addSelectedElementId: jest.fn(),
      removeSelectedElementId: jest.fn(),
      clearSelection: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('zoom functions', () => {
    it('should zoom in by factor of 1.2', () => {
      const { result } = renderHook(() => useCanvasControls());
      
      act(() => {
        result.current.zoomIn();
      });
      
      expect(mockSetZoomLevel).toHaveBeenCalledWith(1.2);
    });

    it('should zoom out by factor of 1.2', () => {
      const { result } = renderHook(() => useCanvasControls());
      
      act(() => {
        result.current.zoomOut();
      });
      
      expect(mockSetZoomLevel).toHaveBeenCalledWith(1 / 1.2);
    });

    it('should reset zoom to 1', () => {
      mockUseUIStore.mockReturnValue({
        zoomLevel: 2,
        setZoomLevel: mockSetZoomLevel,
        selectedTool: 'wall',
        setSelectedTool: jest.fn(),
        isGridVisible: true,
        setGridVisible: jest.fn(),
        isSnapEnabled: true,
        setSnapEnabled: jest.fn(),
        panX: 0,
        panY: 0,
        setPanX: jest.fn(),
        setPanY: jest.fn(),
        selectedElementIds: [],
        setSelectedElementIds: jest.fn(),
        addSelectedElementId: jest.fn(),
        removeSelectedElementId: jest.fn(),
        clearSelection: jest.fn(),
      });

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
  });

  describe('keyboard shortcuts', () => {
    let addEventListenerSpy: jest.SpyInstance;
    let removeEventListenerSpy: jest.SpyInstance;

    beforeEach(() => {
      addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should set up keyboard event listeners', () => {
      renderHook(() => useCanvasControls());
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useCanvasControls());
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should handle Ctrl/Cmd + Plus for zoom in', () => {
      renderHook(() => useCanvasControls());
      
      const keydownHandler = addEventListenerSpy.mock.calls[0][1];
      
      const event = new KeyboardEvent('keydown', {
        key: '+',
        ctrlKey: true,
      });
      
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
      });
      
      keydownHandler(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockSetZoomLevel).toHaveBeenCalledWith(1.2);
    });

    it('should handle Ctrl/Cmd + Minus for zoom out', () => {
      renderHook(() => useCanvasControls());
      
      const keydownHandler = addEventListenerSpy.mock.calls[0][1];
      
      const event = new KeyboardEvent('keydown', {
        key: '-',
        ctrlKey: true,
      });
      
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
      });
      
      keydownHandler(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockSetZoomLevel).toHaveBeenCalledWith(1 / 1.2);
    });

    it('should handle Ctrl/Cmd + 0 for reset zoom', () => {
      renderHook(() => useCanvasControls());
      
      const keydownHandler = addEventListenerSpy.mock.calls[0][1];
      
      const event = new KeyboardEvent('keydown', {
        key: '0',
        ctrlKey: true,
      });
      
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
      });
      
      keydownHandler(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockSetZoomLevel).toHaveBeenCalledWith(1);
    });

    it('should handle metaKey (Cmd on Mac)', () => {
      renderHook(() => useCanvasControls());
      
      const keydownHandler = addEventListenerSpy.mock.calls[0][1];
      
      const event = new KeyboardEvent('keydown', {
        key: '+',
        metaKey: true,
      });
      
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
      });
      
      keydownHandler(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockSetZoomLevel).toHaveBeenCalledWith(1.2);
    });

    it('should not handle keys without Ctrl/Cmd', () => {
      renderHook(() => useCanvasControls());
      
      const keydownHandler = addEventListenerSpy.mock.calls[0][1];
      
      const event = new KeyboardEvent('keydown', {
        key: '+',
      });
      
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
      });
      
      keydownHandler(event);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(mockSetZoomLevel).not.toHaveBeenCalled();
    });
  });

  describe('return values', () => {
    it('should return all control functions and current zoom level', () => {
      const { result } = renderHook(() => useCanvasControls());
      
      expect(result.current).toEqual({
        zoomIn: expect.any(Function),
        zoomOut: expect.any(Function),
        resetZoom: expect.any(Function),
        fitToScreen: expect.any(Function),
        zoomLevel: 1,
      });
    });

    it('should return current zoom level from store', () => {
      mockUseUIStore.mockReturnValue({
        zoomLevel: 2.5,
        setZoomLevel: mockSetZoomLevel,
        selectedTool: 'wall',
        setSelectedTool: jest.fn(),
        isGridVisible: true,
        setGridVisible: jest.fn(),
        isSnapEnabled: true,
        setSnapEnabled: jest.fn(),
        panX: 0,
        panY: 0,
        setPanX: jest.fn(),
        setPanY: jest.fn(),
        selectedElementIds: [],
        setSelectedElementIds: jest.fn(),
        addSelectedElementId: jest.fn(),
        removeSelectedElementId: jest.fn(),
        clearSelection: jest.fn(),
      });

      const { result } = renderHook(() => useCanvasControls());
      
      expect(result.current.zoomLevel).toBe(2.5);
    });
  });
});