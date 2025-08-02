'use client';

import React from 'react';
import { useDesignStore } from '@/stores/designStore';

export const DemoSceneCreator: React.FC = () => {
  const { addWall, addRoom, addDoor, addWindow, deleteWall, deleteRoom, deleteDoor, deleteWindow, walls, rooms, doors, windows } = useDesignStore();

  const clearAll = () => {
    walls.forEach(wall => deleteWall(wall.id));
    rooms.forEach(room => deleteRoom(room.id));
    doors.forEach(door => deleteDoor(door.id));
    windows.forEach(window => deleteWindow(window.id));
  };

  const createDemoHouse = () => {
    // Clear existing elements
    clearAll();

    // Create a simple house layout
    const houseWalls = [
      // Exterior walls
      { startX: -8, startY: -6, endX: 8, endY: -6, thickness: 0.3, height: 3, color: '#E8E8E8' }, // Front wall
      { startX: 8, startY: -6, endX: 8, endY: 6, thickness: 0.3, height: 3, color: '#E8E8E8' }, // Right wall
      { startX: 8, startY: 6, endX: -8, endY: 6, thickness: 0.3, height: 3, color: '#E8E8E8' }, // Back wall
      { startX: -8, startY: 6, endX: -8, endY: -6, thickness: 0.3, height: 3, color: '#E8E8E8' }, // Left wall

      // Interior walls
      { startX: -8, startY: 0, endX: 0, endY: 0, thickness: 0.2, height: 3, color: '#F0F0F0' }, // Divider 1
      { startX: 0, startY: -6, endX: 0, endY: 3, thickness: 0.2, height: 3, color: '#F0F0F0' }, // Divider 2
    ];

    // Add walls
    houseWalls.forEach((wall, index) => {
      setTimeout(() => {
        addWall({
          ...wall,
          materialId: 'wall-default',
        });
      }, index * 200); // Stagger creation for visual effect
    });

    // Add rooms
    setTimeout(() => {
      // Living room
      addRoom({
        name: 'Living Room',
        points: [
          { x: -8, y: -6 },
          { x: 0, y: -6 },
          { x: 0, y: 0 },
          { x: -8, y: 0 },
        ],
        roomType: 'living',
        floorMaterialId: 'floor-wood',
        ceilingHeight: 3,
      });

      // Kitchen
      addRoom({
        name: 'Kitchen',
        points: [
          { x: 0, y: -6 },
          { x: 8, y: -6 },
          { x: 8, y: 0 },
          { x: 0, y: 0 },
        ],
        roomType: 'kitchen',
        floorMaterialId: 'floor-tile',
        ceilingHeight: 3,
      });

      // Bedroom
      addRoom({
        name: 'Bedroom',
        points: [
          { x: -8, y: 0 },
          { x: 8, y: 0 },
          { x: 8, y: 6 },
          { x: -8, y: 6 },
        ],
        roomType: 'bedroom',
        floorMaterialId: 'floor-carpet',
        ceilingHeight: 3,
      });
    }, 1500);

    // Add doors
    setTimeout(() => {
      // Front door
      addDoor({
        wallId: 'front-wall',
        position: { x: -2, y: 0, z: -6 },
        width: 0.9,
        height: 2.1,
        thickness: 0.05,
        openDirection: 'inward',
        color: '#8B4513',
        materialId: 'door-wood',
        properties3D: {
          frameThickness: 0.08,
          panelStyle: 'solid',
          handleStyle: 'classic'
        }
      });

      // Interior door (Living to Kitchen)
      addDoor({
        wallId: 'divider-1',
        position: { x: -2, y: 0, z: 0 },
        width: 0.8,
        height: 2.1,
        thickness: 0.04,
        openDirection: 'left',
        color: '#DEB887',
        materialId: 'door-interior',
        properties3D: {
          frameThickness: 0.06,
          panelStyle: 'panel',
          handleStyle: 'modern'
        }
      });

      // Bedroom door
      addDoor({
        wallId: 'divider-2',
        position: { x: 2, y: 0, z: 0 },
        width: 0.8,
        height: 2.1,
        thickness: 0.04,
        openDirection: 'right',
        color: '#DEB887',
        materialId: 'door-interior',
        properties3D: {
          frameThickness: 0.06,
          panelStyle: 'panel',
          handleStyle: 'modern'
        }
      });
    }, 2500);

    // Add windows
    setTimeout(() => {
      // Living room window
      addWindow({
        wallId: 'front-wall',
        position: { x: -5, y: 1.2, z: -6 },
        width: 1.5,
        height: 1.2,
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

      // Kitchen window
      addWindow({
        wallId: 'right-wall',
        position: { x: 8, y: 1.2, z: -3 },
        width: 1.2,
        height: 1.0,
        thickness: 0.15,
        sillHeight: 1.1,
        color: '#FFFFFF',
        materialId: 'window-frame',
        properties3D: {
          frameThickness: 0.08,
          glassType: 'clear',
          frameStyle: 'modern'
        }
      });

      // Bedroom windows
      addWindow({
        wallId: 'back-wall',
        position: { x: -3, y: 1.2, z: 6 },
        width: 1.8,
        height: 1.4,
        thickness: 0.15,
        sillHeight: 0.9,
        color: '#FFFFFF',
        materialId: 'window-frame',
        properties3D: {
          frameThickness: 0.08,
          glassType: 'clear',
          frameStyle: 'classic'
        }
      });

      addWindow({
        wallId: 'back-wall',
        position: { x: 3, y: 1.2, z: 6 },
        width: 1.8,
        height: 1.4,
        thickness: 0.15,
        sillHeight: 0.9,
        color: '#FFFFFF',
        materialId: 'window-frame',
        properties3D: {
          frameThickness: 0.08,
          glassType: 'tinted',
          frameStyle: 'classic'
        }
      });
    }, 3500);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm p-4 space-y-3">
      <h3 className="text-sm font-semibold text-blue-700 flex items-center">
        <span className="mr-2">🏠</span>
        Demo House Generator
      </h3>

      <p className="text-xs text-gray-600">
        Create a complete demo house with walls, rooms, doors, and windows featuring:
      </p>

      <ul className="text-xs text-gray-600 space-y-1 ml-4">
        <li>• Animated doors with opening mechanisms</li>
        <li>• Multi-style windows (clear, tinted, frosted)</li>
        <li>• Interactive 3D elements with selection</li>
        <li>• Touch and gesture controls</li>
        <li>• Realistic materials and lighting</li>
      </ul>

      <button
        onClick={createDemoHouse}
        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md"
      >
        🚀 Create Demo House
      </button>

      <div className="text-xs text-blue-600 mt-2">
        <strong>Controls:</strong>
        <div className="mt-1 space-y-1">
          <div>• Click elements to select them</div>
          <div>• Ctrl+Drag to rotate scene</div>
          <div>• Double-click to reset view</div>
          <div>• Scroll to zoom in/out</div>
        </div>
      </div>
    </div>
  );
};

export default DemoSceneCreator;
