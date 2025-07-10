export interface Point {
  x: number;
  y: number;
}

export interface SnapResult {
  x: number;
  y: number;
  snapped: boolean;
  snapType?: 'grid' | 'endpoint' | 'midpoint';
  snapPoint?: { x: number; y: number; type: 'grid' | 'endpoint' | 'midpoint' };
}

export const snapToGrid = (point: Point, gridSize: number, tolerance: number = 10): SnapResult => {
  const snappedX = Math.round(point.x / gridSize) * gridSize;
  const snappedY = Math.round(point.y / gridSize) * gridSize;
  
  const distanceX = Math.abs(point.x - snappedX);
  const distanceY = Math.abs(point.y - snappedY);
  
  if (distanceX <= tolerance && distanceY <= tolerance) {
    return {
      x: snappedX,
      y: snappedY,
      snapped: true,
      snapType: 'grid',
      snapPoint: { x: snappedX, y: snappedY, type: 'grid' },
    };
  }
  
  return {
    x: point.x,
    y: point.y,
    snapped: false,
  };
};

export const snapToPoints = (point: Point, snapPoints: Point[], tolerance: number = 15): SnapResult => {
  for (const snapPoint of snapPoints) {
    const distance = Math.sqrt(
      Math.pow(point.x - snapPoint.x, 2) + Math.pow(point.y - snapPoint.y, 2)
    );
    
    if (distance <= tolerance) {
      return {
        x: snapPoint.x,
        y: snapPoint.y,
        snapped: true,
        snapType: 'endpoint',
        snapPoint: { x: snapPoint.x, y: snapPoint.y, type: 'endpoint' },
      };
    }
  }
  
  return {
    x: point.x,
    y: point.y,
    snapped: false,
  };
};

export const getWallSnapPoints = (walls: Array<{ startX: number; startY: number; endX: number; endY: number }>): Point[] => {
  const points: Point[] = [];
  
  walls.forEach(wall => {
    // Add endpoints
    points.push({ x: wall.startX, y: wall.startY });
    points.push({ x: wall.endX, y: wall.endY });
    
    // Add midpoint
    points.push({
      x: (wall.startX + wall.endX) / 2,
      y: (wall.startY + wall.endY) / 2,
    });
  });
  
  return points;
};

export const snapPoint = (
  point: Point,
  gridSize: number,
  snapPoints: Point[],
  snapToGridEnabled: boolean,
  tolerance: number = 15
): SnapResult => {
  // First try snapping to points (higher priority)
  const pointSnap = snapToPoints(point, snapPoints, tolerance);
  if (pointSnap.snapped) {
    return pointSnap;
  }
  
  // Then try grid snapping
  if (snapToGridEnabled) {
    return snapToGrid(point, gridSize, tolerance);
  }
  
  return {
    x: point.x,
    y: point.y,
    snapped: false,
  };
};