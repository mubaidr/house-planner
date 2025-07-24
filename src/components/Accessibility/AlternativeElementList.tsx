'use client';

import React, { useEffect, useRef } from 'react';
import { useFloorStore } from '@/stores/floorStore';
import { Button } from '@/components/ui/button';
import { List, X, ChevronRight, Home } from 'lucide-react';

interface AlternativeElementListProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ElementInfo {
  id: string;
  type: string;
  name: string;
  floor: string;
  position: string;
  dimensions: string;
  description: string;
}

export default function AlternativeElementList({ isOpen, onClose }: AlternativeElementListProps) {
  const { floors, currentFloorId, setCurrentFloor } = useFloorStore();
  const listRef = useRef<HTMLDivElement>(null);

  // Generate accessible element list
  const generateElementList = (): ElementInfo[] => {
    const elements: ElementInfo[] = [];

    floors.forEach(floor => {
      // Walls
      floor.elements.walls.forEach(wall => {
        const length = Math.sqrt(
          Math.pow(wall.endX - wall.startX, 2) + Math.pow(wall.endY - wall.startY, 2)
        );
        elements.push({
          id: wall.id,
          type: 'Wall',
          name: `Wall ${wall.id.substring(0, 8)}`,
          floor: floor.name,
          position: `(${Math.round(wall.startX)}, ${Math.round(wall.startY)}) to (${Math.round(wall.endX)}, ${Math.round(wall.endY)})`,
          dimensions: `${Math.round(length)} units long, ${wall.thickness} thick, ${wall.height} high`,
          description: `Wall on ${floor.name}, length: ${Math.round(length)} units`
        });
      });

      // Doors
      floor.elements.doors.forEach(door => {
        elements.push({
          id: door.id,
          type: 'Door',
          name: `Door ${door.id.substring(0, 8)}`,
          floor: floor.name,
          position: `(${Math.round(door.x)}, ${Math.round(door.y)})`,
          dimensions: `${door.width} × ${door.height} units`,
          description: `Door on ${floor.name}, width: ${door.width}, height: ${door.height} units`
        });
      });

      // Windows
      floor.elements.windows.forEach(window => {
        elements.push({
          id: window.id,
          type: 'Window',
          name: `Window ${window.id.substring(0, 8)}`,
          floor: floor.name,
          position: `(${Math.round(window.x)}, ${Math.round(window.y)})`,
          dimensions: `${window.width} × ${window.height} units`,
          description: `Window on ${floor.name}, width: ${window.width}, height: ${window.height} units`
        });
      });

      // Stairs
      floor.elements.stairs.forEach(stair => {
        elements.push({
          id: stair.id,
          type: 'Stair',
          name: `Stair ${stair.id.substring(0, 8)}`,
          floor: floor.name,
          position: `(${Math.round(stair.x)}, ${Math.round(stair.y)})`,
          dimensions: `${stair.width} × ${stair.length} units`,
          description: `Staircase on ${floor.name}, width: ${stair.width}, length: ${stair.length} units`
        });
      });

      // Roofs
      floor.elements.roofs.forEach(roof => {
        const roofBounds = roof.points.length > 0 
          ? roof.points.reduce((bounds, point) => ({
              minX: Math.min(bounds.minX, point.x),
              minY: Math.min(bounds.minY, point.y),
              maxX: Math.max(bounds.maxX, point.x),
              maxY: Math.max(bounds.maxY, point.y)
            }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })
          : { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        
        const roofWidth = roofBounds.maxX - roofBounds.minX;
        const roofHeight = roofBounds.maxY - roofBounds.minY;
        const roofCenterX = (roofBounds.minX + roofBounds.maxX) / 2;
        const roofCenterY = (roofBounds.minY + roofBounds.maxY) / 2;

        elements.push({
          id: roof.id,
          type: 'Roof',
          name: `Roof ${roof.id.substring(0, 8)}`,
          floor: floor.name,
          position: `(${Math.round(roofCenterX)}, ${Math.round(roofCenterY)})`,
          dimensions: `${Math.round(roofWidth)} × ${Math.round(roofHeight)} units`,
          description: `Roof on ${floor.name}, width: ${Math.round(roofWidth)}, height: ${Math.round(roofHeight)} units`
        });
      });

      // Rooms
      floor.elements.rooms.forEach(room => {
        // Calculate room bounds from vertices
        const bounds = room.vertices && room.vertices.length > 0 
          ? room.vertices.reduce((b, vertex) => ({
              minX: Math.min(b.minX, vertex.x),
              minY: Math.min(b.minY, vertex.y),
              maxX: Math.max(b.maxX, vertex.x),
              maxY: Math.max(b.maxY, vertex.y)
            }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })
          : { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        
        const roomWidth = bounds.maxX - bounds.minX;
        const roomHeight = bounds.maxY - bounds.minY;
        const centerX = room.center ? room.center.x : (bounds.minX + bounds.maxX) / 2;
        const centerY = room.center ? room.center.y : (bounds.minY + bounds.maxY) / 2;

        elements.push({
          id: room.id,
          type: 'Room',
          name: room.name || `Room ${room.id.substring(0, 8)}`,
          floor: floor.name,
          position: `(${Math.round(centerX)}, ${Math.round(centerY)})`,
          dimensions: `${Math.round(roomWidth)} × ${Math.round(roomHeight)} units`,
          description: `${room.name || 'Room'} on ${floor.name}, area: ${Math.round(room.area || 0)} units²`
        });
      });
    });

    return elements.sort((a, b) => {
      if (a.floor !== b.floor) {
        return a.floor.localeCompare(b.floor);
      }
      return a.type.localeCompare(b.type);
    });
  };

  const elements = generateElementList();
  const currentFloor = floors.find(f => f.id === currentFloorId);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.focus();
    }
  }, [isOpen]);

  const handleFloorChange = (floorId: string) => {
    setCurrentFloor(floorId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <List className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Element List</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close element list"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floor Selector */}
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <label htmlFor="floor-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Floor
          </label>
          <select
            id="floor-select"
            value={currentFloorId || ''}
            onChange={(e) => handleFloorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select floor to view elements"
          >
            {floors.map(floor => (
              <option key={floor.id} value={floor.id}>
                {floor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Element List */}
        <div
          ref={listRef}
          tabIndex={-1}
          className="overflow-y-auto max-h-[60vh] p-4"
          role="listbox"
          aria-label="House design elements"
        >
          {elements.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No elements found</p>
          ) : (
            <div className="space-y-2">
              {elements
                .filter(element => !currentFloorId || element.floor === (floors.find(f => f.id === currentFloorId)?.name))
                .map((element) => (
                  <div
                    key={element.id}
                    className="p-3 rounded-lg border cursor-pointer transition-colors hover:border-gray-300 hover:bg-gray-50"
                    onClick={() => handleFloorChange(floors.find(f => f.name === element.floor)?.id || '')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleFloorChange(floors.find(f => f.name === element.floor)?.id || '');
                      }
                    }}
                    role="option"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{element.name}</h3>
                        <p className="text-sm text-gray-600">{element.type}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p><strong>Floor:</strong> {element.floor}</p>
                      <p><strong>Position:</strong> {element.position}</p>
                      <p><strong>Dimensions:</strong> {element.dimensions}</p>
                    </div>

                    <p className="mt-2 text-xs text-gray-500 sr-only">
                      {element.description}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600 mb-3">
            <p>Total elements: {elements.length}</p>
            <p className="text-xs mt-1">
              Use arrow keys to navigate, Enter/Space to select, Escape to close
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
