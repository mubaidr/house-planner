import { useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { useHistoryStore } from '@/stores/historyStore';
import { Wall } from '@/types/elements/Wall';
import { calculateWallJoining, WallJoinResult } from '@/utils/wallIntersection';
import { AddWallCommand, UpdateWallCommand, BatchCommand } from '@/utils/history';

export const useWallIntersection = () => {
  const { addWall, updateWall, removeWall, walls } = useDesignStore();
  const { executeCommand } = useHistoryStore();

  const addWallWithIntersectionHandling = useCallback((newWall: Wall) => {
    const joinResult = calculateWallJoining(newWall, walls);

    if (!joinResult.shouldJoin) {
      // No intersections, just add the wall normally
      const command = new AddWallCommand(newWall.id, addWall, removeWall, newWall);
      executeCommand(command);
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
    executeCommand(batchCommand);
  }, [walls, addWall, updateWall, removeWall, executeCommand]);

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
  }, [walls, updateWall, addWall, removeWall, executeCommand]);

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