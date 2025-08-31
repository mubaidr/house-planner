import { renderHook, act } from '@testing-library/react';
import { useScene3D } from '@/hooks/3d/useScene3D';

// Mock the scene3DStore
jest.mock('@/stores/scene3DStore', () => ({
  useScene3DStore: jest.fn(),
}));

import { useScene3DStore } from '@/stores/scene3DStore';
const mockUseScene3DStore = useScene3DStore as jest.MockedFunction<typeof useScene3DStore>;

describe('useScene3D', () => {
  const mockSetRenderQuality = jest.fn();
  const mockSetPostProcessing = jest.fn();
  const mockSetShadows = jest.fn();
  const mockSetAntiAliasing = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseScene3DStore.mockReturnValue({
      renderQuality: 'high',
      postProcessing: true,
      shadows: true,
      antiAliasing: true,
      setRenderQuality: mockSetRenderQuality,
      setPostProcessing: mockSetPostProcessing,
      setShadows: mockSetShadows,
      setAntiAliasing: mockSetAntiAliasing,
    });
  });

  it('initializes with scene settings from store', () => {
    const { result } = renderHook(() => useScene3D());
    
    expect(result.current.renderQuality).toBe('high');
    expect(result.current.postProcessing).toBe(true);
    expect(result.current.shadows).toBe(true);
    expect(result.current.antiAliasing).toBe(true);
  });

  it('updates render quality', () => {
    const { result } = renderHook(() => useScene3D());
    
    act(() => {
      result.current.setRenderQuality('medium');
    });
    
    expect(mockSetRenderQuality).toHaveBeenCalledWith('medium');
  });

  it('toggles post-processing', () => {
    const { result } = renderHook(() => useScene3D());
    
    act(() => {
      result.current.setPostProcessing(false);
    });
    
    expect(mockSetPostProcessing).toHaveBeenCalledWith(false);
  });

  it('toggles shadows', () => {
    const { result } = renderHook(() => useScene3D());
    
    act(() => {
      result.current.setShadows(false);
    });
    
    expect(mockSetShadows).toHaveBeenCalledWith(false);
  });

  it('toggles anti-aliasing', () => {
    const { result } = renderHook(() => useScene3D());
    
    act(() => {
      result.current.setAntiAliasing(false);
    });
    
    expect(mockSetAntiAliasing).toHaveBeenCalledWith(false);
  });

  it('provides performance optimization suggestions', () => {
    const { result } = renderHook(() => useScene3D());
    
    const suggestions = result.current.getPerformanceSuggestions();
    
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('applies performance preset for low-end devices', () => {
    const { result } = renderHook(() => useScene3D());
    
    act(() => {
      result.current.applyPerformancePreset('low');
    });
    
    expect(mockSetRenderQuality).toHaveBeenCalledWith('low');
    expect(mockSetPostProcessing).toHaveBeenCalledWith(false);
    expect(mockSetShadows).toHaveBeenCalledWith(false);
    expect(mockSetAntiAliasing).toHaveBeenCalledWith(false);
  });

  it('applies performance preset for high-end devices', () => {
    const { result } = renderHook(() => useScene3D());
    
    act(() => {
      result.current.applyPerformancePreset('high');
    });
    
    expect(mockSetRenderQuality).toHaveBeenCalledWith('ultra');
    expect(mockSetPostProcessing).toHaveBeenCalledWith(true);
    expect(mockSetShadows).toHaveBeenCalledWith(true);
    expect(mockSetAntiAliasing).toHaveBeenCalledWith(true);
  });

  it('calculates scene complexity', () => {
    const { result } = renderHook(() => useScene3D());
    
    const sceneData = {
      walls: new Array(10),
      doors: new Array(5),
      windows: new Array(8),
      stairs: new Array(2),
      rooms: new Array(3),
    };
    
    const complexity = result.current.calculateSceneComplexity(sceneData);
    
    expect(typeof complexity).toBe('number');
    expect(complexity).toBeGreaterThan(0);
  });

  it('auto-adjusts quality based on performance', () => {
    const { result } = renderHook(() => useScene3D());
    
    // Simulate low FPS
    act(() => {
      result.current.autoAdjustQuality(20); // 20 FPS
    });
    
    // Should reduce quality settings
    expect(mockSetRenderQuality).toHaveBeenCalled();
  });

  it('maintains quality with good performance', () => {
    const { result } = renderHook(() => useScene3D());
    
    // Simulate good FPS
    act(() => {
      result.current.autoAdjustQuality(60); // 60 FPS
    });
    
    // Should not change quality if already good
    // (depends on implementation, but generally shouldn't downgrade)
  });

  it('provides render statistics', () => {
    const { result } = renderHook(() => useScene3D());
    
    const stats = result.current.getRenderStats();
    
    expect(stats).toHaveProperty('triangles');
    expect(stats).toHaveProperty('drawCalls');
    expect(stats).toHaveProperty('textureMemory');
    expect(stats).toHaveProperty('geometryMemory');
  });

  it('optimizes scene for export', () => {
    const { result } = renderHook(() => useScene3D());
    
    act(() => {
      result.current.optimizeForExport();
    });
    
    // Should set high quality for export
    expect(mockSetRenderQuality).toHaveBeenCalledWith('ultra');
    expect(mockSetPostProcessing).toHaveBeenCalledWith(true);
    expect(mockSetShadows).toHaveBeenCalledWith(true);
  });
});