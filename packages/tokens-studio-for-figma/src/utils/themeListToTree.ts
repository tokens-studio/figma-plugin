import { v4 as uuidv4 } from 'uuid';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { ThemeObject, ThemeObjectsList } from '@/types';

export type TreeItem = {
  key: string;
  path: string;
  parent: string | null;
  level: number;
  label: string;
  isLeaf: boolean;
  value: string | ThemeObject;
  id: string;
};

export function sortThemesForDisplay(themes: ThemeObjectsList): ThemeObjectsList {
  const themeById = new Map(themes.map((t) => [t.id, t]));

  // For a given group name, return the group of its parent (if it's an extended group)
  const getParentGroupOfGroup = (group: string): string | null => {
    const firstInGroup = themes.find((t) => (t.group ?? '') === group);
    if (!firstInGroup?.$figmaParentThemeId) return null;
    return themeById.get(firstInGroup.$figmaParentThemeId)?.group ?? null;
  };

  // Collect unique groups in original order
  const seen = new Set<string>();
  const groups: string[] = [];
  themes.forEach((t) => {
    const g = t.group ?? '';
    if (!seen.has(g)) { seen.add(g); groups.push(g); }
  });

  // Topological sort: non-extended groups first, extended groups right after their parent
  const sorted: string[] = [];
  const visited = new Set<string>();

  const visit = (g: string) => {
    if (visited.has(g)) return;
    visited.add(g);
    sorted.push(g);
    groups.filter((child) => getParentGroupOfGroup(child) === g).forEach(visit);
  };

  groups.filter((g) => getParentGroupOfGroup(g) === null).forEach(visit);
  groups.filter((g) => !visited.has(g)).forEach(visit); // safety for orphans

  const themesByGroup = new Map<string, ThemeObjectsList>();
  themes.forEach((t) => {
    const g = t.group ?? '';
    if (!themesByGroup.has(g)) themesByGroup.set(g, []);
    themesByGroup.get(g)!.push(t);
  });

  return sorted.flatMap((g) => themesByGroup.get(g) ?? []);
}

export function themeListToTree(items: ThemeObjectsList) {
  const sortedItems = sortThemesForDisplay(items);
  const tree = sortedItems.reduce<TreeItem[]>((acc, curr) => {
    const parentIndex = acc.findIndex(
      (item) => !item.isLeaf
        && ((typeof curr?.group !== 'undefined' && item.key === curr.group)
          || (typeof curr?.group === 'undefined' && item.key === INTERNAL_THEMES_NO_GROUP)),
    );

    if (parentIndex < 0) {
      acc.push({
        isLeaf: false,
        value: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
        key: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
        parent: null,
        path: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
        level: 0,
        label: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
        id: uuidv4(),
      });
      acc.push({
        isLeaf: true,
        value: curr,
        key: curr.id,
        parent: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
        path: `${curr?.group ?? INTERNAL_THEMES_NO_GROUP}/${curr.id}`,
        level: 1,
        label: curr.id,
        id: uuidv4(),
      });
    } else {
      const childrenLength = acc.filter(
        (item) => item.isLeaf === true
          && ((typeof curr?.group !== 'undefined' && item.parent === curr.group)
            || (typeof curr?.group === 'undefined' && item.parent === INTERNAL_THEMES_NO_GROUP)),
      ).length;
      acc.splice(parentIndex + childrenLength + 1, 0, {
        isLeaf: true,
        value: curr,
        key: curr.id,
        parent: curr?.group ?? INTERNAL_THEMES_NO_GROUP,
        path: `${curr?.group ?? INTERNAL_THEMES_NO_GROUP}/${curr.name}`,
        level: 1,
        label: curr.id,
        id: uuidv4(),
      });
    }
    return acc;
  }, []);
  return tree;
}
