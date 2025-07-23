import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ErrorAction {
  label: string;
  action: () => void;
}

export interface ErrorNotification {
  id: string;
  message: string;
  type: 'error' | 'warning';
  timestamp: number;
  source: string;
  details?: string;
  code?: string;
  actions?: ErrorAction[];
  suggestions?: string[];
  severity?: 'info' | 'warning' | 'error' | 'critical';
  persistent?: boolean;
  autoDismiss?: boolean;
  duration?: number;
  category?: string;
}

export interface ErrorState {
  errors: ErrorNotification[];
  warnings: ErrorNotification[];
  hasErrors: boolean;
  hasWarnings: boolean;
  // Legacy properties for backward compatibility
  error: string | null;
  errorType: 'warning' | 'error' | 'info' | null;
  errorDetails: Record<string, unknown> | null;
  isRecoverable: boolean;
  retryAction: (() => void) | null;
}

export interface ErrorActions {
  addError: (error: Omit<ErrorNotification, 'id' | 'timestamp' | 'type'>) => void;
  addWarning: (warning: Omit<ErrorNotification, 'id' | 'timestamp' | 'type'>) => void;
  removeError: (id: string) => void;
  removeWarning: (id: string) => void;
  clearAll: () => void;
  // Legacy methods for backward compatibility
  setError: (error: string | null, type?: 'warning' | 'error' | 'info', details?: Record<string, unknown> | null) => void;
  setRecoverableError: (error: string, retryAction: () => void, details?: Record<string, unknown> | null) => void;
  clearError: () => void;
  retry: () => void;
}

export const useErrorStore = create<ErrorState & ErrorActions>()(
  persist(
    (set, get) => ({
      // New state
      errors: [],
      warnings: [],
      hasErrors: false,
      hasWarnings: false,
      
      // Legacy state
      error: null,
      errorType: null,
      errorDetails: null,
      isRecoverable: false,
      retryAction: null,

      // New actions
      addError: (errorData) => {
        const error: ErrorNotification = {
          ...errorData,
          id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type: 'error',
        };
        
        set((state) => ({
          errors: [...state.errors, error],
          hasErrors: true,
        }));

        // Auto-dismiss if configured
        if (error.autoDismiss && error.duration) {
          setTimeout(() => {
            get().removeError(error.id);
          }, error.duration);
        }
      },

      addWarning: (warningData) => {
        const warning: ErrorNotification = {
          ...warningData,
          id: `warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type: 'warning',
        };
        
        set((state) => ({
          warnings: [...state.warnings, warning],
          hasWarnings: true,
        }));

        // Auto-dismiss if configured
        if (warning.autoDismiss && warning.duration) {
          setTimeout(() => {
            get().removeWarning(warning.id);
          }, warning.duration);
        }
      },

      removeError: (id) => {
        set((state) => {
          const errors = state.errors.filter(error => error.id !== id);
          return {
            errors,
            hasErrors: errors.length > 0,
          };
        });
      },

      removeWarning: (id) => {
        set((state) => {
          const warnings = state.warnings.filter(warning => warning.id !== id);
          return {
            warnings,
            hasWarnings: warnings.length > 0,
          };
        });
      },

      clearAll: () => {
        set({
          errors: [],
          warnings: [],
          hasErrors: false,
          hasWarnings: false,
        });
      },

      // Legacy actions for backward compatibility
      setError: (error, type = 'error', details = null) => {
        set({
          error,
          errorType: type,
          errorDetails: details,
          isRecoverable: false,
          retryAction: null,
        });

        // Also add to new error system
        if (error) {
          get().addError({
            message: error,
            source: 'legacy',
            severity: type === 'info' ? 'info' : type === 'warning' ? 'warning' : 'error',
          });
        }
      },

      setRecoverableError: (error, retryAction, details = null) => {
        set({
          error,
          errorType: 'error',
          errorDetails: details,
          isRecoverable: true,
          retryAction,
        });

        // Also add to new error system
        get().addError({
          message: error,
          source: 'legacy',
          severity: 'error',
          actions: [{ label: 'Retry', action: retryAction }],
        });
      },

      clearError: () => {
        set({
          error: null,
          errorType: null,
          errorDetails: null,
          isRecoverable: false,
          retryAction: null,
        });
      },

      retry: () => {
        const { retryAction, clearError } = get();
        if (retryAction) {
          retryAction();
          clearError();
        }
      },
    }),
    {
      name: 'error-store',
      partialize: (state) => ({
        // Only persist error preferences, not actual errors
        errorType: null,
        error: null,
        errorDetails: null,
        isRecoverable: false,
        retryAction: null,
        errors: [],
        warnings: [],
        hasErrors: false,
        hasWarnings: false,
      }),
    }
  )
);
