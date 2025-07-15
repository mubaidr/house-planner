/**
 * Interactive Annotation Tools Demo
 * 
 * Demonstrates how to use each annotation tool with real examples
 */

import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Ruler, 
  Type, 
  Square, 
  Tag, 
  RotateCcw,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import EnhancedAnnotationRenderer2D from './EnhancedAnnotationRenderer2D';
import { useEnhancedAnnotations } from '@/hooks/useEnhancedAnnotations';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  action: () => void;
  completed: boolean;
}

import { Stage as KonvaStage } from 'konva/lib/Stage';

const AnnotationToolsDemo: React.FC = () => {
  const stageRef = useRef<KonvaStage>(null);
  const [currentTool, setCurrentTool] = useState<'dimension' | 'text' | 'area' | 'material' | null>(null);
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([]);
  const [showAnnotations, setShowAnnotations] = useState(true);
  
  // Sample room data for demo
  const sampleRoom = {
    walls: [
      { x1: 50, y1: 50, x2: 250, y2: 50 },   // Top wall
      { x1: 250, y1: 50, x2: 250, y2: 150 }, // Right wall
      { x1: 250, y1: 150, x2: 50, y2: 150 }, // Bottom wall
      { x1: 50, y1: 150, x2: 50, y2: 50 }    // Left wall
    ],
    door: { x: 125, y: 150, width: 30, height: 8 },
    window: { x: 200, y: 50, width: 40, height: 8 }
  };

  // Enhanced annotations hook
  const annotations = useEnhancedAnnotations({
    viewType: 'plan',
    floorId: 'demo-floor',
    autoGenerate: false
  });

  React.useEffect(() => {
    const initializeDemoSteps = () => {
      const steps: DemoStep[] = [
        {
          id: 'dimension-wall',
          title: 'Add Wall Dimension',
          description: 'Click the dimension tool and measure the top wall',
          action: () => {
            annotations.createDimension(
              { x: 50, y: 50 },
              { x: 250, y: 50 },
              'linear',
              {
                textOffset: -20,
                style: 'architectural',
                unit: 'm',
                precision: 2
              }
            );
            markStepCompleted('dimension-wall');
          },
          completed: false
        },
        {
          id: 'text-note',
          title: 'Add Room Label',
          description: 'Add a text annotation to label the room',
          action: () => {
            annotations.createTextAnnotation(
              { x: 150, y: 100 },
              'Living Room\n20 m²',
              {
                category: 'note',
                style: {
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#333333',
                  backgroundColor: '#ffffff',
                  borderColor: '#cccccc',
                  borderWidth: 1,
                  padding: 8,
                  alignment: 'center',
                  rotation: 0,
                  fontFamily: 'Arial'
                }
              }
            );
            markStepCompleted('text-note');
          },
          completed: false
        },
        {
          id: 'area-calculation',
          title: 'Calculate Room Area',
          description: 'Calculate and display the room area',
          action: () => {
            annotations.createAreaAnnotation(
              [
                { x: 50, y: 50 },
                { x: 250, y: 50 },
                { x: 250, y: 150 },
                { x: 50, y: 150 }
              ],
              'Living Room',
              {
                unit: 'm',
                showCalculations: true,
                style: {
                  fillColor: 'rgba(0, 123, 255, 0.1)',
                  fillOpacity: 0.2,
                  strokeColor: '#007bff',
                  strokeWidth: 2,
                  strokeDashArray: [5, 5],
                  labelStyle: {
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fontWeight: 'normal',
                    color: '#007bff',
                    backgroundColor: '#ffffff',
                    borderColor: '#007bff',
                    borderWidth: 1,
                    padding: 4,
                    alignment: 'center',
                    rotation: 0
                  }
                }
              }
            );
            markStepCompleted('area-calculation');
          },
          completed: false
        },
        {
          id: 'material-callout',
          title: 'Add Material Callout',
          description: 'Add a material specification callout',
          action: () => {
            annotations.createMaterialCallout(
              { x: 280, y: 80 },
              {
                id: 'hardwood-floor',
                name: 'Hardwood Flooring',
                specifications: ['Oak, 3/4" thick', 'Prefinished', 'Grade A'],
                category: 'flooring',
                color: '#8B4513',
                texture: 'wood-grain',
                properties: {
                  durability: 'High',
                  maintenance: 'Medium',
                  cost: 'High'
                }
              },
              {
                quantity: 20,
                unit: 'm²',
                style: {
                  bubbleColor: '#ffffff',
                  textColor: '#333333',
                  borderColor: '#8B4513',
                  borderWidth: 2,
                  fontSize: 11,
                  leaderStyle: 'straight'
                }
              }
            );
            markStepCompleted('material-callout');
          },
          completed: false
        }
      ];
      setDemoSteps(steps);
    };

    initializeDemoSteps();
  }, [annotations]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Interactive Annotation Tools Demo</h1>
        <p className="text-gray-600">
          Practice using professional annotation tools on a sample room
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Demo Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Demo Canvas</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnnotations(!showAnnotations)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {showAnnotations ? 'Hide' : 'Show'} Annotations
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportDemo}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetDemo}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <Stage width={400} height={300} ref={stageRef}>
                  <Layer>
                    {/* Sample room walls */}
                    {sampleRoom.walls.map((wall, index) => (
                      <Line
                        key={`wall-${index}`}
                        points={[wall.x1, wall.y1, wall.x2, wall.y2]}
                        stroke="#333333"
                        strokeWidth={4}
                      />
                    ))}
                    
                    {/* Door */}
                    <Rect
                      x={sampleRoom.door.x}
                      y={sampleRoom.door.y}
                      width={sampleRoom.door.width}
                      height={sampleRoom.door.height}
                      fill="#8B4513"
                      stroke="#654321"
                      strokeWidth={1}
                    />
                    <Text
                      x={sampleRoom.door.x + 5}
                      y={sampleRoom.door.y + 15}
                      text="Door"
                      fontSize={10}
                      fill="#333333"
                    />
                    
                    {/* Window */}
                    <Rect
                      x={sampleRoom.window.x}
                      y={sampleRoom.window.y}
                      width={sampleRoom.window.width}
                      height={sampleRoom.window.height}
                      fill="#87CEEB"
                      stroke="#4682B4"
                      strokeWidth={1}
                    />
                    <Text
                      x={sampleRoom.window.x + 10}
                      y={sampleRoom.window.y - 15}
                      text="Window"
                      fontSize={10}
                      fill="#333333"
                    />
                    
                    {/* Enhanced annotations */}
                    {showAnnotations && (
                      <EnhancedAnnotationRenderer2D
                        dimensions={annotations.dimensions}
                        chains={annotations.chains}
                        textAnnotations={annotations.textAnnotations}
                        areaAnnotations={annotations.areaAnnotations}
                        materialCallouts={annotations.materialCallouts}
                        viewType="plan"
                        scale={1}
                        offset={{ x: 0, y: 0 }}
                        selectedAnnotationId={annotations.selectedAnnotationId}
                        onAnnotationSelect={annotations.selectAnnotation}
                      />
                    )}
                  </Layer>
                </Stage>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Steps */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demo Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 border rounded-lg ${
                    step.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={step.completed ? 'default' : 'outline'}>
                        Step {index + 1}
                      </Badge>
                      {step.completed && (
                        <Badge variant="default" className="bg-green-500">
                          ✓ Complete
                        </Badge>
                      )}
                    </div>
                    {step.id.includes('dimension') && <Ruler className="w-4 h-4" />}
                    {step.id.includes('text') && <Type className="w-4 h-4" />}
                    {step.id.includes('area') && <Square className="w-4 h-4" />}
                    {step.id.includes('material') && <Tag className="w-4 h-4" />}
                  </div>
                  <h4 className="font-medium mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  <Button
                    size="sm"
                    onClick={step.action}
                    disabled={step.completed}
                    className="w-full"
                  >
                    {step.completed ? 'Completed' : 'Try This Step'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tool Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Current Tool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Active Tool: {currentTool || 'None'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={currentTool === 'dimension' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTool('dimension')}
                  >
                    <Ruler className="w-3 h-3 mr-1" />
                    Dimension
                  </Button>
                  <Button
                    variant={currentTool === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTool('text')}
                  >
                    <Type className="w-3 h-3 mr-1" />
                    Text
                  </Button>
                  <Button
                    variant={currentTool === 'area' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTool('area')}
                  >
                    <Square className="w-3 h-3 mr-1" />
                    Area
                  </Button>
                  <Button
                    variant={currentTool === 'material' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTool('material')}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    Material
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-medium">Demo Complete!</h3>
            <p className="text-sm text-gray-600">
              You&apos;ve learned how to use all four professional annotation tools. 
              These same tools are available in the main application for your real projects.
            </p>
            <div className="flex justify-center space-x-2 mt-4">
              <Badge variant="outline">
                {demoSteps.filter(s => s.completed).length} / {demoSteps.length} Steps Completed
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotationToolsDemo;