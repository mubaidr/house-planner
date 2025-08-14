
# Implementation Roadmap

> **Phase-by-phase development plan for implementing 3D capabilities with clear milestones and deliverables**

---

## 🚨 Roadmap Foundation Update

**As of August 2025, all implementation phases will be built on and extend [CodeHole7/threejs-3d-room-designer](https://github.com/CodeHole7/threejs-3d-room-designer), a React-bundled Three.js room planner and product configurator.**

### Roadmap Adaptation:
- All phases below are to be interpreted as customizations, extensions, or integrations with the base project.
- Custom features (multi-floor, advanced export, material system, accessibility, etc.) will be layered on top using the extensibility points provided by the base project.
- Maintain compatibility and leverage the base's React/Three.js architecture for all new features.

---

## 📋 Overview

This document provides a detailed implementation roadmap for adding 3D capabilities to the House Planner application. The plan is structured in progressive phases that build upon each other while maintaining application stability and user experience quality.

**Total Estimated Timeline**: 12 weeks
**Team Size**: 2-3 developers
**Approach**: Incremental development with continuous integration

---

## 🎯 Implementation Strategy

### Development Philosophy

- **Feature-Driven Development**: Organized around the three core feature areas from threejs-3d-room-designer
- **Incremental Enhancement**: Each phase adds value without breaking existing functionality
- **User-Centered Development**: Regular user testing and feedback integration
- **Quality First**: Comprehensive testing at each phase
- **Performance Focused**: Optimization built-in from the start

### Feature-Based Organization

Following the proven structure of threejs-3d-room-designer, development is organized around three core feature areas:

#### 1. **FloorPlan Design** 📐

- 3D design with top-down view for precise drawing
- Multi-floor support and vertical navigation
- Precision tools and measurement systems

#### 2. **Room Configuration** 🏠

- Interactive product placement in top-down and perspective views
- Environment management (lighting, materials)
- Multi-room relationships and flow

#### 3. **Product Configuration** ⚙️

- Dynamic product dimensions and morphing
- Advanced material and style systems
- Configuration presets and customization

### Risk Mitigation

- **Feature Flags**: All 3D features behind feature toggles
- **Fallback Support**: 2D mode always available as backup
- **Progressive Loading**: 3D assets loaded only when needed
- **Browser Compatibility**: Graceful degradation for unsupported browsers

---

## 📅 Phase-by-Phase Implementation

## Phase 1: Foundation & Setup (Weeks 1-2)

### Objectives
- Establish 3D technology stack
- Create basic 3D scene infrastructure
- Implement view mode switching
- Set up development and testing environment

### Deliverables

#### Week 1: Environment Setup
**Day 1-2: Dependency Installation & Configuration**
```bash
# Install 3D dependencies
npm install @react-three/fiber @react-three/drei @react-three/postprocessing
npm install three leva @types/three

# Update build configuration
# Add Vite optimizations for Three.js
```

**Day 3-4: Basic 3D Scene**
```typescript
// src/components/Canvas3D/Scene3D.tsx
export function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 10, 10], fov: 75 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <OrbitControls />
    </Canvas>
  );
}
```

**Day 5: View Mode Toggle**
```typescript
// src/components/UI/ViewModeSwitch.tsx
export function ViewModeSwitch() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  return (
    <div className="view-mode-switch">
      <button
        onClick={() => setViewMode('2d')}
        className={viewMode === '2d' ? 'active' : ''}
      >
        2D Plan
      </button>
      <button
        onClick={() => setViewMode('3d')}
        className={viewMode === '3d' ? 'active' : ''}
      >
        3D View
      </button>
    </div>
  );
}
```

#### Week 2: State Management & Integration
**Day 6-8: Enhanced Zustand Store**
```typescript
// src/stores/scene3DStore.ts
interface Scene3DState {
  isEnabled: boolean;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
  lighting: {
    ambient: number;
    directional: number;
  };
  quality: 'low' | 'medium' | 'high';
}

export const useScene3DStore = create<Scene3DState>((set) => ({
  isEnabled: false,
  camera: { position: [0, 10, 10], target: [0, 0, 0], fov: 75 },
  lighting: { ambient: 0.4, directional: 0.6 },
  quality: 'medium',

  enableScene3D: () => set({ isEnabled: true }),
  updateCamera: (camera) => set({ camera }),
  setQuality: (quality) => set({ quality }),
}));
```

**Day 9-10: Testing Setup**
```typescript
// __tests__/components/Canvas3D/Scene3D.test.tsx
import { render, screen } from '@testing-library/react';
import { Scene3D } from '@/components/Canvas3D/Scene3D';

// Mock Three.js for testing
jest.mock('three', () => ({
  WebGLRenderer: jest.fn(),
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
}));

describe('Scene3D', () => {
  it('renders without crashing', () => {
    render(<Scene3D />);
    expect(screen.getByRole('canvas')).toBeInTheDocument();
  });
});
```

### Success Criteria
- [ ] 3D scene renders successfully in browser
- [ ] View mode toggle switches between 2D and 3D
- [ ] No performance degradation in 2D mode
- [ ] All existing tests continue to pass
- [ ] Basic camera controls work (orbit, zoom, pan)

---

## Phase 2: Core 3D Elements (Weeks 3-5)

### Objectives
- Convert 2D elements to 3D representations
- Implement basic 3D geometry generation
- Establish material system foundation
- Create element selection in 3D space

### Week 3: Wall System

**Day 11-13: Wall 3D Conversion**
```typescript
// src/components/Canvas3D/Elements/Wall3D.tsx
interface Wall3DProps {
  wall: Wall;
  isSelected: boolean;
  onSelect: () => void;
}

export function Wall3D({ wall, isSelected, onSelect }: Wall3DProps) {
  const geometry = useMemo(() => {
    const length = Math.sqrt(
      Math.pow(wall.endX - wall.startX, 2) +
      Math.pow(wall.endY - wall.startY, 2)
    );
    return new BoxGeometry(length, wall.height, wall.thickness);
  }, [wall]);

  const position = useMemo(() => [
    (wall.startX + wall.endX) / 2,
    wall.height / 2,
    (wall.startY + wall.endY) / 2
  ], [wall]);

  const rotation = useMemo(() => [
    0,
    Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX),
    0
  ], [wall]);

  return (
    <mesh
      position={position}
      rotation={rotation}
      geometry={geometry}
      onClick={onSelect}
    >
      <meshStandardMaterial
        color={isSelected ? '#3b82f6' : wall.color}
        transparent={isSelected}
        opacity={isSelected ? 0.8 : 1}
      />
    </mesh>
  );
}
```

**Day 14-15: Multi-Wall Rendering**
```typescript
// src/components/Canvas3D/Elements/WallSystem3D.tsx
export function WallSystem3D() {
  const { walls } = useDesignStore();
  const { selectedElementId, selectedElementType } = useDesignStore();

  return (
    <group name="walls">
      {walls.map((wall) => (
        <Wall3D
          key={wall.id}
          wall={wall}
          isSelected={selectedElementId === wall.id && selectedElementType === 'wall'}
          onSelect={() => selectElement(wall.id, 'wall')}
        />
      ))}
    </group>
  );
}
```

### Week 4: Doors and Windows

**Day 16-18: Door 3D Implementation**
```typescript
// src/components/Canvas3D/Elements/Door3D.tsx
export function Door3D({ door, wall, isSelected, onSelect }: Door3DProps) {
  const doorGeometry = useMemo(() => {
    // Create door frame and panel geometries
    const frameGeometry = new BoxGeometry(
      door.width + 0.1,
      door.height + 0.1,
      wall.thickness + 0.05
    );

    const panelGeometry = new BoxGeometry(
      door.width - 0.1,
      door.height - 0.1,
      0.05
    );

    return { frameGeometry, panelGeometry };
  }, [door, wall]);

  // Calculate door position on wall
  const doorPosition = useMemo(() => {
    const wallLength = Math.sqrt(
      Math.pow(wall.endX - wall.startX, 2) +
      Math.pow(wall.endY - wall.startY, 2)
    );

    const positionOnWall = door.position / 100; // Convert percentage to ratio
    const wallAngle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX);

    const x = wall.startX + Math.cos(wallAngle) * wallLength * positionOnWall;
    const z = wall.startY + Math.sin(wallAngle) * wallLength * positionOnWall;

    return [x, door.height / 2, z];
  }, [door, wall]);

  return (
    <group position={doorPosition} onClick={onSelect}>
      {/* Door frame */}
      <mesh geometry={doorGeometry.frameGeometry}>
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Door panel */}
      <mesh
        geometry={doorGeometry.panelGeometry}
        position={[0, 0, 0.1]}
      >
        <meshStandardMaterial
          color={isSelected ? '#3b82f6' : door.color || '#654321'}
        />
      </mesh>
    </group>
  );
}
```

**Day 19-20: Window 3D Implementation**
```typescript
// src/components/Canvas3D/Elements/Window3D.tsx
export function Window3D({ window, wall, isSelected, onSelect }: Window3DProps) {
  return (
    <group position={windowPosition} onClick={onSelect}>
      {/* Window frame */}
      <mesh geometry={frameGeometry}>
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Glass panel */}
      <mesh geometry={glassGeometry}>
        <meshPhysicalMaterial
          color="#87CEEB"
          transparent={true}
          opacity={0.3}
          transmission={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}
```

### Week 5: Room System

**Day 21-23: Room 3D Generation**
```typescript
// src/utils/3d/roomGeometry.ts
export function generateRoomGeometry(room: Room): {
  floorGeometry: ExtrudeGeometry;
  ceilingGeometry: ExtrudeGeometry;
} {
  // Convert room points to Three.js shape
  const shape = new Shape();
  room.points.forEach((point, index) => {
    if (index === 0) {
      shape.moveTo(point.x, point.y);
    } else {
      shape.lineTo(point.x, point.y);
    }
  });

  // Generate floor
  const floorGeometry = new ExtrudeGeometry(shape, {
    depth: 0.1, // Floor thickness
    bevelEnabled: false,
  });

  // Generate ceiling (same shape, different position)
  const ceilingGeometry = floorGeometry.clone();

  return { floorGeometry, ceilingGeometry };
}
```

**Day 24-25: Room 3D Component**
```typescript
// src/components/Canvas3D/Elements/Room3D.tsx
export function Room3D({ room, isSelected, onSelect }: Room3DProps) {
  const { floorGeometry, ceilingGeometry } = useMemo(
    () => generateRoomGeometry(room),
    [room]
  );

  const floorMaterial = useMemo(() => {
    const material = room.floorMaterialId
      ? getMaterial3D(room.floorMaterialId)
      : new MeshStandardMaterial({ color: '#DEB887' });

    return material;
  }, [room.floorMaterialId]);

  return (
    <group name={`room-${room.id}`} onClick={onSelect}>
      {/* Floor */}
      <mesh geometry={floorGeometry} material={floorMaterial} />

      {/* Ceiling */}
      <mesh
        geometry={ceilingGeometry}
        position={[0, DEFAULT_CEILING_HEIGHT, 0]}
      >
        <meshStandardMaterial color="#F5F5F5" />
      </mesh>

      {/* Room label */}
      {room.name && (
        <Text
          position={[room.center?.x || 0, 2, room.center?.y || 0]}
          fontSize={0.5}
          color="black"
        >
          {room.name}
        </Text>
      )}
    </group>
  );
}
```

### Success Criteria
- [ ] All walls render correctly in 3D with proper positioning
- [ ] Doors and windows appear at correct positions on walls
- [ ] Rooms generate floor and ceiling geometries
- [ ] Element selection works in 3D space
- [ ] Materials are applied and visible
- [ ] Performance remains smooth with complex models

---

## Phase 3: Interaction & Navigation (Weeks 6-7)

### Objectives
- Implement professional camera controls
- Add view presets for architectural perspectives
- Create 3D measurement tools
- Enhance element manipulation in 3D space

### Week 6: Camera System

**Day 26-28: Camera Controls Enhancement**
```typescript
// src/components/Canvas3D/Camera/CameraControls.tsx
export function CameraControls({ presets }: { presets: ViewPreset[] }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const animateToPreset = useCallback((preset: ViewPreset) => {
    if (!controlsRef.current) return;

    // Animate camera to new position
    const controls = controlsRef.current;
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();

    const duration = 1000; // 1 second animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing function
      const eased = 1 - Math.pow(1 - progress, 3);

      camera.position.lerpVectors(startPosition, preset.camera.position, eased);
      controls.target.lerpVectors(startTarget, preset.camera.target, eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [camera]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.1} // Prevent camera from going under ground
      />

      {/* View preset buttons */}
      <div className="camera-presets">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => animateToPreset(preset)}
            className="preset-button"
          >
            {preset.icon} {preset.name}
          </button>
        ))}
      </div>
    </>
  );
}
```

**Day 29-30: View Presets Implementation**
```typescript
// src/data/viewPresets.ts
export const ARCHITECTURAL_VIEW_PRESETS: ViewPreset[] = [
  {
    name: 'Plan',
    icon: '🏠',
    description: 'Top-down architectural view',
    camera: {
      position: new Vector3(0, 50, 0),
      target: new Vector3(0, 0, 0),
      fov: 50,
    },
    orthographic: true,
  },
  {
    name: 'Front',
    icon: '📐',
    description: 'Front elevation view',
    camera: {
      position: new Vector3(0, 10, 30),
      target: new Vector3(0, 10, 0),
      fov: 60,
    },
  },
  {
    name: 'Isometric',
    icon: '📦',
    description: 'Three-dimensional perspective',
    camera: {
      position: new Vector3(20, 15, 20),
      target: new Vector3(0, 5, 0),
      fov: 75,
    },
  },
  {
    name: 'Interior',
    icon: '🚶',
    description: 'Walk-through perspective',
    camera: {
      position: new Vector3(0, 7, 0),
      target: new Vector3(10, 7, 0),
      fov: 90,
    },
  },
];
```

### Week 7: Measurement & Interaction Tools

**Day 31-33: 3D Measurement System**
```typescript
// src/components/Canvas3D/Tools/MeasureTool3D.tsx
export function MeasureTool3D() {
  const [measuring, setMeasuring] = useState(false);
  const [startPoint, setStartPoint] = useState<Vector3 | null>(null);
  const [endPoint, setEndPoint] = useState<Vector3 | null>(null);

  const handleCanvasClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    const point = event.point;

    if (!measuring) {
      setStartPoint(point.clone());
      setMeasuring(true);
    } else {
      setEndPoint(point.clone());
      setMeasuring(false);

      // Calculate and display distance
      const distance = startPoint!.distanceTo(point);
      showMeasurement(startPoint!, point, distance);
    }
  }, [measuring, startPoint]);

  const distance = useMemo(() => {
    if (!startPoint || !endPoint) return 0;
    return startPoint.distanceTo(endPoint);
  }, [startPoint, endPoint]);

  return (
    <>
      {/* Measurement line */}
      {startPoint && endPoint && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([
                startPoint.x, startPoint.y, startPoint.z,
                endPoint.x, endPoint.y, endPoint.z,
              ])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff0000" linewidth={2} />
        </line>
      )}

      {/* Distance label */}
      {startPoint && endPoint && (
        <Text
          position={[
            (startPoint.x + endPoint.x) / 2,
            (startPoint.y + endPoint.y) / 2 + 1,
            (startPoint.z + endPoint.z) / 2,
          ]}
          fontSize={0.5}
          color="#ff0000"
        >
          {distance.toFixed(2)}m
        </Text>
      )}
    </>
  );
}
```

**Day 34-35: Element Manipulation Gizmos**
```typescript
// src/components/Canvas3D/Tools/TransformGizmo.tsx
export function TransformGizmo({ targetElement }: { targetElement: Element3D }) {
  const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate');

  return (
    <group position={targetElement.position}>
      {/* Translation handles */}
      {mode === 'translate' && (
        <>
          <ArrowHelper dir={new Vector3(1, 0, 0)} color="#ff0000" length={2} />
          <ArrowHelper dir={new Vector3(0, 1, 0)} color="#00ff00" length={2} />
          <ArrowHelper dir={new Vector3(0, 0, 1)} color="#0000ff" length={2} />
        </>
      )}

      {/* Mode switcher */}
      <Html distanceFactor={10}>
        <div className="gizmo-controls">
          <button onClick={() => setMode('translate')}>Move</button>
          <button onClick={() => setMode('rotate')}>Rotate</button>
          <button onClick={() => setMode('scale')}>Scale</button>
        </div>
      </Html>
    </group>
  );
}
```

### Success Criteria
- [ ] Smooth camera animations between view presets
- [ ] Intuitive orbit controls with proper constraints
- [ ] Accurate 3D measurements between any two points
- [ ] Element selection and manipulation gizmos
- [ ] Professional camera movement for presentations

---

## Phase 4: Materials & Lighting (Weeks 8-9)

### Objectives
- Implement physically-based rendering (PBR) materials
- Create realistic lighting system with shadows
- Add environmental effects and atmosphere
- Optimize rendering performance

### Week 8: Material System

**Day 36-38: PBR Material Implementation**
```typescript
// src/utils/3d/materialSystem.ts
export class Material3DSystem {
  private materials = new Map<string, MeshStandardMaterial>();
  private textures = new Map<string, Texture>();

  async createPBRMaterial(config: Material3DConfig): Promise<MeshStandardMaterial> {
    const material = new MeshStandardMaterial({
      color: config.baseColor,
      roughness: config.roughness,
      metalness: config.metalness,
      transparent: config.opacity < 1,
      opacity: config.opacity,
    });

    // Load textures
    const promises: Promise<void>[] = [];

    if (config.diffuseMap) {
      promises.push(
        this.loadTexture(config.diffuseMap).then(texture => {
          material.map = texture;
          material.needsUpdate = true;
        })
      );
    }

    if (config.normalMap) {
      promises.push(
        this.loadTexture(config.normalMap).then(texture => {
          material.normalMap = texture;
          material.needsUpdate = true;
        })
      );
    }

    if (config.roughnessMap) {
      promises.push(
        this.loadTexture(config.roughnessMap).then(texture => {
          material.roughnessMap = texture;
          material.needsUpdate = true;
        })
      );
    }

    await Promise.all(promises);
    return material;
  }

  private async loadTexture(url: string): Promise<Texture> {
    if (this.textures.has(url)) {
      return this.textures.get(url)!;
    }

    const loader = new TextureLoader();
    const texture = await loader.loadAsync(url);

    // Configure texture settings
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.flipY = false;

    this.textures.set(url, texture);
    return texture;
  }
}
```

**Day 39-40: Material Application System**
```typescript
// src/components/Canvas3D/Materials/MaterialRenderer3D.tsx
export function MaterialRenderer3D({ element }: { element: Element3D }) {
  const material3DSystem = useMemo(() => new Material3DSystem(), []);
  const [material, setMaterial] = useState<MeshStandardMaterial | null>(null);

  useEffect(() => {
    if (element.material3DConfig) {
      material3DSystem.createPBRMaterial(element.material3DConfig)
        .then(setMaterial);
    }
  }, [element.material3DConfig, material3DSystem]);

  if (!material) {
    return <meshStandardMaterial color={element.color || '#cccccc'} />;
  }

  return <primitive object={material} />;
}
```

### Week 9: Lighting & Environment

**Day 41-43: Advanced Lighting System**
```typescript
// src/components/Canvas3D/Lighting/SceneLighting.tsx
export function SceneLighting({ config }: { config: LightingConfig }) {
  const shadowMapRef = useRef<WebGLShadowMap | null>(null);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight
        intensity={config.ambient.intensity}
        color={config.ambient.color}
      />

      {/* Directional lighting (sun) */}
      <directionalLight
        position={config.directional.position}
        intensity={config.directional.intensity}
        color={config.directional.color}
        castShadow={config.directional.shadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Fill light */}
      <pointLight
        position={[-10, 10, -10]}
        intensity={0.3}
        color="#ffffff"
      />

      {/* Environment */}
      {config.environment && (
        <Environment
          preset={config.environment.preset}
          background={config.environment.background}
        />
      )}
    </>
  );
}
```

**Day 44-45: Shadow System & Optimization**
```typescript
// src/hooks/3d/useShadowOptimization.ts
export function useShadowOptimization() {
  const { gl } = useThree();

  useEffect(() => {
    // Configure shadow map settings for optimal performance
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = PCFSoftShadowMap;
    gl.shadowMap.autoUpdate = false; // Manual updates for performance

    // Update shadows only when scene changes
    const updateShadows = () => {
      gl.shadowMap.needsUpdate = true;
    };

    // Listen for scene changes
    window.addEventListener('scene-updated', updateShadows);

    return () => {
      window.removeEventListener('scene-updated', updateShadows);
    };
  }, [gl]);

  return {
    enableShadows: () => gl.shadowMap.enabled = true,
    disableShadows: () => gl.shadowMap.enabled = false,
    updateShadows: () => gl.shadowMap.needsUpdate = true,
  };
}
```

### Success Criteria
- [ ] Realistic material rendering with PBR workflow
- [ ] Dynamic lighting with accurate shadows
- [ ] Environmental reflections and atmosphere
- [ ] Maintained 60 FPS performance with full lighting
- [ ] Material editor interface for user customization

---

## Phase 5: Export & Professional Features (Weeks 10-11)

### Objectives
- Implement 3D model export capabilities
- Create high-quality rendering system
- Add professional drawing generation
- Integrate with existing export workflows

### Week 10: Export System

**Day 46-48: 3D Model Export**
```typescript
// src/utils/3d/export3D.ts
export class Export3DSystem {
  async exportGLTF(scene: Scene): Promise<Blob> {
    const exporter = new GLTFExporter();

    return new Promise((resolve, reject) => {
      exporter.parse(
        scene,
        (gltf) => {
          const blob = new Blob([JSON.stringify(gltf)], {
            type: 'application/json'
          });
          resolve(blob);
        },
        {
          binary: false,
          embedImages: true,
          includeCustomExtensions: false,
        }
      );
    });
  }

  async exportOBJ(scene: Scene): Promise<Blob> {
    const exporter = new OBJExporter();
    const objString = exporter.parse(scene);

    return new Blob([objString], { type: 'text/plain' });
  }

  async exportScreenshot(
    canvas: HTMLCanvasElement,
    width: number = 1920,
    height: number = 1080
  ): Promise<Blob> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  }
}
```

**Day 49-50: High-Quality Rendering**
```typescript
// src/components/Canvas3D/Export/HighQualityRenderer.tsx
export function HighQualityRenderer({ onRenderComplete }: {
  onRenderComplete: (imageData: string) => void;
}) {
  const { gl, scene, camera } = useThree();

  const renderHighQuality = useCallback(async () => {
    // Temporarily increase render quality
    const originalPixelRatio = gl.getPixelRatio();
    const originalSize = gl.getSize(new Vector2());

    // Set high resolution
    gl.setPixelRatio(2);
    gl.setSize(3840, 2160); // 4K resolution

    // Enable high-quality settings
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = PCFSoftShadowMap;

    // Render frame
    gl.render(scene, camera);

    // Capture image
    const imageData = gl.domElement.toDataURL('image/png');

    // Restore original settings
    gl.setPixelRatio(originalPixelRatio);
    gl.setSize(originalSize.x, originalSize.y);

    onRenderComplete(imageData);
  }, [gl, scene, camera, onRenderComplete]);

  return (
    <button onClick={renderHighQuality} className="export-hq-button">
      Export High Quality Image
    </button>
  );
}
```

### Week 11: Integration & Polish

**Day 51-53: Export UI Integration**
```typescript
// src/components/Export/Export3DDialog.tsx
export function Export3DDialog({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [exportType, setExportType] = useState<'image' | 'model' | 'pdf'>('image');
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');

  const handleExport = async () => {
    const exportSystem = new Export3DSystem();

    switch (exportType) {
      case 'image':
        const imageBlob = await exportSystem.exportScreenshot(
          canvasRef.current!,
          quality === 'ultra' ? 3840 : quality === 'high' ? 1920 : 1280,
          quality === 'ultra' ? 2160 : quality === 'high' ? 1080 : 720
        );
        downloadBlob(imageBlob, 'house-plan-3d.png');
        break;

      case 'model':
        const modelBlob = await exportSystem.exportGLTF(sceneRef.current!);
        downloadBlob(modelBlob, 'house-plan.gltf');
        break;

      case 'pdf':
        await generatePDFWith3D();
        break;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="export-3d-dialog">
        <h2>Export 3D Model</h2>

        <div className="export-options">
          <label>
            <input
              type="radio"
              value="image"
              checked={exportType === 'image'}
              onChange={(e) => setExportType(e.target.value as any)}
            />
            High-Resolution Image
          </label>

          <label>
            <input
              type="radio"
              value="model"
              checked={exportType === 'model'}
              onChange={(e) => setExportType(e.target.value as any)}
            />
            3D Model (GLTF)
          </label>

          <label>
            <input
              type="radio"
              value="pdf"
              checked={exportType === 'pdf'}
              onChange={(e) => setExportType(e.target.value as any)}
            />
            PDF with 3D Views
          </label>
        </div>

        <div className="quality-settings">
          <label>Quality:</label>
          <select value={quality} onChange={(e) => setQuality(e.target.value as any)}>
            <option value="standard">Standard (1280x720)</option>
            <option value="high">High (1920x1080)</option>
            <option value="ultra">Ultra (3840x2160)</option>
          </select>
        </div>

        <div className="dialog-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleExport} className="primary">
            Export
          </button>
        </div>
      </div>
    </Dialog>
  );
}
```

**Day 54-55: Performance Optimization & Final Polish**
```typescript
// src/hooks/3d/usePerformanceMonitor.ts
export function usePerformanceMonitor() {
  const [stats, setStats] = useState({
    fps: 60,
    triangles: 0,
    memory: 0,
  });

  useEffect(() => {
    const statsMonitor = new Stats();
    document.body.appendChild(statsMonitor.dom);

    const update = () => {
      statsMonitor.update();

      // Update custom stats
      setStats({
        fps: Math.round(1000 / statsMonitor.dom.children[0].innerHTML.split(' ')[1]),
        triangles: renderer.info.render.triangles,
        memory: performance.memory?.usedJSHeapSize || 0,
      });
    };

    const interval = setInterval(update, 1000);

    return () => {
      clearInterval(interval);
      document.body.removeChild(statsMonitor.dom);
    };
  }, []);

  return stats;
}
```

### Success Criteria
- [ ] Export 3D models in GLTF and OBJ formats
- [ ] Generate 4K high-quality renderings
- [ ] PDF exports include 3D perspective views
- [ ] Performance monitoring and optimization
- [ ] Integration with existing export workflows

---

## Phase 6: Testing & Optimization (Week 12)

### Objectives
- Comprehensive testing across all 3D features
- Performance optimization and bug fixes
- User acceptance testing
- Documentation and training materials

### Final Week: Quality Assurance

**Day 56-57: Automated Testing**
```typescript
// __tests__/integration/3d-workflow.test.tsx
describe('3D Workflow Integration', () => {
  it('should complete full 3D design workflow', async () => {
    const { user } = renderApp();

    // Create basic 2D design
    await user.click(screen.getByText('Wall Tool'));
    await user.click(screen.getByRole('canvas'));
    await user.click(screen.getByRole('canvas'));

    // Switch to 3D mode
    await user.click(screen.getByText('3D View'));

    // Verify 3D rendering
    expect(screen.getByTestId('canvas-3d')).toBeInTheDocument();

    // Test camera controls
    await user.click(screen.getByText('Plan'));
    await user.click(screen.getByText('Front'));
    await user.click(screen.getByText('3D'));

    // Test export
    await user.click(screen.getByText('Export'));
    await user.click(screen.getByText('3D Model'));
    await user.click(screen.getByText('Download'));

    // Verify no errors
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
```

**Day 58-59: Performance Testing & Optimization**
```typescript
// src/utils/3d/performanceOptimizer.ts
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;

  optimizeForDevice(): OptimizationSettings {
    const deviceInfo = this.getDeviceCapabilities();

    if (deviceInfo.isLowEnd) {
      return {
        shadows: false,
        antialiasing: false,
        textureQuality: 'low',
        maxTriangles: 50000,
      };
    }

    if (deviceInfo.isMidRange) {
      return {
        shadows: true,
        antialiasing: true,
        textureQuality: 'medium',
        maxTriangles: 100000,
      };
    }

    return {
      shadows: true,
      antialiasing: true,
      textureQuality: 'high',
      maxTriangles: 200000,
    };
  }

  private getDeviceCapabilities() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) return { isLowEnd: true, isMidRange: false, isHighEnd: false };

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);

    return {
      isLowEnd: maxTextureSize < 2048 || maxVertexUniforms < 256,
      isMidRange: maxTextureSize >= 2048 && maxTextureSize < 4096,
      isHighEnd: maxTextureSize >= 4096,
    };
  }
}
```

**Day 60: Documentation & Deployment**
- Complete user documentation
- Create developer setup guide
- Prepare deployment configuration
- Final code review and optimization

### Success Criteria
- [ ] All automated tests pass
- [ ] Performance targets met on target devices
- [ ] User acceptance testing completed successfully
- [ ] Documentation complete and accessible
- [ ] Ready for production deployment

---

## 📊 Success Metrics & KPIs

### Performance Targets
- **Frame Rate**: 60 FPS on desktop, 30 FPS on tablets
- **Load Time**: 3D mode activation under 2 seconds
- **Memory Usage**: Under 500MB for typical house models
- **Export Speed**: High-quality images under 10 seconds

### User Experience Metrics
- **Adoption Rate**: 60%+ of users try 3D mode within first session
- **Task Completion**: No decrease from current 2D workflow speeds
- **Error Rate**: Under 5% for 3D-specific operations
- **User Satisfaction**: Maintain 85%+ satisfaction scores

### Technical Quality Metrics
- **Test Coverage**: 90%+ for 3D-specific code
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Accessibility**: WCAG 2.1 AA compliance maintained
- **Bundle Size**: Under 2MB additional for 3D features

This comprehensive implementation roadmap provides a clear path from the current excellent 2D House Planner to a feature-rich 3D application while maintaining the quality and usability that makes the current application successful.
