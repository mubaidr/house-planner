'use client';

import React from 'react';
import { forwardRef } from 'react';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dashed' | 'dotted';
}

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = 'horizontal', size = 'md', variant = 'default', className = '', ...props }, ref) => {
    const baseStyles = 'bg-gray-200 flex-shrink-0';
    
    const orientationStyles = {
      horizontal: 'w-full h-px',
      vertical: 'h-full w-px',
    };

    const sizes = {
      sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
      md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
      lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
    };

    const variants = {
      default: 'bg-gray-200',
      dashed: 'bg-transparent border-t border-dashed border-gray-300',
      dotted: 'bg-transparent border-t border-dotted border-gray-300',
    };

    // Adjust variant styles for vertical orientation
    const variantStyles = orientation === 'vertical' && variant !== 'default' 
      ? variants[variant].replace('border-t', 'border-l')
      : variants[variant];

    const classes = `${baseStyles} ${orientationStyles[orientation]} ${sizes[size]} ${variantStyles} ${className}`;

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={classes}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

export { Separator };
export default Separator;
