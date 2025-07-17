import React from 'react';
import { render, fireEvent } from '../../../../tests/config/setupTest';
import VariableScopesInput from '../VariableScopesInput';
import { VariableScope } from '@/types/FigmaVariableTypes';

describe('VariableScopesInput', () => {
  const mockOnScopesChange = jest.fn();
  
  beforeEach(() => {
    mockOnScopesChange.mockClear();
  });

  it('should render with selected scopes', () => {
    const selectedScopes: VariableScope[] = ['TEXT_CONTENT', 'CORNER_RADIUS'];
    const result = render(
      <VariableScopesInput 
        selectedScopes={selectedScopes} 
        onScopesChange={mockOnScopesChange} 
      />
    );

    expect(result.getByText('Variable Scopes')).toBeInTheDocument();
    expect(result.getByText('Define where this variable can be used in Figma')).toBeInTheDocument();
    
    // Check that selected scopes are checked
    const textContentCheckbox = result.getByLabelText('Text Content');
    expect(textContentCheckbox).toBeChecked();
  });

  it('should handle scope selection', () => {
    const selectedScopes: VariableScope[] = [];
    const result = render(
      <VariableScopesInput 
        selectedScopes={selectedScopes} 
        onScopesChange={mockOnScopesChange} 
      />
    );

    const textContentCheckbox = result.getByLabelText('Text Content');
    fireEvent.click(textContentCheckbox);

    expect(mockOnScopesChange).toHaveBeenCalledWith(['TEXT_CONTENT']);
  });

  it('should handle scope deselection', () => {
    const selectedScopes: VariableScope[] = ['TEXT_CONTENT', 'CORNER_RADIUS'];
    const result = render(
      <VariableScopesInput 
        selectedScopes={selectedScopes} 
        onScopesChange={mockOnScopesChange} 
      />
    );

    const textContentCheckbox = result.getByLabelText('Text Content');
    fireEvent.click(textContentCheckbox);

    expect(mockOnScopesChange).toHaveBeenCalledWith(['CORNER_RADIUS']);
  });

  it('should display all scope options', () => {
    const selectedScopes: VariableScope[] = [];
    const result = render(
      <VariableScopesInput 
        selectedScopes={selectedScopes} 
        onScopesChange={mockOnScopesChange} 
      />
    );

    // Check a few key scope options are present
    expect(result.getByText('All Scopes')).toBeInTheDocument();
    expect(result.getByText('Text Content')).toBeInTheDocument();
    expect(result.getByText('Corner Radius')).toBeInTheDocument();
    expect(result.getByText('Width & Height')).toBeInTheDocument();
  });
});