'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Stage } from 'konva/lib/Stage';
import { 
  ExportOptions, 
  exportToPNG, 
  exportToPDF, 
  downloadFile, 
  generateFilename,
  getExportPreview 
} from '@/utils/exportUtils';
import {
  MultiViewExportOptions,
  exportMultiViewToPDF,
  generateExportPreview,
  DEFAULT_MULTI_VIEW_OPTIONS,
  batchExport,
  downloadBatchAsZip,
  BatchExportItem
} from '@/utils/exportUtils2D';
import {
  ExportTemplate,
  getTemplatesByCategory,
  applyTemplate,
  generateTemplatePreview
} from '@/utils/exportTemplates';
import { ViewType2D } from '@/types/views';
import { useViewStore } from '@/stores/viewStore';
import { useFloorStore } from '@/stores/floorStore';
import { useExportProgressStore } from '@/stores/exportProgressStore';
import ExportPreview from './ExportPreview';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage | null;
  stages?: Record<ViewType2D, Stage | null>; // For multi-view export
}

export default function ExportDialog({ isOpen, onClose, stage, stages }: ExportDialogProps) {
  const { currentView } = useViewStore();
  const { floors } = useFloorStore();
  const { 
    startExport,
    updateProgress,
    setError,
    finishExport
  } = useExportProgressStore();
  
  const [exportMode, setExportMode] = useState<'single' | 'multi' | 'template' | 'batch'>('single');
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [templateCategory, setTemplateCategory] = useState<'residential' | 'commercial' | 'technical' | 'presentation'>('residential');
  const [selectedFloors, setSelectedFloors] = useState<string[]>(floors.map(f => f.id));
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
  
  const [multiViewOptions, setMultiViewOptions] = useState<MultiViewExportOptions>({
    ...DEFAULT_MULTI_VIEW_OPTIONS,
    title: 'House Plan - Multi-View',
    description: 'Created with 2D House Planner',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [exportError, setExportError] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef<HTMLImageElement>(null);

  // Utility functions for updating options
  const updateOption = (key: keyof ExportOptions, value: unknown) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateMultiViewOption = (key: keyof MultiViewExportOptions, value: unknown) => {
    setMultiViewOptions(prev => ({ ...prev, [key]: value }));
  };

  // Implement batch export functionality
  const handleBatchExport = async () => {
    if (!stages || selectedFloors.length === 0) return;
    
    try {
      setIsExporting(true);
      startExport();
      
      const batchItems: BatchExportItem[] = selectedFloors.map(floorId => {
        const floor = floors.find(f => f.id === floorId);
        return {
          id: floorId,
          name: floor?.name || `Floor-${floorId}`,
          stages,
          options: multiViewOptions,
        };
      });

      const results = await batchExport(batchItems, (completed, total, currentItem) => {
        updateProgress(Math.round((completed / total) * 100));
      });

      await downloadBatchAsZip(results, 'house-plans-batch');
      finishExport();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Batch export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle floor selection for batch export
  const handleFloorSelection = (floorId: string) => {
    setSelectedFloors(prev => 
      selected 
        ? [...prev, floorId]
        : prev.filter(id => id !== floorId)
    );
  };


  // Template handling
  const availableTemplates = React.useMemo(() => 
    getTemplatesByCategory(templateCategory), [templateCategory]);

  const handleTemplateSelect = React.useCallback((template: ExportTemplate) => {
    setSelectedTemplate(template);
    const templateOptions = applyTemplate(template, multiViewOptions);
    setMultiViewOptions(templateOptions);
    setExportMode('template');
  }, [multiViewOptions]);

  const generatePreview = React.useCallback(async () => {
    if (exportMode === 'single' && !stage) return;
    if (exportMode === 'multi' && !stages) return;
    
    try {
      if (exportMode === 'single' && stage) {
        const previewUrl = await getExportPreview(stage, 300, 200);
        setPreview(previewUrl);
      } else if (exportMode === 'multi' && stages) {
        // Filter out null stages and create valid stages record
        const validStages: Record<ViewType2D, Stage> = {};
        multiViewOptions.views.forEach(viewType => {
          if (stages[viewType]) {
            validStages[viewType] = stages[viewType]!;
          }
        });
        
        if (Object.keys(validStages).length > 0) {
          const multiPreview = await generateExportPreview(validStages, multiViewOptions);
          setPreview(multiPreview.dataUrl);
        }
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  }, [stage, stages, exportMode, multiViewOptions]);

  // Generate preview when dialog opens or options change
  React.useEffect(() => {
    if (isOpen && (stage || stages)) {
      generatePreview();
    }
  }, [isOpen, stage, stages, exportMode, exportOptions.scale, multiViewOptions, generatePreview]);

  const handleExport = async () => {
    if (exportMode === 'single' && !stage) return;
    if (exportMode === 'multi' && !stages) return;
    if (exportMode === 'template' && (!selectedTemplate || !stages)) return;

    setIsExporting(true);
    setExportError('');

    try {
      let blob: Blob;
      let filename: string;
      
      if (exportMode === 'single' && stage) {
        // Single view export
        let result;
        
        if (exportOptions.format === 'png') {
          result = await exportToPNG(stage, exportOptions);
        } else {
          result = await exportToPDF(stage, exportOptions);
        }

        if (result.success && result.blob) {
          blob = result.blob;
          filename = generateFilename(exportOptions.format, exportOptions.title);
        } else {
          setExportError(result.error || 'Export failed');
          return;
        }
      } else if (exportMode === 'multi' && stages) {
        // Multi-view export
        const validStages: Record<ViewType2D, Stage> = {};
        multiViewOptions.views.forEach(viewType => {
          if (stages[viewType]) {
            validStages[viewType] = stages[viewType]!;
          }
        });
        
        if (Object.keys(validStages).length === 0) {
          setExportError('No valid views available for export');
          return;
        }
        
        blob = await exportMultiViewToPDF(validStages, multiViewOptions);
        filename = generateFilename('pdf', multiViewOptions.title);
      } else if (exportMode === 'template' && selectedTemplate && stages) {
        // Template export
        const validStages: Record<ViewType2D, Stage> = {};
        selectedTemplate.views.forEach(viewType => {
          if (stages[viewType]) {
            validStages[viewType] = stages[viewType]!;
          }
        });
        
        if (Object.keys(validStages).length === 0) {
          setExportError('No valid views available for template export');
          return;
        }
        
        const templateOptions = applyTemplate(selectedTemplate, multiViewOptions);
        blob = await exportMultiViewToPDF(validStages, templateOptions);
        filename = generateFilename('pdf', templateOptions.title || selectedTemplate.name);
      } else {
        setExportError('Invalid export configuration');
        return;
      }

      downloadFile(blob, filename);
      onClose();
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsExporting(false);
    }
  };



  // Check if multi-view export is available
  const isMultiViewAvailable = stages && Object.values(stages).some(stage => stage !== null);

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
          {/* Export Mode Selection */}
          {isMultiViewAvailable && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Export Mode</h3>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="single"
                    checked={exportMode === 'single'}
                    onChange={(e) => setExportMode(e.target.value as 'single' | 'multi' | 'template' | 'batch')}
                    className="mr-2"
                  />
                  Single View ({currentView})
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="multi"
                    checked={exportMode === 'multi'}
                    onChange={(e) => setExportMode(e.target.value as 'single' | 'multi' | 'template' | 'batch')}
                    className="mr-2"
                  />
                  Multi-View Layout
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="template"
                    checked={exportMode === 'template'}
                    onChange={(e) => setExportMode(e.target.value as 'single' | 'multi' | 'template' | 'batch')}
                    className="mr-2"
                  />
                  Professional Templates
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="batch"
                    checked={exportMode === 'batch'}
                    onChange={(e) => setExportMode(e.target.value as 'single' | 'multi' | 'template' | 'batch')}
                    className="mr-2"
                  />
                  Batch Export
                </label>
              </div>
            </div>
          )}

          {/* Template Selection */}
          {exportMode === 'template' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Professional Templates</h3>
              
              {/* Template Category Selection */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Category</label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value as HTMLSelectElement['value'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="technical">Technical</option>
                  <option value="presentation">Presentation</option>
                </select>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-2 gap-4">
                {availableTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <Image
                        src={generateTemplatePreview(template)}
                        alt={`${template.name} preview`}
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    <h4 className="font-medium text-sm text-gray-800">{template.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>{template.paperSize} {template.orientation}</span>
                      <span>{template.views.length} views</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Template Details */}
              {selectedTemplate && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">{selectedTemplate.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{selectedTemplate.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Paper Size:</span> {selectedTemplate.paperSize}
                    </div>
                    <div>
                      <span className="font-medium">Orientation:</span> {selectedTemplate.orientation}
                    </div>
                    <div>
                      <span className="font-medium">Views:</span> {selectedTemplate.views.join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {selectedTemplate.category}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Preview {exportMode === 'multi' ? '(Multi-View Layout)' : `(${currentView} view)`}
              </h3>
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center"
                title="Open fullscreen preview"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Fullscreen
              </button>
            </div>
            <div className="flex justify-center">
              {preview ? (
                <Image
                  ref={previewRef}
                  src={preview}
                  alt="Export preview"
                  width={300}
                  height={200}
                  className="max-w-full h-auto border border-gray-300 rounded shadow-sm object-contain cursor-pointer"
                  style={{ maxHeight: '200px' }}
                  onClick={() => setIsPreviewOpen(true)}
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
                  {exportMode === 'single' ? (
                    <>
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
                    </>
                  ) : (
                    <div className="text-sm text-gray-600">
                      Multi-view export is only available as PDF
                    </div>
                  )}
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

            {/* Multi-View Options */}
            {exportMode === 'multi' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Multi-View Settings</h3>
                
                {/* View Selection */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Views to Include</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['plan', 'front', 'back', 'left', 'right'] as ViewType2D[]).map((view) => (
                      <label key={view} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={multiViewOptions.views.includes(view)}
                          onChange={(e) => {
                            const newViews = e.target.checked
                              ? [...multiViewOptions.views, view]
                              : multiViewOptions.views.filter(v => v !== view);
                            updateMultiViewOption('views', newViews);
                          }}
                          className="mr-2"
                          disabled={!stages?.[view]}
                        />
                        <span className={!stages?.[view] ? 'text-gray-400' : ''}>
                          {view.charAt(0).toUpperCase() + view.slice(1)}
                          {!stages?.[view] && ' (unavailable)'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Layout Options */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Layout</label>
                  <select
                    value={multiViewOptions.layout}
                    onChange={(e) => updateMultiViewOption('layout', e.target.value as 'grid' | 'sequential' | 'custom')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="grid">Grid Layout</option>
                    <option value="sequential">Sequential Layout</option>
                  </select>
                </div>

                {/* Paper Size */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Paper Size</label>
                  <select
                    value={multiViewOptions.paperSize}
                    onChange={(e) => updateMultiViewOption('paperSize', e.target.value as MultiViewExportOptions['paperSize'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="A3">A3 (297 × 420 mm)</option>
                    <option value="A2">A2 (420 × 594 mm)</option>
                    <option value="A1">A1 (594 × 841 mm)</option>
                    <option value="Letter">Letter (8.5 × 11 in)</option>
                    <option value="Legal">Legal (8.5 × 14 in)</option>
                    <option value="Tabloid">Tabloid (11 × 17 in)</option>
                  </select>
                </div>

                {/* Orientation */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Orientation</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="portrait"
                        checked={multiViewOptions.orientation === 'portrait'}
                        onChange={(e) => updateMultiViewOption('orientation', e.target.value as 'portrait' | 'landscape')}
                        className="mr-2"
                      />
                      Portrait
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="landscape"
                        checked={multiViewOptions.orientation === 'landscape'}
                        onChange={(e) => updateMultiViewOption('orientation', e.target.value as 'portrait' | 'landscape')}
                        className="mr-2"
                      />
                      Landscape
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Options */}
            {exportMode === 'single' && exportOptions.format === 'pdf' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">PDF Settings</h3>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Paper Size</label>
                  <select
                    value={exportOptions.paperSize}
                    onChange={(e) => updateOption('paperSize', e.target.value as 'A4' | 'A3' | 'Letter' | 'Legal')}
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
                        onChange={(e) => updateOption('orientation', e.target.value as 'portrait' | 'landscape')}
                        className="mr-2"
                      />
                      Portrait
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="landscape"
                        checked={exportOptions.orientation === 'landscape'}
                        onChange={(e) => updateOption('orientation', e.target.value as 'portrait' | 'landscape')}
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
                  checked={exportMode === 'single' ? exportOptions.includeGrid : multiViewOptions.includeGrid}
                  onChange={(e) => {
                    if (exportMode === 'single') {
                      updateOption('includeGrid', e.target.checked);
                    } else {
                      updateMultiViewOption('includeGrid', e.target.checked);
                    }
                  }}
                  className="mr-2"
                />
                Include Grid
              </label>
              {exportMode === 'single' && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeRooms}
                    onChange={(e) => updateOption('includeRooms', e.target.checked)}
                    className="mr-2"
                  />
                  Include Rooms
                </label>
              )}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportMode === 'single' ? exportOptions.includeMeasurements : multiViewOptions.includeMeasurements}
                  onChange={(e) => {
                    if (exportMode === 'single') {
                      updateOption('includeMeasurements', e.target.checked);
                    } else {
                      updateMultiViewOption('includeMeasurements', e.target.checked);
                    }
                  }}
                  className="mr-2"
                />
                Include Measurements
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportMode === 'single' ? exportOptions.includeMeasurements : multiViewOptions.includeAnnotations}
                  onChange={(e) => {
                    if (exportMode === 'single') {
                      // For single view, we use includeMeasurements for annotations too
                      updateOption('includeMeasurements', e.target.checked);
                    } else {
                      updateMultiViewOption('includeAnnotations', e.target.checked);
                    }
                  }}
                  className="mr-2"
                />
                Include Annotations
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
                value={exportMode === 'single' ? (exportOptions.title || '') : (multiViewOptions.title || '')}
                onChange={(e) => {
                  if (exportMode === 'single') {
                    updateOption('title', e.target.value);
                  } else {
                    updateMultiViewOption('title', e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter document title"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Description</label>
              <textarea
                value={exportMode === 'single' ? (exportOptions.description || '') : (multiViewOptions.description || '')}
                onChange={(e) => {
                  if (exportMode === 'single') {
                    updateOption('description', e.target.value);
                  } else {
                    updateMultiViewOption('description', e.target.value);
                  }
                }}
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
            disabled={isExporting || (exportMode === 'single' && !stage) || (exportMode === 'multi' && (!stages || multiViewOptions.views.length === 0)) || (exportMode === 'template' && (!selectedTemplate || !stages))}
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
            ) : exportMode === 'single' ? (
              `Export ${exportOptions.format.toUpperCase()}`
            ) : exportMode === 'template' ? (
              `Export Template: ${selectedTemplate?.name || 'Select Template'}`
            ) : (
              `Export Multi-View PDF (${multiViewOptions.views.length} views)`
            )}
          </button>
        </div>
      </div>
      
      {/* Export Preview Modal */}
      <ExportPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
