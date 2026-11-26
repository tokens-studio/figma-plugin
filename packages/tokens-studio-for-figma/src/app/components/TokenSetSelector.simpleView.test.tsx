import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { createMockStore, render } from '../../../tests/config/setupTest';
import TokenSetSelector from './TokenSetSelector';
import { StorageProviderType } from '@/constants/StorageProviderType';
import {
  addSimpleCollection, addSimpleMode, renameSimpleCollection, renameSimpleMode,
} from '@/app/store/providers/tokens-studio/simpleViewActions';
import { notifyToUI } from '@/plugin/notifiers';

jest.mock('@/plugin/notifiers', () => ({ notifyToUI: jest.fn() }));
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

const renderSelector = ({
  provider = StorageProviderType.TOKENS_STUDIO_OAUTH, active = true, extraSets = [] as string[],
} = {}) => {
  const api = {
    provider, id: 'p1', orgId: 'o1', name: 'Northwind',
  };
  const mockStore = createMockStore({
    uiState: { api, storageType: api, sidebarWidth: 200 } as any,
    tokenState: {
      tokens: { 'Color-mode/Light': [], 'Color-mode/Dark': [], ...Object.fromEntries(extraSets.map((set) => [set, []])) },
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

describe('TokenSetSelector renames and adds in a Simple project', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renames a collection folder by renaming the collection', async () => {
    const user = userEvent.setup();
    const result = renderSelector();

    await user.pointer({ keys: '[MouseRight]', target: result.getByTestId('tokensetitem-Color-mode') });
    await user.click(await result.findByText('rename'));
    const input = result.getByTestId('simple-rename-input');
    expect(input).toHaveValue('Color-mode');
    await user.clear(input);
    await user.type(input, 'Appearance');
    await user.click(result.getByTestId('simple-rename-submit'));

    expect(renameSimpleCollection).toHaveBeenCalledWith(collection, 'Appearance');
  });

  it('closes the rename without a call when it is cancelled or unchanged', async () => {
    const user = userEvent.setup();
    const result = renderSelector();

    await user.pointer({ keys: '[MouseRight]', target: result.getByTestId('tokensetitem-Color-mode/Light') });
    await user.click(await result.findByText('rename'));
    await user.click(result.getByText('cancel'));
    expect(result.queryByTestId('simple-rename-input')).not.toBeInTheDocument();

    await user.pointer({ keys: '[MouseRight]', target: result.getByTestId('tokensetitem-Color-mode/Light') });
    await user.click(await result.findByText('rename'));
    await user.click(result.getByTestId('simple-rename-submit'));

    expect(renameSimpleMode).not.toHaveBeenCalled();
    expect(renameSimpleCollection).not.toHaveBeenCalled();
  });

  it('refuses to rename a set that is no mode\'s set', async () => {
    const user = userEvent.setup();
    const result = renderSelector({ extraSets: ['Loose'] });

    await user.pointer({ keys: '[MouseRight]', target: result.getByTestId('tokensetitem-Loose') });
    await user.click(await result.findByText('rename'));

    expect(notifyToUI).toHaveBeenCalledWith(expect.stringContaining('Rename the collection or the mode instead'), { error: true });
    expect(result.queryByTestId('simple-rename-input')).not.toBeInTheDocument();
  });

  it('adds a mode to the chosen collection', async () => {
    const user = userEvent.setup();
    const result = renderSelector();

    await user.click(result.getByTestId('button-simple-add-mode'));
    await user.type(result.getByTestId('simple-add-name-input'), 'Sepia');
    await user.click(result.getByTestId('simple-add-submit'));

    expect(addSimpleMode).toHaveBeenCalledWith(collection, 'Sepia');
  });

  it('cancels adding without a call', async () => {
    const user = userEvent.setup();
    const result = renderSelector();

    await user.click(result.getByTestId('button-simple-add-collection'));
    await user.click(result.getByText('cancel'));

    expect(addSimpleCollection).not.toHaveBeenCalled();
    expect(result.queryByTestId('simple-add-name-input')).not.toBeInTheDocument();
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
