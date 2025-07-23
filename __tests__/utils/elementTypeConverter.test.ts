import { convertWallToWall2D, convertDoorToDoor2D, convertWindowToWindow2D, convertStairToStair2D, convertRoofToRoof2D, convertRoomToRoom2D, convertElementsToElement2D, getElementTypeFromElement2D } from '@/utils/elementTypeConverter';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Stair } from '@/types/elements/Stair';
import { Roof } from '@/types/elements/Roof';
import { Room } from '@/types/elements/Room';

describe('elementTypeConverter', () => {
  it('should convert Wall to Wall2D', () => {
    const wall: Wall = {
      id: 'w1',
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 0,
      thickness: 10,
      height: 200,
      materialId: 'm1',
      type: 'exterior',
    };
    const wall2d = convertWallToWall2D(wall);
    expect(wall2d.id).toBe('w1');
    expect(wall2d.type).toBe('wall2d');
    expect(wall2d.startPoint).toEqual({ x: 0, y: 0 });
    expect(wall2d.endPoint).toEqual({ x: 100, y: 0 });
    expect(wall2d.dimensions.width).toBe(100);
    expect(wall2d.dimensions.height).toBe(200);
    expect(wall2d.transform.rotation).toBe(0);
  });

  it('should convert Door to Door2D', () => {
    const door: Door = {
      id: 'd1',
      wallId: 'w1',
      x: 50,
      y: 0,
      width: 30,
      height: 80,
      style: 'single',
      swingDirection: 'left',
      wallAngle: 0,
      materialId: 'm2',
    };
    const door2d = convertDoorToDoor2D(door);
    expect(door2d.id).toBe('d1');
    expect(door2d.type).toBe('door2d');
    expect(door2d.transform.position).toEqual({ x: 50, y: 0 });
    expect(door2d.dimensions.width).toBe(30);
    expect(door2d.dimensions.height).toBe(80);
    expect(door2d.swingDirection).toBe('left');
  });

  it('should convert Window to Window2D', () => {
    const window: Window = {
      id: 'win1',
      wallId: 'w1',
      x: 70,
      y: 0,
      width: 40,
      height: 60,
      style: 'fixed',
      wallAngle: 0,
      materialId: 'm3',
      elevation: 0,
    };
    const window2d = convertWindowToWindow2D(window);
    expect(window2d.id).toBe('win1');
    expect(window2d.type).toBe('window2d');
    expect(window2d.transform.position).toEqual({ x: 70, y: 0 });
    expect(window2d.dimensions.width).toBe(40);
    expect(window2d.dimensions.height).toBe(60);
    expect(window2d.operableType).toBe('fixed');
  });

  it('should convert Stair to Stair2D', () => {
    const stair: Stair = {
      id: 's1',
      x: 0,
      y: 0,
      width: 100,
      length: 200,
      steps: 10,
      stepHeight: 10,
      stepDepth: 20,
      direction: 'up',
      handrailLeft: true,
      handrailRight: false,
      materialId: 'm4',
      rotation: 0,
      color: '#000',
    };
    const stair2d = convertStairToStair2D(stair);
    expect(stair2d.id).toBe('s1');
    expect(stair2d.type).toBe('stair2d');
    expect(stair2d.transform.position).toEqual({ x: 0, y: 0 });
    expect(stair2d.dimensions.width).toBe(100);
    expect(stair2d.dimensions.height).toBe(200);
    expect(stair2d.steps).toHaveLength(10);
    expect(stair2d.handrailSide).toBe('left');
  });

  it('should convert Roof to Roof2D', () => {
    const roof: Roof = {
      id: 'r1',
      points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 50 }],
      type: 'gable',
      pitch: 30,
      height: 50,
      overhang: 10,
      materialId: 'm5',
      color: '#000',
    };
    const roof2d = convertRoofToRoof2D(roof);
    expect(roof2d.id).toBe('r1');
    expect(roof2d.type).toBe('roof2d');
    expect(roof2d.points).toEqual(roof.points);
    expect(roof2d.roofType).toBe('gable');
    expect(roof2d.dimensions.width).toBe(100);
    expect(roof2d.dimensions.height).toBe(50);
  });

  it('should convert Room to Room2D', () => {
    const room: Room = {
      id: 'room1',
      name: 'Living Room',
      points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
      area: 10000,
      materialId: 'm6',
      color: '#000',
    };
    const room2d = convertRoomToRoom2D(room);
    expect(room2d.id).toBe('room1');
    expect(room2d.type).toBe('room2d');
    expect(room2d.name).toBe('Living Room');
    expect(room2d.points).toEqual(room.points);
    expect(room2d.area).toBe(10000);
    expect(room2d.dimensions.width).toBe(100);
    expect(room2d.dimensions.height).toBe(100);
  });

  it('should convert mixed elements to Element2D array', () => {
    const walls: Wall[] = [
      { id: 'w1', startX: 0, startY: 0, endX: 100, endY: 0, thickness: 10, height: 200, type: 'exterior' },
    ];
    const doors: Door[] = [
      { id: 'd1', wallId: 'w1', x: 50, y: 0, width: 30, height: 80, style: 'single', swingDirection: 'left', wallAngle: 0 },
    ];
    const windows: Window[] = [
      { id: 'win1', wallId: 'w1', x: 70, y: 0, width: 40, height: 60, style: 'fixed', wallAngle: 0, elevation: 0 },
    ];
    const stairs: Stair[] = [
      { id: 's1', x: 0, y: 0, width: 100, length: 200, steps: 10, stepHeight: 10, stepDepth: 20, direction: 'up', handrailLeft: true, handrailRight: false },
    ];
    const roofs: Roof[] = [
      { id: 'r1', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 50 }], type: 'gable', pitch: 30, height: 50, overhang: 10 },
    ];
    const rooms: Room[] = [
      { id: 'room1', name: 'Living Room', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }], area: 10000 },
    ];

    const elements2d = convertElementsToElement2D(walls, doors, windows, stairs, roofs, rooms, 'floor1');
    expect(elements2d).toHaveLength(6);
    expect(elements2d.filter(e => e.type === 'wall2d')).toHaveLength(1);
    expect(elements2d.filter(e => e.type === 'door2d')).toHaveLength(1);
    expect(elements2d.filter(e => e.type === 'window2d')).toHaveLength(1);
    expect(elements2d.filter(e => e.type === 'stair2d')).toHaveLength(1);
    expect(elements2d.filter(e => e.type === 'roof2d')).toHaveLength(1);
    expect(elements2d.filter(e => e.type === 'room2d')).toHaveLength(1);
    expect(elements2d[0].floorId).toBe('floor1');
  });

  it('should get element type string from Element2D', () => {
    const wall2d = convertWallToWall2D({
      id: 'w1',
      startX: 0,
      startY: 0,
      endX: 100,
      endY: 0,
      thickness: 10,
      height: 200,
      type: 'exterior',
    });
    expect(getElementTypeFromElement2D(wall2d)).toBe('wall');

    const door2d = convertDoorToDoor2D({
      id: 'd1',
      wallId: 'w1',
      x: 50,
      y: 0,
      width: 30,
      height: 80,
      style: 'single',
      swingDirection: 'left',
      wallAngle: 0,
    });
    expect(getElementTypeFromElement2D(door2d)).toBe('door');
  });
});