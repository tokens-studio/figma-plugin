import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from '../models';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

jest.mock('../updateSources', () => jest.fn());
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

type Store = RematchStore<RootModel, Record<string, never>>;

describe('usedTokenSet preservation during remote sync', () => {
  let store: Store;

  beforeEach(() => {
    store = init<RootModel>({
      models,
    });
  });

  it('should preserve existing usedTokenSet when pulling from remote with undefined usedTokenSet', () => {
    // Set up initial state with some token sets enabled
    store.dispatch.tokenState.setUsedTokenSet({
      global: TokenSetStatus.ENABLED,
      theme: TokenSetStatus.ENABLED,
      semantic: TokenSetStatus.SOURCE,
    });

    // Simulate pulling tokens from remote without usedTokenSet data (common in git sync)
    store.dispatch.tokenState.setTokenData({
      values: {
        global: [{ name: 'color.primary', value: '#0000ff', type: 'color' }],
        theme: [{ name: 'color.background', value: '#ffffff', type: 'color' }],
        semantic: [{ name: 'color.accent', value: '$color.primary', type: 'color' }],
        newSet: [{ name: 'color.new', value: '#ff0000', type: 'color' }],
      },
      themes: [],
      activeTheme: {},
      usedTokenSet: undefined, // This simulates the scenario where remote data doesn't include usedTokenSet
      hasChangedRemote: true,
    });

    const { usedTokenSet } = store.getState().tokenState;

    // The bug: currently all token sets get set to DISABLED
    // The fix: should preserve existing usedTokenSet for existing sets and set new ones to DISABLED
    expect(usedTokenSet.global).toBe(TokenSetStatus.ENABLED);
    expect(usedTokenSet.theme).toBe(TokenSetStatus.ENABLED);
    expect(usedTokenSet.semantic).toBe(TokenSetStatus.SOURCE);
    expect(usedTokenSet.newSet).toBe(TokenSetStatus.DISABLED); // new sets should default to DISABLED
  });

  it('should preserve existing usedTokenSet when pulling from remote with empty usedTokenSet object', () => {
    // Set up initial state with some token sets enabled
    store.dispatch.tokenState.setUsedTokenSet({
      global: TokenSetStatus.ENABLED,
      theme: TokenSetStatus.SOURCE,
    });

    // Simulate pulling tokens from remote with empty usedTokenSet (what happens with `usedTokenSet ?? {}`)
    store.dispatch.tokenState.setTokenData({
      values: {
        global: [{ name: 'color.primary', value: '#0000ff', type: 'color' }],
        theme: [{ name: 'color.background', value: '#ffffff', type: 'color' }],
      },
      themes: [],
      activeTheme: {},
      usedTokenSet: {}, // This is what happens with the current `usedTokenSet ?? {}` logic
      hasChangedRemote: true,
    });

    const { usedTokenSet } = store.getState().tokenState;

    // Should preserve the existing selection, not reset to DISABLED
    expect(usedTokenSet.global).toBe(TokenSetStatus.ENABLED);
    expect(usedTokenSet.theme).toBe(TokenSetStatus.SOURCE);
  });

  it('should override existing usedTokenSet when explicit values are provided from remote', () => {
    // Set up initial state
    store.dispatch.tokenState.setUsedTokenSet({
      global: TokenSetStatus.ENABLED,
      theme: TokenSetStatus.SOURCE,
    });

    // Simulate pulling tokens from remote with explicit usedTokenSet data
    store.dispatch.tokenState.setTokenData({
      values: {
        global: [{ name: 'color.primary', value: '#0000ff', type: 'color' }],
        theme: [{ name: 'color.background', value: '#ffffff', type: 'color' }],
      },
      themes: [],
      activeTheme: {},
      usedTokenSet: {
        global: TokenSetStatus.DISABLED,
        theme: TokenSetStatus.ENABLED,
      },
      hasChangedRemote: true,
    });

    const { usedTokenSet } = store.getState().tokenState;

    // Should use the explicitly provided values from remote
    expect(usedTokenSet.global).toBe(TokenSetStatus.DISABLED);
    expect(usedTokenSet.theme).toBe(TokenSetStatus.ENABLED);
  });

  it('should handle mixed scenarios where some token sets have explicit values and others need to be preserved', () => {
    // Set up initial state
    store.dispatch.tokenState.setUsedTokenSet({
      global: TokenSetStatus.ENABLED,
      theme: TokenSetStatus.SOURCE,
      semantic: TokenSetStatus.DISABLED,
    });

    // Simulate partial usedTokenSet data from remote (some sets have values, others don't)
    store.dispatch.tokenState.setTokenData({
      values: {
        global: [{ name: 'color.primary', value: '#0000ff', type: 'color' }],
        theme: [{ name: 'color.background', value: '#ffffff', type: 'color' }],
        semantic: [{ name: 'color.accent', value: '$color.primary', type: 'color' }],
        newSet: [{ name: 'color.new', value: '#ff0000', type: 'color' }],
      },
      themes: [],
      activeTheme: {},
      usedTokenSet: {
        global: TokenSetStatus.SOURCE, // explicitly set to different value
        // theme and semantic are not specified, should be preserved
        // newSet is not specified, should default to DISABLED
      },
      hasChangedRemote: true,
    });

    const { usedTokenSet } = store.getState().tokenState;

    // Should use explicit value for global, preserve existing for theme/semantic, default for newSet
    expect(usedTokenSet.global).toBe(TokenSetStatus.SOURCE);
    expect(usedTokenSet.theme).toBe(TokenSetStatus.SOURCE); // preserved
    expect(usedTokenSet.semantic).toBe(TokenSetStatus.DISABLED); // preserved
    expect(usedTokenSet.newSet).toBe(TokenSetStatus.DISABLED); // new set defaults to DISABLED
  });
});
