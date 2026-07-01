import type { TokenState } from '../../tokenState';

/**
 * Deletes all themes in a specific theme group
 * @param state - Current token state
 * @param groupName - Name of the theme group to delete
 * @returns Updated state with all themes in the group removed
 */
export function deleteThemeGroup(state: TokenState, groupName: string): TokenState {
    // Find all themes in this group
    const themesToDelete = new Set(
        state.themes
            .filter((t) => t.group === groupName)
            .map((t) => t.id),
    );

    // Update active theme - remove any deleted themes
    const newActiveTheme = { ...state.activeTheme };
    Object.keys(newActiveTheme).forEach((group) => {
        if (themesToDelete.has(newActiveTheme[group])) {
            delete newActiveTheme[group];
        }
    });

    // Filter out all themes in the group
    return {
        ...state,
        themes: state.themes.filter((theme) => !themesToDelete.has(theme.id)),
        activeTheme: newActiveTheme,
    };
}
