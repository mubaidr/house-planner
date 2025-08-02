import React, { useState } from 'react';

interface CollapsiblePanelProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function CollapsiblePanel({
  title,
  icon,
  children,
  defaultExpanded = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors duration-200 ${headerClassName}`}
      >
        <div className="flex items-center space-x-2">
          {icon && <span className="text-sm">{icon}</span>}
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <span className={`text-gray-400 transform transition-transform duration-200 ${
          isExpanded ? 'rotate-180' : ''
        }`}>
          ▼
        </span>
      </button>

      {/* Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className={`p-4 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default CollapsiblePanel;
