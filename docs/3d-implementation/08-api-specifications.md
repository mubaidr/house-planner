# API Specifications

> **Comprehensive API documentation for 3D House Planner integration with detailed interface specifications and usage examples**

---

## 🚨 API Foundation Update

**As of August 2025, all API extensions and integrations will be layered on and extend [CodeHole7/threejs-3d-room-designer](https://github.com/CodeHole7/threejs-3d-room-designer), a React-bundled Three.js room planner and product configurator.**

### API Adaptation:

- All API specifications below are to be interpreted as customizations, extensions, or integrations with the base project.
- Custom features (multi-floor, advanced export, material system, accessibility, etc.) will be layered on top using the extensibility points provided by the base project.
- Maintain compatibility and leverage the base's React/Three.js architecture for all new features.

---

## 📡 API Overview

This document defines the complete API surface for the 3D House Planner implementation, including internal APIs for component communication, external APIs for data exchange, and integration points with existing 2D functionality.

**API Design Philosophy**: Maintain backward compatibility with existing 2D APIs while providing clean, intuitive interfaces for 3D functionality.

---

## 🏗️ Core 3D APIs

## Scene Management API

### Scene3DManager

```typescript
interface Scene3DManager {
  // Initialization
  initialize(config: Scene3DConfig): Promise<void>;
  destroy(): Promise<void>;

  // Scene State
  getScene(): Scene;
  isInitialized(): boolean;
  getCapabilities(): SceneCapabilities;

  // Mode Management
  enableMode(mode: '2d' | '3d'): Promise<void>;
  getCurrentMode(): '2d' | '3d';
  onModeChange(callback: (mode: '2d' | '3d') => void): Unsubscribe;

  // Data Synchronization
  syncFrom2D(design: Design2D): Promise<void>;
  syncTo2D(): Promise<Design2D>;
  onDataChange(callback: (change: DataChangeEvent) => void): Unsubscribe;
}

interface Scene3DConfig {
  canvas: HTMLCanvasElement;
  pixelRatio?: number;
  antialias?: boolean;
  alpha?: boolean;
  preserveDrawingBuffer?: boolean;
  powerPreference?: 'default' | 'high-performance' | 'low-power';
  failIfMajorPerformanceCaveat?: boolean;
}

interface SceneCapabilities {
  webgl2: boolean;
  maxTextureSize: number;
  maxVertexUniforms: number;
  floatTextures: boolean;
  depthTextures: boolean;
  instancedArrays: boolean;
  vertexArrayObjects: boolean;
}

// Usage Example
const sceneManager = new Scene3DManager();

await sceneManager.initialize({
  canvas: canvasRef.current,
  antialias: true,
  powerPreference: 'high-performance',
});

sceneManager.onModeChange(mode => {
  console.log(`Switched to ${mode} mode`);
});

await sceneManager.enableMode('3d');
```

### Element3DRenderer

```typescript
interface Element3DRenderer {
  // Element Rendering
  renderWall(wall: Wall, options?: RenderOptions): Promise<Object3D>;
  renderRoom(room: Room, options?: RenderOptions): Promise<Object3D>;
  renderDoor(door: Door, wall: Wall, options?: RenderOptions): Promise<Object3D>;
  renderWindow(window: Window, wall: Wall, options?: RenderOptions): Promise<Object3D>;

  // Batch Operations
  renderElements(elements: Element[], options?: RenderOptions): Promise<Object3D[]>;
  updateElement(elementId: string, changes: ElementChanges): Promise<void>;
  removeElement(elementId: string): Promise<void>;

  // Material Management
  applyMaterial(elementId: string, materialId: string): Promise<void>;
  getMaterialLibrary(): MaterialLibrary;

  // Performance
  setLODLevel(level: LODLevel): void;
  enableInstancing(enabled: boolean): void;
  optimizeScene(): Promise<OptimizationResult>;
}

interface RenderOptions {
  quality?: 'low' | 'medium' | 'high';
  shadows?: boolean;
  materials?: boolean;
  animations?: boolean;
  lod?: boolean;
}

interface ElementChanges {
  position?: Vector3;
  rotation?: Euler;
  scale?: Vector3;
  material?: string;
  properties?: Record<string, any>;
}

// Usage Example
const renderer = new Element3DRenderer();

const wallObject = await renderer.renderWall(wall, {
  quality: 'high',
  shadows: true,
  materials: true,
});

scene.add(wallObject);
```

---

## Camera & Navigation API

### Camera3DController

```typescript
interface Camera3DController {
  // Camera Management
  getCamera(): Camera;
  setCamera(camera: Camera): void;

  // View Controls
  setViewPreset(preset: ViewPreset): Promise<void>;
  animateToView(view: CameraView, duration?: number): Promise<void>;
  getViewPresets(): ViewPreset[];

  // Interactive Controls
  enableOrbitControls(enabled: boolean): void;
  enableFlyControls(enabled: boolean): void;
  setControlsTarget(target: Vector3): void;

  // Camera State
  getCameraState(): CameraState;
  setCameraState(state: CameraState): Promise<void>;
  saveCameraState(name: string): void;
  loadCameraState(name: string): Promise<void>;

  // Events
  onCameraChange(callback: (state: CameraState) => void): Unsubscribe;
  onViewChange(callback: (preset: ViewPreset) => void): Unsubscribe;
}

interface ViewPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  camera: {
    position: Vector3;
    target: Vector3;
    up?: Vector3;
    fov?: number;
  };
  orthographic?: boolean;
  animationDuration?: number;
}

interface CameraState {
  position: Vector3;
  target: Vector3;
  up: Vector3;
  fov: number;
  near: number;
  far: number;
  zoom: number;
}

// Usage Example
const cameraController = new Camera3DController();

// Set view preset
await cameraController.setViewPreset({
  id: 'isometric',
  name: 'Isometric',
  description: '3D overview perspective',
  icon: '📦',
  camera: {
    position: new Vector3(10, 10, 10),
    target: new Vector3(0, 0, 0),
    fov: 75,
  },
});

// Listen for camera changes
cameraController.onCameraChange(state => {
  console.log('Camera moved:', state.position);
});
```

### Interaction3DManager

```typescript
interface Interaction3DManager {
  // Selection
  selectElement(elementId: string): void;
  selectElements(elementIds: string[]): void;
  clearSelection(): void;
  getSelection(): string[];

  // Raycasting
  raycast(screenPosition: Vector2): RaycastResult[];
  raycastFromCamera(camera: Camera, screenPosition: Vector2): RaycastResult[];

  // Transform Tools
  enableTransformControls(mode: 'translate' | 'rotate' | 'scale'): void;
  disableTransformControls(): void;
  getTransformMode(): 'translate' | 'rotate' | 'scale' | null;

  // Measurement
  startMeasurement(): void;
  addMeasurementPoint(point: Vector3): void;
  endMeasurement(): MeasurementResult;
  clearMeasurements(): void;

  // Events
  onElementSelect(callback: (elementId: string) => void): Unsubscribe;
  onElementHover(callback: (elementId: string | null) => void): Unsubscribe;
  onTransform(callback: (elementId: string, transform: Transform) => void): Unsubscribe;
}

interface RaycastResult {
  object: Object3D;
  point: Vector3;
  distance: number;
  face?: Face3;
  uv?: Vector2;
  elementId?: string;
  elementType?: ElementType;
}

interface MeasurementResult {
  id: string;
  points: Vector3[];
  distance: number;
  area?: number;
  volume?: number;
  unit: 'mm' | 'cm' | 'm' | 'in' | 'ft';
}

// Usage Example
const interactionManager = new Interaction3DManager();

// Setup element selection
interactionManager.onElementSelect(elementId => {
  console.log('Selected element:', elementId);
  highlightElement(elementId);
});

// Start measurement
interactionManager.startMeasurement();
```

---

## Material & Lighting API

### Material3DSystem

```typescript
interface Material3DSystem {
  // Material Management
  createMaterial(config: Material3DConfig): Promise<Material>;
  getMaterial(materialId: string): Material | null;
  updateMaterial(materialId: string, updates: Partial<Material3DConfig>): Promise<void>;
  deleteMaterial(materialId: string): void;

  // Library Management
  getLibrary(): MaterialLibrary;
  importMaterial(file: File): Promise<string>;
  exportMaterial(materialId: string): Promise<Blob>;

  // Texture Management
  loadTexture(url: string): Promise<Texture>;
  createTextureAtlas(textures: Texture[]): Promise<Texture>;
  compressTexture(texture: Texture, format: CompressionFormat): Promise<CompressedTexture>;

  // PBR Support
  createPBRMaterial(config: PBRMaterialConfig): Promise<MeshStandardMaterial>;
  validatePBRTextures(config: PBRMaterialConfig): ValidationResult;
}

interface Material3DConfig {
  id: string;
  name: string;
  type: 'standard' | 'physical' | 'lambert' | 'phong';
  baseColor: Color;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;

  // Texture maps
  diffuseMap?: string;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string;
  displacementMap?: string;

  // UV settings
  uvScale?: Vector2;
  uvOffset?: Vector2;
  uvRotation?: number;
}

interface PBRMaterialConfig extends Material3DConfig {
  type: 'physical';
  clearcoat?: number;
  clearcoatRoughness?: number;
  ior?: number;
  transmission?: number;
  thickness?: number;
  sheen?: Color;
  sheenRoughness?: number;
}

// Usage Example
const materialSystem = new Material3DSystem();

const woodMaterial = await materialSystem.createPBRMaterial({
  id: 'oak_wood',
  name: 'Oak Wood',
  type: 'physical',
  baseColor: new Color(0x8b4513),
  roughness: 0.8,
  metalness: 0.0,
  diffuseMap: '/textures/wood_diffuse.jpg',
  normalMap: '/textures/wood_normal.jpg',
  roughnessMap: '/textures/wood_roughness.jpg',
});
```

### Lighting3DSystem

```typescript
interface Lighting3DSystem {
  // Light Management
  addLight(light: Light3DConfig): string;
  updateLight(lightId: string, updates: Partial<Light3DConfig>): void;
  removeLight(lightId: string): void;
  getLights(): Light3DConfig[];

  // Presets
  applyLightingPreset(preset: LightingPreset): void;
  createLightingPreset(name: string, config: LightingConfig): void;
  getLightingPresets(): LightingPreset[];

  // Shadow Management
  enableShadows(enabled: boolean): void;
  setShadowQuality(quality: 'low' | 'medium' | 'high'): void;
  updateShadowMap(): void;

  // Environmental Lighting
  setEnvironment(environment: EnvironmentConfig): void;
  enableIBL(enabled: boolean): void; // Image-Based Lighting
}

interface Light3DConfig {
  id: string;
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  position?: Vector3;
  target?: Vector3;
  color: Color;
  intensity: number;
  distance?: number;
  decay?: number;
  angle?: number;
  penumbra?: number;
  castShadow?: boolean;
  shadowMapSize?: number;
}

interface LightingPreset {
  id: string;
  name: string;
  description: string;
  lights: Light3DConfig[];
  environment?: EnvironmentConfig;
}

interface EnvironmentConfig {
  type: 'color' | 'gradient' | 'skybox' | 'hdri';
  background: Color | Texture;
  environment?: Texture;
  intensity?: number;
}

// Usage Example
const lightingSystem = new Lighting3DSystem();

// Add sun light
const sunLightId = lightingSystem.addLight({
  id: 'sun',
  type: 'directional',
  position: new Vector3(10, 20, 5),
  color: new Color(0xffffee),
  intensity: 1.0,
  castShadow: true,
  shadowMapSize: 2048,
});

// Apply architectural lighting preset
lightingSystem.applyLightingPreset({
  id: 'architectural',
  name: 'Architectural Lighting',
  description: 'Professional architectural visualization lighting',
  lights: [
    // Sun light, fill light, ambient light configuration
  ],
});
```

---

## Export & Import API

### Export3DSystem

```typescript
interface Export3DSystem {
  // 3D Model Export
  exportGLTF(scene: Scene, options?: GLTFExportOptions): Promise<Blob>;
  exportOBJ(scene: Scene, options?: OBJExportOptions): Promise<Blob>;
  exportFBX(scene: Scene, options?: FBXExportOptions): Promise<Blob>;
  exportDAE(scene: Scene, options?: DAEExportOptions): Promise<Blob>;

  // Image Export
  exportImage(camera: Camera, scene: Scene, options?: ImageExportOptions): Promise<Blob>;

  exportAnimation(animation: AnimationClip, options?: AnimationExportOptions): Promise<Blob>;

  // Batch Export
  exportMultipleViews(views: CameraView[], options?: BatchExportOptions): Promise<ExportResult[]>;

  // Progress Tracking
  onProgress(callback: (progress: ExportProgress) => void): Unsubscribe;
}

interface GLTFExportOptions {
  binary?: boolean;
  embedImages?: boolean;
  includeCustomExtensions?: boolean;
  animations?: boolean;
  materials?: boolean;
  lights?: boolean;
  cameras?: boolean;
}

interface ImageExportOptions {
  width: number;
  height: number;
  format: 'png' | 'jpeg' | 'webp';
  quality?: number; // For JPEG and WebP
  pixelRatio?: number;
  antialiasing?: boolean;
  postProcessing?: boolean;
}

interface ExportProgress {
  stage: 'preparing' | 'rendering' | 'encoding' | 'complete';
  progress: number; // 0-1
  message: string;
  timeRemaining?: number;
}

// Usage Example
const exportSystem = new Export3DSystem();

// Export high-quality image
exportSystem.onProgress(progress => {
  console.log(`Export ${progress.stage}: ${Math.round(progress.progress * 100)}%`);
});

const imageBlob = await exportSystem.exportImage(camera, scene, {
  width: 3840,
  height: 2160,
  format: 'png',
  pixelRatio: 2,
  antialiasing: true,
});

// Export GLTF model
const modelBlob = await exportSystem.exportGLTF(scene, {
  binary: false,
  embedImages: true,
  animations: true,
  materials: true,
});
```

### Import3DSystem

```typescript
interface Import3DSystem {
  // Model Import
  importGLTF(data: ArrayBuffer | string): Promise<ImportResult>;
  importOBJ(data: string, mtlData?: string): Promise<ImportResult>;
  importFBX(data: ArrayBuffer): Promise<ImportResult>;

  // Asset Import
  importTexture(file: File): Promise<Texture>;
  importMaterial(file: File): Promise<Material>;
  importEnvironment(file: File): Promise<EnvironmentConfig>;

  // Validation
  validateModel(data: ArrayBuffer | string): Promise<ValidationResult>;
  getImportCapabilities(): ImportCapabilities;
}

interface ImportResult {
  scene: Object3D;
  animations?: AnimationClip[];
  materials?: Material[];
  textures?: Texture[];
  cameras?: Camera[];
  lights?: Light[];
  metadata?: ImportMetadata;
}

interface ImportMetadata {
  format: string;
  version?: string;
  generator?: string;
  copyright?: string;
  extensions?: string[];
  warnings?: string[];
}

// Usage Example
const importSystem = new Import3DSystem();

// Import GLTF model
const file = await fetch('/models/furniture.gltf');
const data = await file.text();

const result = await importSystem.importGLTF(data);
scene.add(result.scene);
```

---

## Performance & Optimization API

### Performance3DMonitor

```typescript
interface Performance3DMonitor {
  // Monitoring
  startMonitoring(): void;
  stopMonitoring(): void;
  getMetrics(): PerformanceMetrics3D;

  // Thresholds
  setThresholds(thresholds: PerformanceThresholds): void;
  onThresholdExceeded(callback: (alert: PerformanceAlert) => void): Unsubscribe;

  // Profiling
  startProfiler(duration?: number): void;
  getProfile(): PerformanceProfile;
  exportProfile(): Promise<Blob>;

  // Real-time Stats
  enableStats(enabled: boolean): void;
  getStatsPanel(): HTMLElement;
}

interface PerformanceMetrics3D {
  fps: number;
  frameTime: number;
  renderTime: number;
  memory: {
    geometries: number;
    textures: number;
    total: number;
  };
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
}

interface PerformanceThresholds {
  minFPS: number;
  maxFrameTime: number;
  maxMemory: number;
  maxDrawCalls: number;
}

// Usage Example
const monitor = new Performance3DMonitor();

monitor.setThresholds({
  minFPS: 30,
  maxFrameTime: 33,
  maxMemory: 500 * 1024 * 1024, // 500MB
  maxDrawCalls: 1000,
});

monitor.onThresholdExceeded(alert => {
  console.warn('Performance issue:', alert);
  // Trigger quality reduction
});

monitor.startMonitoring();
```

### Optimization3DSystem

```typescript
interface Optimization3DSystem {
  // Scene Optimization
  optimizeScene(scene: Scene): Promise<OptimizationResult>;
  enableLOD(enabled: boolean): void;
  setLODBias(bias: number): void;

  // Culling
  enableFrustumCulling(enabled: boolean): void;
  enableOcclusionCulling(enabled: boolean): void;
  setCullingThreshold(threshold: number): void;

  // Instancing
  enableInstancing(objectTypes: string[]): void;
  createInstancedMesh(geometry: Geometry, material: Material, count: number): InstancedMesh;

  // Quality Management
  setQualityLevel(level: QualityLevel): void;
  enableAdaptiveQuality(enabled: boolean): void;
  getQualityRecommendation(): QualityLevel;
}

interface OptimizationResult {
  before: OptimizationStats;
  after: OptimizationStats;
  optimizations: OptimizationAction[];
  timeSaved: number;
  memorySaved: number;
}

interface OptimizationStats {
  triangles: number;
  drawCalls: number;
  memory: number;
  textures: number;
}

// Usage Example
const optimizer = new Optimization3DSystem();

// Optimize the entire scene
const result = await optimizer.optimizeScene(scene);
console.log(`Optimized: ${result.optimizations.length} actions applied`);
console.log(`Memory saved: ${result.memorySaved / 1024 / 1024}MB`);

// Enable adaptive quality
optimizer.enableAdaptiveQuality(true);
```

---

## Event System API

### Event3DManager

```typescript
interface Event3DManager {
  // Event Registration
  on<T>(event: string, callback: (data: T) => void): Unsubscribe;
  once<T>(event: string, callback: (data: T) => void): void;
  off(event: string, callback?: Function): void;

  // Event Emission
  emit<T>(event: string, data: T): void;
  emitAsync<T>(event: string, data: T): Promise<void>;

  // Event Groups
  createGroup(groupName: string): EventGroup;
  getGroup(groupName: string): EventGroup;
  destroyGroup(groupName: string): void;
}

// Standard 3D Events
interface Scene3DEvents {
  'scene:initialized': { scene: Scene };
  'scene:destroyed': {};
  'mode:changed': { mode: '2d' | '3d' };
  'element:added': { elementId: string; element: Object3D };
  'element:removed': { elementId: string };
  'element:selected': { elementId: string };
  'element:deselected': { elementId: string };
  'element:transformed': { elementId: string; transform: Transform };
  'camera:moved': { position: Vector3; target: Vector3 };
  'view:changed': { preset: ViewPreset };
  'material:applied': { elementId: string; materialId: string };
  'export:started': { type: string; options: any };
  'export:progress': ExportProgress;
  'export:completed': { result: Blob; metadata: any };
  'performance:warning': PerformanceAlert;
  'error:occurred': { error: Error; context: string };
}

// Usage Example
const eventManager = new Event3DManager();

// Listen for element selection
eventManager.on<Scene3DEvents['element:selected']>('element:selected', data => {
  console.log('Element selected:', data.elementId);
  updateUI(data.elementId);
});

// Create event group for export operations
const exportGroup = eventManager.createGroup('export');
exportGroup.on('export:progress', progress => {
  updateProgressBar(progress.progress);
});
```

This comprehensive API specification provides a complete interface for 3D functionality while maintaining clean separation of concerns and ensuring excellent developer experience for both internal development and potential third-party integrations.
