import { createMockStore } from '../../../../../../tests/config/setupTest';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { ThemeObjectsList } from '@/types';

const themes: ThemeObjectsList = [
  {
    id: 'light', name: 'Light', group: 'mode', selectedTokenSets: { light: TokenSetStatus.ENABLED },
  },
  {
    id: 'dark', name: 'Dark', group: 'mode', selectedTokenSets: { dark: TokenSetStatus.ENABLED },
  },
  {
    id: 'compact', name: 'Compact', selectedTokenSets: { global: TokenSetStatus.ENABLED },
  },
  {
    id: 'brand-a', name: 'Brand A', group: '', selectedTokenSets: { global: TokenSetStatus.ENABLED },
  },
];

const values = { global: [], light: [], dark: [] };

const loadTokenData = (activeTheme: Record<string, string>, usedTokenSet: Record<string, TokenSetStatus>) => {
  const store = createMockStore({});
  store.dispatch.tokenState.setTokenData({
    values,
    themes,
    activeTheme,
    usedTokenSet,
  });
  return store.getState().tokenState;
};

describe('setTokenData', () => {
  it('drops a theme listed under a group it is no longer in when it is also listed under its current group', () => {
    // Saved by an older version: "light" was moved out of "colors" but stayed listed there
    const { activeTheme } = loadTokenData(
      { colors: 'light', mode: 'light', [INTERNAL_THEMES_NO_GROUP]: 'compact' },
      { global: TokenSetStatus.ENABLED, light: TokenSetStatus.ENABLED },
    );

    expect(activeTheme).toEqual({ mode: 'light', [INTERNAL_THEMES_NO_GROUP]: 'compact' });
  });

  it('keeps a theme with an empty group active', () => {
    const usedTokenSet = { global: TokenSetStatus.ENABLED };
    const tokenState = loadTokenData({ [INTERNAL_THEMES_NO_GROUP]: 'brand-a' }, usedTokenSet);

    expect(tokenState.activeTheme).toEqual({ [INTERNAL_THEMES_NO_GROUP]: 'brand-a' });
    expect(tokenState.usedTokenSet).toEqual({ ...usedTokenSet, light: TokenSetStatus.DISABLED, dark: TokenSetStatus.DISABLED });
  });

  it('keeps an active theme active under its new group after it was moved in the synced themes', () => {
    // "light" was active under "colors", then a teammate moved it to "mode"
    const usedTokenSet = { light: TokenSetStatus.ENABLED };
    const tokenState = loadTokenData({ colors: 'light' }, usedTokenSet);

    expect(tokenState.activeTheme).toEqual({ mode: 'light' });
    expect(tokenState.usedTokenSet).toEqual({ ...usedTokenSet, global: TokenSetStatus.DISABLED, dark: TokenSetStatus.DISABLED });
  });

  it('collapses duplicate entries of the same theme into one', () => {
    const { activeTheme } = loadTokenData(
      { colors: 'light', theme: 'light' },
      { light: TokenSetStatus.ENABLED },
    );

    expect(activeTheme).toEqual({ mode: 'light' });
  });

  it('does not move a theme into a group that already has an active theme', () => {
    const { activeTheme } = loadTokenData(
      { colors: 'light', mode: 'dark' },
      { dark: TokenSetStatus.ENABLED },
    );

    expect(activeTheme).toEqual({ mode: 'dark' });
  });

  it('drops themes that no longer exist', () => {
    const { activeTheme } = loadTokenData(
      { mode: 'light', brand: 'deleted' },
      { light: TokenSetStatus.ENABLED },
    );

    expect(activeTheme).toEqual({ mode: 'light' });
  });
});
