// __tests__/AppLayout.test.tsx
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';

// Mock the stores to prevent undefined errors
jest.mock('@/stores/accessibilityStore', () => ({
  useAccessibilityStore: () => ({
    preferences: {
      highContrastMode: false,
      reducedMotion: false,
      largerText: false,
      largerFocusIndicators: false,
      enableAlternativeElementList: true,
      showElementList: false,
      keyboardNavigationOnly: false,
      tabNavigationOrder: [],
      textScale: 1.0,
      colorBlindMode: 'none',
      enableAudioFeedback: false,
      audioVolume: 0.5,
    },
    isAccessibilityMode: false,
    showElementList: false,
    toggleElementList: jest.fn(),
  }),
  isAccessibilityModeActive: jest.fn(() => false),
}));

jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    sidebarCollapsed: false,
    propertiesPanelCollapsed: false,
    setExportDialogOpen: jest.fn(),
    setImportDialogOpen: jest.fn(),
    isExportDialogOpen: false,
    isImportDialogOpen: false,
  }),
}));

jest.mock('@/stores/materialStore', () => ({
  useMaterialStore: () => ({
    isLibraryOpen: false,
  }),
}));

jest.mock('@/stores/templateStore', () => ({
  useTemplateStore: () => ({
    isTemplateLibraryOpen: false,
  }),
}));

jest.mock('@/stores/errorStore', () => ({
  useErrorStore: () => ({
    error: null,
    setError: jest.fn(),
  }),
}));

jest.mock('@/stores/floorStore', () => ({
  useFloorStore: () => ({
    floors: [],
    currentFloorId: null,
  }),
}));

jest.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: () => ({}),
}));

// Mock complex child components to avoid deep dependency issues
jest.mock('@/components/Toolbar/Toolbar', () => ({
  Toolbar: () => <div data-testid="toolbar">Toolbar</div>,
}));

jest.mock('@/components/Canvas/DrawingCanvas', () => ({
  __esModule: true,
  default: () => <div data-testid="drawing-canvas">Drawing Canvas</div>,
}));

jest.mock('@/components/Sidebar/ElementsSidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="elements-sidebar">Elements Sidebar</div>,
}));

jest.mock('@/components/Properties/PropertiesPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="properties-panel">Properties Panel</div>,
}));

jest.mock('@/components/StatusBar/StatusBar', () => ({
  __esModule: true,
  default: () => <div data-testid="status-bar">Status Bar</div>,
}));

jest.mock('@/components/Floor/FloorSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid="floor-switcher">Floor Switcher</div>,
}));

jest.mock('@/components/ViewSwitcher/ViewSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid="view-switcher">View Switcher</div>,
}));

jest.mock('@/components/Materials/MaterialLibrary', () => ({
  __esModule: true,
  default: () => <div data-testid="material-library">Material Library</div>,
}));

jest.mock('@/components/Templates/TemplateLibrary', () => ({
  __esModule: true,
  default: () => <div data-testid="template-library">Template Library</div>,
}));

jest.mock('@/components/Export/ExportDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="export-dialog">Export Dialog</div>,
}));

jest.mock('@/components/Export/ImportDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="import-dialog">Import Dialog</div>,
}));

// Mock accessibility components that have complex dependencies
jest.mock('@/components/Accessibility/AccessibilitySettingsPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="accessibility-settings">Accessibility Settings</div>,
}));

jest.mock('@/components/Accessibility/AlternativeElementList', () => ({
  __esModule: true,
  default: () => <div data-testid="alternative-element-list">Alternative Element List</div>,
}));

jest.mock('@/components/ErrorHandling/ErrorNotification', () => ({
  __esModule: true,
  default: () => <div data-testid="error-notification">Error Notification</div>,
}));

jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => ({
    selectedElementId: null,
    selectedElementType: null,
    walls: [],
    doors: [],
    windows: [],
    stairs: [],
    roofs: [],
  }),
}));

jest.mock('@/stores/viewStore', () => ({
  useViewStore: () => ({
    currentView: 'plan',
    setCurrentView: jest.fn(),
  }),
}));

jest.mock('@/stores/historyStore', () => ({
  useHistoryStore: () => ({
    canUndo: false,
    canRedo: false,
    undo: jest.fn(),
    redo: jest.fn(),
  }),
}));

describe('AppLayout', () => {
  it('renders without crashing', () => {
    const { container } = render(<AppLayout />);
    // Check that the main layout container exists
    const layoutRoot = container.querySelector('.h-screen.w-screen.flex.flex-col');
    expect(layoutRoot).toBeInTheDocument();
  });

  it('renders accessibility skip link', () => {
    const { container } = render(<AppLayout />);
    const skipLink = container.querySelector('a[href="#main-content"]');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveTextContent('Skip to main content');
  });

  it('has correct layout structure', () => {
    const { container } = render(<AppLayout />);
    // Check for main layout elements
    const layoutRoot = container.querySelector('.h-screen.w-screen.flex.flex-col');
    expect(layoutRoot).toBeInTheDocument();
    
    // Should not have high-contrast class by default
    expect(layoutRoot).not.toHaveClass('high-contrast');
  });
});
