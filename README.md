# 2D House Planner

A sophisticated web application for 2D architectural design and house planning, built for business owners who provide client estimates for house projects.

## Overview

The 2D House Planner is a desktop-focused web application that enables users with minimal computer knowledge to create professional architectural designs. The application supports multiple 2D view perspectives (plan, front, back, left, right elevations) and includes advanced features for material assignment, dimension management, and professional export capabilities.

## Key Features

### Core Functionality
- **2D Architectural Design**: Complete house planning with walls, doors, windows, roofs, stairs, and rooms
- **Multi-View System**: Seamless switching between plan view and 4 elevation views
- **Material Library**: Comprehensive material assignment with visual patterns
- **Multi-Story Support**: Complete floor management system
- **Professional Export**: PNG, PDF, SVG export with drawing sheet layouts

### Advanced Features
- **Wall Joining System**: 7 joint types with visual indicators
- **Roof-Wall Integration**: Complex roof-wall connection system
- **Dimension Management**: Auto-generated and manual dimensions
- **Interactive Annotations**: Real-time dimension editing
- **Template System**: Save and reuse design templates
- **Undo/Redo**: Complete history management

### User Experience
- **Accessibility**: WCAG compliant design
- **Intuitive Interface**: Designed for minimal computer knowledge users
- **Desktop Optimized**: Focused desktop experience
- **Real-time Feedback**: Immediate visual feedback for all operations

## Technology Stack

- **Framework**: Next.js 15.3.5 with React 19.1.0
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 4.0
- **Canvas**: Konva.js 9.3.22 with React-Konva
- **State Management**: Zustand 5.0.6
- **Testing**: Jest 29.7.0 with jsdom
- **Build Tool**: Turbopack (Next.js)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── Canvas/         # Drawing canvas and rendering
│   ├── Layout/         # Application layout
│   ├── Toolbar/        # Tool controls
│   ├── Materials/      # Material system
│   ├── Export/         # Export functionality
│   └── ui/             # Reusable UI components
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── hooks/              # Custom React hooks
```

## Development Status

**Current Progress**: 80% Complete
- ✅ **Phase 1**: Core View System (Complete)
- ✅ **Phase 2**: View Rendering System (Complete)
- ✅ **Phase 3**: Enhanced Joining System (Complete)
- ✅ **Phase 4**: Dimension & Annotation System (Complete)
- 🔄 **Phase 5**: Export System Enhancement (In Progress)

## Documentation

- [Project Requirements](docs/requirements.md)
- [Implementation Plan](docs/llm/implementation_plan.md)
- [Task Management](docs/llm/task_management.md)
- [Project Analysis](docs/PROJECT_ANALYSIS.md)

## Contributing

This project follows modern React and TypeScript best practices:
- Strict TypeScript configuration
- ESLint for code quality
- Jest for testing
- Component-based architecture
- Zustand for state management

## License

This project is private and proprietary.