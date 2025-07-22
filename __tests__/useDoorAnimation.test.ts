import { renderHook, act } from '@testing-library/react';
import { useDoorAnimation } from '@/hooks/useDoorAnimation';

describe('useDoorAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset any timers
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useDoorAnimation());

      expect(result.current.animationState).toEqual({
        isAnimating: false,
        currentAngle: 0,
        targetAngle: 0,
        direction: 'none',
        duration: 300,
      });
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useDoorAnimation());

      expect(typeof result.current.startAnimation).toBe('function');
      expect(typeof result.current.stopAnimation).toBe('function');
      expect(typeof result.current.setTargetAngle).toBe('function');
      expect(typeof result.current.resetAnimation).toBe('function');
      expect(typeof result.current.toggleDoor).toBe('function');
    });
  });

  describe('startAnimation', () => {
    it('should start animation with default parameters', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.startAnimation();
      });

      expect(result.current.animationState.isAnimating).toBe(true);
      expect(result.current.animationState.duration).toBe(300);
    });

    it('should start animation with custom duration', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.startAnimation(500);
      });

      expect(result.current.animationState.isAnimating).toBe(true);
      expect(result.current.animationState.duration).toBe(500);
    });

    it('should not start animation if already animating', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.startAnimation(300);
      });

      const firstState = { ...result.current.animationState };

      act(() => {
        result.current.startAnimation(500);
      });

      expect(result.current.animationState.duration).toBe(300); // Should remain unchanged
      expect(result.current.animationState.isAnimating).toBe(true);
    });

    it('should call onComplete callback when animation finishes', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.startAnimation(100, onComplete);
      });

      expect(onComplete).not.toHaveBeenCalled();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(result.current.animationState.isAnimating).toBe(false);
    });
  });

  describe('stopAnimation', () => {
    it('should stop ongoing animation', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.startAnimation(1000);
      });

      expect(result.current.animationState.isAnimating).toBe(true);

      act(() => {
        result.current.stopAnimation();
      });

      expect(result.current.animationState.isAnimating).toBe(false);
    });

    it('should work when no animation is running', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.stopAnimation();
      });

      expect(result.current.animationState.isAnimating).toBe(false);
    });

    it('should clear animation timeout', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.startAnimation(1000, onComplete);
      });

      act(() => {
        result.current.stopAnimation();
      });

      // Fast-forward time - callback should not be called
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('setTargetAngle', () => {
    it('should set target angle and determine direction', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.setTargetAngle(90);
      });

      expect(result.current.animationState.targetAngle).toBe(90);
      expect(result.current.animationState.direction).toBe('opening');
    });

    it('should set closing direction when target is less than current', () => {
      const { result } = renderHook(() => useDoorAnimation());

      // First set current angle to 90
      act(() => {
        result.current.setTargetAngle(90);
        result.current.animationState.currentAngle = 90;
      });

      act(() => {
        result.current.setTargetAngle(0);
      });

      expect(result.current.animationState.targetAngle).toBe(0);
      expect(result.current.animationState.direction).toBe('closing');
    });

    it('should set none direction when target equals current', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.setTargetAngle(0);
      });

      expect(result.current.animationState.direction).toBe('none');
    });

    it('should handle negative angles', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.setTargetAngle(-45);
      });

      expect(result.current.animationState.targetAngle).toBe(-45);
      expect(result.current.animationState.direction).toBe('closing');
    });

    it('should handle angles greater than 180', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.setTargetAngle(270);
      });

      expect(result.current.animationState.targetAngle).toBe(270);
      expect(result.current.animationState.direction).toBe('opening');
    });
  });

  describe('resetAnimation', () => {
    it('should reset animation to initial state', () => {
      const { result } = renderHook(() => useDoorAnimation());

      // Modify state
      act(() => {
        result.current.setTargetAngle(90);
        result.current.startAnimation(500);
      });

      expect(result.current.animationState.isAnimating).toBe(true);
      expect(result.current.animationState.targetAngle).toBe(90);

      act(() => {
        result.current.resetAnimation();
      });

      expect(result.current.animationState).toEqual({
        isAnimating: false,
        currentAngle: 0,
        targetAngle: 0,
        direction: 'none',
        duration: 300,
      });
    });

    it('should stop ongoing animation when resetting', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.startAnimation(1000, onComplete);
      });

      act(() => {
        result.current.resetAnimation();
      });

      // Fast-forward time - callback should not be called
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(onComplete).not.toHaveBeenCalled();
      expect(result.current.animationState.isAnimating).toBe(false);
    });
  });

  describe('toggleDoor', () => {
    it('should open door when closed', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.toggleDoor();
      });

      expect(result.current.animationState.targetAngle).toBe(90);
      expect(result.current.animationState.direction).toBe('opening');
      expect(result.current.animationState.isAnimating).toBe(true);
    });

    it('should close door when open', () => {
      const { result } = renderHook(() => useDoorAnimation());

      // First open the door
      act(() => {
        result.current.setTargetAngle(90);
        result.current.animationState.currentAngle = 90;
      });

      act(() => {
        result.current.toggleDoor();
      });

      expect(result.current.animationState.targetAngle).toBe(0);
      expect(result.current.animationState.direction).toBe('closing');
      expect(result.current.animationState.isAnimating).toBe(true);
    });

    it('should use custom open angle', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.toggleDoor(120);
      });

      expect(result.current.animationState.targetAngle).toBe(120);
      expect(result.current.animationState.direction).toBe('opening');
    });

    it('should use custom duration', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.toggleDoor(90, 500);
      });

      expect(result.current.animationState.duration).toBe(500);
      expect(result.current.animationState.isAnimating).toBe(true);
    });

    it('should call onComplete callback', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.toggleDoor(90, 100, onComplete);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not toggle if already animating', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.startAnimation(1000);
      });

      const stateBefore = { ...result.current.animationState };

      act(() => {
        result.current.toggleDoor();
      });

      expect(result.current.animationState.targetAngle).toBe(stateBefore.targetAngle);
      expect(result.current.animationState.duration).toBe(stateBefore.duration);
    });
  });

  describe('Animation Progress', () => {
    it('should update current angle during animation', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.setTargetAngle(90);
        result.current.startAnimation(300);
      });

      // Check initial state
      expect(result.current.animationState.currentAngle).toBe(0);

      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(150); // Half duration
      });

      // Current angle should be between 0 and 90
      expect(result.current.animationState.currentAngle).toBeGreaterThan(0);
      expect(result.current.animationState.currentAngle).toBeLessThan(90);

      // Complete animation
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.animationState.currentAngle).toBe(90);
      expect(result.current.animationState.isAnimating).toBe(false);
    });

    it('should handle reverse animation (closing)', () => {
      const { result } = renderHook(() => useDoorAnimation());

      // Start with door open
      act(() => {
        result.current.setTargetAngle(90);
        result.current.animationState.currentAngle = 90;
      });

      // Close the door
      act(() => {
        result.current.setTargetAngle(0);
        result.current.startAnimation(300);
      });

      expect(result.current.animationState.direction).toBe('closing');

      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.animationState.currentAngle).toBeLessThan(90);
      expect(result.current.animationState.currentAngle).toBeGreaterThan(0);

      // Complete animation
      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.animationState.currentAngle).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero duration', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.setTargetAngle(90);
        result.current.startAnimation(0, onComplete);
      });

      expect(result.current.animationState.currentAngle).toBe(90);
      expect(result.current.animationState.isAnimating).toBe(false);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should handle very large angles', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.setTargetAngle(720); // Two full rotations
      });

      expect(result.current.animationState.targetAngle).toBe(720);
      expect(result.current.animationState.direction).toBe('opening');
    });

    it('should handle negative durations', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.startAnimation(-100);
      });

      // Should use absolute value or default
      expect(result.current.animationState.duration).toBeGreaterThan(0);
    });

    it('should cleanup on unmount', () => {
      const onComplete = jest.fn();
      const { result, unmount } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.startAnimation(1000, onComplete);
      });

      unmount();

      // Fast-forward time - callback should not be called after unmount
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Animations', () => {
    it('should handle rapid toggle calls', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.toggleDoor(90, 100);
      });

      expect(result.current.animationState.targetAngle).toBe(90);

      // Try to toggle again immediately
      act(() => {
        result.current.toggleDoor(90, 100);
      });

      // Should not change since already animating
      expect(result.current.animationState.targetAngle).toBe(90);

      // Complete first animation
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Now toggle should work
      act(() => {
        result.current.toggleDoor(90, 100);
      });

      expect(result.current.animationState.targetAngle).toBe(0);
      expect(result.current.animationState.direction).toBe('closing');
    });

    it('should handle setTargetAngle during animation', () => {
      const { result } = renderHook(() => useDoorAnimation());

      act(() => {
        result.current.setTargetAngle(90);
        result.current.startAnimation(300);
      });

      // Change target mid-animation
      act(() => {
        jest.advanceTimersByTime(150);
        result.current.setTargetAngle(45);
      });

      expect(result.current.animationState.targetAngle).toBe(45);
      // Animation should continue with new target
      expect(result.current.animationState.isAnimating).toBe(true);
    });
  });
});