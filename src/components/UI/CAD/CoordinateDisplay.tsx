import React, { useState, useEffect } from 'react';
import { Crosshair, Target, Grid } from 'lucide-react';

interface CoordinateDisplayProps {
  className?: string;
  theme: 'light' | 'dark' | 'classic';
}

export function CoordinateDisplay({ className = '', theme }: CoordinateDisplayProps) {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 });
  const [snapPoint, setSnapPoint] = useState<{ x: number; y: number; z: number } | null>(null);
  const [units, setUnits] = useState('mm');
  const [precision, setPrecision] = useState(2);

  // Simulate coordinate updates (in real app, this would come from mouse/cursor position)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate mouse movement for demo
      setCoordinates({
        x: Math.random() * 10000,
        y: Math.random() * 10000,
        z: Math.random() * 3000
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const formatCoordinate = (value: number): string => {
    return value.toFixed(precision);
  };

  return (
    <div className={`${className} select-none`}>
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600 min-w-48">
        {/* Current Coordinates */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Crosshair size={12} />
            <span>Cursor Position</span>
          </div>
          
          <div className="font-mono text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-300">X:</span>
              <span className="text-white">{formatCoordinate(coordinates.x)} {units}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Y:</span>
              <span className="text-white">{formatCoordinate(coordinates.y)} {units}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Z:</span>
              <span className="text-white">{formatCoordinate(coordinates.z)} {units}</span>
            </div>
          </div>
        </div>

        {/* Snap Point (when active) */}
        {snapPoint && (
          <>
            <div className="border-t border-gray-600 my-2"></div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-green-400">
                <Target size={12} />
                <span>Snap Point</span>
              </div>
              
              <div className="font-mono text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-300">X:</span>
                  <span className="text-green-400">{formatCoordinate(snapPoint.x)} {units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Y:</span>
                  <span className="text-green-400">{formatCoordinate(snapPoint.y)} {units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Z:</span>
                  <span className="text-green-400">{formatCoordinate(snapPoint.z)} {units}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Settings */}
        <div className="border-t border-gray-600 mt-2 pt-2">
          <div className="flex items-center justify-between">
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="text-xs bg-gray-700 border border-gray-600 rounded px-1 py-0.5"
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="m">m</option>
              <option value="in">in</option>
              <option value="ft">ft</option>
            </select>
            
            <select
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="text-xs bg-gray-700 border border-gray-600 rounded px-1 py-0.5"
            >
              <option value={0}>0</option>
              <option value={1}>0.0</option>
              <option value={2}>0.00</option>
              <option value={3}>0.000</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}