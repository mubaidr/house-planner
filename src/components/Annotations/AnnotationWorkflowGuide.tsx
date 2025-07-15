/**
 * Professional Annotation Workflow Guide
 * 
 * Interactive guide for using the enhanced annotation toolbar
 * to add dimensions, text, areas, and materials to drawings
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Ruler, 
  Type, 
  Square, 
  Tag, 
  MousePointer,
  ArrowRight,
  CheckCircle,
  Info,
  Lightbulb,
  Play
} from 'lucide-react';

interface AnnotationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  steps: string[];
  tips: string[];
  shortcuts?: string[];
}

const annotationWorkflows: AnnotationStep[] = [
  {
    id: 'dimensions',
    title: 'Professional Dimensions',
    description: 'Add precise measurements with architectural styling',
    icon: <Ruler className="w-5 h-5" />,
    steps: [
      'Click the Dimension Tool (📏) in the Enhanced Annotation Toolbar',
      'Choose your dimension style: Architectural, Engineering, Metric, or Imperial',
      'Click the first point you want to measure from',
      'Click the second point to complete the dimension',
      'The dimension line will appear with automatic formatting',
      'Use the settings panel to adjust offset, precision, and style'
    ],
    tips: [
      'Dimensions automatically snap to wall endpoints and corners',
      'Use Architectural style for building plans (shows feet/inches)',
      'Use Metric style for precise technical drawings',
      'Chain dimensions together for continuous measurements'
    ],
    shortcuts: ['D - Activate dimension tool', 'Esc - Cancel current dimension', 'Ctrl+D - Auto-generate all dimensions']
  },
  {
    id: 'text',
    title: 'Text Annotations',
    description: 'Add notes, specifications, and callouts with leader lines',
    icon: <Type className="w-5 h-5" />,
    steps: [
      'Click the Text Annotation Tool (T) in the toolbar',
      'Choose annotation type: Note, Specification, Material, or Warning',
      'Click where you want to place the text',
      'Type your annotation text in the popup dialog',
      'Optionally add a leader line by clicking the target point',
      'Adjust font size, color, and background in settings'
    ],
    tips: [
      'Use Notes for general comments and observations',
      'Use Specifications for technical requirements',
      'Use Warnings for important safety or code information',
      'Leader lines automatically route around obstacles'
    ],
    shortcuts: ['T - Activate text tool', 'Enter - Confirm text entry', 'Tab - Switch annotation types']
  },
  {
    id: 'areas',
    title: 'Area Calculations',
    description: 'Calculate and display room areas and perimeters automatically',
    icon: <Square className="w-5 h-5" />,
    steps: [
      'Click the Area Calculation Tool (📐) in the toolbar',
      'For manual areas: Click points to define the boundary',
      'For room areas: Use "Calculate Room Areas" button',
      'The area and perimeter will be calculated automatically',
      'Choose units: square meters, square feet, or square centimeters',
      'Toggle calculation display on/off as needed'
    ],
    tips: [
      'Room areas are calculated from wall boundaries automatically',
      'Manual areas can be any polygon shape',
      'Areas update automatically when walls are moved',
      'Use different colors for different room types'
    ],
    shortcuts: ['A - Activate area tool', 'Ctrl+A - Auto-calculate all rooms', 'Shift+A - Toggle area visibility']
  },
  {
    id: 'materials',
    title: 'Material Callouts',
    description: 'Add professional material specifications and quantities',
    icon: <Tag className="w-5 h-5" />,
    steps: [
      'Click the Material Callout Tool (🏷️) in the toolbar',
      'Click on an element that has a material assigned',
      'The material callout will show name and specifications',
      'Use "Auto-Generate Callouts" for all elements at once',
      'Edit quantities and units in the callout properties',
      'Choose callout style: Bubble, Box, or Minimal'
    ],
    tips: [
      'Assign materials to elements first in the Properties Panel',
      'Callouts automatically show material specifications',
      'Quantities can be calculated automatically for walls',
      'Group similar materials to reduce clutter'
    ],
    shortcuts: ['M - Activate material tool', 'Ctrl+M - Auto-generate all callouts', 'Shift+M - Toggle callout visibility']
  }
];

const AnnotationWorkflowGuide: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState('dimensions');
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Professional Annotation Guide</h1>
        <p className="text-lg text-gray-600">
          Learn to add dimensions, text, areas, and materials to your drawings
        </p>
      </div>

      <Tabs value={activeWorkflow} onValueChange={setActiveWorkflow} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {annotationWorkflows.map((workflow) => (
            <TabsTrigger key={workflow.id} value={workflow.id} className="flex items-center space-x-2">
              {workflow.icon}
              <span className="hidden sm:inline">{workflow.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {annotationWorkflows.map((workflow) => (
          <TabsContent key={workflow.id} value={workflow.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {workflow.icon}
                  <div>
                    <CardTitle>{workflow.title}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step-by-step instructions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Play className="w-4 h-4 mr-2" />
                    Step-by-Step Instructions
                  </h3>
                  <div className="space-y-3">
                    {workflow.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleStepCompletion(index)}
                          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            completedSteps.includes(`${workflow.id}-${index}`)
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {completedSteps.includes(`${workflow.id}-${index}`) && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Step {index + 1}</Badge>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips and best practices */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Tips & Best Practices
                  </h3>
                  <div className="grid gap-3">
                    {workflow.tips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keyboard shortcuts */}
                {workflow.shortcuts && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
                    <div className="grid gap-2">
                      {workflow.shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{shortcut.split(' - ')[1]}</span>
                          <Badge variant="secondary" className="font-mono">
                            {shortcut.split(' - ')[0]}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Interactive Demo Section */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Demo</CardTitle>
          <CardDescription>
            Try the annotation tools in a guided environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={() => setShowInteractiveDemo(!showInteractiveDemo)}
              className="w-full"
            >
              {showInteractiveDemo ? 'Hide' : 'Show'} Interactive Demo
            </Button>
            
            {showInteractiveDemo && (
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="text-center space-y-4">
                  <MousePointer className="w-12 h-12 mx-auto text-gray-400" />
                  <h3 className="text-lg font-medium">Interactive Demo Canvas</h3>
                  <p className="text-gray-600">
                    This would contain an interactive canvas where users can practice
                    using the annotation tools with guided tooltips and feedback.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <Button variant="outline" size="sm">
                      <Ruler className="w-4 h-4 mr-2" />
                      Try Dimensions
                    </Button>
                    <Button variant="outline" size="sm">
                      <Type className="w-4 h-4 mr-2" />
                      Try Text
                    </Button>
                    <Button variant="outline" size="sm">
                      <Square className="w-4 h-4 mr-2" />
                      Try Areas
                    </Button>
                    <Button variant="outline" size="sm">
                      <Tag className="w-4 h-4 mr-2" />
                      Try Materials
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
          <CardDescription>
            Common annotation workflows at a glance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">For Floor Plans:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Add room dimensions with Architectural style</li>
                <li>• Calculate room areas automatically</li>
                <li>• Add material callouts for flooring</li>
                <li>• Include notes for special requirements</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">For Technical Drawings:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Use Engineering dimensions with high precision</li>
                <li>• Add detailed specifications</li>
                <li>• Include material properties and grades</li>
                <li>• Add warning notes for critical dimensions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotationWorkflowGuide;