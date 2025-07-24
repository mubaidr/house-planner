
import { renderHook, act } from '@testing-library/react';
import { useMaterialApplication } from '@/hooks/useMaterialApplication';
import { useMaterialStore } from '@/stores/materialStore';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';

// Mock the stores
jest.mock('@/stores/materialStore');
jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');

// Mock helper functions (if they were exported, otherwise they are private)
// For now, we'll assume they are private and test through the hook's public interface

describe('useMaterialApplication', () => {
  const mockUseMaterialStore = useMaterialStore as jest.Mock;
  const mockUseDesignStore = useDesignStore as jest.Mock;
  const mockUseFloorStore = useFloorStore as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMaterialStore.mockReturnValue({
      applyMaterial: jest.fn(),
      getMaterialApplication: jest.fn(),
      removeMaterialApplication: jest.fn(),
    });
    mockUseDesignStore.mockReturnValue({
      walls: [],
      doors: [],
      windows: [],
      rooms: [],
      updateWall: jest.fn(),
      updateDoor: jest.fn(),
      updateWindow: jest.fn(),
      updateRoom: jest.fn(),
    });
    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor1',
      updateElementInFloor: jest.fn(),
    });
  });

  it('should be defined', () => {
    expect(useMaterialApplication).toBeDefined();
  });

  it('should apply material to a wall', () => {
    const { applyMaterial, getMaterialApplication } = mockUseMaterialStore();
    const { updateWall, walls } = mockUseDesignStore();
    const { updateElementInFloor } = mockUseFloorStore();

    mockUseDesignStore.mockReturnValue({
      walls: [{ id: 'wall1', materialId: undefined }],
      doors: [], windows: [], rooms: [],
      updateWall,
      updateDoor: jest.fn(), updateWindow: jest.fn(), updateRoom: jest.fn(),
    });

    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.applyMaterialToElement('wall1', 'wall', 'material1');
    });

    expect(applyMaterial).toHaveBeenCalledWith(expect.objectContaining({
      elementId: 'wall1',
      elementType: 'wall',
      materialId: 'material1',
    }));
    expect(updateWall).toHaveBeenCalledWith('wall1', { materialId: 'material1' });
    expect(updateElementInFloor).toHaveBeenCalledWith('floor1', 'walls', 'wall1', { materialId: 'material1' });
  });

  it('should remove material from a wall', () => {
    const { removeMaterialApplication } = mockUseMaterialStore();
    const { updateWall, walls } = mockUseDesignStore();
    const { updateElementInFloor } = mockUseFloorStore();

    mockUseDesignStore.mockReturnValue({
      walls: [{ id: 'wall1', materialId: 'material1' }],
      doors: [], windows: [], rooms: [],
      updateWall,
      updateDoor: jest.fn(), updateWindow: jest.fn(), updateRoom: jest.fn(),
    });

    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.removeMaterialFromElement('wall1', 'wall');
    });

    expect(removeMaterialApplication).toHaveBeenCalledWith('wall1', 'wall');
    expect(updateWall).toHaveBeenCalledWith('wall1', { materialId: undefined });
    expect(updateElementInFloor).toHaveBeenCalledWith('floor1', 'walls', 'wall1', { materialId: undefined });
  });
});
