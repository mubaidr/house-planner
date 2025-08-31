import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportDialog } from '@/components/UI/ExportDialog';

// Mock the export utilities
jest.mock('@/utils/3d/export3D', () => ({
  exportToGLTF: jest.fn().mockResolvedValue(new Blob()),
  exportToOBJ: jest.fn().mockResolvedValue('obj content'),
}));

jest.mock('@/utils/3d/pdfExport', () => ({
  exportToPDF: jest.fn().mockResolvedValue(new Blob()),
}));

describe('ExportDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<ExportDialog {...defaultProps} />);
    expect(screen.getByText('Export Project')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ExportDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Export Project')).not.toBeInTheDocument();
  });

  it('shows all export format options', () => {
    render(<ExportDialog {...defaultProps} />);
    
    expect(screen.getByText('3D Model (glTF)')).toBeInTheDocument();
    expect(screen.getByText('3D Model (OBJ)')).toBeInTheDocument();
    expect(screen.getByText('Image (PNG)')).toBeInTheDocument();
    expect(screen.getByText('Image (JPEG)')).toBeInTheDocument();
    expect(screen.getByText('PDF Drawing')).toBeInTheDocument();
  });

  it('selects format when radio button is clicked', () => {
    render(<ExportDialog {...defaultProps} />);
    
    const gltfOption = screen.getByLabelText('3D Model (glTF)');
    fireEvent.click(gltfOption);
    
    expect(gltfOption).toBeChecked();
  });

  it('shows quality options for image formats', () => {
    render(<ExportDialog {...defaultProps} />);
    
    const pngOption = screen.getByLabelText('Image (PNG)');
    fireEvent.click(pngOption);
    
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByDisplayValue('High')).toBeInTheDocument();
  });

  it('shows resolution options for image formats', () => {
    render(<ExportDialog {...defaultProps} />);
    
    const pngOption = screen.getByLabelText('Image (PNG)');
    fireEvent.click(pngOption);
    
    expect(screen.getByText('Resolution')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1920x1080')).toBeInTheDocument();
  });

  it('disables export button when no format selected', () => {
    render(<ExportDialog {...defaultProps} />);
    
    const exportButton = screen.getByText('Export');
    expect(exportButton).toBeDisabled();
  });

  it('enables export button when format is selected', () => {
    render(<ExportDialog {...defaultProps} />);
    
    const gltfOption = screen.getByLabelText('3D Model (glTF)');
    fireEvent.click(gltfOption);
    
    const exportButton = screen.getByText('Export');
    expect(exportButton).not.toBeDisabled();
  });

  it('shows progress during export', async () => {
    render(<ExportDialog {...defaultProps} />);
    
    const gltfOption = screen.getByLabelText('3D Model (glTF)');
    fireEvent.click(gltfOption);
    
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    
    expect(screen.getByText('Exporting...')).toBeInTheDocument();
  });

  it('closes dialog when cancel button is clicked', () => {
    render(<ExportDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('closes dialog when clicking outside', () => {
    render(<ExportDialog {...defaultProps} />);
    
    const backdrop = screen.getByTestId('dialog-backdrop');
    fireEvent.click(backdrop);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('updates filename when input changes', () => {
    render(<ExportDialog {...defaultProps} />);
    
    const filenameInput = screen.getByDisplayValue('house-plan');
    fireEvent.change(filenameInput, { target: { value: 'my-design' } });
    
    expect(filenameInput).toHaveValue('my-design');
  });
});