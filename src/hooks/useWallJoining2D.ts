/**
 * React Hook for Wall Joining System
 * 
 * Provides reactive wall joining functionality for the 2D drawing system
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { WallJoiningSystem2D, WallJoint2D, WallJoinConfiguration, WallJoinResult } from '@/utils/wallJoining2D';
import { convertElementsToElement2D } from '@/utils/elementTypeConverter';
import { Wall2D } from '@/types/elements2D';

export interface UseWallJoining2DOptions {
  autoUpdate?: boolean;
  config?: Partial<WallJoinConfiguration>;
  enabled?: boolean;
}

export interface UseWallJoining2DReturn {
  // State
  joints: WallJoint2D[];
  joinResult: WallJoinResult | null;
  isAnalyzing: boolean;
  error: string | null;
  
  // Actions
  analyzeWalls: () => void;
  clearJoints: () => void;
  updateConfiguration: (config: Partial<WallJoinConfiguration>) => void;
  getJointsForWall: (wallId: string) => WallJoint2D[];
  
  // Configuration
  configuration: WallJoinConfiguration;
  
  // System
  joiningSystem: WallJoiningSystem2D;
}

export function useWallJoining2D(options: UseWallJoining2DOptions = {}): UseWallJoining2DReturn {
  const {
    autoUpdate = true,
    config = {},
    enabled = true
  } = options;

  const { walls } = useDesignStore();
  // const { executeCommand } = useHistoryStore(); // TODO: Implement history integration

  // Initialize joining system
  const joiningSystem = useMemo(() => {
    return new WallJoiningSystem2D(config);
  }, []);

  // State
  const [joints, setJoints] = useState<WallJoint2D[]>([]);
  const [joinResult, setJoinResult] = useState<WallJoinResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configuration, setConfiguration] = useState<WallJoinConfiguration>(
    joiningSystem.getConfiguration()
  );

  // Convert walls to Wall2D format
  const walls2D = useMemo(() => {
    if (!enabled || walls.length === 0) return [];
    
    try {
      const elements2D = convertElementsToElement2D(walls, [], [], [], [], [], '');
      return elements2D.filter(el => el.type === 'wall2d') as Wall2D[];
    } catch (err) {
      console.error('Error converting walls to 2D:', err);
      return [];
    }
  }, [walls, enabled]);

  // Analyze walls function
  const analyzeWalls = useCallback(async () => {
    if (!enabled || walls2D.length === 0) {
      setJoints([]);
      setJoinResult(null);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Perform analysis in next tick to avoid blocking UI
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const result = joiningSystem.analyzeWalls(walls2D);
      
      setJoinResult(result);
      setJoints(result.joints);
      
      // Log warnings if any
      if (result.warnings.length > 0) {
        console.warn('Wall joining warnings:', result.warnings);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during wall analysis';
      setError(errorMessage);
      console.error('Wall joining analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [walls2D, enabled, joiningSystem]);

  // Clear joints
  const clearJoints = useCallback(() => {
    joiningSystem.clear();
    setJoints([]);
    setJoinResult(null);
    setError(null);
  }, [joiningSystem]);

  // Update configuration
  const updateConfiguration = useCallback((newConfig: Partial<WallJoinConfiguration>) => {
    try {
      joiningSystem.updateConfiguration(newConfig);
      const updatedConfig = joiningSystem.getConfiguration();
      setConfiguration(updatedConfig);
      
      // Re-analyze if auto-update is enabled
      if (autoUpdate && enabled) {
        analyzeWalls();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update configuration';
      setError(errorMessage);
    }
  }, [joiningSystem, autoUpdate, enabled, analyzeWalls]);

  // Get joints for specific wall
  const getJointsForWall = useCallback((wallId: string): WallJoint2D[] => {
    return joiningSystem.getJointsForWall(wallId);
  }, [joiningSystem]);

  // Auto-update when walls change
  useEffect(() => {
    if (autoUpdate && enabled && walls2D.length > 0) {
      // Debounce analysis to avoid excessive calculations
      const timeoutId = setTimeout(() => {
        analyzeWalls();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [walls2D, autoUpdate, enabled, analyzeWalls]);

  // Initial analysis
  useEffect(() => {
    if (enabled && walls2D.length > 0) {
      analyzeWalls();
    }
  }, [enabled]); // Only run when enabled changes

  return {
    // State
    joints,
    joinResult,
    isAnalyzing,
    error,
    
    // Actions
    analyzeWalls,
    clearJoints,
    updateConfiguration,
    getJointsForWall,
    
    // Configuration
    configuration,
    
    // System
    joiningSystem
  };
}

/**
 * Hook for wall joining configuration management
 */
export function useWallJoinConfiguration() {
  const [config, setConfig] = useState<WallJoinConfiguration>(() => 
    WallJoiningSystem2D.prototype.constructor.length > 0 
      ? new WallJoiningSystem2D().getConfiguration()
      : {
          tolerance: 0.1,
          angleThreshold: 5,
          autoJoin: true,
          showJoinIndicators: true,
          joinStyle: {
            cornerRadius: 0.05,
            mitreLimit: 4,
            lineCapStyle: 'round' as const,
            lineJoinStyle: 'miter' as const
          }
        }
  );

  const updateConfig = useCallback((updates: Partial<WallJoinConfiguration>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    const defaultSystem = new WallJoiningSystem2D();
    setConfig(defaultSystem.getConfiguration());
  }, []);

  return {
    config,
    updateConfig,
    resetConfig
  };
}

export default useWallJoining2D;