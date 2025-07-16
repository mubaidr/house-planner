import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Point } from './wallIntersection';
import { Room } from './roomDetection';
import { detectRooms } from './roomDetection'

export interface EnhancedRoom extends Room {
  roomType: string;
  confidence: number;
  suggestedNames: string[];
  features: RoomFeature[];
  accessibility: AccessibilityInfo;
  lighting: LightingInfo;
}

export interface RoomFeature {
  type: 'door' | 'window' | 'opening';
  id: string;
  position: Point;
  size: number;
  orientation: 'north' | 'south' | 'east' | 'west';
}

export interface AccessibilityInfo {
  hasExternalAccess: boolean;
  doorCount: number;
  windowCount: number;
  isAccessible: boolean;
  accessibilityScore: number;
}

export interface LightingInfo {
  naturalLight: number; // 0-1 based on window area
  windowArea: number;
  orientation: string[];
}

export interface RoomTypeRule {
  type: string;
  minArea: number;
  maxArea: number;
  requiredFeatures: string[];
  preferredFeatures: string[];
  excludedFeatures: string[];
  areaWeight: number;
  featureWeight: number;
  accessWeight: number;
}

// Room type classification rules
const ROOM_TYPE_RULES: RoomTypeRule[] = [
  {
    type: 'bathroom',
    minArea: 15, // sq ft
    maxArea: 200,
    requiredFeatures: [],
    preferredFeatures: ['small_area', 'single_door', 'no_windows_ok'],
    excludedFeatures: ['multiple_external_doors'],
    areaWeight: 0.4,
    featureWeight: 0.4,
    accessWeight: 0.2,
  },
  {
    type: 'kitchen',
    minArea: 50,
    maxArea: 500,
    requiredFeatures: [],
    preferredFeatures: ['medium_area', 'windows', 'external_access'],
    excludedFeatures: [],
    areaWeight: 0.3,
    featureWeight: 0.4,
    accessWeight: 0.3,
  },
  {
    type: 'bedroom',
    minArea: 80,
    maxArea: 400,
    requiredFeatures: [],
    preferredFeatures: ['windows', 'single_door', 'rectangular'],
    excludedFeatures: ['multiple_external_doors'],
    areaWeight: 0.3,
    featureWeight: 0.3,
    accessWeight: 0.4,
  },
  {
    type: 'living',
    minArea: 120,
    maxArea: 800,
    requiredFeatures: [],
    preferredFeatures: ['large_area', 'windows', 'external_access'],
    excludedFeatures: [],
    areaWeight: 0.4,
    featureWeight: 0.3,
    accessWeight: 0.3,
  },
  {
    type: 'dining',
    minArea: 80,
    maxArea: 300,
    requiredFeatures: [],
    preferredFeatures: ['medium_area', 'windows', 'adjacent_to_kitchen'],
    excludedFeatures: [],
    areaWeight: 0.3,
    featureWeight: 0.4,
    accessWeight: 0.3,
  },
  {
    type: 'office',
    minArea: 60,
    maxArea: 250,
    requiredFeatures: [],
    preferredFeatures: ['windows', 'single_door', 'quiet_location'],
    excludedFeatures: [],
    areaWeight: 0.3,
    featureWeight: 0.4,
    accessWeight: 0.3,
  },
  {
    type: 'closet',
    minArea: 5,
    maxArea: 50,
    requiredFeatures: [],
    preferredFeatures: ['small_area', 'single_door', 'no_windows'],
    excludedFeatures: ['windows', 'external_access'],
    areaWeight: 0.6,
    featureWeight: 0.3,
    accessWeight: 0.1,
  },
  {
    type: 'hallway',
    minArea: 20,
    maxArea: 150,
    requiredFeatures: [],
    preferredFeatures: ['narrow', 'multiple_doors', 'connecting'],
    excludedFeatures: [],
    areaWeight: 0.2,
    featureWeight: 0.5,
    accessWeight: 0.3,
  },
];

/**
 * Analyze room features based on doors and windows
 */
const analyzeRoomFeatures = (
  room: Room,
  doors: Door[],
  windows: Window[]
): RoomFeature[] => {
  const features: RoomFeature[] = [];

  // Analyze doors
  doors.forEach(door => {
    if (room.walls.includes(door.wallId)) {
      const wall = getWallById(door.wallId, room.walls);
      if (wall) {
        features.push({
          type: 'door',
          id: door.id,
          position: getDoorPosition(door, wall),
          size: door.width,
          orientation: getWallOrientation(wall),
        });
      }
    }
  });

  // Analyze windows
  windows.forEach(window => {
    if (room.walls.includes(window.wallId)) {
      const wall = getWallById(window.wallId, room.walls);
      if (wall) {
        features.push({
          type: 'window',
          id: window.id,
          position: getWindowPosition(window, wall),
          size: window.width,
          orientation: getWallOrientation(wall),
        });
      }
    }
  });

  return features;
};

/**
 * Calculate accessibility information
 */
const calculateAccessibility = (features: RoomFeature[]): AccessibilityInfo => {
  const doors = features.filter(f => f.type === 'door');
  const windows = features.filter(f => f.type === 'window');

  const hasExternalAccess = doors.length > 0;
  const doorCount = doors.length;
  const windowCount = windows.length;

  // Calculate accessibility score
  let accessibilityScore = 0;
  if (hasExternalAccess) accessibilityScore += 0.5;
  if (doorCount >= 1) accessibilityScore += 0.3;
  if (windowCount >= 1) accessibilityScore += 0.2;

  const isAccessible = accessibilityScore >= 0.5;

  return {
    hasExternalAccess,
    doorCount,
    windowCount,
    isAccessible,
    accessibilityScore,
  };
};

/**
 * Calculate lighting information
 */
const calculateLighting = (features: RoomFeature[], room: Room): LightingInfo => {
  const windows = features.filter(f => f.type === 'window');

  const windowArea = windows.reduce((total, window) => total + (window.size * 100), 0); // Approximate height
  const naturalLight = Math.min(windowArea / room.area, 1);

  const orientation = [...new Set(windows.map(w => w.orientation))];

  return {
    naturalLight,
    windowArea,
    orientation,
  };
};

/**
 * Classify room type based on features and rules
 */
const classifyRoomType = (
  room: Room,
  features: RoomFeature[],
  accessibility: AccessibilityInfo,
  lighting: LightingInfo
): { type: string; confidence: number; suggestedNames: string[] } => {
  const areaInSqFt = room.area / 144; // Convert from sq pixels to sq feet (rough)

  const scores = ROOM_TYPE_RULES.map(rule => {
    let score = 0;
    let maxScore = 0;

    // Area score
    const areaScore = calculateAreaScore(areaInSqFt, rule);
    score += areaScore * rule.areaWeight;
    maxScore += rule.areaWeight;

    // Feature score
    const featureScore = calculateFeatureScore(features, accessibility, lighting, rule);
    score += featureScore * rule.featureWeight;
    maxScore += rule.featureWeight;

    // Access score
    const accessScore = calculateAccessScore(accessibility, rule);
    score += accessScore * rule.accessWeight;
    maxScore += rule.accessWeight;

    const confidence = maxScore > 0 ? score / maxScore : 0;

    return {
      type: rule.type,
      confidence,
      score,
    };
  });

  // Sort by confidence
  scores.sort((a, b) => b.confidence - a.confidence);

  const bestMatch = scores[0];
  const suggestedNames = generateRoomNames(bestMatch.type, areaInSqFt);

  return {
    type: bestMatch.confidence > 0.3 ? bestMatch.type : 'other',
    confidence: bestMatch.confidence,
    suggestedNames,
  };
};

/**
 * Calculate area score for a room type rule
 */
const calculateAreaScore = (area: number, rule: RoomTypeRule): number => {
  if (area < rule.minArea || area > rule.maxArea) {
    return 0;
  }

  const optimalArea = (rule.minArea + rule.maxArea) / 2;
  const deviation = Math.abs(area - optimalArea) / optimalArea;

  return Math.max(0, 1 - deviation);
};

/**
 * Calculate feature score for a room type rule
 */
const calculateFeatureScore = (
  features: RoomFeature[],
  accessibility: AccessibilityInfo,
  lighting: LightingInfo,
  rule: RoomTypeRule
): number => {
  let score = 0;
  let maxScore = 0;

  // Check preferred features
  rule.preferredFeatures.forEach(feature => {
    maxScore += 1;
    if (hasFeature(feature, features, accessibility, lighting)) {
      score += 1;
    }
  });

  // Penalize excluded features
  rule.excludedFeatures.forEach(feature => {
    if (hasFeature(feature, features, accessibility, lighting)) {
      score -= 0.5;
    }
  });

  return maxScore > 0 ? Math.max(0, score / maxScore) : 0;
};

/**
 * Calculate access score for a room type rule
 */
const calculateAccessScore = (accessibility: AccessibilityInfo, _rule: RoomTypeRule): number => {
  // Use rule for future access score calculations
  return accessibility.accessibilityScore;
};

/**
 * Check if room has a specific feature
 */
const hasFeature = (
  feature: string,
  features: RoomFeature[],
  accessibility: AccessibilityInfo,
  _lighting: LightingInfo,
  room?: Room
): boolean => {
  switch (feature) {
    case 'small_area':
      return true
    case 'medium_area':
      return true
    case 'large_area':
      return true
    case 'single_door':
      return accessibility.doorCount === 1
    case 'multiple_doors':
      return accessibility.doorCount > 1
    case 'windows':
      return accessibility.windowCount > 0
    case 'no_windows':
      return accessibility.windowCount === 0
    case 'no_windows_ok':
      return true
    case 'external_access':
      return accessibility.hasExternalAccess
    case 'multiple_external_doors':
      return accessibility.doorCount > 1
    case 'rectangular': {
      const pts = (room && (room as any).points && Array.isArray((room as any).points)) ? (room as any).points : []
      if (pts.length < 4) return false
      const xs = pts.map((p: any) => p.x)
      const ys = pts.map((p: any) => p.y)
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)
      const width = maxX - minX
      const height = maxY - minY
      const aspect = width / height
      return aspect > 0.8 && aspect < 1.2
    }
    case 'narrow': {
      const pts = (room && (room as any).points && Array.isArray((room as any).points)) ? (room as any).points : []
      if (pts.length < 4) return false
      const xsN = pts.map((p: any) => p.x)
      const ysN = pts.map((p: any) => p.y)
      const minXN = Math.min(...xsN)
      const maxXN = Math.max(...xsN)
      const minYN = Math.min(...ysN)
      const maxYN = Math.max(...ysN)
      const widthN = maxXN - minXN
      const heightN = maxYN - minYN
      const aspectN = widthN / heightN
      return aspectN < 0.5 || aspectN > 2
    }
    case 'connecting':
      return accessibility.doorCount >= 2
    case 'quiet_location':
      return features.filter(f => f.type === 'door').length === 1 && accessibility.windowCount <= 1
    case 'adjacent_to_kitchen':
      return false
    default:
      return false
  }
}

/**
 * Generate suggested room names based on type and characteristics
 */
const generateRoomNames = (type: string, area: number): string[] => {
  const names: string[] = [];

  switch (type) {
    case 'bedroom':
      names.push('Master Bedroom', 'Bedroom', 'Guest Bedroom', 'Child\'s Bedroom');
      if (area > 200) names.unshift('Master Suite');
      if (area < 100) names.push('Small Bedroom');
      break;
    case 'bathroom':
      names.push('Bathroom', 'Full Bathroom', 'Half Bath');
      if (area > 80) names.unshift('Master Bathroom');
      if (area < 30) names.push('Powder Room', 'Half Bath');
      break;
    case 'kitchen':
      names.push('Kitchen', 'Main Kitchen');
      if (area > 300) names.unshift('Gourmet Kitchen');
      if (area < 100) names.push('Kitchenette', 'Galley Kitchen');
      break;
    case 'living':
      names.push('Living Room', 'Family Room', 'Great Room');
      if (area > 400) names.unshift('Grand Living Room');
      break;
    case 'dining':
      names.push('Dining Room', 'Formal Dining', 'Breakfast Nook');
      break;
    case 'office':
      names.push('Office', 'Study', 'Home Office', 'Den');
      break;
    case 'closet':
      names.push('Closet', 'Walk-in Closet', 'Storage');
      break;
    case 'hallway':
      names.push('Hallway', 'Corridor', 'Foyer');
      break;
    default:
      names.push('Room', 'Space', 'Area');
  }

  return names;
};

/**
 * Helper functions (these would need to be implemented based on your wall/door/window data structures)
 */
const getWallById = (_wallId: string, _wallIds: string[]): Wall | null => {
  // This would need to be implemented to get wall by ID
  return null;
};

const getDoorPosition = (door: Door, wall: Wall): Point => {
  // Calculate door position on wall
  const wallLength = Math.sqrt(
    Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
  );
  const ratio = door.x / wallLength; // Using x coordinate as position along wall

  return {
    x: wall.startX + (wall.endX - wall.startX) * ratio,
    y: wall.startY + (wall.endY - wall.startY) * ratio,
  };
};

const getWindowPosition = (window: Window, wall: Wall): Point => {
  // Calculate window position on wall
  const wallLength = Math.sqrt(
    Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
  );
  const ratio = window.x / wallLength; // Using x coordinate as position along wall

  return {
    x: wall.startX + (wall.endX - wall.startX) * ratio,
    y: wall.startY + (wall.endY - wall.startY) * ratio,
  };
};

const getWallOrientation = (wall: Wall): 'north' | 'south' | 'east' | 'west' => {
  const dx = wall.endX - wall.startX;
  const dy = wall.endY - wall.startY;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  if (angle >= -45 && angle < 45) return 'east';
  if (angle >= 45 && angle < 135) return 'south';
  if (angle >= 135 || angle < -135) return 'west';
  return 'north';
};

/**
 * Enhanced room detection with automatic type classification
 */
export const detectEnhancedRooms = (
  walls: Wall[],
  doors: Door[],
  windows: Window[]
): EnhancedRoom[] => {
  // Use the actual room detection
  const { rooms: basicRooms } = detectRooms(walls);

  // Enhance each room with additional analysis
  const enhancedRooms: EnhancedRoom[] = basicRooms.map((room: Room) => {
    const features = analyzeRoomFeatures(room, doors, windows);
    const accessibility = calculateAccessibility(features);
    const lighting = calculateLighting(features, room);
    const classification = classifyRoomType(room, features, accessibility, lighting);

    return {
      ...room,
      roomType: classification.type,
      confidence: classification.confidence,
      suggestedNames: classification.suggestedNames,
      features,
      accessibility,
      lighting,
    };
  });

  return enhancedRooms;
};

/**
 * Get room type suggestions based on current room data
 */
export const getRoomTypeSuggestions = (room: Room, doors: Door[], windows: Window[]): string[] => {
  const features = analyzeRoomFeatures(room, doors, windows);
  const accessibility = calculateAccessibility(features);
  const lighting = calculateLighting(features, room);
  const classification = classifyRoomType(room, features, accessibility, lighting);

  return classification.suggestedNames;
};

/**
 * Analyze room and provide detailed insights
 */
export const analyzeRoomInsights = (room: Room, doors: Door[], windows: Window[]): {
  insights: string[];
  recommendations: string[];
  warnings: string[];
} => {
  const features = analyzeRoomFeatures(room, doors, windows);
  const accessibility = calculateAccessibility(features);
  const lighting = calculateLighting(features, room);
  const areaInSqFt = room.area / 144;

  const insights: string[] = [];
  const recommendations: string[] = [];
  const warnings: string[] = [];

  // Area insights
  insights.push(`Room area: ${areaInSqFt.toFixed(1)} sq ft`);

  // Accessibility insights
  if (accessibility.doorCount === 0) {
    warnings.push('No doors detected - room may not be accessible');
  } else if (accessibility.doorCount === 1) {
    insights.push('Single door access');
  } else {
    insights.push(`Multiple access points (${accessibility.doorCount} doors)`);
  }

  // Lighting insights
  if (lighting.naturalLight > 0.3) {
    insights.push('Good natural lighting');
  } else if (lighting.naturalLight > 0.1) {
    insights.push('Moderate natural lighting');
    recommendations.push('Consider adding more windows for better lighting');
  } else {
    insights.push('Limited natural lighting');
    recommendations.push('Add windows or skylights for natural light');
  }

  // Size recommendations
  if (areaInSqFt < 50) {
    recommendations.push('Consider if room size meets intended use requirements');
  } else if (areaInSqFt > 500) {
    recommendations.push('Large room - consider dividing or multiple use zones');
  }

  return { insights, recommendations, warnings };
};
