import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccessibilityAnnouncer } from '@/components/Accessibility/AccessibilityAnnouncer';

// Mock the accessibility store
const mockAccessibilityStore = {
  announcements: [],
  isScreenReaderEnabled: true,
  announce: jest.fn(),
  clearAnnouncements: jest.fn(),
  setScreenReaderEnabled: jest.fn(),
};

jest.mock('@/stores/accessibilityStore', () => ({
  useAccessibilityStore: () => mockAccessibilityStore,
}));

describe('AccessibilityAnnouncer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessibilityStore.announcements = [];
  });

  it('should render without crashing', () => {
    render(<AccessibilityAnnouncer />);
    
    // Should render the live region
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('should announce messages when screen reader is enabled', () => {
    mockAccessibilityStore.announcements = [
      { id: '1', message: 'Wall created successfully', priority: 'polite', timestamp: Date.now() }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Wall created successfully');
  });

  it('should handle multiple announcements', () => {
    mockAccessibilityStore.announcements = [
      { id: '1', message: 'Wall created', priority: 'polite', timestamp: Date.now() },
      { id: '2', message: 'Door added', priority: 'polite', timestamp: Date.now() + 1 }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Wall created. Door added');
  });

  it('should respect priority levels', () => {
    mockAccessibilityStore.announcements = [
      { id: '1', message: 'Regular message', priority: 'polite', timestamp: Date.now() },
      { id: '2', message: 'Urgent message', priority: 'assertive', timestamp: Date.now() + 1 }
    ];

    render(<AccessibilityAnnouncer />);
    
    // Should have both polite and assertive regions
    const politeRegion = screen.getByLabelText('Polite announcements');
    const assertiveRegion = screen.getByLabelText('Urgent announcements');
    
    expect(politeRegion).toHaveAttribute('aria-live', 'polite');
    expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
    
    expect(politeRegion).toHaveTextContent('Regular message');
    expect(assertiveRegion).toHaveTextContent('Urgent message');
  });

  it('should not announce when screen reader is disabled', () => {
    mockAccessibilityStore.isScreenReaderEnabled = false;
    mockAccessibilityStore.announcements = [
      { id: '1', message: 'Should not be announced', priority: 'polite', timestamp: Date.now() }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeEmptyDOMElement();
  });

  it('should clear old announcements after timeout', async () => {
    jest.useFakeTimers();
    
    mockAccessibilityStore.announcements = [
      { id: '1', message: 'Temporary message', priority: 'polite', timestamp: Date.now() }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Temporary message');
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000); // 5 seconds
    });
    
    expect(mockAccessibilityStore.clearAnnouncements).toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('should handle keyboard navigation announcements', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Focused on wall element. Press Enter to select, Arrow keys to move', 
        priority: 'polite', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Focused on wall element. Press Enter to select, Arrow keys to move');
  });

  it('should announce tool changes', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Wall tool activated. Click and drag to create walls', 
        priority: 'polite', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Wall tool activated. Click and drag to create walls');
  });

  it('should announce validation errors', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Error: Wall is too short. Minimum length is 12 inches', 
        priority: 'assertive', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const assertiveRegion = screen.getByLabelText('Urgent announcements');
    expect(assertiveRegion).toHaveTextContent('Error: Wall is too short. Minimum length is 12 inches');
  });

  it('should announce element creation with details', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Wall created: 10 feet long, 8 inches thick, from coordinates 0,0 to 120,0', 
        priority: 'polite', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Wall created: 10 feet long, 8 inches thick, from coordinates 0,0 to 120,0');
  });

  it('should handle view changes', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Switched to elevation view. Showing front view of the building', 
        priority: 'polite', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Switched to elevation view. Showing front view of the building');
  });

  it('should announce zoom and pan operations', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Zoomed to 150%. Use Ctrl+Plus to zoom in, Ctrl+Minus to zoom out', 
        priority: 'polite', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Zoomed to 150%. Use Ctrl+Plus to zoom in, Ctrl+Minus to zoom out');
  });

  it('should provide context for complex operations', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Room detected: Living room, 300 square feet, 4 walls. Press Tab to navigate room properties', 
        priority: 'polite', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Room detected: Living room, 300 square feet, 4 walls. Press Tab to navigate room properties');
  });

  it('should handle undo/redo announcements', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Undone: Wall creation. Press Ctrl+Y to redo', 
        priority: 'polite', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Undone: Wall creation. Press Ctrl+Y to redo');
  });

  it('should announce save and export operations', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Design saved successfully. Last saved at 2:30 PM', 
        priority: 'polite', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Design saved successfully. Last saved at 2:30 PM');
  });

  it('should handle measurement announcements', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Measurement: 12 feet 6 inches. Press M to toggle measurement tool', 
        priority: 'polite', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Measurement: 12 feet 6 inches. Press M to toggle measurement tool');
  });

  it('should provide navigation instructions', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Canvas focused. Use arrow keys to navigate, Space to select, Tab to access toolbar', 
        priority: 'polite', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Canvas focused. Use arrow keys to navigate, Space to select, Tab to access toolbar');
  });

  it('should handle error recovery announcements', () => {
    mockAccessibilityStore.announcements = [
      { 
        id: '1', 
        message: 'Connection restored. All changes have been saved', 
        priority: 'assertive', 
        timestamp: Date.now() 
      }
    ];

    render(<AccessibilityAnnouncer />);
    
    const assertiveRegion = screen.getByLabelText('Urgent announcements');
    expect(assertiveRegion).toHaveTextContent('Connection restored. All changes have been saved');
  });

  it('should be properly hidden from visual users', () => {
    render(<AccessibilityAnnouncer />);
    
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('sr-only');
  });

  it('should maintain proper ARIA structure', () => {
    render(<AccessibilityAnnouncer />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live');
    expect(liveRegion).toHaveAttribute('aria-atomic');
    expect(liveRegion).toHaveAttribute('aria-relevant');
  });
});