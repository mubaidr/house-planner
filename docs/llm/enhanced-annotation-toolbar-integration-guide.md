
# Enhanced Annotation Toolbar Integration Guide

This guide provides step-by-step instructions on how to integrate and utilize the `EnhancedAnnotationToolbar` in the main application.

## 1. Add the Toolbar to the AppLayout

First, import the `EnhancedAnnotationToolbar` component into `src/components/Layout/AppLayout.tsx` and place it within the main content area, right below the `DoorAnimationControls` component.

```tsx
// src/components/Layout/AppLayout.tsx
import DoorAnimationControls from '@/components/Toolbar/DoorAnimationControls';
import EnhancedAnnotationToolbar from '@/components/Toolbar/EnhancedAnnotationToolbar';
import DrawingCanvas from '@/components/Canvas/DrawingCanvas';
```

```tsx
// src/components/Layout/AppLayout.tsx
<main className="flex-1 bg-gray-50 relative overflow-hidden">
  <DrawingCanvas />
  <ViewSwitcher />
  <FloorSwitcher />
  <MeasurementControls />
  <DoorAnimationControls />
  <EnhancedAnnotationToolbar />
  {children}
</main>
```

## 2. Implement Toolbar Functionality

The `EnhancedAnnotationToolbar` requires several functions to be passed as props to handle exporting templates, and exporting and importing annotations.

### a. Create State for Dialogs

In `src/stores/uiStore.ts`, add the following state variables to manage the visibility of the export and import dialogs:

```ts
// src/stores/uiStore.ts
export interface UIState {
  // ... existing state
  isExportDialogOpen: boolean;
  isImportDialogOpen: boolean;
  setExportDialogOpen: (isOpen: boolean) => void;
  setImportDialogOpen: (isOpen: boolean) => void;
}

// ... inside create<UIState>((set) => ({ ... }))
  isExportDialogOpen: false,
  isImportDialogOpen: false,
  setExportDialogOpen: (isOpen) => set({ isExportDialogOpen: isOpen }),,
  setImportDialogOpen: (isOpen) => set({ isImportDialogOpen: isOpen }),
```

### b. Implement Prop Functions in AppLayout

In `src/components/Layout/AppLayout.tsx`, define the functions that will be passed to the `EnhancedAnnotationToolbar`.

```tsx
// src/components/Layout/AppLayout.tsx
import { useUIStore } from '@/stores/uiStore';

export default function AppLayout({ children }: AppLayoutProps) {
  const { setExportDialogOpen, setImportDialogOpen } = useUIStore();

  const handleExportTemplates = () => {
    setExportDialogOpen(true);
  };

  const handleImportAnnotations = () => {
    setImportDialogOpen(true);
  };

  const handleExportAnnotations = () => {
    // Logic to handle exporting annotations
    console.log('Exporting annotations...');
  };

  return (
    // ...
    <EnhancedAnnotationToolbar
      onExportTemplates={handleExportTemplates}
      onImportAnnotations={handleImportAnnotations}
      onExportAnnotations={handleExportAnnotations}
    />
    // ...
  );
}
```

## 3. Create Export and Import Dialogs

The application needs dialog components to handle the import and export of templates and annotations.

### a. ExportDialog Component

The `ExportDialog` component is already created at `src/components/Export/ExportDialog.tsx`. Ensure it is correctly implemented to handle template exports.

### b. ImportDialog Component

Create a new component `ImportDialog.tsx` in the same directory for handling annotation imports.

```tsx
// src/components/Export/ImportDialog.tsx
import React from 'react';
import { useUIStore } from '@/stores/uiStore';

const ImportDialog: React.FC = () => {
  const { isImportDialogOpen, setImportDialogOpen } = useUIStore();

  if (!isImportDialogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Import Annotations</h2>
        {/* Add import functionality here */}
        <button
          onClick={() => setImportDialogOpen(false)}
          className="mt-4 px-4 py-2 bg-gray-300 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ImportDialog;
```

### c. Add Dialogs to AppLayout

Finally, add the `ExportDialog` and the new `ImportDialog` to `src/components/Layout/AppLayout.tsx`.

```tsx
// src/components/Layout/AppLayout.tsx
import ExportDialog from '@/components/Export/ExportDialog';
import ImportDialog from '@/components/Export/ImportDialog';

// ... inside the AppLayout component's return statement
{isExportDialogOpen && <ExportDialog />}
{isImportDialogOpen && <ImportDialog />}
```

## 4. Practical Workflows

Once integrated, the `EnhancedAnnotationToolbar` provides a rich set of tools for annotating designs. Here are some practical workflows:

- **Dimensioning**: Use the **Dimension Tool** to add precise measurements to walls, doors, and windows. Access advanced settings to customize units, precision, and appearance.
- **Text Annotations**: Add notes and specifications directly on the canvas using the **Text Annotation Tool**.
- **Area Calculations**: Automatically calculate and display the area of each room with the **Area Calculation Tool**.
- **Material Callouts**: Use the **Material Callout Tool** to tag elements with specific materials from the library.
- **Exporting and Importing**:
  - Export annotations to a JSON file for backup or sharing.
  - Import annotations from a JSON file to restore a previous state or collaborate with others.
  - Export the entire design with annotations using predefined templates for professional-looking documents.
- **Visibility and Styling**:
  - Toggle the visibility of different annotation types to declutter the view.
  - Customize the visual style of annotations, including colors and fonts, to match your presentation needs.

By following these steps, you can fully integrate the `EnhancedAnnotationToolbar` and leverage its powerful features to create detailed and professional floor plans.
