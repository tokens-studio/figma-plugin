import { tokensSelector } from '../tokensSelector';

describe('tokensSelector', () => {
  it('should return tokens from token state', () => {
    const mockTokens = {
      global: [
        {
          name: 'colors.primary',
          value: '#ff0000',
          type: 'color',
        },
      ],
      dark: [
        {
          name: 'colors.background',
          value: '#000000',
          type: 'color',
        },
      ],
    };

    const mockState = {
      tokenState: {
        tokens: mockTokens,
        activeTokenSet: 'global',
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

    const result = tokensSelector(mockState as any);
    expect(result).toBe(mockTokens);
  });

  it('should return empty tokens object', () => {
    const mockState = {
      tokenState: {
        tokens: {},
        activeTokenSet: 'global',
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

    const result = tokensSelector(mockState as any);
    expect(result).toEqual({});
  });

  it('should use memoization with isEqual', () => {
    const mockTokens = {
      global: [
        {
          name: 'colors.primary',
          value: '#ff0000',
          type: 'color',
        },
      ],
    };

    const mockState = {
      tokenState: {
        tokens: mockTokens,
        activeTokenSet: 'global',
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

    // Call selector multiple times
    const result1 = tokensSelector(mockState as any);
    const result2 = tokensSelector(mockState as any);

    // Should return same reference due to memoization
    expect(result1).toBe(result2);
  });

  it('should return new reference when tokens change', () => {
    const mockTokens1 = {
      global: [
        {
          name: 'colors.primary',
          value: '#ff0000',
          type: 'color',
        },
      ],
    };

    const mockTokens2 = {
      global: [
        {
          name: 'colors.primary',
          value: '#00ff00',
          type: 'color',
        },
      ],
    };

    const mockState1 = {
      tokenState: {
        tokens: mockTokens1,
        activeTokenSet: 'global',
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

    const mockState2 = {
      tokenState: {
        tokens: mockTokens2,
        activeTokenSet: 'global',
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

    const result1 = tokensSelector(mockState1 as any);
    const result2 = tokensSelector(mockState2 as any);

    // Should return different results
    expect(result1).not.toBe(result2);
    expect(result1).not.toEqual(result2);
  });
});
