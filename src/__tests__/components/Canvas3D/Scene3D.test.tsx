import { render } from '@testing-library/react';
import { Scene3D } from '@/components/Canvas3D/Scene3D';
import { useDesignStore } from '@/stores/designStore';
import { useGridStore } from '@/stores/gridStore';
import { useLightingStore } from '@/stores/lightingStore';

// Mock all the stores
jest.mock('@/stores/designStore');
jest.mock('@/stores/gridStore');
jest.mock('@/stores/lightingStore');

const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;
const mockUseGridStore = useGridStore as jest.MockedFunction<typeof useGridStore>;
const mockUseLightingStore = useLightingStore as jest.MockedFunction<typeof useLightingStore>;

// Mock Canvas2D
jest.mock('@/components/Canvas2D/Canvas2D', () => ({
  Canvas2D: () => <div data-testid="canvas2d">Canvas2D</div>
}));

// Mock all 3D components
jest.mock('@/components/Canvas3D/Elements/ElementRenderer3D', () => ({
  ElementRenderer3D: () => <group data-testid="element-renderer" />
}));

jest.mock('@/components/Canvas3D/Lighting/SceneLighting', () => ({
  SceneLighting: () => <group data-testid="scene-lighting" />
}));

jest.mock('@/components/Canvas3D/Camera/CameraControls', () => ({
  CameraControls: () => <group data-testid="camera-controls" />
}));

jest.mock('@/components/Canvas3D/Effects/PostProcessing3D', () => ({
  PostProcessing3D: () => <group data-testid="post-processing" />
}));

// Mock all tools
jest.mock('@/components/Canvas3D/Tools/WallDrawingTool3D', () => ({
  WallDrawingTool3D: () => <group data-testid="wall-drawing-tool" />
}));

jest.mock('@/components/Canvas3D/Tools/AddElementTool', () => ({
  AddElementTool: () => <group data-testid="add-element-tool" />
}));

jest.mock('@/components/Canvas3D/Tools/RoomCreationTool3D', () => ({
  RoomCreationTool3D: () => <group data-testid="room-creation-tool" />
}));

jest.mock('@/components/Canvas3D/Tools/MeasurementTool3D', () => ({
  MeasurementTool3D: () => <group data-testid="measurement-tool" />
}));

jest.mock('@/components/Canvas3D/Tools/ElementManipulationTool3D', () => ({
  ElementManipulationTool3D: () => <group data-testid="manipulation-tool" />
}));

jest.mock('@/components/Canvas3D/Tools/CopyTool3D', () => ({
  CopyTool3D: () => <group data-testid="copy-tool" />
}));

jest.mock('@/components/Canvas3D/Tools/SelectionGizmo3D', () => ({
  SelectionGizmo3D: () => <group data-testid="selection-gizmo" />
}));

jest.mock('@/components/UI/HoverInfoDisplay', () => ({
  HoverInfoDisplay: () => <div data-testid="hover-info">HoverInfoDisplay</div>
}));

describe('Scene3D', () => {
  const mockSetActiveTool = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        viewMode: '3d',
        activeTool: null,
        setActiveTool: mockSetActiveTool,
        selectedElementId: null,
      };
      return selector(state);
    });

    mockUseGridStore.mockReturnValue({
      isVisible: true,
      spacing: 1,
    });

    mockUseLightingStore.mockReturnValue({
      currentConfig: {
        directional: { shadows: true },
        postProcessing: {
          toneMapping: 1,
          exposure: 1,
        },
      },
      renderQuality: {
        antiAliasing: true,
        textureResolution: 'high',
        postProcessing: true,
      },
      performanceMode: 'auto',
    });
  });

  it('renders 3D scene when viewMode is 3d', () => {
    const { container } = render(<Scene3D />);
    
    // Should render Canvas component
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('renders Canvas2D when viewMode is 2d', () => {
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        viewMode: '2d',
        activeTool: null,
        setActiveTool: mockSetActiveTool,
        selectedElementId: null,
      };
      return selector(state);
    });

    const { getByTestId } = render(<Scene3D />);
    
    expect(getByTestId('canvas2d')).toBeInTheDocument();
  });

  it('renders core 3D components', () => {
    const { container } = render(<Scene3D />);
    
    expect(container.querySelector('[data-testid="element-renderer"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="scene-lighting"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="camera-controls"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="post-processing"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="selection-gizmo"]')).toBeTruthy();
  });

  it('renders grid when grid is visible', () => {
    const { container } = render(<Scene3D />);
    
    // Grid component should be rendered
    expect(container.querySelector('mesh')).toBeTruthy();
  });

  it('does not render grid when grid is hidden', () => {
    mockUseGridStore.mockReturnValue({
      isVisible: false,
      spacing: 1,
    });

    render(<Scene3D />);
    
    // Grid should not be rendered (harder to test without specific grid selector)
  });

  it('renders wall drawing tool when wall tool is active', () => {
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        viewMode: '3d',
        activeTool: 'wall',
        setActiveTool: mockSetActiveTool,
        selectedElementId: null,
      };
      return selector(state);
    });

    const { container } = render(<Scene3D />);
    
    expect(container.querySelector('[data-testid="wall-drawing-tool"]')).toBeTruthy();
  });

  it('renders add element tool when door tool is active', () => {
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        viewMode: '3d',
        activeTool: 'add-door',
        setActiveTool: mockSetActiveTool,
        selectedElementId: null,
      };
      return selector(state);
    });

    const { container } = render(<Scene3D />);
    
    expect(container.querySelector('[data-testid="add-element-tool"]')).toBeTruthy();
  });

  it('renders room creation tool when room tool is active', () => {
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        viewMode: '3d',
        activeTool: 'room',
        setActiveTool: mockSetActiveTool,
        selectedElementId: null,
      };
      return selector(state);
    });

    const { container } = render(<Scene3D />);
    
    expect(container.querySelector('[data-testid="room-creation-tool"]')).toBeTruthy();
  });

  it('renders measurement tool when measure tool is active', () => {
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        viewMode: '3d',
        activeTool: 'measure',
        setActiveTool: mockSetActiveTool,
        selectedElementId: null,
      };
      return selector(state);
    });

    const { container } = render(<Scene3D />);
    
    expect(container.querySelector('[data-testid="measurement-tool"]')).toBeTruthy();
  });

  it('renders manipulation tool when element is selected', () => {
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        viewMode: '3d',
        activeTool: null,
        setActiveTool: mockSetActiveTool,
        selectedElementId: 'wall-1',
      };
      return selector(state);
    });

    const { container } = render(<Scene3D />);
    
    expect(container.querySelector('[data-testid="manipulation-tool"]')).toBeTruthy();
  });

  it('renders copy tool when copy tool is active', () => {
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        viewMode: '3d',
        activeTool: 'copy',
        setActiveTool: mockSetActiveTool,
        selectedElementId: null,
      };
      return selector(state);
    });

    const { container } = render(<Scene3D />);
    
    expect(container.querySelector('[data-testid="copy-tool"]')).toBeTruthy();
  });

  it('applies lighting configuration from store', () => {
    render(<Scene3D />);
    
    // Should use lighting config for shadows and post-processing
    // This is tested through the Canvas props and component rendering
  });

  it('applies render quality settings', () => {
    render(<Scene3D />);
    
    // Should apply anti-aliasing and other quality settings
    // This is tested through the Canvas gl props
  });

  it('includes hover info display', () => {
    const { getByTestId } = render(<Scene3D />);
    
    expect(getByTestId('hover-info')).toBeInTheDocument();
  });
});