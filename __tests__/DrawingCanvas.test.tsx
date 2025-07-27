

import React from 'react';
import { render } from '@testing-library/react';
import DrawingCanvas from '../src/components/Canvas/DrawingCanvas';

// Mock useHistoryStore to prevent ReferenceError

jest.mock('@/stores/historyStore', () => ({
  useHistoryStore: () => ({ executeCommand: jest.fn() })
}));
jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => ({
    walls: [],
    roofs: [],
    doors: [],
    windows: [],
    stairs: [],
    rooms: [],
    addWall: jest.fn(),
    removeWall: jest.fn(),
    addRoof: jest.fn(),
    removeRoof: jest.fn(),
    addDoor: jest.fn(),
    removeDoor: jest.fn(),
    addWindow: jest.fn(),
    removeWindow: jest.fn(),
    addStair: jest.fn(),
    removeStair: jest.fn(),
    addRoom: jest.fn(),
    removeRoom: jest.fn(),
    selectElement: jest.fn(),
    clearSelection: jest.fn()
  })
}));
jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    zoomLevel: 1,
    activeTool: 'select',
    setZoomLevel: jest.fn(),
    setActiveTool: jest.fn(),
    showGrid: true,
    gridSize: 10,
    canvasWidth: 800,
    canvasHeight: 600,
    isPanning: false,
    setIsPanning: jest.fn(),
    setCanvasSize: jest.fn(),
    showRulers: false,
    showGuides: false,
    showSnap: false,
    snapToGrid: false,
    snapToObjects: false,
    setShowGrid: jest.fn(),
    setShowRulers: jest.fn(),
    setShowGuides: jest.fn(),
    setShowSnap: jest.fn(),
    setSnapToGrid: jest.fn(),
    setSnapToObjects: jest.fn(),
  })
}));
jest.mock('@/stores/viewStore', () => ({
  useViewStore: () => ({
    currentView: 'plan',
    getViewTransform: jest.fn(() => ({
      zoom: 1,
      rotation: 0,
      pan: { x: 0, y: 0 }
    })),
    isTransitioning: false
  })
}));
jest.mock('@/stores/floorStore', () => ({
  useFloorStore: () => ({
    currentFloorId: 'floor-1',
    getCurrentFloor: jest.fn(() => ({
      elements: {
        walls: [],
        doors: [],
        windows: [],
        stairs: [],
        roofs: [],
        rooms: []
      }
    })),
    showAllFloors: false,
    floorOpacity: 1,
    getFloorsOrderedByLevel: jest.fn(() => [])
  })
}));

jest.mock('@/stores/accessibilityStore', () => ({
  useAccessibilityStore: () => ({
    isAccessibilityMode: false,
    preferences: {
      enableScreenReaderSupport: false,
      enableKeyboardNavigation: true,
      highContrastMode: false,
      largerFocusIndicators: false,
      reducedMotion: false
    },
    setAccessibilityMode: jest.fn(),
    setFocusedElement: jest.fn(),
    getAccessibilityDescription: jest.fn(() => '')
  })
}));

jest.mock('@/components/Accessibility/AccessibilityAnnouncer', () => ({
  useAccessibilityAnnouncer: () => ({
    announceToolChange: jest.fn(),
    announceViewChange: jest.fn()
  }),
  AccessibilityAnnouncer: () => null
}));

describe('DrawingCanvas', () => {
  it('renders without crashing', () => {
    render(<DrawingCanvas />);
  });
});
