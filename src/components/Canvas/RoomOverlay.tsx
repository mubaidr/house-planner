'use client';

import React from 'react';
import { Group, Line, Text, Circle } from 'react-konva';
import { useDesignStore } from '@/stores/designStore';
import { useUIStore } from '@/stores/uiStore';
import { detectRooms, getRoomInfo } from '@/utils/roomDetection';

export default function RoomOverlay() {
  const { walls } = useDesignStore();
  const { showRooms } = useUIStore();
  
  const { rooms } = detectRooms(walls);

  if (!showRooms || rooms.length === 0) return null;

  return (
    <Group>
      {rooms.map((room) => (
        <Group key={room.id}>
          {/* Room fill */}
          <Line
            points={room.vertices.flatMap(v => [v.x, v.y])}
            closed={true}
            fill={room.color}
            opacity={0.2}
            listening={false}
          />
          
          {/* Room border */}
          <Line
            points={room.vertices.flatMap(v => [v.x, v.y])}
            closed={true}
            stroke={room.color.replace('F2FD', '90A4')} // Darker version
            strokeWidth={2}
            dash={[5, 5]}
            opacity={0.6}
            listening={false}
          />
          
          {/* Room center point */}
          <Circle
            x={room.center.x}
            y={room.center.y}
            radius={3}
            fill={room.color.replace('F2FD', '1976')} // Much darker version
            opacity={0.8}
            listening={false}
          />
          
          {/* Room label */}
          <Text
            x={room.center.x}
            y={room.center.y + 10}
            text={getRoomInfo(room)}
            fontSize={12}
            fontFamily="Arial"
            fill="#333"
            align="center"
            offsetX={50} // Center the text
            width={100}
            listening={false}
          />
        </Group>
      ))}
    </Group>
  );
}