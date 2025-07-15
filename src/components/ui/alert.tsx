'use client';

import React from 'react';
import { forwardRef } from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  children: React.ReactNode;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const variantClasses = {
      default: 'border-gray-200 bg-gray-50 text-gray-800',
      destructive: 'border-red-200 bg-red-50 text-red-800',
      warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      success: 'border-green-200 bg-green-50 text-green-800',
    };

    const classes = `relative w-full rounded-lg border p-4 ${variantClasses[variant]} ${className}`;

    return (
      <div
        ref={ref}
        role="alert"
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const AlertDescription = forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    const classes = `text-sm ${className}`;

    return (
      <p
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </p>
    );
  }
);

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };
export default Alert;
