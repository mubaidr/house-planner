import {
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Layers,
  Lock,
  Palette,
  Plus,
  Search,
  Settings,
  Unlock,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface LayerManagerProps {
  theme: 'light' | 'dark' | 'classic';
}

interface Layer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
  current: boolean;
  lineType: 'solid' | 'dashed' | 'dotted' | 'dashdot';
  lineWeight: number;
  transparency: number;
  objectCount: number;
  description?: string;
  parent?: string;
}

const defaultLayers: Layer[] = [
  {
    id: '0',
    name: '0',
    color: '#ffffff',
    visible: true,
    locked: false,
    current: true,
    lineType: 'solid',
    lineWeight: 0.25,
    transparency: 0,
    objectCount: 0,
    description: 'Default layer',
  },
  {
    id: 'walls',
    name: 'Walls',
    color: '#ff0000',
    visible: true,
    locked: false,
    current: false,
    lineType: 'solid',
    lineWeight: 0.5,
    transparency: 0,
    objectCount: 12,
    description: 'Architectural walls',
  },
  {
    id: 'doors',
    name: 'Doors',
    color: '#00ff00',
    visible: true,
    locked: false,
    current: false,
    lineType: 'solid',
    lineWeight: 0.25,
    transparency: 0,
    objectCount: 5,
    description: 'Door openings',
  },
  {
    id: 'windows',
    name: 'Windows',
    color: '#0000ff',
    visible: true,
    locked: false,
    current: false,
    lineType: 'solid',
    lineWeight: 0.25,
    transparency: 0,
    objectCount: 8,
    description: 'Window openings',
  },
  {
    id: 'dimensions',
    name: 'Dimensions',
    color: '#ffff00',
    visible: true,
    locked: false,
    current: false,
    lineType: 'solid',
    lineWeight: 0.18,
    transparency: 0,
    objectCount: 15,
    description: 'Dimension annotations',
  },
  {
    id: 'text',
    name: 'Text',
    color: '#ff00ff',
    visible: true,
    locked: false,
    current: false,
    lineType: 'solid',
    lineWeight: 0.18,
    transparency: 0,
    objectCount: 3,
    description: 'Text annotations',
  },
  {
    id: 'furniture',
    name: 'Furniture',
    color: '#00ffff',
    visible: true,
    locked: false,
    current: false,
    lineType: 'solid',
    lineWeight: 0.25,
    transparency: 20,
    objectCount: 7,
    description: 'Furniture and fixtures',
  },
];

export function LayerManager({ theme }: LayerManagerProps) {
  const [layers, setLayers] = useState<Layer[]>(defaultLayers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLayerProperties, setShowLayerProperties] = useState<string | null>(null);

  const filteredLayers = layers.filter(
    layer =>
      layer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      layer.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLayerVisibility = useCallback((layerId: string) => {
    setLayers(prev =>
      prev.map(layer => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer))
    );
  }, []);

  const toggleLayerLock = useCallback((layerId: string) => {
    setLayers(prev =>
      prev.map(layer => (layer.id === layerId ? { ...layer, locked: !layer.locked } : layer))
    );
  }, []);

  const setCurrentLayer = useCallback((layerId: string) => {
    setLayers(prev =>
      prev.map(layer => ({
        ...layer,
        current: layer.id === layerId,
      }))
    );
  }, []);

  const addNewLayer = useCallback(() => {
    const newLayer: Layer = {
      id: `layer_${Date.now()}`,
      name: `Layer ${layers.length}`,
      color: '#808080',
      visible: true,
      locked: false,
      current: false,
      lineType: 'solid',
      lineWeight: 0.25,
      transparency: 0,
      objectCount: 0,
      description: 'New layer',
    };
    setLayers(prev => [...prev, newLayer]);
  }, [layers.length]);

  const deleteLayer = useCallback((layerId: string) => {
    if (layerId === '0') return; // Can't delete layer 0
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
  }, []);

  const duplicateLayer = useCallback(
    (layerId: string) => {
      const sourceLayer = layers.find(l => l.id === layerId);
      if (!sourceLayer) return;

      const newLayer: Layer = {
        ...sourceLayer,
        id: `${layerId}_copy_${Date.now()}`,
        name: `${sourceLayer.name} Copy`,
        current: false,
        objectCount: 0,
      };
      setLayers(prev => [...prev, newLayer]);
    },
    [layers]
  );

  const updateLayerProperty = useCallback((layerId: string, property: keyof Layer, value: any) => {
    setLayers(prev =>
      prev.map(layer => (layer.id === layerId ? { ...layer, [property]: value } : layer))
    );
  }, []);

  const selectAllVisible = useCallback(() => {
    const visibleLayerIds = layers.filter(l => l.visible).map(l => l.id);
    setSelectedLayers(visibleLayerIds);
  }, [layers]);

  const hideSelected = useCallback(() => {
    setLayers(prev =>
      prev.map(layer => (selectedLayers.includes(layer.id) ? { ...layer, visible: false } : layer))
    );
    setSelectedLayers([]);
  }, [selectedLayers]);

  const lockSelected = useCallback(() => {
    setLayers(prev =>
      prev.map(layer => (selectedLayers.includes(layer.id) ? { ...layer, locked: true } : layer))
    );
    setSelectedLayers([]);
  }, [selectedLayers]);

  const getLineTypeDisplay = (lineType: string) => {
    switch (lineType) {
      case 'dashed':
        return '- - - -';
      case 'dotted':
        return '• • • •';
      case 'dashdot':
        return '- • - •';
      default:
        return '————';
    }
  };

  const LayerRow = ({ layer }: { layer: Layer }) => (
    <div
      className={`flex items-center p-2 hover:bg-gray-700 border-l-2 ${
        layer.current ? 'border-blue-500 bg-blue-900/20' : 'border-transparent'
      } ${selectedLayers.includes(layer.id) ? 'bg-gray-700' : ''}`}
    >
      {/* Selection Checkbox */}
      <input
        type="checkbox"
        checked={selectedLayers.includes(layer.id)}
        onChange={e => {
          if (e.target.checked) {
            setSelectedLayers(prev => [...prev, layer.id]);
          } else {
            setSelectedLayers(prev => prev.filter(id => id !== layer.id));
          }
        }}
        className="mr-2"
      />

      {/* Layer Color */}
      <div
        className="w-4 h-4 rounded border border-gray-500 mr-2 cursor-pointer"
        style={{ backgroundColor: layer.color }}
        onClick={() => {
          // Color picker would open here
          console.log('Open color picker for layer', layer.id);
        }}
        title="Click to change color"
      />

      {/* Layer Name */}
      <div
        className="flex-1 cursor-pointer"
        onClick={() => setCurrentLayer(layer.id)}
        title={layer.description}
      >
        <div className="font-medium text-sm">{layer.name}</div>
        <div className="text-xs text-gray-400">
          {layer.objectCount} objects • {getLineTypeDisplay(layer.lineType)}
        </div>
      </div>

      {/* Transparency */}
      {layer.transparency > 0 && (
        <div className="text-xs text-gray-400 mr-2">{layer.transparency}%</div>
      )}

      {/* Visibility Toggle */}
      <button
        onClick={() => toggleLayerVisibility(layer.id)}
        className="p-1 hover:bg-gray-600 rounded mr-1"
        title={layer.visible ? 'Hide layer' : 'Show layer'}
      >
        {layer.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-gray-500" />}
      </button>

      {/* Lock Toggle */}
      <button
        onClick={() => toggleLayerLock(layer.id)}
        className="p-1 hover:bg-gray-600 rounded mr-1"
        title={layer.locked ? 'Unlock layer' : 'Lock layer'}
      >
        {layer.locked ? <Lock size={14} className="text-red-400" /> : <Unlock size={14} />}
      </button>

      {/* Layer Properties */}
      <button
        onClick={() => setShowLayerProperties(showLayerProperties === layer.id ? null : layer.id)}
        className="p-1 hover:bg-gray-600 rounded"
        title="Layer properties"
      >
        <Settings size={14} />
      </button>
    </div>
  );

  return (
    <div
      className={`h-full flex flex-col ${
        theme === 'dark' ? 'bg-gray-900' : theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <Layers size={16} className="text-blue-400" />
          <span className="font-semibold text-sm">Layers</span>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={addNewLayer} className="p-1 hover:bg-gray-700 rounded" title="New layer">
            <Plus size={14} />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded" title="Layer settings">
            <Settings size={14} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Search */}
          <div className="p-2 border-b border-gray-600">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search layers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedLayers.length > 0 && (
            <div className="p-2 border-b border-gray-600 bg-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{selectedLayers.length} selected</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={hideSelected}
                    className="p-1 hover:bg-gray-700 rounded text-xs"
                    title="Hide selected"
                  >
                    <EyeOff size={12} />
                  </button>
                  <button
                    onClick={lockSelected}
                    className="p-1 hover:bg-gray-700 rounded text-xs"
                    title="Lock selected"
                  >
                    <Lock size={12} />
                  </button>
                  <button
                    onClick={() => setSelectedLayers([])}
                    className="p-1 hover:bg-gray-700 rounded text-xs"
                    title="Clear selection"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Layer List */}
          <div className="flex-1 overflow-y-auto">
            {filteredLayers.map(layer => (
              <LayerRow key={layer.id} layer={layer} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-600 p-2">
            <div className="flex items-center justify-between text-xs">
              <button onClick={selectAllVisible} className="hover:text-blue-400">
                Select All Visible
              </button>
              <div className="flex items-center space-x-2">
                <button className="hover:text-blue-400" title="Export layers">
                  <Download size={12} />
                </button>
                <button className="hover:text-blue-400" title="Layer states">
                  <Palette size={12} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
