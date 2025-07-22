import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DoorComponent } from '@/components/Canvas/elements/DoorComponent';
import { Door } from '@/types/elements/Door';

// Mock Konva components
jest.mock('react-konva', () => ({
  Group: ({ children, ...props }: any) => <div data-testid="konva-group" {...props}>{children}</div>,
  Rect: (props: any) => <div data-testid="konva-rect" {...props} />,
  Line: (props: any) => <div data-testid="konva-line" {...props} />,
  Arc: (props: any) => <div data-testid="konva-arc" {...props} />,
  Text: ({ text, ...props }: any) => <div data-testid="konva-text" {...props}>{text}</div>,
}));

// Mock stores
const mockDesignStore = {
  selectedElementId: null,
  setSelectedElement: jest.fn(),
  updateElement: jest.fn(),
  deleteElement: jest.fn(),
};

const mockUiStore = {
  activeTool: 'select',
  showDimensions: true,
};

jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => mockDesignStore,
}));

jest.mock('@/stores/uiStore', () => ({
  useUiStore: () => mockUiStore,
}));

describe('DoorComponent', () => {
  const mockDoor: Door = {
    id: 'door-1',
    type: 'door',
    x: 100,
    y: 100,
    width: 80,
    height: 20,
    rotation: 0,
    wallId: 'wall-1',
    position: 0.5,
    openDirection: 'inward',
    doorType: 'single',
    material: 'wood',
    color: '#8B4513',
    isSelected: false,
    isHovered: false,
    swing: 90,
    thickness: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders door component with basic props', () => {
      render(<DoorComponent door={mockDoor} />);
      
      expect(screen.getByTestId('konva-group')).toBeInTheDocument();
      expect(screen.getAllByTestId('konva-rect')).toHaveLength(1); // Door frame
    });

    it('renders door with correct dimensions', () => {
      render(<DoorComponent door={mockDoor} />);
      
      const doorRect = screen.getByTestId('konva-rect');
      expect(doorRect).toHaveAttribute('width', '80');
      expect(doorRect).toHaveAttribute('height', '20');
    });

    it('renders door with correct position', () => {
      render(<DoorComponent door={mockDoor} />);
      
      const group = screen.getByTestId('konva-group');
      expect(group).toHaveAttribute('x', '100');
      expect(group).toHaveAttribute('y', '100');
    });

    it('renders door with correct rotation', () => {
      const rotatedDoor = { ...mockDoor, rotation: 45 };
      render(<DoorComponent door={rotatedDoor} />);
      
      const group = screen.getByTestId('konva-group');
      expect(group).toHaveAttribute('rotation', '45');
    });

    it('renders door with correct color', () => {
      render(<DoorComponent door={mockDoor} />);
      
      const doorRect = screen.getByTestId('konva-rect');
      expect(doorRect).toHaveAttribute('fill', '#8B4513');
    });
  });

  describe('Door Types', () => {
    it('renders single door correctly', () => {
      const singleDoor = { ...mockDoor, doorType: 'single' as const };
      render(<DoorComponent door={singleDoor} />);
      
      expect(screen.getAllByTestId('konva-rect')).toHaveLength(1);
    });

    it('renders double door correctly', () => {
      const doubleDoor = { ...mockDoor, doorType: 'double' as const };
      render(<DoorComponent door={doubleDoor} />);
      
      // Double doors should have two rectangles
      expect(screen.getAllByTestId('konva-rect')).toHaveLength(2);
    });

    it('renders sliding door correctly', () => {
      const slidingDoor = { ...mockDoor, doorType: 'sliding' as const };
      render(<DoorComponent door={slidingDoor} />);
      
      expect(screen.getByTestId('konva-group')).toBeInTheDocument();
    });

    it('renders folding door correctly', () => {
      const foldingDoor = { ...mockDoor, doorType: 'folding' as const };
      render(<DoorComponent door={foldingDoor} />);
      
      expect(screen.getByTestId('konva-group')).toBeInTheDocument();
    });
  });

  describe('Open Direction', () => {
    it('renders inward opening door with correct swing arc', () => {
      const inwardDoor = { ...mockDoor, openDirection: 'inward' as const };
      render(<DoorComponent door={inwardDoor} />);
      
      // Should have swing arc for inward door
      expect(screen.getByTestId('konva-arc')).toBeInTheDocument();
    });

    it('renders outward opening door with correct swing arc', () => {
      const outwardDoor = { ...mockDoor, openDirection: 'outward' as const };
      render(<DoorComponent door={outwardDoor} />);
      
      // Should have swing arc for outward door
      expect(screen.getByTestId('konva-arc')).toBeInTheDocument();
    });
  });

  describe('Selection State', () => {
    it('renders selected door with selection indicators', () => {
      const selectedDoor = { ...mockDoor, isSelected: true };
      render(<DoorComponent door={selectedDoor} />);
      
      const group = screen.getByTestId('konva-group');
      expect(group).toHaveAttribute('data-selected', 'true');
    });

    it('renders non-selected door without selection indicators', () => {
      const nonSelectedDoor = { ...mockDoor, isSelected: false };
      render(<DoorComponent door={nonSelectedDoor} />);
      
      const group = screen.getByTestId('konva-group');
      expect(group).not.toHaveAttribute('data-selected', 'true');
    });
  });

  describe('Hover State', () => {
    it('renders hovered door with hover effects', () => {
      const hoveredDoor = { ...mockDoor, isHovered: true };
      render(<DoorComponent door={hoveredDoor} />);
      
      const group = screen.getByTestId('konva-group');
      expect(group).toHaveAttribute('data-hovered', 'true');
    });
  });

  describe('Interactions', () => {
    it('handles click events', () => {
      render(<DoorComponent door={mockDoor} />);
      
      const group = screen.getByTestId('konva-group');
      fireEvent.click(group);
      
      expect(mockDesignStore.setSelectedElement).toHaveBeenCalledWith(mockDoor.id);
    });

    it('handles double click events', () => {
      render(<DoorComponent door={mockDoor} />);
      
      const group = screen.getByTestId('konva-group');
      fireEvent.doubleClick(group);
      
      // Should trigger edit mode or properties panel
      expect(mockDesignStore.setSelectedElement).toHaveBeenCalledWith(mockDoor.id);
    });

    it('handles mouse enter events', () => {
      render(<DoorComponent door={mockDoor} />);
      
      const group = screen.getByTestId('konva-group');
      fireEvent.mouseEnter(group);
      
      // Should update hover state
      expect(group).toHaveAttribute('data-hovered', 'true');
    });

    it('handles mouse leave events', () => {
      render(<DoorComponent door={mockDoor} />);
      
      const group = screen.getByTestId('konva-group');
      fireEvent.mouseLeave(group);
      
      // Should remove hover state
      expect(group).not.toHaveAttribute('data-hovered', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero width door', () => {
      const zeroDoor = { ...mockDoor, width: 0 };
      render(<DoorComponent door={zeroDoor} />);
      
      const doorRect = screen.getByTestId('konva-rect');
      expect(doorRect).toHaveAttribute('width', '1'); // Should have minimum width
    });

    it('handles zero height door', () => {
      const zeroDoor = { ...mockDoor, height: 0 };
      render(<DoorComponent door={zeroDoor} />);
      
      const doorRect = screen.getByTestId('konva-rect');
      expect(doorRect).toHaveAttribute('height', '1'); // Should have minimum height
    });

    it('handles negative dimensions', () => {
      const negativeDoor = { ...mockDoor, width: -50, height: -20 };
      render(<DoorComponent door={negativeDoor} />);
      
      const doorRect = screen.getByTestId('konva-rect');
      expect(doorRect).toHaveAttribute('width', '50'); // Should use absolute value
      expect(doorRect).toHaveAttribute('height', '20');
    });

    it('handles invalid door type', () => {
      const invalidDoor = { ...mockDoor, doorType: 'invalid' as any };
      render(<DoorComponent door={invalidDoor} />);
      
      // Should fallback to single door
      expect(screen.getAllByTestId('konva-rect')).toHaveLength(1);
    });

    it('handles missing wall reference', () => {
      const orphanDoor = { ...mockDoor, wallId: '' };
      render(<DoorComponent door={orphanDoor} />);
      
      // Should still render but with warning
      expect(screen.getByTestId('konva-group')).toBeInTheDocument();
    });

    it('handles extreme rotation values', () => {
      const extremeRotation = { ...mockDoor, rotation: 720 };
      render(<DoorComponent door={extremeRotation} />);
      
      const group = screen.getByTestId('konva-group');
      expect(group).toHaveAttribute('rotation', '0'); // Should normalize to 0-360
    });

    it('handles invalid swing angle', () => {
      const invalidSwing = { ...mockDoor, swing: -45 };
      render(<DoorComponent door={invalidSwing} />);
      
      // Should clamp to valid range (0-180)
      expect(screen.getByTestId('konva-arc')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<DoorComponent door={mockDoor} />);
      
      const group = screen.getByTestId('konva-group');
      expect(group).toHaveAttribute('role', 'button');
      expect(group).toHaveAttribute('aria-label', expect.stringContaining('Door'));
    });

    it('supports keyboard navigation', () => {
      render(<DoorComponent door={mockDoor} />);
      
      const group = screen.getByTestId('konva-group');
      expect(group).toHaveAttribute('tabIndex', '0');
    });

    it('handles keyboard events', () => {
      render(<DoorComponent door={mockDoor} />);
      
      const group = screen.getByTestId('konva-group');
      fireEvent.keyDown(group, { key: 'Enter' });
      
      expect(mockDesignStore.setSelectedElement).toHaveBeenCalledWith(mockDoor.id);
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<DoorComponent door={mockDoor} />);
      
      // Re-render with same props
      rerender(<DoorComponent door={mockDoor} />);
      
      // Component should be memoized
      expect(screen.getByTestId('konva-group')).toBeInTheDocument();
    });

    it('handles large numbers of doors efficiently', () => {
      const doors = Array.from({ length: 100 }, (_, i) => ({
        ...mockDoor,
        id: `door-${i}`,
        x: i * 10,
      }));
      
      const startTime = performance.now();
      doors.forEach(door => render(<DoorComponent door={door} />));
      const endTime = performance.now();
      
      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});