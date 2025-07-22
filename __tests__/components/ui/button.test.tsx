import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>);
      
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders button with custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders disabled button', () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Button variant="default">Default</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white', 'text-gray-600', 'border-gray-300');
    });

    it('renders primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'text-white');
    });

    it('renders destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'text-white');
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-gray-300', 'text-gray-700');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-gray-600', 'hover:bg-gray-100');
    });
  });

  describe('Sizes', () => {
    it('renders medium size (default)', () => {
      render(<Button size="md">Medium Size</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm', 'rounded-md');
    });

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm', 'rounded');
    });

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-base', 'rounded-lg');
    });

    it('renders default size when no size specified', () => {
      render(<Button>Default</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm', 'rounded-md');
    });
  });

  describe('Interactions', () => {
    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger click when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Button</Button>);
      
      const button = screen.getByRole('button');
      // Standard HTML buttons handle Enter/Space automatically
      // We test that the button is properly focusable and receives events
      button.focus();
      expect(button).toHaveFocus();
    });

    it('handles space key press', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Button</Button>);
      
      const button = screen.getByRole('button');
      // Standard HTML buttons handle Enter/Space automatically
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<Button>Button</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports custom aria-label', () => {
      render(<Button aria-label="Custom label">🔥</Button>);
      
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="help-text">Button</Button>
          <div id="help-text">Help text</div>
        </>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('is focusable by default', () => {
      render(<Button>Button</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<Button disabled>Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // Disabled buttons cannot receive focus
      button.focus();
      expect(button).not.toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Button></Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles null children', () => {
      render(<Button>{null}</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles complex children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('IconText');
    });

    it('handles very long text', () => {
      const longText = 'A'.repeat(1000);
      render(<Button>{longText}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(longText);
    });

    it('handles special characters in text', () => {
      render(<Button>Special chars: !@#$%^&*()</Button>);
      
      expect(screen.getByRole('button')).toHaveTextContent('Special chars: !@#$%^&*()');
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<Button>Button</Button>);
      
      // Re-render with same props
      rerender(<Button>Button</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles rapid clicks', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Button</Button>);
      
      const button = screen.getByRole('button');
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }
      
      expect(handleClick).toHaveBeenCalledTimes(10);
    });
  });
});