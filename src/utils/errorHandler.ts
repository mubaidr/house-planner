/**
 * Centralized error handling utility to replace console.log/console.error usage
 * Provides user-friendly error messages and recovery options
 */

import { useErrorStore } from '@/stores/errorStore';

export type ErrorCategory =
  | 'save'
  | 'load'
  | 'export'
  | 'import'
  | 'drawing'
  | 'calculation'
  | 'integration'
  | 'storage'
  | 'rendering'
  | 'validation'
  | 'network'
  | 'unknown';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorContext {
  source: string;
  category: ErrorCategory;
  operation?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

export interface ErrorOptions {
  severity?: ErrorSeverity;
  persistent?: boolean;
  autoDismiss?: boolean;
  duration?: number;
  retryAction?: () => void;
  recoveryActions?: Array<{
    label: string;
    action: () => void;
  }>;
  suggestions?: string[];
  userMessage?: string;
  showToUser?: boolean;
}

/**
 * Main error handling function that replaces console.error
 */
export const handleError = (
  error: Error,
  context: ErrorContext,
  options?: ErrorOptions
): void => {
  const errorData = {
    message: options?.userMessage || generateUserFriendlyMessage(error.message, context),
    source: context.source,
    details: error.message,
    code: error.name,
    category: context.category,
    severity: context.severity || 'error',
    actions: options?.retryAction ? [{ label: 'Retry', action: options.retryAction }] : undefined,
    suggestions: options?.suggestions,
    persistent: options?.persistent,
    autoDismiss: options?.autoDismiss,
    duration: options?.duration,
  };

  // Ensure the store is available before using it
  try {
    const store = useErrorStore.getState();
    if (typeof store.addError === 'function') {
      store.addError(errorData);
    } else {
      // Fallback to console if store is not available
      console.error('Error:', errorData);
    }
  } catch {
    // Fallback to console if there's any issue with the store
    console.error('Error (store unavailable):', errorData);
  }

  // Log for debugging
  console.error(`[${context.source}] ${error.message}`, {
    context,
    options,
    error,
  });
};

/**
 * Warning handler for non-critical issues
 */
export const handleWarning = (
  message: string,
  context: ErrorContext,
  options?: ErrorOptions
): void => {
  handleError(new Error(message), { ...context, severity: 'warning' }, options);
};

/**
 * Info handler for user notifications
 */
export const handleInfo = (
  message: string,
  context: ErrorContext,
  options?: ErrorOptions
): void => {
  handleError(new Error(message), {
    ...context,
    severity: 'info'
  }, {
    ...options,
    autoDismiss: options?.autoDismiss ?? true,
    duration: options?.duration ?? 3000
  });
};

/**
 * Success handler for positive user feedback
 */
export function handleSuccess(
  message: string,
  context: ErrorContext,
  options: Omit<ErrorOptions, 'severity'> = {}
): void {
  handleInfo(message, context, options);
}

/**
 * Generate user-friendly error messages based on technical error and context
 */
function generateUserFriendlyMessage(error: string, context: ErrorContext): string {
  const { category, operation } = context;

  // Common error patterns and their user-friendly versions
  const errorMappings: Record<string, string> = {
    // Storage errors
    'localStorage': 'Unable to save your work locally. Please check if your browser allows local storage.',
    'QuotaExceededError': 'Storage space is full. Please clear some old projects or export your current work.',

    // Network errors
    'Failed to fetch': 'Network connection error. Please check your internet connection and try again.',
    'NetworkError': 'Unable to connect to the server. Please try again later.',

    // File errors
    'File not found': 'The requested file could not be found.',
    'Parse error': 'The file format is not supported or the file is corrupted.',

    // Calculation errors
    'NaN': 'Invalid calculation result. Please check your input values.',
    'Division by zero': 'Cannot divide by zero. Please check your measurements.',

    // Generic fallbacks by category
  };

  // Check for specific error patterns
  for (const [pattern, message] of Object.entries(errorMappings)) {
    if (error.toLowerCase().includes(pattern.toLowerCase())) {
      return message;
    }
  }

  // Category-based fallback messages
  const categoryMessages: Record<ErrorCategory, string> = {
    save: 'Failed to save your project. Your work may not be preserved.',
    load: 'Failed to load the project. The file may be corrupted or in an unsupported format.',
    export: 'Failed to export your project. Please try a different format or check your settings.',
    import: 'Failed to import the file. Please check the file format and try again.',
    drawing: 'An error occurred while drawing. Please try the operation again.',
    calculation: 'Calculation error occurred. Please check your input values and try again.',
    integration: 'Error in design integration. Some elements may not align properly.',
    storage: 'Storage error. Your changes may not be saved automatically.',
    rendering: 'Display error occurred. Please refresh the page if the issue persists.',
    validation: 'Input validation failed. Please check your entries and try again.',
    network: 'Network error. Please check your connection and try again.',
    unknown: 'An unexpected error occurred. Please try again or contact support if the issue persists.'
  };

  const baseMessage = categoryMessages[category] || categoryMessages.unknown;

  return operation ? `${baseMessage} (Operation: ${operation})` : baseMessage;
}

/**
 * Get default suggestions based on error category
 */
// Helper function to get default suggestions for common error categories
// Currently unused but available for future enhancements
/*
function getDefaultSuggestions(category: ErrorCategory): string[] {
  switch (category) {
    case 'storage':
      return [
        'Check if localStorage is enabled',
        'Clear browser cache and cookies',
        'Try using a different browser',
        'Disable browser extensions temporarily'
      ];
    case 'network':
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Disable VPN or proxy temporarily',
        'Check firewall settings'
      ];
    case 'validation':
      return [
        'Verify input format and requirements',
        'Check for special characters or invalid data',
        'Ensure all required fields are filled',
        'Review error message for specific guidance'
      ];
    case 'render':
      return [
        'Try refreshing the page',
        'Check if browser supports required features',
        'Clear browser cache',
        'Update your browser to the latest version'
      ];
    case 'export':
      return [
        'Ensure you have write permissions',
        'Check available disk space',
        'Try a different export format',
        'Verify the design is not corrupted'
      ];
    case 'import':
      return [
        'Verify the file format is supported',
        'Check if the file is corrupted',
        'Ensure the file was created with this application',
        'Try uploading the file again'
      ];
    case 'save':
      return [
        'Check available storage space',
        'Verify write permissions',
        'Try saving to a different location',
        'Ensure the filename is valid'
      ];
    case 'load':
      return [
        'Verify the file exists and is accessible',
        'Check file permissions',
        'Ensure the file format is supported',
        'Try opening a different file'
      ];
    default:
      return [
        'Try refreshing the page',
        'Clear browser cache',
        'Try again in a few moments',
        'Contact support if the problem persists'
      ];
  }
}

/**
 * Development-only debug logger
 */
export function debugLog(message: string, data?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [DEBUG] ${message}`, data);
  }
}

/**
 * Development-only info logger
 */
export function devInfo(message: string, data?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.info(`ℹ️ [INFO] ${message}`, data);
  }
}

/**
 * Performance timing utility for development
 */
export function timeOperation<T>(
  operation: () => T,
  label: string
): T {
  if (process.env.NODE_ENV === 'development') {
    console.time(label);
    const result = operation();
    console.timeEnd(label);
    return result;
  }
  return operation();
}
