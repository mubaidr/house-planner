
export interface Command {
  execute: () => void;
  undo: () => void;
  description: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  action: string;
  beforeState: any;
  afterState: any;
  metadata?: Record<string, any>;
}

export interface HistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
  maxSize: number;
}

// Global history state
let historyState: HistoryState = {
  entries: [],
  currentIndex: -1,
  maxSize: 100
};

function safeClone(obj: any): any {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    // Handle circular references by creating a simple copy
    if (error instanceof TypeError && error.message.includes('circular')) {
      return { ...obj, self: undefined };
    }
    return obj;
  }
}

export function createHistoryEntry(
  action: string,
  beforeState: any,
  afterState: any,
  metadata?: Record<string, any>
): HistoryEntry {
  return {
    id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    action,
    beforeState: safeClone(beforeState),
    afterState: safeClone(afterState),
    metadata
  };
}

export function addToHistory(action: string, beforeState: any, afterState: any, metadata?: Record<string, any>): void {
  const entry = createHistoryEntry(action, beforeState, afterState, metadata);
  
  // Remove any entries after current index (when adding after undo)
  historyState.entries = historyState.entries.slice(0, historyState.currentIndex + 1);
  
  // Add new entry
  historyState.entries.push(entry);
  historyState.currentIndex = historyState.entries.length - 1;
  
  // Maintain max size
  if (historyState.entries.length > historyState.maxSize) {
    historyState.entries.shift();
    historyState.currentIndex--;
  }
}

export function undo(): { success: boolean; state?: any; action?: string } {
  if (!canUndo()) return { success: false };
  
  const currentEntry = historyState.entries[historyState.currentIndex];
  historyState.currentIndex--;
  
  return {
    success: true,
    state: currentEntry.beforeState,
    action: currentEntry.action
  };
}

export function redo(): { success: boolean; state?: any; action?: string } {
  if (!canRedo()) return { success: false };
  
  historyState.currentIndex++;
  const currentEntry = historyState.entries[historyState.currentIndex];
  
  return {
    success: true,
    state: currentEntry.afterState,
    action: currentEntry.action
  };
}

export function canUndo(): boolean {
  return historyState.currentIndex >= 0;
}

export function canRedo(): boolean {
  return historyState.currentIndex < historyState.entries.length - 1;
}

export function clearHistory(): void {
  historyState.entries = [];
  historyState.currentIndex = -1;
}

export function getHistoryState(): HistoryState {
  return { ...historyState };
}

export function createSnapshot(): HistoryState {
  return JSON.parse(JSON.stringify(historyState));
}

export function restoreSnapshot(snapshot: HistoryState): void {
  historyState = { ...snapshot };
}

export function compressHistory(): void {
  const compressed: HistoryEntry[] = [];
  let lastAction = '';
  
  for (const entry of historyState.entries) {
    if (entry.action !== lastAction) {
      compressed.push(entry);
      lastAction = entry.action;
    }
  }
  
  historyState.entries = compressed;
  historyState.currentIndex = Math.min(historyState.currentIndex, compressed.length - 1);
}
