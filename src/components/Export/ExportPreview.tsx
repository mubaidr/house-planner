'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useDebounce } from '@/hooks/useDebounce';
import { composeSheet } from '@/utils/exportUtils2D';
import { DrawingSheet, DEFAULT_SHEETS } from '@/types/drawingSheet2D';
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.pdfMake.vfs

interface ExportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ZoomControls {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export default function ExportPreview({ isOpen, onClose }: ExportPreviewProps) {
  const { selectedSheet } = useUIStore();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomControls, setZoomControls] = useState<ZoomControls>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [pdfError, setPdfError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Debounce the selected sheet to avoid excessive re-renders
  const debouncedSelectedSheet = useDebounce(selectedSheet, 300);

  // Generate preview when selectedSheet changes
  useEffect(() => {
    if (debouncedSelectedSheet && isOpen) {
      generatePreview(debouncedSelectedSheet);
    }
  }, [debouncedSelectedSheet, isOpen]);

  // Initialize with a default sheet if none is selected
  useEffect(() => {
    if (isOpen && !selectedSheet) {
      // Set a default sheet for preview
      const defaultSheet = DEFAULT_SHEETS[0];
      generatePreview(defaultSheet);
    }
  }, [isOpen, selectedSheet]);

  const generatePreview = useCallback(async (sheet: DrawingSheet) => {
    if (!sheet) return;

    setIsGenerating(true);
    setError(null);

    try {
      const composedCanvas = await composeSheet(sheet);
      setCanvas(composedCanvas);

      // Reset zoom controls when new preview is generated
      setZoomControls({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
      console.error('Preview generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // PDF Export Handler
  const handlePdfExport = async () => {
    setPdfError(null)
    try {
      if (!canvas) throw new Error('No preview available')
      // Convert canvas to data URL
      const imgData = canvas.toDataURL('image/png')
      // Build PDF document definition
      const docDefinition = {
        content: [
          {
            image: imgData,
            width: 500
          }
        ],
        pageSize: selectedSheet?.size || 'A4',
        pageOrientation: selectedSheet?.orientation?.toLowerCase() || 'portrait'
      }
      pdfMake.createPdf(docDefinition).download('design-export.pdf')
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'PDF export failed')
    }
  }

  // Zoom controls
  const handleZoomIn = () => {
    setZoomControls(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 5)
    }));
  };

  const handleZoomOut = () => {
    setZoomControls(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.1)
    }));
  };

  const handleZoomReset = () => {
    setZoomControls({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
  };

  const handleZoomFit = () => {
    if (!canvas || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 40; // Account for padding
    const containerHeight = container.clientHeight - 40;

    const scaleX = containerWidth / canvas.width;
    const scaleY = containerHeight / canvas.height;
    const fitScale = Math.min(scaleX, scaleY);

    setZoomControls({
      scale: fitScale,
      offsetX: 0,
      offsetY: 0,
    });
  };

  // Mouse drag controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - zoomControls.offsetX, y: e.clientY - zoomControls.offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    setZoomControls(prev => ({
      ...prev,
      offsetX: e.clientX - dragStart.x,
      offsetY: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch controls for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - zoomControls.offsetX, y: touch.clientY - zoomControls.offsetY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;

    e.preventDefault();
    const touch = e.touches[0];
    setZoomControls(prev => ({
      ...prev,
      offsetX: touch.clientX - dragStart.x,
      offsetY: touch.clientY - dragStart.y,
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Render canvas to a display canvas with zoom and pan
  useEffect(() => {
    if (canvas && canvasRef.current) {
      const displayCanvas = canvasRef.current;
      const ctx = displayCanvas.getContext('2d');
      if (!ctx) return;

      // Set display canvas size
      displayCanvas.width = canvas.width;
      displayCanvas.height = canvas.height;

      // Clear and draw
      ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
      ctx.drawImage(canvas, 0, 0);
    }
  }, [canvas, zoomControls]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-preview-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[90vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2
            id="export-preview-title"
            className="text-xl font-semibold text-gray-800"
            aria-label="Export Preview"
          >
            Export Preview
          </h2>
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-200 rounded"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-sm font-mono min-w-12 text-center" aria-live="polite">
                {Math.round(zoomControls.scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-200 rounded"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              title="Reset Zoom"
              aria-label="Reset Zoom"
            >
              1:1
            </button>

            <button
              onClick={handleZoomFit}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              title="Fit to Screen"
              aria-label="Fit to Screen"
            >
              Fit
            </button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close Export Preview"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden bg-gray-50 relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg text-gray-600">Generating preview...</span>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Error</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : canvas ? (
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <canvas
                ref={canvasRef}
                className="shadow-lg border border-gray-300"
                style={{
                  transform: `translate(${zoomControls.offsetX}px, ${zoomControls.offsetY}px) scale(${zoomControls.scale})`,
                  transformOrigin: 'center center'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Preview Available</h3>
                <p className="text-gray-600">Select a drawing sheet to generate preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedSheet ? (
                <span>Preview: {selectedSheet.title} ({selectedSheet.size} {selectedSheet.orientation})</span>
              ) : (
                <span>Preview: Default Sheet (A4 Portrait)</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-500">
                Use mouse/touch to pan • Scroll to zoom
              </div>
              <button
                onClick={handlePdfExport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Export PDF
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          {pdfError && (
            <div className="mt-2 text-sm text-red-600">{pdfError}</div>
          )}
        </div>
      </div>
    </div>
  );
}
