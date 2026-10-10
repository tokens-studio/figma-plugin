import { ItemData } from '@/context';
import { ensureFolderIsTogether } from '../../dragDropOrder/ensureFolderIsTogether';
import { TreeItem } from '../tokenSetListToTree';

describe('ensureFolderIsTogether', () => {
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

  it('can move folder children if parent moved', () => {
    const result = ensureFolderIsTogether(list[1].value, [...list], [
      list[1],
      list[0],
      list[2],
      list[3],
    ]);
    expect(result[1].value).toEqual(list[2].value);
    expect(result[2].value).toEqual(list[3].value);
  });

  it('keeps all descendants together when a folder with nested sub-folders is moved', () => {
    const folderA: ItemData<TreeItem> = {
      layout: { min: 0, max: 10 },
      value: {
        key: 'folderA',
        path: 'folderA',
        parent: null,
        level: 0,
        label: 'FolderA',
        isLeaf: false,
        id: 'folderA',
      },
    };
    const aLeaf: ItemData<TreeItem> = {
      layout: { min: 0, max: 10 },
      value: {
        key: 'folderA/leaf',
        path: 'folderA/leaf',
        parent: 'folderA',
        level: 1,
        label: 'Leaf',
        isLeaf: true,
        id: 'folderA/leaf',
      },
    };
    const aSub: ItemData<TreeItem> = {
      layout: { min: 0, max: 10 },
      value: {
        key: 'folderA/sub',
        path: 'folderA/sub',
        parent: 'folderA',
        level: 1,
        label: 'Sub',
        isLeaf: false,
        id: 'folderA/sub',
      },
    };
    const aSubItem: ItemData<TreeItem> = {
      layout: { min: 0, max: 10 },
      value: {
        key: 'folderA/sub/item',
        path: 'folderA/sub/item',
        parent: 'folderA/sub',
        level: 2,
        label: 'Item',
        isLeaf: true,
        id: 'folderA/sub/item',
      },
    };
    const globalItem: ItemData<TreeItem> = {
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
    };

    const order = [folderA, aLeaf, aSub, aSubItem, globalItem];
    // After checkReorder moves folderA past globalItem: [aLeaf, aSub, aSubItem, globalItem, folderA]
    const nextOrder = [aLeaf, aSub, aSubItem, globalItem, folderA];

    const result = ensureFolderIsTogether(folderA.value, order, nextOrder);

    // All descendants should be grouped right after folderA
    expect(result[0].value).toEqual(globalItem.value);
    expect(result[1].value).toEqual(folderA.value);
    expect(result[2].value).toEqual(aLeaf.value);
    expect(result[3].value).toEqual(aSub.value);
    expect(result[4].value).toEqual(aSubItem.value);
  });

  it('does not falsely include items from sibling folders with prefix-matching names', () => {
    const themesFolder: ItemData<TreeItem> = {
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
    };
    const themesItem: ItemData<TreeItem> = {
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
    };
    const themes2Folder: ItemData<TreeItem> = {
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
    };
    const themes2Item: ItemData<TreeItem> = {
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
    };

    const order = [themesFolder, themesItem, themes2Folder, themes2Item];
    // After checkReorder moves themes to end: [themesItem, themes2Folder, themes2Item, themesFolder]
    const nextOrder = [themesItem, themes2Folder, themes2Item, themesFolder];

    const result = ensureFolderIsTogether(themesFolder.value, order, nextOrder);

    // themes/light should follow themes, but themes2/dark should stay with themes2
    expect(result[0].value).toEqual(themes2Folder.value);
    expect(result[1].value).toEqual(themes2Item.value);
    expect(result[2].value).toEqual(themesFolder.value);
    expect(result[3].value).toEqual(themesItem.value);
  });
});
