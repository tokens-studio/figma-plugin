import hash from 'object-hash';
import omit from 'just-omit';
import { ThemeObject } from '@/types';
import type { TokenState } from '../../tokenState';
import { setActiveTheme } from './setActiveTheme';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

type Payload = Omit<ThemeObject, 'id' | '$figmaStyleReferences'> & {
  id?: string,
  group?: string,
  meta?: {
    oldName?: string,
    oldGroup?: string,
  }
};

/**
 * Find all extended child groups of a parent group
 * @param parentGroup - The parent group name
 * @param allThemes - All themes to search through
 * @returns Array of immediate child group names
 */
function findExtendedChildGroups(parentGroup: string, allThemes: ThemeObject[]): string[] {
  const childGroups = new Set<string>();

  allThemes.forEach((theme) => {
    if (theme.group && theme.group.startsWith(`${parentGroup}/`)) {
      // Extract the immediate child group (not grandchildren)
      const parts = theme.group.split('/');
      const parentParts = parentGroup.split('/');
      // Only include direct children (one level deeper)
      if (parts.length === parentParts.length + 1) {
        childGroups.add(theme.group);
      }
    }
  });

  return Array.from(childGroups);
}

export function saveTheme(state: TokenState, data: Payload): TokenState {
  const isNewTheme = !data.id;
  const themeId = data.id || hash([Date.now(), data]);
  const isActiveTheme = Object.values(state.activeTheme).includes(themeId);
  const selectedTokenSets = Object.fromEntries(
    Object.entries(data.selectedTokenSets)
      .filter(([, status]) => (status !== TokenSetStatus.DISABLED)),
  );
  const themeObjectIndex = state.themes.findIndex((theme) => theme.id === themeId);
  const startIndex = themeObjectIndex > -1 ? themeObjectIndex : state.themes.length;

  const updatedThemes = [...state.themes];
  updatedThemes.splice(startIndex, 1, {
    ...omit(state.themes[themeObjectIndex], 'group'),
    id: themeId,
    name: data.name,
    $figmaStyleReferences: state.themes[themeObjectIndex]?.$figmaStyleReferences ?? {},
    selectedTokenSets,
    ...(data?.group ? { group: data.group } : {}),
    // Preserve extended collection metadata
    ...(data.$figmaIsExtension !== undefined ? { $figmaIsExtension: data.$figmaIsExtension } : {}),
    ...(data.$figmaParentCollectionId ? { $figmaParentCollectionId: data.$figmaParentCollectionId } : {}),
    ...(data.$figmaParentThemeId ? { $figmaParentThemeId: data.$figmaParentThemeId } : {}),
    ...(data.$figmaMirrorParentSets !== undefined ? { $figmaMirrorParentSets: data.$figmaMirrorParentSets } : {}),
    // Preserve other Figma metadata
    ...(data.$figmaCollectionId ? { $figmaCollectionId: data.$figmaCollectionId } : {}),
    ...(data.$figmaModeId ? { $figmaModeId: data.$figmaModeId } : {}),
    ...(data.$figmaVariableReferences ? { $figmaVariableReferences: data.$figmaVariableReferences } : {}),
  });

  let finalThemes = updatedThemes;

  // If this is a new theme in a parent group (not an extended theme), cascade to children
  if (isNewTheme && data.group && !data.$figmaIsExtension) {
    const extendedChildGroups = findExtendedChildGroups(data.group, updatedThemes);

    extendedChildGroups.forEach((childGroup) => {
      const childThemeId = hash([Date.now(), childGroup, data.name, Math.random()]);
      const childTheme: ThemeObject = {
        id: childThemeId,
        name: data.name,
        group: childGroup,
        selectedTokenSets: data.selectedTokenSets || {},
        $figmaStyleReferences: {},
        $figmaIsExtension: true,
        $figmaParentThemeId: themeId,
        $figmaMirrorParentSets: true, // Enable mirroring by default
      };

      finalThemes.push(childTheme);
    });
  }

  const newActiveTheme = state.activeTheme;
  if (!isActiveTheme) {
    Object.keys(newActiveTheme).forEach((group) => {
      if (newActiveTheme[group] === themeId) {
        delete newActiveTheme[group];
      }
    });
  } else {
    newActiveTheme[data?.group ?? INTERNAL_THEMES_NO_GROUP] = themeId;
  }
  const nextState: TokenState = {
    ...state,
    themes: finalThemes,
  };

  if (isActiveTheme || isNewTheme) {
    // @README if this theme is currently active or if it's a new theme
    // we will also run the setActiveTheme reducer
    // we don't want to update nodes or styles though.
    return setActiveTheme(nextState, { newActiveTheme, shouldUpdateNodes: false });
  }

  return nextState;
}
