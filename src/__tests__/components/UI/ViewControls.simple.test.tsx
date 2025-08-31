import { render, screen, fireEvent } from '@testing-library/react';
import { ViewControls } from '@/components/UI/ViewControls';

const mockSetViewMode = jest.fn();

jest.mock('@/stores/designStore', () => ({
  useDesignStore: jest.fn((selector) => {
    const state = {
      viewMode: '3d',
      setViewMode: mockSetViewMode,
    };
    return selector ? selector(state) : state;
  }),
}));

describe('ViewControls - Simple Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ViewControls />);
    expect(screen.getByText('View Controls')).toBeInTheDocument();
  });

  it('renders view mode buttons', () => {
    render(<ViewControls />);
    
    expect(screen.getByText('2D View')).toBeInTheDocument();
    expect(screen.getByText('3D View')).toBeInTheDocument();
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
  });

  it('calls setViewMode when button is clicked', () => {
    render(<ViewControls />);
    
    const button2D = screen.getByText('2D View');
    fireEvent.click(button2D);
    
    expect(mockSetViewMode).toHaveBeenCalledWith('2d');
  });
});