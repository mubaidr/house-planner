'use client';

import React from 'react';
import { useMaterialStore } from '@/stores/materialStore';

export default function MaterialsButton() {
  const { toggleLibrary, materials } = useMaterialStore();

  return (
    <button
      onClick={toggleLibrary}
      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
      title="Open material library"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
      </svg>
      <span>Materials</span>
      <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
        {materials.length}
      </span>
    </button>
  );
}