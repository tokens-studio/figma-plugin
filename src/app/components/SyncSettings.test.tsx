import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import {
  createMockStore,
  render,
} from '../../../tests/config/setupTest';
import SyncSettings from './SyncSettings';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { GitStorageType, StorageTypeCredential } from '@/types/StorageType';

describe('ConfirmDialog', () => {
  const defaultStore = {
    uiState: {
      localApiState: {
        branch: 'main',
        filePath: 'data/tokens.json',
        id: 'six7/figma-tokens',
        provider: 'github' as StorageProviderType,
      },
      storageType: {
        branch: 'main',
        filePath: 'data/tokens.json',
        id: 'six7/figma-tokens',
        provider: 'github',
      } as GitStorageType,
      apiProviders: [
        {
          branch: 'main',
          filePath: 'data/tokens.json',
          id: 'six7/figma-tokens',
          provider: 'github',
        } as StorageTypeCredential<GitStorageType>,
      ],
    },
  };

  it('should return sync settings and stored Providers', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );
    expect(result.queryByText('Token Storage')).toBeInTheDocument();
    expect(result.queryByText('Local document')).toBeInTheDocument();
    expect(result.queryByText('URL')).toBeInTheDocument();
    expect(result.queryByText('JSONbin')).toBeInTheDocument();
    expect(result.queryByText('GitHub')).toBeInTheDocument();
    expect(result.queryByText('GitLab')).toBeInTheDocument();
    expect(result.queryByText('ADO')).toBeInTheDocument();
    expect(result.queryByText('Add new credentials')).toBeInTheDocument();
  });

  it('should return ConfirmLocalStorageModal when seleting local storage', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      result.queryByText('Local document')?.click();
    });

    expect(result.queryByText('Set to document storage?')).toBeInTheDocument();
  });

  it('can convert to localStorage', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      result.queryByText('Local document')?.click();
    });

    await act(async () => {
      result.queryByText('Yes, set to local.')?.click();
    });

    expect(mockStore.getState().uiState.localApiState).toEqual({
      provider: 'local',
    });
    expect(mockStore.getState().uiState.storageType).toEqual({
      provider: 'local',
    });
  });

  it('should return EditStorageItemModal when edit remote storage', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      result.queryByText('Edit')?.click();
    });

    expect(result.queryByText('Edit storage item')).toBeInTheDocument();
  });

  it('should return CreateStorageItemModal when create new remote storage', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      result.queryByText('Add new credentials')?.click();
    });

    expect(result.queryAllByText('Add new credentials')).toHaveLength(2);
    expect(result.queryByText('Personal Access Token')).toBeInTheDocument();
    expect(result.queryByText('Repository (username/repo)')).toBeInTheDocument();
    expect(result.queryByText('Default Branch')).toBeInTheDocument();
    expect(result.queryByText('File Path (e.g. data/tokens.json)')).toBeInTheDocument();
    expect(result.queryByText('baseUrl (optional)')).toBeInTheDocument();
    expect(result.queryByText('Save')).toBeInTheDocument();
  });
});
