import { compareLastSyncedState, getLastSyncedFormat } from '../compareLastSyncedState';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { TokenTypes } from '@/constants/TokenTypes';
import type { AnyTokenList } from '@/types/tokens';

const buildLastSynced = (
  tokens: Record<string, AnyTokenList>,
  themes: unknown[] = [],
  format?: TokenFormatOptions,
) => JSON.stringify(
  format === undefined ? [tokens, themes] : [tokens, themes, format],
  null,
  2,
);

describe('compareLastSyncedState', () => {
  // Regression: PR #3941 ("prevent stuck blue dot"). Push snapshots stored tokens with a
  // generated $extensions.studio.tokens.id UUID that lastSyncedState omits — comparing raw
  // objects made compareLastSyncedState always return false, so hasChanges stuck true and
  // the blue "unpushed changes" dot never cleared after a push. Fix: strip ids on both sides
  // via removeIdPropertyFromTokens. This test locks that invariant in.
  it('reports aligned when the only diff is generated $extensions.studio.tokens.id metadata', () => {
    const withoutIds: Record<string, AnyTokenList> = {
      global: [
        { name: 'primary', value: '#000', type: TokenTypes.COLOR },
      ],
    };
    const withGeneratedIds: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'primary',
          value: '#000',
          type: TokenTypes.COLOR,
          // The plugin adds this UUID field on the in-memory token at push time. lastSyncedState
          // (recorded from the pushed payload) does not include it.
          $extensions: { 'studio.tokens': { id: 'generated-uuid-1' } },
        } as any,
      ],
    };

    const lastSynced = buildLastSynced(withoutIds, [], TokenFormatOptions.DTCG);

    expect(compareLastSyncedState(withGeneratedIds, [], lastSynced, TokenFormatOptions.DTCG)).toBe(true);
  });

  it('reports diff when a real token value changed', () => {
    const before: Record<string, AnyTokenList> = {
      global: [{ name: 'primary', value: '#000', type: TokenTypes.COLOR }],
    };
    const after: Record<string, AnyTokenList> = {
      global: [{ name: 'primary', value: '#111', type: TokenTypes.COLOR }],
    };
    const lastSynced = buildLastSynced(before, [], TokenFormatOptions.DTCG);

    expect(compareLastSyncedState(after, [], lastSynced, TokenFormatOptions.DTCG)).toBe(false);
  });

  it('reports diff when the token format flipped', () => {
    const tokens: Record<string, AnyTokenList> = {
      global: [{ name: 'primary', value: '#000', type: TokenTypes.COLOR }],
    };
    const lastSynced = buildLastSynced(tokens, [], TokenFormatOptions.Legacy);

    expect(compareLastSyncedState(tokens, [], lastSynced, TokenFormatOptions.DTCG)).toBe(false);
  });

  it('reports diff when lastSyncedState is empty (fresh install)', () => {
    // Empty string means never synced; anything local counts as unpushed.
    expect(compareLastSyncedState({}, [], '', TokenFormatOptions.DTCG)).toBe(false);
  });
});

describe('getLastSyncedFormat', () => {
  it('returns the format recorded at index 2', () => {
    const state = buildLastSynced({}, [], TokenFormatOptions.DTCG);
    expect(getLastSyncedFormat(state)).toBe(TokenFormatOptions.DTCG);
  });

  it('returns undefined for the pre-format 2-tuple (older sync)', () => {
    const state = buildLastSynced({}, []);
    expect(getLastSyncedFormat(state)).toBeUndefined();
  });

  it('returns undefined for empty / missing state', () => {
    expect(getLastSyncedFormat('')).toBeUndefined();
    expect(getLastSyncedFormat(null as unknown as string)).toBeUndefined();
  });

  it('returns undefined for a non-array JSON blob (corrupt storage)', () => {
    // Without validation, string-indexing `'legacy'[2]` yields 'g', which would trip
    // spurious full-repo rewrites forever.
    expect(getLastSyncedFormat(JSON.stringify('legacy'))).toBeUndefined();
  });

  it('returns undefined for a truthy non-enum value at index 2', () => {
    // Without enum validation, a value like {} at index 2 would compare unequal to any
    // TokenFormatOptions and force a permanent full rewrite.
    expect(getLastSyncedFormat(JSON.stringify([{}, [], {}]))).toBeUndefined();
    expect(getLastSyncedFormat(JSON.stringify([{}, [], 42]))).toBeUndefined();
    expect(getLastSyncedFormat(JSON.stringify([{}, [], 'not-a-format']))).toBeUndefined();
  });
});
