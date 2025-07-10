'use client';

import React from 'react';
import { Tool } from '@/stores/uiStore';

interface ToolButtonProps {
  tool: Tool;
  label: string;
  icon: string;
  shortcut?: string;
  isActive: boolean;
  onClick: () => void;
}

export default function ToolButton({
  label,
  icon,
  shortcut,
  isActive,
  onClick,
}: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200
        min-w-[60px] h-16 text-xs
        ${
          isActive
            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
            : 'bg-white text-gray-600 border-2 border-transparent hover:bg-gray-50 hover:border-gray-200'
        }
      `}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <span className="text-lg mb-1">{icon}</span>
      <span className="font-medium">{label}</span>
      {shortcut && (
        <span className="text-xs opacity-60 mt-0.5">{shortcut}</span>
      )}
    </button>
  );
}