import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WallComponent } from '@/components/Canvas/elements/WallComponent';
import { Wall } from '@/types/elements/Wall';

// Mock Konva components
jest.mock('react-konva', () => ({
  Group: ({ children, ...props }: any) => <div data-testid="konva-group" {...props}>{children}</div>,
  Line: (props: any) => <div data-testid="konva-line" {...props} />,
  Rect: (props: any) => <div data-testid="konva-rect" {...props} />,
}));

const mockDesignStore = {
  selectedElementId: null,
  setSelectedElement: jest.fn(),
  updateElement: jest.fn(),
  deleteElement: jest.fn(),
};

jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => mockDesignStore,
}));

describe('WallComponent', () => {
  const mockWall: Wall = {
    id: 'wall-1',
    type: 'wall',
    startX: 0,
    startY: 0,
    endX: 100,
    endY: 0,
    thickness: 10,
    height: 240,
    material: 'drywall',
    color: '#CCCCCC',
    isSelected: false,
    isHovered: false,
    doors: [],
    windows: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders wall component with basic props', () => {
      render(<WallComponent wall={mockWall} />);
      
      expect(screen.getByTestId('konva-group')).toBeInTheDocument();
      expect(screen.getByTestId('konva-line')).toBeInTheDocument();
    });

    it('renders wall with correct coordinates', () => {
      render(<WallComponent wall={mockWall} />);
      
      const line = screen.getByTestId('konva-line');
      expect(line).toHaveAttribute('points', '0,0,100,0');
    });

    it('renders wall with correct thickness', () => {
      render(<WallComponent wall={mockWall} />);
      
      const line = screen.getByTestId('konva-line');
      expect(line).toHaveAttribute('strokeWidth', '10');
    });

    it('renders wall with correct color', () => {
      render(<WallComponent wall={mockWall} />);
      
      const line = screen.getByTestId('konva-line');
      expect(line).toHaveAttribute('stroke', '#CCCCCC');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero length wall', () => {
      const zeroWall = { ...mockWall, endX: 0, endY: 0 };
      render(<WallComponent wall={zeroWall} />);
      
      // Should render with minimum length or show warning
      expect(screen.getByTestId('konva-group')).toBeInTheDocument();
    });

    it('handles negative thickness', () => {
      const negativeWall = { ...mockWall, thickness: -5 };
      render(<WallComponent wall={negativeWall} />);
      
      const line = screen.getByTestId('konva-line');
      expect(line).toHaveAttribute('strokeWidth', '5'); // Should use absolute value
    });

    it('handles very long walls', () => {
      const longWall = { ...mockWall, endX: 10000 };
      render(<WallComponent wall={longWall} />);
      
      expect(screen.getByTestId('konva-line')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events', () => {
      render(<WallComponent wall={mockWall} />);
      
      const group = screen.getByTestId('konva-group');
      fireEvent.click(group);
      
      expect(mockDesignStore.setSelectedElement).toHaveBeenCalledWith(mockWall.id);
    });
  });
});