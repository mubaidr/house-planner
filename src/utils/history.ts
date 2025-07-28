// Command for toggling layer visibility in a 2D view
export class ToggleLayerVisibilityCommand implements Command {
  private view: any;
  private layer: string;
  private oldVisibility: boolean;
  private newVisibility: boolean;
  private setVisibilityFn: (view: any, layer: string, visible: boolean) => void;

  constructor(
    view: any,
    layer: string,
    oldVisibility: boolean,
    newVisibility: boolean,
    setVisibilityFn: (view: any, layer: string, visible: boolean) => void
  ) {
    this.view = view;
    this.layer = layer;
    this.oldVisibility = oldVisibility;
    this.newVisibility = newVisibility;
    this.setVisibilityFn = setVisibilityFn;
  }

  execute(): void {
    this.setVisibilityFn(this.view, this.layer, this.newVisibility);
  }

  undo(): void {
    this.setVisibilityFn(this.view, this.layer, this.oldVisibility);
  }

  get description(): string {
    return `Toggle visibility of layer '${this.layer}' in view '${this.view}'`;
  }
}

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

// Command implementations for element updates
export class UpdateWallCommand implements Command {
  private wallId: string;
  private updateFn: (id: string, updates: any) => void;
  private originalData: any;
  private newData: any;

  constructor(wallId: string, updateFn: (id: string, updates: any) => void, originalData: any, newData: any) {
    this.wallId = wallId;
    this.updateFn = updateFn;
    this.originalData = originalData;
    this.newData = newData;
  }

  execute(): void {
    this.updateFn(this.wallId, this.newData);
  }

  undo(): void {
    this.updateFn(this.wallId, this.originalData);
  }

  get description(): string {
    return `Update wall ${this.wallId}`;
  }
}

export class UpdateDoorCommand implements Command {
  private doorId: string;
  private updateFn: (id: string, updates: any) => void;
  private originalData: any;
  private newData: any;

  constructor(doorId: string, updateFn: (id: string, updates: any) => void, originalData: any, newData: any) {
    this.doorId = doorId;
    this.updateFn = updateFn;
    this.originalData = originalData;
    this.newData = newData;
  }

  execute(): void {
    this.updateFn(this.doorId, this.newData);
  }

  undo(): void {
    this.updateFn(this.doorId, this.originalData);
  }

  get description(): string {
    return `Update door ${this.doorId}`;
  }
}

export class UpdateWindowCommand implements Command {
  private windowId: string;
  private updateFn: (id: string, updates: any) => void;
  private originalData: any;
  private newData: any;

  constructor(windowId: string, updateFn: (id: string, updates: any) => void, originalData: any, newData: any) {
    this.windowId = windowId;
    this.updateFn = updateFn;
    this.originalData = originalData;
    this.newData = newData;
  }

  execute(): void {
    this.updateFn(this.windowId, this.newData);
  }

  undo(): void {
    this.updateFn(this.windowId, this.originalData);
  }

  get description(): string {
    return `Update window ${this.windowId}`;
  }
}

export class RemoveDoorCommand implements Command {
  private doorId: string;
  private removeFn: (id: string) => void;
  private addFn: (door: any) => void;
  private doorData: any;

  constructor(doorId: string, removeFn: (id: string) => void, addFn: (door: any) => void, doorData: any) {
    this.doorId = doorId;
    this.removeFn = removeFn;
    this.addFn = addFn;
    this.doorData = doorData;
  }

  execute(): void {
    this.removeFn(this.doorId);
  }

  undo(): void {
    this.addFn(this.doorData);
  }

  get description(): string {
    return `Remove door ${this.doorId}`;
  }
}

export class RemoveWallCommand implements Command {
  private wallId: string;
  private removeFn: (id: string) => void;
  private addFn: (wall: any) => void;
  private wallData: any;

  constructor(wallId: string, removeFn: (id: string) => void, addFn: (wall: any) => void, wallData: any) {
    this.wallId = wallId;
    this.removeFn = removeFn;
    this.addFn = addFn;
    this.wallData = wallData;
  }

  execute(): void {
    this.removeFn(this.wallId);
  }

  undo(): void {
    this.addFn(this.wallData);
  }

  get description(): string {
    return `Remove wall ${this.wallId}`;
  }
}

export class AddWallCommand implements Command {
  private wallData: any;
  private addFn: (wall: any) => void;
  private removeFn: (id: string) => void;

  constructor(wallData: any, addFn: (wall: any) => void, removeFn: (id: string) => void) {
    this.wallData = wallData;
    this.addFn = addFn;
    this.removeFn = removeFn;
  }

  execute(): void {
    this.addFn(this.wallData);
  }

  undo(): void {
    this.removeFn(this.wallData.id);
  }

  get description(): string {
    return `Add wall ${this.wallData.id}`;
  }
}

export class BatchCommand implements Command {
  private commands: Command[];

  constructor(commands: Command[]) {
    this.commands = commands;
  }

  execute(): void {
    this.commands.forEach(cmd => cmd.execute());
  }

  undo(): void {
    // Undo commands in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  get description(): string {
    return `Batch operation (${this.commands.length} commands)`;
  }
}

export class RemoveWindowCommand implements Command {
  private windowId: string;
  private removeFn: (id: string) => void;
  private addFn: (window: any) => void;
  private windowData: any;

  constructor(windowId: string, removeFn: (id: string) => void, addFn: (window: any) => void, windowData: any) {
    this.windowId = windowId;
    this.removeFn = removeFn;
    this.addFn = addFn;
    this.windowData = windowData;
  }

  execute(): void {
    this.removeFn(this.windowId);
  }

  undo(): void {
    this.addFn(this.windowData);
  }

  get description(): string {
    return `Remove window ${this.windowId}`;
  }
}

export class ChangeViewCommand implements Command {
  private oldView: any;
  private newView: any;
  private setViewFn: (view: any) => void;

  constructor(oldView: any, newView: any, setViewFn: (view: any) => void) {
    this.oldView = oldView;
    this.newView = newView;
    this.setViewFn = setViewFn;
  }

  execute(): void {
    this.setViewFn(this.newView);
  }

  undo(): void {
    this.setViewFn(this.oldView);
  }

  get description(): string {
    return `Change view`;
  }
}

export class ChangeViewTransformCommand implements Command {
  private oldTransform: any;
  private newTransform: any;
  private setTransformFn: (transform: any) => void;

  constructor(oldTransform: any, newTransform: any, setTransformFn: (transform: any) => void) {
    this.oldTransform = oldTransform;
    this.newTransform = newTransform;
    this.setTransformFn = setTransformFn;
  }

  execute(): void {
    this.setTransformFn(this.newTransform);
  }

  undo(): void {
    this.setTransformFn(this.oldTransform);
  }

  get description(): string {
    return `Change view transform`;
  }
}
