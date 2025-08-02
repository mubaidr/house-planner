'use client';

import React, { useState, useCallback } from 'react';
import { Root, Container, Text } from '@react-three/uikit';
import { useDesignStore } from '@/stores/designStore';

interface UI3DPanelProps {
  position: [number, number, number];
  visible?: boolean;
  onClose?: () => void;
}

export function ElementPropertiesPanel3D({ position, visible = true, onClose }: UI3DPanelProps) {
  const { selection, updateDoor, updateWindow, updateWall } = useDesignStore();
  const [activeTab, setActiveTab] = useState<'properties' | 'materials' | 'physics'>('properties');

  const handlePropertyChange = useCallback((property: string, value: any) => {
    if (!selection.selectedElementId || !selection.selectedElementType) return;

    const elementId = selection.selectedElementId;
    const elementType = selection.selectedElementType;

    switch (elementType) {
      case 'door':
        updateDoor(elementId, { [property]: value });
        break;
      case 'window':
        updateWindow(elementId, { [property]: value });
        break;
      case 'wall':
        updateWall(elementId, { [property]: value });
        break;
    }
  }, [selection, updateDoor, updateWindow, updateWall]);

  if (!visible || !selection.selectedElementId) {
    return null;
  }

  return (
    <group position={position}>
      <Root
        sizeX={400}
        sizeY={300}
        backgroundColor="#ffffff"
        borderRadius={8}
        padding={16}
        flexDirection="column"
        alignItems="stretch"
      >
        {/* Header */}
        <Container
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom={16}
          paddingBottom={8}
        >
          <Text fontSize={18} fontWeight="bold" color="#1f2937">
            Element Properties
          </Text>
          <Container
            width={24}
            height={24}
            backgroundColor="#ef4444"
            borderRadius={4}
            justifyContent="center"
            alignItems="center"
            onClick={onClose}
          >
            <Text fontSize={14} color="#ffffff">✕</Text>
          </Container>
        </Container>

        {/* Tab Navigation */}
        <Container
          flexDirection="row"
          marginBottom={16}
          gap={8}
        >
          {['properties', 'materials', 'physics'].map((tab) => (
            <Container
              key={tab}
              paddingX={12}
              paddingY={6}
              backgroundColor={activeTab === tab ? '#3b82f6' : '#f3f4f6'}
              borderRadius={4}
              onClick={() => setActiveTab(tab as any)}
            >
              <Text
                fontSize={12}
                color={activeTab === tab ? '#ffffff' : '#6b7280'}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Container>
          ))}
        </Container>

        {/* Content Area */}
        <Container flexDirection="column" flexGrow={1} gap={12}>
          {activeTab === 'properties' && (
            <PropertiesTab
              elementType={selection.selectedElementType!}
              onPropertyChange={handlePropertyChange}
            />
          )}

          {activeTab === 'materials' && (
            <MaterialsTab onPropertyChange={handlePropertyChange} />
          )}

          {activeTab === 'physics' && (
            <PhysicsTab onPropertyChange={handlePropertyChange} />
          )}
        </Container>
      </Root>
    </group>
  );
}

// Properties Tab Component
function PropertiesTab({
  elementType,
  onPropertyChange,
}: {
  elementType: string;
  onPropertyChange: (property: string, value: any) => void;
}) {
  return (
    <Container flexDirection="column" gap={8}>
      <Text fontSize={14} fontWeight="semi-bold" color="#374151">
        Basic Properties
      </Text>

      {elementType === 'door' && (
        <>
          <PropertyRow
            label="Width"
            value="0.8m"
            onValueChange={(value) => onPropertyChange('width', parseFloat(value))}
          />
          <PropertyRow
            label="Height"
            value="2.0m"
            onValueChange={(value) => onPropertyChange('height', parseFloat(value))}
          />
          <PropertyRow
            label="Thickness"
            value="0.05m"
            onValueChange={(value) => onPropertyChange('thickness', parseFloat(value))}
          />
        </>
      )}

      {elementType === 'window' && (
        <>
          <PropertyRow
            label="Width"
            value="1.2m"
            onValueChange={(value) => onPropertyChange('width', parseFloat(value))}
          />
          <PropertyRow
            label="Height"
            value="1.0m"
            onValueChange={(value) => onPropertyChange('height', parseFloat(value))}
          />
          <PropertyRow
            label="Sill Height"
            value="0.9m"
            onValueChange={(value) => onPropertyChange('sillHeight', parseFloat(value))}
          />
        </>
      )}

      {elementType === 'wall' && (
        <>
          <PropertyRow
            label="Thickness"
            value="0.2m"
            onValueChange={(value) => onPropertyChange('thickness', parseFloat(value))}
          />
          <PropertyRow
            label="Height"
            value="2.4m"
            onValueChange={(value) => onPropertyChange('height', parseFloat(value))}
          />
        </>
      )}
    </Container>
  );
}

// Materials Tab Component
function MaterialsTab({
  onPropertyChange,
}: {
  onPropertyChange: (property: string, value: any) => void;
}) {
  const materials = [
    { id: 'wood', name: 'Wood', color: '#8B4513' },
    { id: 'metal', name: 'Metal', color: '#C0C0C0' },
    { id: 'glass', name: 'Glass', color: '#87CEEB' },
    { id: 'concrete', name: 'Concrete', color: '#A9A9A9' },
  ];

  return (
    <Container flexDirection="column" gap={8}>
      <Text fontSize={14} fontWeight="semi-bold" color="#374151">
        Material Selection
      </Text>

      <Container flexDirection="column" gap={4}>
        {materials.map((material) => (
          <Container
            key={material.id}
            flexDirection="row"
            alignItems="center"
            gap={8}
            padding={8}
            backgroundColor="#f9fafb"
            borderRadius={4}
            onClick={() => onPropertyChange('material', material)}
          >
            <Container
              width={20}
              height={20}
              backgroundColor={material.color}
              borderRadius={2}
            />
            <Text fontSize={12} color="#374151">
              {material.name}
            </Text>
          </Container>
        ))}
      </Container>
    </Container>
  );
}

// Physics Tab Component
function PhysicsTab({
  onPropertyChange,
}: {
  onPropertyChange: (property: string, value: any) => void;
}) {
  return (
    <Container flexDirection="column" gap={8}>
      <Text fontSize={14} fontWeight="semi-bold" color="#374151">
        Physics Settings
      </Text>

      <Container flexDirection="column" gap={4}>
        <Container
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          padding={8}
          backgroundColor="#f9fafb"
          borderRadius={4}
        >
          <Text fontSize={12} color="#374151">Enable Physics</Text>
          <Container
            width={40}
            height={20}
            backgroundColor="#3b82f6"
            borderRadius={10}
            onClick={() => onPropertyChange('physicsEnabled', true)}
          />
        </Container>

        <PropertyRow
          label="Mass"
          value="1.0"
          onValueChange={(value) => onPropertyChange('mass', parseFloat(value))}
        />

        <PropertyRow
          label="Friction"
          value="0.8"
          onValueChange={(value) => onPropertyChange('friction', parseFloat(value))}
        />

        <PropertyRow
          label="Restitution"
          value="0.2"
          onValueChange={(value) => onPropertyChange('restitution', parseFloat(value))}
        />
      </Container>
    </Container>
  );
}

// Property Row Component
function PropertyRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue] = useState(value);

  const handleSubmit = useCallback(() => {
    onValueChange(currentValue);
    setIsEditing(false);
  }, [currentValue, onValueChange]);

  return (
    <Container
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      padding={6}
      backgroundColor="#f9fafb"
      borderRadius={4}
    >
      <Text fontSize={12} color="#374151">
        {label}
      </Text>

      {isEditing ? (
        <Container
          flexDirection="row"
          gap={4}
          alignItems="center"
        >
          <Container
            width={60}
            height={24}
            backgroundColor="#ffffff"
            borderRadius={2}
            paddingX={4}
          >
            <Text fontSize={11} color="#111827">
              {currentValue}
            </Text>
          </Container>
          <Container
            width={20}
            height={20}
            backgroundColor="#10b981"
            borderRadius={2}
            justifyContent="center"
            alignItems="center"
            onClick={handleSubmit}
          >
            <Text fontSize={10} color="#ffffff">✓</Text>
          </Container>
        </Container>
      ) : (
        <Text
          fontSize={12}
          color="#6b7280"
          onClick={() => setIsEditing(true)}
        >
          {currentValue}
        </Text>
      )}
    </Container>
  );
}

// Floating Tool Palette
interface ToolPalette3DProps {
  position: [number, number, number];
  visible?: boolean;
}

export function ToolPalette3D({ position, visible = true }: ToolPalette3DProps) {
  const { addWall, addDoor, addWindow, addRoom } = useDesignStore();

  const tools = [
    { id: 'wall', icon: '🧱', label: 'Wall', action: () => addWall({ startX: 0, startY: 0, endX: 2, endY: 0, thickness: 0.2, height: 2.4, color: '#ffffff' }) },
    { id: 'door', icon: '🚪', label: 'Door', action: () => addDoor({ wallId: '', position: 50, width: 0.8, height: 2.0, thickness: 0.05, color: '#8B4513', openDirection: 'inward' }) },
    { id: 'window', icon: '🪟', label: 'Window', action: () => addWindow({ wallId: '', position: 50, width: 1.2, height: 1.0, sillHeight: 0.9, color: '#87CEEB' }) },
    { id: 'room', icon: '🏠', label: 'Room', action: () => addRoom({ name: 'New Room', points: [], floorMaterialId: 'floor-wood' }) },
  ];

  if (!visible) return null;

  return (
    <group position={position}>
      <Root
        sizeX={200}
        sizeY={300}
        backgroundColor="#ffffff"
        borderRadius={8}
        padding={12}
        flexDirection="column"
        gap={8}
      >
        <Text fontSize={16} fontWeight="bold" color="#1f2937">
          Tools
        </Text>

        {tools.map((tool) => (
          <Container
            key={tool.id}
            flexDirection="row"
            alignItems="center"
            gap={8}
            padding={8}
            backgroundColor="#f3f4f6"
            borderRadius={6}
            onClick={tool.action}
          >
            <Text fontSize={16}>{tool.icon}</Text>
            <Text fontSize={12} color="#374151" fontWeight="medium">
              {tool.label}
            </Text>
          </Container>
        ))}
      </Root>
    </group>
  );
}

// Information HUD
interface InfoHUD3DProps {
  position: [number, number, number];
  visible?: boolean;
}

export function InfoHUD3D({ position, visible = true }: InfoHUD3DProps) {
  const { walls, doors, windows, rooms, scene3D } = useDesignStore();

  if (!visible) return null;

  return (
    <group position={position}>
      <Root
        sizeX={250}
        sizeY={200}
        backgroundColor="rgba(0,0,0,0.8)"
        borderRadius={6}
        padding={12}
        flexDirection="column"
        gap={6}
      >
        <Text fontSize={14} fontWeight="bold" color="#ffffff">
          Scene Info
        </Text>

        <Container flexDirection="column" gap={4}>
          <Text fontSize={11} color="#d1d5db">
            Walls: {walls.length}
          </Text>
          <Text fontSize={11} color="#d1d5db">
            Doors: {doors.length}
          </Text>
          <Text fontSize={11} color="#d1d5db">
            Windows: {windows.length}
          </Text>
          <Text fontSize={11} color="#d1d5db">
            Rooms: {rooms.length}
          </Text>

          <Container marginTop={8} paddingTop={8}>
            <Text fontSize={11} color="#9ca3af">
              Camera: {scene3D.camera.position.map(p => p.toFixed(1)).join(', ')}
            </Text>
          </Container>

          <Text fontSize={11} color="#9ca3af">
            Quality: {scene3D.renderSettings.quality}
          </Text>

          <Text fontSize={11} color="#9ca3af">
            Physics: {scene3D.physics?.enabled ? 'ON' : 'OFF'}
          </Text>
        </Container>
      </Root>
    </group>
  );
}

export default ElementPropertiesPanel3D;
