# Development Guide - 2D House Planner

## Quick Start for Developers

### Environment Setup
```bash
# Clone and setup
git clone <repository>
cd home-planner
npm install

# Start development
npm run dev
# Open http://localhost:3000
```

### Development Workflow
```bash
# Code quality checks
npm run lint          # Check for linting errors
npm run test          # Run test suite
npm run test:coverage # Generate coverage report
npm run build         # Test production build
```

## Current Development Status

### Completed (80% of project)
- ✅ **Core Architecture**: 2D-only view system with 5 view types
- ✅ **Advanced Rendering**: Multi-view rendering with material patterns
- ✅ **Element Systems**: Wall joining, roof integration, opening placement
- ✅ **Dimension System**: Professional annotation and measurement tools

### In Progress (Phase 5)
- 🔄 **Export Enhancement**: Multi-view export, batch processing, real-time preview

### Code Quality Issues to Address
- **47 ESLint errors** requiring fixes
- **Console.log statements** in production code
- **TODO comments** scattered throughout
- **Unused variables** in export components

## Architecture Overview

### State Management (Zustand)
```typescript
// Core stores
designStore.ts      // Elements (walls, doors, windows, stairs, roofs, rooms)
viewStore.ts        // 2D view management (plan, elevations)
materialStore.ts    // Material library and application
templateStore.ts    // Design templates
floorStore.ts       // Multi-floor support
historyStore.ts     // Undo/redo functionality
uiStore.ts          // UI state
```

### Component Structure
```
components/
├── Canvas/          # Konva.js rendering system
│   ├── elements/    # Wall, Door, Window, Stair, Roof components
│   └── renderers/   # View-specific rendering (Plan, Elevation)
├── Toolbar/         # Tool controls and measurement
├── Properties/      # Element property panels
├── Materials/       # Material library and editor
├── Export/          # Export/import functionality
└── Annotations/     # Dimension and annotation system
```

### Key Utilities
```typescript
// Core utilities
viewProjection.ts        // 3D to 2D mathematical projections
wallJoining2D.ts         // Advanced wall joining (7 joint types)
roofWallIntegration2D.ts // Roof-wall connections (7 types)
dimensionManager2D.ts    // Professional dimension system
exportUtils2D.ts         // Export functionality
materialRenderer2D.ts    // Material pattern rendering (25+ patterns)
```

## Development Priorities

### Immediate Tasks
1. **Fix ESLint Issues** (47 errors)
   - Remove unused variables in export components
   - Clean up console.log statements
   - Fix TypeScript any types
   - Remove unused imports

2. **Complete Phase 5** (Export System)
   - Multi-view export implementation
   - Real-time export preview
   - Batch export functionality
   - Export quality testing

3. **Add Test Coverage**
   - Component testing
   - Integration testing
   - Utility function testing
   - Current coverage: ~15%

### Code Quality Standards
```typescript
// TypeScript strict mode
"strict": true
"noEmit": true

// ESLint rules
- No console.log in production
- No unused variables
- No explicit any types
- Proper error handling
```

### Testing Strategy
```bash
# Current test setup
Jest + jsdom + ts-jest
Coverage: text, lcov, html
Timeout: 10s
Transform: TypeScript files
```

## Key Features Deep Dive

### 1. Multi-View System
- **Plan View**: Top-down floor layout
- **Elevation Views**: Front, Back, Left, Right
- **Projection Math**: 3D to 2D mathematical accuracy
- **Seamless Switching**: Instant view transitions with history

### 2. Advanced Wall System
- **7 Joint Types**: Butt, Miter, T-joint, Cross, L-joint, Corner, Custom
- **Visual Indicators**: Real-time joint visualization
- **Automatic Joining**: Intelligent wall connection detection
- **Opening Integration**: Door/window placement validation

### 3. Material System
- **25+ Patterns**: Comprehensive material visualization
- **Drag & Drop**: Intuitive material application
- **Library Management**: Custom material creation
- **View Consistency**: Materials render correctly in all views

### 4. Export System
- **Multiple Formats**: PNG, PDF, SVG
- **Drawing Sheets**: Professional layout system
- **Batch Export**: Multi-view export capabilities
- **High Quality**: Vector and raster output

## Performance Considerations

### Canvas Optimization
- **Konva.js**: Hardware-accelerated 2D rendering
- **Layer Management**: Efficient layer organization
- **Event Handling**: Optimized mouse/touch interactions
- **Memory Management**: Proper cleanup and disposal

### State Management
- **Zustand**: Lightweight state management
- **Selective Updates**: Minimal re-renders
- **History Management**: Efficient undo/redo system
- **Floor Isolation**: Per-floor element management

## Debugging & Development Tools

### Browser DevTools
- React Developer Tools
- Konva Inspector (for canvas debugging)
- Performance profiler for canvas operations

### Logging Strategy
```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}

// Production error handling
try {
  // operation
} catch (error) {
  // Proper error handling without console.log
}
```

### Common Development Issues

1. **Canvas Rendering**: Check Konva stage registration
2. **View Switching**: Verify projection calculations
3. **Material Application**: Ensure proper material ID mapping
4. **Export Issues**: Check canvas-to-image conversion
5. **Performance**: Monitor layer count and event listeners

## Next Steps for Contributors

1. **Start with Code Quality**: Fix ESLint errors first
2. **Focus on Phase 5**: Complete export system
3. **Add Tests**: Improve test coverage
4. **Performance**: Optimize canvas operations
5. **Documentation**: Update inline documentation

## Useful Commands

```bash
# Development
npm run dev --turbopack    # Fast development with Turbopack
npm run lint -- --fix     # Auto-fix linting issues
npm run test -- --watch   # Watch mode testing

# Analysis
npm run build -- --analyze # Bundle analysis
npm run test:coverage      # Coverage report
```

This development guide should help new contributors understand the project structure and current development priorities.