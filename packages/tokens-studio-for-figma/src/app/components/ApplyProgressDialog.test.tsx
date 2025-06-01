import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import {
  createMockStore, render,
} from '../../../tests/config/setupTest';
import ApplyProgressDialog from './ApplyProgressDialog';

// Mock the hook with different states
const mockOnCancel = jest.fn();

const mockUseApplyProgressDialog = jest.fn();
jest.mock('../hooks/useApplyProgressDialog', () => ({
  useApplyProgressDialog: () => mockUseApplyProgressDialog(),
}));

const mockStore = createMockStore({
  settings: {
    updateMode: 'selection',
  },
});

describe('ApplyProgressDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseApplyProgressDialog.mockReturnValue({
      onCancel: mockOnCancel,
      applyDialogMode: 'loading',
    });

    const result = render(
      <Provider store={mockStore}>
        <ApplyProgressDialog />
      </Provider>,
    );

    expect(result.getByText(/applyTo.applyingTokensTo/)).toBeInTheDocument();
  });

  it('should render success state', () => {
    mockUseApplyProgressDialog.mockReturnValue({
      onCancel: mockOnCancel,
      applyDialogMode: 'success',
    });

    const result = render(
      <Provider store={mockStore}>
        <ApplyProgressDialog />
      </Provider>,
    );

    expect(result.getByTestId('apply-dialog-success-heading')).toBeInTheDocument();
    expect(result.getByTestId('apply-dialog-button-close')).toBeInTheDocument();
  });

  it('should call onCancel when close button is clicked', async () => {
    mockUseApplyProgressDialog.mockReturnValue({
      onCancel: mockOnCancel,
      applyDialogMode: 'success',
    });

    const result = render(
      <Provider store={mockStore}>
        <ApplyProgressDialog />
      </Provider>,
    );

    const closeButton = result.getByTestId('apply-dialog-button-close');
    await userEvent.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should return null when applyDialogMode is false', () => {
    mockUseApplyProgressDialog.mockReturnValue({
      onCancel: mockOnCancel,
      applyDialogMode: false,
    });

    const result = render(
      <Provider store={mockStore}>
        <ApplyProgressDialog />
      </Provider>,
    );

    expect(result.container.firstChild).toBeNull();
  });
});