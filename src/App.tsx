import React from 'react';
import { Scene3D } from '@/components/Canvas3D/Scene3D';
import EnhancedToolPanel from '@/components/UI/EnhancedToolPanel';
import DemoSceneCreator from '@/components/UI/DemoSceneCreator';
import EnhancedViewControls from '@/components/UI/EnhancedViewControls';
import StatusPanel from '@/components/UI/StatusPanel';
import CollapsiblePanel from '@/components/UI/CollapsiblePanel';
import '@/styles/globals.css';

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Sidebar - Made narrower and more compact */}
      <aside className="w-72 h-full flex flex-col bg-white/95 border-r border-gray-200 shadow-lg z-10 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white/95 flex-shrink-0">
          <h1 className="text-xl font-bold text-blue-700 tracking-tight">3D House Planner</h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Project Section */}
            <CollapsiblePanel title="Project" icon="📁" defaultExpanded={true}>
              <DemoSceneCreator />
            </CollapsiblePanel>

            {/* Building Tools Section */}
            <CollapsiblePanel title="Building Tools" icon="🔨" defaultExpanded={true}>
              <EnhancedToolPanel />
            </CollapsiblePanel>

            {/* View & Settings Section - Less expanded by default since FAB handles view switching */}
            <CollapsiblePanel title="View & Settings" icon="⚙️" defaultExpanded={false}>
              <EnhancedViewControls />
            </CollapsiblePanel>

            {/* Status & Info Section */}
            <CollapsiblePanel title="Status & Info" icon="📊" defaultExpanded={false}>
              <StatusPanel />
            </CollapsiblePanel>
          </div>
        </div>
      </aside>

      {/* Main 3D Canvas */}
      <main className="flex-1 relative">
        <Scene3D className="absolute inset-0" />
      </main>
    </div>
  );
};

export default App;
