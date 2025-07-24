import { renderHook } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useDesignStore } from '@/stores/designStore';
import { autoSave } from '@/utils/storage';

// Mock the dependencies
jest.mock('@/stores/designStore');
jest.mock('@/utils/storage');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockAutoSave = autoSave as jest.MockedFunction<typeof autoSave>;

describe('useAutoSave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockUseDesignStore.mockReturnValue({
      walls: [],
      doors: [],
      windows: [],
      stairs: [],
      roofs: [],
      // Add other required properties with default values
      addWall: jest.fn(),
      updateWall: jest.fn(),
      removeWall: jest.fn(),
      addDoor: jest.fn(),
      updateDoor: jest.fn(),
      removeDoor: jest.fn(),
      addWindow: jest.fn(),
      updateWindow: jest.fn(),
      removeWindow: jest.fn(),
      addStair: jest.fn(),
      updateStair: jest.fn(),
      removeStair: jest.fn(),
      addRoof: jest.fn(),
      updateRoof: jest.fn(),
      removeRoof: jest.fn(),
      clearAll: jest.fn(),
      loadDesign: jest.fn(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not auto-save when there is no content', () => {
    renderHook(() => useAutoSave(1000));
    
    jest.advanceTimersByTime(1000);
    
    expect(mockAutoSave).not.toHaveBeenCalled();
  });

  it('should auto-save when there are walls', () => {
    mockUseDesignStore.mockReturnValue({
      walls: [{ id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 10, height: 250, materialId: 'mat-1', floorId: 'floor-1' }],
      doors: [],
      windows: [],
      stairs: [],
      roofs: [],
      addWall: jest.fn(),
      updateWall: jest.fn(),
      removeWall: jest.fn(),
      addDoor: jest.fn(),
      updateDoor: jest.fn(),
      removeDoor: jest.fn(),
      addWindow: jest.fn(),
      updateWindow: jest.fn(),
      removeWindow: jest.fn(),
      addStair: jest.fn(),
      updateStair: jest.fn(),
      removeStair: jest.fn(),
      addRoof: jest.fn(),
      updateRoof: jest.fn(),
      removeRoof: jest.fn(),
      clearAll: jest.fn(),
      loadDesign: jest.fn(),
    });

    renderHook(() => useAutoSave(1000));
    
    jest.advanceTimersByTime(1000);
    
    expect(mockAutoSave).toHaveBeenCalledWith({
      walls: [{ id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 10, height: 250, materialId: 'mat-1', floorId: 'floor-1' }],
      doors: [],
      windows: [],
      stairs: [],
      roofs: [],
    });
  });

  it('should auto-save at specified intervals', () => {
    mockUseDesignStore.mockReturnValue({
      walls: [{ id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 10, height: 250, materialId: 'mat-1', floorId: 'floor-1' }],
      doors: [],
      windows: [],
      stairs: [],
      roofs: [],
      addWall: jest.fn(),
      updateWall: jest.fn(),
      removeWall: jest.fn(),
      addDoor: jest.fn(),
      updateDoor: jest.fn(),
      removeDoor: jest.fn(),
      addWindow: jest.fn(),
      updateWindow: jest.fn(),
      removeWindow: jest.fn(),
      addStair: jest.fn(),
      updateStair: jest.fn(),
      removeStair: jest.fn(),
      addRoof: jest.fn(),
      updateRoof: jest.fn(),
      removeRoof: jest.fn(),
      clearAll: jest.fn(),
      loadDesign: jest.fn(),
    });

    renderHook(() => useAutoSave(2000));
    
    jest.advanceTimersByTime(2000);
    expect(mockAutoSave).toHaveBeenCalledTimes(1);
    
    jest.advanceTimersByTime(2000);
    expect(mockAutoSave).toHaveBeenCalledTimes(2);
  });

  it('should use default interval when not specified', () => {
    mockUseDesignStore.mockReturnValue({
      walls: [{ id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 10, height: 250, materialId: 'mat-1', floorId: 'floor-1' }],
      doors: [],
      windows: [],
      stairs: [],
      roofs: [],
      addWall: jest.fn(),
      updateWall: jest.fn(),
      removeWall: jest.fn(),
      addDoor: jest.fn(),
      updateDoor: jest.fn(),
      removeDoor: jest.fn(),
      addWindow: jest.fn(),
      updateWindow: jest.fn(),
      removeWindow: jest.fn(),
      addStair: jest.fn(),
      updateStair: jest.fn(),
      removeStair: jest.fn(),
      addRoof: jest.fn(),
      updateRoof: jest.fn(),
      removeRoof: jest.fn(),
      clearAll: jest.fn(),
      loadDesign: jest.fn(),
    });

    renderHook(() => useAutoSave());
    
    jest.advanceTimersByTime(30000); // Default 30 seconds
    
    expect(mockAutoSave).toHaveBeenCalledTimes(1);
  });

  it('should clean up interval on unmount', () => {
    const { unmount } = renderHook(() => useAutoSave(1000));
    
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    
    clearIntervalSpy.mockRestore();
  });
});