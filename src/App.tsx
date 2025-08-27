import { Scene3D } from '@/components/Canvas3D/Scene3D';
import { CADLayout } from '@/components/Layout/CADLayout';
import { ElementContextMenu } from '@/components/UI/ContextMenu';
import { PropertiesPanel } from '@/components/UI/PropertiesPanel';
import { ToolPanel } from '@/components/UI/ToolPanel';
import { ViewControls } from '@/components/UI/ViewControls';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useState } from 'react';

export default function App() {
  const [useCADInterface, setUseCADInterface] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'classic'>('dark');

  useKeyboardShortcuts();

  // Toggle between CAD interface and simple interface
  const toggleInterface = () => {
    setUseCADInterface(!useCADInterface);
  };

  if (useCADInterface) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <CADLayout theme={theme} workspaceLayout="3d-modeling" />
        <ElementContextMenu />

        {/* Interface Toggle Button */}
        <button
          onClick={toggleInterface}
          className="fixed top-2 right-2 z-50 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          title="Switch to Simple Interface"
        >
          Simple UI
        </button>

        {/* Theme Selector */}
        <div className="fixed top-2 right-20 z-50">
          <select
            value={theme}
            onChange={e => setTheme(e.target.value as 'light' | 'dark' | 'classic')}
            className="px-2 py-1 bg-gray-800 text-white text-xs rounded border border-gray-600"
          >
            <option value="dark">Dark Theme</option>
            <option value="light">Light Theme</option>
            <option value="classic">Classic Theme</option>
          </select>
        </div>
      </div>
    );
  }

  // Fallback to original simple interface
  return (
    <div className="h-screen w-screen relative">
      <Scene3D />
      <ToolPanel />
      <ViewControls />
      <PropertiesPanel />
      <ElementContextMenu />

      {/* Interface Toggle Button */}
      <button
        onClick={toggleInterface}
        className="fixed top-4 right-4 z-50 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        title="Switch to CAD Interface"
      >
        CAD UI
      </button>
    </div>
  );
}
