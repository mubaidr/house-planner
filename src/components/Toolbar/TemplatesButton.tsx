'use client';

import React from 'react';
import { useTemplateStore } from '@/stores/templateStore';

export default function TemplatesButton() {
  const { toggleTemplateLibrary, templates } = useTemplateStore();

  const customTemplateCount = templates.filter(t => !t.isBuiltIn).length;

  return (
    <button
      onClick={toggleTemplateLibrary}
      className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
      title="Open template library"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <span>Templates</span>
      <div className="flex items-center space-x-1">
        <span className="bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          {templates.length}
        </span>
        {customTemplateCount > 0 && (
          <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            +{customTemplateCount}
          </span>
        )}
      </div>
    </button>
  );
}