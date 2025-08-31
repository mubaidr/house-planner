import { render, screen, fireEvent } from '@testing-library/react';
import { ToolPalette } from '@/components/UI/CAD/ToolPalette';

describe('ToolPalette', () => {
  const defaultProps = {
    activeTool: null as string | null,
    onToolSelect: jest.fn(),
    theme: 'dark' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ToolPalette {...defaultProps} />);
    expect(screen.getByText('Drawing Tools')).toBeInTheDocument();
  });

  it('renders all tool categories', () => {
    render(<ToolPalette {...defaultProps} />);
    
    expect(screen.getByText('Drawing Tools')).toBeInTheDocument();
    expect(screen.getByText('Modify Tools')).toBeInTheDocument();
    expect(screen.getByText('Annotation Tools')).toBeInTheDocument();
    expect(screen.getByText('View Tools')).toBeInTheDocument();
  });

  it('renders drawing tools', () => {
    render(<ToolPalette {...defaultProps} />);
    
    expect(screen.getByTitle('Line Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Wall Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Door Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Window Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Room Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Stair Tool')).toBeInTheDocument();
  });

  it('renders modify tools', () => {
    render(<ToolPalette {...defaultProps} />);
    
    expect(screen.getByTitle('Select Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Move Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Copy Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Rotate Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Scale Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Delete Tool')).toBeInTheDocument();
  });

  it('renders annotation tools', () => {
    render(<ToolPalette {...defaultProps} />);
    
    expect(screen.getByTitle('Dimension Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Text Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Leader Tool')).toBeInTheDocument();
  });

  it('renders view tools', () => {
    render(<ToolPalette {...defaultProps} />);
    
    expect(screen.getByTitle('Pan Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Zoom Tool')).toBeInTheDocument();
    expect(screen.getByTitle('Orbit Tool')).toBeInTheDocument();
  });

  it('highlights active tool', () => {
    render(<ToolPalette {...defaultProps} activeTool="wall" />);
    
    const wallTool = screen.getByTitle('Wall Tool');
    expect(wallTool).toHaveClass('bg-blue-600');
  });

  it('calls onToolSelect when tool is clicked', () => {
    render(<ToolPalette {...defaultProps} />);
    
    const wallTool = screen.getByTitle('Wall Tool');
    fireEvent.click(wallTool);
    
    expect(defaultProps.onToolSelect).toHaveBeenCalledWith('wall');
  });

  it('deselects tool when clicking active tool', () => {
    render(<ToolPalette {...defaultProps} activeTool="wall" />);
    
    const wallTool = screen.getByTitle('Wall Tool');
    fireEvent.click(wallTool);
    
    expect(defaultProps.onToolSelect).toHaveBeenCalledWith(null);
  });

  it('applies light theme styles', () => {
    const { container } = render(<ToolPalette {...defaultProps} theme="light" />);
    
    const palette = container.firstChild as HTMLElement;
    expect(palette).toHaveClass('bg-white');
  });

  it('applies dark theme styles', () => {
    const { container } = render(<ToolPalette {...defaultProps} theme="dark" />);
    
    const palette = container.firstChild as HTMLElement;
    expect(palette).toHaveClass('bg-gray-800');
  });

  it('shows tool tooltips on hover', () => {
    render(<ToolPalette {...defaultProps} />);
    
    const wallTool = screen.getByTitle('Wall Tool');
    fireEvent.mouseEnter(wallTool);
    
    expect(screen.getByText('Wall Tool')).toBeInTheDocument();
  });

  it('groups tools by category correctly', () => {
    render(<ToolPalette {...defaultProps} />);
    
    // Check that tools are grouped under correct headings
    const drawingSection = screen.getByText('Drawing Tools').closest('div');
    expect(drawingSection).toContainElement(screen.getByTitle('Wall Tool'));
    
    const modifySection = screen.getByText('Modify Tools').closest('div');
    expect(modifySection).toContainElement(screen.getByTitle('Select Tool'));
  });
});