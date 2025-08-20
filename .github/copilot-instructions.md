# 3D House Planner - AI Coding Agent Instructions

## Architecture Overview

This is a React 19 + Vite + TypeScript application implementing a 3D architectural planning tool using React Three Fiber. The project follows a progressive enhancement approach, building 3D capabilities on top of a solid React foundation.

### Core Tech Stack

- **Framework**: React 19 with Vite (not Next.js despite README references)
- **3D**: React Three Fiber + Three.js + @react-three/drei ecosystem
- **State**: Zustand with Immer middleware for immutable updates
- **Styling**: Tailwind CSS v4 with PostCSS
- **Testing**: Jest with React Testing Library and jsdom

## Key Architectural Patterns

### 1. Zustand Store with Immer

The central `designStore.ts` uses Zustand with Immer for state management:

```typescript
// Always use the store's actions, never mutate state directly
const { addWall, updateWall, selectElement } = useDesignStore();

// Store provides both state and actions in a single hook
const { walls, doors, selection, scene3D } = useDesignStore();
```

### 2. Element ID Generation

Use the ID utilities in `src/utils/id.ts` for consistent element identification:

```typescript
import { generateWallId, generateDoorId, generateId } from '@/utils/id';
const newWallId = generateWallId(); // Format: wall-{timestamp}-{random}
```

### 3. 3D Component Structure

3D components follow this pattern in `src/components/Canvas3D/`:

- **Scene3D.tsx**: Main canvas container with React Three Fiber
- **Elements/**: Individual 3D elements (Wall3D, Door3D, etc.)
- **Camera/**: Camera controls and presets
- **Lighting/**: Scene lighting configuration
- **Physics/**: Optional physics integration with Rapier

### 4. TypeScript Integration

Strict TypeScript with comprehensive type definitions in `src/types/index.ts`:

- All elements have both 2D properties and optional `properties3D`
- Camera states, materials, and scene configuration are fully typed
- Use the `ElementType` union for type-safe element handling

## Development Workflows

### Essential Commands

```bash
npm run dev          # Start Vite dev server (port 3001)
npm run build        # Production build
npm run test         # Run Jest tests
npm run test:watch   # Jest in watch mode
npm run lint         # ESLint check
npm run type-check   # TypeScript validation
```

### Testing Strategy

- Unit tests for utilities and store actions in `src/__tests__/`
- React component testing with `@testing-library/react`
- 3D components use mocked Three.js objects in tests
- ID utilities have comprehensive test coverage demonstrating the expected patterns

### File Organization

```
src/
├── components/Canvas3D/    # All 3D React Three Fiber components
├── components/UI/          # 2D UI components (panels, controls)
├── stores/                 # Zustand stores (primarily designStore.ts)
├── types/                  # Comprehensive TypeScript definitions
├── utils/                  # Pure functions (id, math, validation, camera)
└── styles/                 # Global CSS and Tailwind config
```

## 3D Implementation Specifics

### Scene Configuration

The `scene3D` state object controls all 3D rendering:

- `camera`: Position, target, FOV, zoom
- `lighting`: Ambient, directional, shadows
- `renderSettings`: Quality, effects, wireframe
- `environment`: Background, grid, ground plane

### Element Rendering

- Each architectural element (wall, door, etc.) has a corresponding 3D component
- Use `useMemo` for expensive geometry calculations
- Follow the selection/hover pattern from `Wall3D.tsx`
- Materials are managed centrally in the store and resolved by ID

### Camera Controls

- Multiple camera presets (perspective, top, isometric, etc.)
- Use `CameraControls` or `EnhancedCameraControls` components
- Camera state syncs with the Zustand store for persistence

## Project-Specific Conventions

### State Management

- Always use store actions, never direct state mutation
- Element updates use partial objects: `updateWall(id, { height: 3.5 })`
- Selection state is centralized: `selectElement(id, 'wall')`

### Component Props

- 3D elements receive the full element object plus `onSelect` callback
- UI components use controlled state patterns with store integration
- Event handlers follow the pattern: `onElementSelect(id, type)`

### Material System

- Materials have `color` (hex string) and `properties` (PBR values)
- Default materials are provided in the store initialization
- Material resolution happens in 3D components, not in the store

### Performance Patterns

- Geometry calculations are memoized in 3D components
- Use `Suspense` boundaries around 3D scenes
- Physics simulation is optional and can be disabled
- Quality settings in `renderSettings` control performance vs. visual fidelity

## Integration Points

### React Three Fiber Integration

- Canvas configuration in `Scene3D.tsx` matches store settings
- All 3D components are wrapped in R3F context
- Use `@react-three/drei` helpers for common functionality

### External Dependencies

- `@react-three/rapier` for optional physics simulation
- `@use-gesture/react` for gesture handling in 3D space
- `file-saver` and `jszip` for export functionality
- `pdfmake` for generating architectural documents

### Cross-Component Communication

- Selection state flows through the store, not prop drilling
- Camera changes trigger store updates for persistence
- 3D scene changes update the `scene3D` configuration object

## Critical Implementation Notes

1. **View Mode Switching**: The app supports '2d', '3d', and 'hybrid' modes, though only 3D is fully implemented
2. **Element Lifecycle**: Elements are created with store actions, not direct array manipulation
3. **3D Coordinate System**: Uses standard Three.js coordinates (Y-up, right-handed)
4. **Material Properties**: Supports both basic colors and full PBR material properties
5. **Testing Three.js**: 3D components require canvas mocking in test environment

When working with this codebase, focus on the Zustand store patterns, proper TypeScript usage, and the React Three Fiber ecosystem integration. The architecture is designed for progressive enhancement, so start with the store and build UI components that integrate cleanly with the existing patterns.
