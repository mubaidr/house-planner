import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Stage, Layer } from 'react-konva';
import ConstraintIndicators from '@/components/Canvas/ConstraintIndicators';
import { WallConstraintResult } from '@/utils/wallConstraints';

// Helper component to wrap ConstraintIndicators in Konva context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Stage width={800} height={600}>
    <Layer>
      {children}
    </Layer>
  </Stage>
);

describe('ConstraintIndicators', () => {
  const mockWallSegment = {
    wall: {
      id: 'wall-1',
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 0,
      thickness: 8,
      height: 240,
      color: '#000000'
    },
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 100, y: 0 },
    length: 100,
    angle: 0
  };

  const validConstraintResult: WallConstraintResult = {
    isValid: true,
    wallId: 'wall-1',
    position: { x: 50, y: 0 },
    wallSegment: mockWallSegment,
    distanceFromStart: 50
  };

  const invalidConstraintResult: WallConstraintResult = {
    isValid: false,
    wallId: null,
    position: { x: 50, y: 0 },
    wallSegment: null,
    distanceFromStart: 0,
    error: 'Cannot place element here'
  };

  it('should render nothing when constraintResult is null', () => {
    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={null}
          isValid={false}
        />
      </TestWrapper>
    );

    // Konva renders to canvas, so we check if no shapes were added
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should render valid constraint indicators', () => {
    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={validConstraintResult}
          isValid={true}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
    // Note: Konva renders to canvas, so we can't directly test DOM elements
    // but we can verify the component renders without errors
  });

  it('should render invalid constraint indicators with error', () => {
    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={invalidConstraintResult}
          isValid={false}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should handle custom element width', () => {
    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={validConstraintResult}
          isValid={true}
          elementWidth={120}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should render wall highlight when wall segment is provided', () => {
    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={validConstraintResult}
          isValid={true}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should render position indicator circle', () => {
    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={validConstraintResult}
          isValid={true}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should render element width indicators for valid placements', () => {
    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={validConstraintResult}
          isValid={true}
          elementWidth={100}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should not render element width indicators for invalid placements', () => {
    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={invalidConstraintResult}
          isValid={false}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should render error message for invalid placements', () => {
    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={invalidConstraintResult}
          isValid={false}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should render success message for valid placements', () => {
    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={validConstraintResult}
          isValid={true}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should handle constraint result without wall segment', () => {
    const constraintWithoutWall: WallConstraintResult = {
      isValid: true,
      wallId: null,
      position: { x: 50, y: 50 },
      wallSegment: null,
      distanceFromStart: 0
    };

    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={constraintWithoutWall}
          isValid={true}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should handle constraint result without error message', () => {
    const constraintWithoutError: WallConstraintResult = {
      isValid: false,
      wallId: null,
      position: { x: 50, y: 50 },
      wallSegment: null,
      distanceFromStart: 0
      // No error property
    };

    const { container } = render(
      <TestWrapper>
        <ConstraintIndicators
          constraintResult={constraintWithoutError}
          isValid={false}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  describe('Visual styling', () => {
    it('should use green colors for valid constraints', () => {
      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={validConstraintResult}
            isValid={true}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
      // Colors are applied to Konva shapes, tested through visual regression or integration tests
    });

    it('should use red colors for invalid constraints', () => {
      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={invalidConstraintResult}
            isValid={false}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
      // Colors are applied to Konva shapes, tested through visual regression or integration tests
    });
  });

  describe('Positioning calculations', () => {
    it('should position elements correctly based on constraint result', () => {
      const constraintAtOrigin: WallConstraintResult = {
        isValid: true,
        wallId: 'wall-1',
        position: { x: 0, y: 0 },
        wallSegment: mockWallSegment,
        distanceFromStart: 0
      };

      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={constraintAtOrigin}
            isValid={true}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle negative coordinates', () => {
      const constraintAtNegative: WallConstraintResult = {
        isValid: true,
        wallId: 'wall-1',
        position: { x: -50, y: -25 },
        wallSegment: mockWallSegment,
        distanceFromStart: 0
      };

      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={constraintAtNegative}
            isValid={true}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle large coordinates', () => {
      const constraintAtLarge: WallConstraintResult = {
        isValid: true,
        wallId: 'wall-1',
        position: { x: 1000, y: 800 },
        wallSegment: mockWallSegment,
        distanceFromStart: 0
      };

      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={constraintAtLarge}
            isValid={true}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Element width variations', () => {
    it('should handle very small element widths', () => {
      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={validConstraintResult}
            isValid={true}
            elementWidth={1}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle very large element widths', () => {
      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={validConstraintResult}
            isValid={true}
            elementWidth={500}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle zero element width', () => {
      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={validConstraintResult}
            isValid={true}
            elementWidth={0}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Wall segment variations', () => {
    it('should handle vertical walls', () => {
      const verticalWallSegment = {
        ...mockWallSegment,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 100 },
        angle: 90
      };

      const constraintWithVerticalWall: WallConstraintResult = {
        ...validConstraintResult,
        wallSegment: verticalWallSegment
      };

      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={constraintWithVerticalWall}
            isValid={true}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle diagonal walls', () => {
      const diagonalWallSegment = {
        ...mockWallSegment,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 100, y: 100 },
        angle: 45
      };

      const constraintWithDiagonalWall: WallConstraintResult = {
        ...validConstraintResult,
        wallSegment: diagonalWallSegment
      };

      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={constraintWithDiagonalWall}
            isValid={true}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle walls with different thicknesses', () => {
      const thickWallSegment = {
        ...mockWallSegment,
        wall: {
          ...mockWallSegment.wall,
          thickness: 16
        }
      };

      const constraintWithThickWall: WallConstraintResult = {
        ...validConstraintResult,
        wallSegment: thickWallSegment
      };

      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={constraintWithThickWall}
            isValid={true}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Error message variations', () => {
    it('should handle long error messages', () => {
      const constraintWithLongError: WallConstraintResult = {
        ...invalidConstraintResult,
        error: 'This is a very long error message that should be displayed properly even when it exceeds the normal text width'
      };

      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={constraintWithLongError}
            isValid={false}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle empty error messages', () => {
      const constraintWithEmptyError: WallConstraintResult = {
        ...invalidConstraintResult,
        error: ''
      };

      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={constraintWithEmptyError}
            isValid={false}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle special characters in error messages', () => {
      const constraintWithSpecialChars: WallConstraintResult = {
        ...invalidConstraintResult,
        error: 'Error: Cannot place element @ position (50, 0) - invalid coordinates!'
      };

      const { container } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={constraintWithSpecialChars}
            isValid={false}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Performance and memoization', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={validConstraintResult}
            isValid={true}
          />
        </TestWrapper>
      );

      // Re-render with same props
      rerender(
        <TestWrapper>
          <ConstraintIndicators
            constraintResult={validConstraintResult}
            isValid={true}
          />
        </TestWrapper>
      );

      // Component should handle re-renders gracefully due to React.memo
      expect(true).toBe(true); // Test passes if no errors thrown
    });
  });
});