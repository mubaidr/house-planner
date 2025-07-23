import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AccessibilitySettingsPanel from '@/components/Accessibility/AccessibilitySettingsPanel';

// Mock the accessibility store
const mockAccessibilityStore = {
  highContrastMode: false,
  reducedMotion: false,
  largerText: false,
  largerFocusIndicators: false,
  enableAlternativeElementList: false,
  textScale: 1,
  colorBlindMode: 'none',
  enableAudioFeedback: false,
  keyboardNavigation: true,
  screenReaderOptimizations: false,
  announceChanges: true,
  setHighContrastMode: jest.fn(),
  setReducedMotion: jest.fn(),
  setLargerText: jest.fn(),
  setLargerFocusIndicators: jest.fn(),
  setEnableAlternativeElementList: jest.fn(),
  setTextScale: jest.fn(),
  setColorBlindMode: jest.fn(),
  setEnableAudioFeedback: jest.fn(),
  setKeyboardNavigation: jest.fn(),
  setScreenReaderOptimizations: jest.fn(),
  setAnnounceChanges: jest.fn(),
  resetToDefaults: jest.fn(),
};

const mockIsAccessibilityModeActive = jest.fn(() => false);

jest.mock('@/stores/accessibilityStore', () => ({
  useAccessibilityStore: () => mockAccessibilityStore,
  isAccessibilityModeActive: () => mockIsAccessibilityModeActive(),
}));

describe('AccessibilitySettingsPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store values to defaults
    Object.assign(mockAccessibilityStore, {
      highContrastMode: false,
      reducedMotion: false,
      largerText: false,
      largerFocusIndicators: false,
      enableAlternativeElementList: false,
      textScale: 1,
      colorBlindMode: 'none',
      enableAudioFeedback: false,
      keyboardNavigation: true,
      screenReaderOptimizations: false,
      announceChanges: true,
    });
  });

  it('should render when open', () => {
    render(<AccessibilitySettingsPanel {...defaultProps} />);
    
    expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
    expect(screen.getByText('Visual Accessibility')).toBeInTheDocument();
    expect(screen.getByText('Motor Accessibility')).toBeInTheDocument();
    expect(screen.getByText('Cognitive Accessibility')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<AccessibilitySettingsPanel {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Accessibility Settings')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<AccessibilitySettingsPanel {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  describe('Visual Accessibility Settings', () => {
    it('should toggle high contrast mode', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const highContrastCheckbox = screen.getByLabelText(/high contrast mode/i);
      await user.click(highContrastCheckbox);
      
      expect(mockAccessibilityStore.setHighContrastMode).toHaveBeenCalledWith(true);
    });

    it('should toggle larger text', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const largerTextCheckbox = screen.getByLabelText(/larger text/i);
      await user.click(largerTextCheckbox);
      
      expect(mockAccessibilityStore.setLargerText).toHaveBeenCalledWith(true);
    });

    it('should adjust text scale', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const textScaleSlider = screen.getByLabelText(/text scale/i);
      fireEvent.change(textScaleSlider, { target: { value: '1.5' } });
      
      expect(mockAccessibilityStore.setTextScale).toHaveBeenCalledWith(1.5);
    });

    it('should change color blind mode', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const colorBlindSelect = screen.getByLabelText(/color blind support/i);
      await user.click(colorBlindSelect);
      
      const protanopiaOption = screen.getByText('Protanopia');
      await user.click(protanopiaOption);
      
      expect(mockAccessibilityStore.setColorBlindMode).toHaveBeenCalledWith('protanopia');
    });

    it('should toggle larger focus indicators', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const focusIndicatorsCheckbox = screen.getByLabelText(/larger focus indicators/i);
      await user.click(focusIndicatorsCheckbox);
      
      expect(mockAccessibilityStore.setLargerFocusIndicators).toHaveBeenCalledWith(true);
    });
  });

  describe('Motor Accessibility Settings', () => {
    it('should toggle reduced motion', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const reducedMotionCheckbox = screen.getByLabelText(/reduce motion/i);
      await user.click(reducedMotionCheckbox);
      
      expect(mockAccessibilityStore.setReducedMotion).toHaveBeenCalledWith(true);
    });

    it('should toggle keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const keyboardNavCheckbox = screen.getByLabelText(/keyboard navigation/i);
      await user.click(keyboardNavCheckbox);
      
      expect(mockAccessibilityStore.setKeyboardNavigation).toHaveBeenCalledWith(false);
    });
  });

  describe('Cognitive Accessibility Settings', () => {
    it('should toggle screen reader optimizations', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const screenReaderCheckbox = screen.getByLabelText(/screen reader optimizations/i);
      await user.click(screenReaderCheckbox);
      
      expect(mockAccessibilityStore.setScreenReaderOptimizations).toHaveBeenCalledWith(true);
    });

    it('should toggle audio feedback', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const audioFeedbackCheckbox = screen.getByLabelText(/audio feedback/i);
      await user.click(audioFeedbackCheckbox);
      
      expect(mockAccessibilityStore.setEnableAudioFeedback).toHaveBeenCalledWith(true);
    });

    it('should toggle announce changes', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const announceChangesCheckbox = screen.getByLabelText(/announce changes/i);
      await user.click(announceChangesCheckbox);
      
      expect(mockAccessibilityStore.setAnnounceChanges).toHaveBeenCalledWith(false);
    });

    it('should toggle alternative element list', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const alternativeListCheckbox = screen.getByLabelText(/alternative element list/i);
      await user.click(alternativeListCheckbox);
      
      expect(mockAccessibilityStore.setEnableAlternativeElementList).toHaveBeenCalledWith(true);
    });
  });

  describe('Reset functionality', () => {
    it('should reset all settings to defaults', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
      await user.click(resetButton);
      
      expect(mockAccessibilityStore.resetToDefaults).toHaveBeenCalled();
    });
  });

  describe('Accessibility mode detection', () => {
    it('should show accessibility mode indicator when active', () => {
      mockIsAccessibilityModeActive.mockReturnValue(true);
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      expect(screen.getByText(/accessibility mode is active/i)).toBeInTheDocument();
    });

    it('should not show accessibility mode indicator when inactive', () => {
      mockIsAccessibilityModeActive.mockReturnValue(false);
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      expect(screen.queryByText(/accessibility mode is active/i)).not.toBeInTheDocument();
    });
  });

  describe('Keyboard navigation', () => {
    it('should handle escape key to close panel', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should trap focus within the panel', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      // First focusable element should be the close button
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveFocus();
      
      // Tab through elements and ensure focus stays within panel
      await user.tab();
      expect(document.activeElement).not.toBe(closeButton);
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Settings persistence', () => {
    it('should reflect current settings state', () => {
      mockAccessibilityStore.highContrastMode = true;
      mockAccessibilityStore.largerText = true;
      mockAccessibilityStore.textScale = 1.5;
      
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const highContrastCheckbox = screen.getByLabelText(/high contrast mode/i);
      const largerTextCheckbox = screen.getByLabelText(/larger text/i);
      const textScaleSlider = screen.getByLabelText(/text scale/i);
      
      expect(highContrastCheckbox).toBeChecked();
      expect(largerTextCheckbox).toBeChecked();
      expect(textScaleSlider).toHaveValue('1.5');
    });
  });

  describe('Help text and descriptions', () => {
    it('should provide helpful descriptions for settings', () => {
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      expect(screen.getByText(/improves readability by increasing contrast/i)).toBeInTheDocument();
      expect(screen.getByText(/reduces animations and transitions/i)).toBeInTheDocument();
      expect(screen.getByText(/provides audio cues for actions/i)).toBeInTheDocument();
    });

    it('should show keyboard shortcuts information', () => {
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      expect(screen.getByText(/press escape to close/i)).toBeInTheDocument();
      expect(screen.getByText(/use tab to navigate/i)).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('should adapt to different screen sizes', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const panel = screen.getByRole('dialog');
      expect(panel).toHaveClass('max-w-2xl'); // Should use responsive classes
    });
  });

  describe('Error handling', () => {
    it('should handle store update errors gracefully', async () => {
      const user = userEvent.setup();
      mockAccessibilityStore.setHighContrastMode.mockImplementation(() => {
        throw new Error('Store update failed');
      });
      
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const highContrastCheckbox = screen.getByLabelText(/high contrast mode/i);
      
      // Should not crash when store update fails
      await user.click(highContrastCheckbox);
      
      expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
    });
  });

  describe('ARIA and semantic markup', () => {
    it('should have proper ARIA attributes', () => {
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      
      const sections = screen.getAllByRole('group');
      sections.forEach(section => {
        expect(section).toHaveAttribute('aria-labelledby');
      });
    });

    it('should have proper heading structure', () => {
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Accessibility Settings');
      
      const sectionHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(sectionHeadings).toHaveLength(3); // Visual, Motor, Cognitive
    });

    it('should associate labels with form controls', () => {
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAccessibleName();
      });
      
      const sliders = screen.getAllByRole('slider');
      sliders.forEach(slider => {
        expect(slider).toHaveAccessibleName();
      });
    });
  });

  describe('Live region updates', () => {
    it('should announce setting changes', async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettingsPanel {...defaultProps} />);
      
      const highContrastCheckbox = screen.getByLabelText(/high contrast mode/i);
      await user.click(highContrastCheckbox);
      
      // Should have a live region for announcements
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toBeInTheDocument();
    });
  });
});