'use client';

import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useUIStore } from '@/stores/uiStore';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useWallTool } from '@/hooks/useWallTool';
import { useWallEditor } from '@/hooks/useWallEditor';
import { useCanvasControls } from '@/hooks/useCanvasControls';
import Grid from './Grid';
import SnapIndicators from './SnapIndicators';
import WallComponent from './elements/WallComponent';
import DoorComponent from './elements/DoorComponent';
import WindowComponent from './elements/WindowComponent';

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
  
  const { walls, doors, windows, clearSelection, selectedElementId, selectedElementType } = useDesignStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  const { drawingState, startDrawing, updateDrawing, finishDrawing, cancelDrawing } = useWallTool();
  const { deleteSelectedWall } = useWallEditor();
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

  // Handle wheel zoom
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

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

    if (activeTool === 'wall') {
      const pos = e.target.getStage()?.getPointerPosition();
      const stage = stageRef.current;
      if (stage && pos) {
        // Adjust for stage position and scale
        const transform = stage.getAbsoluteTransform().copy().invert();
        const localPos = transform.point(pos);
        startDrawing(localPos.x, localPos.y);
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
      
      // Handle wall drawing
      if (activeTool === 'wall' && drawingState.isDrawing) {
        updateDrawing(localPos.x, localPos.y);
      }
    }
  };

  const handleStageMouseUp = () => {
    if (activeTool === 'wall' && drawingState.isDrawing) {
      finishDrawing();
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
          case 'escape':
            if (drawingState.isDrawing) {
              cancelDrawing();
            } else {
              clearSelection();
            }
            break;
          case 'delete':
          case 'backspace':
            if (selectedElementId && selectedElementType === 'wall') {
              deleteSelectedWall();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, drawingState.isDrawing, cancelDrawing, clearSelection, undo, redo, canUndo, canRedo, selectedElementId, selectedElementType, deleteSelectedWall, setMouseCoordinates]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={canvasHeight}
        scaleX={zoomLevel}
        scaleY={zoomLevel}
        draggable={activeTool === 'select'}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        className="bg-white"
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
        </Layer>

        {/* Elements Layer */}
        <Layer>
          {/* Render Walls */}
          {walls.map((wall) => (
            <WallComponent key={wall.id} wall={wall} />
          ))}

          {/* Render Doors */}
          {doors.map((door) => (
            <DoorComponent key={door.id} door={door} />
          ))}

          {/* Render Windows */}
          {windows.map((window) => (
            <WindowComponent key={window.id} window={window} />
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
        </Layer>
      </Stage>
    </div>
  );
}