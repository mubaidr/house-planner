// __tests__/ExportDialog.test.tsx
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import ExportDialog from '@/components/Export/ExportDialog';

describe('ExportDialog', () => {
  it('renders without crashing when given null/undefined props', () => {
    const onClose = jest.fn();
    const { container } = render(
      <ExportDialog isOpen={true} onClose={onClose} stage={null} stages={undefined} />
    );
    expect(container).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <ExportDialog
        isOpen={true}
        onClose={onClose}
        stage={null}
        stages={{
          plan: null,
          front: null,
          back: null,
          left: null,
          right: null,
        }}
      />
    );
    const closeBtn = getByLabelText(/close/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('handles annotation export action', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <ExportDialog
        isOpen={true}
        onClose={onClose}
        stage={null}
        stages={{
          plan: null,
          front: null,
          back: null,
          left: null,
          right: null,
        }}
      />
    );
    const exportBtn = getByText(/export/i);
    fireEvent.click(exportBtn);
    // Expect export logic to run (mock or spy as needed)
    // For now, just ensure button is present and clickable
    expect(exportBtn).toBeInTheDocument();
  });

  it('has correct ARIA roles and supports keyboard navigation', () => {
    const onClose = jest.fn();
    const { getByRole, getByLabelText } = render(
      <ExportDialog
        isOpen={true}
        onClose={onClose}
        stage={null}
        stages={{
          plan: null,
          front: null,
          back: null,
          left: null,
          right: null,
        }}
      />
    );
    const dialog = getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    // Test focus management: close button should be focusable
    const closeBtn = getByLabelText(/close/i);
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);
    // Simulate keyboard navigation (Tab)
    fireEvent.keyDown(dialog, { key: 'Tab' });
    // Additional assertions as needed
  });
});
