import React from 'react';
// Use alternative icons or fallback to simple elements
const AlertIcon = () => (
  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

interface AlertProps {
  message?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ message, onClose, children, className = '' }) => {
  if (children) {
    // When used with children, render as a flexible container
    return (
      <div className={`border rounded-lg p-4 ${className}`} role="alert">
        {children}
      </div>
    );
  }

  // Original fixed alert behavior
  return (
    <div
      className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2"
      role="alert"
      aria-live="assertive"
    >
      <AlertIcon />
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700"
          aria-label="Close alert"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
};
