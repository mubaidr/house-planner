'use client';

import { Scene3D } from '@/components/Canvas3D/Scene3D';
import { EnhancedViewControls } from '@/components/UI/EnhancedViewControls';
import { EnhancedToolPanel } from '@/components/UI/EnhancedToolPanel';
import { StatusPanel } from '@/components/UI/StatusPanel';
import { DemoSceneCreator } from '@/components/UI/DemoSceneCreator';
import { useDesignStore } from '@/stores/designStore';

export default function Home() {
  const { viewMode } = useDesignStore();

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 p-4 space-y-4 overflow-y-auto shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">3D</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">House Planner</h1>
            <p className="text-xs text-gray-500">3D Design Studio</p>
          </div>
        </div>

        <DemoSceneCreator />
        <EnhancedViewControls />
        <EnhancedToolPanel />
      </div>

      {/* Right sidebar */}
      <div className="w-72 bg-white/80 backdrop-blur-sm border-l border-gray-200/50 p-4 space-y-4 overflow-y-auto shadow-lg">
        <StatusPanel />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {viewMode === '3d' ? '🎯 3D View' : viewMode === '2d' ? '📐 2D View' : '🔄 Hybrid View'}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Ready for testing</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
                Phase 2 Complete - Enhanced Interface
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Canvas area with enhanced styling */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200">
          {viewMode === '3d' && (
            <div className="w-full h-full relative">
              <Scene3D
                className="w-full h-full rounded-lg"
                onElementSelect={(id, type) => {
                  console.log(`✅ Selected ${type}: ${id}`);
                }}
              />
              {/* Overlay for better visual feedback */}
              <div className="absolute top-4 left-4 bg-black/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-sm text-white font-medium">3D Scene Active</div>
              </div>
            </div>
          )}

          {viewMode === '2d' && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
                <div className="text-4xl mb-4">📐</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">2D Canvas View</h3>
                <p className="text-gray-600 mb-4">2D implementation coming in Phase 3!</p>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
                  ⏳ Next phase development
                </div>
              </div>
            </div>
          )}

          {viewMode === 'hybrid' && (
            <div className="w-full h-full flex rounded-lg overflow-hidden">
              <div className="w-1/2 border-r-2 border-gray-300">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                    <div className="text-3xl mb-3">📐</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">2D Canvas</h3>
                    <p className="text-gray-600 text-sm">Coming in Phase 3</p>
                  </div>
                </div>
              </div>
              <div className="w-1/2 relative">
                <Scene3D
                  className="w-full h-full"
                  onElementSelect={(id, type) => {
                    console.log(`✅ Selected ${type}: ${id}`);
                  }}
                />
                <div className="absolute top-4 right-4 bg-black/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="text-sm text-white font-medium">3D View</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
