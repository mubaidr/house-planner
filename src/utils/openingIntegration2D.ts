/**
 * Opening Integration System for 2D Views
 * 
 * This system handles the integration of doors and windows (openings) with walls
 * in all 2D views (plan, front, back, left, right). It provides validation,
 * geometry calculation, and rendering utilities for openings.
 */

import { Door2D, Window2D, Wall2D, Point2D, Dimensions2D } from '@/types/elements2D';

// Opening types
export type Opening2D = Door2D | Window2D;

export interface OpeningGeometry2D {
  position: Point2D;
  dimensions: Dimensions2D;
  wallPosition: number; // Position along wall (0-1)
  depth: number;
  angle: number;
  isValid: boolean;
}

export interface ValidationResult2D {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DimensionSet2D {
  width: number;
  height: number;
  depth: number;
  wallOffset: number;
  floorOffset: number;
}

export interface OpeningIntegrationConfig {
  minWallLength: number;
  minDistanceFromCorner: number;
  maxOpeningRatio: number; // Max opening width/wall length ratio
  snapTolerance: number;
  autoAlign: boolean;
  showConstraints: boolean;
}

/**
 * Opening Integration System
 * Handles placement, validation, and rendering of doors/windows in walls
 */
export class OpeningIntegrator2D {
  private static defaultConfig: OpeningIntegrationConfig = {
    minWallLength: 0.8, // Minimum wall length to place opening
    minDistanceFromCorner: 0.1, // Minimum distance from wall corners
    maxOpeningRatio: 0.8, // Maximum opening width as ratio of wall length
    snapTolerance: 0.05,
    autoAlign: true,
    showConstraints: true
  };

  /**
   * Validate opening placement on a wall
   */
  static validateOpeningPlacement(
    opening: Opening2D, 
    wall: Wall2D, 
    config: Partial<OpeningIntegrationConfig> = {}
  ): ValidationResult2D {
    const cfg = { ...this.defaultConfig, ...config };
    const errors: string[] = [];
    const warnings: string[] = [];

    // Calculate wall length
    const wallLength = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    );

    // Check minimum wall length
    if (wallLength < cfg.minWallLength) {
      errors.push(`Wall too short for opening (${wallLength.toFixed(2)}m < ${cfg.minWallLength}m)`);
    }

    // Check opening width vs wall length
    const openingWidth = opening.dimensions.width;
    if (openingWidth / wallLength > cfg.maxOpeningRatio) {
      errors.push(`Opening too wide for wall (${(openingWidth/wallLength*100).toFixed(1)}% > ${cfg.maxOpeningRatio*100}%)`);
    }

    // Check distance from corners
    const wallPosition = this.calculateWallPosition(opening, wall);
    const distanceFromStart = wallPosition * wallLength;
    const distanceFromEnd = (1 - wallPosition) * wallLength - openingWidth;

    if (distanceFromStart < cfg.minDistanceFromCorner) {
      warnings.push(`Opening close to wall start (${distanceFromStart.toFixed(2)}m)`);
    }

    if (distanceFromEnd < cfg.minDistanceFromCorner) {
      warnings.push(`Opening close to wall end (${distanceFromEnd.toFixed(2)}m)`);
    }

    // Check if opening fits within wall bounds
    if (wallPosition < 0 || wallPosition > 1) {
      errors.push('Opening position outside wall bounds');
    }

    if (wallPosition + (openingWidth / wallLength) > 1) {
      errors.push('Opening extends beyond wall end');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate opening geometry relative to wall
   */
  static calculateOpeningGeometry(opening: Opening2D, wall: Wall2D): OpeningGeometry2D {
    const wallLength = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    );

    // Validate opening size against wall length
    if (opening.width > wallLength * 0.8) {
      console.warn(`Opening width (${opening.width}) exceeds 80% of wall length (${wallLength})`);
    }

    const wallAngle = Math.atan2(
      wall.end.y - wall.start.y,
      wall.end.x - wall.start.x
    );

    const wallPosition = this.calculateWallPosition(opening, wall);
    
    // Calculate opening position along wall
    const positionX = wall.start.x + (wall.end.x - wall.start.x) * wallPosition;
    const positionY = wall.start.y + (wall.end.y - wall.start.y) * wallPosition;

    const validation = this.validateOpeningPlacement(opening, wall);

    return {
      position: { x: positionX, y: positionY },
      dimensions: opening.dimensions,
      wallPosition,
      depth: wall.thickness,
      angle: wallAngle,
      isValid: validation.isValid
    };
  }

  /**
   * Calculate position along wall (0-1) for opening
   */
  private static calculateWallPosition(opening: Opening2D, wall: Wall2D): number {
    const wallVector = {
      x: wall.end.x - wall.start.x,
      y: wall.end.y - wall.start.y
    };

    const openingVector = {
      x: opening.position.x - wall.start.x,
      y: opening.position.y - wall.start.y
    };

    const wallLengthSquared = wallVector.x * wallVector.x + wallVector.y * wallVector.y;
    
    if (wallLengthSquared === 0) return 0;

    const dotProduct = openingVector.x * wallVector.x + openingVector.y * wallVector.y;
    return Math.max(0, Math.min(1, dotProduct / wallLengthSquared));
  }

  /**
   * Generate dimension set for opening
   */
  static generateOpeningDimensions(opening: Opening2D): DimensionSet2D {
    return {
      width: opening.dimensions.width,
      height: opening.dimensions.height,
      depth: opening.dimensions.depth || 0.2,
      wallOffset: 0, // Offset from wall centerline
      floorOffset: opening.type === 'door' ? 0 : 0.8 // Windows typically start 0.8m from floor
    };
  }

  /**
   * Get openings that intersect with a wall
   */
  static getOpeningsForWall(wall: Wall2D, openings: Opening2D[]): Opening2D[] {
    return openings.filter(opening => {
      const geometry = this.calculateOpeningGeometry(opening, wall);
      return geometry.isValid && this.isOpeningOnWall(opening, wall);
    });
  }

  /**
   * Check if opening is positioned on a specific wall
   */
  private static isOpeningOnWall(opening: Opening2D, wall: Wall2D): boolean {
    const tolerance = 0.1; // 10cm tolerance
    
    // Calculate distance from opening to wall line
    const distance = this.pointToLineDistance(opening.position, wall.start, wall.end);
    
    return distance <= tolerance;
  }

  /**
   * Calculate distance from point to line segment
   */
  private static pointToLineDistance(point: Point2D, lineStart: Point2D, lineEnd: Point2D): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
      // Line start and end are the same point
      return Math.sqrt(A * A + B * B);
    }

    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));

    const xx = lineStart.x + param * C;
    const yy = lineStart.y + param * D;

    const dx = point.x - xx;
    const dy = point.y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Snap opening to wall constraints
   */
  static snapOpeningToWall(
    opening: Opening2D, 
    wall: Wall2D, 
    config: Partial<OpeningIntegrationConfig> = {}
  ): Opening2D {
    const cfg = { ...this.defaultConfig, ...config };
    
    if (!cfg.autoAlign) return opening;

    const wallPosition = this.calculateWallPosition(opening, wall);
    const wallLength = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    );

    // Snap to minimum distance from corners
    let snappedPosition = wallPosition;
    const openingWidth = opening.dimensions.width;
    const minPos = cfg.minDistanceFromCorner / wallLength;
    const maxPos = 1 - (cfg.minDistanceFromCorner + openingWidth) / wallLength;

    snappedPosition = Math.max(minPos, Math.min(maxPos, snappedPosition));

    // Calculate new position
    const newX = wall.start.x + (wall.end.x - wall.start.x) * snappedPosition;
    const newY = wall.start.y + (wall.end.y - wall.start.y) * snappedPosition;

    return {
      ...opening,
      position: { x: newX, y: newY }
    };
  }

  /**
   * Get constraint indicators for opening placement
   */
  static getConstraintIndicators(
    wall: Wall2D, 
    config: Partial<OpeningIntegrationConfig> = {}
  ): Array<{ type: 'min-distance' | 'max-opening', position: Point2D, size: number }> {
    const cfg = { ...this.defaultConfig, ...config };
    const indicators = [];

    if (!cfg.showConstraints) return indicators;

    const wallLength = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    );

    // Min distance from start
    const startRatio = cfg.minDistanceFromCorner / wallLength;
    const startX = wall.start.x + (wall.end.x - wall.start.x) * startRatio;
    const startY = wall.start.y + (wall.end.y - wall.start.y) * startRatio;

    indicators.push({
      type: 'min-distance',
      position: { x: startX, y: startY },
      size: 0.05
    });

    // Min distance from end
    const endRatio = 1 - cfg.minDistanceFromCorner / wallLength;
    const endX = wall.start.x + (wall.end.x - wall.start.x) * endRatio;
    const endY = wall.start.y + (wall.end.y - wall.start.y) * endRatio;

    indicators.push({
      type: 'min-distance',
      position: { x: endX, y: endY },
      size: 0.05
    });

    return indicators;
  }
}

/**
 * Opening Integration Hook for React components
 */
export interface UseOpeningIntegrationOptions {
  autoUpdate?: boolean;
  enabled?: boolean;
  config?: Partial<OpeningIntegrationConfig>;
}

export interface UseOpeningIntegrationReturn {
  validatePlacement: (opening: Opening2D, wall: Wall2D) => ValidationResult2D;
  calculateGeometry: (opening: Opening2D, wall: Wall2D) => OpeningGeometry2D;
  snapToWall: (opening: Opening2D, wall: Wall2D) => Opening2D;
  getConstraints: (wall: Wall2D) => Array<{ type: string, position: Point2D, size: number }>;
  config: OpeningIntegrationConfig;
  updateConfig: (updates: Partial<OpeningIntegrationConfig>) => void;
}

export default OpeningIntegrator2D;