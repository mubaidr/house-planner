'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useMaterialStore } from '@/stores/materialStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useErrorStore } from '@/stores/errorStore';
import { useAccessibilityStore } from '@/stores/accessibilityStore';
import { useFloorStore } from '@/stores/floorStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import AccessibilitySettingsPanel from '@/components/Accessibility/AccessibilitySettingsPanel';
import AlternativeElementList from '@/components/Accessibility/AlternativeElementList';
import ErrorNotification from '@/components/ErrorHandling/ErrorNotification';
import { Button } from '@/components/ui/button';
import { List, Accessibility } from 'lucide-react';
import { Toolbar } from '@/components/Toolbar/Toolbar';
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
import { Alert } from '@/components/ui/alert';


interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed, propertiesPanelCollapsed, setExportDialogOpen, setImportDialogOpen, isExportDialogOpen, isImportDialogOpen } = useUIStore();
  const { isLibraryOpen } = useMaterialStore();
  const { isTemplateLibraryOpen } = useTemplateStore();
  const { error, setError } = useErrorStore();
    const { highContrastMode, largerFocusIndicators, enableAlternativeElementList, showElementList, toggleElementList } = useAccessibilityStore();

  // Local state for accessibility panels
  const [isAccessibilitySettingsOpen, setIsAccessibilitySettingsOpen] = useState(false);

  // Enable auto-save every 30 seconds
  useAutoSave(30000);

  const handleExportTemplates = () => {
    setExportDialogOpen(true);
  };

  const handleImportAnnotations = () => {
    setImportDialogOpen(true);
  };

  const handleExportAnnotations = async () => {
    try {
      const { floors } = useFloorStore.getState();

      // Collect all annotations from all floors (walls, rooms)
      const annotations = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        floors: floors.map(floor => ({
          id: floor.id,
          name: floor.name,
          annotations: {
            walls: floor.elements.walls || [],
            rooms: floor.elements.rooms || []
          }
        }))
      };

      // Export as JSON
      const jsonBlob = new Blob([JSON.stringify(annotations, null, 2)], {
        type: 'application/json'
      });

      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonA = document.createElement('a');
      jsonA.href = jsonUrl;
      jsonA.download = `annotations-${Date.now()}.json`;
      jsonA.click();
      URL.revokeObjectURL(jsonUrl);

      // Also export as CSV for compatibility
      const csvData = generateAnnotationsCSV(floors);
      const csvBlob = new Blob([csvData], { type: 'text/csv' });
      const csvUrl = URL.createObjectURL(csvBlob);
      const csvA = document.createElement('a');
      csvA.href = csvUrl;
      csvA.download = `annotations-${Date.now()}.csv`;
      csvA.click();
      URL.revokeObjectURL(csvUrl);

    } catch (error) {
      useErrorStore.getState().setError('Failed to export annotations', 'error', { error });
    }
  };

  const escapeCSV = (value: any) => {
    if (value == null) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) {
      // Escape double quotes by doubling them, wrap in quotes
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const generateAnnotationsCSV = (floors: any[]) => {
    const headers = ['Floor', 'Type', 'ID/Name', 'X1', 'Y1', 'X2', 'Y2'];
    const rows = floors.flatMap(floor => [
      ...(floor.elements.walls || []).map((wall: any) => [
        floor.name,
        'Wall',
        wall.id || '',
        wall.startX || 0,
        wall.startY || 0,
        wall.endX || 0,
        wall.endY || 0
      ]),
      ...(floor.elements.rooms || []).map((room: any) => [
        floor.name,
        'Room',
        room.name || '',
        '', '', '', ''
      ])
    ]);
    return [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  };

  return (
  <div className={`h-screen w-screen flex flex-col bg-gray-100 ${highContrastMode ? 'high-contrast' : ''}`}>
      {/* Skip Links for Accessibility */}
      <a
        href="#main-content"
        className="skip-link focus-enhanced"
        tabIndex={1}
      >
        Skip to main content
      </a>
      <a
        href="#accessibility-controls"
        className="skip-link focus-enhanced"
        tabIndex={2}
      >
        Skip to accessibility controls
      </a>

      {/* Error Notifications */}
      <ErrorNotification />

      {/* Legacy error alert - keeping for backward compatibility */}
      {error && <Alert message={error} onClose={() => setError(null)} />}
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
        <main id="main-content" className="flex-1 bg-gray-50 relative overflow-hidden">
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

          {/* Accessibility Controls */}
          <div
            id="accessibility-controls"
            className="fixed bottom-4 left-4 z-40 flex flex-col space-y-2"
          >
            {(highContrastMode || largerFocusIndicators) && <>
                <Button
                  onClick={() => setIsAccessibilitySettingsOpen(true)}
                  variant="outline"
                  size="sm"
                  className={`bg-white shadow-lg ${largerFocusIndicators ? 'large-focus' : 'focus-enhanced'}`}
                  aria-label="Open accessibility settings"
                  title="Accessibility Settings"
                >
                  <Accessibility className="w-4 h-4" />
                </Button>

                {enableAlternativeElementList && (
                  <Button
                    onClick={toggleElementList}
                    variant="outline"
                    size="sm"
                    className={`bg-white shadow-lg ${largerFocusIndicators ? 'large-focus' : 'focus-enhanced'}`}
                    aria-label="Toggle element list view"
                    title="Alternative Element List"
                    aria-pressed={showElementList}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                )}
              </>}
          </div>

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
      {isExportDialogOpen && (
        <ExportDialog isOpen={isExportDialogOpen} onClose={() => setExportDialogOpen(false)} stage={null} />
      )}
      {isImportDialogOpen && (
        <ImportDialog />
      )}

      {/* Accessibility Dialogs */}
      <AccessibilitySettingsPanel
        isOpen={isAccessibilitySettingsOpen}
        onClose={() => setIsAccessibilitySettingsOpen(false)}
      />

      <AlternativeElementList
        isOpen={showElementList}
        onClose={toggleElementList}
      />
    </div>
  );
};
