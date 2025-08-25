import * as pdfMake_ from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as THREE from 'three';
import { Export3DSystem } from './export3D';

// Set up pdfMake fonts
const pdfMake = pdfMake_ as any;
pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;

export interface PDFExportOptions {
  title?: string;
  projectName?: string;
  clientName?: string;
  architect?: string;
  date?: string;
  scale?: string;
  includeFloorPlan?: boolean;
  include3DViews?: boolean;
  includeMaterials?: boolean;
  includeDimensions?: boolean;
  pageSize?: 'A4' | 'A3' | 'A2' | 'A1';
  orientation?: 'portrait' | 'landscape';
}

export interface ProjectInfo {
  title: string;
  projectName: string;
  clientName: string;
  architect: string;
  date: string;
  scale: string;
  address?: string;
  description?: string;
}

export class PDFExportSystem {
  private export3D: Export3DSystem;

  constructor() {
    this.export3D = new Export3DSystem();
  }

  setRenderer(renderer: THREE.WebGLRenderer) {
    this.export3D.setRenderer(renderer);
  }

  async exportProfessionalDrawing(
    scene: THREE.Scene,
    camera: THREE.Camera,
    projectInfo: ProjectInfo,
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    const {
      includeFloorPlan = true,
      include3DViews = true,
      includeMaterials = true,
      includeDimensions = true,
      // pageSize and orientation are used in the PDF document definition
      // but not directly in this function
    } = options;

    // Generate images
    const images: { [key: string]: string } = {};

    if (includeFloorPlan) {
      const floorPlanBlob = await this.export3D.export2DFloorPlan(scene, {
        showDimensions: includeDimensions,
        showLabels: true,
        scale: 50,
      });
      images.floorPlan = await this.blobToBase64(floorPlanBlob);
    }

    if (include3DViews) {
      // Front view
      const frontViewBlob = await this.export3D.exportHighQualityRender(scene, camera, {
        width: 1200,
        height: 800,
      });
      images.frontView = await this.blobToBase64(frontViewBlob);

      // Perspective view (current camera position)
      const perspectiveBlob = await this.export3D.exportHighQualityRender(scene, camera, {
        width: 1200,
        height: 800,
      });
      images.perspective = await this.blobToBase64(perspectiveBlob);
    }

    // Create PDF document definition
    const docDefinition = this.createPDFDefinition(projectInfo, images, options);

    return new Promise((resolve, reject) => {
      try {
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBlob((blob: Blob) => {
          resolve(blob);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private createPDFDefinition(
    projectInfo: ProjectInfo,
    images: { [key: string]: string },
    options: PDFExportOptions
  ) {
    const content: any[] = [];

    // Title page
    content.push(this.createTitlePage(projectInfo));

    // Floor plan page
    if (images.floorPlan) {
      content.push({ text: '', pageBreak: 'before' });
      content.push(this.createFloorPlanPage(images.floorPlan, projectInfo));
    }

    // 3D views page
    if (images.frontView || images.perspective) {
      content.push({ text: '', pageBreak: 'before' });
      content.push(this.create3DViewsPage(images, projectInfo));
    }

    // Materials and specifications page
    if (options.includeMaterials) {
      content.push({ text: '', pageBreak: 'before' });
      content.push(this.createMaterialsPage(projectInfo));
    }

    return {
      pageSize: options.pageSize || 'A3',
      pageOrientation: options.orientation || 'landscape',
      pageMargins: [40, 60, 40, 60] as [number, number, number, number],
      content,
      styles: this.getPDFStyles(),
      defaultStyle: {
        fontSize: 10,
        font: 'Helvetica',
      },
    };
  }

  private createTitlePage(projectInfo: ProjectInfo) {
    return [
      {
        text: 'ARCHITECTURAL DRAWING',
        style: 'header',
        alignment: 'center',
        margin: [0, 100, 0, 50],
      },
      {
        text: projectInfo.title,
        style: 'title',
        alignment: 'center',
        margin: [0, 0, 0, 30],
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [{ text: 'Project Information', style: 'sectionHeader', colSpan: 2 }, {}],
            ['Project Name:', projectInfo.projectName],
            ['Client:', projectInfo.clientName],
            ['Architect:', projectInfo.architect],
            ['Date:', projectInfo.date],
            ['Scale:', projectInfo.scale],
            ...(projectInfo.address ? [['Address:', projectInfo.address]] : []),
            ...(projectInfo.description ? [['Description:', projectInfo.description]] : []),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [100, 50, 100, 0],
      },
    ];
  }

  private createFloorPlanPage(floorPlanImage: string, projectInfo: ProjectInfo) {
    return [
      {
        text: 'FLOOR PLAN',
        style: 'pageHeader',
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },
      {
        image: floorPlanImage,
        width: 700,
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [{ text: 'Drawing Information', style: 'sectionHeader', colSpan: 3 }, {}, {}],
            ['Scale:', projectInfo.scale, 'Date: ' + projectInfo.date],
            ['Project:', projectInfo.projectName, 'Drawing: Floor Plan'],
            ['Architect:', projectInfo.architect, 'Sheet: 1 of 3'],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 20, 0, 0],
      },
    ];
  }

  private create3DViewsPage(images: { [key: string]: string }, projectInfo: ProjectInfo) {
    const content: any[] = [
      {
        text: '3D PERSPECTIVES',
        style: 'pageHeader',
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },
    ];

    if (images.frontView && images.perspective) {
      content.push({
        columns: [
          {
            width: '48%',
            stack: [
              { text: 'Front View', style: 'imageLabel', alignment: 'center' },
              { image: images.frontView, width: 350, alignment: 'center' },
            ],
          },
          { width: '4%', text: '' },
          {
            width: '48%',
            stack: [
              { text: 'Perspective View', style: 'imageLabel', alignment: 'center' },
              { image: images.perspective, width: 350, alignment: 'center' },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      });
    } else if (images.frontView) {
      content.push({
        image: images.frontView,
        width: 600,
        alignment: 'center',
        margin: [0, 0, 0, 20],
      });
    } else if (images.perspective) {
      content.push({
        image: images.perspective,
        width: 600,
        alignment: 'center',
        margin: [0, 0, 0, 20],
      });
    }

    content.push({
      table: {
        widths: ['*', '*', '*'],
        body: [
          [{ text: 'Drawing Information', style: 'sectionHeader', colSpan: 3 }, {}, {}],
          ['Scale:', 'As Shown', 'Date: ' + projectInfo.date],
          ['Project:', projectInfo.projectName, 'Drawing: 3D Views'],
          ['Architect:', projectInfo.architect, 'Sheet: 2 of 3'],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 20, 0, 0],
    });

    return content;
  }

  private createMaterialsPage(projectInfo: ProjectInfo) {
    return [
      {
        text: 'MATERIALS & SPECIFICATIONS',
        style: 'pageHeader',
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [{ text: 'Material Schedule', style: 'sectionHeader', colSpan: 3 }, {}, {}],
            ['Item', 'Material', 'Specification'],
            ['Walls', 'Brick/Concrete', 'Standard construction'],
            ['Floors', 'Hardwood/Tile', 'As per design'],
            ['Roof', 'Asphalt Shingles', 'Weather resistant'],
            ['Windows', 'Double Glazed', 'Energy efficient'],
            ['Doors', 'Solid Wood', 'Standard hardware'],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 30],
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [{ text: 'General Notes', style: 'sectionHeader', colSpan: 2 }, {}],
            ['1.', 'All dimensions to be verified on site'],
            ['2.', 'Materials to comply with local building codes'],
            ['3.', 'Contractor to verify all dimensions before construction'],
            ['4.', 'Any discrepancies to be reported to architect'],
            ['5.', 'All work to be carried out by qualified professionals'],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 30],
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [{ text: 'Drawing Information', style: 'sectionHeader', colSpan: 3 }, {}, {}],
            ['Scale:', 'N/A', 'Date: ' + projectInfo.date],
            ['Project:', projectInfo.projectName, 'Drawing: Specifications'],
            ['Architect:', projectInfo.architect, 'Sheet: 3 of 3'],
          ],
        },
        layout: 'lightHorizontalLines',
      },
    ];
  }

  private getPDFStyles() {
    return {
      header: {
        fontSize: 24,
        bold: true,
        color: '#2c3e50',
      },
      title: {
        fontSize: 20,
        bold: true,
        color: '#34495e',
      },
      pageHeader: {
        fontSize: 16,
        bold: true,
        color: '#2c3e50',
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        fillColor: '#ecf0f1',
        color: '#2c3e50',
      },
      imageLabel: {
        fontSize: 11,
        bold: true,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
    };
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
