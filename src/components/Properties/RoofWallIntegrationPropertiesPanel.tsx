/**
 * Roof-Wall Integration Properties Panel
 * 
 * Provides UI controls for roof-wall integration configuration and connection management
 */

'use client';

import React, { useState } from 'react';
import { 
  RoofWallIntegrationConfig, 
  RoofWallConnection2D, 
  RoofWallConnectionType 
} from '@/utils/roofWallIntegration2D';
import { 
  getConnectionTypeName, 
  getConnectionTypeDescription 
} from '@/components/Canvas/RoofWallConnectionIndicators';

interface RoofWallIntegrationPropertiesPanelProps {
  configuration: RoofWallIntegrationConfig;
  connections: RoofWallConnection2D[];
  selectedConnection?: RoofWallConnection2D;
  onConfigurationChange: (config: Partial<RoofWallIntegrationConfig>) => void;
  onConnectionSelect?: (connection: RoofWallConnection2D) => void;
  isAnalyzing?: boolean;
}

export default function RoofWallIntegrationPropertiesPanel({
  configuration,
  connections,
  selectedConnection,
  onConfigurationChange,
  onConnectionSelect,
  isAnalyzing = false
}: RoofWallIntegrationPropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    overhang: false,
    rendering: false,
    connections: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleConfigChange = (updates: Partial<RoofWallIntegrationConfig>) => {
    onConfigurationChange(updates);
  };

  const handleRenderOrderChange = (orderUpdates: Partial<RoofWallIntegrationConfig['renderOrder']>) => {
    handleConfigChange({
      renderOrder: {
        ...configuration.renderOrder,
        ...orderUpdates
      }
    });
  };

  const getConnectionStats = () => {
    const stats = connections.reduce((acc, connection) => {
      acc[connection.connectionType] = (acc[connection.connectionType] || 0) + 1;
      return acc;
    }, {} as Record<RoofWallConnectionType, number>);

    return stats;
  };

  const connectionStats = getConnectionStats();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          Roof-Wall Integration
          {isAnalyzing && (
            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {connections.length} connection{connections.length !== 1 ? 's' : ''} detected
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
                  Connection Tolerance
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="1.0"
                  step="0.01"
                  value={configuration.connectionTolerance}
                  onChange={(e) => handleConfigChange({ connectionTolerance: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Distance tolerance for roof-wall connections
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Eave Height
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={configuration.eaveHeight}
                  onChange={(e) => handleConfigChange({ eaveHeight: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Standard eave height for connections
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoConnect"
                  checked={configuration.autoConnect}
                  onChange={(e) => handleConfigChange({ autoConnect: e.target.checked })}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoConnect" className="ml-2 text-xs text-gray-700">
                  Auto-connect roofs to walls
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showConnectionIndicators"
                  checked={configuration.showConnectionIndicators}
                  onChange={(e) => handleConfigChange({ showConnectionIndicators: e.target.checked })}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showConnectionIndicators" className="ml-2 text-xs text-gray-700">
                  Show connection indicators
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Overhang Settings */}
        <div>
          <button
            onClick={() => toggleSection('overhang')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Overhang Settings</h4>
            <span className="text-gray-400">
              {expandedSections.overhang ? '−' : '+'}
            </span>
          </button>
          
          {expandedSections.overhang && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Default Overhang
                </label>
                <input
                  type="number"
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={configuration.defaultOverhang}
                  onChange={(e) => handleConfigChange({ defaultOverhang: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Min Overhang
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1.0"
                    step="0.1"
                    value={configuration.minOverhang}
                    onChange={(e) => handleConfigChange({ minOverhang: parseFloat(e.target.value) })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max Overhang
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="10.0"
                    step="0.5"
                    value={configuration.maxOverhang}
                    onChange={(e) => handleConfigChange({ maxOverhang: parseFloat(e.target.value) })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rendering Settings */}
        <div>
          <button
            onClick={() => toggleSection('rendering')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Rendering Order</h4>
            <span className="text-gray-400">
              {expandedSections.rendering ? '−' : '+'}
            </span>
          </button>
          
          {expandedSections.rendering && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="wallsFirst"
                  checked={configuration.renderOrder.wallsFirst}
                  onChange={(e) => handleRenderOrderChange({ wallsFirst: e.target.checked })}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="wallsFirst" className="ml-2 text-xs text-gray-700">
                  Render walls before roofs
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Roof Priority
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="1"
                    value={configuration.renderOrder.roofPriority}
                    onChange={(e) => handleRenderOrderChange({ roofPriority: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Connection Priority
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="1"
                    value={configuration.renderOrder.connectionPriority}
                    onChange={(e) => handleRenderOrderChange({ connectionPriority: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Connections List */}
        <div>
          <button
            onClick={() => toggleSection('connections')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Detected Connections</h4>
            <span className="text-gray-400">
              {expandedSections.connections ? '−' : '+'}
            </span>
          </button>
          
          {expandedSections.connections && (
            <div className="mt-3 space-y-2">
              {/* Connection Statistics */}
              {Object.keys(connectionStats).length > 0 && (
                <div className="bg-gray-50 rounded p-2 mb-3">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Statistics</h5>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {Object.entries(connectionStats).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-gray-600">{getConnectionTypeName(type as RoofWallConnectionType)}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Connections */}
              {connections.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No connections detected</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      onClick={() => onConnectionSelect?.(connection)}
                      className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                        selectedConnection?.id === connection.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {getConnectionTypeName(connection.connectionType)}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {getConnectionTypeDescription(connection.connectionType)}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            Overhang: {connection.overhang.toFixed(2)}m
                          </div>
                        </div>
                        <div className="text-right text-gray-500 text-xs">
                          <div>Angle: {connection.angle.toFixed(1)}°</div>
                          <div>Priority: {connection.priority}</div>
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