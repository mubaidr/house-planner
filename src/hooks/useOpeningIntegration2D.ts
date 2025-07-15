/**
 * Hook for Opening Integration System
 * 
 * Provides React integration for the opening integration system,
 * handling door and window placement validation and geometry calculation.
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  OpeningIntegrator2D, 
  Opening2D, 
  OpeningIntegrationConfig,
  UseOpeningIntegrationOptions,
  UseOpeningIntegrationReturn,
  ValidationResult2D,
  OpeningGeometry2D
} from '@/utils/openingIntegration2D';
import { Wall2D, Point2D } from '@/types/elements2D';

export function useOpeningIntegration2D(
  options: UseOpeningIntegrationOptions = {}
): UseOpeningIntegrationReturn {
  const {
    enabled = true,
    config: initialConfig = {}
  } = options;

  const [config, setConfig] = useState<OpeningIntegrationConfig>({
    minWallLength: 0.8,
    minDistanceFromCorner: 0.1,
    maxOpeningRatio: 0.8,
    snapTolerance: 0.05,
    autoAlign: true,
    showConstraints: true,
    ...initialConfig
  });

  // Validate opening placement
  const validatePlacement = useCallback((opening: Opening2D, wall: Wall2D): ValidationResult2D => {
    if (!enabled) {
      return { isValid: true, errors: [], warnings: [] };
    }
    
    return OpeningIntegrator2D.validateOpeningPlacement(opening, wall, config);
  }, [enabled, config]);

  // Calculate opening geometry
  const calculateGeometry = useCallback((opening: Opening2D, wall: Wall2D): OpeningGeometry2D => {
    return OpeningIntegrator2D.calculateOpeningGeometry(opening, wall);
  }, []);

  // Snap opening to wall constraints
  const snapToWall = useCallback((opening: Opening2D, wall: Wall2D): Opening2D => {
    if (!enabled || !config.autoAlign) {
      return opening;
    }
    
    return OpeningIntegrator2D.snapOpeningToWall(opening, wall, config);
  }, [enabled, config]);

  // Get constraint indicators for wall
  const getConstraints = useCallback((wall: Wall2D): Array<{ type: string, position: Point2D, size: number }> => {
    if (!enabled || !config.showConstraints) {
      return [];
    }
    
    return OpeningIntegrator2D.getConstraintIndicators(wall, config);
  }, [enabled, config]);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<OpeningIntegrationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Memoized return object
  const returnValue = useMemo(() => ({
    validatePlacement,
    calculateGeometry,
    snapToWall,
    getConstraints,
    config,
    updateConfig
  }), [validatePlacement, calculateGeometry, snapToWall, getConstraints, config, updateConfig]);

  return returnValue;
}

export default useOpeningIntegration2D;