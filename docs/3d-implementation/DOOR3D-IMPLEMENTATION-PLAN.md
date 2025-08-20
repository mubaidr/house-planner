# Door3D Component Implementation Plan

> **Detailed implementation plan for the Door3D component**

---

## 📋 Overview

This document provides a detailed implementation plan for the Door3D component, which is the first element to be implemented in Phase 2 of the 3D House Planner.

## 🎯 Objectives

1. Create a Door3D component that renders realistic 3D doors
2. Implement wall-attached placement with precise positioning
3. Add opening animations (swing, slide)
4. Create door configuration panel (size, type, material)

## 🏗️ Component Structure

### Door3D Component Interface

```typescript
interface Door3DProps {
  door: Door;
  wall: Wall;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (updates: Partial<Door>) => void;
}
```

### Door Data Model

```typescript
interface Door {
  id: string;
  wallId: string;
  position: number; // Normalized position (0-1) along the wall
  width: number;
  height: number;
  thickness: number;
  type: 'hinged' | 'sliding' | 'folding' | 'revolving';
  swingDirection: 'left' | 'right' | 'both';
  materialId?: string;
  frameMaterialId?: string;
  isOpen: boolean;
  openAngle: number; // 0-90 degrees for hinged doors
  openOffset: number; // 0-1 for sliding doors
}
```

## 🎨 Visual Design

### Door Types

1. **Hinged Door**
   - Single panel swinging on hinges
   - Swing direction (left/right/both)
   - Opening angle (0-90 degrees)

2. **Sliding Door**
   - Panel sliding horizontally
   - Opening offset (0-1)
   - Single or double panel

3. **Folding Door**
   - Multiple panels folding accordion-style
   - Bi-fold or tri-fold configurations

4. **Revolving Door**
   - Circular door rotating around central axis
   - 2-wing or 4-wing configurations

### Materials

1. **Door Panel**
   - Wood textures (oak, pine, walnut)
   - Metal finishes (brushed steel, chrome)
   - Glass options (clear, frosted, tinted)

2. **Door Frame**
   - Wood frames matching panel
   - Metal frames (aluminum, steel)
   - Composite materials

## 🔧 Implementation Steps

### Week 1: Basic Door Component

#### Day 1-2: Component Structure

```typescript
// src/components/Canvas3D/Elements/Door3D.tsx
import { useMemo } from 'react';
import { BoxGeometry, MeshStandardMaterial } from 'three';
import { useDesignStore } from '@/stores/designStore';

export function Door3D({ door, wall, isSelected, onSelect }: Door3DProps) {
  // Calculate door position on wall
  const doorPosition = useMemo(() => {
    // Implementation details
  }, [door, wall]);

  // Calculate door geometry
  const doorGeometry = useMemo(() => {
    // Implementation details
  }, [door]);

  // Door material
  const doorMaterial = useMemo(() => {
    // Implementation details
  }, [door.materialId]);

  return (
    <group position={doorPosition} onClick={onSelect}>
      <mesh geometry={doorGeometry} material={doorMaterial}>
        {/* Door panel */}
      </mesh>
    </group>
  );
}
```

#### Day 3-4: Position Calculation

```typescript
// src/utils/3d/doorPosition.ts
export function calculateDoorPosition(door: Door, wall: Wall): Vector3 {
  // Calculate position along wall
  const wallLength = Math.sqrt(
    Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.z - wall.start.z, 2)
  );

  const positionRatio = door.position / 100; // Convert percentage to ratio
  const wallAngle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);

  const x = wall.start.x + Math.cos(wallAngle) * wallLength * positionRatio;
  const z = wall.start.z + Math.sin(wallAngle) * wallLength * positionRatio;

  // Height position (bottom of door)
  const y = 0;

  return new Vector3(x, y, z);
}
```

#### Day 5: Geometry Generation

```typescript
// src/utils/3d/doorGeometry.ts
export function generateDoorGeometry(door: Door): {
  frameGeometry: BoxGeometry;
  panelGeometry: BoxGeometry;
} {
  // Door frame (slightly larger than panel)
  const frameWidth = door.width + 0.05; // 5cm frame
  const frameThickness = door.thickness + 0.02; // 2cm frame
  const frameHeight = door.height + 0.05; // 5cm frame at top

  const frameGeometry = new BoxGeometry(frameWidth, frameHeight, frameThickness);

  // Door panel
  const panelGeometry = new BoxGeometry(door.width, door.height, door.thickness);

  return { frameGeometry, panelGeometry };
}
```

### Week 2: Door Types and Animations

#### Day 6-7: Hinged Door Implementation

```typescript
// src/components/Canvas3D/Elements/HingedDoor3D.tsx
export function HingedDoor3D({ door, wall, isSelected }: Door3DProps) {
  const groupRef = useRef<Group>(null);

  // Animate door opening
  useFrame(() => {
    if (groupRef.current && door.type === 'hinged') {
      groupRef.current.rotation.y = THREE.MathUtils.degToRad(
        door.isOpen ? door.openAngle : 0
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Door frame and panel implementation */}
    </group>
  );
}
```

#### Day 8-9: Sliding Door Implementation

```typescript
// src/components/Canvas3D/Elements/SlidingDoor3D.tsx
export function SlidingDoor3D({ door, wall, isSelected }: Door3DProps) {
  const panelRef = useRef<Mesh>(null);

  // Animate door sliding
  useFrame(() => {
    if (panelRef.current && door.type === 'sliding') {
      // Calculate slide offset based on open state
      const maxOffset = door.width;
      const currentOffset = door.isOpen ? door.openOffset * maxOffset : 0;

      panelRef.current.position.x = currentOffset;
    }
  });

  return (
    <group>
      {/* Sliding door implementation */}
    </group>
  );
}
```

#### Day 10: Door Type Selector

```typescript
// src/components/Canvas3D/Elements/Door3D.tsx
export function Door3D({ door, wall, isSelected }: Door3DProps) {
  switch (door.type) {
    case 'hinged':
      return <HingedDoor3D {...{ door, wall, isSelected }} />;
    case 'sliding':
      return <SlidingDoor3D {...{ door, wall, isSelected }} />;
    case 'folding':
      return <FoldingDoor3D {...{ door, wall, isSelected }} />;
    case 'revolving':
      return <RevolvingDoor3D {...{ door, wall, isSelected }} />;
    default:
      return <HingedDoor3D {...{ door, wall, isSelected }} />;
  }
}
```

### Week 3: Materials and Configuration

#### Day 11-12: Material System Integration

```typescript
// src/utils/3d/materials/doorMaterials.ts
export class DoorMaterialManager {
  private materials = new Map<string, MeshStandardMaterial>();

  getDoorMaterial(materialId: string): MeshStandardMaterial {
    if (this.materials.has(materialId)) {
      return this.materials.get(materialId)!;
    }

    // Create new material based on ID
    const materialConfig = getMaterialConfig(materialId);
    const material = new MeshStandardMaterial({
      color: materialConfig.color,
      roughness: materialConfig.roughness,
      metalness: materialConfig.metalness,
      map: materialConfig.texture ? this.loadTexture(materialConfig.texture) : undefined,
    });

    this.materials.set(materialId, material);
    return material;
  }

  private loadTexture(url: string) {
    // Texture loading implementation
  }
}
```

#### Day 13-14: Configuration Panel

```typescript
// src/components/UI/DoorConfigPanel.tsx
export function DoorConfigPanel({ door, onChange }: {
  door: Door;
  onChange: (updates: Partial<Door>) => void;
}) {
  return (
    <div className="door-config-panel">
      <h3>Door Configuration</h3>

      <div className="config-group">
        <label>Door Type</label>
        <select
          value={door.type}
          onChange={(e) => onChange({ type: e.target.value as any })}
        >
          <option value="hinged">Hinged</option>
          <option value="sliding">Sliding</option>
          <option value="folding">Folding</option>
          <option value="revolving">Revolving</option>
        </select>
      </div>

      <div className="config-group">
        <label>Width (cm)</label>
        <input
          type="number"
          value={door.width * 100}
          onChange={(e) => onChange({ width: parseFloat(e.target.value) / 100 })}
        />
      </div>

      <div className="config-group">
        <label>Height (cm)</label>
        <input
          type="number"
          value={door.height * 100}
          onChange={(e) => onChange({ height: parseFloat(e.target.value) / 100 })}
        />
      </div>

      {/* Additional configuration options */}
    </div>
  );
}
```

## 🧪 Testing Plan

### Unit Tests

```typescript
// __tests__/components/Canvas3D/Elements/Door3D.test.tsx
describe('Door3D', () => {
  it('renders door with correct geometry', () => {
    const door = createTestDoor();
    const wall = createTestWall();

    render(<Door3D door={door} wall={wall} isSelected={false} />);

    // Assert geometry and materials
  });

  it('calculates correct position on wall', () => {
    const door = createTestDoor({ position: 50 }); // Middle of wall
    const wall = createTestWall({ start: { x: 0, z: 0 }, end: { x: 10, z: 0 } });

    const position = calculateDoorPosition(door, wall);

    expect(position.x).toBeCloseTo(5);
    expect(position.z).toBeCloseTo(0);
  });

  it('applies correct materials', () => {
    const door = createTestDoor({ materialId: 'wood-oak' });

    // Assert material application
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/door-placement.test.ts
describe('Door Placement', () => {
  it('places door correctly on wall', async () => {
    const { user } = renderApp();

    // Select wall tool and create wall
    await user.click(screen.getByText('Wall Tool'));
    await user.click(screen.getByRole('canvas'));
    await user.click(screen.getByRole('canvas'));

    // Select door tool and place door
    await user.click(screen.getByText('Door Tool'));
    await user.click(screen.getByTestId('wall-midpoint'));

    // Verify door is placed
    expect(screen.getByTestId('door-element')).toBeInTheDocument();
  });
});
```

## 🎯 Acceptance Criteria

### Functional Requirements

- [ ] Door renders correctly in 3D space
- [ ] Door is positioned accurately on host wall
- [ ] Door type selector works correctly
- [ ] Door dimensions can be adjusted
- [ ] Door materials can be applied
- [ ] Door opening animations work
- [ ] Door selection and editing work

### Performance Requirements

- [ ] Door renders at 60 FPS
- [ ] Door animations are smooth
- [ ] Memory usage is optimized
- [ ] Loading time is under 100ms

### User Experience Requirements

- [ ] Door placement is intuitive
- [ ] Configuration panel is easy to use
- [ ] Visual feedback is clear
- [ ] Error handling is appropriate

## 📚 Documentation

### Component API

```typescript
/**
 * Door3D - 3D Door Component
 *
 * @param door - Door data object
 * @param wall - Host wall for the door
 * @param isSelected - Whether door is currently selected
 * @param onSelect - Callback when door is selected
 * @param onEdit - Callback when door properties are edited
 */
```

### User Guide

1. **Placing a Door**
   - Select the Door Tool
   - Click on a wall where you want to place the door
   - Adjust position using the position handle

2. **Configuring a Door**
   - Select the door to open configuration panel
   - Choose door type from dropdown
   - Adjust dimensions using sliders
   - Select materials from material library

3. **Opening/Closing a Door**
   - Select the door
   - Use the open/close toggle in properties panel
   - For hinged doors, adjust opening angle
   - For sliding doors, adjust opening offset

---

**Status**: Implementation Plan Created ✅
**Next Steps**: Begin development of Door3D component
**Estimated Completion**: 3 weeks
