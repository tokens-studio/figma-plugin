import type { ItemData } from '@/context';
import type { TreeItem } from '../tokenSetListToTree';
import { findOrderableTargetIndexesInTokenSetTreeList } from '../findOrderableTargetIndexesInTokenSetTreeList';

describe('findOrderableTargetIndexesInTokenSetTreeList', () => {
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
        id: 'global',
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
        id: 'themes',
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
        id: 'themes/light',
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
        id: 'themes/dark',
      },
    },
  ];

  it('should find the appropriate ordering target indexes', () => {
    const rootIndexes = findOrderableTargetIndexesInTokenSetTreeList(1, list[0].value, list);
    expect(rootIndexes).toEqual([3]);

    const rootIndexesReverse = findOrderableTargetIndexesInTokenSetTreeList(-1, list[0].value, list);
    expect(rootIndexesReverse).toEqual([1]);

    const nestedIndexes = findOrderableTargetIndexesInTokenSetTreeList(1, list[2].value, list);
    expect(nestedIndexes).toEqual([3]);
  });

  it('should correctly count nested descendants without false-matching sibling folder names', () => {
    // 'themes' has 2 children; 'themes2' is a sibling that should NOT be counted as child of 'themes'
    const listWithPrefixSiblings: ItemData<TreeItem>[] = [
      {
        layout: { min: 0, max: 10 },
        value: {
          key: 'themes',
          path: 'themes',
          parent: null,
          level: 0,
          label: 'Themes',
          isLeaf: false,
          id: 'themes',
        },
      },
      {
        layout: { min: 0, max: 10 },
        value: {
          key: 'themes/light',
          path: 'themes/light',
          parent: 'themes',
          level: 1,
          label: 'Light',
          isLeaf: true,
          id: 'themes/light',
        },
      },
      {
        layout: { min: 0, max: 10 },
        value: {
          key: 'themes2',
          path: 'themes2',
          parent: null,
          level: 0,
          label: 'Themes2',
          isLeaf: false,
          id: 'themes2',
        },
      },
      {
        layout: { min: 0, max: 10 },
        value: {
          key: 'themes2/dark',
          path: 'themes2/dark',
          parent: 'themes2',
          level: 1,
          label: 'Dark',
          isLeaf: true,
          id: 'themes2/dark',
        },
      },
    ];

    // Dragging 'themes' (index 0) forward: should land after themes2's children at index 3
    // childrenCount for themes2 = 1 (only themes2/dark, NOT themes2 itself)
    const indexes = findOrderableTargetIndexesInTokenSetTreeList(1, listWithPrefixSiblings[0].value, listWithPrefixSiblings);
    expect(indexes).toEqual([3]);
  });

  it('should correctly count all descendants including nested sub-folders', () => {
    // Setup: [themes(0), themes/light(1), themes/sub(2), themes/sub/item(3), global(4)]
    const listWithNestedSubfolder: ItemData<TreeItem>[] = [
      {
        layout: { min: 0, max: 10 },
        value: {
          key: 'themes',
          path: 'themes',
          parent: null,
          level: 0,
          label: 'Themes',
          isLeaf: false,
          id: 'themes',
        },
      },
      {
        layout: { min: 0, max: 10 },
        value: {
          key: 'themes/light',
          path: 'themes/light',
          parent: 'themes',
          level: 1,
          label: 'Light',
          isLeaf: true,
          id: 'themes/light',
        },
      },
      {
        layout: { min: 0, max: 10 },
        value: {
          key: 'themes/sub',
          path: 'themes/sub',
          parent: 'themes',
          level: 1,
          label: 'Sub',
          isLeaf: false,
          id: 'themes/sub',
        },
      },
      {
        layout: { min: 0, max: 10 },
        value: {
          key: 'themes/sub/item',
          path: 'themes/sub/item',
          parent: 'themes/sub',
          level: 2,
          label: 'Item',
          isLeaf: true,
          id: 'themes/sub/item',
        },
      },
      {
        layout: { min: 0, max: 10 },
        value: {
          key: 'global',
          path: 'global',
          parent: null,
          level: 0,
          label: 'Global',
          isLeaf: true,
          id: 'global',
        },
      },
    ];

    // Dragging 'global' (index 4) forward: themes is a sibling at index 0 with 3 descendants,
    // so available index = 0 + 3 = 3 (end of themes group)
    const globalIndexes = findOrderableTargetIndexesInTokenSetTreeList(1, listWithNestedSubfolder[4].value, listWithNestedSubfolder);
    expect(globalIndexes).toEqual([3]);

    // Dragging 'global' (index 4) backward: should land before 'themes' at index 0
    const globalIndexesReverse = findOrderableTargetIndexesInTokenSetTreeList(-1, listWithNestedSubfolder[4].value, listWithNestedSubfolder);
    expect(globalIndexesReverse).toEqual([0]);

    // Dragging 'themes' (index 0) forward past 'global': childrenCount for global = 0, so target = 4
    const themesIndexes = findOrderableTargetIndexesInTokenSetTreeList(1, listWithNestedSubfolder[0].value, listWithNestedSubfolder);
    expect(themesIndexes).toEqual([4]);
  });
});
