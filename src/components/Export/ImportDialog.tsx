import React, { useState, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useDesignStore } from '@/stores/designStore';
import { useErrorStore } from '@/stores/errorStore';
import { useAccessibilityAnnouncer } from '@/components/Accessibility/AccessibilityAnnouncer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface ImportedDesign {
  walls: any[];
  doors: any[];
  windows: any[];
  stairs: any[];
  roofs: any[];
  version?: string;
  metadata?: {
    created: string;
    modified: string;
    name: string;
  };
}

const ImportDialog: React.FC = () => {
  const { isImportDialogOpen, setImportDialogOpen } = useUIStore();
  const { setWalls, setDoors, setWindows, setStairs, setRoofs, clearAll } = useDesignStore();
  const { setError } = useErrorStore();
  const { announceSuccess, announceError } = useAccessibilityAnnouncer();
  
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<ImportedDesign | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportDialogOpen) return null;

  const validateDesignData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data || typeof data !== 'object') {
      errors.push('Invalid file format. Expected JSON object.');
      return { isValid: false, errors };
    }

    // Check for required arrays
    const requiredArrays = ['walls', 'doors', 'windows', 'stairs', 'roofs'];
    for (const arrayName of requiredArrays) {
      if (!Array.isArray(data[arrayName])) {
        errors.push(`Missing or invalid ${arrayName} array.`);
      }
    }

    // Validate wall structure
    if (Array.isArray(data.walls)) {
      data.walls.forEach((wall: any, index: number) => {
        if (!wall.id || typeof wall.startX !== 'number' || typeof wall.startY !== 'number' ||
            typeof wall.endX !== 'number' || typeof wall.endY !== 'number') {
          errors.push(`Wall ${index + 1} has invalid structure.`);
        }
      });
    }

    // Validate doors reference existing walls
    if (Array.isArray(data.doors) && Array.isArray(data.walls)) {
      const wallIds = new Set(data.walls.map((w: any) => w.id));
      data.doors.forEach((door: any, index: number) => {
        if (!door.id || !door.wallId || !wallIds.has(door.wallId)) {
          errors.push(`Door ${index + 1} references non-existent wall.`);
        }
      });
    }

    // Validate windows reference existing walls
    if (Array.isArray(data.windows) && Array.isArray(data.walls)) {
      const wallIds = new Set(data.walls.map((w: any) => w.id));
      data.windows.forEach((window: any, index: number) => {
        if (!window.id || !window.wallId || !wallIds.has(window.wallId)) {
          errors.push(`Window ${index + 1} references non-existent wall.`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setValidationErrors(['Please select a JSON file.']);
      announceError('Invalid file type. Please select a JSON file.');
      return;
    }

    try {
      setIsImporting(true);
      setImportProgress(25);
      
      const text = await file.text();
      setImportProgress(50);
      
      const data = JSON.parse(text);
      setImportProgress(75);
      
      const validation = validateDesignData(data);
      setValidationErrors(validation.errors);
      
      if (validation.isValid) {
        setPreviewData(data);
        announceSuccess(`File loaded successfully. ${data.walls?.length || 0} walls, ${data.doors?.length || 0} doors, ${data.windows?.length || 0} windows found.`);
      } else {
        announceError(`File validation failed. ${validation.errors.length} errors found.`);
      }
      
      setImportProgress(100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setValidationErrors([`Failed to parse JSON file: ${errorMessage}`]);
      announceError(`Import failed: ${errorMessage}`);
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(0), 1000);
    }
  };

  const handleImport = async () => {
    if (!previewData) return;

    try {
      setIsImporting(true);
      setImportProgress(25);

      if (importMode === 'replace') {
        clearAll();
        setImportProgress(50);
      }

      // Import data with progress updates
      setWalls(previewData.walls || []);
      setImportProgress(60);
      
      setDoors(previewData.doors || []);
      setImportProgress(70);
      
      setWindows(previewData.windows || []);
      setImportProgress(80);
      
      setStairs(previewData.stairs || []);
      setImportProgress(90);
      
      setRoofs(previewData.roofs || []);
      setImportProgress(100);

      const elementCount = (previewData.walls?.length || 0) + 
                          (previewData.doors?.length || 0) + 
                          (previewData.windows?.length || 0) + 
                          (previewData.stairs?.length || 0) + 
                          (previewData.roofs?.length || 0);

      announceSuccess(`Import completed successfully. ${elementCount} elements imported.`);
      
      // Close dialog after successful import
      setTimeout(() => {
        setImportDialogOpen(false);
        resetDialog();
      }, 1500);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setError(errorMessage);
      announceError(errorMessage);
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(0), 1000);
    }
  };

  const resetDialog = () => {
    setPreviewData(null);
    setValidationErrors([]);
    setImportProgress(0);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setImportDialogOpen(false);
    resetDialog();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-dialog-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-blue-500" />
            <h2 id="import-dialog-title" className="text-xl font-semibold text-gray-900">
              Import Design
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close import dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Import Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Import Mode
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={(e) => setImportMode(e.target.value as 'replace' | 'merge')}
                  className="mr-2"
                />
                <span>Replace current design</span>
                <span className="text-sm text-gray-500 ml-2">(Recommended)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={(e) => setImportMode(e.target.value as 'replace' | 'merge')}
                  className="mr-2"
                />
                <span>Merge with current design</span>
                <span className="text-sm text-gray-500 ml-2">(May cause conflicts)</span>
              </label>
            </div>
          </div>

          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Design File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isImporting}
            />
            <p className="text-sm text-gray-500 mt-1">
              Select a JSON file exported from the 2D House Planner
            </p>
          </div>

          {/* Progress Bar */}
          {importProgress > 0 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Processing...</span>
                <span>{importProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                  role="progressbar"
                  aria-valuenow={importProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Validation Errors
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>- {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewData && validationErrors.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    Ready to Import
                  </h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>- {previewData.walls?.length || 0} walls</p>
                    <p>- {previewData.doors?.length || 0} doors</p>
                    <p>- {previewData.windows?.length || 0} windows</p>
                    <p>- {previewData.stairs?.length || 0} stairs</p>
                    <p>- {previewData.roofs?.length || 0} roofs</p>
                    {previewData.metadata && (
                      <p className="mt-2 text-xs">
                        Created: {new Date(previewData.metadata.created).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!previewData || validationErrors.length > 0 || isImporting}
            variant="primary"
          >
            {isImporting ? 'Importing...' : 'Import Design'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;