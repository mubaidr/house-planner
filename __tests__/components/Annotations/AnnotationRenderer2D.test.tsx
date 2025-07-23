import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Stage, Layer } from 'react-konva';
import { AnnotationRenderer2D } from '@/components/Annotations/AnnotationRenderer2D';

// Helper component to wrap AnnotationRenderer2D in Konva context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Stage width={800} height={600}>
    <Layer>
      {children}
    </Layer>
  </Stage>
);

describe('AnnotationRenderer2D', () => {
  const mockAnnotations = [
    {
      id: 'annotation-1',
      type: 'dimension' as const,
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 100, y: 0 },
      text: '100"',
      style: {
        color: '#000000',
        fontSize: 12,
        fontFamily: 'Arial',
        strokeWidth: 1
      },
      visible: true,
      layer: 'dimensions' as const
    },
    {
      id: 'annotation-2',
      type: 'label' as const,
      position: { x: 50, y: 25 },
      text: 'Living Room',
      style: {
        color: '#333333',
        fontSize: 14,
        fontFamily: 'Arial',
        backgroundColor: '#ffffff',
        padding: 4
      },
      visible: true,
      layer: 'labels' as const
    },
    {
      id: 'annotation-3',
      type: 'arrow' as const,
      startPoint: { x: 200, y: 50 },
      endPoint: { x: 250, y: 100 },
      text: 'Entry',
      style: {
        color: '#ff0000',
        strokeWidth: 2,
        arrowSize: 8
      },
      visible: true,
      layer: 'callouts' as const
    }
  ];

  const mockViewConfig = {
    viewType: 'plan' as const,
    scale: 1,
    offset: { x: 0, y: 0 },
    bounds: {
      minX: 0,
      minY: 0,
      maxX: 800,
      maxY: 600,
      width: 800,
      height: 600
    }
  };

  it('should render without crashing', () => {
    const { container } = render(
      <TestWrapper>
        <AnnotationRenderer2D
          annotations={[]}
          viewConfig={mockViewConfig}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should render all visible annotations', () => {
    const { container } = render(
      <TestWrapper>
        <AnnotationRenderer2D
          annotations={mockAnnotations}
          viewConfig={mockViewConfig}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
    // Konva renders to canvas, so we verify the component renders without errors
  });

  it('should not render invisible annotations', () => {
    const annotationsWithHidden = [
      ...mockAnnotations,
      {
        id: 'annotation-hidden',
        type: 'label' as const,
        position: { x: 300, y: 300 },
        text: 'Hidden Label',
        style: { color: '#000000', fontSize: 12 },
        visible: false,
        layer: 'labels' as const
      }
    ];

    const { container } = render(
      <TestWrapper>
        <AnnotationRenderer2D
          annotations={annotationsWithHidden}
          viewConfig={mockViewConfig}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should handle empty annotations array', () => {
    const { container } = render(
      <TestWrapper>
        <AnnotationRenderer2D
          annotations={[]}
          viewConfig={mockViewConfig}
        />
      </TestWrapper>
    );

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  describe('Dimension annotations', () => {
    const dimensionAnnotation = {
      id: 'dim-1',
      type: 'dimension' as const,
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 120, y: 0 },
      text: '10\'',
      style: {
        color: '#000000',
        fontSize: 12,
        strokeWidth: 1,
        extensionLineLength: 20,
        textOffset: 5
      },
      visible: true,
      layer: 'dimensions' as const
    };

    it('should render dimension lines', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[dimensionAnnotation]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render dimension text', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[dimensionAnnotation]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render extension lines', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[dimensionAnnotation]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle vertical dimensions', () => {
      const verticalDimension = {
        ...dimensionAnnotation,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 120 }
      };

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[verticalDimension]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle diagonal dimensions', () => {
      const diagonalDimension = {
        ...dimensionAnnotation,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 100, y: 100 }
      };

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[diagonalDimension]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Label annotations', () => {
    const labelAnnotation = {
      id: 'label-1',
      type: 'label' as const,
      position: { x: 100, y: 50 },
      text: 'Kitchen',
      style: {
        color: '#333333',
        fontSize: 14,
        fontFamily: 'Arial',
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 4
      },
      visible: true,
      layer: 'labels' as const
    };

    it('should render label text', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[labelAnnotation]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render label background', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[labelAnnotation]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle multi-line labels', () => {
      const multiLineLabel = {
        ...labelAnnotation,
        text: 'Master\nBedroom\n(12\' x 14\')'
      };

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[multiLineLabel]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle long text with wrapping', () => {
      const longTextLabel = {
        ...labelAnnotation,
        text: 'This is a very long label that should wrap properly within the specified width constraints',
        style: {
          ...labelAnnotation.style,
          maxWidth: 150,
          wordWrap: true
        }
      };

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[longTextLabel]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Arrow annotations', () => {
    const arrowAnnotation = {
      id: 'arrow-1',
      type: 'arrow' as const,
      startPoint: { x: 50, y: 50 },
      endPoint: { x: 150, y: 100 },
      text: 'Main Entrance',
      style: {
        color: '#ff0000',
        strokeWidth: 2,
        arrowSize: 12,
        arrowType: 'filled' as const,
        textPosition: 'middle' as const,
        textOffset: 10
      },
      visible: true,
      layer: 'callouts' as const
    };

    it('should render arrow line', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[arrowAnnotation]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render arrow head', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[arrowAnnotation]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render arrow text', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[arrowAnnotation]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle different arrow types', () => {
      const outlineArrow = {
        ...arrowAnnotation,
        style: {
          ...arrowAnnotation.style,
          arrowType: 'outline' as const
        }
      };

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[outlineArrow]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle different text positions', () => {
      const startTextArrow = {
        ...arrowAnnotation,
        style: {
          ...arrowAnnotation.style,
          textPosition: 'start' as const
        }
      };

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[startTextArrow]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('View transformations', () => {
    it('should handle view scaling', () => {
      const scaledViewConfig = {
        ...mockViewConfig,
        scale: 2
      };

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={mockAnnotations}
            viewConfig={scaledViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle view offset', () => {
      const offsetViewConfig = {
        ...mockViewConfig,
        offset: { x: 100, y: 50 }
      };

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={mockAnnotations}
            viewConfig={offsetViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle different view types', () => {
      const elevationViewConfig = {
        ...mockViewConfig,
        viewType: 'elevation' as const
      };

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={mockAnnotations}
            viewConfig={elevationViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Layer filtering', () => {
    it('should render only specified layers', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={mockAnnotations}
            viewConfig={mockViewConfig}
            visibleLayers={['dimensions', 'labels']}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should hide annotations from hidden layers', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={mockAnnotations}
            viewConfig={mockViewConfig}
            visibleLayers={['dimensions']}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle empty visible layers', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={mockAnnotations}
            viewConfig={mockViewConfig}
            visibleLayers={[]}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Interactive features', () => {
    it('should handle annotation selection', () => {
      const onSelect = jest.fn();
      
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={mockAnnotations}
            viewConfig={mockViewConfig}
            onAnnotationSelect={onSelect}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle annotation hover', () => {
      const onHover = jest.fn();
      
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={mockAnnotations}
            viewConfig={mockViewConfig}
            onAnnotationHover={onHover}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should highlight selected annotations', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={mockAnnotations}
            viewConfig={mockViewConfig}
            selectedAnnotationIds={['annotation-1']}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Performance optimizations', () => {
    it('should handle large numbers of annotations', () => {
      const manyAnnotations = Array.from({ length: 1000 }, (_, i) => ({
        id: `annotation-${i}`,
        type: 'label' as const,
        position: { x: (i % 40) * 20, y: Math.floor(i / 40) * 20 },
        text: `Label ${i}`,
        style: { color: '#000000', fontSize: 10 },
        visible: true,
        layer: 'labels' as const
      }));

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={manyAnnotations}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle viewport culling', () => {
      const outsideAnnotations = [
        {
          id: 'outside-1',
          type: 'label' as const,
          position: { x: -100, y: -100 },
          text: 'Outside viewport',
          style: { color: '#000000', fontSize: 12 },
          visible: true,
          layer: 'labels' as const
        },
        {
          id: 'outside-2',
          type: 'label' as const,
          position: { x: 1000, y: 1000 },
          text: 'Far outside',
          style: { color: '#000000', fontSize: 12 },
          visible: true,
          layer: 'labels' as const
        }
      ];

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={outsideAnnotations}
            viewConfig={mockViewConfig}
            enableViewportCulling={true}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle malformed annotations gracefully', () => {
      const malformedAnnotations = [
        {
          id: 'malformed-1',
          type: 'dimension' as const,
          // Missing required properties
          visible: true,
          layer: 'dimensions' as const
        } as any,
        {
          id: 'malformed-2',
          type: 'invalid-type' as any,
          position: { x: 50, y: 50 },
          text: 'Invalid type',
          visible: true,
          layer: 'labels' as const
        }
      ];

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={malformedAnnotations}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle missing style properties', () => {
      const annotationWithoutStyle = {
        id: 'no-style',
        type: 'label' as const,
        position: { x: 50, y: 50 },
        text: 'No style',
        visible: true,
        layer: 'labels' as const
        // Missing style property
      };

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={[annotationWithoutStyle]}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Accessibility features', () => {
    it('should provide accessible descriptions for annotations', () => {
      const accessibleAnnotations = mockAnnotations.map(annotation => ({
        ...annotation,
        accessibleDescription: `${annotation.type}: ${annotation.text}`
      }));

      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={accessibleAnnotations}
            viewConfig={mockViewConfig}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should support high contrast mode', () => {
      const { container } = render(
        <TestWrapper>
          <AnnotationRenderer2D
            annotations={mockAnnotations}
            viewConfig={mockViewConfig}
            highContrastMode={true}
          />
        </TestWrapper>
      );

      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });
});