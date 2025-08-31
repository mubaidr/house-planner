import { render, screen, fireEvent } from '@testing-library/react';
import App from '@/App';
import { useDesignStore } from '@/stores/designStore';

// Mock the design store
jest.mock('@/stores/designStore');
const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;

// Mock keyboard shortcuts hook
jest.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: jest.fn(),
}));

// Mock all major components
jest.mock('@/components/Layout/CADLayout', () => ({
  CADLayout: ({ theme, workspaceLayout, activeTool }: any) => (
    <div data-testid="cad-layout">
      CADLayout - {theme} - {workspaceLayout} - {activeTool}
    </div>
  )
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

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseDesignStore.mockReturnValue('wall');
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('cad-layout')).toBeInTheDocument();
  });

  it('renders CAD interface by default', () => {
    render(<App />);
    
    expect(screen.getByTestId('cad-layout')).toBeInTheDocument();
    expect(screen.getByText('Simple UI')).toBeInTheDocument();
  });

  it('switches to simple interface when button is clicked', () => {
    render(<App />);
    
    const switchButton = screen.getByText('Simple UI');
    fireEvent.click(switchButton);
    
    expect(screen.getByTestId('scene3d')).toBeInTheDocument();
    expect(screen.getByTestId('tool-panel')).toBeInTheDocument();
    expect(screen.getByTestId('view-controls')).toBeInTheDocument();
    expect(screen.getByTestId('properties-panel')).toBeInTheDocument();
    expect(screen.getByText('CAD UI')).toBeInTheDocument();
  });

  it('switches back to CAD interface from simple interface', () => {
    render(<App />);
    
    // Switch to simple
    const switchToSimple = screen.getByText('Simple UI');
    fireEvent.click(switchToSimple);
    
    // Switch back to CAD
    const switchToCAD = screen.getByText('CAD UI');
    fireEvent.click(switchToCAD);
    
    expect(screen.getByTestId('cad-layout')).toBeInTheDocument();
    expect(screen.getByText('Simple UI')).toBeInTheDocument();
  });

  it('renders theme selector', () => {
    render(<App />);
    
    const themeSelector = screen.getByDisplayValue('Dark Theme');
    expect(themeSelector).toBeInTheDocument();
  });

  it('changes theme when selector is changed', () => {
    render(<App />);
    
    const themeSelector = screen.getByDisplayValue('Dark Theme');
    fireEvent.change(themeSelector, { target: { value: 'light' } });
    
    expect(themeSelector).toHaveValue('light');
  });

  it('applies cursor class based on active tool', () => {
    mockUseDesignStore.mockReturnValue('wall');
    
    const { container } = render(<App />);
    
    const appContainer = container.firstChild as HTMLElement;
    expect(appContainer).toHaveClass('cursor-crosshair');
  });

  it('applies different cursor for door tool', () => {
    mockUseDesignStore.mockReturnValue('add-door');
    
    const { container } = render(<App />);
    
    const appContainer = container.firstChild as HTMLElement;
    expect(appContainer).toHaveClass('cursor-pointer');
  });

  it('applies default cursor when no tool is active', () => {
    mockUseDesignStore.mockReturnValue(null);
    
    const { container } = render(<App />);
    
    const appContainer = container.firstChild as HTMLElement;
    expect(appContainer).toHaveClass('cursor-default');
  });

  it('renders context menu in both interfaces', () => {
    render(<App />);
    
    expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    
    // Switch to simple interface
    const switchButton = screen.getByText('Simple UI');
    fireEvent.click(switchButton);
    
    expect(screen.getByTestId('context-menu')).toBeInTheDocument();
  });

  it('passes correct props to CADLayout', () => {
    mockUseDesignStore.mockReturnValue('measure');
    
    render(<App />);
    
    const cadLayout = screen.getByTestId('cad-layout');
    expect(cadLayout).toHaveTextContent('dark');
    expect(cadLayout).toHaveTextContent('3d-modeling');
    expect(cadLayout).toHaveTextContent('measure');
  });

  it('maintains theme state across interface switches', () => {
    render(<App />);
    
    // Change theme
    const themeSelector = screen.getByDisplayValue('Dark Theme');
    fireEvent.change(themeSelector, { target: { value: 'light' } });
    
    // Switch to simple interface
    const switchButton = screen.getByText('Simple UI');
    fireEvent.click(switchButton);
    
    // Switch back to CAD
    const switchToCAD = screen.getByText('CAD UI');
    fireEvent.click(switchToCAD);
    
    // Theme should be preserved
    const themeSelector2 = screen.getByDisplayValue('Light Theme');
    expect(themeSelector2).toBeInTheDocument();
  });

  it('renders with full screen dimensions', () => {
    const { container } = render(<App />);
    
    const appContainer = container.firstChild as HTMLElement;
    expect(appContainer).toHaveClass('h-screen', 'w-screen');
  });
});