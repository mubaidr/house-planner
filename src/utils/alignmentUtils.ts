export interface AlignableElement {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

export interface AlignmentGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  elements: string[]; // Element IDs that align to this guide
  visible: boolean;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// Get bounding box for any element type
export const getElementBounds = (element: AlignableElement): BoundingBox => {
  let x: number, y: number, width: number, height: number;

  // Handle wall elements (have startX, startY, endX, endY)
  if ('startX' in element && element.startX !== undefined) {
    const minX = Math.min(element.startX, element.endX || element.startX);
    const maxX = Math.max(element.startX, element.endX || element.startX);
    const minY = Math.min(element.startY, element.endY || element.startY);
    const maxY = Math.max(element.startY, element.endY || element.startY);
    
    x = minX;
    y = minY;
    width = maxX - minX || 1; // Minimum width of 1 for vertical walls
    height = maxY - minY || 1; // Minimum height of 1 for horizontal walls
  } else {
    // Handle rectangular elements (doors, windows, stairs, etc.)
    x = element.x;
    y = element.y;
    width = element.width || 50; // Default width
    height = element.height || 50; // Default height
  }

  return {
    x,
    y,
    width,
    height,
    centerX: x + width / 2,
    centerY: y + height / 2,
    left: x,
    right: x + width,
    top: y,
    bottom: y + height,
  };
};

// Alignment functions
export const alignLeft = (elements: AlignableElement[]): AlignableElement[] => {
  if (elements.length < 2) return elements;
  
  const bounds = elements.map(getElementBounds);
  const leftmost = Math.min(...bounds.map(b => b.left));
  
  return elements.map((element, index) => {
    const bound = bounds[index];
    const deltaX = leftmost - bound.left;
    
    if ('startX' in element && element.startX !== undefined) {
      // Wall element
      return {
        ...element,
        startX: element.startX + deltaX,
        endX: (element.endX || element.startX) + deltaX,
      };
    } else {
      // Rectangular element
      return {
        ...element,
        x: element.x + deltaX,
      };
    }
  });
};

export const alignRight = (elements: AlignableElement[]): AlignableElement[] => {
  if (elements.length < 2) return elements;
  
  const bounds = elements.map(getElementBounds);
  const rightmost = Math.max(...bounds.map(b => b.right));
  
  return elements.map((element, index) => {
    const bound = bounds[index];
    const deltaX = rightmost - bound.right;
    
    if ('startX' in element && element.startX !== undefined) {
      // Wall element
      return {
        ...element,
        startX: element.startX + deltaX,
        endX: (element.endX || element.startX) + deltaX,
      };
    } else {
      // Rectangular element
      return {
        ...element,
        x: element.x + deltaX,
      };
    }
  });
};

export const alignTop = (elements: AlignableElement[]): AlignableElement[] => {
  if (elements.length < 2) return elements;
  
  const bounds = elements.map(getElementBounds);
  const topmost = Math.min(...bounds.map(b => b.top));
  
  return elements.map((element, index) => {
    const bound = bounds[index];
    const deltaY = topmost - bound.top;
    
    if ('startY' in element && element.startY !== undefined) {
      // Wall element
      return {
        ...element,
        startY: element.startY + deltaY,
        endY: (element.endY || element.startY) + deltaY,
      };
    } else {
      // Rectangular element
      return {
        ...element,
        y: element.y + deltaY,
      };
    }
  });
};

export const alignBottom = (elements: AlignableElement[]): AlignableElement[] => {
  if (elements.length < 2) return elements;
  
  const bounds = elements.map(getElementBounds);
  const bottommost = Math.max(...bounds.map(b => b.bottom));
  
  return elements.map((element, index) => {
    const bound = bounds[index];
    const deltaY = bottommost - bound.bottom;
    
    if ('startY' in element && element.startY !== undefined) {
      // Wall element
      return {
        ...element,
        startY: element.startY + deltaY,
        endY: (element.endY || element.startY) + deltaY,
      };
    } else {
      // Rectangular element
      return {
        ...element,
        y: element.y + deltaY,
      };
    }
  });
};

export const alignCenterHorizontal = (elements: AlignableElement[]): AlignableElement[] => {
  if (elements.length < 2) return elements;
  
  const bounds = elements.map(getElementBounds);
  const centerX = bounds.reduce((sum, b) => sum + b.centerX, 0) / bounds.length;
  
  return elements.map((element, index) => {
    const bound = bounds[index];
    const deltaX = centerX - bound.centerX;
    
    if ('startX' in element && element.startX !== undefined) {
      // Wall element
      return {
        ...element,
        startX: element.startX + deltaX,
        endX: (element.endX || element.startX) + deltaX,
      };
    } else {
      // Rectangular element
      return {
        ...element,
        x: element.x + deltaX,
      };
    }
  });
};

export const alignCenterVertical = (elements: AlignableElement[]): AlignableElement[] => {
  if (elements.length < 2) return elements;
  
  const bounds = elements.map(getElementBounds);
  const centerY = bounds.reduce((sum, b) => sum + b.centerY, 0) / bounds.length;
  
  return elements.map((element, index) => {
    const bound = bounds[index];
    const deltaY = centerY - bound.centerY;
    
    if ('startY' in element && element.startY !== undefined) {
      // Wall element
      return {
        ...element,
        startY: element.startY + deltaY,
        endY: (element.endY || element.startY) + deltaY,
      };
    } else {
      // Rectangular element
      return {
        ...element,
        y: element.y + deltaY,
      };
    }
  });
};

// Distribution functions
export const distributeHorizontally = (elements: AlignableElement[]): AlignableElement[] => {
  if (elements.length < 3) return elements;
  
  const bounds = elements.map(getElementBounds);
  const sortedIndices = bounds
    .map((_, index) => index)
    .sort((a, b) => bounds[a].centerX - bounds[b].centerX);
  
  const leftmost = bounds[sortedIndices[0]].centerX;
  const rightmost = bounds[sortedIndices[sortedIndices.length - 1]].centerX;
  const totalSpace = rightmost - leftmost;
  const spacing = totalSpace / (elements.length - 1);
  
  return elements.map((element, index) => {
    const sortedIndex = sortedIndices.indexOf(index);
    if (sortedIndex === 0 || sortedIndex === sortedIndices.length - 1) {
      return element; // Don't move the leftmost and rightmost elements
    }
    
    const targetCenterX = leftmost + spacing * sortedIndex;
    const currentBound = bounds[index];
    const deltaX = targetCenterX - currentBound.centerX;
    
    if ('startX' in element && element.startX !== undefined) {
      // Wall element
      return {
        ...element,
        startX: element.startX + deltaX,
        endX: (element.endX || element.startX) + deltaX,
      };
    } else {
      // Rectangular element
      return {
        ...element,
        x: element.x + deltaX,
      };
    }
  });
};

export const distributeVertically = (elements: AlignableElement[]): AlignableElement[] => {
  if (elements.length < 3) return elements;
  
  const bounds = elements.map(getElementBounds);
  const sortedIndices = bounds
    .map((_, index) => index)
    .sort((a, b) => bounds[a].centerY - bounds[b].centerY);
  
  const topmost = bounds[sortedIndices[0]].centerY;
  const bottommost = bounds[sortedIndices[sortedIndices.length - 1]].centerY;
  const totalSpace = bottommost - topmost;
  const spacing = totalSpace / (elements.length - 1);
  
  return elements.map((element, index) => {
    const sortedIndex = sortedIndices.indexOf(index);
    if (sortedIndex === 0 || sortedIndex === sortedIndices.length - 1) {
      return element; // Don't move the topmost and bottommost elements
    }
    
    const targetCenterY = topmost + spacing * sortedIndex;
    const currentBound = bounds[index];
    const deltaY = targetCenterY - currentBound.centerY;
    
    if ('startY' in element && element.startY !== undefined) {
      // Wall element
      return {
        ...element,
        startY: element.startY + deltaY,
        endY: (element.endY || element.startY) + deltaY,
      };
    } else {
      // Rectangular element
      return {
        ...element,
        y: element.y + deltaY,
      };
    }
  });
};

// Smart alignment guides
export const generateAlignmentGuides = (
  elements: AlignableElement[],
  tolerance: number = 5
): AlignmentGuide[] => {
  const guides: AlignmentGuide[] = [];
  const bounds = elements.map(getElementBounds);
  
  // Group elements by similar positions
  const horizontalGroups: { [key: number]: string[] } = {};
  const verticalGroups: { [key: number]: string[] } = {};
  
  bounds.forEach((bound, index) => {
    const element = elements[index];
    
    // Check for horizontal alignment (same Y positions)
    const yPositions = [bound.top, bound.centerY, bound.bottom];
    yPositions.forEach(y => {
      const roundedY = Math.round(y / tolerance) * tolerance;
      if (!horizontalGroups[roundedY]) horizontalGroups[roundedY] = [];
      horizontalGroups[roundedY].push(element.id);
    });
    
    // Check for vertical alignment (same X positions)
    const xPositions = [bound.left, bound.centerX, bound.right];
    xPositions.forEach(x => {
      const roundedX = Math.round(x / tolerance) * tolerance;
      if (!verticalGroups[roundedX]) verticalGroups[roundedX] = [];
      verticalGroups[roundedX].push(element.id);
    });
  });
  
  // Create guides for groups with multiple elements
  Object.entries(horizontalGroups).forEach(([position, elementIds]) => {
    if (elementIds.length > 1) {
      guides.push({
        id: `h-${position}`,
        type: 'horizontal',
        position: parseFloat(position),
        elements: elementIds,
        visible: true,
      });
    }
  });
  
  Object.entries(verticalGroups).forEach(([position, elementIds]) => {
    if (elementIds.length > 1) {
      guides.push({
        id: `v-${position}`,
        type: 'vertical',
        position: parseFloat(position),
        elements: elementIds,
        visible: true,
      });
    }
  });
  
  return guides;
};