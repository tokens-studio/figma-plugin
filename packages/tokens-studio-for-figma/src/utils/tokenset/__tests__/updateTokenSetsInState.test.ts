import { TokenState } from '@/app/store/models/tokenState';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { updateTokenSetsInState } from '../updateTokenSetsInState';

describe('updateTokenSetsInState', () => {
  let defaultTokenState: TokenState;

  beforeEach(() => {
    defaultTokenState = {
      tokens: {
        global: [],
        light: [],
        dark: [],
      },
      activeTokenSet: 'dark',
      usedTokenSet: {
        global: TokenSetStatus.SOURCE,
        light: TokenSetStatus.DISABLED,
        dark: TokenSetStatus.ENABLED,
      },
      themes: [
        {
          id: 'dark',
          name: 'Dark',
          selectedTokenSets: {
            global: TokenSetStatus.SOURCE,
            light: TokenSetStatus.DISABLED,
            dark: TokenSetStatus.ENABLED,
          },
        },
      ],
    } as unknown as TokenState;
  });

  it('should delete token sets and update the state appropriately', () => {
    const nextState = updateTokenSetsInState(
      defaultTokenState,
      (name, tokenList) => {
        if (name === 'dark') return null;
        return [name, tokenList];
      },
    );
    expect(nextState).toEqual({
      tokens: {
        global: [],
        light: [],
      },
      activeTokenSet: 'global',
      usedTokenSet: {
        global: TokenSetStatus.SOURCE,
        light: TokenSetStatus.DISABLED,
      },
      themes: [
        {
          id: 'dark',
          name: 'Dark',
          selectedTokenSets: {
            global: TokenSetStatus.SOURCE,
            light: TokenSetStatus.DISABLED,
          },
        },
      ],
    });
  });

  it('should rename token sets and update the state appropriately', () => {
    const nextState = updateTokenSetsInState(
      defaultTokenState,
      (name, tokenList) => {
        if (name === 'dark') return ['dark2', tokenList];
        return [name, tokenList];
      },
    );
    expect(nextState).toEqual({
      tokens: {
        global: [],
        light: [],
        dark2: [],
      },
      activeTokenSet: 'dark2',
      usedTokenSet: {
        global: TokenSetStatus.SOURCE,
        light: TokenSetStatus.DISABLED,
        dark2: TokenSetStatus.ENABLED,
      },
      themes: [
        {
          id: 'dark',
          name: 'Dark',
          selectedTokenSets: {
            global: TokenSetStatus.SOURCE,
            light: TokenSetStatus.DISABLED,
            dark2: TokenSetStatus.ENABLED,
          },
        },
      ],
    });
  });

  it('should reset the activeTokenSet when no token sets are left', () => {
    const nextState = updateTokenSetsInState(
      defaultTokenState,
      () => null,
    );
    expect(nextState).toEqual({
      tokens: {
      },
      activeTokenSet: '',
      usedTokenSet: {
      },
      themes: [
        {
          id: 'dark',
          name: 'Dark',
          selectedTokenSets: {
          },
        },
      ],
    });
  });

  it('should add a copied token set next to its origin', () => {
    const nextState = updateTokenSetsInState(
      {
        tokens: {
          global: [],
        },
        activeTokenSet: 'global',
        usedTokenSet: {
          global: TokenSetStatus.ENABLED,
        },
        themes: [
          {
            id: 'dark',
            name: 'Dark',
            selectedTokenSets: {
              global: TokenSetStatus.ENABLED,
            },
          },
        ],
      } as unknown as TokenState,
      null,
      ['global_Copy', [], 1],
    );

    expect(nextState).toEqual({
      tokens: {
        global: [],
        global_Copy: [],
      },
      activeTokenSet: 'global',
      usedTokenSet: {
        global: TokenSetStatus.ENABLED,
        global_Copy: TokenSetStatus.DISABLED,
      },
      themes: [
        {
          id: 'dark',
          name: 'Dark',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
            // global_Copy should NOT be automatically added
          },
        },
      ],
    });
  });

  it('should add new token set next to its parent, if nested', () => {
    const nextState = updateTokenSetsInState(
      {
        tokens: {
          global: [],
          dark: [],
        },
        activeTokenSet: 'global',
        usedTokenSet: {
          global: TokenSetStatus.ENABLED,
          dark: TokenSetStatus.DISABLED,
        },
        themes: [
          {
            id: 'dark',
            name: 'Dark',
            selectedTokenSets: {
              global: TokenSetStatus.ENABLED,
              dark: TokenSetStatus.DISABLED,
            },
          },
        ],
      } as unknown as TokenState,
      null,
      ['global/light', []],
    );

    expect(nextState).toEqual({
      tokens: {
        global: [],
        'global/light': [],
        dark: [],
      },
      activeTokenSet: 'global',
      usedTokenSet: {
        global: TokenSetStatus.ENABLED,
        'global/light': TokenSetStatus.DISABLED,
        dark: TokenSetStatus.DISABLED,
      },
      themes: [
        {
          id: 'dark',
          name: 'Dark',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
            dark: TokenSetStatus.DISABLED,
            // 'global/light' should NOT be automatically added
          },
        },
      ],
    });
  });

  it('should not automatically add new token sets to existing themes to prevent duplicate GitLab pushes', () => {
    // This test validates the fix for the GitLab duplicate push issue
    // When a new token set is created, it should NOT be automatically added to existing themes
    // The user should explicitly configure which themes use the new token set
    const nextState = updateTokenSetsInState(
      {
        tokens: {
          global: [],
          colors: [],
        },
        activeTokenSet: 'global',
        usedTokenSet: {
          global: TokenSetStatus.ENABLED,
          colors: TokenSetStatus.SOURCE,
        },
        themes: [
          {
            id: 'lightTheme',
            name: 'Light Theme',
            selectedTokenSets: {
              global: TokenSetStatus.ENABLED,
              colors: TokenSetStatus.SOURCE,
            },
          },
          {
            id: 'darkTheme',
            name: 'Dark Theme',
            selectedTokenSets: {
              global: TokenSetStatus.ENABLED,
            },
          },
        ],
      } as unknown as TokenState,
      null,
      ['newTokenSet', []], // Adding a new token set
    );

    // The new token set should be added to the tokens
    expect(nextState.tokens).toHaveProperty('newTokenSet');
    expect(nextState.tokens.newTokenSet).toEqual([]);

    // The new token set should be DISABLED in the global usedTokenSet for backward compatibility
    expect(nextState.usedTokenSet.newTokenSet).toBe(TokenSetStatus.DISABLED);

    // The new token set should NOT be automatically added to existing themes
    // This prevents the duplicate GitLab push issue where first push has wrong DISABLED status
    expect(nextState.themes[0].selectedTokenSets).not.toHaveProperty('newTokenSet');
    expect(nextState.themes[1].selectedTokenSets).not.toHaveProperty('newTokenSet');

    // Existing theme configurations should remain unchanged
    expect(nextState.themes[0].selectedTokenSets.global).toBe(TokenSetStatus.ENABLED);
    expect(nextState.themes[0].selectedTokenSets.colors).toBe(TokenSetStatus.SOURCE);
    expect(nextState.themes[1].selectedTokenSets.global).toBe(TokenSetStatus.ENABLED);
    expect(nextState.themes[1].selectedTokenSets.colors).toBeUndefined();
  });
});
