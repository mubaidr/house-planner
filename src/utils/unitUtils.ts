import { UnitSystem } from '@/stores/unitStore';

// Conversion factors
const CONVERSION = {
  LENGTH: {
    METRIC_TO_IMPERIAL: 3.28084, // meters to feet
    IMPERIAL_TO_METRIC: 0.3048, // feet to meters
  },
  AREA: {
    METRIC_TO_IMPERIAL: 10.7639, // square meters to square feet
    IMPERIAL_TO_METRIC: 0.092903, // square feet to square meters
  },
};

// Convert length between unit systems
export function convertLength(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return from === 'metric'
    ? value * CONVERSION.LENGTH.METRIC_TO_IMPERIAL
    : value * CONVERSION.LENGTH.IMPERIAL_TO_METRIC;
}

// Convert area between unit systems
export function convertArea(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return from === 'metric'
    ? value * CONVERSION.AREA.METRIC_TO_IMPERIAL
    : value * CONVERSION.AREA.IMPERIAL_TO_METRIC;
}

// Format length for display
export function formatLength(
  value: number,
  unitSystem: UnitSystem,
  precision: number = 2,
  showLabel: boolean = true,
  format: 'decimal' | 'fractional' = 'decimal'
): string {
  if (unitSystem === 'metric') {
    return `${value.toFixed(precision)}${showLabel ? ' m' : ''}`;
  } else {
    if (format === 'decimal') {
      return `${value.toFixed(precision)}${showLabel ? ' ft' : ''}`;
    } else {
      // Convert to fractional format (e.g., 5' 6 1/2")
      const feet = Math.floor(value);
      const inches = (value - feet) * 12;
      let wholeInches = Math.floor(inches); // changed to let
      const fraction = inches - wholeInches;

      let fractionString = '';
      if (fraction > 0) {
        // Convert to nearest 1/16th
        const denominator = 16;
        const numerator = Math.round(fraction * denominator);
        if (numerator === denominator) {
          wholeInches += 1;
        } else if (numerator > 0) {
          fractionString = ` ${numerator}/${denominator}"`;
        }
      }

      return `${feet}'${wholeInches > 0 ? ` ${wholeInches}` : ''}${fractionString}`;
    }
  }
}

// Format area for display
export function formatArea(
  value: number,
  unitSystem: UnitSystem,
  precision: number = 2,
  showLabel: boolean = true
): string {
  if (unitSystem === 'metric') {
    return `${value.toFixed(precision)}${showLabel ? ' m²' : ''}`;
  } else {
    return `${value.toFixed(precision)}${showLabel ? ' ft²' : ''}`;
  }
}

// Parse a length input string to a number value
export function parseLength(
  input: string,
  unitSystem: UnitSystem
): number | null {
  if (!input) return null;

  // For metric, simple parsing
  if (unitSystem === 'metric') {
    // Handle comma as decimal separator (European format)
    let cleanInput = input.replace(/[^\d.,-]/g, '');
    if (cleanInput.includes(',')) {
      cleanInput = cleanInput.replace(',', '.');
    }
    const value = parseFloat(cleanInput);
    return isNaN(value) ? null : value;
  }

  // For imperial, handle feet and inches notation
  if (input.includes("'")) {
    // Format like 5' 6" or 5'6"
    const parts = input.split("'");
    const feet = parseFloat(parts[0].replace(/[^\d.-]/g, ''));

    if (isNaN(feet)) return null;

    if (parts.length > 1 && parts[1].trim()) {
      const inchPart = parts[1].replace('"', '').trim();

      // Handle fractions like 6 1/2"
      if (inchPart.includes('/')) {
        const inchParts = inchPart.split(' ');
        let inches = 0;

        if (inchParts[0] && !isNaN(parseFloat(inchParts[0]))) {
          inches += parseFloat(inchParts[0]);
        }

        if (inchParts.length > 1 && inchParts[1].includes('/')) {
          const fractionParts = inchParts[1].split('/');
          if (fractionParts.length === 2) {
            const numerator = parseFloat(fractionParts[0]);
            const denominator = parseFloat(fractionParts[1]);
            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
              inches += numerator / denominator;
            }
          }
        }

        return feet + (inches / 12);
      } else {
        // Simple inches
        const inches = parseFloat(inchPart);
        return isNaN(inches) ? feet : feet + (inches / 12);
      }
    }

    return feet;
  }

  // Just a simple number
  const value = parseFloat(input.replace(/[^\d.-]/g, ''));
  return isNaN(value) ? null : value;
}
