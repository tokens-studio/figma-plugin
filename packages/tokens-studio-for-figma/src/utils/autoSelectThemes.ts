import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

/**
 * Auto-selects the first theme from each theme group if no themes are currently selected
 * This is used when loading a provider for the first time or when no previous theme selections exist
 *
 * @param availableThemes - Array of available themes with their groups
 * @param currentActiveTheme - Current active theme selection (may be empty)
 * @returns New theme selection object with first themes auto-selected per group
 */
export type ThemeOption = {
  value: string;
  label: string;
  group?: string;
};

export type ActiveTheme = Record<string, string>;

export function autoSelectFirstThemesPerGroup(
  availableThemes: ThemeOption[],
  currentActiveTheme: ActiveTheme = {},
): ActiveTheme {
  // If there are already active themes, don't change anything
  if (Object.keys(currentActiveTheme).length > 0) {
    return currentActiveTheme;
  }

  // Group themes by their group name
  const themesByGroup = availableThemes.reduce((acc, theme) => {
    const groupName = theme.group || INTERNAL_THEMES_NO_GROUP;
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(theme);
    return acc;
  }, {} as Record<string, ThemeOption[]>);

  // Select the first theme from each group
  const newActiveTheme: ActiveTheme = {};
  Object.entries(themesByGroup).forEach(([groupName, themes]) => {
    if (themes.length > 0) {
      newActiveTheme[groupName] = themes[0].value;
    }
  });

  return newActiveTheme;
}
