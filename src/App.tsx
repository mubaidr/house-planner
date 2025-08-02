import React from 'react';
import { Scene3D } from '@/components/Canvas3D/Scene3D';
import EnhancedToolPanel from '@/components/UI/EnhancedToolPanel';
import DemoSceneCreator from '@/components/UI/DemoSceneCreator';
import '@/styles/globals.css';

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Sidebar */}
      <aside className="w-80 p-4 bg-white/80 border-r border-gray-200 flex flex-col gap-4 shadow-lg z-10">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">3D House Planner</h1>
        <DemoSceneCreator />
        <EnhancedToolPanel />
      </aside>
      {/* Main 3D Canvas */}
      <main className="flex-1 relative">
        <Scene3D className="absolute inset-0" />
      </main>
    </div>
  );
};

export default App;
