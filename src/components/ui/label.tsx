'use client';

import React from 'react';
import { forwardRef } from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  children: React.ReactNode;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ size = 'md', required = false, className = '', children, ...props }, ref) => {
    const baseStyles = 'block font-medium text-gray-700';
    
    const sizes = {
      sm: 'text-xs mb-1',
      md: 'text-sm mb-1',
      lg: 'text-base mb-2',
    };

    const classes = `${baseStyles} ${sizes[size]} ${className}`;

    return (
      <label
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };
export default Label;
