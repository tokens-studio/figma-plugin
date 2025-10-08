import { setActiveTheme } from './setActiveTheme';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { TokenState } from '../../tokenState';

describe('setActiveTheme', () => {
  const createMockState = (): TokenState => ({
    tokens: {
      global: [],
      colors: [],
      spacing: [],
      typography: [],
    },
    themes: [
      {
        id: 'light',
        name: 'Light',
        selectedTokenSets: {
          global: TokenSetStatus.ENABLED,
          colors: TokenSetStatus.ENABLED,
          spacing: TokenSetStatus.SOURCE,
        },
        $figmaStyleReferences: {},
      },
      {
        id: 'dark',
        name: 'Dark',
        selectedTokenSets: {
          global: TokenSetStatus.ENABLED,
          colors: TokenSetStatus.DISABLED,
          typography: TokenSetStatus.ENABLED,
        },
        $figmaStyleReferences: {},
      },
    ],
    usedTokenSet: {},
    importedTokens: { newTokens: [], updatedTokens: [] },
    collapsedTokens: [],
    activeTokenSet: 'global',
    activeTheme: {},
    remoteData: {
      tokens: {},
      themes: [],
      metadata: null,
    },
  });

  it('should set active theme and update used token sets', () => {
    const state = createMockState();
    const result = setActiveTheme(state, { newActiveTheme: { group: 'light' } });

    expect(result.activeTheme).toEqual({ group: 'light' });
    expect(result.usedTokenSet.global).toBe(TokenSetStatus.ENABLED);
    expect(result.usedTokenSet.colors).toBe(TokenSetStatus.ENABLED);
    expect(result.usedTokenSet.spacing).toBe(TokenSetStatus.SOURCE);
    expect(result.usedTokenSet.typography).toBe(TokenSetStatus.DISABLED);
  });

  it('should merge token sets from multiple active themes', () => {
    const state = createMockState();
    const result = setActiveTheme(state, { newActiveTheme: { group1: 'light', group2: 'dark' } });

    expect(result.activeTheme).toEqual({ group1: 'light', group2: 'dark' });
    expect(result.usedTokenSet.global).toBe(TokenSetStatus.ENABLED);
    expect(result.usedTokenSet.colors).toBe(TokenSetStatus.ENABLED); // from light theme
    expect(result.usedTokenSet.spacing).toBe(TokenSetStatus.SOURCE);
    expect(result.usedTokenSet.typography).toBe(TokenSetStatus.ENABLED); // from dark theme
  });

  it('should disable all token sets when no themes are active', () => {
    const state = createMockState();
    const result = setActiveTheme(state, { newActiveTheme: {} });

    expect(result.activeTheme).toEqual({});
    expect(result.usedTokenSet.global).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.colors).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.spacing).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.typography).toBe(TokenSetStatus.DISABLED);
  });

  it('should disable all token sets when theme does not exist', () => {
    const state = createMockState();
    const result = setActiveTheme(state, { newActiveTheme: { group: 'nonexistent' } });

    expect(result.activeTheme).toEqual({ group: 'nonexistent' });
    expect(result.usedTokenSet.global).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.colors).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.spacing).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.typography).toBe(TokenSetStatus.DISABLED);
  });

  it('should handle themes with disabled token sets', () => {
    const state = createMockState();
    state.themes.push({
      id: 'minimal',
      name: 'Minimal',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
        colors: TokenSetStatus.DISABLED,
        spacing: TokenSetStatus.DISABLED,
      },
      $figmaStyleReferences: {},
    });

    const result = setActiveTheme(state, { newActiveTheme: { group: 'minimal' } });

    expect(result.usedTokenSet.global).toBe(TokenSetStatus.ENABLED);
    expect(result.usedTokenSet.colors).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.spacing).toBe(TokenSetStatus.DISABLED);
  });

  it('should not mutate the original state', () => {
    const state = createMockState();
    const originalUsedTokenSet = state.usedTokenSet;
    const originalActiveTheme = state.activeTheme;

    const result = setActiveTheme(state, { newActiveTheme: { group: 'light' } });

    expect(state.usedTokenSet).toBe(originalUsedTokenSet);
    expect(state.activeTheme).toBe(originalActiveTheme);
    expect(result).not.toBe(state);
    expect(result.usedTokenSet).not.toBe(state.usedTokenSet);
    expect(result.activeTheme).not.toBe(state.activeTheme);
  });

  it('should include all token sets from state.tokens in the result', () => {
    const state = createMockState();
    state.tokens.newSet = [];

    const result = setActiveTheme(state, { newActiveTheme: { group: 'light' } });

    expect(Object.keys(result.usedTokenSet)).toContain('newSet');
    expect(result.usedTokenSet.newSet).toBe(TokenSetStatus.DISABLED);
  });

  it('should prioritize enabled status over source when merging themes', () => {
    const state = createMockState();
    state.themes = [
      {
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: {
          global: TokenSetStatus.SOURCE,
        },
        $figmaStyleReferences: {},
      },
      {
        id: 'theme2',
        name: 'Theme 2',
        selectedTokenSets: {
          global: TokenSetStatus.ENABLED,
        },
        $figmaStyleReferences: {},
      },
    ];

    const result = setActiveTheme(state, { newActiveTheme: { g1: 'theme1', g2: 'theme2' } });

    // Should use ENABLED since it's set in theme2
    expect(result.usedTokenSet.global).toBe(TokenSetStatus.ENABLED);
  });
});
