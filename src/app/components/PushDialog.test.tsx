import React from 'react';
import { Provider } from 'react-redux';
import { StorageProviderType } from '@/constants/StorageProviderType';
import {
  act, render, resetStore, createMockStore, fireEvent,
} from '../../../tests/config/setupTest';
import PushDialog from './PushDialog';
import { store } from '../store';

describe('PushDialog', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should show push dialog', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: 'initial',
        localApiState: {
          branch: 'main',
          provider: StorageProviderType.GITHUB,
          id: '1234',
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );
    expect(result.getByText('Push changes')).toBeInTheDocument();
    expect(result.getByText('Commit message')).toBeInTheDocument();
    expect(result.getByText('Push')).toBeInTheDocument();

    result.unmount();
  });

  it('should show success dialog', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: 'success',
        localApiState: {
          branch: 'main',
          provider: StorageProviderType.GITHUB,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );
    expect(result.getByText('Changes pushed to GitHub')).toBeInTheDocument();
    expect(result.getByText('Create Pull Request')).toBeInTheDocument();

    result.unmount();
  });

  it('should be able to push by pressing ctrl/cmd + Enter', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: 'initial',
        localApiState: {
          branch: 'main',
          provider: StorageProviderType.GITHUB,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    const commitMessageInput = result.getByTestId('push-dialog-commit-message');
    fireEvent.change(commitMessageInput, {
      target: { value: 'initial commit' },
    });

    act(() => {
      fireEvent.keyDown(document, {
        key: 'Enter',
        code: 'Enter',
        ctrlKey: true,
      });
    });

    expect(store.getState().uiState.showPushDialog).toBe(false);

    result.unmount();
  });

  it('should show different token list dialog', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: 'difference',
        localApiState: {
          branch: 'main',
          provider: StorageProviderType.GITHUB,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );
    expect(result.getByText('Cancel')).toBeInTheDocument();
    expect(result.getByText('Push Changes')).toBeInTheDocument();

    result.unmount();
  });

  it('should show different token list dialog and should be able to push changes', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: 'difference',
        localApiState: {
          branch: 'main',
          provider: StorageProviderType.GITHUB,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    const pushButton = result.getByText('Push Changes');
    fireEvent.click(pushButton);

    expect(result.getByText('Pushing to GitHub')).toBeInTheDocument();
    result.unmount();
  });
});
