import { deleteThemeGroup } from '../tokenState/deleteThemeGroup';
import type { TokenState } from '../../tokenState';
import { ThemeObject } from '@/types';

function theme(id: string, group: string, parentId?: string): ThemeObject {
  return {
    id,
    name: id,
    group,
    selectedTokenSets: {},
    $figmaStyleReferences: {},
    ...(parentId ? { $figmaParentThemeId: parentId, $figmaIsExtension: true } : {}),
  } as ThemeObject;
}

function stateWith(themes: ThemeObject[], activeTheme: Record<string, string> = {}): TokenState {
  return { themes, activeTheme } as TokenState;
}

describe('deleteThemeGroup', () => {
  it('deletes themes in the group', () => {
    const state = stateWith([theme('a', 'Colors'), theme('b', 'Spacing')]);
    const result = deleteThemeGroup(state, 'Colors');
    expect(result.themes.map((t) => t.id)).toEqual(['b']);
  });

  it('cascades to extension children in other groups', () => {
    const state = stateWith([
      theme('parent', 'Colors'),
      theme('child', 'Colors/Brand', 'parent'),
      theme('grandchild', 'Colors/Brand/Sub', 'child'),
      theme('unrelated', 'Spacing'),
    ]);

    const result = deleteThemeGroup(state, 'Colors');

    // parent + its whole extension subtree removed, unrelated kept
    expect(result.themes.map((t) => t.id)).toEqual(['unrelated']);
  });

  it('clears active theme entries for deleted themes', () => {
    const state = stateWith(
      [theme('parent', 'Colors'), theme('child', 'Colors/Brand', 'parent')],
      { Colors: 'parent', 'Colors/Brand': 'child' },
    );
    const result = deleteThemeGroup(state, 'Colors');
    expect(result.activeTheme).toEqual({});
  });

  it('terminates on a cyclic parent reference', () => {
    const state = stateWith([
      { ...theme('a', 'Colors', 'b'), $figmaParentThemeId: 'b' } as ThemeObject,
      { ...theme('b', 'Colors', 'a'), $figmaParentThemeId: 'a' } as ThemeObject,
    ]);
    // Should not hang
    const result = deleteThemeGroup(state, 'Colors');
    expect(result.themes).toEqual([]);
  });
});
