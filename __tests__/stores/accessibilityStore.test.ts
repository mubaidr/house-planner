import { act, renderHook } from '@testing-library/react';
import { useAccessibilityStore, isAccessibilityModeActive } from '@/stores/accessibilityStore';

describe('AccessibilityStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useAccessibilityStore.getState().resetToDefaults();
    });
  });

  describe('Initial State', () => {
    it('should have correct default values', () => {
      const state = useAccessibilityStore.getState();
      
      expect(state.highContrastMode).toBe(false);
      expect(state.reducedMotion).toBe(false);
      expect(state.largerText).toBe(false);
      expect(state.largerFocusIndicators).toBe(false);
      expect(state.enableAlternativeElementList).toBe(true);
      expect(state.showElementList).toBe(false);
      expect(state.keyboardNavigationOnly).toBe(false);
      expect(state.tabNavigationOrder).toEqual([]);
      expect(state.textScale).toBe(1.0);
      expect(state.colorBlindMode).toBe('none');
      expect(state.enableAudioFeedback).toBe(false);
      expect(state.audioVolume).toBe(0.5);
    });
  });

  describe('Toggle Actions', () => {
    it('should toggle high contrast mode', () => {
      act(() => {
        useAccessibilityStore.getState().toggleHighContrastMode();
      });

      expect(useAccessibilityStore.getState().highContrastMode).toBe(true);

      act(() => {
        useAccessibilityStore.getState().toggleHighContrastMode();
      });

      expect(useAccessibilityStore.getState().highContrastMode).toBe(false);
    });

    it('should toggle reduced motion', () => {
      act(() => {
        useAccessibilityStore.getState().toggleReducedMotion();
      });

      expect(useAccessibilityStore.getState().reducedMotion).toBe(true);
    });

    it('should toggle larger text', () => {
      act(() => {
        useAccessibilityStore.getState().toggleLargerText();
      });

      expect(useAccessibilityStore.getState().largerText).toBe(true);
    });

    it('should toggle larger focus indicators', () => {
      act(() => {
        useAccessibilityStore.getState().toggleLargerFocusIndicators();
      });

      expect(useAccessibilityStore.getState().largerFocusIndicators).toBe(true);
    });

    it('should toggle alternative element list', () => {
      act(() => {
        useAccessibilityStore.getState().toggleAlternativeElementList();
      });

      expect(useAccessibilityStore.getState().enableAlternativeElementList).toBe(false);
    });

    it('should toggle element list visibility', () => {
      act(() => {
        useAccessibilityStore.getState().toggleElementList();
      });

      expect(useAccessibilityStore.getState().showElementList).toBe(true);
    });

    it('should toggle keyboard navigation only mode', () => {
      act(() => {
        useAccessibilityStore.getState().toggleKeyboardNavigationOnly();
      });

      expect(useAccessibilityStore.getState().keyboardNavigationOnly).toBe(true);
    });
  });

  describe('Setter Actions', () => {
    it('should set text scale within valid range', () => {
      act(() => {
        useAccessibilityStore.getState().setTextScale(1.5);
      });

      expect(useAccessibilityStore.getState().textScale).toBe(1.5);
    });

    it('should clamp text scale to minimum value', () => {
      act(() => {
        useAccessibilityStore.getState().setTextScale(0.1);
      });

      expect(useAccessibilityStore.getState().textScale).toBe(0.5);
    });

    it('should clamp text scale to maximum value', () => {
      act(() => {
        useAccessibilityStore.getState().setTextScale(5.0);
      });

      expect(useAccessibilityStore.getState().textScale).toBe(3.0);
    });

    it('should set color blind mode', () => {
      act(() => {
        useAccessibilityStore.getState().setColorBlindMode('protanopia');
      });

      expect(useAccessibilityStore.getState().colorBlindMode).toBe('protanopia');
    });

    it('should set audio feedback', () => {
      act(() => {
        useAccessibilityStore.getState().setAudioFeedback(true);
      });

      expect(useAccessibilityStore.getState().enableAudioFeedback).toBe(true);
    });

    it('should set audio volume within valid range', () => {
      act(() => {
        useAccessibilityStore.getState().setAudioVolume(0.8);
      });

      expect(useAccessibilityStore.getState().audioVolume).toBe(0.8);
    });

    it('should clamp audio volume to minimum value', () => {
      act(() => {
        useAccessibilityStore.getState().setAudioVolume(-0.5);
      });

      expect(useAccessibilityStore.getState().audioVolume).toBe(0);
    });

    it('should clamp audio volume to maximum value', () => {
      act(() => {
        useAccessibilityStore.getState().setAudioVolume(1.5);
      });

      expect(useAccessibilityStore.getState().audioVolume).toBe(1);
    });

    it('should set tab navigation order', () => {
      const order = ['element1', 'element2', 'element3'];
      
      act(() => {
        useAccessibilityStore.getState().setTabNavigationOrder(order);
      });

      expect(useAccessibilityStore.getState().tabNavigationOrder).toEqual(order);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all settings to defaults', () => {
      // Change multiple settings
      act(() => {
        useAccessibilityStore.getState().toggleHighContrastMode();
        useAccessibilityStore.getState().toggleLargerText();
        useAccessibilityStore.getState().setTextScale(2.0);
        useAccessibilityStore.getState().setColorBlindMode('deuteranopia');
        useAccessibilityStore.getState().setAudioFeedback(true);
        useAccessibilityStore.getState().setTabNavigationOrder(['test']);
      });

      // Verify changes were applied
      let state = useAccessibilityStore.getState();
      expect(state.highContrastMode).toBe(true);
      expect(state.largerText).toBe(true);
      expect(state.textScale).toBe(2.0);

      // Reset to defaults
      act(() => {
        useAccessibilityStore.getState().resetToDefaults();
      });

      // Verify all settings are back to defaults
      state = useAccessibilityStore.getState();
      expect(state.highContrastMode).toBe(false);
      expect(state.reducedMotion).toBe(false);
      expect(state.largerText).toBe(false);
      expect(state.largerFocusIndicators).toBe(false);
      expect(state.enableAlternativeElementList).toBe(true);
      expect(state.showElementList).toBe(false);
      expect(state.keyboardNavigationOnly).toBe(false);
      expect(state.tabNavigationOrder).toEqual([]);
      expect(state.textScale).toBe(1.0);
      expect(state.colorBlindMode).toBe('none');
      expect(state.enableAudioFeedback).toBe(false);
      expect(state.audioVolume).toBe(0.5);
    });
  });

  describe('Helper Functions', () => {
    it('should detect when accessibility mode is active', () => {
      let state = useAccessibilityStore.getState();
      expect(isAccessibilityModeActive(state)).toBe(false);

      act(() => {
        useAccessibilityStore.getState().toggleHighContrastMode();
      });

      state = useAccessibilityStore.getState();
      expect(isAccessibilityModeActive(state)).toBe(true);
    });

    it('should detect accessibility mode with larger text', () => {
      act(() => {
        useAccessibilityStore.getState().toggleLargerText();
      });

      const state = useAccessibilityStore.getState();
      expect(isAccessibilityModeActive(state)).toBe(true);
    });

    it('should detect accessibility mode with custom text scale', () => {
      act(() => {
        useAccessibilityStore.getState().setTextScale(1.5);
      });

      const state = useAccessibilityStore.getState();
      expect(isAccessibilityModeActive(state)).toBe(true);
    });

    it('should detect accessibility mode with reduced motion', () => {
      act(() => {
        useAccessibilityStore.getState().toggleReducedMotion();
      });

      const state = useAccessibilityStore.getState();
      expect(isAccessibilityModeActive(state)).toBe(true);
    });

    it('should detect accessibility mode with keyboard navigation only', () => {
      act(() => {
        useAccessibilityStore.getState().toggleKeyboardNavigationOnly();
      });

      const state = useAccessibilityStore.getState();
      expect(isAccessibilityModeActive(state)).toBe(true);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across multiple actions', () => {
      act(() => {
        useAccessibilityStore.getState().toggleHighContrastMode();
        useAccessibilityStore.getState().setTextScale(1.2);
        useAccessibilityStore.getState().setColorBlindMode('tritanopia');
      });

      const state = useAccessibilityStore.getState();
      expect(state.highContrastMode).toBe(true);
      expect(state.textScale).toBe(1.2);
      expect(state.colorBlindMode).toBe('tritanopia');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid toggles', () => {
      act(() => {
        useAccessibilityStore.getState().toggleHighContrastMode();
        useAccessibilityStore.getState().toggleHighContrastMode();
        useAccessibilityStore.getState().toggleHighContrastMode();
      });

      expect(useAccessibilityStore.getState().highContrastMode).toBe(true);
    });

    it('should handle empty tab navigation order', () => {
      act(() => {
        useAccessibilityStore.getState().setTabNavigationOrder([]);
      });

      expect(useAccessibilityStore.getState().tabNavigationOrder).toEqual([]);
    });

    it('should handle all color blind mode options', () => {
      const modes = ['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const;
      
      modes.forEach(mode => {
        act(() => {
          useAccessibilityStore.getState().setColorBlindMode(mode);
        });

        expect(useAccessibilityStore.getState().colorBlindMode).toBe(mode);
      });
    });
  });
});