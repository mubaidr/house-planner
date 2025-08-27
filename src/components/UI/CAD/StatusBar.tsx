import { useStatusBarStore } from '@/stores/statusBarStore';
import {
  Clock,
  Cpu,
  Eye,
  Grid,
  HardDrive,
  Layers,
  MousePointer,
  Move3D,
  Ruler,
  Square,
  Target,
  Wifi,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface StatusBarProps {
  height: number;
  theme: 'light' | 'dark' | 'classic';
}

interface CoordinateInfo {
  x: number;
  y: number;
  z: number;
}

interface SystemInfo {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  objectCount: number;
}

const StatusButton = ({
  active,
  onClick,
  icon,
  label,
  tooltip,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tooltip: string;
}) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`px-2 py-1 text-xs flex items-center space-x-1 rounded transition-colors ${
      active ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
    }`}
    title={tooltip}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export function StatusBar({ height, theme }: StatusBarProps) {
  const [coordinates, setCoordinates] = useState<CoordinateInfo>({ x: 0, y: 0, z: 0 });
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    fps: 60,
    memoryUsage: 45,
    renderTime: 16.7,
    objectCount: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [snapMode, setSnapMode] = useState(true);
  const [gridMode, setGridMode] = useState(true);
  const [orthoMode, setOrthoMode] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('0');
  const [currentTool, setCurrentTool] = useState('Select');
  const [units, setUnits] = useState('mm');
  const [scale, setScale] = useState('1:100');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const angle = useStatusBarStore(state => state.angle);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate system monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemInfo(prev => ({
        ...prev,
        fps: 58 + Math.random() * 4,
        memoryUsage: 40 + Math.random() * 20,
        renderTime: 15 + Math.random() * 5,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCoordinate = (value: number): string => {
    return value.toFixed(2);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPerformanceColor = (fps: number): string => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={`w-full border-t border-gray-600 flex items-center justify-between px-2 text-xs ${
        theme === 'dark'
          ? 'bg-gray-900 text-gray-300'
          : theme === 'light'
            ? 'bg-gray-100 text-gray-700'
            : 'bg-gray-800 text-gray-300'
      }`}
      style={{ height }}
    >
      {/* Left Section - Coordinates and Tool Info */}
      <div className="flex items-center space-x-4">
        {/* Current Tool */}
        <div className="flex items-center space-x-1">
          <MousePointer size={12} />
          <span className="font-medium">{currentTool}</span>
        </div>

        {/* Coordinates */}
        <div className="flex items-center space-x-2 font-mono">
          <Move3D size={12} />
          <span>X: {formatCoordinate(coordinates.x)}</span>
          <span>Y: {formatCoordinate(coordinates.y)}</span>
          <span>Z: {formatCoordinate(coordinates.z)}</span>
          <span className="text-gray-500">({units})</span>
        </div>

        {/* Angle */}
        {angle !== null && (
          <div className="flex items-center space-x-1">
            <span>Angle: {angle.toFixed(1)}°</span>
          </div>
        )}

        {/* Current Layer */}
        <div className="flex items-center space-x-1">
          <Layers size={12} />
          <span>Layer: {currentLayer}</span>
        </div>

        {/* Scale */}
        <div className="flex items-center space-x-1">
          <Ruler size={12} />
          <span>Scale: {scale}</span>
        </div>
      </div>

      {/* Center Section - Mode Toggles */}
      <div className="flex items-center space-x-2">
        <StatusButton
          active={snapMode}
          onClick={() => setSnapMode(!snapMode)}
          icon={<Target size={12} />}
          label="SNAP"
          tooltip="Object Snap (F9)"
        />

        <StatusButton
          active={gridMode}
          onClick={() => setGridMode(!gridMode)}
          icon={<Grid size={12} />}
          label="GRID"
          tooltip="Grid Display (F7)"
        />

        <StatusButton
          active={orthoMode}
          onClick={() => setOrthoMode(!orthoMode)}
          icon={<Square size={12} />}
          label="ORTHO"
          tooltip="Orthogonal Mode (F8)"
        />

        {/* Separator */}
        <div className="w-px h-4 bg-gray-600"></div>

        {/* Performance Indicators */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Zap size={12} className={getPerformanceColor(systemInfo.fps)} />
            <span className={getPerformanceColor(systemInfo.fps)}>
              {Math.round(systemInfo.fps)} FPS
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <HardDrive size={12} />
            <span>{Math.round(systemInfo.memoryUsage)}% RAM</span>
          </div>

          <div className="flex items-center space-x-1">
            <Cpu size={12} />
            <span>{systemInfo.renderTime.toFixed(1)}ms</span>
          </div>
        </div>
      </div>

      {/* Right Section - System Info */}
      <div className="flex items-center space-x-4">
        {/* Object Count */}
        <div className="flex items-center space-x-1">
          <Eye size={12} />
          <span>{systemInfo.objectCount} objects</span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-1">
          <Wifi size={12} className={isOnline ? 'text-green-400' : 'text-red-400'} />
          <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Current Time */}
        <div className="flex items-center space-x-1">
          <Clock size={12} />
          <span>{formatTime(currentTime)}</span>
        </div>

        {/* Zoom Level */}
        <div className="flex items-center space-x-1">
          <span>Zoom: 100%</span>
        </div>
      </div>
    </div>
  );
}
