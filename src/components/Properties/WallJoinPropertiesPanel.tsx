/**
 * Wall Join Properties Panel
 * 
 * Provides UI controls for wall joining configuration and joint management
 */

'use client';

import React, { useState } from 'react';
import { WallJoinConfiguration, WallJoint2D, WallJointType } from '@/utils/wallJoining2D';
import { getJointTypeName } from '@/components/Canvas/WallJoinIndicators';

interface WallJoinPropertiesPanelProps {
  configuration: WallJoinConfiguration;
  joints: WallJoint2D[];
  selectedJoint?: WallJoint2D;
  onConfigurationChange: (config: Partial<WallJoinConfiguration>) => void;
  onJointSelect?: (joint: WallJoint2D) => void;
  isAnalyzing?: boolean;
}

export default function WallJoinPropertiesPanel({
  configuration,
  joints,
  selectedJoint,
  onConfigurationChange,
  onJointSelect,
  isAnalyzing = false
}: WallJoinPropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    style: false,
    joints: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleConfigChange = (updates: Partial<WallJoinConfiguration>) => {
    onConfigurationChange(updates);
  };

  const handleJoinStyleChange = (styleUpdates: Partial<WallJoinConfiguration['joinStyle']>) => {
    handleConfigChange({
      joinStyle: {
        ...configuration.joinStyle,
        ...styleUpdates
      }
    });
  };

  const getJointStats = () => {
    const stats = joints.reduce((acc, joint) => {
      acc[joint.type] = (acc[joint.type] || 0) + 1;
      return acc;
    }, {} as Record<WallJointType, number>);

    return stats;
  };

  const jointStats = getJointStats();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          Wall Joins
          {isAnalyzing && (
            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {joints.length} join{joints.length !== 1 ? 's' : ''} detected
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* General Settings */}
        <div>
          <button
            onClick={() => toggleSection('general')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">General Settings</h4>
            <span className="text-gray-400">
              {expandedSections.general ? '−' : '+'}
            </span>
          </button>
          
          {expandedSections.general && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tolerance
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="1.0"
                  step="0.01"
                  value={configuration.tolerance}
                  onChange={(e) => handleConfigChange({ tolerance: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Distance tolerance for joining walls
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Angle Threshold (°)
                </label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  step="1"
                  value={configuration.angleThreshold}
                  onChange={(e) => handleConfigChange({ angleThreshold: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Angle threshold for corner detection
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoJoin"
                  checked={configuration.autoJoin}
                  onChange={(e) => handleConfigChange({ autoJoin: e.target.checked })}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoJoin" className="ml-2 text-xs text-gray-700">
                  Auto-join walls
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showIndicators"
                  checked={configuration.showJoinIndicators}
                  onChange={(e) => handleConfigChange({ showJoinIndicators: e.target.checked })}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showIndicators" className="ml-2 text-xs text-gray-700">
                  Show join indicators
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Style Settings */}
        <div>
          <button
            onClick={() => toggleSection('style')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Join Style</h4>
            <span className="text-gray-400">
              {expandedSections.style ? '−' : '+'}
            </span>
          </button>
          
          {expandedSections.style && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Corner Radius
                </label>
                <input
                  type="number"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={configuration.joinStyle.cornerRadius}
                  onChange={(e) => handleJoinStyleChange({ cornerRadius: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line Cap Style
                </label>
                <select
                  value={configuration.joinStyle.lineCapStyle}
                  onChange={(e) => handleJoinStyleChange({ lineCapStyle: e.target.value as 'butt' | 'round' | 'square' })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="butt">Butt</option>
                  <option value="round">Round</option>
                  <option value="square">Square</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line Join Style
                </label>
                <select
                  value={configuration.joinStyle.lineJoinStyle}
                  onChange={(e) => handleJoinStyleChange({ lineJoinStyle: e.target.value as 'miter' | 'round' | 'bevel' })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="miter">Miter</option>
                  <option value="round">Round</option>
                  <option value="bevel">Bevel</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Joints List */}
        <div>
          <button
            onClick={() => toggleSection('joints')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Detected Joins</h4>
            <span className="text-gray-400">
              {expandedSections.joints ? '−' : '+'}
            </span>
          </button>
          
          {expandedSections.joints && (
            <div className="mt-3 space-y-2">
              {/* Joint Statistics */}
              {Object.keys(jointStats).length > 0 && (
                <div className="bg-gray-50 rounded p-2 mb-3">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Statistics</h5>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(jointStats).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-gray-600">{getJointTypeName(type as WallJointType)}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Joints */}
              {joints.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No joins detected</p>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {joints.map((joint) => (
                    <div
                      key={joint.id}
                      onClick={() => onJointSelect?.(joint)}
                      className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                        selectedJoint?.id === joint.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {getJointTypeName(joint.type)}
                          </div>
                          <div className="text-gray-500">
                            {joint.wallIds.length} wall{joint.wallIds.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right text-gray-500">
                          <div>({joint.position.x.toFixed(1)}, {joint.position.y.toFixed(1)})</div>
                          <div>{joint.angle.toFixed(1)}°</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}