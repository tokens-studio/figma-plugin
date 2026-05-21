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

const mockAuthStoreState = {
  isAuthenticated: false,
  organizations: [] as any[],
};

jest.mock('@/app/store/useAuthStore', () => ({
  useAuthStore: () => mockAuthStoreState,
}));

describe('ConfirmDialog', () => {
  afterEach(() => {
    mockAuthStoreState.isAuthenticated = false;
    mockAuthStoreState.organizations = [];
    delete (mockAuthStoreState as any).activeOrganization;
    delete (mockAuthStoreState as any).activeProject;
  });

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

  it('should filter out duplicate apiProviders when matching studioProviders exist', async () => {
    // Populate mock Auth state with an active project in organization
    mockAuthStoreState.isAuthenticated = true;
    const mockOrg = {
      id: 'd360dc7e-d730-42f6-8959-28f8e3d46d33',
      name: "Akshay's workspace",
      projects: {
        data: [{ id: 'proj3', name: 'Project 3' }],
      },
    };
    mockAuthStoreState.organizations = [mockOrg];
    (mockAuthStoreState as any).activeOrganization = mockOrg;
    (mockAuthStoreState as any).activeProject = { id: 'proj3', name: 'Project 3' };

    // Build default store with duplicate legacy/oauth credential in apiProviders list
    const storeWithDuplicate = {
      uiState: {
        localApiState: {
          provider: 'local',
        },
        storageType: {
          provider: 'local',
        },
        apiProviders: [
          {
            id: 'd360dc7e-d730-42f6-8959-28f8e3d46d33',
            provider: StorageProviderType.TOKENS_STUDIO,
            internalId: 'd360dc7e-d730-42f6-8959-28f8e3d46d33',
          },
        ],
      },
    };

    const mockStore = createMockStore(storeWithDuplicate);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    // It should render the dynamic studioProvider 'Akshay's workspace'
    // But since it detected the duplicate, it should NOT render 'd360dc7e-d730-42f6-8959-28f8e3d46d33' from apiProviders!
    expect(result.queryByText("Akshay's workspace")).toBeInTheDocument();
    expect(result.queryByText("d360dc7e-d730-42f6-8959-28f8e3d46d33")).not.toBeInTheDocument();
  });
});
