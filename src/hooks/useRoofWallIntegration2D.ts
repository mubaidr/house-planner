/**
 * React Hook for Roof-Wall Integration System
 *
 * Provides reactive roof-wall integration functionality for the 2D drawing system
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDesignStore } from '@/stores/designStore';
import {
  RoofWallIntegrationSystem2D,
  RoofWallConnection2D,
  RoofWallIntegrationConfig,
  RoofWallIntegrationResult
} from '@/utils/roofWallIntegration2D';
import { convertElementsToElement2D } from '@/utils/elementTypeConverter';
import { Wall2D, Roof2D } from '@/types/elements2D';
import { handleError, handleWarning } from '@/utils/errorHandler';
import { useHistoryStore } from '@/stores/historyStore';

export interface UseRoofWallIntegration2DOptions {
  autoUpdate?: boolean;
  config?: Partial<RoofWallIntegrationConfig>;
  enabled?: boolean;
}

export interface UseRoofWallIntegration2DReturn {
  // State
  connections: RoofWallConnection2D[];
  integrationResult: RoofWallIntegrationResult | null;
  isAnalyzing: boolean;
  error: string | null;

  // Actions
  analyzeIntegration: () => void;
  clearConnections: () => void;
  updateConfiguration: (config: Partial<RoofWallIntegrationConfig>) => void;
  getConnectionsForRoof: (roofId: string) => RoofWallConnection2D[];
  getConnectionsForWall: (wallId: string) => RoofWallConnection2D[];
  updateConnectionPitch: (connectionId: string, newPitch: number) => boolean;
  calculateOptimalPitch: (roofId: string, wallId: string, constraints?: Record<string, unknown>) => Record<string, unknown> | null;

  // Configuration
  configuration: RoofWallIntegrationConfig;

  // System
  integrationSystem: RoofWallIntegrationSystem2D;
}

export function useRoofWallIntegration2D(options: UseRoofWallIntegration2DOptions = {}): UseRoofWallIntegration2DReturn {
  const {
    autoUpdate = true,
    config = {},
    enabled = true
  } = options;

  const { walls, roofs } = useDesignStore();
  const { executeCommand } = useHistoryStore(); // Removed TODO

  // Initialize integration system
  const integrationSystem = useMemo(() => {
    return new RoofWallIntegrationSystem2D(config);
  }, [config]);

  // State
  const [connections, setConnections] = useState<RoofWallConnection2D[]>([]);
  const [integrationResult, setIntegrationResult] = useState<RoofWallIntegrationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configuration, setConfiguration] = useState<RoofWallIntegrationConfig>(
    integrationSystem.getConfiguration()
  );

  // Convert elements to 2D format
  const { walls2D, roofs2D } = useMemo(() => {
    if (!enabled || (walls.length === 0 && roofs.length === 0)) {
      return { walls2D: [], roofs2D: [] };
    }

    try {
      const elements2D = convertElementsToElement2D(walls, [], [], [], roofs, [], '');
      const walls2D = elements2D.filter(el => el.type === 'wall2d') as Wall2D[];
      const roofs2D = elements2D.filter(el => el.type === 'roof2d') as Roof2D[];
      return { walls2D, roofs2D };
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Element conversion failed'), {
        category: 'rendering',
        source: 'useRoofWallIntegration2D.convertToElement2D',
        operation: 'elementConversion'
      }, {
        userMessage: 'Failed to process roof and wall elements for integration analysis.',
        suggestions: ['Check that all elements have valid coordinates', 'Verify roof and wall data is complete']
      });
      return { walls2D: [], roofs2D: [] };
    }
  }, [walls, roofs, enabled]);

  // Analyze integration function
  const analyzeIntegration = useCallback(async () => {
    if (!enabled || (walls2D.length === 0 || roofs2D.length === 0)) {
      setConnections([]);
      setIntegrationResult(null);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Perform analysis in next tick to avoid blocking UI
      await new Promise(resolve => setTimeout(resolve, 0));

      const result = integrationSystem.analyzeRoofWallIntegration(roofs2D, walls2D);

      setIntegrationResult(result);
      setConnections(result.connections);

      // Log warnings if any
      if (result.warnings.length > 0) {
        handleWarning('Roof-wall integration warnings detected', {
          category: 'integration',
          source: 'useRoofWallIntegration2D.analyzeIntegration',
          operation: 'integration'
        }, {
          userMessage: `Found ${result.warnings.length} integration issues that need attention.`,
          suggestions: ['Review roof and wall placement', 'Check for overlapping elements', 'Verify roof pitch settings']
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during roof-wall analysis';
      setError(errorMessage);
      handleError(err instanceof Error ? err : new Error('Roof-wall integration failed'), {
        category: 'integration',
        source: 'useRoofWallIntegration2D.analyzeIntegration',
        operation: 'integration'
      }, {
        userMessage: 'Failed to analyze roof-wall integration. The analysis could not be completed.',
        suggestions: ['Check roof and wall geometry', 'Verify all elements are properly placed', 'Try refreshing the analysis']
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [walls2D, roofs2D, enabled, integrationSystem]);

  // Clear connections
  const clearConnections = useCallback(() => {
    integrationSystem.clear();
    setConnections([]);
    setIntegrationResult(null);
    setError(null);
  }, [integrationSystem]);

  // Update configuration
  const updateConfiguration = useCallback((newConfig: Partial<RoofWallIntegrationConfig>) => {
    try {
      integrationSystem.updateConfiguration(newConfig);
      const updatedConfig = integrationSystem.getConfiguration();
      setConfiguration(updatedConfig);

      // Re-analyze if auto-update is enabled
      if (autoUpdate && enabled) {
        analyzeIntegration();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update configuration';
      setError(errorMessage);
    }
  }, [integrationSystem, autoUpdate, enabled, analyzeIntegration]);

  // Get connections for specific roof
  const getConnectionsForRoof = useCallback((roofId: string): RoofWallConnection2D[] => {
    return integrationSystem.getConnectionsForRoof(roofId);
  }, [integrationSystem]);

  // Get connections for specific wall
  const getConnectionsForWall = useCallback((wallId: string): RoofWallConnection2D[] => {
    return integrationSystem.getConnectionsForWall(wallId);
  }, [integrationSystem]);

  // Update connection pitch
  const updateConnectionPitch = useCallback((connectionId: string, newPitch: number): boolean => {
    const result = integrationSystem.updateConnectionPitch(connectionId, newPitch);
    if (result) {
      // Refresh connections after update
      const updatedConnections = integrationSystem.getConnections();
      setConnections(updatedConnections);
    }
    return result;
  }, [integrationSystem]);

  // Calculate optimal pitch
  const calculateOptimalPitch = useCallback((roofId: string, wallId: string, constraints?: Record<string, unknown>) => {
    const roof = roofs2D.find(r => r.id === roofId);
    const wall = walls2D.find(w => w.id === wallId);

    if (!roof || !wall) {
      handleWarning('Roof or wall element not found for pitch calculation', {
        category: 'calculation',
        source: 'useRoofWallIntegration2D.calculateOptimalPitch',
        operation: 'pitchCalculation'
      }, {
        userMessage: 'Cannot calculate optimal pitch: roof or wall element not found.',
        suggestions: ['Verify the roof and wall elements exist', 'Check element IDs are correct']
      });
      return null;
    }

    return integrationSystem.calculateOptimalPitch(roof, wall, constraints);
  }, [integrationSystem, roofs2D, walls2D]);

  // Auto-update when elements change
  useEffect(() => {
    if (autoUpdate && enabled && walls2D.length > 0 && roofs2D.length > 0) {
      // Debounce analysis to avoid excessive calculations
      const timeoutId = setTimeout(() => {
        analyzeIntegration();
      }, 150); // Slightly longer debounce for more complex analysis

      return () => clearTimeout(timeoutId);
    }
  }, [walls2D, roofs2D, autoUpdate, enabled, analyzeIntegration]);

  // Initial analysis
  useEffect(() => {
    if (enabled && walls2D.length > 0 && roofs2D.length > 0) {
      analyzeIntegration();
    }
  }, [enabled, analyzeIntegration, roofs2D.length, walls2D.length]); // Only run when enabled changes

  return {
    // State
    connections,
    integrationResult,
    isAnalyzing,
    error,

    // Actions
    analyzeIntegration,
    clearConnections,
    updateConfiguration,
    getConnectionsForRoof,
    getConnectionsForWall,
    updateConnectionPitch,
    calculateOptimalPitch,

    // Configuration
    configuration,

    // System
    integrationSystem
  };
}

/**
 * Hook for roof-wall integration configuration management
 */
export function useRoofWallIntegrationConfiguration() {
  const [config, setConfig] = useState<RoofWallIntegrationConfig>(() => {
    const defaultSystem = new RoofWallIntegrationSystem2D();
    return defaultSystem.getConfiguration();
  });

  const updateConfig = useCallback((updates: Partial<RoofWallIntegrationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    const defaultSystem = new RoofWallIntegrationSystem2D();
    setConfig(defaultSystem.getConfiguration());
  }, []);

  return {
    config,
    updateConfig,
    resetConfig
  };
}

export default useRoofWallIntegration2D;
