import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Save, FolderOpen, Download, Upload, Settings, 
  Eye, Grid, Layers, Ruler, Move, RotateCcw, Copy, 
  Undo, Redo, Search, HelpCircle, User, Monitor
} from 'lucide-react';

interface MenuBarProps {
  height: number;
  onTogglePanel: (panel: string) => void;
  onResetWorkspace: () => void;
  onSaveWorkspace: () => void;
  onLoadWorkspace: () => void;
  theme: 'light' | 'dark' | 'classic';
}

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action?: () => void;
  submenu?: MenuItem[];
  separator?: boolean;
  disabled?: boolean;
}

export function MenuBar({ 
  height, 
  onTogglePanel, 
  onResetWorkspace, 
  onSaveWorkspace, 
  onLoadWorkspace, 
  theme 
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<string[]>([
    'House_Design_v1.dwg',
    'Apartment_Layout.dwg',
    'Office_Building.dwg'
  ]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fileMenu: MenuItem[] = [
    { label: 'New', icon: <FileText size={16} />, shortcut: 'Ctrl+N', action: () => console.log('New file') },
    { label: 'Open', icon: <FolderOpen size={16} />, shortcut: 'Ctrl+O', action: () => console.log('Open file') },
    { separator: true },
    { label: 'Save', icon: <Save size={16} />, shortcut: 'Ctrl+S', action: () => console.log('Save file') },
    { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: () => console.log('Save as') },
    { separator: true },
    { 
      label: 'Recent Files', 
      submenu: recentFiles.map(file => ({
        label: file,
        action: () => console.log('Open recent:', file)
      }))
    },
    { separator: true },
    { label: 'Import', icon: <Upload size={16} />, submenu: [
      { label: 'DWG/DXF...', action: () => console.log('Import DWG') },
      { label: 'IFC...', action: () => console.log('Import IFC') },
      { label: 'SketchUp...', action: () => console.log('Import SKP') },
      { label: '3D Model...', action: () => console.log('Import 3D') }
    ]},
    { label: 'Export', icon: <Download size={16} />, submenu: [
      { label: 'DWG/DXF...', action: () => console.log('Export DWG') },
      { label: 'PDF...', action: () => console.log('Export PDF') },
      { label: 'Image...', action: () => console.log('Export Image') },
      { label: '3D Model...', action: () => console.log('Export 3D') }
    ]},
    { separator: true },
    { label: 'Print', shortcut: 'Ctrl+P', action: () => console.log('Print') },
    { label: 'Print Preview', action: () => console.log('Print preview') }
  ];

  const editMenu: MenuItem[] = [
    { label: 'Undo', icon: <Undo size={16} />, shortcut: 'Ctrl+Z', action: () => console.log('Undo') },
    { label: 'Redo', icon: <Redo size={16} />, shortcut: 'Ctrl+Y', action: () => console.log('Redo') },
    { separator: true },
    { label: 'Cut', shortcut: 'Ctrl+X', action: () => console.log('Cut') },
    { label: 'Copy', icon: <Copy size={16} />, shortcut: 'Ctrl+C', action: () => console.log('Copy') },
    { label: 'Paste', shortcut: 'Ctrl+V', action: () => console.log('Paste') },
    { separator: true },
    { label: 'Select All', shortcut: 'Ctrl+A', action: () => console.log('Select all') },
    { label: 'Select Similar', action: () => console.log('Select similar') },
    { label: 'Invert Selection', action: () => console.log('Invert selection') },
    { separator: true },
    { label: 'Find', icon: <Search size={16} />, shortcut: 'Ctrl+F', action: () => console.log('Find') },
    { label: 'Replace', shortcut: 'Ctrl+H', action: () => console.log('Replace') }
  ];

  const viewMenu: MenuItem[] = [
    { label: 'Zoom Extents', shortcut: 'Ctrl+E', action: () => console.log('Zoom extents') },
    { label: 'Zoom Window', shortcut: 'Ctrl+W', action: () => console.log('Zoom window') },
    { label: 'Pan', shortcut: 'P', action: () => console.log('Pan') },
    { separator: true },
    { label: 'Top View', shortcut: 'Ctrl+1', action: () => console.log('Top view') },
    { label: 'Front View', shortcut: 'Ctrl+2', action: () => console.log('Front view') },
    { label: 'Right View', shortcut: 'Ctrl+3', action: () => console.log('Right view') },
    { label: 'Isometric', shortcut: 'Ctrl+4', action: () => console.log('Isometric') },
    { separator: true },
    { label: 'Grid', icon: <Grid size={16} />, shortcut: 'F7', action: () => console.log('Toggle grid') },
    { label: 'Snap', shortcut: 'F9', action: () => console.log('Toggle snap') },
    { label: 'Ortho', shortcut: 'F8', action: () => console.log('Toggle ortho') },
    { separator: true },
    { label: 'Layers Panel', icon: <Layers size={16} />, action: () => onTogglePanel('leftPanel') },
    { label: 'Properties Panel', action: () => onTogglePanel('rightPanel') },
    { label: 'Command Line', action: () => onTogglePanel('commandLine') }
  ];

  const drawMenu: MenuItem[] = [
    { label: 'Line', shortcut: 'L', action: () => console.log('Draw line') },
    { label: 'Rectangle', shortcut: 'REC', action: () => console.log('Draw rectangle') },
    { label: 'Circle', shortcut: 'C', action: () => console.log('Draw circle') },
    { label: 'Arc', shortcut: 'A', action: () => console.log('Draw arc') },
    { separator: true },
    { label: 'Wall', shortcut: 'W', action: () => console.log('Draw wall') },
    { label: 'Door', shortcut: 'DR', action: () => console.log('Insert door') },
    { label: 'Window', shortcut: 'WI', action: () => console.log('Insert window') },
    { label: 'Stair', shortcut: 'ST', action: () => console.log('Insert stair') },
    { separator: true },
    { label: 'Text', shortcut: 'T', action: () => console.log('Add text') },
    { label: 'Dimension', shortcut: 'DIM', action: () => console.log('Add dimension') },
    { label: 'Hatch', shortcut: 'H', action: () => console.log('Add hatch') }
  ];

  const modifyMenu: MenuItem[] = [
    { label: 'Move', icon: <Move size={16} />, shortcut: 'M', action: () => console.log('Move') },
    { label: 'Copy', icon: <Copy size={16} />, shortcut: 'CO', action: () => console.log('Copy') },
    { label: 'Rotate', icon: <RotateCcw size={16} />, shortcut: 'RO', action: () => console.log('Rotate') },
    { label: 'Scale', shortcut: 'SC', action: () => console.log('Scale') },
    { separator: true },
    { label: 'Mirror', shortcut: 'MI', action: () => console.log('Mirror') },
    { label: 'Array', shortcut: 'AR', action: () => console.log('Array') },
    { label: 'Offset', shortcut: 'O', action: () => console.log('Offset') },
    { separator: true },
    { label: 'Trim', shortcut: 'TR', action: () => console.log('Trim') },
    { label: 'Extend', shortcut: 'EX', action: () => console.log('Extend') },
    { label: 'Fillet', shortcut: 'F', action: () => console.log('Fillet') },
    { label: 'Chamfer', shortcut: 'CHA', action: () => console.log('Chamfer') }
  ];

  const toolsMenu: MenuItem[] = [
    { label: 'Measure', icon: <Ruler size={16} />, shortcut: 'DIST', action: () => console.log('Measure') },
    { label: 'Area', action: () => console.log('Calculate area') },
    { label: 'List Properties', action: () => console.log('List properties') },
    { separator: true },
    { label: 'Layer Manager', icon: <Layers size={16} />, action: () => console.log('Layer manager') },
    { label: 'Block Library', action: () => console.log('Block library') },
    { label: 'Material Library', action: () => console.log('Material library') },
    { separator: true },
    { label: 'Options', icon: <Settings size={16} />, action: () => console.log('Options') },
    { label: 'Customize', action: () => console.log('Customize') }
  ];

  const windowMenu: MenuItem[] = [
    { label: 'New Window', action: () => console.log('New window') },
    { label: 'Cascade', action: () => console.log('Cascade windows') },
    { label: 'Tile Horizontal', action: () => console.log('Tile horizontal') },
    { label: 'Tile Vertical', action: () => console.log('Tile vertical') },
    { separator: true },
    { label: 'Reset Workspace', action: onResetWorkspace },
    { label: 'Save Workspace', action: onSaveWorkspace },
    { label: 'Load Workspace', action: onLoadWorkspace }
  ];

  const helpMenu: MenuItem[] = [
    { label: 'Help Topics', icon: <HelpCircle size={16} />, shortcut: 'F1', action: () => console.log('Help') },
    { label: 'Keyboard Shortcuts', action: () => console.log('Shortcuts') },
    { label: 'Video Tutorials', action: () => console.log('Tutorials') },
    { separator: true },
    { label: 'Check for Updates', action: () => console.log('Check updates') },
    { label: 'About', action: () => console.log('About') }
  ];

  const menus = {
    file: fileMenu,
    edit: editMenu,
    view: viewMenu,
    draw: drawMenu,
    modify: modifyMenu,
    tools: toolsMenu,
    window: windowMenu,
    help: helpMenu
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.separator) {
      return <div key={index} className="border-t border-gray-600 my-1" />;
    }

    return (
      <div
        key={index}
        className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-700 ${
          item.disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => {
          if (!item.disabled && item.action) {
            item.action();
            setActiveMenu(null);
          }
        }}
      >
        <div className="flex items-center space-x-2">
          {item.icon}
          <span>{item.label}</span>
        </div>
        {item.shortcut && (
          <span className="text-xs text-gray-400">{item.shortcut}</span>
        )}
        {item.submenu && (
          <span className="text-xs">▶</span>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={menuRef}
      className={`w-full border-b border-gray-600 ${
        theme === 'dark' ? 'bg-gray-800' : 
        theme === 'light' ? 'bg-gray-100' : 
        'bg-gray-700'
      }`}
      style={{ height }}
    >
      <div className="flex items-center h-full px-2">
        {/* Application Logo/Title */}
        <div className="flex items-center space-x-2 mr-4">
          <Monitor size={16} className="text-blue-400" />
          <span className="font-semibold text-sm">CAD Designer</span>
        </div>

        {/* Menu Items */}
        <div className="flex items-center space-x-1">
          {Object.entries(menus).map(([key, menu]) => (
            <div key={key} className="relative">
              <button
                className={`px-3 py-1 text-sm rounded hover:bg-gray-700 ${
                  activeMenu === key ? 'bg-gray-700' : ''
                }`}
                onClick={() => setActiveMenu(activeMenu === key ? null : key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>

              {/* Dropdown Menu */}
              {activeMenu === key && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {menu.map((item, index) => renderMenuItem(item, index))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Side Items */}
        <div className="ml-auto flex items-center space-x-2">
          <button className="p-1 hover:bg-gray-700 rounded" title="User Account">
            <User size={16} />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded" title="Settings">
            <Settings size={16} />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded" title="Help">
            <HelpCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}