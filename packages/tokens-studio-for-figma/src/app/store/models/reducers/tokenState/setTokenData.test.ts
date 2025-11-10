import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { setTokenData } from './setTokenData';
import { TokenState } from '../../tokenState';

describe('setTokenData', () => {
  const mockState: TokenState = {
    tokens: {},
    stringTokens: '',
    themes: [],
    lastSyncedState: '',
    importedTokens: {
      newTokens: [],
      updatedTokens: [],
    },
    activeTheme: {},
    activeTokenSet: '',
    usedTokenSet: {},
    editProhibited: false,
    hasUnsavedChanges: false,
    collapsedTokenSets: [],
    collapsedTokenTypeObj: {},
    checkForChanges: false,
    collapsedTokens: [],
    changedState: {},
    remoteData: {
      tokens: {},
      themes: [],
      metadata: null,
    },
    tokenFormat: 'legacy' as any,
    tokenSetMetadata: {},
    importedThemes: {
      newThemes: [],
      updatedThemes: [],
    },
    compressedTokens: '',
    compressedThemes: '',
    tokensSize: 0,
    themesSize: 0,
    renamedCollections: null,
  };

  it('should default new token sets to ENABLED when no usedTokenSet preferences exist', () => {
    const payload = {
      values: {
        global: [],
        theme: [],
        components: [],
      },
      usedTokenSet: undefined, // No previous state
    };

    const result = setTokenData(mockState, payload);

    // Should now default to ENABLED for better user experience
    expect(result.usedTokenSet).toEqual({
      global: TokenSetStatus.ENABLED,
      theme: TokenSetStatus.ENABLED,
      components: TokenSetStatus.ENABLED,
    });
  });

  it('should default new token sets to ENABLED when usedTokenSet is empty object', () => {
    const payload = {
      values: {
        global: [],
        theme: [],
        components: [],
      },
      usedTokenSet: {}, // Empty object (no existing preferences)
    };

    const result = setTokenData(mockState, payload);

    // Should default to ENABLED when no existing preferences
    expect(result.usedTokenSet).toEqual({
      global: TokenSetStatus.ENABLED,
      theme: TokenSetStatus.ENABLED,
      components: TokenSetStatus.ENABLED,
    });
  });

  it('should preserve existing usedTokenSet preferences and default new sets to DISABLED', () => {
    const payload = {
      values: {
        global: [],
        theme: [],
        components: [],
      },
      usedTokenSet: {
        global: TokenSetStatus.ENABLED,
        theme: TokenSetStatus.SOURCE,
        // components is missing - should default to DISABLED since we have existing preferences
      },
    };

    const result = setTokenData(mockState, payload);

    expect(result.usedTokenSet).toEqual({
      global: TokenSetStatus.ENABLED,
      theme: TokenSetStatus.SOURCE,
      components: TokenSetStatus.DISABLED, // Defaults to DISABLED when existing preferences exist
    });
  });

  it('should handle empty values array and return early', () => {
    const payload = {
      values: [] as any, // Empty array triggers early return
      usedTokenSet: undefined,
    };

    const result = setTokenData(mockState, payload);

    // Should return the same state when values is empty
    expect(result).toBe(mockState);
  });
});
