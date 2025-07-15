'use client';

import React, { useState, useRef, useEffect } from 'react';
import { forwardRef } from 'react';

// Simple Select component (backward compatibility)
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'error';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  placeholder?: string;
  children: React.ReactNode;
}

const SimpleSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ variant = 'default', size = 'md', error, placeholder, className = '', children, ...props }, ref) => {
    const baseStyles = 'block w-full border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed appearance-none';
    
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
        <div className="relative">
          <select
            ref={ref}
            className={classes}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
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

SimpleSelect.displayName = 'SimpleSelect';

// Advanced Select component with compound components
interface CompoundSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

const Select = ({ value, onValueChange, children, className = '' }: CompoundSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className={`relative ${className}`}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className = '' }: SelectTriggerProps) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');
  
  const { isOpen, setIsOpen } = context;
  
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      {children}
      <svg
        className="h-4 w-4 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
};

const SelectContent = ({ children, className = '' }: SelectContentProps) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');
  
  const { isOpen, setIsOpen } = context;
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={contentRef}
      className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg ${className}`}
      role="listbox"
    >
      {children}
    </div>
  );
};

const SelectItem = ({ value, children, className = '' }: SelectItemProps) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');
  
  const { value: selectedValue, onValueChange, setIsOpen } = context;
  const isSelected = selectedValue === value;
  
  return (
    <button
      type="button"
      onClick={() => {
        onValueChange?.(value);
        setIsOpen(false);
      }}
      className={`flex w-full cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${
        isSelected ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
      } ${className}`}
      role="option"
      aria-selected={isSelected}
    >
      {children}
    </button>
  );
};

const SelectValue = ({ placeholder, className = '' }: SelectValueProps) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');
  
  const { value } = context;
  
  return (
    <span className={`block truncate ${className}`}>
      {value || placeholder}
    </span>
  );
};

// Export both simple and compound versions
export default SimpleSelect;
export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
