/**
 * View Projection Utilities for 2D Multi-View System
 * 
 * This file contains utilities for projecting 3D architectural elements
 * into 2D views (Plan, Front, Back, Left, Right) with proper scaling,
 * positioning, and visibility calculations.
 */

import { Point2D, Element2D, Wall2D, Door2D, Window2D, Stair2D, Roof2D, ViewRenderData2D } from '@/types/elements2D';
import { ViewType2D, DEFAULT_VIEW_CONFIGS } from '@/types/views';

/**
 * 3D Point interface for projection calculations
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 3D Bounds interface
 */
export interface Bounds3D {
  min: Point3D;
  max: Point3D;
}

/**
 * Projection matrix for view transformations
 */
export interface ProjectionMatrix {
  m11: number; m12: number; m13: number; m14: number;
  m21: number; m22: number; m23: number; m24: number;
  m31: number; m32: number; m33: number; m34: number;
  m41: number; m42: number; m43: number; m44: number;
}

/**
 * Main view projection utility class
 */
export class ViewProjectionUtils {
  private static viewConfigs = DEFAULT_VIEW_CONFIGS;

  /**
   * Project a 3D point to 2D based on view type
   */
  static projectPoint(point3D: Point3D, viewType: ViewType2D): Point2D {
    const config = this.viewConfigs[viewType];
    const projection = config.projection;

    let x: number, y: number;

    switch (projection.primaryAxis) {
      case 'xy': // Plan view (top-down)
        x = point3D.x;
        y = point3D.y;
        break;
      case 'xz': // Front/Back elevation
        x = point3D.x;
        y = point3D.z;
        break;
      case 'yz': // Left/Right elevation
        x = point3D.y;
        y = point3D.z;
        break;
      default:
        x = point3D.x;
        y = point3D.y;
    }

    // Apply flips
    if (projection.flipX) x = -x;
    if (projection.flipY) y = -y;

    // Apply scale factors
    x *= projection.scaleFactors.width;
    y *= projection.scaleFactors.height;

    return { x, y };
  }

  /**
   * Unproject a 2D point back to 3D space
   */
  static unprojectPoint(point2D: Point2D, viewType: ViewType2D, defaultZ: number = 0): Point3D {
    const config = this.viewConfigs[viewType];
    const projection = config.projection;

    let x = point2D.x;
    let y = point2D.y;

    // Reverse scale factors
    x /= projection.scaleFactors.width;
    y /= projection.scaleFactors.height;

    // Reverse flips
    if (projection.flipX) x = -x;
    if (projection.flipY) y = -y;

    let point3D: Point3D;

    switch (projection.primaryAxis) {
      case 'xy': // Plan view
        point3D = { x, y, z: defaultZ };
        break;
      case 'xz': // Front/Back elevation
        point3D = { x, y: defaultZ, z: y };
        break;
      case 'yz': // Left/Right elevation
        point3D = { x: defaultZ, y: x, z: y };
        break;
      default:
        point3D = { x, y, z: defaultZ };
    }

    return point3D;
  }

  /**
   * Project a wall element to 2D view
   */
  static projectWall(wall: Wall2D, viewType: ViewType2D): Wall2D {
    const startPoint3D: Point3D = { x: wall.startPoint.x, y: wall.startPoint.y, z: 0 };
    const endPoint3D: Point3D = { x: wall.endPoint.x, y: wall.endPoint.y, z: wall.height };

    const projectedWall: Wall2D = {
      ...wall,
      startPoint: this.projectPoint(startPoint3D, viewType),
      endPoint: this.projectPoint(endPoint3D, viewType)
    };

    // Adjust wall representation based on view
    if (viewType === 'plan') {
      // In plan view, show wall as line with thickness
      projectedWall.endPoint = this.projectPoint({ x: wall.endPoint.x, y: wall.endPoint.y, z: 0 }, viewType);
    } else {
      // In elevation views, show wall height
      // For elevation views, we need to represent the wall as a rectangle
      projectedWall.startPoint = this.projectPoint(startPoint3D, viewType);
      projectedWall.endPoint = this.projectPoint({ x: wall.endPoint.x, y: wall.endPoint.y, z: 0 }, viewType);
    }

    return projectedWall;
  }

  /**
   * Project a door element to 2D view
   */
  static projectDoor(door: Door2D, viewType: ViewType2D, parentWall?: Wall2D): Door2D {
    if (!parentWall) {
      return door; // Cannot project without wall context
    }

    const wallStart3D: Point3D = { x: parentWall.startPoint.x, y: parentWall.startPoint.y, z: 0 };
    const wallEnd3D: Point3D = { x: parentWall.endPoint.x, y: parentWall.endPoint.y, z: 0 };
    
    // Calculate door position along wall
    const wallVector = {
      x: wallEnd3D.x - wallStart3D.x,
      y: wallEnd3D.y - wallStart3D.y,
      z: 0
    };
    
    const doorPosition3D: Point3D = {
      x: wallStart3D.x + wallVector.x * door.positionOnWall,
      y: wallStart3D.y + wallVector.y * door.positionOnWall,
      z: 0
    };

    const projectedDoor: Door2D = {
      ...door,
      transform: {
        ...door.transform,
        position: this.projectPoint(doorPosition3D, viewType)
      }
    };

    // Adjust door representation based on view
    if (viewType === 'plan') {
      // Show door swing and opening
      projectedDoor.dimensions = {
        width: door.width,
        height: door.width, // In plan view, show door swing radius
        depth: parentWall.thickness
      };
    } else {
      // Show door height in elevation views
      projectedDoor.dimensions = {
        width: door.width,
        height: door.height,
        depth: parentWall.thickness
      };
    }

    return projectedDoor;
  }

  /**
   * Project a window element to 2D view
   */
  static projectWindow(window: Window2D, viewType: ViewType2D, parentWall?: Wall2D): Window2D {
    if (!parentWall) {
      return window;
    }

    const wallStart3D: Point3D = { x: parentWall.startPoint.x, y: parentWall.startPoint.y, z: 0 };
    const wallEnd3D: Point3D = { x: parentWall.endPoint.x, y: parentWall.endPoint.y, z: 0 };
    
    const wallVector = {
      x: wallEnd3D.x - wallStart3D.x,
      y: wallEnd3D.y - wallStart3D.y,
      z: 0
    };
    
    const windowPosition3D: Point3D = {
      x: wallStart3D.x + wallVector.x * window.positionOnWall,
      y: wallStart3D.y + wallVector.y * window.positionOnWall,
      z: window.sillHeight
    };

    const projectedWindow: Window2D = {
      ...window,
      transform: {
        ...window.transform,
        position: this.projectPoint(windowPosition3D, viewType)
      }
    };

    // Adjust window representation based on view
    if (viewType === 'plan') {
      // In plan view, show window as opening in wall
      projectedWindow.dimensions = {
        width: window.width,
        height: parentWall.thickness,
        depth: window.frameWidth
      };
    } else {
      // In elevation views, show window with sill height
      projectedWindow.dimensions = {
        width: window.width,
        height: window.height,
        depth: window.frameWidth
      };
    }

    return projectedWindow;
  }

  /**
   * Project a stair element to 2D view
   */
  static projectStair(stair: Stair2D, viewType: ViewType2D): Stair2D {
    const stairPosition3D: Point3D = {
      x: stair.transform.position.x,
      y: stair.transform.position.y,
      z: 0
    };

    const projectedStair: Stair2D = {
      ...stair,
      transform: {
        ...stair.transform,
        position: this.projectPoint(stairPosition3D, viewType)
      }
    };

    // Adjust stair representation based on view
    if (viewType === 'plan') {
      // Show stair treads and direction arrow
      projectedStair.dimensions = {
        width: stair.totalRun,
        height: stair.dimensions.width, // Stair width
        depth: stair.totalRise
      };
    } else {
      // Show stair profile in elevation views
      projectedStair.dimensions = {
        width: stair.totalRun,
        height: stair.totalRise,
        depth: stair.dimensions.width
      };
    }

    return projectedStair;
  }

  /**
   * Project a roof element to 2D view
   */
  static projectRoof(roof: Roof2D, viewType: ViewType2D): Roof2D {
    const roofPosition3D: Point3D = {
      x: roof.transform.position.x,
      y: roof.transform.position.y,
      z: roof.ridgeHeight
    };

    const projectedRoof: Roof2D = {
      ...roof,
      transform: {
        ...roof.transform,
        position: this.projectPoint(roofPosition3D, viewType)
      }
    };

    // Adjust roof representation based on view
    if (viewType === 'plan') {
      // Show roof outline and ridge lines
      projectedRoof.dimensions = {
        width: roof.dimensions.width,
        height: roof.dimensions.height,
        depth: roof.overhang
      };
    } else {
      // Show roof profile with pitch in elevation views
      const pitchHeight = Math.tan(roof.pitch * Math.PI / 180) * roof.dimensions.width / 2;
      projectedRoof.dimensions = {
        width: roof.dimensions.width + 2 * roof.overhang,
        height: pitchHeight,
        depth: roof.dimensions.height + 2 * roof.overhang
      };
    }

    return projectedRoof;
  }

  /**
   * Check if an element is visible in a specific view
   */
  static isElementVisibleInView(element: Element2D, viewType: ViewType2D): boolean {
    // Basic visibility rules based on element type and view
    switch (element.type) {
      case 'wall2d':
        return true; // Walls are visible in all views
      
      case 'door2d':
      case 'window2d':
        return true; // Openings are visible in all views
      
      case 'stair2d':
        return true; // Stairs are visible in all views
      
      case 'roof2d':
        // Roofs are primarily visible in elevation views and plan view
        return true;
      
      case 'room2d':
        // Rooms are primarily visible in plan view
        return viewType === 'plan';
      
      case 'annotation2d':
      case 'dimension2d':
        return true; // Annotations visible in all views
      
      default:
        return true;
    }
  }

  /**
   * Get the 2D bounds of an element in a specific view
   */
  static getElementBoundsInView(element: Element2D): { min: Point2D; max: Point2D } {
    const position = element.transform.position;
    const dimensions = element.dimensions;

    // Calculate bounds based on element position and dimensions
    // Note: Future enhancement could include view-specific bound calculations
    const halfWidth = dimensions.width / 2;
    const halfHeight = dimensions.height / 2;

    return {
      min: {
        x: position.x - halfWidth,
        y: position.y - halfHeight
      },
      max: {
        x: position.x + halfWidth,
        y: position.y + halfHeight
      }
    };
  }

  /**
   * Transform element coordinates for a specific view
   */
  static transformElementForView(element: Element2D, viewType: ViewType2D): Element2D {
    switch (element.type) {
      case 'wall2d':
        return this.projectWall(element as Wall2D, viewType);
      
      case 'door2d':
        return this.projectDoor(element as Door2D, viewType);
      
      case 'window2d':
        return this.projectWindow(element as Window2D, viewType);
      
      case 'stair2d':
        return this.projectStair(element as Stair2D, viewType);
      
      case 'roof2d':
        return this.projectRoof(element as Roof2D, viewType);
      
      default:
        // For other elements, just project the position
        const position3D: Point3D = {
          x: element.transform.position.x,
          y: element.transform.position.y,
          z: 0
        };
        
        return {
          ...element,
          transform: {
            ...element.transform,
            position: this.projectPoint(position3D, viewType)
          }
        };
    }
  }

  /**
   * Calculate view bounds for a collection of elements
   */
  static calculateViewBounds(elements: Element2D[], viewType: ViewType2D): { min: Point2D; max: Point2D } {
    if (elements.length === 0) {
      return { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach(element => {
      if (this.isElementVisibleInView(element, viewType)) {
        const bounds = this.getElementBoundsInView(element, viewType);
        minX = Math.min(minX, bounds.min.x);
        minY = Math.min(minY, bounds.min.y);
        maxX = Math.max(maxX, bounds.max.x);
        maxY = Math.max(maxY, bounds.max.y);
      }
    });

    // Add padding
    const padding = 50;
    return {
      min: { x: minX - padding, y: minY - padding },
      max: { x: maxX + padding, y: maxY + padding }
    };
  }

  /**
   * Generate view render data for a specific view
   */
  static generateViewRenderData(
    elements: Element2D[],
    viewType: ViewType2D,
    visibleLayers: string[] = [],
    scale: number = 1
  ): ViewRenderData2D {
    // Filter and transform elements for this view
    const visibleElements = elements
      .filter(element => this.isElementVisibleInView(element, viewType))
      .map(element => this.transformElementForView(element, viewType));

    const bounds = this.calculateViewBounds(visibleElements, viewType);

    return {
      viewType,
      elements: visibleElements,
      visibleLayers,
      scale,
      origin: { x: 0, y: 0 },
      bounds
    };
  }

  /**
   * Convert between view coordinate systems
   */
  static convertBetweenViews(
    point: Point2D,
    fromView: ViewType2D,
    toView: ViewType2D,
    defaultZ: number = 0
  ): Point2D {
    // First unproject from source view to 3D
    const point3D = this.unprojectPoint(point, fromView, defaultZ);
    
    // Then project to target view
    return this.projectPoint(point3D, toView);
  }

  /**
   * Get view-specific grid settings
   */
  static getViewGridSettings(viewType: ViewType2D) {
    return this.viewConfigs[viewType].gridConfig;
  }

  /**
   * Get view-specific render settings
   */
  static getViewRenderSettings(viewType: ViewType2D) {
    return this.viewConfigs[viewType].renderConfig;
  }
}