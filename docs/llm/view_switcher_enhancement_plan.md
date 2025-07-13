# VIEW_SWITCHER_ENHANCEMENT_PLAN

## TASK_OVERVIEW
- TARGET: 2D-only architectural drawing system
- SCOPE: Plan, Front, Back, Left, Right views
- CONSTRAINT: Remove all 3D/isometric references

## IMPLEMENTATION_PHASES
1. CORE_VIEW_SYSTEM: 2D element types, view projection, elevation rendering, view switcher, undo/redo
2. VIEW_RENDERING: Plan/elevation renderers, material rendering, material patterns
3. JOINING_SYSTEM: Wall joining, roof-wall integration, opening integration
4. DIMENSION_ANNOTATION: Multi-view dimensions, annotation system
5. EXPORT_ENHANCEMENT: Multi-view export, drawing layout

## FEATURE_REQUIREMENTS
- MULTI_VIEW_2D_RENDERING: All 2D elevations + plan with accurate proportions
- MATERIAL_VISUALIZATION: Materials on all surfaces in all 2D views
- STRUCTURAL_RELATIONSHIPS: Wall joining, roof integration, door/window placement (2D only)
- EXPORT_CAPABILITIES: Professional 2D architectural drawings (PDF/image)
- DIMENSIONAL_ACCURACY: Real measurements in each 2D view
- CUSTOM_VIEWS: User-defined section cuts, detail zooms
- LAYER_MANAGEMENT: Toggle visibility (furniture, electrical, plumbing)
- INTERACTIVE_DIMENSION_EDITING: Direct dimension editing on drawings
- REAL_TIME_EXPORT_PREVIEW: Preview before saving
- UNDO_REDO: View changes and annotations
- ACCESSIBILITY: Color themes, high-contrast mode
- BATCH_EXPORT: Multiple sheets/views at once

## DEVELOPMENT_PROCESS
1. ANALYZE_CURRENT: Review existing implementation and limitations
2. PLAN_FEATURE: Define requirements, design, dependencies
3. IMPLEMENT: Develop and integrate feature
4. UPDATE_TASK_MANAGEMENT: Mark task complete, update progress in docs/llm/task_management.md
5. VERIFY_STABILITY: Ensure no regressions
6. COMMIT_CHANGES: Git commit with task ID and description

## PHASE_1_CORE_VIEW_SYSTEM

### DEPENDENCIES
- 2D element types → projection utilities → rendering utilities
- Undo/redo integration with view switcher

### ACCEPTANCE_CRITERIA
- Seamless 2D view switching
- Undo/redo for view changes and annotations

### IMPLEMENTATION_TARGETS

#### FILE: src/types/views.ts
```typescript
export type ViewType = 'plan' | 'front' | 'back' | 'left' | 'right';

export interface ViewConfiguration {
  type: ViewType;
  scale: number;
  showGrid: boolean;
  showDimensions: boolean;
  showMaterials: boolean;
  showAnnotations: boolean;
}
```

#### FILE: src/utils/viewProjection.ts
```typescript
export interface ProjectedElement2D {
  id: string;
  type: 'wall' | 'door' | 'window' | 'roof' | 'stair';
  points: Point2D[];
  material?: string;
  dimensions: { width: number; height: number; };
}

export class ViewProjector2D {
  static projectToView(elements: Element2D[], view: ViewType): ProjectedElement2D[];
}
```

#### FILE: src/types/elements2D.ts
```typescript
export interface Wall2D {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number;
  material?: string;
  openings: Opening2D[];
}

export interface Opening2D {
  id: string;
  type: 'door' | 'window';
  position: number; // 0-1 along wall
  width: number;
  height: number;
  material?: string;
  wallId: string;
}

export interface Roof2D {
  id: string;
  type: 'gable' | 'hip' | 'shed' | 'flat';
  outline: Point2D[];
  material?: string;
}

export interface Stair2D {
  id: string;
  steps: number;
  width: number;
  height: number;
  direction: 'up' | 'down';
  material?: string;
}
```

## PHASE_2_VIEW_RENDERING_SYSTEM

### DEPENDENCIES
- Core view system implementation complete

### ACCEPTANCE_CRITERIA
- Plan and elevation views render all elements and materials correctly

### IMPLEMENTATION_TARGETS

#### FILE: src/components/Views/PlanViewRenderer2D.tsx
```typescript
export class PlanViewRenderer2D {
  renderWalls(walls: Wall2D[]): React.ReactNode;
  renderWallJoins(intersections: WallIntersection2D[]): React.ReactNode;
  renderOpenings(openings: Opening2D[]): React.ReactNode;
  renderRoofOutline(roofs: Roof2D[]): React.ReactNode;
  renderStairSymbols(stairs: Stair2D[]): React.ReactNode;
  renderDimensions(elements: Element2D[]): React.ReactNode;
  renderMaterials(elements: Element2D[]): React.ReactNode;
}
```

#### FILE: src/components/Views/ElevationRenderer2D.tsx
```typescript
export class ElevationRenderer2D {
  constructor(private view: 'front' | 'back' | 'left' | 'right') {}
  renderWallElevations(walls: Wall2D[]): React.ReactNode;
  renderRoofProfile(roofs: Roof2D[]): React.ReactNode;
  renderOpeningsInElevation(openings: Opening2D[]): React.ReactNode;
  renderStairProfile(stairs: Stair2D[]): React.ReactNode;
  renderMaterialTextures(elements: Element2D[]): React.ReactNode;
  renderHeightDimensions(elements: Element2D[]): React.ReactNode;
}
```

#### FILE: src/utils/materialRenderer2D.ts
```typescript
export interface MaterialRenderer2D {
  renderPlanMaterial(element: Element2D, material: Material): React.ReactNode;
  renderElevationMaterial(element: Element2D, material: Material): React.ReactNode;
  generateMaterialPattern(material: Material): SVGPattern;
  calculateMaterialScale(view: ViewType): number;
}

export const MATERIAL_PATTERNS_2D = {
  brick: { pattern: 'brick-hatch', scale: 1.0, color: '#8B4513' },
  concrete: { pattern: 'concrete-stipple', scale: 0.8, color: '#808080' },
  wood: { pattern: 'wood-grain', scale: 1.2, color: '#DEB887' },
  glass: { pattern: 'glass-lines', scale: 0.5, color: '#87CEEB' },
  metal: { pattern: 'metal-crosshatch', scale: 0.7, color: '#C0C0C0' },
  tile: { pattern: 'tile-grid', scale: 1.0, color: '#F5F5DC' },
  shingle: { pattern: 'shingle-overlap', scale: 1.1, color: '#654321' }
};
```

## PHASE_3_ENHANCED_JOINING_SYSTEM

### DEPENDENCIES
- Walls, roofs, openings implementation complete

### ACCEPTANCE_CRITERIA
- Wall joins, roof-wall connections, opening placements accurate in all views

### IMPLEMENTATION_TARGETS

#### FILE: src/utils/wallJoining2D.ts
```typescript
export interface WallJoinConfiguration2D {
  type: 'corner' | 'tee' | 'cross' | 'end';
  walls: string[]; // Wall IDs
  joinPoint: Point2D;
  joinMethod: 'miter' | 'butt' | 'overlap';
  material?: string;
}

export class AdvancedWallJoiner2D {
  static calculateJoinType(walls: Wall2D[], point: Point2D): WallJoinConfiguration2D;
  static generateJoinGeometry(config: WallJoinConfiguration2D): JoinGeometry2D;
  static renderJoinInPlan(config: WallJoinConfiguration2D): React.ReactNode;
  static renderJoinInElevation(config: WallJoinConfiguration2D, view: ViewType): React.ReactNode;
}
```

#### FILE: src/utils/roofWallIntegration2D.ts
```typescript
export interface RoofWallConnection2D {
  roofId: string;
  wallId: string;
  connectionType: 'eave' | 'gable' | 'ridge';
  overhang: number;
  material?: string;
}

export class RoofWallIntegrator2D {
  static calculateRoofConnections(roofs: Roof2D[], walls: Wall2D[]): RoofWallConnection2D[];
  static generateRoofProfile(roof: Roof2D, view: ViewType): RoofProfile2D;
  static renderRoofWallJoin(connection: RoofWallConnection2D, view: ViewType): React.ReactNode;
}
```

#### FILE: src/utils/openingIntegration2D.ts
```typescript
export class OpeningIntegrator2D {
  static validateOpeningPlacement(opening: Opening2D, wall: Wall2D): ValidationResult2D;
  static calculateOpeningGeometry(opening: Opening2D, wall: Wall2D): OpeningGeometry2D;
  static renderOpeningInPlan(opening: Opening2D): React.ReactNode;
  static renderOpeningInElevation(opening: Opening2D, view: ViewType): React.ReactNode;
  static generateOpeningDimensions(opening: Opening2D): DimensionSet2D;
}
```

## PHASE_4_DIMENSION_ANNOTATION_SYSTEM

### DEPENDENCIES
- Rendering system complete

### ACCEPTANCE_CRITERIA
- Dimensions and annotations editable and visible in all views

### IMPLEMENTATION_TARGETS

#### FILE: src/utils/dimensionManager2D.ts
```typescript
export interface ViewDimensions2D {
  view: ViewType;
  dimensions: Dimension2D[];
  annotations: Annotation2D[];
  labels: Label2D[];
}

export class DimensionManager2D {
  static generatePlanDimensions(elements: Element2D[]): Dimension2D[];
  static generateElevationDimensions(elements: Element2D[], view: ViewType): Dimension2D[];
  static renderDimensionsForView(dimensions: Dimension2D[], view: ViewType): React.ReactNode;
}
```

#### FILE: src/components/Annotations/AnnotationRenderer2D.tsx
```typescript
export interface Annotation2D {
  id: string;
  type: 'room_label' | 'material_note' | 'dimension' | 'detail_callout';
  position: Point2D;
  text: string;
  style?: AnnotationStyle2D;
  view: ViewType;
}

export class AnnotationRenderer2D {
  static renderRoomLabels(rooms: Room2D[], view: ViewType): React.ReactNode;
  static renderMaterialNotes(elements: Element2D[]): React.ReactNode;
  static renderDetailCallouts(details: DetailCallout2D[]): React.ReactNode;
}
```

## PHASE_5_EXPORT_SYSTEM_ENHANCEMENT

### DEPENDENCIES
- All views and annotation systems complete

### ACCEPTANCE_CRITERIA
- Professional, accurate exported drawings with all required details

### IMPLEMENTATION_TARGETS

#### FILE: src/utils/exportUtils2D.ts
```typescript
export interface ExportConfiguration2D {
  views: ViewType[];
  format: 'pdf' | 'png' | 'svg';
  scale: number;
  paperSize: 'A4' | 'A3' | 'A2' | 'A1' | 'Letter' | 'Legal';
  layout: 'single' | 'multi' | 'sheet_set';
  includeTitle: boolean;
  includeDimensions: boolean;
  includeMaterials: boolean;
  includeAnnotations: boolean;
}

export class MultiViewExporter2D {
  static exportSingleView(view: ViewType, config: ExportConfiguration2D): Promise<Blob>;
  static exportMultiView(config: ExportConfiguration2D): Promise<Blob>;
  static generatePDFSheetSet(views: ViewType[], config: ExportConfiguration2D): Promise<Blob>;
}
```

#### FILE: src/types/drawingSheet2D.ts
```typescript
export interface DrawingSheet2D {
  title: string;
  scale: string;
  date: string;
  views: {
    plan?: ViewData2D;
    front?: ViewData2D;
    back?: ViewData2D;
    left?: ViewData2D;
    right?: ViewData2D;
    details?: ViewData2D[];
  };
  titleBlock: TitleBlock2D;
  dimensions: DimensionSet2D;
  materialSchedule: MaterialSchedule2D;
}
```

## IMPLEMENTATION_ROADMAP

### WEEK_1_2_CORE_VIEW_SYSTEM
- Implement 2D element types (Wall2D, Roof2D, etc.)
- Create 2D view projection utilities
- Build basic 2D elevation rendering system
- Update view switcher for 2D view changes
- Add undo/redo for view changes and annotations

### WEEK_3_4_MATERIAL_LAYER_SYSTEM
- Implement material patterns for 2D views
- Create material rendering for each 2D view type
- Build material application system for all 2D surfaces
- Add material schedule generation
- Implement layer management (toggle visibility)

### WEEK_5_6_JOINING_CUSTOM_VIEWS
- Implement advanced 2D wall joining system
- Create 2D roof-wall integration
- Build 2D opening integration system
- Add join rendering for all 2D views
- Add custom views (section cuts, detail zooms)

### WEEK_7_8_DIMENSIONS_EXPORT_ACCESSIBILITY
- Implement multi-view 2D dimension system
- Create 2D annotation system
- Build enhanced 2D export system
- Add professional 2D drawing layout
- Enable interactive dimension editing
- Add real-time export preview
- Implement accessibility options
- Add batch export

## TECHNICAL_IMPLEMENTATION

### STORE_STRUCTURE
#### FILE: src/stores/viewStore2D.ts
```typescript
export interface ViewStore2D {
  currentView: ViewType;
  viewConfigurations: Record<ViewType, ViewConfiguration>;
  showDimensions: boolean;
  showMaterials: boolean;
  showAnnotations: boolean;
  exportSettings: ExportConfiguration2D;
}
```

#### FILE: src/stores/element2DStore.ts
```typescript
export interface Element2DStore {
  walls2D: Wall2D[];
  roofs2D: Roof2D[];
  stairs2D: Stair2D[];
  openings2D: Opening2D[];
  joins2D: WallJoinConfiguration2D[];
  roofConnections2D: RoofWallConnection2D[];
}
```

### COMPONENT_STRUCTURE
```
src/components/Views/
├── PlanView/
│   ├── PlanRenderer2D.tsx
│   ├── WallPlanRenderer2D.tsx
│   ├── RoofPlanRenderer2D.tsx
│   └── OpeningPlanRenderer2D.tsx
├── ElevationView/
│   ├── ElevationRenderer2D.tsx
│   ├── WallElevationRenderer2D.tsx
│   ├── RoofElevationRenderer2D.tsx
│   └── OpeningElevationRenderer2D.tsx
├── Materials/
│   ├── MaterialPatternRenderer2D.tsx
│   ├── MaterialSchedule2D.tsx
│   └── MaterialLegend2D.tsx
├── Dimensions/
│   ├── PlanDimensions2D.tsx
│   ├── ElevationDimensions2D.tsx
│   └── HeightDimensions2D.tsx
└── Export/
    ├── MultiViewExporter2D.tsx
    ├── PDFGenerator2D.tsx
    └── DrawingSheetLayout2D.tsx
```

### UTILITY_STRUCTURE
```
src/utils/views/
├── viewProjection2D.ts
├── wallJoining2D.ts
├── roofGeometry2D.ts
├── openingCalculation2D.ts
├── materialPatterns2D.ts
├── dimensionCalculation2D.ts
└── exportUtils2D.ts
```

## SUCCESS_CRITERIA
- Seamless 2D view switching with proper rendering
- Materials visible and properly represented in all 2D views
- Proper 2D wall joins, roof connections, opening placements
- Export-ready 2D drawings with dimensions and annotations
- Smooth 2D rendering with complex designs
- Intuitive interface for 2D view switching and material application
