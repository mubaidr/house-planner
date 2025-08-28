import { DesignState } from '@/stores/designStore';

export interface Command {
  id: string;
  timestamp: number;
  description: string;
  execute: () => void;
  undo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface CommandHistoryState {
  past: DesignState[];
  present: DesignState;
  future: DesignState[];
  maxHistorySize: number;
}

export class CommandHistory {
  private state: CommandHistoryState;
  private onStateChange?: (state: DesignState) => void;

  constructor(
    initialState: DesignState,
    maxHistorySize: number = 50,
    onStateChange?: (state: DesignState) => void
  ) {
    this.state = {
      past: [],
      present: { ...initialState },
      future: [],
      maxHistorySize,
    };
    this.onStateChange = onStateChange;
  }

  /**
   * Execute a command and add it to history
   */
  execute(command: Omit<Command, 'id' | 'timestamp'>): void {
    // Execute the command
    command.execute();

    // Add current state to past
    this.state.past.push({ ...this.state.present });

    // Update present state (this should be done by the command execution)
    // For now, we'll assume the command updates the state

    // Clear future (can't redo after new command)
    this.state.future = [];

    // Limit history size
    if (this.state.past.length > this.state.maxHistorySize) {
      this.state.past.shift();
    }

    this.notifyStateChange();
  }

  /**
   * Undo the last command
   */
  undo(): boolean {
    if (this.state.past.length === 0) {
      return false;
    }

    // Move current state to future
    this.state.future.unshift({ ...this.state.present });

    // Restore previous state
    this.state.present = this.state.past.pop()!;

    this.notifyStateChange();
    return true;
  }

  /**
   * Redo the next command
   */
  redo(): boolean {
    if (this.state.future.length === 0) {
      return false;
    }

    // Move current state to past
    this.state.past.push({ ...this.state.present });

    // Restore next state
    this.state.present = this.state.future.shift()!;

    this.notifyStateChange();
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.state.past.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.state.future.length > 0;
  }

  /**
   * Get current state
   */
  getCurrentState(): DesignState {
    return { ...this.state.present };
  }

  /**
   * Set current state (for external state updates)
   */
  setCurrentState(state: DesignState): void {
    this.state.present = { ...state };
    // Clear future when state is set externally
    this.state.future = [];
    this.notifyStateChange();
  }

  /**
   * Clear history
   */
  clear(): void {
    this.state.past = [];
    this.state.future = [];
    this.notifyStateChange();
  }

  /**
   * Get history info
   */
  getHistoryInfo() {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      pastCount: this.state.past.length,
      futureCount: this.state.future.length,
    };
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getCurrentState());
    }
  }
}

// Command factory functions
export const CommandFactory = {
  /**
   * Create a command for adding a wall
   */
  addWall: (wallData: any, addWallFn: (wall: any) => void, removeWallFn: (id: string) => void) => {
    let addedWallId: string | null = null;

    return {
      description: 'Add wall',
      execute: () => {
        // This would be handled by the store
        addWallFn(wallData);
        // In a real implementation, we'd capture the returned ID
      },
      undo: () => {
        if (addedWallId) {
          removeWallFn(addedWallId);
        }
      },
      canUndo: true,
      canRedo: true,
    };
  },

  /**
   * Create a command for deleting an element
   */
  deleteElement: (
    elementId: string,
    elementType: string,
    elementData: any,
    deleteFn: (id: string) => void,
    restoreFn: (data: any) => void
  ) => {
    return {
      description: `Delete ${elementType}`,
      execute: () => {
        deleteFn(elementId);
      },
      undo: () => {
        restoreFn(elementData);
      },
      canUndo: true,
      canRedo: true,
    };
  },

  /**
   * Create a command for moving an element
   */
  moveElement: (
    elementId: string,
    oldPosition: any,
    newPosition: any,
    updateFn: (id: string, updates: any) => void
  ) => {
    return {
      description: 'Move element',
      execute: () => {
        updateFn(elementId, { position: newPosition });
      },
      undo: () => {
        updateFn(elementId, { position: oldPosition });
      },
      canUndo: true,
      canRedo: true,
    };
  },
};
