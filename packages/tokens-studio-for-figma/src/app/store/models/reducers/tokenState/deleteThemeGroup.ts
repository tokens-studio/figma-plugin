import type { TokenState } from '../../tokenState';
import { buildChildrenMap, collectDescendants } from '@/utils/themeHierarchy';

/**
 * Deletes all themes in a specific theme group, cascading to their extension
 * (child) themes — otherwise deleting a parent group would leave child themes
 * with dangling $figmaParentThemeId pointers (matching deleteTheme's behaviour).
 * @param state - Current token state
 * @param groupName - Name of the theme group to delete
 * @returns Updated state with all themes in the group and their descendants removed
 */
export function deleteThemeGroup(state: TokenState, groupName: string): TokenState {
  const childrenMap = buildChildrenMap(state.themes);

  // Themes directly in the group, plus every extension descendant of each (cycle-safe)
  const themesToDelete = new Set<string>();
  state.themes
    .filter((t) => t.group === groupName)
    .forEach((t) => {
      themesToDelete.add(t.id);
      collectDescendants(t.id, childrenMap).forEach((id) => themesToDelete.add(id));
    });

  // Update active theme - remove any deleted themes
  const newActiveTheme = { ...state.activeTheme };
  Object.keys(newActiveTheme).forEach((group) => {
    if (themesToDelete.has(newActiveTheme[group])) {
      delete newActiveTheme[group];
    }
  });

  // Filter out all themes to delete
  return {
    ...state,
    themes: state.themes.filter((theme) => !themesToDelete.has(theme.id)),
    activeTheme: newActiveTheme,
  };
}
