'use client';

import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, X, RefreshCw } from 'lucide-react';
import { useErrorStore } from '@/stores/errorStore';

export default function ErrorNotification() {
  const { error, errorType, errorDetails, isRecoverable, retry, clearError } = useErrorStore();

  // Auto-dismiss non-critical errors after 5 seconds
  useEffect(() => {
    if (error && errorType === 'info') {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, errorType, clearError]);

  if (!error) return null;

  const getIcon = () => {
    switch (errorType) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'error':
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (errorType) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'error':
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getTextColor = () => {
    switch (errorType) {
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      case 'error':
      default:
        return 'text-red-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`rounded-lg border p-4 shadow-lg ${getBackgroundColor()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {error}
            </p>
            {errorDetails && (
              <details className="mt-2">
                <summary className={`text-xs ${getTextColor()} opacity-75 cursor-pointer hover:opacity-100`}>
                  Show details
                </summary>
                <pre className={`mt-1 text-xs ${getTextColor()} opacity-75 overflow-auto max-h-32`}>
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </details>
            )}
            {isRecoverable && (
              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={retry}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={clearError}
              className={`inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150`}
              aria-label="Close error notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
