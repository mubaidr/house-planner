import { DesignState } from '@/stores/designStore';

export interface ProjectFile {
  version: string;
  timestamp: string;
  name: string;
  description?: string;
  data: DesignState;
}

export class FileOperations {
  private static readonly VERSION = '1.0.0';
  private static readonly FILE_EXTENSION = '.house';

  /**
   * Save project to a downloadable file
   */
  static async saveProject(
    designState: DesignState,
    filename: string = 'untitled',
    description?: string
  ): Promise<void> {
    try {
      const projectFile: ProjectFile = {
        version: this.VERSION,
        timestamp: new Date().toISOString(),
        name: filename,
        description,
        data: designState,
      };

      const jsonString = JSON.stringify(projectFile, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}${this.FILE_EXTENSION}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('Failed to save project');
    }
  }

  /**
   * Load project from file input
   */
  static async loadProject(file: File): Promise<DesignState> {
    try {
      const text = await file.text();
      const projectFile: ProjectFile = JSON.parse(text);

      // Validate file format
      if (!projectFile.version || !projectFile.data) {
        throw new Error('Invalid project file format');
      }

      // Version compatibility check
      if (projectFile.version !== this.VERSION) {
        console.warn(
          `Project file version ${projectFile.version} may not be fully compatible with current version ${this.VERSION}`
        );
      }

      return projectFile.data;
    } catch (error) {
      console.error('Failed to load project:', error);
      throw new Error('Failed to load project file');
    }
  }

  /**
   * Export project as JSON string
   */
  static exportAsJSON(designState: DesignState, filename?: string): string {
    const projectFile: ProjectFile = {
      version: this.VERSION,
      timestamp: new Date().toISOString(),
      name: filename || 'exported-project',
      data: designState,
    };

    return JSON.stringify(projectFile, null, 2);
  }

  /**
   * Import project from JSON string
   */
  static importFromJSON(jsonString: string): DesignState {
    try {
      const projectFile: ProjectFile = JSON.parse(jsonString);

      if (!projectFile.version || !projectFile.data) {
        throw new Error('Invalid JSON format');
      }

      return projectFile.data;
    } catch (error) {
      console.error('Failed to import from JSON:', error);
      throw new Error('Failed to import project from JSON');
    }
  }

  /**
   * Create new empty project
   */
  static createNewProject(): DesignState {
    return {
      walls: [],
      doors: [],
      windows: [],
      stairs: [],
      rooms: [],
      roofs: [],
      materials: [],
      selectedElementId: null,
      selectedElementType: null,
      viewMode: '3d',
      activeTool: null,
    };
  }

  /**
   * Validate project data integrity
   */
  static validateProject(project: DesignState): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required properties
    if (!Array.isArray(project.walls)) errors.push('Walls must be an array');
    if (!Array.isArray(project.doors)) errors.push('Doors must be an array');
    if (!Array.isArray(project.windows)) errors.push('Windows must be an array');
    if (!Array.isArray(project.stairs)) errors.push('Stairs must be an array');
    if (!Array.isArray(project.rooms)) errors.push('Rooms must be an array');
    if (!Array.isArray(project.roofs)) errors.push('Roofs must be an array');
    if (!Array.isArray(project.materials)) errors.push('Materials must be an array');

    // Validate wall references in doors and windows
    const wallIds = new Set(project.walls.map(w => w.id));

    project.doors.forEach(door => {
      if (!wallIds.has(door.wallId)) {
        errors.push(`Door ${door.id} references non-existent wall ${door.wallId}`);
      }
    });

    project.windows.forEach(window => {
      if (!wallIds.has(window.wallId)) {
        errors.push(`Window ${window.id} references non-existent wall ${window.wallId}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get project statistics
   */
  static getProjectStats(project: DesignState) {
    return {
      walls: project.walls.length,
      doors: project.doors.length,
      windows: project.windows.length,
      stairs: project.stairs.length,
      rooms: project.rooms.length,
      roofs: project.roofs.length,
      materials: project.materials.length,
      totalElements:
        project.walls.length +
        project.doors.length +
        project.windows.length +
        project.stairs.length +
        project.rooms.length +
        project.roofs.length,
    };
  }
}
