import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { ElementRenderer3D } from '@/components/Canvas3D/Elements/ElementRenderer3D';
import { useDesignStore } from '@/stores/designStore';

jest.mock('@/stores/designStore');
const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;

// Mock all 3D element components
jest.mock('@/components/Canvas3D/Elements/Wall3D', () => ({
  Wall3D: ({ wallId }: { wallId: string }) => <group data-testid={`wall-${wallId}`} />
}));

jest.mock('@/components/Canvas3D/Elements/Door3D', () => ({
  Door3D: ({ doorId }: { doorId: string }) => <group data-testid={`door-${doorId}`} />
}));

jest.mock('@/components/Canvas3D/Elements/Window3D', () => ({
  Window3D: ({ windowId }: { windowId: string }) => <group data-testid={`window-${windowId}`} />
}));

jest.mock('@/components/Canvas3D/Elements/Room3D', () => ({
  Room3D: ({ roomId }: { roomId: string }) => <group data-testid={`room-${roomId}`} />
}));

jest.mock('@/components/Canvas3D/Elements/Stair3D', () => ({
  Stair3D: ({ stairId }: { stairId: string }) => <group data-testid={`stair-${stairId}`} />
}));

jest.mock('@/components/Canvas3D/Elements/Roof3D', () => ({
  Roof3D: ({ roofId }: { roofId: string }) => <group data-testid={`roof-${roofId}`} />
}));

jest.mock('@/components/Canvas3D/Tools/SelectionGizmo3D', () => ({
  SelectionGizmo3D: () => <group data-testid="selection-gizmo" />
}));

describe('ElementRenderer3D', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        walls: [{ id: 'wall-1' }, { id: 'wall-2' }],
        doors: [{ id: 'door-1' }],
        windows: [{ id: 'window-1' }],
        stairs: [{ id: 'stair-1' }],
        rooms: [{ id: 'room-1' }],
        roofs: [{ id: 'roof-1' }],
      };
      return selector(state);
    });
  });

  it('renders without crashing', () => {
    render(
      <Canvas>
        <ElementRenderer3D />
      </Canvas>
    );
  });

  it('renders all element types from store', () => {
    const { container } = render(
      <Canvas>
        <ElementRenderer3D />
      </Canvas>
    );

    // Check that elements are rendered (they exist in the DOM)
    expect(container.querySelector('[data-testid="wall-wall-1"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="wall-wall-2"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="door-door-1"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="window-window-1"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="stair-stair-1"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="room-room-1"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="roof-roof-1"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="selection-gizmo"]')).toBeTruthy();
  });

  it('renders empty when no elements in store', () => {
    mockUseDesignStore.mockImplementation((selector) => {
      const state = {
        walls: [],
        doors: [],
        windows: [],
        stairs: [],
        rooms: [],
        roofs: [],
      };
      return selector(state);
    });

    const { container } = render(
      <Canvas>
        <ElementRenderer3D />
      </Canvas>
    );

    expect(container.querySelector('[data-testid^="wall-"]')).toBeFalsy();
    expect(container.querySelector('[data-testid^="door-"]')).toBeFalsy();
    expect(container.querySelector('[data-testid^="window-"]')).toBeFalsy();
  });
});