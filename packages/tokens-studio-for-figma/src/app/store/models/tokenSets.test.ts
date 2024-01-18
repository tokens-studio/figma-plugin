import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from './index';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

type Store = RematchStore<RootModel, Record<string, never>>;

describe('toggleUsedTokenSet', () => {
  let store: Store;
  beforeEach(() => {
    store = init<RootModel>({
      redux: {
        initialState: {
          tokenState: {
            tokens: {
              a: [],
              b: [],
              c: [],
            },
            themes: [],
            activeTheme: {},
            usedTokenSet: {
              a: TokenSetStatus.ENABLED,
              b: TokenSetStatus.DISABLED,
              c: TokenSetStatus.DISABLED,
            },
          },
        },
      },
      models,
    });
  });

  it('toggles token set', async () => {
    await store.dispatch.tokenState.toggleUsedTokenSet('b');

    const { usedTokenSet } = store.getState().tokenState;
    expect(usedTokenSet).toEqual({
      a: TokenSetStatus.ENABLED,
      b: TokenSetStatus.ENABLED,
      c: TokenSetStatus.DISABLED,
    });
  });

  it('removes token set if already true', async () => {
    await store.dispatch.tokenState.toggleUsedTokenSet('b');

    expect(store.getState().tokenState.usedTokenSet).toEqual({
      a: TokenSetStatus.ENABLED,
      b: TokenSetStatus.ENABLED,
      c: TokenSetStatus.DISABLED,
    });
    await store.dispatch.tokenState.toggleUsedTokenSet('a');
    expect(store.getState().tokenState.usedTokenSet).toEqual({
      a: TokenSetStatus.DISABLED,
      b: TokenSetStatus.ENABLED,
      c: TokenSetStatus.DISABLED,
    });
  });
});

describe('setActiveTokenSet', () => {
  let store: Store;
  beforeEach(() => {
    store = init<RootModel>({
      redux: {
        initialState: {
          tokenState: {
            tokens: {
              a: [],
              b: [],
              c: [],
            },
            themes: [],
            activeTheme: {},
            activeTokenSet: 'c',
            themes: [],
          },
        },
      },
      models,
    });
  });

  it('sets active token set', async () => {
    await store.dispatch.tokenState.setActiveTokenSet('b');

    const { activeTokenSet } = store.getState().tokenState;
    expect(activeTokenSet).toEqual('b');
  });
});

describe('deleteTokenSet', () => {
  let store: Store;
  beforeEach(() => {
    store = init<RootModel>({
      redux: {
        initialState: {
          tokenState: {
            tokens: {
              a: [],
              b: [],
              c: [],
            },
            themes: [],
            activeTheme: {},
            usedTokenSet: {
              a: TokenSetStatus.DISABLED,
              b: TokenSetStatus.DISABLED,
              c: TokenSetStatus.DISABLED,
            },
            activeTokenSet: 'c',
            themes: [],
          },
        },
      },
      models,
    });
  });

  it('removes token set', async () => {
    await store.dispatch.tokenState.deleteTokenSet('b');

    const tokenData = store.getState().tokenState.tokens;
    expect(tokenData).toEqual({
      a: [],
      c: [],
    });
  });
  it('sets active token set to first set', async () => {
    await store.dispatch.tokenState.deleteTokenSet('c');

    const tokenData = store.getState().tokenState.tokens;
    const { activeTokenSet } = store.getState().tokenState;
    expect(tokenData).toEqual({
      a: [],
      b: [],
    });
    expect(activeTokenSet).toEqual('a');
  });
});

describe('renameTokenSet', () => {
  let store: Store;
  beforeEach(() => {
    store = init<RootModel>({
      redux: {
        initialState: {
          tokenState: {
            tokens: {
              a: [],
              b: [],
              c: [],
            },
            themes: [],
            activeTheme: {},
            activeTokenSet: 'a',
            usedTokenSet: {
              a: TokenSetStatus.ENABLED,
            },
            themes: [],
          },
        },
      },
      models,
    });
  });

  it('renames set', async () => {
    await store.dispatch.tokenState.renameTokenSet({ oldName: 'b', newName: 'theme' });

    const tokenData = store.getState().tokenState.tokens;
    expect(tokenData).toEqual({
      a: [],
      theme: [],
      c: [],
    });
  });
  it('sets active token set to new name if it was active', async () => {
    await store.dispatch.tokenState.renameTokenSet({ oldName: 'a', newName: 'foo' });

    const tokenData = store.getState().tokenState.tokens;
    const { activeTokenSet } = store.getState().tokenState;
    expect(tokenData).toEqual({
      foo: [],
      b: [],
      c: [],
    });
    expect(activeTokenSet).toEqual('foo');
  });

  // Write test to ensure usedTokenSet contains new name and not old name
});

describe('addTokenSet', () => {
  let store: Store;
  beforeEach(() => {
    store = init<RootModel>({
      redux: {
        initialState: {
          tokenState: {
            tokens: {
              global: 1,
            },
            themes: [],
            activeTheme: {},
            usedTokenSet: {
              global: TokenSetStatus.DISABLED,
            },
            themes: [],
          },
        },
      },
      models,
    });
  });

  it('adds a new set if it didnt exist', async () => {
    await store.dispatch.tokenState.addTokenSet('theme');

    const tokenData = store.getState().tokenState.tokens;
    expect(tokenData).toEqual({
      global: 1,
      theme: [],
    });
  });

  it('returns current state if set already existed', async () => {
    await store.dispatch.tokenState.addTokenSet('global');

    const tokenData = store.getState().tokenState.tokens;
    expect(tokenData).toEqual({
      global: 1,
    });
  });
});

describe('setTokenSetOrder', () => {
  it('should reorder token sets', async () => {
    const store = init<RootModel>({
      redux: {
        initialState: {
          tokenState: {
            tokens: {
              a: 1,
              b: 2,
              c: 3,
            },
            themes: [],
            activeTheme: {},
            usedTokenSet: {
              a: TokenSetStatus.DISABLED,
              b: TokenSetStatus.DISABLED,
              c: TokenSetStatus.DISABLED,
            },
            themes: [],
          },
        },
      },
      models,
    });

    await store.dispatch.tokenState.setTokenSetOrder(['c', 'a', 'b']);

    const tokenData = store.getState().tokenState.tokens;
    expect(tokenData).toEqual({
      c: 3,
      a: 1,
      b: 2,
    });
  });
});
