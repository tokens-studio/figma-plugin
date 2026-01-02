import { ThemeObjectsList } from '@/types';

/**
 * Topologically sorts themes so that parent themes are processed before children.
 * This ensures that when creating collections, parent collections exist before
 * we attempt to create extended (child) collections.
 *
 * @param themes - Array of theme objects to sort
 * @returns Sorted array of themes (parents first, then children)
 * @throws Error if a circular dependency is detected
 */
export function resolveThemeDependencies(themes: ThemeObjectsList): ThemeObjectsList {
  const themeMap = new Map(themes.map((t) => [t.id, t]));
  const sorted: ThemeObjectsList = [];
  const visited = new Set<string>();
  const inStack = new Set<string>(); // For cycle detection

  function visit(themeId: string) {
    if (inStack.has(themeId)) {
      throw new Error(`Circular dependency detected in themes: ${themeId}`);
    }
    if (visited.has(themeId)) return;

    const theme = themeMap.get(themeId);
    if (!theme) return;

    inStack.add(themeId);

    // Visit parent first (if exists and is in the themes array)
    if (theme.$extendsThemeId && themeMap.has(theme.$extendsThemeId)) {
      visit(theme.$extendsThemeId);
    }

    inStack.delete(themeId);
    visited.add(themeId);
    sorted.push(theme);
  }

  for (const theme of themes) {
    visit(theme.id);
  }

  return sorted;
}

/**
 * Gets the parent theme for a given theme based on $extendsThemeId.
 *
 * @param theme - The theme to find the parent for
 * @param allThemes - All available themes
 * @returns The parent theme, or undefined if not found or theme has no parent
 */
export function getParentTheme(
  theme: ThemeObjectsList[number],
  allThemes: ThemeObjectsList,
): ThemeObjectsList[number] | undefined {
  if (!theme.$extendsThemeId) return undefined;
  return allThemes.find((t) => t.id === theme.$extendsThemeId);
}
