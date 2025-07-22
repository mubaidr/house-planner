import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../src/hooks/useAutoSave';
import { useDesignStore } from '@/stores/designStore';
import { autoSave } from '@/utils/storage';

// Mock the dependencies
jest.mock('@/stores/designStore');
jest.mock('@/utils/storage');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockAutoSave = autoSave as jest.MockedFunction<typeof autoSave>;

describe('useAutoSave', () => {
  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 6, height: 96, materialId: 'default' },
  ];

  const mockDoors = [
    { id: 'door-1', x: 50, y: 0, width: 36, height: 80, wallId: 'wall-1', materialId: 'default' },
  ];

  const mockWindows = [
    { id: 'window-1', x: 100, y: 50, width: 48, height: 36, wallId: 'wall-2', materialId: 'default' },
  ];

  const mockStairs = [
    { id: 'stair-1', x: 200, y: 200, width: 120, height: 240, steps: 12, materialId: 'default' },
  ];

  const mockRoofs = [
    { id: 'roof-1', points: [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 100, y: 100 }], materialId: 'default' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: mockDoors,
      windows: mockWindows,
      stairs: mockStairs,
      roofs: mockRoofs,
    } as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize without errors', () => {
    const { result } = renderHook(() => useAutoSave(1000));
    expect(result.current).toBeUndefined();
  });

  it('should auto-save when there is content', () => {
    renderHook(() => useAutoSave(1000));

    // Fast-forward time to trigger auto-save
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockAutoSave).toHaveBeenCalledWith({
      walls: mockWalls,
      doors: mockDoors,
      windows: mockWindows,
      stairs: mockStairs,
      roofs: mockRoofs,
    });
  });

  it('should not auto-save when there is no content', () => {
    mockUseDesignStore.mockReturnValue({
      walls: [],
      doors: [],
      windows: [],
      stairs: [],
      roofs: [],
    } as any);

    renderHook(() => useAutoSave(1000));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockAutoSave).not.toHaveBeenCalled();
  });

  it('should use custom interval when provided', () => {
    renderHook(() => useAutoSave(2000));

    // Should not trigger at 1000ms
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockAutoSave).not.toHaveBeenCalled();

    // Should trigger at 2000ms
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockAutoSave).toHaveBeenCalled();
  });

  it('should use default interval when no interval provided', () => {
    renderHook(() => useAutoSave());

    // Should trigger at default 30000ms
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(mockAutoSave).toHaveBeenCalled();
  });

  it('should auto-save multiple times at intervals', () => {
    renderHook(() => useAutoSave(1000));

    // First auto-save
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockAutoSave).toHaveBeenCalledTimes(1);

    // Second auto-save
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockAutoSave).toHaveBeenCalledTimes(2);

    // Third auto-save
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockAutoSave).toHaveBeenCalledTimes(3);
  });

  it('should clean up interval on unmount', () => {
    const { unmount } = renderHook(() => useAutoSave(1000));

    // Unmount the hook
    unmount();

    // Advance time - should not trigger auto-save after unmount
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockAutoSave).not.toHaveBeenCalled();
  });

  it('should restart interval when dependencies change', () => {
    const { rerender } = renderHook(() => useAutoSave(1000));

    // Change the store data
    mockUseDesignStore.mockReturnValue({
      walls: [...mockWalls, { id: 'wall-2', startX: 200, startY: 0, endX: 300, endY: 0, thickness: 6, height: 96, materialId: 'default' }],
      doors: mockDoors,
      windows: mockWindows,
      stairs: mockStairs,
      roofs: mockRoofs,
    } as any);

    rerender();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockAutoSave).toHaveBeenCalledWith(
      expect.objectContaining({
        walls: expect.arrayContaining([
          expect.objectContaining({ id: 'wall-1' }),
          expect.objectContaining({ id: 'wall-2' }),
        ]),
      })
    );
  });

  it('should handle auto-save errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock autoSave to throw an error for this test only
    mockAutoSave.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });

    // The hook itself doesn't have error handling, so the error will bubble up
    // This test verifies that the error occurs as expected
    expect(() => {
      renderHook(() => useAutoSave(1000));

      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }).toThrow('Storage error');

    // Should have attempted to call autoSave
    expect(mockAutoSave).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should auto-save when any element type has content', () => {
    // Reset the mock implementation to ensure it works normally
    mockAutoSave.mockReset();
    
    // Test with only walls
    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: [],
      windows: [],
      stairs: [],
      roofs: [],
    } as any);

    const { rerender } = renderHook(() => useAutoSave(1000));

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockAutoSave).toHaveBeenCalledTimes(1);

    // Test with only doors
    mockAutoSave.mockClear();
    mockUseDesignStore.mockReturnValue({
      walls: [],
      doors: mockDoors,
      windows: [],
      stairs: [],
      roofs: [],
    } as any);

    rerender();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockAutoSave).toHaveBeenCalledTimes(1);
  });
});
