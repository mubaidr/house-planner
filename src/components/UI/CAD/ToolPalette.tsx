import { useDesignStore } from '@/stores/designStore';
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  CornerDownRight,
  DoorOpen,
  Eye,
  FlipHorizontal,
  Grid,
  Hand,
  Home,
  Layers,
  Maximize,
  Minus,
  Mountain,
  MousePointer,
  Move,
  Palette,
  RectangleHorizontal,
  RotateCcw,
  Ruler,
  Scale,
  Scissors,
  Settings,
  Spline,
  Square,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface ToolPaletteProps {
  onCollapsePanel: () => void;
  theme: 'light' | 'dark' | 'classic';
}

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: 'draw' | 'modify' | 'view' | 'select' | 'measure' | 'layer';
  description: string;
  action: () => void;
  isActive?: boolean;
  hasSubmenu?: boolean;
  submenu?: Tool[];
}

export function ToolPalette({ onCollapsePanel, theme }: ToolPaletteProps) {
  const [activeCategory, setActiveCategory] = useState<string>('draw');
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);

  const setActiveTool = useDesignStore(state => state.setActiveTool);
  const activeToolFromStore = useDesignStore(state => state.activeTool);

  const handleToolSelect = useCallback((toolId: string, action: () => void) => {
    action();
  }, []);

  const drawTools: Tool[] = [
    {
      id: 'line',
      name: 'Line',
      icon: <Minus size={18} />,
      shortcut: 'L',
      category: 'draw',
      description: 'Draw a line between two points',
      action: () => setActiveTool('wall'), // Using wall tool for line drawing
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      icon: <Square size={18} />,
      shortcut: 'REC',
      category: 'draw',
      description: 'Draw a rectangle',
      action: () => setActiveTool('wall'), // Using wall tool for rectangle drawing
    },
    {
      id: 'circle',
      name: 'Circle',
      icon: <Circle size={18} />,
      shortcut: 'C',
      category: 'draw',
      description: 'Draw a circle',
      action: () => setActiveTool('wall'), // Placeholder - circle tool not implemented
    },
    {
      id: 'arc',
      name: 'Arc',
      icon: <Spline size={18} />,
      shortcut: 'A',
      category: 'draw',
      description: 'Draw an arc',
      action: () => setActiveTool('wall'), // Placeholder - arc tool not implemented
    },
    {
      id: 'wall',
      name: 'Wall',
      icon: <Home size={18} />,
      shortcut: 'W',
      category: 'draw',
      description: 'Draw architectural walls',
      action: () => setActiveTool('wall'),
      hasSubmenu: true,
      submenu: [
        {
          id: 'wall-straight',
          name: 'Straight Wall',
          icon: <Minus size={16} />,
          category: 'draw',
          description: 'Draw straight wall segments',
          action: () => setActiveTool('wall'),
        },
        {
          id: 'wall-curved',
          name: 'Curved Wall',
          icon: <Spline size={16} />,
          category: 'draw',
          description: 'Draw curved wall segments',
          action: () => setActiveTool('wall'), // Placeholder - curved walls not implemented
        },
      ],
    },
    {
      id: 'door',
      name: 'Door',
      icon: <DoorOpen size={18} />,
      shortcut: 'DR',
      category: 'draw',
      description: 'Insert doors',
      action: () => setActiveTool('add-door'),
      hasSubmenu: true,
      submenu: [
        {
          id: 'door-single',
          name: 'Single Door',
          icon: <DoorOpen size={16} />,
          category: 'draw',
          description: 'Single swing door',
          action: () => setActiveTool('add-door'),
        },
        {
          id: 'door-double',
          name: 'Double Door',
          icon: <DoorOpen size={16} />,
          category: 'draw',
          description: 'Double swing door',
          action: () => setActiveTool('add-door'), // Placeholder - double doors not implemented
        },
        {
          id: 'door-sliding',
          name: 'Sliding Door',
          icon: <RectangleHorizontal size={16} />,
          category: 'draw',
          description: 'Sliding door',
          action: () => setActiveTool('add-door'), // Placeholder - sliding doors not implemented
        },
      ],
    },
    {
      id: 'window',
      name: 'Window',
      icon: <RectangleHorizontal size={18} />,
      shortcut: 'WI',
      category: 'draw',
      description: 'Insert windows',
      action: () => setActiveTool('add-window'),
    },
    {
      id: 'stair',
      name: 'Stair',
      icon: <Mountain size={18} />,
      shortcut: 'ST',
      category: 'draw',
      description: 'Insert stairs',
      action: () => setActiveTool('wall'), // Placeholder - stair tool not implemented
    },
  ];

  const modifyTools: Tool[] = [
    {
      id: 'move',
      name: 'Move',
      icon: <Move size={18} />,
      shortcut: 'M',
      category: 'modify',
      description: 'Move selected objects',
      action: () => setActiveTool('select'), // Placeholder - move tool not implemented
    },
    {
      id: 'copy',
      name: 'Copy',
      icon: <Copy size={18} />,
      shortcut: 'CO',
      category: 'modify',
      description: 'Copy selected objects',
      action: () => setActiveTool('copy'),
    },
    {
      id: 'rotate',
      name: 'Rotate',
      icon: <RotateCcw size={18} />,
      shortcut: 'RO',
      category: 'modify',
      description: 'Rotate selected objects',
      action: () => setActiveTool('select'), // Placeholder - rotate tool not implemented
    },
    {
      id: 'scale',
      name: 'Scale',
      icon: <Scale size={18} />,
      shortcut: 'SC',
      category: 'modify',
      description: 'Scale selected objects',
      action: () => setActiveTool('select'), // Placeholder - scale tool not implemented
    },
    {
      id: 'mirror',
      name: 'Mirror',
      icon: <FlipHorizontal size={18} />,
      shortcut: 'MI',
      category: 'modify',
      description: 'Mirror selected objects',
      action: () => setActiveTool('select'), // Placeholder - mirror tool not implemented
    },
    {
      id: 'trim',
      name: 'Trim',
      icon: <Scissors size={18} />,
      shortcut: 'TR',
      category: 'modify',
      description: 'Trim objects to boundaries',
      action: () => setActiveTool('select'), // Placeholder - trim tool not implemented
    },
    {
      id: 'extend',
      name: 'Extend',
      icon: <Maximize size={18} />,
      shortcut: 'EX',
      category: 'modify',
      description: 'Extend objects to boundaries',
      action: () => setActiveTool('select'), // Placeholder - extend tool not implemented
    },
    {
      id: 'fillet',
      name: 'Fillet',
      icon: <CornerDownRight size={18} />,
      shortcut: 'F',
      category: 'modify',
      description: 'Create rounded corners',
      action: () => setActiveTool('select'), // Placeholder - fillet tool not implemented
    },
  ];

  const selectTools: Tool[] = [
    {
      id: 'select',
      name: 'Select',
      icon: <MousePointer size={18} />,
      shortcut: 'S',
      category: 'select',
      description: 'Select objects',
      action: () => setActiveTool('select'),
    },
    {
      id: 'pan',
      name: 'Pan',
      icon: <Hand size={18} />,
      shortcut: 'P',
      category: 'view',
      description: 'Pan the view',
      action: () => setActiveTool('select'), // Placeholder - pan tool not implemented
    },
  ];

  const viewTools: Tool[] = [
    {
      id: 'zoom-in',
      name: 'Zoom In',
      icon: <ZoomIn size={18} />,
      shortcut: 'Z+',
      category: 'view',
      description: 'Zoom in',
      action: () => setActiveTool('select'), // Placeholder - zoom tools not implemented
    },
    {
      id: 'zoom-out',
      name: 'Zoom Out',
      icon: <ZoomOut size={18} />,
      shortcut: 'Z-',
      category: 'view',
      description: 'Zoom out',
      action: () => setActiveTool('select'), // Placeholder - zoom tools not implemented
    },
    {
      id: 'zoom-extents',
      name: 'Zoom Extents',
      icon: <Maximize size={18} />,
      shortcut: 'ZE',
      category: 'view',
      description: 'Zoom to show all objects',
      action: () => setActiveTool('select'), // Placeholder - zoom tools not implemented
    },
  ];

  const measureTools: Tool[] = [
    {
      id: 'measure',
      name: 'Measure',
      icon: <Ruler size={18} />,
      shortcut: 'DIST',
      category: 'measure',
      description: 'Measure distance between points',
      action: () => setActiveTool('measure'),
    },
  ];

  const layerTools: Tool[] = [
    {
      id: 'layer-visible',
      name: 'Show/Hide Layer',
      icon: <Eye size={18} />,
      category: 'layer',
      description: 'Toggle layer visibility',
      action: () => setActiveTool('select'), // Placeholder - layer tools not implemented
    },
    {
      id: 'layer-manager',
      name: 'Layer Manager',
      icon: <Layers size={18} />,
      shortcut: 'LA',
      category: 'layer',
      description: 'Open layer manager',
      action: () => setActiveTool('select'), // Placeholder - layer tools not implemented
    },
  ];

  const categories = [
    { id: 'select', name: 'Select', tools: selectTools, icon: <MousePointer size={16} /> },
    { id: 'draw', name: 'Draw', tools: drawTools, icon: <Minus size={16} /> },
    { id: 'modify', name: 'Modify', tools: modifyTools, icon: <Move size={16} /> },
    { id: 'view', name: 'View', tools: viewTools, icon: <Eye size={16} /> },
    { id: 'measure', name: 'Measure', tools: measureTools, icon: <Ruler size={16} /> },
    { id: 'layer', name: 'Layers', tools: layerTools, icon: <Layers size={16} /> },
  ];

  const renderTool = (tool: Tool) => (
    <div key={tool.id} className="relative">
      <button
        aria-pressed={activeToolFromStore === tool.id}
        aria-haspopup={tool.hasSubmenu ? 'true' : 'false'}
        aria-expanded={tool.hasSubmenu ? expandedSubmenu === tool.id : undefined}
        className={`w-full p-3 rounded-lg border transition-all duration-200 ${
          activeToolFromStore === tool.id
            ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
            : theme === 'dark'
              ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
              : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }`}
        onClick={() => {
          handleToolSelect(tool.id, tool.action);
          if (tool.hasSubmenu) {
            setExpandedSubmenu(expandedSubmenu === tool.id ? null : tool.id);
          }
        }}
        title={`${tool.name} ${tool.shortcut ? `(${tool.shortcut})` : ''} - ${tool.description}`}
      >
        <div className="flex flex-col items-center space-y-1">
          {tool.icon}
          <span className="text-xs font-medium">{tool.name}</span>
          {tool.shortcut && <span className="text-xs opacity-60">{tool.shortcut}</span>}
        </div>
        {tool.hasSubmenu && (
          <div className="absolute top-1 right-1">
            <ChevronRight
              size={12}
              className={`transition-transform ${expandedSubmenu === tool.id ? 'rotate-90' : ''}`}
            />
          </div>
        )}
      </button>

      {/* Submenu */}
      {tool.hasSubmenu && expandedSubmenu === tool.id && tool.submenu && (
        <div
          role="menu"
          className="absolute left-full top-0 ml-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-48"
        >
          {tool.submenu.map(subTool => (
            <button
              key={subTool.id}
              role="menuitem"
              className="w-full p-2 text-left hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg flex items-center space-x-2"
              onClick={() => {
                handleToolSelect(subTool.id, subTool.action);
                setExpandedSubmenu(null);
              }}
            >
              {subTool.icon}
              <span className="text-sm">{subTool.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const activeCategory_tools = categories.find(cat => cat.id === activeCategory)?.tools || [];

  return (
    <div
      className={`h-full flex flex-col ${
        theme === 'dark' ? 'bg-gray-900' : theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <Palette size={16} className="text-blue-400" />
          <span className="font-semibold text-sm">Tools</span>
        </div>
        <button
          onClick={onCollapsePanel}
          className="p-1 hover:bg-gray-700 rounded"
          title="Collapse panel"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Category Tabs */}
      <div role="tablist" className="flex flex-wrap gap-1 p-2 border-b border-gray-600">
        {categories.map(category => (
          <button
            key={category.id}
            role="tab"
            aria-selected={activeCategory === category.id}
            className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors ${
              activeCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setActiveCategory(category.id)}
            title={category.name}
          >
            {category.icon}
            <span className="hidden sm:inline">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">{activeCategory_tools.map(renderTool)}</div>
      </div>

      {/* Quick Settings */}
      <div className="border-t border-gray-600 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">Quick Settings</span>
          <Settings size={14} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">Grid</span>
            <button className="p-1 hover:bg-gray-700 rounded">
              <Grid size={14} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs">Snap</span>
            <button className="p-1 hover:bg-gray-700 rounded">
              <div className="w-3 h-3 border border-current rounded-sm"></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs">Ortho</span>
            <button className="p-1 hover:bg-gray-700 rounded">
              <div className="w-3 h-3 border border-current"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
