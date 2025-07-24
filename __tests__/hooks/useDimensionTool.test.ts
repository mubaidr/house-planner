
import { renderHook, act } from '@testing-library/react';
import { useDimensionTool } from '@/hooks/useDimensionTool';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import * as snapping from '@/utils/snapping';
import * as annotations from '@/components/Canvas/DimensionAnnotations';

jest.mock('@/stores/designStore');
jest.mock('@/stores/uiStore');
jest.mock('@/utils/snapping');
jest.mock('@/components/Canvas/DimensionAnnotations');


describe('useDimensionTool', () => {
  const mockUseDesignStore = useDesignStore as jest.Mock;
  const mockUseUIStore = useUIStore as jest.Mock;
  const mockSnapPoint = snapping.snapPoint as jest.Mock;
  const mockCreateDimensionAnnotation = annotations.createDimensionAnnotation as jest.Mock;

  beforeEach(() => {
    mockUseDesignStore.mockReturnValue({
      walls: [],
      doors: [],
      windows: [],
    });
    mockUseUIStore.mockReturnValue({
      activeTool: 'dimension',
      snapToGrid: true,
      gridSize: 10,
    });
    mockSnapPoint.mockImplementation(point => point);
    mockCreateDimensionAnnotation.mockImplementation((start, end) => ({ id: 'anno1', start, end }));
  });

  it('should be defined', () => {
    expect(useDimensionTool).toBeDefined();
  });

  it('should start creating a dimension', () => {
    const { result } = renderHook(() => useDimensionTool());

    act(() => {
      result.current.startDimension(10, 20);
    });

    expect(result.current.state.isCreating).toBe(true);
    expect(result.current.state.startPoint).toEqual({ x: 10, y: 20 });
  });
});

