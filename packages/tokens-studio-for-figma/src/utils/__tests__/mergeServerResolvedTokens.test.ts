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

  describe('composite tokens', () => {
    const localTypography = {
      name: 'typography.title',
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontFamily: 'Inter',
        fontSize: '1rem',
        fontWeight: 500,
        textCase: 'uppercase',
        textDecoration: 'none',
      },
      resolvedValueWithReferences: {
        fontFamily: 'Inter',
        fontSize: '{type-scale.large}',
        fontWeight: '{font.weight.medium}',
        textCase: 'uppercase',
        textDecoration: 'none',
      },
    } as unknown as ResolveTokenValuesResult;

    it('parses a JSON composite value from the server', () => {
      const [result] = mergeServerResolvedTokens([localTypography], {
        'typography.title': JSON.stringify({ fontFamily: 'Geist', fontSize: '1.563rem' }),
      });
      expect(result.value).toEqual({ fontFamily: 'Geist', fontSize: '1.563rem' });
    });

    it('keeps literal properties when the server returns an unquoted composite value', () => {
      const [result] = mergeServerResolvedTokens([localTypography], {
        'typography.title': '{fontFamily: Inter, fontSize: 1.563rem, fontWeight: 500, textCase: uppercase, textDecoration: none}',
        'type-scale.large': '1.563rem',
        'font.weight.medium': '500',
      });
      expect(result.value).toEqual({
        fontFamily: 'Inter',
        fontSize: '1.563rem',
        fontWeight: '500',
        textCase: 'uppercase',
        textDecoration: 'none',
      });
      expect(result.failedToResolve).toBe(false);
    });

    it('keeps commas inside unquoted values', () => {
      const [result] = mergeServerResolvedTokens([localTypography], {
        'typography.title': '{fontFamily: Inter, sans-serif, fontSize: 1.563rem}',
      });
      expect(result.value).toEqual(expect.objectContaining({ fontFamily: 'Inter, sans-serif', fontSize: '1.563rem', textCase: 'uppercase' }));
    });

    it('falls back to the local value when the server value cannot be parsed', () => {
      const [result] = mergeServerResolvedTokens([localTypography], {
        'typography.title': '{not parseable',
      });
      expect(result.value).toEqual(localTypography.value);
    });

    it('never replaces a composite value with a string', () => {
      const localShadow = {
        name: 'shadow.card',
        type: TokenTypes.BOX_SHADOW,
        value: [{
          x: '0', y: '1', blur: '2', spread: '0', color: '#000', type: 'dropShadow',
        }],
      } as unknown as ResolveTokenValuesResult;
      const [result] = mergeServerResolvedTokens([localShadow], {
        'shadow.card': '[{x: 0, y: 1, blur: 2}]',
      });
      expect(result.value).toEqual(localShadow.value);
    });
  });
});
