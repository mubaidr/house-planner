import { render, screen, fireEvent } from '@testing-library/react';
import { MenuBar } from '@/components/UI/CAD/MenuBar';

describe('MenuBar', () => {
  const defaultProps = {
    onNew: jest.fn(),
    onOpen: jest.fn(),
    onSave: jest.fn(),
    onExport: jest.fn(),
    theme: 'dark' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<MenuBar {...defaultProps} />);
    expect(screen.getByText('File')).toBeInTheDocument();
  });

  it('renders all main menu items', () => {
    render(<MenuBar {...defaultProps} />);
    
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Insert')).toBeInTheDocument();
    expect(screen.getByText('Modify')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('opens file menu when File is clicked', () => {
    render(<MenuBar {...defaultProps} />);
    
    const fileMenu = screen.getByText('File');
    fireEvent.click(fileMenu);
    
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('calls onNew when New menu item is clicked', () => {
    render(<MenuBar {...defaultProps} />);
    
    const fileMenu = screen.getByText('File');
    fireEvent.click(fileMenu);
    
    const newItem = screen.getByText('New');
    fireEvent.click(newItem);
    
    expect(defaultProps.onNew).toHaveBeenCalled();
  });

  it('calls onSave when Save menu item is clicked', () => {
    render(<MenuBar {...defaultProps} />);
    
    const fileMenu = screen.getByText('File');
    fireEvent.click(fileMenu);
    
    const saveItem = screen.getByText('Save');
    fireEvent.click(saveItem);
    
    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it('shows keyboard shortcuts in menu items', () => {
    render(<MenuBar {...defaultProps} />);
    
    const fileMenu = screen.getByText('File');
    fireEvent.click(fileMenu);
    
    expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+O')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
  });

  it('closes menu when clicking outside', () => {
    render(<MenuBar {...defaultProps} />);
    
    const fileMenu = screen.getByText('File');
    fireEvent.click(fileMenu);
    
    expect(screen.getByText('New')).toBeInTheDocument();
    
    // Click outside the menu
    fireEvent.click(document.body);
    
    expect(screen.queryByText('New')).not.toBeInTheDocument();
  });

  it('applies correct theme styles', () => {
    const { rerender } = render(<MenuBar {...defaultProps} theme="light" />);
    
    const menuBar = screen.getByRole('menubar');
    expect(menuBar).toHaveClass('bg-white');
    
    rerender(<MenuBar {...defaultProps} theme="dark" />);
    expect(menuBar).toHaveClass('bg-gray-800');
  });
});