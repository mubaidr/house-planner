# Unit System Implementation

This document describes the unit system implementation in the 2D House Planner application.

## Overview

The unit system allows users to switch between metric (meters) and imperial (feet) units for all measurements in the application. The implementation includes:

1. A unit store for managing unit preferences
2. Utility functions for converting and formatting measurements
3. UI components for selecting and configuring units
4. Integration with measurement tools and property panels

## Unit Store

The unit store (`unitStore.ts`) manages the following preferences:

- `unitSystem`: 'metric' or 'imperial'
- `precision`: Number of decimal places to display (0-6)
- `showUnitLabels`: Whether to show unit labels (m, ft, etc.)
- `displayFormat`: 'decimal' or 'fractional' (for imperial units)

These preferences are persisted between sessions using Zustand's persist middleware.

## Utility Functions

The unit utilities (`unitUtils.ts`) provide the following functions:

- `convertLength`: Converts length measurements between unit systems
- `convertArea`: Converts area measurements between unit systems
- `formatLength`: Formats length measurements for display
- `formatArea`: Formats area measurements for display
- `parseLength`: Parses length input strings to numeric values

## UI Components

### Unit Selector in Status Bar

The status bar includes a unit selector dropdown that allows users to switch between metric and imperial units, as well as toggle unit labels.

### Unit Settings Panel

The unit settings panel (`UnitSettings.tsx`) provides more detailed configuration options:

- Unit system selection (metric/imperial)
- Display precision (decimal places)
- Imperial format (decimal or fractional)
- Unit label toggle

## Integration Points

The unit system is integrated with the following components:

1. **Status Bar**: Displays coordinates in the selected unit system
2. **Measurement Display**: Shows measurements in the selected unit system
3. **Properties Panel**: Displays element dimensions in the selected unit system
4. **Measurement Tools**: Calculates and displays measurements in the selected unit system

## Conversion Factors

The following conversion factors are used:

- Length: 1 meter = 3.28084 feet
- Area: 1 square meter = 10.7639 square feet

## Scale Factor

The application uses a scale factor of 100 pixels = 1 meter for internal calculations. This means:

- 100px in the application = 1m in metric units
- 100px in the application = 3.28084ft in imperial units

## Usage Examples

### Converting Measurements

```typescript
import { convertLength } from '@/utils/unitUtils';

// Convert 5 meters to feet
const lengthInFeet = convertLength(5, 'metric', 'imperial');
// Result: 16.4042 feet
```

### Formatting Measurements

```typescript
import { formatLength } from '@/utils/unitUtils';

// Format 5 meters with 2 decimal places and unit label
const formattedLength = formatLength(5, 'metric', 2, true);
// Result: "5.00 m"

// Format 5 feet in fractional format
const formattedImperial = formatLength(5.5, 'imperial', 2, true, 'fractional');
// Result: "5' 6"
```

### Parsing User Input

```typescript
import { parseLength } from '@/utils/unitUtils';

// Parse metric input
const metricValue = parseLength('5.5m', 'metric');
// Result: 5.5

// Parse imperial input in feet and inches
const imperialValue = parseLength("5' 6\"", 'imperial');
// Result: 5.5
```

## Testing

Unit tests for the unit system are available in `__tests__/unitUtils.test.ts`. These tests verify the correctness of conversion, formatting, and parsing functions.