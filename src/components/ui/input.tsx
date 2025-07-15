'use client';

import React from 'react';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', size = 'md', error, className = '', ...props }, ref) => {
    const baseStyles = 'block w-full border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    };

    const sizes = {
      sm: 'px-2 py-1 text-sm rounded',
      md: 'px-3 py-2 text-sm rounded-md',
      lg: 'px-4 py-3 text-base rounded-lg',
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <div className="w-full">
        <input
          ref={ref}
          className={classes}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <div
            id={`${props.id}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
