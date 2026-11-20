import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import {
  createMockStore, render, waitFor,
} from '../../../../../tests/config/setupTest';
import { ManageThemesModal } from '../ManageThemesModal';
import { notifyToUI } from '@/plugin/notifiers';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

jest.mock('@/plugin/notifiers', () => ({
  notifyToUI: jest.fn(),
}));

// Saving a theme writes the document, which is wrapped in a profiling transaction.
jest.mock('@/profiling/transaction', () => ({
  wrapTransaction: jest.fn((opts, fn) => fn()),
  spanTransaction: jest.fn((opts, fn) => fn()),
}));

jest.mock('../../../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({ confirm: jest.fn() }),
}));

const studioStorage = {
  provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'project-1', name: 'Org', orgId: 'org-1',
};

const renderModal = (storageType: Record<string, unknown>, usedTokenSet: Record<string, TokenSetStatus>) => {
  const mockStore = createMockStore({
    uiState: { storageType } as any,
    tokenState: { tokens: { global: [] }, usedTokenSet, themes: [] } as any,
  });
  const result = render(
    <Provider store={mockStore}>
      <ManageThemesModal />
    </Provider>,
  );
  return { mockStore, result };
};

// Tokens Studio refuses a theme without a group or without a set in use, so the form says so up front instead of
// creating a theme that the push then takes back out.
describe('ManageThemesModal in a file synced with Tokens Studio', () => {
  beforeEach(() => {
    jest.mocked(notifyToUI).mockReset();
  });

  const createTheme = async (result: ReturnType<typeof render>, { group }: { group?: string } = {}) => {
    const user = userEvent.setup();
    await user.click(result.getByText('newTheme'));
    if (group) {
      await user.click(result.getByTestId('button-manage-themes-modal-new-group'));
      await user.type(result.getByTestId('create-or-edit-theme-form--group--name'), group);
    }
    await user.type(result.getByTestId('create-or-edit-theme-form--input--name'), 'Light');
    await user.click(result.getByText('saveTheme'));
  };

  it('asks for a group and keeps the form open', async () => {
    const { mockStore, result } = renderModal(studioStorage, { global: TokenSetStatus.ENABLED });

    await createTheme(result);

    await waitFor(() => expect(notifyToUI).toHaveBeenCalledWith('studioThemeNeedsGroup', { error: true }));
    expect(mockStore.getState().tokenState.themes).toHaveLength(0);
    expect(result.getByText('saveTheme')).toBeInTheDocument();
  });

  it('asks for a token set in use', async () => {
    const { mockStore, result } = renderModal(studioStorage, {});

    await createTheme(result, { group: 'Mode' });

    await waitFor(() => expect(notifyToUI).toHaveBeenCalledWith('studioThemeNeedsTokenSet', { error: true }));
    expect(mockStore.getState().tokenState.themes).toHaveLength(0);
  });

  it('still allows an ungrouped theme in a file that does not sync with Tokens Studio', async () => {
    const { mockStore, result } = renderModal({ provider: StorageProviderType.LOCAL }, { global: TokenSetStatus.ENABLED });

    await createTheme(result);

    await waitFor(() => expect(mockStore.getState().tokenState.themes).toHaveLength(1));
    expect(notifyToUI).not.toHaveBeenCalledWith('studioThemeNeedsGroup', expect.anything());
  });
});
