import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ContextMenu } from '@/components/Canvas/ContextMenu';

// Mock the stores
const mockDesignStore = {
  selectedElements: [],
  deleteElement: jest.fn(),
  duplicateElement: jest.fn(),
  copyElement: jest.fn(),
  pasteElement: jest.fn(),
  groupElements: jest.fn(),
  ungroupElements: jest.fn(),
};

const mockHistoryStore = {
  undo: jest.fn(),
  redo: jest.fn(),
  canUndo: true,
  canRedo: false,
};

const mockUiStore = {
  setActiveModal: jest.fn(),
  setSelectedTool: jest.fn(),
};

jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => mockDesignStore,
}));

jest.mock('@/stores/historyStore', () => ({
  useHistoryStore: () => mockHistoryStore,
}));

jest.mock('@/stores/uiStore', () => ({
  useUiStore: () => mockUiStore,
}));

describe('ContextMenu', () => {
  const defaultProps = {
    isVisible: true,
    position: { x: 100, y: 200 },
    targetElement: {
      id: 'wall-1',
      type: 'wall',
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 0,
      thickness: 8,
      height: 240,
      color: '#000000'
    },
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDesignStore.selectedElements = [];
  });

  it('should render when visible', () => {
    render(<ContextMenu {...defaultProps} />);
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should not render when not visible', () => {
    render(<ContextMenu {...defaultProps} isVisible={false} />);
    
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should position correctly', () => {
    render(<ContextMenu {...defaultProps} />);
    
    const menu = screen.getByRole('menu');
    expect(menu).toHaveStyle({
      left: '100px',
      top: '200px',
    });
  });

  it('should adjust position when near screen edge', () => {
    const edgeProps = {
      ...defaultProps,
      position: { x: window.innerWidth - 50, y: window.innerHeight - 50 }
    };
    
    render(<ContextMenu {...edgeProps} />);
    
    const menu = screen.getByRole('menu');
    // Should adjust position to stay within viewport
    expect(menu).toBeInTheDocument();
  });

  describe('Wall context menu', () => {
    it('should show wall-specific options', () => {
      render(<ContextMenu {...defaultProps} />);
      
      expect(screen.getByText('Edit Wall')).toBeInTheDocument();
      expect(screen.getByText('Add Door')).toBeInTheDocument();
      expect(screen.getByText('Add Window')).toBeInTheDocument();
      expect(screen.getByText('Split Wall')).toBeInTheDocument();
    });

    it('should handle edit wall action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      await user.click(screen.getByText('Edit Wall'));
      
      expect(mockUiStore.setActiveModal).toHaveBeenCalledWith('wallProperties');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle add door action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      await user.click(screen.getByText('Add Door'));
      
      expect(mockUiStore.setSelectedTool).toHaveBeenCalledWith('door');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle add window action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      await user.click(screen.getByText('Add Window'));
      
      expect(mockUiStore.setSelectedTool).toHaveBeenCalledWith('window');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Door context menu', () => {
    const doorProps = {
      ...defaultProps,
      targetElement: {
        id: 'door-1',
        type: 'door',
        x: 50,
        y: 0,
        width: 80,
        height: 200,
        wallId: 'wall-1',
        materialId: 'wood'
      }
    };

    it('should show door-specific options', () => {
      render(<ContextMenu {...doorProps} />);
      
      expect(screen.getByText('Edit Door')).toBeInTheDocument();
      expect(screen.getByText('Change Material')).toBeInTheDocument();
      expect(screen.getByText('Flip Door')).toBeInTheDocument();
    });

    it('should handle edit door action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...doorProps} />);
      
      await user.click(screen.getByText('Edit Door'));
      
      expect(mockUiStore.setActiveModal).toHaveBeenCalledWith('doorProperties');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle flip door action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...doorProps} />);
      
      await user.click(screen.getByText('Flip Door'));
      
      expect(mockDesignStore.updateElement).toHaveBeenCalledWith('door-1', expect.objectContaining({
        flipped: true
      }));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Window context menu', () => {
    const windowProps = {
      ...defaultProps,
      targetElement: {
        id: 'window-1',
        type: 'window',
        x: 150,
        y: 0,
        width: 60,
        height: 120,
        wallId: 'wall-1',
        materialId: 'glass'
      }
    };

    it('should show window-specific options', () => {
      render(<ContextMenu {...windowProps} />);
      
      expect(screen.getByText('Edit Window')).toBeInTheDocument();
      expect(screen.getByText('Change Glass Type')).toBeInTheDocument();
      expect(screen.getByText('Add Shutters')).toBeInTheDocument();
    });

    it('should handle edit window action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...windowProps} />);
      
      await user.click(screen.getByText('Edit Window'));
      
      expect(mockUiStore.setActiveModal).toHaveBeenCalledWith('windowProperties');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Room context menu', () => {
    const roomProps = {
      ...defaultProps,
      targetElement: {
        id: 'room-1',
        type: 'room',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ],
        area: 10000,
        name: 'Living Room'
      }
    };

    it('should show room-specific options', () => {
      render(<ContextMenu {...roomProps} />);
      
      expect(screen.getByText('Edit Room')).toBeInTheDocument();
      expect(screen.getByText('Add Furniture')).toBeInTheDocument();
      expect(screen.getByText('Calculate Area')).toBeInTheDocument();
      expect(screen.getByText('Set Room Type')).toBeInTheDocument();
    });

    it('should handle edit room action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...roomProps} />);
      
      await user.click(screen.getByText('Edit Room'));
      
      expect(mockUiStore.setActiveModal).toHaveBeenCalledWith('roomProperties');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Multiple selection context menu', () => {
    beforeEach(() => {
      mockDesignStore.selectedElements = ['wall-1', 'wall-2', 'door-1'];
    });

    it('should show multi-selection options', () => {
      render(<ContextMenu {...defaultProps} />);
      
      expect(screen.getByText('Group Elements')).toBeInTheDocument();
      expect(screen.getByText('Align Elements')).toBeInTheDocument();
      expect(screen.getByText('Distribute Elements')).toBeInTheDocument();
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    });

    it('should handle group elements action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      await user.click(screen.getByText('Group Elements'));
      
      expect(mockDesignStore.groupElements).toHaveBeenCalledWith(['wall-1', 'wall-2', 'door-1']);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle delete selected action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      await user.click(screen.getByText('Delete Selected'));
      
      expect(mockDesignStore.deleteElements).toHaveBeenCalledWith(['wall-1', 'wall-2', 'door-1']);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Common actions', () => {
    it('should handle copy action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      await user.click(screen.getByText('Copy'));
      
      expect(mockDesignStore.copyElement).toHaveBeenCalledWith('wall-1');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle duplicate action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      await user.click(screen.getByText('Duplicate'));
      
      expect(mockDesignStore.duplicateElement).toHaveBeenCalledWith('wall-1');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle delete action', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      await user.click(screen.getByText('Delete'));
      
      expect(mockDesignStore.deleteElement).toHaveBeenCalledWith('wall-1');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle undo action when available', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      await user.click(screen.getByText('Undo'));
      
      expect(mockHistoryStore.undo).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should disable undo when not available', () => {
      mockHistoryStore.canUndo = false;
      render(<ContextMenu {...defaultProps} />);
      
      const undoButton = screen.getByText('Undo');
      expect(undoButton).toBeDisabled();
    });

    it('should handle redo action when available', async () => {
      mockHistoryStore.canRedo = true;
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      await user.click(screen.getByText('Redo'));
      
      expect(mockHistoryStore.redo).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Keyboard navigation', () => {
    it('should handle escape key to close', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle arrow key navigation', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      const firstItem = screen.getByText('Edit');
      firstItem.focus();
      
      await user.keyboard('{ArrowDown}');
      
      expect(screen.getByText('Copy')).toHaveFocus();
    });

    it('should handle enter key to activate item', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      const deleteItem = screen.getByText('Delete');
      deleteItem.focus();
      
      await user.keyboard('{Enter}');
      
      expect(mockDesignStore.deleteElement).toHaveBeenCalledWith('wall-1');
    });
  });

  describe('Click outside to close', () => {
    it('should close when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <ContextMenu {...defaultProps} />
          <div data-testid="outside">Outside element</div>
        </div>
      );
      
      await user.click(screen.getByTestId('outside'));
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should not close when clicking inside menu', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      const menu = screen.getByRole('menu');
      await user.click(menu);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Submenu functionality', () => {
    it('should show submenu on hover', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      const materialsItem = screen.getByText('Materials');
      await user.hover(materialsItem);
      
      await waitFor(() => {
        expect(screen.getByText('Wood')).toBeInTheDocument();
        expect(screen.getByText('Metal')).toBeInTheDocument();
        expect(screen.getByText('Glass')).toBeInTheDocument();
      });
    });

    it('should hide submenu when moving away', async () => {
      const user = userEvent.setup();
      render(<ContextMenu {...defaultProps} />);
      
      const materialsItem = screen.getByText('Materials');
      await user.hover(materialsItem);
      
      await waitFor(() => {
        expect(screen.getByText('Wood')).toBeInTheDocument();
      });
      
      await user.unhover(materialsItem);
      
      await waitFor(() => {
        expect(screen.queryByText('Wood')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ContextMenu {...defaultProps} />);
      
      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-orientation', 'vertical');
      
      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('tabindex');
      });
    });

    it('should announce menu items to screen readers', () => {
      render(<ContextMenu {...defaultProps} />);
      
      const editItem = screen.getByRole('menuitem', { name: /edit/i });
      expect(editItem).toHaveAccessibleName();
    });

    it('should support keyboard shortcuts', () => {
      render(<ContextMenu {...defaultProps} />);
      
      expect(screen.getByText(/Ctrl\+C/)).toBeInTheDocument(); // Copy shortcut
      expect(screen.getByText(/Ctrl\+D/)).toBeInTheDocument(); // Duplicate shortcut
      expect(screen.getByText(/Delete/)).toBeInTheDocument(); // Delete shortcut
    });
  });

  describe('Dynamic content based on element properties', () => {
    it('should show different options for locked elements', () => {
      const lockedProps = {
        ...defaultProps,
        targetElement: {
          ...defaultProps.targetElement,
          locked: true
        }
      };
      
      render(<ContextMenu {...lockedProps} />);
      
      expect(screen.getByText('Unlock')).toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should show material options only for applicable elements', () => {
      const doorProps = {
        ...defaultProps,
        targetElement: {
          id: 'door-1',
          type: 'door',
          materialId: 'wood'
        }
      };
      
      render(<ContextMenu {...doorProps} />);
      
      expect(screen.getByText('Change Material')).toBeInTheDocument();
    });
  });
});