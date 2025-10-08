import { activeTokenSetSelector } from '../activeTokenSetSelector';

describe('activeTokenSetSelector', () => {
  it('should return the active token set from token state', () => {
    const mockState = {
      tokenState: {
        activeTokenSet: 'global',
        tokens: {},
        themes: [],
        usedTokenSet: {},
        importedTokens: { newTokens: [], updatedTokens: [] },
        collapsedTokens: [],
        activeTheme: {},
        remoteData: {
          tokens: {},
          themes: [],
          metadata: null,
        },
      },
    };

    const result = activeTokenSetSelector(mockState as any);
    expect(result).toBe('global');
  });

  it('should return different active token set', () => {
    const mockState = {
      tokenState: {
        activeTokenSet: 'colors',
        tokens: {},
        themes: [],
        usedTokenSet: {},
        importedTokens: { newTokens: [], updatedTokens: [] },
        collapsedTokens: [],
        activeTheme: {},
        remoteData: {
          tokens: {},
          themes: [],
          metadata: null,
        },
      },
    };

    const result = activeTokenSetSelector(mockState as any);
    expect(result).toBe('colors');
  });

  it('should handle empty active token set', () => {
    const mockState = {
      tokenState: {
        activeTokenSet: '',
        tokens: {},
        themes: [],
        usedTokenSet: {},
        importedTokens: { newTokens: [], updatedTokens: [] },
        collapsedTokens: [],
        activeTheme: {},
        remoteData: {
          tokens: {},
          themes: [],
          metadata: null,
        },
      },
    };

    const result = activeTokenSetSelector(mockState as any);
    expect(result).toBe('');
  });
});
