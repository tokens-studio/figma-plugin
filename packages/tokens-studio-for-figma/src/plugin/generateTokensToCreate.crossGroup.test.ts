// Regression guard for modified colors that reference another theme group.
// Modified colors can't be exported as aliases, so the resolved value is baked in.
// With both options of a group exported, the set stored last used to win
// regardless of which option was active.

import { generateTokensToCreate } from './generateTokensToCreate';
import { getOverallConfig, getOverallConfigForTheme } from '@/utils/tokenHelpers';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { ThemeObject } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorSpaceTypes } from '@/constants/ColorSpaceTypes';

describe('generateTokensToCreate — references into another theme group', () => {
  const tokens: Record<string, AnyTokenList> = {
    'brand/a': [{ name: 'brand.accent', value: '#2143a2', type: TokenTypes.COLOR }],
    'brand/b': [{ name: 'brand.accent', value: '#2754ac', type: TokenTypes.COLOR }],
    charts: [
      { name: 'chart.default', value: '{brand.accent}', type: TokenTypes.COLOR },
      {
        name: 'chart.reduced',
        value: '{chart.default}',
        type: TokenTypes.COLOR,
        $extensions: { 'studio.tokens': { modify: { type: ColorModifierTypes.ALPHA, value: '0.4', space: ColorSpaceTypes.SRGB } } },
      },
    ],
  };
  const themes: ThemeObject[] = [
    {
      id: 'a', name: 'A', group: 'brand', selectedTokenSets: { 'brand/a': TokenSetStatus.ENABLED },
    },
    {
      id: 'b', name: 'B', group: 'brand', selectedTokenSets: { 'brand/b': TokenSetStatus.ENABLED },
    },
    {
      id: 'charts', name: 'Charts', group: 'charts', selectedTokenSets: { charts: TokenSetStatus.ENABLED },
    },
  ];
  const chartsTheme = themes[2];
  const allIds = themes.map((t) => t.id);

  const reducedValue = (overallConfig: ReturnType<typeof getOverallConfig>) => generateTokensToCreate({ theme: chartsTheme, tokens, overallConfig })
    .tokensToCreate.find((token) => token.name === 'chart.reduced')?.value;

  it('the union of all exported themes resolves from the set stored last', () => {
    expect(reducedValue(getOverallConfig(themes, allIds))).toBe('#2754ac66');
  });

  it('resolves from the first exported option in theme order, whatever the selection order', () => {
    expect(reducedValue(getOverallConfigForTheme(themes, allIds, chartsTheme))).toBe('#2143a266');
    expect(reducedValue(getOverallConfigForTheme(themes, ['charts', 'b', 'a'], chartsTheme))).toBe('#2143a266');
  });

  it('resolves from the only exported option of the group', () => {
    expect(reducedValue(getOverallConfigForTheme(themes, ['b', 'charts'], chartsTheme))).toBe('#2754ac66');
  });

  it('leaves the reference unresolved when no option of the group is exported, as on main', () => {
    expect(reducedValue(getOverallConfigForTheme(themes, ['charts'], chartsTheme)))
      .toBe(reducedValue(getOverallConfig(themes, ['charts'])));
  });

  // Known limit: the theme's own sets always win over the pool, so when the referenced token
  // also lives in a SOURCE set of the exported theme (core defaults plus brand overrides),
  // the export bakes the source value and the brand pick has no effect.
  it('uses the source set of the exported theme when it also defines the referenced token', () => {
    const tokensWithCore: Record<string, AnyTokenList> = {
      core: [{ name: 'brand.accent', value: '#123456', type: TokenTypes.COLOR }],
      ...tokens,
    };
    const chartsWithCore: ThemeObject = {
      ...chartsTheme,
      selectedTokenSets: { core: TokenSetStatus.SOURCE, charts: TokenSetStatus.ENABLED },
    };
    const themesWithCore = [themes[0], themes[1], chartsWithCore];
    const value = (selected: string[]) => generateTokensToCreate({
      theme: chartsWithCore,
      tokens: tokensWithCore,
      overallConfig: getOverallConfigForTheme(themesWithCore, selected, chartsWithCore),
    }).tokensToCreate.find((token) => token.name === 'chart.reduced')?.value;

    expect(value(['a', 'charts'])).toBe('#12345666');
    expect(value(['b', 'charts'])).toBe('#12345666');
  });
});
