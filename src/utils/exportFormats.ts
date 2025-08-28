import { DesignState } from '@/stores/designStore';
import * as THREE from 'three';

export interface ExportOptions {
  format: 'obj' | 'stl' | 'dae' | 'gltf';
  includeMaterials?: boolean;
  includeTextures?: boolean;
  scale?: number;
  precision?: number;
}

export class ExportFormats {
  /**
   * Export design to OBJ format
   */
  static exportOBJ(designState: DesignState, options: ExportOptions = { format: 'obj' }): string {
    const { scale = 1, precision = 6 } = options;

    let objContent = '# House Planner Export\n';
    objContent += `# Generated on ${new Date().toISOString()}\n\n`;

    const vertices: THREE.Vector3[] = [];
    const faces: number[][] = [];
    let vertexIndex = 1;

    // Export walls
    designState.walls.forEach((wall, wallIndex) => {
      objContent += `o Wall_${wall.id}\n`;

      // Calculate wall vertices
      const wallStart = new THREE.Vector3(wall.start.x, wall.start.y, wall.start.z);
      const wallEnd = new THREE.Vector3(wall.end.x, wall.end.y, wall.end.z);
      const wallDir = new THREE.Vector3().subVectors(wallEnd, wallStart).normalize();
      const wallPerp = new THREE.Vector3(-wallDir.z, 0, wallDir.x);

      const halfThickness = wall.thickness / 2;
      const bottomLeft = wallStart.clone().add(wallPerp.clone().multiplyScalar(-halfThickness));
      const bottomRight = wallStart.clone().add(wallPerp.clone().multiplyScalar(halfThickness));
      const topLeft = bottomLeft.clone().add(new THREE.Vector3(0, wall.height, 0));
      const topRight = bottomRight.clone().add(new THREE.Vector3(0, wall.height, 0));

      const topLeftEnd = wallEnd
        .clone()
        .add(wallPerp.clone().multiplyScalar(-halfThickness))
        .add(new THREE.Vector3(0, wall.height, 0));
      const topRightEnd = wallEnd
        .clone()
        .add(wallPerp.clone().multiplyScalar(halfThickness))
        .add(new THREE.Vector3(0, wall.height, 0));
      const bottomLeftEnd = wallEnd.clone().add(wallPerp.clone().multiplyScalar(-halfThickness));
      const bottomRightEnd = wallEnd.clone().add(wallPerp.clone().multiplyScalar(halfThickness));

      // Add vertices
      const wallVertices = [
        bottomLeft,
        bottomRight,
        topRight,
        topLeft,
        bottomLeftEnd,
        bottomRightEnd,
        topRightEnd,
        topLeftEnd,
      ];
      wallVertices.forEach(vertex => {
        vertices.push(vertex);
        objContent += `v ${vertex.x.toFixed(precision)} ${vertex.y.toFixed(precision)} ${vertex.z.toFixed(precision)}\n`;
      });

      // Add faces (two triangles per face)
      const faceIndices = [
        [vertexIndex, vertexIndex + 1, vertexIndex + 2], // Bottom face
        [vertexIndex, vertexIndex + 2, vertexIndex + 3],
        [vertexIndex + 4, vertexIndex + 5, vertexIndex + 6], // Top face
        [vertexIndex + 4, vertexIndex + 6, vertexIndex + 7],
        [vertexIndex, vertexIndex + 1, vertexIndex + 5], // Front face
        [vertexIndex, vertexIndex + 5, vertexIndex + 4],
        [vertexIndex + 1, vertexIndex + 2, vertexIndex + 6], // Right face
        [vertexIndex + 1, vertexIndex + 6, vertexIndex + 5],
        [vertexIndex + 2, vertexIndex + 3, vertexIndex + 7], // Back face
        [vertexIndex + 2, vertexIndex + 7, vertexIndex + 6],
        [vertexIndex + 3, vertexIndex, vertexIndex + 4], // Left face
        [vertexIndex + 3, vertexIndex + 4, vertexIndex + 7],
      ];

      faceIndices.forEach(face => {
        objContent += `f ${face[0]} ${face[1]} ${face[2]}\n`;
      });

      vertexIndex += 8;
      objContent += '\n';
    });

    // Export doors
    designState.doors.forEach((door, doorIndex) => {
      objContent += `o Door_${door.id}\n`;

      // Find the wall this door belongs to
      const wall = designState.walls.find(w => w.id === door.wallId);
      if (!wall) return;

      // Calculate door position on wall
      const wallLength = Math.sqrt(
        Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
      );

      const positionRatio = door.position / 100;
      const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

      const doorCenter = new THREE.Vector3(
        wall.start.x + Math.cos(wallAngle) * wallLength * positionRatio,
        door.height / 2,
        wall.start.z + Math.sin(wallAngle) * wallLength * positionRatio
      );

      // Create door geometry (simplified as a box)
      const halfWidth = door.width / 2;
      const halfHeight = door.height / 2;
      const halfThickness = door.thickness / 2;

      const doorVertices = [
        new THREE.Vector3(
          doorCenter.x - halfWidth,
          doorCenter.y - halfHeight,
          doorCenter.z - halfThickness
        ),
        new THREE.Vector3(
          doorCenter.x + halfWidth,
          doorCenter.y - halfHeight,
          doorCenter.z - halfThickness
        ),
        new THREE.Vector3(
          doorCenter.x + halfWidth,
          doorCenter.y + halfHeight,
          doorCenter.z - halfThickness
        ),
        new THREE.Vector3(
          doorCenter.x - halfWidth,
          doorCenter.y + halfHeight,
          doorCenter.z - halfThickness
        ),
        new THREE.Vector3(
          doorCenter.x - halfWidth,
          doorCenter.y - halfHeight,
          doorCenter.z + halfThickness
        ),
        new THREE.Vector3(
          doorCenter.x + halfWidth,
          doorCenter.y - halfHeight,
          doorCenter.z + halfThickness
        ),
        new THREE.Vector3(
          doorCenter.x + halfWidth,
          doorCenter.y + halfHeight,
          doorCenter.z + halfThickness
        ),
        new THREE.Vector3(
          doorCenter.x - halfWidth,
          doorCenter.y + halfHeight,
          doorCenter.z + halfThickness
        ),
      ];

      doorVertices.forEach(vertex => {
        vertices.push(vertex);
        objContent += `v ${vertex.x.toFixed(precision)} ${vertex.y.toFixed(precision)} ${vertex.z.toFixed(precision)}\n`;
      });

      // Add faces
      const doorFaceIndices = [
        [vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex + 3], // Front
        [vertexIndex + 4, vertexIndex + 5, vertexIndex + 6, vertexIndex + 7], // Back
        [vertexIndex, vertexIndex + 1, vertexIndex + 5, vertexIndex + 4], // Bottom
        [vertexIndex + 1, vertexIndex + 2, vertexIndex + 6, vertexIndex + 5], // Right
        [vertexIndex + 2, vertexIndex + 3, vertexIndex + 7, vertexIndex + 6], // Top
        [vertexIndex + 3, vertexIndex, vertexIndex + 4, vertexIndex + 7], // Left
      ];

      doorFaceIndices.forEach(face => {
        objContent += `f ${face[0]} ${face[1]} ${face[2]} ${face[3]}\n`;
      });

      vertexIndex += 8;
      objContent += '\n';
    });

    return objContent;
  }

  /**
   * Export design to STL format (binary)
   */
  static exportSTL(
    designState: DesignState,
    options: ExportOptions = { format: 'stl' }
  ): ArrayBuffer {
    const triangles: { vertices: THREE.Vector3[]; normal: THREE.Vector3 }[] = [];

    // Convert walls to triangles
    designState.walls.forEach(wall => {
      const wallStart = new THREE.Vector3(wall.start.x, wall.start.y, wall.start.z);
      const wallEnd = new THREE.Vector3(wall.end.x, wall.end.y, wall.end.z);
      const wallDir = new THREE.Vector3().subVectors(wallEnd, wallStart).normalize();
      const wallPerp = new THREE.Vector3(-wallDir.z, 0, wallDir.x);

      const halfThickness = wall.thickness / 2;
      const bottomLeft = wallStart.clone().add(wallPerp.clone().multiplyScalar(-halfThickness));
      const bottomRight = wallStart.clone().add(wallPerp.clone().multiplyScalar(halfThickness));
      const topLeft = bottomLeft.clone().add(new THREE.Vector3(0, wall.height, 0));
      const topRight = bottomRight.clone().add(new THREE.Vector3(0, wall.height, 0));

      const topLeftEnd = wallEnd
        .clone()
        .add(wallPerp.clone().multiplyScalar(-halfThickness))
        .add(new THREE.Vector3(0, wall.height, 0));
      const topRightEnd = wallEnd
        .clone()
        .add(wallPerp.clone().multiplyScalar(halfThickness))
        .add(new THREE.Vector3(0, wall.height, 0));
      const bottomLeftEnd = wallEnd.clone().add(wallPerp.clone().multiplyScalar(-halfThickness));
      const bottomRightEnd = wallEnd.clone().add(wallPerp.clone().multiplyScalar(halfThickness));

      // Create triangles for each face
      const faces = [
        // Front face
        [bottomLeft, bottomRight, topRight],
        [bottomLeft, topRight, topLeft],
        // Back face
        [bottomLeftEnd, bottomRightEnd, topRightEnd],
        [bottomLeftEnd, topRightEnd, topLeftEnd],
        // Top face
        [topLeft, topRight, topRightEnd],
        [topLeft, topRightEnd, topLeftEnd],
        // Bottom face
        [bottomLeft, bottomRight, bottomRightEnd],
        [bottomLeft, bottomRightEnd, bottomLeftEnd],
        // Left face
        [bottomLeft, topLeft, topLeftEnd],
        [bottomLeft, topLeftEnd, bottomLeftEnd],
        // Right face
        [bottomRight, topRight, topRightEnd],
        [bottomRight, topRightEnd, bottomRightEnd],
      ];

      faces.forEach(face => {
        const normal = new THREE.Vector3()
          .crossVectors(
            new THREE.Vector3().subVectors(face[1], face[0]),
            new THREE.Vector3().subVectors(face[2], face[0])
          )
          .normalize();

        triangles.push({
          vertices: face,
          normal,
        });
      });
    });

    // Convert to STL binary format
    const buffer = new ArrayBuffer(80 + 4 + triangles.length * 50);
    const view = new DataView(buffer);
    let offset = 0;

    // Write header (80 bytes)
    const header = 'House Planner STL Export';
    for (let i = 0; i < Math.min(header.length, 80); i++) {
      view.setUint8(offset++, header.charCodeAt(i));
    }
    offset = 80;

    // Write triangle count
    view.setUint32(offset, triangles.length, true);
    offset += 4;

    // Write triangles
    triangles.forEach(triangle => {
      // Normal
      view.setFloat32(offset, triangle.normal.x, true);
      offset += 4;
      view.setFloat32(offset, triangle.normal.y, true);
      offset += 4;
      view.setFloat32(offset, triangle.normal.z, true);
      offset += 4;

      // Vertices
      triangle.vertices.forEach(vertex => {
        view.setFloat32(offset, vertex.x, true);
        offset += 4;
        view.setFloat32(offset, vertex.y, true);
        offset += 4;
        view.setFloat32(offset, vertex.z, true);
        offset += 4;
      });

      // Attribute byte count (unused)
      view.setUint16(offset, 0, true);
      offset += 2;
    });

    return buffer;
  }

  /**
   * Export design to GLTF format
   */
  static async exportGLTF(
    designState: DesignState,
    options: ExportOptions = { format: 'gltf' }
  ): Promise<string> {
    // This would require a more complex implementation with a GLTF exporter
    // For now, return a placeholder
    const gltfData = {
      asset: { version: '2.0' },
      scenes: [{ nodes: [] }],
      nodes: [],
      meshes: [],
      materials: [],
      buffers: [],
      bufferViews: [],
      accessors: [],
    };

    return JSON.stringify(gltfData, null, 2);
  }

  /**
   * Export design to DAE (Collada) format
   */
  static exportDAE(designState: DesignState, options: ExportOptions = { format: 'dae' }): string {
    // This would require a complex DAE exporter
    // For now, return a basic DAE structure
    let daeContent = '<?xml version="1.0" encoding="utf-8"?>\n';
    daeContent +=
      '<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">\n';
    daeContent += '  <asset>\n';
    daeContent += `    <created>${new Date().toISOString()}</created>\n`;
    daeContent += '    <modified>' + new Date().toISOString() + '</modified>\n';
    daeContent += '  </asset>\n';
    daeContent += '  <library_geometries>\n';

    // Add geometries for walls
    designState.walls.forEach((wall, index) => {
      daeContent += `    <geometry id="Wall_${wall.id}_geom">\n`;
      daeContent += '      <mesh>\n';
      daeContent += '        <source id="Wall_' + wall.id + '_positions">\n';
      daeContent +=
        '          <float_array id="Wall_' + wall.id + '_positions_array" count="24">\n';

      // Add vertex positions
      const positions = [
        wall.start.x,
        wall.start.y,
        wall.start.z,
        wall.end.x,
        wall.end.y,
        wall.end.z,
        wall.start.x,
        wall.start.y + wall.height,
        wall.start.z,
        wall.end.x,
        wall.end.y + wall.height,
        wall.end.z,
        wall.start.x + wall.thickness,
        wall.start.y,
        wall.start.z,
        wall.end.x + wall.thickness,
        wall.end.y,
        wall.end.z,
        wall.start.x + wall.thickness,
        wall.start.y + wall.height,
        wall.start.z,
        wall.end.x + wall.thickness,
        wall.end.y + wall.height,
        wall.end.z,
      ];

      daeContent += positions.join(' ') + '</float_array>\n';
      daeContent += '        </source>\n';
      daeContent += '      </mesh>\n';
      daeContent += '    </geometry>\n';
    });

    daeContent += '  </library_geometries>\n';
    daeContent += '</COLLADA>\n';

    return daeContent;
  }

  /**
   * Main export function
   */
  static async export(
    designState: DesignState,
    options: ExportOptions
  ): Promise<string | ArrayBuffer> {
    switch (options.format) {
      case 'obj':
        return this.exportOBJ(designState, options);
      case 'stl':
        return this.exportSTL(designState, options);
      case 'gltf':
        return await this.exportGLTF(designState, options);
      case 'dae':
        return this.exportDAE(designState, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Download exported file
   */
  static downloadExport(data: string | ArrayBuffer, filename: string, format: string): void {
    const blob = new Blob([data], {
      type:
        format === 'stl'
          ? 'application/octet-stream'
          : format === 'obj'
            ? 'text/plain'
            : format === 'dae'
              ? 'text/xml'
              : 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
