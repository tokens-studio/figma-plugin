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
  const mockStore = createMockStore({
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
  });

  it('should return sync settings and stored Providers', async () => {
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

  it('should return ConfirmLocalStorageModal', async () => {
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
});
