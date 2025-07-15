/**
 * Roof Pitch Properties Panel
 * 
 * Provides UI controls for roof pitch calculations and management
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  RoofPitchData,
  RoofPitchCategory,
  RoofPitchCalculator
} from '@/utils/roofPitchCalculations';
import { RoofWallConnection2D } from '@/utils/roofWallIntegration2D';

interface RoofPitchPropertiesPanelProps {
  connections: RoofWallConnection2D[];
  selectedConnection?: RoofWallConnection2D;
  onPitchUpdate?: (connectionId: string, newPitch: number) => void;
  onConnectionSelect?: (connection: RoofWallConnection2D) => void;
  pitchCalculator?: RoofPitchCalculator;
}

export default function RoofPitchPropertiesPanel({
  connections,
  selectedConnection,
  onPitchUpdate,
  onConnectionSelect,
  pitchCalculator
}: RoofPitchPropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    calculator: true,
    connections: true,
    geometry: false,
    recommendations: false
  });

  const [pitchInput, setPitchInput] = useState('30');
  const [pitchUnit, setPitchUnit] = useState<'degrees' | 'ratio' | 'percent'>('degrees');
  const [calculatedData, setCalculatedData] = useState<RoofPitchData | null>(null);
  const [roofType, setRoofType] = useState('gable');
  const [climate, setClimate] = useState<'snow' | 'rain' | 'dry'>('rain');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate pitch data when input changes
  useEffect(() => {
    if (pitchCalculator && pitchInput) {
      try {
        const pitch = parseFloat(pitchInput);
        if (!isNaN(pitch)) {
          // Convert to degrees if needed
          const pitchInDegrees = pitchCalculator.convertPitch(pitch, pitchUnit, 'degrees');
          
          // Calculate for a standard 12-unit run
          const rise = Math.tan(pitchInDegrees * (Math.PI / 180)) * 12;
          const data = pitchCalculator.calculatePitchFromRiseRun(rise, 12);
          setCalculatedData(data);
        }
      } catch (error) {
        console.warn('Error calculating pitch:', error);
        setCalculatedData(null);
      }
    }
  }, [pitchInput, pitchUnit, pitchCalculator]);

  const handlePitchChange = (value: string) => {
    setPitchInput(value);
  };

  const handleApplyPitch = () => {
    if (selectedConnection && onPitchUpdate && calculatedData) {
      onPitchUpdate(selectedConnection.id, calculatedData.pitch);
    }
  };

  const getPitchCategoryColor = (category: RoofPitchCategory): string => {
    switch (category) {
      case 'flat': return 'text-gray-600';
      case 'low': return 'text-blue-600';
      case 'conventional': return 'text-green-600';
      case 'steep': return 'text-orange-600';
      case 'very_steep': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionsWithPitch = () => {
    return connections.filter(conn => conn.pitchData);
  };

  const connectionsWithPitch = getConnectionsWithPitch();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Roof Pitch Calculator</h3>
        <p className="text-sm text-gray-500 mt-1">
          Calculate and manage roof pitches for connections
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Pitch Calculator */}
        <div>
          <button
            onClick={() => toggleSection('calculator')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Pitch Calculator</h4>
            <span className="text-gray-400">
              {expandedSections.calculator ? '−' : '+'}
            </span>
          </button>
          
          {expandedSections.calculator && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pitch Value
                  </label>
                  <input
                    type="number"
                    value={pitchInput}
                    onChange={(e) => handlePitchChange(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter pitch"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={pitchUnit}
                    onChange={(e) => setPitchUnit(e.target.value as 'degrees' | 'ratio' | 'percent')}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="degrees">Degrees</option>
                    <option value="ratio">Ratio</option>
                    <option value="percent">Percent</option>
                  </select>
                </div>
              </div>

              {calculatedData && (
                <div className="bg-gray-50 rounded p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Pitch:</span>
                      <span className="ml-1 font-medium">{calculatedData.pitch.toFixed(1)}°</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Slope:</span>
                      <span className="ml-1 font-medium">{calculatedData.slope.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ratio:</span>
                      <span className="ml-1 font-medium">{calculatedData.pitchRatio}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className={`ml-1 font-medium capitalize ${getPitchCategoryColor(calculatedData.category)}`}>
                        {calculatedData.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  {selectedConnection && (
                    <button
                      onClick={handleApplyPitch}
                      className="w-full mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      Apply to Selected Connection
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Connections with Pitch Data */}
        <div>
          <button
            onClick={() => toggleSection('connections')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">
              Connections ({connectionsWithPitch.length})
            </h4>
            <span className="text-gray-400">
              {expandedSections.connections ? '−' : '+'}
            </span>
          </button>
          
          {expandedSections.connections && (
            <div className="mt-3 space-y-2">
              {connectionsWithPitch.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No connections with pitch data</p>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {connectionsWithPitch.map((connection) => (
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
                        <div>
                          <div className="font-medium text-gray-900">
                            {connection.connectionType.charAt(0).toUpperCase() + connection.connectionType.slice(1)} Connection
                          </div>
                          {connection.pitchData && (
                            <div className="text-gray-600 mt-1">
                              <div>Pitch: {connection.pitchData.pitch.toFixed(1)}° ({connection.pitchData.pitchRatio})</div>
                              <div className={`capitalize ${getPitchCategoryColor(connection.pitchData.category)}`}>
                                {connection.pitchData.category.replace('_', ' ')}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-gray-500">
                          <div>Overhang: {connection.overhang.toFixed(2)}m</div>
                          <div>Ridge: {connection.ridgeHeight.toFixed(2)}m</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Geometry Details */}
        {selectedConnection?.geometry && (
          <div>
            <button
              onClick={() => toggleSection('geometry')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="text-sm font-medium text-gray-900">Roof Geometry</h4>
              <span className="text-gray-400">
                {expandedSections.geometry ? '−' : '+'}
              </span>
            </button>
            
            {expandedSections.geometry && (
              <div className="mt-3 bg-gray-50 rounded p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Span:</span>
                    <span className="ml-1 font-medium">{selectedConnection.geometry.span.toFixed(2)}m</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rafter:</span>
                    <span className="ml-1 font-medium">{selectedConnection.geometry.rafter.toFixed(2)}m</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Roof Area:</span>
                    <span className="ml-1 font-medium">{selectedConnection.geometry.roofArea.toFixed(1)}m²</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ridge Length:</span>
                    <span className="ml-1 font-medium">{selectedConnection.geometry.ridgeLength.toFixed(2)}m</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        <div>
          <button
            onClick={() => toggleSection('recommendations')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Recommendations</h4>
            <span className="text-gray-400">
              {expandedSections.recommendations ? '−' : '+'}
            </span>
          </button>
          
          {expandedSections.recommendations && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Roof Type
                  </label>
                  <select
                    value={roofType}
                    onChange={(e) => setRoofType(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="gable">Gable</option>
                    <option value="hip">Hip</option>
                    <option value="shed">Shed</option>
                    <option value="flat">Flat</option>
                    <option value="gambrel">Gambrel</option>
                    <option value="mansard">Mansard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Climate
                  </label>
                  <select
                    value={climate}
                    onChange={(e) => setClimate(e.target.value as 'snow' | 'rain' | 'dry')}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="rain">Rain</option>
                    <option value="snow">Snow</option>
                    <option value="dry">Dry</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 rounded p-2 text-xs">
                <div className="font-medium text-blue-900 mb-1">Recommended Ranges:</div>
                <div className="text-blue-800">
                  <div>Gable: 15° - 45° (optimal: 30°)</div>
                  <div>Hip: 20° - 40° (optimal: 30°)</div>
                  <div>Shed: 10° - 30° (optimal: 20°)</div>
                  <div>Flat: 0° - 5° (optimal: 2°)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}