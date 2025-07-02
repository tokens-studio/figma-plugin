import React from 'react';
import { render, fireEvent } from '../../../../tests/config/setupTest';
import CodeSyntaxInput from '../CodeSyntaxInput';
import { CodeSyntaxPlatform } from '@/types/FigmaVariableTypes';

describe('CodeSyntaxInput', () => {
  const mockOnCodeSyntaxChange = jest.fn();
  
  beforeEach(() => {
    mockOnCodeSyntaxChange.mockClear();
  });

  it('should render with code syntax values', () => {
    const codeSyntax = {
      Web: '$web-token',
      Android: '@android-token',
      iOS: 'ios_token'
    };
    
    const result = render(
      <CodeSyntaxInput 
        codeSyntax={codeSyntax} 
        onCodeSyntaxChange={mockOnCodeSyntaxChange} 
      />
    );

    expect(result.getByText('Code Syntax')).toBeInTheDocument();
    expect(result.getByText('Define custom code syntax for different platforms')).toBeInTheDocument();
    
    // Check that values are displayed
    expect((result.getByDisplayValue('$web-token'))).toBeInTheDocument();
    expect((result.getByDisplayValue('@android-token'))).toBeInTheDocument();
    expect((result.getByDisplayValue('ios_token'))).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    const codeSyntax = {};
    const result = render(
      <CodeSyntaxInput 
        codeSyntax={codeSyntax} 
        onCodeSyntaxChange={mockOnCodeSyntaxChange} 
      />
    );

    const webInput = result.getByLabelText('Web');
    fireEvent.change(webInput, { target: { value: '$new-web-token' } });

    expect(mockOnCodeSyntaxChange).toHaveBeenCalledWith('Web', '$new-web-token');
  });

  it('should render all platform inputs', () => {
    const codeSyntax = {};
    const result = render(
      <CodeSyntaxInput 
        codeSyntax={codeSyntax} 
        onCodeSyntaxChange={mockOnCodeSyntaxChange} 
      />
    );

    expect(result.getByLabelText('Web')).toBeInTheDocument();
    expect(result.getByLabelText('Android')).toBeInTheDocument();
    expect(result.getByLabelText('iOS')).toBeInTheDocument();
  });

  it('should handle empty values', () => {
    const codeSyntax = {};
    const result = render(
      <CodeSyntaxInput 
        codeSyntax={codeSyntax} 
        onCodeSyntaxChange={mockOnCodeSyntaxChange} 
      />
    );

    const webInput = result.getByLabelText('Web');
    expect(webInput).toHaveValue('');
  });
});