
import React from 'react';
import { render } from '@testing-library/react';
import { useClipboard } from '../src/hooks/useClipboard';

function TestComponent() {
  useClipboard();
  return null;
}

describe('useClipboard', () => {
  it('should initialize without error', () => {
    render(<TestComponent />);
  });
});
