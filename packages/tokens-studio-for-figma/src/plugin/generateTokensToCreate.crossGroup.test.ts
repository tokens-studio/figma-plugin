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

  it('resolves from the active option when every option is exported', () => {
    expect(reducedValue(getOverallConfigForTheme(themes, allIds, chartsTheme, { brand: 'a', charts: 'charts' }))).toBe('#2143a266');
    expect(reducedValue(getOverallConfigForTheme(themes, allIds, chartsTheme, { brand: 'b', charts: 'charts' }))).toBe('#2754ac66');
  });

  it('resolves from the exported option when the active one is not exported', () => {
    expect(reducedValue(getOverallConfigForTheme(themes, ['b', 'charts'], chartsTheme, { brand: 'a' }))).toBe('#2754ac66');
  });

  it('resolves from the active option when no option of the group is exported', () => {
    expect(reducedValue(getOverallConfigForTheme(themes, ['charts'], chartsTheme, { brand: 'a' }))).toBe('#2143a266');
  });
});
