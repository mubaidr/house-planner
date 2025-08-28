import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
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

const DEFAULT_SETTINGS: PerformanceSettings = {
  targetFPS: 60,
  autoOptimize: true,
  qualityLevel: 'high',
  enableShadows: true,
  shadowMapSize: 1024,
  antialias: true,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

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

  const [settings, setSettings] = useState<PerformanceSettings>(DEFAULT_SETTINGS);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  // Apply performance settings
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
    },
    [gl, scene]
  );

  // Performance optimization
  const optimizePerformance = useCallback(() => {
    setSettings(prev => {
      const currentQuality = prev.qualityLevel;
      let newQualityLevel = prev.qualityLevel;

      if (currentQuality === 'ultra') {
        newQualityLevel = 'high';
      } else if (currentQuality === 'high') {
        newQualityLevel = 'medium';
      } else if (currentQuality === 'medium') {
        newQualityLevel = 'low';
      }

      if (newQualityLevel !== currentQuality) {
        const updated = { ...prev, qualityLevel: newQualityLevel };
        applySettings(updated);
        return updated;
      }
      return prev;
    });
  }, [applySettings]);

  // Update performance metrics
  const updateMetrics = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    frameCountRef.current++;

    if (deltaTime >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
      const frameTime = deltaTime / frameCountRef.current;

      // Get WebGL info
      const info = gl.info;
      const memory = (performance as any).memory;

      setMetrics({
        fps,
        frameTime,
        memoryUsage: memory?.usedJSHeapSize || 0,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        programs: info.programs?.length || 0,
      });

      // Auto-optimization
      if (settings.autoOptimize && fps < settings.targetFPS * 0.8) {
        optimizePerformance();
      }

      lastTimeRef.current = now;
      frameCountRef.current = 0;
    }

    animationFrameRef.current = requestAnimationFrame(updateMetrics);
  }, [gl, settings.autoOptimize, settings.targetFPS, optimizePerformance]);

  // Start monitoring
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateMetrics);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateMetrics]);

  // Update settings
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

  return {
    metrics,
    settings,
    updateSettings,
    applySettings,
    optimizePerformance,
  };
}
