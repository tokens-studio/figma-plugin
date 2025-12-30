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
    // Define token sets with different typography baselines (matching user's structure)
    const tokens: Record<string, AnyTokenList> = {
      'mobile-base': [
        {
          name: 'typography.baseline',
          type: TokenTypes.FONT_SIZES,
          value: '14px', // mobile baseline
        },
      ],
      'desktop-base': [
        {
          name: 'typography.baseline',
          type: TokenTypes.FONT_SIZES,
          value: '16px', // desktop baseline
        },
      ],
      'typography-tokens': [
        {
          name: 'typography.heading',
          type: TokenTypes.TYPOGRAPHY,
          value: {
            fontSize: '{typography.baseline}',
            fontWeight: 'bold',
          },
        },
      ],
    };

    // Define themes that use different typography baselines
    const themes: ThemeObject[] = [
      {
        id: 'mobile',
        name: 'Mobile Theme',
        selectedTokenSets: {
          'mobile-base': TokenSetStatus.ENABLED,
          'typography-tokens': TokenSetStatus.ENABLED,
        },
      },
      {
        id: 'desktop',
        name: 'Desktop Theme',
        selectedTokenSets: {
          'desktop-base': TokenSetStatus.ENABLED,
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

    const mobileResolvedTokens = resolveTokensForTheme(themes[0]);
    const desktopResolvedTokens = resolveTokensForTheme(themes[1]);

    // Format tokens for each theme
    const mobileFormatted = JSON.parse(formatTokens({
      tokens,
      tokenSets: ['mobile-base', 'typography-tokens'],
      resolvedTokens: mobileResolvedTokens,
      expandTypography: true,
    }));

    const desktopFormatted = JSON.parse(formatTokens({
      tokens,
      tokenSets: ['desktop-base', 'typography-tokens'],
      resolvedTokens: desktopResolvedTokens,
      expandTypography: true,
    }));

    // Verify that each theme has different baseline values
    expect(mobileFormatted['mobile-base'].typography.baseline.$value).toBe('14px');
    expect(desktopFormatted['desktop-base'].typography.baseline.$value).toBe('16px');

    // Verify that typography heading fontSize preserves the reference (not resolved)
    expect(mobileFormatted['typography-tokens'].typography.heading.fontSize.$value).toBe('{typography.baseline}');
    expect(desktopFormatted['typography-tokens'].typography.heading.fontSize.$value).toBe('{typography.baseline}');
  });
});
