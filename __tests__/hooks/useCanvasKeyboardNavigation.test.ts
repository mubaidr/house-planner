import { renderHook, act } from '@testing-library/react';
import { useCanvasKeyboardNavigation } from '@/hooks/useCanvasKeyboardNavigation';
import { useDesignStore } from '@/stores/designStore';
import { useAccessibilityStore } from '@/stores/accessibilityStore';

// Mock the stores and hooks
jest.mock('@/stores/designStore');
jest.mock('@/stores/accessibilityStore');
jest.mock('@/components/Accessibility/AccessibilityAnnouncer', () => ({
  useAccessibilityAnnouncer: jest.fn(),
}));

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseAccessibilityStore = useAccessibilityStore as jest.MockedFunction<typeof useAccessibilityStore>;

// Mock the useAccessibilityAnnouncer hook
const mockUseAccessibilityAnnouncer = jest.fn();

// Get the mocked function from the module mock
const { useAccessibilityAnnouncer } = jest.requireMock('@/components/Accessibility/AccessibilityAnnouncer');

describe('useCanvasKeyboardNavigation', () => {
  const mockWalls = [
    { id: 'wall-1', type: 'wall', startX: 0, startY: 0, endX: 100, endY: 0 },
    { id: 'wall-2', type: 'wall', startX: 100, startY: 0, endX: 100, endY: 100 },
  ];

  const mockDoors = [
    { id: 'door-1', type: 'door', wallId: 'wall-1', positionOnWall: 0.5 },
  ];

  const mockWindows = [
    { id: 'window-1', type: 'window', wallId: 'wall-2', positionOnWall: 0.3 },
  ];

  const mockSelectElement = jest.fn();
  const mockRemoveWall = jest.fn();
  const mockRemoveDoor = jest.fn();
  const mockUpdateWall = jest.fn();
  const mockAnnounceElementSelected = jest.fn();
  const mockAnnounceElementDeleted = jest.fn();
  const mockAnnounceElementMoved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: mockDoors,
      windows: mockWindows,
      stairs: [],
      roofs: [],
      rooms: [],
      selectElement: mockSelectElement,
      removeWall: mockRemoveWall,
      removeDoor: mockRemoveDoor,
      removeWindow: jest.fn(),
      removeStair: jest.fn(),
      removeRoof: jest.fn(),
      updateWall: mockUpdateWall,
      updateDoor: jest.fn(),
      updateWindow: jest.fn(),
      updateStair: jest.fn(),
      updateRoof: jest.fn(),
    } as any);

    mockUseAccessibilityStore.mockReturnValue({
      preferences: {},
    } as any);

    useAccessibilityAnnouncer.mockReturnValue({
      announceElementSelected: mockAnnounceElementSelected,
      announceElementDeleted: mockAnnounceElementDeleted,
      announceElementMoved: mockAnnounceElementMoved,
    });
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      expect(result.current.focusedElementId).toBeNull();
      expect(result.current.focusedElementType).toBeNull();
      expect(result.current.isCanvasFocused).toBe(false);
      expect(result.current.navigationMode).toBe('browse');
    });
  });

  describe('getAllElements', () => {
    it('should return all elements in correct format', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      const allElements = result.current.getAllElements();

      expect(allElements).toHaveLength(4); // 2 walls + 1 door + 1 window
      expect(allElements[0]).toEqual({
        id: 'wall-1',
        type: 'wall',
        element: mockWalls[0],
      });
      expect(allElements[2]).toEqual({
        id: 'door-1',
        type: 'door',
        element: mockDoors[0],
      });
    });
  });

  describe('navigateElements', () => {
    it('should navigate to next element on right/down arrow', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      act(() => {
        result.current.navigateElements('right');
      });

      expect(result.current.focusedElementId).toBe('wall-1');
      expect(result.current.focusedElementType).toBe('wall');
      expect(mockAnnounceElementSelected).toHaveBeenCalledWith('wall', 'wall-1');
    });

    it('should navigate to previous element on left/up arrow', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      act(() => {
        result.current.navigateElements('left');
      });

      expect(result.current.focusedElementId).toBe('window-1');
      expect(result.current.focusedElementType).toBe('window');
      expect(mockAnnounceElementSelected).toHaveBeenCalledWith('window', 'window-1');
    });

    it('should wrap around when navigating past last element', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      // Navigate to last element
      act(() => {
        result.current.navigateElements('left');
      });

      // Navigate past last element should wrap to first
      act(() => {
        result.current.navigateElements('right');
      });

      expect(result.current.focusedElementId).toBe('wall-1');
      expect(result.current.focusedElementType).toBe('wall');
    });

    it('should handle empty element list gracefully', () => {
      mockUseDesignStore.mockReturnValue({
        walls: [],
        doors: [],
        windows: [],
        stairs: [],
        roofs: [],
        rooms: [],
        selectElement: mockSelectElement,
        removeWall: mockRemoveWall,
        removeDoor: mockRemoveDoor,
        removeWindow: jest.fn(),
        removeStair: jest.fn(),
        removeRoof: jest.fn(),
        updateWall: mockUpdateWall,
        updateDoor: jest.fn(),
        updateWindow: jest.fn(),
        updateStair: jest.fn(),
        updateRoof: jest.fn(),
      } as any);

      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      act(() => {
        result.current.navigateElements('right');
      });

      expect(result.current.focusedElementId).toBeNull();
      expect(mockAnnounceElementSelected).not.toHaveBeenCalled();
    });
  });

  describe('selectFocusedElement', () => {
    it('should select the currently focused element', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      // First navigate to an element
      act(() => {
        result.current.navigateElements('right');
      });

      // Then select it
      act(() => {
        result.current.selectFocusedElement();
      });

      expect(mockSelectElement).toHaveBeenCalledWith('wall-1', 'wall');
      expect(mockAnnounceElementSelected).toHaveBeenCalledTimes(2); // Once for navigate, once for select
    });

    it('should not select if no element is focused', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      act(() => {
        result.current.selectFocusedElement();
      });

      expect(mockSelectElement).not.toHaveBeenCalled();
    });
  });

  describe('deleteFocusedElement', () => {
    it('should delete focused wall', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      // Navigate to wall
      act(() => {
        result.current.navigateElements('right');
      });

      // Delete it
      act(() => {
        result.current.deleteFocusedElement();
      });

      expect(mockRemoveWall).toHaveBeenCalledWith('wall-1');
      expect(mockAnnounceElementDeleted).toHaveBeenCalledWith('wall', 'wall-1');
      expect(result.current.focusedElementId).toBeNull();
    });

    it('should delete focused door', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      // Navigate to door (3rd element: wall-1, wall-2, door-1, window-1)
      act(() => {
        result.current.navigateElements('right'); // wall-1
      });
      act(() => {
        result.current.navigateElements('right'); // wall-2  
      });
      act(() => {
        result.current.navigateElements('right'); // door-1
      });

      act(() => {
        result.current.deleteFocusedElement();
      });

      expect(mockRemoveDoor).toHaveBeenCalledWith('door-1');
      expect(mockAnnounceElementDeleted).toHaveBeenCalledWith('door', 'door-1');
    });

    it('should not delete if no element is focused', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      act(() => {
        result.current.deleteFocusedElement();
      });

      expect(mockRemoveWall).not.toHaveBeenCalled();
      expect(mockRemoveDoor).not.toHaveBeenCalled();
    });
  });

  describe('moveFocusedElement', () => {
    it('should move focused wall', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      // Navigate to wall
      act(() => {
        result.current.navigateElements('right');
      });

      // Move it right
      act(() => {
        result.current.moveFocusedElement('right', 10);
      });

      expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', {
        startX: 10, // 0 + 10
        startY: 0,
        endX: 110, // 100 + 10
        endY: 0,
      });
      expect(mockAnnounceElementMoved).toHaveBeenCalledWith('wall', 'wall-1', 'right', 10);
    });

    it('should move element up with negative Y delta', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      act(() => {
        result.current.navigateElements('right');
      });

      act(() => {
        result.current.moveFocusedElement('up', 5);
      });

      expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', {
        startX: 0,
        startY: -5, // 0 + (-5)
        endX: 100,
        endY: -5,
      });
    });

    it('should not move doors or windows directly', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      // Navigate to door (3rd element: wall-1, wall-2, door-1, window-1)
      act(() => {
        result.current.navigateElements('right'); // wall-1
      });
      act(() => {
        result.current.navigateElements('right'); // wall-2
      });
      act(() => {
        result.current.navigateElements('right'); // door-1
      });

      act(() => {
        result.current.moveFocusedElement('right', 10);
      });

      // Should not call any update functions for doors
      expect(mockUpdateWall).not.toHaveBeenCalled();
      // Should still announce the movement attempt
      expect(mockAnnounceElementMoved).toHaveBeenCalledWith('door', 'door-1', 'right', 10);
    });

    it('should not move if no element is focused', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      act(() => {
        result.current.moveFocusedElement('right', 10);
      });

      expect(mockUpdateWall).not.toHaveBeenCalled();
      expect(mockAnnounceElementMoved).not.toHaveBeenCalled();
    });
  });

  describe('getFocusedElement', () => {
    it('should return the currently focused element', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      // Navigate to an element
      act(() => {
        result.current.navigateElements('right');
      });

      const focusedElement = result.current.getFocusedElement();

      expect(focusedElement).toEqual({
        id: 'wall-1',
        type: 'wall',
        element: mockWalls[0],
      });
    });

    it('should return undefined if no element is focused', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      const focusedElement = result.current.getFocusedElement();

      expect(focusedElement).toBeUndefined();
    });
  });

  describe('setIsCanvasFocused', () => {
    it('should update canvas focus state', () => {
      const { result } = renderHook(() => useCanvasKeyboardNavigation());

      act(() => {
        result.current.setIsCanvasFocused(true);
      });

      expect(result.current.isCanvasFocused).toBe(true);

      act(() => {
        result.current.setIsCanvasFocused(false);
      });

      expect(result.current.isCanvasFocused).toBe(false);
    });
  });
});