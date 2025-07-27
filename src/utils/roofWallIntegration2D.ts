/**
 * Roof-Wall Integration System for 2D Views
 *
 * This module handles the integration between roofs and walls in the 2D architectural
 * drawing system, including connection detection, overhang calculations, eave management,
 * and proper rendering coordination between roof and wall elements.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Element2D, Dimensions2D } from '@/types/elements2D';
import { ViewType2D } from '@/types/views';
import { RoofPitchCalculator, RoofPitchData, RoofGeometry } from './roofPitchCalculations';
import { handleError, handleWarning } from '@/utils/errorHandler';

export interface RoofWallConnection2D {
  id: string;
  roofId: string;
  wallId: string;
  connectionType: RoofWallConnectionType;
  connectionPoints: Point2D[];
  overhang: number;
  eaveHeight: number;
  ridgeHeight: number;
  angle: number; // Connection angle in degrees
  priority: number; // For rendering order
  pitchData?: RoofPitchData; // Roof pitch information
  geometry?: RoofGeometry; // Calculated roof geometry
  metadata?: Record<string, unknown>;
}

export type RoofWallConnectionType =
  | 'eave'        // Roof edge connects to wall top
  | 'gable'       // Roof gable end connects to wall
  | 'hip'         // Hip roof connects to wall corner
  | 'valley'      // Valley between roof sections
  | 'ridge'       // Ridge line over wall
  | 'overhang'    // Roof overhangs wall
  | 'flush';      // Roof flush with wall

export interface RoofWallIntegrationConfig {
  defaultOverhang: number;        // Default overhang distance (default: 0.5)
  minOverhang: number;           // Minimum overhang (default: 0.1)
  maxOverhang: number;           // Maximum overhang (default: 2.0)
  eaveHeight: number;            // Standard eave height (default: 0.3)
  connectionTolerance: number;    // Distance tolerance for connections (default: 0.1)
  autoConnect: boolean;          // Automatically connect roofs to walls
  showConnectionIndicators: boolean; // Show visual indicators
  renderOrder: RoofWallRenderOrder; // Rendering order configuration
  pitchCalculation: {            // Roof pitch calculation settings
    enabled: boolean;            // Enable pitch calculations
    defaultPitch: number;        // Default roof pitch in degrees
    minPitch: number;           // Minimum allowable pitch
    maxPitch: number;           // Maximum allowable pitch
    autoAdjustOverhang: boolean; // Adjust overhang based on pitch
  };
}

export interface RoofWallRenderOrder {
  wallsFirst: boolean;           // Render walls before roofs
  roofPriority: number;          // Roof rendering priority
  connectionPriority: number;    // Connection indicator priority
}

export interface RoofWallIntersection2D {
  point: Point2D;
  roofId: string;
  wallId: string;
  roofParameter: number;         // Position along roof edge (0-1)
  wallParameter: number;         // Position along wall (0-1)
  intersectionType: 'edge' | 'corner' | 'surface';
  angle: number;
}

export interface RoofWallIntegrationResult {
  connections: RoofWallConnection2D[];
  intersections: RoofWallIntersection2D[];
  modifiedRoofs: Roof2D[];
  modifiedWalls: Wall2D[];
  warnings: string[];
}

/**
 * Main Roof-Wall Integration System Class
 */
export class RoofWallIntegrationSystem2D {
  private config: RoofWallIntegrationConfig;
  private connections: Map<string, RoofWallConnection2D> = new Map();
  private intersections: Map<string, RoofWallIntersection2D> = new Map();
  private pitchCalculator: RoofPitchCalculator;

  constructor(config: Partial<RoofWallIntegrationConfig> = {}) {
    this.config = {
      defaultOverhang: 0.5,
      minOverhang: 0.1,
      maxOverhang: 2.0,
      eaveHeight: 0.3,
      connectionTolerance: 0.1,
      autoConnect: true,
      showConnectionIndicators: true,
      renderOrder: {
        wallsFirst: true,
        roofPriority: 10,
        connectionPriority: 15
      },
      pitchCalculation: {
        enabled: true,
        defaultPitch: 30,
        minPitch: 2,
        maxPitch: 60,
        autoAdjustOverhang: true
      },
      ...config
    };

    // Initialize pitch calculator
    this.pitchCalculator = new RoofPitchCalculator({
      units: 'degrees',
      precision: 2,
      minPitch: this.config.pitchCalculation.minPitch,
      maxPitch: this.config.pitchCalculation.maxPitch
    });
  }

  /**
   * Analyze roofs and walls to create connections
   */
  public analyzeRoofWallIntegration(roofs: Roof2D[], walls: Wall2D[]): RoofWallIntegrationResult {
    const result: RoofWallIntegrationResult = {
      connections: [],
      intersections: [],
      modifiedRoofs: [...roofs],
      modifiedWalls: [...walls],
      warnings: []
    };

    // Clear existing data
    this.connections.clear();
    this.intersections.clear();

    // Find all roof-wall intersections
    const intersections = this.findRoofWallIntersections(roofs, walls);
    result.intersections = intersections;

    // Create connections from intersections
    const connections = this.createConnectionsFromIntersections(intersections, roofs, walls);
    result.connections = connections;

    // Modify roofs and walls for proper integration
    result.modifiedRoofs = this.modifyRoofsForIntegration(roofs, connections);
    result.modifiedWalls = this.modifyWallsForIntegration(walls, connections);

    // Store results
    connections.forEach(connection => this.connections.set(connection.id, connection));
    intersections.forEach(intersection => {
      const key = `${intersection.roofId}-${intersection.wallId}`;
      this.intersections.set(key, intersection);
    });

    // Validate connections and add warnings
    result.warnings = this.validateConnections(connections, roofs, walls);

    return result;
  }

  /**
   * Find all intersections between roofs and walls
   */
  private findRoofWallIntersections(roofs: Roof2D[], walls: Wall2D[]): RoofWallIntersection2D[] {
    const intersections: RoofWallIntersection2D[] = [];

    for (const roof of roofs) {
      for (const wall of walls) {
        const roofIntersections = this.findRoofWallIntersection(roof, wall);
        intersections.push(...roofIntersections);
      }
    }

    return intersections;
  }

  /**
   * Find intersection between a roof and a wall
   */
  private findRoofWallIntersection(roof: Roof2D, wall: Wall2D): RoofWallIntersection2D[] {
    const intersections: RoofWallIntersection2D[] = [];

    // Get roof outline points
    const roofPoints = this.getRoofOutlinePoints(roof);

    // Check each roof edge against the wall
    for (let i = 0; i < roofPoints.length; i++) {
      const roofStart = roofPoints[i];
      const roofEnd = roofPoints[(i + 1) % roofPoints.length];

      const intersection = this.findLineIntersection(
        { start: roofStart, end: roofEnd },
        { start: wall.startPoint, end: wall.endPoint }
      );

      if (intersection) {
        const roofParam = this.getParameterOnLine({ start: roofStart, end: roofEnd }, intersection.point);
        const wallParam = this.getParameterOnLine({ start: wall.startPoint, end: wall.endPoint }, intersection.point);

        // Check if intersection is within both roof edge and wall
        if (roofParam >= 0 && roofParam <= 1 && wallParam >= 0 && wallParam <= 1) {
          intersections.push({
            point: intersection.point,
            roofId: roof.id,
            wallId: wall.id,
            roofParameter: roofParam,
            wallParameter: wallParam,
            intersectionType: this.classifyRoofWallIntersection(roofParam, wallParam),
            angle: intersection.angle
          });
        }
      }
    }

    // Check for roof corners near wall endpoints
    const cornerIntersections = this.findRoofCornerWallIntersections(roof, wall);
    intersections.push(...cornerIntersections);

    return intersections;
  }

  /**
   * Get roof outline points based on roof type
   */
  private getRoofOutlinePoints(roof: Roof2D): Point2D[] {
    // For now, use the roof points directly
    // In a more advanced system, this would calculate the actual roof outline
    // based on roof type (gable, hip, shed, etc.)

    // Check if roof has points property (from metadata or direct property)
    if (roof.metadata && roof.metadata.points) {
      return roof.metadata.points as Point2D[];
    }

    // If no points, create a simple rectangular outline based on dimensions
    const width = roof.dimensions.width;
    const height = roof.dimensions.height;
    const centerX = roof.transform.position.x;
    const centerY = roof.transform.position.y;

    return [
      { x: centerX - width/2, y: centerY - height/2 },
      { x: centerX + width/2, y: centerY - height/2 },
      { x: centerX + width/2, y: centerY + height/2 },
      { x: centerX - width/2, y: centerY + height/2 }
    ];
  }

  /**
   * Find line intersection between two line segments
   */
  private findLineIntersection(
    line1: { start: Point2D, end: Point2D },
    line2: { start: Point2D, end: Point2D }
  ): { point: Point2D, angle: number } | null {
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
  private getParameterOnLine(line: { start: Point2D, end: Point2D }, point: Point2D): number {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return (point.x - line.start.x) / dx;
    } else {
      return (point.y - line.start.y) / dy;
    }
  }

  /**
   * Find roof corner intersections with walls
   */
  private findRoofCornerWallIntersections(roof: Roof2D, wall: Wall2D): RoofWallIntersection2D[] {
    const intersections: RoofWallIntersection2D[] = [];
    const tolerance = this.config.connectionTolerance;

    const roofPoints = this.getRoofOutlinePoints(roof);

    for (let i = 0; i < roofPoints.length; i++) {
      const corner = roofPoints[i];
      const distanceToWall = this.distancePointToLine(corner, wall.startPoint, wall.endPoint);

      if (distanceToWall < tolerance) {
        const wallParam = this.getParameterOnLine({ start: wall.startPoint, end: wall.endPoint }, corner);

        if (wallParam >= 0 && wallParam <= 1) {
          intersections.push({
            point: corner,
            roofId: roof.id,
            wallId: wall.id,
            roofParameter: i / roofPoints.length, // Corner position
            wallParameter: wallParam,
            intersectionType: 'corner',
            angle: 0 // Corner intersection
          });
        }
      }
    }

    return intersections;
  }

  /**
   * Calculate distance from point to line
   */
  private distancePointToLine(point: Point2D, lineStart: Point2D, lineEnd: Point2D): number {
    const A = lineEnd.y - lineStart.y;
    const B = lineStart.x - lineEnd.x;
    const C = lineEnd.x * lineStart.y - lineStart.x * lineEnd.y;

    return Math.abs(A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B);
  }

  /**
   * Classify roof-wall intersection type
   */
  private classifyRoofWallIntersection(roofParam: number, wallParam: number): 'edge' | 'corner' | 'surface' {
    const tolerance = 0.1;

    // Check if at roof corner
    if (Math.abs(roofParam) < tolerance || Math.abs(roofParam - 1) < tolerance) {
      return 'corner';
    }

    // Check if at wall endpoint
    if (Math.abs(wallParam) < tolerance || Math.abs(wallParam - 1) < tolerance) {
      return 'corner';
    }

    // Check if on roof edge
    if (roofParam >= 0 && roofParam <= 1) {
      return 'edge';
    }

    return 'surface';
  }

  /**
   * Create connections from intersections
   */
  private createConnectionsFromIntersections(
    intersections: RoofWallIntersection2D[],
    roofs: Roof2D[],
    walls: Wall2D[]
  ): RoofWallConnection2D[] {
    const connections: RoofWallConnection2D[] = [];
    const processedPairs = new Set<string>();

    for (const intersection of intersections) {
      const pairKey = `${intersection.roofId}-${intersection.wallId}`;

      if (!processedPairs.has(pairKey)) {
        const roof = roofs.find(r => r.id === intersection.roofId);
        const wall = walls.find(w => w.id === intersection.wallId);

        if (roof && wall) {
          const connection = this.createRoofWallConnection(intersection, roof, wall, intersections);
          connections.push(connection);
          processedPairs.add(pairKey);
        }
      }
    }

    return connections;
  }

  /**
   * Create a roof-wall connection from intersection data
   */
  private createRoofWallConnection(
    intersection: RoofWallIntersection2D,
    roof: Roof2D,
    wall: Wall2D,
    allIntersections: RoofWallIntersection2D[]
  ): RoofWallConnection2D {
    // Find all intersections for this roof-wall pair
    const pairIntersections = allIntersections.filter(
      i => i.roofId === roof.id && i.wallId === wall.id
    );

    const connectionType = this.determineConnectionType(intersection, roof, wall);
    const connectionPoints = pairIntersections.map(i => i.point);

    // Calculate pitch data if enabled
    let pitchData: RoofPitchData | undefined;
    let geometry: RoofGeometry | undefined;

    if (this.config.pitchCalculation.enabled) {
      try {
        const roofPitches = this.pitchCalculator.calculatePitchFromRoof(roof);
        pitchData = roofPitches.length > 0 ? roofPitches[0] : undefined;

        if (pitchData) {
          const span = this.calculateRoofSpan(roof, wall);
          geometry = this.pitchCalculator.calculateRoofGeometry(
            span,
            pitchData.pitch,
            this.config.eaveHeight
          );
        }
      } catch (error) {
        handleWarning('Could not calculate pitch data for roof-wall connection', {
          category: 'calculation',
          source: 'roofWallIntegration2D.createConnection',
          operation: 'pitchCalculation'
        }, {
          userMessage: 'Unable to calculate roof pitch for this connection. Using default values.',
          suggestions: ['Check roof geometry', 'Verify wall placement', 'Review roof pitch settings']
        });
      }
    }

    const baseOverhang = this.calculateOverhang(connectionType, roof, wall);
    const adjustedOverhang = this.adjustOverhangForPitch(baseOverhang, pitchData);

    return {
      id: `connection-${roof.id}-${wall.id}`,
      roofId: roof.id,
      wallId: wall.id,
      connectionType,
      connectionPoints,
      overhang: adjustedOverhang,
      eaveHeight: this.config.eaveHeight,
      ridgeHeight: this.calculateRidgeHeight(roof, wall, pitchData),
      angle: intersection.angle,
      priority: this.calculateConnectionPriority(connectionType),
      pitchData,
      geometry,
      metadata: {
        intersectionCount: pairIntersections.length,
        createdFrom: 'intersection',
        pitchCalculated: !!pitchData
      }
    };
  }

  /**
   * Determine connection type based on intersection and roof/wall properties
   */
  private determineConnectionType(
    intersection: RoofWallIntersection2D,
    roof: Roof2D,
    wall: Wall2D
  ): RoofWallConnectionType {
    // This is a simplified implementation
    // In a real system, this would analyze roof type, wall orientation, etc.

    switch (intersection.intersectionType) {
      case 'corner':
        return 'gable';
      case 'edge':
        return intersection.angle < 30 ? 'eave' : 'gable';
      case 'surface':
        return 'overhang';
      default:
        return 'eave';
    }
  }

  /**
   * Calculate overhang distance
   */
  private calculateOverhang(type: RoofWallConnectionType, roof: Roof2D, wall: Wall2D): number {
    switch (type) {
      case 'overhang':
        return this.config.defaultOverhang;
      case 'eave':
        return this.config.defaultOverhang * 0.8;
      case 'flush':
        return 0;
      default:
        return this.config.defaultOverhang * 0.5;
    }
  }

  /**
   * Calculate ridge height
   */
  private calculateRidgeHeight(roof: Roof2D, wall: Wall2D, pitchData?: RoofPitchData): number {
    if (pitchData && this.config.pitchCalculation.enabled) {
      // Calculate based on pitch and span
      const span = this.calculateRoofSpan(roof, wall);
      const rise = (span / 2) * Math.tan(pitchData.pitch * (Math.PI / 180));
      return wall.height + this.config.eaveHeight + rise;
    }

    // Fallback to simple calculation
    const roofHeight = roof.metadata?.height as number || roof.dimensions.height || 3;
    return wall.height + roofHeight;
  }

  /**
   * Calculate roof span for pitch calculations
   */
  private calculateRoofSpan(roof: Roof2D, wall: Wall2D): number {
    // Simplified calculation - use roof width as span
    return roof.dimensions.width;
  }

  /**
   * Adjust overhang based on roof pitch
   */
  private adjustOverhangForPitch(baseOverhang: number, pitchData?: RoofPitchData): number {
    if (!pitchData || !this.config.pitchCalculation.autoAdjustOverhang) {
      return baseOverhang;
    }

    // Adjust overhang based on pitch category
    switch (pitchData.category) {
      case 'flat':
        return baseOverhang * 0.5; // Minimal overhang for flat roofs
      case 'low':
        return baseOverhang * 0.8;
      case 'conventional':
        return baseOverhang; // Standard overhang
      case 'steep':
        return baseOverhang * 1.2; // Increased overhang for steep roofs
      case 'very_steep':
        return baseOverhang * 1.5; // Maximum overhang for very steep roofs
      default:
        return baseOverhang;
    }
  }

  /**
   * Calculate connection priority for rendering
   */
  private calculateConnectionPriority(type: RoofWallConnectionType): number {
    switch (type) {
      case 'ridge': return 5;
      case 'eave': return 4;
      case 'gable': return 3;
      case 'hip': return 3;
      case 'valley': return 2;
      case 'overhang': return 1;
      case 'flush': return 0;
      default: return 0;
    }
  }

  /**
   * Modify roofs for integration
   */
  private modifyRoofsForIntegration(roofs: Roof2D[], connections: RoofWallConnection2D[]): Roof2D[] {
    const modifiedRoofs = roofs.map(roof => ({ ...roof }));

    for (const connection of connections) {
      const roofIndex = modifiedRoofs.findIndex(r => r.id === connection.roofId);
      if (roofIndex >= 0) {
        modifiedRoofs[roofIndex] = this.adjustRoofForConnection(modifiedRoofs[roofIndex], connection);
      }
    }

    return modifiedRoofs;
  }

  /**
   * Modify walls for integration
   */
  private modifyWallsForIntegration(walls: Wall2D[], connections: RoofWallConnection2D[]): Wall2D[] {
    const modifiedWalls = walls.map(wall => ({ ...wall }));

    for (const connection of connections) {
      const wallIndex = modifiedWalls.findIndex(w => w.id === connection.wallId);
      if (wallIndex >= 0) {
        modifiedWalls[wallIndex] = this.adjustWallForConnection(modifiedWalls[wallIndex], connection);
      }
    }

    return modifiedWalls;
  }

  /**
   * Adjust roof for connection
   */
  private adjustRoofForConnection(roof: Roof2D, connection: RoofWallConnection2D): Roof2D {
    const adjustedRoof = { ...roof };

    // Add connection metadata
    if (!adjustedRoof.metadata) adjustedRoof.metadata = {};
    if (!adjustedRoof.metadata.connections) adjustedRoof.metadata.connections = [];
    (adjustedRoof.metadata.connections as string[]).push(connection.id);

    // Adjust roof properties based on connection
    if (connection.connectionType === 'overhang') {
      // Extend roof for overhang
      adjustedRoof.overhang = Math.max(adjustedRoof.overhang || 0, connection.overhang);
    }

    return adjustedRoof;
  }

  /**
   * Adjust wall for connection
   */
  private adjustWallForConnection(wall: Wall2D, connection: RoofWallConnection2D): Wall2D {
    const adjustedWall = { ...wall };

    // Add connection metadata
    if (!adjustedWall.metadata) adjustedWall.metadata = {};
    if (!adjustedWall.metadata.roofConnections) adjustedWall.metadata.roofConnections = [];
    (adjustedWall.metadata.roofConnections as string[]).push(connection.id);

    return adjustedWall;
  }

  /**
   * Validate connections and return warnings
   */
  private validateConnections(
    connections: RoofWallConnection2D[],
    roofs: Roof2D[],
    walls: Wall2D[]
  ): string[] {
    const warnings: string[] = [];

    for (const connection of connections) {
      // Check overhang limits
      if (connection.overhang > this.config.maxOverhang) {
        warnings.push(`Connection ${connection.id}: Overhang ${connection.overhang} exceeds maximum ${this.config.maxOverhang}`);
      }

      if (connection.overhang < this.config.minOverhang && connection.connectionType === 'overhang') {
        warnings.push(`Connection ${connection.id}: Overhang ${connection.overhang} below minimum ${this.config.minOverhang}`);
      }

      // Check for missing elements
      const roof = roofs.find(r => r.id === connection.roofId);
      const wall = walls.find(w => w.id === connection.wallId);

      if (!roof) {
        warnings.push(`Connection ${connection.id}: Referenced roof ${connection.roofId} not found`);
      }

      if (!wall) {
        warnings.push(`Connection ${connection.id}: Referenced wall ${connection.wallId} not found`);
      }
    }

    return warnings;
  }

  /**
   * Get all connections
   */
  public getConnections(): RoofWallConnection2D[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection by ID
   */
  public getConnection(id: string): RoofWallConnection2D | undefined {
    return this.connections.get(id);
  }

  /**
   * Get connections for a specific roof
   */
  public getConnectionsForRoof(roofId: string): RoofWallConnection2D[] {
    return Array.from(this.connections.values()).filter(connection =>
      connection.roofId === roofId
    );
  }

  /**
   * Get connections for a specific wall
   */
  public getConnectionsForWall(wallId: string): RoofWallConnection2D[] {
    return Array.from(this.connections.values()).filter(connection =>
      connection.wallId === wallId
    );
  }

  /**
   * Update configuration
   */
  public updateConfiguration(config: Partial<RoofWallIntegrationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): RoofWallIntegrationConfig {
    return { ...this.config };
  }

  /**
   * Calculate optimal pitch for roof-wall connection
   */
  public calculateOptimalPitch(roof: Roof2D, wall: Wall2D, constraints?: {
    maxHeight?: number;
    minHeight?: number;
    preferredCategory?: 'flat' | 'low' | 'conventional' | 'steep' | 'very_steep';
  }): RoofPitchData {
    const span = this.calculateRoofSpan(roof, wall);
    const maxHeight = constraints?.maxHeight || wall.height + 10; // Default max height
    const minHeight = constraints?.minHeight || wall.height + this.config.eaveHeight;
    const preferredCategory = constraints?.preferredCategory || 'conventional';

    return this.pitchCalculator.findOptimalPitch(span, maxHeight, minHeight, preferredCategory);
  }

  /**
   * Update roof pitch for a connection
   */
  public updateConnectionPitch(connectionId: string, newPitch: number): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    try {
      // Validate new pitch
      const validation = this.pitchCalculator.validatePitch(newPitch);
      if (!validation.valid) {
        handleWarning('Invalid pitch value provided', {
          category: 'validation',
          source: 'roofWallIntegration2D.updateConnectionPitch',
          operation: 'pitchValidation'
        }, {
          userMessage: 'The pitch value is invalid and cannot be applied.',
          suggestions: ['Use a pitch between 5° and 60°', 'Check that the pitch value is a valid number']
        });
        return false;
      }

      // Get roof from connections to calculate span
      // Note: In a real implementation, we'd need to get the roof object
      // For now, we'll use a default span calculation
      const span = 10; // Default span - would need roof object to calculate properly
      const rise = (span / 2) * Math.tan(newPitch * (Math.PI / 180));
      const pitchData = this.pitchCalculator.calculatePitchFromRiseRun(rise, span / 2);

      // Calculate new geometry
      const geometry = this.pitchCalculator.calculateRoofGeometry(
        span,
        newPitch,
        this.config.eaveHeight
      );

      // Update connection
      const updatedConnection = {
        ...connection,
        pitchData,
        geometry,
        ridgeHeight: connection.eaveHeight + rise,
        overhang: this.adjustOverhangForPitch(connection.overhang, pitchData),
        metadata: {
          ...connection.metadata,
          pitchUpdated: true,
          lastPitchUpdate: new Date().toISOString()
        }
      };

      this.connections.set(connectionId, updatedConnection);
      return true;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to update connection pitch'), {
        category: 'calculation',
        source: 'roofWallIntegration2D.updateConnectionPitch',
        operation: 'pitchUpdate'
      }, {
        userMessage: 'Failed to update the roof-wall connection pitch. The change could not be applied.',
        suggestions: ['Try a different pitch value', 'Check that the connection exists', 'Verify roof and wall geometry']
      });
      return false;
    }
  }

  /**
   * Get pitch recommendations for roof type
   */
  public getPitchRecommendations(roofType: string, climate?: 'snow' | 'rain' | 'dry'): {
    recommended: RoofPitchData;
    alternatives: RoofPitchData[];
    warnings: string[];
  } {
    const recommendations = this.pitchCalculator.constructor.getRecommendedPitch?.(roofType) ||
      { min: 15, max: 45, optimal: 30 };

    const optimalPitch = this.pitchCalculator.calculatePitchFromRiseRun(
      Math.tan(recommendations.optimal * (Math.PI / 180)) * 12,
      12
    );

    const alternatives = [recommendations.min, recommendations.max].map(pitch =>
      this.pitchCalculator.calculatePitchFromRiseRun(
        Math.tan(pitch * (Math.PI / 180)) * 12,
        12
      )
    );

    const validation = climate ?
      this.pitchCalculator.constructor.validateForBuildingCodes?.(recommendations.optimal, roofType, climate) :
      { warnings: [] };

    return {
      recommended: optimalPitch,
      alternatives,
      warnings: validation?.warnings || []
    };
  }

  /**
   * Get pitch calculator instance
   */
  public getPitchCalculator(): RoofPitchCalculator {
    return this.pitchCalculator;
  }

  /**
   * Clear all connections and intersections
   */
  public clear(): void {
    this.connections.clear();
    this.intersections.clear();
  }
}

/**
 * Utility functions for roof-wall integration
 */
export class RoofWallIntegrationUtils {
  /**
   * Create default integration configuration
   */
  static createDefaultConfig(): RoofWallIntegrationConfig {
    return {
      defaultOverhang: 0.5,
      minOverhang: 0.1,
      maxOverhang: 2.0,
      eaveHeight: 0.3,
      connectionTolerance: 0.1,
      autoConnect: true,
      showConnectionIndicators: true,
      renderOrder: {
        wallsFirst: true,
        roofPriority: 10,
        connectionPriority: 15
      }
    };
  }

  /**
   * Calculate roof area over walls
   */
  static calculateRoofCoverage(roof: Roof2D, walls: Wall2D[]): number {
    // Simplified calculation - would be more complex in reality
    const roofPoints = this.getRoofPoints(roof);
    const roofArea = this.calculatePolygonArea(roofPoints);
    return roofArea;
  }

  /**
   * Calculate polygon area
   */
  private static calculatePolygonArea(points: Point2D[]): number {
    if (points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }

    return Math.abs(area) / 2;
  }

  /**
   * Get roof points from roof metadata or generate from dimensions
   */
  private static getRoofPoints(roof: Roof2D): Point2D[] {
    if (roof.metadata && roof.metadata.points) {
      return roof.metadata.points as Point2D[];
    }

    // Generate points from dimensions
    const width = roof.dimensions.width;
    const height = roof.dimensions.height;
    const centerX = roof.transform.position.x;
    const centerY = roof.transform.position.y;

    return [
      { x: centerX - width/2, y: centerY - height/2 },
      { x: centerX + width/2, y: centerY - height/2 },
      { x: centerX + width/2, y: centerY + height/2 },
      { x: centerX - width/2, y: centerY + height/2 }
    ];
  }

  /**
   * Validate roof-wall integration configuration
   */
  static validateConfig(config: Partial<RoofWallIntegrationConfig>): string[] {
    const errors: string[] = [];

    if (config.defaultOverhang !== undefined && config.defaultOverhang < 0) {
      errors.push('Default overhang must be non-negative');
    }

    if (config.minOverhang !== undefined && config.minOverhang < 0) {
      errors.push('Minimum overhang must be non-negative');
    }

    if (config.maxOverhang !== undefined && config.maxOverhang < 0) {
      errors.push('Maximum overhang must be non-negative');
    }

    if (config.minOverhang !== undefined && config.maxOverhang !== undefined &&
        config.minOverhang > config.maxOverhang) {
      errors.push('Minimum overhang cannot be greater than maximum overhang');
    }

    if (config.connectionTolerance !== undefined && config.connectionTolerance < 0) {
      errors.push('Connection tolerance must be non-negative');
    }

    return errors;
  }
}

export default RoofWallIntegrationSystem2D;
