import { render, screen, fireEvent } from '@testing-library/react';
import App from '@/App';

// Mock all major components
jest.mock('@/components/Layout/CADLayout', () => ({
  CADLayout: () => <div data-testid="cad-layout">CAD Layout</div>
}));

jest.mock('@/components/Canvas3D/Scene3D', () => ({
  Scene3D: () => <div data-testid="scene3d">Scene3D</div>
}));

jest.mock('@/components/UI/ToolPanel', () => ({
  ToolPanel: () => <div data-testid="tool-panel">ToolPanel</div>
}));

jest.mock('@/components/UI/ViewControls', () => ({
  ViewControls: () => <div data-testid="view-controls">ViewControls</div>
}));

jest.mock('@/components/UI/PropertiesPanel', () => ({
  PropertiesPanel: () => <div data-testid="properties-panel">PropertiesPanel</div>
}));

jest.mock('@/components/UI/ContextMenu', () => ({
  ElementContextMenu: () => <div data-testid="context-menu">ContextMenu</div>
}));

jest.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: jest.fn(),
}));

jest.mock('@/stores/designStore', () => ({
  useDesignStore: jest.fn(() => 'wall'),
}));

describe('App - Simple Test', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('cad-layout')).toBeInTheDocument();
  });

  it('renders CAD interface by default', () => {
    render(<App />);
    
    expect(screen.getByTestId('cad-layout')).toBeInTheDocument();
    expect(screen.getByText('Simple UI')).toBeInTheDocument();
  });

  it('switches to simple interface', () => {
    render(<App />);
    
    const switchButton = screen.getByText('Simple UI');
    fireEvent.click(switchButton);
    
    expect(screen.getByTestId('scene3d')).toBeInTheDocument();
    expect(screen.getByTestId('tool-panel')).toBeInTheDocument();
    expect(screen.getByText('CAD UI')).toBeInTheDocument();
  });

  it('renders theme selector', () => {
    render(<App />);
    
    const themeSelector = screen.getByDisplayValue('Dark Theme');
    expect(themeSelector).toBeInTheDocument();
  });

  it('changes theme', () => {
    render(<App />);
    
    const themeSelector = screen.getByDisplayValue('Dark Theme');
    fireEvent.change(themeSelector, { target: { value: 'light' } });
    
    expect(themeSelector).toHaveValue('light');
  });
});