import React from 'react';
import { Provider } from 'react-redux';
import { StorageProviderType } from '@/constants/StorageProviderType';
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
          provider: StorageProviderType.GITHUB,
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
          provider: StorageProviderType.GITHUB,
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
          provider: StorageProviderType.SUPERNOVA,
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

  it('should handle error state when push fails', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'error' },
        localApiState: {
          branch: 'main',
          provider: StorageProviderType.GITHUB,
        },
      },
    });

    const { container } = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    // Error state should return null (dialog closes)
    expect(container.firstChild).toBeNull();
  });

  it('should disable push button when commit message is empty for GitHub', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'initial' },
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

    const pushButton = result.getByTestId('push-dialog-button-push-changes');
    expect(pushButton).toBeDisabled();

    result.unmount();
  });

  it('should disable push button when branch is empty for GitLab', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'initial' },
        localApiState: {
          branch: '',
          provider: StorageProviderType.GITLAB,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    const pushButton = result.getByTestId('push-dialog-button-push-changes');
    expect(pushButton).toBeDisabled();

    result.unmount();
  });

  it('should enable push button for Supernova without commit message', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'initial' },
        localApiState: {
          provider: StorageProviderType.SUPERNOVA,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    const pushButton = result.getByTestId('push-dialog-button-push-changes');
    expect(pushButton).not.toBeDisabled();

    result.unmount();
  });

  it('should show loading state for Bitbucket', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'loading' },
        localApiState: {
          provider: StorageProviderType.BITBUCKET,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    expect(result.getByText('pushingTo Bitbucket')).toBeInTheDocument();

    result.unmount();
  });

  it('should show loading state for ADO', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'loading' },
        localApiState: {
          provider: StorageProviderType.ADO,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    expect(result.getByText('pushingTo ADO')).toBeInTheDocument();

    result.unmount();
  });

  it('should show loading state for GitLab', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'loading' },
        localApiState: {
          provider: StorageProviderType.GITLAB,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    expect(result.getByText('pushingTo GitLab')).toBeInTheDocument();

    result.unmount();
  });

  it('should show success state for Bitbucket', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'success' },
        localApiState: {
          branch: 'main',
          provider: StorageProviderType.BITBUCKET,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    expect(result.getByText('changesPushedTo Bitbucket')).toBeInTheDocument();
    expect(result.getByText('createPullRequest')).toBeInTheDocument();

    result.unmount();
  });

  it('should show success state for GitLab', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'success' },
        localApiState: {
          branch: 'develop',
          provider: StorageProviderType.GITLAB,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    expect(result.getByText('changesPushedTo GitLab')).toBeInTheDocument();
    expect(result.getByText('createPullRequest')).toBeInTheDocument();

    result.unmount();
  });

  it('should show success state for ADO', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'success' },
        localApiState: {
          branch: 'feature',
          provider: StorageProviderType.ADO,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    expect(result.getByText('changesPushedTo ADO')).toBeInTheDocument();
    expect(result.getByText('createPullRequest')).toBeInTheDocument();

    result.unmount();
  });

  it('should show success state for Supernova with different button text', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'success' },
        localApiState: {
          provider: StorageProviderType.SUPERNOVA,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    expect(result.getByText('changesPushedTo Supernova.io')).toBeInTheDocument();
    expect(result.getByText('openSupernovaWorkspace')).toBeInTheDocument();

    result.unmount();
  });

  it('should return null for unknown state', () => {
    const mockStore = createMockStore({
      uiState: {
        showPushDialog: { state: 'unknown' },
        localApiState: {
          branch: 'main',
          provider: StorageProviderType.GITHUB,
        },
      },
    });

    const { container } = render(
      <Provider store={mockStore}>
        <PushDialog />
      </Provider>,
    );

    expect(container.firstChild).toBeNull();
  });
});
