import { render, screen, fireEvent } from '@testing-library/react';
import { ToolPanel } from '@/components/UI/ToolPanel';
import { useDesignStore } from '@/stores/designStore';

// Mock the design store
jest.mock('@/stores/designStore');
const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;

describe('ToolPanel', () => {
  const mockSetActiveTool = jest.fn();
  const mockAddWall = jest.fn();
  const mockAddStair = jest.fn();
  const mockAddRoom = jest.fn();
  const mockNewProject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        activeTool: null,
        walls: [],
        setActiveTool: mockSetActiveTool,
        addWall: mockAddWall,
        addStair: mockAddStair,
        addRoom: mockAddRoom,
        newProject: mockNewProject,
      };
      return selector(state);
    });
  });

  it('renders without crashing', () => {
    render(<ToolPanel />);
    expect(screen.getByText('Tools')).toBeInTheDocument();
  });

  it('renders all tool buttons', () => {
    render(<ToolPanel />);
    
    expect(screen.getByText('Draw Wall')).toBeInTheDocument();
    expect(screen.getByText('Add Door')).toBeInTheDocument();
    expect(screen.getByText('Add Window')).toBeInTheDocument();
    expect(screen.getByText('Create Room')).toBeInTheDocument();
    expect(screen.getByText('Select & Manipulate')).toBeInTheDocument();
    expect(screen.getByText('Measure Tool')).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(<ToolPanel />);
    
    const viewTab = screen.getByText('View');
    fireEvent.click(viewTab);
    
    // Should show grid controls instead of tools
    expect(screen.queryByText('Draw Wall')).not.toBeInTheDocument();
  });

  it('activates wall tool when clicked', () => {
    render(<ToolPanel />);
    
    const wallButton = screen.getByText('Draw Wall');
    fireEvent.click(wallButton);
    
    expect(mockSetActiveTool).toHaveBeenCalledWith('wall');
  });

  it('adds random wall when Add Wall button is clicked', () => {
    render(<ToolPanel />);
    
    const addWallButton = screen.getByText('Add Wall (Random)');
    fireEvent.click(addWallButton);
    
    expect(mockAddWall).toHaveBeenCalledWith(
      expect.objectContaining({
        start: expect.objectContaining({ x: expect.any(Number), y: 0, z: expect.any(Number) }),
        end: expect.objectContaining({ x: expect.any(Number), y: 0, z: expect.any(Number) }),
        height: expect.any(Number),
        thickness: expect.any(Number),
        type: 'load-bearing',
      })
    );
  });

  it('shows confirmation dialog when clearing all', () => {
    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<ToolPanel />);
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to clear all elements?');
    expect(mockNewProject).toHaveBeenCalled();
    
    mockConfirm.mockRestore();
  });
});