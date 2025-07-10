'use client';

import React, { useState, useRef } from 'react';
import { Stage } from 'konva/lib/Stage';
import { 
  ExportOptions, 
  exportToPNG, 
  exportToPDF, 
  downloadFile, 
  generateFilename,
  getExportPreview 
} from '@/utils/exportUtils';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage | null;
}

export default function ExportDialog({ isOpen, onClose, stage }: ExportDialogProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 0.9,
    includeGrid: false,
    includeRooms: true,
    includeMeasurements: true,
    paperSize: 'A4',
    orientation: 'landscape',
    scale: 1,
    title: 'House Plan',
    description: 'Created with 2D House Planner',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [exportError, setExportError] = useState<string>('');
  const previewRef = useRef<HTMLImageElement>(null);

  // Generate preview when dialog opens or options change
  React.useEffect(() => {
    if (isOpen && stage) {
      generatePreview();
    }
  }, [isOpen, stage, exportOptions.scale]);

  const generatePreview = async () => {
    if (!stage) return;
    
    try {
      const previewUrl = await getExportPreview(stage, 300, 200);
      setPreview(previewUrl);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  };

  const handleExport = async () => {
    if (!stage) return;

    setIsExporting(true);
    setExportError('');

    try {
      let result;
      
      if (exportOptions.format === 'png') {
        result = await exportToPNG(stage, exportOptions);
      } else {
        result = await exportToPDF(stage, exportOptions);
      }

      if (result.success && result.blob) {
        const filename = generateFilename(exportOptions.format, exportOptions.title);
        downloadFile(result.blob, filename);
        onClose();
      } else {
        setExportError(result.error || 'Export failed');
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsExporting(false);
    }
  };

  const updateOption = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Export Design</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
            <div className="flex justify-center">
              {preview ? (
                <img
                  ref={previewRef}
                  src={preview}
                  alt="Export preview"
                  className="max-w-full h-auto border border-gray-300 rounded shadow-sm"
                  style={{ maxHeight: '200px' }}
                />
              ) : (
                <div className="w-64 h-40 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500">Generating preview...</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Format Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Format & Quality</h3>
              
              {/* Format Selection */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Export Format</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="png"
                      checked={exportOptions.format === 'png'}
                      onChange={(e) => updateOption('format', e.target.value as 'png' | 'pdf')}
                      className="mr-2"
                    />
                    PNG Image
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="pdf"
                      checked={exportOptions.format === 'pdf'}
                      onChange={(e) => updateOption('format', e.target.value as 'png' | 'pdf')}
                      className="mr-2"
                    />
                    PDF Document
                  </label>
                </div>
              </div>

              {/* Quality/DPI */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  {exportOptions.format === 'png' ? 'Quality' : 'Resolution'}
                </label>
                <select
                  value={exportOptions.quality}
                  onChange={(e) => updateOption('quality', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {exportOptions.format === 'png' ? (
                    <>
                      <option value={0.6}>Low (60%)</option>
                      <option value={0.8}>Medium (80%)</option>
                      <option value={0.9}>High (90%)</option>
                      <option value={1.0}>Maximum (100%)</option>
                    </>
                  ) : (
                    <>
                      <option value={150}>Standard (150 DPI)</option>
                      <option value={300}>High (300 DPI)</option>
                      <option value={600}>Print (600 DPI)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Scale */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Scale Factor</label>
                <select
                  value={exportOptions.scale}
                  onChange={(e) => updateOption('scale', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0.5}>50%</option>
                  <option value={1}>100% (Original)</option>
                  <option value={1.5}>150%</option>
                  <option value={2}>200%</option>
                  <option value={3}>300%</option>
                </select>
              </div>
            </div>

            {/* PDF Options */}
            {exportOptions.format === 'pdf' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">PDF Settings</h3>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Paper Size</label>
                  <select
                    value={exportOptions.paperSize}
                    onChange={(e) => updateOption('paperSize', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="A3">A3 (297 × 420 mm)</option>
                    <option value="Letter">Letter (8.5 × 11 in)</option>
                    <option value="Legal">Legal (8.5 × 14 in)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Orientation</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="portrait"
                        checked={exportOptions.orientation === 'portrait'}
                        onChange={(e) => updateOption('orientation', e.target.value as any)}
                        className="mr-2"
                      />
                      Portrait
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="landscape"
                        checked={exportOptions.orientation === 'landscape'}
                        onChange={(e) => updateOption('orientation', e.target.value as any)}
                        className="mr-2"
                      />
                      Landscape
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Content Options</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeGrid}
                  onChange={(e) => updateOption('includeGrid', e.target.checked)}
                  className="mr-2"
                />
                Include Grid
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeRooms}
                  onChange={(e) => updateOption('includeRooms', e.target.checked)}
                  className="mr-2"
                />
                Include Rooms
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMeasurements}
                  onChange={(e) => updateOption('includeMeasurements', e.target.checked)}
                  className="mr-2"
                />
                Include Measurements
              </label>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Document Information</h3>
            
            <div>
              <label className="block text-sm text-gray-600 mb-2">Title</label>
              <input
                type="text"
                value={exportOptions.title || ''}
                onChange={(e) => updateOption('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter document title"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Description</label>
              <textarea
                value={exportOptions.description || ''}
                onChange={(e) => updateOption('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Enter document description"
              />
            </div>
          </div>

          {/* Error Display */}
          {exportError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-700">{exportError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !stage}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              `Export ${exportOptions.format.toUpperCase()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}