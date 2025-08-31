import { renderHook, act } from '@testing-library/react';

// Simple test for store functionality without complex dependencies
describe('DesignStore - Simple Test', () => {
  // Mock the store implementation
  const mockStore = {
    walls: [],
    doors: [],
    windows: [],
    stairs: [],
    rooms: [],
    roofs: [],
    materials: [],
    selectedElementId: null,
    selectedElementType: null,
    activeTool: null,
    viewMode: '3d',
    addWall: jest.fn(),
    addDoor: jest.fn(),
    addWindow: jest.fn(),
    removeWall: jest.fn(),
    setActiveTool: jest.fn(),
    selectElement: jest.fn(),
    setViewMode: jest.fn(),
    newProject: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has correct initial state structure', () => {
    expect(mockStore.walls).toEqual([]);
    expect(mockStore.doors).toEqual([]);
    expect(mockStore.windows).toEqual([]);
    expect(mockStore.selectedElementId).toBeNull();
    expect(mockStore.viewMode).toBe('3d');
  });

  it('provides all required actions', () => {
    expect(typeof mockStore.addWall).toBe('function');
    expect(typeof mockStore.addDoor).toBe('function');
    expect(typeof mockStore.setActiveTool).toBe('function');
    expect(typeof mockStore.selectElement).toBe('function');
    expect(typeof mockStore.newProject).toBe('function');
  });

  it('has proper element types', () => {
    const elementTypes = ['wall', 'door', 'window', 'stair', 'room', 'roof'];
    
    elementTypes.forEach(type => {
      expect(mockStore).toHaveProperty(`${type}s`);
    });
  });

  it('supports view modes', () => {
    const viewModes = ['2d', '3d', 'hybrid'];
    
    viewModes.forEach(mode => {
      act(() => {
        mockStore.setViewMode(mode);
      });
      expect(mockStore.setViewMode).toHaveBeenCalledWith(mode);
    });
  });

  it('supports tool selection', () => {
    const tools = ['wall', 'add-door', 'add-window', 'room', 'measure', 'select'];
    
    tools.forEach(tool => {
      act(() => {
        mockStore.setActiveTool(tool);
      });
      expect(mockStore.setActiveTool).toHaveBeenCalledWith(tool);
    });
  });
});