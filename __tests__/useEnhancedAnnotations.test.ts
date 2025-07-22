import { renderHook, act } from '@testing-library/react';
import { useEnhancedAnnotations } from '@/hooks/useEnhancedAnnotations';
import { useDesignStore } from '@/stores/designStore';
import { useViewStore } from '@/stores/viewStore';
import { useUIStore } from '@/stores/uiStore';

// Mock dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/viewStore');
jest.mock('@/stores/uiStore');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseViewStore = useViewStore as jest.MockedFunction<typeof useViewStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

describe('useEnhancedAnnotations', () => {
  // Mock store functions
  const mockAddAnnotation = jest.fn();
  const mockUpdateAnnotation = jest.fn();
  const mockRemoveAnnotation = jest.fn();
  const mockSetAnnotationMode = jest.fn();

  // Mock data
  const mockAnnotations = [
    {
      id: 'ann-1',
      type: 'text',
      x: 50,
      y: 50,
      content: 'Sample annotation',
      style: { fontSize: 12, color: '#000000' },
    },
    {
      id: 'ann-2',
      type: 'dimension',
      x: 0,
      y: 0,
      endX: 100,
      endY: 0,
      content: '100 ft',
      style: { color: '#0066CC' },
    },
  ];

  const mockElements = [
    { id: 'wall-1', type: 'wall', x1: 0, y1: 0, x2: 100, y2: 0 },
    { id: 'door-1', type: 'door', x: 50, y: 0, wallId: 'wall-1' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUseDesignStore.mockReturnValue({
      annotations: mockAnnotations,
      walls: mockElements.filter(e => e.type === 'wall'),
      doors: mockElements.filter(e => e.type === 'door'),
      windows: [],
      addAnnotation: mockAddAnnotation,
      updateAnnotation: mockUpdateAnnotation,
      removeAnnotation: mockRemoveAnnotation,
    } as any);

    mockUseViewStore.mockReturnValue({
      currentView: 'plan',
      scale: 1,
      offset: { x: 0, y: 0 },
    } as any);

    mockUseUIStore.mockReturnValue({
      annotationMode: 'none',
      setAnnotationMode: mockSetAnnotationMode,
      selectedTool: 'select',
    } as any);
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      expect(result.current.annotations).toEqual(mockAnnotations);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.previewAnnotation).toBe(null);
      expect(result.current.selectedAnnotation).toBe(null);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      expect(typeof result.current.startCreating).toBe('function');
      expect(typeof result.current.updatePreview).toBe('function');
      expect(typeof result.current.finishCreating).toBe('function');
      expect(typeof result.current.cancelCreating).toBe('function');
      expect(typeof result.current.selectAnnotation).toBe('function');
      expect(typeof result.current.updateAnnotation).toBe('function');
      expect(typeof result.current.deleteAnnotation).toBe('function');
      expect(typeof result.current.duplicateAnnotation).toBe('function');
      expect(typeof result.current.getVisibleAnnotations).toBe('function');
      expect(typeof result.current.autoGenerateAnnotations).toBe('function');
    });
  });

  describe('startCreating', () => {
    it('should start creating text annotation', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('text', 100, 50);
      });

      expect(result.current.isCreating).toBe(true);
      expect(result.current.previewAnnotation).toMatchObject({
        type: 'text',
        x: 100,
        y: 50,
        content: '',
        style: expect.objectContaining({
          fontSize: expect.any(Number),
          color: expect.any(String),
        }),
      });
    });

    it('should start creating dimension annotation', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('dimension', 0, 0);
      });

      expect(result.current.previewAnnotation).toMatchObject({
        type: 'dimension',
        x: 0,
        y: 0,
        endX: 0,
        endY: 0,
        content: '0',
      });
    });

    it('should start creating arrow annotation', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('arrow', 25, 75);
      });

      expect(result.current.previewAnnotation).toMatchObject({
        type: 'arrow',
        x: 25,
        y: 75,
        endX: 25,
        endY: 75,
      });
    });

    it('should not start creating if already creating', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('text', 100, 50);
      });

      const firstPreview = result.current.previewAnnotation;

      act(() => {
        result.current.startCreating('dimension', 200, 100);
      });

      expect(result.current.previewAnnotation).toBe(firstPreview);
    });

    it('should accept custom style options', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      const customStyle = {
        fontSize: 16,
        color: '#FF0000',
        fontWeight: 'bold',
      };

      act(() => {
        result.current.startCreating('text', 100, 50, { style: customStyle });
      });

      expect(result.current.previewAnnotation?.style).toMatchObject(customStyle);
    });
  });

  describe('updatePreview', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useEnhancedAnnotations());
      act(() => {
        result.current.startCreating('dimension', 0, 0);
      });
    });

    it('should update dimension annotation end point', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('dimension', 0, 0);
      });

      act(() => {
        result.current.updatePreview(100, 0);
      });

      expect(result.current.previewAnnotation).toMatchObject({
        endX: 100,
        endY: 0,
        content: '100',
      });
    });

    it('should update arrow annotation end point', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('arrow', 0, 0);
      });

      act(() => {
        result.current.updatePreview(50, 50);
      });

      expect(result.current.previewAnnotation).toMatchObject({
        endX: 50,
        endY: 50,
      });
    });

    it('should not update text annotations', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('text', 100, 50);
      });

      const originalPreview = { ...result.current.previewAnnotation! };

      act(() => {
        result.current.updatePreview(200, 100);
      });

      expect(result.current.previewAnnotation).toMatchObject(originalPreview);
    });

    it('should not update if not creating', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.updatePreview(100, 100);
      });

      expect(result.current.previewAnnotation).toBe(null);
    });

    it('should snap to element points when close', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('dimension', 0, 0);
      });

      // Update to point close to wall endpoint
      act(() => {
        result.current.updatePreview(95, 5); // Near (100, 0)
      });

      expect(result.current.previewAnnotation?.endX).toBe(100);
      expect(result.current.previewAnnotation?.endY).toBe(0);
    });
  });

  describe('finishCreating', () => {
    it('should finish creating and add annotation to store', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('text', 100, 50, { content: 'Test annotation' });
      });

      act(() => {
        result.current.finishCreating();
      });

      expect(mockAddAnnotation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text',
          x: 100,
          y: 50,
          content: 'Test annotation',
        })
      );

      expect(result.current.isCreating).toBe(false);
      expect(result.current.previewAnnotation).toBe(null);
    });

    it('should not finish if not creating', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.finishCreating();
      });

      expect(mockAddAnnotation).not.toHaveBeenCalled();
    });

    it('should not finish if preview annotation is null', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      // Force isCreating to true but previewAnnotation to null
      act(() => {
        result.current.startCreating('text', 100, 50);
        // Manually set previewAnnotation to null (edge case)
        (result.current as any).previewAnnotation = null;
      });

      act(() => {
        result.current.finishCreating();
      });

      expect(mockAddAnnotation).not.toHaveBeenCalled();
    });

    it('should generate unique annotation ID', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('text', 100, 50);
        result.current.finishCreating();
      });

      const firstCall = mockAddAnnotation.mock.calls[0][0];

      act(() => {
        result.current.startCreating('text', 200, 100);
        result.current.finishCreating();
      });

      const secondCall = mockAddAnnotation.mock.calls[1][0];

      expect(firstCall.id).not.toBe(secondCall.id);
      expect(firstCall.id).toMatch(/^ann-\d+$/);
      expect(secondCall.id).toMatch(/^ann-\d+$/);
    });
  });

  describe('cancelCreating', () => {
    it('should cancel creating and reset state', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('text', 100, 50);
      });

      expect(result.current.isCreating).toBe(true);
      expect(result.current.previewAnnotation).not.toBe(null);

      act(() => {
        result.current.cancelCreating();
      });

      expect(result.current.isCreating).toBe(false);
      expect(result.current.previewAnnotation).toBe(null);
    });

    it('should work when not creating', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.cancelCreating();
      });

      expect(result.current.isCreating).toBe(false);
      expect(result.current.previewAnnotation).toBe(null);
    });
  });

  describe('selectAnnotation', () => {
    it('should select annotation by ID', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.selectAnnotation('ann-1');
      });

      expect(result.current.selectedAnnotation).toBe('ann-1');
    });

    it('should deselect when selecting same annotation', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.selectAnnotation('ann-1');
      });

      act(() => {
        result.current.selectAnnotation('ann-1');
      });

      expect(result.current.selectedAnnotation).toBe(null);
    });

    it('should select null to deselect', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.selectAnnotation('ann-1');
      });

      act(() => {
        result.current.selectAnnotation(null);
      });

      expect(result.current.selectedAnnotation).toBe(null);
    });
  });

  describe('updateAnnotation', () => {
    it('should update annotation in store', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      const updates = {
        content: 'Updated content',
        style: { fontSize: 16, color: '#FF0000' },
      };

      act(() => {
        result.current.updateAnnotation('ann-1', updates);
      });

      expect(mockUpdateAnnotation).toHaveBeenCalledWith('ann-1', updates);
    });
  });

  describe('deleteAnnotation', () => {
    it('should delete annotation from store', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.deleteAnnotation('ann-1');
      });

      expect(mockRemoveAnnotation).toHaveBeenCalledWith('ann-1');
    });

    it('should deselect if deleting selected annotation', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.selectAnnotation('ann-1');
      });

      act(() => {
        result.current.deleteAnnotation('ann-1');
      });

      expect(result.current.selectedAnnotation).toBe(null);
    });

    it('should not affect selection if deleting different annotation', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.selectAnnotation('ann-1');
      });

      act(() => {
        result.current.deleteAnnotation('ann-2');
      });

      expect(result.current.selectedAnnotation).toBe('ann-1');
    });
  });

  describe('duplicateAnnotation', () => {
    it('should duplicate annotation with offset', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.duplicateAnnotation('ann-1');
      });

      expect(mockAddAnnotation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text',
          x: 60, // Original x (50) + offset (10)
          y: 60, // Original y (50) + offset (10)
          content: 'Sample annotation',
        })
      );
    });

    it('should handle dimension annotations', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.duplicateAnnotation('ann-2');
      });

      expect(mockAddAnnotation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'dimension',
          x: 10, // Original x (0) + offset (10)
          y: 10, // Original y (0) + offset (10)
          endX: 110, // Original endX (100) + offset (10)
          endY: 10, // Original endY (0) + offset (10)
        })
      );
    });

    it('should not duplicate non-existent annotation', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.duplicateAnnotation('non-existent');
      });

      expect(mockAddAnnotation).not.toHaveBeenCalled();
    });

    it('should generate unique ID for duplicate', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.duplicateAnnotation('ann-1');
      });

      const duplicateCall = mockAddAnnotation.mock.calls[0][0];
      expect(duplicateCall.id).not.toBe('ann-1');
      expect(duplicateCall.id).toMatch(/^ann-\d+$/);
    });
  });

  describe('getVisibleAnnotations', () => {
    it('should return all annotations for plan view', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      const visible = result.current.getVisibleAnnotations();

      expect(visible).toEqual(mockAnnotations);
    });

    it('should filter annotations for elevation view', () => {
      mockUseViewStore.mockReturnValue({
        currentView: 'elevation',
        scale: 1,
        offset: { x: 0, y: 0 },
      } as any);

      const { result } = renderHook(() => useEnhancedAnnotations());

      const visible = result.current.getVisibleAnnotations();

      // Should filter based on view type
      expect(visible.length).toBeLessThanOrEqual(mockAnnotations.length);
    });

    it('should apply view transformations', () => {
      mockUseViewStore.mockReturnValue({
        currentView: 'plan',
        scale: 2,
        offset: { x: 10, y: 20 },
      } as any);

      const { result } = renderHook(() => useEnhancedAnnotations());

      const visible = result.current.getVisibleAnnotations();

      // Coordinates should be transformed
      expect(visible[0].x).toBe(110); // (50 * 2) + 10
      expect(visible[0].y).toBe(120); // (50 * 2) + 20
    });
  });

  describe('autoGenerateAnnotations', () => {
    it('should generate dimension annotations for walls', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.autoGenerateAnnotations();
      });

      expect(mockAddAnnotation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'dimension',
          content: expect.stringMatching(/\d+/),
        })
      );
    });

    it('should generate label annotations for doors', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.autoGenerateAnnotations();
      });

      expect(mockAddAnnotation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text',
          content: expect.stringContaining('Door'),
        })
      );
    });

    it('should not generate duplicates for existing annotations', () => {
      // Mock existing dimension annotation that covers a wall
      const existingDimension = {
        id: 'existing-dim',
        type: 'dimension',
        x: 0,
        y: 0,
        endX: 100,
        endY: 0,
        content: '100 ft',
      };

      mockUseDesignStore.mockReturnValue({
        annotations: [existingDimension],
        walls: mockElements.filter(e => e.type === 'wall'),
        doors: mockElements.filter(e => e.type === 'door'),
        windows: [],
        addAnnotation: mockAddAnnotation,
        updateAnnotation: mockUpdateAnnotation,
        removeAnnotation: mockRemoveAnnotation,
      } as any);

      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.autoGenerateAnnotations();
      });

      // Should not add duplicate dimension for the same wall
      const dimensionCalls = mockAddAnnotation.mock.calls.filter(
        call => call[0].type === 'dimension'
      );
      expect(dimensionCalls.length).toBe(0);
    });
  });

  describe('Store Integration', () => {
    it('should react to changes in annotations from store', () => {
      const { result, rerender } = renderHook(() => useEnhancedAnnotations());

      const newAnnotations = [
        {
          id: 'ann-3',
          type: 'text',
          x: 200,
          y: 200,
          content: 'New annotation',
          style: { fontSize: 14, color: '#00FF00' },
        },
      ];

      mockUseDesignStore.mockReturnValue({
        annotations: newAnnotations,
        walls: mockElements.filter(e => e.type === 'wall'),
        doors: mockElements.filter(e => e.type === 'door'),
        windows: [],
        addAnnotation: mockAddAnnotation,
        updateAnnotation: mockUpdateAnnotation,
        removeAnnotation: mockRemoveAnnotation,
      } as any);

      rerender();

      expect(result.current.annotations).toEqual(newAnnotations);
    });

    it('should react to view changes', () => {
      const { result, rerender } = renderHook(() => useEnhancedAnnotations());

      // Change to elevation view
      mockUseViewStore.mockReturnValue({
        currentView: 'elevation',
        scale: 1,
        offset: { x: 0, y: 0 },
      } as any);

      rerender();

      const visible = result.current.getVisibleAnnotations();
      // Should apply view-specific filtering
      expect(visible).toBeDefined();
    });

    it('should react to annotation mode changes', () => {
      const { result, rerender } = renderHook(() => useEnhancedAnnotations());

      mockUseUIStore.mockReturnValue({
        annotationMode: 'text',
        setAnnotationMode: mockSetAnnotationMode,
        selectedTool: 'annotation',
      } as any);

      rerender();

      // Hook should be aware of annotation mode changes
      expect(result.current).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty annotations array', () => {
      mockUseDesignStore.mockReturnValue({
        annotations: [],
        walls: mockElements.filter(e => e.type === 'wall'),
        doors: mockElements.filter(e => e.type === 'door'),
        windows: [],
        addAnnotation: mockAddAnnotation,
        updateAnnotation: mockUpdateAnnotation,
        removeAnnotation: mockRemoveAnnotation,
      } as any);

      const { result } = renderHook(() => useEnhancedAnnotations());

      expect(result.current.annotations).toEqual([]);
      expect(result.current.getVisibleAnnotations()).toEqual([]);
    });

    it('should handle annotations with missing properties', () => {
      const incompleteAnnotation = {
        id: 'incomplete',
        type: 'text',
        x: 100,
        y: 100,
        // Missing content and style
      };

      mockUseDesignStore.mockReturnValue({
        annotations: [incompleteAnnotation],
        walls: [],
        doors: [],
        windows: [],
        addAnnotation: mockAddAnnotation,
        updateAnnotation: mockUpdateAnnotation,
        removeAnnotation: mockRemoveAnnotation,
      } as any);

      const { result } = renderHook(() => useEnhancedAnnotations());

      expect(result.current.annotations).toEqual([incompleteAnnotation]);
    });

    it('should handle very large coordinate values', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('text', 999999, 999999);
      });

      expect(result.current.previewAnnotation?.x).toBe(999999);
      expect(result.current.previewAnnotation?.y).toBe(999999);
    });

    it('should handle negative coordinate values', () => {
      const { result } = renderHook(() => useEnhancedAnnotations());

      act(() => {
        result.current.startCreating('dimension', -100, -100);
        result.current.updatePreview(-50, -50);
      });

      expect(result.current.previewAnnotation?.x).toBe(-100);
      expect(result.current.previewAnnotation?.y).toBe(-100);
      expect(result.current.previewAnnotation?.endX).toBe(-50);
      expect(result.current.previewAnnotation?.endY).toBe(-50);
    });
  });
});