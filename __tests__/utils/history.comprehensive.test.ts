import {
  createHistoryEntry,
  addToHistory,
  undo,
  redo,
  canUndo,
  canRedo,
  clearHistory,
  getHistoryState,
  createSnapshot,
  restoreSnapshot,
  compressHistory,
} from '../../src/utils/history';

describe('history - Comprehensive Tests', () => {
  const mockState = {
    walls: [{ id: 'wall-1', type: 'wall', startX: 0, startY: 0, endX: 100, endY: 0 }],
    doors: [],
    windows: [],
  };

  const mockState2 = {
    walls: [
      { id: 'wall-1', type: 'wall', startX: 0, startY: 0, endX: 100, endY: 0 },
      { id: 'wall-2', type: 'wall', startX: 100, startY: 0, endX: 100, endY: 100 }
    ],
    doors: [],
    windows: [],
  };

  beforeEach(() => {
    clearHistory();
  });

  describe('createHistoryEntry', () => {
    it('should create a history entry with required properties', () => {
      const entry = createHistoryEntry('Add Wall', mockState, mockState2);
      
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('timestamp');
      expect(entry.action).toBe('Add Wall');
      expect(entry.beforeState).toEqual(mockState);
      expect(entry.afterState).toEqual(mockState2);
    });

    it('should generate unique IDs for different entries', () => {
      const entry1 = createHistoryEntry('Action 1', mockState, mockState2);
      const entry2 = createHistoryEntry('Action 2', mockState, mockState2);
      
      expect(entry1.id).not.toBe(entry2.id);
    });

    it('should include metadata when provided', () => {
      const metadata = { elementId: 'wall-1', tool: 'wall-tool' };
      const entry = createHistoryEntry('Add Wall', mockState, mockState2, metadata);
      
      expect(entry.metadata).toEqual(metadata);
    });
  });

  describe('addToHistory', () => {
    it('should add entry to history', () => {
      addToHistory('Add Wall', mockState, mockState2);
      
      const historyState = getHistoryState();
      expect(historyState.entries).toHaveLength(1);
      expect(historyState.entries[0].action).toBe('Add Wall');
    });

    it('should update current index when adding entries', () => {
      addToHistory('Action 1', mockState, mockState2);
      addToHistory('Action 2', mockState2, mockState);
      
      const historyState = getHistoryState();
      expect(historyState.currentIndex).toBe(1);
      expect(historyState.entries).toHaveLength(2);
    });

    it('should clear redo history when adding new entry after undo', () => {
      addToHistory('Action 1', mockState, mockState2);
      addToHistory('Action 2', mockState2, mockState);
      
      undo(); // Go back one step
      addToHistory('New Action', mockState2, mockState); // Should clear redo
      
      const historyState = getHistoryState();
      expect(historyState.entries).toHaveLength(2);
      expect(historyState.entries[1].action).toBe('New Action');
    });

    it('should respect maximum history size', () => {
      // Add more entries than the maximum allowed
      for (let i = 0; i < 150; i++) {
        addToHistory(`Action ${i}`, mockState, mockState2);
      }
      
      const historyState = getHistoryState();
      expect(historyState.entries.length).toBeLessThanOrEqual(100); // Assuming max is 100
    });
  });

  describe('undo', () => {
    it('should undo the last action', () => {
      addToHistory('Add Wall', mockState, mockState2);
      
      const result = undo();
      expect(result.success).toBe(true);
      expect(result.state).toEqual(mockState);
      expect(result.action).toBe('Add Wall');
    });

    it('should return false when nothing to undo', () => {
      const result = undo();
      expect(result.success).toBe(false);
    });

    it('should handle multiple undos', () => {
      addToHistory('Action 1', mockState, mockState2);
      addToHistory('Action 2', mockState2, mockState);
      
      const undo1 = undo();
      expect(undo1.success).toBe(true);
      expect(undo1.action).toBe('Action 2');
      
      const undo2 = undo();
      expect(undo2.success).toBe(true);
      expect(undo2.action).toBe('Action 1');
      
      const undo3 = undo();
      expect(undo3.success).toBe(false);
    });
  });

  describe('redo', () => {
    it('should redo the last undone action', () => {
      addToHistory('Add Wall', mockState, mockState2);
      undo();
      
      const result = redo();
      expect(result.success).toBe(true);
      expect(result.state).toEqual(mockState2);
      expect(result.action).toBe('Add Wall');
    });

    it('should return false when nothing to redo', () => {
      const result = redo();
      expect(result.success).toBe(false);
    });

    it('should handle multiple redos', () => {
      addToHistory('Action 1', mockState, mockState2);
      addToHistory('Action 2', mockState2, mockState);
      
      undo();
      undo();
      
      const redo1 = redo();
      expect(redo1.success).toBe(true);
      expect(redo1.action).toBe('Action 1');
      
      const redo2 = redo();
      expect(redo2.success).toBe(true);
      expect(redo2.action).toBe('Action 2');
      
      const redo3 = redo();
      expect(redo3.success).toBe(false);
    });
  });

  describe('canUndo and canRedo', () => {
    it('should correctly report undo availability', () => {
      expect(canUndo()).toBe(false);
      
      addToHistory('Add Wall', mockState, mockState2);
      expect(canUndo()).toBe(true);
      
      undo();
      expect(canUndo()).toBe(false);
    });

    it('should correctly report redo availability', () => {
      expect(canRedo()).toBe(false);
      
      addToHistory('Add Wall', mockState, mockState2);
      expect(canRedo()).toBe(false);
      
      undo();
      expect(canRedo()).toBe(true);
      
      redo();
      expect(canRedo()).toBe(false);
    });
  });

  describe('createSnapshot and restoreSnapshot', () => {
    it('should create and restore snapshots', () => {
      addToHistory('Action 1', mockState, mockState2);
      addToHistory('Action 2', mockState2, mockState);
      
      const snapshot = createSnapshot();
      
      addToHistory('Action 3', mockState, mockState2);
      
      restoreSnapshot(snapshot);
      
      const historyState = getHistoryState();
      expect(historyState.entries).toHaveLength(2);
    });

    it('should handle empty snapshots', () => {
      const snapshot = createSnapshot();
      
      addToHistory('Action 1', mockState, mockState2);
      restoreSnapshot(snapshot);
      
      const historyState = getHistoryState();
      expect(historyState.entries).toHaveLength(0);
    });
  });

  describe('compressHistory', () => {
    it('should compress similar consecutive actions', () => {
      addToHistory('Move Wall', mockState, mockState2);
      addToHistory('Move Wall', mockState2, mockState);
      addToHistory('Move Wall', mockState, mockState2);
      
      compressHistory();
      
      const historyState = getHistoryState();
      expect(historyState.entries.length).toBeLessThan(3);
    });

    it('should preserve different action types', () => {
      addToHistory('Add Wall', mockState, mockState2);
      addToHistory('Add Door', mockState2, mockState);
      addToHistory('Add Window', mockState, mockState2);
      
      compressHistory();
      
      const historyState = getHistoryState();
      expect(historyState.entries).toHaveLength(3);
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle rapid successive operations', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        addToHistory(`Rapid Action ${i}`, mockState, mockState2);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete quickly
    });

    it('should handle large state objects', () => {
      const largeState = {
        walls: Array.from({ length: 1000 }, (_, i) => ({ 
          id: `wall-${i}`, 
          type: 'wall',
          startX: i, 
          startY: i, 
          endX: i + 100, 
          endY: i 
        })),
        doors: [],
        windows: [],
      };
      
      expect(() => {
        addToHistory('Large State', mockState, largeState);
      }).not.toThrow();
    });

    it('should handle circular references in state', () => {
      const circularState = { ...mockState };
      circularState.self = circularState;
      
      expect(() => {
        addToHistory('Circular State', mockState, circularState);
      }).not.toThrow();
    });

    it('should maintain memory efficiency', () => {
      // Add many entries and check memory doesn't grow unbounded
      for (let i = 0; i < 200; i++) {
        addToHistory(`Memory Test ${i}`, mockState, mockState2);
      }
      
      const historyState = getHistoryState();
      expect(historyState.entries.length).toBeLessThanOrEqual(100);
    });
  });
});