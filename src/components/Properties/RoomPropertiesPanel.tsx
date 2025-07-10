'use client';

import React, { useState } from 'react';
import { Room } from '@/utils/roomDetection';

interface RoomPropertiesPanelProps {
  room: Room;
  onUpdate: (roomId: string, updates: Partial<Room>) => void;
}

const ROOM_TYPES = [
  { value: 'living', label: 'Living Room', icon: '🛋️' },
  { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { value: 'dining', label: 'Dining Room', icon: '🍽️' },
  { value: 'office', label: 'Office', icon: '💼' },
  { value: 'closet', label: 'Closet', icon: '👔' },
  { value: 'hallway', label: 'Hallway', icon: '🚪' },
  { value: 'garage', label: 'Garage', icon: '🚗' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const ROOM_COLORS = [
  { value: '#E3F2FD', label: 'Light Blue' },
  { value: '#F3E5F5', label: 'Light Purple' },
  { value: '#E8F5E8', label: 'Light Green' },
  { value: '#FFF3E0', label: 'Light Orange' },
  { value: '#FCE4EC', label: 'Light Pink' },
  { value: '#F1F8E9', label: 'Light Lime' },
  { value: '#E0F2F1', label: 'Light Teal' },
  { value: '#FFF8E1', label: 'Light Yellow' },
];

export default function RoomPropertiesPanel({ room, onUpdate }: RoomPropertiesPanelProps) {
  const [roomName, setRoomName] = useState(room.name);
  const [roomType, setRoomType] = useState(room.roomType || 'other');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setRoomName(newName);
    onUpdate(room.id, { name: newName });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setRoomType(newType);
    onUpdate(room.id, { roomType: newType });
  };

  const handleColorChange = (color: string) => {
    onUpdate(room.id, { color });
  };

  const areaInSqFt = (room.area / 144).toFixed(1);
  const perimeterInFt = (room.perimeter / 12).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-800">Room Properties</h3>
      </div>

      {/* Room Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Name
        </label>
        <input
          type="text"
          value={roomName}
          onChange={handleNameChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter room name"
        />
      </div>

      {/* Room Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Type
        </label>
        <select
          value={roomType}
          onChange={handleTypeChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {ROOM_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Room Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Color
        </label>
        <div className="grid grid-cols-4 gap-2">
          {ROOM_COLORS.map((colorOption) => (
            <button
              key={colorOption.value}
              onClick={() => handleColorChange(colorOption.value)}
              className={`w-12 h-8 rounded border-2 transition-all ${
                room.color === colorOption.value
                  ? 'border-blue-500 scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: colorOption.value }}
              title={colorOption.label}
            />
          ))}
        </div>
      </div>

      {/* Room Measurements */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Measurements</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Area:</span>
            <span className="font-medium">{areaInSqFt} sq ft</span>
          </div>
          <div className="flex justify-between">
            <span>Perimeter:</span>
            <span className="font-medium">{perimeterInFt} ft</span>
          </div>
          <div className="flex justify-between">
            <span>Walls:</span>
            <span className="font-medium">{room.walls.length}</span>
          </div>
        </div>
      </div>

      {/* Room Actions */}
      <div className="space-y-2">
        <button
          onClick={() => {
            const newName = prompt('Enter new room name:', room.name);
            if (newName) {
              onUpdate(room.id, { name: newName });
              setRoomName(newName);
            }
          }}
          className="w-full px-3 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition-colors"
        >
          Rename Room
        </button>
        
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to reset "${room.name}" to default settings?`)) {
              onUpdate(room.id, {
                name: `Room ${Date.now()}`,
                roomType: 'other',
                color: '#E3F2FD'
              });
              setRoomName(`Room ${Date.now()}`);
              setRoomType('other');
            }
          }}
          className="w-full px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
        >
          Reset to Default
        </button>
      </div>

      {/* Room Info */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
        <div className="font-medium text-blue-700 mb-1">Tips:</div>
        <div>• Double-click room label to rename</div>
        <div>• Use room types for better organization</div>
        <div>• Colors help distinguish different areas</div>
      </div>
    </div>
  );
}