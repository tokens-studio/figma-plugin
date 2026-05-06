import { mergeServerResolvedTokens, ResolveTokenValuesResult } from '../tokenHelpers';
import { TokenTypes } from '@/constants/TokenTypes';

describe('mergeServerResolvedTokens', () => {
  const localTokens: ResolveTokenValuesResult[] = [
    {
      name: 'color.primary',
      value: 'lighten(#000000, 0.2)',
      type: TokenTypes.COLOR,
    },
    {
      name: 'spacing.medium',
      value: '16px',
      type: TokenTypes.SPACING,
    },
  ] as ResolveTokenValuesResult[];

  it('should return local tokens if no server resolved tokens are provided', () => {
    expect(mergeServerResolvedTokens(localTokens, null)).toEqual(localTokens);
    expect(mergeServerResolvedTokens(localTokens, {})).toEqual(localTokens);
  });

  it('should merge server resolved tokens into local tokens', () => {
    const serverDelta = {
      'color.primary': '#333333',
    };
    const expected = [
      {
        name: 'color.primary',
        value: '#333333',
        type: TokenTypes.COLOR,
        failedToResolve: false,
      },
      {
        name: 'spacing.medium',
        value: '16px',
        type: TokenTypes.SPACING,
      },
    ];
    expect(mergeServerResolvedTokens(localTokens, serverDelta)).toEqual(expected);
  });

  it('should handle tokens not present in the server delta', () => {
    const serverDelta = {
      'other.token': 'foo',
    };
    expect(mergeServerResolvedTokens(localTokens, serverDelta)).toEqual(localTokens);
  });
});
