import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TechButton from '../components/TechButton';
import TechInput from '../components/TechInput';
import TechCard from '../components/TechCard';

describe('TechComponents', () => {
  describe('TechButton', () => {
    it('renders with children', () => {
      render(<TechButton>Click Me</TechButton>);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('calls onClick handler', () => {
      const handleClick = vi.fn();
      render(<TechButton onClick={handleClick}>Click Me</TechButton>);
      fireEvent.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies variant classes', () => {
      const { container } = render(<TechButton variant="danger">Danger</TechButton>);
      expect(container.firstChild).toHaveClass(/danger/);
    });

    it('uses fallback when variant is invalid', () => {
      const { container } = render(<TechButton variant="nonexistent">Invalid</TechButton>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies filled class when filled is true', () => {
      const { container } = render(<TechButton filled>Filled</TechButton>);
      expect(container.firstChild.className).toContain('filled');
    });

    it('applies secondary variant', () => {
      const { container } = render(<TechButton variant="secondary">Secondary</TechButton>);
      expect(container.firstChild.className).toContain('secondary');
    });
  });

  describe('TechInput', () => {
    it('renders label and input', () => {
      render(<TechInput label="Username" defaultValue="test" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });

    it('displays error message', () => {
      render(<TechInput label="Username" error="Invalid input" />);
      expect(screen.getByText('Invalid input')).toBeInTheDocument();
    });

    it('calls onChange handler', () => {
      const handleChange = vi.fn();
      render(<TechInput label="Test" onChange={handleChange} />);
      fireEvent.change(screen.getByLabelText('Test'), { target: { value: 'abc' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('renders as textarea when textarea prop is true', () => {
      render(<TechInput label="Description" textarea />);
      const textareaElement = screen.getByLabelText('Description');
      expect(textareaElement.tagName).toBe('TEXTAREA');
    });

    it('uses provided id prop', () => {
      render(<TechInput label="Custom ID" id="custom-id" />);
      const inputElement = screen.getByLabelText('Custom ID');
      expect(inputElement.id).toBe('custom-id');
    });

    it('renders without label', () => {
      render(<TechInput placeholder="No label" />);
      expect(screen.getByPlaceholderText('No label')).toBeInTheDocument();
    });
  });

  describe('TechCard', () => {
    it('renders content and title', () => {
      render(<TechCard title="Card Title">Content</TechCard>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
