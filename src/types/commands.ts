// Command pattern types for undo/redo functionality

export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

export class AddWallCommand implements Command {
  constructor(
    private wallId: string,
    private addWall: (wall: any) => void,
    private removeWall: (id: string) => void,
    private wall: any
  ) {}

  execute(): void {
    this.addWall(this.wall);
  }

  undo(): void {
    this.removeWall(this.wallId);
  }

  get description(): string {
    return `Add wall ${this.wallId}`;
  }
}

export class UpdateWallCommand implements Command {
  constructor(
    private wallId: string,
    private updateWall: (id: string, updates: any) => void,
    private previousState: any,
    private updates: any
  ) {}

  execute(): void {
    this.updateWall(this.wallId, this.updates);
  }

  undo(): void {
    this.updateWall(this.wallId, this.previousState);
  }

  get description(): string {
    return `Update wall ${this.wallId}`;
  }
}

export class BatchCommand implements Command {
  constructor(
    private commands: Command[],
    private _description: string
  ) {}

  execute(): void {
    this.commands.forEach(cmd => cmd.execute());
  }

  undo(): void {
    // Execute in reverse order for undo
    [...this.commands].reverse().forEach(cmd => cmd.undo());
  }

  get description(): string {
    return this._description;
  }
}

// Wall joining result types
export interface WallJoinResult {
  shouldJoin: boolean;
  wallsToUpdate: Array<{
    wallId: string;
    updates: any;
  }>;
  newWalls: any[];
  intersections: Array<{
    point: { x: number; y: number };
    wallIds: string[];
    type: 'cross' | 'corner' | 't-junction';
  }>;
}

// Wall joining calculation function (placeholder for now)
export function calculateWallJoining(_wall: any, _walls: any[]): WallJoinResult {
  // TODO: Implement proper wall joining logic
  return {
    shouldJoin: false,
    wallsToUpdate: [],
    newWalls: [],
    intersections: []
  };
}
