'use client';

import React from 'react';
import { forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ size = 'md', label, description, error, className = '', ...props }, ref) => {
    const baseStyles = 'rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const classes = `${baseStyles} ${sizes[size]} ${className}`;

    const id = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className={classes}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${id}-error` : description ? `${id}-description` : undefined
            }
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label htmlFor={id} className="font-medium text-gray-700">
                {label}
              </label>
            )}
            {description && (
              <p id={`${id}-description`} className="text-gray-500">
                {description}
              </p>
            )}
          </div>
        )}
        {error && (
          <div
            id={`${id}-error`}
            className="ml-3 text-sm text-red-600"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export default Checkbox;
