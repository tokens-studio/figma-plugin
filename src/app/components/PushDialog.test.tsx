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
});
