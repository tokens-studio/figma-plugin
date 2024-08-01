import type { AnyTokenList } from '@/types/tokens';
import { findParentIndexToInsertSet } from '../findParentIndexToInsertSet';

describe('findParentIndexToInsertSet', () => {
  const CURRENT_SETS = [
    ['base', [{ value: 'Inter', type: 'fontFamilies', name: 'Fam' }]],
    ['red-brand', [{ value: '#ffff00', type: 'color', name: 'base-red' }]],
    ['yellow-brand', [{ value: '#ff0000', type: 'color', name: 'base-yellow' }]],
  ];

  it('should insert a set at the end if it cannot find any related parent', () => {
    const setToInsert = 'last-set';
    const result = findParentIndexToInsertSet(CURRENT_SETS as [string, AnyTokenList][], setToInsert);
    expect(result).toBe(CURRENT_SETS.length);
  });

  it('should insert a 1 layer nested set next to its parent', () => {
    const setToInsert = 'base/light';
    const result = findParentIndexToInsertSet(CURRENT_SETS as [string, AnyTokenList][], setToInsert);
    expect(result).toBe(0);
  });

  it('should insert a 2 layer nested set next to its parent', () => {
    const setToInsert = 'red-brand/light/mobile';
    const result = findParentIndexToInsertSet(CURRENT_SETS as [string, AnyTokenList][], setToInsert);
    expect(result).toBe(1);
  });

  it('should insert a 3 layer nested set next to its parent', () => {
    const setToInsert = 'yellow-brand/light/mobile/ios';
    const result = findParentIndexToInsertSet(CURRENT_SETS as [string, AnyTokenList][], setToInsert);
    expect(result).toBe(CURRENT_SETS.length - 1);
  });
});
