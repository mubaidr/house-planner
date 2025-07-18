/**
 * Dimension Button Component
 * 
 * Provides a toolbar button for activating dimension tools and controls
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Ruler, Settings } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import DimensionControls from '@/components/Annotations/DimensionControls';
import { useDimensionManager2D } from '@/hooks/useDimensionManager2D';
import { useViewStore } from '@/stores/viewStore';
import { useFloorStore } from '@/stores/floorStore';
import { useDesignStore } from '@/stores/designStore';

const DimensionButton: React.FC = () => {
  const { activeTool, setActiveTool } = useUIStore();
  const { currentView } = useViewStore();
  const { currentFloorId } = useFloorStore();
  const { walls, doors, windows, stairs, roofs } = useDesignStore();
  const [isOpen, setIsOpen] = useState(false);

  const dimensionManager = useDimensionManager2D({
    autoGenerate: true,
    enabled: true,
    viewType: currentView,
    floorId: currentFloorId || 'floor-1',
    config: {
      autoGenerate: true,
      defaultStyle: 'architectural',
      defaultUnit: 'm',
      defaultOffset: 0.5,
      defaultTextSize: 12,
      defaultArrowSize: 0.1,
      defaultLineWeight: 1,
      defaultColor: '#000000',
      snapTolerance: 0.05,
      showTolerances: false,
      precision: 2
    }
  });

  const isDimensionActive = activeTool === 'dimension';

  const handleToolToggle = () => {
    if (isDimensionActive) {
      setActiveTool('select');
    } else {
      setActiveTool('dimension');
    }
  };

  const handleAutoGenerate = () => {
    const allElements = [...walls, ...doors, ...windows, ...stairs, ...roofs];
    dimensionManager.autoGenerateDimensions(allElements);
  };

  const handleClearAuto = () => {
    dimensionManager.clearAutoDimensions();
  };

  const handleCreateDimension = () => {
    setActiveTool('dimension');
    setIsOpen(false);
  };

  return (
    <div className="flex items-center">
      <Button
        variant={isDimensionActive ? 'default' : 'outline'}
        size="sm"
        onClick={handleToolToggle}
        className={`mr-1 ${isDimensionActive ? 'bg-blue-600 text-white' : ''}`}
        title="Dimension Tool (D)"
      >
        <Ruler className="w-4 h-4" />
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="px-2"
            title="Dimension Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <DimensionControls
            config={dimensionManager.config}
            isEnabled={dimensionManager.isEnabled}
            onConfigUpdate={dimensionManager.updateConfig}
            onToggleEnabled={dimensionManager.setEnabled}
            onCreateDimension={handleCreateDimension}
            onAutoGenerate={handleAutoGenerate}
            onClearAuto={handleClearAuto}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DimensionButton;