import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';

export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

export class AddWallCommand implements Command {
  constructor(
    private wallId: string,
    private addWall: (wall: Wall) => void,
    private removeWall: (id: string) => void,
    private wall: Wall
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

export class RemoveWallCommand implements Command {
  constructor(
    private wallId: string,
    private addWall: (wall: Wall) => void,
    private removeWall: (id: string) => void,
    private wall: Wall
  ) {}

  execute(): void {
    this.removeWall(this.wallId);
  }

  undo(): void {
    this.addWall(this.wall);
  }

  get description(): string {
    return `Remove wall ${this.wallId}`;
  }
}

export class UpdateWallCommand implements Command {
  constructor(
    private wallId: string,
    private updateWall: (id: string, updates: Partial<Wall>) => void,
    private oldWall: Wall,
    private newUpdates: Partial<Wall>
  ) {}

  execute(): void {
    this.updateWall(this.wallId, this.newUpdates);
  }

  undo(): void {
    this.updateWall(this.wallId, this.oldWall);
  }

  get description(): string {
    return `Update wall ${this.wallId}`;
  }
}

export class AddDoorCommand implements Command {
  constructor(
    private doorId: string,
    private addDoor: (door: Door) => void,
    private removeDoor: (id: string) => void,
    private door: Door
  ) {}

  execute(): void {
    this.addDoor(this.door);
  }

  undo(): void {
    this.removeDoor(this.doorId);
  }

  get description(): string {
    return `Add door ${this.doorId}`;
  }
}

export class RemoveDoorCommand implements Command {
  constructor(
    private doorId: string,
    private addDoor: (door: Door) => void,
    private removeDoor: (id: string) => void,
    private door: Door
  ) {}

  execute(): void {
    this.removeDoor(this.doorId);
  }

  undo(): void {
    this.addDoor(this.door);
  }

  get description(): string {
    return `Remove door ${this.doorId}`;
  }
}

export class AddWindowCommand implements Command {
  constructor(
    private windowId: string,
    private addWindow: (window: Window) => void,
    private removeWindow: (id: string) => void,
    private window: Window
  ) {}

  execute(): void {
    this.addWindow(this.window);
  }

  undo(): void {
    this.removeWindow(this.windowId);
  }

  get description(): string {
    return `Add window ${this.windowId}`;
  }
}

export class RemoveWindowCommand implements Command {
  constructor(
    private windowId: string,
    private addWindow: (window: Window) => void,
    private removeWindow: (id: string) => void,
    private window: Window
  ) {}

  execute(): void {
    this.removeWindow(this.windowId);
  }

  undo(): void {
    this.addWindow(this.window);
  }

  get description(): string {
    return `Remove window ${this.windowId}`;
  }
}

export class UpdateDoorCommand implements Command {
  constructor(
    private doorId: string,
    private updateDoor: (id: string, updates: Partial<Door>) => void,
    private oldDoor: Door,
    private newUpdates: Partial<Door>
  ) {}

  execute(): void {
    this.updateDoor(this.doorId, this.newUpdates);
  }

  undo(): void {
    this.updateDoor(this.doorId, this.oldDoor);
  }

  get description(): string {
    return `Update door ${this.doorId}`;
  }
}

export class UpdateWindowCommand implements Command {
  constructor(
    private windowId: string,
    private updateWindow: (id: string, updates: Partial<Window>) => void,
    private oldWindow: Window,
    private newUpdates: Partial<Window>
  ) {}

  execute(): void {
    this.updateWindow(this.windowId, this.newUpdates);
  }

  undo(): void {
    this.updateWindow(this.windowId, this.oldWindow);
  }

  get description(): string {
    return `Update window ${this.windowId}`;
  }
}

export class BatchCommand implements Command {
  constructor(
    private commands: Command[],
    private batchDescription: string
  ) {}

  execute(): void {
    this.commands.forEach(cmd => cmd.execute());
  }

  undo(): void {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  get description(): string {
    return this.batchDescription;
  }
}