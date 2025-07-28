'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Line, Group } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { handleError } from '@/utils/errorHandler';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Stair } from '@/types/elements/Stair';
import { Roof } from '@/types/elements/Roof';
import { useUIStore } from '@/stores/uiStore';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useViewStore } from '@/stores/viewStore';
import { useFloorStore } from '@/stores/floorStore';
import { useWallTool } from '@/hooks/useWallTool';
import { useWallEditor } from '@/hooks/useWallEditor';
import { useDoorEditor } from '@/hooks/useDoorEditor';
import { useWindowEditor } from '@/hooks/useWindowEditor';
import { useDoorTool } from '@/hooks/useDoorTool';
import { useWindowTool } from '@/hooks/useWindowTool';
import { useMeasureTool } from '@/hooks/useMeasureTool';
import { useDimensionTool } from '@/hooks/useDimensionTool';
import { useStairTool } from '@/hooks/useStairTool';
import { useRoofTool } from '@/hooks/useRoofTool';
import { useCanvasControls } from '@/hooks/useCanvasControls';
import Grid from './Grid';
import SnapIndicators from './SnapIndicators';
import ConstraintIndicators from './ConstraintIndicators';
import IntersectionIndicators from './IntersectionIndicators';
import MeasurementDisplay from './MeasurementDisplay';
import DimensionAnnotations from './DimensionAnnotations';
// import EnhancedRoomEditor from './EnhancedRoomEditor'; // Not used yet
import DoorComponent from './elements/DoorComponent';
import WindowComponent from './elements/WindowComponent';
import StairComponent from './elements/StairComponent';
import RoofComponent from './elements/RoofComponent';
import DoorFloatingControls from './DoorFloatingControls';
import MaterializedRoomOverlay from './MaterializedRoomOverlay';
import MaterializedWallComponent from './MaterializedWallComponent';
import MaterializedDoorComponent from './MaterializedDoorComponent';
// Import new view renderers
import PlanViewRenderer2D from './renderers/PlanViewRenderer2D';
import ElevationRenderer2D from './renderers/ElevationRenderer2D';
// Import element converter utilities
import { convertElementsToElement2D, getElementTypeFromElement2D } from '@/utils/elementTypeConverter';
// Import wall joining system
import { useWallJoining2D } from '@/hooks/useWallJoining2D';
import WallJoinIndicators from './WallJoinIndicators';
// Import roof-wall integration system
import { useRoofWallIntegration2D } from '@/hooks/useRoofWallIntegration2D';
import RoofWallConnectionIndicators from './RoofWallConnectionIndicators';
// Import opening integration system
import { useOpeningIntegration2D } from '@/hooks/useOpeningIntegration2D';
// Import dimension system
import { useDimensionManager2D } from '@/hooks/useDimensionManager2D';
import AnnotationRenderer2D from '@/components/Annotations/AnnotationRenderer2D';
// Import clipboard functionality
import { useClipboard } from '@/hooks/useClipboard';
import ContextMenu from './ContextMenu';
// Import accessibility features
import { useCanvasKeyboardNavigation } from '@/hooks/useCanvasKeyboardNavigation';
import { AccessibilityAnnouncer, useAccessibilityAnnouncer } from '@/components/Accessibility/AccessibilityAnnouncer';
import { useAccessibilityStore } from '@/stores/accessibilityStore';
// Import element movement functionality
import { useElementMovement } from '@/hooks/useElementMovement';

export default function DrawingCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    zoomLevel,
    canvasWidth,
    canvasHeight,
    setCanvasSize,
    showGrid,
    activeTool,
    setActiveTool,
    setMouseCoordinates,
  } = useUIStore();

  const { currentView, getViewTransform, isTransitioning } = useViewStore();
  const { walls, doors, windows, stairs, roofs, clearSelection, selectedElementId, selectedElementType, selectElement, syncWithCurrentFloor } = useDesignStore();
  const { currentFloorId, getCurrentFloor, showAllFloors, floorOpacity, getFloorsOrderedByLevel } = useFloorStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();

  // Clipboard functionality
  const { copyElement, pasteElement, hasClipboardData } = useClipboard();

  // Element movement functionality
  const {
    handleWallDragMove,
    handleDoorDragMove,
    handleWindowDragMove,
    handleStairDragMove,
    handleRoofDragMove,
    handleElementDragEnd,
  } = useElementMovement();

  // Accessibility functionality
  const {
    focusedElementId,
    isCanvasFocused,
    setIsCanvasFocused,
    navigateElements,
    selectFocusedElement,
    moveFocusedElement,
    getAllElements,
    getFocusedElement
  } = useCanvasKeyboardNavigation();

  const {
    announceElementCreated,
    announceElementSelected,
    announceElementDeleted,
    announceError
  } = useAccessibilityAnnouncer();

  // const accessibilityStore = useAccessibilityStore();

  // Dimension state
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | undefined>();
  const [isDimensionMode, setIsDimensionMode] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({ x: 0, y: 0, visible: false });

  // Wall joining system
  const joinConfig = {
    tolerance: 0.1,
    autoJoin: true,
    showJoinIndicators: true
  };
  const {
    joints
  } = useWallJoining2D({
    autoUpdate: true,
    enabled: currentView === 'plan', // Only show joins in plan view
    config: joinConfig
  });

  // Roof-wall integration system
  const roofWallConfig = {
    defaultOverhang: 0.5,
    autoConnect: true,
    showConnectionIndicators: true
  };
  const {
    connections: roofWallConnections
  } = useRoofWallIntegration2D({
    autoUpdate: true,
    enabled: roofs.length > 0 && walls.length > 0,
    config: roofWallConfig
  });

  // Opening integration system
  useOpeningIntegration2D({
    enabled: doors.length > 0 || windows.length > 0,
    config: {
      minWallLength: 0.8,
      minDistanceFromCorner: 0.1,
      maxOpeningRatio: 0.8,
      snapTolerance: 0.05,
      autoAlign: true,
      showConstraints: currentView === 'plan'
    }
  });

  // Dimension system
  const dimensionManager = useDimensionManager2D({
    autoGenerate: true,
    enabled: true,
    viewType: currentView,
    floorId: currentFloorId || 'floor-1',
    config: {
      autoGenerate: true,
      defaultStyle: 'architectural',
      defaultUnit: 'm',
      defaultOffset: 0.5,
      defaultTextSize: 12,
      defaultArrowSize: 0.1,
      defaultLineWeight: 1,
      defaultColor: '#000000',
      snapTolerance: 0.05,
      showTolerances: false,
      precision: 2
    }
  });

  // Tools and state
  const { drawingState, startDrawing, updateDrawing, finishDrawing, cancelDrawing } = useWallTool();
  const { deleteSelectedWall, startDrag: handleWallStartDrag, updateDrag: handleWallDrag, endDrag: handleWallEndDrag } = useWallEditor();
  const { deleteSelectedDoor } = useDoorEditor();
  const { deleteSelectedWindow } = useWindowEditor();
  const { placementState: doorPlacementState, startPlacement: startDoorPlacement, updatePlacement: updateDoorPlacement, finishPlacement: finishDoorPlacement, cancelPlacement: cancelDoorPlacement } = useDoorTool();
  const { placementState: windowPlacementState, startPlacement: startWindowPlacement, updatePlacement: updateWindowPlacement, finishPlacement: finishWindowPlacement, cancelPlacement: cancelWindowPlacement } = useWindowTool();
  const { measureState, startMeasurement, updateMeasurement, finishMeasurement, cancelMeasurement, removeMeasurement, getCurrentDistance } = useMeasureTool();
  const { state: dimensionState, startDimension, updateDimension, finishDimension, updateAnnotation, getCurrentDimension } = useDimensionTool();
  const { isDrawing: isDrawingStair, previewStair, startDrawing: startStairDrawing, updateDrawing: updateStairDrawing, finishDrawing: finishStairDrawing, cancelDrawing: cancelStairDrawing } = useStairTool();
  const { isDrawing: isDrawingRoof, previewRoof, startDrawing: startRoofDrawing, updateDrawing: updateRoofDrawing, finishDrawing: finishRoofDrawing, cancelDrawing: cancelRoofDrawing } = useRoofTool();
  // Canvas controls (currently not using any returned values)
  useCanvasControls();

  // Auto-generate dimensions when elements change
  useEffect(() => {
    if (dimensionManager.isEnabled && dimensionManager.config.autoGenerate) {
      const convertedElements = convertElementsToElement2D(
        walls,
        doors,
        windows,
        stairs,
        roofs
      );
      dimensionManager.autoGenerateDimensions(convertedElements);
    }
  }, [walls, doors, windows, stairs, roofs, dimensionManager]);

  // Handle dimension tool activation
  useEffect(() => {
    if (activeTool === 'dimension') {
      setIsDimensionMode(true);
    } else {
      setIsDimensionMode(false);
      setSelectedDimensionId(undefined);
    }
  }, [activeTool]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setCanvasSize(offsetWidth, offsetHeight);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setCanvasSize]);

  // Sync with current floor when floor changes
  React.useEffect(() => {
    syncWithCurrentFloor();
  }, [currentFloorId, syncWithCurrentFloor]);

  // Get current floor elements for rendering
  const currentFloor = getCurrentFloor();
  const currentFloorElements = currentFloor ? currentFloor.elements : { walls, doors, windows, stairs, roofs, rooms: [] };

  // Get all floors for ghost view if enabled
  const allFloors = showAllFloors ? getFloorsOrderedByLevel() : [];

  // Get current view transform
  const viewTransform = getViewTransform(currentView);

  // Debug: Log current view changes
  React.useEffect(() => {
    // View changed - any necessary side effects can be added here
  }, [currentView]);

  // Handle wheel zoom
  const handleWheel = React.useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    stage.scale({ x: clampedScale, y: clampedScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    stage.position(newPos);
  }, []);

  // Apply view-specific transformations to the stage
  const getStageProps = React.useCallback(() => {
    return {
      width: canvasWidth,
      height: canvasHeight,
      scaleX: zoomLevel * viewTransform.zoom,
      scaleY: zoomLevel * viewTransform.zoom,
      rotation: viewTransform.rotation,
      offsetX: viewTransform.pan.x,
      offsetY: viewTransform.pan.y,
      draggable: activeTool === 'select',
      onWheel: handleWheel,
      onMouseDown: handleStageMouseDown,
      onMouseMove: handleStageMouseMove,
      onMouseUp: handleStageMouseUp,
      className: "bg-white",
    };
  }, [canvasWidth, canvasHeight, zoomLevel, viewTransform, activeTool, handleWheel]);

  // Handle canvas interactions
  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // If clicking on empty space, clear selection
    if (e.target === e.target.getStage()) {
      clearSelection();
    }

    const pos = (e.target.getStage() as Konva.Stage).getPointerPosition();
    const stage = stageRef.current;
    if (stage && pos) {
      // Adjust for stage position and scale
      const transform = stage.getAbsoluteTransform().copy().invert();
      const localPos = transform.point(pos);

      switch (activeTool) {
        case 'wall':
          startDrawing(localPos.x, localPos.y);
          break;
        case 'door':
          startDoorPlacement(localPos.x, localPos.y);
          break;
        case 'window':
          startWindowPlacement(localPos.x, localPos.y);
          break;
        case 'measure':
          startMeasurement(localPos.x, localPos.y);
          break;
        case 'dimension':
          startDimension(localPos.x, localPos.y);
          break;
        case 'stair':
          startStairDrawing(e);
          break;
        case 'roof':
          startRoofDrawing(e);
          break;
      }
    }
  };

  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const pos = (e.target.getStage() as Konva.Stage).getPointerPosition();
    const stage = stageRef.current;

    if (stage && pos) {
      const transform = stage.getAbsoluteTransform().copy().invert();
      const localPos = transform.point(pos);

      // Update mouse coordinates for status bar
      setMouseCoordinates(Math.round(localPos.x), Math.round(localPos.y));

      // Handle tool-specific mouse movement
      switch (activeTool) {
        case 'wall':
          if (drawingState.isDrawing) {
            updateDrawing(localPos.x, localPos.y);
          }
          break;
        case 'door':
          if (doorPlacementState.isPlacing) {
            updateDoorPlacement(localPos.x, localPos.y);
          }
          break;
        case 'window':
          if (windowPlacementState.isPlacing) {
            updateWindowPlacement(localPos.x, localPos.y);
          }
          break;
        case 'measure':
          if (measureState.isMeasuring) {
            updateMeasurement(localPos.x, localPos.y);
          }
          break;
        case 'dimension':
          if (dimensionState.isCreating) {
            updateDimension(localPos.x, localPos.y);
          }
          break;
        case 'stair':
          if (isDrawingStair) {
            updateStairDrawing(e);
          }
          break;
        case 'roof':
          if (isDrawingRoof) {
            updateRoofDrawing(e);
          }
          break;
      }
    }
  };

  const handleStageMouseUp = () => {
    switch (activeTool) {
      case 'wall':
        if (drawingState.isDrawing) {
          finishDrawing();
        }
        break;
      case 'door':
        if (doorPlacementState.isPlacing) {
          finishDoorPlacement();
        }
        break;
      case 'window':
        if (windowPlacementState.isPlacing) {
          finishWindowPlacement();
        }
        break;
      case 'measure':
        if (measureState.isMeasuring) {
          finishMeasurement();
        }
        break;
      case 'dimension':
        if (dimensionState.isCreating) {
          finishDimension();
        }
        break;
      case 'stair':
        if (isDrawingStair) {
          finishStairDrawing();
        }
        break;
      case 'roof':
        if (isDrawingRoof) {
          finishRoofDrawing();
        }
        break;
    }
  };

  // Accessibility: Auto-detect screen reader usage
  useEffect(() => {
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReader =
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        window.speechSynthesis ||
        document.querySelector('[aria-live]') !== null;

      // if (hasScreenReader && !isAccessibilityMode) {
      //   setAccessibilityMode(true);
      // }
    };

    detectScreenReader();
  }, []);

  // Accessibility: Announce tool changes
  useEffect(() => {
    if (true) { // preferences.enableScreenReaderSupport
      const toolNames = {
        select: 'Selection',
        wall: 'Wall drawing',
        door: 'Door placement',
        window: 'Window placement',
        stair: 'Stair drawing',
        roof: 'Roof drawing',
        measure: 'Measurement',
        dimension: 'Dimension annotation'
      };

      const toolName = toolNames[activeTool as keyof typeof toolNames] || activeTool;
      // announceToolChange(toolName);
    }
  }, [activeTool]);

  // Accessibility: Announce view changes
  useEffect(() => {
    // if (preferences.enableScreenReaderSupport) {
    //   announceViewChange(currentView);
    // }
  }, [currentView]);

  // Keyboard shortcuts with accessibility enhancements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle accessibility-specific keyboard navigation
      if (isCanvasFocused && true) { // preferences.enableKeyboardNavigation
        switch (e.key) {
          case 'Tab':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              navigateElements(e.shiftKey ? 'left' : 'right');
              return;
            }
            break;
          case 'ArrowUp':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              if (e.shiftKey && focusedElementId) {
                // Move element up (fine control)
                moveFocusedElement('up', e.ctrlKey ? 1 : 10);
              } else {
                navigateElements('up');
              }
              return;
            }
            break;
          case 'ArrowDown':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              if (e.shiftKey && focusedElementId) {
                // Move element down (fine control)
                moveFocusedElement('down', e.ctrlKey ? 1 : 10);
              } else {
                navigateElements('down');
              }
              return;
            }
            break;
          case 'ArrowLeft':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              if (e.shiftKey && focusedElementId) {
                // Move element left (fine control)
                moveFocusedElement('left', e.ctrlKey ? 1 : 10);
              } else {
                navigateElements('left');
              }
              return;
            }
            break;
          case 'ArrowRight':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              if (e.shiftKey && focusedElementId) {
                // Move element right (fine control)
                moveFocusedElement('right', e.ctrlKey ? 1 : 10);
              } else {
                navigateElements('right');
              }
              return;
            }
            break;
          case 'Enter':
          case ' ':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              selectFocusedElement();
              return;
            }
            break;
          case 'i':
            // Announce element information
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              const focusedElement = getFocusedElement();
              if (focusedElement) {
                const description = `${focusedElement.type} element`; // getAccessibilityDescription(focusedElement.type, focusedElement);
                announceElementSelected(focusedElement.type, description);
              }
              return;
            }
            break;
        }
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              if (canRedo()) redo();
            } else {
              if (canUndo()) undo();
            }
            break;
          case 'y':
            e.preventDefault();
            if (canRedo()) redo();
            break;
          case 'c':
            e.preventDefault();
            if (selectedElementId && selectedElementType) {
              copyElement();
            }
            break;
          case 'v':
            e.preventDefault();
            if (hasClipboardData()) {
              pasteElement();
            }
            break;
          case 'd':
            e.preventDefault();
            if (selectedElementId && selectedElementType) {
              // Duplicate element (copy + paste with small offset)
              copyElement();
              pasteElement(20, 20);
            }
            break;
          case 's':
            e.preventDefault();
            // Quick save design
            if (walls.length > 0 || doors.length > 0 || windows.length > 0 || stairs.length > 0 || roofs.length > 0) {
              try {
                const designData = { walls, doors, windows, stairs, roofs };
                const timestamp = new Date().toLocaleString();
                // saveDesign(`Quick Save - ${timestamp}`, designData);
                // You could show a toast notification here
              } catch (error) {
                handleError(
                  error instanceof Error ? error : new Error('Failed to save design'),
                  {
                    category: 'save',
                    source: 'DrawingCanvas',
                    operation: 'quickSave'
                  },
                  {
                    userMessage: 'Failed to save your design automatically. Please try saving manually.',
                    retryAction: () => {
                      const timestamp = new Date().toLocaleString();
                      // saveDesign(`Quick Save - ${timestamp}`, designData);
                    },
                    suggestions: [
                      'Try saving with a different name',
                      'Check if you have enough storage space',
                      'Export your work as backup'
                    ]
                  }
                );
              }
            }
            break;
          case 'o':
            e.preventDefault();
            // Open load dialog (this would need implementation)
            // For now, just toggle import dialog
            const { setImportDialogOpen } = useUIStore.getState();
            setImportDialogOpen(true);
            break;
          case 'e':
            e.preventDefault();
            // Open export dialog
            const { setExportDialogOpen } = useUIStore.getState();
            setExportDialogOpen(true);
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'w':
            setActiveTool('wall');
            break;
          case 'd':
            setActiveTool('door');
            break;
          case 'n':
            setActiveTool('window');
            break;
          case 'm':
            setActiveTool('measure');
            break;
          case 's':
            setActiveTool('stair');
            break;
          case 'r':
            setActiveTool('roof');
            break;
          case 'escape':
            if (drawingState.isDrawing) {
              cancelDrawing();
            } else if (doorPlacementState.isPlacing) {
              cancelDoorPlacement();
            } else if (windowPlacementState.isPlacing) {
              cancelWindowPlacement();
            } else if (measureState.isMeasuring) {
              cancelMeasurement();
            } else if (isDrawingStair) {
              cancelStairDrawing();
            } else if (isDrawingRoof) {
              cancelRoofDrawing();
            } else {
              clearSelection();
            }
            break;
          case 'delete':
          case 'backspace':
            if (selectedElementId) {
              switch (selectedElementType) {
                case 'wall':
                  deleteSelectedWall();
                  break;
                case 'door':
                  deleteSelectedDoor();
                  break;
                case 'window':
                  deleteSelectedWindow();
                  break;
                case 'stair':
                  if (selectedElementId) {
                    const { removeStair } = useDesignStore.getState();
                    removeStair(selectedElementId);
                  }
                  break;
                case 'roof':
                  if (selectedElementId) {
                    const { removeRoof } = useDesignStore.getState();
                    removeRoof(selectedElementId);
                  }
                  break;
              }
            }
            break;
          case '1':
            // Switch to plan view
            e.preventDefault();
            const { setView: setPlanView } = useViewStore.getState();
            setPlanView('plan');
            break;
          case '2':
            // Switch to front view
            e.preventDefault();
            const { setView: setFrontView } = useViewStore.getState();
            setFrontView('front');
            break;
          case '3':
            // Switch to back view
            e.preventDefault();
            const { setView: setBackView } = useViewStore.getState();
            setBackView('back');
            break;
          case '4':
            // Switch to left view
            e.preventDefault();
            const { setView: setLeftView } = useViewStore.getState();
            setLeftView('left');
            break;
          case '5':
            // Switch to right view
            e.preventDefault();
            const { setView: setRightView } = useViewStore.getState();
            setRightView('right');
            break;
          case 'f4':
            // Toggle properties panel
            e.preventDefault();
            const { togglePropertiesPanel } = useUIStore.getState();
            togglePropertiesPanel();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, drawingState.isDrawing, doorPlacementState.isPlacing, windowPlacementState.isPlacing, measureState.isMeasuring, cancelDrawing, cancelDoorPlacement, cancelWindowPlacement, cancelMeasurement, clearSelection, undo, redo, canUndo, canRedo, selectedElementId, selectedElementType, deleteSelectedWall, deleteSelectedDoor, deleteSelectedWindow, setMouseCoordinates, cancelRoofDrawing, cancelStairDrawing, isDrawingRoof, isDrawingStair, copyElement, pasteElement, hasClipboardData]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full`}
      tabIndex={0}
      onFocus={() => setIsCanvasFocused(true)}
      onBlur={(e) => {
        // Only blur if focus is moving outside the canvas container
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsCanvasFocused(false);
        }
      }}
      role="application"
      aria-label="House design canvas - Use Tab to navigate elements, arrow keys for movement, Enter to select"
      aria-describedby="canvas-instructions accessibility-status"
      aria-live="polite"
      style={{
        outline: isCanvasFocused
          ? '3px solid #005fcc'
          : 'none',
        outlineOffset: '2px'
      }}
    >
      {/* Hidden instructions for screen readers */}
      <div id="canvas-instructions" className="sr-only">
        Interactive house design canvas. Use Tab to navigate between elements,
        arrow keys to move selection, Enter or Space to select elements,
        and keyboard shortcuts to activate tools. Press 'i' to hear detailed
        information about the focused element.
      </div>

      {/* Accessibility status information */}
      <div id="accessibility-status" className="sr-only" aria-live="polite">
        {/* isAccessibilityMode ? 'Accessibility mode active. ' : '' */}
        {getAllElements().length} elements on canvas.
        {focusedElementId ? `Currently focused: ${getFocusedElement()?.type}` : 'No element focused.'}
      </div>

      {/* Accessibility announcer for screen readers */}
      <AccessibilityAnnouncer />

      <Stage
        ref={stageRef}
        {...getStageProps()}
        style={{
          transition: isTransitioning
            ? 'all 0.3s ease-in-out'
            : 'none',
          opacity: isTransitioning ? 0.7 : 1,
        }}
        onContextMenu={(e) => {
          e.evt.preventDefault();
          const stage = e.target.getStage() as Konva.Stage;
          if (stage) {
            const pos = stage.getPointerPosition();
            if (pos) {
              setContextMenu({
                x: pos.x,
                y: pos.y,
                visible: true,
              });
            }
          }
        }}
      >
        {/* Grid Layer */}
        {showGrid && (
          <Layer>
            <Grid />
          </Layer>
        )}

        {/* Snap Indicators Layer */}
        <Layer>
          <SnapIndicators
            snapPoint={drawingState.currentSnapResult?.snapPoint}
            showGridLines={showGrid}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />

          {/* Door Constraint Indicators */}
          {activeTool === 'door' && doorPlacementState.constraintResult && (
            <ConstraintIndicators
              constraintResult={doorPlacementState.constraintResult}
              isValid={doorPlacementState.isValid}
              elementWidth={80}
            />
          )}

          {/* Window Constraint Indicators */}
          {activeTool === 'window' && windowPlacementState.constraintResult && (
            <ConstraintIndicators
              constraintResult={windowPlacementState.constraintResult}
              isValid={windowPlacementState.isValid}
              elementWidth={100}
            />
          )}

          {/* Intersection Indicators */}
          <IntersectionIndicators />
        </Layer>

        {/* Elements Layer */}
        <Layer>
          {/* New View-Based Rendering System */}
          {currentView === 'plan' ? (
            <PlanViewRenderer2D
              elements={convertElementsToElement2D(
                currentFloorElements.walls,
                currentFloorElements.doors,
                currentFloorElements.windows,
                currentFloorElements.stairs,
                [], // roofs not shown in plan view
                currentFloorElements.rooms || [],
                currentFloorId ?? ''
              )}
              scale={zoomLevel}
              showMaterials={true}
              showDimensions={true}
              showAnnotations={true}
              onElementSelect={(elementId, element2D) => {
                const elementType = getElementTypeFromElement2D(element2D);
                selectElement(elementId, elementType as 'wall' | 'door' | 'window' | 'stair' | 'roof' | 'room' | null);
              }}
              onElementEdit={(elementId, updates) => {
                // Handle element edit
              }}
            />
          ) : (
            <ElevationRenderer2D
              elements={convertElementsToElement2D(
                currentFloorElements.walls,
                currentFloorElements.doors,
                currentFloorElements.windows,
                currentFloorElements.stairs,
                currentFloorElements.roofs || [],
                [], // rooms not shown in elevation views
                currentFloorId ?? ''
              )}
              viewType={currentView as 'front' | 'back' | 'left' | 'right'}
              scale={zoomLevel}
              showMaterials={true}
              showDimensions={true}
              showAnnotations={true}
              onElementSelect={(elementId, element2D) => {
                const elementType = getElementTypeFromElement2D(element2D);
                selectElement(elementId, elementType as 'wall' | 'door' | 'window' | 'stair' | 'roof' | 'room' | null);
              }}
              onElementEdit={(elementId, updates) => {
                // Handle element edit
              }}
            />
          )}

          {/* Legacy Rendering - COMMENTED OUT for view switching */}
          {/*
          {/* Render Walls with Materials */}
          {/* Render Ghost Floors (if enabled) */}
          {showAllFloors && allFloors.map((floor) =>
            floor.id !== currentFloorId ? (
              <Group key={`ghost-${floor.id}`} opacity={floorOpacity}>
                {floor.elements.walls.map((wall) => (
                  <MaterializedWallComponent
                    key={`ghost-wall-${wall.id}`}
                    wall={wall}
                    isSelected={false}
                    onSelect={() => {}}
                    onStartDrag={() => {}}
                    onDrag={() => {}}
                    onEndDrag={() => {}}
                  />
                ))}
                {floor.elements.doors.map((door) => (
                  <MaterializedDoorComponent
                    key={`ghost-door-${door.id}`}
                    door={door}
                    isSelected={false}
                    onSelect={() => {}}
                    onStartDrag={() => {}}
                    onDrag={() => {}}
                    onEndDrag={() => {}}
                  />
                ))}
                {floor.elements.windows.map((window) => (
                  <WindowComponent
                    key={`ghost-window-${window.id}`}
                    window={window}
                  />
                ))}
              </Group>
            ) : null
          )}

          {/* Render Current Floor Walls */}
          {currentFloorElements.walls.map((wall: Wall) => (
            <MaterializedWallComponent
              key={wall.id}
              wall={wall}
              isSelected={selectedElementId === wall.id && selectedElementType === 'wall'}
              onSelect={() => selectElement(wall.id, 'wall')}
              onStartDrag={(e: KonvaEventObject<DragEvent>) => {
                const pos = (e.target.getStage() as Konva.Stage).getPointerPosition();
                if (pos) {
                  handleWallStartDrag(wall.id, 'move', pos.x, pos.y);
                }
              }}
              onDrag={(e: KonvaEventObject<DragEvent>) => {
                const pos = (e.target.getStage() as Konva.Stage).getPointerPosition();
                if (pos) {
                  handleWallDrag(wall.id, 'move', pos.x, pos.y);
                }
              }}
              onEndDrag={() => handleWallEndDrag(wall.id)}
            />
          ))}

          {/* Render Doors with Materials */}
          {/* Render Current Floor Doors */}
          {currentFloorElements.doors.map((door: Door) => (
            <MaterializedDoorComponent
              key={door.id}
              door={door}
              isSelected={selectedElementId === door.id && selectedElementType === 'door'}
              onSelect={() => selectElement(door.id, 'door')}
              onStartDrag={() => {}}
              onDrag={(e: KonvaEventObject<DragEvent>) => {
                handleDoorDragMove(e, door.id);
              }}
              onEndDrag={() => {
                handleElementDragEnd(door.id, 'door');
              }}
            />
          ))}

          {/* Render Windows */}
          {/* Render Current Floor Windows */}
          {currentFloorElements.windows.map((window: Window) => (
            <WindowComponent
              key={window.id}
              window={window}
            />
          ))}

          {/* Render Stairs */}
          {currentFloorElements.stairs?.map((stair: Stair) => (
            <StairComponent
              key={stair.id}
              stair={stair}
              isSelected={selectedElementId === stair.id && selectedElementType === 'stair'}
              onSelect={() => selectElement(stair.id, 'stair')}
              onDragMove={(e) => {
                handleStairDragMove(e as KonvaEventObject<DragEvent>, stair.id);
              }}
              onDragEnd={() => {
                handleElementDragEnd(stair.id, 'stair');
              }}
            />
          ))}

          {/* Render Roofs */}
          {currentFloorElements.roofs?.map((roof: Roof) => (
            <RoofComponent
              key={roof.id}
              roof={roof}
              isSelected={selectedElementId === roof.id && selectedElementType === 'roof'}
              onSelect={() => selectElement(roof.id, 'roof')}
              onDragMove={(e) => {
                handleRoofDragMove(e as KonvaEventObject<DragEvent>, roof.id);
              }}
              onDragEnd={() => {
                handleElementDragEnd(roof.id, 'roof');
              }}
            />
          ))}

          {/* Render drawing preview for wall tool */}
          {activeTool === 'wall' && drawingState.isDrawing && drawingState.startPoint && drawingState.currentPoint && (
            <Line
              points={[
                drawingState.startPoint.x,
                drawingState.startPoint.y,
                drawingState.currentPoint.x,
                drawingState.currentPoint.y,
              ]}
              stroke="#3b82f6"
              strokeWidth={8}
              lineCap="round"
              dash={[10, 5]}
              opacity={0.7}
              listening={false}
            />
          )}

          {/* Render door preview */}
          {activeTool === 'door' && doorPlacementState.previewDoor && doorPlacementState.isValid && (
            <DoorComponent door={doorPlacementState.previewDoor} />
          )}

          {/* Render window preview */}
          {activeTool === 'window' && windowPlacementState.previewWindow && windowPlacementState.isValid && (
            <WindowComponent window={windowPlacementState.previewWindow} />
          )}

          {/* Render stair preview */}
          {activeTool === 'stair' && previewStair && (
            <StairComponent
              stair={previewStair}
              isSelected={false}
              onSelect={() => {}}
              onDragMove={() => {}}
              onDragEnd={() => {}}
            />
          )}

          {/* Render roof preview */}
          {activeTool === 'roof' && previewRoof && (
            <RoofComponent
              roof={previewRoof}
              isSelected={false}
              onSelect={() => {}}
              onDragMove={() => {}}
              onDragEnd={() => {}}
            />
          )}

          {/* Render measurements */}
          <MeasurementDisplay
            measurements={measureState.measurements}
            currentMeasurement={
              measureState.isMeasuring && measureState.startPoint && measureState.currentPoint
                ? {
                    startPoint: measureState.startPoint,
                    currentPoint: measureState.currentPoint,
                    distance: getCurrentDistance() || '',
                  }
                : null
            }
            showAll={measureState.showAllMeasurements}
            onRemoveMeasurement={removeMeasurement}
          />

          {/* Dimension Annotations - New System */}
          <AnnotationRenderer2D
            dimensions={dimensionManager.getDimensionsForView(currentView, currentFloorId || undefined)}
            chains={dimensionManager.chains}
            viewType={currentView}
            scale={zoomLevel}
            offset={{ x: 0, y: 0 }}
            isEditing={isDimensionMode}
            selectedDimensionId={selectedDimensionId}
            onDimensionSelect={setSelectedDimensionId}
            onDimensionEdit={(id, updates) => {
              dimensionManager.updateDimension(id, updates);
            }}
            onDimensionDelete={(id) => {
              dimensionManager.deleteDimension(id);
              setSelectedDimensionId(undefined);
            }}
          />

          {/* Legacy Dimension Annotations */}
          <DimensionAnnotations
            annotations={dimensionState.annotations}
            onUpdate={updateAnnotation}
            showAll={dimensionState.showAll}
          />

          {/* Current dimension being created */}
          {dimensionState.isCreating && getCurrentDimension() && (
            <DimensionAnnotations
              annotations={[{
                id: 'current',
                startPoint: getCurrentDimension()!.startPoint,
                endPoint: getCurrentDimension()!.endPoint,
                distance: getCurrentDimension()!.distance,
                label: getCurrentDimension()!.label,
                offset: 30,
                style: {
                  color: '#3b82f6',
                  strokeWidth: 1.5,
                  fontSize: 12,
                  arrowSize: 8,
                  extensionLength: 20,
                  textBackground: true,
                  precision: 1,
                  units: 'both',
                },
                isVisible: true,
                isPermanent: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }]}
              onUpdate={() => {}}
              showAll={true}
            />
          )}

          {/* Room Detection Overlay with Materials */}
          <MaterializedRoomOverlay />

          {/* Wall Join Indicators - Only in plan view */}
          {currentView === 'plan' && joinConfig.showJoinIndicators && (
            <WallJoinIndicators
              joints={joints}
              visible={true}
              scale={zoomLevel}
              onJointSelect={() => {
                // Could implement joint selection logic here
              }}
            />
          )}

          {/* Roof-Wall Connection Indicators */}
          {roofWallConfig.showConnectionIndicators && roofWallConnections.length > 0 && (
            <RoofWallConnectionIndicators
              connections={roofWallConnections}
              visible={true}
              scale={zoomLevel}
              onConnectionSelect={() => {
                // Could implement connection selection logic here
              }}
            />
          )}
          {/* */}
        </Layer>
      </Stage>

      {/* Door Floating Controls */}
      <DoorFloatingControls />

      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isVisible={contextMenu.visible}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        selectedElementType={selectedElementType}
        selectedElementId={selectedElementId}
        onCopy={() => {
          if (selectedElementId && selectedElementType) {
            copyElement();
          }
        }}
        onPaste={() => {
          if (hasClipboardData()) {
            pasteElement();
          }
        }}
        onDuplicate={() => {
          if (selectedElementId && selectedElementType) {
            copyElement();
            pasteElement(20, 20);
          }
        }}
        onDelete={() => {
          if (selectedElementId) {
            switch (selectedElementType) {
              case 'wall':
                deleteSelectedWall();
                break;
              case 'door':
                deleteSelectedDoor();
                break;
              case 'window':
                deleteSelectedWindow();
                break;
              case 'stair':
                const { removeStair } = useDesignStore.getState();
                removeStair(selectedElementId);
                break;
              case 'roof':
                const { removeRoof } = useDesignStore.getState();
                removeRoof(selectedElementId);
                break;
            }
          }
        }}
        onEdit={() => {
          // Implement direct editing by focusing on the first editable property
          if (selectedElementId && selectedElementType) {
            // For now, we'll trigger the properties panel focus
            // In the future, this could enable inline editing on the canvas
            const propertiesPanel = document.querySelector('[data-testid="properties-panel"]');
            const firstInput = propertiesPanel?.querySelector('input, textarea, select');
            if (firstInput instanceof HTMLElement) {
              firstInput.focus();
            }
          }
        }}
        onProperties={() => {
          // Properties panel is already visible when element is selected
        }}
        hasClipboardData={hasClipboardData()}
      />
    </div>
  );
}
