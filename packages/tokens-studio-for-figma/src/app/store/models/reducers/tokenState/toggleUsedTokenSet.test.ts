import { toggleUsedTokenSet } from './toggleUsedTokenSet';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { TokenState } from '../../tokenState';

describe('toggleUsedTokenSet', () => {
  const createMockState = (usedTokenSet: Record<string, TokenSetStatus>): TokenState => ({
    tokens: {},
    themes: [],
    usedTokenSet,
    importedTokens: { newTokens: [], updatedTokens: [] },
    collapsedTokens: [],
    activeTokenSet: 'global',
    activeTheme: { group: 'light' },
    remoteData: {
      tokens: {},
      themes: [],
      metadata: null,
    },
  });

  it('should toggle token set from DISABLED to ENABLED', () => {
    const state = createMockState({
      global: TokenSetStatus.DISABLED,
      colors: TokenSetStatus.ENABLED,
    });

    const result = toggleUsedTokenSet(state, 'global');

    expect(result.usedTokenSet.global).toBe(TokenSetStatus.ENABLED);
    expect(result.usedTokenSet.colors).toBe(TokenSetStatus.ENABLED);
  });

  it('should toggle token set from ENABLED to DISABLED', () => {
    const state = createMockState({
      global: TokenSetStatus.ENABLED,
      colors: TokenSetStatus.DISABLED,
    });

    const result = toggleUsedTokenSet(state, 'global');

    expect(result.usedTokenSet.global).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.colors).toBe(TokenSetStatus.DISABLED);
  });

  it('should toggle token set from SOURCE to DISABLED', () => {
    const state = createMockState({
      global: TokenSetStatus.SOURCE,
      colors: TokenSetStatus.ENABLED,
    });

    const result = toggleUsedTokenSet(state, 'global');

    expect(result.usedTokenSet.global).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.colors).toBe(TokenSetStatus.ENABLED);
  });

  it('should clear active theme when toggling', () => {
    const state = createMockState({
      global: TokenSetStatus.ENABLED,
    });
    state.activeTheme = { group: 'light' };

    const result = toggleUsedTokenSet(state, 'global');

    expect(result.activeTheme).toEqual({});
  });

  it('should preserve other token set states', () => {
    const state = createMockState({
      global: TokenSetStatus.ENABLED,
      colors: TokenSetStatus.ENABLED,
      spacing: TokenSetStatus.DISABLED,
      typography: TokenSetStatus.SOURCE,
    });

    const result = toggleUsedTokenSet(state, 'colors');

    expect(result.usedTokenSet.global).toBe(TokenSetStatus.ENABLED);
    expect(result.usedTokenSet.colors).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.spacing).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.typography).toBe(TokenSetStatus.SOURCE);
  });

  it('should handle toggling a token set that does not exist yet', () => {
    const state = createMockState({
      global: TokenSetStatus.ENABLED,
    });

    const result = toggleUsedTokenSet(state, 'newSet');

    // When a token set doesn't exist (undefined), it's not DISABLED, so it becomes DISABLED
    expect(result.usedTokenSet.newSet).toBe(TokenSetStatus.DISABLED);
    expect(result.usedTokenSet.global).toBe(TokenSetStatus.ENABLED);
  });

  it('should not mutate the original state', () => {
    const state = createMockState({
      global: TokenSetStatus.ENABLED,
    });
    const originalActiveTheme = state.activeTheme;
    const originalUsedTokenSet = state.usedTokenSet;

    const result = toggleUsedTokenSet(state, 'global');

    expect(state.activeTheme).toBe(originalActiveTheme);
    expect(state.usedTokenSet).toBe(originalUsedTokenSet);
    expect(result).not.toBe(state);
    expect(result.usedTokenSet).not.toBe(state.usedTokenSet);
  });
});
