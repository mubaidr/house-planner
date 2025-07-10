'use client';

import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Room } from '@/utils/roomDetection';

interface RoomEditorProps {
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (roomId: string, updates: Partial<Room>) => void;
}

export default function RoomEditor({ room, isSelected, onSelect, onEdit }: RoomEditorProps) {
  const handleDoubleClick = () => {
    // In a real implementation, this would trigger a modal or inline editor
    const newName = prompt('Enter room name:', room.name);
    if (newName && newName !== room.name) {
      onEdit(room.id, { name: newName });
    }
  };

  return (
    <Group>
      {/* Room fill with interaction */}
      <Rect
        x={room.center.x - 50}
        y={room.center.y - 30}
        width={100}
        height={60}
        fill="transparent"
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
      />

      {/* Selection indicator */}
      {isSelected && (
        <Rect
          x={room.center.x - 55}
          y={room.center.y - 35}
          width={110}
          height={70}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[5, 5]}
          fill="rgba(59, 130, 246, 0.1)"
          listening={false}
        />
      )}

      {/* Room label with edit indicator */}
      <Text
        x={room.center.x}
        y={room.center.y - 10}
        text={room.name}
        fontSize={14}
        fontFamily="Arial"
        fontStyle={isSelected ? 'bold' : 'normal'}
        fill={isSelected ? '#3b82f6' : '#333'}
        align="center"
        offsetX={50}
        width={100}
        listening={false}
      />

      {/* Room info */}
      <Text
        x={room.center.x}
        y={room.center.y + 8}
        text={`${(room.area / 144).toFixed(1)} sq ft`}
        fontSize={10}
        fontFamily="Arial"
        fill="#666"
        align="center"
        offsetX={50}
        width={100}
        listening={false}
      />

      {/* Edit indicator when selected */}
      {isSelected && (
        <Text
          x={room.center.x}
          y={room.center.y + 25}
          text="Double-click to edit"
          fontSize={8}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={50}
          width={100}
          listening={false}
        />
      )}
    </Group>
  );
}