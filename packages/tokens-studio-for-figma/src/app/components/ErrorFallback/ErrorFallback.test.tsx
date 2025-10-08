import React from 'react';
import { render, screen } from '../../../../tests/config/setupTest';
import { ErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  it('should render error message', () => {
    const error = new Error('Test error message');
    render(<ErrorFallback error={error} />);

    expect(screen.getByText('An unexpected error has occured')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render with empty error message', () => {
    const error = new Error('');
    render(<ErrorFallback error={error} />);

    expect(screen.getByText('An unexpected error has occured')).toBeInTheDocument();
  });

  it('should render with long error message', () => {
    const longMessage = 'This is a very long error message that contains lots of details about what went wrong in the application. '.repeat(3);
    const error = new Error(longMessage);
    const { container } = render(<ErrorFallback error={error} />);

    expect(screen.getByText('An unexpected error has occured')).toBeInTheDocument();
    // Check that the container includes the long message (with potential whitespace)
    expect(container.textContent).toContain('This is a very long error message that contains lots of details about what went wrong in the application.');
  });

  it('should render with special characters in error message', () => {
    const error = new Error('Error with special chars: <>&"\'');
    render(<ErrorFallback error={error} />);

    expect(screen.getByText('An unexpected error has occured')).toBeInTheDocument();
    expect(screen.getByText('Error with special chars: <>&"\'')).toBeInTheDocument();
  });
});
