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
});
