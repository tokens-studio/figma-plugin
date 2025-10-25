import React from 'react';
import { render, fireEvent, screen } from '../../../tests/config/setupTest';
import BooleanTokenForm from './BooleanTokenForm';
import { TokenTypes } from '@/constants/TokenTypes';
import { EditTokenObject } from '@/types/tokens';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';

describe('BooleanTokenForm', () => {
  const mockHandleBooleanChange = jest.fn();
  const mockHandleBooleanDownShiftInputChange = jest.fn();
  const mockOnSubmit = jest.fn();

  const createBooleanToken = (value: string): Extract<EditTokenObject, { type: TokenTypes.BOOLEAN }> => ({
    name: 'test-boolean',
    initialName: 'test-boolean',
    value,
    type: TokenTypes.BOOLEAN,
    status: EditTokenFormStatus.EDIT,
    schema: {
      property: 'Boolean',
      type: TokenTypes.BOOLEAN,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with true selected when value is "true"', () => {
    const token = createBooleanToken('true');
    render(
      <BooleanTokenForm
        internalEditToken={token}
        resolvedTokens={[]}
        handleBooleanChange={mockHandleBooleanChange}
        handleBooleanDownShiftInputChange={mockHandleBooleanDownShiftInputChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const trueButton = screen.getByText('true').closest('button');
    expect(trueButton).toHaveAttribute('data-state', 'on');
  });

  it('should render with false selected when value is "false"', () => {
    const token = createBooleanToken('false');
    render(
      <BooleanTokenForm
        internalEditToken={token}
        resolvedTokens={[]}
        handleBooleanChange={mockHandleBooleanChange}
        handleBooleanDownShiftInputChange={mockHandleBooleanDownShiftInputChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const falseButton = screen.getByText('false').closest('button');
    expect(falseButton).toHaveAttribute('data-state', 'on');
  });

  it('should render with reference mode when value is a reference', () => {
    const token = createBooleanToken('{some.reference}');
    const { container } = render(
      <BooleanTokenForm
        internalEditToken={token}
        resolvedTokens={[]}
        handleBooleanChange={mockHandleBooleanChange}
        handleBooleanDownShiftInputChange={mockHandleBooleanDownShiftInputChange}
        onSubmit={mockOnSubmit}
      />,
    );

    // Check if reference button is selected using data-state attribute
    const buttons = container.querySelectorAll('[role="radio"]');
    const referenceButton = Array.from(buttons).find(
      (button) => button.textContent?.includes('reference') || button.getAttribute('value') === 'reference',
    );
    expect(referenceButton).toHaveAttribute('data-state', 'on');
  });

  it('should show input field when in reference mode', () => {
    const token = createBooleanToken('{some.reference}');
    render(
      <BooleanTokenForm
        internalEditToken={token}
        resolvedTokens={[]}
        handleBooleanChange={mockHandleBooleanChange}
        handleBooleanDownShiftInputChange={mockHandleBooleanDownShiftInputChange}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByPlaceholderText('{alias}')).toBeInTheDocument();
  });

  it('should not show input field when true or false is selected', () => {
    const token = createBooleanToken('true');
    render(
      <BooleanTokenForm
        internalEditToken={token}
        resolvedTokens={[]}
        handleBooleanChange={mockHandleBooleanChange}
        handleBooleanDownShiftInputChange={mockHandleBooleanDownShiftInputChange}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.queryByPlaceholderText('{alias}')).not.toBeInTheDocument();
  });

  it('should call handleBooleanDownShiftInputChange when switching to true', () => {
    const token = createBooleanToken('false');
    render(
      <BooleanTokenForm
        internalEditToken={token}
        resolvedTokens={[]}
        handleBooleanChange={mockHandleBooleanChange}
        handleBooleanDownShiftInputChange={mockHandleBooleanDownShiftInputChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const trueButton = screen.getByText('true');
    fireEvent.click(trueButton);

    expect(mockHandleBooleanDownShiftInputChange).toHaveBeenCalledWith('true');
  });

  it('should call handleBooleanDownShiftInputChange when switching to false', () => {
    const token = createBooleanToken('true');
    render(
      <BooleanTokenForm
        internalEditToken={token}
        resolvedTokens={[]}
        handleBooleanChange={mockHandleBooleanChange}
        handleBooleanDownShiftInputChange={mockHandleBooleanDownShiftInputChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const falseButton = screen.getByText('false');
    fireEvent.click(falseButton);

    expect(mockHandleBooleanDownShiftInputChange).toHaveBeenCalledWith('false');
  });

  it('should show validation error for invalid reference value', () => {
    const token = createBooleanToken('invalid-value');
    const { container } = render(
      <BooleanTokenForm
        internalEditToken={token}
        resolvedTokens={[]}
        handleBooleanChange={mockHandleBooleanChange}
        handleBooleanDownShiftInputChange={mockHandleBooleanDownShiftInputChange}
        onSubmit={mockOnSubmit}
      />,
    );

    // Check that error message is displayed (either the translation key or the translated text)
    const errorMessage = container.textContent;
    expect(errorMessage).toMatch(/invalidBooleanValue|Value must be true, false, or a valid reference/i);
  });
});
