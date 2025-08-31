import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

// Mock performance.now()
const mockPerformanceNow = jest.fn();
Object.defineProperty(window, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
});

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    expect(result.current.fps).toBe(60);
    expect(result.current.frameTime).toBe(16.67);
    expect(result.current.isOptimizing).toBe(false);
  });

  it('calculates FPS correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // Mock time progression for 60 FPS (16.67ms per frame)
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(16.67)
      .mockReturnValueOnce(33.34)
      .mockReturnValueOnce(50.01);

    act(() => {
      result.current.recordFrame();
    });

    act(() => {
      result.current.recordFrame();
    });

    act(() => {
      result.current.recordFrame();
    });

    // Should calculate approximately 60 FPS
    expect(result.current.fps).toBeCloseTo(60, 0);
  });

  it('detects low performance and triggers optimization', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // Mock time progression for 20 FPS (50ms per frame)
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(50)
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(150);

    act(() => {
      result.current.recordFrame();
    });

    act(() => {
      result.current.recordFrame();
    });

    act(() => {
      result.current.recordFrame();
    });

    expect(result.current.fps).toBeLessThan(30);
    expect(result.current.isOptimizing).toBe(true);
  });

  it('provides performance suggestions based on FPS', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // Test low FPS suggestions
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(100); // 10 FPS

    act(() => {
      result.current.recordFrame();
    });

    const suggestions = result.current.getPerformanceSuggestions();
    expect(suggestions).toContain('Reduce texture quality');
    expect(suggestions).toContain('Disable post-processing effects');
  });

  it('resets optimization state when performance improves', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    // First, trigger optimization with low FPS
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(100); // 10 FPS

    act(() => {
      result.current.recordFrame();
    });

    expect(result.current.isOptimizing).toBe(true);

    // Then improve performance
    mockPerformanceNow
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(116.67); // 60 FPS

    act(() => {
      result.current.recordFrame();
    });

    expect(result.current.isOptimizing).toBe(false);
  });

  it('tracks frame time correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor());
    
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(33.34); // 30 FPS = 33.34ms frame time

    act(() => {
      result.current.recordFrame();
    });

    expect(result.current.frameTime).toBeCloseTo(33.34, 1);
  });
});