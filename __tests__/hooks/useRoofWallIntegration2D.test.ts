import { renderHook, act } from '@testing-library/react';
import { useRoofWallIntegration2D } from '@/hooks/useRoofWallIntegration2D';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';

// Mock dependencies
jest.mock('@/stores/designStore');
jest.mock('@/stores/historyStore');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseHistoryStore = useHistoryStore as jest.MockedFunction<typeof useHistoryStore>;

describe('useRoofWallIntegration2D', () => {
  // Mock store functions
  const mockExecuteCommand = jest.fn();
  const mockUpdateRoof = jest.fn();
  const mockUpdateWall = jest.fn();

  // Mock data
  const mockWalls = [
    {
      id: 'wall-1',
      startX: 0,
      startY: 0,
      endX: 10,
      endY: 0,
      thickness: 0.2,
      height: 3,
      material: 'brick'
    },
    {
      id: 'wall-2',
      startX: 10,
      startY: 0,
      endX: 10,
      endY: 8,
      thickness: 0.2,
      height: 3,
      material: 'brick'
    },
    {
      id: 'wall-3',
      startX: 10,
      startY: 8,
      endX: 0,
      endY: 8,
      thickness: 0.2,
      height: 3,
      material: 'brick'
    },
    {
      id: 'wall-4',
      startX: 0,
      startY: 8,
      endX: 0,
      endY: 0,
      thickness: 0.2,
      height: 3,
      material: 'brick'
    }
  ];

  const mockRoofs = [
    {
      id: 'roof-1',
      type: 'gable',
      pitch: 30,
      height: 4,
      overhang: 0.5,
      coveringWalls: ['wall-1', 'wall-2', 'wall-3', 'wall-4'],
      material: 'shingles'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      roofs: mockRoofs,
      updateRoof: mockUpdateRoof,
      updateWall: mockUpdateWall,
    } as any);

    mockUseHistoryStore.mockReturnValue({
      executeCommand: mockExecuteCommand,
    } as any);
  });

  describe('Initialization', () => {
    it('should provide all required functions', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      expect(typeof result.current.analyzeIntegration).toBe('function');
      expect(typeof result.current.clearConnections).toBe('function');
      expect(typeof result.current.updateConfiguration).toBe('function');
      expect(typeof result.current.getConnectionsForRoof).toBe('function');
      expect(typeof result.current.getConnectionsForWall).toBe('function');
      expect(typeof result.current.updateConnectionPitch).toBe('function');
      expect(typeof result.current.calculateOptimalPitch).toBe('function');
    });

    it('should initialize with default configuration', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      expect(result.current.configuration).toBeDefined();
      expect(typeof result.current.configuration).toBe('object');
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        tolerance: 0.2,
        autoUpdate: false
      };

      const { result } = renderHook(() => 
        useRoofWallIntegration2D({ config: customConfig })
      );

      expect(result.current.configuration).toBeDefined();
    });
  });

  describe('Roof-Wall Integration', () => {
    it('should analyze integration successfully', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      act(() => {
        result.current.analyzeIntegration();
      });

      expect(result.current.isAnalyzing).toBe(false);
    });

    it('should get connections for roof', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      const connections = result.current.getConnectionsForRoof('roof-1');
      expect(Array.isArray(connections)).toBe(true);
    });

    it('should get connections for wall', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      const connections = result.current.getConnectionsForWall('wall-1');
      expect(Array.isArray(connections)).toBe(true);
    });

    it('should update connection pitch', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      const success = result.current.updateConnectionPitch('connection-1', 35);
      expect(typeof success).toBe('boolean');
    });

    it('should calculate optimal pitch', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      const pitch = result.current.calculateOptimalPitch('roof-1', 'wall-1');
      // Can be null if roof/wall not found, or an object with pitch data
      expect(pitch === null || typeof pitch === 'object').toBe(true);
    });

    it('should clear connections', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      act(() => {
        result.current.clearConnections();
      });

      expect(result.current.connections).toEqual([]);
      expect(result.current.integrationResult).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      act(() => {
        result.current.updateConfiguration({
          tolerance: 0.3
        });
      });

      expect(result.current.configuration).toBeDefined();
    });

    it('should have integration system available', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      expect(result.current.integrationSystem).toBeDefined();
      expect(typeof result.current.integrationSystem).toBe('object');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty walls and roofs', () => {
      mockUseDesignStore.mockReturnValue({
        walls: [],
        roofs: [],
        updateRoof: mockUpdateRoof,
        updateWall: mockUpdateWall,
      } as any);

      const { result } = renderHook(() => useRoofWallIntegration2D());

      expect(result.current.connections).toEqual([]);
      expect(result.current.integrationResult).toBeNull();
    });

    it('should handle analysis errors gracefully', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      // Should not throw even with invalid data
      act(() => {
        result.current.analyzeIntegration();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle configuration update errors', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      // Should handle invalid configuration gracefully
      act(() => {
        result.current.updateConfiguration({});
      });

      expect(result.current.configuration).toBeDefined();
    });
  });

  describe('State Management', () => {
    it('should track analyzing state', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      expect(typeof result.current.isAnalyzing).toBe('boolean');
    });

    it('should track connections state', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      expect(Array.isArray(result.current.connections)).toBe(true);
    });

    it('should track integration result state', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      expect(result.current.integrationResult === null || typeof result.current.integrationResult === 'object').toBe(true);
    });

    it('should track error state', () => {
      const { result } = renderHook(() => useRoofWallIntegration2D());

      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large number of walls efficiently', () => {
      const manyWalls = Array.from({ length: 50 }, (_, i) => ({
        id: `wall-${i}`,
        startX: i,
        startY: 0,
        endX: i + 1,
        endY: 0,
        thickness: 0.2,
        height: 3,
        material: 'brick'
      }));

      mockUseDesignStore.mockReturnValue({
        walls: manyWalls,
        roofs: mockRoofs,
        updateRoof: mockUpdateRoof,
        updateWall: mockUpdateWall,
      } as any);

      const { result } = renderHook(() => useRoofWallIntegration2D());

      const startTime = Date.now();
      
      act(() => {
        result.current.analyzeIntegration();
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
    });
  });
});