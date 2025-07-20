import { act, renderHook } from '@testing-library/react';
import { useHistoryStore } from '@/stores/historyStore';
import { Command } from '@/utils/history';

// Mock command implementation for testing
class MockCommand implements Command {
  public executed = false;
  public undone = false;

  constructor(
    public description: string,
    private executeCallback?: () => void,
    private undoCallback?: () => void
  ) {}

  execute(): void {
    this.executed = true;
    this.undone = false;
    this.executeCallback?.();
  }

  undo(): void {
    this.undone = true;
    this.executed = false;
    this.undoCallback?.();
  }
}

describe('HistoryStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useHistoryStore.getState().clearHistory();
    });
  });

  describe('Initial State', () => {
    it('should have correct default values', () => {
      const state = useHistoryStore.getState();
      
      expect(state.undoStack).toEqual([]);
      expect(state.redoStack).toEqual([]);
      expect(state.maxHistorySize).toBe(50);
    });

    it('should indicate no undo/redo available initially', () => {
      const state = useHistoryStore.getState();
      
      expect(state.canUndo()).toBe(false);
      expect(state.canRedo()).toBe(false);
      expect(state.getUndoDescription()).toBe(null);
      expect(state.getRedoDescription()).toBe(null);
    });
  });

  describe('executeCommand', () => {
    it('should execute command and add to undo stack', () => {
      const command = new MockCommand('Test Command');
      
      act(() => {
        useHistoryStore.getState().executeCommand(command);
      });

      expect(command.executed).toBe(true);
      
      const state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(1);
      expect(state.undoStack[0]).toBe(command);
      expect(state.redoStack).toHaveLength(0);
      expect(state.canUndo()).toBe(true);
      expect(state.canRedo()).toBe(false);
    });

    it('should clear redo stack when executing new command', () => {
      const command1 = new MockCommand('Command 1');
      const command2 = new MockCommand('Command 2');
      const command3 = new MockCommand('Command 3');

      act(() => {
        // Execute commands and undo one to populate redo stack
        useHistoryStore.getState().executeCommand(command1);
        useHistoryStore.getState().executeCommand(command2);
        useHistoryStore.getState().undo();
      });

      let state = useHistoryStore.getState();
      expect(state.redoStack).toHaveLength(1);

      act(() => {
        // Execute new command should clear redo stack
        useHistoryStore.getState().executeCommand(command3);
      });

      state = useHistoryStore.getState();
      expect(state.redoStack).toHaveLength(0);
      expect(state.undoStack).toHaveLength(2);
      expect(state.undoStack[1]).toBe(command3);
    });

    it('should respect max history size', () => {
      const commands = Array.from({ length: 55 }, (_, i) => 
        new MockCommand(`Command ${i + 1}`)
      );

      act(() => {
        commands.forEach(command => {
          useHistoryStore.getState().executeCommand(command);
        });
      });

      const state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(50); // maxHistorySize
      expect(state.undoStack[0]).toBe(commands[5]); // First 5 should be removed
      expect(state.undoStack[49]).toBe(commands[54]); // Last command should be at the end
    });

    it('should call execute callback', () => {
      const executeCallback = jest.fn();
      const command = new MockCommand('Test Command', executeCallback);
      
      act(() => {
        useHistoryStore.getState().executeCommand(command);
      });

      expect(executeCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('undo', () => {
    it('should undo last command and move to redo stack', () => {
      const command = new MockCommand('Test Command');
      
      act(() => {
        useHistoryStore.getState().executeCommand(command);
        useHistoryStore.getState().undo();
      });

      expect(command.undone).toBe(true);
      
      const state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(1);
      expect(state.redoStack[0]).toBe(command);
      expect(state.canUndo()).toBe(false);
      expect(state.canRedo()).toBe(true);
    });

    it('should do nothing when undo stack is empty', () => {
      act(() => {
        useHistoryStore.getState().undo();
      });

      const state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(0);
    });

    it('should undo multiple commands in correct order', () => {
      const command1 = new MockCommand('Command 1');
      const command2 = new MockCommand('Command 2');
      const command3 = new MockCommand('Command 3');

      act(() => {
        useHistoryStore.getState().executeCommand(command1);
        useHistoryStore.getState().executeCommand(command2);
        useHistoryStore.getState().executeCommand(command3);
      });

      act(() => {
        useHistoryStore.getState().undo(); // Should undo command3
      });

      expect(command3.undone).toBe(true);
      expect(command2.undone).toBe(false);
      expect(command1.undone).toBe(false);

      let state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(2);
      expect(state.redoStack).toHaveLength(1);
      expect(state.redoStack[0]).toBe(command3);

      act(() => {
        useHistoryStore.getState().undo(); // Should undo command2
      });

      expect(command2.undone).toBe(true);
      expect(command1.undone).toBe(false);

      state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(1);
      expect(state.redoStack).toHaveLength(2);
      expect(state.redoStack[1]).toBe(command2);
    });

    it('should call undo callback', () => {
      const undoCallback = jest.fn();
      const command = new MockCommand('Test Command', undefined, undoCallback);
      
      act(() => {
        useHistoryStore.getState().executeCommand(command);
        useHistoryStore.getState().undo();
      });

      expect(undoCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('redo', () => {
    it('should redo last undone command', () => {
      const command = new MockCommand('Test Command');
      
      act(() => {
        useHistoryStore.getState().executeCommand(command);
        useHistoryStore.getState().undo();
        useHistoryStore.getState().redo();
      });

      expect(command.executed).toBe(true);
      expect(command.undone).toBe(false);
      
      const state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(1);
      expect(state.redoStack).toHaveLength(0);
      expect(state.undoStack[0]).toBe(command);
    });

    it('should do nothing when redo stack is empty', () => {
      act(() => {
        useHistoryStore.getState().redo();
      });

      const state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(0);
    });

    it('should redo multiple commands in correct order', () => {
      const command1 = new MockCommand('Command 1');
      const command2 = new MockCommand('Command 2');

      act(() => {
        useHistoryStore.getState().executeCommand(command1);
        useHistoryStore.getState().executeCommand(command2);
        useHistoryStore.getState().undo();
        useHistoryStore.getState().undo();
      });

      // Both commands should be undone
      expect(command1.undone).toBe(true);
      expect(command2.undone).toBe(true);

      act(() => {
        useHistoryStore.getState().redo(); // Should redo command1
      });

      expect(command1.executed).toBe(true);
      expect(command1.undone).toBe(false);
      expect(command2.undone).toBe(true);

      let state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(1);
      expect(state.redoStack).toHaveLength(1);

      act(() => {
        useHistoryStore.getState().redo(); // Should redo command2
      });

      expect(command2.executed).toBe(true);
      expect(command2.undone).toBe(false);

      state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(2);
      expect(state.redoStack).toHaveLength(0);
    });
  });

  describe('canUndo and canRedo', () => {
    it('should correctly report undo/redo availability', () => {
      const command = new MockCommand('Test Command');
      
      // Initially no undo/redo available
      let state = useHistoryStore.getState();
      expect(state.canUndo()).toBe(false);
      expect(state.canRedo()).toBe(false);

      act(() => {
        useHistoryStore.getState().executeCommand(command);
      });

      // After execute: undo available, no redo
      state = useHistoryStore.getState();
      expect(state.canUndo()).toBe(true);
      expect(state.canRedo()).toBe(false);

      act(() => {
        useHistoryStore.getState().undo();
      });

      // After undo: no undo, redo available
      state = useHistoryStore.getState();
      expect(state.canUndo()).toBe(false);
      expect(state.canRedo()).toBe(true);

      act(() => {
        useHistoryStore.getState().redo();
      });

      // After redo: undo available, no redo
      state = useHistoryStore.getState();
      expect(state.canUndo()).toBe(true);
      expect(state.canRedo()).toBe(false);
    });
  });

  describe('getUndoDescription and getRedoDescription', () => {
    it('should return correct descriptions', () => {
      const command1 = new MockCommand('Add Wall');
      const command2 = new MockCommand('Move Door');
      
      act(() => {
        useHistoryStore.getState().executeCommand(command1);
        useHistoryStore.getState().executeCommand(command2);
      });

      let state = useHistoryStore.getState();
      expect(state.getUndoDescription()).toBe('Move Door');
      expect(state.getRedoDescription()).toBe(null);

      act(() => {
        useHistoryStore.getState().undo();
      });

      state = useHistoryStore.getState();
      expect(state.getUndoDescription()).toBe('Add Wall');
      expect(state.getRedoDescription()).toBe('Move Door');

      act(() => {
        useHistoryStore.getState().undo();
      });

      state = useHistoryStore.getState();
      expect(state.getUndoDescription()).toBe(null);
      expect(state.getRedoDescription()).toBe('Add Wall');
    });
  });

  describe('clearHistory', () => {
    it('should clear both undo and redo stacks', () => {
      const command1 = new MockCommand('Command 1');
      const command2 = new MockCommand('Command 2');
      
      act(() => {
        useHistoryStore.getState().executeCommand(command1);
        useHistoryStore.getState().executeCommand(command2);
        useHistoryStore.getState().undo();
      });

      // Should have items in both stacks
      let state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(1);
      expect(state.redoStack).toHaveLength(1);

      act(() => {
        useHistoryStore.getState().clearHistory();
      });

      state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(0);
      expect(state.canUndo()).toBe(false);
      expect(state.canRedo()).toBe(false);
      expect(state.getUndoDescription()).toBe(null);
      expect(state.getRedoDescription()).toBe(null);
    });
  });

  describe('Complex Workflows', () => {
    it('should handle complex undo/redo workflows', () => {
      const commands = [
        new MockCommand('Add Wall'),
        new MockCommand('Add Door'),
        new MockCommand('Move Wall'),
        new MockCommand('Delete Door'),
      ];

      // Execute all commands
      act(() => {
        commands.forEach(cmd => useHistoryStore.getState().executeCommand(cmd));
      });

      let state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(4);
      expect(state.getUndoDescription()).toBe('Delete Door');

      // Undo 2 commands
      act(() => {
        useHistoryStore.getState().undo();
        useHistoryStore.getState().undo();
      });

      state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(2);
      expect(state.redoStack).toHaveLength(2);
      expect(state.getUndoDescription()).toBe('Add Door');
      expect(state.getRedoDescription()).toBe('Move Wall');

      // Execute new command (should clear redo stack)
      const newCommand = new MockCommand('Add Window');
      act(() => {
        useHistoryStore.getState().executeCommand(newCommand);
      });

      state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(3);
      expect(state.redoStack).toHaveLength(0);
      expect(state.getUndoDescription()).toBe('Add Window');
      expect(state.getRedoDescription()).toBe(null);
    });

    it('should handle rapid undo/redo operations', () => {
      const commands = Array.from({ length: 10 }, (_, i) => 
        new MockCommand(`Command ${i + 1}`)
      );

      act(() => {
        commands.forEach(cmd => useHistoryStore.getState().executeCommand(cmd));
      });

      // Undo all
      act(() => {
        for (let i = 0; i < 10; i++) {
          useHistoryStore.getState().undo();
        }
      });

      let state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(10);

      // Redo all
      act(() => {
        for (let i = 0; i < 10; i++) {
          useHistoryStore.getState().redo();
        }
      });

      state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(10);
      expect(state.redoStack).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle commands with no callbacks', () => {
      const command = new MockCommand('Simple Command');
      
      expect(() => {
        act(() => {
          useHistoryStore.getState().executeCommand(command);
          useHistoryStore.getState().undo();
          useHistoryStore.getState().redo();
        });
      }).not.toThrow();
    });

    it('should handle empty command descriptions', () => {
      const command = new MockCommand('');
      
      act(() => {
        useHistoryStore.getState().executeCommand(command);
      });

      const state = useHistoryStore.getState();
      expect(state.getUndoDescription()).toBe('');
    });

    it('should maintain command state correctly', () => {
      const command = new MockCommand('Test Command');
      
      act(() => {
        useHistoryStore.getState().executeCommand(command);
      });

      expect(command.executed).toBe(true);
      expect(command.undone).toBe(false);

      act(() => {
        useHistoryStore.getState().undo();
      });

      expect(command.executed).toBe(false);
      expect(command.undone).toBe(true);

      act(() => {
        useHistoryStore.getState().redo();
      });

      expect(command.executed).toBe(true);
      expect(command.undone).toBe(false);
    });
  });
});