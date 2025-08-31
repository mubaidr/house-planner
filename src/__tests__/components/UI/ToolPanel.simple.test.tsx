import { render, screen, fireEvent } from '@testing-library/react';
import { ToolPanel } from '@/components/UI/ToolPanel';

// Simple mock for design store
const mockSetActiveTool = jest.fn();
const mockAddWall = jest.fn();
const mockAddStair = jest.fn();
const mockAddRoom = jest.fn();
const mockNewProject = jest.fn();

jest.mock('@/stores/designStore', () => ({
  useDesignStore: jest.fn((selector) => {
    const state = {
      activeTool: null,
      walls: [],
      setActiveTool: mockSetActiveTool,
      addWall: mockAddWall,
      addStair: mockAddStair,
      addRoom: mockAddRoom,
      newProject: mockNewProject,
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock ExportDialog
jest.mock('@/components/UI/ExportDialog', () => ({
  ExportDialog: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="export-dialog">Export Dialog</div> : null
}));

// Mock GridControls
jest.mock('@/components/UI/GridControls', () => ({
  GridControls: () => <div data-testid="grid-controls">Grid Controls</div>
}));

describe('ToolPanel - Simple Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ToolPanel />);
    expect(screen.getByText('Tools')).toBeInTheDocument();
  });

  it('renders basic tool buttons', () => {
    render(<ToolPanel />);
    
    expect(screen.getByText('Draw Wall')).toBeInTheDocument();
    expect(screen.getByText('Add Door')).toBeInTheDocument();
    expect(screen.getByText('Add Window')).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(<ToolPanel />);
    
    const viewTab = screen.getByText('View');
    fireEvent.click(viewTab);
    
    expect(screen.getByTestId('grid-controls')).toBeInTheDocument();
  });

  it('shows export dialog when export button is clicked', () => {
    render(<ToolPanel />);
    
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    
    expect(screen.getByTestId('export-dialog')).toBeInTheDocument();
  });
});