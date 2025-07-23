import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import FloorSwitcher from '@/components/Floor/FloorSwitcher';

// Mock the floor store
const mockFloorStore = {
  floors: [
    {
      id: 'floor-1',
      name: 'Ground Floor',
      level: 0,
      height: 240,
      visible: true,
      elements: { walls: [], doors: [], windows: [] }
    },
    {
      id: 'floor-2',
      name: 'First Floor',
      level: 1,
      height: 240,
      visible: true,
      elements: { walls: [], doors: [], windows: [] }
    },
    {
      id: 'floor-3',
      name: 'Second Floor',
      level: 2,
      height: 240,
      visible: false,
      elements: { walls: [], doors: [], windows: [] }
    }
  ],
  currentFloorId: 'floor-1',
  showAllFloors: false,
  floorOpacity: 0.5,
  setCurrentFloor: jest.fn(),
  addFloor: jest.fn(),
  removeFloor: jest.fn(),
  duplicateFloor: jest.fn(),
  toggleFloorVisibility: jest.fn(),
  setShowAllFloors: jest.fn(),
  setFloorOpacity: jest.fn(),
  getFloorsOrderedByLevel: jest.fn(() => [
    mockFloorStore.floors[0],
    mockFloorStore.floors[1],
    mockFloorStore.floors[2]
  ]),
  getTotalFloors: jest.fn(() => 3),
};

jest.mock('@/stores/floorStore', () => ({
  useFloorStore: () => mockFloorStore,
}));

describe('FloorSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFloorStore.currentFloorId = 'floor-1';
    mockFloorStore.showAllFloors = false;
    mockFloorStore.floorOpacity = 0.5;
  });

  it('should render without crashing', () => {
    render(<FloorSwitcher />);
    
    expect(screen.getByText('Ground Floor')).toBeInTheDocument();
  });

  it('should display current floor', () => {
    render(<FloorSwitcher />);
    
    expect(screen.getByText('Ground Floor')).toBeInTheDocument();
    expect(screen.getByText(/current.*floor|active.*floor/i)).toBeInTheDocument();
  });

  it('should display floor count', () => {
    render(<FloorSwitcher />);
    
    expect(screen.getByText(/3.*floors?/i)).toBeInTheDocument();
  });

  describe('Floor Switching', () => {
    it('should expand floor list when clicked', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      expect(screen.getByText('First Floor')).toBeInTheDocument();
      expect(screen.getByText('Second Floor')).toBeInTheDocument();
    });

    it('should switch to different floor when clicked', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      // Expand floor list
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      // Click on different floor
      const firstFloor = screen.getByText('First Floor');
      await user.click(firstFloor);
      
      expect(mockFloorStore.setCurrentFloor).toHaveBeenCalledWith('floor-2');
    });

    it('should show current floor as selected', () => {
      render(<FloorSwitcher />);
      
      const currentFloorIndicator = screen.getByText('Ground Floor').closest('div');
      expect(currentFloorIndicator).toHaveClass('bg-blue-50', 'border-blue-200');
    });

    it('should display floor levels', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      expect(screen.getByText(/level.*0|ground.*level/i)).toBeInTheDocument();
      expect(screen.getByText(/level.*1|first.*level/i)).toBeInTheDocument();
      expect(screen.getByText(/level.*2|second.*level/i)).toBeInTheDocument();
    });
  });

  describe('Floor Management', () => {
    it('should show add floor button', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      expect(screen.getByRole('button', { name: /add.*floor|new.*floor/i })).toBeInTheDocument();
    });

    it('should show add floor form when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const addButton = screen.getByRole('button', { name: /add.*floor/i });
      await user.click(addButton);
      
      expect(screen.getByPlaceholderText(/floor.*name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create|save/i })).toBeInTheDocument();
    });

    it('should create new floor with entered name', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const addButton = screen.getByRole('button', { name: /add.*floor/i });
      await user.click(addButton);
      
      const nameInput = screen.getByPlaceholderText(/floor.*name/i);
      await user.type(nameInput, 'Basement');
      
      const createButton = screen.getByRole('button', { name: /create|save/i });
      await user.click(createButton);
      
      expect(mockFloorStore.addFloor).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Basement' })
      );
    });

    it('should validate floor name input', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const addButton = screen.getByRole('button', { name: /add.*floor/i });
      await user.click(addButton);
      
      const createButton = screen.getByRole('button', { name: /create|save/i });
      await user.click(createButton);
      
      expect(screen.getByText(/name.*required|enter.*name/i)).toBeInTheDocument();
    });

    it('should cancel floor creation', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const addButton = screen.getByRole('button', { name: /add.*floor/i });
      await user.click(addButton);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(screen.queryByPlaceholderText(/floor.*name/i)).not.toBeInTheDocument();
    });
  });

  describe('Floor Options', () => {
    it('should show floor options menu', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const optionsButton = screen.getAllByRole('button', { name: /options|menu/i })[0];
      await user.click(optionsButton);
      
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Rename')).toBeInTheDocument();
    });

    it('should duplicate floor', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const optionsButton = screen.getAllByRole('button', { name: /options|menu/i })[0];
      await user.click(optionsButton);
      
      const duplicateButton = screen.getByText('Duplicate');
      await user.click(duplicateButton);
      
      expect(mockFloorStore.duplicateFloor).toHaveBeenCalledWith('floor-1');
    });

    it('should delete floor with confirmation', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const optionsButton = screen.getAllByRole('button', { name: /options|menu/i })[1]; // Second floor
      await user.click(optionsButton);
      
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);
      
      expect(screen.getByText(/confirm.*delete|are.*you.*sure/i)).toBeInTheDocument();
      
      const confirmButton = screen.getByRole('button', { name: /confirm|yes|delete/i });
      await user.click(confirmButton);
      
      expect(mockFloorStore.removeFloor).toHaveBeenCalledWith('floor-2');
    });

    it('should not delete current floor', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const optionsButton = screen.getAllByRole('button', { name: /options|menu/i })[0]; // Current floor
      await user.click(optionsButton);
      
      const deleteButton = screen.getByText('Delete');
      expect(deleteButton).toBeDisabled();
    });

    it('should rename floor', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const optionsButton = screen.getAllByRole('button', { name: /options|menu/i })[0];
      await user.click(optionsButton);
      
      const renameButton = screen.getByText('Rename');
      await user.click(renameButton);
      
      const nameInput = screen.getByDisplayValue('Ground Floor');
      await user.clear(nameInput);
      await user.type(nameInput, 'Main Floor');
      
      const saveButton = screen.getByRole('button', { name: /save|confirm/i });
      await user.click(saveButton);
      
      expect(mockFloorStore.updateFloor).toHaveBeenCalledWith(
        'floor-1',
        expect.objectContaining({ name: 'Main Floor' })
      );
    });
  });

  describe('Floor Visibility', () => {
    it('should show visibility toggle for each floor', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const visibilityButtons = screen.getAllByRole('button', { name: /hide|show|visibility/i });
      expect(visibilityButtons.length).toBeGreaterThan(0);
    });

    it('should toggle floor visibility', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const visibilityButton = screen.getAllByRole('button', { name: /hide|show/i })[1];
      await user.click(visibilityButton);
      
      expect(mockFloorStore.toggleFloorVisibility).toHaveBeenCalledWith('floor-2');
    });

    it('should show hidden floors with different styling', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const hiddenFloor = screen.getByText('Second Floor').closest('div');
      expect(hiddenFloor).toHaveClass('opacity-50');
    });

    it('should show all floors toggle', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      expect(screen.getByLabelText(/show.*all.*floors/i)).toBeInTheDocument();
    });

    it('should toggle show all floors', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const showAllToggle = screen.getByLabelText(/show.*all.*floors/i);
      await user.click(showAllToggle);
      
      expect(mockFloorStore.setShowAllFloors).toHaveBeenCalledWith(true);
    });
  });

  describe('Floor Opacity', () => {
    it('should show opacity slider', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      expect(screen.getByLabelText(/opacity/i)).toBeInTheDocument();
    });

    it('should adjust floor opacity', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const opacitySlider = screen.getByLabelText(/opacity/i);
      fireEvent.change(opacitySlider, { target: { value: '0.8' } });
      
      expect(mockFloorStore.setFloorOpacity).toHaveBeenCalledWith(0.8);
    });

    it('should display current opacity value', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Floor Navigation', () => {
    it('should show floor navigation buttons', () => {
      render(<FloorSwitcher />);
      
      expect(screen.getByRole('button', { name: /previous.*floor|up.*floor/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next.*floor|down.*floor/i })).toBeInTheDocument();
    });

    it('should navigate to previous floor', async () => {
      const user = userEvent.setup();
      mockFloorStore.currentFloorId = 'floor-2'; // Start on first floor
      render(<FloorSwitcher />);
      
      const prevButton = screen.getByRole('button', { name: /previous.*floor|up.*floor/i });
      await user.click(prevButton);
      
      expect(mockFloorStore.setCurrentFloor).toHaveBeenCalledWith('floor-3');
    });

    it('should navigate to next floor', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const nextButton = screen.getByRole('button', { name: /next.*floor|down.*floor/i });
      await user.click(nextButton);
      
      expect(mockFloorStore.setCurrentFloor).toHaveBeenCalledWith('floor-2');
    });

    it('should disable navigation at boundaries', () => {
      mockFloorStore.currentFloorId = 'floor-3'; // Top floor
      render(<FloorSwitcher />);
      
      const prevButton = screen.getByRole('button', { name: /previous.*floor|up.*floor/i });
      expect(prevButton).toBeDisabled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support arrow key navigation', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const component = screen.getByText('Ground Floor').closest('div');
      component!.focus();
      
      await user.keyboard('{ArrowUp}');
      expect(mockFloorStore.setCurrentFloor).toHaveBeenCalledWith('floor-2');
    });

    it('should support page up/down for floor navigation', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const component = screen.getByText('Ground Floor').closest('div');
      component!.focus();
      
      await user.keyboard('{PageDown}');
      expect(mockFloorStore.setCurrentFloor).toHaveBeenCalledWith('floor-2');
    });

    it('should expand with Enter key', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      expandButton.focus();
      
      await user.keyboard('{Enter}');
      
      expect(screen.getByText('First Floor')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<FloorSwitcher />);
      
      const floorSwitcher = screen.getByRole('region');
      expect(floorSwitcher).toHaveAttribute('aria-label', 'Floor navigation');
      
      const currentFloor = screen.getByText('Ground Floor');
      expect(currentFloor).toHaveAttribute('aria-current', 'true');
    });

    it('should announce floor changes', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const firstFloor = screen.getByText('First Floor');
      await user.click(firstFloor);
      
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toHaveTextContent(/switched.*to.*first.*floor/i);
    });

    it('should have accessible floor list', async () => {
      const user = userEvent.setup();
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const floorList = screen.getByRole('list');
      expect(floorList).toHaveAttribute('aria-label', 'Available floors');
      
      const floorItems = screen.getAllByRole('listitem');
      floorItems.forEach(item => {
        expect(item).toHaveAccessibleName();
      });
    });

    it('should support screen reader descriptions', () => {
      render(<FloorSwitcher />);
      
      const currentFloor = screen.getByText('Ground Floor');
      expect(currentFloor).toHaveAttribute('aria-describedby');
      
      const description = document.getElementById(currentFloor.getAttribute('aria-describedby')!);
      expect(description).toHaveTextContent(/level.*0.*current.*floor/i);
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to small screens', () => {
      // Mock small screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      render(<FloorSwitcher />);
      
      const component = screen.getByText('Ground Floor').closest('div');
      expect(component).toHaveClass('flex-col'); // Should stack vertically
    });

    it('should show compact view on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });
      
      render(<FloorSwitcher />);
      
      // Should show abbreviated floor info
      expect(screen.getByText(/GF|G/)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle many floors efficiently', () => {
      const manyFloors = Array.from({ length: 50 }, (_, i) => ({
        id: `floor-${i}`,
        name: `Floor ${i}`,
        level: i,
        height: 240,
        visible: true,
        elements: { walls: [], doors: [], windows: [] }
      }));
      
      mockFloorStore.floors = manyFloors;
      mockFloorStore.getTotalFloors = jest.fn(() => 50);
      
      render(<FloorSwitcher />);
      
      expect(screen.getByText(/50.*floors/i)).toBeInTheDocument();
    });

    it('should virtualize floor list for performance', async () => {
      const user = userEvent.setup();
      const manyFloors = Array.from({ length: 100 }, (_, i) => ({
        id: `floor-${i}`,
        name: `Floor ${i}`,
        level: i,
        height: 240,
        visible: true,
        elements: { walls: [], doors: [], windows: [] }
      }));
      
      mockFloorStore.floors = manyFloors;
      mockFloorStore.getFloorsOrderedByLevel = jest.fn(() => manyFloors);
      
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      // Should not render all 100 floors in DOM
      const renderedFloors = screen.getAllByRole('listitem');
      expect(renderedFloors.length).toBeLessThan(20);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing current floor gracefully', () => {
      mockFloorStore.currentFloorId = 'non-existent';
      render(<FloorSwitcher />);
      
      expect(screen.getByText(/no.*floor.*selected|unknown.*floor/i)).toBeInTheDocument();
    });

    it('should handle empty floors array', () => {
      mockFloorStore.floors = [];
      mockFloorStore.getTotalFloors = jest.fn(() => 0);
      
      render(<FloorSwitcher />);
      
      expect(screen.getByText(/no.*floors|create.*first.*floor/i)).toBeInTheDocument();
    });

    it('should handle floor creation errors', async () => {
      const user = userEvent.setup();
      mockFloorStore.addFloor.mockImplementation(() => {
        throw new Error('Failed to create floor');
      });
      
      render(<FloorSwitcher />);
      
      const expandButton = screen.getByRole('button', { name: /expand|floors/i });
      await user.click(expandButton);
      
      const addButton = screen.getByRole('button', { name: /add.*floor/i });
      await user.click(addButton);
      
      const nameInput = screen.getByPlaceholderText(/floor.*name/i);
      await user.type(nameInput, 'New Floor');
      
      const createButton = screen.getByRole('button', { name: /create|save/i });
      await user.click(createButton);
      
      expect(screen.getByText(/failed.*to.*create.*floor/i)).toBeInTheDocument();
    });
  });
});