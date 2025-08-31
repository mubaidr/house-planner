import { renderHook } from '@testing-library/react';
import { useMaterial3D } from '@/hooks/3d/useMaterial3D';
import { useDesignStore } from '@/stores/designStore';

jest.mock('@/stores/designStore');
const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;

describe('useMaterial3D', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns default material when no materialId provided', () => {
    mockUseDesignStore.mockReturnValue([]);
    
    const { result } = renderHook(() => useMaterial3D());
    
    expect(result.current).toEqual({
      color: '#cccccc',
      roughness: 0.8,
      metalness: 0.2,
    });
  });

  it('returns default material when materialId not found', () => {
    mockUseDesignStore.mockReturnValue([
      { id: 'material-1', name: 'Brick', color: '#8B4513' }
    ]);
    
    const { result } = renderHook(() => useMaterial3D('non-existent'));
    
    expect(result.current).toEqual({
      color: '#cccccc',
      roughness: 0.8,
      metalness: 0.2,
    });
  });

  it('returns material properties when materialId found', () => {
    const testMaterial = {
      id: 'material-1',
      name: 'Brick',
      color: '#8B4513',
      roughness: 0.9,
      metalness: 0.1,
      normalMap: 'brick-normal.jpg',
    };
    
    mockUseDesignStore.mockReturnValue([testMaterial]);
    
    const { result } = renderHook(() => useMaterial3D('material-1'));
    
    expect(result.current).toEqual({
      color: '#8B4513',
      roughness: 0.9,
      metalness: 0.1,
      normalMap: 'brick-normal.jpg',
    });
  });

  it('handles material with minimal properties', () => {
    const testMaterial = {
      id: 'material-2',
      name: 'Simple',
      color: '#FF0000',
    };
    
    mockUseDesignStore.mockReturnValue([testMaterial]);
    
    const { result } = renderHook(() => useMaterial3D('material-2'));
    
    expect(result.current).toEqual({
      color: '#FF0000',
      roughness: 0.8, // default fallback
      metalness: 0.2, // default fallback
    });
  });

  it('updates when materials change', () => {
    const initialMaterials = [
      { id: 'material-1', name: 'Red', color: '#FF0000' }
    ];
    
    const updatedMaterials = [
      { id: 'material-1', name: 'Blue', color: '#0000FF' }
    ];
    
    mockUseDesignStore.mockReturnValueOnce(initialMaterials);
    
    const { result, rerender } = renderHook(() => useMaterial3D('material-1'));
    
    expect(result.current.color).toBe('#FF0000');
    
    mockUseDesignStore.mockReturnValueOnce(updatedMaterials);
    rerender();
    
    expect(result.current.color).toBe('#0000FF');
  });
});