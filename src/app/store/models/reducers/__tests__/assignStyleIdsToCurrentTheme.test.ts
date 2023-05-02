import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { TokenState } from '../../tokenState';
import { assignStyleIdsToCurrentTheme } from '../tokenState';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

describe('assignStyleIdsToCurrentTheme', () => {
  it('should update the $figmaStyleReferences property of the active theme with the provided style IDs', () => {
    const state = {
      activeTheme: { id: 'theme1' },
      themes: [
        { id: 'theme1', selectedTokenSets: { set1: TokenSetStatus.ENABLED }, $figmaStyleReferences: { token1: 'style1' } },
        { id: 'theme2', selectedTokenSets: {}, $figmaStyleReferences: { token1: 'style1' } },
      ],
    } as unknown as TokenState;
    const styleIds = { token1: 'style2' };
    const tokens = [{ name: 'token1', internal__Parent: 'set1' }] as unknown as ResolveTokenValuesResult[];
    const expectedState = {
      activeTheme: { id: 'theme1' },
      themes: [
        { id: 'theme1', selectedTokenSets: { set1: TokenSetStatus.ENABLED }, $figmaStyleReferences: { token1: 'style2' } },
        { id: 'theme2', selectedTokenSets: {}, $figmaStyleReferences: { token1: 'style1' } },
      ],
    };
    expect(assignStyleIdsToCurrentTheme(state, styleIds, tokens)).toEqual(expectedState);
  });

  it('should not update the state if there is no active theme', () => {
    const state = {
      activeTheme: {},
      themes: [
        { id: 'theme1', selectedTokenSets: {}, $figmaStyleReferences: { token1: 'style1' } },
        { id: 'theme2', selectedTokenSets: {}, $figmaStyleReferences: { token1: 'style1' } },
      ],
    } as unknown as TokenState;
    const styleIds = { token1: 'style2' };
    const tokens = [{ name: 'token1', internal__Parent: 'set1' }] as unknown as ResolveTokenValuesResult[];
    expect(assignStyleIdsToCurrentTheme(state, styleIds, tokens)).toEqual(state);
  });

  it('should not update the state if the token is not used in any active theme', () => {
    const state = {
      activeTheme: { id: 'theme1' },
      themes: [
        { id: 'theme1', selectedTokenSets: {}, $figmaStyleReferences: { token2: 'style1' } },
        { id: 'theme2', selectedTokenSets: {}, $figmaStyleReferences: { token2: 'style1' } },
      ],
    } as unknown as TokenState;
    const styleIds = { token1: 'style2' };
    const tokens = [{ name: 'token1', internal__Parent: 'set1' }] as unknown as ResolveTokenValuesResult[];
    expect(assignStyleIdsToCurrentTheme(state, styleIds, tokens)).toEqual(state);
  });
});
