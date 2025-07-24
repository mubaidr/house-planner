
import { renderHook, act } from '@testing-library/react';
import { useDoorAnimation, useGlobalDoorAnimation } from '@/hooks/useDoorAnimation';


describe('useDoorAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(useDoorAnimation).toBeDefined();
  });

  it('should toggle the door state', () => {
    const { result } = renderHook(() => useDoorAnimation());

    act(() => {
      result.current.toggleDoor();
    });

    expect(result.current.animationState.isAnimating).toBe(true);
    expect(result.current.animationState.isOpen).toBe(true);
    expect(result.current.animationState.targetAngle).toBe(90);

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.animationState.isAnimating).toBe(false);
    expect(result.current.animationState.currentAngle).toBe(90);
  });

  it('should reset the door state', () => {
    const { result } = renderHook(() => useDoorAnimation());

    act(() => {
      result.current.toggleDoor();
    });

    act(() => {
      result.current.resetDoor();
    });

    expect(result.current.animationState.isAnimating).toBe(false);
    expect(result.current.animationState.isOpen).toBe(false);
    expect(result.current.animationState.currentAngle).toBe(0);
    expect(result.current.animationState.targetAngle).toBe(0);
  });
});



describe('useGlobalDoorAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(useGlobalDoorAnimation).toBeDefined();
  });

  it('should toggle a door', () => {
    const { result } = renderHook(() => useGlobalDoorAnimation());

    act(() => {
      result.current.toggleDoor('door1');
    });

    let state = result.current.getDoorState('door1');
    expect(state.isAnimating).toBe(true);
    expect(state.isOpen).toBe(true);
    expect(state.targetAngle).toBe(90);

    act(() => {
      jest.runAllTimers();
    });

    state = result.current.getDoorState('door1');
    expect(state.isAnimating).toBe(false);
    expect(state.currentAngle).toBe(90);
  });

  it('should reset a door', () => {
    const { result } = renderHook(() => useGlobalDoorAnimation());

    act(() => {
      result.current.toggleDoor('door1');
    });

    act(() => {
      result.current.resetDoor('door1');
    });

    const state = result.current.getDoorState('door1');
    expect(state.isAnimating).toBe(false);
    expect(state.isOpen).toBe(false);
    expect(state.currentAngle).toBe(0);
    expect(state.targetAngle).toBe(0);
  });

  it('should reset all doors', () => {
    const { result } = renderHook(() => useGlobalDoorAnimation());

    act(() => {
      result.current.toggleDoor('door1');
      result.current.toggleDoor('door2');
    });

    act(() => {
      result.current.resetAllDoors();
    });

    const state1 = result.current.getDoorState('door1');
    const state2 = result.current.getDoorState('door2');

    expect(state1.isOpen).toBe(false);
    expect(state2.isOpen).toBe(false);
  });
});

