import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { ThemeObject, ThemeObjectsList } from '@/types';

export type TreeItem = {
  key: string;
  path: string;
  parent: string | null
  level: number;
  label: string;
  isLeaf: boolean;
  value: string | ThemeObject
};

export function themeListToTree(items: ThemeObjectsList) {
  const tree = items.reduce<TreeItem[]>((acc, curr) => {
    const parentIndex = acc.findIndex((item) => !item.isLeaf
      && ((typeof curr?.group !== 'undefined' && item.key === curr.group)
        || (typeof curr?.group === 'undefined' && item.key === INTERNAL_THEMES_NO_GROUP)));

    if (parentIndex < 0) {
      acc.push({
        isLeaf: false,
        value: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
        key: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
        parent: null,
        path: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
        level: 0,
        label: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
      });
      acc.push({
        isLeaf: true,
        value: curr,
        key: curr.id,
        parent: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
        path: `${curr?.group ?? INTERNAL_THEMES_NO_GROUP}/${curr.id}`,
        level: 1,
        label: curr.id,
      });
    } else {
      const childrenLength = acc.filter((item) => item.isLeaf === true
      && ((typeof curr?.group !== 'undefined' && item.parent === curr.group)
          || (typeof curr?.group === 'undefined' && item.parent === INTERNAL_THEMES_NO_GROUP))).length;
      acc.splice(parentIndex + childrenLength + 1, 0, {
        isLeaf: true,
        value: curr,
        key: curr.id,
        parent: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
        path: `${curr?.group ?? INTERNAL_THEMES_NO_GROUP}/${curr.id}`,
        level: 1,
        label: curr.id,
      });
    }
    return acc;
  }, []);
  return tree;
}
