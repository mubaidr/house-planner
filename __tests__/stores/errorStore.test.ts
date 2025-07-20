import { act, renderHook } from '@testing-library/react';
import { useErrorStore } from '@/stores/errorStore';

describe('ErrorStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useErrorStore.getState().clearError();
    });
  });

  describe('Initial State', () => {
    it('should have correct default values', () => {
      const state = useErrorStore.getState();
      
      expect(state.error).toBe(null);
      expect(state.errorType).toBe(null);
      expect(state.errorDetails).toBe(null);
      expect(state.isRecoverable).toBe(false);
      expect(state.retryAction).toBe(null);
    });
  });

  describe('setError', () => {
    it('should set basic error with default type', () => {
      act(() => {
        useErrorStore.getState().setError('Test error message');
      });

      const state = useErrorStore.getState();
      expect(state.error).toBe('Test error message');
      expect(state.errorType).toBe('error');
      expect(state.errorDetails).toBe(null);
      expect(state.isRecoverable).toBe(false);
      expect(state.retryAction).toBe(null);
    });

    it('should set error with custom type', () => {
      act(() => {
        useErrorStore.getState().setError('Warning message', 'warning');
      });

      const state = useErrorStore.getState();
      expect(state.error).toBe('Warning message');
      expect(state.errorType).toBe('warning');
    });

    it('should set info type error', () => {
      act(() => {
        useErrorStore.getState().setError('Info message', 'info');
      });

      const state = useErrorStore.getState();
      expect(state.error).toBe('Info message');
      expect(state.errorType).toBe('info');
    });

    it('should set error with details', () => {
      const details = { code: 500, timestamp: Date.now() };
      
      act(() => {
        useErrorStore.getState().setError('Server error', 'error', details);
      });

      const state = useErrorStore.getState();
      expect(state.error).toBe('Server error');
      expect(state.errorType).toBe('error');
      expect(state.errorDetails).toEqual(details);
    });

    it('should clear error when setting null', () => {
      // First set an error
      act(() => {
        useErrorStore.getState().setError('Test error');
      });

      // Then clear it
      act(() => {
        useErrorStore.getState().setError(null);
      });

      const state = useErrorStore.getState();
      expect(state.error).toBe(null);
      expect(state.errorType).toBe('error'); // Type remains but error is null
    });
  });

  describe('setRecoverableError', () => {
    it('should set recoverable error with retry action', () => {
      const mockRetryAction = jest.fn();
      
      act(() => {
        useErrorStore.getState().setRecoverableError('Network error', mockRetryAction);
      });

      const state = useErrorStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.errorType).toBe('error');
      expect(state.isRecoverable).toBe(true);
      expect(state.retryAction).toBe(mockRetryAction);
      expect(state.errorDetails).toBe(null);
    });

    it('should set recoverable error with details', () => {
      const mockRetryAction = jest.fn();
      const details = { endpoint: '/api/data', method: 'GET' };
      
      act(() => {
        useErrorStore.getState().setRecoverableError('API call failed', mockRetryAction, details);
      });

      const state = useErrorStore.getState();
      expect(state.error).toBe('API call failed');
      expect(state.isRecoverable).toBe(true);
      expect(state.retryAction).toBe(mockRetryAction);
      expect(state.errorDetails).toEqual(details);
    });
  });

  describe('clearError', () => {
    it('should clear all error state', () => {
      const mockRetryAction = jest.fn();
      const details = { code: 404 };
      
      // Set a complex error state
      act(() => {
        useErrorStore.getState().setRecoverableError('Complex error', mockRetryAction, details);
      });

      // Verify error is set
      let state = useErrorStore.getState();
      expect(state.error).toBe('Complex error');
      expect(state.isRecoverable).toBe(true);

      // Clear error
      act(() => {
        useErrorStore.getState().clearError();
      });

      // Verify all fields are cleared
      state = useErrorStore.getState();
      expect(state.error).toBe(null);
      expect(state.errorType).toBe(null);
      expect(state.errorDetails).toBe(null);
      expect(state.isRecoverable).toBe(false);
      expect(state.retryAction).toBe(null);
    });
  });

  describe('retry', () => {
    it('should execute retry action and clear error', () => {
      const mockRetryAction = jest.fn();
      
      // Set recoverable error
      act(() => {
        useErrorStore.getState().setRecoverableError('Retry test error', mockRetryAction);
      });

      // Execute retry
      act(() => {
        useErrorStore.getState().retry();
      });

      // Verify retry action was called
      expect(mockRetryAction).toHaveBeenCalledTimes(1);

      // Verify error was cleared
      const state = useErrorStore.getState();
      expect(state.error).toBe(null);
      expect(state.errorType).toBe(null);
      expect(state.isRecoverable).toBe(false);
      expect(state.retryAction).toBe(null);
    });

    it('should do nothing when no retry action is available', () => {
      // Set non-recoverable error
      act(() => {
        useErrorStore.getState().setError('Non-recoverable error');
      });

      // Try to retry (should do nothing)
      act(() => {
        useErrorStore.getState().retry();
      });

      // Error should still be there
      const state = useErrorStore.getState();
      expect(state.error).toBe('Non-recoverable error');
      expect(state.isRecoverable).toBe(false);
    });

    it('should handle retry action that throws error', () => {
      const mockRetryAction = jest.fn(() => {
        throw new Error('Retry failed');
      });
      
      act(() => {
        useErrorStore.getState().setRecoverableError('Original error', mockRetryAction);
      });

      // The retry action will throw, but the error clearing happens after
      // In this case, the error won't be cleared because the exception interrupts the flow
      expect(() => {
        act(() => {
          useErrorStore.getState().retry();
        });
      }).toThrow('Retry failed');

      expect(mockRetryAction).toHaveBeenCalledTimes(1);
      
      // Error remains because the exception interrupted the clearError call
      const state = useErrorStore.getState();
      expect(state.error).toBe('Original error');
    });
  });

  describe('Error State Transitions', () => {
    it('should transition from recoverable to non-recoverable error', () => {
      const mockRetryAction = jest.fn();
      
      // Set recoverable error
      act(() => {
        useErrorStore.getState().setRecoverableError('Recoverable error', mockRetryAction);
      });

      let state = useErrorStore.getState();
      expect(state.isRecoverable).toBe(true);

      // Set non-recoverable error
      act(() => {
        useErrorStore.getState().setError('Non-recoverable error');
      });

      state = useErrorStore.getState();
      expect(state.error).toBe('Non-recoverable error');
      expect(state.isRecoverable).toBe(false);
      expect(state.retryAction).toBe(null);
    });

    it('should transition from non-recoverable to recoverable error', () => {
      // Set non-recoverable error
      act(() => {
        useErrorStore.getState().setError('Non-recoverable error');
      });

      let state = useErrorStore.getState();
      expect(state.isRecoverable).toBe(false);

      // Set recoverable error
      const mockRetryAction = jest.fn();
      act(() => {
        useErrorStore.getState().setRecoverableError('Recoverable error', mockRetryAction);
      });

      state = useErrorStore.getState();
      expect(state.error).toBe('Recoverable error');
      expect(state.isRecoverable).toBe(true);
      expect(state.retryAction).toBe(mockRetryAction);
    });
  });

  describe('Error Types', () => {
    it('should handle all error types correctly', () => {
      const errorTypes = ['warning', 'error', 'info'] as const;
      
      errorTypes.forEach(type => {
        act(() => {
          useErrorStore.getState().setError(`${type} message`, type);
        });

        const state = useErrorStore.getState();
        expect(state.errorType).toBe(type);
        expect(state.error).toBe(`${type} message`);
      });
    });
  });

  describe('Complex Error Details', () => {
    it('should handle complex error details object', () => {
      const complexDetails = {
        code: 500,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        stack: 'Error stack trace...',
        context: {
          userId: '123',
          action: 'save_design',
          metadata: {
            version: '1.0.0',
            browser: 'Chrome'
          }
        }
      };

      act(() => {
        useErrorStore.getState().setError('Complex error', 'error', complexDetails);
      });

      const state = useErrorStore.getState();
      expect(state.errorDetails).toEqual(complexDetails);
    });

    it('should handle null and undefined details', () => {
      act(() => {
        useErrorStore.getState().setError('Error with null details', 'error', null);
      });

      let state = useErrorStore.getState();
      expect(state.errorDetails).toBe(null);

      act(() => {
        useErrorStore.getState().setError('Error with undefined details', 'error', undefined);
      });

      state = useErrorStore.getState();
      expect(state.errorDetails).toBe(null); // undefined gets converted to null in the store
    });
  });

  describe('Multiple Retry Actions', () => {
    it('should handle multiple retry actions correctly', () => {
      const firstRetryAction = jest.fn();
      const secondRetryAction = jest.fn();

      // Set first recoverable error
      act(() => {
        useErrorStore.getState().setRecoverableError('First error', firstRetryAction);
      });

      // Set second recoverable error (should replace first)
      act(() => {
        useErrorStore.getState().setRecoverableError('Second error', secondRetryAction);
      });

      // Retry should call second action, not first
      act(() => {
        useErrorStore.getState().retry();
      });

      expect(firstRetryAction).not.toHaveBeenCalled();
      expect(secondRetryAction).toHaveBeenCalledTimes(1);
    });
  });
});