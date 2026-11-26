import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { createMockStore, render } from '../../../tests/config/setupTest';
import TokenSetSelector from './TokenSetSelector';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { addSimpleCollection, renameSimpleMode } from '@/app/store/providers/tokens-studio/simpleViewActions';

jest.mock('@/app/store/providers/tokens-studio/simpleViewActions', () => ({
  addSimpleCollection: jest.fn(),
  addSimpleMode: jest.fn(),
  renameSimpleCollection: jest.fn(),
  renameSimpleMode: jest.fn(),
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

const noop = () => {};

const renderSelector = ({ provider = StorageProviderType.TOKENS_STUDIO_OAUTH, active = true } = {}) => {
  const api = {
    provider, id: 'p1', orgId: 'o1', name: 'Northwind',
  };
  const mockStore = createMockStore({
    uiState: { api, storageType: api, sidebarWidth: 200 } as any,
    tokenState: {
      tokens: { 'Color-mode/Light': [], 'Color-mode/Dark': [] },
      usedTokenSet: {},
      activeTokenSet: 'Color-mode/Light',
      studioSimpleView: { projectId: 'p1', active, collections: active ? [collection] : [] },
    } as any,
  });
  return render(
    <Provider store={mockStore}>
      <TokenSetSelector saveScrollPositionSet={noop} />
    </Provider>,
  );
};

describe('TokenSetSelector for a Tokens Studio project in Simple view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('offers Add collection and Add mode instead of New set', () => {
    const result = renderSelector();

    expect(result.getByTestId('button-simple-add-collection')).toBeInTheDocument();
    expect(result.getByTestId('button-simple-add-mode')).toBeInTheDocument();
    expect(result.queryByTestId('button-new-token-set')).not.toBeInTheDocument();
  });

  it('adds a collection', async () => {
    const user = userEvent.setup();
    const result = renderSelector();

    await user.click(result.getByTestId('button-simple-add-collection'));
    await user.type(result.getByTestId('simple-add-name-input'), 'Density');
    await user.click(result.getByTestId('simple-add-submit'));

    expect(addSimpleCollection).toHaveBeenCalledWith('Density');
  });

  it('renames a mode set by renaming its mode, and offers no duplicate or delete', async () => {
    const user = userEvent.setup();
    const result = renderSelector();

    await user.pointer({ keys: '[MouseRight]', target: result.getByTestId('tokensetitem-Color-mode/Dark') });
    expect(result.queryByText('duplicate')).not.toBeInTheDocument();
    expect(result.queryByText('delete')).not.toBeInTheDocument();
    await user.click(await result.findByText('rename'));
    const input = result.getByTestId('simple-rename-input');
    expect(input).toHaveValue('Dark');
    await user.clear(input);
    await user.type(input, 'Night');
    await user.click(result.getByTestId('simple-rename-submit'));

    expect(renameSimpleMode).toHaveBeenCalledWith(collection.modes[1], 'Night');
  });
});

describe('TokenSetSelector for every other project', () => {
  it('keeps New set and the full set menu for an Advanced Studio project', async () => {
    const user = userEvent.setup();
    const result = renderSelector({ active: false });

    expect(result.getByTestId('button-new-token-set')).toBeInTheDocument();
    expect(result.queryByTestId('button-simple-add-collection')).not.toBeInTheDocument();
    await user.pointer({ keys: '[MouseRight]', target: result.getByTestId('tokensetitem-Color-mode/Dark') });
    expect(await result.findByText('duplicate')).toBeInTheDocument();
    expect(result.getByText('delete')).toBeInTheDocument();
  });

  it('keeps New set for another provider', () => {
    const result = renderSelector({ provider: StorageProviderType.GITHUB });

    expect(result.getByTestId('button-new-token-set')).toBeInTheDocument();
    expect(result.queryByTestId('button-simple-add-mode')).not.toBeInTheDocument();
  });
});
