import {
  buildChildrenMap, buildParentMap, collectAncestors, collectDescendants, getThemeDepth,
} from '../themeHierarchy';
import { ThemeObject } from '@/types';

function theme(id: string, parentId?: string): ThemeObject {
  return {
    id,
    name: id,
    selectedTokenSets: {},
    $figmaStyleReferences: {},
    ...(parentId ? { $figmaParentThemeId: parentId } : {}),
  } as ThemeObject;
}

describe('themeHierarchy', () => {
  const themes = [theme('root'), theme('child', 'root'), theme('grandchild', 'child'), theme('other')];

  describe('collectAncestors', () => {
    it('walks up the chain', () => {
      expect(collectAncestors('grandchild', buildParentMap(themes))).toEqual(['child', 'root']);
    });

    it('returns empty for a root theme', () => {
      expect(collectAncestors('root', buildParentMap(themes))).toEqual([]);
    });

    it('terminates on a self-referencing theme', () => {
      const cyclic = [theme('a', 'a')];
      expect(collectAncestors('a', buildParentMap(cyclic))).toEqual([]);
    });

    it('terminates on an a→b→a cycle', () => {
      const cyclic = [theme('a', 'b'), theme('b', 'a')];
      expect(collectAncestors('a', buildParentMap(cyclic))).toEqual(['b']);
    });
  });

  describe('collectDescendants', () => {
    it('collects transitively', () => {
      expect(collectDescendants('root', buildChildrenMap(themes))).toEqual(['child', 'grandchild']);
    });

    it('returns empty for a leaf', () => {
      expect(collectDescendants('grandchild', buildChildrenMap(themes))).toEqual([]);
    });

    it('terminates on cycles', () => {
      const cyclic = [theme('a', 'b'), theme('b', 'a')];
      expect(collectDescendants('a', buildChildrenMap(cyclic))).toEqual(['b']);
    });
  });

  describe('getThemeDepth', () => {
    const byId = new Map(themes.map((t) => [t.id, t]));

    it('computes depth', () => {
      expect(getThemeDepth('root', byId)).toBe(0);
      expect(getThemeDepth('child', byId)).toBe(1);
      expect(getThemeDepth('grandchild', byId)).toBe(2);
    });

    it('terminates on a cycle instead of freezing', () => {
      const cyclic = [theme('a', 'b'), theme('b', 'c'), theme('c', 'a')];
      const cyclicById = new Map(cyclic.map((t) => [t.id, t]));
      expect(getThemeDepth('a', cyclicById)).toBeLessThanOrEqual(cyclic.length);
    });
  });
});
