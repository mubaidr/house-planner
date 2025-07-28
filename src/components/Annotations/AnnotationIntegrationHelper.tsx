/**
 * Annotation Integration Helper Component
 * 
 * Provides contextual help and guidance for using annotations
 * in the main application interface
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Lightbulb, 
  CheckCircle, 
  ArrowRight,
  X,
  BookOpen,
  Keyboard,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useViewStore } from '@/stores/viewStore';

interface ContextualTip {
  id: string;
  trigger: string;
  title: string;
  description: string;
  action?: string;
  shortcut?: string;
}

interface AnnotationIntegrationHelperProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const contextualTips: ContextualTip[] = [
  {
    id: 'first-dimension',
    trigger: 'dimension-tool-activated',
    title: 'Create Your First Dimension',
    description: 'Click two points to measure the distance between them. The dimension will automatically format based on your selected style.',
    action: 'Click two wall endpoints to start',
    shortcut: 'D'
  },
  {
    id: 'auto-dimensions',
    trigger: 'multiple-walls-present',
    title: 'Auto-Generate All Dimensions',
    description: 'Save time by automatically creating dimensions for all walls in your drawing.',
    action: 'Click the settings button and select "Auto Generate"',
    shortcut: 'Ctrl+D'
  },
  {
    id: 'text-categories',
    trigger: 'text-tool-activated',
    title: 'Choose the Right Text Category',
    description: 'Different text categories have different styling to help organize your annotations.',
    action: 'Select Note, Specification, Material, or Warning'
  },
  {
    id: 'room-areas',
    trigger: 'rooms-detected',
    title: 'Calculate Room Areas',
    description: 'Automatically calculate and display the area and perimeter of all rooms.',
    action: 'Use the Area tool settings to "Calculate Room Areas"',
    shortcut: 'Ctrl+A'
  },
  {
    id: 'material-setup',
    trigger: 'materials-not-assigned',
    title: 'Assign Materials First',
    description: 'Before creating material callouts, assign materials to your elements in the Properties Panel.',
    action: 'Select elements and assign materials in Properties Panel'
  },
  {
    id: 'export-templates',
    trigger: 'annotations-present',
    title: 'Export with Professional Templates',
    description: 'Your annotations will look great in professional templates designed for different use cases.',
    action: 'Go to File > Export > Professional Templates'
  }
];

const AnnotationIntegrationHelper: React.FC<AnnotationIntegrationHelperProps> = ({
  isVisible = true,
  onClose,
}) => {
  const { activeTool } = useUIStore();
  const { currentView } = useViewStore();
  const [currentTip, setCurrentTip] = useState<ContextualTip | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [completedTips, setCompletedTips] = useState<string[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Determine which tip to show based on context
  useEffect(() => {
    if (!isVisible) return;

    // Check for contextual tips based on current state
    if (activeTool === 'dimension' && !completedTips.includes('first-dimension')) {
      setCurrentTip(contextualTips.find(tip => tip.id === 'first-dimension') || null);
    } else if (activeTool === 'text-annotation' && !completedTips.includes('text-categories')) {
      setCurrentTip(contextualTips.find(tip => tip.id === 'text-categories') || null);
    } else if (activeTool === 'area-annotation' && !completedTips.includes('room-areas')) {
      setCurrentTip(contextualTips.find(tip => tip.id === 'room-areas') || null);
    } else if (activeTool === 'material-callout' && !completedTips.includes('material-setup')) {
      setCurrentTip(contextualTips.find(tip => tip.id === 'material-setup') || null);
    } else {
      setCurrentTip(null);
    }
  }, [activeTool, completedTips, isVisible]);

  const dismissTip = (tipId: string) => {
    setCompletedTips(prev => [...prev, tipId]);
    setCurrentTip(null);
  };

  const quickStartSteps = [
    {
      title: 'Create Your Drawing',
      description: 'Add walls, doors, and windows to create your floor plan',
      completed: true // Assume this is done if they're seeing the helper
    },
    {
      title: 'Add Dimensions',
      description: 'Use the Dimension tool (📏) to measure walls and openings',
      completed: completedTips.includes('first-dimension')
    },
    {
      title: 'Label Rooms',
      description: 'Add text annotations to label rooms and add notes',
      completed: completedTips.includes('text-categories')
    },
    {
      title: 'Calculate Areas',
      description: 'Use the Area tool to calculate room sizes automatically',
      completed: completedTips.includes('room-areas')
    },
    {
      title: 'Add Materials',
      description: 'Create material callouts for professional documentation',
      completed: completedTips.includes('material-setup')
    },
    {
      title: 'Export Professionally',
      description: 'Use templates to create professional PDF exports',
      completed: completedTips.includes('export-templates')
    }
  ];

  const keyboardShortcuts = [
    { key: 'D', action: 'Activate Dimension Tool' },
    { key: 'T', action: 'Activate Text Tool' },
    { key: 'A', action: 'Activate Area Tool' },
    { key: 'M', action: 'Activate Material Tool' },
    { key: 'Ctrl+D', action: 'Auto-generate Dimensions' },
    { key: 'Ctrl+A', action: 'Calculate All Room Areas' },
    { key: 'Ctrl+M', action: 'Auto-generate Material Callouts' },
    { key: 'Esc', action: 'Exit Current Tool' },
    { key: 'Delete', action: 'Remove Selected Annotation' }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-4">
      {/* Contextual Tip */}
      {currentTip && (
        <Alert className="bg-blue-50 border-blue-200">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-blue-900">{currentTip.title}</h4>
                <p className="text-sm text-blue-800 mt-1">{currentTip.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissTip(currentTip.id)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            {currentTip.action && (
              <div className="flex items-center space-x-2 text-sm">
                <ArrowRight className="h-3 w-3 text-blue-600" />
                <span className="text-blue-800">{currentTip.action}</span>
                {currentTip.shortcut && (
                  <Badge variant="secondary" className="text-xs">
                    {currentTip.shortcut}
                  </Badge>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Help Panel */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Annotation Help</CardTitle>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <CardDescription className="text-xs">
            Current view: {currentView} | Active tool: {activeTool || 'None'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickStart(!showQuickStart)}
              className="text-xs"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Quick Start
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              className="text-xs"
            >
              <Keyboard className="h-3 w-3 mr-1" />
              Shortcuts
            </Button>
          </div>

          {/* Quick Start Guide */}
          {showQuickStart && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium">Quick Start Checklist</h4>
              <div className="space-y-1">
                {quickStartSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {step.completed && <CheckCircle className="w-2 h-2 text-white" />}
                    </div>
                    <span className={step.completed ? 'text-green-700' : 'text-gray-600'}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts */}
          {showKeyboardShortcuts && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium">Keyboard Shortcuts</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{shortcut.action}</span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {shortcut.key}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Tool Help */}
          {activeTool && activeTool !== 'select' && (
            <div className="bg-gray-50 rounded p-2">
              <h4 className="text-xs font-medium mb-1">
                {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Tool Active
              </h4>
              <p className="text-xs text-gray-600">
                {activeTool === 'dimension' && 'Click two points to create a dimension line'}
                {activeTool === 'text-annotation' && 'Click to place text annotation'}
                {activeTool === 'area-annotation' && 'Click points to define area boundary'}
                {activeTool === 'material-callout' && 'Click on elements to add material callouts'}
              </p>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">
                {completedTips.length} / {contextualTips.length} tips completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(completedTips.length / contextualTips.length) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotationIntegrationHelper;