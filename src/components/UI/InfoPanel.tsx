import React, { useState } from 'react';
import { useDesignStore } from '@/stores/designStore';

interface InfoPanelProps {
  measureToolActive: boolean;
  manipulatorActive: boolean;
  selectedElementId?: string;
}

export function InfoPanel({
  measureToolActive,
  manipulatorActive,
  selectedElementId,
}: InfoPanelProps) {
  const { walls, doors, windows } = useDesignStore();
  const [isMinimized, setIsMinimized] = useState(false);

  // Get all elements count
  const elementCount = walls.length + doors.length + windows.length;

  // Get selected element info
  const selectedWall = selectedElementId ? walls.find(el => el.id === selectedElementId) : null;
  const selectedDoor = selectedElementId ? doors.find(el => el.id === selectedElementId) : null;
  const selectedWindow = selectedElementId ? windows.find(el => el.id === selectedElementId) : null;
  const selectedElement = selectedWall || selectedDoor || selectedWindow;

  const getToolInfo = () => {
    if (measureToolActive) {
      return {
        title: 'Measurement Tool',
        icon: '📐',
        content: [
          '• Click two points to measure distance',
          '• Press M to toggle tool',
          '• ESC to cancel current measurement',
          '• Measurements shown in real-time'
        ]
      };
    }

    if (manipulatorActive) {
      return {
        title: 'Object Manipulator',
        icon: '🎮',
        content: [
          '• Drag to move objects',
          '• Press G to toggle tool',
          '• ESC to cancel manipulation',
          '• Snap to grid when available'
        ]
      };
    }

    if (selectedWall) {
      const length = Math.round(Math.sqrt(
        Math.pow(selectedWall.endX - selectedWall.startX, 2) +
        Math.pow(selectedWall.endY - selectedWall.startY, 2)
      ));
      return {
        title: 'Selected Wall',
        icon: '🧱',
        content: [
          `ID: ${selectedWall.id}`,
          `Length: ${length}px`,
          `Thickness: ${selectedWall.thickness}px`,
          `Height: ${selectedWall.height}px`,
          '• Press P for properties panel',
          '• Click empty space to deselect'
        ]
      };
    }

    if (selectedDoor) {
      return {
        title: 'Selected Door',
        icon: '🚪',
        content: [
          `ID: ${selectedDoor.id}`,
          `Width: ${selectedDoor.width}px`,
          `Height: ${selectedDoor.height}px`,
          `Opens: ${selectedDoor.openDirection}`,
          '• Press P for properties panel',
          '• Click empty space to deselect'
        ]
      };
    }

    if (selectedWindow) {
      return {
        title: 'Selected Window',
        icon: '🪟',
        content: [
          `ID: ${selectedWindow.id}`,
          `Width: ${selectedWindow.width}px`,
          `Height: ${selectedWindow.height}px`,
          `Sill Height: ${selectedWindow.sillHeight}px`,
          '• Press P for properties panel',
          '• Click empty space to deselect'
        ]
      };
    }

    return {
      title: 'Project Info',
      icon: '📊',
      content: [
        `Total Elements: ${elementCount}`,
        `Walls: ${walls.length}`,
        `Doors: ${doors.length}`,
        `Windows: ${windows.length}`,
        '• Press I to toggle Info HUD',
        '• Use keyboard shortcuts for faster workflow'
      ]
    };
  };

  const info = getToolInfo();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={`bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl transition-all duration-300 ${
        isMinimized ? 'w-12 h-12' : 'w-64'
      }`}>
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full h-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            title="Expand info panel"
          >
            <span className="text-lg">{info.icon}</span>
          </button>
        ) : (
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{info.icon}</span>
                <h3 className="font-semibold text-gray-800 text-sm">{info.title}</h3>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Minimize panel"
              >
                <span className="text-xs">➖</span>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-1">
              {info.content.map((line, index) => (
                <div
                  key={index}
                  className={`text-xs ${
                    line.startsWith('•')
                      ? 'text-gray-500 ml-2'
                      : 'text-gray-700 font-medium'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* Performance Info (when no specific tool is active) */}
            {!measureToolActive && !manipulatorActive && !selectedElement && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-green-600 font-medium">FPS</div>
                    <div className="text-green-800">60</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-blue-600 font-medium">Memory</div>
                    <div className="text-blue-800">52%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InfoPanel;
