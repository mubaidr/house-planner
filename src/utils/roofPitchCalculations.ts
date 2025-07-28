/**
 * Roof Pitch Calculations for 2D Architectural System
 *
 * This module provides comprehensive roof pitch calculations, slope analysis,
 * and geometric computations for accurate roof-wall integration.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Wall2D, Point2D, Roof2D } from '@/types/elements2D';

export interface RoofPitchData {
  pitch: number;           // Pitch in degrees
  slope: number;           // Slope as rise/run ratio
  rise: number;            // Vertical rise
  run: number;             // Horizontal run
  pitchRatio: string;      // Traditional pitch ratio (e.g., "12:12")
  pitchFraction: string;   // Fractional representation (e.g., "1/1")
  category: RoofPitchCategory;
}

export type RoofPitchCategory =
  | 'flat'        // 0° to 2°
  | 'low'         // 2° to 10°
  | 'conventional' // 10° to 30°
  | 'steep'       // 30° to 45°
  | 'very_steep'; // 45°+

export interface RoofGeometry {
  ridgeHeight: number;     // Height at ridge
  eaveHeight: number;      // Height at eave
  span: number;            // Horizontal span
  rafter: number;          // Rafter length
  ridgeLength: number;     // Ridge line length
  roofArea: number;        // Total roof surface area
  projectedArea: number;   // Projected horizontal area
}

export interface RoofPitchConfiguration {
  units: 'degrees' | 'ratio' | 'percent';
  precision: number;       // Decimal places for calculations
  minPitch: number;        // Minimum allowable pitch (degrees)
  maxPitch: number;        // Maximum allowable pitch (degrees)
  standardPitches: number[]; // Common pitch angles
}

/**
 * Main Roof Pitch Calculation System
 */
export class RoofPitchCalculator {
  private config: RoofPitchConfiguration;

  // Standard roof pitches in degrees
  private static readonly STANDARD_PITCHES = [
    0,    // Flat
    2.86, // 1:12 (1/12 slope)
    4.76, // 2:12
    7.13, // 3:12
    9.46, // 4:12
    11.77, // 5:12
    14.04, // 6:12
    16.26, // 7:12
    18.43, // 8:12
    20.56, // 9:12
    22.62, // 10:12
    24.62, // 11:12
    26.57, // 12:12 (45°)
    30,    // Steep
    35,    // Very steep
    45     // Maximum practical
  ];

  constructor(config: Partial<RoofPitchConfiguration> = {}) {
    this.config = {
      units: 'degrees',
      precision: 2,
      minPitch: 0,
      maxPitch: 60,
      standardPitches: RoofPitchCalculator.STANDARD_PITCHES,
      ...config
    };
  }

  /**
   * Calculate pitch from rise and run
   */
  public calculatePitchFromRiseRun(rise: number, run: number): RoofPitchData {
    if (run === 0) {
      throw new Error('Run cannot be zero');
    }

    const slope = rise / run;
    const pitch = Math.atan(slope) * (180 / Math.PI);

    return this.createPitchData(pitch, rise, run);
  }

  /**
   * Calculate pitch from two points
   */
  public calculatePitchFromPoints(point1: Point2D, point2: Point2D, height1: number, height2: number): RoofPitchData {
    const horizontalDistance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
    const verticalDistance = Math.abs(height2 - height1);

    return this.calculatePitchFromRiseRun(verticalDistance, horizontalDistance);
  }

  /**
   * Calculate pitch from roof geometry
   */
  public calculatePitchFromRoof(roof: Roof2D): RoofPitchData[] {
    const roofPoints = this.getRoofPoints(roof);
    const pitches: RoofPitchData[] = [];

    // Calculate pitch for each roof segment
    for (let i = 0; i < roofPoints.length - 1; i++) {
      const point1 = roofPoints[i];
      const point2 = roofPoints[i + 1];

      // Get heights from metadata or use default calculation
      const height1 = this.getRoofHeightAtPoint(roof, point1);
      const height2 = this.getRoofHeightAtPoint(roof, point2);

      try {
        const pitch = this.calculatePitchFromPoints(point1, point2, height1, height2);
        pitches.push(pitch);
      } catch (error) {
        console.warn(`Could not calculate pitch for roof segment ${i}:`, error);
      }
    }

    return pitches;
  }

  /**
   * Calculate roof geometry from pitch and span
   */
  public calculateRoofGeometry(span: number, pitch: number, eaveHeight: number = 0): RoofGeometry {
    const pitchRadians = pitch * (Math.PI / 180);
    const rise = (span / 2) * Math.tan(pitchRadians);
    const rafter = (span / 2) / Math.cos(pitchRadians);
    const ridgeHeight = eaveHeight + rise;

    // Calculate areas
    const roofArea = span * rafter * 2; // Both sides
    const projectedArea = span * span; // Horizontal projection

    return {
      ridgeHeight,
      eaveHeight,
      span,
      rafter,
      ridgeLength: span, // Simplified - would depend on roof type
      roofArea,
      projectedArea
    };
  }

  /**
   * Find optimal pitch for given constraints
   */
  public findOptimalPitch(
    span: number,
    maxHeight: number,
    minHeight: number = 0,
    preferredCategory: RoofPitchCategory = 'conventional'
  ): RoofPitchData {
    const maxPitch = Math.atan((maxHeight - minHeight) / (span / 2)) * (180 / Math.PI);
    const minPitch = this.config.minPitch;

    // Get pitches in preferred category
    const categoryPitches = this.getPitchesInCategory(preferredCategory);

    // Find best pitch within constraints
    const validPitches = categoryPitches.filter(p => p >= minPitch && p <= maxPitch);

    if (validPitches.length === 0) {
      // Use maximum allowable pitch
      return this.createPitchData(Math.min(maxPitch, this.config.maxPitch), 0, 0);
    }

    // Use middle pitch from valid options
    const optimalPitch = validPitches[Math.floor(validPitches.length / 2)];
    const rise = (span / 2) * Math.tan(optimalPitch * (Math.PI / 180));

    return this.calculatePitchFromRiseRun(rise, span / 2);
  }

  /**
   * Convert pitch between different units
   */
  public convertPitch(pitch: number, fromUnit: 'degrees' | 'ratio' | 'percent', toUnit: 'degrees' | 'ratio' | 'percent'): number {
    let degrees: number;

    // Convert to degrees first
    switch (fromUnit) {
      case 'degrees':
        degrees = pitch;
        break;
      case 'ratio':
        degrees = Math.atan(pitch) * (180 / Math.PI);
        break;
      case 'percent':
        degrees = Math.atan(pitch / 100) * (180 / Math.PI);
        break;
    }

    // Convert from degrees to target unit
    switch (toUnit) {
      case 'degrees':
        return degrees;
      case 'ratio':
        return Math.tan(degrees * (Math.PI / 180));
      case 'percent':
        return Math.tan(degrees * (Math.PI / 180)) * 100;
      default:
        return degrees;
    }
  }

  /**
   * Get nearest standard pitch
   */
  public getNearestStandardPitch(pitch: number): number {
    return this.config.standardPitches.reduce((prev, curr) =>
      Math.abs(curr - pitch) < Math.abs(prev - pitch) ? curr : prev
    );
  }

  /**
   * Validate pitch value
   */
  public validatePitch(pitch: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (pitch < this.config.minPitch) {
      errors.push(`Pitch ${pitch}° is below minimum ${this.config.minPitch}°`);
    }

    if (pitch > this.config.maxPitch) {
      errors.push(`Pitch ${pitch}° exceeds maximum ${this.config.maxPitch}°`);
    }

    if (isNaN(pitch) || !isFinite(pitch)) {
      errors.push('Pitch must be a valid number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate drainage requirements based on pitch
   */
  public calculateDrainageRequirements(pitch: number, roofArea: number): {
    drainageType: 'gutters' | 'scuppers' | 'internal';
    gutterSize: number; // inches
    downspoutCount: number;
    flowRate: number; // gallons per minute
  } {
    const category = this.categorizePitch(pitch);

    // Simplified drainage calculations
    let drainageType: 'gutters' | 'scuppers' | 'internal';
    let gutterSize: number;

    switch (category) {
      case 'flat':
        drainageType = 'internal';
        gutterSize = 6;
        break;
      case 'low':
        drainageType = 'scuppers';
        gutterSize = 5;
        break;
      default:
        drainageType = 'gutters';
        gutterSize = 5;
    }

    // Calculate downspout count (1 per 600 sq ft)
    const downspoutCount = Math.ceil(roofArea / 600);

    // Calculate flow rate (simplified)
    const flowRate = roofArea * 0.623; // gallons per minute per sq ft

    return {
      drainageType,
      gutterSize,
      downspoutCount,
      flowRate
    };
  }

  /**
   * Create pitch data object
   */
  private createPitchData(pitch: number, rise: number, run: number): RoofPitchData {
    const slope = run !== 0 ? rise / run : 0;
    const pitchRatio = this.calculatePitchRatio(pitch);
    const pitchFraction = this.calculatePitchFraction(slope);
    const category = this.categorizePitch(pitch);

    return {
      pitch: this.roundToPrecision(pitch),
      slope: this.roundToPrecision(slope),
      rise: this.roundToPrecision(rise),
      run: this.roundToPrecision(run),
      pitchRatio,
      pitchFraction,
      category
    };
  }

  /**
   * Calculate traditional pitch ratio (e.g., "12:12")
   */
  private calculatePitchRatio(pitch: number): string {
    const slope = Math.tan(pitch * (Math.PI / 180));
    const rise = slope * 12; // Rise per 12 units of run
    return `${Math.round(rise)}:12`;
  }

  /**
   * Calculate pitch fraction
   */
  private calculatePitchFraction(slope: number): string {
    // Find closest simple fraction
    const fractions = [
      { decimal: 0, fraction: '0/1' },
      { decimal: 1/12, fraction: '1/12' },
      { decimal: 1/8, fraction: '1/8' },
      { decimal: 1/6, fraction: '1/6' },
      { decimal: 1/4, fraction: '1/4' },
      { decimal: 1/3, fraction: '1/3' },
      { decimal: 1/2, fraction: '1/2' },
      { decimal: 2/3, fraction: '2/3' },
      { decimal: 3/4, fraction: '3/4' },
      { decimal: 1, fraction: '1/1' },
      { decimal: 4/3, fraction: '4/3' },
      { decimal: 3/2, fraction: '3/2' },
      { decimal: 2, fraction: '2/1' }
    ];

    const closest = fractions.reduce((prev, curr) =>
      Math.abs(curr.decimal - slope) < Math.abs(prev.decimal - slope) ? curr : prev
    );

    return closest.fraction;
  }

  /**
   * Categorize pitch
   */
  private categorizePitch(pitch: number): RoofPitchCategory {
    if (pitch <= 2) return 'flat';
    if (pitch <= 10) return 'low';
    if (pitch <= 30) return 'conventional';
    if (pitch <= 45) return 'steep';
    return 'very_steep';
  }

  /**
   * Get pitches in category
   */
  private getPitchesInCategory(category: RoofPitchCategory): number[] {
    switch (category) {
      case 'flat':
        return this.config.standardPitches.filter(p => p <= 2);
      case 'low':
        return this.config.standardPitches.filter(p => p > 2 && p <= 10);
      case 'conventional':
        return this.config.standardPitches.filter(p => p > 10 && p <= 30);
      case 'steep':
        return this.config.standardPitches.filter(p => p > 30 && p <= 45);
      case 'very_steep':
        return this.config.standardPitches.filter(p => p > 45);
      default:
        return this.config.standardPitches;
    }
  }

  /**
   * Get roof points from roof data
   */
  private getRoofPoints(roof: Roof2D): Point2D[] {
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
   * Get roof height at specific point
   */
  private getRoofHeightAtPoint(roof: Roof2D, point: Point2D): number {
    // Simplified - in reality would calculate based on roof type and pitch
    const baseHeight = roof.metadata?.baseHeight as number || 0;
    const roofHeight = roof.metadata?.height as number || roof.dimensions.height || 3;

    // For now, assume linear interpolation from center
    const center = roof.transform.position;
    const distanceFromCenter = Math.sqrt(
      Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
    );

    // Simple height calculation - would be more complex for different roof types
    return baseHeight + roofHeight * (1 - distanceFromCenter / (roof.dimensions.width / 2));
  }

  /**
   * Round to configured precision
   */
  private roundToPrecision(value: number): number {
    const factor = Math.pow(10, this.config.precision);
    return Math.round(value * factor) / factor;
  }

  /**
   * Update configuration
   */
  public updateConfiguration(config: Partial<RoofPitchConfiguration>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): RoofPitchConfiguration {
    return { ...this.config };
  }
}

/**
 * Utility functions for roof pitch calculations
 */
export class RoofPitchUtils {
  /**
   * Convert degrees to traditional roof pitch notation
   */
  static degreesToPitchNotation(degrees: number): string {
    const slope = Math.tan(degrees * (Math.PI / 180));
    const rise = Math.round(slope * 12);
    return `${rise}/12`;
  }

  /**
   * Convert traditional pitch notation to degrees
   */
  static pitchNotationToDegrees(notation: string): number {
    const [rise, run] = notation.split('/').map(Number);
    if (run === 0) return 0;
    return Math.atan(rise / run) * (180 / Math.PI);
  }

  /**
   * Calculate rafter length
   */
  static calculateRafterLength(span: number, pitch: number): number {
    const pitchRadians = pitch * (Math.PI / 180);
    return (span / 2) / Math.cos(pitchRadians);
  }

  /**
   * Calculate roof area
   */
  static calculateRoofArea(span: number, length: number, pitch: number): number {
    const rafterLength = this.calculateRafterLength(span, pitch);
    return rafterLength * length * 2; // Both sides
  }

  /**
   * Get recommended pitch for roof type
   */
  static getRecommendedPitch(roofType: string): { min: number; max: number; optimal: number } {
    const recommendations: Record<string, { min: number; max: number; optimal: number }> = {
      'gable': { min: 15, max: 45, optimal: 30 },
      'hip': { min: 20, max: 40, optimal: 30 },
      'shed': { min: 10, max: 30, optimal: 20 },
      'flat': { min: 0, max: 5, optimal: 2 },
      'gambrel': { min: 25, max: 60, optimal: 45 },
      'mansard': { min: 30, max: 70, optimal: 50 },
      'butterfly': { min: 5, max: 25, optimal: 15 },
      'saltbox': { min: 20, max: 45, optimal: 35 },
      'monitor': { min: 15, max: 40, optimal: 25 },
      'sawtooth': { min: 20, max: 45, optimal: 30 },
      'shed-dormer': { min: 25, max: 45, optimal: 35 }
    };

    return recommendations[roofType] || { min: 15, max: 45, optimal: 30 };
  }

  /**
   * Validate pitch for building codes
   */
  static validateForBuildingCodes(pitch: number, roofType: string, climate: 'snow' | 'rain' | 'dry'): {
    compliant: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Snow load considerations
    if (climate === 'snow' && pitch < 30) {
      warnings.push('Low pitch may cause snow load issues');
      recommendations.push('Consider increasing pitch to 30° or higher for snow shedding');
    }

    // Drainage considerations
    if (pitch < 2 && roofType !== 'flat') {
      warnings.push('Pitch too low for effective drainage');
      recommendations.push('Minimum 2° pitch required for drainage');
    }

    // Wind considerations
    if (pitch > 45) {
      warnings.push('High pitch may increase wind load');
      recommendations.push('Consider structural reinforcement for high-pitch roofs');
    }

    return {
      compliant: warnings.length === 0,
      warnings,
      recommendations
    };
  }
}

export default RoofPitchCalculator;
