# Architecture Design

> Technical architecture and system design for 3D House Planner implementation

---

## 🚨 Architectural Foundation Update

**As of August 2025, the 3D House Planner implementation will be based on [CodeHole7/threejs-3d-room-designer](https://github.com/CodeHole7/threejs-3d-room-designer), an open-source React-bundled Three.js room planner and product configurator.**

### Key Features of the New Base

- React-bundled Three.js architecture
- 2D/3D floorplan editing with interactive product placement/configuration
- Model morph/material/style configuration
- Extensible via React components and hooks
- Built-in support for product configurator, room editing, and model customization

### Integration & Adaptation Strategy

- Custom features (multi-floor, advanced export, material system, accessibility, etc.) will be layered on top using the extensibility points provided by the base project.
- State management, UI, and business logic will leverage the base's React architecture, with additional stores and hooks as needed.
- All architectural diagrams, data models, and component structures below are to be interpreted as extensions or integrations with the threejs-3d-room-designer foundation.

---

## 📋 Overview

This document outlines the technical architecture for implementing 3D capabilities in the House Planner application. The design maintains compatibility with the existing 2D system while providing a robust foundation for 3D visualization and interaction.

---

## 🏗️ Feature-Based Architecture (Extending threejs-3d-room-designer)

### Core Feature Areas

Building upon the threejs-3d-room-designer foundation, our architecture is organized around three main feature areas:

#### 1. FloorPlan Design Features 📐

- **3D Editor with Top-Down View**: Precise drawing with orthographic projection, snapping, and architectural constraints (orthogonal walls, etc.).
- **Multi-Floor Management**: Vertical building navigation and floor relationships
- **Precision Tools**: Professional measurement and drawing tools
- **Roof System**: Procedural roof generation on valid building footprints.

#### 2. Room Configuration Features 🏠

- **Product Placement System**: Interactive furniture and fixture placement
- **Environment Management**: Lighting, materials, and ambiance controls
- **Room Relationships**: Flow analysis and multi-room coordination

#### 3. Product Configuration Features ⚙️

- **Dynamic Dimensions**: Intelligent scaling and morphing systems
- **Material Management**: Advanced PBR material application with element-specific libraries (walls, roofs, doors, etc.).
- **Style Variants**: Configuration presets and customization

### High-Level Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────┐
│              Vite-based React Application (House Planner Extended)       │
├─────────────────────────────────────────────────────────────────────────┤
│  Feature Layer (Organized by User Workflows)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │  FloorPlan      │  │  Room Config    │  │  Product Config │        │
│  │  Design         │  │  System         │  │  System         │        │
│  │  📐             │  │  🏠             │  │  ⚙️             │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
├─────────────────────────────────────────────────────────────────────────┤
│  UI Layer (React + threejs-3d-room-designer base)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │   Top-Down      │  │   Perspective   │  │  UI Controls    │        │
│  │   View (3D)     │  │   View (3D)     │  │ (Feature Panels)│        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
├─────────────────────────────────────────────────────────────────────────┤
│  State Management (Feature-Organized Stores)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │  FloorPlan      │  │  Room Config    │  │  Product Config │        │
│  │  Store          │  │  Store          │  │  Store          │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
├─────────────────────────────────────────────────────────────────────────┤
│  threejs-3d-room-designer Core Foundation                              │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  React Three Fiber + Three.js + Room Designer Components          │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure Enhancement (Extending threejs-3d-room-designer)

### Directory Structure

```text
src/
├── main.tsx / App.tsx            # Vite React entry points
├── components/
│   ├── Canvas/                   # Existing 2D canvas system
│   ├── Canvas3D/                 # New 3D canvas system
│   │   ├── Scene3D.tsx          # Main 3D scene container
│   │   ├── Camera/              # Camera controls and presets
│   │   ├── Elements/            # 3D element renderers (Wall, Door, Window, Roof)
│   │   ├── Lighting/            # Lighting system
│   │   ├── Controls/            # 3D interaction tools
│   │   └── Effects/             # Post-processing effects
│   ├── UI/                      # Enhanced UI components
│   └── Export/                  # Enhanced export system
├── stores/
│   ├── designStore.ts           # Enhanced with 3D state (including roofs)
│   ├── scene3DStore.ts          # New 3D scene management
│   └── viewStore.ts             # View mode management
├── hooks/
│   ├── 3d/                      # New 3D-specific hooks
│   │   ├── useCamera3D.ts       # Camera management
│   │   ├── useScene3D.ts        # Scene state management
│   │   └── use3DControls.ts     # 3D interaction handling
│   ├── use3DTransition.ts       # 2D ↔ 3D transitions
│   └── useConstraints.ts        # New hook for snapping and placement rules
├── utils/
│   ├── 3d/                      # New 3D utilities
│   ├── geometry3D.ts        # 3D geometry generation (including roofs)
│   │   ├── materials3D.ts       # 3D material management
│   │   ├── transforms.ts        # 2D ↔ 3D conversions
│   │   └── export3D.ts          # 3D export utilities
│   └── math3D.ts               # 3D mathematical operations
└── types/
    ├── elements/                # Enhanced element types
    ├── scene3D.ts              # 3D scene type definitions
    └── materials3D.ts          # 3D material type definitions
```

---

## 🎯 Core Component Architecture (Extending base components)

### Scene3D Component (customized from threejs-3d-room-designer)

```typescript
// src/components/Canvas3D/Scene3D.tsx
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { SceneLighting } from './Lighting/SceneLighting';
import { CameraControls } from './Camera/CameraControls';
import { ElementRenderer3D } from './Elements/ElementRenderer3D';
import { Effects } from './Effects/Effects';

interface Scene3DProps {
  className?: string;
  onElementSelect?: (id: string, type: string) => void;
}

export function Scene3D({ className, onElementSelect }: Scene3DProps) {
  const { scene3D, renderSettings } = useScene3DStore();
  const { walls, doors, windows, rooms } = useDesignStore();

  return (
    <div className={className}>
      <Canvas
        camera={{
          position: scene3D.camera.position,
          fov: scene3D.camera.fov,
        }}
        shadows={renderSettings.shadows}
        dpr={[1, renderSettings.quality === 'high' ? 2 : 1]}
      >
        <Suspense fallback={null}>
          <SceneLighting config={scene3D.lighting} />

          <ElementRenderer3D
            walls={walls}
            doors={doors}
            windows={windows}
            rooms={rooms}
            onSelect={onElementSelect}
          />

          <CameraControls presets={scene3D.cameraPresets} />

          {renderSettings.postProcessing && <Effects />}
        </Suspense>
      </Canvas>
    </div>
  );
}
```

### Element Renderer System

```typescript
// src/components/Canvas3D/Elements/ElementRenderer3D.tsx
import { Wall3D } from './Wall3D';
import { Door3D } from './Door3D';
import { Window3D } from './Window3D';
import { Room3D } from './Room3D';
import { Roof3D } from './Roof3D';

interface ElementRenderer3DProps {
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  rooms: Room[];
  roofs: Roof[];
  onSelect?: (id: string, type: string) => void;
}

export function ElementRenderer3D({
  walls, doors, windows, rooms, roofs, onSelect
}: ElementRenderer3DProps) {
  return (
    <group name="architectural-elements">
      {/* Render rooms first (floors/ceilings) */}
      <group name="rooms">
        {rooms.map(room => (
          <Room3D
            key={room.id}
            room={room}
            onSelect={() => onSelect?.(room.id, 'room')}
          />
        ))}
      </group>

      {/* Render walls */}
      <group name="walls">
        {walls.map(wall => (
          <Wall3D
            key={wall.id}
            wall={wall}
            onSelect={() => onSelect?.(wall.id, 'wall')}
          />
        ))}
      </group>

      {/* Render openings */}
      <group name="openings">
        {doors.map(door => (
          <Door3D
            key={door.id}
            door={door}
            onSelect={() => onSelect?.(door.id, 'door')}
          />
        ))}

        {windows.map(window => (
          <Window3D
            key={window.id}
            window={window}
            onSelect={() => onSelect?.(window.id, 'window')}
          />
        ))}
      </group>

      {/* Render roof */}
      <group name="roofs">
        {roofs.map(roof => (
          <Roof3D
            key={roof.id}
            roof={roof}
            onSelect={() => onSelect?.(roof.id, 'roof')}
          />
        ))}
      </group>
    </group>
  );
}
```

---

## 🗃️ Enhanced Data Models (Extending base models)

### 3D-Enhanced Element Types

```typescript
// src/types/elements/Wall3D.ts
import { Wall } from './Wall';

export interface Wall3D extends Wall {
  // Existing 2D properties preserved

  // 3D enhancements
  baseElevation: number; // Z position (floor level)
  topElevation: number; // Z position (ceiling level)

  // 3D geometry properties
  geometry3D: {
    segments: number; // Geometry detail level
    chamfer?: number; // Corner rounding
    texture?: {
      scale: { u: number; v: number };
      offset: { u: number; v: number };
      rotation: number;
    };
  };

  // 3D material properties
  material3D?: {
    type: 'standard' | 'physical' | 'toon';
    properties: {
      roughness: number;
      metalness: number;
      normalMap?: string;
      bumpMap?: string;
      displacementMap?: string;
    };
  };
}
```

### Scene Configuration

```typescript
// src/types/scene3D.ts
export interface Scene3DConfig {
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
    near: number;
    far: number;
    mode: 'perspective' | 'orthographic';
  };

  lighting: {
    ambient: {
      intensity: number;
      color: string;
    };
    directional: {
      intensity: number;
      color: string;
      position: [number, number, number];
      shadows: boolean;
      shadowMapSize: number;
    };
    environment?: {
      type: 'hdri' | 'gradient' | 'color';
      value: string;
    };
  };

  rendering: {
    quality: 'low' | 'medium' | 'high';
    shadows: boolean;
    reflections: boolean;
    antialiasing: boolean;
    postProcessing: boolean;
  };

  navigation: {
    controls: 'orbit' | 'fly' | 'first-person';
    enableDamping: boolean;
    autoRotate: boolean;
    bounds?: {
      center: [number, number, number];
      radius: number;
    };
  };
}
```

---

## 🔄 State Management Enhancement (Extending base state)

### Enhanced Design Store

```typescript
// src/stores/designStore.ts (enhanced)
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface EnhancedDesignState extends DesignState {
  // Existing 2D state preserved

  // 3D state additions
  viewMode: '2d' | '3d' | 'hybrid';
  scene3D: Scene3DConfig;

  // 3D-enhanced elements
  walls3D: Map<string, Wall3DProperties>;
  materials3D: Map<string, Material3D>;

  // View management
  activeView: {
    type: 'plan' | 'elevation' | 'perspective' | 'section';
    preset?: string;
    custom?: CameraState;
  };
}

interface EnhancedDesignActions extends DesignActions {
  // View mode management
  setViewMode: (mode: '2d' | '3d' | 'hybrid') => void;

  // 3D element management
  update3DProperties: (elementId: string, properties: Element3DProperties) => void;

  // Scene management
  updateScene3D: (config: Partial<Scene3DConfig>) => void;
  setCameraPreset: (preset: string) => void;

  // Conversion utilities
  convert2DTo3D: () => void;
  syncElementChanges: (elementId: string, changes: any) => void;
}

export const useDesignStore = create<EnhancedDesignState & EnhancedDesignActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Existing state and actions preserved

      // New 3D functionality
      viewMode: '2d',
      scene3D: DEFAULT_SCENE_CONFIG,
      walls3D: new Map(),
      materials3D: new Map(),

      setViewMode: mode =>
        set(state => {
          state.viewMode = mode;
          if (mode === '3d' && !state.scene3D.initialized) {
            // Initialize 3D scene on first use
            state.scene3D = initializeScene3D(state);
          }
        }),

      update3DProperties: (elementId, properties) =>
        set(state => {
          const element = findElementById(state, elementId);
          if (element) {
            element.properties3D = { ...element.properties3D, ...properties };
          }
        }),

      // Auto-sync 2D changes to 3D
      updateWall: (id, updates) =>
        set(state => {
          // Update 2D properties
          const wallIndex = state.walls.findIndex(w => w.id === id);
          if (wallIndex >= 0) {
            state.walls[wallIndex] = { ...state.walls[wallIndex], ...updates };

            // Sync to 3D if in 3D mode
            if (state.viewMode !== '2d') {
              syncWallTo3D(state, id);
            }
          }
        }),
    }))
  )
);
```

### Scene3D Store

```typescript
// src/stores/scene3DStore.ts
interface Scene3DState {
  config: Scene3DConfig;
  performance: {
    fps: number;
    memoryUsage: number;
    triangleCount: number;
  };
  navigation: {
    isAnimating: boolean;
    currentPreset?: string;
    history: CameraState[];
  };
}

interface Scene3DActions {
  updateConfig: (config: Partial<Scene3DConfig>) => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
  navigateToPreset: (preset: string, animate?: boolean) => void;
  updatePerformanceStats: (stats: PerformanceStats) => void;
}

export const useScene3DStore = create<Scene3DState & Scene3DActions>()(
  immer((set, get) => ({
    config: DEFAULT_SCENE_CONFIG,
    performance: { fps: 60, memoryUsage: 0, triangleCount: 0 },
    navigation: { isAnimating: false, history: [] },

    updateConfig: newConfig =>
      set(state => {
        state.config = { ...state.config, ...newConfig };
      }),

    setQuality: quality =>
      set(state => {
        state.config.rendering.quality = quality;
        // Adjust other settings based on quality
        if (quality === 'low') {
          state.config.rendering.shadows = false;
          state.config.rendering.postProcessing = false;
        }
      }),

    navigateToPreset: (preset, animate = true) =>
      set(state => {
        const presetConfig = CAMERA_PRESETS[preset];
        if (presetConfig) {
          state.navigation.isAnimating = animate;
          state.navigation.currentPreset = preset;
          state.config.camera = { ...state.config.camera, ...presetConfig };
        }
      }),
  }))
);
```

---

## 🔧 Utility Systems (Custom utilities layered on base)

### 2D ↔ 3D Conversion Utilities

```typescript
// src/utils/3d/transforms.ts
export class Transform2DTo3D {
  static convertWall(wall2D: Wall): Wall3D {
    const length = Math.sqrt(
      Math.pow(wall2D.endX - wall2D.startX, 2) + Math.pow(wall2D.endY - wall2D.startY, 2)
    );

    const angle = Math.atan2(wall2D.endY - wall2D.startY, wall2D.endX - wall2D.startX);

    return {
      ...wall2D,
      baseElevation: 0,
      topElevation: wall2D.height,
      geometry3D: {
        length,
        angle,
        segments: Math.max(2, Math.floor(length / 100)), // 1 segment per meter
        position: {
          x: (wall2D.startX + wall2D.endX) / 2,
          y: wall2D.height / 2,
          z: (wall2D.startY + wall2D.endY) / 2,
        },
      },
    };
  }

  static convertRoom(room2D: Room): Room3D {
    // Convert 2D polygon to 3D floor/ceiling
    const vertices3D = room2D.points.map(point => ({
      x: point.x,
      y: 0, // Floor level
      z: point.y,
    }));

    return {
      ...room2D,
      vertices3D,
      floorElevation: 0,
      ceilingElevation: DEFAULT_CEILING_HEIGHT,
      volume: calculateRoomVolume(vertices3D, DEFAULT_CEILING_HEIGHT),
    };
  }
}
```

### 3D Geometry Generation

```typescript
// src/utils/3d/geometry3D.ts
export class GeometryGenerator {
  static createWallGeometry(wall: Wall3D): BufferGeometry {
    const geometry = new BoxGeometry(
      wall.geometry3D.length,
      wall.topElevation - wall.baseElevation,
      wall.thickness
    );

    // Add UV mapping for textures
    this.addUVMapping(geometry, wall);

    return geometry;
  }

  static createRoomFloorGeometry(room: Room3D): BufferGeometry {
    const shape = new Shape();
    room.vertices3D.forEach((vertex, index) => {
      if (index === 0) {
        shape.moveTo(vertex.x, vertex.z);
      } else {
        shape.lineTo(vertex.x, vertex.z);
      }
    });

    const geometry = new ExtrudeGeometry(shape, {
      depth: FLOOR_THICKNESS,
      bevelEnabled: false,
    });

    return geometry;
  }

  static createDoorGeometry(door: Door3D): Group {
    const group = new Group();

    // Door frame
    const frameGeometry = this.createDoorFrameGeometry(door);
    const frameMesh = new Mesh(frameGeometry, door.frameMaterial);
    group.add(frameMesh);

    // Door panel (with opening animation support)
    const panelGeometry = this.createDoorPanelGeometry(door);
    const panelMesh = new Mesh(panelGeometry, door.panelMaterial);
    panelMesh.userData = { openingAngle: 0 }; // For animations
    group.add(panelMesh);

    return group;
  }

  static createRoofGeometry(roof: Roof3D, footprint: Vector3[]): BufferGeometry {
    // Logic to generate roof geometry based on type (gable, hip)
    // and parameters (pitch, overhang) from the footprint vertices.
    // This will be a complex function involving geometric calculations.
    const geometry = new BufferGeometry(); // Placeholder
    return geometry;
  }
}
```

---

## 🎨 Material System Enhancement (Extending base material system)

### 3D Material Management

```typescript
// src/utils/3d/materials3D.ts
export class Material3DManager {
  private materials = new Map<string, Material>();
  private textures = new Map<string, Texture>();

  createPBRMaterial(config: Material3DConfig): MeshStandardMaterial {
    const material = new MeshStandardMaterial({
      color: config.baseColor,
      roughness: config.roughness,
      metalness: config.metalness,
      transparent: config.opacity < 1,
      opacity: config.opacity,
    });

    // Load textures asynchronously
    if (config.diffuseMap) {
      this.loadTexture(config.diffuseMap).then(texture => {
        material.map = texture;
        material.needsUpdate = true;
      });
    }

    if (config.normalMap) {
      this.loadTexture(config.normalMap).then(texture => {
        material.normalMap = texture;
        material.needsUpdate = true;
      });
    }

    return material;
  }

  private async loadTexture(url: string): Promise<Texture> {
    if (this.textures.has(url)) {
      return this.textures.get(url)!;
    }

    const loader = new TextureLoader();
    const texture = await loader.loadAsync(url);
    texture.wrapS = texture.wrapT = RepeatWrapping;

    this.textures.set(url, texture);
    return texture;
  }

  dispose(): void {
    this.materials.forEach(material => material.dispose());
    this.textures.forEach(texture => texture.dispose());
    this.materials.clear();
    this.textures.clear();
  }
}
```

---

## 🚀 Performance Architecture (Extending base optimizations)

### Optimization Strategies

#### Rendering Optimization

```typescript
// Instance rendering for repeated elements
export function OptimizedWallRenderer({ walls }: { walls: Wall3D[] }) {
  const meshRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  // Group walls by material for batching
  const wallsByMaterial = useMemo(() =>
    groupBy(walls, wall => wall.materialId || 'default'), [walls]
  );

  return (
    <>
      {Object.entries(wallsByMaterial).map(([materialId, wallGroup]) => (
        <instancedMesh
          key={materialId}
          ref={meshRef}
          args={[wallGeometry, getMaterial(materialId), wallGroup.length]}
        >
          {wallGroup.map((wall, index) => (
            <Instance
              key={wall.id}
              position={wall.position}
              rotation={wall.rotation}
              scale={wall.scale}
            />
          ))}
        </instancedMesh>
      ))}
    </>
  );
}
```

#### Level of Detail (LOD) System

```typescript
// Adaptive quality based on camera distance
export function AdaptiveQualityRenderer({ element, cameraPosition }: {
  element: Element3D;
  cameraPosition: Vector3;
}) {
  const distance = useMemo(() =>
    cameraPosition.distanceTo(element.position), [cameraPosition, element.position]
  );

  const quality = useMemo(() => {
    if (distance < 10) return 'high';
    if (distance < 50) return 'medium';
    return 'low';
  }, [distance]);

  return (
    <mesh geometry={getGeometry(element, quality)}>
      <meshStandardMaterial {...getMaterial(element, quality)} />
    </mesh>
  );
}
```

---

## 📝 Architectural Notes

- All architectural extensions and customizations should be implemented as React components, hooks, and stores that integrate with or wrap the threejs-3d-room-designer base.
- Maintain compatibility with upstream updates to the base project.
- Document all integration points and customizations for maintainability.

This comprehensive architecture design now reflects the adoption of threejs-3d-room-designer as the foundation for 3D capabilities, with all custom features and enhancements layered on top of its extensible React/Three.js architecture.
