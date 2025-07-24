
import { renderHook, act } from '@testing-library/react';
import { useOpeningIntegration2D } from '@/hooks/useOpeningIntegration2D';
import { OpeningIntegrator2D } from '@/utils/openingIntegration2D';

// Mock the OpeningIntegrator2D class
jest.mock('@/utils/openingIntegration2D', () => ({
  OpeningIntegrator2D: {
    validateOpeningPlacement: jest.fn(),
    calculateOpeningGeometry: jest.fn(),
    snapOpeningToWall: jest.fn(),
    getConstraintIndicators: jest.fn(),
  },
}));

describe('useOpeningIntegration2D', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations for each test
    OpeningIntegrator2D.validateOpeningPlacement.mockReturnValue({ isValid: true, errors: [], warnings: [] });
    OpeningIntegrator2D.calculateOpeningGeometry.mockReturnValue({});
    OpeningIntegrator2D.snapOpeningToWall.mockImplementation(opening => opening);
    OpeningIntegrator2D.getConstraintIndicators.mockReturnValue([]);
  });

  it('should be defined', () => {
    expect(useOpeningIntegration2D).toBeDefined();
  });

  it('should initialize with default config', () => {
    const { result } = renderHook(() => useOpeningIntegration2D());
    expect(result.current.config.minWallLength).toBe(0.8);
  });

  it('should update config', () => {
    const { result } = renderHook(() => useOpeningIntegration2D());
    act(() => {
      result.current.updateConfig({ minWallLength: 1.0 });
    });
    expect(result.current.config.minWallLength).toBe(1.0);
  });

  it('should call validateOpeningPlacement', () => {
    const { result } = renderHook(() => useOpeningIntegration2D());
    const mockOpening = { id: 'op1' } as any;
    const mockWall = { id: 'wall1' } as any;
    act(() => {
      result.current.validatePlacement(mockOpening, mockWall);
    });
    expect(OpeningIntegrator2D.validateOpeningPlacement).toHaveBeenCalledWith(mockOpening, mockWall, expect.any(Object));
  });

  it('should call calculateOpeningGeometry', () => {
    const { result } = renderHook(() => useOpeningIntegration2D());
    const mockOpening = { id: 'op1' } as any;
    const mockWall = { id: 'wall1' } as any;
    act(() => {
      result.current.calculateGeometry(mockOpening, mockWall);
    });
    expect(OpeningIntegrator2D.calculateOpeningGeometry).toHaveBeenCalledWith(mockOpening, mockWall);
  });

  it('should call snapOpeningToWall', () => {
    const { result } = renderHook(() => useOpeningIntegration2D());
    const mockOpening = { id: 'op1' } as any;
    const mockWall = { id: 'wall1' } as any;
    act(() => {
      result.current.snapToWall(mockOpening, mockWall);
    });
    expect(OpeningIntegrator2D.snapOpeningToWall).toHaveBeenCalledWith(mockOpening, mockWall, expect.any(Object));
  });

  it('should call getConstraintIndicators', () => {
    const { result } = renderHook(() => useOpeningIntegration2D());
    const mockWall = { id: 'wall1' } as any;
    act(() => {
      result.current.getConstraints(mockWall);
    });
    expect(OpeningIntegrator2D.getConstraintIndicators).toHaveBeenCalledWith(mockWall, expect.any(Object));
  });
});
