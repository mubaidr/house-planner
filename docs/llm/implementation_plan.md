# Implementation Plan for 2D House Planner

This document outlines the implementation plan for the 2D House Planner web application. It is designed to be used by AI coding assistants (GitHub Copilot, Gemini, Rovodev) to guide the development process. Each task includes specific implementation details, key libraries, and code structure guidance to facilitate efficient assistance.

## Phase 1: Core Functionality & UI Scaffolding

This phase focuses on building the foundational elements of the application.

### Core Backend/System Tasks:

* **Project Setup:**
  * Initialize a Next.js project with TypeScript and Tailwind CSS
  * Libraries: Next.js 14+, TypeScript 5.0+, Tailwind CSS 3.0+, React, Konva, Zustland, React-Konva
  * Configuration files: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`
  * Run development server with `npm run dev`
  * Expected file structure: `/src/app` for routing, `/src/components` for UI components

* **Canvas Setup:**
  * Integrate Konva.js for the 2D drawing canvas
  * Libraries: konva 9.0+, react-konva
  * Key components: `<Stage>`, `<Layer>`, and shape components
  * Create wrapper component: `/src/components/Canvas/DrawingCanvas.tsx`
  * Implement canvas zoom/pan functionality in `/src/hooks/useCanvasControls.ts`

* **State Management:**
  * Set up Zustand for application state management
  * Libraries: zustand 4.0+
  * Create store files in `/src/stores/`
  * Data schema: Define strong TypeScript interfaces for all state objects
  * Store structure: `designStore.ts` for canvas elements, `uiStore.ts` for UI state
  * Implement slices pattern for complex state management

* **Save/Load:**
  * Implement save/load functionality using localStorage
  * Create utilities in `/src/utils/storage.ts`
  * Data format: Serialize design as JSON with proper typing
  * Add auto-save functionality with configurable intervals

### UI Component Scaffolding:

* **Main Layout:**
  * Create responsive layout with header, canvas area, and collapsible sidebars
  * File: `/src/components/Layout/AppLayout.tsx`
  * Use CSS Grid for flexible layout with areas: "header", "sidebar", "canvas", "properties"
  * Implement responsive breakpoints for mobile/tablet/desktop views

* **Toolbar:**
  * Implement toolbar with icon buttons for drawing tools
  * File: `/src/components/Toolbar/Toolbar.tsx`
  * Include tool components: `/src/components/Toolbar/ToolButton.tsx`
  * Use state to track active tool
  * Implement keyboard shortcuts for common tools (e.g., 'W' for wall tool)

* **Sidebar:**
  * Create collapsible sidebar for structural elements
  * File: `/src/components/Sidebar/ElementsSidebar.tsx`
  * Group elements by categories (walls, doors, windows, furniture)
  * Use accordion component for category sections
  * Add search/filter functionality for elements

* **Properties Panel:**
  * Add properties panel for selected element editing
  * File: `/src/components/Properties/PropertiesPanel.tsx`
  * Implement dynamic form generation based on element type
  * Include common property editors: number inputs, color pickers, dropdowns
  * Update properties in real-time using Zustand store

* **Status Bar:**
  * Implement status bar for contextual information
  * File: `/src/components/StatusBar/StatusBar.tsx`
  * Display coordinates, grid size, zoom level, and active tool
  * Add toggle buttons for grid, snap settings

* **View Switcher:**
  * Create floating action button for view switching:
    * 2D (Top Down View) (Default)
    * Isometric View
    * Front View
    * Right View
    * Left View
    * Back View
  * File: `/src/components/ViewSwitcher/ViewSwitcher.tsx`
  * Implement smooth transition between views
  * Add preset view options (top-down, isometric)

## Phase 2: Implementing Core Drawing Features

This phase focuses on the primary drawing and editing capabilities.

* **Wall Tool:**
  * Implement wall drawing with start/end points
  * File: `/src/components/Tools/WallTool.tsx`
  * Data model: `/src/types/elements/Wall.ts` with properties for thickness, height, material
  * Use Konva Line with custom styling for walls
  * Implement wall intersection detection and automatic joining
  * Add interactive handles for resizing and moving
  * Support both click-to-place and drag-to-draw modes

* **Door Tool:**
  * Implement door placement on existing walls
  * File: `/src/components/Tools/DoorTool.tsx`
  * Data model: `/src/types/elements/Door.ts` with properties for width, height, swing direction
  * Add constraint system to ensure doors only place on walls
  * Implement door swing animation on click
  * Add different door styles (single, double, sliding)

* **Window Tool:**
  * Implement window placement on existing walls
  * File: `/src/components/Tools/WindowTool.tsx`
  * Data model: `/src/types/elements/Window.ts` with properties for width, height, type
  * Add constraint system to ensure windows only place on walls
  * Support different window styles (single, double, casement)
  * Add window transparency effect with Konva opacity

* **Grid and Snapping:**
  * Implement configurable grid with custom spacing
  * File: `/src/components/Canvas/Grid.tsx`
  * Create snapping utility: `/src/utils/snapping.ts`
  * Implement snap points at ends and midpoints of walls
  * Add visual indicators when snapping occurs
  * Support toggling grid visibility and snap functionality
  * Add rulers along canvas edges

## Phase 3: Advanced Features & Refinements

This phase adds more complex features and refines the user experience.

* **Multi-story Support:**
  * Implement floor management system
  * Files: `/src/components/Floors/FloorManager.tsx`, `/src/stores/floorStore.ts`
  * Data model: `/src/types/Floor.ts` with level number, elements, and visibility
  * Add UI for creating, selecting, and deleting floors
  * Implement floor copying functionality
  * Add floor visualization with transparency for floors above/below

* **Stairs and Roofs:**
  * Implement parameterized stair tool
  * File: `/src/components/Tools/StairTool.tsx`
  * Data models: `/src/types/elements/Stair.ts`, `/src/types/elements/Roof.ts`
  * Support multiple stair types (straight, spiral, U-shaped)
  * Implement roof tool with automatic roof generation from wall outlines
  * Add pitch, overhang, and style controls for roofs

* **Material Library:**
  * Create material management system
  * Files: `/src/components/Materials/MaterialLibrary.tsx`, `/src/stores/materialStore.ts`
  * Data model: `/src/types/Material.ts` with texture, color, and properties
  * Include preset materials (wood, concrete, glass, etc.)
  * Allow custom material creation
  * Implement material preview with thumbnails
  * Add texture mapping to elements

* **Exporting:**
  * Implement export functionality
  * File: `/src/utils/export.ts`
  * Add PNG export using Konva's toDataURL method
  * Implement PDF generation with reportlab or similar library
  * Add options for export quality, size, and content
  * Support exporting individual floors or complete design

* **Undo/Redo:**
  * Implement command pattern for history management
  * Files: `/src/utils/history.ts`, `/src/stores/historyStore.ts`
  * Create base Command class with execute/undo methods
  * Implement specific commands for each action type
  * Add keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  * Support batch operations as single undo/redo steps

* **Measurement and Alignment Tools:**
  * Create measurement tool
  * File: `/src/components/Tools/MeasurementTool.tsx`
  * Implement snap-based alignment guides
  * Add dimension display for selected elements
  * Create alignment tools (center, distribute, etc.)
  * Support both imperial and metric units with conversion

## Development Workflow & AI Assistant Guidelines

The development process is structured to work efficiently with AI coding assistants (GitHub Copilot, Gemini, Rovodev). This section provides guidance on using `task_management.md` and interacting with AI tools.

### Using `task_management.md`

The `docs/llm/task_management.md` file is a living document that should be updated at the end of each development session.

### Workflow Steps

1. **Review the plan:** Before starting a new feature, read the relevant sections of this implementation plan.
2. **Implement the feature:** Write the code to implement the feature, focusing on one component at a time.
3. **Code quality:** Fix lint and type errors without deviating from the plan or breaking or reverting any existing features.
4. **Update `task_management.md`:**
   * Add completed task(s) to the "Completed Tasks" section
   * Document key decisions made during implementation
   * Update the "Pending Tasks/Next Steps" section

### AI Assistant Usage Tips

* **Reference file paths:** When asking for help, reference the exact file paths from this document
* **Include type definitions:** Provide or request TypeScript interfaces for new components
* **Component boundaries:** Clearly define the scope of each component when requesting assistance
* **Code structure:** Follow the component and file organization outlined in this plan
* **Testing approach:** Include test considerations when implementing key features
* **State management:** Follow the Zustand patterns defined in the plan

> Dev server must be started manually if needed.
> You should assume it is already running
> You should not attempt to start it unless explicitly requested.
