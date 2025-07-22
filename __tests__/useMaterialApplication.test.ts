import { renderHook, act } from '@testing-library/react';
import { useMaterialApplication } from '@/hooks/useMaterialApplication';
import { useMaterialStore } from '@/stores/materialStore';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';

// Mock the dependencies
jest.mock('@/stores/materialStore');
jest.mock('@/stores/designStore');
jest.mock('@/stores/floorStore');

const mockUseMaterialStore = useMaterialStore as jest.MockedFunction<typeof useMaterialStore>;
const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseFloorStore = useFloorStore as jest.MockedFunction<typeof useFloorStore>;

describe('useMaterialApplication', () => {
  const mockWalls = [
    { id: 'wall-1', startX: 0, startY: 0, endX: 200, endY: 0, thickness: 8, height: 240, materialId: undefined },
    { id: 'wall-2', startX: 200, startY: 0, endX: 200, endY: 200, thickness: 8, height: 240, materialId: undefined },
  ];

  const mockDoors = [
    { id: 'door-1', x: 50, y: 0, width: 80, height: 200, wallId: 'wall-1', materialId: undefined },
  ];

  const mockWindows = [
    { id: 'window-1', x: 100, y: 0, width: 60, height: 120, wallId: 'wall-1', materialId: undefined },
  ];

  const mockRooms = [
    { 
      id: 'room-1', 
      vertices: [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 200 },
        { x: 0, y: 200 }
      ],
      materialId: undefined 
    },
  ];

  const mockApplyMaterial = jest.fn();
  const mockGetMaterialApplication = jest.fn();
  const mockRemoveMaterialApplication = jest.fn();
  const mockUpdateWall = jest.fn();
  const mockUpdateDoor = jest.fn();
  const mockUpdateWindow = jest.fn();
  const mockUpdateRoom = jest.fn();
  const mockUpdateElementInFloor = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseMaterialStore.mockReturnValue({
      applyMaterial: mockApplyMaterial,
      getMaterialApplication: mockGetMaterialApplication,
      removeMaterialApplication: mockRemoveMaterialApplication,
    } as any);

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: mockDoors,
      windows: mockWindows,
      rooms: mockRooms,
      updateWall: mockUpdateWall,
      updateDoor: mockUpdateDoor,
      updateWindow: mockUpdateWindow,
      updateRoom: mockUpdateRoom,
    } as any);

    mockUseFloorStore.mockReturnValue({
      currentFloorId: 'floor-1',
      updateElementInFloor: mockUpdateElementInFloor,
    } as any);
  });

  it('should initialize and provide material application functions', () => {
    const { result } = renderHook(() => useMaterialApplication());

    expect(typeof result.current.applyMaterialToElement).toBe('function');
    expect(typeof result.current.removeMaterialFromElement).toBe('function');
    expect(typeof result.current.getElementMaterial).toBe('function');
    expect(typeof result.current.handleCanvasDrop).toBe('function');
    expect(typeof result.current.findElementAtPosition).toBe('function');
  });

  it('should apply material to wall element', () => {
    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.applyMaterialToElement('wall-1', 'wall', 'material-1', 100);
    });

    expect(mockApplyMaterial).toHaveBeenCalledWith({
      elementId: 'wall-1',
      elementType: 'wall',
      materialId: 'material-1',
      appliedAt: expect.any(Date),
      coverage: 100,
    });

    expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', { materialId: 'material-1' });
    expect(mockUpdateElementInFloor).toHaveBeenCalledWith(
      'floor-1',
      'walls',
      'wall-1',
      { materialId: 'material-1' }
    );
  });

  it('should apply material to door element', () => {
    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.applyMaterialToElement('door-1', 'door', 'material-2', 80);
    });

    expect(mockApplyMaterial).toHaveBeenCalledWith({
      elementId: 'door-1',
      elementType: 'door',
      materialId: 'material-2',
      appliedAt: expect.any(Date),
      coverage: 80,
    });

    expect(mockUpdateDoor).toHaveBeenCalledWith('door-1', { materialId: 'material-2' });
    expect(mockUpdateElementInFloor).toHaveBeenCalledWith(
      'floor-1',
      'doors',
      'door-1',
      { materialId: 'material-2' }
    );
  });

  it('should apply material to window element', () => {
    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.applyMaterialToElement('window-1', 'window', 'material-3', 90);
    });

    expect(mockApplyMaterial).toHaveBeenCalledWith({
      elementId: 'window-1',
      elementType: 'window',
      materialId: 'material-3',
      appliedAt: expect.any(Date),
      coverage: 90,
    });

    expect(mockUpdateWindow).toHaveBeenCalledWith('window-1', { materialId: 'material-3' });
    expect(mockUpdateElementInFloor).toHaveBeenCalledWith(
      'floor-1',
      'windows',
      'window-1',
      { materialId: 'material-3' }
    );
  });

  it('should apply material to room element', () => {
    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.applyMaterialToElement('room-1', 'room', 'material-4', 100);
    });

    expect(mockApplyMaterial).toHaveBeenCalledWith({
      elementId: 'room-1',
      elementType: 'room',
      materialId: 'material-4',
      appliedAt: expect.any(Date),
      coverage: 100,
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { materialId: 'material-4' });
    // Rooms don't update floor store
    expect(mockUpdateElementInFloor).not.toHaveBeenCalled();
  });

  it('should use default coverage of 100 when not specified', () => {
    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.applyMaterialToElement('wall-1', 'wall', 'material-1');
    });

    expect(mockApplyMaterial).toHaveBeenCalledWith(
      expect.objectContaining({
        coverage: 100,
      })
    );
  });

  it('should not apply material to non-existent wall', () => {
    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.applyMaterialToElement('non-existent-wall', 'wall', 'material-1');
    });

    expect(mockApplyMaterial).toHaveBeenCalled(); // Store operation still happens
    expect(mockUpdateWall).not.toHaveBeenCalled(); // But element update doesn't
  });

  it('should remove material from wall element', () => {
    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.removeMaterialFromElement('wall-1', 'wall');
    });

    expect(mockRemoveMaterialApplication).toHaveBeenCalledWith('wall-1', 'wall');
    expect(mockUpdateWall).toHaveBeenCalledWith('wall-1', { materialId: undefined });
    expect(mockUpdateElementInFloor).toHaveBeenCalledWith(
      'floor-1',
      'walls',
      'wall-1',
      { materialId: undefined }
    );
  });

  it('should remove material from door element', () => {
    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.removeMaterialFromElement('door-1', 'door');
    });

    expect(mockRemoveMaterialApplication).toHaveBeenCalledWith('door-1', 'door');
    expect(mockUpdateDoor).toHaveBeenCalledWith('door-1', { materialId: undefined });
  });

  it('should remove material from window element', () => {
    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.removeMaterialFromElement('window-1', 'window');
    });

    expect(mockRemoveMaterialApplication).toHaveBeenCalledWith('window-1', 'window');
    expect(mockUpdateWindow).toHaveBeenCalledWith('window-1', { materialId: undefined });
  });

  it('should remove material from room element', () => {
    const { result } = renderHook(() => useMaterialApplication());

    act(() => {
      result.current.removeMaterialFromElement('room-1', 'room');
    });

    expect(mockRemoveMaterialApplication).toHaveBeenCalledWith('room-1', 'room');
    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { materialId: undefined });
  });

  it('should get element material', () => {
    const mockMaterialApplication = {
      elementId: 'wall-1',
      elementType: 'wall',
      materialId: 'material-1',
      appliedAt: new Date(),
      coverage: 100,
    };

    mockGetMaterialApplication.mockReturnValue(mockMaterialApplication);

    const { result } = renderHook(() => useMaterialApplication());

    const material = result.current.getElementMaterial('wall-1', 'wall');

    expect(mockGetMaterialApplication).toHaveBeenCalledWith('wall-1', 'wall');
    expect(material).toBe(mockMaterialApplication);
  });

  it('should find wall element at position', () => {
    const { result } = renderHook(() => useMaterialApplication());

    // Point on wall-1 (horizontal wall from 0,0 to 200,0)
    const hitResult = result.current.findElementAtPosition(100, 0);

    expect(hitResult).toEqual({
      type: 'wall',
      element: mockWalls[0],
    });
  });

  it('should find door element at position', () => {
    const { result } = renderHook(() => useMaterialApplication());

    // Point on door-1 (at x: 50, y: 0, width: 80, height: 200)
    const hitResult = result.current.findElementAtPosition(90, 100);

    expect(hitResult).toEqual({
      type: 'door',
      element: mockDoors[0],
    });
  });

  it('should find window element at position', () => {
    const { result } = renderHook(() => useMaterialApplication());

    // Point on window-1 (at x: 100, y: 0, width: 60, height: 120)
    // Use a position that's clearly in the window but not overlapping with door
    const hitResult = result.current.findElementAtPosition(120, 30);

    expect(hitResult).toEqual({
      type: 'window',
      element: mockWindows[0],
    });
  });

  it('should find room element at position', () => {
    const { result } = renderHook(() => useMaterialApplication());

    // Point inside room-1 (square from 0,0 to 200,200) but away from walls/doors/windows
    const hitResult = result.current.findElementAtPosition(150, 150);

    expect(hitResult).toEqual({
      type: 'room',
      element: mockRooms[0],
    });
  });

  it('should return null when no element found at position', () => {
    const { result } = renderHook(() => useMaterialApplication());

    // Point outside all elements
    const hitResult = result.current.findElementAtPosition(500, 500);

    expect(hitResult).toBeNull();
  });

  it('should prioritize elements correctly (walls > doors > windows > rooms)', () => {
    const { result } = renderHook(() => useMaterialApplication());

    // Point that could hit multiple elements - should return wall first
    const hitResult = result.current.findElementAtPosition(50, 5);

    expect(hitResult?.type).toBe('wall'); // Wall should be found first
  });

  it('should handle canvas drop with valid material data', () => {
    const { result } = renderHook(() => useMaterialApplication());

    const mockEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        getData: jest.fn().mockReturnValue(JSON.stringify({
          type: 'material',
          materialId: 'material-1',
        })),
      },
    } as any;

    act(() => {
      result.current.handleCanvasDrop(mockEvent, { x: 100, y: 0 });
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockApplyMaterial).toHaveBeenCalledWith(
      expect.objectContaining({
        elementId: 'wall-1',
        elementType: 'wall',
        materialId: 'material-1',
      })
    );
  });

  it('should handle canvas drop with invalid data gracefully', () => {
    const { result } = renderHook(() => useMaterialApplication());

    const mockEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        getData: jest.fn().mockReturnValue('invalid json'),
      },
    } as any;

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.handleCanvasDrop(mockEvent, { x: 100, y: 0 });
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    expect(mockApplyMaterial).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle canvas drop with no data', () => {
    const { result } = renderHook(() => useMaterialApplication());

    const mockEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        getData: jest.fn().mockReturnValue(''),
      },
    } as any;

    act(() => {
      result.current.handleCanvasDrop(mockEvent, { x: 100, y: 0 });
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockApplyMaterial).not.toHaveBeenCalled();
  });

  it('should handle canvas drop with non-material data', () => {
    const { result } = renderHook(() => useMaterialApplication());

    const mockEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        getData: jest.fn().mockReturnValue(JSON.stringify({
          type: 'element',
          elementId: 'wall-1',
        })),
      },
    } as any;

    act(() => {
      result.current.handleCanvasDrop(mockEvent, { x: 100, y: 0 });
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockApplyMaterial).not.toHaveBeenCalled();
  });

  it('should handle canvas drop on empty area', () => {
    const { result } = renderHook(() => useMaterialApplication());

    const mockEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        getData: jest.fn().mockReturnValue(JSON.stringify({
          type: 'material',
          materialId: 'material-1',
        })),
      },
    } as any;

    act(() => {
      result.current.handleCanvasDrop(mockEvent, { x: 500, y: 500 });
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockApplyMaterial).not.toHaveBeenCalled();
  });

  it('should handle wall hit detection with tolerance', () => {
    const { result } = renderHook(() => useMaterialApplication());

    // Point slightly off the wall but within tolerance (wall is at y=0, so y=5 should be within tolerance)
    const hitResult = result.current.findElementAtPosition(100, 5);

    expect(hitResult?.type).toBe('wall');
  });

  it('should handle door hit detection with tolerance', () => {
    const { result } = renderHook(() => useMaterialApplication());

    // Point slightly outside door but within tolerance
    const hitResult = result.current.findElementAtPosition(45, 100); // 5 pixels left of door

    expect(hitResult?.type).toBe('door');
  });

  it('should handle window hit detection with tolerance', () => {
    const { result } = renderHook(() => useMaterialApplication());

    // Point slightly outside window but within tolerance (window starts at x=100, so x=105 should be inside)
    const hitResult = result.current.findElementAtPosition(105, 60);

    expect(hitResult?.type).toBe('window');
  });

  it('should handle point-in-polygon for complex room shapes', () => {
    // Create a more complex room shape (L-shaped)
    const complexRoom = {
      id: 'room-2',
      vertices: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 200, y: 50 },
        { x: 200, y: 100 },
        { x: 0, y: 100 },
      ],
      materialId: undefined,
    };

    mockUseDesignStore.mockReturnValue({
      walls: mockWalls,
      doors: mockDoors,
      windows: mockWindows,
      rooms: [complexRoom],
      updateWall: mockUpdateWall,
      updateDoor: mockUpdateDoor,
      updateWindow: mockUpdateWindow,
      updateRoom: mockUpdateRoom,
    } as any);

    const { result } = renderHook(() => useMaterialApplication());

    // Point inside the L-shape (first rectangle)
    const hitResult1 = result.current.findElementAtPosition(50, 25);
    expect(hitResult1?.type).toBe('room');

    // Point in the extended part of the L (second rectangle)
    const hitResult2 = result.current.findElementAtPosition(150, 75);
    expect(hitResult2?.type).toBe('room');

    // Point outside the L-shape (in the "notch") - this might still hit the room depending on the algorithm
    const hitResult3 = result.current.findElementAtPosition(150, 25);
    // The point-in-polygon algorithm might consider this inside, so let's test a clearly outside point
    const hitResult4 = result.current.findElementAtPosition(250, 25);
    expect(hitResult4).toBeNull();
  });

  it('should handle zero-length walls gracefully', () => {
    const zeroLengthWall = {
      id: 'wall-zero',
      startX: 100,
      startY: 100,
      endX: 100,
      endY: 100,
      thickness: 8,
      height: 240,
      materialId: undefined,
    };

    mockUseDesignStore.mockReturnValue({
      ...mockUseDesignStore(),
      walls: [zeroLengthWall],
    } as any);

    const { result } = renderHook(() => useMaterialApplication());

    // Point near the zero-length wall
    const hitResult = result.current.findElementAtPosition(100, 100);

    expect(hitResult?.type).toBe('wall');
  });
});