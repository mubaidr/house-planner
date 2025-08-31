import { render, screen, fireEvent } from '@testing-library/react';
import { GridControls } from '@/components/UI/GridControls';
import { useGridStore } from '@/stores/gridStore';

jest.mock('@/stores/gridStore');
const mockUseGridStore = useGridStore as jest.MockedFunction<typeof useGridStore>;

describe('GridControls', () => {
  const mockToggleVisibility = jest.fn();
  const mockSetSpacing = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseGridStore.mockImplementation((selector) => {
      const state = {
        isVisible: true,
        spacing: 1,
        toggleVisibility: mockToggleVisibility,
        setSpacing: mockSetSpacing,
      };
      return selector(state);
    });
  });

  it('renders without crashing', () => {
    render(<GridControls />);
    expect(screen.getByText('Show Grid')).toBeInTheDocument();
  });

  it('toggles grid visibility when checkbox is clicked', () => {
    render(<GridControls />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockToggleVisibility).toHaveBeenCalled();
  });

  it('updates grid spacing when slider is changed', () => {
    render(<GridControls />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '2' } });
    
    expect(mockSetSpacing).toHaveBeenCalledWith(2);
  });
});