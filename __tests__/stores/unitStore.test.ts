import { act, renderHook } from '@testing-library/react';
import { useUnitStore } from '@/stores/unitStore';

describe('UnitStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useUnitStore.setState({
        unitSystem: 'metric',
        precision: 2,
        showUnitLabels: true,
        displayFormat: 'decimal',
      });
    });
  });

  describe('Initial State', () => {
    it('should have correct default values', () => {
      const state = useUnitStore.getState();
      
      expect(state.unitSystem).toBe('metric');
      expect(state.precision).toBe(2);
      expect(state.showUnitLabels).toBe(true);
      expect(state.displayFormat).toBe('decimal');
    });
  });

  describe('setUnitSystem', () => {
    it('should set unit system to metric', () => {
      act(() => {
        useUnitStore.getState().setUnitSystem('metric');
      });

      const state = useUnitStore.getState();
      expect(state.unitSystem).toBe('metric');
    });

    it('should set unit system to imperial', () => {
      act(() => {
        useUnitStore.getState().setUnitSystem('imperial');
      });

      const state = useUnitStore.getState();
      expect(state.unitSystem).toBe('imperial');
    });

    it('should switch between unit systems', () => {
      act(() => {
        useUnitStore.getState().setUnitSystem('imperial');
      });

      let state = useUnitStore.getState();
      expect(state.unitSystem).toBe('imperial');

      act(() => {
        useUnitStore.getState().setUnitSystem('metric');
      });

      state = useUnitStore.getState();
      expect(state.unitSystem).toBe('metric');
    });
  });

  describe('setPrecision', () => {
    it('should set precision within valid range', () => {
      act(() => {
        useUnitStore.getState().setPrecision(3);
      });

      const state = useUnitStore.getState();
      expect(state.precision).toBe(3);
    });

    it('should clamp precision to minimum value (0)', () => {
      act(() => {
        useUnitStore.getState().setPrecision(-5);
      });

      const state = useUnitStore.getState();
      expect(state.precision).toBe(0);
    });

    it('should clamp precision to maximum value (6)', () => {
      act(() => {
        useUnitStore.getState().setPrecision(10);
      });

      const state = useUnitStore.getState();
      expect(state.precision).toBe(6);
    });

    it('should handle boundary values correctly', () => {
      act(() => {
        useUnitStore.getState().setPrecision(0);
      });

      let state = useUnitStore.getState();
      expect(state.precision).toBe(0);

      act(() => {
        useUnitStore.getState().setPrecision(6);
      });

      state = useUnitStore.getState();
      expect(state.precision).toBe(6);
    });

    it('should handle decimal precision values', () => {
      act(() => {
        useUnitStore.getState().setPrecision(2.7);
      });

      const state = useUnitStore.getState();
      expect(state.precision).toBe(2.7);
    });
  });

  describe('toggleUnitLabels', () => {
    it('should toggle unit labels from true to false', () => {
      // Initial state is true
      expect(useUnitStore.getState().showUnitLabels).toBe(true);

      act(() => {
        useUnitStore.getState().toggleUnitLabels();
      });

      expect(useUnitStore.getState().showUnitLabels).toBe(false);
    });

    it('should toggle unit labels from false to true', () => {
      // Set to false first
      act(() => {
        useUnitStore.setState({ showUnitLabels: false });
      });

      expect(useUnitStore.getState().showUnitLabels).toBe(false);

      act(() => {
        useUnitStore.getState().toggleUnitLabels();
      });

      expect(useUnitStore.getState().showUnitLabels).toBe(true);
    });

    it('should handle multiple toggles', () => {
      act(() => {
        useUnitStore.getState().toggleUnitLabels();
        useUnitStore.getState().toggleUnitLabels();
        useUnitStore.getState().toggleUnitLabels();
      });

      // Should end up false after 3 toggles (true -> false -> true -> false)
      expect(useUnitStore.getState().showUnitLabels).toBe(false);
    });
  });

  describe('setDisplayFormat', () => {
    it('should set display format to decimal', () => {
      act(() => {
        useUnitStore.getState().setDisplayFormat('decimal');
      });

      const state = useUnitStore.getState();
      expect(state.displayFormat).toBe('decimal');
    });

    it('should set display format to fractional', () => {
      act(() => {
        useUnitStore.getState().setDisplayFormat('fractional');
      });

      const state = useUnitStore.getState();
      expect(state.displayFormat).toBe('fractional');
    });

    it('should switch between display formats', () => {
      act(() => {
        useUnitStore.getState().setDisplayFormat('fractional');
      });

      let state = useUnitStore.getState();
      expect(state.displayFormat).toBe('fractional');

      act(() => {
        useUnitStore.getState().setDisplayFormat('decimal');
      });

      state = useUnitStore.getState();
      expect(state.displayFormat).toBe('decimal');
    });
  });

  describe('Combined State Changes', () => {
    it('should handle multiple state changes correctly', () => {
      act(() => {
        useUnitStore.getState().setUnitSystem('imperial');
        useUnitStore.getState().setPrecision(4);
        useUnitStore.getState().toggleUnitLabels();
        useUnitStore.getState().setDisplayFormat('fractional');
      });

      const state = useUnitStore.getState();
      expect(state.unitSystem).toBe('imperial');
      expect(state.precision).toBe(4);
      expect(state.showUnitLabels).toBe(false);
      expect(state.displayFormat).toBe('fractional');
    });

    it('should maintain independent state properties', () => {
      act(() => {
        useUnitStore.getState().setUnitSystem('imperial');
      });

      let state = useUnitStore.getState();
      expect(state.unitSystem).toBe('imperial');
      expect(state.precision).toBe(2); // Should remain unchanged
      expect(state.showUnitLabels).toBe(true); // Should remain unchanged
      expect(state.displayFormat).toBe('decimal'); // Should remain unchanged

      act(() => {
        useUnitStore.getState().setPrecision(5);
      });

      state = useUnitStore.getState();
      expect(state.unitSystem).toBe('imperial'); // Should remain unchanged
      expect(state.precision).toBe(5);
      expect(state.showUnitLabels).toBe(true); // Should remain unchanged
      expect(state.displayFormat).toBe('decimal'); // Should remain unchanged
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid state changes', () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useUnitStore.getState().toggleUnitLabels();
          useUnitStore.getState().setPrecision(i % 7); // Will be clamped to 0-6
          useUnitStore.getState().setUnitSystem(i % 2 === 0 ? 'metric' : 'imperial');
        }
      });

      const state = useUnitStore.getState();
      expect(state.unitSystem).toBe('imperial'); // Last iteration (i=9, 9%2=1)
      expect(state.precision).toBe(2); // Last iteration (9%7=2)
      expect(state.showUnitLabels).toBe(true); // 10 toggles = back to original
    });

    it('should handle extreme precision values', () => {
      act(() => {
        useUnitStore.getState().setPrecision(-1000);
      });

      let state = useUnitStore.getState();
      expect(state.precision).toBe(0);

      act(() => {
        useUnitStore.getState().setPrecision(1000);
      });

      state = useUnitStore.getState();
      expect(state.precision).toBe(6);
    });

    it('should handle floating point precision values', () => {
      const testValues = [0.5, 1.1, 2.9, 3.14159, 5.99999];
      
      testValues.forEach(value => {
        act(() => {
          useUnitStore.getState().setPrecision(value);
        });

        const state = useUnitStore.getState();
        expect(state.precision).toBe(value);
      });
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across multiple operations', () => {
      // Set up a specific configuration
      act(() => {
        useUnitStore.getState().setUnitSystem('imperial');
        useUnitStore.getState().setPrecision(3);
        useUnitStore.getState().toggleUnitLabels(); // false
        useUnitStore.getState().setDisplayFormat('fractional');
      });

      // Verify the configuration persists
      const state = useUnitStore.getState();
      expect(state.unitSystem).toBe('imperial');
      expect(state.precision).toBe(3);
      expect(state.showUnitLabels).toBe(false);
      expect(state.displayFormat).toBe('fractional');

      // Make another change and verify previous settings remain
      act(() => {
        useUnitStore.getState().setPrecision(1);
      });

      const updatedState = useUnitStore.getState();
      expect(updatedState.unitSystem).toBe('imperial'); // Unchanged
      expect(updatedState.precision).toBe(1); // Changed
      expect(updatedState.showUnitLabels).toBe(false); // Unchanged
      expect(updatedState.displayFormat).toBe('fractional'); // Unchanged
    });
  });

  describe('Type Safety', () => {
    it('should only accept valid unit systems', () => {
      const validSystems = ['metric', 'imperial'] as const;
      
      validSystems.forEach(system => {
        act(() => {
          useUnitStore.getState().setUnitSystem(system);
        });

        const state = useUnitStore.getState();
        expect(state.unitSystem).toBe(system);
      });
    });

    it('should only accept valid display formats', () => {
      const validFormats = ['decimal', 'fractional'] as const;
      
      validFormats.forEach(format => {
        act(() => {
          useUnitStore.getState().setDisplayFormat(format);
        });

        const state = useUnitStore.getState();
        expect(state.displayFormat).toBe(format);
      });
    });
  });
});