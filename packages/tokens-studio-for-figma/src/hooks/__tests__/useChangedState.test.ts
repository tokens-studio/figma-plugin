import { renderHook } from '@testing-library/react';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { findDifferentState } from '@/utils/findDifferentState';

import { useChangedState } from '../useChangedState';

const mockUpdateCheckForChanges = jest.fn();
const mockDispatch = {
  tokenState: {
    updateCheckForChanges: mockUpdateCheckForChanges,
  },
};

let mockTokens: Record<string, unknown[]> = {};
const mockThemes = [];
let mockStorageType = { provider: StorageProviderType.LOCAL };
let mockLastSyncedState: string | null = null;
let mockTokenFormat = 'dtcg';
let mockTokenSetMetadata: Record<string, unknown> = {};

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => selector({
    tokenState: {
      tokens: mockTokens,
      themes: mockThemes,
      lastSyncedState: mockLastSyncedState,
      tokenFormat: mockTokenFormat,
      tokenSetMetadata: mockTokenSetMetadata,
    },
    uiState: {
      storageType: mockStorageType,
    },
  }),
}));

jest.mock('@/selectors', () => ({
  lastSyncedStateSelector: (state: any) => state.tokenState.lastSyncedState,
  remoteDataSelector: (_state: any) => ({ tokens: {}, themes: [], metadata: {} }),
  storageTypeSelector: (state: any) => state.uiState.storageType,
  themesListSelector: (state: any) => state.tokenState.themes,
  tokensSelector: (state: any) => state.tokenState.tokens,
}));

jest.mock('@/selectors/tokenSetMetadataSelector', () => ({
  tokenSetMetadataSelector: (state: any) => state.tokenState.tokenSetMetadata,
}));

jest.mock('@/selectors/tokenFormatSelector', () => ({
  tokenFormatSelector: (state: any) => state.tokenState.tokenFormat,
}));

jest.mock('@/utils/compareLastSyncedState', () => {
  const { TokenFormatOptions } = jest.requireActual('@/plugin/TokenFormatStoreClass');
  const { tryParseJson } = jest.requireActual('@/utils/tryParseJson');
  return {
    compareLastSyncedState: jest.fn(() => false), // always "has changes" by default
    // Reuse the real getLastSyncedFormat so tokenFormatChanged tests exercise real logic
    // (module co-locates the helper with the tuple type).
    getLastSyncedFormat: (state: string) => {
      if (!state) return undefined;
      const parsed = tryParseJson(state);
      if (!Array.isArray(parsed) || parsed.length < 3) return undefined;
      const format = parsed[2];
      return Object.values(TokenFormatOptions).includes(format) ? format : undefined;
    },
  };
});

jest.mock('@/utils/findDifferentState', () => ({
  findDifferentState: jest.fn(() => []),
}));

describe('useChangedState', () => {
  const findDifferentStateMock = findDifferentState as jest.Mock;

  beforeEach(() => {
    mockUpdateCheckForChanges.mockClear();
    findDifferentStateMock.mockClear();
    mockStorageType = { provider: StorageProviderType.LOCAL };
    mockTokens = {};
    mockTokenSetMetadata = {};
    mockLastSyncedState = null;
    mockTokenFormat = 'dtcg';
  });

  describe('tokenFormatChanged', () => {
    it('is false when lastSyncedState is missing (fresh install, avoids spurious full rewrite)', () => {
      mockLastSyncedState = null;
      const { result } = renderHook(() => useChangedState());
      expect(result.current.tokenFormatChanged).toBe(false);
    });

    it('is false when lastSyncedState omits format (older sync, treat as aligned)', () => {
      mockLastSyncedState = JSON.stringify([{}, []]);
      const { result } = renderHook(() => useChangedState());
      expect(result.current.tokenFormatChanged).toBe(false);
    });

    it('is false when the recorded format matches the current format', () => {
      mockLastSyncedState = JSON.stringify([{}, [], 'dtcg']);
      mockTokenFormat = 'dtcg';
      const { result } = renderHook(() => useChangedState());
      expect(result.current.tokenFormatChanged).toBe(false);
    });

    it('is true when the recorded format differs from the current format (legacy→DTCG conversion)', () => {
      mockLastSyncedState = JSON.stringify([{}, [], 'legacy']);
      mockTokenFormat = 'dtcg';
      const { result } = renderHook(() => useChangedState());
      expect(result.current.tokenFormatChanged).toBe(true);
    });

    it('is false when lastSyncedState is a non-array JSON blob (corrupt storage)', () => {
      // Without the Array.isArray guard, string-indexing `'legacy'[2]` → 'g' would trip
      // spurious full-repo rewrites forever.
      mockLastSyncedState = JSON.stringify('legacy');
      mockTokenFormat = 'dtcg';
      const { result } = renderHook(() => useChangedState());
      expect(result.current.tokenFormatChanged).toBe(false);
    });
  });

  it('dispatches hasChanges=true for LOCAL provider when state differs from lastSyncedState', () => {
    mockStorageType = { provider: StorageProviderType.LOCAL };
    renderHook(() => useChangedState());
    expect(mockUpdateCheckForChanges).toHaveBeenCalledWith(true);
  });

  it('always dispatches checkForChanges=false for TOKENS_STUDIO_OAUTH regardless of token diff', () => {
    mockStorageType = { provider: StorageProviderType.TOKENS_STUDIO_OAUTH };
    renderHook(() => useChangedState());
    expect(mockUpdateCheckForChanges).toHaveBeenCalledWith(false);
    expect(mockUpdateCheckForChanges).not.toHaveBeenCalledWith(true);
  });

  describe('buildMetadata shape passed to findDifferentState', () => {
    // The push-path metadata must match what the provider actually writes to disk.
    // Git providers persist only { tokenSetOrder }; including tokenSetsData produced a
    // permanent metadata diff that caused empty commits (see #<PR>).
    const gitProviders = [
      StorageProviderType.GITHUB,
      StorageProviderType.GITLAB,
      StorageProviderType.ADO,
      StorageProviderType.BITBUCKET,
    ];

    beforeEach(() => {
      mockTokens = { core: [], semantic: [] };
      mockTokenSetMetadata = { core: { isDynamic: false }, semantic: { isDynamic: true } };
    });

    gitProviders.forEach((provider) => {
      it(`passes { tokenSetOrder } only for ${provider} (no tokenSetsData)`, () => {
        mockStorageType = { provider };
        renderHook(() => useChangedState());

        // Both push (compareState arg) and pull (baseState arg) calls should have the trimmed shape.
        expect(findDifferentStateMock).toHaveBeenCalled();
        const pushCall = findDifferentStateMock.mock.calls[0];
        const pullCall = findDifferentStateMock.mock.calls[1];

        expect(pushCall[1].metadata).toEqual({ tokenSetOrder: ['core', 'semantic'] });
        expect(pushCall[1].metadata).not.toHaveProperty('tokenSetsData');

        expect(pullCall[0].metadata).toEqual({ tokenSetOrder: ['core', 'semantic'] });
        expect(pullCall[0].metadata).not.toHaveProperty('tokenSetsData');
      });
    });

    it('passes { tokenSetOrder, tokenSetsData } for TOKENS_STUDIO_OAUTH', () => {
      mockStorageType = { provider: StorageProviderType.TOKENS_STUDIO_OAUTH };
      renderHook(() => useChangedState());

      const pushCall = findDifferentStateMock.mock.calls[0];
      const pullCall = findDifferentStateMock.mock.calls[1];

      expect(pushCall[1].metadata).toEqual({
        tokenSetOrder: ['core', 'semantic'],
        tokenSetsData: mockTokenSetMetadata,
      });
      expect(pullCall[0].metadata).toEqual({
        tokenSetOrder: ['core', 'semantic'],
        tokenSetsData: mockTokenSetMetadata,
      });
    });

    it('passes empty metadata for LOCAL provider', () => {
      mockStorageType = { provider: StorageProviderType.LOCAL };
      renderHook(() => useChangedState());

      const pushCall = findDifferentStateMock.mock.calls[0];
      expect(pushCall[1].metadata).toEqual({});
    });
  });
});
