# Implementation Plan for 2D House Planner

This document outlines the implementation plan for the 2D House Planner web application. It is designed to be used by an LLM agent to guide the development process.

## Phase 1: Core Functionality & UI Scaffolding

This phase focuses on building the foundational elements of the application.

### Core Backend/System Tasks:

*   **Project Setup:** Initialize a Next.js project with TypeScript and Tailwind CSS.
*   **Canvas Setup:** Integrate Konva.js for the 2D drawing canvas.
*   **State Management:** Set up a state management solution (e.g., Zustand or Redux Toolkit) to handle the application state, including the design data.
*   **Save/Load:** Implement basic save-to-local-storage and load-from-local-storage functionality.

### UI Component Scaffolding:

*   **Main Layout:** Create the main application layout with a header, a central canvas area, and sidebars.
*   **Toolbar:** Implement a basic toolbar component with placeholder buttons for the core tools.
*   **Sidebar:** Create a sidebar component for selecting structural elements.
*   **Properties Panel:** Add a properties panel to display and edit the properties of a selected element.
*   **Status Bar:** Implement a status bar to display information.
*   **View Switcher:** Create a floating action button for view switching.

## Phase 2: Implementing Core Drawing Features

This phase focuses on the primary drawing and editing capabilities.

*   **Wall Tool:**
    *   Implement the ability to draw walls on the canvas.
    *   Allow selecting walls.
    *   Allow deleting walls.
    *   Implement a properties panel for walls (e.g., thickness, material).
*   **Door Tool:**
    *   Implement the ability to add doors to walls.
    *   Allow selecting and moving doors along walls.
    *   Allow deleting doors.
*   **Window Tool:**
    *   Implement the ability to add windows to walls.
    *   Allow selecting and moving windows along walls.
    *   Allow deleting windows.
*   **Grid and Snapping:**
    *   Implement a visible grid on the canvas.
    *   Implement snap-to-grid functionality for drawing and moving elements.

## Phase 3: Advanced Features & Refinements

This phase adds more complex features and refines the user experience.

*   **Multi-story Support:**
    *   Implement a layer system for managing different floors.
    *   Add UI for switching between floors.
*   **Stairs and Roofs:**
    *   Implement tools for adding stairs and roofs.
*   **Material Library:**
    *   Create a material library with a selection of materials.
    *   Allow applying materials to walls, doors, windows, etc.
*   **Exporting:**
    *   Implement functionality to export the design as a PNG image.
    *   Implement functionality to export the design as a PDF document.
*   **Undo/Redo:**
    *   Implement undo and redo functionality.
*   **Measurement and Alignment Tools:**
    *   Add tools for measuring distances.
    *   Add tools for aligning elements.

## Using `task_management.md`

The `docs/llm/task_management.md` file is a living document that should be updated at the end of each development session.

**Workflow:**

1.  **Consult `implementation_plan.md`:** At the beginning of a session, review this document to identify the next task(s) to be implemented.
2.  **Implement the feature:** Write the code to implement the feature.
3.  **Update `task_management.md`:** At the end of the session, update the `task_management.md` file:
    *   Add the completed task(s) to the "Completed Tasks" section.
    *   Note any significant "Decisions Made" during the implementation.
    *   Update the "Pending Tasks/Next Steps" section to reflect the new state of the project.

This process ensures that there is a clear record of what has been done, what decisions have been made, and what needs to be done next, providing a consistent context for the LLM agent.
