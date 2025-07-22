import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with the initial value', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('should debounce string values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by less than delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Value should still be the old one
    expect(result.current).toBe('initial');

    // Fast-forward time to complete the delay
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Now the value should be updated
    expect(result.current).toBe('updated');
  });

  it('should debounce number values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    );

    expect(result.current).toBe(0);

    rerender({ value: 42, delay: 300 });
    expect(result.current).toBe(0);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(42);
  });

  it('should debounce object values', () => {
    const initialObj = { name: 'John', age: 30 };
    const updatedObj = { name: 'Jane', age: 25 };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 400 } }
    );

    expect(result.current).toBe(initialObj);

    rerender({ value: updatedObj, delay: 400 });
    expect(result.current).toBe(initialObj);

    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(result.current).toBe(updatedObj);
  });

  it('should reset timer when value changes before delay completes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    expect(result.current).toBe('first');

    // Change value
    rerender({ value: 'second', delay: 500 });
    
    // Advance time partially
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Change value again before first change completes
    rerender({ value: 'third', delay: 500 });

    // Advance time by the original remaining time
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Should still be the first value since timer was reset
    expect(result.current).toBe('first');

    // Advance by full delay from the last change
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Now should be the latest value
    expect(result.current).toBe('third');
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 200 }); // Change both value and delay

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('updated');
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    rerender({ value: 'immediate', delay: 0 });

    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current).toBe('immediate');
  });

  it('should handle rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 100 } }
    );

    // Rapidly change values
    for (let i = 1; i <= 10; i++) {
      rerender({ value: i, delay: 100 });
      act(() => {
        jest.advanceTimersByTime(50); // Less than delay
      });
    }

    // Should still be initial value
    expect(result.current).toBe(0);

    // Complete the delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should be the last value
    expect(result.current).toBe(10);
  });

  it('should clean up timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });

  it('should handle boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: false, delay: 200 } }
    );

    expect(result.current).toBe(false);

    rerender({ value: true, delay: 200 });
    expect(result.current).toBe(false);

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe(true);
  });

  it('should handle null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: null as any, delay: 300 } }
    );

    expect(result.current).toBe(null);

    rerender({ value: undefined, delay: 300 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(undefined);
  });

  it('should work with different delay values', () => {
    const delays = [50, 100, 500, 1000];

    delays.forEach(delay => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay } }
      );

      rerender({ value: 'updated', delay });

      act(() => {
        jest.advanceTimersByTime(delay);
      });

      expect(result.current).toBe('updated');
    });
  });
});