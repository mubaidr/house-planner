# Qwen Code Agent Reference Document

## Project Overview
This document serves as a reference for the Qwen Code agent when working on the House Planner project. It contains important information about the project structure, design decisions, and development guidelines.

## Project Information
- **Project Name**: House Planner
- **Main Technology Stack**: React 19, TypeScript, React Three Fiber, Three.js, Zustand
- **Build Tool**: Vite
- **State Management**: Zustand with Immer middleware
- **Styling**: Tailwind CSS with DaisyUI
- **Testing**: Jest (configured but no tests yet), Playwright for E2E

## Project Structure
```
src/
├── components/
│   ├── Canvas3D/                 # 3D scene components
│   │   ├── Scene3D.tsx          # Main 3D scene container
│   │   ├── Camera/              # Camera controls
│   │   ├── Elements/            # 3D element renderers
│   │   ├── Lighting/            # Lighting system
│   │   ├── Tools/               # 3D tools (gizmos, measurements)
│   │   └── Effects/             # Post-processing effects
│   └── UI/                      # UI components
├── stores/                      # Zustand stores
├── types/                       # TypeScript definitions
├── utils/                       # Utility functions
└── styles/                      # Global styles
```

## Key Components

### 3D Elements
- **Wall3D.tsx**: Renders walls with proper positioning and geometry cleanup
- **Room3D.tsx**: Renders room floors with improved geometry calculation
- **Door3D.tsx**: Renders doors with opening animations (hinged/sliding)
- **Window3D.tsx**: Renders windows with frames and glass
- **Stair3D.tsx**: Renders stairs with individual steps and optional railings
- **Roof3D.tsx**: Renders roofs for rooms

### UI Components
- **ToolPanel.tsx**: Provides tools to add elements to the scene
- **PropertiesPanel.tsx**: Shows and edits properties of selected elements
- **ViewControls.tsx**: Controls for view mode and camera presets
- **RenderSettings.tsx**: Controls for render settings (shadows, grid, etc.)

### Stores
- **designStore.ts**: Central Zustand store managing all application state
- **scene3DStore.ts**: 3D scene specific state (camera, lighting, environment)
- **viewStore.ts**: UI view state (selected tools, panels, modes)

## Design Decisions

### 3D Element Implementation
1. **Geometry Management**: All 3D components implement proper geometry cleanup using React's useEffect to prevent memory leaks
2. **Positioning**: Elements are positioned at their logical center for easier rotation and scaling
3. **Selection**: Each element type supports selection with visual highlighting
4. **Materials**: PBR (Physically Based Rendering) materials are used for realistic appearance
5. **Modularity**: Each element is a self-contained component with its own properties and behavior

### State Management
1. **Multiple Stores**: Separated concerns across multiple Zustand stores for better organization
2. **Zustand with Immer**: Used for immutable state updates with familiar mutation syntax
3. **Element Types**: All elements have specific types in the store (wall, door, window, room, stair, roof)
4. **Selection State**: Single selected element with type tracking for proper property panel display
5. **Performance**: Used selectors to minimize unnecessary re-renders

### Event Handling
1. **Type Safety**: Event handlers properly type Three.js events and handle native event access
2. **Propagation**: Events properly stop propagation to prevent unintended behavior
3. **Memory Management**: Proper cleanup of event listeners and references

## Progress Tracking
For detailed progress tracking, refer to [PROGRESS.md](PROGRESS.md).

## Key Files for Reference

### Design Store (`src/stores/designStore.ts`)
- Contains all TypeScript interfaces for 3D elements
- Implements all CRUD operations for elements
- Manages selection and view mode state

### Element Components (`src/components/Canvas3D/Elements/`)
- Wall3D.tsx: Wall rendering with proper positioning
- Room3D.tsx: Room floor rendering with geometry cleanup
- Door3D.tsx: Door rendering with opening animations
- Window3D.tsx: Window rendering with frame and glass
- Stair3D.tsx: Stair rendering with individual steps and railings
- Roof3D.tsx: Roof rendering for rooms

### UI Components (`src/components/UI/`)
- ToolPanel.tsx: Tools for adding elements
- PropertiesPanel.tsx: Element property editing
- ViewControls.tsx: View mode and camera controls
- RenderSettings.tsx: Render settings controls

### Type Definitions (`src/types/elements/`)
- Contains TypeScript interfaces for all 3D element properties
- Strongly typed element definitions for better developer experience

## Development Guidelines

### TypeScript
1. Always use strict mode
2. Properly type all store access and component props
3. Use TypeScript interfaces for all data structures
4. Leverage TypeScript's discriminated unions for element type handling

### 3D Performance
1. Implement geometry cleanup in useEffect hooks
2. Use useMemo for expensive calculations
3. Consider using buffer geometries for better performance
4. Use frustum culling for large scenes
5. Implement level of detail (LOD) where appropriate

### React Patterns
1. Use functional components with hooks
2. Follow proper component composition patterns
3. Maintain clear separation between 3D and UI components
4. Use React.memo for performance optimization where appropriate
5. Implement proper error boundaries for 3D components

### State Management
1. Keep state normalized in the stores
2. Use immer for complex state updates
3. Implement proper selectors to minimize re-renders
4. Separate concerns across multiple stores when appropriate
5. Use middleware for cross-cutting concerns (persistence, logging)

## Common Tasks

### Adding a New Element Type
1. Add interface to `src/types/elements/`
2. Add type to discriminated union in `src/types/elements/index.ts` (if applicable)
3. Add CRUD actions to `src/stores/designStore.ts`
4. Create new component in `src/components/Canvas3D/Elements/`
5. Add to `ElementRenderer3D.tsx`
6. Add to `ToolPanel.tsx` if needed
7. Add to selection handling in tools panels
8. Add to PropertiesPanel.tsx for property editing

### Modifying Element Properties
1. Update interface in `src/types/elements/`
2. Add property handling in element component
3. Update property panel component
4. Add to store update actions
5. Update any relevant selectors

### Adding New Features
1. Follow existing patterns in the codebase
2. Maintain consistency with current architecture
3. Ensure proper TypeScript typing
4. Implement proper memory management for 3D objects
5. Add to relevant stores
6. Create appropriate UI components

## Troubleshooting

### TypeScript Errors
1. Check type imports and ensure proper typing of store access
2. Use explicit typing when accessing store properties
3. Refer to existing components for patterns
4. Ensure all element types are handled in discriminated unions

### 3D Rendering Issues
1. Check geometry creation and disposal
2. Verify positioning and rotation calculations
3. Ensure proper material properties
4. Check for memory leaks in useEffect cleanup functions
5. Verify event handlers are properly attached/detached

### Performance Issues
1. Check for memory leaks (missing geometry disposal)
2. Optimize expensive calculations with useMemo
3. Consider using instanced meshes for repeated objects
4. Check for unnecessary re-renders with React profiler
5. Use React.memo for expensive UI components

### State Management Issues
1. Verify selectors are correctly memoized
2. Check for unnecessary state updates
3. Ensure proper cleanup of subscriptions
4. Validate store state structure and normalization

## References
- [Project README](README.md): Main project documentation
- [Progress Tracking](PROGRESS.md): Implementation phase tracking
- [Three.js Documentation](https://threejs.org/docs/): 3D library documentation
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber): React renderer for Three.js
- [Zustand Documentation](https://github.com/pmndrs/zustand): State management library
- [Tailwind CSS Documentation](https://tailwindcss.com/docs): Utility-first CSS framework

---
*Last Updated: August 18, 2025*
*For use by Qwen Code agent when working on the House Planner project*