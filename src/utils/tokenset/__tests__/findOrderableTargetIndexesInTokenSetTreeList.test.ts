import type { ItemData } from '@/context';
import { findOrderableTargetIndexes } from '../../dragDropOrder/findOrderableTargetIndexes';
import type { TreeItem } from '../tokenSetListToTree';

describe('findOrderableTargetIndexes', () => {
  const list: ItemData<TreeItem>[] = [
    {
      layout: { min: 0, max: 10 },
      value: {
        key: 'global',
        path: 'global',
        parent: null,
        level: 0,
        label: 'Global',
        isLeaf: true,
      },
    },
    {
      layout: { min: 0, max: 10 },
      value: {
        key: 'themes',
        path: 'themes',
        parent: null,
        level: 0,
        label: 'Themes',
        isLeaf: false,
      },
    },
    {
      layout: { min: 0, max: 10 },
      value: {
        key: 'themes/light',
        path: 'themes/light',
        parent: 'themes',
        level: 0,
        label: 'Light',
        isLeaf: true,
      },
    },
    {
      layout: { min: 0, max: 10 },
      value: {
        key: 'themes/dark',
        path: 'themes/dark',
        parent: 'themes',
        level: 0,
        label: 'Dark',
        isLeaf: true,
      },
    },
  ];

  it('should find the appropriate ordering target indexes', () => {
    const rootIndexes = findOrderableTargetIndexes(1, list[0].value, list);
    expect(rootIndexes).toEqual([3]);

    const rootIndexesReverse = findOrderableTargetIndexes(-1, list[0].value, list);
    expect(rootIndexesReverse).toEqual([1]);

    const nestedIndexes = findOrderableTargetIndexes(1, list[2].value, list);
    expect(nestedIndexes).toEqual([3]);
  });
});
