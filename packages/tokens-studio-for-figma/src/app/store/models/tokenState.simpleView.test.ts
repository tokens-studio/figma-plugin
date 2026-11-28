import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from './index';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushToTokensStudioOAuth, reloadStudioProject } from '../providers/tokens-studio/tokensStudioOAuth';
import { renameSimpleMode } from '../providers/tokens-studio/simpleViewActions';
import { notifyToUI } from '@/plugin/notifiers';

jest.mock('../updateSources', () => jest.fn());
jest.mock('../providers/tokens-studio/tokensStudioOAuth', () => ({
  pushToTokensStudioOAuth: jest.fn(async () => ({ data: { id: 'new-id' } })),
  reloadStudioProject: jest.fn(async () => {}),
}));
jest.mock('../providers/tokens-studio/simpleViewActions', () => ({
  renameSimpleMode: jest.fn(async () => true),
}));
jest.mock('@/plugin/notifiers', () => ({ notifyToUI: jest.fn() }));

const mockPush = jest.mocked(pushToTokensStudioOAuth);
const mockReload = jest.mocked(reloadStudioProject);
const actions = () => mockPush.mock.calls.map(([args]) => args.action);

type Store = RematchStore<RootModel, Record<string, never>>;

function setup({ simple, provider = StorageProviderType.TOKENS_STUDIO_OAUTH }: { simple: boolean; provider?: StorageProviderType }): Store {
  const store = init<RootModel>({ models }) as Store;
  store.dispatch.uiState.setApiData({
    provider, id: 'p1', orgId: 'o1', changeSetId: 'cs1', name: 'Northwind',
  } as any);
  store.dispatch.tokenState.setTokens({
    'Color-mode/Light': [{ name: 'bg', value: '#fff', type: 'color' }],
    'Color-mode/Dark': [{ name: 'bg', value: '#000', type: 'color' }],
  } as any);
  store.dispatch.tokenState.setTokenSetMetadata({
    'Color-mode/Light': { id: 's-light' },
    'Color-mode/Dark': { id: 's-dark' },
  });
  store.dispatch.tokenState.setStudioSimpleView({
    projectId: 'p1',
    active: simple,
    collections: simple ? [{
      id: 'g1',
      name: 'Color-mode',
      defaultModeId: 'o-light',
      modes: [
        {
          id: 'o-light', name: 'Light', tokenSetId: 's-light', tokenSetName: 'Color-mode/Light',
        },
        {
          id: 'o-dark', name: 'Dark', tokenSetId: 's-dark', tokenSetName: 'Color-mode/Dark',
        },
      ],
    }] : [],
  });
  return store;
}

const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

describe('token set writes in a Tokens Studio project in Simple view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates no set: the local one is undone by a reload', async () => {
    const store = setup({ simple: true });
    store.dispatch.tokenState.addTokenSet('Brand');
    await flush();

    expect(actions()).not.toContain('CREATE_TOKEN_SET');
    expect(notifyToUI).toHaveBeenCalledWith(expect.stringContaining('Add a collection or a mode'), { error: true });
    expect(mockReload).toHaveBeenCalled();
  });

  it('deletes no set', async () => {
    const store = setup({ simple: true });
    store.dispatch.tokenState.deleteTokenSet('Color-mode/Dark');
    await flush();

    expect(actions()).not.toContain('DELETE_TOKEN_SET');
    expect(mockReload).toHaveBeenCalled();
  });

  it('renames a mode set by renaming its mode', async () => {
    const store = setup({ simple: true });
    store.dispatch.tokenState.renameTokenSet({ oldName: 'Color-mode/Dark', newName: 'Color-mode/Night' });
    await flush();

    expect(renameSimpleMode).toHaveBeenCalledWith(expect.objectContaining({ id: 'o-dark' }), 'Night');
    expect(actions()).not.toContain('UPDATE_TOKEN_SET');
  });

  it('refuses a rename that moves the set out of its collection', async () => {
    const store = setup({ simple: true });
    store.dispatch.tokenState.renameTokenSet({ oldName: 'Color-mode/Dark', newName: 'Brand/Dark' });
    await flush();

    expect(renameSimpleMode).not.toHaveBeenCalled();
    expect(actions()).not.toContain('UPDATE_TOKEN_SET');
    expect(notifyToUI).toHaveBeenCalledWith(expect.stringContaining('Rename the collection or the mode instead'), { error: true });
    expect(mockReload).toHaveBeenCalled();
  });

  it('sends no set order', async () => {
    const store = setup({ simple: true });
    store.dispatch.tokenState.setTokenSetOrder(['Color-mode/Dark', 'Color-mode/Light']);
    await flush();

    expect(actions()).not.toContain('UPDATE_TOKEN_SET');
  });
});

describe('token set writes in any other project keep today\'s payloads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates, renames, reorders and deletes sets in an Advanced Studio project', async () => {
    const store = setup({ simple: false });
    store.dispatch.tokenState.addTokenSet('Brand');
    store.dispatch.tokenState.renameTokenSet({ oldName: 'Color-mode/Dark', newName: 'Color-mode/Night' });
    store.dispatch.tokenState.setTokenSetOrder(['Color-mode/Light', 'Color-mode/Night']);
    store.dispatch.tokenState.deleteTokenSet('Color-mode/Light');
    await flush();

    expect(mockPush.mock.calls.map(([args]) => [args.action, args.data])).toEqual([
      ['CREATE_TOKEN_SET', { name: 'Brand' }],
      ['UPDATE_TOKEN_SET', { id: 's-dark', name: 'Color-mode/Night' }],
      ['UPDATE_TOKEN_SET', { id: 's-light', order_index: 0 }],
      ['DELETE_TOKEN_SET', { id: 's-light' }],
    ]);
    expect(renameSimpleMode).not.toHaveBeenCalled();
    expect(mockReload).not.toHaveBeenCalled();
  });

  it('ignores a Simple view read once the file syncs with another provider', async () => {
    const store = setup({ simple: true, provider: StorageProviderType.GITHUB });
    store.dispatch.tokenState.addTokenSet('Brand');
    store.dispatch.tokenState.deleteTokenSet('Color-mode/Light');
    await flush();

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockReload).not.toHaveBeenCalled();
    expect(Object.keys(store.getState().tokenState.tokens)).toEqual(['Color-mode/Dark', 'Brand']);
  });
});
