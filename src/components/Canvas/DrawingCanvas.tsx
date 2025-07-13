'use client';

import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Line, Group } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
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
  const { } = useCanvasControls();

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

  // Apply view-specific transformations to the stage
  const getStageProps = () => {
    const baseProps = {
      width: canvasWidth,
      height: canvasHeight,
      scaleX: zoomLevel * viewTransform.scale.x,
      scaleY: zoomLevel * viewTransform.scale.y,
      rotation: viewTransform.rotation,
      offsetX: viewTransform.offset.x,
      offsetY: viewTransform.offset.y,
      draggable: activeTool === 'select',
      onWheel: handleWheel,
      onMouseDown: handleStageMouseDown,
      onMouseMove: handleStageMouseMove,
      onMouseUp: handleStageMouseUp,
      className: "bg-white",
    };

    // Add perspective transformations for 3D-like views
    if (viewTransform.perspective) {
      return {
        ...baseProps,
        skewX: viewTransform.perspective.skewX,
        skewY: viewTransform.perspective.skewY,
      };
    }

    return baseProps;
  };

  // Handle wheel zoom
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
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
  };

  // Handle canvas interactions
  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // If clicking on empty space, clear selection
    if (e.target === e.target.getStage()) {
      clearSelection();
    }

    const pos = e.target.getStage()?.getPointerPosition();
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
    const pos = e.target.getStage()?.getPointerPosition();
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
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
                  // TODO: Add deleteSelectedStair when implemented
                  break;
                case 'roof':
                  // TODO: Add deleteSelectedRoof when implemented
                  break;
              }
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, drawingState.isDrawing, doorPlacementState.isPlacing, windowPlacementState.isPlacing, measureState.isMeasuring, cancelDrawing, cancelDoorPlacement, cancelWindowPlacement, cancelMeasurement, clearSelection, undo, redo, canUndo, canRedo, selectedElementId, selectedElementType, deleteSelectedWall, deleteSelectedDoor, deleteSelectedWindow, setMouseCoordinates, cancelRoofDrawing, cancelStairDrawing, isDrawingRoof, isDrawingStair]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage
        ref={stageRef}
        {...getStageProps()}
        style={{
          transition: isTransitioning ? 'all 0.3s ease-in-out' : 'none',
          opacity: isTransitioning ? 0.7 : 1,
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
          {currentFloorElements.walls.map((wall) => (
            <MaterializedWallComponent
              key={wall.id}
              wall={wall}
              isSelected={selectedElementId === wall.id && selectedElementType === 'wall'}
              onSelect={() => selectElement(wall.id, 'wall')}
              onStartDrag={(e: KonvaEventObject<DragEvent>) => {
                const pos = e.target.getStage()?.getPointerPosition();
                if (pos) {
                  handleWallStartDrag(wall.id, 'move', pos.x, pos.y);
                }
              }}
              onDrag={(e: KonvaEventObject<DragEvent>) => {
                const pos = e.target.getStage()?.getPointerPosition();
                if (pos) {
                  handleWallDrag(wall.id, 'move', pos.x, pos.y);
                }
              }}
              onEndDrag={() => handleWallEndDrag(wall.id)}
            />
          ))}

          {/* Render Doors with Materials */}
          {/* Render Current Floor Doors */}
          {currentFloorElements.doors.map((door) => (
            <MaterializedDoorComponent
              key={door.id}
              door={door}
              isSelected={selectedElementId === door.id && selectedElementType === 'door'}
              onSelect={() => selectElement(door.id, 'door')}
              onStartDrag={() => {}}
              onDrag={() => {}}
              onEndDrag={() => {}}
            />
          ))}

          {/* Render Windows */}
          {/* Render Current Floor Windows */}
          {currentFloorElements.windows.map((window) => (
            <WindowComponent
              key={window.id}
              window={window}
            />
          ))}

          {/* Render Stairs */}
          {currentFloorElements.stairs?.map((stair) => (
            <StairComponent
              key={stair.id}
              stair={stair}
              isSelected={selectedElementId === stair.id && selectedElementType === 'stair'}
              onSelect={() => selectElement(stair.id, 'stair')}
              onDragEnd={() => {}}
            />
          ))}

          {/* Render Roofs */}
          {currentFloorElements.roofs?.map((roof) => (
            <RoofComponent
              key={roof.id}
              roof={roof}
              isSelected={selectedElementId === roof.id && selectedElementType === 'roof'}
              onSelect={() => selectElement(roof.id, 'roof')}
              onDragEnd={() => {}}
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
              onDragEnd={() => {}}
            />
          )}

          {/* Render roof preview */}
          {activeTool === 'roof' && previewRoof && (
            <RoofComponent
              roof={previewRoof}
              isSelected={false}
              onSelect={() => {}}
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

          {/* Dimension Annotations */}
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
        </Layer>
      </Stage>

      {/* Door Floating Controls */}
      <DoorFloatingControls />
    </div>
  );
}
