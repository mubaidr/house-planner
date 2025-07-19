import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ErrorState {
  error: string | null;
  errorType: 'warning' | 'error' | 'info' | null;
  errorDetails: Record<string, unknown> | null;
  isRecoverable: boolean;
  retryAction: (() => void) | null;
}

export interface ErrorActions {
  setError: (error: string | null, type?: 'warning' | 'error' | 'info', details?: Record<string, unknown> | null) => void;
  setRecoverableError: (error: string, retryAction: () => void, details?: Record<string, unknown> | null) => void;
  clearError: () => void;
  retry: () => void;
}

export const useErrorStore = create<ErrorState & ErrorActions>()(
  persist(
    (set, get) => ({
      // State
      error: null,
      errorType: null,
      errorDetails: null,
      isRecoverable: false,
      retryAction: null,

      // Actions
      setError: (error, type = 'error', details = null) => set({
        error,
        errorType: type,
        errorDetails: details,
        isRecoverable: false,
        retryAction: null,
      }),

      setRecoverableError: (error, retryAction, details = null) => set({
        error,
        errorType: 'error',
        errorDetails: details,
        isRecoverable: true,
        retryAction,
      }),

      clearError: () => set({
        error: null,
        errorType: null,
        errorDetails: null,
        isRecoverable: false,
        retryAction: null,
      }),

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
      }),
    }
  )
);
