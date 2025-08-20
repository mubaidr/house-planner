# Project Structure Plan

> **Directory structure and file organization for the 3D House Planner implementation**

---

## 📁 Overall Project Structure

```
src/
├── components/
│   ├── Canvas3D/                 # 3D scene components
│   │   ├── Scene3D.tsx          # Main 3D scene container
│   │   ├── Camera/              # Camera controls and presets
│   │   │   ├── CameraControls.tsx
│   │   │   └── CameraPresets.ts
│   │   ├── Elements/            # 3D element renderers
│   │   │   ├── ElementRenderer3D.tsx
│   │   │   ├── Wall3D.tsx
│   │   │   ├── Room3D.tsx
│   │   │   ├── Door3D.tsx
│   │   │   ├── Window3D.tsx
│   │   │   ├── Stair3D.tsx
│   │   │   └── Roof3D.tsx
│   │   ├── Lighting/            # Lighting system
│   │   │   ├── SceneLighting.tsx
│   │   │   └── LightingPresets.ts
│   │   ├── Tools/               # 3D interaction tools
│   │   │   ├── MeasurementTool3D.tsx
│   │   │   └── SelectionGizmo3D.tsx
│   │   └── Effects/             # Post-processing effects
│   │       └── PostProcessing3D.tsx
│   └── UI/                      # UI components
│       ├── ViewControls.tsx    # View mode switching
│       ├── ToolPanel.tsx       # Element tools
│       ├── PropertiesPanel.tsx # Element properties
│       └── RenderSettings.tsx  # 3D render settings
├── stores/                      # Zustand stores
│   ├── designStore.ts          # Core design state
│   ├── scene3DStore.ts         # 3D scene state
│   └── viewStore.ts            # View mode state
├── hooks/                       # Custom hooks
│   ├── 3d/                     # 3D-specific hooks
│   │   ├── useCamera3D.ts
│   │   ├── useScene3D.ts
│   │   └── use3DControls.ts
│   ├── use3DTransition.ts      # 2D ↔ 3D transitions
│   └── useConstraints.ts       # Snapping and placement rules
├── utils/                       # Utility functions
│   ├── 3d/                     # 3D utilities
│   │   ├── geometry3D.ts       # 3D geometry generation
│   │   ├── materials3D.ts      # 3D material management
│   │   ├── transforms.ts        # 2D ↔ 3D conversions
│   │   └── export3D.ts         # 3D export utilities
│   └── math3D.ts               # 3D mathematical operations
├── types/                       # TypeScript definitions
│   ├── elements/               # Element type definitions
│   │   ├── Wall3D.ts
│   │   ├── Door3D.ts
│   │   ├── Window3D.ts
│   │   ├── Stair3D.ts
│   │   └── Room3D.ts
│   ├── scene3D.ts             # 3D scene type definitions
│   └── materials3D.ts         # 3D material type definitions
└── styles/                     # Global styles
    └── globals.css
```

## 📁 Detailed Component Structure

### Canvas3D Components

#### Scene3D.tsx

```
src/components/Canvas3D/Scene3D.tsx
```

Main 3D scene container that orchestrates all 3D components.

#### Camera System

```
src/components/Canvas3D/Camera/
├── CameraControls.tsx    # Orbit controls implementation
└── CameraPresets.ts      # Predefined camera positions
```

#### Element Renderers

```
src/components/Canvas3D/Elements/
├── ElementRenderer3D.tsx  # Main element renderer orchestrator
├── Wall3D.tsx            # Wall 3D rendering
├── Room3D.tsx            # Room 3D rendering
├── Door3D.tsx            # Door 3D rendering
├── Window3D.tsx          # Window 3D rendering
├── Stair3D.tsx           # Stair 3D rendering
└── Roof3D.tsx            # Roof 3D rendering
```

#### Lighting System

```
src/components/Canvas3D/Lighting/
├── SceneLighting.tsx     # Main lighting system
└── LightingPresets.ts    # Predefined lighting setups
```

#### Tools

```
src/components/Canvas3D/Tools/
├── MeasurementTool3D.tsx # 3D measurement system
└── SelectionGizmo3D.tsx  # Selection and manipulation gizmos
```

#### Effects

```
src/components/Canvas3D/Effects/
└── PostProcessing3D.tsx  # Post-processing effects
```

### UI Components

```
src/components/UI/
├── ViewControls.tsx      # View mode switching controls
├── ToolPanel.tsx         # Element creation tools
├── PropertiesPanel.tsx   # Element properties editor
└── RenderSettings.tsx    # 3D rendering settings
```

## 📁 State Management

### Stores

```
src/stores/
├── designStore.ts        # Core design state (walls, doors, rooms)
├── scene3DStore.ts       # 3D scene configuration
└── viewStore.ts          # View mode management
```

### Hooks

```
src/hooks/
├── 3d/
│   ├── useCamera3D.ts    # Camera state management
│   ├── useScene3D.ts     # 3D scene state management
│   └── use3DControls.ts  # 3D interaction handling
├── use3DTransition.ts    # 2D ↔ 3D transitions
└── useConstraints.ts     # Snapping and placement rules
```

## 📁 Utilities

### 3D Utilities

```
src/utils/3d/
├── geometry3D.ts         # 3D geometry generation
├── materials3D.ts        # 3D material management
├── transforms.ts         # 2D ↔ 3D conversions
└── export3D.ts           # 3D export utilities
```

### Math Utilities

```
src/utils/math3D.ts       # 3D mathematical operations
```

## 📁 Type Definitions

### Element Types

```
src/types/elements/
├── Wall3D.ts             # Wall type definitions
├── Door3D.ts             # Door type definitions
├── Window3D.ts           # Window type definitions
├── Stair3D.ts            # Stair type definitions
└── Room3D.ts             # Room type definitions
```

### Scene Types

```
src/types/scene3D.ts      # 3D scene type definitions
```

### Material Types

```
src/types/materials3D.ts  # 3D material type definitions
```

## 📁 Styles

```
src/styles/
└── globals.css           # Global CSS styles
```

## 📁 Test Structure

```
__tests__/
├── components/
│   ├── Canvas3D/
│   │   ├── Elements/
│   │   │   ├── Door3D.test.tsx
│   │   │   ├── Window3D.test.tsx
│   │   │   └── Stair3D.test.tsx
│   │   └── Scene3D.test.tsx
│   └── UI/
│       ├── ViewControls.test.tsx
│       └── ToolPanel.test.tsx
├── stores/
│   ├── designStore.test.ts
│   └── scene3DStore.test.ts
├── utils/
│   ├── 3d/
│   │   ├── geometry3D.test.ts
│   │   └── materials3D.test.ts
│   └── math3D.test.ts
└── integration/
    ├── door-placement.test.ts
    ├── window-placement.test.ts
    └── stair-generation.test.ts
```

## 📁 Documentation

```
docs/
├── 3d-implementation/
│   ├── README.md                    # Overall implementation plan
│   ├── IMPLEMENTATION-PLAN.md       # Detailed implementation roadmap
│   ├── DOOR3D-IMPLEMENTATION-PLAN.md # Door3D component plan
│   ├── PROJECT-STRUCTURE-PLAN.md    # This document
│   ├── 01-current-analysis.md
│   ├── 02-technology-assessment.md
│   ├── 03-architecture-design.md
│   ├── 04-ux-design-strategy.md
│   ├── 05-implementation-roadmap.md
│   ├── 06-requirements-specification.md
│   ├── 07-performance-guidelines.md
│   ├── 08-api-specifications.md
│   ├── 09-testing-strategy.md
│   ├── 10-deployment-guide.md
│   └── 11-floorplan-system-design.md
└── user-guide/
    ├── getting-started.md
    ├── basic-operations.md
    ├── advanced-features.md
    └── troubleshooting.md
```

## 📁 Configuration

```
config/
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── jest.config.mjs       # Jest configuration
├── eslint.config.mjs     # ESLint configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## 📁 Assets

```
public/
├── textures/             # 3D texture assets
├── models/               # 3D model assets
├── icons/                # UI icons
└── images/               # Documentation images
```

## 📁 Build Output

```
dist/                     # Production build output
```

## 📁 Development Tools

```
.github/
├── workflows/           # CI/CD workflows
└── ISSUE_TEMPLATE/      # Issue templates
```

---

**Status**: Project Structure Plan Created ✅
**Next Steps**: Begin implementing directory structure
**Estimated Completion**: 1 week
