import { render, screen } from '@testing-library/react';
import { CADLayout } from '@/components/Layout/CADLayout';

// Mock all the CAD components
jest.mock('@/components/Canvas3D/Scene3D', () => ({
  Scene3D: () => <div data-testid="scene3d">Scene3D</div>
}));

jest.mock('@/components/UI/CAD/MenuBar', () => ({
  MenuBar: () => <div data-testid="menubar">MenuBar</div>
}));

jest.mock('@/components/UI/CAD/ToolPalette', () => ({
  ToolPalette: () => <div data-testid="toolpalette">ToolPalette</div>
}));

jest.mock('@/components/UI/CAD/StatusBar', () => ({
  StatusBar: () => <div data-testid="statusbar">StatusBar</div>
}));

jest.mock('@/components/UI/CAD/PropertiesPalette', () => ({
  PropertiesPalette: () => <div data-testid="propertiespalette">PropertiesPalette</div>
}));

jest.mock('@/components/UI/CAD/LayerManager', () => ({
  LayerManager: () => <div data-testid="layermanager">LayerManager</div>
}));

jest.mock('@/components/UI/CAD/CommandLine', () => ({
  CommandLine: () => <div data-testid="commandline">CommandLine</div>
}));

jest.mock('@/components/UI/CAD/QuickAccessToolbar', () => ({
  QuickAccessToolbar: () => <div data-testid="quickaccess">QuickAccessToolbar</div>
}));

jest.mock('@/components/UI/CAD/NavigationCube', () => ({
  NavigationCube: () => <div data-testid="navigationcube">NavigationCube</div>
}));

jest.mock('@/components/UI/CAD/CoordinateDisplay', () => ({
  CoordinateDisplay: () => <div data-testid="coordinatedisplay">CoordinateDisplay</div>
}));

jest.mock('@/components/UI/CAD/ViewportManager', () => ({
  ViewportManager: () => <div data-testid="viewportmanager">ViewportManager</div>
}));

jest.mock('@/components/UI/CAD/ViewportTabs', () => ({
  ViewportTabs: () => <div data-testid="viewporttabs">ViewportTabs</div>
}));

// Mock the design store
jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => ({
    newProject: jest.fn(),
  }),
}));

describe('CADLayout', () => {
  const defaultProps = {
    theme: 'dark' as const,
    workspaceLayout: '3d-modeling' as const,
    activeTool: null as string | null,
  };

  it('renders without crashing', () => {
    render(<CADLayout {...defaultProps} />);
    expect(screen.getByTestId('scene3d')).toBeInTheDocument();
  });

  it('renders all CAD interface components', () => {
    render(<CADLayout {...defaultProps} />);
    
    expect(screen.getByTestId('menubar')).toBeInTheDocument();
    expect(screen.getByTestId('toolpalette')).toBeInTheDocument();
    expect(screen.getByTestId('statusbar')).toBeInTheDocument();
    expect(screen.getByTestId('propertiespalette')).toBeInTheDocument();
    expect(screen.getByTestId('layermanager')).toBeInTheDocument();
    expect(screen.getByTestId('commandline')).toBeInTheDocument();
    expect(screen.getByTestId('quickaccess')).toBeInTheDocument();
    expect(screen.getByTestId('navigationcube')).toBeInTheDocument();
    expect(screen.getByTestId('coordinatedisplay')).toBeInTheDocument();
    expect(screen.getByTestId('viewportmanager')).toBeInTheDocument();
    expect(screen.getByTestId('viewporttabs')).toBeInTheDocument();
  });

  it('renders Scene3D in the main viewport', () => {
    render(<CADLayout {...defaultProps} />);
    
    const scene3d = screen.getByTestId('scene3d');
    expect(scene3d).toBeInTheDocument();
  });

  it('applies correct layout structure', () => {
    const { container } = render(<CADLayout {...defaultProps} />);
    
    // Should have a main container with proper layout classes
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('h-screen', 'w-screen', 'flex', 'flex-col');
  });

  it('handles different workspace layouts', () => {
    const { rerender } = render(<CADLayout {...defaultProps} workspaceLayout="drafting" />);
    
    expect(screen.getByTestId('scene3d')).toBeInTheDocument();
    
    rerender(<CADLayout {...defaultProps} workspaceLayout="planning" />);
    expect(screen.getByTestId('scene3d')).toBeInTheDocument();
  });

  it('applies theme to components', () => {
    render(<CADLayout {...defaultProps} theme="light" />);
    
    // Components should receive the theme prop
    expect(screen.getByTestId('menubar')).toBeInTheDocument();
    expect(screen.getByTestId('statusbar')).toBeInTheDocument();
  });

  it('handles active tool state', () => {
    render(<CADLayout {...defaultProps} activeTool="wall" />);
    
    // Should pass active tool to relevant components
    expect(screen.getByTestId('toolpalette')).toBeInTheDocument();
  });

  it('maintains responsive layout', () => {
    const { container } = render(<CADLayout {...defaultProps} />);
    
    // Should have responsive classes
    const layout = container.firstChild as HTMLElement;
    expect(layout).toHaveClass('h-screen', 'w-screen');
  });

  it('organizes panels correctly', () => {
    render(<CADLayout {...defaultProps} />);
    
    // Left panel should contain tool palette and layer manager
    expect(screen.getByTestId('toolpalette')).toBeInTheDocument();
    expect(screen.getByTestId('layermanager')).toBeInTheDocument();
    
    // Right panel should contain properties
    expect(screen.getByTestId('propertiespalette')).toBeInTheDocument();
    
    // Bottom should contain command line and status bar
    expect(screen.getByTestId('commandline')).toBeInTheDocument();
    expect(screen.getByTestId('statusbar')).toBeInTheDocument();
  });

  it('includes navigation aids', () => {
    render(<CADLayout {...defaultProps} />);
    
    expect(screen.getByTestId('navigationcube')).toBeInTheDocument();
    expect(screen.getByTestId('coordinatedisplay')).toBeInTheDocument();
  });

  it('supports viewport management', () => {
    render(<CADLayout {...defaultProps} />);
    
    expect(screen.getByTestId('viewportmanager')).toBeInTheDocument();
    expect(screen.getByTestId('viewporttabs')).toBeInTheDocument();
  });
});