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

  it('can delete token sets and update the state appropriately', () => {
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

  it('can rename token sets and update the state appropriately', () => {
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

  it('re-sets the activeTokenSet when no token sets are left', () => {
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

  it('can add new tokenSets', () => {
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
      ['dark'],
    );

    expect(nextState).toEqual({
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
    });
  });
});
