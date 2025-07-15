/**
 * Dimension Controls Component
 * 
 * Provides UI controls for creating, editing, and managing dimensions
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Trash2, Eye, EyeOff, Lock, Unlock, Plus, Minus } from 'lucide-react';
import { Dimension2D, DimensionType, DimensionStyle, DimensionManagerConfig } from '@/utils/dimensionManager2D';

interface DimensionControlsProps {
  selectedDimension?: Dimension2D;
  config: DimensionManagerConfig;
  isEnabled: boolean;
  onConfigUpdate: (updates: Partial<DimensionManagerConfig>) => void;
  onDimensionUpdate?: (id: string, updates: Partial<Dimension2D>) => void;
  onDimensionDelete?: (id: string) => void;
  onToggleEnabled: (enabled: boolean) => void;
  onCreateDimension?: () => void;
  onAutoGenerate?: () => void;
  onClearAuto?: () => void;
}

const DimensionControls: React.FC<DimensionControlsProps> = ({
  selectedDimension,
  config,
  isEnabled,
  onConfigUpdate,
  onDimensionUpdate,
  onDimensionDelete,
  onToggleEnabled,
  onCreateDimension,
  onAutoGenerate,
  onClearAuto
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleConfigChange = (key: keyof DimensionManagerConfig, value: string | number | boolean) => {
    onConfigUpdate({ [key]: value });
  };

  const handleDimensionChange = (key: keyof Dimension2D, value: string | number | boolean) => {
    if (selectedDimension && onDimensionUpdate) {
      onDimensionUpdate(selectedDimension.id, { [key]: value });
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dimensions</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleEnabled(!isEnabled)}
            className={isEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50'}
          >
            {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isEnabled && (
        <>
          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateDimension}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAutoGenerate}
              className="flex-1"
            >
              Auto Generate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAuto}
              className="flex-1"
            >
              Clear Auto
            </Button>
          </div>

          {/* Selected Dimension Controls */}
          {selectedDimension && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Selected Dimension</h4>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDimensionChange('isLocked', !selectedDimension.isLocked)}
                    >
                      {selectedDimension.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDimensionChange('isVisible', !selectedDimension.isVisible)}
                    >
                      {selectedDimension.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDimensionDelete?.(selectedDimension.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="dim-type">Type</Label>
                    <Select
                      value={selectedDimension.type}
                      onValueChange={(value: DimensionType) => handleDimensionChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="angular">Angular</SelectItem>
                        <SelectItem value="radial">Radial</SelectItem>
                        <SelectItem value="diameter">Diameter</SelectItem>
                        <SelectItem value="area">Area</SelectItem>
                        <SelectItem value="elevation">Elevation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dim-unit">Unit</Label>
                    <Select
                      value={selectedDimension.unit}
                      onValueChange={(value) => handleDimensionChange('unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="ft">ft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dim-offset">Offset</Label>
                    <Input
                      id="dim-offset"
                      type="number"
                      step="0.1"
                      value={selectedDimension.offset}
                      onChange={(e) => handleDimensionChange('offset', parseFloat(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dim-precision">Precision</Label>
                    <Input
                      id="dim-precision"
                      type="number"
                      min="0"
                      max="4"
                      value={selectedDimension.precision}
                      onChange={(e) => handleDimensionChange('precision', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dim-label">Label</Label>
                  <Input
                    id="dim-label"
                    value={selectedDimension.label || ''}
                    onChange={(e) => handleDimensionChange('label', e.target.value)}
                    placeholder="Optional label"
                  />
                </div>
              </div>
            </>
          )}

          {/* Global Configuration */}
          {isExpanded && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Global Settings</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="default-style">Default Style</Label>
                    <Select
                      value={config.defaultStyle}
                      onValueChange={(value: DimensionStyle) => handleConfigChange('defaultStyle', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="architectural">Architectural</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="metric">Metric</SelectItem>
                        <SelectItem value="imperial">Imperial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="default-unit">Default Unit</Label>
                    <Select
                      value={config.defaultUnit}
                      onValueChange={(value) => handleConfigChange('defaultUnit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="ft">ft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="default-offset">Default Offset</Label>
                    <Input
                      id="default-offset"
                      type="number"
                      step="0.1"
                      value={config.defaultOffset}
                      onChange={(e) => handleConfigChange('defaultOffset', parseFloat(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="default-precision">Default Precision</Label>
                    <Input
                      id="default-precision"
                      type="number"
                      min="0"
                      max="4"
                      value={config.precision}
                      onChange={(e) => handleConfigChange('precision', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-generate"
                      checked={config.autoGenerate}
                      onCheckedChange={(checked) => handleConfigChange('autoGenerate', checked)}
                    />
                    <Label htmlFor="auto-generate">Auto-generate dimensions</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-tolerances"
                      checked={config.showTolerances}
                      onCheckedChange={(checked) => handleConfigChange('showTolerances', checked)}
                    />
                    <Label htmlFor="show-tolerances">Show tolerances</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="snap-tolerance">Snap Tolerance</Label>
                  <Input
                    id="snap-tolerance"
                    type="number"
                    step="0.01"
                    value={config.snapTolerance}
                    onChange={(e) => handleConfigChange('snapTolerance', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DimensionControls;