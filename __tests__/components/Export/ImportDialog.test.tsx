import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ImportDialog from '@/components/Export/ImportDialog';

// Mock the stores
const mockUIStore = {
  isImportDialogOpen: true,
  setImportDialogOpen: jest.fn(),
};

const mockDesignStore = {
  setWalls: jest.fn(),
  setDoors: jest.fn(),
  setWindows: jest.fn(),
  setStairs: jest.fn(),
  setRoofs: jest.fn(),
  clearAll: jest.fn(),
};

const mockErrorStore = {
  setError: jest.fn(),
};

const mockAccessibilityAnnouncer = {
  announceSuccess: jest.fn(),
  announceError: jest.fn(),
};

// Mock file reading
const mockFileReader = {
  readAsText: jest.fn(),
  result: '',
  onload: null as any,
  onerror: null as any,
};

global.FileReader = jest.fn(() => mockFileReader) as any;

jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => mockUIStore,
}));

jest.mock('@/stores/designStore', () => ({
  useDesignStore: () => mockDesignStore,
}));

jest.mock('@/stores/errorStore', () => ({
  useErrorStore: () => mockErrorStore,
}));

jest.mock('@/components/Accessibility/AccessibilityAnnouncer', () => ({
  useAccessibilityAnnouncer: () => mockAccessibilityAnnouncer,
}));

describe('ImportDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileReader.result = '';
  });

  it('should render when dialog is open', () => {
    render(<ImportDialog />);
    
    expect(screen.getByText('Import Design')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not render when dialog is closed', () => {
    mockUIStore.isImportDialogOpen = false;
    render(<ImportDialog />);
    
    expect(screen.queryByText('Import Design')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ImportDialog />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(mockUIStore.setImportDialogOpen).toHaveBeenCalledWith(false);
  });

  describe('File Upload', () => {
    it('should display file upload area', () => {
      render(<ImportDialog />);
      
      expect(screen.getByText(/drag.*drop.*file|upload.*file/i)).toBeInTheDocument();
      expect(screen.getByText(/browse.*files/i)).toBeInTheDocument();
    });

    it('should handle file selection', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file|upload.*file/i);
      const file = new File(['{"walls": [], "doors": []}'], 'design.json', {
        type: 'application/json'
      });
      
      await user.upload(fileInput, file);
      
      expect(fileInput.files).toHaveLength(1);
      expect(fileInput.files![0]).toBe(file);
    });

    it('should validate file type', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const invalidFile = new File(['invalid content'], 'design.txt', {
        type: 'text/plain'
      });
      
      await user.upload(fileInput, invalidFile);
      
      expect(screen.getByText(/invalid.*file.*type|unsupported.*format/i)).toBeInTheDocument();
    });

    it('should validate file size', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      // Create a large file (mock)
      const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
      const largeFile = new File([largeContent], 'large-design.json', {
        type: 'application/json'
      });
      
      await user.upload(fileInput, largeFile);
      
      expect(screen.getByText(/file.*too.*large|size.*limit/i)).toBeInTheDocument();
    });

    it('should handle drag and drop', async () => {
      render(<ImportDialog />);
      
      const dropZone = screen.getByText(/drag.*drop/i).closest('div');
      const file = new File(['{"walls": [], "doors": []}'], 'design.json', {
        type: 'application/json'
      });
      
      fireEvent.dragOver(dropZone!, {
        dataTransfer: { files: [file] }
      });
      
      expect(dropZone).toHaveClass('border-blue-500'); // Drag over state
      
      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [file] }
      });
      
      expect(screen.getByText('design.json')).toBeInTheDocument();
    });
  });

  describe('Import Modes', () => {
    it('should display import mode options', () => {
      render(<ImportDialog />);
      
      expect(screen.getByLabelText(/replace.*current/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/merge.*with.*current/i)).toBeInTheDocument();
    });

    it('should select replace mode by default', () => {
      render(<ImportDialog />);
      
      const replaceOption = screen.getByLabelText(/replace.*current/i);
      expect(replaceOption).toBeChecked();
    });

    it('should change import mode', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const mergeOption = screen.getByLabelText(/merge.*with.*current/i);
      await user.click(mergeOption);
      
      expect(mergeOption).toBeChecked();
    });

    it('should show mode descriptions', () => {
      render(<ImportDialog />);
      
      expect(screen.getByText(/replace.*all.*existing.*elements/i)).toBeInTheDocument();
      expect(screen.getByText(/add.*imported.*elements.*to.*current/i)).toBeInTheDocument();
    });
  });

  describe('File Validation', () => {
    const validDesignData = {
      walls: [
        { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0 }
      ],
      doors: [
        { id: 'door-1', x: 50, y: 0, width: 80, height: 200 }
      ],
      windows: [],
      stairs: [],
      roofs: [],
      version: '1.0',
      metadata: {
        created: '2023-01-01',
        modified: '2023-01-02',
        name: 'Test Design'
      }
    };

    it('should validate JSON structure', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const invalidJsonFile = new File(['{invalid json}'], 'design.json', {
        type: 'application/json'
      });
      
      // Mock FileReader
      mockFileReader.result = '{invalid json}';
      
      await user.upload(fileInput, invalidJsonFile);
      
      // Trigger file read
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      expect(screen.getByText(/invalid.*json.*format/i)).toBeInTheDocument();
    });

    it('should validate design data structure', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const invalidStructureFile = new File(['{"invalid": "structure"}'], 'design.json', {
        type: 'application/json'
      });
      
      mockFileReader.result = '{"invalid": "structure"}';
      
      await user.upload(fileInput, invalidStructureFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      expect(screen.getByText(/invalid.*design.*format|missing.*required.*fields/i)).toBeInTheDocument();
    });

    it('should show validation errors', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const invalidDataFile = new File([JSON.stringify({
        walls: [{ id: 'wall-1' }], // Missing required fields
        doors: [],
        windows: []
      })], 'design.json', {
        type: 'application/json'
      });
      
      mockFileReader.result = JSON.stringify({
        walls: [{ id: 'wall-1' }],
        doors: [],
        windows: []
      });
      
      await user.upload(fileInput, invalidDataFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      expect(screen.getByText(/validation.*errors/i)).toBeInTheDocument();
    });

    it('should display validation success', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify(validDesignData)], 'design.json', {
        type: 'application/json'
      });
      
      mockFileReader.result = JSON.stringify(validDesignData);
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      expect(screen.getByText(/validation.*successful|file.*valid/i)).toBeInTheDocument();
    });
  });

  describe('Preview', () => {
    const validDesignData = {
      walls: [
        { id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0 },
        { id: 'wall-2', startX: 100, startY: 0, endX: 100, endY: 100 }
      ],
      doors: [
        { id: 'door-1', x: 50, y: 0, width: 80, height: 200 }
      ],
      windows: [
        { id: 'window-1', x: 150, y: 0, width: 60, height: 120 }
      ],
      stairs: [],
      roofs: [],
      metadata: {
        name: 'Sample Design',
        created: '2023-01-01',
        modified: '2023-01-02'
      }
    };

    it('should show import preview', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify(validDesignData)], 'design.json');
      
      mockFileReader.result = JSON.stringify(validDesignData);
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });

    it('should display element counts in preview', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify(validDesignData)], 'design.json');
      
      mockFileReader.result = JSON.stringify(validDesignData);
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      expect(screen.getByText('2 walls')).toBeInTheDocument();
      expect(screen.getByText('1 door')).toBeInTheDocument();
      expect(screen.getByText('1 window')).toBeInTheDocument();
    });

    it('should display metadata in preview', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify(validDesignData)], 'design.json');
      
      mockFileReader.result = JSON.stringify(validDesignData);
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      expect(screen.getByText('Sample Design')).toBeInTheDocument();
      expect(screen.getByText(/created.*2023-01-01/i)).toBeInTheDocument();
    });
  });

  describe('Import Process', () => {
    const validDesignData = {
      walls: [{ id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0 }],
      doors: [{ id: 'door-1', x: 50, y: 0, width: 80, height: 200 }],
      windows: [],
      stairs: [],
      roofs: []
    };

    it('should start import when import button is clicked', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      // Upload valid file first
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify(validDesignData)], 'design.json');
      
      mockFileReader.result = JSON.stringify(validDesignData);
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);
      
      expect(mockDesignStore.setWalls).toHaveBeenCalledWith(validDesignData.walls);
      expect(mockDesignStore.setDoors).toHaveBeenCalledWith(validDesignData.doors);
    });

    it('should show progress during import', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      // Upload valid file
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify(validDesignData)], 'design.json');
      
      mockFileReader.result = JSON.stringify(validDesignData);
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);
      
      expect(screen.getByText(/importing|progress/i)).toBeInTheDocument();
    });

    it('should clear existing data in replace mode', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      // Ensure replace mode is selected
      const replaceOption = screen.getByLabelText(/replace.*current/i);
      await user.click(replaceOption);
      
      // Upload and import
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify(validDesignData)], 'design.json');
      
      mockFileReader.result = JSON.stringify(validDesignData);
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);
      
      expect(mockDesignStore.clearAll).toHaveBeenCalled();
    });

    it('should not clear existing data in merge mode', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      // Select merge mode
      const mergeOption = screen.getByLabelText(/merge.*with.*current/i);
      await user.click(mergeOption);
      
      // Upload and import
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify(validDesignData)], 'design.json');
      
      mockFileReader.result = JSON.stringify(validDesignData);
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);
      
      expect(mockDesignStore.clearAll).not.toHaveBeenCalled();
    });

    it('should announce import success', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify(validDesignData)], 'design.json');
      
      mockFileReader.result = JSON.stringify(validDesignData);
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);
      
      await waitFor(() => {
        expect(mockAccessibilityAnnouncer.announceSuccess).toHaveBeenCalledWith(
          expect.stringMatching(/import.*successful|design.*imported/i)
        );
      });
    });

    it('should close dialog after successful import', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify(validDesignData)], 'design.json');
      
      mockFileReader.result = JSON.stringify(validDesignData);
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);
      
      await waitFor(() => {
        expect(mockUIStore.setImportDialogOpen).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const file = new File(['content'], 'design.json');
      
      await user.upload(fileInput, file);
      
      // Simulate file read error
      if (mockFileReader.onerror) {
        mockFileReader.onerror({} as any);
      }
      
      expect(screen.getByText(/error.*reading.*file/i)).toBeInTheDocument();
    });

    it('should handle import errors', async () => {
      const user = userEvent.setup();
      mockDesignStore.setWalls.mockImplementation(() => {
        throw new Error('Import failed');
      });
      
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify({
        walls: [{ id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0 }],
        doors: [],
        windows: [],
        stairs: [],
        roofs: []
      })], 'design.json');
      
      mockFileReader.result = JSON.stringify({
        walls: [{ id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0 }],
        doors: [],
        windows: [],
        stairs: [],
        roofs: []
      });
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);
      
      expect(mockErrorStore.setError).toHaveBeenCalledWith(
        expect.stringMatching(/import.*failed|error.*importing/i)
      );
    });

    it('should announce import errors', async () => {
      const user = userEvent.setup();
      mockDesignStore.setWalls.mockImplementation(() => {
        throw new Error('Import failed');
      });
      
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const validFile = new File([JSON.stringify({
        walls: [{ id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0 }],
        doors: [],
        windows: [],
        stairs: [],
        roofs: []
      })], 'design.json');
      
      mockFileReader.result = JSON.stringify({
        walls: [{ id: 'wall-1', startX: 0, startY: 0, endX: 100, endY: 0 }],
        doors: [],
        windows: [],
        stairs: [],
        roofs: []
      });
      
      await user.upload(fileInput, validFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);
      
      expect(mockAccessibilityAnnouncer.announceError).toHaveBeenCalledWith(
        expect.stringMatching(/import.*failed|error.*importing/i)
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ImportDialog />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have accessible file input', () => {
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      expect(fileInput).toHaveAccessibleName();
      expect(fileInput).toHaveAttribute('accept', '.json');
    });

    it('should announce validation results', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const invalidFile = new File(['{invalid}'], 'design.json');
      
      mockFileReader.result = '{invalid}';
      
      await user.upload(fileInput, invalidFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/validation.*failed|invalid.*format/i);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      closeButton.focus();
      
      await user.keyboard('{Enter}');
      
      expect(mockUIStore.setImportDialogOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Performance', () => {
    it('should handle large files efficiently', async () => {
      const user = userEvent.setup();
      render(<ImportDialog />);
      
      // Create large design data
      const largeDesignData = {
        walls: Array.from({ length: 1000 }, (_, i) => ({
          id: `wall-${i}`,
          startX: i * 10,
          startY: 0,
          endX: i * 10 + 10,
          endY: 100
        })),
        doors: Array.from({ length: 100 }, (_, i) => ({
          id: `door-${i}`,
          x: i * 50,
          y: 0,
          width: 80,
          height: 200
        })),
        windows: [],
        stairs: [],
        roofs: []
      };
      
      const fileInput = screen.getByLabelText(/choose.*file/i);
      const largeFile = new File([JSON.stringify(largeDesignData)], 'large-design.json');
      
      mockFileReader.result = JSON.stringify(largeDesignData);
      
      await user.upload(fileInput, largeFile);
      
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
      
      expect(screen.getByText('1000 walls')).toBeInTheDocument();
      expect(screen.getByText('100 doors')).toBeInTheDocument();
    });
  });
});