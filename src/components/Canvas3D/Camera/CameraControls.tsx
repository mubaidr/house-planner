import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export function CameraControls() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  const isPanning = useRef(false);
  const isRotating = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  const handleMouseDown = (event: React.PointerEvent) => {
    if (event.button === 0) {
      isRotating.current = true;
    } else if (event.button === 2) {
      isPanning.current = true;
    }
    lastMousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseUp = (event: React.PointerEvent) => {
    if (event.button === 0) {
      isRotating.current = false;
    } else if (event.button === 2) {
      isPanning.current = false;
    }
  };

  const handleMouseMove = (event: React.PointerEvent) => {
    const deltaX = event.clientX - lastMousePosition.current.x;
    const deltaY = event.clientY - lastMousePosition.current.y;

    if (isRotating.current) {
      const rotationSpeed = 0.005;
      const yawAngle = -deltaX * rotationSpeed;
      const pitchAngle = -deltaY * rotationSpeed;

      const newPosition = camera.position.clone().sub(target.current);
      const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yawAngle);
      const pitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitchAngle);

      newPosition.applyQuaternion(yaw);
      newPosition.applyQuaternion(pitch);

      camera.position.copy(target.current).add(newPosition);
      camera.lookAt(target.current);
    }

    if (isPanning.current) {
      const panSpeed = 0.01;
      const right = new THREE.Vector3().crossVectors(camera.up, camera.position).normalize();
      const panOffset = right
        .multiplyScalar(-deltaX * panSpeed)
        .add(camera.up.clone().multiplyScalar(deltaY * panSpeed));
      camera.position.add(panOffset);
      target.current.add(panOffset);
    }

    lastMousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const handleWheel = (event: React.WheelEvent) => {
    const zoomSpeed = 0.1;
    const zoom = event.deltaY * -zoomSpeed;
    camera.position.z += zoom;
  };

  useFrame(() => {
    camera.lookAt(target.current);
  });

  return (
    <group
      onPointerDown={handleMouseDown}
      onPointerUp={handleMouseUp}
      onPointerMove={handleMouseMove}
      onWheel={handleWheel}
      onPointerLeave={handleMouseUp}
    >
      <mesh visible={false} position={[0, 0, 0]}>
        <sphereGeometry args={[100, 100, 100]} />
        <meshBasicMaterial transparent={true} opacity={0} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
