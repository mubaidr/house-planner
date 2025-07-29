
import React from 'react';
import { LuRuler, LuSave, LuFolderOpen } from 'react-icons/lu';
import { useUnitStore, UnitSystem } from '@/stores/unitStore';
import ToolButton from './ToolButton';
import AlignmentTools from './AlignmentTools';
import MeasurementControls from './MeasurementControls';
import ExportButton from './ExportButton';
import { saveDesign, loadDesign } from '@/utils/storage';

export const Toolbar: React.FC = () => {
  const { unitSystem, setUnitSystem } = useUnitStore();

  const handleUnitChange = (system: UnitSystem) => {
    setUnitSystem(system);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 bg-white shadow-lg rounded-lg p-2 flex items-center space-x-2">
      <AlignmentTools />
      <MeasurementControls />
      <div className="flex items-center space-x-1">
        <ToolButton
          icon={<LuRuler />}
          label="Metric"
          aria-label="Switch to Metric units"
          isActive={unitSystem === 'metric'}
          onClick={() => handleUnitChange('metric')}
        />
        <ToolButton
          icon={<LuRuler />}
          label="Imperial"
          aria-label="Switch to Imperial units"
          isActive={unitSystem === 'imperial'}
          onClick={() => handleUnitChange('imperial')}
        />
      </div>
      <div className="flex items-center space-x-1">
        <ToolButton
          icon={<LuSave />}
          label="Save"
          aria-label="Save design"
          isActive={false}
          onClick={saveDesign}
        />
        <ToolButton
          icon={<LuFolderOpen />}
          label="Load"
          aria-label="Load design"
          isActive={false}
          onClick={loadDesign}
        />
      </div>
      <ExportButton />
    </div>
  );
};
