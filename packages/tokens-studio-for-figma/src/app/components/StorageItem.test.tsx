import React from 'react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMockStore, render } from '../../../tests/config/setupTest';
import StorageItem from './StorageItem';
import { useAuthStore } from '@/app/store/useAuthStore';
import { StorageProviderType } from '@/constants/StorageProviderType';
import type { Organization } from '@/types/oauth';
import type { StorageTypeCredentials } from '@/types/StorageType';

const gitProvider = {
  id: 'other',
  provider: 'github',
  branch: 'main',
  filePath: 'si7/figma-token',
};
const onEdit = () => {};

const mockConfirm = jest.fn();
const mockRestoreStoredProvider = jest.fn();
const mockDeleteProvider = jest.fn();
const mockFetchBranches = jest.fn();
const mockLoadProjectTokens = jest.fn();

jest.mock('../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm,
  }),
}));

jest.mock('../store/remoteTokens', () => ({
  __esModule: true,
  default: () => ({
    restoreStoredProvider: mockRestoreStoredProvider,
    deleteProvider: mockDeleteProvider,
    fetchBranches: mockFetchBranches,
  }),
}));

jest.mock('../store/providers/tokens-studio/tokensStudioOAuth', () => ({
  useTokensStudioOAuth: () => ({
    loadProjectTokens: mockLoadProjectTokens,
  }),
}));

const makeOrg = (id: string, subscription: Partial<NonNullable<Organization['subscription']>>): Organization => ({
  id,
  name: `Org ${id}`,
  current_user_seat_type: 'EDITOR',
  subscription: { id: `sub-${id}`, plan: { id: '', name: 'Essential' }, ...subscription },
  projects: { data: [{ id: `project-${id}`, name: `Project ${id}` }] },
});

const studioItem = (org: Organization) => ({
  provider: StorageProviderType.TOKENS_STUDIO_OAUTH,
  internalId: `tokens-studio-${org.id}`,
  name: org.name,
  orgId: org.id,
  id: org.projects.data[0].id,
} as StorageTypeCredentials);

// Plan name 'Essential' with plan_status 'free': a lapsed org before the backend stores current_plan 'free'.
const freeOrg = makeOrg('free', {
  access: ['studio_platform'], plan_type: 'free', plan_status: 'free',
});
const pluginOnlyOrg = makeOrg('plugin', { access: ['figma_plugin'], plan_type: 'plugin', plan_status: 'paid' });
const variablesOrg = makeOrg('variables', {
  access: ['companion', 'studio_platform'], plan_type: 'variables', plan_status: 'paid',
});
const noAccessOrg = makeOrg('none', { access: [], plan_status: 'expired' });
const missingAccessOrg = makeOrg('missing', { plan_status: 'paid' });

describe('StorageItem', () => {
  it('should render storageItem', async () => {
    const result = render(
      <StorageItem item={gitProvider} onEdit={onEdit} />,
    );
    expect(result.queryByText('apply')).toBeInTheDocument();
  });

  it('should be able delete storageItem', async () => {
    mockConfirm.mockImplementationOnce(() => (
      Promise.resolve(true)
    ));
    const result = render(
      <StorageItem item={gitProvider} onEdit={onEdit} />,
    );
    await act(async () => {
      const trigger = await result.findByTestId('storage-item-tools-dropdown');
      trigger.focus();
      await userEvent.keyboard('[Enter]');
    });
    await act(async () => {
      const deleteButton = await result.getByText('delete');
      deleteButton?.focus();
      await userEvent.keyboard('[Enter]');
    });
    expect(mockDeleteProvider).toBeCalledTimes(1);
  });

  it('should be able restore storageItem', async () => {
    mockRestoreStoredProvider.mockImplementationOnce(() => (
      Promise.resolve({
        status: 'success',
      })
    ));
    const result = render(
      <StorageItem item={gitProvider} onEdit={onEdit} />,
    );
    await result.queryByText('apply')?.click();
    expect(mockRestoreStoredProvider).toBeCalledTimes(1);
  });

  describe('Tokens Studio orgs', () => {
    const mockSetActiveOrganization = jest.fn();
    const mockSetActiveProject = jest.fn();

    beforeEach(() => {
      mockLoadProjectTokens.mockReset();
      mockSetActiveOrganization.mockReset();
      mockSetActiveProject.mockReset();
      useAuthStore.setState({
        organizations: [freeOrg, pluginOnlyOrg, variablesOrg, noAccessOrg, missingAccessOrg],
        setActiveOrganization: mockSetActiveOrganization,
        setActiveProject: mockSetActiveProject,
      });
    });

    it('lets a Free org be applied, for this file only, and labels it Free', async () => {
      const result = render(<StorageItem item={studioItem(freeOrg)} onEdit={onEdit} />);

      expect(result.getByText('Free')).toBeInTheDocument();
      expect(result.queryByTestId('storage-item-sync-blocked')).not.toBeInTheDocument();
      const applyButton = result.getByTestId('button-storage-item-apply');
      expect(applyButton).toBeEnabled();

      await act(async () => {
        await userEvent.click(applyButton);
      });

      expect(mockSetActiveOrganization).toHaveBeenCalledWith('free', { persist: false });
      expect(mockLoadProjectTokens).toHaveBeenCalledWith('project-free', undefined, 'free');
    });

    it('keeps letting an org with figma_plugin access but no studio_platform be applied', () => {
      const result = render(<StorageItem item={studioItem(pluginOnlyOrg)} onEdit={onEdit} />);
      expect(result.getByTestId('button-storage-item-apply')).toBeEnabled();
    });

    it.each([
      ['a Variables-plan org', variablesOrg],
      ['an org without studio_platform access', noAccessOrg],
      ['an org with no access field', missingAccessOrg],
    ])('blocks applying %s, says why, and keeps the button out of the tab order', async (_label, org) => {
      const result = render(<StorageItem item={studioItem(org)} onEdit={onEdit} />);

      expect(result.getByTestId('storage-item-sync-blocked')).toHaveTextContent('planCantSync');
      const applyButton = result.getByTestId('button-storage-item-apply');
      expect(applyButton).toBeDisabled();

      act(() => {
        applyButton.focus();
      });
      expect(applyButton).not.toHaveFocus();

      await act(async () => {
        await userEvent.click(applyButton);
      });

      expect(mockSetActiveOrganization).not.toHaveBeenCalled();
      expect(mockLoadProjectTokens).not.toHaveBeenCalled();
    });

    it('keeps a file already connected to a blocked org visible as the active provider', () => {
      const connected = studioItem(noAccessOrg);
      const mockStore = createMockStore({
        uiState: { storageType: connected, localApiState: connected, apiProviders: [] } as any,
      });
      const result = render(
        <Provider store={mockStore}>
          <StorageItem item={connected} onEdit={onEdit} />
        </Provider>,
      );

      expect(result.getByText('active')).toBeInTheDocument();
      expect(result.getByTestId('storage-item-sync-blocked')).toHaveTextContent('planCantSyncConnected');
      expect(result.queryByTestId('button-storage-item-apply')).not.toBeInTheDocument();
      expect(result.getByRole('button', { name: /Project none/ })).toBeDisabled();
    });
  });
});
