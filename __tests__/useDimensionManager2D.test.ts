import { renderHook, act } from '@testing-library/react';
import useDimensionManager2D from '@/hooks/useDimensionManager2D';
import { useDesignStore } from '@/stores/designStore';
import { useViewStore } from '@/stores/viewStore';
import { useUnitStore } from '@/stores/unitStore';

// Mock dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/viewStore');
jest.mock('@/stores/unitStore');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseViewStore = useViewStore as jest.MockedFunction<typeof useViewStore>;
const mockUseUnitStore = useUnitStore as jest.MockedFunction<typeof useUnitStore>;

describe('useDimensionManager2D', () => {
  // Mock store functions
  const mockAddDimension = jest.fn();
  const mockRemoveDimension = jest.fn();
  const mockUpdateDimension = jest.fn();
  const mockConvertToDisplayUnit = jest.fn();

  // Mock data
  const mockWalls = [
    { id: 'wall-1', x1: 0, y1: 0, x2: 100, y2: 0, thickness: 10 },
    { id: 'wall-2', x1: 100, y1: 0, x2: 100, y2: 100, thickness: 10 },
  ];

  const mockDimensions = [
    {
      id: 'dim-1',
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 100, y: 0 },
      value: 100,
      label: '100 ft',
      type: 'horizontal',
    },
    {
      id: 'dim-2',
      startPoint: { x: 100, y: 0 },
      endPoint: { x: 100, y: 100 },
      value: 100,
      label: '100 ft',
      type: 'vertical',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      dimensions: mockDimensions,
      addDimension: mockAddDimension,
      removeDimension: mockRemoveDimension,
      updateDimension: mockUpdateDimension,
    } as any);

    mockUseViewStore.mockReturnValue({
      currentView: 'plan',
      scale: 1,
      offset: { x: 0, y: 0 },
    } as any);

    mockUseUnitStore.mockReturnValue({
      currentUnit: 'ft',
      convertToDisplayUnit: mockConvertToDisplayUnit,
    } as any);

    mockConvertToDisplayUnit.mockImplementation((value) => `${value} ft`);
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      expect(result.current.dimensions).toEqual(mockDimensions);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.previewDimension).toBe(null);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      expect(typeof result.current.startCreating).toBe('function');
      expect(typeof result.current.updatePreview).toBe('function');
      expect(typeof result.current.finishCreating).toBe('function');
      expect(typeof result.current.cancelCreating).toBe('function');
      expect(typeof result.current.deleteDimension).toBe('function');
      expect(typeof result.current.updateDimensionLabel).toBe('function');
      expect(typeof result.current.calculateDistance).toBe('function');
      expect(typeof result.current.getVisibleDimensions).toBe('function');
    });
  });

  describe('startCreating', () => {
    it('should start creating dimension with start point', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(50, 25);
      });

      expect(result.current.isCreating).toBe(true);
      expect(result.current.previewDimension).toMatchObject({
        startPoint: { x: 50, y: 25 },
        endPoint: { x: 50, y: 25 },
        value: 0,
        type: 'horizontal',
      });
    });

    it('should snap to wall endpoints when close', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      // Start near wall endpoint (within snap threshold)
      act(() => {
        result.current.startCreating(5, 5);
      });

      expect(result.current.previewDimension?.startPoint).toEqual({ x: 0, y: 0 });
    });

    it('should not start creating if already creating', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(50, 25);
      });

      const firstPreview = result.current.previewDimension;

      act(() => {
        result.current.startCreating(75, 50);
      });

      expect(result.current.previewDimension).toBe(firstPreview);
    });
  });

  describe('updatePreview', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useDimensionManager2D());
      act(() => {
        result.current.startCreating(0, 0);
      });
    });

    it('should update preview dimension end point', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(0, 0);
      });

      act(() => {
        result.current.updatePreview(100, 0);
      });

      expect(result.current.previewDimension?.endPoint).toEqual({ x: 100, y: 0 });
      expect(result.current.previewDimension?.value).toBe(100);
      expect(result.current.previewDimension?.type).toBe('horizontal');
    });

    it('should determine vertical dimension type', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(0, 0);
      });

      act(() => {
        result.current.updatePreview(0, 100);
      });

      expect(result.current.previewDimension?.type).toBe('vertical');
      expect(result.current.previewDimension?.value).toBe(100);
    });

    it('should determine diagonal dimension type', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(0, 0);
      });

      act(() => {
        result.current.updatePreview(100, 100);
      });

      expect(result.current.previewDimension?.type).toBe('diagonal');
      expect(result.current.previewDimension?.value).toBeCloseTo(141.42, 1); // sqrt(100^2 + 100^2)
    });

    it('should snap end point to wall endpoints', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(0, 0);
      });

      act(() => {
        result.current.updatePreview(95, 5); // Near wall endpoint (100, 0)
      });

      expect(result.current.previewDimension?.endPoint).toEqual({ x: 100, y: 0 });
    });

    it('should not update if not creating', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.updatePreview(100, 100);
      });

      expect(result.current.previewDimension).toBe(null);
    });

    it('should update dimension label with unit conversion', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(0, 0);
      });

      act(() => {
        result.current.updatePreview(100, 0);
      });

      expect(mockConvertToDisplayUnit).toHaveBeenCalledWith(100);
      expect(result.current.previewDimension?.label).toBe('100 ft');
    });
  });

  describe('finishCreating', () => {
    it('should finish creating and add dimension to store', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(0, 0);
      });

      act(() => {
        result.current.updatePreview(100, 0);
      });

      act(() => {
        result.current.finishCreating();
      });

      expect(mockAddDimension).toHaveBeenCalledWith(
        expect.objectContaining({
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 100, y: 0 },
          value: 100,
          type: 'horizontal',
          label: '100 ft',
        })
      );

      expect(result.current.isCreating).toBe(false);
      expect(result.current.previewDimension).toBe(null);
    });

    it('should not finish if not creating', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.finishCreating();
      });

      expect(mockAddDimension).not.toHaveBeenCalled();
    });

    it('should not finish if preview dimension is null', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      // Force isCreating to true but previewDimension to null
      act(() => {
        result.current.startCreating(0, 0);
        // Manually set previewDimension to null (edge case)
        (result.current as any).previewDimension = null;
      });

      act(() => {
        result.current.finishCreating();
      });

      expect(mockAddDimension).not.toHaveBeenCalled();
    });

    it('should generate unique dimension ID', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(0, 0);
        result.current.updatePreview(100, 0);
        result.current.finishCreating();
      });

      const firstCall = mockAddDimension.mock.calls[0][0];

      act(() => {
        result.current.startCreating(0, 50);
        result.current.updatePreview(100, 50);
        result.current.finishCreating();
      });

      const secondCall = mockAddDimension.mock.calls[1][0];

      expect(firstCall.id).not.toBe(secondCall.id);
      expect(firstCall.id).toMatch(/^dim-\d+$/);
      expect(secondCall.id).toMatch(/^dim-\d+$/);
    });
  });

  describe('cancelCreating', () => {
    it('should cancel creating and reset state', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(0, 0);
        result.current.updatePreview(100, 0);
      });

      expect(result.current.isCreating).toBe(true);
      expect(result.current.previewDimension).not.toBe(null);

      act(() => {
        result.current.cancelCreating();
      });

      expect(result.current.isCreating).toBe(false);
      expect(result.current.previewDimension).toBe(null);
    });

    it('should work when not creating', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.cancelCreating();
      });

      expect(result.current.isCreating).toBe(false);
      expect(result.current.previewDimension).toBe(null);
    });
  });

  describe('deleteDimension', () => {
    it('should delete dimension from store', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.deleteDimension('dim-1');
      });

      expect(mockRemoveDimension).toHaveBeenCalledWith('dim-1');
    });
  });

  describe('updateDimensionLabel', () => {
    it('should update dimension label in store', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.updateDimensionLabel('dim-1', 'Custom Label');
      });

      expect(mockUpdateDimension).toHaveBeenCalledWith('dim-1', {
        label: 'Custom Label',
      });
    });
  });

  describe('calculateDistance', () => {
    it('should calculate horizontal distance', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      const distance = result.current.calculateDistance(
        { x: 0, y: 0 },
        { x: 100, y: 0 }
      );

      expect(distance).toBe(100);
    });

    it('should calculate vertical distance', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      const distance = result.current.calculateDistance(
        { x: 0, y: 0 },
        { x: 0, y: 100 }
      );

      expect(distance).toBe(100);
    });

    it('should calculate diagonal distance', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      const distance = result.current.calculateDistance(
        { x: 0, y: 0 },
        { x: 3, y: 4 }
      );

      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should handle same point', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      const distance = result.current.calculateDistance(
        { x: 50, y: 50 },
        { x: 50, y: 50 }
      );

      expect(distance).toBe(0);
    });
  });

  describe('getVisibleDimensions', () => {
    it('should return all dimensions for plan view', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      const visible = result.current.getVisibleDimensions();

      expect(visible).toEqual(mockDimensions);
    });

    it('should filter dimensions for elevation view', () => {
      mockUseViewStore.mockReturnValue({
        currentView: 'elevation',
        scale: 1,
        offset: { x: 0, y: 0 },
      } as any);

      const { result } = renderHook(() => useDimensionManager2D());

      const visible = result.current.getVisibleDimensions();

      // Should only include vertical and diagonal dimensions for elevation view
      expect(visible).toEqual([mockDimensions[1]]); // Only the vertical dimension
    });

    it('should apply scale and offset transformations', () => {
      mockUseViewStore.mockReturnValue({
        currentView: 'plan',
        scale: 2,
        offset: { x: 10, y: 20 },
      } as any);

      const { result } = renderHook(() => useDimensionManager2D());

      const visible = result.current.getVisibleDimensions();

      expect(visible[0].startPoint).toEqual({ x: 10, y: 20 }); // Transformed coordinates
      expect(visible[0].endPoint).toEqual({ x: 210, y: 20 }); // (100 * 2) + 10, (0 * 2) + 20
    });
  });

  describe('Snapping Logic', () => {
    it('should snap to wall start points', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(5, 5); // Near (0, 0)
      });

      expect(result.current.previewDimension?.startPoint).toEqual({ x: 0, y: 0 });
    });

    it('should snap to wall end points', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(95, 5); // Near (100, 0)
      });

      expect(result.current.previewDimension?.startPoint).toEqual({ x: 100, y: 0 });
    });

    it('should not snap if too far from wall points', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(50, 50); // Far from any wall point
      });

      expect(result.current.previewDimension?.startPoint).toEqual({ x: 50, y: 50 });
    });

    it('should use configurable snap threshold', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      // Test with point exactly at threshold distance
      act(() => {
        result.current.startCreating(10, 0); // 10 units from (0, 0)
      });

      // Should not snap if threshold is less than 10
      expect(result.current.previewDimension?.startPoint).toEqual({ x: 10, y: 0 });
    });
  });

  describe('Store Integration', () => {
    it('should react to changes in dimensions from store', () => {
      const { result, rerender } = renderHook(() => useDimensionManager2D());

      const newDimensions = [
        {
          id: 'dim-3',
          startPoint: { x: 0, y: 100 },
          endPoint: { x: 100, y: 100 },
          value: 100,
          label: '100 ft',
          type: 'horizontal',
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: mockWalls,
        dimensions: newDimensions,
        addDimension: mockAddDimension,
        removeDimension: mockRemoveDimension,
        updateDimension: mockUpdateDimension,
      } as any);

      rerender();

      expect(result.current.dimensions).toEqual(newDimensions);
    });

    it('should react to unit changes', () => {
      mockUseUnitStore.mockReturnValue({
        currentUnit: 'm',
        convertToDisplayUnit: jest.fn().mockReturnValue('30.48 m'),
      } as any);

      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(0, 0);
        result.current.updatePreview(100, 0);
      });

      expect(result.current.previewDimension?.label).toBe('30.48 m');
    });

    it('should react to view changes', () => {
      const { result, rerender } = renderHook(() => useDimensionManager2D());

      // Change to elevation view
      mockUseViewStore.mockReturnValue({
        currentView: 'elevation',
        scale: 1,
        offset: { x: 0, y: 0 },
      } as any);

      rerender();

      const visible = result.current.getVisibleDimensions();
      expect(visible.length).toBeLessThan(mockDimensions.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty walls array', () => {
      mockUseDesignStore.mockReturnValue({
        walls: [],
        dimensions: mockDimensions,
        addDimension: mockAddDimension,
        removeDimension: mockRemoveDimension,
        updateDimension: mockUpdateDimension,
      } as any);

      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(50, 50);
      });

      // Should not snap to any points
      expect(result.current.previewDimension?.startPoint).toEqual({ x: 50, y: 50 });
    });

    it('should handle very small distances', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      const distance = result.current.calculateDistance(
        { x: 0, y: 0 },
        { x: 0.001, y: 0.001 }
      );

      expect(distance).toBeCloseTo(0.0014, 4);
    });

    it('should handle very large distances', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      const distance = result.current.calculateDistance(
        { x: 0, y: 0 },
        { x: 1000000, y: 1000000 }
      );

      expect(distance).toBeCloseTo(1414213.56, 2);
    });

    it('should handle negative coordinates', () => {
      const { result } = renderHook(() => useDimensionManager2D());

      act(() => {
        result.current.startCreating(-50, -50);
        result.current.updatePreview(50, 50);
      });

      expect(result.current.previewDimension?.value).toBeCloseTo(141.42, 1);
    });
  });
});