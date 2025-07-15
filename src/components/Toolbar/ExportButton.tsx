'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage } from 'konva/lib/Stage';
import { ViewType2D } from '@/types/views';
import { useViewStore } from '@/stores/viewStore';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import ExportDialog from '../Export/ExportDialog';

interface ExportButtonProps {
  stage: Stage | null; // Konva Stage reference
}

export default function ExportButton({ stage }: ExportButtonProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [multiViewStages, setMultiViewStages] = useState<Record<ViewType2D, Stage | null>>({
    plan: null,
    front: null,
    back: null,
    left: null,
    right: null,
  });
  
  const { currentView } = useViewStore();
  const { walls, doors, windows, stairs, roofs } = useDesignStore();
  const { currentFloorId, getCurrentFloor } = useFloorStore();
  
  // Create hidden stages for each view for multi-view export
  const hiddenStageRefs = useRef<Record<ViewType2D, HTMLDivElement | null>>({
    plan: null,
    front: null,
    back: null,
    left: null,
    right: null,
  });

  // Generate stages for all views when export dialog opens
  useEffect(() => {
    if (showExportDialog) {
      generateMultiViewStages();
    }
  }, [showExportDialog, walls, doors, windows, stairs, roofs, currentFloorId]);

  // Cleanup stages when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (!showExportDialog) {
        import('@/utils/stageGenerator').then(({ cleanupStages }) => {
          cleanupStages(multiViewStages);
        });
      }
    };
  }, [showExportDialog, multiViewStages]);

  const generateMultiViewStages = async () => {
    try {
      // Import the stage generator
      const { generateAllViewStages, cleanupStages } = await import('@/utils/stageGenerator');
      
      // Clean up any existing stages
      cleanupStages(multiViewStages);
      
      // Get current floor elements
      const currentFloor = getCurrentFloor();
      const currentFloorElements = currentFloor ? currentFloor.elements : { walls, doors, windows, stairs, roofs, rooms: [] };
      
      // Prepare elements for stage generation
      const elements = {
        walls: currentFloorElements.walls,
        doors: currentFloorElements.doors,
        windows: currentFloorElements.windows,
        stairs: currentFloorElements.stairs,
        roofs: currentFloorElements.roofs,
        rooms: currentFloorElements.rooms || [],
      };
      
      // Generate stages for all views
      const generatedStages = await generateAllViewStages(
        elements,
        currentFloorId || 'floor-1',
        {
          width: 800,
          height: 600,
          scale: 1,
          showGrid: false,
          showMaterials: true,
          showDimensions: true,
          showAnnotations: true,
        }
      );
      
      // Use the current stage for the current view if available
      if (stage) {
        generatedStages[currentView] = stage;
      }
      
      setMultiViewStages(generatedStages);
    } catch (error) {
      console.error('Failed to generate multi-view stages:', error);
      
      // Fallback: just use current stage
      const fallbackStages: Record<ViewType2D, Stage | null> = {
        plan: null,
        front: null,
        back: null,
        left: null,
        right: null,
      };
      
      if (stage) {
        fallbackStages[currentView] = stage;
      }
      
      setMultiViewStages(fallbackStages);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowExportDialog(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        title="Export design as PNG or PDF"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Export</span>
      </button>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        stage={stage}
        stages={multiViewStages}
      />
    </>
  );
}