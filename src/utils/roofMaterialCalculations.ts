/**
 * Roof Material Calculations for Advanced Roof Types
 *
 * This module provides comprehensive material quantity calculations
 * for different roof types including gambrel and mansard roofs.
 */

import { Roof } from '@/types/elements/Roof';
import { Roof2D } from '@/types/elements2D';

export interface RoofMaterialQuantities {
  // Primary roofing materials
  roofingArea: number;           // Total roof surface area (sq ft/m)
  roofingMaterial: number;       // Roofing material quantity with waste factor
  underlayment: number;          // Underlayment area

  // Structural materials
  rafterLength: number;          // Total rafter length needed
  ridgeLength: number;           // Ridge beam length
  hipLength?: number;            // Hip beam length (for hip roofs)
  valleyLength?: number;         // Valley length (for complex roofs)

  // Trim and finishing
  fascia: number;                // Fascia board length
  soffit: number;                // Soffit area
  gutterLength: number;          // Gutter length needed
  downspouts: number;            // Number of downspouts

  // Hardware and accessories
  nails: number;                 // Roofing nails (lbs)
  screws: number;                // Screws for metal roofing (count)
  flashing: number;              // Flashing length (linear ft/m)
  ventilation: number;           // Vent count needed

  // Cost estimates
  materialCost: number;          // Total material cost
  laborCost: number;             // Estimated labor cost
  totalCost: number;             // Total project cost

  // Waste factors applied
  wasteFactor: number;           // Waste percentage used
  complexityFactor: number;      // Complexity multiplier
}

export interface RoofCalculationOptions {
  units: 'imperial' | 'metric';
  wasteFactor: number;           // Default waste percentage (10-15%)
  includeLabor: boolean;         // Include labor cost estimates
  materialType: 'asphalt' | 'metal' | 'tile' | 'slate' | 'wood' | 'membrane';
  climate: 'temperate' | 'cold' | 'hot' | 'coastal';
  complexity: 'simple' | 'moderate' | 'complex';
}

export class RoofMaterialCalculator {
  private options: RoofCalculationOptions;

  // Material coverage rates (sq ft per unit)
  private static readonly COVERAGE_RATES = {
    asphalt: {
      shingles: 33.3,      // sq ft per bundle
      underlayment: 400,    // sq ft per roll
      nailsPerSqFt: 0.02,  // lbs per sq ft
    },
    metal: {
      panels: 100,         // sq ft per panel
      screws: 80,          // screws per 100 sq ft
      underlayment: 400,
    },
    tile: {
      tiles: 1,            // sq ft per tile
      underlayment: 400,
      nailsPerSqFt: 0.03,
    },
    slate: {
      slates: 1,           // sq ft per slate
      underlayment: 400,
      nailsPerSqFt: 0.04,
    },
    wood: {
      shingles: 25,        // sq ft per bundle
      underlayment: 400,
      nailsPerSqFt: 0.025,
    },
    membrane: {
      rolls: 100,          // sq ft per roll
      adhesive: 300,       // sq ft per gallon
    }
  };

  // Cost estimates per sq ft (USD)
  private static readonly MATERIAL_COSTS = {
    asphalt: { material: 3.50, labor: 2.50 },
    metal: { material: 8.00, labor: 4.00 },
    tile: { material: 12.00, labor: 6.00 },
    slate: { material: 18.00, labor: 8.00 },
    wood: { material: 6.00, labor: 4.50 },
    membrane: { material: 5.00, labor: 3.00 }
  };

  constructor(options: Partial<RoofCalculationOptions> = {}) {
    this.options = {
      units: 'imperial',
      wasteFactor: 0.15,
      includeLabor: true,
      materialType: 'asphalt',
      climate: 'temperate',
      complexity: 'moderate',
      ...options
    };
  }

  /**
   * Calculate material quantities for a roof
   */
  public calculateMaterials(roof: Roof | Roof2D): RoofMaterialQuantities {
    const roofData = this.normalizeRoofData(roof);
    const baseArea = this.calculateBaseRoofArea(roofData);
    const actualArea = this.calculateActualRoofArea(roofData, baseArea);

    // Apply complexity and waste factors
    const complexityFactor = this.getComplexityFactor(roofData.type);
    const wasteFactor = this.options.wasteFactor;
    const adjustedArea = actualArea * (1 + wasteFactor) * complexityFactor;

    // Calculate structural elements
    const structural = this.calculateStructuralMaterials(roofData);

    // Calculate roofing materials
    const roofingMaterials = this.calculateRoofingMaterials(adjustedArea);

    // Calculate trim and accessories
    const trimMaterials = this.calculateTrimMaterials(roofData);

    // Calculate costs
    const costs = this.calculateCosts(adjustedArea);

    return {
      roofingArea: actualArea,
      roofingMaterial: roofingMaterials.quantity,
      underlayment: roofingMaterials.underlayment,

      rafterLength: structural.rafterLength,
      ridgeLength: structural.ridgeLength,
      hipLength: structural.hipLength,
      valleyLength: structural.valleyLength,

      fascia: trimMaterials.fascia,
      soffit: trimMaterials.soffit,
      gutterLength: trimMaterials.gutterLength,
      downspouts: trimMaterials.downspouts,

      nails: roofingMaterials.nails,
      screws: roofingMaterials.screws,
      flashing: trimMaterials.flashing,
      ventilation: trimMaterials.ventilation,

      materialCost: costs.material,
      laborCost: costs.labor,
      totalCost: costs.total,

      wasteFactor: wasteFactor,
      complexityFactor: complexityFactor
    };
  }

  /**
   * Calculate materials for gambrel roof
   */
  public calculateGambrelMaterials(roof: Roof | Roof2D): RoofMaterialQuantities {
    const roofData = this.normalizeRoofData(roof);

    // Gambrel has two different pitches
    const lowerPitch = roofData.pitch; // Main pitch
    const upperPitch = Math.min(roofData.pitch * 1.5, 60); // Steeper upper section

    // Calculate areas for both sections
    const span = roofData.width;
    const lowerRun = span * 0.6; // Lower section covers 60% of span
    const upperRun = span * 0.4; // Upper section covers 40% of span

    const lowerArea = this.calculateSectionArea(lowerRun, lowerPitch, roofData.length);
    const upperArea = this.calculateSectionArea(upperRun, upperPitch, roofData.length);

    const totalArea = (lowerArea + upperArea) * 2; // Both sides

    // Apply gambrel complexity factor
    const complexityFactor = 1.25; // Gambrel roofs are more complex
    const wasteFactor = this.options.wasteFactor + 0.05; // Extra waste for cuts
    const adjustedArea = totalArea * (1 + wasteFactor) * complexityFactor;

    // Calculate structural materials specific to gambrel
    const structural = this.calculateGambrelStructural(roofData, lowerRun, upperRun);

    // Calculate roofing materials
    const roofingMaterials = this.calculateRoofingMaterials(adjustedArea);

    // Calculate trim materials
    const trimMaterials = this.calculateTrimMaterials(roofData);

    // Calculate costs with complexity premium
    const costs = this.calculateCosts(adjustedArea, 1.15); // 15% premium for complexity

    return {
      roofingArea: totalArea,
      roofingMaterial: roofingMaterials.quantity,
      underlayment: roofingMaterials.underlayment,

      rafterLength: structural.rafterLength,
      ridgeLength: structural.ridgeLength,
      hipLength: structural.hipLength,
      valleyLength: structural.valleyLength,

      fascia: trimMaterials.fascia,
      soffit: trimMaterials.soffit,
      gutterLength: trimMaterials.gutterLength,
      downspouts: trimMaterials.downspouts,

      nails: roofingMaterials.nails,
      screws: roofingMaterials.screws,
      flashing: trimMaterials.flashing + roofData.length * 2, // Extra flashing for break line
      ventilation: trimMaterials.ventilation,

      materialCost: costs.material,
      laborCost: costs.labor,
      totalCost: costs.total,

      wasteFactor: wasteFactor,
      complexityFactor: complexityFactor
    };
  }

  /**
   * Calculate materials for mansard roof
   */
  public calculateMansardMaterials(roof: Roof | Roof2D): RoofMaterialQuantities {
    const roofData = this.normalizeRoofData(roof);

    // Mansard has steep lower section and flatter upper section
    const _lowerPitch = Math.max(roofData.pitch, 60); // Steep lower section
    const upperPitch = Math.min(roofData.pitch * 0.3, 15); // Flat upper section

    // Calculate areas for mansard sections using both pitches
    const span = roofData.width;
    const lowerHeight = span * 0.3; // Lower section height
    const _lowerSlopeLength = (span * 0.6) / Math.cos(_lowerPitch * Math.PI / 180);
    const _upperSlopeLength = (span * 0.4) / Math.cos(upperPitch * Math.PI / 180);
    const upperWidth = span * 0.4; // Upper flat section width

    // Lower steep sections (4 sides)
    const lowerArea = this.calculateMansardLowerArea(span, roofData.length, lowerHeight);

    // Upper flat section
    const upperArea = upperWidth * roofData.length;

    const totalArea = lowerArea + upperArea;

    // Apply mansard complexity factor
    const complexityFactor = 1.35; // Mansard roofs are very complex
    const wasteFactor = this.options.wasteFactor + 0.08; // Extra waste for complex cuts
    const adjustedArea = totalArea * (1 + wasteFactor) * complexityFactor;

    // Calculate structural materials specific to mansard
    const structural = this.calculateMansardStructural(roofData, lowerHeight, upperWidth);

    // Calculate roofing materials
    const roofingMaterials = this.calculateRoofingMaterials(adjustedArea);

    // Calculate trim materials
    const trimMaterials = this.calculateTrimMaterials(roofData);

    // Calculate costs with complexity premium
    const costs = this.calculateCosts(adjustedArea, 1.25); // 25% premium for complexity

    return {
      roofingArea: totalArea,
      roofingMaterial: roofingMaterials.quantity,
      underlayment: roofingMaterials.underlayment,

      rafterLength: structural.rafterLength,
      ridgeLength: structural.ridgeLength,
      hipLength: structural.hipLength,
      valleyLength: structural.valleyLength,

      fascia: trimMaterials.fascia,
      soffit: trimMaterials.soffit,
      gutterLength: trimMaterials.gutterLength,
      downspouts: trimMaterials.downspouts,

      nails: roofingMaterials.nails,
      screws: roofingMaterials.screws,
      flashing: trimMaterials.flashing + (roofData.width + roofData.length) * 4, // Extra flashing for transitions
      ventilation: trimMaterials.ventilation + 2, // Extra vents for complex roof

      materialCost: costs.material,
      laborCost: costs.labor,
      totalCost: costs.total,

      wasteFactor: wasteFactor,
      complexityFactor: complexityFactor
    };
  }

  /**
   * Calculate materials for complex roof types (butterfly, saltbox, monitor, sawtooth, shed-dormer)
   */
  public calculateComplexRoofMaterials(roof: Roof | Roof2D): RoofMaterialQuantities {
    const roofData = this.normalizeRoofData(roof);

    let baseArea: number;
    let complexityFactor: number;
    let extraFlashing: number = 0;
    let extraVentilation: number = 0;

    switch (roofData.type) {
      case 'butterfly':
        baseArea = this.calculateButterflyArea(roofData);
        complexityFactor = 1.4; // High complexity due to valley drainage
        extraFlashing = roofData.width * 2; // Central valley flashing
        extraVentilation = 1; // Extra ventilation for valley
        break;

      case 'saltbox':
        baseArea = this.calculateSaltboxArea(roofData);
        complexityFactor = 1.2; // Moderate complexity
        extraFlashing = roofData.length; // Ridge flashing
        break;

      case 'monitor':
        baseArea = this.calculateMonitorArea(roofData);
        complexityFactor = 1.5; // High complexity due to clerestory
        extraFlashing = (roofData.width + roofData.length) * 2; // Clerestory flashing
        extraVentilation = 2; // Extra vents for monitor section
        break;

      case 'sawtooth':
        baseArea = this.calculateSawtoothArea(roofData);
        complexityFactor = 1.6; // Very high complexity
        extraFlashing = roofData.length * 6; // Multiple valley flashings
        extraVentilation = 3; // Multiple vents needed
        break;

      case 'shed-dormer':
        baseArea = this.calculateShedDormerArea(roofData);
        complexityFactor = 1.3; // Moderate-high complexity
        extraFlashing = roofData.width * 0.8; // Dormer flashing
        extraVentilation = 1; // Dormer ventilation
        break;

      default:
        return this.calculateMaterials(roof);
    }

    // Apply complexity and waste factors
    const wasteFactor = this.options.wasteFactor + 0.05; // Extra waste for complex roofs
    const adjustedArea = baseArea * (1 + wasteFactor) * complexityFactor;

    // Calculate structural materials
    const structural = this.calculateComplexStructuralMaterials(roofData);

    // Calculate roofing materials
    const roofingMaterials = this.calculateRoofingMaterials(adjustedArea);

    // Calculate trim materials with extras
    const trimMaterials = this.calculateTrimMaterials(roofData);

    // Calculate costs with complexity premium
    const costs = this.calculateCosts(adjustedArea, complexityFactor * 0.8);

    return {
      roofingArea: baseArea,
      roofingMaterial: roofingMaterials.quantity,
      underlayment: roofingMaterials.underlayment,

      rafterLength: structural.rafterLength,
      ridgeLength: structural.ridgeLength,
      hipLength: structural.hipLength,
      valleyLength: structural.valleyLength,

      fascia: trimMaterials.fascia,
      soffit: trimMaterials.soffit,
      gutterLength: trimMaterials.gutterLength,
      downspouts: trimMaterials.downspouts,

      nails: roofingMaterials.nails,
      screws: roofingMaterials.screws,
      flashing: trimMaterials.flashing + extraFlashing,
      ventilation: trimMaterials.ventilation + extraVentilation,

      materialCost: costs.material,
      laborCost: costs.labor,
      totalCost: costs.total,

      wasteFactor: wasteFactor,
      complexityFactor: complexityFactor
    };
  }

  /**
   * Get material recommendations based on roof type and pitch
   */
  public getMaterialRecommendations(roofType: string, pitch: number, climate: string): {
    recommended: string[];
    suitable: string[];
    notRecommended: string[];
    reasons: Record<string, string>;
  } {
    const recommendations = {
      recommended: [] as string[],
      suitable: [] as string[],
      notRecommended: [] as string[],
      reasons: {} as Record<string, string>
    };

    // Pitch-based recommendations
    if (pitch < 2) {
      recommendations.recommended.push('membrane');
      recommendations.notRecommended.push('asphalt', 'tile', 'slate', 'wood');
      recommendations.reasons.membrane = 'Best for low-slope roofs';
      recommendations.reasons.asphalt = 'Not suitable for slopes under 2°';
    } else if (pitch < 15) {
      recommendations.recommended.push('metal', 'membrane');
      recommendations.suitable.push('asphalt');
      recommendations.notRecommended.push('tile', 'slate', 'wood');
      recommendations.reasons.metal = 'Excellent for low to moderate slopes';
    } else if (pitch < 45) {
      recommendations.recommended.push('asphalt', 'metal');
      recommendations.suitable.push('tile', 'wood');
      if (pitch > 30) recommendations.suitable.push('slate');
      recommendations.reasons.asphalt = 'Most versatile for moderate slopes';
    } else {
      recommendations.recommended.push('slate', 'tile', 'wood');
      recommendations.suitable.push('metal', 'asphalt');
      recommendations.reasons.slate = 'Excellent for steep roofs';
    }

    // Climate-based adjustments
    if (climate === 'cold') {
      if (!recommendations.recommended.includes('metal')) {
        recommendations.suitable.push('metal');
      }
      recommendations.reasons.metal = (recommendations.reasons.metal || '') + ' - Excellent snow shedding';
    }

    if (climate === 'coastal') {
      recommendations.notRecommended.push('wood');
      recommendations.reasons.wood = 'Not recommended for coastal environments due to salt exposure';
    }

    // Roof type specific recommendations
    if (['gambrel', 'mansard', 'butterfly', 'monitor', 'sawtooth', 'shed-dormer'].includes(roofType)) {
      recommendations.suitable = recommendations.suitable.filter(m => m !== 'membrane');
      recommendations.reasons.complexity = 'Complex roof shapes require materials that handle transitions well';
    }

    // Special recommendations for specific roof types
    if (roofType === 'butterfly') {
      recommendations.notRecommended.push('tile', 'slate');
      recommendations.reasons.butterfly = 'Valley drainage requires materials suitable for low slopes';
    }

    if (roofType === 'sawtooth' || roofType === 'monitor') {
      recommendations.recommended = recommendations.recommended.filter(m => m !== 'wood');
      if (!recommendations.recommended.includes('metal')) {
        recommendations.recommended.push('metal');
      }
      recommendations.reasons.industrial = 'Industrial roof types benefit from metal roofing for durability';
    }

    return recommendations;
  }

  // Private helper methods

  private normalizeRoofData(roof: Roof | Roof2D): any {
    if ('roofType' in roof) {
      // Roof2D
      return {
        type: roof.roofType,
        pitch: roof.pitch,
        width: roof.dimensions.width,
        length: roof.dimensions.height,
        overhang: roof.overhang,
        height: roof.ridgeHeight || 10
      };
    } else {
      // Roof
      return {
        type: roof.type,
        pitch: roof.pitch,
        width: this.calculateRoofWidth(roof.points),
        length: this.calculateRoofLength(roof.points),
        overhang: roof.overhang,
        height: roof.height
      };
    }
  }

  private calculateRoofWidth(points: Array<{ x: number; y: number }>): number {
    const xCoords = points.map(p => p.x);
    return Math.max(...xCoords) - Math.min(...xCoords);
  }

  private calculateRoofLength(points: Array<{ x: number; y: number }>): number {
    const yCoords = points.map(p => p.y);
    return Math.max(...yCoords) - Math.min(...yCoords);
  }

  private calculateBaseRoofArea(roofData: any): number {
    return roofData.width * roofData.length;
  }

  private calculateActualRoofArea(roofData: any, baseArea: number): number {
    const pitchRadians = (roofData.pitch * Math.PI) / 180;
    const pitchFactor = 1 / Math.cos(pitchRadians);

    switch (roofData.type) {
      case 'gable':
        return baseArea * pitchFactor;
      case 'hip':
        return baseArea * pitchFactor * 1.1; // Hip roofs have slightly more area
      case 'shed':
        return baseArea * pitchFactor;
      case 'flat':
        return baseArea;
      case 'gambrel':
        return this.calculateGambrelArea(roofData);
      case 'mansard':
        return this.calculateMansardArea(roofData);
      default:
        return baseArea * pitchFactor;
    }
  }

  private calculateGambrelArea(roofData: any): number {
    const span = roofData.width;
    const length = roofData.length;
    const lowerPitch = roofData.pitch;
    const upperPitch = Math.min(lowerPitch * 1.5, 60);

    const lowerRun = span * 0.6;
    const upperRun = span * 0.4;

    const lowerArea = this.calculateSectionArea(lowerRun, lowerPitch, length);
    const upperArea = this.calculateSectionArea(upperRun, upperPitch, length);

    return (lowerArea + upperArea) * 2; // Both sides
  }

  private calculateMansardArea(roofData: any): number {
    const span = roofData.width;
    const length = roofData.length;
    const lowerHeight = span * 0.3;
    const upperWidth = span * 0.4;

    // Lower steep sections (4 sides)
    const lowerArea = this.calculateMansardLowerArea(span, length, lowerHeight);

    // Upper flat section
    const upperArea = upperWidth * length;

    return lowerArea + upperArea;
  }

  private calculateSectionArea(run: number, pitch: number, length: number): number {
    const pitchRadians = (pitch * Math.PI) / 180;
    const rafterLength = run / Math.cos(pitchRadians);
    return rafterLength * length;
  }

  private calculateMansardLowerArea(span: number, length: number, height: number): number {
    // Calculate area of steep mansard sides
    const sideArea = height * length * 2; // Two long sides
    const endArea = height * span * 2;    // Two short sides
    return sideArea + endArea;
  }

  private getComplexityFactor(roofType: string): number {
    const factors: Record<string, number> = {
      'flat': 1.0,
      'shed': 1.05,
      'gable': 1.1,
      'hip': 1.15,
      'gambrel': 1.25,
      'mansard': 1.35
    };
    return factors[roofType] || 1.1;
  }

  private calculateStructuralMaterials(roofData: any) {
    const span = roofData.width;
    const length = roofData.length;
    const pitchRadians = (roofData.pitch * Math.PI) / 180;

    // Basic rafter calculation
    const rafterLength = (span / 2) / Math.cos(pitchRadians);
    const rafterCount = Math.ceil(length / 2) * 2; // 24" OC typical
    const totalRafterLength = rafterLength * rafterCount;

    return {
      rafterLength: totalRafterLength,
      ridgeLength: length,
      hipLength: roofData.type === 'hip' ? span * Math.sqrt(2) : 0,
      valleyLength: 0 // Would be calculated for complex roofs
    };
  }

  private calculateGambrelStructural(roofData: any, lowerRun: number, upperRun: number) {
    const length = roofData.length;
    const lowerPitch = roofData.pitch;
    const upperPitch = Math.min(lowerPitch * 1.5, 60);

    const lowerRafterLength = lowerRun / Math.cos((lowerPitch * Math.PI) / 180);
    const upperRafterLength = upperRun / Math.cos((upperPitch * Math.PI) / 180);

    const rafterCount = Math.ceil(length / 2) * 2;
    const totalRafterLength = (lowerRafterLength + upperRafterLength) * rafterCount;

    return {
      rafterLength: totalRafterLength,
      ridgeLength: length,
      hipLength: 0,
      valleyLength: length * 2 // Break line on both sides
    };
  }

  private calculateMansardStructural(roofData: any, lowerHeight: number, upperWidth: number) {
    const span = roofData.width;
    const length = roofData.length;

    // Simplified structural calculation for mansard
    const rafterCount = Math.ceil((span + length) * 2 / 2);
    const avgRafterLength = lowerHeight * 1.2; // Approximate

    return {
      rafterLength: avgRafterLength * rafterCount,
      ridgeLength: upperWidth + length,
      hipLength: 0,
      valleyLength: (span + length) * 2 // Transition lines
    };
  }

  private calculateRoofingMaterials(area: number) {
    const coverage = RoofMaterialCalculator.COVERAGE_RATES[this.options.materialType];

    let quantity = 0;
    let nails = 0;
    let screws = 0;
    let underlayment = 0;

    switch (this.options.materialType) {
      case 'asphalt':
        const asphaltCoverage = coverage as typeof RoofMaterialCalculator.COVERAGE_RATES.asphalt;
        quantity = Math.ceil(area / asphaltCoverage.shingles);
        nails = area * asphaltCoverage.nailsPerSqFt;
        underlayment = Math.ceil(area / asphaltCoverage.underlayment);
        break;
      case 'metal':
        const metalCoverage = coverage as typeof RoofMaterialCalculator.COVERAGE_RATES.metal;
        quantity = Math.ceil(area / metalCoverage.panels);
        screws = Math.ceil(area / 100 * metalCoverage.screws);
        underlayment = Math.ceil(area / metalCoverage.underlayment);
        break;
      case 'tile':
        const tileCoverage = coverage as typeof RoofMaterialCalculator.COVERAGE_RATES.tile;
        quantity = Math.ceil(area);
        nails = area * tileCoverage.nailsPerSqFt;
        underlayment = Math.ceil(area / tileCoverage.underlayment);
        break;
      case 'slate':
        const slateCoverage = coverage as typeof RoofMaterialCalculator.COVERAGE_RATES.slate;
        quantity = Math.ceil(area);
        nails = area * slateCoverage.nailsPerSqFt;
        underlayment = Math.ceil(area / slateCoverage.underlayment);
        break;
      case 'wood':
        const woodCoverage = coverage as typeof RoofMaterialCalculator.COVERAGE_RATES.wood;
        quantity = Math.ceil(area / woodCoverage.shingles);
        nails = area * woodCoverage.nailsPerSqFt;
        underlayment = Math.ceil(area / woodCoverage.underlayment);
        break;
      case 'membrane':
        const membraneCoverage = coverage as typeof RoofMaterialCalculator.COVERAGE_RATES.membrane;
        quantity = Math.ceil(area / membraneCoverage.rolls);
        underlayment = 0; // Membrane doesn't typically use separate underlayment
        break;
    }

    return {
      quantity,
      underlayment,
      nails,
      screws
    };
  }

  private calculateTrimMaterials(roofData: any) {
    const perimeter = (roofData.width + roofData.length) * 2;
    const area = roofData.width * roofData.length;

    return {
      fascia: perimeter,
      soffit: perimeter * roofData.overhang,
      gutterLength: perimeter,
      downspouts: Math.ceil(perimeter / 40), // One per 40 ft
      flashing: perimeter * 0.5, // Estimate
      ventilation: Math.ceil(area / 300) // One vent per 300 sq ft
    };
  }

  private calculateCosts(area: number, complexityMultiplier: number = 1) {
    const costs = RoofMaterialCalculator.MATERIAL_COSTS[this.options.materialType];

    const materialCost = area * costs.material * complexityMultiplier;
    const laborCost = this.options.includeLabor ? area * costs.labor * complexityMultiplier : 0;

    return {
      material: materialCost,
      labor: laborCost,
      total: materialCost + laborCost
    };
  }

  // Area calculation methods for new roof types
  private calculateButterflyArea(roofData: any): number {
    // Butterfly roof has two slopes meeting at a valley
    const span = roofData.width;
    const length = roofData.length;
    const pitchRadians = (roofData.pitch * Math.PI) / 180;
    const slopeLength = (span / 2) / Math.cos(pitchRadians);
    return slopeLength * length * 2; // Both slopes
  }

  private calculateSaltboxArea(roofData: any): number {
    // Saltbox has asymmetrical slopes
    const span = roofData.width;
    const length = roofData.length;
    const pitchRadians = (roofData.pitch * Math.PI) / 180;

    // Short slope (35% of span) and long slope (65% of span)
    const shortSlope = (span * 0.35) / Math.cos(pitchRadians);
    const longSlope = (span * 0.65) / Math.cos(pitchRadians);

    return (shortSlope + longSlope) * length;
  }

  private calculateMonitorArea(roofData: any): number {
    // Monitor roof has lower slopes plus raised clerestory section
    const span = roofData.width;
    const length = roofData.length;
    const pitchRadians = (roofData.pitch * Math.PI) / 180;

    // Lower roof sections (70% of total area)
    const lowerArea = span * length * 0.7 / Math.cos(pitchRadians);

    // Monitor section (30% additional area for raised section)
    const monitorArea = span * length * 0.3;

    return lowerArea + monitorArea;
  }

  private calculateSawtoothArea(roofData: any): number {
    // Sawtooth roof has multiple angled sections
    const span = roofData.width;
    const length = roofData.length;
    const pitchRadians = (roofData.pitch * Math.PI) / 180;

    // Each tooth has a sloped section and a vertical glazed section
    const numTeeth = 3; // Typical number of teeth
    const toothWidth = span / numTeeth;
    const slopeLength = (toothWidth * 0.7) / Math.cos(pitchRadians);
    const verticalArea = toothWidth * 0.3 * roofData.height;

    return (slopeLength * length + verticalArea) * numTeeth;
  }

  private calculateShedDormerArea(roofData: any): number {
    // Main gable roof plus dormer area
    const span = roofData.width;
    const length = roofData.length;
    const pitchRadians = (roofData.pitch * Math.PI) / 180;

    // Main roof area
    const mainArea = span * length / Math.cos(pitchRadians);

    // Dormer area (typically 20% additional)
    const dormerArea = span * length * 0.2;

    return mainArea + dormerArea;
  }

  private calculateComplexStructuralMaterials(roofData: any) {
    const span = roofData.width;
    const length = roofData.length;
    const pitchRadians = (roofData.pitch * Math.PI) / 180;

    // Base rafter calculation with complexity multiplier
    const baseRafterLength = (span / 2) / Math.cos(pitchRadians);
    const rafterCount = Math.ceil(length / 2) * 2; // 24" OC typical

    let multiplier = 1;
    let valleyLength = 0;

    switch (roofData.type) {
      case 'butterfly':
        multiplier = 1.2;
        valleyLength = length; // Central valley
        break;
      case 'saltbox':
        multiplier = 1.1;
        break;
      case 'monitor':
        multiplier = 1.4;
        valleyLength = length * 2; // Clerestory transitions
        break;
      case 'sawtooth':
        multiplier = 1.6;
        valleyLength = length * 3; // Multiple valleys
        break;
      case 'shed-dormer':
        multiplier = 1.3;
        valleyLength = span * 0.4; // Dormer integration
        break;
    }

    const totalRafterLength = baseRafterLength * rafterCount * multiplier;

    return {
      rafterLength: totalRafterLength,
      ridgeLength: length * multiplier,
      hipLength: 0,
      valleyLength
    };
  }
}

export default RoofMaterialCalculator;
