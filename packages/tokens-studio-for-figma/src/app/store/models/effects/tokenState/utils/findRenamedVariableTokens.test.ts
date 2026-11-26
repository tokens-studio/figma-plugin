import { findRenamedVariableTokens } from './findRenamedVariableTokens';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

const theme = (references: Record<string, string>) => ({
  id: 'theme-light',
  name: 'Light',
  group: 'Brand',
  selectedTokenSets: { 'Brand/Light': TokenSetStatus.ENABLED },
  $figmaVariableReferences: references,
});

describe('findRenamedVariableTokens', () => {
  it('finds a variable that came back under a new name', () => {
    expect(findRenamedVariableTokens(
      [theme({ 'color.primary': 'key-1', 'color.secondary': 'key-2' })],
      [theme({ 'color.brand': 'key-1', 'color.secondary': 'key-2' })],
    )).toEqual([{ set: 'Brand/Light', oldName: 'color.primary', newName: 'color.brand' }]);
  });

  it('ignores added and removed variables', () => {
    expect(findRenamedVariableTokens(
      [theme({ 'color.primary': 'key-1' })],
      [theme({ 'color.secondary': 'key-2' })],
    )).toEqual([]);
  });

  it('ignores a swap, where the old name is still in use by another variable', () => {
    expect(findRenamedVariableTokens(
      [theme({ a: 'key-1', b: 'key-2' })],
      [theme({ b: 'key-1', a: 'key-2' })],
    )).toEqual([]);
  });

  it('ignores themes it has no previous references for', () => {
    expect(findRenamedVariableTokens([], [theme({ 'color.brand': 'key-1' })])).toEqual([]);
  });

  it('leaves same-named tokens of other sets the theme uses alone', () => {
    const shared = (references: Record<string, string>) => ({
      id: 'theme', name: 'Light', group: 'Color', selectedTokenSets: { brand: TokenSetStatus.ENABLED, 'core/base': TokenSetStatus.ENABLED, 'Color/Light': TokenSetStatus.ENABLED }, $figmaVariableReferences: references,
    });

    expect(findRenamedVariableTokens([shared({ accent: 'key' })], [shared({ primary: 'key' })]))
      .toEqual([{ set: 'Color/Light', oldName: 'accent', newName: 'primary' }]);
  });
});
