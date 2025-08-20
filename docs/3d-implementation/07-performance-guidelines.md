# Performance Guidelines

> **Comprehensive performance optimization strategies and monitoring guidelines for 3D House Planner implementation**

---

## 🚨 Performance Foundation Update

**As of August 2025, all performance optimizations and monitoring will be layered on and extend [CodeHole7/threejs-3d-room-designer](https://github.com/CodeHole7/threejs-3d-room-designer), a React-bundled Three.js room planner and product configurator.**

### Performance Adaptation:

- All optimization strategies below are to be interpreted as customizations, extensions, or integrations with the base project.
- Custom features (multi-floor, advanced export, material system, accessibility, etc.) will be layered on top using the extensibility points provided by the base project.
- Maintain compatibility and leverage the base's React/Three.js architecture for all new features.

---

## 📊 Performance Overview

This document provides detailed performance guidelines, optimization strategies, and monitoring approaches to ensure the 3D House Planner delivers exceptional user experience across all target devices and browsers.

**Performance Philosophy**: Deliver professional 3D capabilities without compromising the speed and responsiveness that users expect from the current 2D application.

---

## 🎯 Performance Targets

### Frame Rate Targets

| Device Category          | Target FPS | Minimum FPS | Quality Setting |
| ------------------------ | ---------- | ----------- | --------------- |
| Desktop (Dedicated GPU)  | 60         | 45          | High            |
| Desktop (Integrated GPU) | 45         | 30          | Medium          |
| High-end Tablets         | 30         | 24          | Medium          |
| Standard Tablets         | 24         | 20          | Low             |

### Load Time Targets

| Operation           | Target Time | Maximum Time | User Experience     |
| ------------------- | ----------- | ------------ | ------------------- |
| 3D Mode Activation  | 1.5s        | 3s           | Instant feeling     |
| View Preset Switch  | 0.5s        | 1s           | Smooth transition   |
| Export High-Quality | 15s         | 30s          | Progress indicator  |
| Asset Loading       | 2s          | 5s           | Progressive loading |

### Memory Usage Targets

| Scene Complexity | Target Memory | Maximum Memory | Optimization Trigger    |
| ---------------- | ------------- | -------------- | ----------------------- |
| Simple House     | 200MB         | 300MB          | None                    |
| Medium House     | 400MB         | 600MB          | Texture compression     |
| Complex House    | 600MB         | 800MB          | LOD activation          |
| Large Complex    | 800MB         | 1GB            | Aggressive optimization |

---

## 🔧 Optimization Strategies

## Geometry Optimization

### Level of Detail (LOD) System

```typescript
// src/utils/3d/lodSystem.ts
export class LODSystem {
  private lodLevels = new Map<string, LODLevel[]>();

  registerElement(elementId: string, lodLevels: LODLevel[]) {
    this.lodLevels.set(elementId, lodLevels);
  }

  updateLOD(camera: Camera, elements: Element3D[]) {
    elements.forEach(element => {
      const distance = camera.position.distanceTo(element.position);
      const lodLevel = this.calculateLODLevel(distance);

      if (element.currentLOD !== lodLevel) {
        this.switchGeometry(element, lodLevel);
        element.currentLOD = lodLevel;
      }
    });
  }

  private calculateLODLevel(distance: number): number {
    if (distance < 10) return 0; // High detail
    if (distance < 25) return 1; // Medium detail
    if (distance < 50) return 2; // Low detail
    return 3; // Very low detail
  }

  private switchGeometry(element: Element3D, lodLevel: number) {
    const lodLevels = this.lodLevels.get(element.id);
    if (!lodLevels) return;

    const geometry = lodLevels[lodLevel]?.geometry;
    if (geometry && element.mesh) {
      element.mesh.geometry = geometry;
    }
  }
}
```

### Geometry Instancing

```typescript
// src/utils/3d/instanceRenderer.ts
export class InstanceRenderer {
  private instancedMeshes = new Map<string, InstancedMesh>();

  createInstancedWalls(walls: Wall[]): InstancedMesh {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({ color: 0xcccccc });

    const instancedMesh = new InstancedMesh(geometry, material, walls.length);

    walls.forEach((wall, index) => {
      const matrix = new Matrix4();
      const position = this.calculateWallPosition(wall);
      const rotation = this.calculateWallRotation(wall);
      const scale = this.calculateWallScale(wall);

      matrix.compose(position, rotation, scale);
      instancedMesh.setMatrixAt(index, matrix);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  }

  updateInstance(instancedMesh: InstancedMesh, index: number, transform: Transform) {
    const matrix = new Matrix4();
    matrix.compose(transform.position, transform.rotation, transform.scale);
    instancedMesh.setMatrixAt(index, matrix);
    instancedMesh.instanceMatrix.needsUpdate = true;
  }
}
```

---

## Texture Optimization

### Texture Atlas System

```typescript
// src/utils/3d/textureAtlas.ts
export class TextureAtlasSystem {
  private atlas: Texture | null = null;
  private atlasMapping = new Map<string, AtlasRegion>();

  async createAtlas(materialConfigs: MaterialConfig[]): Promise<void> {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    let x = 0,
      y = 0,
      rowHeight = 0;

    for (const config of materialConfigs) {
      const image = await this.loadImage(config.diffuseMap);

      if (x + image.width > canvas.width) {
        x = 0;
        y += rowHeight;
        rowHeight = 0;
      }

      ctx.drawImage(image, x, y);

      this.atlasMapping.set(config.id, {
        x: x / canvas.width,
        y: y / canvas.height,
        width: image.width / canvas.width,
        height: image.height / canvas.height,
      });

      x += image.width;
      rowHeight = Math.max(rowHeight, image.height);
    }

    this.atlas = new CanvasTexture(canvas);
    this.atlas.flipY = false;
  }

  getMaterialUVMapping(materialId: string): Vector4 | null {
    const region = this.atlasMapping.get(materialId);
    if (!region) return null;

    return new Vector4(region.x, region.y, region.width, region.height);
  }
}
```

### Texture Compression

```typescript
// src/utils/3d/textureCompression.ts
export class TextureCompressionSystem {
  private compressedTextures = new Map<string, CompressedTexture>();

  async compressTexture(
    originalTexture: Texture,
    format: 'DXT1' | 'DXT5' | 'ETC1' | 'ASTC'
  ): Promise<CompressedTexture> {
    const compressedData = await this.compressTextureData(originalTexture.image, format);

    const compressedTexture = new CompressedTexture(
      compressedData.mipmaps,
      compressedData.width,
      compressedData.height,
      compressedData.format
    );

    return compressedTexture;
  }

  private async compressTextureData(
    image: HTMLImageElement,
    format: string
  ): Promise<CompressedTextureData> {
    // Use web workers for compression to avoid blocking main thread
    return new Promise(resolve => {
      const worker = new Worker('/workers/textureCompression.worker.js');

      worker.postMessage({
        imageData: this.getImageData(image),
        format: format,
      });

      worker.onmessage = event => {
        resolve(event.data);
        worker.terminate();
      };
    });
  }
}
```

---

## Rendering Optimization

### Frustum Culling

```typescript
// src/utils/3d/cullingSystem.ts
export class CullingSystem {
  private frustum = new Frustum();
  private cameraMatrix = new Matrix4();

  updateFrustum(camera: Camera) {
    this.cameraMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.cameraMatrix);
  }

  cullObjects(objects: Object3D[]): Object3D[] {
    return objects.filter(object => {
      const boundingBox = this.getBoundingBox(object);
      return this.frustum.intersectsBox(boundingBox);
    });
  }

  private getBoundingBox(object: Object3D): Box3 {
    const box = new Box3();

    if (object.geometry) {
      if (!object.geometry.boundingBox) {
        object.geometry.computeBoundingBox();
      }
      box.copy(object.geometry.boundingBox!);
      box.applyMatrix4(object.matrixWorld);
    }

    return box;
  }
}
```

### Occlusion Culling

```typescript
// src/utils/3d/occlusionCulling.ts
export class OcclusionCullingSystem {
  private occlusionQueries = new Map<string, WebGLQuery>();
  private gl: WebGL2RenderingContext;

  constructor(renderer: WebGLRenderer) {
    this.gl = renderer.getContext() as WebGL2RenderingContext;
  }

  createOcclusionQuery(objectId: string): WebGLQuery {
    const query = this.gl.createQuery()!;
    this.occlusionQueries.set(objectId, query);
    return query;
  }

  testOcclusion(object: Object3D): boolean {
    const query = this.occlusionQueries.get(object.uuid);
    if (!query) return true;

    this.gl.beginQuery(this.gl.ANY_SAMPLES_PASSED, query);

    // Render bounding box with simple shader
    this.renderBoundingBox(object);

    this.gl.endQuery(this.gl.ANY_SAMPLES_PASSED);

    // Check result (may be delayed by GPU)
    const available = this.gl.getQueryParameter(query, this.gl.QUERY_RESULT_AVAILABLE);

    if (available) {
      const result = this.gl.getQueryParameter(query, this.gl.QUERY_RESULT);
      return result > 0;
    }

    return true; // Default to visible if result not ready
  }
}
```

---

## Memory Management

### Geometry Disposal

```typescript
// src/utils/3d/memoryManager.ts
export class MemoryManager {
  private disposalQueue: Disposable[] = [];
  private memoryThreshold = 500 * 1024 * 1024; // 500MB

  scheduleDisposal(disposable: Disposable) {
    this.disposalQueue.push(disposable);
  }

  checkMemoryUsage(): MemoryInfo {
    const info = (performance as any).memory;

    return {
      used: info?.usedJSHeapSize || 0,
      total: info?.totalJSHeapSize || 0,
      limit: info?.jsHeapSizeLimit || 0,
    };
  }

  cleanupIfNeeded() {
    const memoryInfo = this.checkMemoryUsage();

    if (memoryInfo.used > this.memoryThreshold) {
      this.forceCleanup();
    }
  }

  private forceCleanup() {
    // Dispose queued objects
    this.disposalQueue.forEach(disposable => {
      if (disposable.dispose) {
        disposable.dispose();
      }
    });
    this.disposalQueue = [];

    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }

    console.log('Memory cleanup completed');
  }

  disposeGeometry(geometry: BufferGeometry) {
    geometry.dispose();

    // Clear attributes
    Object.keys(geometry.attributes).forEach(key => {
      const attribute = geometry.attributes[key];
      if (attribute.array) {
        delete attribute.array;
      }
    });
  }

  disposeMaterial(material: Material) {
    if (material instanceof MeshStandardMaterial) {
      // Dispose textures
      if (material.map) material.map.dispose();
      if (material.normalMap) material.normalMap.dispose();
      if (material.roughnessMap) material.roughnessMap.dispose();
      if (material.metalnessMap) material.metalnessMap.dispose();
    }

    material.dispose();
  }
}
```

### Object Pooling

```typescript
// src/utils/3d/objectPool.ts
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void) {
    this.createFn = createFn;
    this.resetFn = resetFn;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!;
      this.resetFn(obj);
      return obj;
    }

    return this.createFn();
  }

  release(obj: T) {
    this.pool.push(obj);
  }

  preWarm(count: number) {
    for (let i = 0; i < count; i++) {
      this.pool.push(this.createFn());
    }
  }
}

// Usage example
const meshPool = new ObjectPool<Mesh>(
  () => new Mesh(),
  mesh => {
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
    mesh.visible = true;
  }
);
```

---

## Performance Monitoring

### Real-Time Performance Monitor

```typescript
// src/utils/3d/performanceMonitor.ts
export class PerformanceMonitor {
  private stats: Stats;
  private memoryPanel: Stats.Panel;
  private frameTimeHistory: number[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.stats = new Stats();
    this.stats.showPanel(0); // FPS panel

    // Add custom memory panel
    this.memoryPanel = this.stats.addPanel(new Stats.Panel('MB', '#ff8', '#221'));

    document.body.appendChild(this.stats.dom);
  }

  startFrame() {
    this.stats.begin();
  }

  endFrame() {
    this.stats.end();

    const frameTime = performance.now() - this.stats.begin.time;
    this.frameTimeHistory.push(frameTime);

    if (this.frameTimeHistory.length > this.maxHistorySize) {
      this.frameTimeHistory.shift();
    }

    this.updateMemoryPanel();
  }

  private updateMemoryPanel() {
    const memInfo = (performance as any).memory;
    if (memInfo) {
      const memMB = memInfo.usedJSHeapSize / 1048576;
      this.memoryPanel.update(memMB, 200);
    }
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const avgFrameTime =
      this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;

    return {
      fps: Math.round(1000 / avgFrameTime),
      frameTime: avgFrameTime,
      memory: this.getMemoryUsage(),
      triangles: this.getTriangleCount(),
    };
  }

  private getMemoryUsage(): number {
    const memInfo = (performance as any).memory;
    return memInfo ? memInfo.usedJSHeapSize : 0;
  }

  private getTriangleCount(): number {
    // Get from renderer info
    return (window as any).rendererInfo?.triangles || 0;
  }
}
```

### Performance Alerts

```typescript
// src/utils/3d/performanceAlerts.ts
export class PerformanceAlertSystem {
  private thresholds: PerformanceThresholds;
  private alertCallbacks: Map<string, (alert: PerformanceAlert) => void>;

  constructor(thresholds: PerformanceThresholds) {
    this.thresholds = thresholds;
    this.alertCallbacks = new Map();
  }

  checkPerformance(metrics: PerformanceMetrics) {
    // Check FPS
    if (metrics.fps < this.thresholds.minFPS) {
      this.triggerAlert({
        type: 'low-fps',
        severity: 'warning',
        message: `FPS dropped to ${metrics.fps}`,
        suggestions: ['Reduce quality settings', 'Enable LOD system', 'Reduce scene complexity'],
      });
    }

    // Check memory usage
    const memoryMB = metrics.memory / 1048576;
    if (memoryMB > this.thresholds.maxMemoryMB) {
      this.triggerAlert({
        type: 'high-memory',
        severity: 'error',
        message: `Memory usage: ${memoryMB.toFixed(0)}MB`,
        suggestions: [
          'Dispose unused textures',
          'Reduce texture resolution',
          'Enable texture compression',
        ],
      });
    }
  }

  private triggerAlert(alert: PerformanceAlert) {
    const callback = this.alertCallbacks.get(alert.type);
    if (callback) {
      callback(alert);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Performance Alert:', alert);
    }
  }

  onAlert(type: string, callback: (alert: PerformanceAlert) => void) {
    this.alertCallbacks.set(type, callback);
  }
}
```

---

## Adaptive Quality System

### Dynamic Quality Adjustment

```typescript
// src/utils/3d/adaptiveQuality.ts
export class AdaptiveQualitySystem {
  private currentQuality: QualityLevel = 'medium';
  private performanceHistory: PerformanceMetrics[] = [];
  private adjustmentCooldown = 5000; // 5 seconds
  private lastAdjustment = 0;

  updateQuality(metrics: PerformanceMetrics) {
    this.performanceHistory.push(metrics);

    if (this.performanceHistory.length > 30) {
      this.performanceHistory.shift();
    }

    const now = Date.now();
    if (now - this.lastAdjustment < this.adjustmentCooldown) {
      return;
    }

    const avgFPS = this.getAverageFPS();
    const newQuality = this.determineOptimalQuality(avgFPS);

    if (newQuality !== this.currentQuality) {
      this.applyQualitySettings(newQuality);
      this.currentQuality = newQuality;
      this.lastAdjustment = now;
    }
  }

  private getAverageFPS(): number {
    const recentMetrics = this.performanceHistory.slice(-10);
    return recentMetrics.reduce((sum, metrics) => sum + metrics.fps, 0) / recentMetrics.length;
  }

  private determineOptimalQuality(avgFPS: number): QualityLevel {
    if (avgFPS >= 55) {
      return 'high';
    } else if (avgFPS >= 35) {
      return 'medium';
    } else if (avgFPS >= 25) {
      return 'low';
    } else {
      return 'minimum';
    }
  }

  private applyQualitySettings(quality: QualityLevel) {
    const settings = this.getQualitySettings(quality);

    // Apply to renderer
    (window as any).renderer.setPixelRatio(settings.pixelRatio);
    (window as any).renderer.shadowMap.enabled = settings.shadows;

    // Apply to materials
    this.updateMaterialQuality(settings);

    // Apply to geometry
    this.updateGeometryQuality(settings);

    console.log(`Quality adjusted to: ${quality}`);
  }

  private getQualitySettings(quality: QualityLevel): QualitySettings {
    const settings: Record<QualityLevel, QualitySettings> = {
      minimum: {
        pixelRatio: 0.5,
        shadows: false,
        antialiasing: false,
        textureQuality: 256,
        lodBias: 2,
      },
      low: {
        pixelRatio: 0.75,
        shadows: false,
        antialiasing: false,
        textureQuality: 512,
        lodBias: 1,
      },
      medium: {
        pixelRatio: 1.0,
        shadows: true,
        antialiasing: false,
        textureQuality: 1024,
        lodBias: 0,
      },
      high: {
        pixelRatio: window.devicePixelRatio,
        shadows: true,
        antialiasing: true,
        textureQuality: 2048,
        lodBias: -1,
      },
    };

    return settings[quality];
  }
}
```

---

## Performance Best Practices

### Development Guidelines

1. **Always Profile First**
   - Use browser dev tools performance tab
   - Monitor memory allocation patterns
   - Identify bottlenecks before optimizing

2. **Batch Operations**
   - Group similar render calls
   - Update matrix transformations in batches
   - Minimize state changes

3. **Asset Optimization**
   - Use compressed textures when possible
   - Optimize geometry complexity
   - Implement proper LOD systems

4. **Memory Management**
   - Dispose geometries and materials properly
   - Use object pooling for frequently created objects
   - Monitor memory usage continuously

### Production Monitoring

```typescript
// src/utils/3d/productionMonitoring.ts
export class ProductionMonitor {
  private metrics: MetricsCollector;

  constructor() {
    this.metrics = new MetricsCollector();
    this.setupPerformanceObserver();
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();

        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            this.metrics.recordTiming(entry.name, entry.duration);
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
    }
  }

  reportCriticalIssue(issue: CriticalIssue) {
    // Send to monitoring service
    this.sendToMonitoring({
      type: 'critical',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      issue: issue,
      metrics: this.metrics.getCurrentMetrics(),
    });
  }
}
```

This comprehensive performance guide ensures that the 3D House Planner will deliver excellent performance across all target devices while maintaining the responsiveness users expect from the current 2D application.
