import { getOverallConfigForTheme } from '../tokenHelpers';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { ThemeObject } from '@/types';

describe('getOverallConfigForTheme', () => {
  const themes: ThemeObject[] = [
    {
      id: 'a', name: 'A', group: 'brand', selectedTokenSets: { 'brand/a': TokenSetStatus.ENABLED },
    },
    {
      id: 'b', name: 'B', group: 'brand', selectedTokenSets: { 'brand/b': TokenSetStatus.ENABLED },
    },
    {
      id: 'light', name: 'Light', group: 'mode', selectedTokenSets: { 'mode/light': TokenSetStatus.ENABLED, global: TokenSetStatus.SOURCE },
    },
    {
      id: 'dark', name: 'Dark', group: 'mode', selectedTokenSets: { 'mode/dark': TokenSetStatus.ENABLED, global: TokenSetStatus.SOURCE },
    },
    {
      id: 'charts', name: 'Charts', group: 'charts', selectedTokenSets: { charts: TokenSetStatus.ENABLED },
    },
    { id: 'loose1', name: 'Loose 1', selectedTokenSets: { loose1: TokenSetStatus.ENABLED } },
    { id: 'loose2', name: 'Loose 2', selectedTokenSets: { loose2: TokenSetStatus.ENABLED } },
  ];
  const allIds = themes.map((t) => t.id);
  const charts = themes[4];

  it('takes the active option of every other group when it is exported', () => {
    expect(getOverallConfigForTheme(themes, allIds, charts, { brand: 'a', mode: 'dark' })).toEqual({
      'brand/a': TokenSetStatus.ENABLED,
      'mode/dark': TokenSetStatus.ENABLED,
      global: TokenSetStatus.SOURCE,
      charts: TokenSetStatus.ENABLED,
      loose1: TokenSetStatus.ENABLED,
      loose2: TokenSetStatus.ENABLED,
    });
  });

  it('falls back to the first exported option when the active one is not exported', () => {
    expect(getOverallConfigForTheme(themes, ['b', 'light', 'dark', 'charts'], charts, { brand: 'a', mode: 'light' })).toEqual({
      'brand/b': TokenSetStatus.ENABLED,
      'mode/light': TokenSetStatus.ENABLED,
      global: TokenSetStatus.SOURCE,
      charts: TokenSetStatus.ENABLED,
    });
  });

  it('falls back to the active option when no option of the group is exported', () => {
    expect(getOverallConfigForTheme(themes, ['charts'], charts, { brand: 'b', mode: 'light' })).toEqual({
      'brand/b': TokenSetStatus.ENABLED,
      'mode/light': TokenSetStatus.ENABLED,
      global: TokenSetStatus.SOURCE,
      charts: TokenSetStatus.ENABLED,
    });
  });

  it('only includes the theme itself from its own group', () => {
    expect(getOverallConfigForTheme(themes, allIds, themes[3], { brand: 'a', mode: 'light' })).toEqual({
      'brand/a': TokenSetStatus.ENABLED,
      'mode/dark': TokenSetStatus.ENABLED,
      global: TokenSetStatus.SOURCE,
      charts: TokenSetStatus.ENABLED,
      loose1: TokenSetStatus.ENABLED,
      loose2: TokenSetStatus.ENABLED,
    });
  });

  it('keeps every exported theme without a group, as before', () => {
    expect(getOverallConfigForTheme(themes, ['loose1', 'loose2'], themes[5])).toEqual({
      loose1: TokenSetStatus.ENABLED,
      loose2: TokenSetStatus.ENABLED,
    });
  });

  it('ignores active themes that no longer exist', () => {
    expect(getOverallConfigForTheme(themes, ['charts'], charts, { brand: 'deleted' })).toEqual({
      charts: TokenSetStatus.ENABLED,
    });
  });
});
