import type { TokenState } from '../../tokenState';
import type { ThemeObject } from '@/types';

/**
 * Helper function to recursively find all child themes of a given theme
 * @param themeId - The parent theme ID to find children for
 * @param allThemes - All themes to search through
 * @returns Array of child theme IDs (including descendants)
 */
function findChildThemes(themeId: string, allThemes: ThemeObject[]): string[] {
  // Find direct children (themes with $figmaParentThemeId === themeId)
  const directChildren = allThemes
    .filter((t) => t.$figmaParentThemeId === themeId)
    .map((t) => t.id);

  // Recursively find children of children
  const allDescendants = directChildren.flatMap((childId) => [
    childId,
    ...findChildThemes(childId, allThemes),
  ]);

  return allDescendants;
}

/**
 * Deletes a theme and all its child (extended) themes recursively
 * @param state - Current token state
 * @param themeId - ID of theme to delete
 * @returns Updated state with theme and all children removed
 */
export function deleteTheme(state: TokenState, themeId: string): TokenState {
  // Find all themes to delete (including children)
  const themesToDelete = new Set([
    themeId,
    ...findChildThemes(themeId, state.themes),
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
