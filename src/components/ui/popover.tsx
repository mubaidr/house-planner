'use client';

import React, { useState, useRef, useEffect } from 'react';
import { forwardRef } from 'react';

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const PopoverContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
} | null>(null);

const Popover = ({ open, onOpenChange, children, className = '' }: PopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className={`relative ${className}`}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(
  ({ asChild = false, children, className = '', ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    if (!context) throw new Error('PopoverTrigger must be used within Popover');

    const { isOpen, setIsOpen, triggerRef } = context;

    const handleClick = (event: React.MouseEvent) => {
      event.preventDefault();
      setIsOpen(!isOpen);
    };

    if (asChild) {
      // Clone the child element and add our props
      return React.cloneElement(children as React.ReactElement<any>, {
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          if (ref) {
            if (typeof ref === 'function') {
              ref(node);
            } else {
              (ref as React.MutableRefObject<HTMLElement | null>).current = node;
            }
          }
        },
        onClick: handleClick,
        'aria-expanded': isOpen,
        'aria-haspopup': 'dialog',
        ...props,
      });
    }

    return (
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (ref) {
            if (typeof ref === 'function') {
              ref(node);
            } else {
              ref.current = node;
            }
          }
        }}
        onClick={handleClick}
        className={`inline-flex items-center justify-center ${className}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        {...props}
      >
        {children}
      </button>
    );
  }
);

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, className = '', align = 'center', side = 'bottom', ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    if (!context) throw new Error('PopoverContent must be used within Popover');

    const { isOpen, setIsOpen, triggerRef } = context;
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
        // Focus trap: Tab/Shift+Tab cycling
        if (event.key === 'Tab' && contentRef.current) {
          const focusableEls = contentRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          );
          const focusable = Array.from(focusableEls);
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          } else if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
        // Move focus to popover content
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.focus();
          }
        }, 0);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
        // Return focus to trigger
        if (triggerRef.current) {
          triggerRef.current.focus();
        }
      };
    }, [isOpen, setIsOpen, triggerRef]);

    if (!isOpen) return null;

    const alignmentClasses = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    };

    const sideClasses = {
      top: 'bottom-full mb-2',
      bottom: 'top-full mt-2',
      left: 'right-full mr-2 top-0',
      right: 'left-full ml-2 top-0',
    };

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (ref) {
            if (typeof ref === 'function') {
              ref(node);
            } else {
              ref.current = node;
            }
          }
        }}
        className={`absolute z-50 rounded-md border border-gray-200 bg-white p-4 shadow-lg ${alignmentClasses[align]} ${sideClasses[side]} ${className}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PopoverTrigger.displayName = 'PopoverTrigger';
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };
export default Popover;
