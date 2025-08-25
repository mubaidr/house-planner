import { Export3DSystem, ExportOptions, ScreenshotOptions, FloorPlanOptions } from '@/utils/3d/export3D';
import { PDFExportSystem, ProjectInfo, PDFExportOptions } from '@/utils/3d/pdfExport';
import { useThree } from '@react-three/fiber';
import { saveAs } from 'file-saver';
import { useState, useRef, useEffect } from 'react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportType = 'model' | 'image' | 'floorplan' | 'pdf';
type ModelFormat = 'gltf' | 'obj';
type ImageFormat = 'png' | 'jpeg' | 'webp';

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { scene, camera, gl } = useThree();
  const [exportType, setExportType] = useState<ExportType>('model');
  const [modelFormat, setModelFormat] = useState<ModelFormat>('gltf');
  const [imageFormat, setImageFormat] = useState<ImageFormat>('png');
  const [imageWidth, setImageWidth] = useState(1920);
  const [imageHeight, setImageHeight] = useState(1080);
  const [imageQuality, setImageQuality] = useState(0.95);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  
  // Project info for PDF export
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    title: 'House Design',
    projectName: 'Residential Project',
    clientName: 'Client Name',
    architect: 'Architect Name',
    date: new Date().toLocaleDateString(),
    scale: '1:100',
    address: '',
    description: ''
  });

  const exportSystemRef = useRef<Export3DSystem>();
  const pdfSystemRef = useRef<PDFExportSystem>();

  useEffect(() => {
    if (gl) {
      exportSystemRef.current = new Export3DSystem();
      exportSystemRef.current.setRenderer(gl);
      
      pdfSystemRef.current = new PDFExportSystem();
      pdfSystemRef.current.setRenderer(gl);
    }
  }, [gl]);

  const handleExport = async () => {
    if (!exportSystemRef.current || !pdfSystemRef.current) return;

    setIsExporting(true);
    setExportProgress('Preparing export...');

    try {
      let blob: Blob;
      let filename: string;

      switch (exportType) {
        case 'model':
          setExportProgress('Exporting 3D model...');
          const exportOptions: Partial<ExportOptions> = {
            binary: modelFormat === 'gltf',
            embedImages: true
          };
          
          if (modelFormat === 'gltf') {
            blob = await exportSystemRef.current.exportGLTF(scene, exportOptions);
            filename = `house-design.${exportOptions.binary ? 'glb' : 'gltf'}`;
          } else {
            blob = await exportSystemRef.current.exportOBJ(scene);
            filename = 'house-design.obj';
          }
          break;

        case 'image':
          setExportProgress('Rendering high-quality image...');
          const screenshotOptions: ScreenshotOptions = {
            width: imageWidth,
            height: imageHeight,
            quality: imageQuality,
            format: imageFormat
          };
          
          blob = await exportSystemRef.current.exportHighQualityRender(
            scene,
            camera,
            screenshotOptions
          );
          filename = `house-design.${imageFormat}`;
          break;

        case 'floorplan':
          setExportProgress('Generating 2D floor plan...');
          const floorPlanOptions: FloorPlanOptions = {
            showDimensions: true,
            showLabels: true,
            scale: 50
          };
          
          blob = await exportSystemRef.current.export2DFloorPlan(scene, floorPlanOptions);
          filename = 'floor-plan.png';
          break;

        case 'pdf':
          setExportProgress('Creating professional drawings...');
          const pdfOptions: PDFExportOptions = {
            includeFloorPlan: true,
            include3DViews: true,
            includeMaterials: true,
            includeDimensions: true,
            pageSize: 'A3',
            orientation: 'landscape'
          };
          
          blob = await pdfSystemRef.current.exportProfessionalDrawing(
            scene,
            camera,
            projectInfo,
            pdfOptions
          );
          filename = 'architectural-drawings.pdf';
          break;

        default:
          throw new Error('Invalid export type');
      }

      setExportProgress('Downloading...');
      saveAs(blob, filename);
      setExportProgress('Export completed!');
      
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Export Project</h2>
        
        <div className="space-y-6">
          {/* Export Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportType('model')}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  exportType === 'model' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">3D Model</div>
                <div className="text-sm text-gray-600">GLTF, OBJ formats</div>
              </button>
              
              <button
                onClick={() => setExportType('image')}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  exportType === 'image' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">High-Res Image</div>
                <div className="text-sm text-gray-600">PNG, JPEG, WebP</div>
              </button>
              
              <button
                onClick={() => setExportType('floorplan')}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  exportType === 'floorplan' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">2D Floor Plan</div>
                <div className="text-sm text-gray-600">Top-down view with dimensions</div>
              </button>
              
              <button
                onClick={() => setExportType('pdf')}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  exportType === 'pdf' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Professional PDF</div>
                <div className="text-sm text-gray-600">Complete architectural drawings</div>
              </button>
            </div>
          </div>

          {/* Format-specific options */}
          {exportType === 'model' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model Format</label>
              <select
                value={modelFormat}
                onChange={e => setModelFormat(e.target.value as ModelFormat)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="gltf">GLTF (Recommended)</option>
                <option value="obj">OBJ (Legacy)</option>
              </select>
            </div>
          )}

          {exportType === 'image' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Format</label>
                <select
                  value={imageFormat}
                  onChange={e => setImageFormat(e.target.value as ImageFormat)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="png">PNG (Best Quality)</option>
                  <option value="jpeg">JPEG (Smaller Size)</option>
                  <option value="webp">WebP (Modern)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                  <input
                    type="number"
                    value={imageWidth}
                    onChange={e => setImageWidth(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="640"
                    max="7680"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <input
                    type="number"
                    value={imageHeight}
                    onChange={e => setImageHeight(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="480"
                    max="4320"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality: {Math.round(imageQuality * 100)}%
                </label>
                <input
                  type="range"
                  value={imageQuality}
                  onChange={e => setImageQuality(Number(e.target.value))}
                  className="w-full"
                  min="0.1"
                  max="1"
                  step="0.05"
                />
              </div>
            </div>
          )}

          {exportType === 'pdf' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={projectInfo.projectName}
                    onChange={e => setProjectInfo(prev => ({ ...prev, projectName: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={projectInfo.clientName}
                    onChange={e => setProjectInfo(prev => ({ ...prev, clientName: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Architect</label>
                  <input
                    type="text"
                    value={projectInfo.architect}
                    onChange={e => setProjectInfo(prev => ({ ...prev, architect: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scale</label>
                  <input
                    type="text"
                    value={projectInfo.scale}
                    onChange={e => setProjectInfo(prev => ({ ...prev, scale: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          {isExporting && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-800">{exportProgress}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
