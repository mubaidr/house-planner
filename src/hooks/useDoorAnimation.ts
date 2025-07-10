import { useState, useCallback, useRef, useEffect } from 'react';

export interface DoorAnimationState {
  isAnimating: boolean;
  currentAngle: number;
  targetAngle: number;
  isOpen: boolean;
}

interface DoorAnimationHook {
  animationState: DoorAnimationState;
  toggleDoor: () => void;
  resetDoor: () => void;
}

export const useDoorAnimation = (): DoorAnimationHook => {
  const [animationState, setAnimationState] = useState<DoorAnimationState>({
    isAnimating: false,
    currentAngle: 0,
    targetAngle: 0,
    isOpen: false,
  });

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Animation configuration
  const ANIMATION_DURATION = 800; // milliseconds
  const OPEN_ANGLE = 90; // degrees
  const CLOSED_ANGLE = 0; // degrees

  // Easing function for smooth animation
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
    const easedProgress = easeInOutCubic(progress);

    setAnimationState(prev => {
      const angleDifference = prev.targetAngle - (prev.isOpen ? CLOSED_ANGLE : OPEN_ANGLE);
      const currentAngle = (prev.isOpen ? CLOSED_ANGLE : OPEN_ANGLE) + (angleDifference * easedProgress);

      if (progress >= 1) {
        // Animation complete
        return {
          ...prev,
          isAnimating: false,
          currentAngle: prev.targetAngle,
        };
      }

      return {
        ...prev,
        currentAngle,
      };
    });

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      startTimeRef.current = null;
    }
  }, []);

  // Toggle door open/closed
  const toggleDoor = useCallback(() => {
    if (animationState.isAnimating) return;

    const newIsOpen = !animationState.isOpen;
    const newTargetAngle = newIsOpen ? OPEN_ANGLE : CLOSED_ANGLE;

    setAnimationState(prev => ({
      ...prev,
      isAnimating: true,
      targetAngle: newTargetAngle,
      isOpen: newIsOpen,
    }));

    startTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animationState.isAnimating, animationState.isOpen, animate]);

  // Reset door to closed position
  const resetDoor = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setAnimationState({
      isAnimating: false,
      currentAngle: CLOSED_ANGLE,
      targetAngle: CLOSED_ANGLE,
      isOpen: false,
    });

    startTimeRef.current = null;
  }, []);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    animationState,
    toggleDoor,
    resetDoor,
  };
};

// Global door animation state management
interface GlobalDoorAnimationState {
  [doorId: string]: DoorAnimationState;
}

let globalDoorStates: GlobalDoorAnimationState = {};

export const useGlobalDoorAnimation = () => {
  const [, forceUpdate] = useState({});

  const updateDoorState = useCallback((doorId: string, state: DoorAnimationState) => {
    globalDoorStates = {
      ...globalDoorStates,
      [doorId]: state,
    };
    forceUpdate({});
  }, []);

  const getDoorState = useCallback((doorId: string): DoorAnimationState => {
    return globalDoorStates[doorId] || {
      isAnimating: false,
      currentAngle: 0,
      targetAngle: 0,
      isOpen: false,
    };
  }, []);

  const toggleDoor = useCallback((doorId: string) => {
    const currentState = getDoorState(doorId);
    if (currentState.isAnimating) return;

    const newIsOpen = !currentState.isOpen;
    const newTargetAngle = newIsOpen ? 90 : 0;

    updateDoorState(doorId, {
      ...currentState,
      isAnimating: true,
      targetAngle: newTargetAngle,
      isOpen: newIsOpen,
    });

    // Start animation
    const startTime = performance.now();
    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / 800, 1);
      const easedProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const startAngle = newIsOpen ? 0 : 90;
      const endAngle = newIsOpen ? 90 : 0;
      const currentAngle = startAngle + (endAngle - startAngle) * easedProgress;

      updateDoorState(doorId, {
        ...globalDoorStates[doorId],
        currentAngle,
        isAnimating: progress < 1,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [getDoorState, updateDoorState]);

  const resetDoor = useCallback((doorId: string) => {
    updateDoorState(doorId, {
      isAnimating: false,
      currentAngle: 0,
      targetAngle: 0,
      isOpen: false,
    });
  }, [updateDoorState]);

  const resetAllDoors = useCallback(() => {
    globalDoorStates = {};
    forceUpdate({});
  }, []);

  return {
    getDoorState,
    toggleDoor,
    resetDoor,
    resetAllDoors,
  };
};