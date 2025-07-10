import { create } from 'zustand';
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

export const useHistoryStore = create<HistoryState & HistoryActions>((set, get) => ({
  // State
  undoStack: [],
  redoStack: [],
  maxHistorySize: 50,

  // Actions
  executeCommand: (command: Command) => {
    // Execute the command
    command.execute();
    
    set((state) => {
      const newUndoStack = [...state.undoStack, command];
      
      // Limit history size
      if (newUndoStack.length > state.maxHistorySize) {
        newUndoStack.shift();
      }
      
      return {
        undoStack: newUndoStack,
        redoStack: [], // Clear redo stack when new command is executed
      };
    });
  },

  undo: () => {
    const { undoStack, redoStack } = get();
    
    if (undoStack.length === 0) return;
    
    const command = undoStack[undoStack.length - 1];
    command.undo();
    
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, command],
    });
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    
    if (redoStack.length === 0) return;
    
    const command = redoStack[redoStack.length - 1];
    command.execute();
    
    set({
      undoStack: [...undoStack, command],
      redoStack: redoStack.slice(0, -1),
    });
  },

  canUndo: () => {
    return get().undoStack.length > 0;
  },

  canRedo: () => {
    return get().redoStack.length > 0;
  },

  clearHistory: () => {
    set({
      undoStack: [],
      redoStack: [],
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
}));