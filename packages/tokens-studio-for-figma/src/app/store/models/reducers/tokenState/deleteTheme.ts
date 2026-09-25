import type { TokenState } from '../../tokenState';
import { buildChildrenMap, collectDescendants } from '@/utils/themeHierarchy';

/**
 * Deletes a theme and all its child (extended) themes recursively
 * @param state - Current token state
 * @param themeId - ID of theme to delete
 * @returns Updated state with theme and all children removed
 */
export function deleteTheme(state: TokenState, themeId: string): TokenState {
  // Find all themes to delete (including descendants, cycle-safe)
  const themesToDelete = new Set([
    themeId,
    ...collectDescendants(themeId, buildChildrenMap(state.themes)),
  ]);

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
