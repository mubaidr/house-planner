import { Scene3D } from '@/components/Canvas3D/Scene3D';
import { CommandLine } from '@/components/UI/CAD/CommandLine';
import { CoordinateDisplay } from '@/components/UI/CAD/CoordinateDisplay';
import { LayerManager } from '@/components/UI/CAD/LayerManager';
import { MenuBar } from '@/components/UI/CAD/MenuBar';
import { NavigationCube } from '@/components/UI/CAD/NavigationCube';
import { PropertiesPalette } from '@/components/UI/CAD/PropertiesPalette';
import { QuickAccessToolbar } from '@/components/UI/CAD/QuickAccessToolbar';
import { StatusBar } from '@/components/UI/CAD/StatusBar';
import { ToolPalette } from '@/components/UI/CAD/ToolPalette';
import { ViewportManager } from '@/components/UI/CAD/ViewportManager';
import { ViewportTabs } from '@/components/UI/CAD/ViewportTabs';
import { useCallback, useState } from 'react';

export interface CADLayoutProps {
  theme?: 'light' | 'dark' | 'classic';
  workspaceLayout?: 'drafting' | '3d-modeling' | 'planning' | 'custom';
  activeTool: string | null;
}

export interface PanelState {
  isVisible: boolean;
  isCollapsed: boolean;
  width?: number;
  height?: number;
  position?: 'left' | 'right' | 'top' | 'bottom' | 'floating';
}

export interface WorkspaceState {
  leftPanel: PanelState;
  rightPanel: PanelState;
  bottomPanel: PanelState;
  commandLine: PanelState;
  statusBar: PanelState;
  menuBar: PanelState;
  quickAccess: PanelState;
}

const defaultWorkspaceState: WorkspaceState = {
  leftPanel: { isVisible: true, isCollapsed: false, width: 280 },
  rightPanel: { isVisible: true, isCollapsed: false, width: 320 },
  bottomPanel: { isVisible: true, isCollapsed: false, height: 200 },
  commandLine: { isVisible: true, isCollapsed: false, height: 40 },
  statusBar: { isVisible: true, isCollapsed: false, height: 24 },
  menuBar: { isVisible: true, isCollapsed: false, height: 32 },
  quickAccess: { isVisible: true, isCollapsed: false, height: 48 },
};

export function CADLayout({ theme = 'dark', workspaceLayout = '3d-modeling', activeTool }: CADLayoutProps) {
  const [workspace, setWorkspace] = useState<WorkspaceState>(defaultWorkspaceState);
  const [activeViewport, setActiveViewport] = useState('perspective');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const updatePanel = useCallback(
    (panelKey: keyof WorkspaceState, updates: Partial<PanelState>) => {
      setWorkspace(prev => ({
        ...prev,
        [panelKey]: { ...prev[panelKey], ...updates },
      }));
    },
    []
  );

  const togglePanel = useCallback(
    (panel: string) => {
      const panelKey = panel as keyof WorkspaceState;
      setWorkspace(prev => {
        if (panelKey in prev) {
          return {
            ...prev,
            [panelKey]: { ...prev[panelKey], isVisible: !prev[panelKey].isVisible },
          };
        }
        return prev;
      });
    },
    []
  );

  const collapsePanel = useCallback(
    (panelKey: keyof WorkspaceState) => {
      setWorkspace(prev => ({
        ...prev,
        [panelKey]: { ...prev[panelKey], isCollapsed: !prev[panelKey].isCollapsed },
      }));
    },
    []
  );

  const executeCommand = useCallback((command: string) => {
    setCommandHistory(prev => [...prev, command]);
    // Command execution logic will be handled by command processor
    console.log('Executing command:', command);
  }, []);

  const resetWorkspace = useCallback(() => {
    setWorkspace(defaultWorkspaceState);
  }, []);

  const saveWorkspace = useCallback(() => {
    localStorage.setItem('cad-workspace', JSON.stringify(workspace));
  }, [workspace]);

  const loadWorkspace = useCallback(() => {
    const saved = localStorage.getItem('cad-workspace');
    if (saved) {
      setWorkspace(JSON.parse(saved));
    }
  }, []);

  // Calculate dynamic dimensions
  const leftPanelWidth =
    workspace.leftPanel.isVisible && !workspace.leftPanel.isCollapsed
      ? workspace.leftPanel.width || 280
      : 0;
  const rightPanelWidth =
    workspace.rightPanel.isVisible && !workspace.rightPanel.isCollapsed
      ? workspace.rightPanel.width || 320
      : 0;
  const bottomPanelHeight =
    workspace.bottomPanel.isVisible && !workspace.bottomPanel.isCollapsed
      ? workspace.bottomPanel.height || 200
      : 0;
  const commandLineHeight = workspace.commandLine.isVisible
    ? workspace.commandLine.height || 40
    : 0;
  const statusBarHeight = workspace.statusBar.isVisible ? workspace.statusBar.height || 24 : 0;
  const menuBarHeight = workspace.menuBar.isVisible ? workspace.menuBar.height || 32 : 0;
  const quickAccessHeight = workspace.quickAccess.isVisible
    ? workspace.quickAccess.height || 48
    : 0;

  const viewportHeight = `calc(100vh - ${menuBarHeight + quickAccessHeight + commandLineHeight + statusBarHeight}px)`;
  const viewportWidth = `calc(100vw - ${leftPanelWidth + rightPanelWidth}px)`;

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden ${
        theme === 'dark'
          ? 'bg-gray-900 text-white'
          : theme === 'light'
            ? 'bg-white text-gray-900'
            : 'bg-gray-800 text-gray-100'
      }`}
    >
      {/* Menu Bar */}
      {workspace.menuBar.isVisible && (
        <MenuBar
          height={menuBarHeight}
          onTogglePanel={togglePanel}
          onResetWorkspace={resetWorkspace}
          onSaveWorkspace={saveWorkspace}
          onLoadWorkspace={loadWorkspace}
          theme={theme}
        />
      )}

      {/* Quick Access Toolbar */}
      {workspace.quickAccess.isVisible && (
        <QuickAccessToolbar height={quickAccessHeight} theme={theme} />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        {workspace.leftPanel.isVisible && (
          <div
            className={`flex-shrink-0 border-r border-gray-600 ${
              workspace.leftPanel.isCollapsed ? 'w-8' : ''
            }`}
            style={{ width: workspace.leftPanel.isCollapsed ? 32 : leftPanelWidth }}
          >
            {!workspace.leftPanel.isCollapsed && (
              <div className="h-full flex flex-col">
                <ToolPalette onCollapsePanel={() => collapsePanel('leftPanel')} theme={theme} />
                <LayerManager theme={theme} />
              </div>
            )}
            {workspace.leftPanel.isCollapsed && (
              <div className="h-full w-8 bg-gray-800 border-r border-gray-600 flex flex-col items-center py-2">
                <button
                  onClick={() => collapsePanel('leftPanel')}
                  className="p-1 hover:bg-gray-700 rounded text-xs"
                  title="Expand Tools"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Center Viewport Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Viewport Tabs */}
          <ViewportTabs
            activeViewport={activeViewport}
            onViewportChange={setActiveViewport}
            theme={theme}
          />

          {/* Main Viewport */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{ height: viewportHeight, width: viewportWidth }}
          >
            <Scene3D />

            {/* Viewport Overlays */}
            <NavigationCube className="absolute top-4 right-4" theme={theme} />

            <CoordinateDisplay className="absolute bottom-4 left-4" theme={theme} />

            <ViewportManager
              activeViewport={activeViewport}
              className="absolute top-4 left-4"
              theme={theme}
            />
          </div>

          {/* Bottom Panel */}
          {workspace.bottomPanel.isVisible && (
            <div
              className={`border-t border-gray-600 ${
                workspace.bottomPanel.isCollapsed ? 'h-8' : ''
              }`}
              style={{ height: workspace.bottomPanel.isCollapsed ? 32 : bottomPanelHeight }}
            >
              {!workspace.bottomPanel.isCollapsed && (
                <div className="h-full p-2">
                  <div className="text-sm font-medium mb-2">Output / History</div>
                  <div className="h-full bg-gray-800 rounded p-2 overflow-y-auto text-xs font-mono">
                    {commandHistory.map((cmd, index) => (
                      <div key={index} className="text-green-400">
                        Command: {cmd}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {workspace.bottomPanel.isCollapsed && (
                <div className="h-8 bg-gray-800 border-t border-gray-600 flex items-center px-2">
                  <button
                    onClick={() => collapsePanel('bottomPanel')}
                    className="text-xs hover:bg-gray-700 px-2 py-1 rounded"
                  >
                    ↑ Expand Output
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel */}
        {workspace.rightPanel.isVisible && (
          <div
            className={`flex-shrink-0 border-l border-gray-600 ${
              workspace.rightPanel.isCollapsed ? 'w-8' : ''
            }`}
            style={{ width: workspace.rightPanel.isCollapsed ? 32 : rightPanelWidth }}
          >
            {!workspace.rightPanel.isCollapsed && (
              <PropertiesPalette
                onCollapsePanel={() => collapsePanel('rightPanel')}
                theme={theme}
              />
            )}
            {workspace.rightPanel.isCollapsed && (
              <div className="h-full w-8 bg-gray-800 border-l border-gray-600 flex flex-col items-center py-2">
                <button
                  onClick={() => collapsePanel('rightPanel')}
                  className="p-1 hover:bg-gray-700 rounded text-xs"
                  title="Expand Properties"
                >
                  ←
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Command Line */}
      {workspace.commandLine.isVisible && (
        <CommandLine
          height={commandLineHeight}
          onExecuteCommand={executeCommand}
          commandHistory={commandHistory}
          theme={theme}
        />
      )}

      {/* Status Bar */}
      {workspace.statusBar.isVisible && <StatusBar height={statusBarHeight} theme={theme} activeTool={activeTool} />}
    </div>
  );
}
