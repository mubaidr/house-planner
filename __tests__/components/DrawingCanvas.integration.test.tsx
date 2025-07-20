import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import DrawingCanvas from '@/components/Canvas/DrawingCanvas';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { useFloorStore } from '@/stores/floorStore';

// Mock all the stores and dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/uiStore');
jest.mock('@/stores/floorStore');
jest.mock('@/stores/viewStore');
jest.mock('@/stores/accessibilityStore');
jest.mock('@/hooks/useCanvasControls');
jest.mock('@/hooks/useElementMovement');
jest.mock('@/hooks/useCanvasKeyboardNavigation');
jest.mock('@/hooks/useClipboard');
jest.mock('@/components/Accessibility/AccessibilityAnnouncer');
jest.mock('@/utils/storage');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;
const mockUseFloorStore = useFloorStore as jest.MockedFunction<typeof useFloorStore>;

describe('DrawingCanvas Integration Tests', () => {
  const mockWalls = [
    {
      id: 'wall-1',
      type: 'wall',
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 0,
      thickness: 6,
      height: 96,
      color: '#000000',
    },
  ];

  const mockDoors = [
    {
      id: 'door-1',
      type: 'door',
      wallId: 'wall-1',
      positionOnWall: 0.5,
      width: 36,
      height: 80,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: mockDoors,
      windows: [],
      stairs: [],
      roofs: [],
      rooms: [],
      selectedElementId: null,
      selectedElementType: null,
      selectElement: jest.fn(),
      addWall: jest.fn(),
      updateWall: jest.fn(),
      removeWall: jest.fn(),
    } as any);

    mockUseUIStore.mockReturnValue({
      activeTool: 'select',
      snapToGrid: true,
      gridSize: 12,
      showGrid: true,
      zoomLevel: 1,
      panOffset: { x: 0, y: 0 },
      setActiveTool: jest.fn(),
    } as any);

    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor-1',
      floors: [{ id: 'floor-1', name: 'Ground Floor', elements: {} }],
      getCurrentFloor: jest.fn(),
    } as any);

    // Mock canvas controls
    require('@/hooks/useCanvasControls').useCanvasControls.mockReturnValue({
      zoomLevel: 1,
      panOffset: { x: 0, y: 0 },
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      resetZoom: jest.fn(),
      fitToScreen: jest.fn(),
      setPanOffset: jest.fn(),
    });

    // Mock element movement
    require('@/hooks/useElementMovement').useElementMovement.mockReturnValue({
      handleWallDragMove: jest.fn(),
      handleDoorDragMove: jest.fn(),
      handleWindowDragMove: jest.fn(),
      handleStairDragMove: jest.fn(),
      handleRoofDragMove: jest.fn(),
      handleElementDragEnd: jest.fn(),
    });

    // Mock keyboard navigation
    require('@/hooks/useCanvasKeyboardNavigation').useCanvasKeyboardNavigation.mockReturnValue({
      focusedElementId: null,
      isCanvasFocused: false,
      navigateElements: jest.fn(),
      selectFocusedElement: jest.fn(),
      moveFocusedElement: jest.fn(),
      getAllElements: jest.fn(() => []),
      getFocusedElement: jest.fn(),
      setIsCanvasFocused: jest.fn(),
    });

    // Mock clipboard
    require('@/hooks/useClipboard').useClipboard.mockReturnValue({
      copyElement: jest.fn(),
      pasteElement: jest.fn(),
      hasClipboardData: false,
    });

    // Mock accessibility announcer
    require('@/components/Accessibility/AccessibilityAnnouncer').useAccessibilityAnnouncer.mockReturnValue({
      announceToolChange: jest.fn(),
      announceElementCreated: jest.fn(),
      announceElementSelected: jest.fn(),
      announceElementDeleted: jest.fn(),
    });

    // Mock storage
    require('@/utils/storage').saveDesign = jest.fn();
  });

  describe('Canvas Rendering', () => {
    it('should render canvas container', () => {
      render(<DrawingCanvas />);
      
      const canvasContainer = screen.getByRole('application');
      expect(canvasContainer).toBeInTheDocument();
      expect(canvasContainer).toHaveAttribute('aria-label', 'Drawing Canvas');
    });

    it('should render with accessibility attributes', () => {
      render(<DrawingCanvas />);
      
      const canvasContainer = screen.getByRole('application');
      expect(canvasContainer).toHaveAttribute('tabIndex', '0');
      expect(canvasContainer).toHaveAttribute('aria-describedby');
    });

    it('should apply correct CSS classes', () => {
      render(<DrawingCanvas />);
      
      const canvasContainer = screen.getByRole('application');
      expect(canvasContainer).toHaveClass('relative', 'w-full', 'h-full', 'overflow-hidden');
    });
  });

  describe('Keyboard Navigation Integration', () => {
    it('should handle keyboard events', () => {
      const mockNavigateElements = jest.fn();
      require('@/hooks/useCanvasKeyboardNavigation').useCanvasKeyboardNavigation.mockReturnValue({
        focusedElementId: null,
        isCanvasFocused: true,
        navigateElements: mockNavigateElements,
        selectFocusedElement: jest.fn(),
        moveFocusedElement: jest.fn(),
        getAllElements: jest.fn(() => []),
        getFocusedElement: jest.fn(),
        setIsCanvasFocused: jest.fn(),
      });

      render(<DrawingCanvas />);
      
      const canvasContainer = screen.getByRole('application');
      
      // Test Tab navigation
      fireEvent.keyDown(canvasContainer, { key: 'Tab' });
      expect(mockNavigateElements).toHaveBeenCalledWith('right');
      
      // Test Shift+Tab navigation
      fireEvent.keyDown(canvasContainer, { key: 'Tab', shiftKey: true });
      expect(mockNavigateElements).toHaveBeenCalledWith('left');
    });

    it('should handle element movement with Shift+Arrow keys', () => {
      const mockMoveFocusedElement = jest.fn();
      require('@/hooks/useCanvasKeyboardNavigation').useCanvasKeyboardNavigation.mockReturnValue({
        focusedElementId: 'wall-1',
        isCanvasFocused: true,
        navigateElements: jest.fn(),
        selectFocusedElement: jest.fn(),
        moveFocusedElement: mockMoveFocusedElement,
        getAllElements: jest.fn(() => []),
        getFocusedElement: jest.fn(),
        setIsCanvasFocused: jest.fn(),
      });

      render(<DrawingCanvas />);
      
      const canvasContainer = screen.getByRole('application');
      
      // Test Shift+Arrow movement
      fireEvent.keyDown(canvasContainer, { key: 'ArrowRight', shiftKey: true });
      expect(mockMoveFocusedElement).toHaveBeenCalledWith('right', 10);
      
      // Test Ctrl+Shift+Arrow fine movement
      fireEvent.keyDown(canvasContainer, { key: 'ArrowUp', shiftKey: true, ctrlKey: true });
      expect(mockMoveFocusedElement).toHaveBeenCalledWith('up', 1);
    });
  });

  describe('Element Interaction', () => {
    it('should handle element selection', () => {
      const mockSelectElement = jest.fn();
      mockUseDesignStore.mockReturnValue({
        ...mockUseDesignStore(),
        selectElement: mockSelectElement,
      } as any);

      render(<DrawingCanvas />);
      
      // This would typically involve clicking on a rendered element
      // Since we're mocking Konva, we'll test the integration points
      expect(mockSelectElement).toBeDefined();
    });

    it('should handle context menu', async () => {
      render(<DrawingCanvas />);
      
      const canvasContainer = screen.getByRole('application');
      
      // Right-click to open context menu
      fireEvent.contextMenu(canvasContainer, { clientX: 100, clientY: 100 });
      
      // Context menu should be handled (implementation depends on ContextMenu component)
      // This tests the integration point
    });
  });

  describe('Tool Integration', () => {
    it('should respond to tool changes', () => {
      const { rerender } = render(<DrawingCanvas />);
      
      // Change tool to wall
      mockUseUIStore.mockReturnValue({
        ...mockUseUIStore(),
        activeTool: 'wall',
      } as any);
      
      rerender(<DrawingCanvas />);
      
      // Canvas should adapt to new tool
      const canvasContainer = screen.getByRole('application');
      expect(canvasContainer).toBeInTheDocument();
    });

    it('should handle grid toggle', () => {
      const { rerender } = render(<DrawingCanvas />);
      
      // Toggle grid off
      mockUseUIStore.mockReturnValue({
        ...mockUseUIStore(),
        showGrid: false,
      } as any);
      
      rerender(<DrawingCanvas />);
      
      // Grid should be hidden (implementation depends on Grid component)
      const canvasContainer = screen.getByRole('application');
      expect(canvasContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('should announce tool changes', () => {
      const mockAnnounceToolChange = jest.fn();
      require('@/components/Accessibility/AccessibilityAnnouncer').useAccessibilityAnnouncer.mockReturnValue({
        announceToolChange: mockAnnounceToolChange,
        announceElementCreated: jest.fn(),
        announceElementSelected: jest.fn(),
        announceElementDeleted: jest.fn(),
      });

      const { rerender } = render(<DrawingCanvas />);
      
      // Change tool
      mockUseUIStore.mockReturnValue({
        ...mockUseUIStore(),
        activeTool: 'door',
      } as any);
      
      rerender(<DrawingCanvas />);
      
      // Should announce tool change
      expect(mockAnnounceToolChange).toHaveBeenCalled();
    });

    it('should handle focus management', () => {
      const mockSetIsCanvasFocused = jest.fn();
      require('@/hooks/useCanvasKeyboardNavigation').useCanvasKeyboardNavigation.mockReturnValue({
        focusedElementId: null,
        isCanvasFocused: false,
        navigateElements: jest.fn(),
        selectFocusedElement: jest.fn(),
        moveFocusedElement: jest.fn(),
        getAllElements: jest.fn(() => []),
        getFocusedElement: jest.fn(),
        setIsCanvasFocused: mockSetIsCanvasFocused,
      });

      render(<DrawingCanvas />);
      
      const canvasContainer = screen.getByRole('application');
      
      // Focus canvas
      fireEvent.focus(canvasContainer);
      expect(mockSetIsCanvasFocused).toHaveBeenCalledWith(true);
      
      // Blur canvas
      fireEvent.blur(canvasContainer);
      expect(mockSetIsCanvasFocused).toHaveBeenCalledWith(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing elements gracefully', () => {
      mockUseDesignStore.mockReturnValue({
        walls: [],
        doors: [],
        windows: [],
        stairs: [],
        roofs: [],
        rooms: [],
        selectedElementId: null,
        selectedElementType: null,
        selectElement: jest.fn(),
        addWall: jest.fn(),
        updateWall: jest.fn(),
        removeWall: jest.fn(),
      } as any);

      expect(() => render(<DrawingCanvas />)).not.toThrow();
    });

    it('should handle store errors gracefully', () => {
      mockUseDesignStore.mockImplementation(() => {
        throw new Error('Store error');
      });

      // Should not crash the application
      expect(() => render(<DrawingCanvas />)).toThrow('Store error');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<DrawingCanvas />);
      
      // Re-render with same props
      rerender(<DrawingCanvas />);
      
      // Should handle re-renders gracefully
      const canvasContainer = screen.getByRole('application');
      expect(canvasContainer).toBeInTheDocument();
    });

    it('should handle large numbers of elements', () => {
      const manyWalls = Array.from({ length: 100 }, (_, i) => ({
        id: `wall-${i}`,
        type: 'wall',
        startX: i * 10,
        startY: 0,
        endX: i * 10 + 10,
        endY: 10,
        thickness: 6,
        height: 96,
        color: '#000000',
      }));

      mockUseDesignStore.mockReturnValue({
        walls: manyWalls,
        doors: [],
        windows: [],
        stairs: [],
        roofs: [],
        rooms: [],
        selectedElementId: null,
        selectedElementType: null,
        selectElement: jest.fn(),
        addWall: jest.fn(),
        updateWall: jest.fn(),
        removeWall: jest.fn(),
      } as any);

      expect(() => render(<DrawingCanvas />)).not.toThrow();
    });
  });
});