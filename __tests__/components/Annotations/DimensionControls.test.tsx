import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DimensionControls from '@/components/Annotations/DimensionControls';
import { Dimension2D, DimensionManagerConfig } from '@/utils/dimensionManager2D';

describe('DimensionControls', () => {
  const mockConfig: DimensionManagerConfig = {
    enabled: true,
    autoGenerate: false,
    style: {
      color: '#000000',
      fontSize: 12,
      fontFamily: 'Arial',
      strokeWidth: 1,
      arrowSize: 8,
      extensionLineLength: 20,
      textOffset: 5,
      precision: 2
    },
    units: 'feet',
    showInches: true,
    extensionLines: true,
    chains: true
  };

  const mockDimension: Dimension2D = {
    id: 'dim-1',
    type: 'linear',
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 120, y: 0 },
    value: 120,
    text: '10\'',
    style: mockConfig.style,
    layer: 'dimensions',
    visible: true,
    locked: false
  };

  const defaultProps = {
    config: mockConfig,
    isEnabled: true,
    onConfigUpdate: jest.fn(),
    onToggleEnabled: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<DimensionControls {...defaultProps} />);
    
    expect(screen.getByText('Dimension Controls')).toBeInTheDocument();
  });

  it('should show enabled state correctly', () => {
    render(<DimensionControls {...defaultProps} />);
    
    const enableToggle = screen.getByRole('checkbox', { name: /enable dimensions/i });
    expect(enableToggle).toBeChecked();
  });

  it('should show disabled state correctly', () => {
    render(<DimensionControls {...defaultProps} isEnabled={false} />);
    
    const enableToggle = screen.getByRole('checkbox', { name: /enable dimensions/i });
    expect(enableToggle).not.toBeChecked();
  });

  it('should toggle enabled state', async () => {
    const user = userEvent.setup();
    render(<DimensionControls {...defaultProps} />);
    
    const enableToggle = screen.getByRole('checkbox', { name: /enable dimensions/i });
    await user.click(enableToggle);
    
    expect(defaultProps.onToggleEnabled).toHaveBeenCalledWith(false);
  });

  describe('Global Settings', () => {
    it('should update units setting', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const unitsSelect = screen.getByLabelText(/units/i);
      await user.click(unitsSelect);
      
      const metersOption = screen.getByText('Meters');
      await user.click(metersOption);
      
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        units: 'meters'
      });
    });

    it('should toggle show inches setting', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const showInchesCheckbox = screen.getByLabelText(/show inches/i);
      await user.click(showInchesCheckbox);
      
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        showInches: false
      });
    });

    it('should toggle auto-generate setting', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const autoGenerateCheckbox = screen.getByLabelText(/auto-generate/i);
      await user.click(autoGenerateCheckbox);
      
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        autoGenerate: true
      });
    });

    it('should toggle extension lines setting', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const extensionLinesCheckbox = screen.getByLabelText(/extension lines/i);
      await user.click(extensionLinesCheckbox);
      
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        extensionLines: false
      });
    });

    it('should toggle chains setting', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const chainsCheckbox = screen.getByLabelText(/dimension chains/i);
      await user.click(chainsCheckbox);
      
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        chains: false
      });
    });
  });

  describe('Style Settings', () => {
    it('should update text color', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const colorInput = screen.getByLabelText(/text color/i);
      await user.clear(colorInput);
      await user.type(colorInput, '#ff0000');
      
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        style: {
          ...mockConfig.style,
          color: '#ff0000'
        }
      });
    });

    it('should update font size', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const fontSizeInput = screen.getByLabelText(/font size/i);
      await user.clear(fontSizeInput);
      await user.type(fontSizeInput, '14');
      
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        style: {
          ...mockConfig.style,
          fontSize: 14
        }
      });
    });

    it('should update font family', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const fontFamilySelect = screen.getByLabelText(/font family/i);
      await user.click(fontFamilySelect);
      
      const timesOption = screen.getByText('Times New Roman');
      await user.click(timesOption);
      
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        style: {
          ...mockConfig.style,
          fontFamily: 'Times New Roman'
        }
      });
    });

    it('should update stroke width', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const strokeWidthInput = screen.getByLabelText(/line width/i);
      await user.clear(strokeWidthInput);
      await user.type(strokeWidthInput, '2');
      
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        style: {
          ...mockConfig.style,
          strokeWidth: 2
        }
      });
    });

    it('should update arrow size', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const arrowSizeInput = screen.getByLabelText(/arrow size/i);
      await user.clear(arrowSizeInput);
      await user.type(arrowSizeInput, '10');
      
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        style: {
          ...mockConfig.style,
          arrowSize: 10
        }
      });
    });

    it('should update precision', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const precisionInput = screen.getByLabelText(/precision/i);
      await user.clear(precisionInput);
      await user.type(precisionInput, '3');
      
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        style: {
          ...mockConfig.style,
          precision: 3
        }
      });
    });
  });

  describe('Selected Dimension Controls', () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedDimension: mockDimension,
      onDimensionUpdate: jest.fn(),
      onDimensionDelete: jest.fn(),
    };

    it('should show selected dimension details', () => {
      render(<DimensionControls {...propsWithSelection} />);
      
      expect(screen.getByText('Selected Dimension')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10\'')).toBeInTheDocument();
    });

    it('should update dimension text', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...propsWithSelection} />);
      
      const textInput = screen.getByLabelText(/dimension text/i);
      await user.clear(textInput);
      await user.type(textInput, '12\'');
      
      expect(propsWithSelection.onDimensionUpdate).toHaveBeenCalledWith('dim-1', {
        text: '12\''
      });
    });

    it('should toggle dimension visibility', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...propsWithSelection} />);
      
      const visibilityButton = screen.getByRole('button', { name: /hide dimension/i });
      await user.click(visibilityButton);
      
      expect(propsWithSelection.onDimensionUpdate).toHaveBeenCalledWith('dim-1', {
        visible: false
      });
    });

    it('should toggle dimension lock', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...propsWithSelection} />);
      
      const lockButton = screen.getByRole('button', { name: /lock dimension/i });
      await user.click(lockButton);
      
      expect(propsWithSelection.onDimensionUpdate).toHaveBeenCalledWith('dim-1', {
        locked: true
      });
    });

    it('should delete dimension', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...propsWithSelection} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete dimension/i });
      await user.click(deleteButton);
      
      expect(propsWithSelection.onDimensionDelete).toHaveBeenCalledWith('dim-1');
    });

    it('should update dimension type', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...propsWithSelection} />);
      
      const typeSelect = screen.getByLabelText(/dimension type/i);
      await user.click(typeSelect);
      
      const angularOption = screen.getByText('Angular');
      await user.click(angularOption);
      
      expect(propsWithSelection.onDimensionUpdate).toHaveBeenCalledWith('dim-1', {
        type: 'angular'
      });
    });

    it('should show locked dimension state', () => {
      const lockedDimension = {
        ...mockDimension,
        locked: true
      };
      
      render(<DimensionControls {...propsWithSelection} selectedDimension={lockedDimension} />);
      
      const lockButton = screen.getByRole('button', { name: /unlock dimension/i });
      expect(lockButton).toBeInTheDocument();
    });

    it('should show hidden dimension state', () => {
      const hiddenDimension = {
        ...mockDimension,
        visible: false
      };
      
      render(<DimensionControls {...propsWithSelection} selectedDimension={hiddenDimension} />);
      
      const visibilityButton = screen.getByRole('button', { name: /show dimension/i });
      expect(visibilityButton).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    const propsWithActions = {
      ...defaultProps,
      onCreateDimension: jest.fn(),
      onAutoGenerate: jest.fn(),
      onClearAuto: jest.fn(),
    };

    it('should handle create dimension action', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...propsWithActions} />);
      
      const createButton = screen.getByRole('button', { name: /create dimension/i });
      await user.click(createButton);
      
      expect(propsWithActions.onCreateDimension).toHaveBeenCalled();
    });

    it('should handle auto-generate action', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...propsWithActions} />);
      
      const autoGenerateButton = screen.getByRole('button', { name: /auto-generate/i });
      await user.click(autoGenerateButton);
      
      expect(propsWithActions.onAutoGenerate).toHaveBeenCalled();
    });

    it('should handle clear auto action', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...propsWithActions} />);
      
      const clearAutoButton = screen.getByRole('button', { name: /clear auto/i });
      await user.click(clearAutoButton);
      
      expect(propsWithActions.onClearAuto).toHaveBeenCalled();
    });

    it('should disable actions when dimensions are disabled', () => {
      render(<DimensionControls {...propsWithActions} isEnabled={false} />);
      
      const createButton = screen.getByRole('button', { name: /create dimension/i });
      const autoGenerateButton = screen.getByRole('button', { name: /auto-generate/i });
      
      expect(createButton).toBeDisabled();
      expect(autoGenerateButton).toBeDisabled();
    });
  });

  describe('Input Validation', () => {
    it('should validate numeric inputs', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const fontSizeInput = screen.getByLabelText(/font size/i);
      await user.clear(fontSizeInput);
      await user.type(fontSizeInput, 'invalid');
      
      // Should not call onConfigUpdate with invalid value
      expect(defaultProps.onConfigUpdate).not.toHaveBeenCalledWith(
        expect.objectContaining({
          style: expect.objectContaining({
            fontSize: 'invalid'
          })
        })
      );
    });

    it('should enforce minimum values', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const fontSizeInput = screen.getByLabelText(/font size/i);
      await user.clear(fontSizeInput);
      await user.type(fontSizeInput, '0');
      
      // Should enforce minimum font size
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        style: {
          ...mockConfig.style,
          fontSize: 8 // Minimum font size
        }
      });
    });

    it('should enforce maximum values', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const fontSizeInput = screen.getByLabelText(/font size/i);
      await user.clear(fontSizeInput);
      await user.type(fontSizeInput, '100');
      
      // Should enforce maximum font size
      expect(defaultProps.onConfigUpdate).toHaveBeenCalledWith({
        style: {
          ...mockConfig.style,
          fontSize: 72 // Maximum font size
        }
      });
    });

    it('should validate color inputs', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const colorInput = screen.getByLabelText(/text color/i);
      await user.clear(colorInput);
      await user.type(colorInput, 'invalid-color');
      
      // Should not update with invalid color
      expect(defaultProps.onConfigUpdate).not.toHaveBeenCalledWith(
        expect.objectContaining({
          style: expect.objectContaining({
            color: 'invalid-color'
          })
        })
      );
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const enableToggle = screen.getByRole('checkbox', { name: /enable dimensions/i });
      enableToggle.focus();
      
      await user.tab();
      
      // Should move to next focusable element
      expect(document.activeElement).not.toBe(enableToggle);
    });

    it('should support enter key on buttons', async () => {
      const user = userEvent.setup();
      const propsWithActions = {
        ...defaultProps,
        onCreateDimension: jest.fn(),
      };
      
      render(<DimensionControls {...propsWithActions} />);
      
      const createButton = screen.getByRole('button', { name: /create dimension/i });
      createButton.focus();
      
      await user.keyboard('{Enter}');
      
      expect(propsWithActions.onCreateDimension).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<DimensionControls {...defaultProps} />);
      
      const enableToggle = screen.getByRole('checkbox', { name: /enable dimensions/i });
      expect(enableToggle).toHaveAccessibleName();
      
      const fontSizeInput = screen.getByLabelText(/font size/i);
      expect(fontSizeInput).toHaveAccessibleName();
    });

    it('should group related controls', () => {
      render(<DimensionControls {...defaultProps} />);
      
      const globalSettings = screen.getByRole('group', { name: /global settings/i });
      expect(globalSettings).toBeInTheDocument();
      
      const styleSettings = screen.getByRole('group', { name: /style settings/i });
      expect(styleSettings).toBeInTheDocument();
    });

    it('should announce state changes', async () => {
      const user = userEvent.setup();
      render(<DimensionControls {...defaultProps} />);
      
      const enableToggle = screen.getByRole('checkbox', { name: /enable dimensions/i });
      await user.click(enableToggle);
      
      // Should have aria-live region for announcements
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to small screens', () => {
      // Mock small screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      render(<DimensionControls {...defaultProps} />);
      
      const container = screen.getByText('Dimension Controls').closest('div');
      expect(container).toHaveClass('flex-col'); // Should stack vertically
    });
  });

  describe('Error Handling', () => {
    it('should handle missing callback functions gracefully', async () => {
      const user = userEvent.setup();
      const propsWithoutCallbacks = {
        config: mockConfig,
        isEnabled: true,
        onConfigUpdate: undefined as any,
        onToggleEnabled: undefined as any,
      };
      
      render(<DimensionControls {...propsWithoutCallbacks} />);
      
      const enableToggle = screen.getByRole('checkbox', { name: /enable dimensions/i });
      
      // Should not crash when callbacks are missing
      await user.click(enableToggle);
      
      expect(screen.getByText('Dimension Controls')).toBeInTheDocument();
    });
  });
});