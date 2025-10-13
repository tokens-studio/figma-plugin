import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import { ThemeObject } from '@/types/ThemeObject';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import formatTokens from '../formatTokens';
import { mergeTokenGroups, getOverallConfig } from '../tokenHelpers';
import { defaultTokenResolver } from '../TokenResolver';
import { TokenFormatOptions, setFormat } from '@/plugin/TokenFormatStoreClass';

describe('formatTokens per theme', () => {
  beforeEach(() => {
    setFormat(TokenFormatOptions.DTCG);
  });

  it('should resolve font size tokens differently for each theme based on typography baseline', () => {
    // Define token sets with different typography baselines
    const tokens: Record<string, AnyTokenList> = {
      'typography-base': [
        {
          name: 'typography.base.fontSize',
          type: TokenTypes.FONT_SIZES,
          value: '14px', // baseline for theme A
        },
      ],
      'typography-base-b': [
        {
          name: 'typography.base.fontSize',
          type: TokenTypes.FONT_SIZES,
          value: '15px', // baseline for theme B
        },
      ],
      'typography-base-c': [
        {
          name: 'typography.base.fontSize',
          type: TokenTypes.FONT_SIZES,
          value: '16px', // baseline for theme C
        },
      ],
      'typography-tokens': [
        {
          name: 'typography.heading',
          type: TokenTypes.TYPOGRAPHY,
          value: {
            fontSize: '{typography.base.fontSize}',
            fontWeight: 'bold',
          },
        },
      ],
    };

    // Define themes that use different typography baselines
    const themes: ThemeObject[] = [
      {
        id: 'theme-a',
        name: 'Theme A',
        selectedTokenSets: {
          'typography-base': TokenSetStatus.ENABLED,
          'typography-tokens': TokenSetStatus.ENABLED,
        },
      },
      {
        id: 'theme-b',
        name: 'Theme B',
        selectedTokenSets: {
          'typography-base-b': TokenSetStatus.ENABLED,
          'typography-tokens': TokenSetStatus.ENABLED,
        },
      },
      {
        id: 'theme-c',
        name: 'Theme C',
        selectedTokenSets: {
          'typography-base-c': TokenSetStatus.ENABLED,
          'typography-tokens': TokenSetStatus.ENABLED,
        },
      },
    ];

    // Resolve tokens for each theme
    const resolveTokensForTheme = (theme: ThemeObject) => {
      const overallConfig = getOverallConfig([theme], [theme.id]);
      const mergedTokens = mergeTokenGroups(tokens, {}, overallConfig);
      return defaultTokenResolver.setTokens(mergedTokens);
    };

    const themeAResolvedTokens = resolveTokensForTheme(themes[0]);
    const themeBResolvedTokens = resolveTokensForTheme(themes[1]);
    const themeCResolvedTokens = resolveTokensForTheme(themes[2]);

    // Format tokens for each theme
    const themeAFormatted = JSON.parse(formatTokens({
      tokens,
      tokenSets: ['typography-base', 'typography-tokens'],
      resolvedTokens: themeAResolvedTokens,
      expandTypography: true,
    }));

    const themeBFormatted = JSON.parse(formatTokens({
      tokens,
      tokenSets: ['typography-base-b', 'typography-tokens'],
      resolvedTokens: themeBResolvedTokens,
      expandTypography: true,
    }));

    const themeCFormatted = JSON.parse(formatTokens({
      tokens,
      tokenSets: ['typography-base-c', 'typography-tokens'],
      resolvedTokens: themeCResolvedTokens,
      expandTypography: true,
    }));

    // Verify that each theme has different fontSize values
    expect(themeAFormatted['typography-base']['typography']['base']['fontSize']['$value']).toBe('14px');
    expect(themeBFormatted['typography-base-b']['typography']['base']['fontSize']['$value']).toBe('15px');
    expect(themeCFormatted['typography-base-c']['typography']['base']['fontSize']['$value']).toBe('16px');

    // Verify that typography heading fontSize resolves differently for each theme
    expect(themeAFormatted['typography-tokens']['typography']['heading']['fontSize']['$value']).toBe('14px');
    expect(themeBFormatted['typography-tokens']['typography']['heading']['fontSize']['$value']).toBe('15px');
    expect(themeCFormatted['typography-tokens']['typography']['heading']['fontSize']['$value']).toBe('16px');
  });
});