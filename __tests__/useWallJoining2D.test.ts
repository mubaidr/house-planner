import { renderHook, act } from '@testing-library/react';
import { useWallJoining2D } from '@/hooks/useWallJoining2D';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useFloorStore } from '@/stores/floorStore';

// Mock dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/historyStore');
jest.mock('@/stores/floorStore');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseHistoryStore = useHistoryStore as jest.MockedFunction<typeof useHistoryStore>;
const mockUseFloorStore = useFloorStore as jest.MockedFunction<typeof useFloorStore>;

describe('useWallJoining2D', () => {
  // Mock store functions
  const mockUpdateWall = jest.fn();
  const mockAddWall = jest.fn();
  const mockRemoveWall = jest.fn();
  const mockExecuteCommand = jest.fn();
  const mockUpdateElementInFloor = jest.fn();

  // Mock wall data
  const mockWalls = [
    {
      id: 'wall-1',
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 0,
      thickness: 10,
      material: 'drywall',
    },
    {
      id: 'wall-2',
      startX: 100,
      startY: 0,
      endX: 100,
      endY: 100,
      thickness: 10,
      material: 'drywall',
    },
    {
      id: 'wall-3',
      startX: 50,
      startY: -50,
      endX: 50,
      endY: 50,
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
      removeWall: mockRemoveWall,
    } as any);

    mockUseHistoryStore.mockReturnValue({
      executeCommand: mockExecuteCommand,
    } as any);

    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor-1',
      updateElementInFloor: mockUpdateElementInFloor,
    } as any);
  });

  describe('Initial State', () => {
    it('should provide all required functions', () => {
      const { result } = renderHook(() => useWallJoining2D());

      expect(typeof result.current.joinWalls).toBe('function');
      expect(typeof result.current.splitWall).toBe('function');
      expect(typeof result.current.mergeWalls).toBe('function');
      expect(typeof result.current.autoJoinWalls).toBe('function');
      expect(typeof result.current.validateJoin).toBe('function');
      expect(typeof result.current.getJoinPreview).toBe('function');
    });
  });

  describe('joinWalls', () => {
    it('should join two walls at their endpoints', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.joinWalls('wall-1', 'wall-2', { x: 100, y: 0 });
      });

      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockUpdateElementInFloor).toHaveBeenCalledWith(
        'floor-1',
        'walls',
        'wall-1',
        expect.objectContaining({
          endX: 100,
          endY: 0,
        })
      );
    });

    it('should handle T-junction joining', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.joinWalls('wall-1', 'wall-3', { x: 50, y: 0 });
      });

      expect(mockExecuteCommand).toHaveBeenCalled();
      // Should split wall-1 at the intersection point
      expect(mockAddWall).toHaveBeenCalled();
    });

    it('should not join walls that are too far apart', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.joinWalls('wall-1', 'wall-3', { x: 200, y: 200 });
      });

      // Should not execute any commands for invalid join
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should handle joining walls with different thicknesses', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.joinWalls('wall-1', 'wall-3', { x: 50, y: 0 });
      });

      expect(mockExecuteCommand).toHaveBeenCalled();
      // Should handle thickness differences appropriately
    });

    it('should not join a wall to itself', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.joinWalls('wall-1', 'wall-1', { x: 50, y: 0 });
      });

      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });
  });

  describe('splitWall', () => {
    it('should split wall at specified point', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.splitWall('wall-1', { x: 50, y: 0 });
      });

      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockAddWall).toHaveBeenCalled(); // New wall segment
      expect(mockUpdateWall).toHaveBeenCalled(); // Updated original wall
    });

    it('should not split wall at endpoints', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.splitWall('wall-1', { x: 0, y: 0 }); // Start point
      });

      expect(mockExecuteCommand).not.toHaveBeenCalled();

      act(() => {
        result.current.splitWall('wall-1', { x: 100, y: 0 }); // End point
      });

      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should not split wall at point not on wall', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.splitWall('wall-1', { x: 50, y: 50 }); // Off the wall
      });

      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should preserve wall properties when splitting', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.splitWall('wall-1', { x: 50, y: 0 });
      });

      // Both wall segments should have same material and thickness
      expect(mockAddWall).toHaveBeenCalledWith(
        expect.objectContaining({
          material: 'drywall',
          thickness: 10,
        })
      );
    });

    it('should generate unique IDs for split walls', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.splitWall('wall-1', { x: 50, y: 0 });
      });

      const newWallCall = mockAddWall.mock.calls[0][0];
      expect(newWallCall.id).not.toBe('wall-1');
      expect(newWallCall.id).toMatch(/^wall-\d+$/);
    });
  });

  describe('mergeWalls', () => {
    it('should merge collinear walls', () => {
      // Create collinear walls
      const collinearWalls = [
        {
          id: 'wall-1',
          startX: 0,
          startY: 0,
          endX: 50,
          endY: 0,
          thickness: 10,
          material: 'drywall',
        },
        {
          id: 'wall-2',
          startX: 50,
          startY: 0,
          endX: 100,
          endY: 0,
          thickness: 10,
          material: 'drywall',
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: collinearWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
        removeWall: mockRemoveWall,
      } as any);

      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.mergeWalls(['wall-1', 'wall-2']);
      });

      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockRemoveWall).toHaveBeenCalledWith('wall-2');
      expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', expect.objectContaining({
        endX: 100,
        endY: 0,
      }));
    });

    it('should not merge non-collinear walls', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.mergeWalls(['wall-1', 'wall-2']); // Perpendicular walls
      });

      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should not merge walls with different properties', () => {
      const differentWalls = [
        {
          id: 'wall-1',
          startX: 0,
          startY: 0,
          endX: 50,
          endY: 0,
          thickness: 10,
          material: 'drywall',
        },
        {
          id: 'wall-2',
          startX: 50,
          startY: 0,
          endX: 100,
          endY: 0,
          thickness: 8, // Different thickness
          material: 'concrete', // Different material
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: differentWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
        removeWall: mockRemoveWall,
      } as any);

      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.mergeWalls(['wall-1', 'wall-2']);
      });

      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should handle merging multiple walls in sequence', () => {
      const sequentialWalls = [
        {
          id: 'wall-1',
          startX: 0,
          startY: 0,
          endX: 25,
          endY: 0,
          thickness: 10,
          material: 'drywall',
        },
        {
          id: 'wall-2',
          startX: 25,
          startY: 0,
          endX: 50,
          endY: 0,
          thickness: 10,
          material: 'drywall',
        },
        {
          id: 'wall-3',
          startX: 50,
          startY: 0,
          endX: 100,
          endY: 0,
          thickness: 10,
          material: 'drywall',
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: sequentialWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
        removeWall: mockRemoveWall,
      } as any);

      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.mergeWalls(['wall-1', 'wall-2', 'wall-3']);
      });

      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockRemoveWall).toHaveBeenCalledTimes(2); // Remove wall-2 and wall-3
      expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', expect.objectContaining({
        endX: 100,
        endY: 0,
      }));
    });
  });

  describe('autoJoinWalls', () => {
    it('should automatically join walls within tolerance', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.autoJoinWalls();
      });

      expect(mockExecuteCommand).toHaveBeenCalled();
    });

    it('should use custom tolerance when provided', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.autoJoinWalls(5); // Custom tolerance
      });

      expect(mockExecuteCommand).toHaveBeenCalled();
    });

    it('should handle walls that are already joined', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.autoJoinWalls();
      });

      // Should not create duplicate joins
      expect(mockExecuteCommand).toHaveBeenCalled();
    });

    it('should prioritize corner joins over T-junctions', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.autoJoinWalls();
      });

      expect(mockExecuteCommand).toHaveBeenCalled();
    });
  });

  describe('validateJoin', () => {
    it('should validate valid wall join', () => {
      const { result } = renderHook(() => useWallJoining2D());

      const isValid = result.current.validateJoin('wall-1', 'wall-2', { x: 100, y: 0 });

      expect(isValid).toBe(true);
    });

    it('should invalidate join with non-existent walls', () => {
      const { result } = renderHook(() => useWallJoining2D());

      const isValid = result.current.validateJoin('wall-1', 'non-existent', { x: 100, y: 0 });

      expect(isValid).toBe(false);
    });

    it('should invalidate join with same wall', () => {
      const { result } = renderHook(() => useWallJoining2D());

      const isValid = result.current.validateJoin('wall-1', 'wall-1', { x: 50, y: 0 });

      expect(isValid).toBe(false);
    });

    it('should invalidate join point too far from walls', () => {
      const { result } = renderHook(() => useWallJoining2D());

      const isValid = result.current.validateJoin('wall-1', 'wall-2', { x: 200, y: 200 });

      expect(isValid).toBe(false);
    });

    it('should validate join with custom tolerance', () => {
      const { result } = renderHook(() => useWallJoining2D());

      const isValid = result.current.validateJoin('wall-1', 'wall-2', { x: 105, y: 5 }, 10);

      expect(isValid).toBe(true);
    });
  });

  describe('getJoinPreview', () => {
    it('should return preview for valid join', () => {
      const { result } = renderHook(() => useWallJoining2D());

      const preview = result.current.getJoinPreview('wall-1', 'wall-2', { x: 100, y: 0 });

      expect(preview).toMatchObject({
        isValid: true,
        joinType: expect.any(String),
        affectedWalls: expect.any(Array),
        newWalls: expect.any(Array),
      });
    });

    it('should return invalid preview for invalid join', () => {
      const { result } = renderHook(() => useWallJoining2D());

      const preview = result.current.getJoinPreview('wall-1', 'non-existent', { x: 100, y: 0 });

      expect(preview).toMatchObject({
        isValid: false,
        reason: expect.any(String),
      });
    });

    it('should show T-junction preview', () => {
      const { result } = renderHook(() => useWallJoining2D());

      const preview = result.current.getJoinPreview('wall-1', 'wall-3', { x: 50, y: 0 });

      expect(preview).toMatchObject({
        isValid: true,
        joinType: 'T-junction',
        affectedWalls: expect.arrayContaining(['wall-1']),
      });
    });

    it('should show corner join preview', () => {
      const { result } = renderHook(() => useWallJoining2D());

      const preview = result.current.getJoinPreview('wall-1', 'wall-2', { x: 100, y: 0 });

      expect(preview).toMatchObject({
        isValid: true,
        joinType: 'corner',
        affectedWalls: expect.arrayContaining(['wall-1', 'wall-2']),
      });
    });

    it('should calculate join distance', () => {
      const { result } = renderHook(() => useWallJoining2D());

      const preview = result.current.getJoinPreview('wall-1', 'wall-2', { x: 100, y: 0 });

      expect(preview.distance).toBeDefined();
      expect(typeof preview.distance).toBe('number');
    });
  });

  describe('Store Integration', () => {
    it('should react to changes in walls from store', () => {
      const { result, rerender } = renderHook(() => useWallJoining2D());

      // Add a new wall
      const newWalls = [
        ...mockWalls,
        {
          id: 'wall-4',
          startX: 100,
          startY: 100,
          endX: 200,
          endY: 100,
          thickness: 10,
          material: 'drywall',
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: newWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
        removeWall: mockRemoveWall,
      } as any);

      rerender();

      act(() => {
        result.current.autoJoinWalls();
      });

      // Should consider the new wall in joining operations
      expect(mockExecuteCommand).toHaveBeenCalled();
    });

    it('should handle floor store integration', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.joinWalls('wall-1', 'wall-2', { x: 100, y: 0 });
      });

      expect(mockUpdateElementInFloor).toHaveBeenCalledWith(
        'floor-1',
        'walls',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty walls array', () => {
      mockUseDesignStore.mockReturnValue({
        walls: [],
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
        removeWall: mockRemoveWall,
      } as any);

      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.autoJoinWalls();
      });

      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should handle single wall', () => {
      mockUseDesignStore.mockReturnValue({
        walls: [mockWalls[0]],
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
        removeWall: mockRemoveWall,
      } as any);

      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.autoJoinWalls();
      });

      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should handle walls with zero length', () => {
      const zeroLengthWalls = [
        {
          id: 'wall-1',
          startX: 50,
          startY: 50,
          endX: 50,
          endY: 50,
          thickness: 10,
          material: 'drywall',
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: zeroLengthWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
        removeWall: mockRemoveWall,
      } as any);

      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.autoJoinWalls();
      });

      // Should handle gracefully without errors
      expect(result.current).toBeDefined();
    });

    it('should handle very close parallel walls', () => {
      const parallelWalls = [
        {
          id: 'wall-1',
          startX: 0,
          startY: 0,
          endX: 100,
          endY: 0,
          thickness: 10,
          material: 'drywall',
        },
        {
          id: 'wall-2',
          startX: 0,
          startY: 1, // Very close but parallel
          endX: 100,
          endY: 1,
          thickness: 10,
          material: 'drywall',
        },
      ];

      mockUseDesignStore.mockReturnValue({
        walls: parallelWalls,
        updateWall: mockUpdateWall,
        addWall: mockAddWall,
        removeWall: mockRemoveWall,
      } as any);

      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.autoJoinWalls();
      });

      // Should not join parallel walls
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should handle negative coordinates', () => {
      const { result } = renderHook(() => useWallJoining2D());

      act(() => {
        result.current.splitWall('wall-1', { x: -50, y: 0 });
      });

      // Should not split at point outside wall bounds
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should handle very large coordinates', () => {
      const { result } = renderHook(() => useWallJoining2D());

      const isValid = result.current.validateJoin('wall-1', 'wall-2', { x: 999999, y: 999999 });

      expect(isValid).toBe(false);
    });
  });
});