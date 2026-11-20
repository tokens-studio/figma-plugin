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
import { useAuthStore } from '@/app/store/useAuthStore';
import type { Organization } from '@/types/oauth';

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

  it('should not show any beta badges', async () => {
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

    const betaBadges = result.queryAllByText('BETA');
    expect(betaBadges.length).toBe(0);
  });

  describe('Tokens Studio orgs', () => {
    const makeOrg = (id: string, subscription: Partial<NonNullable<Organization['subscription']>>): Organization => ({
      id,
      name: `Org ${id}`,
      current_user_seat_type: 'EDITOR',
      subscription: { id: `sub-${id}`, plan: { id: '', name: 'Essential' }, ...subscription },
      projects: { data: [{ id: `project-${id}`, name: `Project ${id}` }] },
    });

    afterEach(() => {
      act(() => {
        useAuthStore.setState({ isAuthenticated: false, organizations: [] });
      });
    });

    it('lists Free and paid orgs as providers and shows a notice for Variables-plan orgs', () => {
      useAuthStore.setState({
        isAuthenticated: true,
        organizations: [
          makeOrg('free', { access: ['studio_platform'], plan_type: 'free', plan_status: 'free' }),
          makeOrg('paid', { access: ['figma_plugin', 'studio_platform'], plan_type: 'regular', plan_status: 'paid' }),
          makeOrg('variables', { access: ['companion', 'studio_platform'], plan_type: 'variables', plan_status: 'paid' }),
        ],
      });
      const mockStore = createMockStore(defaultStore);
      const result = render(
        <Provider store={mockStore}>
          <SyncSettings />
        </Provider>,
      );

      expect(result.getByTestId(`storageitem-${StorageProviderType.TOKENS_STUDIO_OAUTH}-project-free`)).toBeInTheDocument();
      expect(result.getByTestId(`storageitem-${StorageProviderType.TOKENS_STUDIO_OAUTH}-project-paid`)).toBeInTheDocument();
      expect(result.queryByTestId(`storageitem-${StorageProviderType.TOKENS_STUDIO_OAUTH}-project-variables`)).not.toBeInTheDocument();

      const notice = result.getByTestId('studio-plan-notice-variables');
      expect(notice).toHaveTextContent('Org variables');
      expect(notice).toHaveTextContent('variablesPlanCantSync');
      expect(notice.querySelector('button')).toBeNull();
    });

    it('keeps the active row for a file already connected to a Variables-plan org', () => {
      const variablesOrg = makeOrg('variables', { access: ['companion', 'studio_platform'], plan_type: 'variables', plan_status: 'paid' });
      useAuthStore.setState({ isAuthenticated: true, organizations: [variablesOrg] });
      const connected = {
        provider: StorageProviderType.TOKENS_STUDIO_OAUTH,
        internalId: 'tokens-studio-variables',
        name: 'Org variables',
        orgId: 'variables',
        id: 'project-variables',
      };
      const mockStore = createMockStore({
        uiState: { ...defaultStore.uiState, storageType: connected, localApiState: connected } as any,
      });
      const result = render(
        <Provider store={mockStore}>
          <SyncSettings />
        </Provider>,
      );

      expect(result.queryByTestId('studio-plan-notice-variables')).not.toBeInTheDocument();
      const row = result.getByTestId(`storageitem-${StorageProviderType.TOKENS_STUDIO_OAUTH}-project-variables`);
      expect(row).toHaveTextContent('active');
      expect(row).toHaveTextContent('planCantSyncConnected');
    });
  });
});
