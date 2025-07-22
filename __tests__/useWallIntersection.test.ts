import { renderHook, act } from '@testing-library/react';
import { useWallIntersection } from '@/hooks/useWallIntersection';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';

// Mock dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/historyStore');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseHistoryStore = useHistoryStore as jest.MockedFunction<typeof useHistoryStore>;

describe('useWallIntersection', () => {
  // Mock store functions
  const mockUpdateWall = jest.fn();
  const mockAddWall = jest.fn();
  const mockExecuteCommand = jest.fn();

  // Mock wall data
  const mockWalls = [
    {
      id: 'wall-1',
      x1: 0,
      y1: 0,
      x2: 100,
      y2: 0,
      thickness: 10,
      material: 'drywall',
    },
    {
      id: 'wall-2',
      x1: 50,
      y1: -50,
      x2: 50,
      y2: 50,
      thickness: 10,
      material: 'drywall',
    },
    {
      id: 'wall-3',
      x1: 200,
      y1: 200,
      x2: 300,
      y2: 200,
      thickness: 8,
      material: 'concrete',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      updateWall: mockUpdateWall,
      addWall: mockAddWall,
    } as any);

    mockUseHistoryStore.mockReturnValue({
      executeCommand: mockExecuteCommand,
    } as any);
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useWallIntersection());

      expect(result.current.intersections).toEqual([]);
      expect(result.current.isProcessing).toBe(false);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useWallIntersection());

      expect(typeof result.current.findIntersections).toBe('function');
      expect(typeof result.current.createIntersection).toBe('function');
      expect(typeof result.current.removeIntersection).toBe('function');
      expect(typeof result.current.updateIntersection).toBe('function');
      expect(typeof result.current.autoResolveIntersections).toBe('function');
      expect(typeof result.current.validateIntersection).toBe('function');
    });
  });

  describe('findIntersections', () => {
    it('should find intersection between perpendicular walls', () => {
      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
      });

      expect(result.current.intersections).toHaveLength(1);
      expect(result.current.intersections[0]).toMatchObject({
        point: { x: 50, y: 0 },
        wallIds: ['wall-1', 'wall-2'],
        type: 'T-junction',
      });
    });

    it('should not find intersections for parallel walls', () => {
      const parallelWalls = [
        {
          id: 'wall-1',
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 0,
          thickness: 10,
        },
        {
          id: 'wall-2',
          x1: 0,
          y1: 20,
          x2: 100,
          y2: 20,
          thickness: 10,
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: parallelWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
      } as any);

      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
      });

      expect(result.current.intersections).toHaveLength(0);
    });

    it('should find corner intersection', () => {
      const cornerWalls = [
        {
          id: 'wall-1',
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 0,
          thickness: 10,
        },
        {
          id: 'wall-2',
          x1: 100,
          y1: 0,
          x2: 100,
          y2: 100,
          thickness: 10,
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: cornerWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
      } as any);

      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
      });

      expect(result.current.intersections).toHaveLength(1);
      expect(result.current.intersections[0]).toMatchObject({
        point: { x: 100, y: 0 },
        wallIds: ['wall-1', 'wall-2'],
        type: 'corner',
      });
    });

    it('should find cross intersection', () => {
      const crossWalls = [
        {
          id: 'wall-1',
          x1: 0,
          y1: 50,
          x2: 100,
          y2: 50,
          thickness: 10,
        },
        {
          id: 'wall-2',
          x1: 50,
          y1: 0,
          x2: 50,
          y2: 100,
          thickness: 10,
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: crossWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
      } as any);

      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
      });

      expect(result.current.intersections).toHaveLength(1);
      expect(result.current.intersections[0]).toMatchObject({
        point: { x: 50, y: 50 },
        wallIds: ['wall-1', 'wall-2'],
        type: 'cross',
      });
    });

    it('should handle walls that do not intersect', () => {
      const separateWalls = [
        {
          id: 'wall-1',
          x1: 0,
          y1: 0,
          x2: 50,
          y2: 0,
          thickness: 10,
        },
        {
          id: 'wall-2',
          x1: 100,
          y1: 100,
          x2: 150,
          y2: 100,
          thickness: 10,
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: separateWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
      } as any);

      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
      });

      expect(result.current.intersections).toHaveLength(0);
    });

    it('should set processing state during calculation', () => {
      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
      });

      // Processing should be false after completion
      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe('createIntersection', () => {
    it('should create manual intersection', () => {
      const { result } = renderHook(() => useWallIntersection());

      const intersectionData = {
        point: { x: 75, y: 25 },
        wallIds: ['wall-1', 'wall-2'],
        type: 'manual' as const,
      };

      act(() => {
        result.current.createIntersection(intersectionData);
      });

      expect(result.current.intersections).toHaveLength(1);
      expect(result.current.intersections[0]).toMatchObject(intersectionData);
    });

    it('should generate unique intersection ID', () => {
      const { result } = renderHook(() => useWallIntersection());

      const intersectionData1 = {
        point: { x: 25, y: 25 },
        wallIds: ['wall-1', 'wall-2'],
        type: 'manual' as const,
      };

      const intersectionData2 = {
        point: { x: 75, y: 75 },
        wallIds: ['wall-2', 'wall-3'],
        type: 'manual' as const,
      };

      act(() => {
        result.current.createIntersection(intersectionData1);
        result.current.createIntersection(intersectionData2);
      });

      expect(result.current.intersections).toHaveLength(2);
      expect(result.current.intersections[0].id).not.toBe(result.current.intersections[1].id);
      expect(result.current.intersections[0].id).toMatch(/^intersection-\d+$/);
      expect(result.current.intersections[1].id).toMatch(/^intersection-\d+$/);
    });

    it('should validate wall IDs exist', () => {
      const { result } = renderHook(() => useWallIntersection());

      const invalidIntersection = {
        point: { x: 50, y: 50 },
        wallIds: ['wall-1', 'non-existent-wall'],
        type: 'manual' as const,
      };

      act(() => {
        result.current.createIntersection(invalidIntersection);
      });

      // Should not create intersection with invalid wall ID
      expect(result.current.intersections).toHaveLength(0);
    });
  });

  describe('removeIntersection', () => {
    it('should remove intersection by ID', () => {
      const { result } = renderHook(() => useWallIntersection());

      // First create an intersection
      const intersectionData = {
        point: { x: 50, y: 50 },
        wallIds: ['wall-1', 'wall-2'],
        type: 'manual' as const,
      };

      act(() => {
        result.current.createIntersection(intersectionData);
      });

      const intersectionId = result.current.intersections[0].id;

      act(() => {
        result.current.removeIntersection(intersectionId);
      });

      expect(result.current.intersections).toHaveLength(0);
    });

    it('should handle removal of non-existent intersection', () => {
      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.removeIntersection('non-existent-id');
      });

      expect(result.current.intersections).toHaveLength(0);
    });
  });

  describe('updateIntersection', () => {
    it('should update intersection properties', () => {
      const { result } = renderHook(() => useWallIntersection());

      // Create intersection first
      const intersectionData = {
        point: { x: 50, y: 50 },
        wallIds: ['wall-1', 'wall-2'],
        type: 'manual' as const,
      };

      act(() => {
        result.current.createIntersection(intersectionData);
      });

      const intersectionId = result.current.intersections[0].id;
      const updates = {
        point: { x: 60, y: 60 },
        type: 'T-junction' as const,
      };

      act(() => {
        result.current.updateIntersection(intersectionId, updates);
      });

      expect(result.current.intersections[0]).toMatchObject({
        ...intersectionData,
        ...updates,
        id: intersectionId,
      });
    });

    it('should handle update of non-existent intersection', () => {
      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.updateIntersection('non-existent-id', { point: { x: 100, y: 100 } });
      });

      expect(result.current.intersections).toHaveLength(0);
    });
  });

  describe('autoResolveIntersections', () => {
    it('should automatically resolve wall intersections', () => {
      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.autoResolveIntersections();
      });

      // Should execute history command for wall modifications
      expect(mockExecuteCommand).toHaveBeenCalled();
    });

    it('should handle T-junction resolution', () => {
      const { result } = renderHook(() => useWallIntersection());

      // First find intersections
      act(() => {
        result.current.findIntersections();
      });

      // Then auto-resolve
      act(() => {
        result.current.autoResolveIntersections();
      });

      expect(mockUpdateWall).toHaveBeenCalled();
    });

    it('should handle corner resolution', () => {
      const cornerWalls = [
        {
          id: 'wall-1',
          x1: 0,
          y1: 0,
          x2: 95,
          y2: 0,
          thickness: 10,
        },
        {
          id: 'wall-2',
          x1: 100,
          y1: 0,
          x2: 100,
          y2: 100,
          thickness: 10,
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: cornerWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
      } as any);

      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
        result.current.autoResolveIntersections();
      });

      // Should update walls to connect properly
      expect(mockUpdateWall).toHaveBeenCalled();
    });
  });

  describe('validateIntersection', () => {
    it('should validate valid intersection', () => {
      const { result } = renderHook(() => useWallIntersection());

      const validIntersection = {
        point: { x: 50, y: 0 },
        wallIds: ['wall-1', 'wall-2'],
        type: 'T-junction' as const,
      };

      const isValid = result.current.validateIntersection(validIntersection);

      expect(isValid).toBe(true);
    });

    it('should invalidate intersection with non-existent walls', () => {
      const { result } = renderHook(() => useWallIntersection());

      const invalidIntersection = {
        point: { x: 50, y: 0 },
        wallIds: ['wall-1', 'non-existent'],
        type: 'T-junction' as const,
      };

      const isValid = result.current.validateIntersection(invalidIntersection);

      expect(isValid).toBe(false);
    });

    it('should invalidate intersection with same wall twice', () => {
      const { result } = renderHook(() => useWallIntersection());

      const invalidIntersection = {
        point: { x: 50, y: 0 },
        wallIds: ['wall-1', 'wall-1'],
        type: 'T-junction' as const,
      };

      const isValid = result.current.validateIntersection(invalidIntersection);

      expect(isValid).toBe(false);
    });

    it('should invalidate intersection point not on walls', () => {
      const { result } = renderHook(() => useWallIntersection());

      const invalidIntersection = {
        point: { x: 200, y: 200 }, // Point not on either wall
        wallIds: ['wall-1', 'wall-2'],
        type: 'T-junction' as const,
      };

      const isValid = result.current.validateIntersection(invalidIntersection);

      expect(isValid).toBe(false);
    });
  });

  describe('Store Integration', () => {
    it('should react to changes in walls from store', () => {
      const { result, rerender } = renderHook(() => useWallIntersection());

      // Find initial intersections
      act(() => {
        result.current.findIntersections();
      });

      const initialCount = result.current.intersections.length;

      // Add a new wall that creates more intersections
      const newWalls = [
        ...mockWalls,
        {
          id: 'wall-4',
          x1: 0,
          y1: 50,
          x2: 100,
          y2: 50,
          thickness: 10,
          material: 'drywall',
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: newWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
      } as any);

      rerender();

      act(() => {
        result.current.findIntersections();
      });

      expect(result.current.intersections.length).toBeGreaterThan(initialCount);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty walls array', () => {
      mockUseDesignStore.mockReturnValue({
        walls: [],
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
      } as any);

      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
      });

      expect(result.current.intersections).toHaveLength(0);
    });

    it('should handle single wall', () => {
      mockUseDesignStore.mockReturnValue({
        walls: [mockWalls[0]],
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
      } as any);

      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
      });

      expect(result.current.intersections).toHaveLength(0);
    });

    it('should handle walls with zero length', () => {
      const zeroLengthWalls = [
        {
          id: 'wall-1',
          x1: 50,
          y1: 50,
          x2: 50,
          y2: 50,
          thickness: 10,
        },
        {
          id: 'wall-2',
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 0,
          thickness: 10,
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: zeroLengthWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
      } as any);

      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
      });

      // Should handle gracefully without errors
      expect(result.current.intersections).toBeDefined();
    });

    it('should handle very close but not intersecting walls', () => {
      const closeWalls = [
        {
          id: 'wall-1',
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 0,
          thickness: 10,
        },
        {
          id: 'wall-2',
          x1: 50,
          y1: 0.1, // Very close but not touching
          x2: 50,
          y2: 100,
          thickness: 10,
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: closeWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
      } as any);

      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
      });

      // Should not find intersection for very close but not touching walls
      expect(result.current.intersections).toHaveLength(0);
    });

    it('should handle walls with different thicknesses', () => {
      const differentThicknessWalls = [
        {
          id: 'wall-1',
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 0,
          thickness: 10,
        },
        {
          id: 'wall-2',
          x1: 50,
          y1: -25,
          x2: 50,
          y2: 25,
          thickness: 20,
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: differentThicknessWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
      } as any);

      const { result } = renderHook(() => useWallIntersection());

      act(() => {
        result.current.findIntersections();
      });

      expect(result.current.intersections).toHaveLength(1);
      expect(result.current.intersections[0]).toMatchObject({
        point: { x: 50, y: 0 },
        wallIds: ['wall-1', 'wall-2'],
      });
    });
  });
});