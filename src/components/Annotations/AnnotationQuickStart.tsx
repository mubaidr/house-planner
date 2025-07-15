/**
 * Annotation Quick Start Guide
 * 
 * Practical guide for using the Enhanced Annotation Toolbar
 * in real drawing scenarios with step-by-step workflows
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Ruler, 
  Type, 
  Square, 
  Tag, 
  Settings,
  Eye,
  Download,
  Palette,
  MousePointer2,
  Keyboard,
  Zap,
  Target,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface ToolGuide {
  tool: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  quickSteps: string[];
  proTips: string[];
  shortcuts: { key: string; action: string }[];
  examples: string[];
}

const toolGuides: ToolGuide[] = [
  {
    tool: 'Dimensions',
    icon: <Ruler className="w-5 h-5" />,
    color: 'blue',
    description: 'Add precise measurements with professional formatting',
    quickSteps: [
      'Click the Dimension Tool (📏) in the Enhanced Annotation Toolbar',
      'Select dimension style: Architectural, Engineering, Metric, or Imperial',
      'Click first measurement point (walls, corners, openings)',
      'Click second measurement point to complete dimension',
      'Adjust offset distance and precision in settings panel'
    ],
    proTips: [
      'Dimensions automatically snap to wall endpoints and intersections',
      'Use Architectural style for residential plans (feet/inches)',
      'Use Metric style for technical drawings (mm precision)',
      'Chain multiple dimensions for continuous measurements',
      'Auto-generate all room dimensions with Ctrl+D'
    ],
    shortcuts: [
      { key: 'D', action: 'Activate dimension tool' },
      { key: 'Ctrl+D', action: 'Auto-generate all dimensions' },
      { key: 'Esc', action: 'Cancel current dimension' },
      { key: 'Shift+D', action: 'Toggle dimension visibility' }
    ],
    examples: [
      'Room width: 4.2m automatically formatted',
      'Wall height: 8\'-6" in architectural style',
      'Door opening: 900mm in metric style',
      'Continuous wall dimensions: 2.1m + 3.5m + 1.8m = 7.4m'
    ]
  },
  {
    tool: 'Text Annotations',
    icon: <Type className="w-5 h-5" />,
    color: 'green',
    description: 'Add notes, specifications, and callouts with leader lines',
    quickSteps: [
      'Click the Text Annotation Tool (T) in the toolbar',
      'Choose annotation type: Note, Specification, Material, or Warning',
      'Click where you want to place the text annotation',
      'Type your text in the dialog that appears',
      'Optionally add leader line by clicking target point',
      'Customize font, color, and background in settings'
    ],
    proTips: [
      'Use Notes for general comments and observations',
      'Use Specifications for technical requirements and codes',
      'Use Warnings for important safety or structural notes',
      'Leader lines automatically route around obstacles',
      'Group related annotations by color coding'
    ],
    shortcuts: [
      { key: 'T', action: 'Activate text annotation tool' },
      { key: 'Enter', action: 'Confirm text entry' },
      { key: 'Tab', action: 'Switch annotation types' },
      { key: 'Ctrl+T', action: 'Add quick note at cursor' }
    ],
    examples: [
      'Room labels: "Master Bedroom - 15.2 m²"',
      'Code notes: "Min. ceiling height 2.4m (Building Code)"',
      'Material specs: "Hardwood flooring, Oak, 3/4" thick"',
      'Safety warnings: "⚠️ Load-bearing wall - Do not modify"'
    ]
  },
  {
    tool: 'Area Calculations',
    icon: <Square className="w-5 h-5" />,
    color: 'purple',
    description: 'Calculate and display room areas and perimeters automatically',
    quickSteps: [
      'Click the Area Calculation Tool (📐) in the toolbar',
      'For rooms: Use "Calculate Room Areas" for automatic detection',
      'For custom areas: Click points to define boundary polygon',
      'Choose units: square meters, square feet, or centimeters',
      'Toggle calculation display on/off as needed',
      'Areas update automatically when walls are modified'
    ],
    proTips: [
      'Room areas are calculated from wall boundaries automatically',
      'Manual areas can be any polygon shape for custom zones',
      'Areas update in real-time when walls are moved or resized',
      'Use different colors for different room types or zones',
      'Include or exclude built-in furniture from calculations'
    ],
    shortcuts: [
      { key: 'A', action: 'Activate area calculation tool' },
      { key: 'Ctrl+A', action: 'Auto-calculate all room areas' },
      { key: 'Shift+A', action: 'Toggle area visibility' },
      { key: 'Alt+A', action: 'Recalculate selected area' }
    ],
    examples: [
      'Living Room: 24.5 m² (Perimeter: 20.2m)',
      'Kitchen: 180 sq ft (Perimeter: 54 ft)',
      'Total Floor Area: 1,250 sq ft',
      'Outdoor Deck: 15.8 m² (Custom polygon)'
    ]
  },
  {
    tool: 'Material Callouts',
    icon: <Tag className="w-5 h-5" />,
    color: 'orange',
    description: 'Add professional material specifications and quantities',
    quickSteps: [
      'Click the Material Callout Tool (🏷️) in the toolbar',
      'Click on any element that has a material assigned',
      'The callout shows material name and specifications automatically',
      'Use "Auto-Generate Callouts" for all elements at once',
      'Edit quantities and units in the callout properties',
      'Choose callout style: Bubble, Box, or Minimal'
    ],
    proTips: [
      'Assign materials to elements first in the Properties Panel',
      'Callouts automatically show material specifications and properties',
      'Quantities can be calculated automatically for walls and surfaces',
      'Group similar materials to reduce visual clutter',
      'Use leader lines to point to specific material applications'
    ],
    shortcuts: [
      { key: 'M', action: 'Activate material callout tool' },
      { key: 'Ctrl+M', action: 'Auto-generate all material callouts' },
      { key: 'Shift+M', action: 'Toggle callout visibility' },
      { key: 'Alt+M', action: 'Edit selected callout' }
    ],
    examples: [
      'Hardwood Flooring: Oak, 3/4" thick, Grade A (45 m²)',
      'Interior Paint: Eggshell finish, Low-VOC (120 m²)',
      'Ceramic Tile: 12"×12", Non-slip, Bathroom grade (8.5 m²)',
      'Insulation: R-20 Fiberglass batts (85 m²)'
    ]
  }
];

const AnnotationQuickStart: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string>('Dimensions');

  const currentGuide = toolGuides.find(guide => guide.tool === selectedTool);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Professional Annotation Quick Start
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Master the Enhanced Annotation Toolbar to add dimensions, text, areas, and materials 
          to your architectural drawings with professional precision.
        </p>
        
        {/* Toolbar Preview */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="outline" className="bg-blue-50">
                <Ruler className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-3 h-3" />
              </Button>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="outline">
                <Type className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-3 h-3" />
              </Button>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="outline">
                <Square className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-3 h-3" />
              </Button>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="outline">
                <Tag className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-3 h-3" />
              </Button>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Palette className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {toolGuides.map((guide) => (
          <Card 
            key={guide.tool}
            className={`cursor-pointer transition-all ${
              selectedTool === guide.tool 
                ? `ring-2 ring-${guide.color}-500 ${getColorClasses(guide.color)}` 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedTool(guide.tool)}
          >
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                {guide.icon}
              </div>
              <h3 className="font-medium">{guide.tool}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Tool Guide */}
      {currentGuide && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Guide */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {currentGuide.icon}
                  <div>
                    <CardTitle>{currentGuide.tool} Tool</CardTitle>
                    <CardDescription>{currentGuide.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Steps */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Quick Steps
                  </h3>
                  <div className="space-y-3">
                    {currentGuide.quickSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Badge variant="outline" className="mt-0.5">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm">{step}</p>
                        </div>
                        {index < currentGuide.quickSteps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Pro Tips
                  </h3>
                  <div className="space-y-2">
                    {currentGuide.proTips.map((tip, index) => (
                      <Alert key={index} className={getColorClasses(currentGuide.color)}>
                        <CheckCircle2 className="w-4 h-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>

                {/* Examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Real Examples</h3>
                  <div className="grid gap-3">
                    {currentGuide.examples.map((example, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                        <code className="text-sm font-mono">{example}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Keyboard Shortcuts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Keyboard className="w-4 h-4 mr-2" />
                  Keyboard Shortcuts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentGuide.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.action}</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" className="w-full justify-start">
                  <MousePointer2 className="w-4 h-4 mr-2" />
                  Activate {currentGuide.tool} Tool
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Open Settings Panel
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-Generate All
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Toggle Visibility
                </Button>
              </CardContent>
            </Card>

            {/* Common Workflows */}
            <Card>
              <CardHeader>
                <CardTitle>Common Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">For Floor Plans:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Add room dimensions</li>
                      <li>• Calculate room areas</li>
                      <li>• Label rooms and spaces</li>
                      <li>• Add material callouts</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">For Elevations:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Add height dimensions</li>
                      <li>• Note material finishes</li>
                      <li>• Add specification callouts</li>
                      <li>• Include code requirements</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Global Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Keyboard className="w-5 h-5 mr-2" />
            Global Annotation Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Tool Activation</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Dimension Tool</span>
                  <Badge variant="secondary" className="font-mono">D</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Text Tool</span>
                  <Badge variant="secondary" className="font-mono">T</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Area Tool</span>
                  <Badge variant="secondary" className="font-mono">A</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Material Tool</span>
                  <Badge variant="secondary" className="font-mono">M</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Auto-Generation</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>All Dimensions</span>
                  <Badge variant="secondary" className="font-mono">Ctrl+D</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Room Areas</span>
                  <Badge variant="secondary" className="font-mono">Ctrl+A</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Material Callouts</span>
                  <Badge variant="secondary" className="font-mono">Ctrl+M</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Visibility</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Toggle Dimensions</span>
                  <Badge variant="secondary" className="font-mono">Shift+D</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Toggle Areas</span>
                  <Badge variant="secondary" className="font-mono">Shift+A</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Toggle All</span>
                  <Badge variant="secondary" className="font-mono">Shift+V</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Export/Import</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Export Annotations</span>
                  <Badge variant="secondary" className="font-mono">Ctrl+E</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Clear All</span>
                  <Badge variant="secondary" className="font-mono">Ctrl+Del</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotationQuickStart;