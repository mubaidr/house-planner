import { render, screen } from '@testing-library/react';
import { PropertiesPanel } from '@/components/UI/PropertiesPanel';
import { useDesignStore } from '@/stores/designStore';

jest.mock('@/stores/designStore');
const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;

// Mock the config panels
jest.mock('@/components/UI/DoorConfigPanel', () => ({
  DoorConfigPanel: () => <div data-testid="door-config">Door Config Panel</div>
}));

jest.mock('@/components/UI/WindowConfigPanel', () => ({
  WindowConfigPanel: () => <div data-testid="window-config">Window Config Panel</div>
}));

jest.mock('@/components/UI/StairConfigPanel', () => ({
  StairConfigPanel: () => <div data-testid="stair-config">Stair Config Panel</div>
}));

describe('PropertiesPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing when no element selected', () => {
    mockUseDesignStore.mockReturnValue({
      selectedElementId: null,
      selectedElementType: null,
    });

    render(<PropertiesPanel />);
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('No element selected')).toBeInTheDocument();
  });

  it('shows door config panel when door is selected', () => {
    mockUseDesignStore.mockReturnValue({
      selectedElementId: 'door-1',
      selectedElementType: 'door',
    });

    render(<PropertiesPanel />);
    expect(screen.getByTestId('door-config')).toBeInTheDocument();
  });

  it('shows window config panel when window is selected', () => {
    mockUseDesignStore.mockReturnValue({
      selectedElementId: 'window-1',
      selectedElementType: 'window',
    });

    render(<PropertiesPanel />);
    expect(screen.getByTestId('window-config')).toBeInTheDocument();
  });

  it('shows stair config panel when stair is selected', () => {
    mockUseDesignStore.mockReturnValue({
      selectedElementId: 'stair-1',
      selectedElementType: 'stair',
    });

    render(<PropertiesPanel />);
    expect(screen.getByTestId('stair-config')).toBeInTheDocument();
  });

  it('shows generic message for unsupported element types', () => {
    mockUseDesignStore.mockReturnValue({
      selectedElementId: 'wall-1',
      selectedElementType: 'wall',
    });

    render(<PropertiesPanel />);
    expect(screen.getByText('Properties for wall')).toBeInTheDocument();
  });
});