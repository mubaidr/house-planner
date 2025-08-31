import { render, screen } from '@testing-library/react';
import { PropertiesPanel } from '@/components/UI/PropertiesPanel';

// Mock config panels
jest.mock('@/components/UI/DoorConfigPanel', () => ({
  DoorConfigPanel: () => <div data-testid="door-config">Door Config</div>
}));

jest.mock('@/components/UI/WindowConfigPanel', () => ({
  WindowConfigPanel: () => <div data-testid="window-config">Window Config</div>
}));

jest.mock('@/components/UI/StairConfigPanel', () => ({
  StairConfigPanel: () => <div data-testid="stair-config">Stair Config</div>
}));

const mockUseDesignStore = jest.fn();

jest.mock('@/stores/designStore', () => ({
  useDesignStore: mockUseDesignStore,
}));

describe('PropertiesPanel - Simple Test', () => {
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

  it('shows door config when door is selected', () => {
    mockUseDesignStore.mockReturnValue({
      selectedElementId: 'door-1',
      selectedElementType: 'door',
    });

    render(<PropertiesPanel />);
    expect(screen.getByTestId('door-config')).toBeInTheDocument();
  });

  it('shows window config when window is selected', () => {
    mockUseDesignStore.mockReturnValue({
      selectedElementId: 'window-1',
      selectedElementType: 'window',
    });

    render(<PropertiesPanel />);
    expect(screen.getByTestId('window-config')).toBeInTheDocument();
  });

  it('shows stair config when stair is selected', () => {
    mockUseDesignStore.mockReturnValue({
      selectedElementId: 'stair-1',
      selectedElementType: 'stair',
    });

    render(<PropertiesPanel />);
    expect(screen.getByTestId('stair-config')).toBeInTheDocument();
  });
});