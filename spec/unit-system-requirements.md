# Unit System Requirements: 2D House Planner

This document outlines the requirements for implementing a comprehensive unit system in the 2D House Planner application, supporting both metric and imperial units.

## 1. Unit Store Implementation

### Requirements

- Create a `unitStore.ts` to manage unit preferences
- Support switching between metric and imperial units
- Store user preferences persistently
- Provide conversion utilities for all measurement types
- Support real-time unit conversion in the UI

### Implementation Details

```typescript
// Example structure for unitStore.ts
export type UnitSystem = 'metric' | 'imperial';

export interface UnitState {
  unitSystem: UnitSystem;
  precision: number; // Number of decimal places to display
  showUnitLabels: boolean; // Whether to show unit labels (m, ft, etc.)
  displayFormat: 'decimal' | 'fractional'; // For imperial units
}

export interface UnitActions {
  setUnitSystem: (system: UnitSystem) => void;
  setPrecision: (precision: number) => void;
  toggleUnitLabels: () => void;
  setDisplayFormat: (format: 'decimal' | 'fractional') => void;
  
  // Conversion utilities
  convertLength: (value: number, from: UnitSystem, to: UnitSystem) => number;
  convertArea: (value: number, from: UnitSystem, to: UnitSystem) => number;
  convertVolume: (value: number, from: UnitSystem, to: UnitSystem) => number;
  
  // Formatting utilities
  formatLength: (value: number, unitSystem?: UnitSystem) => string;
  formatArea: (value: number, unitSystem?: UnitSystem) => string;
  formatVolume: (value: number, unitSystem?: UnitSystem) => string;
}
```

## 2. Unit Conversion Utilities

### Requirements

- Create a `unitUtils.ts` file with conversion functions
- Support conversion between metric and imperial units
- Handle all measurement types used in the application
- Ensure high precision in conversions
- Support formatting measurements for display

### Implementation Details

```typescript
// Example conversion factors
const CONVERSION_FACTORS = {
  LENGTH: {
    METRIC_TO_IMPERIAL: 3.28084, // meters to feet
    IMPERIAL_TO_METRIC: 0.3048, // feet to meters
  },
  AREA: {
    METRIC_TO_IMPERIAL: 10.7639, // square meters to square feet
    IMPERIAL_TO_METRIC: 0.092903, // square feet to square meters
  },
  VOLUME: {
    METRIC_TO_IMPERIAL: 35.3147, // cubic meters to cubic feet
    IMPERIAL_TO_METRIC: 0.0283168, // cubic feet to cubic meters
  },
};

// Example conversion functions
export function convertLength(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return from === 'metric'
    ? value * CONVERSION_FACTORS.LENGTH.METRIC_TO_IMPERIAL
    : value * CONVERSION_FACTORS.LENGTH.IMPERIAL_TO_METRIC;
}

// Example formatting functions
export function formatLength(value: number, unitSystem: UnitSystem, precision: number, showLabel: boolean, format: 'decimal' | 'fractional'): string {
  const convertedValue = unitSystem === 'metric' ? value : convertLength(value, 'metric', 'imperial');
  
  if (unitSystem === 'metric') {
    return `${convertedValue.toFixed(precision)}${showLabel ? ' m' : ''}`;
  } else {
    if (format === 'decimal') {
      return `${convertedValue.toFixed(precision)}${showLabel ? ' ft' : ''}`;
    } else {
      // Convert to fractional format (e.g., 5' 6 1/2")
      const feet = Math.floor(convertedValue);
      const inches = (convertedValue - feet) * 12;
      const wholeInches = Math.floor(inches);
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
```

## 3. UI Components for Unit Selection

### Requirements

- Add unit system selection to the status bar
- Create a unit settings panel in the application settings
- Provide visual indication of the current unit system
- Allow quick toggling between unit systems
- Support customizing display precision and format

### Implementation Details

- Add unit selector dropdown in the status bar
- Create a dedicated section in settings for unit preferences
- Add keyboard shortcuts for toggling unit systems
- Implement unit display format options (decimal vs. fractional for imperial)
- Add precision control for displayed measurements

## 4. Integration with Measurement Tools

### Requirements

- Update measurement tools to use the selected unit system
- Display measurements in the appropriate units
- Allow entering measurements in either unit system
- Update grid system to use appropriate unit spacing
- Ensure snapping works correctly with different unit systems

### Implementation Details

- Modify `MeasurementDisplay.tsx` to use unit conversion
- Update `MeasurementControls.tsx` to show units
- Modify input fields to accept values in either unit system
- Update grid sizing based on unit system
- Adjust snapping thresholds for different unit systems

## 5. Integration with Element Properties

### Requirements

- Display element dimensions in the selected unit system
- Allow entering dimensions in either unit system
- Update property panels to show appropriate units
- Ensure material calculations work with different unit systems
- Update room area calculations to use the correct units

### Implementation Details

- Modify property panels to display converted units
- Update input fields to accept and convert values
- Add unit labels to dimension inputs
- Update area and volume calculations to handle unit conversion
- Ensure material quantity calculations account for unit system

## 6. Export and Import Support

### Requirements

- Include unit system information in exported files
- Allow specifying units for export (regardless of current system)
- Display units on exported drawings
- Maintain unit consistency when importing designs
- Support unit conversion during import/export

### Implementation Details

- Add unit system metadata to export formats
- Update export dialogs to include unit options
- Modify dimension rendering for exports to show units
- Add unit conversion during import process
- Ensure PDF exports show correct units

## 7. Documentation and Help

### Requirements

- Document unit system functionality in user guide
- Add tooltips explaining unit conversion
- Provide examples of unit input formats
- Include unit system information in measurement tooltips
- Document keyboard shortcuts for unit operations

### Implementation Details

- Update user documentation with unit system information
- Add contextual help for unit input fields
- Create examples of valid input formats
- Add unit information to measurement tooltips
- Document keyboard shortcuts for unit operations

## 8. Implementation Checklist

- [ ] Create `unitStore.ts`
- [ ] Implement `unitUtils.ts` with conversion functions
- [ ] Add unit selector to status bar
- [ ] Update measurement tools to use unit conversion
- [ ] Modify property panels to display correct units
- [ ] Update grid system to work with different units
- [ ] Add unit options to export functionality
- [ ] Update documentation with unit system information
- [ ] Test all functionality with both unit systems