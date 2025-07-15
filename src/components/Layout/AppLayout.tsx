'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useMaterialStore } from '@/stores/materialStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import Toolbar from '@/components/Toolbar/Toolbar';
import ElementsSidebar from '@/components/Sidebar/ElementsSidebar';
import PropertiesPanel from '@/components/Properties/PropertiesPanel';
import StatusBar from '@/components/StatusBar/StatusBar';
import ViewSwitcher from '@/components/ViewSwitcher/ViewSwitcher';
import MeasurementControls from '@/components/Toolbar/MeasurementControls';
import DoorAnimationControls from '@/components/Toolbar/DoorAnimationControls';
import EnhancedAnnotationToolbar from '@/components/Toolbar/EnhancedAnnotationToolbar';
import DrawingCanvas from '@/components/Canvas/DrawingCanvas';
import FloorSwitcher from '@/components/Floor/FloorSwitcher';
import MaterialLibrary from '@/components/Materials/MaterialLibrary';
import TemplateLibrary from '@/components/Templates/TemplateLibrary';
import ExportDialog from '@/components/Export/ExportDialog';
import ImportDialog from '@/components/Export/ImportDialog';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed, propertiesPanelCollapsed, setExportDialogOpen, setImportDialogOpen, isExportDialogOpen, isImportDialogOpen } = useUIStore();
  const { isLibraryOpen } = useMaterialStore();
  const { isTemplateLibraryOpen } = useTemplateStore();
  
  // Enable auto-save every 30 seconds
  useAutoSave(30000);

  const handleExportTemplates = () => {
    setExportDialogOpen(true);
  };

  const handleImportAnnotations = () => {
    setImportDialogOpen(true);
  };

  const handleExportAnnotations = () => {
    // Logic to handle exporting annotations
    console.log('Exporting annotations...');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Mobile/Tablet responsive grid layout */}
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-layout { display: none; }
          .mobile-layout { display: flex; }
        }
        @media (min-width: 769px) {
          .desktop-layout { display: flex; }
          .mobile-layout { display: none; }
        }
        @media (min-width: 1024px) {
          .sidebar-width { width: 16rem; }
        }
        @media (max-width: 1023px) {
          .sidebar-width { width: 12rem; }
        }
      `}</style>
      {/* Header with Toolbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <Toolbar />
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 transition-all duration-300 ${
            sidebarCollapsed ? 'w-0' : 'w-64'
          } overflow-hidden`}
        >
          <ElementsSidebar />
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 bg-gray-50 relative overflow-hidden">
          <DrawingCanvas />
          <ViewSwitcher />
          <FloorSwitcher />
          <MeasurementControls />
          <DoorAnimationControls />
          <EnhancedAnnotationToolbar 
            onExportTemplates={handleExportTemplates}
            onImportAnnotations={handleImportAnnotations}
            onExportAnnotations={handleExportAnnotations}
          />
          {children}
        </main>

        {/* Right Properties Panel */}
        <aside
          className={`bg-white border-l border-gray-200 transition-all duration-300 ${
            propertiesPanelCollapsed ? 'w-0' : 'w-80'
          } overflow-hidden`}
        >
          <PropertiesPanel />
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="bg-white border-t border-gray-200">
        <StatusBar />
      </footer>

      {/* Material Library Modal */}
      {isLibraryOpen && <MaterialLibrary />}

      {/* Template Library Modal */}
      {isTemplateLibraryOpen && <TemplateLibrary />}

      {/* Export and Import Dialogs */}
      {isExportDialogOpen && <ExportDialog />}
      {isImportDialogOpen && <ImportDialog />}
    </div>
  );
}