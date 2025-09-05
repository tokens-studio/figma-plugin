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
        global_Copy: TokenSetStatus.ENABLED,
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
        'global/light': TokenSetStatus.ENABLED,
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
    });
  });
});
