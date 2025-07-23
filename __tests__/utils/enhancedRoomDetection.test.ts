
import { detectEnhancedRooms, getRoomTypeSuggestions, analyzeRoomInsights } from '@/utils/enhancedRoomDetection';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Room } from '@/utils/roomDetection';

// Mock dependencies
jest.mock('@/utils/roomDetection', () => ({
  detectRooms: jest.fn(() => ({
    rooms: [
      {
        id: 'room1',
        walls: ['wall1', 'wall2', 'wall3', 'wall4'],
        area: 18000, // approx 125 sq ft
        points: [
          { x: 0, y: 0 },
          { x: 120, y: 0 },
          { x: 120, y: 150 },
          { x: 0, y: 150 },
        ],
      },
    ],
  })),
}));

describe('Enhanced Room Detection', () => {
  const walls: Wall[] = [
    { id: 'wall1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 5, type: 'exterior' },
    { id: 'wall2', startX: 100, startY: 0, endX: 100, endY: 200, thickness: 5, type: 'exterior' },
    { id: 'wall3', startX: 100, startY: 200, endX: 0, endY: 200, thickness: 5, type: 'exterior' },
    { id: 'wall4', startX: 0, startY: 200, endX: 0, endY: 0, thickness: 5, type: 'exterior' },
  ];
  const doors: Door[] = [{ id: 'door1', wallId: 'wall1', x: 50, width: 30, height: 80, type: 'single' }];
  const windows: Window[] = [{ id: 'window1', wallId: 'wall2', x: 100, width: 40, height: 40, elevation: 30 }];

  it('should detect and enhance rooms correctly', () => {
    const enhancedRooms = detectEnhancedRooms(walls, doors, windows);
    expect(enhancedRooms).toHaveLength(1);
    const room = enhancedRooms[0];
    expect(room.roomType).toBe('bedroom');
    expect(room.confidence).toBeGreaterThan(0.3);
    expect(room.features).toHaveLength(2);
    expect(room.accessibility.doorCount).toBe(1);
    expect(room.accessibility.windowCount).toBe(1);
    expect(room.lighting.naturalLight).toBeGreaterThan(0);
  });

  it('should provide room type suggestions', () => {
    const room: Room = {
      id: 'room1',
      walls: ['wall1', 'wall2', 'wall3', 'wall4'],
      area: 18000,
      points: [
        { x: 0, y: 0 },
        { x: 120, y: 0 },
        { x: 120, y: 150 },
        { x: 0, y: 150 },
      ],
    };
    const suggestions = getRoomTypeSuggestions(room, doors, windows, walls);
    expect(suggestions).toContain('Bedroom');
  });

  it('should provide room insights', () => {
    const room: Room = {
      id: 'room1',
      walls: ['wall1', 'wall2', 'wall3', 'wall4'],
      area: 18000,
      points: [
        { x: 0, y: 0 },
        { x: 120, y: 0 },
        { x: 120, y: 150 },
        { x: 0, y: 150 },
      ],
    };
    const insights = analyzeRoomInsights(room, doors, windows, walls);
    expect(insights.insights).toBeDefined();
    expect(insights.recommendations).toBeDefined();
    expect(insights.warnings).toBeDefined();
  });
});
