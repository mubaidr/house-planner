import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ElementsSidebar } from '@/components/Sidebar/ElementsSidebar';

// Mock the stores
const mockDesignStore = {
  walls: [
    { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 8, height: 240 },
    { id: 'wall-2', startX: 100, startY: 0, endX: 100, endY: 100, thickness: 8, height: 240 }
  ],
  doors: [
    { id: 'door-1', x: 50, y: 0, width: 80, height: 200, wallId: 'wall-1' }
  ],
  windows: [
    { id: 'window-1', x: 150, y: 0, width: 60, height: 120, wallId: 'wall-2' }
  ],
  rooms: [
    { id: 'room-1', name: 'Living Room', area: 300, vertices: [] }
  ],
  selectedElements: [],
  selectElement: jest.fn(),
  deselectElement: jest.fn(),
  selectMultiple: jest.fn(),
  deleteElement: jest.fn(),
  duplicateElement: jest.fn(),
  updateElement: jest.fn(),
  groupElements: jest.fn(),
  ungroupElements: jest.fn(),
};

const mockUIStore = {
  activeTool: 'select',
  sidebarCollapsed: false,
  showElementList: true,
  elementFilter: 'all',
  elementSort: 'name',
  setActiveTool: jest.fn(),
  toggleSidebar: jest.fn(),
  setElementFilter: jest.fn(),
  setElementSort: jest.fn(),
};

const mockAccessibilityStore = {
  enableAlternativeElementList: false,
  announceChanges: true,
};

jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => mockDesignStore,
}));

jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => mockUIStore,
}));

jest.mock('@/stores/accessibilityStore', () => ({
  useAccessibilityStore: () => mockAccessibilityStore,
}));

describe('ElementsSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDesignStore.selectedElements = [];
    mockUIStore.elementFilter = 'all';
    mockUIStore.elementSort = 'name';
  });

  it('should render without crashing', () => {
    render(<ElementsSidebar />);
    
    expect(screen.getByText(/elements/i)).toBeInTheDocument();
  });

  it('should not render when sidebar is collapsed', () => {
    mockUIStore.sidebarCollapsed = true;
    render(<ElementsSidebar />);
    
    // Should render in collapsed state or not render content
    expect(screen.queryByText('Living Room')).not.toBeInTheDocument();
  });

  describe('Element List Display', () => {
    it('should display all elements', () => {
      render(<ElementsSidebar />);
      
      expect(screen.getByText(/wall-1|Wall 1/i)).toBeInTheDocument();
      expect(screen.getByText(/wall-2|Wall 2/i)).toBeInTheDocument();
      expect(screen.getByText(/door-1|Door 1/i)).toBeInTheDocument();
      expect(screen.getByText(/window-1|Window 1/i)).toBeInTheDocument();
      expect(screen.getByText('Living Room')).toBeInTheDocument();
    });

    it('should group elements by type', () => {
      render(<ElementsSidebar />);
      
      expect(screen.getByText('Walls')).toBeInTheDocument();
      expect(screen.getByText('Doors')).toBeInTheDocument();
      expect(screen.getByText('Windows')).toBeInTheDocument();
      expect(screen.getByText('Rooms')).toBeInTheDocument();
    });

    it('should show element counts', () => {
      render(<ElementsSidebar />);
      
      expect(screen.getByText(/2.*walls?/i)).toBeInTheDocument();
      expect(screen.getByText(/1.*doors?/i)).toBeInTheDocument();
      expect(screen.getByText(/1.*windows?/i)).toBeInTheDocument();
      expect(screen.getByText(/1.*rooms?/i)).toBeInTheDocument();
    });

    it('should display element properties', () => {
      render(<ElementsSidebar />);
      
      // Wall properties
      expect(screen.getByText(/8.*thick|thickness.*8/i)).toBeInTheDocument();
      expect(screen.getByText(/240.*high|height.*240/i)).toBeInTheDocument();
      
      // Door properties
      expect(screen.getByText(/80.*wide|width.*80/i)).toBeInTheDocument();
      expect(screen.getByText(/200.*high|height.*200/i)).toBeInTheDocument();
      
      // Room properties
      expect(screen.getByText(/300.*area|area.*300/i)).toBeInTheDocument();
    });
  });

  describe('Element Filtering', () => {
    it('should display filter options', () => {
      render(<ElementsSidebar />);
      
      expect(screen.getByLabelText(/filter|show/i)).toBeInTheDocument();
    });

    it('should filter by element type', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const filterSelect = screen.getByLabelText(/filter/i);
      await user.selectOptions(filterSelect, 'walls');
      
      expect(mockUIStore.setElementFilter).toHaveBeenCalledWith('walls');
    });

    it('should show only filtered elements', () => {
      mockUIStore.elementFilter = 'walls';
      render(<ElementsSidebar />);
      
      expect(screen.getByText(/wall-1|Wall 1/i)).toBeInTheDocument();
      expect(screen.getByText(/wall-2|Wall 2/i)).toBeInTheDocument();
      expect(screen.queryByText(/door-1|Door 1/i)).not.toBeInTheDocument();
    });

    it('should filter by selection status', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const filterSelect = screen.getByLabelText(/filter/i);
      await user.selectOptions(filterSelect, 'selected');
      
      expect(mockUIStore.setElementFilter).toHaveBeenCalledWith('selected');
    });

    it('should show search/filter input', () => {
      render(<ElementsSidebar />);
      
      expect(screen.getByPlaceholderText(/search.*elements/i)).toBeInTheDocument();
    });

    it('should filter elements by search text', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const searchInput = screen.getByPlaceholderText(/search.*elements/i);
      await user.type(searchInput, 'Living');
      
      // Should show only matching elements
      expect(screen.getByText('Living Room')).toBeInTheDocument();
      expect(screen.queryByText(/wall-1/i)).not.toBeInTheDocument();
    });
  });

  describe('Element Sorting', () => {
    it('should display sort options', () => {
      render(<ElementsSidebar />);
      
      expect(screen.getByLabelText(/sort/i)).toBeInTheDocument();
    });

    it('should sort by name', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const sortSelect = screen.getByLabelText(/sort/i);
      await user.selectOptions(sortSelect, 'name');
      
      expect(mockUIStore.setElementSort).toHaveBeenCalledWith('name');
    });

    it('should sort by type', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const sortSelect = screen.getByLabelText(/sort/i);
      await user.selectOptions(sortSelect, 'type');
      
      expect(mockUIStore.setElementSort).toHaveBeenCalledWith('type');
    });

    it('should sort by creation date', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const sortSelect = screen.getByLabelText(/sort/i);
      await user.selectOptions(sortSelect, 'created');
      
      expect(mockUIStore.setElementSort).toHaveBeenCalledWith('created');
    });
  });

  describe('Element Selection', () => {
    it('should select element when clicked', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      await user.click(wallElement);
      
      expect(mockDesignStore.selectElement).toHaveBeenCalledWith('wall-1');
    });

    it('should show selected elements with different styling', () => {
      mockDesignStore.selectedElements = ['wall-1'];
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i).closest('div');
      expect(wallElement).toHaveClass('bg-blue-50', 'border-blue-200');
    });

    it('should support multi-selection with Ctrl+click', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      await user.click(wallElement, { ctrlKey: true });
      
      expect(mockDesignStore.selectMultiple).toHaveBeenCalledWith(['wall-1']);
    });

    it('should deselect element when clicked again', async () => {
      const user = userEvent.setup();
      mockDesignStore.selectedElements = ['wall-1'];
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      await user.click(wallElement);
      
      expect(mockDesignStore.deselectElement).toHaveBeenCalledWith('wall-1');
    });
  });

  describe('Element Actions', () => {
    it('should show context menu on right-click', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      await user.pointer({ keys: '[MouseRight]', target: wallElement });
      
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should edit element when edit action is clicked', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      await user.pointer({ keys: '[MouseRight]', target: wallElement });
      
      const editButton = screen.getByText('Edit');
      await user.click(editButton);
      
      expect(mockUIStore.setActiveTool).toHaveBeenCalledWith('edit');
    });

    it('should duplicate element when duplicate action is clicked', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      await user.pointer({ keys: '[MouseRight]', target: wallElement });
      
      const duplicateButton = screen.getByText('Duplicate');
      await user.click(duplicateButton);
      
      expect(mockDesignStore.duplicateElement).toHaveBeenCalledWith('wall-1');
    });

    it('should delete element when delete action is clicked', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      await user.pointer({ keys: '[MouseRight]', target: wallElement });
      
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);
      
      expect(mockDesignStore.deleteElement).toHaveBeenCalledWith('wall-1');
    });

    it('should show group actions for multiple selected elements', () => {
      mockDesignStore.selectedElements = ['wall-1', 'wall-2'];
      render(<ElementsSidebar />);
      
      expect(screen.getByRole('button', { name: /group/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete.*selected/i })).toBeInTheDocument();
    });

    it('should group selected elements', async () => {
      const user = userEvent.setup();
      mockDesignStore.selectedElements = ['wall-1', 'wall-2'];
      render(<ElementsSidebar />);
      
      const groupButton = screen.getByRole('button', { name: /group/i });
      await user.click(groupButton);
      
      expect(mockDesignStore.groupElements).toHaveBeenCalledWith(['wall-1', 'wall-2']);
    });
  });

  describe('Element Visibility', () => {
    it('should show visibility toggle for each element', () => {
      render(<ElementsSidebar />);
      
      const visibilityButtons = screen.getAllByRole('button', { name: /hide|show|visibility/i });
      expect(visibilityButtons.length).toBeGreaterThan(0);
    });

    it('should toggle element visibility', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const visibilityButton = screen.getAllByRole('button', { name: /hide|show/i })[0];
      await user.click(visibilityButton);
      
      expect(mockDesignStore.updateElement).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ visible: false })
      );
    });

    it('should show hidden elements with different styling', () => {
      mockDesignStore.walls[0].visible = false;
      render(<ElementsSidebar />);
      
      const hiddenElement = screen.getByText(/wall-1|Wall 1/i).closest('div');
      expect(hiddenElement).toHaveClass('opacity-50');
    });
  });

  describe('Element Locking', () => {
    it('should show lock toggle for each element', () => {
      render(<ElementsSidebar />);
      
      const lockButtons = screen.getAllByRole('button', { name: /lock|unlock/i });
      expect(lockButtons.length).toBeGreaterThan(0);
    });

    it('should toggle element lock', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const lockButton = screen.getAllByRole('button', { name: /lock|unlock/i })[0];
      await user.click(lockButton);
      
      expect(mockDesignStore.updateElement).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ locked: true })
      );
    });

    it('should show locked elements with different styling', () => {
      mockDesignStore.walls[0].locked = true;
      render(<ElementsSidebar />);
      
      const lockedElement = screen.getByText(/wall-1|Wall 1/i).closest('div');
      expect(lockedElement).toHaveClass('border-gray-400');
    });
  });

  describe('Drag and Drop', () => {
    it('should support dragging elements to reorder', async () => {
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      expect(wallElement).toHaveAttribute('draggable', 'true');
    });

    it('should handle drag start', async () => {
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      fireEvent.dragStart(wallElement, {
        dataTransfer: {
          setData: jest.fn(),
          effectAllowed: 'move'
        }
      });
      
      // Should set drag data
      expect(wallElement.closest('div')).toHaveClass('dragging');
    });

    it('should handle drop to reorder elements', async () => {
      render(<ElementsSidebar />);
      
      const wall1Element = screen.getByText(/wall-1|Wall 1/i);
      const wall2Element = screen.getByText(/wall-2|Wall 2/i);
      
      fireEvent.dragStart(wall1Element);
      fireEvent.dragOver(wall2Element);
      fireEvent.drop(wall2Element);
      
      // Should reorder elements (implementation specific)
      expect(mockDesignStore.updateElement).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support arrow key navigation', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const firstElement = screen.getByText(/wall-1|Wall 1/i);
      firstElement.focus();
      
      await user.keyboard('{ArrowDown}');
      
      const secondElement = screen.getByText(/wall-2|Wall 2/i);
      expect(secondElement).toHaveFocus();
    });

    it('should select element with Enter key', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      wallElement.focus();
      
      await user.keyboard('{Enter}');
      
      expect(mockDesignStore.selectElement).toHaveBeenCalledWith('wall-1');
    });

    it('should delete element with Delete key', async () => {
      const user = userEvent.setup();
      mockDesignStore.selectedElements = ['wall-1'];
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      wallElement.focus();
      
      await user.keyboard('{Delete}');
      
      expect(mockDesignStore.deleteElement).toHaveBeenCalledWith('wall-1');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ElementsSidebar />);
      
      const elementList = screen.getByRole('list');
      expect(elementList).toHaveAttribute('aria-label', 'Design elements');
      
      const elementItems = screen.getAllByRole('listitem');
      elementItems.forEach(item => {
        expect(item).toHaveAttribute('aria-describedby');
      });
    });

    it('should announce element selection', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      await user.click(wallElement);
      
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toHaveTextContent(/wall.*selected/i);
    });

    it('should support screen reader navigation', () => {
      mockAccessibilityStore.enableAlternativeElementList = true;
      render(<ElementsSidebar />);
      
      // Should provide alternative navigation structure
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have accessible element descriptions', () => {
      render(<ElementsSidebar />);
      
      const wallElement = screen.getByText(/wall-1|Wall 1/i);
      expect(wallElement).toHaveAttribute('aria-describedby');
      
      const description = document.getElementById(wallElement.getAttribute('aria-describedby')!);
      expect(description).toHaveTextContent(/wall.*8.*thick.*240.*high/i);
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of elements efficiently', () => {
      // Create many elements
      const manyWalls = Array.from({ length: 1000 }, (_, i) => ({
        id: `wall-${i}`,
        startX: i * 10,
        startY: 0,
        endX: i * 10 + 10,
        endY: 100,
        thickness: 8,
        height: 240
      }));
      
      mockDesignStore.walls = manyWalls;
      
      const startTime = performance.now();
      render(<ElementsSidebar />);
      const endTime = performance.now();
      
      // Should render efficiently
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should virtualize long lists', () => {
      const manyWalls = Array.from({ length: 1000 }, (_, i) => ({
        id: `wall-${i}`,
        startX: i * 10,
        startY: 0,
        endX: i * 10 + 10,
        endY: 100,
        thickness: 8,
        height: 240
      }));
      
      mockDesignStore.walls = manyWalls;
      render(<ElementsSidebar />);
      
      // Should not render all 1000 elements in DOM
      const renderedElements = screen.getAllByRole('listitem');
      expect(renderedElements.length).toBeLessThan(100);
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no elements exist', () => {
      mockDesignStore.walls = [];
      mockDesignStore.doors = [];
      mockDesignStore.windows = [];
      mockDesignStore.rooms = [];
      
      render(<ElementsSidebar />);
      
      expect(screen.getByText(/no.*elements|empty.*design/i)).toBeInTheDocument();
      expect(screen.getByText(/start.*creating|add.*elements/i)).toBeInTheDocument();
    });

    it('should show filtered empty state', () => {
      mockUIStore.elementFilter = 'doors';
      mockDesignStore.doors = [];
      
      render(<ElementsSidebar />);
      
      expect(screen.getByText(/no.*doors.*found/i)).toBeInTheDocument();
    });

    it('should show search empty state', async () => {
      const user = userEvent.setup();
      render(<ElementsSidebar />);
      
      const searchInput = screen.getByPlaceholderText(/search.*elements/i);
      await user.type(searchInput, 'nonexistent');
      
      expect(screen.getByText(/no.*elements.*match/i)).toBeInTheDocument();
    });
  });
});