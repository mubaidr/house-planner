import { useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useFloorStore } from '@/stores/floorStore';
import { useUIStore } from '@/stores/uiStore';
import { useHistoryStore } from '@/stores/historyStore';
import { Wall } from '@/types/elements/Wall';
import { calculateWallJoining, WallJoinResult } from '@/utils/wallIntersection';
import { AddWallCommand, UpdateWallCommand, BatchCommand } from '@/utils/history';

export const useWallIntersection = () => {
  const { addWall, updateWall, removeWall, walls, selectElement } = useDesignStore();
  const { currentFloorId, addElementToFloor, updateElementInFloor } = useFloorStore();
  const { setActiveTool } = useUIStore();
  const { executeCommand } = useHistoryStore();

  const addWallWithIntersectionHandling = useCallback((newWall: Wall) => {
    const joinResult = calculateWallJoining(newWall, walls);

    if (!joinResult.shouldJoin) {
      // No intersections, just add the wall normally
      if (currentFloorId) {
        addElementToFloor(currentFloorId, 'walls', newWall);
      }
      
      // Switch to select tool and select the new wall
      setActiveTool('select');
      selectElement(newWall.id, 'wall');
      
      // Note: addWall will be called by the command, but the floor store is the source of truth
      return;
    }

    // Create batch command for complex wall joining operation
    const commands = [];

    // Add the new wall
    commands.push(new AddWallCommand(newWall.id, addWall, removeWall, newWall));

    // Update existing walls
    joinResult.wallsToUpdate.forEach(({ wallId, updates }) => {
      const existingWall = walls.find(w => w.id === wallId);
      if (existingWall) {
        commands.push(new UpdateWallCommand(
          wallId,
          updateWall,
          existingWall,
          updates
        ));
      }
    });

    // Add new split walls if any
    if (joinResult.newWalls) {
      joinResult.newWalls.forEach(wall => {
        commands.push(new AddWallCommand(wall.id, addWall, removeWall, wall));
      });
    }

    // Execute all commands as a batch
    const batchCommand = new BatchCommand(
      commands,
      `Add wall with intersection handling (${commands.length} operations)`
    );
    // Add all new walls to current floor first
    if (currentFloorId) {
      addElementToFloor(currentFloorId, 'walls', newWall);
      if (joinResult.newWalls) {
        joinResult.newWalls.forEach(wall => {
          addElementToFloor(currentFloorId, 'walls', wall);
        });
      }
    }
    
    executeCommand(batchCommand);
    
    // Also update all affected walls in floor store for visual rendering
    if (currentFloorId) {
      // Update other affected walls in floor store
      joinResult.wallsToUpdate.forEach(({ wallId: affectedWallId, updates: wallUpdates }) => {
        updateElementInFloor(currentFloorId, 'walls', affectedWallId, wallUpdates);
      });
      
      // Add new split walls to floor store
      if (joinResult.newWalls) {
        joinResult.newWalls.forEach(wall => {
          updateElementInFloor(currentFloorId, 'walls', wall.id, wall);
        });
      }
    }
    
    // Switch to select tool and select the main new wall
    setActiveTool('select');
    selectElement(newWall.id, 'wall');
  }, [walls, addWall, updateWall, removeWall, executeCommand, currentFloorId, addElementToFloor, updateElementInFloor, setActiveTool, selectElement]);

  const updateWallWithIntersectionHandling = useCallback((
    wallId: string,
    updates: Partial<Wall>
  ) => {
    const existingWall = walls.find(w => w.id === wallId);
    if (!existingWall) return;

    const updatedWall = { ...existingWall, ...updates };
    const otherWalls = walls.filter(w => w.id !== wallId);
    const joinResult = calculateWallJoining(updatedWall, otherWalls);

    if (!joinResult.shouldJoin) {
      // No intersections, just update normally
      const command = new UpdateWallCommand(wallId, updateWall, existingWall, updates);
      executeCommand(command);
      
      // Also update in floor store for visual rendering
      if (currentFloorId) {
        updateElementInFloor(currentFloorId, 'walls', wallId, updates);
      }
      return;
    }

    // Create batch command for complex wall update with joining
    const commands = [];

    // Update the main wall
    commands.push(new UpdateWallCommand(wallId, updateWall, existingWall, updates));

    // Update other affected walls
    joinResult.wallsToUpdate.forEach(({ wallId: affectedWallId, updates: wallUpdates }) => {
      const affectedWall = walls.find(w => w.id === affectedWallId);
      if (affectedWall) {
        commands.push(new UpdateWallCommand(
          affectedWallId,
          updateWall,
          affectedWall,
          wallUpdates
        ));
      }
    });

    // Add new split walls if any
    if (joinResult.newWalls) {
      joinResult.newWalls.forEach(wall => {
        commands.push(new AddWallCommand(wall.id, addWall, removeWall, wall));
      });
    }

    // Execute all commands as a batch
    const batchCommand = new BatchCommand(
      commands,
      `Update wall with intersection handling (${commands.length} operations)`
    );
    executeCommand(batchCommand);
  }, [walls, updateWall, addWall, removeWall, executeCommand, currentFloorId, updateElementInFloor]);

  const checkWallIntersections = useCallback((wall: Wall): WallJoinResult => {
    const otherWalls = walls.filter(w => w.id !== wall.id);
    return calculateWallJoining(wall, otherWalls);
  }, [walls]);

  return {
    addWallWithIntersectionHandling,
    updateWallWithIntersectionHandling,
    checkWallIntersections,
  };
};