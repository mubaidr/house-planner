import { render, screen, fireEvent } from '@testing-library/react';
import { ViewControls } from '@/components/UI/ViewControls';
import { useDesignStore } from '@/stores/designStore';

jest.mock('@/stores/designStore');
const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;

describe('ViewControls', () => {
  const mockSetViewMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        viewMode: '3d' as const,
        setViewMode: mockSetViewMode,
      };
      return selector(state);
    });
  });

  it('renders without crashing', () => {
    render(<ViewControls />);
    expect(screen.getByText('View Controls')).toBeInTheDocument();
  });

  it('shows current view mode as active', () => {
    render(<ViewControls />);
    
    const button3D = screen.getByText('3D View');
    expect(button3D).toHaveClass('bg-blue-600');
  });

  it('switches view mode when button is clicked', () => {
    render(<ViewControls />);
    
    const button2D = screen.getByText('2D View');
    fireEvent.click(button2D);
    
    expect(mockSetViewMode).toHaveBeenCalledWith('2d');
  });

  it('renders all view mode buttons', () => {
    render(<ViewControls />);
    
    expect(screen.getByText('2D View')).toBeInTheDocument();
    expect(screen.getByText('3D View')).toBeInTheDocument();
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
  });
});