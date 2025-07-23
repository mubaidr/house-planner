import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ErrorNotification } from '@/components/ErrorHandling/ErrorNotification';

// Mock the error store
const mockErrorStore = {
  errors: [],
  warnings: [],
  addError: jest.fn(),
  addWarning: jest.fn(),
  removeError: jest.fn(),
  removeWarning: jest.fn(),
  clearAll: jest.fn(),
  hasErrors: false,
  hasWarnings: false,
};

jest.mock('@/stores/errorStore', () => ({
  useErrorStore: () => mockErrorStore,
}));

describe('ErrorNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockErrorStore.errors = [];
    mockErrorStore.warnings = [];
    mockErrorStore.hasErrors = false;
    mockErrorStore.hasWarnings = false;
  });

  it('should render without crashing when no errors', () => {
    render(<ErrorNotification />);
    
    // Should not show any notifications when no errors
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should display error notifications', () => {
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Failed to save design',
        type: 'error',
        timestamp: Date.now(),
        source: 'save-operation'
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to save design')).toBeInTheDocument();
  });

  it('should display warning notifications', () => {
    mockErrorStore.warnings = [
      {
        id: 'warning-1',
        message: 'Wall may be too thin for structural integrity',
        type: 'warning',
        timestamp: Date.now(),
        source: 'wall-validation'
      }
    ];
    mockErrorStore.hasWarnings = true;

    render(<ErrorNotification />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Wall may be too thin for structural integrity')).toBeInTheDocument();
  });

  it('should display multiple errors', () => {
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Network connection failed',
        type: 'error',
        timestamp: Date.now(),
        source: 'network'
      },
      {
        id: 'error-2',
        message: 'Invalid file format',
        type: 'error',
        timestamp: Date.now(),
        source: 'file-import'
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    expect(screen.getByText('Network connection failed')).toBeInTheDocument();
    expect(screen.getByText('Invalid file format')).toBeInTheDocument();
  });

  it('should dismiss individual errors', async () => {
    const user = userEvent.setup();
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Dismissible error',
        type: 'error',
        timestamp: Date.now(),
        source: 'test'
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
    await user.click(dismissButton);
    
    expect(mockErrorStore.removeError).toHaveBeenCalledWith('error-1');
  });

  it('should dismiss individual warnings', async () => {
    const user = userEvent.setup();
    mockErrorStore.warnings = [
      {
        id: 'warning-1',
        message: 'Dismissible warning',
        type: 'warning',
        timestamp: Date.now(),
        source: 'test'
      }
    ];
    mockErrorStore.hasWarnings = true;

    render(<ErrorNotification />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
    await user.click(dismissButton);
    
    expect(mockErrorStore.removeWarning).toHaveBeenCalledWith('warning-1');
  });

  it('should auto-dismiss notifications after timeout', async () => {
    jest.useFakeTimers();
    
    mockErrorStore.warnings = [
      {
        id: 'warning-1',
        message: 'Auto-dismiss warning',
        type: 'warning',
        timestamp: Date.now(),
        source: 'test',
        autoDismiss: true,
        duration: 3000
      }
    ];
    mockErrorStore.hasWarnings = true;

    render(<ErrorNotification />);
    
    expect(screen.getByText('Auto-dismiss warning')).toBeInTheDocument();
    
    // Fast-forward time
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(mockErrorStore.removeWarning).toHaveBeenCalledWith('warning-1');
    });
    
    jest.useRealTimers();
  });

  it('should not auto-dismiss persistent errors', async () => {
    jest.useFakeTimers();
    
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Persistent error',
        type: 'error',
        timestamp: Date.now(),
        source: 'test',
        persistent: true
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    expect(screen.getByText('Persistent error')).toBeInTheDocument();
    
    // Fast-forward time
    jest.advanceTimersByTime(10000);
    
    // Should not be dismissed
    expect(mockErrorStore.removeError).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('should show error details when expanded', async () => {
    const user = userEvent.setup();
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Error with details',
        type: 'error',
        timestamp: Date.now(),
        source: 'test',
        details: 'Stack trace or additional error information',
        code: 'ERR_001'
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    const expandButton = screen.getByRole('button', { name: /details|expand/i });
    await user.click(expandButton);
    
    expect(screen.getByText('Stack trace or additional error information')).toBeInTheDocument();
    expect(screen.getByText('ERR_001')).toBeInTheDocument();
  });

  it('should group similar errors', () => {
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Network timeout',
        type: 'error',
        timestamp: Date.now(),
        source: 'network'
      },
      {
        id: 'error-2',
        message: 'Network timeout',
        type: 'error',
        timestamp: Date.now() + 1000,
        source: 'network'
      },
      {
        id: 'error-3',
        message: 'Network timeout',
        type: 'error',
        timestamp: Date.now() + 2000,
        source: 'network'
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    // Should show grouped count
    expect(screen.getByText(/3.*times|×3|count.*3/i)).toBeInTheDocument();
    expect(screen.getByText('Network timeout')).toBeInTheDocument();
  });

  it('should handle different error types with appropriate styling', () => {
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Critical error',
        type: 'error',
        severity: 'critical',
        timestamp: Date.now(),
        source: 'system'
      }
    ];
    mockErrorStore.warnings = [
      {
        id: 'warning-1',
        message: 'Info message',
        type: 'warning',
        severity: 'info',
        timestamp: Date.now(),
        source: 'user'
      }
    ];
    mockErrorStore.hasErrors = true;
    mockErrorStore.hasWarnings = true;

    render(<ErrorNotification />);
    
    const errorAlert = screen.getByText('Critical error').closest('[role="alert"]');
    const warningAlert = screen.getByText('Info message').closest('[role="alert"]');
    
    expect(errorAlert).toHaveClass('bg-red-100', 'border-red-300');
    expect(warningAlert).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('should provide action buttons for actionable errors', async () => {
    const user = userEvent.setup();
    const retryAction = jest.fn();
    
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Failed to save. Try again?',
        type: 'error',
        timestamp: Date.now(),
        source: 'save',
        actions: [
          {
            label: 'Retry',
            action: retryAction
          },
          {
            label: 'Save As...',
            action: jest.fn()
          }
        ]
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    const saveAsButton = screen.getByRole('button', { name: 'Save As...' });
    
    expect(retryButton).toBeInTheDocument();
    expect(saveAsButton).toBeInTheDocument();
    
    await user.click(retryButton);
    expect(retryAction).toHaveBeenCalled();
  });

  it('should clear all notifications', async () => {
    const user = userEvent.setup();
    mockErrorStore.errors = [
      { id: 'error-1', message: 'Error 1', type: 'error', timestamp: Date.now(), source: 'test' }
    ];
    mockErrorStore.warnings = [
      { id: 'warning-1', message: 'Warning 1', type: 'warning', timestamp: Date.now(), source: 'test' }
    ];
    mockErrorStore.hasErrors = true;
    mockErrorStore.hasWarnings = true;

    render(<ErrorNotification />);
    
    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearAllButton);
    
    expect(mockErrorStore.clearAll).toHaveBeenCalled();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Keyboard accessible error',
        type: 'error',
        timestamp: Date.now(),
        source: 'test'
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
    
    // Focus and activate with keyboard
    dismissButton.focus();
    expect(dismissButton).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(mockErrorStore.removeError).toHaveBeenCalledWith('error-1');
  });

  it('should announce errors to screen readers', () => {
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Screen reader announced error',
        type: 'error',
        timestamp: Date.now(),
        source: 'test'
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('should handle error sources and categorization', () => {
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Network error',
        type: 'error',
        timestamp: Date.now(),
        source: 'network',
        category: 'connectivity'
      },
      {
        id: 'error-2',
        message: 'Validation error',
        type: 'error',
        timestamp: Date.now(),
        source: 'validation',
        category: 'user-input'
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Validation error')).toBeInTheDocument();
    
    // Should show source indicators
    expect(screen.getByText(/Source:.*network/i)).toBeInTheDocument();
    expect(screen.getByText(/Source:.*validation/i)).toBeInTheDocument();
  });

  it('should handle error recovery suggestions', () => {
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'File save failed',
        type: 'error',
        timestamp: Date.now(),
        source: 'file-system',
        suggestions: [
          'Check available disk space',
          'Verify file permissions',
          'Try saving to a different location'
        ]
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    expect(screen.getByText('Check available disk space')).toBeInTheDocument();
    expect(screen.getByText('Verify file permissions')).toBeInTheDocument();
    expect(screen.getByText('Try saving to a different location')).toBeInTheDocument();
  });

  it('should limit the number of visible notifications', () => {
    const manyErrors = Array.from({ length: 10 }, (_, i) => ({
      id: `error-${i}`,
      message: `Error ${i}`,
      type: 'error' as const,
      timestamp: Date.now() + i,
      source: 'test'
    }));
    
    mockErrorStore.errors = manyErrors;
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification />);
    
    // Should show limited number of notifications with "show more" option
    const notifications = screen.getAllByRole('alert');
    expect(notifications.length).toBeLessThanOrEqual(5); // Assuming max 5 visible
    
    if (manyErrors.length > 5) {
      expect(screen.getByText(/show.*more|\+\d+.*more/i)).toBeInTheDocument();
    }
  });

  it('should handle notification positioning', () => {
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Positioned error',
        type: 'error',
        timestamp: Date.now(),
        source: 'test'
      }
    ];
    mockErrorStore.hasErrors = true;

    render(<ErrorNotification position="top-right" />);
    
    const container = screen.getByRole('alert').closest('.notification-container');
    expect(container).toHaveClass('top-4', 'right-4');
  });

  it('should handle notification animations', async () => {
    jest.useFakeTimers();
    
    const { rerender } = render(<ErrorNotification />);
    
    // Add error
    mockErrorStore.errors = [
      {
        id: 'error-1',
        message: 'Animated error',
        type: 'error',
        timestamp: Date.now(),
        source: 'test'
      }
    ];
    mockErrorStore.hasErrors = true;
    
    rerender(<ErrorNotification />);
    
    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('animate-slide-in');
    
    jest.useRealTimers();
  });
});