/**
 * Wall Joining System for 2D Views
 *
 * This module handles intelligent wall joining, intersection detection,
 * and connection management for the 2D architectural drawing system.
 * Supports T-joints, L-joints, cross-joints, and corner connections.
 */

import { Wall2D, Point2D, Element2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';

export interface WallJoint2D {
  id: string;
  type: WallJointType;
  position: Point2D;
  wallIds: string[];
  angle: number; // Joint angle in degrees
  priority: number; // For rendering order
  metadata?: Record<string, unknown>;
}

export type WallJointType =
  | 'corner'      // 90-degree corner
  | 'tee'         // T-junction
  | 'cross'       // 4-way intersection
  | 'acute'       // Acute angle join
  | 'obtuse'      // Obtuse angle join
  | 'butt'        // End-to-end connection
  | 'overlap';    // Overlapping walls

export interface WallJoinConfiguration {
  tolerance: number;           // Distance tolerance for joining (default: 0.1)
  angleThreshold: number;      // Angle threshold for corner detection (default: 5 degrees)
  autoJoin: boolean;          // Automatically create joins when walls are close
  showJoinIndicators: boolean; // Show visual indicators for joins
  joinStyle: WallJoinStyle;   // Visual style for joins
}

export interface WallJoinStyle {
  cornerRadius: number;        // Radius for rounded corners
  mitreLimit: number;         // Limit for mitre joins
  lineCapStyle: 'butt' | 'round' | 'square';
  lineJoinStyle: 'miter' | 'round' | 'bevel';
}

export interface WallIntersection2D {
  point: Point2D;
  wall1Id: string;
  wall2Id: string;
  parameter1: number; // Position along wall1 (0-1)
  parameter2: number; // Position along wall2 (0-1)
  angle: number;      // Intersection angle
  type: 'crossing' | 'touching' | 'overlapping';
}

export interface WallJoinResult {
  joints: WallJoint2D[];
  intersections: WallIntersection2D[];
  modifiedWalls: Wall2D[];
  warnings: string[];
}

/**
 * Main Wall Joining System Class
 */
export class WallJoiningSystem2D {
  private config: WallJoinConfiguration;
  private joints: Map<string, WallJoint2D> = new Map();
  private intersections: Map<string, WallIntersection2D> = new Map();

  constructor(config: Partial<WallJoinConfiguration> = {}) {
    this.config = {
      tolerance: 0.1,
      angleThreshold: 5,
      autoJoin: true,
      showJoinIndicators: true,
      joinStyle: {
        cornerRadius: 0.05,
        mitreLimit: 4,
        lineCapStyle: 'round',
        lineJoinStyle: 'miter'
      },
      ...config
    };
  }

  /**
   * Analyze walls and create joins
   */
  public analyzeWalls(walls: Wall2D[]): WallJoinResult {
    const result: WallJoinResult = {
      joints: [],
      intersections: [],
      modifiedWalls: [...walls],
      warnings: []
    };

    // Clear existing data
    this.joints.clear();
    this.intersections.clear();

    // Find all intersections
    const intersections = this.findAllIntersections(walls);
    result.intersections = intersections;

    // Create joints from intersections
    const joints = this.createJointsFromIntersections(intersections, walls);
    result.joints = joints;

    // Modify walls to accommodate joins
    result.modifiedWalls = this.modifyWallsForJoins(walls, joints);

    // Store results
    joints.forEach(joint => this.joints.set(joint.id, joint));
    intersections.forEach(intersection => {
      const key = `${intersection.wall1Id}-${intersection.wall2Id}`;
      this.intersections.set(key, intersection);
    });

    return result;
  }

  /**
   * Find all intersections between walls
   */
  private findAllIntersections(walls: Wall2D[]): WallIntersection2D[] {
    const intersections: WallIntersection2D[] = [];

    for (let i = 0; i < walls.length; i++) {
      for (let j = i + 1; j < walls.length; j++) {
        const wall1 = walls[i];
        const wall2 = walls[j];

        const intersection = this.findWallIntersection(wall1, wall2);
        if (intersection) {
          intersections.push(intersection);
        }
      }
    }

    return intersections;
  }

  /**
   * Find intersection between two walls
   */
  private findWallIntersection(wall1: Wall2D, wall2: Wall2D): WallIntersection2D | null {
    const line1 = {
      start: wall1.startPoint,
      end: wall1.endPoint
    };

    const line2 = {
      start: wall2.startPoint,
      end: wall2.endPoint
    };

    const intersection = this.lineIntersection(line1, line2);
    if (!intersection) return null;

    // Check if intersection is within tolerance of both walls
    const param1 = this.getParameterOnLine(line1, intersection.point);
    const param2 = this.getParameterOnLine(line2, intersection.point);

    // Extend tolerance for endpoints
    const tolerance = this.config.tolerance;
    const extendedTolerance = tolerance * 2;

    const onWall1 = (param1 >= -extendedTolerance && param1 <= 1 + extendedTolerance);
    const onWall2 = (param2 >= -extendedTolerance && param2 <= 1 + extendedTolerance);

    if (!onWall1 || !onWall2) return null;

    return {
      point: intersection.point,
      wall1Id: wall1.id,
      wall2Id: wall2.id,
      parameter1: param1,
      parameter2: param2,
      angle: intersection.angle,
      type: this.classifyIntersection(param1, param2)
    };
  }

  /**
   * Calculate line intersection
   */
  private lineIntersection(line1: {start: Point2D, end: Point2D}, line2: {start: Point2D, end: Point2D}): {point: Point2D, angle: number} | null {
    const x1 = line1.start.x, y1 = line1.start.y;
    const x2 = line1.end.x, y2 = line1.end.y;
    const x3 = line2.start.x, y3 = line2.start.y;
    const x4 = line2.end.x, y4 = line2.end.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return null; // Lines are parallel

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    const point: Point2D = {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };

    // Calculate angle between lines
    const angle1 = Math.atan2(y2 - y1, x2 - x1);
    const angle2 = Math.atan2(y4 - y3, x4 - x3);
    const angle = Math.abs(angle1 - angle2) * 180 / Math.PI;

    return { point, angle: Math.min(angle, 180 - angle) };
  }

  /**
   * Get parameter (0-1) of point on line
   */
  private getParameterOnLine(line: {start: Point2D, end: Point2D}, point: Point2D): number {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return (point.x - line.start.x) / dx;
    } else {
      return (point.y - line.start.y) / dy;
    }
  }

  /**
   * Classify intersection type
   */
  private classifyIntersection(param1: number, param2: number): 'crossing' | 'touching' | 'overlapping' {
    const tolerance = this.config.tolerance;

    // Check if parameters indicate endpoint connections
    const isEndpoint1 = Math.abs(param1) < tolerance || Math.abs(param1 - 1) < tolerance;
    const isEndpoint2 = Math.abs(param2) < tolerance || Math.abs(param2 - 1) < tolerance;

    if (isEndpoint1 || isEndpoint2) {
      return 'touching';
    }

    // Check for overlapping (parallel walls)
    if (param1 >= 0 && param1 <= 1 && param2 >= 0 && param2 <= 1) {
      return 'overlapping';
    }

    return 'crossing';
  }

  /**
   * Create joints from intersections
   */
  private createJointsFromIntersections(intersections: WallIntersection2D[], walls: Wall2D[]): WallJoint2D[] {
    const joints: WallJoint2D[] = [];
    const processedPoints = new Map<string, WallJoint2D>();

    for (const intersection of intersections) {
      const pointKey = `${intersection.point.x.toFixed(3)},${intersection.point.y.toFixed(3)}`;

      let joint = processedPoints.get(pointKey);
      if (!joint) {
        joint = {
          id: `joint-${joints.length + 1}`,
          type: this.determineJointType(intersection, intersections),
          position: intersection.point,
          wallIds: [intersection.wall1Id, intersection.wall2Id],
          angle: intersection.angle,
          priority: this.calculateJointPriority(intersection),
          metadata: {
            intersectionType: intersection.type,
            createdFrom: 'intersection'
          }
        };

        joints.push(joint);
        processedPoints.set(pointKey, joint);
      } else {
        // Add wall to existing joint if not already present
        if (!joint.wallIds.includes(intersection.wall1Id)) {
          joint.wallIds.push(intersection.wall1Id);
        }
        if (!joint.wallIds.includes(intersection.wall2Id)) {
          joint.wallIds.push(intersection.wall2Id);
        }

        // Update joint type based on number of walls
        joint.type = this.determineJointTypeFromWallCount(joint.wallIds.length, joint.angle);
      }
    }

    return joints;
  }

  /**
   * Determine joint type from intersection
   */
  private determineJointType(intersection: WallIntersection2D, allIntersections: WallIntersection2D[]): WallJointType {
    const angle = intersection.angle;
    const threshold = this.config.angleThreshold;

    // Count walls at this point
    const wallsAtPoint = this.countWallsAtPoint(intersection.point, allIntersections);

    return this.determineJointTypeFromWallCount(wallsAtPoint, angle);
  }

  /**
   * Determine joint type from wall count and angle
   */
  private determineJointTypeFromWallCount(wallCount: number, angle: number): WallJointType {
    const threshold = this.config.angleThreshold;

    if (wallCount === 2) {
      if (Math.abs(angle - 90) < threshold) return 'corner';
      if (angle < 90 - threshold) return 'acute';
      if (angle > 90 + threshold) return 'obtuse';
      if (Math.abs(angle - 180) < threshold) return 'butt';
      return 'corner'; // Default for 2 walls
    }

    if (wallCount === 3) return 'tee';
    if (wallCount >= 4) return 'cross';

    return 'butt'; // Default
  }

  /**
   * Count walls at a specific point
   */
  private countWallsAtPoint(point: Point2D, intersections: WallIntersection2D[]): number {
    const tolerance = this.config.tolerance;
    const wallIds = new Set<string>();

    for (const intersection of intersections) {
      const distance = this.distance(point, intersection.point);
      if (distance < tolerance) {
        wallIds.add(intersection.wall1Id);
        wallIds.add(intersection.wall2Id);
      }
    }

    return wallIds.size;
  }

  /**
   * Calculate distance between two points
   */
  private distance(p1: Point2D, p2: Point2D): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Calculate joint priority for rendering order
   */
  private calculateJointPriority(intersection: WallIntersection2D): number {
    // Higher priority for more complex joints
    switch (intersection.type) {
      case 'crossing': return 3;
      case 'overlapping': return 2;
      case 'touching': return 1;
      default: return 0;
    }
  }

  /**
   * Modify walls to accommodate joins
   */
  private modifyWallsForJoins(walls: Wall2D[], joints: WallJoint2D[]): Wall2D[] {
    const modifiedWalls = walls.map(wall => ({ ...wall }));

    for (const joint of joints) {
      for (const wallId of joint.wallIds) {
        const wallIndex = modifiedWalls.findIndex(w => w.id === wallId);
        if (wallIndex >= 0) {
          modifiedWalls[wallIndex] = this.adjustWallForJoint(modifiedWalls[wallIndex], joint);
        }
      }
    }

    return modifiedWalls;
  }

  /**
   * Adjust wall for joint
   */
  private adjustWallForJoint(wall: Wall2D, joint: WallJoint2D): Wall2D {
    const tolerance = this.config.tolerance;
    const adjustedWall = { ...wall };

    // Check if joint is at wall start or end
    const startDistance = this.distance(wall.startPoint, joint.position);
    const endDistance = this.distance(wall.endPoint, joint.position);

    if (startDistance < tolerance) {
      adjustedWall.startPoint = joint.position;
    } else if (endDistance < tolerance) {
      adjustedWall.endPoint = joint.position;
    }

    // Add joint metadata
    if (!adjustedWall.metadata) adjustedWall.metadata = {};
    if (!adjustedWall.metadata.joints) adjustedWall.metadata.joints = [];
    (adjustedWall.metadata.joints as string[]).push(joint.id);

    return adjustedWall;
  }

  /**
   * Get all joints
   */
  public getJoints(): WallJoint2D[] {
    return Array.from(this.joints.values());
  }

  /**
   * Get joint by ID
   */
  public getJoint(id: string): WallJoint2D | undefined {
    return this.joints.get(id);
  }

  /**
   * Get joints for a specific wall
   */
  public getJointsForWall(wallId: string): WallJoint2D[] {
    return Array.from(this.joints.values()).filter(joint =>
      joint.wallIds.includes(wallId)
    );
  }

  /**
   * Update configuration
   */
  public updateConfiguration(config: Partial<WallJoinConfiguration>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): WallJoinConfiguration {
    return { ...this.config };
  }

  /**
   * Clear all joints and intersections
   */
  public clear(): void {
    this.joints.clear();
    this.intersections.clear();
  }
}

/**
 * Utility functions for wall joining
 */
export class WallJoinUtils {
  /**
   * Create default join configuration
   */
  static createDefaultConfig(): WallJoinConfiguration {
    return {
      tolerance: 0.1,
      angleThreshold: 5,
      autoJoin: true,
      showJoinIndicators: true,
      joinStyle: {
        cornerRadius: 0.05,
        mitreLimit: 4,
        lineCapStyle: 'round',
        lineJoinStyle: 'miter'
      }
    };
  }

  /**
   * Validate wall join configuration
   */
  static validateConfig(config: Partial<WallJoinConfiguration>): string[] {
    const errors: string[] = [];

    if (config.tolerance !== undefined && config.tolerance < 0) {
      errors.push('Tolerance must be non-negative');
    }

    if (config.angleThreshold !== undefined && (config.angleThreshold < 0 || config.angleThreshold > 45)) {
      errors.push('Angle threshold must be between 0 and 45 degrees');
    }

    if (config.joinStyle?.cornerRadius !== undefined && config.joinStyle.cornerRadius < 0) {
      errors.push('Corner radius must be non-negative');
    }

    return errors;
  }

  /**
   * Calculate optimal join style for walls
   */
  static calculateOptimalJoinStyle(walls: Wall2D[], joint: WallJoint2D): WallJoinStyle {
    const avgThickness = walls
      .filter(w => joint.wallIds.includes(w.id))
      .reduce((sum, w) => sum + w.thickness, 0) / joint.wallIds.length;

    return {
      cornerRadius: avgThickness * 0.1,
      mitreLimit: 4,
      lineCapStyle: 'round',
      lineJoinStyle: joint.type === 'corner' ? 'miter' : 'round'
    };
  }
}

export default WallJoiningSystem2D;
