import { renderHook, act } from '@testing-library/react';
import { useElementMovement } from '@/hooks/useElementMovement';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';

// Mock the stores
jest.mock('@/stores/designStore');
jest.mock('@/stores/uiStore');
jest.mock('@/stores/historyStore');
jest.mock('@/utils/snapping');
jest.mock('@/utils/wallIntersection');
jest.mock('@/utils/wallElementMovement');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

describe('useElementMovement', () => {
  const mockWall: Wall = {
    id: 'wall-1',
    type: 'wall',
    startX: 0,
    startY: 0,
    endX: 100,
    endY: 0,
    thickness: 6,
    height: 96,
    color: '#000000',
    materialId: 'default-wall',
    floorId: 'floor-1',
    visible: true,
    locked: false,
  };

  const mockDoor: Door = {
    id: 'door-1',
    type: 'door',
    wallId: 'wall-1',
    positionOnWall: 0.5,
    width: 36,
    height: 80,
    swingDirection: 'right',
    doorType: 'single',
    materialId: 'default-door',
    floorId: 'floor-1',
    visible: true,
    locked: false,
  };

  const mockUpdateWall = jest.fn();
  const mockUpdateDoor = jest.fn();
  const mockUpdateWindow = jest.fn();
  const mockUpdateStair = jest.fn();
  const mockUpdateRoof = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseDesignStore.mockReturnValue({
      walls: [mockWall],
      doors: [mockDoor],
      windows: [],
      stairs: [],
      roofs: [],
      updateWall: mockUpdateWall,
      updateDoor: mockUpdateDoor,
      updateWindow: mockUpdateWindow,
      updateStair: mockUpdateStair,
      updateRoof: mockUpdateRoof,
    } as any);

    mockUseUIStore.mockReturnValue({
      snapToGrid: true,
      gridSize: 12,
    } as any);
  });

  describe('handleWallDragMove', () => {
    it('should update wall position when dragged', () => {
      const { result } = renderHook(() => useElementMovement());

      const mockEvent = {
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 50, y: 50 }),
          }),
        },
      } as any;

      act(() => {
        result.current.handleWallDragMove(mockEvent, 'wall-1');
      });

      expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', expect.objectContaining({
        startX: expect.any(Number),
        startY: expect.any(Number),
        endX: expect.any(Number),
        endY: expect.any(Number),
      }));
    });

    it('should not update wall if wall not found', () => {
      const { result } = renderHook(() => useElementMovement());

      const mockEvent = {
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 50, y: 50 }),
          }),
        },
      } as any;

      act(() => {
        result.current.handleWallDragMove(mockEvent, 'non-existent-wall');
      });

      expect(mockUpdateWall).not.toHaveBeenCalled();
    });

    it('should handle missing stage gracefully', () => {
      const { result } = renderHook(() => useElementMovement());

      const mockEvent = {
        target: {
          getStage: () => null,
        },
      } as any;

      act(() => {
        result.current.handleWallDragMove(mockEvent, 'wall-1');
      });

      expect(mockUpdateWall).not.toHaveBeenCalled();
    });
  });

  describe('handleDoorDragMove', () => {
    it('should update door position along wall', () => {
      const { result } = renderHook(() => useElementMovement());

      const mockEvent = {
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 50, y: 0 }), // Middle of wall
          }),
        },
      } as any;

      act(() => {
        result.current.handleDoorDragMove(mockEvent, 'door-1');
      });

      expect(mockUpdateDoor).toHaveBeenCalledWith('door-1', expect.objectContaining({
        positionOnWall: expect.any(Number),
      }));
    });

    it('should clamp door position to wall bounds', () => {
      const { result } = renderHook(() => useElementMovement());

      const mockEvent = {
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: -50, y: 0 }), // Before wall start
          }),
        },
      } as any;

      act(() => {
        result.current.handleDoorDragMove(mockEvent, 'door-1');
      });

      expect(mockUpdateDoor).toHaveBeenCalledWith('door-1', expect.objectContaining({
        positionOnWall: expect.any(Number),
      }));

      // Position should be clamped to minimum
      const call = mockUpdateDoor.mock.calls[0];
      expect(call[1].positionOnWall).toBeGreaterThanOrEqual(0);
    });

    it('should not update door if door not found', () => {
      const { result } = renderHook(() => useElementMovement());

      const mockEvent = {
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 50, y: 50 }),
          }),
        },
      } as any;

      act(() => {
        result.current.handleDoorDragMove(mockEvent, 'non-existent-door');
      });

      expect(mockUpdateDoor).not.toHaveBeenCalled();
    });
  });

  describe('handleElementDragEnd', () => {
    it('should log completion message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { result } = renderHook(() => useElementMovement());

      act(() => {
        result.current.handleElementDragEnd('element-1', 'wall');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Element wall element-1 movement completed');
      
      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle zero-length walls gracefully', () => {
      const zeroLengthWall = { ...mockWall, endX: 0, endY: 0 };
      mockUseDesignStore.mockReturnValue({
        walls: [zeroLengthWall],
        doors: [mockDoor],
        windows: [],
        stairs: [],
        roofs: [],
        updateWall: mockUpdateWall,
        updateDoor: mockUpdateDoor,
        updateWindow: mockUpdateWindow,
        updateStair: mockUpdateStair,
        updateRoof: mockUpdateRoof,
      } as any);

      const { result } = renderHook(() => useElementMovement());

      const mockEvent = {
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 50, y: 0 }),
          }),
        },
      } as any;

      act(() => {
        result.current.handleDoorDragMove(mockEvent, 'door-1');
      });

      // Should not crash and not update door
      expect(mockUpdateDoor).not.toHaveBeenCalled();
    });

    it('should handle missing pointer position', () => {
      const { result } = renderHook(() => useElementMovement());

      const mockEvent = {
        target: {
          getStage: () => ({
            getPointerPosition: () => null,
          }),
        },
      } as any;

      act(() => {
        result.current.handleWallDragMove(mockEvent, 'wall-1');
      });

      expect(mockUpdateWall).not.toHaveBeenCalled();
    });
  });
});