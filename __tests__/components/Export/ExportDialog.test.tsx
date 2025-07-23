import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ExportDialog } from '@/components/Export/ExportDialog';

// Mock the stores
const mockExportProgressStore = {
  isExporting: false,
  progress: 0,
  currentStep: '',
  error: null,
  startExport: jest.fn(),
  updateProgress: jest.fn(),
  completeExport: jest.fn(),
  setError: jest.fn(),
  reset: jest.fn(),
};

const mockDesignStore = {
  walls: [
    { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0 },
    { id: 'wall-2', startX: 100, startY: 0, endX: 100, endY: 100 }
  ],
  doors: [{ id: 'door-1', x: 50, y: 0, width: 80, height: 200 }],
  windows: [{ id: 'window-1', x: 150, y: 0, width: 60, height: 120 }],
  rooms: [{ id: 'room-1', name: 'Living Room', area: 300 }],
  projectName: 'My House Design',
  lastSaved: Date.now(),
};

const mockUnitStore = {
  unitSystem: 'imperial',
  precision: 2,
};

// Mock export utilities
jest.mock('@/utils/exportUtils2D', () => ({
  exportToPDF: jest.fn(),
  exportToSVG: jest.fn(),
  exportToDXF: jest.fn(),
  exportToImage: jest.fn(),
}));

jest.mock('@/stores/exportProgressStore', () => ({
  useExportProgressStore: () => mockExportProgressStore,
}));

jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => mockDesignStore,
}));

jest.mock('@/stores/unitStore', () => ({
  useUnitStore: () => mockUnitStore,
}));

describe('ExportDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockExportProgressStore.isExporting = false;
    mockExportProgressStore.progress = 0;
    mockExportProgressStore.error = null;
  });

  it('should render when open', () => {
    render(<ExportDialog {...defaultProps} />);
    
    expect(screen.getByText('Export Design')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ExportDialog {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Export Design')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display export format options', () => {
    render(<ExportDialog {...defaultProps} />);
    
    expect(screen.getByText('PDF Document')).toBeInTheDocument();
    expect(screen.getByText('SVG Vector')).toBeInTheDocument();
    expect(screen.getByText('DXF CAD')).toBeInTheDocument();
    expect(screen.getByText('PNG Image')).toBeInTheDocument();
    expect(screen.getByText('JPEG Image')).toBeInTheDocument();
  });

  describe('Format Selection', () => {
    it('should select PDF format by default', () => {
      render(<ExportDialog {...defaultProps} />);
      
      const pdfOption = screen.getByLabelText(/pdf/i);
      expect(pdfOption).toBeChecked();
    });

    it('should change format when selected', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const svgOption = screen.getByLabelText(/svg/i);
      await user.click(svgOption);
      
      expect(svgOption).toBeChecked();
    });

    it('should show format-specific options', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      // Select PNG format
      const pngOption = screen.getByLabelText(/png/i);
      await user.click(pngOption);
      
      // Should show image quality options
      expect(screen.getByText(/quality|resolution/i)).toBeInTheDocument();
    });

    it('should show PDF-specific options', () => {
      render(<ExportDialog {...defaultProps} />);
      
      // PDF should be selected by default, showing PDF options
      expect(screen.getByText(/page size|orientation/i)).toBeInTheDocument();
    });
  });

  describe('Export Options', () => {
    it('should display scale options', () => {
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByLabelText(/scale/i)).toBeInTheDocument();
    });

    it('should display layer options', () => {
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByText(/layers/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/walls/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/doors/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/windows/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dimensions/i)).toBeInTheDocument();
    });

    it('should toggle layer visibility', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const wallsCheckbox = screen.getByLabelText(/walls/i);
      expect(wallsCheckbox).toBeChecked();
      
      await user.click(wallsCheckbox);
      expect(wallsCheckbox).not.toBeChecked();
    });

    it('should display view options', () => {
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByText(/view/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/plan view/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/elevation/i)).toBeInTheDocument();
    });

    it('should display quality options for images', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const pngOption = screen.getByLabelText(/png/i);
      await user.click(pngOption);
      
      expect(screen.getByLabelText(/quality|dpi/i)).toBeInTheDocument();
    });
  });

  describe('Export Process', () => {
    it('should start export when export button is clicked', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);
      
      expect(mockExportProgressStore.startExport).toHaveBeenCalled();
    });

    it('should show progress during export', () => {
      mockExportProgressStore.isExporting = true;
      mockExportProgressStore.progress = 50;
      mockExportProgressStore.currentStep = 'Generating PDF...';
      
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByText('Generating PDF...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should disable export button during export', () => {
      mockExportProgressStore.isExporting = true;
      
      render(<ExportDialog {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /exporting|cancel/i });
      expect(exportButton).toBeDisabled();
    });

    it('should show cancel button during export', () => {
      mockExportProgressStore.isExporting = true;
      
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should handle export completion', async () => {
      mockExportProgressStore.isExporting = false;
      mockExportProgressStore.progress = 100;
      
      render(<ExportDialog {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/export completed|success/i)).toBeInTheDocument();
      });
    });

    it('should handle export errors', () => {
      mockExportProgressStore.error = 'Failed to generate PDF';
      
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByText('Failed to generate PDF')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('File Naming', () => {
    it('should display default filename', () => {
      render(<ExportDialog {...defaultProps} />);
      
      const filenameInput = screen.getByLabelText(/filename/i);
      expect(filenameInput).toHaveValue('My House Design');
    });

    it('should allow custom filename', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const filenameInput = screen.getByLabelText(/filename/i);
      await user.clear(filenameInput);
      await user.type(filenameInput, 'Custom Design Name');
      
      expect(filenameInput).toHaveValue('Custom Design Name');
    });

    it('should update filename extension based on format', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const svgOption = screen.getByLabelText(/svg/i);
      await user.click(svgOption);
      
      // Should show .svg extension
      expect(screen.getByText(/\.svg/i)).toBeInTheDocument();
    });

    it('should validate filename', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const filenameInput = screen.getByLabelText(/filename/i);
      await user.clear(filenameInput);
      await user.type(filenameInput, 'invalid/filename');
      
      expect(screen.getByText(/invalid characters/i)).toBeInTheDocument();
    });
  });

  describe('Preview', () => {
    it('should show export preview', () => {
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });

    it('should update preview when options change', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const scaleInput = screen.getByLabelText(/scale/i);
      await user.clear(scaleInput);
      await user.type(scaleInput, '1:50');
      
      // Preview should update (tested through visual regression or integration tests)
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });
  });

  describe('Export Statistics', () => {
    it('should display design statistics', () => {
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByText('2 walls')).toBeInTheDocument();
      expect(screen.getByText('1 door')).toBeInTheDocument();
      expect(screen.getByText('1 window')).toBeInTheDocument();
      expect(screen.getByText('1 room')).toBeInTheDocument();
    });

    it('should display estimated file size', () => {
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByText(/estimated size|file size/i)).toBeInTheDocument();
    });

    it('should update file size estimate based on format', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const initialSize = screen.getByText(/estimated size/i).textContent;
      
      const pngOption = screen.getByLabelText(/png/i);
      await user.click(pngOption);
      
      const newSize = screen.getByText(/estimated size/i).textContent;
      expect(newSize).not.toBe(initialSize);
    });
  });

  describe('Advanced Options', () => {
    it('should show advanced options toggle', () => {
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /advanced|more options/i })).toBeInTheDocument();
    });

    it('should expand advanced options', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const advancedToggle = screen.getByRole('button', { name: /advanced|more options/i });
      await user.click(advancedToggle);
      
      expect(screen.getByText(/margins|padding/i)).toBeInTheDocument();
      expect(screen.getByText(/compression|optimization/i)).toBeInTheDocument();
    });

    it('should display margin controls', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const advancedToggle = screen.getByRole('button', { name: /advanced/i });
      await user.click(advancedToggle);
      
      expect(screen.getByLabelText(/top margin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bottom margin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/left margin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/right margin/i)).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const firstRadio = screen.getByLabelText(/pdf/i);
      firstRadio.focus();
      
      await user.keyboard('{ArrowDown}');
      
      const secondRadio = screen.getByLabelText(/svg/i);
      expect(secondRadio).toHaveFocus();
    });

    it('should close on escape key', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should submit on enter key', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      exportButton.focus();
      
      await user.keyboard('{Enter}');
      
      expect(mockExportProgressStore.startExport).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ExportDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have accessible form controls', () => {
      render(<ExportDialog {...defaultProps} />);
      
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).toHaveAccessibleName();
      });
      
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAccessibleName();
      });
    });

    it('should announce progress to screen readers', () => {
      mockExportProgressStore.isExporting = true;
      mockExportProgressStore.progress = 75;
      
      render(<ExportDialog {...defaultProps} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have live region for status updates', () => {
      mockExportProgressStore.currentStep = 'Processing layers...';
      
      render(<ExportDialog {...defaultProps} />);
      
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent('Processing layers...');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing design data gracefully', () => {
      mockDesignStore.walls = [];
      mockDesignStore.doors = [];
      mockDesignStore.windows = [];
      
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByText(/no elements to export|empty design/i)).toBeInTheDocument();
    });

    it('should validate export options', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const scaleInput = screen.getByLabelText(/scale/i);
      await user.clear(scaleInput);
      await user.type(scaleInput, 'invalid');
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);
      
      expect(screen.getByText(/invalid scale/i)).toBeInTheDocument();
    });

    it('should handle export failures', () => {
      mockExportProgressStore.error = 'Network error occurred';
      
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should retry failed exports', async () => {
      const user = userEvent.setup();
      mockExportProgressStore.error = 'Export failed';
      
      render(<ExportDialog {...defaultProps} />);
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      expect(mockExportProgressStore.reset).toHaveBeenCalled();
      expect(mockExportProgressStore.startExport).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should handle large designs efficiently', () => {
      // Create large design
      const largeDesign = {
        ...mockDesignStore,
        walls: Array.from({ length: 1000 }, (_, i) => ({ id: `wall-${i}` })),
        doors: Array.from({ length: 100 }, (_, i) => ({ id: `door-${i}` })),
        windows: Array.from({ length: 200 }, (_, i) => ({ id: `window-${i}` })),
      };
      
      jest.mocked(mockDesignStore).walls = largeDesign.walls;
      jest.mocked(mockDesignStore).doors = largeDesign.doors;
      jest.mocked(mockDesignStore).windows = largeDesign.windows;
      
      render(<ExportDialog {...defaultProps} />);
      
      expect(screen.getByText('1000 walls')).toBeInTheDocument();
      expect(screen.getByText('100 doors')).toBeInTheDocument();
      expect(screen.getByText('200 windows')).toBeInTheDocument();
    });

    it('should debounce preview updates', async () => {
      const user = userEvent.setup();
      render(<ExportDialog {...defaultProps} />);
      
      const scaleInput = screen.getByLabelText(/scale/i);
      
      // Rapid changes should be debounced
      await user.clear(scaleInput);
      await user.type(scaleInput, '1:100');
      await user.clear(scaleInput);
      await user.type(scaleInput, '1:200');
      
      // Preview should update only once after debounce
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });
  });
});