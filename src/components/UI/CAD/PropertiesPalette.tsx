import React, { useState } from 'react';
import { 
  Settings, ChevronRight, ChevronDown, Palette, 
  Ruler, Eye, Lock, Layers, Edit3, Copy, 
  RotateCcw, Move, Scale, Trash2
} from 'lucide-react';

interface PropertiesPaletteProps {
  onCollapsePanel: () => void;
  theme: 'light' | 'dark' | 'classic';
}

interface PropertyGroup {
  id: string;
  name: string;
  icon: React.ReactNode;
  expanded: boolean;
  properties: Property[];
}

interface Property {
  id: string;
  name: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'color' | 'select' | 'range';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  readonly?: boolean;
}

export function PropertiesPalette({ onCollapsePanel, theme }: PropertiesPaletteProps) {
  const [selectedObject, setSelectedObject] = useState<string>('wall-001');
  const [propertyGroups, setPropertyGroups] = useState<PropertyGroup[]>([
    {
      id: 'general',
      name: 'General',
      icon: <Settings size={16} />,
      expanded: true,
      properties: [
        { id: 'name', name: 'Name', value: 'Wall-001', type: 'text' },
        { id: 'layer', name: 'Layer', value: 'Walls', type: 'select', options: ['0', 'Walls', 'Doors', 'Windows'] },
        { id: 'color', name: 'Color', value: '#ff0000', type: 'color' },
        { id: 'linetype', name: 'Line Type', value: 'Continuous', type: 'select', options: ['Continuous', 'Dashed', 'Dotted'] },
        { id: 'lineweight', name: 'Line Weight', value: 0.25, type: 'number', min: 0.1, max: 2.0, step: 0.05, unit: 'mm' }
      ]
    },
    {
      id: 'geometry',
      name: 'Geometry',
      icon: <Ruler size={16} />,
      expanded: true,
      properties: [
        { id: 'length', name: 'Length', value: 5000, type: 'number', unit: 'mm' },
        { id: 'height', name: 'Height', value: 2700, type: 'number', unit: 'mm' },
        { id: 'thickness', name: 'Thickness', value: 200, type: 'number', unit: 'mm' },
        { id: 'start-x', name: 'Start X', value: 0, type: 'number', unit: 'mm' },
        { id: 'start-y', name: 'Start Y', value: 0, type: 'number', unit: 'mm' },
        { id: 'end-x', name: 'End X', value: 5000, type: 'number', unit: 'mm' },
        { id: 'end-y', name: 'End Y', value: 0, type: 'number', unit: 'mm' }
      ]
    },
    {
      id: 'material',
      name: 'Material',
      icon: <Palette size={16} />,
      expanded: false,
      properties: [
        { id: 'material-type', name: 'Material', value: 'Brick', type: 'select', options: ['Concrete', 'Brick', 'Wood', 'Steel'] },
        { id: 'texture', name: 'Texture', value: 'brick_red.jpg', type: 'text' },
        { id: 'roughness', name: 'Roughness', value: 0.8, type: 'range', min: 0, max: 1, step: 0.1 },
        { id: 'metalness', name: 'Metalness', value: 0.0, type: 'range', min: 0, max: 1, step: 0.1 },
        { id: 'opacity', name: 'Opacity', value: 1.0, type: 'range', min: 0, max: 1, step: 0.1 }
      ]
    },
    {
      id: 'visibility',
      name: 'Visibility',
      icon: <Eye size={16} />,
      expanded: false,
      properties: [
        { id: 'visible', name: 'Visible', value: true, type: 'boolean' },
        { id: 'locked', name: 'Locked', value: false, type: 'boolean' },
        { id: 'selectable', name: 'Selectable', value: true, type: 'boolean' },
        { id: 'cast-shadow', name: 'Cast Shadow', value: true, type: 'boolean' },
        { id: 'receive-shadow', name: 'Receive Shadow', value: true, type: 'boolean' }
      ]
    }
  ]);

  const toggleGroup = (groupId: string) => {
    setPropertyGroups(prev => prev.map(group =>
      group.id === groupId ? { ...group, expanded: !group.expanded } : group
    ));
  };

  const updateProperty = (groupId: string, propertyId: string, value: any) => {
    setPropertyGroups(prev => prev.map(group =>
      group.id === groupId
        ? {
            ...group,
            properties: group.properties.map(prop =>
              prop.id === propertyId ? { ...prop, value } : prop
            )
          }
        : group
    ));
  };

  const renderProperty = (groupId: string, property: Property) => {
    const handleChange = (value: any) => {
      updateProperty(groupId, property.id, value);
    };

    return (
      <div key={property.id} className="flex items-center justify-between py-1">
        <label className="text-xs text-gray-300 w-20 flex-shrink-0">
          {property.name}:
        </label>
        <div className="flex-1 ml-2">
          {property.type === 'text' && (
            <input
              type="text"
              value={property.value as string}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded"
              readOnly={property.readonly}
            />
          )}
          
          {property.type === 'number' && (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={property.value as number}
                onChange={(e) => handleChange(parseFloat(e.target.value))}
                min={property.min}
                max={property.max}
                step={property.step}
                className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded"
                readOnly={property.readonly}
              />
              {property.unit && (
                <span className="text-xs text-gray-400">{property.unit}</span>
              )}
            </div>
          )}
          
          {property.type === 'boolean' && (
            <input
              type="checkbox"
              checked={property.value as boolean}
              onChange={(e) => handleChange(e.target.checked)}
              className="w-4 h-4"
              disabled={property.readonly}
            />
          )}
          
          {property.type === 'color' && (
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={property.value as string}
                onChange={(e) => handleChange(e.target.value)}
                className="w-8 h-6 rounded border border-gray-600"
                disabled={property.readonly}
              />
              <input
                type="text"
                value={property.value as string}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded font-mono"
                readOnly={property.readonly}
              />
            </div>
          )}
          
          {property.type === 'select' && (
            <select
              value={property.value as string}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded"
              disabled={property.readonly}
            >
              {property.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}
          
          {property.type === 'range' && (
            <div className="space-y-1">
              <input
                type="range"
                value={property.value as number}
                onChange={(e) => handleChange(parseFloat(e.target.value))}
                min={property.min}
                max={property.max}
                step={property.step}
                className="w-full"
                disabled={property.readonly}
              />
              <div className="text-xs text-gray-400 text-center">
                {property.value}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 
      theme === 'light' ? 'bg-gray-50' : 
      'bg-gray-800'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <Settings size={16} className="text-blue-400" />
          <span className="font-semibold text-sm">Properties</span>
        </div>
        <button
          onClick={onCollapsePanel}
          className="p-1 hover:bg-gray-700 rounded"
          title="Collapse panel"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Object Selection */}
      <div className="p-3 border-b border-gray-600">
        <div className="text-xs text-gray-400 mb-1">Selected Object:</div>
        <select
          value={selectedObject}
          onChange={(e) => setSelectedObject(e.target.value)}
          className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded"
        >
          <option value="wall-001">Wall-001</option>
          <option value="door-001">Door-001</option>
          <option value="window-001">Window-001</option>
          <option value="room-001">Room-001</option>
        </select>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-gray-600">
        <div className="text-xs text-gray-400 mb-2">Quick Actions:</div>
        <div className="grid grid-cols-4 gap-1">
          <button
            className="p-2 hover:bg-gray-700 rounded flex flex-col items-center"
            title="Copy"
          >
            <Copy size={14} />
            <span className="text-xs mt-1">Copy</span>
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded flex flex-col items-center"
            title="Move"
          >
            <Move size={14} />
            <span className="text-xs mt-1">Move</span>
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded flex flex-col items-center"
            title="Rotate"
          >
            <RotateCcw size={14} />
            <span className="text-xs mt-1">Rotate</span>
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded flex flex-col items-center"
            title="Delete"
          >
            <Trash2 size={14} />
            <span className="text-xs mt-1">Delete</span>
          </button>
        </div>
      </div>

      {/* Property Groups */}
      <div className="flex-1 overflow-y-auto">
        {propertyGroups.map((group) => (
          <div key={group.id} className="border-b border-gray-600">
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-2">
                {group.icon}
                <span className="text-sm font-medium">{group.name}</span>
              </div>
              {group.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {group.expanded && (
              <div className="px-3 pb-3 space-y-2">
                {group.properties.map((property) => renderProperty(group.id, property))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Property Summary */}
      <div className="border-t border-gray-600 p-3">
        <div className="text-xs text-gray-400">
          Object: {selectedObject} | Layer: Walls | Type: Wall
        </div>
      </div>
    </div>
  );
}