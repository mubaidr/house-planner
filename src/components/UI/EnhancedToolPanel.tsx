'use client';

import { useDesignStore } from '@/stores/designStore';
import { useState } from 'react';

interface ToolOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  hoverColor: string;
  description: string;
}

export function EnhancedToolPanel() {
  const { addWall, addRoom, addDoor, addWindow, walls, rooms, doors, windows, selection } = useDesignStore();
  const [activeCategory, setActiveCategory] = useState<'basic' | 'advanced'>('basic');

  const clearAll = () => {
    const state = useDesignStore.getState();
    walls.forEach(wall => state.deleteWall(wall.id));
    rooms.forEach(room => state.deleteRoom(room.id));
    doors.forEach(door => state.deleteDoor(door.id));
    windows.forEach(window => state.deleteWindow(window.id));
  };

  const basicTools: ToolOption[] = [
    {
      id: 'wall',
      label: 'Add Wall',
      icon: '🧱',
      color: 'bg-slate-500',
      hoverColor: 'hover:bg-slate-600',
      description: 'Create structural walls'
    },
    {
      id: 'room',
      label: 'Add Room',
      icon: '🏠',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      description: 'Define room boundaries'
    },
    {
      id: 'door',
      label: 'Add Door',
      icon: '🚪',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      description: 'Interactive door elements'
    },
    {
      id: 'window',
      label: 'Add Window',
      icon: '🪟',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      description: 'Glass window elements'
    },
  ];

  const advancedTools: ToolOption[] = [
    {
      id: 'custom-door',
      label: 'Custom Door',
      icon: '🎨',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      description: 'Customizable door properties'
    },
    {
      id: 'custom-window',
      label: 'Custom Window',
      icon: '✨',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      description: 'Advanced window styles'
    },
  ];

  const createSampleWall = () => {
    addWall({
      startX: Math.random() * 10 - 5,
      startY: Math.random() * 10 - 5,
      endX: Math.random() * 10 + 5,
      endY: Math.random() * 10 + 5,
      thickness: 0.2,
      height: 3,
      color: '#f3f4f6',
      materialId: 'wall-default',
    });
  };

  const createSampleRoom = () => {
    addRoom({
      name: `Room ${rooms.length + 1}`,
      points: [
        { x: -3, y: -3 },
        { x: 3, y: -3 },
        { x: 3, y: 3 },
        { x: -3, y: 3 },
      ],
      roomType: 'living',
      floorMaterialId: 'floor-wood',
      ceilingHeight: 3,
    });
  };

  const createSampleDoor = () => {
    addDoor({
      wallId: walls.length > 0 ? walls[0].id : 'demo-wall',
      position: { x: Math.random() * 5, y: 0, z: Math.random() * 5 },
      width: 0.9,
      height: 2.1,
      thickness: 0.05,
      openDirection: Math.random() > 0.5 ? 'left' : 'right',
      color: '#8B4513',
      materialId: 'door-wood',
      properties3D: {
        frameThickness: 0.08,
        panelStyle: 'solid',
        handleStyle: 'modern'
      }
    });
  };

  const createSampleWindow = () => {
    addWindow({
      wallId: walls.length > 0 ? walls[0].id : 'demo-wall',
      position: { x: Math.random() * 5, y: 1, z: Math.random() * 5 },
      width: 1.2,
      height: 1.5,
      thickness: 0.15,
      sillHeight: 1.0,
      color: '#FFFFFF',
      materialId: 'window-frame',
      properties3D: {
        frameThickness: 0.08,
        glassType: 'clear',
        frameStyle: 'modern'
      }
    });
  };

  const createCustomDoor = () => {
    const styles = ['solid', 'glass', 'panel'];
    const handles = ['modern', 'classic', 'minimal'];
    const colors = ['#8B4513', '#D2691E', '#CD853F', '#F4A460'];

    addDoor({
      wallId: walls.length > 0 ? walls[0].id : 'demo-wall',
      position: { x: Math.random() * 5, y: 0, z: Math.random() * 5 },
      width: 0.8 + Math.random() * 0.4,
      height: 2.0 + Math.random() * 0.3,
      thickness: 0.04 + Math.random() * 0.02,
      openDirection: Math.random() > 0.5 ? 'left' : 'right',
      color: colors[Math.floor(Math.random() * colors.length)],
      materialId: 'door-custom',
      properties3D: {
        frameThickness: 0.05 + Math.random() * 0.05,
        panelStyle: styles[Math.floor(Math.random() * styles.length)] as 'solid' | 'glass' | 'panel',
        handleStyle: handles[Math.floor(Math.random() * handles.length)] as 'modern' | 'classic' | 'minimal'
      }
    });
  };

  const createCustomWindow = () => {
    const glassTypes = ['clear', 'tinted', 'frosted'];
    const frameStyles = ['modern', 'classic', 'industrial'];

    addWindow({
      wallId: walls.length > 0 ? walls[0].id : 'demo-wall',
      position: { x: Math.random() * 5, y: 0.8 + Math.random() * 0.8, z: Math.random() * 5 },
      width: 1.0 + Math.random() * 1.0,
      height: 1.0 + Math.random() * 0.8,
      thickness: 0.1 + Math.random() * 0.1,
      sillHeight: 0.8 + Math.random() * 0.4,
      color: '#FFFFFF',
      materialId: 'window-custom',
      properties3D: {
        frameThickness: 0.06 + Math.random() * 0.04,
        glassType: glassTypes[Math.floor(Math.random() * glassTypes.length)] as 'clear' | 'tinted' | 'frosted',
        frameStyle: frameStyles[Math.floor(Math.random() * frameStyles.length)] as 'modern' | 'classic' | 'industrial'
      }
    });
  };

  const handleToolAction = (toolId: string) => {
    switch (toolId) {
      case 'wall':
        createSampleWall();
        break;
      case 'room':
        createSampleRoom();
        break;
      case 'door':
        createSampleDoor();
        break;
      case 'window':
        createSampleWindow();
        break;
      case 'custom-door':
        createCustomDoor();
        break;
      case 'custom-window':
        createCustomWindow();
        break;
    }
  };

  const elementCounts = [
    { label: 'Walls', count: walls.length, icon: '🧱', color: 'text-slate-600' },
    { label: 'Rooms', count: rooms.length, icon: '🏠', color: 'text-green-600' },
    { label: 'Doors', count: doors.length, icon: '🚪', color: 'text-orange-600' },
    { label: 'Windows', count: windows.length, icon: '🪟', color: 'text-blue-600' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 px-4 py-3">
        <h3 className="text-white font-semibold flex items-center">
          <span className="mr-2">🔧</span>
          Building Tools
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Category Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveCategory('basic')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeCategory === 'basic'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Basic Tools
          </button>
          <button
            onClick={() => setActiveCategory('advanced')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeCategory === 'advanced'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Tool Buttons */}
        <div className="space-y-3">
          {(activeCategory === 'basic' ? basicTools : advancedTools).map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolAction(tool.id)}
              className={`w-full p-4 text-left rounded-lg border-2 border-gray-200 ${tool.color} ${tool.hoverColor} text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <div className="font-medium">{tool.label}</div>
                  <div className="text-sm opacity-90">{tool.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Element Counter */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
            Scene Elements
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {elementCounts.map((element) => (
              <div key={element.label} className="flex items-center space-x-2">
                <span className="text-lg">{element.icon}</span>
                <div>
                  <div className={`text-sm font-medium ${element.color}`}>{element.count}</div>
                  <div className="text-xs text-gray-500">{element.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selection Info */}
        {selection.selectedElementId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-700 mb-1">Selected Element</h4>
            <div className="text-xs text-blue-600">
              <span className="font-medium">{selection.selectedElementType?.toUpperCase()}</span>
              <span className="ml-2 text-blue-500">ID: {selection.selectedElementId}</span>
            </div>
          </div>
        )}

        {/* Clear All Button */}
        <button
          onClick={clearAll}
          className="w-full p-3 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
        >
          <span className="mr-2">🗑️</span>
          Clear All Elements
        </button>
      </div>
    </div>
  );
}

export default EnhancedToolPanel;
