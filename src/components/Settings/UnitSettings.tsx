'use client';

import React from 'react';
import { useUnitStore } from '@/stores/unitStore';

export default function UnitSettings() {
  const {
    unitSystem,
    precision,
    showUnitLabels,
    displayFormat,
    setUnitSystem,
    setPrecision,
    toggleUnitLabels,
    setDisplayFormat,
  } = useUnitStore();

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Unit Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit System
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="unitSystem"
                value="metric"
                checked={unitSystem === 'metric'}
                onChange={() => setUnitSystem('metric')}
              />
              <span className="ml-2">Metric (m)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="unitSystem"
                value="imperial"
                checked={unitSystem === 'imperial'}
                onChange={() => setUnitSystem('imperial')}
              />
              <span className="ml-2">Imperial (ft)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Precision
          </label>
          <select
            value={precision}
            onChange={(e) => setPrecision(parseInt(e.target.value))}
            className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="0">0 decimal places</option>
            <option value="1">1 decimal place</option>
            <option value="2">2 decimal places</option>
            <option value="3">3 decimal places</option>
          </select>
        </div>

        {unitSystem === 'imperial' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imperial Format
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="displayFormat"
                  value="decimal"
                  checked={displayFormat === 'decimal'}
                  onChange={() => setDisplayFormat('decimal')}
                />
                <span className="ml-2">Decimal (5.5 ft)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="displayFormat"
                  value="fractional"
                  checked={displayFormat === 'fractional'}
                  onChange={() => setDisplayFormat('fractional')}
                />
                <span className="ml-2">Fractional (5' 6")</span>
              </label>
            </div>
          </div>
        )}

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={showUnitLabels}
              onChange={toggleUnitLabels}
            />
            <span className="ml-2">Show unit labels</span>
          </label>
        </div>
      </div>
    </div>
  );
}