'use client';

import { Scene3D } from '@/components/Canvas3D/Scene3D';
import { ViewControls } from '@/components/UI/ViewControls';
import { ToolPanel } from '@/components/UI/ToolPanel';
import { DemoSceneCreator } from '@/components/UI/DemoSceneCreator';
import { useDesignStore } from '@/stores/designStore';

export default function Home() {
  const { viewMode } = useDesignStore();

  return (
    <div className="h-screen w-screen flex bg-gray-50">
      {/* Left sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">3D</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">House Planner</h1>
        </div>

        <ViewControls />
        <DemoSceneCreator />
        <ToolPanel />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {viewMode === '3d' ? '3D View' : viewMode === '2d' ? '2D View' : 'Hybrid View'}
            </h2>
            <div className="text-sm text-gray-500">
              Phase 2 - Enhanced 3D Elements with Animations
            </div>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative">
          {viewMode === '3d' && (
            <Scene3D
              className="w-full h-full"
              onElementSelect={(id, type) => {
                console.log(`Selected ${type}: ${id}`);
              }}
            />
          )}

          {viewMode === '2d' && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">2D View</h3>
                <p className="text-gray-600">2D Canvas implementation coming next!</p>
              </div>
            </div>
          )}

          {viewMode === 'hybrid' && (
            <div className="w-full h-full flex">
              <div className="w-1/2 border-r border-gray-300">
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">2D View</h3>
                    <p className="text-gray-600">2D Canvas</p>
                  </div>
                </div>
              </div>
              <div className="w-1/2">
                <Scene3D
                  className="w-full h-full"
                  onElementSelect={(id, type) => {
                    console.log(`Selected ${type}: ${id}`);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
