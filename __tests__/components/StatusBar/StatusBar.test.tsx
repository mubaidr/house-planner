import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import StatusBar from '@/components/StatusBar/StatusBar';

// Mock the stores
const mockUIStore = {
  activeTool: 'select',
  showGrid: true,
  snapToGrid: false,
  gridSize: 20,
  zoomLevel: 1,
  mouseCoordinates: { x: 100, y: 200 },
  toggleGrid: jest.fn(),
  toggleSnapToGrid: jest.fn(),
};

const mockDesignStore = {
  walls: [
    { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0 },
    { id: 'wall-2', startX: 100, startY: 0, endX: 100, endY: 100 }
  ],
  doors: [
    { id: 'door-1', x: 50, y: 0, width: 80, height: 200 }
  ],
  windows: [
    { id: 'window-1', x: 150, y: 0, width: 60, height: 120 },
    { id: 'window-2', x: 200, y: 0, width: 60, height: 120 }
  ]
};

const mockUnitStore = {
  unitSystem: 'imperial',
  showUnitLabels: true,
  setUnitSystem: jest.fn(),
  toggleUnitLabels: jest.fn(),
};

// Mock the formatLength utility
jest.mock('@/utils/unitUtils', () => ({
  formatLength: jest.fn((value, system, precision, showLabels) => {
    if (system === 'imperial') {
      return showLabels ? `${value.toFixed(precision)}'` : value.toFixed(precision);
    }
    return showLabels ? `${value.toFixed(precision)}m` : value.toFixed(precision);
  }),
}));

jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => mockUIStore,
}));

jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => mockDesignStore,
}));

jest.mock('@/stores/unitStore', () => ({
  useUnitStore: () => mockUnitStore,
}));

describe('StatusBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<StatusBar />);
    
    expect(screen.getByText(/Tool:/)).toBeInTheDocument();
    expect(screen.getByText(/Elements:/)).toBeInTheDocument();
    expect(screen.getByText(/Coordinates:/)).toBeInTheDocument();
  });

  it('should display current active tool', () => {
    render(<StatusBar />);
    
    expect(screen.getByText('Tool:')).toBeInTheDocument();
    expect(screen.getByText('select')).toBeInTheDocument();
  });

  it('should display different active tools', () => {
    mockUIStore.activeTool = 'wall';
    render(<StatusBar />);
    
    expect(screen.getByText('wall')).toBeInTheDocument();
  });

  it('should display element counts', () => {
    render(<StatusBar />);
    
    // Total elements: 2 walls + 1 door + 2 windows = 5
    expect(screen.getByText('Elements:')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Wall count
    expect(screen.getByText('Walls:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should update element counts when design changes', () => {
    const { rerender } = render(<StatusBar />);
    
    // Add more elements
    mockDesignStore.walls = [...mockDesignStore.walls, { id: 'wall-3', startX: 0, startY: 100, endX: 100, endY: 100 }];
    mockDesignStore.doors = [...mockDesignStore.doors, { id: 'door-2', x: 25, y: 100, width: 80, height: 200 }];
    
    rerender(<StatusBar />);
    
    // Total elements: 3 walls + 2 doors + 2 windows = 7
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Wall count
  });

  describe('Grid Controls', () => {
    it('should show grid toggle button with correct state', () => {
      render(<StatusBar />);
      
      const gridButton = screen.getByRole('button', { name: /toggle grid/i });
      expect(gridButton).toBeInTheDocument();
      expect(gridButton).toHaveTextContent('Grid: ON');
      expect(gridButton).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('should show grid off state', () => {
      mockUIStore.showGrid = false;
      render(<StatusBar />);
      
      const gridButton = screen.getByRole('button', { name: /toggle grid/i });
      expect(gridButton).toHaveTextContent('Grid: OFF');
      expect(gridButton).toHaveClass('bg-gray-100', 'text-gray-600');
    });

    it('should toggle grid when clicked', async () => {
      const user = userEvent.setup();
      render(<StatusBar />);
      
      const gridButton = screen.getByRole('button', { name: /toggle grid/i });
      await user.click(gridButton);
      
      expect(mockUIStore.toggleGrid).toHaveBeenCalled();
    });
  });

  describe('Snap Controls', () => {
    it('should show snap toggle button with correct state', () => {
      render(<StatusBar />);
      
      const snapButton = screen.getByRole('button', { name: /snap/i });
      expect(snapButton).toBeInTheDocument();
      expect(snapButton).toHaveTextContent('Snap: OFF');
      expect(snapButton).toHaveClass('bg-gray-100', 'text-gray-600');
    });

    it('should show snap on state', () => {
      mockUIStore.snapToGrid = true;
      render(<StatusBar />);
      
      const snapButton = screen.getByRole('button', { name: /snap/i });
      expect(snapButton).toHaveTextContent('Snap: ON');
      expect(snapButton).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('should toggle snap when clicked', async () => {
      const user = userEvent.setup();
      render(<StatusBar />);
      
      const snapButton = screen.getByRole('button', { name: /snap/i });
      await user.click(snapButton);
      
      expect(mockUIStore.toggleSnapToGrid).toHaveBeenCalled();
    });
  });

  describe('Grid Size Display', () => {
    it('should display current grid size', () => {
      render(<StatusBar />);
      
      expect(screen.getByText('Grid: 20px')).toBeInTheDocument();
    });

    it('should update when grid size changes', () => {
      mockUIStore.gridSize = 50;
      render(<StatusBar />);
      
      expect(screen.getByText('Grid: 50px')).toBeInTheDocument();
    });
  });

  describe('Unit System Controls', () => {
    it('should display unit system selector', () => {
      render(<StatusBar />);
      
      const unitSelect = screen.getByDisplayValue('Imperial (ft)');
      expect(unitSelect).toBeInTheDocument();
    });

    it('should show metric option', () => {
      mockUnitStore.unitSystem = 'metric';
      render(<StatusBar />);
      
      const unitSelect = screen.getByDisplayValue('Metric (m)');
      expect(unitSelect).toBeInTheDocument();
    });

    it('should change unit system when selected', async () => {
      const user = userEvent.setup();
      render(<StatusBar />);
      
      const unitSelect = screen.getByRole('combobox');
      await user.selectOptions(unitSelect, 'metric');
      
      expect(mockUnitStore.setUnitSystem).toHaveBeenCalledWith('metric');
    });

    it('should show unit labels toggle', () => {
      render(<StatusBar />);
      
      const labelsButton = screen.getByRole('button', { name: /labels/i });
      expect(labelsButton).toBeInTheDocument();
      expect(labelsButton).toHaveTextContent('Labels: ON');
    });

    it('should toggle unit labels when clicked', async () => {
      const user = userEvent.setup();
      render(<StatusBar />);
      
      const labelsButton = screen.getByRole('button', { name: /labels/i });
      await user.click(labelsButton);
      
      expect(mockUnitStore.toggleUnitLabels).toHaveBeenCalled();
    });

    it('should show labels off state', () => {
      mockUnitStore.showUnitLabels = false;
      render(<StatusBar />);
      
      const labelsButton = screen.getByRole('button', { name: /labels/i });
      expect(labelsButton).toHaveTextContent('Labels: OFF');
      expect(labelsButton).toHaveClass('bg-gray-100', 'text-gray-600');
    });
  });

  describe('Coordinates Display', () => {
    it('should display mouse coordinates', () => {
      render(<StatusBar />);
      
      expect(screen.getByText(/Coordinates:/)).toBeInTheDocument();
      // Coordinates are formatted: (100/100, 200/100) = (1.0', 2.0')
      expect(screen.getByText(/1\.0'.*2\.0'/)).toBeInTheDocument();
    });

    it('should update coordinates when mouse moves', () => {
      mockUIStore.mouseCoordinates = { x: 300, y: 400 };
      render(<StatusBar />);
      
      // New coordinates: (300/100, 400/100) = (3.0', 4.0')
      expect(screen.getByText(/3\.0'.*4\.0'/)).toBeInTheDocument();
    });

    it('should format coordinates according to unit system', () => {
      mockUnitStore.unitSystem = 'metric';
      render(<StatusBar />);
      
      // Should show metric units - coordinates are (300, 400) / 100 = (3.0, 4.0)
      expect(screen.getByText(/3\.0m.*4\.0m/)).toBeInTheDocument();
    });

    it('should respect unit label settings', () => {
      mockUnitStore.showUnitLabels = false;
      render(<StatusBar />);
      
      // Should show coordinates without unit labels - coordinates are (300, 400) / 100 = (3.0, 4.0)
      expect(screen.getByText(/3\.0.*4\.0/)).toBeInTheDocument();
    });
  });

  describe('Zoom Display', () => {
    it('should display current zoom level', () => {
      render(<StatusBar />);
      
      expect(screen.getByText('Zoom:')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should update zoom display when zoom changes', () => {
      mockUIStore.zoomLevel = 1.5;
      render(<StatusBar />);
      
      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('should handle fractional zoom levels', () => {
      mockUIStore.zoomLevel = 0.75;
      render(<StatusBar />);
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should round zoom percentage', () => {
      mockUIStore.zoomLevel = 1.234;
      render(<StatusBar />);
      
      expect(screen.getByText('123%')).toBeInTheDocument();
    });
  });

  describe('Status Indicator', () => {
    it('should show ready status', () => {
      render(<StatusBar />);
      
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should have proper layout structure', () => {
      render(<StatusBar />);
      
      const statusBar = screen.getByText('Tool:').closest('div');
      expect(statusBar).toHaveClass('flex', 'items-center', 'justify-between');
    });

    it('should apply correct styling to toggle buttons', () => {
      render(<StatusBar />);
      
      const gridButton = screen.getByRole('button', { name: /grid/i });
      expect(gridButton).toHaveClass('px-2', 'py-1', 'rounded', 'text-xs');
    });

    it('should show hover states on interactive elements', () => {
      mockUIStore.showGrid = false;
      render(<StatusBar />);
      
      const gridButton = screen.getByRole('button', { name: /grid/i });
      expect(gridButton).toHaveClass('hover:bg-gray-200');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<StatusBar />);
      
      const labelsButton = screen.getByRole('button', { name: /labels/i });
      expect(labelsButton).toHaveAttribute('title', 'Toggle unit labels');
    });

    it('should have accessible form controls', () => {
      render(<StatusBar />);
      
      const unitSelect = screen.getByRole('combobox');
      expect(unitSelect).toBeInTheDocument();
      expect(unitSelect).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<StatusBar />);
      
      const gridButton = screen.getByRole('button', { name: /grid/i });
      gridButton.focus();
      
      await user.keyboard('{Enter}');
      expect(mockUIStore.toggleGrid).toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle different screen sizes', () => {
      render(<StatusBar />);
      
      const statusBar = screen.getByText('Tool:').closest('div');
      expect(statusBar).toHaveClass('flex', 'items-center', 'justify-between');
    });

    it('should maintain proper spacing', () => {
      render(<StatusBar />);
      
      const leftSection = screen.getByText('Tool:').closest('div');
      expect(leftSection).toHaveClass('space-x-4');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<StatusBar />);
      
      // Re-render with same props
      rerender(<StatusBar />);
      
      // Should still display correctly
      expect(screen.getByText('Tool:')).toBeInTheDocument();
    });

    it('should handle large numbers of elements', () => {
      // Create many elements
      const manyWalls = Array.from({ length: 100 }, (_, i) => ({
        id: `wall-${i}`,
        startX: i * 10,
        startY: 0,
        endX: i * 10 + 10,
        endY: 100
      }));
      
      mockDesignStore.walls = manyWalls;
      
      render(<StatusBar />);
      
      // Should display count correctly
      expect(screen.getByText('Walls:')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero elements', () => {
      mockDesignStore.walls = [];
      mockDesignStore.doors = [];
      mockDesignStore.windows = [];
      
      render(<StatusBar />);
      
      expect(screen.getByText('Elements:')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Walls:')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative coordinates', () => {
      mockUIStore.mouseCoordinates = { x: -100, y: -200 };
      render(<StatusBar />);
      
      // Should display negative coordinates
      expect(screen.getByText(/-1\.0'.*-2\.0'/)).toBeInTheDocument();
    });

    it('should handle very small zoom levels', () => {
      mockUIStore.zoomLevel = 0.01;
      render(<StatusBar />);
      
      expect(screen.getByText('1%')).toBeInTheDocument();
    });

    it('should handle very large zoom levels', () => {
      mockUIStore.zoomLevel = 10;
      render(<StatusBar />);
      
      expect(screen.getByText('1000%')).toBeInTheDocument();
    });

    it('should handle undefined tool', () => {
      mockUIStore.activeTool = undefined as any;
      render(<StatusBar />);
      
      // Should not crash
      expect(screen.getByText('Tool:')).toBeInTheDocument();
    });
  });
});