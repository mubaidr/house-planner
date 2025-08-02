'use client';

import React, { ReactNode } from 'react';
import { Physics } from '@react-three/rapier';
import { useDesignStore } from '@/stores/designStore';

interface PhysicsWorldProps {
  children: ReactNode;
}

export function PhysicsWorld({ children }: PhysicsWorldProps) {
  const { scene3D } = useDesignStore();

  return (
    <Physics
      gravity={[0, -9.81, 0]}
      debug={scene3D.physics?.debug || false}
      paused={!scene3D.physics?.enabled}
      timeStep={1 / 60}
      interpolate={true}
      updateLoop="independent"
    >
      {children}
    </Physics>
  );
}

export default PhysicsWorld;
