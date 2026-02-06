import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input Component', () => {
  it('renders input with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input placeholder="Disabled input" disabled />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  it('accepts different input types', () => {
    const { rerender } = render(<Input type="text" placeholder="Text input" />);
    expect(screen.getByPlaceholderText('Text input')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" placeholder="Email input" />);
    expect(screen.getByPlaceholderText('Email input')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" placeholder="Password input" />);
    expect(screen.getByPlaceholderText('Password input')).toHaveAttribute('type', 'password');
  });

  it('calls onChange handler when user types', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Input placeholder="Test input" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Test input');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('accepts custom className', () => {
    render(<Input placeholder="Custom input" className="custom-class" />);
    const input = screen.getByPlaceholderText('Custom input');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Ref input" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.placeholder).toBe('Ref input');
  });

  it('displays value when controlled', () => {
    render(<Input value="Controlled value" onChange={() => {}} />);
    const input = screen.getByDisplayValue('Controlled value');
    expect(input).toBeInTheDocument();
  });
});
