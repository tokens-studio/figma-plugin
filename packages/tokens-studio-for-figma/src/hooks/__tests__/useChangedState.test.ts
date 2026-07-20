import { renderHook } from '@testing-library/react';
import { StorageProviderType } from '@/constants/StorageProviderType';

import { useChangedState } from '../useChangedState';

const mockUpdateCheckForChanges = jest.fn();
const mockDispatch = {
  tokenState: {
    updateCheckForChanges: mockUpdateCheckForChanges,
  },
};

const mockTokens = {};
const mockThemes = [];
let mockStorageType = { provider: StorageProviderType.LOCAL };
const mockLastSyncedState = null;
const mockTokenFormat = 'dtcg';

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => selector({
    tokenState: {
      tokens: mockTokens,
      themes: mockThemes,
      lastSyncedState: mockLastSyncedState,
      tokenFormat: mockTokenFormat,
      tokenSetMetadata: {},
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

jest.mock('@/utils/compareLastSyncedState', () => ({
  compareLastSyncedState: jest.fn(() => false), // always "has changes" by default
}));

jest.mock('@/utils/findDifferentState', () => ({
  findDifferentState: jest.fn(() => []),
}));

describe('useChangedState', () => {
  beforeEach(() => {
    mockUpdateCheckForChanges.mockClear();
    mockStorageType = { provider: StorageProviderType.LOCAL };
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
});
