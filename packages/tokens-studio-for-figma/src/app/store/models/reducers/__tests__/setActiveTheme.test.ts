import { TokenState } from '../../tokenState';
import { setActiveTheme } from '../tokenState';

describe('setActiveTheme', () => {
  it('should update the usedTokenSet and activeTheme properties of the TokenState', () => {
    const state = {
      themes: [
        {
          id: 'theme1',
          selectedTokenSets: {
            tokenSet1: 'enabled',
            tokenSet2: 'disabled',
          },
        },
        {
          id: 'theme2',
          selectedTokenSets: {
            tokenSet2: 'enabled',
            tokenSet3: 'enabled',
          },
        },
      ],
      tokens: {
        tokenSet1: {},
        tokenSet2: {},
        tokenSet3: {},
      },
      usedTokenSet: {
        tokenSet1: 'disabled',
        tokenSet2: 'disabled',
        tokenSet3: 'disabled',
      },
      activeTheme: {
        groupA: 'theme1',
        groupB: 'theme2',
      },
    } as unknown as TokenState;
    const newActiveTheme = {
      groupA: 'theme1',
      groupB: 'theme2',
    };
    const shouldUpdateNodes = true;

    const result = setActiveTheme(state, { newActiveTheme, shouldUpdateNodes });

    expect(result.usedTokenSet).toEqual({
      tokenSet1: 'enabled',
      tokenSet2: 'enabled',
      tokenSet3: 'enabled',
    });
    expect(result.activeTheme).toEqual(newActiveTheme);
  });
});
