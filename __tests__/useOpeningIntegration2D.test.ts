import { renderHook, act } from '@testing-library/react';
import { useOpeningIntegration2D } from '@/hooks/useOpeningIntegration2D';
import { OpeningIntegrator2D } from '@/utils/openingIntegration2D';
import { Door2D, Window2D, Wall2D } from '@/types/elements2D';

// Mock the OpeningIntegrator2D utility
jest.mock('@/utils/openingIntegration2D');

const mockOpeningIntegrator2D = OpeningIntegrator2D as jest.MockedClass<typeof OpeningIntegrator2D>;

describe('useOpeningIntegration2D', () => {
  // Test data
  const mockWall: Wall2D = {
    id: 'wall-1',
    type: 'wall2d',
    start: { x: 0, y: 0 },
    end: { x: 5, y: 0 },
    thickness: 0.2,
    height: 2.5,
    material: 'brick',
    properties: {}
  };

  const mockDoor: Door2D = {
    id: 'door-1',
    type: 'door2d',
    position: { x: 2.5, y: 0 },
    dimensions: { width: 0.8, height: 2.1, depth: 0.05 },
    wallId: 'wall-1',
    openDirection: 'inward',
    hingePosition: 'left',
    material: 'wood',
    properties: {}
  };

  const mockWindow: Window2D = {
    id: 'window-1',
    type: 'window2d',
    position: { x: 1.5, y: 0 },
    dimensions: { width: 1.2, height: 1.5, depth: 0.05 },
    wallId: 'wall-1',
    sillHeight: 0.9,
    material: 'glass',
    properties: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockOpeningIntegrator2D.validateOpeningPlacement = jest.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    });

    mockOpeningIntegrator2D.calculateOpeningGeometry = jest.fn().mockReturnValue({
      position: { x: 2.5, y: 0 },
      dimensions: { width: 0.8, height: 2.1, depth: 0.05 },
      wallPosition: 0.5,
      depth: 0.05,
      angle: 0,
      isValid: true
    });

    mockOpeningIntegrator2D.snapOpeningToWall = jest.fn().mockImplementation((opening) => opening);

    mockOpeningIntegrator2D.getConstraintIndicators = jest.fn().mockReturnValue([
      { type: 'min-distance', position: { x: 0.1, y: 0 }, size: 0.05 },
      { type: 'min-distance', position: { x: 4.9, y: 0 }, size: 0.05 }
    ]);
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const { result } = renderHook(() => useOpeningIntegration2D());

      expect(result.current.config).toEqual({
        minWallLength: 0.8,
        minDistanceFromCorner: 0.1,
        maxOpeningRatio: 0.8,
        snapTolerance: 0.05,
        autoAlign: true,
        showConstraints: true
      });
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        minWallLength: 1.0,
        maxOpeningRatio: 0.6,
        autoAlign: false
      };

      const { result } = renderHook(() => 
        useOpeningIntegration2D({ config: customConfig })
      );

      expect(result.current.config).toEqual({
        minWallLength: 1.0,
        minDistanceFromCorner: 0.1,
        maxOpeningRatio: 0.6,
        snapTolerance: 0.05,
        autoAlign: false,
        showConstraints: true
      });
    });

    it('should initialize with enabled=false', () => {
      const { result } = renderHook(() => 
        useOpeningIntegration2D({ enabled: false })
      );

      const validationResult = result.current.validatePlacement(mockDoor, mockWall);
      
      expect(validationResult).toEqual({
        isValid: true,
        errors: [],
        warnings: []
      });
      expect(mockOpeningIntegrator2D.validateOpeningPlacement).not.toHaveBeenCalled();
    });
  });

  describe('validatePlacement', () => {
    it('should validate door placement successfully', () => {
      const { result } = renderHook(() => useOpeningIntegration2D());

      const validationResult = result.current.validatePlacement(mockDoor, mockWall);

      expect(mockOpeningIntegrator2D.validateOpeningPlacement).toHaveBeenCalledWith(
        mockDoor,
        mockWall,
        expect.objectContaining({
          minWallLength: 0.8,
          minDistanceFromCorner: 0.1,
          maxOpeningRatio: 0.8,
          snapTolerance: 0.05,
          autoAlign: true,
          showConstraints: true
        })
      );
      expect(validationResult.isValid).toBe(true);
    });

    it('should validate window placement successfully', () => {
      const { result } = renderHook(() => useOpeningIntegration2D());

      const validationResult = result.current.validatePlacement(mockWindow, mockWall);

      expect(mockOpeningIntegrator2D.validateOpeningPlacement).toHaveBeenCalledWith(
        mockWindow,
        mockWall,
        expect.any(Object)
      );
      expect(validationResult.isValid).toBe(true);
    });

    it('should return validation errors when placement is invalid', () => {
      mockOpeningIntegrator2D.validateOpeningPlacement = jest.fn().mockReturnValue({
        isValid: false,
        errors: ['Opening too wide for wall'],
        warnings: ['Opening close to wall corner']
      });

      const { result } = renderHook(() => useOpeningIntegration2D());

      const validationResult = result.current.validatePlacement(mockDoor, mockWall);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors).toContain('Opening too wide for wall');
      expect(validationResult.warnings).toContain('Opening close to wall corner');
    });

    it('should skip validation when disabled', () => {
      const { result } = renderHook(() => 
        useOpeningIntegration2D({ enabled: false })
      );

      const validationResult = result.current.validatePlacement(mockDoor, mockWall);

      expect(mockOpeningIntegrator2D.validateOpeningPlacement).not.toHaveBeenCalled();
      expect(validationResult).toEqual({
        isValid: true,
        errors: [],
        warnings: []
      });
    });
  });

  describe('calculateGeometry', () => {
    it('should calculate opening geometry correctly', () => {
      const { result } = renderHook(() => useOpeningIntegration2D());

      const geometry = result.current.calculateGeometry(mockDoor, mockWall);

      expect(mockOpeningIntegrator2D.calculateOpeningGeometry).toHaveBeenCalledWith(
        mockDoor,
        mockWall
      );
      expect(geometry).toEqual({
        position: { x: 2.5, y: 0 },
        dimensions: { width: 0.8, height: 2.1, depth: 0.05 },
        wallPosition: 0.5,
        depth: 0.05,
        angle: 0,
        isValid: true
      });
    });

    it('should handle geometry calculation for windows', () => {
      const windowGeometry = {
        position: { x: 1.5, y: 0 },
        dimensions: { width: 1.2, height: 1.5, depth: 0.05 },
        wallPosition: 0.3,
        depth: 0.05,
        angle: 0,
        isValid: true
      };

      mockOpeningIntegrator2D.calculateOpeningGeometry = jest.fn().mockReturnValue(windowGeometry);

      const { result } = renderHook(() => useOpeningIntegration2D());

      const geometry = result.current.calculateGeometry(mockWindow, mockWall);

      expect(geometry).toEqual(windowGeometry);
    });
  });

  describe('snapToWall', () => {
    it('should snap opening to wall when autoAlign is enabled', () => {
      const snappedDoor = { ...mockDoor, position: { x: 2.6, y: 0 } };
      mockOpeningIntegrator2D.snapOpeningToWall = jest.fn().mockReturnValue(snappedDoor);

      const { result } = renderHook(() => useOpeningIntegration2D());

      const result_opening = result.current.snapToWall(mockDoor, mockWall);

      expect(mockOpeningIntegrator2D.snapOpeningToWall).toHaveBeenCalledWith(
        mockDoor,
        mockWall,
        expect.objectContaining({ autoAlign: true })
      );
      expect(result_opening).toEqual(snappedDoor);
    });

    it('should not snap when autoAlign is disabled', () => {
      const { result } = renderHook(() => 
        useOpeningIntegration2D({ config: { autoAlign: false } })
      );

      const result_opening = result.current.snapToWall(mockDoor, mockWall);

      expect(mockOpeningIntegrator2D.snapOpeningToWall).not.toHaveBeenCalled();
      expect(result_opening).toEqual(mockDoor);
    });

    it('should not snap when disabled', () => {
      const { result } = renderHook(() => 
        useOpeningIntegration2D({ enabled: false })
      );

      const result_opening = result.current.snapToWall(mockDoor, mockWall);

      expect(mockOpeningIntegrator2D.snapOpeningToWall).not.toHaveBeenCalled();
      expect(result_opening).toEqual(mockDoor);
    });
  });

  describe('getConstraints', () => {
    it('should get constraint indicators when showConstraints is enabled', () => {
      const { result } = renderHook(() => useOpeningIntegration2D());

      const constraints = result.current.getConstraints(mockWall);

      expect(mockOpeningIntegrator2D.getConstraintIndicators).toHaveBeenCalledWith(
        mockWall,
        expect.objectContaining({ showConstraints: true })
      );
      expect(constraints).toEqual([
        { type: 'min-distance', position: { x: 0.1, y: 0 }, size: 0.05 },
        { type: 'min-distance', position: { x: 4.9, y: 0 }, size: 0.05 }
      ]);
    });

    it('should return empty array when showConstraints is disabled', () => {
      const { result } = renderHook(() => 
        useOpeningIntegration2D({ config: { showConstraints: false } })
      );

      const constraints = result.current.getConstraints(mockWall);

      expect(mockOpeningIntegrator2D.getConstraintIndicators).not.toHaveBeenCalled();
      expect(constraints).toEqual([]);
    });

    it('should return empty array when disabled', () => {
      const { result } = renderHook(() => 
        useOpeningIntegration2D({ enabled: false })
      );

      const constraints = result.current.getConstraints(mockWall);

      expect(mockOpeningIntegrator2D.getConstraintIndicators).not.toHaveBeenCalled();
      expect(constraints).toEqual([]);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration correctly', () => {
      const { result } = renderHook(() => useOpeningIntegration2D());

      act(() => {
        result.current.updateConfig({
          minWallLength: 1.2,
          maxOpeningRatio: 0.7
        });
      });

      expect(result.current.config).toEqual({
        minWallLength: 1.2,
        minDistanceFromCorner: 0.1,
        maxOpeningRatio: 0.7,
        snapTolerance: 0.05,
        autoAlign: true,
        showConstraints: true
      });
    });

    it('should preserve existing config when updating partially', () => {
      const { result } = renderHook(() => 
        useOpeningIntegration2D({ 
          config: { minWallLength: 1.5, autoAlign: false } 
        })
      );

      act(() => {
        result.current.updateConfig({ snapTolerance: 0.1 });
      });

      expect(result.current.config).toEqual({
        minWallLength: 1.5,
        minDistanceFromCorner: 0.1,
        maxOpeningRatio: 0.8,
        snapTolerance: 0.1,
        autoAlign: false,
        showConstraints: true
      });
    });
  });

  describe('Memoization', () => {
    it('should memoize functions correctly', () => {
      const { result, rerender } = renderHook(() => useOpeningIntegration2D());

      const initialFunctions = {
        validatePlacement: result.current.validatePlacement,
        calculateGeometry: result.current.calculateGeometry,
        snapToWall: result.current.snapToWall,
        getConstraints: result.current.getConstraints,
        updateConfig: result.current.updateConfig
      };

      rerender();

      expect(result.current.validatePlacement).toBe(initialFunctions.validatePlacement);
      expect(result.current.calculateGeometry).toBe(initialFunctions.calculateGeometry);
      expect(result.current.snapToWall).toBe(initialFunctions.snapToWall);
      expect(result.current.getConstraints).toBe(initialFunctions.getConstraints);
      expect(result.current.updateConfig).toBe(initialFunctions.updateConfig);
    });

    it('should update memoized functions when config changes', () => {
      const { result } = renderHook(() => useOpeningIntegration2D());

      const initialValidateFunction = result.current.validatePlacement;

      act(() => {
        result.current.updateConfig({ minWallLength: 2.0 });
      });

      // Functions should be recreated when config changes
      expect(result.current.validatePlacement).not.toBe(initialValidateFunction);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small walls', () => {
      const smallWall: Wall2D = {
        ...mockWall,
        end: { x: 0.1, y: 0 }
      };

      mockOpeningIntegrator2D.validateOpeningPlacement = jest.fn().mockReturnValue({
        isValid: false,
        errors: ['Wall too short for opening'],
        warnings: []
      });

      const { result } = renderHook(() => useOpeningIntegration2D());

      const validationResult = result.current.validatePlacement(mockDoor, smallWall);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors).toContain('Wall too short for opening');
    });

    it('should handle very large openings', () => {
      const largeDoor: Door2D = {
        ...mockDoor,
        dimensions: { width: 4.5, height: 2.1, depth: 0.05 }
      };

      mockOpeningIntegrator2D.validateOpeningPlacement = jest.fn().mockReturnValue({
        isValid: false,
        errors: ['Opening too wide for wall'],
        warnings: []
      });

      const { result } = renderHook(() => useOpeningIntegration2D());

      const validationResult = result.current.validatePlacement(largeDoor, mockWall);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors).toContain('Opening too wide for wall');
    });

    it('should handle zero-length walls gracefully', () => {
      const zeroWall: Wall2D = {
        ...mockWall,
        end: { x: 0, y: 0 }
      };

      const { result } = renderHook(() => useOpeningIntegration2D());

      expect(() => {
        result.current.calculateGeometry(mockDoor, zeroWall);
      }).not.toThrow();
    });

    it('should handle negative coordinates', () => {
      const negativeWall: Wall2D = {
        ...mockWall,
        start: { x: -5, y: -3 },
        end: { x: 0, y: -3 }
      };

      const { result } = renderHook(() => useOpeningIntegration2D());

      expect(() => {
        result.current.validatePlacement(mockDoor, negativeWall);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle multiple rapid config updates', () => {
      const { result } = renderHook(() => useOpeningIntegration2D());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.updateConfig({ snapTolerance: 0.01 + i * 0.001 });
        }
      });

      expect(result.current.config.snapTolerance).toBeCloseTo(0.109, 3);
    });

    it('should handle rapid validation calls', () => {
      const { result } = renderHook(() => useOpeningIntegration2D());

      for (let i = 0; i < 50; i++) {
        result.current.validatePlacement(mockDoor, mockWall);
      }

      expect(mockOpeningIntegrator2D.validateOpeningPlacement).toHaveBeenCalledTimes(50);
    });
  });
});