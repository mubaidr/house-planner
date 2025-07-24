
import { renderHook, act } from '@testing-library/react';
import { useDoorEditor } from '@/hooks/useDoorEditor';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useHistoryStore } from '@/stores/historyStore';
import * as wallConstraints from '@/utils/wallConstraints';
import * as history from '@/utils/history';

jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');
jest.mock('@/stores/historyStore');
jest.mock('@/utils/wallConstraints');
jest.mock('@/utils/history');


describe('useDoorEditor', () => {
  const mockUseDesignStore = useDesignStore as jest.Mock;
  const mockUseFloorStore = useFloorStore as jest.Mock;
  const mockUseHistoryStore = useHistoryStore as jest.Mock;
  const mockCanPlaceDoor = wallConstraints.canPlaceDoor as jest.Mock;
  const mockUpdateDoorCommand = history.UpdateDoorCommand as jest.Mock;

  beforeEach(() => {
    mockUseDesignStore.mockReturnValue({
      doors: [{ id: 'door1', x: 10, y: 20, width: 80, wallId: 'wall1' }],
      windows: [],
      walls: [],
      updateDoor: jest.fn(),
      removeDoor: jest.fn(),
      addDoor: jest.fn(),
      selectedElementId: null,
      selectedElementType: null,
    });
    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor1',
      updateElementInFloor: jest.fn(),
    });
    mockUseHistoryStore.mockReturnValue({
      executeCommand: jest.fn(),
    });
    mockCanPlaceDoor.mockReturnValue({ isValid: true, position: { x: 10, y: 20 }, wallId: 'wall1' });
  });

  it('should be defined', () => {
    expect(useDoorEditor).toBeDefined();
  });

  it('should start dragging', () => {
    const { result } = renderHook(() => useDoorEditor());

    act(() => {
      result.current.startDrag('door1', 'move', 10, 20);
    });

    expect(result.current.editState.isDragging).toBe(true);
    expect(result.current.editState.dragType).toBe('move');
    expect(result.current.editState.originalDoor).toBeDefined();
  });
});

