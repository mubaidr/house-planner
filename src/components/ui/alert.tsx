import React from 'react';
import { LuAlertCircle, LuX } from 'react-icons/lu';

interface AlertProps {
  message: string;
  onClose: () => void;
}

export const Alert: React.FC<AlertProps> = ({ message, onClose }) => {
  return (
    <div
      className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2"
      role="alert"
      aria-live="assertive"
    >
      <LuAlertCircle className="text-red-500" aria-hidden="true" />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-red-500 hover:text-red-700"
        aria-label="Close alert"
      >
        <LuX aria-hidden="true" />
      </button>
    </div>
  );
};
