import { useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
}

export interface PerformanceSettings {
  targetFPS: number;
  autoOptimize: boolean;
  qualityLevel: 'low' | 'medium' | 'high' | 'ultra';
  enableShadows: boolean;
  shadowMapSize: number;
  antialias: boolean;
  pixelRatio: number;
}

export function usePerformanceMonitor() {
  const { gl, scene } = useThree();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
  });

  const [settings, setSettings] = useState<PerformanceSettings>({
    targetFPS: 60,
    autoOptimize: true,
    qualityLevel: 'high',
    enableShadows: true,
    shadowMapSize: 2048,
    antialias: true,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  });

  const frameTimeRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | null>(null);

  // Performance monitoring loop
  useEffect(() => {
    const updateMetrics = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Calculate FPS from frame times
      frameTimeRef.current.push(frameTime);
      if (frameTimeRef.current.length > 60) {
        frameTimeRef.current.shift();
      }

      const avgFrameTime =
        frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length;
      const fps = 1000 / avgFrameTime;

      // Get renderer info
      const info = gl.info;
      const memory = (gl as any).info?.memory || {};

      setMetrics({
        fps: Math.round(fps),
        frameTime: Math.round(avgFrameTime * 100) / 100,
        memoryUsage: memory.geometries || 0,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        geometries: memory.geometries || 0,
        textures: memory.textures || 0,
        programs: info.programs?.length || 0,
      });

      // Auto-optimization
      if (settings.autoOptimize && fps < settings.targetFPS * 0.8) {
        optimizePerformance();
      }

      animationFrameRef.current = requestAnimationFrame(updateMetrics);
    };

    animationFrameRef.current = requestAnimationFrame(updateMetrics);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gl, settings.autoOptimize, settings.targetFPS, optimizePerformance]);

  const optimizePerformance = useCallback(() => {
    const currentQuality = settings.qualityLevel;

    if (currentQuality === 'ultra') {
      updateSettings({ qualityLevel: 'high' });
    } else if (currentQuality === 'high') {
      updateSettings({ qualityLevel: 'medium' });
    } else if (currentQuality === 'medium') {
      updateSettings({ qualityLevel: 'low' });
    }
  }, [settings.qualityLevel, updateSettings]);

  const updateSettings = useCallback(
    (newSettings: Partial<PerformanceSettings>) => {
      setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        applySettings(updated);
        return updated;
      });
    },
    [applySettings]
  );

  const applySettings = useCallback(
    (settings: PerformanceSettings) => {
      // Apply pixel ratio
      gl.setPixelRatio(settings.pixelRatio);

      // Apply shadow settings
      gl.shadowMap.enabled = settings.enableShadows;
      if (settings.enableShadows) {
        // Update shadow map size for all lights in the scene
        scene.traverse((object: any) => {
          if (object instanceof THREE.Light && object.castShadow) {
            object.shadow.mapSize.width = settings.shadowMapSize;
            object.shadow.mapSize.height = settings.shadowMapSize;
          }
        });
      }

      // Apply quality-based settings
      switch (settings.qualityLevel) {
        case 'low':
          gl.setPixelRatio(Math.min(settings.pixelRatio, 1));
          scene.traverse((object: any) => {
            if (object instanceof THREE.Light && object.castShadow) {
              object.shadow.mapSize.setScalar(512);
            }
          });
          break;
        case 'medium':
          gl.setPixelRatio(Math.min(settings.pixelRatio, 1.5));
          scene.traverse((object: any) => {
            if (object instanceof THREE.Light && object.castShadow) {
              object.shadow.mapSize.setScalar(1024);
            }
          });
          break;
        case 'high':
          gl.setPixelRatio(Math.min(settings.pixelRatio, 2));
          scene.traverse((object: any) => {
            if (object instanceof THREE.Light && object.castShadow) {
              object.shadow.mapSize.setScalar(2048);
            }
          });
          break;
        case 'ultra':
          gl.setPixelRatio(settings.pixelRatio);
          scene.traverse((object: any) => {
            if (object instanceof THREE.Light && object.castShadow) {
              object.shadow.mapSize.setScalar(4096);
            }
          });
          break;
      }

      // Update scene objects with quality settings
      scene.traverse((object: any) => {
        if (object.material) {
          // Adjust material quality based on settings
          if (settings.qualityLevel === 'low') {
            object.material.transparent = false;
            object.material.alphaTest = 0;
          } else {
            object.material.transparent = true;
            object.material.alphaTest = 0.1;
          }
        }
      });
    },
    [gl, scene]
  );

  const getPerformanceRecommendations = (): string[] => {
    const recommendations: string[] = [];

    if (metrics.fps < 30) {
      recommendations.push('Consider reducing quality level for better performance');
      recommendations.push('Disable shadows or reduce shadow map size');
      recommendations.push('Lower pixel ratio on high-DPI displays');
    }

    if (metrics.drawCalls > 1000) {
      recommendations.push('Too many draw calls - consider merging geometries');
    }

    if (metrics.triangles > 500000) {
      recommendations.push('High triangle count - consider using LOD (Level of Detail)');
    }

    if (metrics.textures > 100) {
      recommendations.push('Many textures loaded - consider texture atlasing');
    }

    return recommendations;
  };

  const exportOptimizedSettings = (): PerformanceSettings => {
    // Return optimized settings for export operations
    return {
      ...settings,
      qualityLevel: 'ultra',
      enableShadows: true,
      shadowMapSize: 4096,
      antialias: true,
      pixelRatio: 2,
      autoOptimize: false,
    };
  };

  const restoreSettings = (originalSettings: PerformanceSettings) => {
    updateSettings(originalSettings);
  };

  return {
    metrics,
    settings,
    updateSettings,
    getPerformanceRecommendations,
    exportOptimizedSettings,
    restoreSettings,
    optimizePerformance,
  };
}
