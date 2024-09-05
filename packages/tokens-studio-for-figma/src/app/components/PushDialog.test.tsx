import React from 'react';
import { Provider } from 'react-redux';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import {
  act, render, resetStore, createMockStore, fireEvent,
} from '../../../tests/config/setupTest';
import PushDialog from './PushDialog';

describe('PushDialog', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should show push dialog', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'initial' },
        localApiState: {
          branch: 'main',
          provider: AVAILABLE_PROVIDERS.GITHUB,
          id: '1234',
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );
    expect(result.getByText('pushChanges')).toBeInTheDocument();
    expect(result.getByText('commitMessage')).toBeInTheDocument();
    result.unmount();
  });

  it('should show success dialog', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'success' },
        localApiState: {
          branch: 'main',
          provider: AVAILABLE_PROVIDERS.GITHUB,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );
    expect(result.getByText('changesPushedTo GitHub')).toBeInTheDocument();
    expect(result.getByText('createPullRequest')).toBeInTheDocument();

    result.unmount();
  });

  it('should be able to push by pressing ctrl/cmd + Enter', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'initial' },
        localApiState: {
          branch: 'main',
          provider: AVAILABLE_PROVIDERS.GITHUB,
        },
      },
    });

    expect(mockStore.getState().uiState.showPushDialog.state).toBe('initial');

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    expect(mockStore.getState().uiState.showPushDialog.state).toBe('initial');

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

    expect(mockStore.getState().uiState.showPushDialog.state).toBe('loading');

    result.unmount();
  });

  it('should be able to push to Supernova by pressing ctrl/cmd + Enter', async () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'initial' },
        localApiState: {
          provider: AVAILABLE_PROVIDERS.SUPERNOVA,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    expect(mockStore.getState().uiState.showPushDialog.state).toBe('initial');

    await act(async () => {
      await fireEvent.click(result.getByTestId('push-dialog-button-push-changes'));
    });

    expect(result.getByText('pushingTo Supernova.io')).toBeInTheDocument();
    expect(mockStore.getState().uiState.showPushDialog.state).toBe('loading');

    result.unmount();
  });
});
