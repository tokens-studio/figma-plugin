import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import {
  createMockStore,
  render,
} from '../../../tests/config/setupTest';
import SyncSettings from './SyncSettings';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { GitHubStorageType, StorageTypeCredential } from '@/types/StorageType';

const mockConfirm = jest.fn();

jest.mock('../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm,
  }),
}));

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
      } as GitHubStorageType,
      apiProviders: [
        {
          branch: 'main',
          filePath: 'data/tokens.json',
          id: 'six7/figma-tokens',
          provider: 'github',
        } as StorageTypeCredential<GitHubStorageType>,
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
    expect(result.queryByText('syncProviders')).toBeInTheDocument();
    expect(result.queryByText('localDocument')).toBeInTheDocument();
  });

  it('can convert to localStorage', async () => {
    const mockStore = createMockStore(defaultStore);
    mockConfirm.mockImplementationOnce(() => (
      Promise.resolve(true)
    ));
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      result.queryAllByText('apply')[0]?.click();
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
      const trigger = await result.findByTestId('storage-item-tools-dropdown');
      trigger.focus();
      await userEvent.keyboard('[Enter]');
    });

    await act(async () => {
      const editButton = await result.queryByText('edit');
      editButton?.focus();
      await userEvent.keyboard('[Enter]');
    });

    expect(result.queryByText('editCredentials')).toBeInTheDocument();
  });

  it('should return CreateStorageItemModal when create new remote storage', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      const trigger = await result.getByTestId('add-storage-item-button');
      trigger?.focus();
      await userEvent.keyboard('[Enter]');
    });

    await act(async () => {
      const githubButton = await result.getByTestId('add-GitHub-credential');
      githubButton?.focus();
      await userEvent.keyboard('[Enter]');
    });

    expect(result.queryByText('pat')).toBeInTheDocument();
    expect(result.queryByText('repo')).toBeInTheDocument();
    expect(result.queryByText('branch')).toBeInTheDocument();
    expect(result.queryByText('filePath')).toBeInTheDocument();
    expect(result.queryByText('baseUrl')).toBeInTheDocument();
    // expect(result.queryByText('Save Credentials')).toBeInTheDocument();
  });

  it('should show beta badge for providers with beta flag', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      const trigger = await result.getByTestId('add-storage-item-button');
      trigger?.focus();
      await userEvent.keyboard('[Enter]');
    });

    // Should have BETA badges for providers with beta: true
    const betaBadges = result.queryAllByText('BETA');
    expect(betaBadges.length).toBeGreaterThan(0);
  });

  it('should not show beta badge for Tokens Studio provider after fix', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      const trigger = await result.getByTestId('add-storage-item-button');
      trigger?.focus();
      await userEvent.keyboard('[Enter]');
    });

    // Find the Tokens Studio provider button
    const tokensStudioButton = await result.queryByTestId('add-Tokens Studio-credential');
    expect(tokensStudioButton).toBeInTheDocument();

    // BitBucket still has beta badge, so there should be at least one BETA badge
    // But specifically Tokens Studio should not have a beta badge
    const betaBadges = result.queryAllByText('BETA');
    // Should still have at least one because BitBucket has beta: true
    expect(betaBadges.length).toBeGreaterThanOrEqual(1);

    // The test is that the total number of BETA badges should be exactly 1 (BitBucket only)
    expect(betaBadges.length).toBe(1);
  });
});
