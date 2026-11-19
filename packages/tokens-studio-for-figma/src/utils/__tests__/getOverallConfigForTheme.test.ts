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

  it('takes the first exported option of every other group, in theme order', () => {
    expect(getOverallConfigForTheme(themes, allIds, charts)).toEqual({
      'brand/a': TokenSetStatus.ENABLED,
      'mode/light': TokenSetStatus.ENABLED,
      global: TokenSetStatus.SOURCE,
      charts: TokenSetStatus.ENABLED,
      loose1: TokenSetStatus.ENABLED,
      loose2: TokenSetStatus.ENABLED,
    });
  });

  it('follows theme order, not the order of the export selection', () => {
    expect(getOverallConfigForTheme(themes, ['dark', 'b', 'charts', 'light', 'a'], charts)).toEqual({
      'brand/a': TokenSetStatus.ENABLED,
      'mode/light': TokenSetStatus.ENABLED,
      global: TokenSetStatus.SOURCE,
      charts: TokenSetStatus.ENABLED,
    });
  });

  it('takes the only exported option of a group', () => {
    expect(getOverallConfigForTheme(themes, ['b', 'dark', 'charts'], charts)).toEqual({
      'brand/b': TokenSetStatus.ENABLED,
      'mode/dark': TokenSetStatus.ENABLED,
      global: TokenSetStatus.SOURCE,
      charts: TokenSetStatus.ENABLED,
    });
  });

  it('adds nothing for groups with no exported option', () => {
    expect(getOverallConfigForTheme(themes, ['charts'], charts)).toEqual({
      charts: TokenSetStatus.ENABLED,
    });
  });

  it('only includes the theme itself from its own group', () => {
    expect(getOverallConfigForTheme(themes, allIds, themes[3])).toEqual({
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
});
