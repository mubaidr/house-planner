import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Command } from '@/utils/history';

interface HistoryState {
  undoStack: Command[];
  redoStack: Command[];
  maxHistorySize: number;
}

interface HistoryActions {
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

export const useHistoryStore = create<HistoryState & HistoryActions>()(
  immer((set, get) => ({
    // State
    undoStack: [],
    redoStack: [],
    maxHistorySize: 50,

    // Actions
    executeCommand: (command: Command) => {
      command.execute();
      set((state) => {
        state.undoStack.push(command);
        if (state.undoStack.length > state.maxHistorySize) {
          state.undoStack.shift();
        }
        state.redoStack = [];
      });
    },

    undo: () => {
      const { undoStack, redoStack } = get();
      if (undoStack.length === 0) return;

      const command = undoStack[undoStack.length - 1];
      command.undo();

      set((state) => {
        state.undoStack.pop();
        state.redoStack.push(command);
      });
    },

    redo: () => {
      const { undoStack, redoStack } = get();
      if (redoStack.length === 0) return;

      const command = redoStack[redoStack.length - 1];
      command.execute();

      set((state) => {
        state.redoStack.pop();
        state.undoStack.push(command);
      });
    },

    canUndo: () => {
      return get().undoStack.length > 0;
    },

    canRedo: () => {
      return get().redoStack.length > 0;
    },

    clearHistory: () => {
      set((state) => {
        state.undoStack = [];
        state.redoStack = [];
      });
    },

    getUndoDescription: () => {
      const { undoStack } = get();
      return undoStack.length > 0 ? undoStack[undoStack.length - 1].description : null;
    },

    getRedoDescription: () => {
      const { redoStack } = get();
      return redoStack.length > 0 ? redoStack[redoStack.length - 1].description : null;
    },
  }))
);