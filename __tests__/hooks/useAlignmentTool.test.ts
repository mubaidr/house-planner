
import { renderHook, act } from '@testing-library/react';
import { useAlignmentTool } from '@/hooks/useAlignmentTool';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useHistoryStore } from '@/stores/historyStore';
import * as alignmentUtils from '@/utils/alignmentUtils';

jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');
jest.mock('@/stores/historyStore');
jest.mock('@/utils/alignmentUtils');

describe('useAlignmentTool', () => {
  const mockUseDesignStore = useDesignStore as jest.Mock;
  const mockUseFloorStore = useFloorStore as jest.Mock;
  const mockUseHistoryStore = useHistoryStore as jest.Mock;
  const mockAlignLeft = alignmentUtils.alignLeft as jest.Mock;

  beforeEach(() => {
    mockUseDesignStore.mockReturnValue({
      walls: [{ id: 'wall1' }, { id: 'wall2' }],
      doors: [],
      windows: [],
      stairs: [],
      roofs: [],
      updateWall: jest.fn(),
      updateDoor: jest.fn(),
      updateWindow: jest.fn(),
      updateStair: jest.fn(),
      updateRoof: jest.fn(),
    });
    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor1',
      updateElementInFloor: jest.fn(),
    });
    mockUseHistoryStore.mockReturnValue({
      executeCommand: jest.fn(),
    });
    mockAlignLeft.mockImplementation(elements => elements);
  });

  it('should be defined', () => {
    expect(useAlignmentTool).toBeDefined();
  });

  it('should call alignLeft when alignLeftElements is called', () => {
    const { result } = renderHook(() => useAlignmentTool());
    act(() => {
      result.current.alignLeftElements();
    });
    expect(mockAlignLeft).toHaveBeenCalled();
  });
});
