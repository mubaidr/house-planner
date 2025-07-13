'use client';

import React, { useState, useCallback } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import { EnhancedRoom, getRoomTypeSuggestions, analyzeRoomInsights } from '@/utils/enhancedRoomDetection';
import { useDesignStore } from '@/stores/designStore';

interface EnhancedRoomEditorProps {
  room: EnhancedRoom;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (roomId: string, updates: Partial<EnhancedRoom>) => void;
}

interface RoomLabelProps {
  room: EnhancedRoom;
  isSelected: boolean;
}

const RoomLabel: React.FC<RoomLabelProps> = ({ room, isSelected }) => {
  const getDisplayName = () => {
    if (room.isCustomNamed) {
      return room.name;
    }

    // Use suggested name if available and confidence is high
    if (room.confidence > 0.5 && room.suggestedNames.length > 0) {
      return room.suggestedNames[0];
    }

    return room.name;
  };

  const getTypeIcon = () => {
    const icons: Record<string, string> = {
      bedroom: '🛏️',
      bathroom: '🚿',
      kitchen: '🍳',
      living: '🛋️',
      dining: '🍽️',
      office: '💼',
      closet: '👔',
      hallway: '🚪',
      other: '📦',
    };
    return icons[room.roomType] || '📦';
  };

  const getConfidenceColor = () => {
    if (room.confidence > 0.7) return '#10b981'; // Green
    if (room.confidence > 0.4) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <Group>
      {/* Room name */}
      <Text
        x={room.center.x}
        y={room.center.y - 15}
        text={`${getTypeIcon()} ${getDisplayName()}`}
        fontSize={isSelected ? 16 : 14}
        fontFamily="Arial"
        fontStyle={isSelected ? 'bold' : 'normal'}
        fill={isSelected ? '#3b82f6' : '#1f2937'}
        align="center"
        offsetX={60}
        width={120}
        listening={false}
      />

      {/* Room area and confidence */}
      <Text
        x={room.center.x}
        y={room.center.y + 2}
        text={`${(room.area / 144).toFixed(1)} sq ft`}
        fontSize={11}
        fontFamily="Arial"
        fill="#6b7280"
        align="center"
        offsetX={60}
        width={120}
        listening={false}
      />

      {/* Confidence indicator */}
      {!room.isCustomNamed && (
        <Circle
          x={room.center.x + 45}
          y={room.center.y - 10}
          radius={3}
          fill={getConfidenceColor()}
          opacity={0.8}
          listening={false}
        />
      )}

      {/* Room type confidence text */}
      {!room.isCustomNamed && room.confidence < 0.7 && (
        <Text
          x={room.center.x}
          y={room.center.y + 15}
          text={`${Math.round(room.confidence * 100)}% confidence`}
          fontSize={9}
          fontFamily="Arial"
          fill="#9ca3af"
          align="center"
          offsetX={60}
          width={120}
          listening={false}
        />
      )}

      {/* Edit hint */}
      {isSelected && (
        <Text
          x={room.center.x}
          y={room.center.y + (room.confidence < 0.7 ? 30 : 20)}
          text="Double-click to edit"
          fontSize={8}
          fontFamily="Arial"
          fill="#3b82f6"
          align="center"
          offsetX={60}
          width={120}
          listening={false}
        />
      )}
    </Group>
  );
};

export default function EnhancedRoomEditor({
  room,
  isSelected,
  onSelect
}: EnhancedRoomEditorProps) {
  const { doors, windows } = useDesignStore();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDoubleClick = useCallback(() => {
    setShowEditDialog(true);
  }, []);

  // const handleEdit = useCallback((updates: Partial<EnhancedRoom>) => {
  //   onEdit(room.id, updates);
  //   setShowEditDialog(false);
  // }, [room.id, onEdit]); // Removed unused function

  const suggestions = getRoomTypeSuggestions(room, doors, windows);
  // const insights = analyzeRoomInsights(room, doors, windows); // Removed unused variable

  return (
    <Group>
      {/* Interactive area */}
      <Rect
        x={room.center.x - 60}
        y={room.center.y - 25}
        width={120}
        height={50}
        fill="transparent"
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
      />

      {/* Selection indicator */}
      {isSelected && (
        <Rect
          x={room.center.x - 65}
          y={room.center.y - 30}
          width={130}
          height={60}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[5, 5]}
          fill="rgba(59, 130, 246, 0.1)"
          listening={false}
        />
      )}

      {/* Room label */}
      <RoomLabel
        room={room}
        isSelected={isSelected}
      />

      {/* Edit dialog overlay (simplified for canvas) */}
      {showEditDialog && (
        <Group>
          {/* Dialog background */}
          <Rect
            x={room.center.x - 100}
            y={room.center.y - 80}
            width={200}
            height={160}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth={1}
            shadowColor="black"
            shadowOpacity={0.1}
            shadowOffsetX={2}
            shadowOffsetY={2}
            shadowBlur={8}
            cornerRadius={8}
          />

          {/* Dialog title */}
          <Text
            x={room.center.x}
            y={room.center.y - 65}
            text="Edit Room"
            fontSize={14}
            fontFamily="Arial"
            fontStyle="bold"
            fill="#1f2937"
            align="center"
            offsetX={50}
            width={100}
            listening={false}
          />

          {/* Current name */}
          <Text
            x={room.center.x - 90}
            y={room.center.y - 45}
            text={`Current: ${room.name}`}
            fontSize={11}
            fontFamily="Arial"
            fill="#6b7280"
            width={180}
            listening={false}
          />

          {/* Suggestions */}
          <Text
            x={room.center.x - 90}
            y={room.center.y - 30}
            text="Suggestions:"
            fontSize={11}
            fontFamily="Arial"
            fontStyle="bold"
            fill="#374151"
            width={180}
            listening={false}
          />

          {suggestions.slice(0, 3).map((suggestion, index) => (
            <Text
              key={index}
              x={room.center.x - 85}
              y={room.center.y - 15 + (index * 12)}
              text={`• ${suggestion}`}
              fontSize={10}
              fontFamily="Arial"
              fill="#4b5563"
              width={170}
              listening={false}
            />
          ))}

          {/* Close button area */}
          <Rect
            x={room.center.x + 75}
            y={room.center.y - 75}
            width={20}
            height={20}
            fill="transparent"
            onClick={() => setShowEditDialog(false)}
            onTap={() => setShowEditDialog(false)}
          />

          <Text
            x={room.center.x + 85}
            y={room.center.y - 70}
            text="×"
            fontSize={16}
            fontFamily="Arial"
            fill="#6b7280"
            align="center"
            listening={false}
          />
        </Group>
      )}
    </Group>
  );
}

// Room Type Selector Component (for properties panel)
export const RoomTypeSelector: React.FC<{
  room: EnhancedRoom;
  onUpdate: (updates: Partial<EnhancedRoom>) => void;
}> = ({ room, onUpdate }) => {
  const { doors, windows } = useDesignStore();
  const suggestions = getRoomTypeSuggestions(room, doors, windows);
  const insights = analyzeRoomInsights(room, doors, windows);

  const roomTypes = [
    { value: 'living', label: 'Living Room', icon: '🛋️' },
    { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
    { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
    { value: 'dining', label: 'Dining Room', icon: '🍽️' },
    { value: 'office', label: 'Office', icon: '💼' },
    { value: 'closet', label: 'Closet', icon: '👔' },
    { value: 'hallway', label: 'Hallway', icon: '🚪' },
    { value: 'other', label: 'Other', icon: '📦' },
  ];

  return (
    <div className="space-y-4">
      {/* Room Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Type
        </label>
        <select
          value={room.roomType}
          onChange={(e) => onUpdate({
            roomType: e.target.value,
            isCustomNamed: true
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {roomTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Suggestions
          </label>
          <div className="space-y-1">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onUpdate({
                  name: suggestion,
                  isCustomNamed: true
                })}
                className="w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Analysis
        </label>
        <div className="space-y-2 text-sm">
          {insights.insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-blue-500">ℹ️</span>
              <span className="text-gray-600">{insight}</span>
            </div>
          ))}
          {insights.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-yellow-500">💡</span>
              <span className="text-gray-600">{rec}</span>
            </div>
          ))}
          {insights.warnings.map((warning, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-gray-600">{warning}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Score */}
      {!room.isCustomNamed && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Confidence
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  room.confidence > 0.7 ? 'bg-green-500' :
                  room.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${room.confidence * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {Math.round(room.confidence * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
