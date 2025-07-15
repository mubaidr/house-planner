# Architecture Documentation - 2D House Planner

## System Architecture Overview

The 2D House Planner follows a modern React architecture with clear separation of concerns, leveraging TypeScript for type safety and Zustand for state management.

## Core Architecture Principles

### 1. 2D-First Design
- **No 3D Dependencies**: Complete removal of 3D/isometric references
- **Mathematical Projections**: 3D to 2D projection system for elevation views
- **View Consistency**: Unified element representation across all views
- **Performance Optimized**: 2D-specific optimizations throughout

### 2. Component-Based Architecture
```
Application Layer
├── Layout Components (AppLayout, Toolbar, Sidebar)
├── Canvas System (DrawingCanvas, Renderers)
├── UI Components (Properties, Materials, Export)
└── Utility Components (ViewSwitcher, StatusBar)

Business Logic Layer
├── Stores (Zustand state management)
├── Hooks (Custom React hooks)
├── Utils (Pure utility functions)
└── Types (TypeScript definitions)

Data Layer
├── Element Management (Walls, Doors, Windows, etc.)
├── Material System (Library, Templates, Patterns)
├── View Management (Projections, Transformations)
└── Export System (Formats, Layouts, Processing)
```

### 3. State Management Strategy
```typescript
// Zustand stores with clear responsibilities
designStore     // Core design elements and operations
viewStore       // View state and transitions
materialStore   // Material library and application
templateStore   // Design templates and presets
floorStore      // Multi-floor management
historyStore    // Undo/redo operations
uiStore         // UI state and preferences
```

## Detailed Component Architecture

### Canvas System
```typescript
// Core canvas architecture
DrawingCanvas.tsx           // Main canvas container
├── PlanViewRenderer2D      // Top-down view rendering
├── ElevationRenderer2D     // Elevation view rendering
├── Element Renderers       // Individual element rendering
│   ├── PlanWallRenderer2D
│   ├── ElevationWallRenderer2D
│   ├── PlanDoorRenderer2D
│   └── ElevationDoorRenderer2D
└── Interaction Handlers    // Mouse/touch event handling
```

### Element System
```typescript
// Element type hierarchy
Element2D (base interface)
├── Wall2D          // Wall elements with joining
├── Door2D          // Door elements with wall attachment
├── Window2D        // Window elements with wall attachment
├── Stair2D         // Stair elements with floor connections
├── Roof2D          // Roof elements with wall integration
└── Room2D          // Room detection and management
```

### View System
```typescript
// View management architecture
ViewType2D = 'plan' | 'front' | 'back' | 'left' | 'right'

ViewConfiguration {
  type: ViewType2D
  camera: CameraSettings
  projection: ProjectionMatrix
  layers: LayerVisibility
  grid: GridSettings
}

// Projection system
projectElementToView(element: Element3D, view: ViewType2D): Element2D
```

## Data Flow Architecture

### 1. User Interaction Flow
```
User Input → Event Handler → Store Action → State Update → Component Re-render → Canvas Update
```

### 2. Element Creation Flow
```
Tool Selection → Canvas Click → Element Creation → Store Update → History Command → Render Update
```

### 3. View Switching Flow
```
View Button Click → View Store Update → Projection Calculation → Element Transformation → Canvas Re-render
```

### 4. Material Application Flow
```
Material Selection → Drag to Element → Hit Detection → Material Assignment → Store Update → Visual Update
```

## Advanced Systems

### 1. Wall Joining System
```typescript
// Advanced wall joining with 7 joint types
interface WallJoint {
  id: string
  type: 'butt' | 'miter' | 't-joint' | 'cross' | 'l-joint' | 'corner' | 'custom'
  walls: string[]  // Connected wall IDs
  position: Point2D
  angle: number
  geometry: JointGeometry
}

// Automatic joint detection
detectWallJoints(walls: Wall2D[]): WallJoint[]
updateJointGeometry(joint: WallJoint, walls: Wall2D[]): JointGeometry
```

### 2. Roof-Wall Integration
```typescript
// Complex roof-wall connection system
interface RoofWallConnection {
  id: string
  type: 'eave' | 'gable' | 'hip' | 'valley' | 'ridge' | 'dormer' | 'custom'
  roofId: string
  wallId: string
  connectionGeometry: ConnectionGeometry
  materials: ConnectionMaterials
}

// 7 connection types with proper geometry
calculateConnectionGeometry(roof: Roof2D, wall: Wall2D): ConnectionGeometry
```

### 3. Dimension Management
```typescript
// Professional dimension system
interface Dimension2D {
  id: string
  type: 'linear' | 'angular' | 'radial' | 'diameter'
  startPoint: Point2D
  endPoint: Point2D
  value: number
  units: 'metric' | 'imperial'
  style: DimensionStyle
  visibility: ViewVisibility
}

// Auto-generation and manual control
generateAutoDimensions(elements: Element2D[]): Dimension2D[]
updateDimensionValue(id: string, value: number): void
```

### 4. Export System
```typescript
// Multi-format export architecture
interface ExportOptions {
  format: 'png' | 'pdf' | 'svg'
  views: ViewType2D[]
  layout: DrawingSheetLayout
  quality: ExportQuality
  batch: boolean
}

// Drawing sheet system
interface DrawingSheet {
  size: PaperSize
  orientation: 'portrait' | 'landscape'
  margins: Margins
  titleBlock: TitleBlock
  viewPlacements: SheetViewPlacement[]
}
```

## Performance Architecture

### 1. Canvas Optimization
- **Layer Management**: Separate layers for different element types
- **Selective Rendering**: Only render visible elements
- **Event Optimization**: Efficient hit detection and event handling
- **Memory Management**: Proper cleanup of Konva objects

### 2. State Optimization
- **Selective Updates**: Zustand's selective subscription system
- **Computed Values**: Memoized calculations for expensive operations
- **Batch Updates**: Grouped state updates for better performance
- **History Optimization**: Efficient undo/redo with command pattern

### 3. View Switching Optimization
- **Cached Projections**: Pre-calculated projection matrices
- **Incremental Updates**: Only update changed elements
- **Transition Management**: Smooth view transitions with loading states
- **Memory Efficiency**: Cleanup unused view data

## Security & Data Architecture

### 1. Data Validation
```typescript
// Type-safe element validation
validateElement(element: Element2D): ValidationResult
validateWallJoint(joint: WallJoint): ValidationResult
validateMaterialAssignment(elementId: string, materialId: string): ValidationResult
```

### 2. Error Handling
```typescript
// Comprehensive error handling
try {
  // Canvas operations
} catch (error) {
  handleCanvasError(error)
  showUserFriendlyMessage()
  logErrorForDebugging(error)
}
```

### 3. Data Persistence
```typescript
// Local storage with validation
saveDesign(design: DesignData): Promise<void>
loadDesign(id: string): Promise<DesignData>
validateDesignData(data: unknown): DesignData | null
```

## Testing Architecture

### 1. Unit Testing
- **Pure Functions**: Test utility functions in isolation
- **Component Testing**: Test React components with React Testing Library
- **Store Testing**: Test Zustand stores with mock data
- **Hook Testing**: Test custom hooks with React Hooks Testing Library

### 2. Integration Testing
- **Canvas Integration**: Test canvas rendering with mock Konva
- **Store Integration**: Test store interactions
- **View Switching**: Test complete view switching flow
- **Export Integration**: Test export functionality end-to-end

### 3. Performance Testing
- **Canvas Performance**: Measure rendering performance
- **Memory Usage**: Monitor memory leaks
- **State Performance**: Measure state update performance
- **Export Performance**: Test export speed and quality

## Deployment Architecture

### 1. Build System
- **Next.js**: Static site generation with dynamic routes
- **Turbopack**: Fast development builds
- **TypeScript**: Compile-time type checking
- **ESLint**: Code quality enforcement

### 2. Asset Optimization
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting by Next.js
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Performance Monitoring**: Core Web Vitals tracking

This architecture documentation provides a comprehensive overview of the system design and implementation patterns used throughout the 2D House Planner application.