import { generateStageForView, generateAllViewStages, cleanupStages, DEFAULT_STAGE_OPTIONS } from '@/utils/stageGenerator';
import Konva from 'konva';
import { Wall } from '@/types/elements/Wall';
import { Door } from '@/types/elements/Door';
import { Window } from '@/types/elements/Window';
import { Stair } from '@/types/elements/Stair';
import { Roof } from '@/types/elements/Roof';
import { Room } from '@/types/elements/Room';

// Mock Konva
jest.mock('konva', () => ({
  Stage: jest.fn(() => ({
    add: jest.fn(),
    width: jest.fn(() => 800),
    height: jest.fn(() => 600),
    destroy: jest.fn(),
  })),
  Layer: jest.fn(() => ({
    add: jest.fn(),
    draw: jest.fn(),
    getClientRect: jest.fn(() => ({ x: 0, y: 0, width: 100, height: 100 })),
    scale: jest.fn(),
    position: jest.fn(),
    moveToBottom: jest.fn(),
  })),
  Line: jest.fn(() => ({
    points: [],
    stroke: '',
    strokeWidth: 0,
    listening: false,
  })),
  Rect: jest.fn(() => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fill: '',
    stroke: '',
    strokeWidth: 0,
    rotation: 0,
    listening: false,
  })),
  Arc: jest.fn(() => ({
    x: 0,
    y: 0,
    innerRadius: 0,
    outerRadius: 0,
    angle: 0,
    rotation: 0,
    stroke: '',
    strokeWidth: 0,
    dash: [],
    listening: false,
  })),
}));

// Mock elementTypeConverter
jest.mock('@/utils/elementTypeConverter', () => ({
  convertElementsToElement2D: jest.fn(() => [
    { type: 'wall2d', id: 'wall1', startPoint: { x: 0, y: 0 }, endPoint: { x: 100, y: 0 }, thickness: 5, transform: { position: { x: 0, y: 0 }, rotation: 0 } },
  ]),
}));

describe('stageGenerator', () => {
  const mockElements = {
    walls: [] as Wall[],
    doors: [] as Door[],
    windows: [] as Window[],
    stairs: [] as Stair[],
    roofs: [] as Roof[],
    rooms: [] as Room[],
  };
  const mockFloorId = 'floor1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a stage for plan view with default options', async () => {
    const stage = await generateStageForView('plan', mockElements, mockFloorId);
    expect(Konva.Stage).toHaveBeenCalledWith({
      container: expect.any(HTMLDivElement),
      width: DEFAULT_STAGE_OPTIONS.width,
      height: DEFAULT_STAGE_OPTIONS.height,
    });
    expect(stage.add).toHaveBeenCalled();
  });

  it('should generate a stage for front view with custom options', async () => {
    const customOptions = { width: 1000, height: 800, showGrid: true };
    const stage = await generateStageForView('front', mockElements, mockFloorId, customOptions);
    expect(Konva.Stage).toHaveBeenCalledWith({
      container: expect.any(HTMLDivElement),
      width: customOptions.width,
      height: customOptions.height,
    });
    expect(stage.add).toHaveBeenCalled();
    expect(Konva.Line).toHaveBeenCalled(); // For grid
  });

  it('should generate all view stages', async () => {
    const stages = await generateAllViewStages(mockElements, mockFloorId);
    expect(stages.plan).toBeDefined();
    expect(stages.front).toBeDefined();
    expect(stages.back).toBeDefined();
    expect(stages.left).toBeDefined();
    expect(stages.right).toBeDefined();
  });

  it('should clean up stages', async () => {
    const stages = await generateAllViewStages(mockElements, mockFloorId);
    cleanupStages(stages);
    Object.values(stages).forEach(stage => {
      if (stage) {
        expect(stage.destroy).toHaveBeenCalled();
      }
    });
  });
});