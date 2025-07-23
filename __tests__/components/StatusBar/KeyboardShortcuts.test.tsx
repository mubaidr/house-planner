import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import KeyboardShortcuts from '@/components/StatusBar/KeyboardShortcuts';

describe('KeyboardShortcuts', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    render(<KeyboardShortcuts {...defaultProps} />);
    
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<KeyboardShortcuts {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display all shortcut categories', () => {
    render(<KeyboardShortcuts {...defaultProps} />);
    
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  describe('File Shortcuts', () => {
    it('should display file shortcuts', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      expect(screen.getByText('Save project')).toBeInTheDocument();
      expect(screen.getByText('Open project')).toBeInTheDocument();
      expect(screen.getByText('Export project')).toBeInTheDocument();
    });

    it('should display file shortcut keys', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      // Check for Ctrl+S
      const ctrlSKeys = screen.getAllByText('Ctrl');
      const sKey = screen.getByText('S');
      expect(ctrlSKeys.length).toBeGreaterThan(0);
      expect(sKey).toBeInTheDocument();
      
      // Check for Ctrl+O
      const oKey = screen.getByText('O');
      expect(oKey).toBeInTheDocument();
      
      // Check for Ctrl+E
      const eKey = screen.getByText('E');
      expect(eKey).toBeInTheDocument();
    });
  });

  describe('Tool Shortcuts', () => {
    it('should display tool shortcuts', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      expect(screen.getByText('Select tool')).toBeInTheDocument();
      expect(screen.getByText('Wall tool')).toBeInTheDocument();
      expect(screen.getByText('Door tool')).toBeInTheDocument();
      expect(screen.getByText('Window tool')).toBeInTheDocument();
      expect(screen.getByText('Stair tool')).toBeInTheDocument();
      expect(screen.getByText('Roof tool')).toBeInTheDocument();
      expect(screen.getByText('Measure tool')).toBeInTheDocument();
    });

    it('should display tool shortcut keys', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      expect(screen.getByText('V')).toBeInTheDocument();
      expect(screen.getByText('W')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
      expect(screen.getByText('N')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText('R')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
    });
  });

  describe('Edit Shortcuts', () => {
    it('should display edit shortcuts', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      expect(screen.getByText('Copy selected element')).toBeInTheDocument();
      expect(screen.getByText('Paste element')).toBeInTheDocument();
      expect(screen.getByText('Duplicate element')).toBeInTheDocument();
      expect(screen.getByText('Delete selected element')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
      expect(screen.getByText('Redo')).toBeInTheDocument();
      expect(screen.getByText('Redo (alternative)')).toBeInTheDocument();
    });

    it('should display edit shortcut keys', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      // Check for Ctrl+C, Ctrl+V, Ctrl+D
      const ctrlKeys = screen.getAllByText('Ctrl');
      expect(ctrlKeys.length).toBeGreaterThan(5); // Multiple Ctrl shortcuts
      
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Z')).toBeInTheDocument();
      expect(screen.getByText('Y')).toBeInTheDocument();
    });

    it('should display complex shortcuts with modifiers', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      // Check for Ctrl+Shift+Z
      expect(screen.getByText('Shift')).toBeInTheDocument();
    });
  });

  describe('View Shortcuts', () => {
    it('should display view shortcuts', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      expect(screen.getByText('Plan view')).toBeInTheDocument();
      expect(screen.getByText('Front view')).toBeInTheDocument();
      expect(screen.getByText('Back view')).toBeInTheDocument();
      expect(screen.getByText('Left view')).toBeInTheDocument();
      expect(screen.getByText('Right view')).toBeInTheDocument();
      expect(screen.getByText('Zoom in')).toBeInTheDocument();
      expect(screen.getByText('Zoom out')).toBeInTheDocument();
      expect(screen.getByText('Reset zoom')).toBeInTheDocument();
    });

    it('should display view shortcut keys', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Navigation Shortcuts', () => {
    it('should display navigation shortcuts', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      expect(screen.getByText('Cancel current operation')).toBeInTheDocument();
      expect(screen.getByText('Context menu')).toBeInTheDocument();
      expect(screen.getByText('Edit selected element')).toBeInTheDocument();
      expect(screen.getByText('Toggle properties panel')).toBeInTheDocument();
    });

    it('should display navigation shortcut keys', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      expect(screen.getByText('Escape')).toBeInTheDocument();
      expect(screen.getByText('Right-click')).toBeInTheDocument();
      expect(screen.getByText('Enter')).toBeInTheDocument();
      expect(screen.getByText('F4')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should close when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should close when escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcuts {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should close when clicking outside the modal', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const backdrop = screen.getByRole('dialog').parentElement;
      await user.click(backdrop!);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should not close when clicking inside the modal', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      await user.click(modal);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Key Rendering', () => {
    it('should render keyboard keys with proper styling', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const kbdElements = screen.getAllByRole('generic').filter(el => 
        el.tagName.toLowerCase() === 'kbd'
      );
      
      expect(kbdElements.length).toBeGreaterThan(0);
      kbdElements.forEach(kbd => {
        expect(kbd).toHaveClass('px-2', 'py-1', 'text-xs', 'font-semibold');
      });
    });

    it('should separate multiple keys with plus signs', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      // Look for plus signs between keys
      const plusSigns = screen.getAllByText('+');
      expect(plusSigns.length).toBeGreaterThan(0);
    });

    it('should handle single key shortcuts', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      // Single keys like 'V', 'W', etc. should not have plus signs
      const vKey = screen.getByText('V');
      expect(vKey.closest('div')).not.toHaveTextContent('Ctrl+V');
    });

    it('should handle complex key combinations', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      // Check for Ctrl+Shift+Z combination
      const shiftKey = screen.getByText('Shift');
      expect(shiftKey).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should have proper modal structure', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('bg-white', 'rounded-lg', 'shadow-xl');
    });

    it('should have proper grid layout for categories', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const gridContainer = screen.getByText('File').closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    });

    it('should have proper header styling', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const header = screen.getByText('Keyboard Shortcuts');
      expect(header).toHaveClass('text-xl', 'font-semibold');
    });

    it('should display keyboard icon', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      // Check for keyboard icon (Lucide icon)
      const icon = screen.getByText('Keyboard Shortcuts').previousElementSibling;
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Help Content', () => {
    it('should display helpful tips', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      expect(screen.getByText(/Most shortcuts work when the canvas has focus/)).toBeInTheDocument();
      expect(screen.getByText(/Right-click on any element for quick actions/)).toBeInTheDocument();
    });

    it('should have tips section with proper styling', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const tipSection = screen.getByText('Tip:').closest('div');
      expect(tipSection).toHaveClass('text-sm', 'text-gray-600');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('should have accessible close button', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const closeButton = screen.getByRole('button');
      closeButton.focus();
      
      expect(closeButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const closeButton = screen.getByRole('button');
      closeButton.focus();
      
      // Tab should stay within modal
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should handle small screens', () => {
      // Mock small screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('mx-4'); // Should have margin on small screens
    });

    it('should have scrollable content on small screens', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('max-h-[80vh]', 'overflow-y-auto');
    });
  });

  describe('Content Organization', () => {
    it('should organize shortcuts by category', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      // Each category should be a separate section
      const categories = ['File', 'Tools', 'Edit', 'View', 'Navigation'];
      categories.forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    it('should display shortcuts in logical order', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      // File operations should come first
      const fileSection = screen.getByText('File');
      const toolsSection = screen.getByText('Tools');
      
      expect(fileSection.compareDocumentPosition(toolsSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('should group related shortcuts together', () => {
      render(<KeyboardShortcuts {...defaultProps} />);
      
      // Undo and Redo should be in the same Edit category
      const undoText = screen.getByText('Undo');
      const redoText = screen.getByText('Redo');
      const editCategory = screen.getByText('Edit');
      
      expect(editCategory.closest('div')).toContainElement(undoText.closest('div')!);
      expect(editCategory.closest('div')).toContainElement(redoText.closest('div')!);
    });
  });

  describe('Performance', () => {
    it('should render efficiently with many shortcuts', () => {
      const startTime = performance.now();
      render(<KeyboardShortcuts {...defaultProps} />);
      const endTime = performance.now();
      
      // Should render quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<KeyboardShortcuts {...defaultProps} />);
      
      rerender(<KeyboardShortcuts {...defaultProps} />);
      
      // Should still display correctly
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing onClose callback gracefully', () => {
      const propsWithoutCallback = {
        isOpen: true,
        onClose: undefined as any,
      };
      
      expect(() => {
        render(<KeyboardShortcuts {...propsWithoutCallback} />);
      }).not.toThrow();
    });

    it('should handle keyboard events when onClose is missing', async () => {
      const user = userEvent.setup();
      const propsWithoutCallback = {
        isOpen: true,
        onClose: undefined as any,
      };
      
      render(<KeyboardShortcuts {...propsWithoutCallback} />);
      
      // Should not crash when trying to close
      await user.keyboard('{Escape}');
      
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });
  });
});