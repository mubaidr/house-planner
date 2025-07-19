'use client';

import React, { useState, createContext, useContext } from 'react';
import { forwardRef } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue = '', value, onValueChange, className = '', children, ...props }, ref) => {
    const [activeTab, setActiveTab] = useState(value || defaultValue);

    const handleTabChange = (tab: string) => {
      if (onValueChange) {
        onValueChange(tab);
      } else {
        setActiveTab(tab);
      }
    };

    const currentTab = value || activeTab;

    return (
      <TabsContext.Provider value={{ activeTab: currentTab, setActiveTab: handleTabChange }}>
        <div
          ref={ref}
          className={`w-full ${className}`}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className = '', children, ...props }, ref) => {
    const classes = `inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`;
    const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

    // Keyboard navigation handler
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const tabs = tabRefs.current;
      const activeIndex = tabs.findIndex((tab) => tab && tab === document.activeElement);

      if (tabs.length === 0) return;

      let nextIndex = -1;
      switch (event.key) {
        case 'ArrowRight':
          nextIndex = (activeIndex + 1) % tabs.length;
          break;
        case 'ArrowLeft':
          nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = tabs.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      if (nextIndex >= 0 && tabs[nextIndex]) {
        tabs[nextIndex]?.focus();
      }
    };

    // Clone children to inject refs
    const childrenWithRefs = React.Children.map(children, (child, idx) => {
      if (React.isValidElement(child) && child.type && (child.props.role === 'tab' || child.type.displayName === 'TabsTrigger')) {
        return React.cloneElement(child, {
          ref: (node: HTMLButtonElement) => {
            tabRefs.current[idx] = node;
            if (typeof child.ref === 'function') child.ref(node);
            else if (child.ref) (child.ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          },
        });
      }
      return child;
    });

    return (
      <div
        ref={ref}
        role="tablist"
        className={classes}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {childrenWithRefs}
      </div>
    );
  }
);

TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className = '', children, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within Tabs');

    const { activeTab, setActiveTab } = context;
    const isActive = activeTab === value;

    const classes = `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      isActive
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    } ${className}`;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        className={classes}
        onClick={() => setActiveTab(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className = '', children, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    const { activeTab } = context;

    if (activeTab !== value) return null;

    const classes = `mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${className}`;

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;
