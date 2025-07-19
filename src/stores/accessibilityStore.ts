import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AccessibilityState {
  // Core accessibility preferences
  highContrastMode: boolean;
  reducedMotion: boolean;
  largerText: boolean;
  largerFocusIndicators: boolean;

  // Screen reader support
  enableAlternativeElementList: boolean;
  showElementList: boolean;

  // Keyboard navigation
  keyboardNavigationOnly: boolean;
  tabNavigationOrder: string[];

  // Visual preferences
  textScale: number;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

  // Audio preferences
  enableAudioFeedback: boolean;
  audioVolume: number;
}

export interface AccessibilityActions {
  // Core toggles
  toggleHighContrastMode: () => void;
  toggleReducedMotion: () => void;
  toggleLargerText: () => void;
  toggleLargerFocusIndicators: () => void;
  toggleAlternativeElementList: () => void;
  toggleElementList: () => void;
  toggleKeyboardNavigationOnly: () => void;

  // Settings
  setTextScale: (scale: number) => void;
  setColorBlindMode: (mode: AccessibilityState['colorBlindMode']) => void;
  setAudioFeedback: (enabled: boolean) => void;
  setAudioVolume: (volume: number) => void;
  setTabNavigationOrder: (order: string[]) => void;

  // Reset
  resetToDefaults: () => void;
}

export const useAccessibilityStore = create<AccessibilityState & AccessibilityActions>()(
  persist(
    (set, get) => ({
      // Default state
      highContrastMode: false,
      reducedMotion: false,
      largerText: false,
      largerFocusIndicators: false,
      enableAlternativeElementList: true,
      showElementList: false,
      keyboardNavigationOnly: false,
      tabNavigationOrder: [],
      textScale: 1.0,
      colorBlindMode: 'none',
      enableAudioFeedback: false,
      audioVolume: 0.5,

      // Actions
      toggleHighContrastMode: () => set((state) => ({ highContrastMode: !state.highContrastMode })),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
      toggleLargerText: () => set((state) => ({ largerText: !state.largerText })),
      toggleLargerFocusIndicators: () => set((state) => ({ largerFocusIndicators: !state.largerFocusIndicators })),
      toggleAlternativeElementList: () => set((state) => ({ enableAlternativeElementList: !state.enableAlternativeElementList })),
      toggleElementList: () => set((state) => ({ showElementList: !state.showElementList })),
      toggleKeyboardNavigationOnly: () => set((state) => ({ keyboardNavigationOnly: !state.keyboardNavigationOnly })),

      setTextScale: (scale) => set({ textScale: Math.max(0.5, Math.min(3.0, scale)) }),
      setColorBlindMode: (mode) => set({ colorBlindMode: mode }),
      setAudioFeedback: (enabled) => set({ enableAudioFeedback: enabled }),
      setAudioVolume: (volume) => set({ audioVolume: Math.max(0, Math.min(1, volume)) }),
      setTabNavigationOrder: (order) => set({ tabNavigationOrder: order }),

      resetToDefaults: () => set({
        highContrastMode: false,
        reducedMotion: false,
        largerText: false,
        largerFocusIndicators: false,
        enableAlternativeElementList: true,
        showElementList: false,
        keyboardNavigationOnly: false,
        tabNavigationOrder: [],
        textScale: 1.0,
        colorBlindMode: 'none',
        enableAudioFeedback: false,
        audioVolume: 0.5,
      }),
    }),
    {
      name: 'accessibility-preferences',
    }
  )
);

// Helper function to check if accessibility mode is active
export const isAccessibilityModeActive = (state: AccessibilityState): boolean => {
  return (
    state.highContrastMode ||
    state.largerText ||
    state.reducedMotion ||
    state.largerFocusIndicators ||
    state.keyboardNavigationOnly ||
    state.textScale !== 1.0
  );
};
