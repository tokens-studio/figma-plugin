import { createMockStore } from '../../../../../../tests/config/setupTest';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { ThemeObjectsList } from '@/types';

const themes: ThemeObjectsList = [
  {
    id: 'light', name: 'Light', group: 'mode', selectedTokenSets: { global: TokenSetStatus.ENABLED },
  },
  {
    id: 'dark', name: 'Dark', group: 'mode', selectedTokenSets: { global: TokenSetStatus.ENABLED },
  },
  {
    id: 'brand-a', name: 'Brand A', group: 'brand', selectedTokenSets: { global: TokenSetStatus.ENABLED },
  },
  {
    id: 'compact', name: 'Compact', selectedTokenSets: { global: TokenSetStatus.ENABLED },
  },
];

const createStore = (activeTheme: Record<string, string>) => createMockStore({
  tokenState: {
    tokens: { global: [] },
    themes,
    activeTheme,
  },
});

describe('saveTheme', () => {
  it('moves an active theme to its new group instead of keeping it under the old one too', () => {
    const store = createStore({ mode: 'light', brand: 'brand-a' });
    store.dispatch.tokenState.saveTheme({
      id: 'light',
      name: 'Light',
      group: 'colors',
      selectedTokenSets: { global: TokenSetStatus.ENABLED },
      meta: { oldName: 'Light', oldGroup: 'mode' },
    });

    expect(store.getState().tokenState.activeTheme).toEqual({ colors: 'light', brand: 'brand-a' });
  });

  it('keeps an active theme counted once when its group is removed', () => {
    const store = createStore({ mode: 'light' });
    store.dispatch.tokenState.saveTheme({
      id: 'light',
      name: 'Light',
      selectedTokenSets: { global: TokenSetStatus.ENABLED },
      meta: { oldName: 'Light', oldGroup: 'mode' },
    });

    expect(store.getState().tokenState.activeTheme).toEqual({ [INTERNAL_THEMES_NO_GROUP]: 'light' });
  });

  it('keeps an active theme counted once when it gets a group', () => {
    const store = createStore({ [INTERNAL_THEMES_NO_GROUP]: 'compact', mode: 'dark' });
    store.dispatch.tokenState.saveTheme({
      id: 'compact',
      name: 'Compact',
      group: 'density',
      selectedTokenSets: { global: TokenSetStatus.ENABLED },
      meta: { oldName: 'Compact' },
    });

    expect(store.getState().tokenState.activeTheme).toEqual({ density: 'compact', mode: 'dark' });
  });

  it('leaves the active themes alone when editing an inactive theme', () => {
    const store = createStore({ mode: 'light' });
    store.dispatch.tokenState.saveTheme({
      id: 'dark',
      name: 'Dark',
      group: 'colors',
      selectedTokenSets: { global: TokenSetStatus.ENABLED },
      meta: { oldName: 'Dark', oldGroup: 'mode' },
    });

    expect(store.getState().tokenState.activeTheme).toEqual({ mode: 'light' });
  });
});

describe('setTokenData', () => {
  it('drops active themes that are listed under a group they are no longer in', () => {
    const store = createStore({});
    store.dispatch.tokenState.setTokenData({
      values: { global: [] },
      themes,
      // Saved by an older version: "light" was moved out of "colors" but stayed listed there
      activeTheme: { colors: 'light', mode: 'light', [INTERNAL_THEMES_NO_GROUP]: 'compact' },
      usedTokenSet: { global: TokenSetStatus.ENABLED },
    });

    expect(store.getState().tokenState.activeTheme).toEqual({ mode: 'light', [INTERNAL_THEMES_NO_GROUP]: 'compact' });
  });
});
