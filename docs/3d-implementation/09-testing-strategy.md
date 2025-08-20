# Testing Strategy

> Comprehensive testing strategy for 3D House Planner implementation covering unit, integration, performance, and user acceptance testing

---

## 🚨 Testing Foundation Update

**As of August 2025, all 3D testing will be layered on and extend [CodeHole7/threejs-3d-room-designer](https://github.com/CodeHole7/threejs-3d-room-designer), a React-bundled Three.js room planner and product configurator.**

### Testing Adaptation

- All testing strategies below are to be interpreted as customizations, extensions, or integrations with the base project.
- Custom features (multi-floor, advanced export, material system, accessibility, etc.) will be layered on top using the extensibility points provided by the base project.
- Maintain compatibility and leverage the base's React/Three.js architecture for all new features.

---

## 🧪 Testing Overview

This document outlines a comprehensive testing strategy to ensure the 3D House Planner implementation meets quality standards, maintains performance benchmarks, and provides excellent user experience while preserving all existing 2D functionality.

**Testing Philosophy**: Test early, test often, test comprehensively - ensuring both new 3D features and existing 2D functionality work flawlessly together.

---

## 📋 Testing Scope & Objectives

### Primary Objectives

- **Functionality Verification**: Ensure all 3D features work as specified
- **Integration Validation**: Verify seamless 2D-3D interoperability
- **Performance Assurance**: Maintain target performance metrics
- **Regression Prevention**: Ensure existing 2D features remain unaffected
- **User Experience Validation**: Confirm intuitive and professional user experience

### Testing Scope

**In Scope**:

- All new 3D rendering components
- 2D-3D data synchronization
- Camera controls and navigation
- Material and lighting systems, including element-specific libraries
- Roof generation and placement
- Placement constraints (orthogonal rooms, doors-in-walls, roof-on-house)
- Snapping logic (grid, angle, element)
- Export and import functionality
- Performance optimization features
- Cross-browser compatibility
- Accessibility compliance

**Out of Scope**:

- Existing 2D functionality (covered by existing tests)
- Third-party library internals (Three.js, React Three Fiber)
- Browser-specific WebGL implementations

---

## 🏗️ Testing Architecture

### Test Pyramid Structure

```text
                    E2E Tests (5%)
                   /               \
              Integration Tests (25%)
             /                         \
        Component Tests (35%)
       /                                 \
  Unit Tests (35%)
```

### Testing Framework Stack

```typescript
// Jest Configuration for 3D Testing
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/jest.3d.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^three$': '<rootDir>/__mocks__/three.js',
    '^@react-three/fiber$': '<rootDir>/__mocks__/react-three-fiber.js',
  },
  transformIgnorePatterns: ['node_modules/(?!(three|@react-three)/)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/components/Canvas3D/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
```

### Mock Setup for 3D Testing

```typescript
// __mocks__/three.js
export const Scene = jest.fn(() => ({
  add: jest.fn(),
  remove: jest.fn(),
  children: [],
  traverse: jest.fn(),
}));

export const WebGLRenderer = jest.fn(() => ({
  render: jest.fn(),
  setSize: jest.fn(),
  setPixelRatio: jest.fn(),
  setClearColor: jest.fn(),
  dispose: jest.fn(),
  domElement: document.createElement('canvas'),
  info: {
    render: {
      triangles: 0,
      calls: 0,
      points: 0,
      lines: 0,
    },
    memory: {
      geometries: 0,
      textures: 0,
    },
  },
}));

export const PerspectiveCamera = jest.fn(() => ({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  lookAt: jest.fn(),
  updateMatrixWorld: jest.fn(),
}));

export const Vector3 = jest.fn((x = 0, y = 0, z = 0) => ({
  x,
  y,
  z,
  add: jest.fn(),
  sub: jest.fn(),
  multiply: jest.fn(),
  clone: jest.fn(() => new Vector3(x, y, z)),
  distanceTo: jest.fn(() => 1),
}));

export const BoxGeometry = jest.fn();
export const MeshStandardMaterial = jest.fn();
export const Mesh = jest.fn(() => ({
  position: new Vector3(),
  rotation: { x: 0, y: 0, z: 0 },
  scale: new Vector3(1, 1, 1),
}));
```

---

## 🔬 Unit Testing Strategy

### Component Unit Tests

```typescript
// __tests__/components/Canvas3D/Scene3D.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Scene3D } from '@/components/Canvas3D/Scene3D';
import { useDesignStore } from '@/stores/designStore';

// Mock the design store
jest.mock('@/stores/designStore');
const mockUseDesignStore = useDesignStore as jest.MockedFunction<typeof useDesignStore>;

describe('Scene3D Component', () => {
  beforeEach(() => {
    mockUseDesignStore.mockReturnValue({
      walls: [
        {
          id: 'wall-1',
          startX: 0,
          startY: 0,
          endX: 10,
          endY: 0,
          thickness: 0.2,
          height: 3,
          color: '#cccccc',
        }
      ],
      rooms: [],
      doors: [],
      windows: [],
    });
  });

  it('renders without crashing', () => {
    render(<Scene3D />);
    const canvas = screen.getByRole('canvas', { hidden: true });
    expect(canvas).toBeInTheDocument();
  });

  it('initializes WebGL renderer with correct settings', () => {
    render(<Scene3D />);

    expect(WebGLRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    );
  });

  it('creates wall geometry from design data', () => {
    render(<Scene3D />);

    // Verify BoxGeometry is called with wall dimensions
    expect(BoxGeometry).toHaveBeenCalledWith(10, 3, 0.2);
  });

  it('handles WebGL context loss gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<Scene3D />);

    // Simulate context loss
    const canvas = screen.getByRole('canvas', { hidden: true });
    const contextLostEvent = new Event('webglcontextlost');
    canvas.dispatchEvent(contextLostEvent);

    expect(consoleSpy).toHaveBeenCalledWith('WebGL context lost');

    consoleSpy.mockRestore();
  });
});
```

### Hook Unit Tests

```typescript
// __tests__/hooks/useScene3D.test.ts
import { renderHook, act } from '@testing-library/react';
import { useScene3D } from '@/hooks/useScene3D';

describe('useScene3D Hook', () => {
  it('initializes with disabled state', () => {
    const { result } = renderHook(() => useScene3D());

    expect(result.current.isEnabled).toBe(false);
    expect(result.current.scene).toBeNull();
    expect(result.current.camera).toBeNull();
  });

  it('enables 3D scene with proper initialization', async () => {
    const { result } = renderHook(() => useScene3D());

    await act(async () => {
      await result.current.enable();
    });

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.scene).toBeDefined();
    expect(result.current.camera).toBeDefined();
  });

  it('syncs data from 2D design store', async () => {
    const { result } = renderHook(() => useScene3D());

    await act(async () => {
      await result.current.enable();
    });

    const mockDesign = {
      walls: [{ id: 'wall-1', startX: 0, startY: 0, endX: 5, endY: 0 }],
      rooms: [],
      doors: [],
      windows: [],
    };

    await act(async () => {
      await result.current.syncFromDesign(mockDesign);
    });

    expect(result.current.scene?.children.length).toBeGreaterThan(0);
  });

  it('cleans up resources on disable', async () => {
    const { result } = renderHook(() => useScene3D());

    await act(async () => {
      await result.current.enable();
    });

    const scene = result.current.scene;
    const disposeSpy = jest.spyOn(scene!, 'dispose' as any);

    await act(async () => {
      await result.current.disable();
    });

    expect(result.current.isEnabled).toBe(false);
    expect(disposeSpy).toHaveBeenCalled();
  });
});
```

### Utility Function Tests

```typescript
// __tests__/utils/3d/geometryUtils.test.ts
import {
  generateWallGeometry,
  generateRoomGeometry,
  generateRoofGeometry,
} from '@/utils/3d/geometryUtils';
import { Wall, Room, Roof } from '@/types';

describe('3D Geometry Utils', () => {
  describe('generateWallGeometry', () => {
    it('creates correct geometry for horizontal wall', () => {
      const wall: Wall = {
        id: 'wall-1',
        startX: 0,
        startY: 0,
        endX: 10,
        endY: 0,
        thickness: 0.2,
        height: 3,
      };

      const geometry = generateWallGeometry(wall);

      expect(geometry.parameters.width).toBe(10);
      expect(geometry.parameters.height).toBe(3);
      expect(geometry.parameters.depth).toBe(0.2);
    });

    it('creates correct geometry for diagonal wall', () => {
      const wall: Wall = {
        id: 'wall-2',
        startX: 0,
        startY: 0,
        endX: 3,
        endY: 4,
        thickness: 0.2,
        height: 3,
      };

      const geometry = generateWallGeometry(wall);
      const expectedLength = Math.sqrt(3 * 3 + 4 * 4); // 5

      expect(geometry.parameters.width).toBe(expectedLength);
    });

    it('handles zero-length walls gracefully', () => {
      const wall: Wall = {
        id: 'wall-3',
        startX: 5,
        startY: 5,
        endX: 5,
        endY: 5,
        thickness: 0.2,
        height: 3,
      };

      const geometry = generateWallGeometry(wall);

      expect(geometry.parameters.width).toBe(0.01); // Minimum wall length
    });
  });

  describe('generateRoomGeometry', () => {
    it('creates floor geometry from room points', () => {
      const room: Room = {
        id: 'room-1',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 8 },
          { x: 0, y: 8 },
        ],
        area: 80,
      };

      const { floorGeometry, ceilingGeometry } = generateRoomGeometry(room);

      expect(floorGeometry).toBeDefined();
      expect(ceilingGeometry).toBeDefined();
    });

    it('handles irregular room shapes', () => {
      const room: Room = {
        id: 'room-2',
        points: [
          { x: 0, y: 0 },
          { x: 5, y: 0 },
          { x: 7, y: 3 },
          { x: 3, y: 6 },
          { x: 0, y: 4 },
        ],
        area: 22.5,
      };

      const { floorGeometry } = generateRoomGeometry(room);

      expect(floorGeometry).toBeDefined();
      expect(floorGeometry.parameters.shapes).toBeDefined();
    });
  });

  describe('generateRoofGeometry', () => {
    it('creates gable roof geometry correctly', () => {
      const roof: Roof = {
        id: 'roof-1',
        pitch: 30,
        overhang: 0.5,
        type: 'gable',
      };
      const footprint = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 8 },
        { x: 0, y: 8 },
      ];

      const geometry = generateRoofGeometry(roof, footprint);
      expect(geometry).toBeDefined();
      // Add more specific assertions about the roof geometry
    });
  });
});
```

---

## 🔗 Integration Testing Strategy

### 2D-3D Synchronization Tests

```typescript
// __tests__/integration/2d3dSync.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppLayout } from '@/components/AppLayout';
import { useDesignStore } from '@/stores/designStore';

describe('2D-3D Synchronization', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('synchronizes wall creation from 2D to 3D', async () => {
    render(<AppLayout />);

    // Switch to wall tool in 2D mode
    await user.click(screen.getByText('Wall Tool'));

    // Create a wall in 2D
    const canvas2D = screen.getByTestId('canvas-2d');
    await user.click(canvas2D);
    fireEvent.click(canvas2D, { clientX: 100, clientY: 100 });
    fireEvent.click(canvas2D, { clientX: 200, clientY: 100 });

    // Switch to 3D mode
    await user.click(screen.getByText('3D View'));

    // Verify wall appears in 3D
    await waitFor(() => {
      const canvas3D = screen.getByTestId('canvas-3d');
      expect(canvas3D).toBeInTheDocument();
    });

    const store = useDesignStore.getState();
    expect(store.walls).toHaveLength(1);
    expect(store.walls[0].startX).toBe(100);
    expect(store.walls[0].endX).toBe(200);
  });

  it('synchronizes wall modifications from 3D to 2D', async () => {
    // Setup initial wall
    const { rerender } = render(<AppLayout />);

    const store = useDesignStore.getState();
    store.addWall({
      id: 'wall-1',
      startX: 0,
      startY: 0,
      endX: 10,
      endY: 0,
      thickness: 0.2,
      height: 3,
    });

    rerender(<AppLayout />);

    // Switch to 3D mode
    await user.click(screen.getByText('3D View'));

    // Select and move wall in 3D
    const canvas3D = screen.getByTestId('canvas-3d');
    await user.click(canvas3D);

    // Simulate wall movement (this would trigger transform controls)
    fireEvent.mouseDown(canvas3D, { clientX: 150, clientY: 150 });
    fireEvent.mouseMove(canvas3D, { clientX: 160, clientY: 150 });
    fireEvent.mouseUp(canvas3D);

    // Switch back to 2D mode
    await user.click(screen.getByText('2D View'));

    // Verify wall position updated in 2D
    const updatedWall = useDesignStore.getState().walls[0];
    expect(updatedWall.startX).not.toBe(0); // Position should have changed
  });

  it('maintains selection state across mode switches', async () => {
    // Setup wall and select it in 2D
    render(<AppLayout />);

    const store = useDesignStore.getState();
    store.addWall({
      id: 'wall-1',
      startX: 0,
      startY: 0,
      endX: 10,
      endY: 0,
      thickness: 0.2,
      height: 3,
    });

    // Select wall in 2D
    const canvas2D = screen.getByTestId('canvas-2d');
    await user.click(canvas2D);

    store.selectElement('wall-1', 'wall');

    // Switch to 3D mode
    await user.click(screen.getByText('3D View'));

    // Verify selection maintained
    expect(store.selectedElementId).toBe('wall-1');
    expect(store.selectedElementType).toBe('wall');

    // Switch back to 2D
    await user.click(screen.getByText('2D View'));

    // Verify selection still maintained
    expect(store.selectedElementId).toBe('wall-1');
  });

  it('prevents placing a door outside of a wall', async () => {
    render(<AppLayout />);
    // Switch to 3D mode and door tool
    await user.click(screen.getByText('3D View'));
    await user.click(screen.getByText('Door Tool'));

    // Attempt to place door in empty space
    const canvas3D = screen.getByTestId('canvas-3d');
    await user.click(canvas3D, { clientX: 300, clientY: 300 });

    // Verify no door was created
    const store = useDesignStore.getState();
    expect(store.doors).toHaveLength(0);
    expect(screen.getByText(/must be placed inside a wall/i)).toBeInTheDocument();
  });

  it('enforces orthogonal wall drawing when constraint is active', async () => {
    render(<AppLayout />);
    // Ensure orthogonal lock is on
    const store = useDesignStore.getState();
    store.setOrthogonalLock(true);

    // Draw a non-orthogonal wall
    const canvas2D = screen.getByTestId('canvas-2d');
    await user.click(canvas2D, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas2D, { clientX: 150, clientY: 120 }); // Move to a non-90-degree angle
    fireEvent.click(canvas2D, { clientX: 150, clientY: 120 });

    // Verify the created wall is orthogonal
    const wall = store.walls[0];
    const angle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX) * (180 / Math.PI);
    expect(Math.abs(angle) % 90).toBe(0);
  });
});
```

### Export Integration Tests

```typescript
// __tests__/integration/export3D.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportDialog } from '@/components/Export/ExportDialog';
import { Export3DSystem } from '@/utils/3d/export3D';

// Mock file download
const mockDownload = jest.fn();
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock download function
jest.mock('@/utils/download', () => ({
  downloadBlob: mockDownload,
}));

describe('3D Export Integration', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let exportSystem: Export3DSystem;

  beforeEach(() => {
    user = userEvent.setup();
    exportSystem = new Export3DSystem();
    mockDownload.mockClear();
  });

  it('exports 3D model in GLTF format', async () => {
    render(<ExportDialog isOpen={true} onClose={() => {}} />);

    // Select 3D model export
    await user.click(screen.getByLabelText(/3D Model/));
    await user.selectOptions(screen.getByLabelText(/Format/), 'gltf');

    // Trigger export
    await user.click(screen.getByText('Export'));

    await waitFor(() => {
      expect(mockDownload).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringContaining('.gltf')
      );
    });
  });

  it('exports high-resolution image', async () => {
    render(<ExportDialog isOpen={true} onClose={() => {}} />);

    // Select image export
    await user.click(screen.getByLabelText(/High-Resolution Image/));
    await user.selectOptions(screen.getByLabelText(/Quality/), 'ultra');

    // Trigger export
    await user.click(screen.getByText('Export'));

    await waitFor(() => {
      expect(mockDownload).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringContaining('.png')
      );
    }, { timeout: 10000 }); // High-res export may take time
  });

  it('handles export errors gracefully', async () => {
    // Mock export failure
    jest.spyOn(exportSystem, 'exportGLTF').mockRejectedValue(new Error('Export failed'));

    render(<ExportDialog isOpen={true} onClose={() => {}} />);

    await user.click(screen.getByLabelText(/3D Model/));
    await user.click(screen.getByText('Export'));

    await waitFor(() => {
      expect(screen.getByText(/Export failed/)).toBeInTheDocument();
    });
  });
});
```

---

## ⚡ Performance Testing Strategy

### Frame Rate Testing

```typescript
// __tests__/performance/frameRate.test.ts
import { PerformanceMonitor } from '@/utils/3d/performanceMonitor';
import { Scene3DManager } from '@/utils/3d/scene3DManager';

describe('Frame Rate Performance', () => {
  let monitor: PerformanceMonitor;
  let sceneManager: Scene3DManager;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    sceneManager = new Scene3DManager();
  });

  it('maintains 60 FPS with simple scene', async () => {
    // Create simple scene with 1 room, 4 walls
    const simpleDesign = {
      walls: Array.from({ length: 4 }, (_, i) => ({
        id: `wall-${i}`,
        startX: i * 5,
        startY: 0,
        endX: (i + 1) * 5,
        endY: 0,
        thickness: 0.2,
        height: 3,
      })),
      rooms: [
        {
          id: 'room-1',
          points: [
            { x: 0, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 15 },
            { x: 0, y: 15 },
          ],
          area: 300,
        },
      ],
    };

    await sceneManager.initialize({
      canvas: document.createElement('canvas'),
    });

    await sceneManager.syncFromDesign(simpleDesign);

    // Run performance test for 5 seconds
    monitor.startMonitoring();

    await new Promise(resolve => {
      let frameCount = 0;
      const targetFrames = 300; // 60 FPS * 5 seconds

      const animate = () => {
        monitor.startFrame();
        sceneManager.render();
        monitor.endFrame();

        frameCount++;
        if (frameCount < targetFrames) {
          requestAnimationFrame(animate);
        } else {
          resolve(void 0);
        }
      };

      animate();
    });

    const metrics = monitor.getPerformanceMetrics();
    expect(metrics.fps).toBeGreaterThanOrEqual(55); // Allow 5 FPS margin
  });

  it('degrades gracefully with complex scene', async () => {
    // Create complex scene with 50 rooms, 200 walls
    const complexDesign = generateComplexDesign(50, 200);

    await sceneManager.initialize({
      canvas: document.createElement('canvas'),
    });

    await sceneManager.syncFromDesign(complexDesign);

    monitor.startMonitoring();

    // Test for shorter duration due to complexity
    await simulateFrames(60); // 1 second at 60 FPS

    const metrics = monitor.getPerformanceMetrics();
    expect(metrics.fps).toBeGreaterThanOrEqual(25); // Minimum acceptable FPS
  });
});

function generateComplexDesign(roomCount: number, wallCount: number) {
  // Helper to generate large, complex designs for testing
  return {
    walls: Array.from({ length: wallCount }, (_, i) => ({
      id: `wall-${i}`,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      endX: Math.random() * 100,
      endY: Math.random() * 100,
      thickness: 0.2,
      height: 3,
    })),
    rooms: Array.from({ length: roomCount }, (_, i) => ({
      id: `room-${i}`,
      points: generateRandomRoomPoints(),
      area: Math.random() * 50 + 10,
    })),
  };
}
```

### Memory Testing

```typescript
// __tests__/performance/memory.test.ts
import { MemoryManager } from '@/utils/3d/memoryManager';
import { Scene3DManager } from '@/utils/3d/scene3DManager';

describe('Memory Management', () => {
  let memoryManager: MemoryManager;
  let sceneManager: Scene3DManager;

  beforeEach(() => {
    memoryManager = new MemoryManager();
    sceneManager = new Scene3DManager();
  });

  it('cleans up resources when scene is destroyed', async () => {
    const initialMemory = memoryManager.checkMemoryUsage();

    // Create and destroy scenes multiple times
    for (let i = 0; i < 10; i++) {
      await sceneManager.initialize({
        canvas: document.createElement('canvas'),
      });

      // Add some geometry
      await sceneManager.syncFromDesign({
        walls: [
          {
            id: `wall-${i}`,
            startX: 0,
            startY: 0,
            endX: 10,
            endY: 0,
            thickness: 0.2,
            height: 3,
          },
        ],
      });

      await sceneManager.destroy();
    }

    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
    }

    const finalMemory = memoryManager.checkMemoryUsage();
    const memoryIncrease = finalMemory.used - initialMemory.used;

    // Memory increase should be minimal (< 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });

  it('triggers cleanup when memory threshold exceeded', async () => {
    const cleanupSpy = jest.spyOn(memoryManager, 'forceCleanup' as any);

    // Set low threshold for testing
    (memoryManager as any).memoryThreshold = 1; // 1 byte

    memoryManager.checkMemoryUsage();
    memoryManager.cleanupIfNeeded();

    expect(cleanupSpy).toHaveBeenCalled();
  });
});
```

---

## 🌐 Cross-Browser Testing

### Browser Compatibility Matrix

```typescript
// __tests__/compatibility/browserSupport.test.ts
describe('Browser Compatibility', () => {
  const mockUserAgents = {
    chrome:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    safari:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
  };

  Object.entries(mockUserAgents).forEach(([browser, userAgent]) => {
    describe(`${browser} compatibility`, () => {
      beforeEach(() => {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          configurable: true,
        });
      });

      it('detects WebGL support', () => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        expect(gl).toBeTruthy();
      });

      it('provides appropriate feature detection', () => {
        const capabilities = detectBrowserCapabilities();

        if (browser === 'safari') {
          // Safari has some WebGL limitations
          expect(capabilities.webgl2).toBeDefined();
        } else {
          expect(capabilities.webgl2).toBe(true);
        }
      });
    });
  });
});

function detectBrowserCapabilities() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) {
    return { webgl2: false, webgl: false };
  }

  return {
    webgl: true,
    webgl2: !!canvas.getContext('webgl2'),
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
  };
}
```

---

## ♿ Accessibility Testing

### Screen Reader Compatibility

```typescript
// __tests__/accessibility/screenReader.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Scene3D } from '@/components/Canvas3D/Scene3D';

describe('Screen Reader Accessibility', () => {
  it('provides alternative text for 3D scene', () => {
    render(<Scene3D />);

    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toHaveAttribute('aria-label', expect.stringContaining('3D'));
  });

  it('announces scene changes to screen readers', async () => {
    const { rerender } = render(<Scene3D />);

    // Simulate adding a wall
    const sceneWithWall = (
      <Scene3D ariaLive="polite" />
    );

    rerender(sceneWithWall);

    const announcement = screen.getByRole('status');
    expect(announcement).toHaveTextContent(/wall added/i);
  });

  it('provides keyboard navigation for 3D controls', () => {
    render(<Scene3D />);

    const controls = screen.getByTestId('3d-controls');
    expect(controls).toHaveAttribute('tabIndex', '0');
    expect(controls).toHaveAttribute('role', 'application');
  });
});
```

### Keyboard Navigation Tests

```typescript
// __tests__/accessibility/keyboard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Camera3DControls } from '@/components/Canvas3D/Camera3DControls';

describe('Keyboard Navigation', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('navigates camera with keyboard shortcuts', async () => {
    const onCameraChange = jest.fn();
    render(<Camera3DControls onCameraChange={onCameraChange} />);

    const controls = screen.getByTestId('camera-controls');
    controls.focus();

    // Test camera movement keys
    await user.keyboard('{ArrowUp}'); // Move forward
    await user.keyboard('{ArrowDown}'); // Move backward
    await user.keyboard('{ArrowLeft}'); // Turn left
    await user.keyboard('{ArrowRight}'); // Turn right

    expect(onCameraChange).toHaveBeenCalledTimes(4);
  });

  it('cycles through view presets with Tab key', async () => {
    render(<Camera3DControls />);

    const presetButtons = screen.getAllByRole('button', { name: /view/i });

    // Tab through presets
    await user.tab();
    expect(presetButtons[0]).toHaveFocus();

    await user.tab();
    expect(presetButtons[1]).toHaveFocus();
  });

  it('activates controls with Enter and Space', async () => {
    const onPresetChange = jest.fn();
    render(<Camera3DControls onPresetChange={onPresetChange} />);

    const isometricButton = screen.getByRole('button', { name: /isometric/i });
    isometricButton.focus();

    await user.keyboard('{Enter}');
    expect(onPresetChange).toHaveBeenCalledWith('isometric');

    await user.keyboard('{Space}');
    expect(onPresetChange).toHaveBeenCalledTimes(2);
  });
});
```

---

## 📱 End-to-End Testing

### Complete Workflow Tests

```typescript
// __tests__/e2e/complete3dWorkflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete 3D Workflow', () => {
  test('user can create house design and export 3D model', async ({ page }) => {
    await page.goto('/');

    // Create basic house in 2D mode
    await page.click('[data-testid="wall-tool"]');

    // Draw rectangle room
    const canvas = page.locator('[data-testid="canvas-2d"]');
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 300, y: 100 } });
    await canvas.click({ position: { x: 300, y: 250 } });
    await canvas.click({ position: { x: 100, y: 250 } });
    await canvas.click({ position: { x: 100, y: 100 } }); // Close room

    // Add door
    await page.click('[data-testid="door-tool"]');
    await canvas.click({ position: { x: 200, y: 100 } });

    // Add window
    await page.click('[data-testid="window-tool"]');
    await canvas.click({ position: { x: 150, y: 250 } });

    // Switch to 3D mode
    await page.click('[data-testid="3d-view-button"]');

    // Wait for 3D scene to load
    await expect(page.locator('[data-testid="canvas-3d"]')).toBeVisible();

    // Test camera controls
    await page.click('[data-testid="isometric-view"]');
    await page.waitForTimeout(1000); // Wait for animation

    await page.click('[data-testid="plan-view"]');
    await page.waitForTimeout(1000);

    // Test export
    await page.click('[data-testid="export-button"]');

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    await page.click('[data-testid="export-3d-model"]');
    await page.selectOption('[data-testid="export-format"]', 'gltf');
    await page.click('[data-testid="download-button"]');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.gltf');
  });

  test('3D features work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Create simple design
    await page.click('[data-testid="wall-tool"]');
    const canvas = page.locator('[data-testid="canvas-2d"]');
    await canvas.click({ position: { x: 50, y: 50 } });
    await canvas.click({ position: { x: 200, y: 50 } });

    // Switch to 3D mode
    await page.click('[data-testid="3d-view-button"]');

    // Test touch controls (simulated)
    const canvas3D = page.locator('[data-testid="canvas-3d"]');
    await canvas3D.touchstart({ position: { x: 100, y: 100 } });
    await canvas3D.touchmove({ position: { x: 150, y: 150 } });
    await canvas3D.touchend();

    // Verify 3D scene responds to touch
    await expect(canvas3D).toBeVisible();
  });

  test('handles WebGL context loss gracefully', async ({ page }) => {
    await page.goto('/');

    // Create design and switch to 3D
    await page.click('[data-testid="wall-tool"]');
    const canvas = page.locator('[data-testid="canvas-2d"]');
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 200, y: 100 } });

    await page.click('[data-testid="3d-view-button"]');
    await expect(page.locator('[data-testid="canvas-3d"]')).toBeVisible();

    // Simulate context loss
    await page.evaluate(() => {
      const canvas = document.querySelector('[data-testid="canvas-3d"]') as HTMLCanvasElement;
      const gl = canvas.getContext('webgl');
      if (gl) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) {
          ext.loseContext();
        }
      }
    });

    // Verify error handling
    await expect(page.locator('[data-testid="webgl-error-message"]')).toBeVisible();

    // Verify 2D mode still works
    await page.click('[data-testid="2d-view-button"]');
    await expect(page.locator('[data-testid="canvas-2d"]')).toBeVisible();
  });
});
```

---

## 📊 Test Coverage & Reporting

### Coverage Requirements

```javascript
// jest.config.js - Coverage Configuration
module.exports = {
  collectCoverageFrom: [
    'src/components/Canvas3D/**/*.{ts,tsx}',
    'src/hooks/*3D*.{ts,tsx}',
    'src/utils/3d/**/*.{ts,tsx}',
    'src/stores/*3D*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{ts,tsx}',
    '!**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/components/Canvas3D/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/utils/3d/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
};
```

### Automated Testing Pipeline

```yaml
# .github/workflows/3d-testing.yml
name: 3D Feature Testing

on:
  push:
    branches: [main, develop]
    paths: ['src/components/Canvas3D/**', 'src/utils/3d/**']
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:3d:unit
      - run: npm run test:coverage:3d

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:3d:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npx playwright install
      - run: npm run test:3d:e2e

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:3d:performance

      - name: Performance regression check
        run: npm run test:performance:compare
```

This comprehensive testing strategy ensures that the 3D House Planner implementation will be thoroughly validated across all dimensions of quality, performance, and user experience while maintaining the reliability of existing 2D functionality.
