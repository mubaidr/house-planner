/**
 * Practical Integration Guide for Enhanced Annotation Toolbar
 * 
 * Step-by-step guide for integrating and using the enhanced annotation
 * toolbar in the main 2D House Planner application
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Code, 
  Wrench, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Settings,
  MousePointer,
  Keyboard,
} from 'lucide-react';

interface IntegrationStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  component?: React.ReactNode;
  tips: string[];
  warnings?: string[];
}

const PracticalIntegrationGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) ? prev : [...prev, stepId]
    );
  };

  const integrationSteps: Record<string, IntegrationStep[]> = {
    setup: [
      {
        id: 'install-toolbar',
        title: 'Add Enhanced Annotation Toolbar to Main Layout',
        description: 'Integrate the toolbar into your main application layout',
        code: `// In your main layout component (e.g., AppLayout.tsx)
import EnhancedAnnotationToolbar from '@/components/Toolbar/EnhancedAnnotationToolbar';

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Existing header */}
      <header>...</header>
      
      {/* Add Enhanced Annotation Toolbar */}
      <div className="border-b bg-gray-50 p-2">
        <EnhancedAnnotationToolbar
          onExportTemplates={() => setExportDialogOpen(true)}
          onImportAnnotations={handleImportAnnotations}
          onExportAnnotations={handleExportAnnotations}
        />
      </div>
      
      {/* Main content area */}
      <main className="flex-1 flex">
        {/* Sidebar */}
        <aside>...</aside>
        
        {/* Canvas area */}
        <div className="flex-1">
          <DrawingCanvas />
        </div>
        
        {/* Properties panel */}
        <aside>...</aside>
      </main>
    </div>
  );
}`,
        tips: [
          'Place the toolbar between the header and main content for easy access',
          'The toolbar is responsive and will adapt to different screen sizes',
          'Consider making the toolbar collapsible on smaller screens'
        ]
      },
      {
        id: 'integrate-hooks',
        title: 'Integrate Enhanced Annotations Hook',
        description: 'Add the annotation management system to your canvas component',
        code: `// In your DrawingCanvas component
import { useEnhancedAnnotations } from '@/hooks/useEnhancedAnnotations';
import EnhancedAnnotationRenderer2D from '@/components/Annotations/EnhancedAnnotationRenderer2D';

export default function DrawingCanvas() {
  const { currentView } = useViewStore();
  const { currentFloorId } = useFloorStore();
  
  // Initialize enhanced annotations
  const annotations = useEnhancedAnnotations({
    viewType: currentView,
    floorId: currentFloorId || 'floor-1',
    autoGenerate: true,
    dimensionOptions: {
      config: {
        autoGenerate: true,
        defaultStyle: 'architectural',
        defaultUnit: 'm',
        precision: 2
      }
    }
  });

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Your existing drawing elements */}
        <WallRenderer walls={walls} />
        <DoorRenderer doors={doors} />
        <WindowRenderer windows={windows} />
        
        {/* Add Enhanced Annotation Renderer */}
        <EnhancedAnnotationRenderer2D
          dimensions={annotations.dimensions}
          chains={annotations.chains}
          textAnnotations={annotations.textAnnotations}
          areaAnnotations={annotations.areaAnnotations}
          materialCallouts={annotations.materialCallouts}
          viewType={currentView}
          scale={canvasScale}
          offset={canvasOffset}
          selectedAnnotationId={annotations.selectedAnnotationId}
          onAnnotationSelect={annotations.selectAnnotation}
          onAnnotationEdit={annotations.updateDimension}
          onAnnotationDelete={annotations.deleteDimension}
        />
      </Layer>
    </Stage>
  );
}`,
        tips: [
          'The hook automatically manages all annotation types',
          'Annotations will update when elements are moved or modified',
          'The renderer integrates seamlessly with Konva/React-Konva'
        ]
      }
    ],
    usage: [
      {
        id: 'dimension-workflow',
        title: 'Professional Dimension Workflow',
        description: 'Complete workflow for adding professional dimensions',
        component: (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Step-by-Step Dimension Process:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click the Dimension Tool (📏) in the Enhanced Annotation Toolbar</li>
                <li>Choose your dimension style from the settings dropdown:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li><strong>Architectural:</strong> For building plans (feet/inches)</li>
                    <li><strong>Engineering:</strong> For technical drawings</li>
                    <li><strong>Metric:</strong> For precise measurements</li>
                    <li><strong>Imperial:</strong> For US standard measurements</li>
                  </ul>
                </li>
                <li>Click the first point you want to measure from</li>
                <li>Click the second point to complete the dimension</li>
                <li>The dimension automatically appears with proper formatting</li>
                                  <li>Use &quot;Auto-Generate Dimensions&quot; for all walls at once</li>
              </ol>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tip:</strong> Dimensions automatically snap to wall endpoints, door/window corners, and other significant points for accuracy.
              </AlertDescription>
            </Alert>
          </div>
        ),
        tips: [
          'Use Ctrl+D to auto-generate dimensions for all elements',
          'Dimensions update automatically when elements are moved',
          'Chain dimensions together for continuous measurements'
        ]
      },
      {
        id: 'text-annotation-workflow',
        title: 'Text Annotation Best Practices',
        description: 'How to effectively use text annotations for different purposes',
        component: (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📝 Notes</h4>
                <p className="text-sm text-gray-700 mb-2">For general comments and observations</p>
                <ul className="text-xs space-y-1">
                  <li>• Room labels and names</li>
                  <li>• General construction notes</li>
                  <li>• Design intentions</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📋 Specifications</h4>
                <p className="text-sm text-gray-700 mb-2">For technical requirements</p>
                <ul className="text-xs space-y-1">
                  <li>• Material specifications</li>
                  <li>• Building code requirements</li>
                  <li>• Installation instructions</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">⚠️ Warnings</h4>
                <p className="text-sm text-gray-700 mb-2">For important safety information</p>
                <ul className="text-xs space-y-1">
                  <li>• Critical dimensions</li>
                  <li>• Safety requirements</li>
                  <li>• Special attention areas</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">🏗️ Materials</h4>
                <p className="text-sm text-gray-700 mb-2">For material information</p>
                <ul className="text-xs space-y-1">
                  <li>• Material types and grades</li>
                  <li>• Finish specifications</li>
                  <li>• Supplier information</li>
                </ul>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Use leader lines to point to specific elements',
          'Choose appropriate categories for automatic styling',
          'Keep text concise but informative'
        ]
      },
      {
        id: 'area-calculation-workflow',
        title: 'Automated Area Calculations',
        description: 'Efficiently calculate and display room areas',
        component: (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">🧮 Area Calculation Methods:</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium">Automatic Room Areas:</h5>
                  <p className="text-xs text-gray-600">Click &quot;Calculate Room Areas&quot; to automatically detect and calculate all room areas from wall boundaries.</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium">Manual Area Selection:</h5>
                  <p className="text-xs text-gray-600">Use the Area Tool to manually select any polygon area for custom calculations.</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium">Live Updates:</h5>
                  <p className="text-xs text-gray-600">Areas automatically recalculate when walls are moved or rooms are modified.</p>
                </div>
              </div>
            </div>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Areas are calculated with high precision and can be displayed in square meters, square feet, or square centimeters.
              </AlertDescription>
            </Alert>
          </div>
        ),
        tips: [
          'Use Ctrl+A to calculate all room areas at once',
          'Toggle calculation display to reduce clutter when needed',
          'Areas include both total area and perimeter measurements'
        ]
      },
      {
        id: 'material-callout-workflow',
        title: 'Professional Material Callouts',
        description: 'Add detailed material specifications with quantities',
        component: (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">🏷️ Material Callout Process:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Assign materials to elements in the Properties Panel first</li>
                <li>Click the Material Callout Tool (🏷️)</li>
                <li>Click on any element with an assigned material</li>
                <li>The callout automatically shows:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Material name and type</li>
                    <li>Technical specifications</li>
                    <li>Calculated quantities</li>
                    <li>Units (m², linear meters, pieces, etc.)</li>
                  </ul>
                </li>
                <li>Use &quot;Auto-Generate Callouts&quot; for all elements at once</li>
              </ol>
            </div>
          </div>
        ),
        tips: [
          'Group similar materials to reduce callout clutter',
          'Quantities are calculated automatically based on element dimensions',
          'Callouts can be moved and repositioned as needed'
        ]
      }
    ],
    advanced: [
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts for Efficiency',
        description: 'Master keyboard shortcuts for faster annotation workflow',
        component: (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center">
                  <Keyboard className="w-4 h-4 mr-2" />
                  Tool Activation
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Dimension Tool</span>
                    <Badge variant="secondary">D</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Text Annotation</span>
                    <Badge variant="secondary">T</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Area Tool</span>
                    <Badge variant="secondary">A</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Material Tool</span>
                    <Badge variant="secondary">M</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Auto-Generation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Auto Dimensions</span>
                    <Badge variant="secondary">Ctrl+D</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto Areas</span>
                    <Badge variant="secondary">Ctrl+A</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto Materials</span>
                    <Badge variant="secondary">Ctrl+M</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Clear All</span>
                    <Badge variant="secondary">Ctrl+Shift+C</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
        tips: [
          'Learn shortcuts gradually - start with the most used tools',
          'Use Esc to cancel any active annotation tool',
          'Tab switches between annotation categories'
        ]
      },
      {
        id: 'export-integration',
        title: 'Export Integration with Templates',
        description: 'How annotations work with the professional export templates',
        code: `// Example: Exporting with annotations
const handleExportWithAnnotations = async () => {
  // Get current annotations
  const annotationData = annotations.exportAnnotations();
  
  // Apply to selected template
  const templateOptions = applyTemplate(selectedTemplate, {
    ...multiViewOptions,
    includeAnnotations: true,
    includeMeasurements: true,
    annotationData: annotationData
  });
  
  // Export with professional formatting
  const blob = await exportMultiViewToPDF(stages, templateOptions);
  downloadFile(blob, 'professional-plan.pdf');
};`,
        tips: [
          'Annotations are automatically included in template exports',
          'Different templates may style annotations differently',
          'Use the Export Dialog to preview how annotations will appear'
        ]
      },
      {
        id: 'customization',
        title: 'Customizing Annotation Styles',
        description: 'How to customize annotation appearance for your brand',
        code: `// Example: Custom annotation styles
const customStyles = {
  textStyle: {
    fontSize: 14,
    fontFamily: 'Arial',
    color: '#2563eb', // Your brand blue
    backgroundColor: '#f8fafc',
    borderColor: '#2563eb'
  },
  dimensionStyle: {
    defaultStyle: 'architectural',
    defaultColor: '#1f2937',
    defaultArrowSize: 0.12,
    precision: 2
  },
  areaStyle: {
    fillColor: 'rgba(37, 99, 235, 0.1)',
    strokeColor: '#2563eb',
    strokeWidth: 2
  }
};

// Apply custom styles
annotations.updateDefaultStyles(customStyles);`,
        tips: [
          'Match annotation colors to your brand guidelines',
          'Consider readability when choosing colors and fonts',
          'Test styles with different export templates'
        ]
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Practical Integration Guide
        </h1>
        <p className="text-lg text-gray-600">
          Complete guide to integrating and using the Enhanced Annotation Toolbar
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" className="flex items-center space-x-2">
            <Wrench className="w-4 h-4" />
            <span>Setup & Integration</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <Play className="w-4 h-4" />
            <span>Usage Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Advanced Features</span>
          </TabsTrigger>
        </TabsList>

        {Object.entries(integrationSteps).map(([tabKey, steps]) => (
          <TabsContent key={tabKey} value={tabKey} className="space-y-6">
            {steps.map((step, index) => (
              <Card key={step.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Badge variant="outline">Step {index + 1}</Badge>
                        <span>{step.title}</span>
                        {completedSteps.includes(step.id) && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markStepComplete(step.id)}
                      disabled={completedSteps.includes(step.id)}
                    >
                      {completedSteps.includes(step.id) ? 'Complete' : 'Mark Complete'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {step.code && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Code className="w-4 h-4" />
                        <span className="font-medium">Implementation Code:</span>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{step.code}</code>
                      </pre>
                    </div>
                  )}
                  
                  {step.component && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MousePointer className="w-4 h-4" />
                        <span className="font-medium">Interactive Guide:</span>
                      </div>
                      {step.component}
                    </div>
                  )}
                  
                  {step.tips.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-700">💡 Tips & Best Practices:</h4>
                      <ul className="space-y-1">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-green-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {step.warnings && step.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Important:</strong> {step.warnings.join(' ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Integration Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Steps Completed:</span>
              <Badge variant="default">
                {completedSteps.length} / {Object.values(integrationSteps).flat().length}
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(integrationSteps).map(([tabKey, steps]) => {
                const completed = steps.filter(step => completedSteps.includes(step.id)).length;
                const total = steps.length;
                const percentage = (completed / total) * 100;
                
                return (
                  <div key={tabKey} className="text-center space-y-2">
                    <h4 className="font-medium capitalize">{tabKey}</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{completed}/{total}</span>
                  </div>
                );
              })}
            </div>
            
            {completedSteps.length === Object.values(integrationSteps).flat().length && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  🎉 <strong>Congratulations!</strong> You&apos;ve completed the integration guide. 
                  Your Enhanced Annotation Toolbar is ready for professional use!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Quick Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Essential Files Modified:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <code>AppLayout.tsx</code> - Main layout integration</li>
                <li>• <code>DrawingCanvas.tsx</code> - Canvas annotation rendering</li>
                <li>• <code>ExportDialog.tsx</code> - Template export integration</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Key Components Added:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <code>EnhancedAnnotationToolbar</code> - Main toolbar</li>
                <li>• <code>EnhancedAnnotationRenderer2D</code> - Canvas renderer</li>
                <li>• <code>useEnhancedAnnotations</code> - Management hook</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticalIntegrationGuide;