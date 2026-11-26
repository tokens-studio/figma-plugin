import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { createMockStore, render } from '../../../../../tests/config/setupTest';
import { ManageThemesModal } from '../ManageThemesModal';
import { StorageProviderType } from '@/constants/StorageProviderType';
import {
  addSimpleCollection, addSimpleMode, reorderSimpleModes, renameSimpleCollection,
} from '@/app/store/providers/tokens-studio/simpleViewActions';

jest.mock('@/app/store/providers/tokens-studio/simpleViewActions', () => ({
  addSimpleCollection: jest.fn(),
  addSimpleMode: jest.fn(),
  copySimpleModeValues: jest.fn(),
  deleteSimpleCollection: jest.fn(),
  deleteSimpleMode: jest.fn(),
  renameSimpleCollection: jest.fn(),
  renameSimpleMode: jest.fn(),
  reorderSimpleModes: jest.fn(),
  setSimpleDefaultMode: jest.fn(),
}));
jest.mock('../../../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({ confirm: jest.fn(async () => true) }),
}));

const collection = {
  id: 'g1',
  name: 'Color-mode',
  defaultModeId: 'o-light',
  modes: [
    { id: 'o-light', name: 'Light', tokenSetName: 'Color-mode/Light' },
    { id: 'o-dark', name: 'Dark', tokenSetName: 'Color-mode/Dark' },
  ],
};

const themes = [
  {
    id: 'o-light', name: 'Light', group: 'Color-mode', selectedTokenSets: { 'Color-mode/Light': 'enabled' },
  },
  {
    id: 'o-dark', name: 'Dark', group: 'Color-mode', selectedTokenSets: { 'Color-mode/Light': 'enabled', 'Color-mode/Dark': 'enabled' },
  },
];

const renderModal = ({ provider = StorageProviderType.TOKENS_STUDIO_OAUTH, active = true } = {}) => {
  const api = {
    provider, id: 'p1', orgId: 'o1', name: 'Northwind',
  };
  const mockStore = createMockStore({
    uiState: { api, storageType: api } as any,
    tokenState: {
      tokens: { 'Color-mode/Light': [], 'Color-mode/Dark': [] },
      themes,
      studioSimpleView: { projectId: 'p1', active, collections: active ? [collection] : [] },
    } as any,
  });
  return render(
    <Provider store={mockStore}>
      <ManageThemesModal />
    </Provider>,
  );
};

describe('ManageThemesModal for a Tokens Studio project in Simple view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows collections and modes, with the default mode, and no set picker', () => {
    const result = renderModal();

    expect(result.getByTestId('simple-view-themes')).toBeInTheDocument();
    expect(result.getByText('Color-mode')).toBeInTheDocument();
    expect(result.getByTestId('simple-mode-Color-mode-Light')).toHaveTextContent('simpleView.default');
    expect(result.getByTestId('simple-mode-Color-mode-Dark')).not.toHaveTextContent('simpleView.default');
    expect(result.queryByText('newTheme')).not.toBeInTheDocument();
    expect(result.queryByTestId('button-manage-themes-modal-new-theme')).not.toBeInTheDocument();
  });

  it('adds a collection', async () => {
    const user = userEvent.setup();
    const result = renderModal();

    await user.click(result.getByTestId('button-simple-new-collection'));
    await user.type(result.getByTestId('simple-new-collection-input'), 'Density');
    await user.click(result.getByTestId('simple-new-collection-submit'));

    expect(addSimpleCollection).toHaveBeenCalledWith('Density');
  });

  it('adds a mode to a collection', async () => {
    const user = userEvent.setup();
    const result = renderModal();

    await user.click(result.getByTestId('simple-collection-Color-mode-add-mode'));
    await user.type(result.getByTestId('simple-new-mode-input'), 'High-contrast');
    await user.click(result.getByTestId('simple-new-mode-submit'));

    expect(addSimpleMode).toHaveBeenCalledWith(collection, 'High-contrast');
  });

  it('reorders modes', async () => {
    const user = userEvent.setup();
    const result = renderModal();

    expect(result.getByTestId('simple-mode-Light-up')).toBeDisabled();
    await user.click(result.getByTestId('simple-mode-Light-down'));

    expect(reorderSimpleModes).toHaveBeenCalledWith(collection, ['o-dark', 'o-light']);
  });

  it('renames a collection from its menu', async () => {
    const user = userEvent.setup();
    const result = renderModal();

    await user.click(result.getByTestId('simple-collection-Color-mode-menu'));
    await user.click(await result.findByText('simpleView.rename'));
    const input = result.getByTestId('simple-rename-collection-input');
    await user.clear(input);
    await user.type(input, 'Appearance');
    await user.click(result.getByTestId('simple-rename-collection-submit'));

    expect(renameSimpleCollection).toHaveBeenCalledWith(collection, 'Appearance');
  });
});

describe('ManageThemesModal for every other project', () => {
  it('keeps the theme editor for an Advanced Studio project', () => {
    const result = renderModal({ active: false });

    expect(result.queryByTestId('simple-view-themes')).not.toBeInTheDocument();
    expect(result.getByTestId('button-manage-themes-modal-new-theme')).toBeInTheDocument();
  });

  it('keeps the theme editor for another provider, whatever Simple view was read before', () => {
    const result = renderModal({ provider: StorageProviderType.GITHUB });

    expect(result.queryByTestId('simple-view-themes')).not.toBeInTheDocument();
    expect(result.getByTestId('button-manage-themes-modal-new-theme')).toBeInTheDocument();
  });
});
